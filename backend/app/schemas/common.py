"""
Common API response and pagination schemas.
"""

from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class APIResponse(BaseModel):
    """Standard unified API response envelope."""
    success: bool = True
    data: Optional[Any] = None
    message: str = ""
    errors: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)


class PaginationParams(BaseModel):
    """Standard query parameters for pagination."""
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=25, ge=1, le=100, description="Items per page")


class PaginatedData(BaseModel):
    """Generic envelope for paginated collections."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

