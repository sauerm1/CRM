#!/bin/bash

# Quick Start Script - Simple Go API + Frontend
# Use this for the simple REST API setup

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Simple Go API + Frontend${NC}"
echo ""

# Create logs directory
mkdir -p logs

# Stop existing services
echo -e "${YELLOW}→ Stopping existing services...${NC}"
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "go run main.go" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Check MongoDB
echo -e "${BLUE}→ Checking MongoDB...${NC}"
if ! pgrep -f "mongod" > /dev/null; then
    echo -e "${YELLOW}  Starting MongoDB...${NC}"
    brew services start mongodb-community 2>/dev/null || true
    sleep 3
fi

if pgrep -f "mongod" > /dev/null; then
    echo -e "${GREEN}  ✓ MongoDB is running${NC}"
else
    echo -e "${RED}  ✗ MongoDB is not running${NC}"
    echo -e "${YELLOW}  Start it with: brew services start mongodb-community${NC}"
    exit 1
fi

# Start Backend
echo -e "${BLUE}→ Starting Backend...${NC}"
cd backend
nohup go run main.go > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.backend.pid
echo -e "${GREEN}  ✓ Backend starting (PID: $BACKEND_PID)${NC}"
cd ..

# Wait for backend
echo -n "${BLUE}→ Waiting for backend"
for i in {1..20}; do
    if curl -s http://localhost:8080/health >/dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# Check if backend is actually running
if curl -s http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend ready on http://localhost:8080${NC}"
else
    echo -e "${RED}  ✗ Backend failed to start${NC}"
    echo -e "${YELLOW}  Check logs: tail -f logs/backend.log${NC}"
    exit 1
fi

# Start Frontend
echo -e "${BLUE}→ Starting Frontend...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  Installing dependencies...${NC}"
    npm install
fi

nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.frontend.pid
echo -e "${GREEN}  ✓ Frontend starting (PID: $FRONTEND_PID)${NC}"
cd ..

# Wait for frontend
echo -n "${BLUE}→ Waiting for frontend"
for i in {1..30}; do
    if lsof -i :3000 >/dev/null 2>&1; then
        sleep 2
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ All Services Running Successfully! ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:8080"
echo -e "  ${BLUE}API Docs:${NC}  See README.md for endpoints"
echo ""
echo -e "  ${YELLOW}View Logs:${NC}"
echo -e "    Backend:  tail -f logs/backend.log"
echo -e "    Frontend: tail -f logs/frontend.log"
echo ""
echo -e "  ${YELLOW}Stop Services:${NC}"
echo -e "    ./stop.sh"
echo ""
echo -e "${GREEN}🎉 Ready!${NC}"
