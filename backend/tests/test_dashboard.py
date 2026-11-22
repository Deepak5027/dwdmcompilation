"""
Test Executive BI Dashboard aggregations and insight generation.
"""

from app.api.routes.dashboard import (
    get_dashboard_overview,
    get_data_driven_insights,
    get_destination_rankings,
    get_visitor_analytics,
)


def test_dashboard_overview(db):
    resp = get_dashboard_overview(db)
    assert resp.success is True
    data = resp.data
    assert len(data.kpis) == 8
    assert len(data.insights) >= 3
    assert len(data.visitor_trends) > 0
    assert len(data.category_distribution) > 0
    assert len(data.top_destinations) > 0


def test_dashboard_destinations(db):
    resp = get_destination_rankings(5, db)
    assert resp.success is True
    assert len(resp.data) <= 5


def test_dashboard_visitors(db):
    resp = get_visitor_analytics(12, db)
    assert resp.success is True
    assert "trends" in resp.data
    assert "category_distribution" in resp.data
