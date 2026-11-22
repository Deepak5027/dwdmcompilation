"""
Global Search Endpoint across Destinations, Datasets, Reports, and Modules.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.dataset import Dataset
from app.models.dim_destination import DimDestination
from app.schemas.common import APIResponse

router = APIRouter(prefix="/api/search", tags=["Global Navigation & Search"])


@router.get("", response_model=APIResponse)
def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    db: Session = Depends(get_db),
):
    """
    Search across destinations, datasets, and analytics entities.
    Returns categorized match results.
    """
    term = f"%{q.strip().lower()}%"
    results: List[Dict[str, Any]] = []

    # 1. Search DimDestination
    dest_stmt = select(DimDestination).where(
        or_(
            DimDestination.destination_name.ilike(term),
            DimDestination.city.ilike(term),
            DimDestination.district.ilike(term),
            DimDestination.tourism_category.ilike(term),
        )
    ).limit(8)
    dests = list(db.execute(dest_stmt).scalars().all())

    for d in dests:
        results.append({
            "type": "Destination",
            "title": d.destination_name,
            "subtitle": f"{d.district} | {d.tourism_category}",
            "route": "/module3/spatial",
            "id": d.destination_id,
        })

    # 2. Search Datasets
    ds_stmt = select(Dataset).where(
        or_(
            Dataset.name.ilike(term),
            Dataset.source.ilike(term),
            Dataset.description.ilike(term),
        )
    ).limit(5)
    datasets = list(db.execute(ds_stmt).scalars().all())

    for ds in datasets:
        results.append({
            "type": "Dataset",
            "title": ds.name,
            "subtitle": f"Status: {ds.status} | Source: {ds.source or 'Direct'}",
            "route": "/module1/upload",
            "id": str(ds.id),
        })

    # 3. Static Module Match
    modules = [
        {"title": "Data Collection & Upload", "subtitle": "Module 1", "route": "/module1/upload", "keywords": ["data", "upload", "csv", "excel", "file"]},
        {"title": "Data Cleaning & ETL", "subtitle": "Module 1", "route": "/module1/etl", "keywords": ["etl", "clean", "transform", "load", "pipeline"]},
        {"title": "MySQL Star Schema Warehouse", "subtitle": "Module 1", "route": "/module1/database", "keywords": ["mysql", "database", "schema", "tables", "sql", "warehouse"]},
        {"title": "Web Mining & Sentiment Analysis", "subtitle": "Module 2", "route": "/module2/mining", "keywords": ["sentiment", "mining", "tfidf", "topics", "vader", "reviews"]},
        {"title": "Demand Patterns & Seasonal Forecasts", "subtitle": "Module 2", "route": "/module2/demand", "keywords": ["demand", "forecast", "season", "trends", "holt", "visitors"]},
        {"title": "K-Means Clustering & Evaluation", "subtitle": "Module 3", "route": "/module3/clustering", "keywords": ["cluster", "kmeans", "pca", "elbow", "silhouette"]},
        {"title": "Spatial Tourism Analytics & Hotspots", "subtitle": "Module 3", "route": "/module3/spatial", "keywords": ["map", "spatial", "gis", "hotspots", "coordinates", "heatmap"]},
        {"title": "Executive BI Dashboard", "subtitle": "Module 4", "route": "/module4/dashboard", "keywords": ["dashboard", "insights", "kpi", "bi", "overview"]},
    ]

    q_lower = q.lower()
    for m in modules:
        if any(k in q_lower for k in m["keywords"]) or q_lower in m["title"].lower():
            results.append({
                "type": "Module Page",
                "title": m["title"],
                "subtitle": m["subtitle"],
                "route": m["route"],
                "id": m["route"],
            })

    return APIResponse(
        success=True,
        data=results,
        message=f"Found {len(results)} matches for '{q}'",
    )

