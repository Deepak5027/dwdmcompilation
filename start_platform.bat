@echo off
title Smart Tourism Intelligence Platform Launcher
echo ======================================================================
echo SMART TOURISM INTELLIGENCE AND VISITOR ANALYTICS PLATFORM
echo Launching Full-Stack Services [MySQL 8.0 + FastAPI + React Vite]
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "Tourism Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting React Vite Frontend on http://localhost:5173 ...
start "Tourism Frontend (Vite)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Opening Platform in default browser...
start http://localhost:5173/

echo.
echo ======================================================================
echo Both services are now running!
echo Visit: http://localhost:5173/
echo ======================================================================
pause

