"""
Repository for dataset operations.
"""

from typing import List, Optional, Tuple
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate


class DatasetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, obj_in: DatasetCreate, filename: str, original_filename: str, file_size: int) -> Dataset:
        db_obj = Dataset(
            name=obj_in.name,
            filename=filename,
            original_filename=original_filename,
            source=obj_in.source,
            description=obj_in.description,
            geographic_coverage=obj_in.geographic_coverage,
            collection_date=obj_in.collection_date,
            file_size=file_size,
            status="uploaded",
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get(self, dataset_id: int) -> Optional[Dataset]:
        return self.db.get(Dataset, dataset_id)

    def get_by_name(self, name: str) -> Optional[Dataset]:
        stmt = select(Dataset).where(Dataset.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_multi(self, skip: int = 0, limit: int = 25) -> Tuple[List[Dataset], int]:
        total_stmt = select(func.count()).select_from(Dataset)
        total = self.db.execute(total_stmt).scalar() or 0

        stmt = select(Dataset).order_by(desc(Dataset.upload_date)).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def update_status(
        self,
        dataset_id: int,
        status: str,
        row_count: Optional[int] = None,
        column_count: Optional[int] = None,
        error_message: Optional[str] = None
    ) -> Optional[Dataset]:
        dataset = self.get(dataset_id)
        if not dataset:
            return None

        dataset.status = status
        if row_count is not None:
            dataset.row_count = row_count
        if column_count is not None:
            dataset.column_count = column_count
        if error_message is not None:
            dataset.error_message = error_message

        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def delete(self, dataset_id: int) -> bool:
        dataset = self.get(dataset_id)
        if not dataset:
            return False
        self.db.delete(dataset)
        self.db.commit()
        return True

