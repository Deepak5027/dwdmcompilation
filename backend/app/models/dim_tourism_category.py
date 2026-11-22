"""
Star schema dimension table for tourism categories.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.base import Base


class DimTourismCategory(Base):
    """Dimension table for tourism destination categories."""

    __tablename__ = "dim_tourism_category"

    category_key = Column(Integer, primary_key=True, autoincrement=True)
    category_name = Column(String(100), unique=True, nullable=False, index=True)
    category_description = Column(Text, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<DimTourismCategory(key={self.category_key}, name='{self.category_name}')>"
