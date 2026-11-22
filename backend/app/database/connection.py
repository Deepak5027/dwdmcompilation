"""
Dual-mode database connection: MySQL primary with SQLite fallback.
"""

import logging
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.database.base import Base

logger = logging.getLogger("app")

# Module-level state
_engine = None
_SessionLocal = None
_database_mode = "unknown"


def _try_primary_connection():
    """Attempt to connect to primary database (Supabase/PostgreSQL or MySQL) and return an engine if successful."""
    try:
        engine = create_engine(
            settings.database_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"connect_timeout": 10},
            echo=False,
        )
        # Test the connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_type = "Supabase / PostgreSQL" if "postgresql" in settings.database_url else "MySQL"
        logger.info("Successfully connected to %s database: %s", db_type, settings.db_name)
        return engine
    except Exception as e:
        logger.warning("Primary database connection failed: %s", str(e))
        return None


def _create_sqlite_connection():
    """Create and return a SQLite engine as fallback."""
    db_path = Path(__file__).resolve().parent.parent.parent / "data" / "tourism_dw.sqlite"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    sqlite_url = f"sqlite:///{db_path}"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )

    # Enable WAL mode and foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    logger.info("Using SQLite fallback database at: %s", db_path)
    return engine


def _initialize_engine():
    """Initialize the database engine with Supabase / MySQL primary and SQLite fallback."""
    global _engine, _SessionLocal, _database_mode

    if _engine is not None:
        return

    # Try Primary database first (Supabase / Postgres / MySQL)
    _engine = _try_primary_connection()
    if _engine is not None:
        if "supabase" in settings.database_url:
            _database_mode = "supabase"
        elif "postgresql" in settings.database_url:
            _database_mode = "postgresql"
        else:
            _database_mode = "mysql"
    elif settings.db_fallback_sqlite:
        # Fall back to SQLite
        _engine = _create_sqlite_connection()
        _database_mode = "sqlite"
    else:
        raise RuntimeError(
            "Cannot connect to primary database and SQLite fallback is disabled. "
            "Check database configuration."
        )

    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def get_engine():
    """Get the current database engine, initializing if needed."""
    _initialize_engine()
    return _engine


def get_session_factory():
    """Get the session factory, initializing if needed."""
    _initialize_engine()
    return _SessionLocal


def get_database_mode() -> str:
    """Return which database backend is in use ('supabase', 'postgresql', 'mysql', or 'sqlite')."""
    _initialize_engine()
    return _database_mode


def check_db_health() -> dict:
    """Check live database connectivity and return telemetry."""
    global _engine, _database_mode
    try:
        if _engine is None:
            _initialize_engine()
        with _engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        if _database_mode == "supabase":
            engine_name = "Supabase (PostgreSQL)"
        elif _database_mode == "postgresql":
            engine_name = "PostgreSQL"
        elif _database_mode == "mysql":
            engine_name = "MySQL 8.0"
        else:
            engine_name = "SQLite (Fallback)"

        return {
            "status": "connected",
            "dialect": _database_mode,
            "engine": engine_name,
            "database_name": settings.db_name if _database_mode != "sqlite" else "tourism_dw.sqlite",
            "host": f"{settings.db_host}:{settings.db_port}" if _database_mode != "sqlite" else "local",
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "dialect": "none",
            "engine": "Disconnected",
            "database_name": settings.db_name,
            "host": f"{settings.db_host}:{settings.db_port}",
            "error": str(e),
        }


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session with proper cleanup.

    Yields:
        SQLAlchemy Session instance.
    """
    _initialize_engine()
    db = _SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Create all tables defined in the models.

    Should be called at application startup.
    """
    _initialize_engine()

    # Import all models to ensure they are registered with Base
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=_engine)
    logger.info(
        "Database tables created/verified (mode: %s, tables: %d)",
        _database_mode,
        len(Base.metadata.tables),
    )


# Convenience exports
engine = property(lambda self: get_engine())
SessionLocal = property(lambda self: get_session_factory())
