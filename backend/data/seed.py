"""
Database Seeder: Ingests the sample Tamil Nadu tourism dataset and reviews into the warehouse.
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.connection import get_db, init_db
from app.models.dataset import Dataset
from app.models.review import Review
from app.repositories.dataset_repo import DatasetRepository
from app.repositories.review_repo import ReviewRepository
from app.schemas.dataset import DatasetCreate
from app.services.etl.service import ETLService
from app.services.sentiment.service import SentimentService
import pandas as pd


def seed_database():
    print(">>> Initializing database schema...")
    init_db()

    db = next(get_db())
    dataset_repo = DatasetRepository(db)
    review_repo = ReviewRepository(db)
    etl_service = ETLService(db)
    sentiment_service = SentimentService(db)

    # 1. Ingest Sample Destinations Dataset
    sample_csv = backend_dir / "data" / "sample" / "tamil_nadu_destinations.csv"
    if sample_csv.exists():
        existing = dataset_repo.get_by_name("Tamil Nadu Official Tourism Benchmark Dataset")
        if existing and existing.status in ["etl_error", "uploaded", "validation_error"]:
            print(f">>> Found existing incomplete dataset (ID: {existing.id}, Status: {existing.status}). Re-executing ETL...")
            report = etl_service.execute_etl(existing.id)
            print(f">>> ETL Completed: {report.records_accepted} records loaded into Kimball star schema!")
        elif not existing:
            print(">>> Registering sample dataset...")
            ds_in = DatasetCreate(
                name="Tamil Nadu Official Tourism Benchmark Dataset",
                source="Tamil Nadu Tourism Development Corporation (Demonstration Archive)",
                description="Comprehensive multi-seasonal visitor telemetry and spatial metrics across major Tamil Nadu tourism hubs.",
                geographic_coverage="Tamil Nadu, India",
                collection_date=None,
            )
            dataset = dataset_repo.create(
                obj_in=ds_in,
                filename="tamil_nadu_destinations.csv",
                original_filename="tamil_nadu_destinations.csv",
                file_size=sample_csv.stat().st_size,
            )
            print(f">>> Dataset registered with ID {dataset.id}. Running ETL pipeline...")
            report = etl_service.execute_etl(dataset.id)
            print(f">>> ETL Completed: {report.records_accepted} records loaded into Kimball star schema!")
        else:
            print(f">>> Dataset already present and loaded (ID: {existing.id}, Status: {existing.status}).")

    # 2. Ingest Sample Reviews for Web Mining & Sentiment
    reviews_csv = backend_dir / "data" / "sample" / "tamil_nadu_reviews.csv"
    if reviews_csv.exists():
        df_rev = pd.read_csv(reviews_csv)
        existing_revs, total = review_repo.get_all(limit=10)
        if total < len(df_rev):
            print(f">>> Seeding {len(df_rev)} reviews into reviews staging table...")
            review_dicts = []
            for _, r in df_rev.iterrows():
                review_dicts.append({
                    "destination_id": str(r["destination_id"]),
                    "review_text": str(r["review_text"]),
                    "review_date": pd.to_datetime(r["review_date"]).date(),
                    "source_name": str(r["source_name"]),
                    "rating": float(r["rating"]),
                    "language": str(r.get("language", "en")),
                })
            review_repo.bulk_insert(review_dicts)
            print(">>> Running VADER sentiment scoring on reviews...")
            scored_count = sentiment_service.analyze_unprocessed_reviews(limit=500)
            print(f">>> {scored_count} reviews scored and categorized!")
        else:
            print(f">>> Reviews already seeded ({total} reviews in database).")

    print(">>> Seed completed successfully!")


if __name__ == "__main__":
    seed_database()
