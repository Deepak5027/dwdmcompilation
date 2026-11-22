"""
Test K-Means clustering and evaluation metrics.
"""

from app.api.routes.clustering import calculate_elbow_method, execute_clustering
from app.schemas.analytics import ClusteringExecuteRequest


def test_clustering_execution(db):
    payload = ClusteringExecuteRequest(
        k_value=3,
        features=["avg_visitors", "avg_rating", "total_reviews", "demand_score"],
        max_iter=100,
        random_state=42,
    )
    resp = execute_clustering(payload, db)
    assert resp.success is True
    data = resp.data
    assert data.k_value == 3
    assert data.silhouette_score is not None
    assert data.inertia > 0
    assert len(data.cluster_labels) == 3
    assert len(data.pca_points) > 0
    assert len(data.assignments) > 0


def test_elbow_method(db):
    resp = calculate_elbow_method(None, db)
    assert resp.success is True
    assert len(resp.data) >= 4
    # Inertia must decrease monotonically as k increases
    inertias = [p.inertia for p in resp.data]
    assert all(inertias[i] >= inertias[i + 1] for i in range(len(inertias) - 1))
