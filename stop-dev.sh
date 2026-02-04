#!/bin/bash

# Gym CRM - Stop All Development Services

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}   Stopping Gym CRM Services...      ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Kill processes by port
STOPPED=0

if lsof -i:8080 >/dev/null 2>&1; then
    echo -e "${YELLOW}→${NC} Stopping backend (port 8080)..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}  ✓ Backend stopped${NC}"
    STOPPED=$((STOPPED + 1))
fi

if lsof -i:3000 >/dev/null 2>&1; then
    echo -e "${YELLOW}→${NC} Stopping frontend (port 3000)..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}  ✓ Frontend stopped${NC}"
    STOPPED=$((STOPPED + 1))
fi

# Kill any remaining processes
pkill -f "go run main.go" 2>/dev/null && STOPPED=$((STOPPED + 1))
pkill -f "npm run dev" 2>/dev/null && STOPPED=$((STOPPED + 1))
pkill -f "next dev" 2>/dev/null && STOPPED=$((STOPPED + 1))

# Remove PID files
rm -f .backend.pid .frontend.pid 2>/dev/null

if [ $STOPPED -gt 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All services stopped ($STOPPED processes)${NC}"
else
    echo -e "${YELLOW}⚠ No services were running${NC}"
fi

echo ""
