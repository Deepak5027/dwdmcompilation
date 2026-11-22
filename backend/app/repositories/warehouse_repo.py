"""
Data warehouse repository handling dimensions, star schema queries, and analytical aggregations.
"""

from datetime import date
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import desc, func, select, and_
from sqlalchemy.orm import Session

from app.models.dim_date import DimDate
from app.models.dim_destination import DimDestination
from app.models.dim_location import DimLocation
from app.models.dim_tourism_category import DimTourismCategory
from app.models.fact_tourism_reviews import FactTourismReviews
from app.models.fact_visitor_analytics import FactVisitorAnalytics


class WarehouseRepository:
    def __init__(self, db: Session):
        self.db = db

    # ----------------------------------------------------
    # Dimensions Upsert / Fetch
    # ----------------------------------------------------
    def get_or_create_date_dim(self, target_date: date) -> DimDate:
        date_key = int(target_date.strftime("%Y%m%d"))
        stmt = select(DimDate).where(DimDate.date_key == date_key)
        dim = self.db.execute(stmt).scalar_one_or_none()
        if dim:
            return dim

        month = target_date.month
        # Indian Tourism Season classification
        if month in [12, 1, 2]:
            season = "Winter"
        elif month in [3, 4, 5]:
            season = "Summer"
        elif month in [6, 7, 8, 9]:
            season = "Monsoon"
        else:
            season = "Post-Monsoon"

        quarter = (month - 1) // 3 + 1

        dim = DimDate(
            date_key=date_key,
            full_date=target_date,
            day=target_date.day,
            month=month,
            month_name=target_date.strftime("%B"),
            quarter=quarter,
            year=target_date.year,
            season=season,
        )
        self.db.add(dim)
        self.db.flush()
        return dim

    def get_or_create_location_dim(
        self, city: str, district: str, region: str = "Tamil Nadu", state: str = "Tamil Nadu"
    ) -> DimLocation:
        stmt = select(DimLocation).where(
            and_(
                DimLocation.city == city,
                DimLocation.district == district,
                DimLocation.state == state,
            )
        )
        dim = self.db.execute(stmt).scalar_one_or_none()
        if dim:
            return dim

        dim = DimLocation(
            city=city,
            district=district,
            region=region,
            state=state,
            country="India",
        )
        self.db.add(dim)
        self.db.flush()
        return dim

    def get_or_create_category_dim(self, category_name: str, description: Optional[str] = None) -> DimTourismCategory:
        stmt = select(DimTourismCategory).where(DimTourismCategory.category_name == category_name)
        dim = self.db.execute(stmt).scalar_one_or_none()
        if dim:
            return dim

        dim = DimTourismCategory(
            category_name=category_name,
            category_description=description or f"Destinations categorized under {category_name}",
        )
        self.db.add(dim)
        self.db.flush()
        return dim

    def get_or_create_destination_dim(
        self,
        destination_id: str,
        name: str,
        city: str,
        district: str,
        latitude: float,
        longitude: float,
        tourism_category: str,
        state: str = "Tamil Nadu",
    ) -> DimDestination:
        stmt = select(DimDestination).where(DimDestination.destination_id == destination_id)
        dim = self.db.execute(stmt).scalar_one_or_none()
        if dim:
            # Update attributes if needed
            dim.destination_name = name
            dim.city = city
            dim.district = district
            dim.latitude = latitude
            dim.longitude = longitude
            dim.tourism_category = tourism_category
            self.db.flush()
            return dim

        dim = DimDestination(
            destination_id=destination_id,
            destination_name=name,
            city=city,
            district=district,
            state=state,
            latitude=latitude,
            longitude=longitude,
            tourism_category=tourism_category,
            is_active=True,
        )
        self.db.add(dim)
        self.db.flush()
        return dim

    # ----------------------------------------------------
    # Fact Insertions
    # ----------------------------------------------------
    def insert_visitor_fact(
        self,
        destination_key: int,
        location_key: int,
        date_key: int,
        category_key: int,
        visitor_count: int,
        review_count: int,
        average_rating: float,
        demand_measure: float,
    ) -> FactVisitorAnalytics:
        fact = FactVisitorAnalytics(
            destination_key=destination_key,
            location_key=location_key,
            date_key=date_key,
            category_key=category_key,
            visitor_count=visitor_count,
            review_count=review_count,
            average_rating=average_rating,
            demand_measure=demand_measure,
        )
        self.db.add(fact)
        return fact

    def insert_review_fact(
        self,
        destination_key: int,
        date_key: int,
        sentiment_score: float,
        sentiment_category: str,
        review_count: int,
    ) -> FactTourismReviews:
        fact = FactTourismReviews(
            destination_key=destination_key,
            date_key=date_key,
            sentiment_score=sentiment_score,
            sentiment_category=sentiment_category,
            review_count=review_count,
        )
        self.db.add(fact)
        return fact

    # ----------------------------------------------------
    # Aggregation & Analytical Queries
    # ----------------------------------------------------
    def get_destinations_list(self) -> List[DimDestination]:
        stmt = select(DimDestination).where(DimDestination.is_active == True).order_by(DimDestination.destination_name)
        return list(self.db.execute(stmt).scalars().all())

    def get_destination_by_code(self, destination_id: str) -> Optional[DimDestination]:
        stmt = select(DimDestination).where(DimDestination.destination_id == destination_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_total_recorded_visitors(self) -> int:
        stmt = select(func.sum(FactVisitorAnalytics.visitor_count))
        return self.db.execute(stmt).scalar() or 0

    def get_total_facts_count(self) -> int:
        stmt = select(func.count(FactVisitorAnalytics.visitor_fact_id))
        return self.db.execute(stmt).scalar() or 0

    def get_average_rating(self) -> float:
        stmt = select(func.avg(FactVisitorAnalytics.average_rating))
        val = self.db.execute(stmt).scalar()
        return round(float(val), 2) if val else 0.0

    def get_monthly_visitor_trends(self, limit_months: int = 24) -> List[Dict[str, Any]]:
        stmt = (
            select(
                DimDate.year,
                DimDate.month,
                func.sum(FactVisitorAnalytics.visitor_count).label("total_visitors"),
                func.sum(FactVisitorAnalytics.review_count).label("total_reviews"),
                func.avg(FactVisitorAnalytics.average_rating).label("avg_rating"),
                func.avg(FactVisitorAnalytics.demand_measure).label("avg_demand"),
            )
            .join(DimDate, FactVisitorAnalytics.date_key == DimDate.date_key)
            .group_by(DimDate.year, DimDate.month)
            .order_by(DimDate.year, DimDate.month)
            .limit(limit_months)
        )
        rows = self.db.execute(stmt).all()
        return [
            {
                "period": f"{r.year}-{r.month:02d}",
                "visitor_count": int(r.total_visitors or 0),
                "review_count": int(r.total_reviews or 0),
                "average_rating": round(float(r.avg_rating or 0.0), 2),
                "demand_measure": round(float(r.avg_demand or 0.0), 2),
            }
            for r in rows
        ]

    def get_category_distribution(self) -> List[Dict[str, Any]]:
        stmt = (
            select(
                DimTourismCategory.category_name,
                func.sum(FactVisitorAnalytics.visitor_count).label("visitors"),
                func.count(func.distinct(FactVisitorAnalytics.destination_key)).label("destinations_count"),
            )
            .join(DimTourismCategory, FactVisitorAnalytics.category_key == DimTourismCategory.category_key)
            .group_by(DimTourismCategory.category_name)
            .order_by(desc("visitors"))
        )
        rows = self.db.execute(stmt).all()
        return [
            {
                "category": r.category_name,
                "visitors": int(r.visitors or 0),
                "destinations_count": int(r.destinations_count or 0),
            }
            for r in rows
        ]

    def get_top_destinations(self, limit: int = 10) -> List[Dict[str, Any]]:
        stmt = (
            select(
                DimDestination.destination_id,
                DimDestination.destination_name,
                DimDestination.district,
                DimDestination.tourism_category,
                func.sum(FactVisitorAnalytics.visitor_count).label("total_visitors"),
                func.avg(FactVisitorAnalytics.average_rating).label("avg_rating"),
                func.avg(FactVisitorAnalytics.demand_measure).label("avg_demand"),
            )
            .join(DimDestination, FactVisitorAnalytics.destination_key == DimDestination.destination_key)
            .group_by(
                DimDestination.destination_id,
                DimDestination.destination_name,
                DimDestination.district,
                DimDestination.tourism_category,
            )
            .order_by(desc("total_visitors"))
            .limit(limit)
        )
        rows = self.db.execute(stmt).all()
        return [
            {
                "destination_id": r.destination_id,
                "destination_name": r.destination_name,
                "district": r.district,
                "category": r.tourism_category,
                "visitors": int(r.total_visitors or 0),
                "rating": round(float(r.avg_rating or 0.0), 2),
                "demand": round(float(r.avg_demand or 0.0), 2),
            }
            for r in rows
        ]

    def get_seasonal_aggregates(self) -> List[Dict[str, Any]]:
        stmt = (
            select(
                DimDate.season,
                func.avg(FactVisitorAnalytics.visitor_count).label("avg_visitors"),
                func.count(func.distinct(FactVisitorAnalytics.destination_key)).label("dest_count"),
                func.sum(FactVisitorAnalytics.visitor_count).label("total_visitors"),
            )
            .join(DimDate, FactVisitorAnalytics.date_key == DimDate.date_key)
            .group_by(DimDate.season)
        )
        rows = self.db.execute(stmt).all()
        total_all = sum([r.total_visitors or 0 for r in rows]) or 1

        season_peak_months = {
            "Winter": "January",
            "Summer": "May",
            "Monsoon": "August",
            "Post-Monsoon": "November",
        }

        return [
            {
                "season": r.season,
                "avg_visitors": round(float(r.avg_visitors or 0.0), 1),
                "destinations_count": int(r.dest_count or 0),
                "peak_month": season_peak_months.get(r.season, "October"),
                "visitor_share_pct": round(float((r.total_visitors or 0) / total_all * 100), 1),
            }
            for r in rows
        ]

    def get_warehouse_table_stats(self) -> List[Dict[str, Any]]:
        tables = [
            ("dim_destination", DimDestination),
            ("dim_location", DimLocation),
            ("dim_date", DimDate),
            ("dim_tourism_category", DimTourismCategory),
            ("fact_visitor_analytics", FactVisitorAnalytics),
            ("fact_tourism_reviews", FactTourismReviews),
        ]
        stats = []
        for name, model in tables:
            cnt = self.db.execute(select(func.count()).select_from(model)).scalar() or 0
            stats.append({"table_name": name, "row_count": cnt, "type": "Dimension" if "dim" in name else "Fact"})
        return stats

