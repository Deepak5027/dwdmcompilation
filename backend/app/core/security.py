"""
File validation and security utilities for upload handling.
"""

import os
import re
import unicodedata
from pathlib import Path
from typing import Optional, Tuple

from fastapi import UploadFile

from app.core.config import settings

# Allowed file extensions and their MIME types
ALLOWED_EXTENSIONS = {".csv", ".xlsx"}
ALLOWED_MIME_TYPES = {
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/octet-stream",
    "text/plain",
}


async def validate_upload_file(file: UploadFile) -> Tuple[bool, Optional[str]]:
    """
    Validate an uploaded file for security and correctness.

    Checks file extension, MIME type, and size constraints.

    Args:
        file: The uploaded file from FastAPI.

    Returns:
        Tuple of (is_valid, error_message).
    """
    if not file.filename:
        return False, "No filename provided"

    # Check file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type '{ext}' not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"

    # Check MIME type
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        return False, f"MIME type '{file.content_type}' not allowed"

    # Check file size by reading content
    content = await file.read()
    file_size = len(content)
    await file.seek(0)  # Reset file pointer

    if file_size == 0:
        return False, "File is empty"

    if file_size > settings.max_upload_size_bytes:
        return False, (
            f"File size ({file_size / (1024 * 1024):.1f} MB) exceeds "
            f"maximum allowed size ({settings.max_upload_size_mb} MB)"
        )

    return True, None


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent path traversal and special character issues.

    Args:
        filename: The original filename.

    Returns:
        A sanitized, safe filename.
    """
    if not filename:
        return "unnamed_file"

    # Normalize unicode characters
    filename = unicodedata.normalize("NFKD", filename)

    # Get just the basename (prevent path traversal)
    filename = os.path.basename(filename)

    # Remove null bytes
    filename = filename.replace("\x00", "")

    # Split name and extension
    name, ext = os.path.splitext(filename)

    # Remove any characters that aren't alphanumeric, hyphens, underscores, or dots
    name = re.sub(r"[^\w\-.]", "_", name)

    # Remove leading/trailing dots and spaces
    name = name.strip(". ")

    # Collapse multiple underscores
    name = re.sub(r"_+", "_", name)

    # Ensure we have a name
    if not name:
        name = "unnamed_file"

    # Limit length
    if len(name) > 200:
        name = name[:200]

    return f"{name}{ext.lower()}"


def validate_file_content(filepath: str) -> Tuple[bool, Optional[str]]:
    """
    Perform basic content validation on a file.

    Checks that the file is readable and contains expected data format.

    Args:
        filepath: Path to the file to validate.

    Returns:
        Tuple of (is_valid, error_message).
    """
    path = Path(filepath)

    if not path.exists():
        return False, f"File not found: {filepath}"

    if not path.is_file():
        return False, f"Path is not a file: {filepath}"

    if path.stat().st_size == 0:
        return False, "File is empty"

    ext = path.suffix.lower()

    if ext == ".csv":
        return _validate_csv_content(path)
    elif ext == ".xlsx":
        return _validate_xlsx_content(path)
    else:
        return False, f"Unsupported file type: {ext}"


def _validate_csv_content(path: Path) -> Tuple[bool, Optional[str]]:
    """Validate CSV file content."""
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            first_line = f.readline()
            if not first_line.strip():
                return False, "CSV file has no header row"

            # Check that it has at least one delimiter
            if "," not in first_line and "\t" not in first_line and ";" not in first_line:
                return False, "CSV file does not appear to contain delimited data"

            # Try to read a second line to confirm data exists
            second_line = f.readline()
            if not second_line.strip():
                return False, "CSV file has a header but no data rows"

        return True, None
    except UnicodeDecodeError:
        return False, "File encoding is not valid UTF-8"
    except Exception as e:
        return False, f"Error reading CSV file: {str(e)}"


def _validate_xlsx_content(path: Path) -> Tuple[bool, Optional[str]]:
    """Validate Excel file content."""
    try:
        import openpyxl

        wb = openpyxl.load_workbook(path, read_only=True)
        ws = wb.active
        if ws is None:
            wb.close()
            return False, "Excel file has no active worksheet"

        rows = list(ws.iter_rows(max_row=2))
        wb.close()

        if len(rows) == 0:
            return False, "Excel file has no data"

        if len(rows) < 2:
            return False, "Excel file has a header but no data rows"

        return True, None
    except Exception as e:
        return False, f"Error reading Excel file: {str(e)}"
