"""
Pydantic schemas for dataset operations.
"""

from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DatasetBase(BaseModel):
    name: str = Field(..., max_length=255)
    source: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    geographic_coverage: Optional[str] = Field(None, max_length=255)
    collection_date: Optional[date] = None


class DatasetCreate(DatasetBase):
    pass


class DatasetResponse(DatasetBase):
    id: int
    filename: str
    original_filename: Optional[str] = None
    upload_date: datetime
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    file_size: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DatasetPreview(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    preview_rows: int


class DatasetValidation(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    column_stats: Dict[str, Any]
    detected_columns: List[str]
    missing_required_columns: List[str]

