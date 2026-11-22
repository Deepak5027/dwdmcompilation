"""
Star schema dimension table for locations.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String

from app.database.base import Base


class DimLocation(Base):
    """Dimension table for geographic locations."""

    __tablename__ = "dim_location"

    location_key = Column(Integer, primary_key=True, autoincrement=True)
    city = Column(String(255), nullable=True, index=True)
    district = Column(String(255), nullable=True, index=True)
    region = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    country = Column(String(100), default="India")
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<DimLocation(key={self.location_key}, city='{self.city}', district='{self.district}')>"
