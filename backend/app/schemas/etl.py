"""
Pydantic schemas for ETL execution and data quality reporting.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ETLExecuteRequest(BaseModel):
    dataset_id: int = Field(..., description="ID of the uploaded dataset to process")


class ETLJobResponse(BaseModel):
    id: int
    dataset_id: int
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    records_processed: int
    records_accepted: int
    records_rejected: int
    duplicates_found: int
    missing_values_handled: int
    validation_failures: int
    processing_duration_seconds: Optional[float] = None
    error_log: Optional[str] = None
    transformation_log: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ETLReport(BaseModel):
    job_id: int
    dataset_name: str
    status: str
    records_processed: int
    records_accepted: int
    records_rejected: int
    duplicates_found: int
    missing_values_handled: int
    validation_failures: int
    acceptance_rate_pct: float
    duration_seconds: float
    transformation_summary: List[str]
    quality_checks: Dict[str, Any]
    error_log: Optional[str] = None

