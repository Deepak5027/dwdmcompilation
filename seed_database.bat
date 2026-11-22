@echo off
title Smart Tourism Intelligence - Data Seeder
echo ======================================================================
echo SMART TOURISM INTELLIGENCE AND VISITOR ANALYTICS PLATFORM
echo Seeding Tamil Nadu Benchmark Tourism Telemetry & Reviews
echo ======================================================================
echo.
cd /d "%~dp0backend"
python data/seed.py
echo.
echo Database seeding finished.
pause

