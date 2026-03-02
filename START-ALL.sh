#!/bin/bash

clear
echo "========================================"
echo "  EcoTrace - Complete Setup"
echo "========================================"
echo ""

# Check Docker
echo "[1/4] Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and run this script again."
    exit 1
fi
echo "[OK] Docker is running"
echo ""

# Check PostgreSQL
echo "[2/4] Checking PostgreSQL..."
if ! docker ps | grep -q "postgres-eco-tracker"; then
    echo "Starting PostgreSQL..."
    cd backend/EcoTrace-E.T/docker
    docker-compose up -d
    cd ../../..
    sleep 5
fi
echo "[OK] PostgreSQL is running"
echo ""

# Start Backend
echo "[3/4] Starting Backend (Quarkus)..."
echo "This will open a new terminal for the backend."
echo "Wait for 'Quarkus started' message before using the app."
echo ""
gnome-terminal --title="EcoTrace Backend" -- bash -c "cd backend/EcoTrace-E.T && ./mvnw quarkus:dev; exec bash" &
sleep 3

# Start Frontend
echo "[4/4] Starting Frontend (Angular)..."
echo "This will open a new terminal for the frontend."
echo "Wait for 'Local: http://localhost:4200/' message."
echo ""
gnome-terminal --title="EcoTrace Frontend" -- bash -c "cd frontend/project && npm start; exec bash" &

echo ""
echo "========================================"
echo "  Services Starting..."
echo "========================================"
echo "Backend:  http://localhost:8080"
echo "Swagger:  http://localhost:8080/q/swagger-ui"
echo "Frontend: http://localhost:4200"
echo ""
echo "Press Ctrl+C in each terminal to stop the services."
