"""
Structured logging configuration for the application.
"""

import logging
import sys
from datetime import datetime, timezone
from pathlib import Path


class StructuredFormatter(logging.Formatter):
    """Custom formatter producing structured log output with timestamp, level, module, and message."""

    def format(self, record: logging.LogRecord) -> str:
        """Format a log record with structured fields."""
        timestamp = datetime.fromtimestamp(record.created, tz=timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%S.%fZ"
        )
        level = record.levelname.ljust(8)
        module = record.module
        func = record.funcName
        lineno = record.lineno
        message = record.getMessage()

        log_line = f"{timestamp} | {level} | {module}:{func}:{lineno} | {message}"

        if record.exc_info and record.exc_info[0] is not None:
            exc_text = self.formatException(record.exc_info)
            log_line = f"{log_line}\n{exc_text}"

        return log_line


def setup_logging(
    log_level: str = "INFO",
    log_dir: str = "logs",
    log_filename: str = "app.log",
) -> logging.Logger:
    """
    Configure application logging with file and console handlers.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
        log_dir: Directory for log files.
        log_filename: Name of the log file.

    Returns:
        The configured root logger.
    """
    # Create log directory
    log_path = Path(__file__).resolve().parent.parent.parent / log_dir
    log_path.mkdir(parents=True, exist_ok=True)

    # Get the root logger for the app
    logger = logging.getLogger("app")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Prevent duplicate handlers if called multiple times
    if logger.handlers:
        return logger

    formatter = StructuredFormatter()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler
    file_handler = logging.FileHandler(
        log_path / log_filename, encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Suppress noisy third-party loggers
    for noisy_logger in ["uvicorn.access", "sqlalchemy.engine", "matplotlib"]:
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)

    return logger


# Initialize application logger
logger = setup_logging()
