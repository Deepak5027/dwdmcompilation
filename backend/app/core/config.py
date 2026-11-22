"""
Application configuration loaded from environment variables using pydantic-settings.
"""

import json
from pathlib import Path
from typing import List
from urllib.parse import quote_plus

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "tourism_dw"
    db_fallback_sqlite: bool = True

    # Application
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_debug: bool = True
    app_secret_key: str = "change-this-in-production"

    # File Upload
    max_upload_size_mb: int = 50
    upload_dir: str = "uploads"

    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> List[str]:
        """Parse CORS origins from JSON string or list."""
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://localhost:3000"]

    @property
    def database_url(self) -> str:
        """MySQL connection URL with properly escaped credentials."""
        user = quote_plus(self.db_user) if self.db_user else ""
        password_part = f":{quote_plus(self.db_password)}" if self.db_password else ""
        return (
            f"mysql+pymysql://{user}{password_part}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def sqlite_url(self) -> str:
        """SQLite fallback connection URL."""
        db_path = Path(__file__).resolve().parent.parent.parent / "data" / "tourism_dw.sqlite"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"

    @property
    def max_upload_size_bytes(self) -> int:
        """Maximum upload size in bytes."""
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        """Absolute path for file uploads."""
        path = Path(__file__).resolve().parent.parent.parent / self.upload_dir
        path.mkdir(parents=True, exist_ok=True)
        return path


# Global settings singleton
settings = Settings()
