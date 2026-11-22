"""
K-Means Clustering and Model Evaluation Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.repositories.clustering_repo import ClusteringRepository
from app.schemas.analytics import ClusteringExecuteRequest, ClusteringExecutionResponse
from app.schemas.common import APIResponse
from app.services.clustering.service import ClusteringService

router = APIRouter(prefix="/api/clustering", tags=["Module 3: K-Means Clustering"])


@router.post("/execute", response_model=APIResponse)
def execute_clustering(req: ClusteringExecuteRequest, db: Session = Depends(get_db)):
    """
    Execute Scikit-learn K-Means clustering algorithm.
    Includes feature scaling, PCA 2D projection, inertia, and silhouette score.
    """
    service = ClusteringService(db)
    try:
        resp = service.execute_clustering(
            k_value=req.k_value,
            features=req.features,
            max_iter=req.max_iter,
            random_state=req.random_state,
        )
        return APIResponse(
            success=True,
            data=resp,
            message=f"K-Means clustering completed (k={req.k_value}, Silhouette={resp.silhouette_score:.4f})",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering execution error: {str(e)}")


class ElbowRequest(BaseModel):
    features: Optional[List[str]] = None


@router.post("/elbow", response_model=APIResponse)
def calculate_elbow_method(
    req: Optional[ElbowRequest] = None,
    db: Session = Depends(get_db),
):
    """Calculate inertia values across k=2 to k=8 for the Elbow Method plot."""
    service = ClusteringService(db)
    feature_keys = req.features if req else None
    points = service.calculate_elbow(feature_keys=feature_keys)
    return APIResponse(success=True, data=points, message="Elbow curve computed")


@router.get("/results", response_model=APIResponse)
def get_clustering_results(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Retrieve history of clustering model runs."""
    repo = ClusteringRepository(db)
    history = repo.get_history(limit=limit)
    return APIResponse(
        success=True,
        data=[
            {
                "id": h.id,
                "name": h.name,
                "k_value": h.k_value,
                "inertia": h.inertia,
                "silhouette_score": h.silhouette_score,
                "created_at": h.created_at,
            }
            for h in history
        ],
        message="Clustering execution history retrieved",
    )


@router.get("/results/{result_id}", response_model=APIResponse)
def get_clustering_result_detail(result_id: int, db: Session = Depends(get_db)):
    """Retrieve full assignments, PCA projection, and centroids for a specific run."""
    import json
    repo = ClusteringRepository(db)
    res = repo.get_by_id(result_id)
    if not res:
        raise HTTPException(status_code=404, detail="Clustering execution record not found")

    return APIResponse(
        success=True,
        data={
            "id": res.id,
            "name": res.name,
            "k_value": res.k_value,
            "inertia": res.inertia,
            "silhouette_score": res.silhouette_score,
            "cluster_labels": json.loads(res.cluster_labels) if res.cluster_labels else [],
            "cluster_centroids": json.loads(res.cluster_centers) if res.cluster_centers else [],
            "pca_points": json.loads(res.pca_data) if res.pca_data else [],
            "assignments": json.loads(res.cluster_assignments) if res.cluster_assignments else [],
            "elbow_data": json.loads(res.elbow_data) if res.elbow_data else [],
            "created_at": res.created_at,
        },
    )

