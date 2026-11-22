"""
Main application entry point for the Smart Tourism Intelligence Platform Backend.
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.api.routes import (
    clustering_router,
    dashboard_router,
    database_router,
    datasets_router,
    demand_router,
    etl_router,
    health_router,
    reports_router,
    search_router,
    sentiment_router,
    spatial_router,
    web_mining_router,
)
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.database.connection import get_database_mode, init_db
from app.schemas.common import APIResponse

# Initialize structured logging
setup_logging()
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager handling startup initialization and shutdown."""
    logger.info("Initializing Smart Tourism Intelligence Platform backend...")
    try:
        init_db()
        mode = get_database_mode()
        logger.info("Data Warehouse database initialized successfully in [%s] mode.", mode.upper())
    except Exception as e:
        logger.error("Failed to initialize database during startup: %s", str(e), exc_info=True)

    yield

    logger.info("Shutting down Smart Tourism Intelligence Platform backend.")


app = FastAPI(
    title="Smart Tourism Intelligence & Visitor Analytics API",
    description=(
        "Enterprise-grade REST API powering the Smart Tourism Intelligence Platform. "
        "Provides Tourism Data Ingestion, MySQL Star Schema Warehousing, Web & Sentiment Mining, "
        "K-Means Machine Learning Clustering, and Geospatial Analytics."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(health_router)
app.include_router(datasets_router)
app.include_router(etl_router)
app.include_router(database_router)
app.include_router(web_mining_router)
app.include_router(sentiment_router)
app.include_router(demand_router)
app.include_router(clustering_router)
app.include_router(spatial_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(search_router)


@app.get("/", include_in_schema=False)
def root():
    """Redirect root path to interactive Swagger documentation."""
    return RedirectResponse(url="/docs")


# Unified Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception at %s %s: %s", request.method, request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse(
            success=False,
            data=None,
            message="An unexpected internal server error occurred.",
            errors=[str(exc)],
        ).model_dump(),
    )

