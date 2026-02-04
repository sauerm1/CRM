#!/bin/bash

# Gym CRM - Check Status of All Services

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_port() {
    lsof -i :$1 >/dev/null 2>&1
}

check_service() {
    if curl -s $1 >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Online${NC}"
        return 0
    else
        echo -e "${RED}✗ Offline${NC}"
        return 1
    fi
}

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     Gym CRM - Service Status        ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# MongoDB
echo -n -e "${YELLOW}MongoDB:${NC}        "
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not Running${NC}"
fi

# Backend
echo -n -e "${YELLOW}Backend:${NC}        "
if check_port 8080; then
    check_service "http://localhost:8080/health"
else
    echo -e "${RED}✗ Not Running${NC}"
fi

# Frontend
echo -n -e "${YELLOW}Frontend:${NC}       "
if check_port 3000; then
    check_service "http://localhost:3000"
else
    echo -e "${RED}✗ Not Running${NC}"
fi

echo ""

# Show processes if running
if check_port 8080 || check_port 3000; then
    echo -e "${BLUE}Active Processes:${NC}"
    ps aux | grep -E "(go run main.go|next dev)" | grep -v grep | awk '{printf "  PID %-7s  %s\n", $2, substr($0, index($0,$11))}'
    echo ""
fi

# Show URLs if services are running
SERVICES_UP=0
if check_port 8080; then SERVICES_UP=$((SERVICES_UP + 1)); fi
if check_port 3000; then SERVICES_UP=$((SERVICES_UP + 1)); fi

if [ $SERVICES_UP -gt 0 ]; then
    echo -e "${GREEN}Available URLs:${NC}"
    [ $(check_port 8080; echo $?) -eq 0 ] && echo -e "  Backend:  ${BLUE}http://localhost:8080${NC}"
    [ $(check_port 3000; echo $?) -eq 0 ] && echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
    echo ""
fi
