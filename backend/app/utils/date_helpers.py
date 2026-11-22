"""
Date manipulation and seasonality helpers.
"""

from datetime import date, datetime
from typing import Optional


def parse_flexible_date(date_str: str) -> Optional[date]:
    """Parse various common date formats gracefully."""
    if not date_str:
        return None

    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%Y/%m/%d",
        "%Y%m%d",
        "%b %d, %Y",
        "%B %d, %Y",
    ]

    clean_str = str(date_str).strip()
    for fmt in formats:
        try:
            return datetime.strptime(clean_str, fmt).date()
        except ValueError:
            continue
    return None


def get_season_for_month(month: int) -> str:
    """Return seasonal classification appropriate for South Indian tourism."""
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "Post-Monsoon"


def to_date_key(d: date) -> int:
    """Convert a date object to YYYYMMDD integer surrogate key."""
    return int(d.strftime("%Y%m%d"))

