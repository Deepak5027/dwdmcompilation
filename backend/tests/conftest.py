"""
Pytest fixtures: test database session and sample data.
"""

import sys
from pathlib import Path
import pytest

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.database.connection import get_db, init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure database schema is ready."""
    init_db()


@pytest.fixture(scope="function")
def db(setup_database):
    """Yield database session for testing."""
    session = next(get_db())
    try:
        yield session
    finally:
        session.close()
