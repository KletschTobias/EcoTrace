@echo off
echo ========================================
echo Starting EcoTrace Frontend (Angular)
echo ========================================
echo.

:: Navigate to frontend directory
cd /d "%~dp0frontend\project"

echo Installing/checking dependencies...
call npm install
echo.

echo Starting Angular development server...
echo Frontend will be available at: http://localhost:4200
echo.

:: Start Angular
call npm start

pause
