"""
System health check and diagnostic endpoint.
"""

from fastapi import APIRouter
from app.database.connection import check_db_health
from app.schemas.common import APIResponse

router = APIRouter(prefix="/api/health", tags=["System Health"])


@router.get("", response_model=APIResponse)
def check_health():
    """Return live backend status, active database dialect, and service telemetry."""
    db_health = check_db_health()
    is_connected = db_health["status"] == "connected"
    return APIResponse(
        success=is_connected,
        data={
            "status": "operational" if is_connected else "degraded",
            "service": "Smart Tourism Intelligence API",
            "database_mode": db_health["dialect"],
            "database_status": db_health["status"],
            "database_engine": db_health["engine"],
            "database_info": db_health,
            "version": "1.0.0",
            "active_modules": [
                "Module 1 — Data Collection & Upload, Data Cleaning & ETL Processing, MySQL Database Management & Star Schema",
                "Module 2 — Web Mining & Sentiment Analysis, Tourism Demand Patterns & Seasonal Analytics",
                "Module 3 — K-Means Clustering & Model Evaluation, Spatial Tourism Analytics",
                "Module 4 — Executive Tourism BI Dashboard",
            ],
        },
        message="System operating normally with verified database connectivity" if is_connected else f"Database issue: {db_health.get('error', 'disconnected')}",
    )

