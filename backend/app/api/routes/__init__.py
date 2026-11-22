"""
API Routes Registration Package.
"""

from app.api.routes.clustering import router as clustering_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.database_routes import router as database_router
from app.api.routes.datasets import router as datasets_router
from app.api.routes.demand import router as demand_router
from app.api.routes.etl import router as etl_router
from app.api.routes.health import router as health_router
from app.api.routes.reports import router as reports_router
from app.api.routes.search import router as search_router
from app.api.routes.sentiment import router as sentiment_router
from app.api.routes.spatial import router as spatial_router
from app.api.routes.tourist import router as tourist_router
from app.api.routes.web_mining import router as web_mining_router

__all__ = [
    "health_router",
    "datasets_router",
    "etl_router",
    "database_router",
    "web_mining_router",
    "sentiment_router",
    "demand_router",
    "clustering_router",
    "spatial_router",
    "dashboard_router",
    "reports_router",
    "search_router",
    "tourist_router",
]

