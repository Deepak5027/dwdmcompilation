"""
Sentiment Analysis API routes: VADER polarity classification and review summaries.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.analytics import SentimentAnalyzeRequest, SentimentSummary
from app.schemas.common import APIResponse
from app.services.sentiment.service import SentimentService

router = APIRouter(prefix="/api/sentiment", tags=["Module 2: Sentiment Analysis"])


@router.post("/analyze", response_model=APIResponse)
def analyze_reviews(req: SentimentAnalyzeRequest, db: Session = Depends(get_db)):
    """Run VADER sentiment classifier across newly ingested review texts."""
    service = SentimentService(db)
    processed = service.analyze_unprocessed_reviews(limit=500)
    summary = service.get_sentiment_summary(destination_id=req.destination_id)
    return APIResponse(
        success=True,
        data=summary,
        message=f"Sentiment processing executed across {processed} reviews",
    )


@router.get("/summary", response_model=APIResponse)
def get_sentiment_summary(
    destination_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve aggregate positive, neutral, and negative distributions."""
    service = SentimentService(db)
    summary = service.get_sentiment_summary(destination_id=destination_id)
    return APIResponse(success=True, data=summary, message="Sentiment summary retrieved")

