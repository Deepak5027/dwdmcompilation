"""
FastAPI dependency injection for database sessions.
"""

from typing import Generator

from sqlalchemy.orm import Session

from app.database.connection import get_db as _get_db


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session.

    Usage in route handlers:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...

    Yields:
        SQLAlchemy Session instance with automatic cleanup.
    """
    yield from _get_db()
