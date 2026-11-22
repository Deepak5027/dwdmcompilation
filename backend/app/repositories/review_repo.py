"""
Repository for tourist reviews and sentiment analysis staging operations.
"""

from typing import List, Optional, Tuple
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.review import Review


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def bulk_insert(self, reviews: List[dict]) -> int:
        objects = [Review(**r) for r in reviews]
        self.db.bulk_save_objects(objects)
        self.db.commit()
        return len(objects)

    def get_by_destination(self, destination_id: str, limit: int = 100) -> List[Review]:
        stmt = (
            select(Review)
            .where(Review.destination_id == destination_id)
            .order_by(desc(Review.review_date))
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_all_unprocessed(self, limit: int = 500) -> List[Review]:
        stmt = (
            select(Review)
            .where(Review.sentiment_score == None)
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_all(self, skip: int = 0, limit: int = 50) -> Tuple[List[Review], int]:
        total = self.db.execute(select(func.count()).select_from(Review)).scalar() or 0
        stmt = select(Review).order_by(desc(Review.review_id)).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def update_sentiment(self, review_id: int, score: float, category: str):
        rev = self.db.get(Review, review_id)
        if rev:
            rev.sentiment_score = score
            rev.sentiment_category = category
            self.db.flush()

    def commit(self):
        self.db.commit()

    def get_sentiment_aggregates(self, destination_id: Optional[str] = None):
        stmt = select(
            Review.sentiment_category,
            func.count(Review.review_id).label("count"),
            func.avg(Review.sentiment_score).label("avg_score")
        )
        if destination_id:
            stmt = stmt.where(Review.destination_id == destination_id)
        stmt = stmt.group_by(Review.sentiment_category)
        return self.db.execute(stmt).all()

