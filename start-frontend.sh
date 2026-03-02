#!/bin/bash

echo "========================================"
echo "Starting EcoTrace Frontend (Angular)"
echo "========================================"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend/project"

echo "Installing/checking dependencies..."
npm install
echo ""

echo "Starting Angular development server..."
echo "Frontend will be available at: http://localhost:4200"
echo ""

# Start Angular
npm start
