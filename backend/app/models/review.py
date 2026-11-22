"""
SQLAlchemy model for tourism reviews staging table.
"""

from datetime import date, datetime, timezone
from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text

from app.database.base import Base, TimestampMixin


class Review(Base, TimestampMixin):
    """Operational/staging table for tourism destination reviews."""

    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, autoincrement=True)
    destination_id = Column(String(50), nullable=False, index=True)
    review_text = Column(Text, nullable=False)
    review_date = Column(Date, nullable=True)
    source_name = Column(String(255), nullable=True)
    rating = Column(Float, nullable=True)
    language = Column(String(10), default="en", nullable=False)
    sentiment_score = Column(Float, nullable=True)
    sentiment_category = Column(String(20), nullable=True)  # positive, neutral, negative
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)

    def __repr__(self) -> str:
        return f"<Review(id={self.review_id}, dest='{self.destination_id}', rating={self.rating}, sentiment='{self.sentiment_category}')>"

