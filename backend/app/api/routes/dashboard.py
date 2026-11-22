"""
Business Intelligence Executive Dashboard Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.repositories.warehouse_repo import WarehouseRepository
from app.schemas.common import APIResponse
from app.services.dashboard.service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["Module 4: Business Intelligence Dashboard"])


@router.get("/overview", response_model=APIResponse)
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Retrieve verified aggregated KPIs, trends, and data-driven insights."""
    service = DashboardService(db)
    overview = service.get_overview()
    return APIResponse(success=True, data=overview, message="Dashboard overview retrieved")


@router.get("/visitors", response_model=APIResponse)
def get_visitor_analytics(
    limit: int = Query(12, ge=6, le=36),
    db: Session = Depends(get_db),
):
    """Retrieve visitor trend curves and category proportions."""
    repo = WarehouseRepository(db)
    trends = repo.get_monthly_visitor_trends(limit_months=limit)
    cat_dist = repo.get_category_distribution()
    return APIResponse(
        success=True,
        data={"trends": trends, "category_distribution": cat_dist},
        message="Visitor analytics data retrieved",
    )


@router.get("/destinations", response_model=APIResponse)
def get_destination_rankings(
    limit: int = Query(10, ge=5, le=50),
    db: Session = Depends(get_db),
):
    """Retrieve ranked destination leaderboard by footfall, rating, and demand index."""
    repo = WarehouseRepository(db)
    top = repo.get_top_destinations(limit=limit)
    return APIResponse(success=True, data=top, message="Destination rankings retrieved")


@router.get("/insights", response_model=APIResponse)
def get_data_driven_insights(db: Session = Depends(get_db)):
    """Retrieve automatically generated insight summaries grounded in empirical results."""
    service = DashboardService(db)
    overview = service.get_overview()
    return APIResponse(success=True, data=overview.insights, message="Insights generated")

