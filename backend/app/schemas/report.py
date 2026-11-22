"""
Pydantic schemas for Report Generation and Data Export.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ReportExportRequest(BaseModel):
    report_type: str = Field(
        ...,
        description="Type of report: destination_summary, demand_forecast, sentiment_analysis, spatial_clusters, or executive_brief"
    )
    format: str = Field(default="pdf", description="Export format: pdf or csv")
    filters: Optional[Dict[str, Any]] = None
    title: Optional[str] = None


class ReportExportResponse(BaseModel):
    report_id: str
    report_type: str
    format: str
    filename: str
    download_url: str
    generated_at: datetime
    record_count: int

