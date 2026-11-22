"""
SQLAlchemy model for K-Means clustering results and model evaluation metadata.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.database.base import Base, TimestampMixin


class ClusteringResult(Base, TimestampMixin):
    """Stores K-Means clustering execution results and evaluation metrics."""

    __tablename__ = "clustering_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    k_value = Column(Integer, nullable=False)
    features_used = Column(Text, nullable=False)  # JSON array of feature names
    inertia = Column(Float, nullable=False)
    silhouette_score = Column(Float, nullable=False)
    cluster_centers = Column(Text, nullable=True)  # JSON matrix of centers
    cluster_assignments = Column(Text, nullable=False)  # JSON array of destination assignments
    cluster_labels = Column(Text, nullable=True)  # JSON array of generated labels
    pca_data = Column(Text, nullable=True)  # JSON array of 2D PCA points
    elbow_data = Column(Text, nullable=True)  # JSON array of {k, inertia}
    config = Column(Text, nullable=True)  # JSON dict of hyperparameters

    def __repr__(self) -> str:
        return f"<ClusteringResult(id={self.id}, k={self.k_value}, silhouette={self.silhouette_score:.4f})>"

