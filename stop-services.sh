#!/bin/bash

# Air Charters Microservices Shutdown Script
# Usage: ./stop-services.sh

echo "🛑 Stopping Air Charters Microservices..."

# Kill all Node.js processes running our services
pkill -f "nest start" || true

# Alternative: Kill by port
# lsof -ti:5008 | xargs kill -9 2>/dev/null || true
# lsof -ti:3001 | xargs kill -9 2>/dev/null || true
# lsof -ti:3004 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"

