#!/bin/bash

# Gym CRM - View Logs
# Quick access to application logs

BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ ! -d "logs" ]; then
    mkdir -p logs
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     Gym CRM - Development Logs      ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

if [ "$1" = "backend" ]; then
    echo -e "${CYAN}Showing backend logs (Ctrl+C to exit)...${NC}"
    echo ""
    tail -f logs/backend.log
elif [ "$1" = "frontend" ]; then
    echo -e "${CYAN}Showing frontend logs (Ctrl+C to exit)...${NC}"
    echo ""
    tail -f logs/frontend.log
else
    echo -e "${CYAN}Showing all logs (Ctrl+C to exit)...${NC}"
    echo ""
    tail -f logs/*.log
fi
