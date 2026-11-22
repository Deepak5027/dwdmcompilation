"""
Repository for saving and fetching K-Means clustering results.
"""

from typing import List, Optional
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.clustering_result import ClusteringResult


class ClusteringRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_result(self, result: ClusteringResult) -> ClusteringResult:
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def get_latest(self) -> Optional[ClusteringResult]:
        stmt = select(ClusteringResult).order_by(desc(ClusteringResult.id)).limit(1)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_id(self, result_id: int) -> Optional[ClusteringResult]:
        return self.db.get(ClusteringResult, result_id)

    def get_history(self, limit: int = 10) -> List[ClusteringResult]:
        stmt = select(ClusteringResult).order_by(desc(ClusteringResult.id)).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

