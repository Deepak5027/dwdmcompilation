"""
Tourist Discovery & Recommendation Service.
Combines Star Schema dimensions, fact metrics, VADER review sentiment,
and Haversine spatial calculations into tourist-tailored recommendations.
"""

from typing import Any, Dict, List, Optional
import math
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.dim_destination import DimDestination
from app.models.fact_visitor_analytics import FactVisitorAnalytics
from app.models.review import Review
from app.utils.coordinates import haversine_distance

DISTRICT_COORDINATES: Dict[str, Dict[str, float]] = {
    "chennai": {"lat": 13.0827, "lon": 80.2707, "label": "Chennai Central"},
    "chengalpattu": {"lat": 12.6841, "lon": 79.9836, "label": "Chengalpattu"},
    "nilgiris": {"lat": 11.4102, "lon": 76.6950, "label": "Ooty / Nilgiris"},
    "dindigul": {"lat": 10.3673, "lon": 77.9803, "label": "Kodaikanal / Dindigul"},
    "madurai": {"lat": 9.9252, "lon": 78.1198, "label": "Madurai Junction"},
    "ramanathapuram": {"lat": 9.3639, "lon": 78.8395, "label": "Rameswaram"},
    "kanyakumari": {"lat": 8.0883, "lon": 77.5385, "label": "Cape Comorin"},
    "salem": {"lat": 11.6643, "lon": 78.1460, "label": "Salem / Yercaud"},
    "thanjavur": {"lat": 10.7870, "lon": 79.1378, "label": "Thanjavur City"},
    "dharmapuri": {"lat": 12.1211, "lon": 78.1582, "label": "Hogenakkal / Dharmapuri"},
    "cuddalore": {"lat": 11.7480, "lon": 79.7714, "label": "Cuddalore / Chidambaram"},
    "tenkasi": {"lat": 8.9594, "lon": 77.3150, "label": "Courtallam / Tenkasi"},
    "coimbatore": {"lat": 11.0168, "lon": 76.9558, "label": "Coimbatore City"},
    "tirupathur": {"lat": 12.4925, "lon": 78.5678, "label": "Yelagiri / Tirupathur"},
    "vellore": {"lat": 12.9165, "lon": 79.1325, "label": "Vellore Fort"},
}


class TouristService:
    def __init__(self, db: Session):
        self.db = db

    def get_metadata(self) -> Dict[str, Any]:
        """Return district list, vibes, and quick selection coordinates."""
        districts_query = (
            self.db.query(
                DimDestination.district,
                func.count(DimDestination.destination_key).label("count")
            )
            .filter(DimDestination.is_active == True)
            .group_by(DimDestination.district)
            .order_by(DimDestination.district)
            .all()
        )

        districts = [
            {"name": d[0], "count": d[1], "normalized": d[0].lower().strip()}
            for d in districts_query if d[0]
        ]

        vibes = [
            {
                "id": "all",
                "label": "All Experiences",
                "badge": "Complete Guide",
                "icon": "Sparkles",
                "description": "Browse all 20 benchmark destinations across Tamil Nadu.",
            },
            {
                "id": "ancient",
                "label": "Ancient & Heritage",
                "badge": "Centuries Old",
                "icon": "Landmark",
                "description": "UNESCO monuments, Chola dynasties, rock-cut shrines, and sacred corridors.",
            },
            {
                "id": "playful",
                "label": "Playful & Leisure",
                "badge": "Fun & Refreshing",
                "icon": "Waves",
                "description": "Expansive beaches, river coracle boat navigations, and cascading herbal waterfalls.",
            },
            {
                "id": "nature",
                "label": "Nature & Scenic Hills",
                "badge": "Misty Escapes",
                "icon": "Trees",
                "description": "High-altitude tea estates, cool hill lakes, tiger sanctuaries, and bird havens.",
            },
            {
                "id": "creative",
                "label": "Creative & Cultural",
                "badge": "Arts & Architecture",
                "icon": "Palette",
                "description": "Ocean meditation sanctuaries, 108 Bharatnatyam dance postures, and stone artistry.",
            },
        ]

        return {
            "districts": districts,
            "vibes": vibes,
            "district_coordinates": DISTRICT_COORDINATES,
        }

    def get_recommendations(
        self,
        district: Optional[str] = None,
        vibe: Optional[str] = None,
        origin_district: Optional[str] = None,
        sort_by: str = "recommended",
        min_rating: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """
        Produce smart, scored tourist recommendations matching user filters.
        """
        # Query destinations
        query = self.db.query(DimDestination).filter(DimDestination.is_active == True)

        if district and district.lower() != "all":
            query = query.filter(func.lower(DimDestination.district) == district.lower().strip())

        if vibe and vibe.lower() != "all":
            query = query.filter(func.lower(DimDestination.travel_vibe) == vibe.lower().strip())

        destinations = query.all()

        # Origin reference coordinates for distance calculations
        ref_coords = None
        if origin_district:
            norm_orig = origin_district.lower().strip()
            if norm_orig in DISTRICT_COORDINATES:
                ref_coords = DISTRICT_COORDINATES[norm_orig]

        # Gather analytics and sentiment metrics
        results = []
        for d in destinations:
            # Fact metrics
            fact = (
                self.db.query(FactVisitorAnalytics)
                .filter(FactVisitorAnalytics.destination_key == d.destination_key)
                .order_by(desc(FactVisitorAnalytics.date_key))
                .first()
            )

            avg_rating = round(fact.average_rating if fact and fact.average_rating else 4.6, 1)
            if avg_rating < min_rating:
                continue

            visitor_count = fact.visitor_count if fact and fact.visitor_count else 250000
            review_count = fact.review_count if fact and fact.review_count else 120

            # Reviews & Sentiment
            reviews = (
                self.db.query(Review)
                .filter(Review.destination_id == d.destination_id)
                .all()
            )
            if reviews:
                pos_count = sum(1 for r in reviews if (r.sentiment_category or '').lower() == 'positive')
                positive_pct = round((pos_count / len(reviews)) * 100, 1)
            else:
                positive_pct = 88.0

            # Distance calculation
            distance_km = None
            if ref_coords and d.latitude and d.longitude:
                try:
                    distance_km = round(
                        haversine_distance(ref_coords["lat"], ref_coords["lon"], d.latitude, d.longitude),
                        1
                    )
                except Exception:
                    distance_km = None

            # Recommendation Score Algorithm (0 - 100)
            # 40% Rating + 35% Sentiment + 25% Popularity
            rating_norm = (avg_rating / 5.0) * 40.0
            sentiment_norm = (positive_pct / 100.0) * 35.0
            popularity_norm = min(25.0, (math.log10(max(1000, visitor_count)) / 6.0) * 25.0)
            rec_score = round(rating_norm + sentiment_norm + popularity_norm, 1)

            results.append({
                "destination_id": d.destination_id,
                "destination_name": d.destination_name,
                "city": d.city or d.district,
                "district": d.district,
                "state": d.state,
                "latitude": d.latitude,
                "longitude": d.longitude,
                "tourism_category": d.tourism_category,
                "travel_vibe": d.travel_vibe or "heritage",
                "famous_for": d.famous_for or f"Historic and scenic landmark in {d.district}, Tamil Nadu.",
                "best_time_to_visit": d.best_time_to_visit or "October to March",
                "typical_dwell_time": d.typical_dwell_time or "2 - 3 hours",
                "entry_fee": d.entry_fee or "Free",
                "average_rating": avg_rating,
                "visitor_count": visitor_count,
                "review_count": review_count,
                "positive_sentiment_pct": positive_pct,
                "distance_km": distance_km,
                "recommendation_score": rec_score,
                "is_must_visit": rec_score >= 88.0 or avg_rating >= 4.7,
            })

        # Sorting logic
        if sort_by == "rating":
            results.sort(key=lambda x: x["average_rating"], reverse=True)
        elif sort_by == "sentiment":
            results.sort(key=lambda x: x["positive_sentiment_pct"], reverse=True)
        elif sort_by == "distance" and ref_coords:
            results.sort(key=lambda x: (x["distance_km"] if x["distance_km"] is not None else 99999))
        elif sort_by == "footfall":
            results.sort(key=lambda x: x["visitor_count"], reverse=True)
        else:  # 'recommended' default
            results.sort(key=lambda x: x["recommendation_score"], reverse=True)

        return results
