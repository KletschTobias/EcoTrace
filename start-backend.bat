@echo off
echo ========================================
echo Starting EcoTrace Backend (Quarkus)
echo ========================================
echo.

:: Set JAVA_HOME to Java 21
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: Verify Java version
echo Checking Java version...
java -version
echo.

:: Navigate to backend directory
cd /d "%~dp0backend\EcoTrace-E.T"

echo Starting Quarkus in development mode...
echo This will download dependencies on first run (may take 2-3 minutes)
echo.
echo Backend will be available at: http://localhost:8080
echo Swagger UI: http://localhost:8080/q/swagger-ui
echo.

:: Start Quarkus
call mvnw.cmd clean quarkus:dev

pause
