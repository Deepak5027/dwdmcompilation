"""
Dataset management endpoints: Upload, List, Preview, Validation, and Deletion.
"""

from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.repositories.dataset_repo import DatasetRepository
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.dataset import DatasetPreview, DatasetResponse, DatasetValidation
from app.services.ingestion.service import IngestionService

router = APIRouter(prefix="/api/datasets", tags=["Module 1: Datasets"])


@router.post("/upload", response_model=APIResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    source: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    geographic_coverage: Optional[str] = Form("Tamil Nadu"),
    collection_date: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Securely upload CSV or Excel tourism datasets."""
    service = IngestionService(db)
    try:
        dataset = await service.save_uploaded_file(
            file=file,
            name=name,
            source=source,
            description=description,
            geographic_coverage=geographic_coverage,
            collection_date=collection_date,
        )
        return APIResponse(
            success=True,
            data=DatasetResponse.model_validate(dataset),
            message=f"Dataset '{dataset.name}' uploaded successfully",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=APIResponse)
def list_datasets(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve paginated list of uploaded datasets."""
    repo = DatasetRepository(db)
    skip = (page - 1) * page_size
    items, total = repo.get_multi(skip=skip, limit=page_size)

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    pdata = PaginatedData(
        items=[DatasetResponse.model_validate(d) for d in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
    return APIResponse(success=True, data=pdata, message="Datasets retrieved")


@router.get("/{dataset_id}", response_model=APIResponse)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single dataset."""
    repo = DatasetRepository(db)
    dataset = repo.get(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
    return APIResponse(success=True, data=DatasetResponse.model_validate(dataset))


@router.get("/{dataset_id}/preview", response_model=APIResponse)
def preview_dataset(
    dataset_id: int,
    rows: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Preview first N records of an uploaded dataset."""
    service = IngestionService(db)
    try:
        preview = service.get_preview(dataset_id, max_rows=rows)
        return APIResponse(success=True, data=preview, message="Dataset preview generated")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{dataset_id}/validate", response_model=APIResponse)
def validate_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Run structural, coordinate, and schema sanity checks."""
    service = IngestionService(db)
    try:
        validation = service.validate_dataset_structure(dataset_id)
        return APIResponse(
            success=validation.is_valid,
            data=validation,
            message="Dataset validation completed",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{dataset_id}", response_model=APIResponse)
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Remove a dataset record."""
    repo = DatasetRepository(db)
    success = repo.delete(dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return APIResponse(success=True, message=f"Dataset {dataset_id} deleted successfully")

