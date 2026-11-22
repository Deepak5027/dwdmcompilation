"""
Test ETL and Data Warehouse operations.
"""

from app.api.routes.database_routes import get_warehouse_schema, get_warehouse_tables
from app.api.routes.etl import get_etl_history


def test_warehouse_tables(db):
    resp = get_warehouse_tables(db)
    assert resp.success is True
    tables = [t["table_name"] for t in resp.data["tables"]]
    assert "dim_destination" in tables
    assert "fact_visitor_analytics" in tables


def test_warehouse_schema(db):
    resp = get_warehouse_schema()
    assert resp.success is True
    assert resp.data["design"] == "Kimball Star Schema"
    assert len(resp.data["dimensions"]) == 4
    assert len(resp.data["facts"]) == 2


def test_etl_history(db):
    resp = get_etl_history(10, db)
    assert resp.success is True
    assert isinstance(resp.data, list)

