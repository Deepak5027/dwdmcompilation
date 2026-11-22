"""
Reporting Service: PDF and CSV generation for executive analytics briefs and datasets.
"""

import io
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from fpdf import FPDF
import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.warehouse_repo import WarehouseRepository
from app.schemas.report import ReportExportResponse
from app.services.dashboard.service import DashboardService


class TourismReportPDF(FPDF):
    def header(self):
        self.set_fill_color(16, 29, 53)  # #101D35 Deep Navy
        self.rect(0, 0, 210, 28, "F")

        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 10, "SMART TOURISM INTELLIGENCE PLATFORM", ln=True, align="L")
        self.set_font("Helvetica", "", 9)
        self.cell(0, 5, "Destination Demand Mining & Spatial-Web Analytics | Executive Report", ln=True, align="L")
        self.ln(12)

    def footer(self):
        self.set_y(-18)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 116, 139)  # Slate
        self.cell(
            0,
            10,
            f"Page {self.page_no()}/{{nb}} | Tamil Nadu Tourism Intelligence Data Warehouse | Confidential",
            align="C",
        )


class ReportingService:
    def __init__(self, db: Session):
        self.db = db
        self.warehouse_repo = WarehouseRepository(db)
        self.dashboard_service = DashboardService(db)

    def _get_reports_dir(self) -> Path:
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        rep_dir = base_dir / settings.upload_dir / "reports"
        rep_dir.mkdir(parents=True, exist_ok=True)
        return rep_dir

    def generate_report(
        self,
        report_type: str,
        export_format: str = "pdf",
        filters: Optional[Dict[str, Any]] = None,
        title: Optional[str] = None,
    ) -> ReportExportResponse:
        report_id = str(uuid.uuid4())[:8]
        reports_dir = self._get_reports_dir()

        destinations = self.warehouse_repo.get_top_destinations(limit=25)
        if not destinations:
            # Fallback data
            destinations = [
                {"destination_name": "Marina Beach", "district": "Chennai", "category": "Beach", "visitors": 540000, "rating": 4.4, "demand": 94.0},
                {"destination_name": "Meenakshi Temple", "district": "Madurai", "category": "Temple", "visitors": 510000, "rating": 4.9, "demand": 96.5},
                {"destination_name": "Ooty Lake & Peak", "district": "Nilgiris", "category": "Hill Station", "visitors": 460000, "rating": 4.6, "demand": 91.2},
                {"destination_name": "Kodaikanal Lake", "district": "Dindigul", "category": "Hill Station", "visitors": 410000, "rating": 4.6, "demand": 88.0},
                {"destination_name": "Vivekananda Rock", "district": "Kanyakumari", "category": "Coastal Heritage", "visitors": 395000, "rating": 4.8, "demand": 89.0},
            ]

        if export_format.lower() == "csv":
            filename = f"tourism_report_{report_type}_{report_id}.csv"
            file_path = reports_dir / filename
            df = pd.DataFrame(destinations)
            df.to_csv(file_path, index=False)
            rec_count = len(df)
        else:
            filename = f"tourism_executive_brief_{report_id}.pdf"
            file_path = reports_dir / filename
            rec_count = len(destinations)

            pdf = TourismReportPDF()
            pdf.alias_nb_pages()
            pdf.add_page()

            # Metadata Section
            pdf.set_font("Helvetica", "B", 13)
            pdf.set_text_color(16, 29, 53)
            pdf.cell(0, 8, title or "Executive Tourism Analytics & Demand Synthesis", ln=True)

            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(100, 116, 139)
            gen_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
            pdf.cell(0, 5, f"Report ID: {report_id} | Generated: {gen_time} | Scope: Tamil Nadu State", ln=True)
            pdf.ln(4)

            # Executive Summary Box
            pdf.set_fill_color(248, 250, 252)  # #F8FAFC
            pdf.set_draw_color(226, 232, 240)  # #E2E8F0
            pdf.rect(10, 48, 190, 26, "DF")

            pdf.set_xy(14, 51)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(13, 148, 136)  # Teal
            pdf.cell(0, 5, "ACADEMIC SUMMARY & PROVENANCE (DEMONSTRATION BENCHMARK)", ln=True)

            pdf.set_xy(14, 57)
            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(15, 23, 42)
            summary_txt = (
                "DEMONSTRATION DATA: This report synthesizes tourism footfall and benchmark metrics stored in the "
                "MySQL 8.0 star schema with VADER natural language sentiment mining and Scikit-learn K-Means spatial "
                "clustering. Data is derived from the Tamil Nadu tourism benchmark demonstration archive."
            )
            pdf.multi_cell(182, 4.5, summary_txt)
            pdf.ln(12)

            # Data Table Header
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_fill_color(23, 43, 77)  # #172B4D
            pdf.set_text_color(255, 255, 255)

            col_widths = [65, 35, 35, 28, 27]
            headers = ["Destination Name", "District", "Category", "Footfall", "Rating"]

            for i, h in enumerate(headers):
                pdf.cell(col_widths[i], 8, h, border=1, fill=True, align="C" if i > 2 else "L")
            pdf.ln()

            # Data Table Rows
            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(15, 23, 42)

            fill = False
            for d in destinations[:18]:
                pdf.set_fill_color(245, 247, 251) if fill else pdf.set_fill_color(255, 255, 255)
                pdf.cell(col_widths[0], 7, str(d.get("destination_name", ""))[:32], border=1, fill=fill)
                pdf.cell(col_widths[1], 7, str(d.get("district", ""))[:18], border=1, fill=fill)
                pdf.cell(col_widths[2], 7, str(d.get("category", ""))[:18], border=1, fill=fill)
                pdf.cell(col_widths[3], 7, f"{d.get('visitors', 0):,}", border=1, fill=fill, align="R")
                pdf.cell(col_widths[4], 7, f"{d.get('rating', 0.0):.1f} / 5", border=1, fill=fill, align="C")
                pdf.ln()
                fill = not fill

            pdf.output(str(file_path))

        return ReportExportResponse(
            report_id=report_id,
            report_type=report_type,
            format=export_format.lower(),
            filename=filename,
            download_url=f"/api/reports/download/{filename}",
            generated_at=datetime.now(timezone.utc),
            record_count=rec_count,
        )

