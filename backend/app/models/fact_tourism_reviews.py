"""
Fact table for tourism review sentiment analysis.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String, ForeignKey, Index

from app.database.base import Base


class FactTourismReviews(Base):
    """Fact table recording aggregated review sentiment metrics."""

    __tablename__ = "fact_tourism_reviews"

    review_fact_id = Column(Integer, primary_key=True, autoincrement=True)
    destination_key = Column(
        Integer,
        ForeignKey("dim_destination.destination_key", ondelete="CASCADE"),
        nullable=False,
    )
    date_key = Column(
        Integer,
        ForeignKey("dim_date.date_key", ondelete="CASCADE"),
        nullable=False,
    )
    sentiment_score = Column(Float, nullable=True)
    sentiment_category = Column(
        String(20), nullable=True
    )  # positive, neutral, negative
    review_count = Column(Integer, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        Index("ix_fact_reviews_destination", "destination_key"),
        Index("ix_fact_reviews_date", "date_key"),
    )

    def __repr__(self) -> str:
        return (
            f"<FactTourismReviews(id={self.review_fact_id}, "
            f"dest_key={self.destination_key}, sentiment='{self.sentiment_category}')>"
        )
