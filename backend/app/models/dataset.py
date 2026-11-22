"""
SQLAlchemy model for uploaded dataset metadata.
"""

from datetime import date, datetime, timezone

from sqlalchemy import Column, Date, DateTime, Integer, String, Text

from app.database.base import Base, TimestampMixin


class Dataset(Base, TimestampMixin):
    """Tracks metadata for uploaded datasets."""

    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=True)
    source = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    upload_date = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    file_size = Column(Integer, nullable=True)
    status = Column(String(50), default="uploaded", nullable=False, index=True)
    geographic_coverage = Column(String(255), nullable=True)
    collection_date = Column(Date, nullable=True)
    error_message = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<Dataset(id={self.id}, name='{self.name}', status='{self.status}')>"
