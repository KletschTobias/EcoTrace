@echo off
cls
echo ========================================
echo   EcoTrace - Complete Setup
echo ========================================
echo.

:: Check Docker
echo [1/4] Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and run this script again.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

:: Check PostgreSQL
echo [2/4] Checking PostgreSQL...
docker ps | findstr "postgres-eco-tracker" >nul
if %errorlevel% neq 0 (
    echo Starting PostgreSQL...
    cd backend\EcoTrace-E.T\docker
    docker-compose up -d
    cd ..\..\..
    timeout /t 5 /nobreak >nul
)
echo [OK] PostgreSQL is running
echo.

:: Set Java 21
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: Start Backend
echo [3/4] Starting Backend (Quarkus)...
echo This will open a new window for the backend.
echo Wait for "Quarkus started" message before using the app.
echo.
start "EcoTrace Backend" cmd /k "cd backend\EcoTrace-E.T && mvnw.cmd quarkus:dev"
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [4/4] Starting Frontend (Angular)...
echo This will open a new window for the frontend.
echo Wait for "Local: http://localhost:4200/" message.
echo.
start "EcoTrace Frontend" cmd /k "cd frontend\project && npm start"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Backend is starting on: http://localhost:8080
echo Frontend is starting on: http://localhost:4200
echo.
echo Check the two new CMD windows for progress.
echo Once both show "started", open http://localhost:4200 in your browser.
echo.
echo Demo account:
echo   Email: demo@ecotrace.com
echo   Password: demo123
echo.
pause
