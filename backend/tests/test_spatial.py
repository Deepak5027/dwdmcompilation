"""
Test Spatial Analytics and Distance calculations.
"""

from app.api.routes.spatial import (
    calculate_inter_destination_distance,
    get_density_heatmap,
    get_spatial_destinations,
    get_spatial_hotspots,
)
from app.schemas.analytics import DistanceCalculationRequest


def test_spatial_destinations(db):
    resp = get_spatial_destinations(db)
    assert resp.success is True
    assert len(resp.data) > 0
    first = resp.data[0]
    assert 8.0 <= first.latitude <= 13.6
    assert 76.2 <= first.longitude <= 80.4


def test_spatial_heatmap(db):
    resp = get_density_heatmap(db)
    assert resp.success is True
    assert len(resp.data) > 0
    for pt in resp.data:
        assert 0.0 <= pt.weight <= 1.0


def test_spatial_hotspots(db):
    resp = get_spatial_hotspots(db)
    assert resp.success is True
    assert len(resp.data) > 0


def test_distance_calculation(db):
    req = DistanceCalculationRequest(origin_id="TN-CHE-01", destination_id="TN-MAM-01")
    resp = calculate_inter_destination_distance(req, db)
    assert resp.success is True
    # Chennai to Mahabalipuram is approximately 45-55 km
    assert 35.0 <= resp.data.distance_km <= 65.0
