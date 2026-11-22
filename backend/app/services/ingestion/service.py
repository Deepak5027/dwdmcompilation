"""
Ingestion service: Uploads, format validation, parsing, and preview.
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import sanitize_filename, validate_file_content, validate_upload_file
from app.models.dataset import Dataset
from app.repositories.dataset_repo import DatasetRepository
from app.schemas.dataset import DatasetCreate, DatasetPreview, DatasetValidation


REQUIRED_COLUMNS = [
    "destination_id",
    "destination_name",
    "city",
    "district",
    "latitude",
    "longitude",
]

EXPECTED_ANALYTICS_COLUMNS = [
    "visitor_count",
    "average_rating",
    "review_count",
    "observation_date",
    "tourism_category",
]


class IngestionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DatasetRepository(db)

    def _get_upload_dir(self) -> Path:
        return settings.upload_path

    def _resolve_file_path(self, filename: str) -> Path:
        # Check standard upload directory
        path = self._get_upload_dir() / filename
        if path.exists():
            return path
        # Check sample data directory
        sample_path = Path(__file__).resolve().parent.parent.parent / "data" / "sample" / filename
        if sample_path.exists():
            return sample_path
        # Check parent sample directory
        alt_sample = Path(__file__).resolve().parent.parent.parent.parent / "data" / "sample" / filename
        if alt_sample.exists():
            return alt_sample
        return path

    async def save_uploaded_file(
        self,
        file: UploadFile,
        name: str,
        source: Optional[str] = None,
        description: Optional[str] = None,
        geographic_coverage: Optional[str] = "Tamil Nadu",
        collection_date: Optional[str] = None,
    ) -> Dataset:
        # Validate file
        is_valid, err_msg = await validate_upload_file(file)
        if not is_valid:
            raise ValueError(err_msg or "Invalid file upload")

        upload_dir = self._get_upload_dir()
        safe_filename = sanitize_filename(file.filename or "upload.csv")
        target_path = upload_dir / safe_filename

        # Write content securely
        content = await file.read()
        with open(target_path, "wb") as f:
            f.write(content)

        file_size = len(content)

        # Validate content format
        is_valid_format, msg = validate_file_content(target_path)
        if not is_valid_format:
            if target_path.exists():
                target_path.unlink()
            raise ValueError(f"File content validation failed: {msg}")

        # Parse basic shape
        try:
            df = self.load_dataframe(target_path)
            row_count = len(df)
            col_count = len(df.columns)
        except Exception as e:
            row_count = 0
            col_count = 0

        # Save metadata record
        dataset_in = DatasetCreate(
            name=name,
            source=source,
            description=description,
            geographic_coverage=geographic_coverage,
            collection_date=None,
        )

        dataset = self.repo.create(
            obj_in=dataset_in,
            filename=safe_filename,
            original_filename=file.filename or safe_filename,
            file_size=file_size,
        )

        self.repo.update_status(
            dataset.id,
            status="uploaded",
            row_count=row_count,
            column_count=col_count,
        )

        return dataset

    def load_dataframe(self, file_path: Path) -> pd.DataFrame:
        ext = file_path.suffix.lower()
        if ext == ".csv":
            try:
                return pd.read_csv(file_path, comment="#", encoding="utf-8")
            except UnicodeDecodeError:
                return pd.read_csv(file_path, comment="#", encoding="latin1")
        elif ext in [".xlsx", ".xls"]:
            return pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def get_preview(self, dataset_id: int, max_rows: int = 50) -> DatasetPreview:
        dataset = self.repo.get(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset with ID {dataset_id} not found")

        file_path = self._resolve_file_path(dataset.filename)
        if not file_path.exists():
            raise FileNotFoundError(f"Underlying file {dataset.filename} does not exist on disk")

        df = self.load_dataframe(file_path)
        total_rows = len(df)
        preview_df = df.head(max_rows).fillna("")

        # Convert numpy types to native Python types for JSON serialization
        columns = [str(c) for c in preview_df.columns]
        rows = preview_df.to_dict(orient="records")

        return DatasetPreview(
            columns=columns,
            rows=rows,
            total_rows=total_rows,
            preview_rows=len(preview_df),
        )

    def validate_dataset_structure(self, dataset_id: int) -> DatasetValidation:
        dataset = self.repo.get(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset with ID {dataset_id} not found")

        file_path = self._resolve_file_path(dataset.filename)
        if not file_path.exists():
            raise FileNotFoundError(f"Underlying file {dataset.filename} does not exist")

        df = self.load_dataframe(file_path)
        columns = [str(c).strip().lower() for c in df.columns]

        errors = []
        warnings = []
        missing_req = []

        for req in REQUIRED_COLUMNS:
            if req not in columns:
                missing_req.append(req)
                errors.append(f"Missing mandatory column: '{req}'")

        for opt in EXPECTED_ANALYTICS_COLUMNS:
            if opt not in columns:
                warnings.append(f"Optional analytical column '{opt}' is absent; defaults will be applied during ETL.")

        # Check basic data sanity
        if "latitude" in columns and "longitude" in columns:
            invalid_coords = df[pd.to_numeric(df["latitude"], errors="coerce").isna()]
            if len(invalid_coords) > 0:
                warnings.append(f"{len(invalid_coords)} rows have non-numeric or empty latitudes.")

        if "visitor_count" in columns:
            invalid_visitors = df[pd.to_numeric(df["visitor_count"], errors="coerce") < 0]
            if len(invalid_visitors) > 0:
                errors.append(f"{len(invalid_visitors)} rows have negative visitor counts.")

        col_stats = {
            "total_columns": len(columns),
            "total_rows": len(df),
            "missing_values_per_col": {str(k): int(v) for k, v in df.isna().sum().to_dict().items()},
        }

        is_valid = len(errors) == 0
        new_status = "validated" if is_valid else "validation_error"
        self.repo.update_status(dataset_id, status=new_status, error_message="; ".join(errors) if errors else None)

        return DatasetValidation(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            column_stats=col_stats,
            detected_columns=columns,
            missing_required_columns=missing_req,
        )
