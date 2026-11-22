"""
Report Generation and Download Endpoints.
"""

from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import get_db
from app.schemas.common import APIResponse
from app.schemas.report import ReportExportRequest
from app.services.reporting.service import ReportingService

router = APIRouter(prefix="/api/reports", tags=["Module 4: Reporting & Export"])


@router.post("/export", response_model=APIResponse)
def export_report(req: ReportExportRequest, db: Session = Depends(get_db)):
    """Generate formal executive PDF or CSV data export."""
    service = ReportingService(db)
    try:
        resp = service.generate_report(
            report_type=req.report_type,
            export_format=req.format,
            filters=req.filters,
            title=req.title,
        )
        return APIResponse(success=True, data=resp, message="Report generated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/download/{filename}")
def download_generated_report(filename: str):
    """Download a generated PDF or CSV report."""
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    file_path = base_dir / settings.upload_dir / "reports" / filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Requested report file not found on server")

    media_type = "application/pdf" if filename.endswith(".pdf") else "text/csv"
    return FileResponse(path=file_path, filename=filename, media_type=media_type)

