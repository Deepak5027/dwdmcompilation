"""
Pydantic schemas for Web Mining, Sentiment Analysis, Demand Forecasting,
K-Means Clustering, Spatial Analytics, and Executive Dashboard.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ----------------------------------------------------
# Web Mining & Sentiment Schemas
# ----------------------------------------------------
class KeywordExtractRequest(BaseModel):
    destination_id: Optional[str] = None
    top_n: int = Field(default=20, ge=5, le=100)
    dataset_id: Optional[int] = None


class KeywordResult(BaseModel):
    keyword: str
    tfidf_score: float
    frequency: int
    destination_id: Optional[str] = None


class TopicExtractRequest(BaseModel):
    n_topics: int = Field(default=4, ge=2, le=10)
    top_words: int = Field(default=6, ge=3, le=20)
    destination_id: Optional[str] = None


class TopicResult(BaseModel):
    topic_id: int
    label: str
    top_terms: List[str]
    term_weights: Dict[str, float]
    sample_excerpts: List[str]


class SentimentAnalyzeRequest(BaseModel):
    destination_id: Optional[str] = None
    dataset_id: Optional[int] = None


class SentimentSummary(BaseModel):
    total_reviews_analyzed: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    average_compound_score: float
    destination_breakdown: List[Dict[str, Any]]


class DestinationSentimentDetail(BaseModel):
    destination_id: str
    destination_name: str
    total_reviews: int
    average_score: float
    positive_count: int
    neutral_count: int
    negative_count: int
    dominant_sentiment: str


# ----------------------------------------------------
# Demand Analytics & Forecasting Schemas
# ----------------------------------------------------
class DemandTrendPoint(BaseModel):
    period: str  # e.g., "2024-01" or "Q1 2024"
    visitor_count: int
    review_count: int
    average_rating: float
    demand_measure: float


class SeasonalPattern(BaseModel):
    season: str
    avg_visitors: float
    destinations_count: int
    peak_month: str
    visitor_share_pct: float


class ForecastRequest(BaseModel):
    periods: int = Field(default=6, ge=1, le=24)
    destination_id: Optional[str] = None
    alpha: float = Field(default=0.3, ge=0.01, le=0.99)


class ForecastPoint(BaseModel):
    period: str
    actual: Optional[float] = None
    predicted: float
    lower_bound: float
    upper_bound: float
    is_forecast: bool


class ForecastResponse(BaseModel):
    destination_id: Optional[str]
    method: str
    history_points: int
    forecast_points: int
    series: List[ForecastPoint]
    metrics: Dict[str, float]  # MAE, RMSE


# ----------------------------------------------------
# K-Means Clustering Schemas
# ----------------------------------------------------
class ClusteringExecuteRequest(BaseModel):
    k_value: int = Field(default=3, ge=2, le=8)
    features: List[str] = Field(
        default=["avg_visitors", "avg_rating", "total_reviews", "demand_score"]
    )
    max_iter: int = Field(default=300, ge=50, le=1000)
    random_state: int = Field(default=42)


class ClusterAssignment(BaseModel):
    destination_id: str
    destination_name: str
    district: str
    tourism_category: str
    cluster_id: int
    cluster_label: str
    features: Dict[str, float]


class PCAPoint(BaseModel):
    destination_id: str
    destination_name: str
    pca_x: float
    pca_y: float
    cluster_id: int
    cluster_label: str


class ElbowPoint(BaseModel):
    k: int
    inertia: float


class ClusteringExecutionResponse(BaseModel):
    id: int
    k_value: int
    inertia: float
    silhouette_score: float
    cluster_labels: List[str]
    cluster_sizes: Dict[str, int]
    cluster_centroids: List[Dict[str, float]]
    pca_points: List[PCAPoint]
    assignments: List[ClusterAssignment]
    features_used: List[str]
    created_at: datetime


# ----------------------------------------------------
# Spatial Analytics Schemas
# ----------------------------------------------------
class SpatialDestinationPoint(BaseModel):
    destination_id: str
    destination_name: str
    city: str
    district: str
    state: str
    latitude: float
    longitude: float
    tourism_category: str
    visitor_count: int
    average_rating: float
    sentiment_score: Optional[float] = None
    cluster_id: Optional[int] = None
    cluster_label: Optional[str] = None


class HeatmapPoint(BaseModel):
    latitude: float
    longitude: float
    weight: float
    destination_name: str


class HotspotCluster(BaseModel):
    hotspot_id: int
    center_lat: float
    center_lon: float
    district: str
    destinations_included: List[str]
    total_footfall: int
    average_rating: float
    density_rank: str


class DistanceCalculationRequest(BaseModel):
    origin_id: str
    destination_id: str


class DistanceCalculationResponse(BaseModel):
    origin: str
    destination: str
    distance_km: float
    origin_coords: Dict[str, float]
    destination_coords: Dict[str, float]


# ----------------------------------------------------
# Executive BI Dashboard Schemas
# ----------------------------------------------------
class KPICard(BaseModel):
    id: str
    title: str
    value: str
    numeric_value: float
    unit: Optional[str] = None
    trend_pct: Optional[float] = None
    trend_direction: str = "up"  # up, down, neutral
    subtitle: str
    icon: str


class InsightCard(BaseModel):
    id: str
    category: str  # Demand, Sentiment, Clustering, Spatial
    title: str
    description: str
    metric_label: str
    metric_value: str
    badge_variant: str  # teal, indigo, sky, amber, emerald


class DashboardOverview(BaseModel):
    kpis: List[KPICard]
    insights: List[InsightCard]
    visitor_trends: List[DemandTrendPoint]
    category_distribution: List[Dict[str, Any]]
    top_destinations: List[Dict[str, Any]]
    sentiment_overview: Dict[str, Any]
    cluster_summary: Dict[str, Any]
    regional_metrics: List[Dict[str, Any]]
    last_updated: datetime

