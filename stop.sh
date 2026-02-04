#!/bin/bash

# Stop all services

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}Stopping all services...${NC}"

# Stop by PID files if they exist
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo -e "${GREEN}✓ Stopped backend (PID: $BACKEND_PID)${NC}" || true
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo -e "${GREEN}✓ Stopped frontend (PID: $FRONTEND_PID)${NC}" || true
    rm .frontend.pid
fi

# Force kill by port as backup
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Killed processes on port 8080${NC}" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Killed processes on port 3000${NC}" || true

# Kill by process name
pkill -f "go run main.go" 2>/dev/null && echo -e "${GREEN}✓ Killed Go processes${NC}" || true
pkill -f "next dev" 2>/dev/null && echo -e "${GREEN}✓ Killed Next.js processes${NC}" || true

echo -e "${GREEN}All services stopped${NC}"
