"""
Test VADER sentiment analysis and summarization.
"""

from app.api.routes.sentiment import analyze_reviews, get_sentiment_summary
from app.schemas.analytics import SentimentAnalyzeRequest


def test_sentiment_summary(db):
    resp = get_sentiment_summary(None, db)
    assert resp.success is True
    data = resp.data
    assert data.positive_pct >= 0.0
    assert data.neutral_pct >= 0.0
    assert data.negative_pct >= 0.0
    assert data.average_compound_score is not None
    assert round(data.positive_pct + data.neutral_pct + data.negative_pct) >= 99


def test_sentiment_analyze_run(db):
    resp = analyze_reviews(SentimentAnalyzeRequest(), db)
    assert resp.success is True
    assert resp.data.total_reviews_analyzed > 0
