@echo off
title Smart Tourism Intelligence - Backend API
echo ======================================================================
echo SMART TOURISM INTELLIGENCE AND VISITOR ANALYTICS PLATFORM
echo Backend API Server [FastAPI / Uvicorn]
echo ======================================================================
echo.
cd /d "%~dp0backend"
echo Initializing database and starting server on http://localhost:8000 ...
python -m uvicorn app.main:app --reload --port 8000
pause

