"""
Fact table for visitor analytics in the star schema.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, ForeignKey, Index

from app.database.base import Base


class FactVisitorAnalytics(Base):
    """Fact table recording visitor analytics metrics for destinations."""

    __tablename__ = "fact_visitor_analytics"

    visitor_fact_id = Column(Integer, primary_key=True, autoincrement=True)
    destination_key = Column(
        Integer,
        ForeignKey("dim_destination.destination_key", ondelete="CASCADE"),
        nullable=False,
    )
    location_key = Column(
        Integer,
        ForeignKey("dim_location.location_key", ondelete="CASCADE"),
        nullable=False,
    )
    date_key = Column(
        Integer,
        ForeignKey("dim_date.date_key", ondelete="CASCADE"),
        nullable=False,
    )
    category_key = Column(
        Integer,
        ForeignKey("dim_tourism_category.category_key", ondelete="CASCADE"),
        nullable=False,
    )
    visitor_count = Column(Integer, nullable=True)
    review_count = Column(Integer, nullable=True)
    average_rating = Column(Float, nullable=True)
    demand_measure = Column(Float, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        Index("ix_fact_visitor_destination", "destination_key"),
        Index("ix_fact_visitor_location", "location_key"),
        Index("ix_fact_visitor_date", "date_key"),
        Index("ix_fact_visitor_category", "category_key"),
    )

    def __repr__(self) -> str:
        return (
            f"<FactVisitorAnalytics(id={self.visitor_fact_id}, "
            f"dest_key={self.destination_key}, visitors={self.visitor_count})>"
        )
