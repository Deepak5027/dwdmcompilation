"""
Tourism Demand Analytics and Forecasting Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.analytics import ForecastRequest, ForecastResponse
from app.schemas.common import APIResponse
from app.services.forecasting.service import DemandForecastingService

router = APIRouter(prefix="/api/demand", tags=["Module 2: Demand Patterns & Forecasting"])


@router.get("/trends", response_model=APIResponse)
def get_demand_trends(
    limit: int = Query(24, ge=6, le=48),
    db: Session = Depends(get_db),
):
    """Retrieve longitudinal monthly footfall, review counts, and demand index."""
    service = DemandForecastingService(db)
    trends = service.get_monthly_trends(limit_months=limit)
    return APIResponse(success=True, data=trends, message="Monthly demand trends retrieved")


@router.get("/seasonality", response_model=APIResponse)
def get_seasonal_patterns(db: Session = Depends(get_db)):
    """Retrieve seasonal distribution across Summer, Monsoon, Post-Monsoon, and Winter."""
    service = DemandForecastingService(db)
    patterns = service.get_seasonal_patterns()
    return APIResponse(success=True, data=patterns, message="Seasonal demand patterns retrieved")


@router.post("/forecast", response_model=APIResponse)
def generate_demand_forecast(req: ForecastRequest, db: Session = Depends(get_db)):
    """Generate predictive visitor trajectories with empirical error bounds."""
    service = DemandForecastingService(db)
    forecast = service.generate_forecast(
        periods=req.periods,
        destination_id=req.destination_id,
        alpha=req.alpha,
    )
    return APIResponse(success=True, data=forecast, message="Predictive demand forecast generated")

