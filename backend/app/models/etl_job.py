"""
SQLAlchemy model for ETL job tracking.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, ForeignKey

from app.database.base import Base


class ETLJob(Base):
    """Tracks ETL pipeline execution jobs."""

    __tablename__ = "etl_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_id = Column(
        Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status = Column(
        String(50), default="pending", nullable=False, index=True
    )  # pending, running, completed, failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    records_processed = Column(Integer, default=0)
    records_accepted = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    duplicates_found = Column(Integer, default=0)
    missing_values_handled = Column(Integer, default=0)
    validation_failures = Column(Integer, default=0)
    processing_duration_seconds = Column(Float, nullable=True)
    error_log = Column(Text, nullable=True)
    transformation_log = Column(Text, nullable=True)  # JSON string of applied transformations
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<ETLJob(id={self.id}, dataset_id={self.dataset_id}, status='{self.status}')>"
