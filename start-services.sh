#!/bin/bash

# Air Charters Microservices Startup Script
# Usage: ./start-services.sh

set -e

echo "🚀 Starting Air Charters Microservices..."
echo "=========================================="

# Check if Redis is running
echo "📡 Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running!"
    echo "   Start Redis with: redis-server"
    echo "   Or install with: brew install redis"
    exit 1
fi
echo "✅ Redis is running"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "   Copy .env.example to .env and configure it"
    exit 1
fi
echo "✅ .env file found"

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🎯 Starting services..."
echo "=========================================="
echo ""

# Start all services using concurrently
npm run start:all

# If the above fails, try this approach:
# npm run start:user-service &
# npm run start:charter-service &
# npm run start:api-gateway &
# wait

