"""
Data Warehouse schema inspection, table metrics, and safe SQL workspace endpoints.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_database_mode, get_db
from app.repositories.warehouse_repo import WarehouseRepository
from app.schemas.common import APIResponse

router = APIRouter(prefix="/api/database", tags=["Module 1: MySQL Warehouse"])


class QueryRequest(BaseModel):
    sql: str


@router.get("/tables", response_model=APIResponse)
def get_warehouse_tables(db: Session = Depends(get_db)):
    """List star schema dimensions and fact tables with live record counts."""
    repo = WarehouseRepository(db)
    stats = repo.get_warehouse_table_stats()
    return APIResponse(
        success=True,
        data={
            "database_engine": get_database_mode().upper(),
            "schema_type": "Star Schema",
            "tables": stats,
        },
        message="Warehouse table metrics retrieved",
    )


@router.get("/schema", response_model=APIResponse)
def get_warehouse_schema():
    """Return structural star schema metadata, surrogate keys, and fact grains."""
    schema_definition = {
        "schema_name": "tourism_dw",
        "design": "Kimball Star Schema",
        "fact_grain": "Individual Destination Monthly Observation",
        "dimensions": [
            {
                "table": "dim_destination",
                "surrogate_key": "destination_key",
                "natural_key": "destination_id",
                "attributes": ["destination_name", "city", "district", "latitude", "longitude", "tourism_category"],
            },
            {
                "table": "dim_location",
                "surrogate_key": "location_key",
                "natural_key": "city + district + state",
                "attributes": ["city", "district", "region", "state", "country"],
            },
            {
                "table": "dim_date",
                "surrogate_key": "date_key (YYYYMMDD)",
                "natural_key": "full_date",
                "attributes": ["day", "month", "month_name", "quarter", "year", "season"],
            },
            {
                "table": "dim_tourism_category",
                "surrogate_key": "category_key",
                "natural_key": "category_name",
                "attributes": ["category_name", "category_description"],
            },
        ],
        "facts": [
            {
                "table": "fact_visitor_analytics",
                "primary_key": "visitor_fact_id",
                "foreign_keys": ["destination_key", "location_key", "date_key", "category_key"],
                "measures": ["visitor_count", "review_count", "average_rating", "demand_measure"],
            },
            {
                "table": "fact_tourism_reviews",
                "primary_key": "review_fact_id",
                "foreign_keys": ["destination_key", "date_key"],
                "measures": ["sentiment_score", "sentiment_category", "review_count"],
            },
        ],
    }
    return APIResponse(success=True, data=schema_definition)


@router.get("/health", response_model=APIResponse)
def get_database_health(db: Session = Depends(get_db)):
    """Verify live connectivity and query performance."""
    try:
        db.execute(text("SELECT 1"))
        mode = get_database_mode()
        return APIResponse(
            success=True,
            data={"status": "CONNECTED", "mode": mode, "dialect": mode},
            message="Database connection healthy",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unreachable: {str(e)}",
        )


@router.post("/query", response_model=APIResponse)
def execute_safe_query(req: QueryRequest, db: Session = Depends(get_db)):
    """
    Execute read-only SQL queries within the data warehouse explorer.
    Strictly forbids mutating DDL or DML statements (DROP, DELETE, UPDATE, INSERT, ALTER).
    """
    clean_sql = req.sql.strip()

    # Safety check: enforce read-only SELECT
    forbidden = ["drop", "delete", "update", "insert", "alter", "truncate", "create", "grant", "revoke"]
    first_token = clean_sql.split()[0].lower() if clean_sql else ""

    if first_token != "select" or any(f in clean_sql.lower() for f in forbidden):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security Policy Violation: Only read-only SELECT queries are permitted in the warehouse explorer.",
        )

    try:
        result = db.execute(text(clean_sql))
        keys = list(result.keys())
        rows = [dict(zip(keys, row)) for row in result.fetchmany(100)]
        return APIResponse(
            success=True,
            data={"columns": keys, "rows": rows, "returned_count": len(rows)},
            message=f"Query executed successfully ({len(rows)} rows returned)",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL Syntax / Execution Error: {str(e)}")

