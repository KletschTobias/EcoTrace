#!/bin/bash

echo "========================================"
echo "Starting EcoTrace Backend (Quarkus)"
echo "========================================"
echo ""

# Check Java version
echo "Checking Java version..."
java -version
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend/EcoTrace-E.T"

echo "Starting Quarkus in development mode..."
echo "This will download dependencies on first run (may take 2-3 minutes)"
echo ""
echo "Backend will be available at: http://localhost:8080"
echo "Swagger UI: http://localhost:8080/q/swagger-ui"
echo ""

# Start Quarkus
./mvnw clean quarkus:dev
