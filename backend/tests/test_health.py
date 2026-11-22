"""
Test health and diagnostic endpoints.
"""

from app.api.routes.health import check_health


def test_health_check(db):
    resp = check_health()
    assert resp.success is True
    assert resp.data["status"] == "operational"
    assert "database_mode" in resp.data
