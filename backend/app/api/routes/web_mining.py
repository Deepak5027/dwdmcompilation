"""
Web Mining API routes: TF-IDF Keyword Extraction & LDA Latent Topic Discovery.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.analytics import (
    KeywordExtractRequest,
    KeywordResult,
    TopicExtractRequest,
    TopicResult,
)
from app.schemas.common import APIResponse
from app.services.web_mining.service import WebMiningService

router = APIRouter(prefix="/api/web-mining", tags=["Module 2: Web Mining"])


@router.post("/keywords", response_model=APIResponse)
def extract_keywords(req: KeywordExtractRequest, db: Session = Depends(get_db)):
    """Extract key terms using TF-IDF weighting and token frequency analysis."""
    service = WebMiningService(db)
    results = service.extract_keywords(
        destination_id=req.destination_id,
        top_n=req.top_n,
        dataset_id=req.dataset_id,
    )
    return APIResponse(
        success=True,
        data=results,
        message=f"Extracted {len(results)} keywords via TF-IDF mining",
    )


@router.post("/topics", response_model=APIResponse)
def extract_topics(req: TopicExtractRequest, db: Session = Depends(get_db)):
    """Extract latent thematic topics using Latent Dirichlet Allocation (LDA)."""
    service = WebMiningService(db)
    results = service.extract_topics(
        n_topics=req.n_topics,
        top_words=req.top_words,
        destination_id=req.destination_id,
    )
    return APIResponse(
        success=True,
        data=results,
        message=f"Extracted {len(results)} latent tourism topics via LDA",
    )

