"""
Star schema dimension table for tourism destinations.
"""

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String

from app.database.base import Base, TimestampMixin


class DimDestination(Base, TimestampMixin):
    """Dimension table for tourism destinations in Tamil Nadu."""

    __tablename__ = "dim_destination"

    destination_key = Column(Integer, primary_key=True, autoincrement=True)
    destination_id = Column(String(50), unique=True, nullable=False, index=True)
    destination_name = Column(String(255), nullable=False)
    city = Column(String(255), nullable=True)
    district = Column(String(255), nullable=True)
    state = Column(String(255), default="Tamil Nadu")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    tourism_category = Column(String(100), nullable=True, index=True)
    famous_for = Column(String, nullable=True)
    travel_vibe = Column(String(100), nullable=True, index=True)
    best_time_to_visit = Column(String(255), nullable=True)
    typical_dwell_time = Column(String(100), nullable=True)
    entry_fee = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<DimDestination(key={self.destination_key}, name='{self.destination_name}')>"
