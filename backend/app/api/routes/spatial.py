"""
Spatial Analytics API routes: Destination GeoJSON/Points, Density Heatmaps, Hotspots, and Distance.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.analytics import DistanceCalculationRequest
from app.schemas.common import APIResponse
from app.services.spatial.service import SpatialService

router = APIRouter(prefix="/api/spatial", tags=["Module 3: Spatial Analytics"])


@router.get("/destinations", response_model=APIResponse)
def get_spatial_destinations(db: Session = Depends(get_db)):
    """Retrieve verified Tamil Nadu tourism locations with coordinates and telemetry."""
    service = SpatialService(db)
    points = service.get_spatial_destinations()
    return APIResponse(
        success=True,
        data=points,
        message=f"Retrieved {len(points)} verified spatial tourism nodes",
    )


@router.get("/heatmap", response_model=APIResponse)
def get_density_heatmap(db: Session = Depends(get_db)):
    """Retrieve visitor intensity weights for spatial density heatmapping."""
    service = SpatialService(db)
    points = service.get_density_heatmap()
    return APIResponse(success=True, data=points, message="Density heatmap weights computed")


@router.get("/hotspots", response_model=APIResponse)
def get_spatial_hotspots(db: Session = Depends(get_db)):
    """Retrieve high-density geographic corridors and destination clusters."""
    service = SpatialService(db)
    hotspots = service.get_spatial_hotspots()
    return APIResponse(success=True, data=hotspots, message="Spatial hotspots calculated")


@router.post("/distance", response_model=APIResponse)
def calculate_inter_destination_distance(
    req: DistanceCalculationRequest, db: Session = Depends(get_db)
):
    """Compute exact great-circle distance (Haversine km) between two destinations."""
    service = SpatialService(db)
    try:
        resp = service.calculate_distance(req.origin_id, req.destination_id)
        return APIResponse(success=True, data=resp, message="Distance calculated successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

