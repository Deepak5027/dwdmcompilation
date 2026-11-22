"""
Tourist Discovery & Recommendation API Routes.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.common import APIResponse
from app.services.tourist_service import TouristService
from app.utils.coordinates import haversine_distance
from app.models.dim_destination import DimDestination

router = APIRouter(prefix="/api/tourist", tags=["Tourist Experience & Recommendations"])


class TripPlanRequest(BaseModel):
    destination_ids: List[str]


@router.get("/metadata", response_model=APIResponse)
def get_tourist_metadata(db: Session = Depends(get_db)):
    """Return available districts, travel vibes, and preset coordinates for the Tourist Portal."""
    service = TouristService(db)
    data = service.get_metadata()
    return APIResponse(success=True, data=data, message="Tourist portal metadata retrieved")


@router.get("/destinations", response_model=APIResponse)
def get_tourist_recommendations(
    district: Optional[str] = Query(None, description="Filter by district (e.g. Chennai, Madurai)"),
    vibe: Optional[str] = Query(None, description="Filter by travel vibe (ancient, playful, nature, creative)"),
    origin_district: Optional[str] = Query(None, description="Reference location for distance calculation"),
    sort_by: str = Query("recommended", description="Sorting criteria: recommended, rating, sentiment, distance, footfall"),
    min_rating: float = Query(0.0, description="Minimum star rating filter"),
    db: Session = Depends(get_db),
):
    """
    Produce smart, ranked tourist place recommendations with distance, sentiment, and 'famous for' descriptions.
    """
    service = TouristService(db)
    data = service.get_recommendations(
        district=district,
        vibe=vibe,
        origin_district=origin_district,
        sort_by=sort_by,
        min_rating=min_rating,
    )
    return APIResponse(
        success=True,
        data={
            "total_matches": len(data),
            "destinations": data,
            "applied_filters": {
                "district": district or "All Tamil Nadu",
                "vibe": vibe or "All Experiences",
                "origin": origin_district or "Not Specified",
                "sort_by": sort_by,
            },
        },
        message=f"Found {len(data)} matching Tamil Nadu destinations",
    )


@router.post("/plan-trip", response_model=APIResponse)
def plan_tourist_trip(req: TripPlanRequest, db: Session = Depends(get_db)):
    """Calculate multi-stop day trip distance and sequential travel route."""
    if not req.destination_ids:
        return APIResponse(success=False, data=None, message="No destinations provided")

    destinations = (
        db.query(DimDestination)
        .filter(DimDestination.destination_id.in_(req.destination_ids))
        .all()
    )

    dest_dict = {d.destination_id: d for d in destinations}
    ordered_dests = [dest_dict[did] for did in req.destination_ids if did in dest_dict]

    total_distance_km = 0.0
    segments = []

    for i in range(len(ordered_dests) - 1):
        d1 = ordered_dests[i]
        d2 = ordered_dests[i + 1]
        if d1.latitude and d1.longitude and d2.latitude and d2.longitude:
            dist = round(haversine_distance(d1.latitude, d1.longitude, d2.latitude, d2.longitude), 1)
            total_distance_km += dist
            segments.append({
                "from_id": d1.destination_id,
                "from_name": d1.destination_name,
                "to_id": d2.destination_id,
                "to_name": d2.destination_name,
                "distance_km": dist,
                "est_drive_time_mins": int(dist * 1.5),
            })

    return APIResponse(
        success=True,
        data={
            "stop_count": len(ordered_dests),
            "total_distance_km": round(total_distance_km, 1),
            "total_est_drive_hours": round((total_distance_km * 1.5) / 60.0, 1),
            "stops": [
                {
                    "step": idx + 1,
                    "destination_id": d.destination_id,
                    "destination_name": d.destination_name,
                    "city": d.city or d.district,
                    "district": d.district,
                    "latitude": d.latitude,
                    "longitude": d.longitude,
                    "travel_vibe": d.travel_vibe,
                    "typical_dwell_time": d.typical_dwell_time,
                }
                for idx, d in enumerate(ordered_dests)
            ],
            "segments": segments,
        },
        message="Trip itinerary route calculated",
    )
