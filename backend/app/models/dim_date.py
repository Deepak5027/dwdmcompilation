"""
Star schema dimension table for dates.
"""

from sqlalchemy import Column, Date, Integer, String

from app.database.base import Base


class DimDate(Base):
    """Dimension table for dates with season and period attributes."""

    __tablename__ = "dim_date"

    date_key = Column(Integer, primary_key=True)  # YYYYMMDD format
    full_date = Column(Date, nullable=False, unique=True)
    day = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    month_name = Column(String(20), nullable=False)
    quarter = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    season = Column(String(20), nullable=False)  # Summer, Monsoon, Post-Monsoon, Winter

    def __repr__(self) -> str:
        return f"<DimDate(key={self.date_key}, date='{self.full_date}')>"
