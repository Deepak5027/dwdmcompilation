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


def _try_mysql_connection():
    """Attempt to connect to MySQL and return an engine if successful."""
    try:
        engine = create_engine(
            settings.database_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"connect_timeout": 5},
            echo=False,
        )
        # Test the connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to MySQL database: %s", settings.db_name)
        return engine
    except Exception as e:
        logger.warning("MySQL connection failed: %s", str(e))
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
    """Initialize the database engine with MySQL primary and SQLite fallback."""
    global _engine, _SessionLocal, _database_mode

    if _engine is not None:
        return

    # Try MySQL first
    _engine = _try_mysql_connection()
    if _engine is not None:
        _database_mode = "mysql"
    elif settings.db_fallback_sqlite:
        # Fall back to SQLite
        _engine = _create_sqlite_connection()
        _database_mode = "sqlite"
    else:
        raise RuntimeError(
            "Cannot connect to MySQL and SQLite fallback is disabled. "
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
    """Return which database backend is in use ('mysql' or 'sqlite')."""
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
        return {
            "status": "connected",
            "dialect": _database_mode,
            "engine": "MySQL 8.0" if _database_mode == "mysql" else "SQLite (Fallback)",
            "database_name": settings.db_name if _database_mode == "mysql" else "tourism_dw.sqlite",
            "host": f"{settings.db_host}:{settings.db_port}" if _database_mode == "mysql" else "local",
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
