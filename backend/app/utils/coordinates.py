"""
Geographic coordinate calculations and Tamil Nadu bounding validations.
"""

import math
from typing import Dict, Tuple

# Tamil Nadu Bounding Box (with safe padding for border attractions)
TAMIL_NADU_BOUNDS = {
    "lat_min": 8.0,
    "lat_max": 13.6,
    "lon_min": 76.2,
    "lon_max": 80.4,
}


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in kilometers.
    Uses the Haversine formula to prevent planar approximation distortion.
    """
    r = 6371.0  # Earth's radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


def validate_coordinates(lat: float, lon: float) -> Tuple[bool, str]:
    """
    Validate whether the coordinates are numerically valid and within Tamil Nadu bounds.
    """
    if lat is None or lon is None:
        return False, "Coordinates cannot be null"

    try:
        lat = float(lat)
        lon = float(lon)
    except (ValueError, TypeError):
        return False, "Coordinates must be numeric floating-point values"

    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
        return False, f"Coordinates ({lat}, {lon}) out of global geographic limits"

    if not (
        TAMIL_NADU_BOUNDS["lat_min"] <= lat <= TAMIL_NADU_BOUNDS["lat_max"]
        and TAMIL_NADU_BOUNDS["lon_min"] <= lon <= TAMIL_NADU_BOUNDS["lon_max"]
    ):
        return (
            False,
            f"Coordinates ({lat}, {lon}) fall outside Tamil Nadu state geographical boundary",
        )

    return True, "Valid Tamil Nadu coordinates"

