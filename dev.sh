#!/bin/bash

# Gym CRM - Smart Development Startup
# Handles everything automatically: dependencies, ports, health checks, logging

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
echo -e "${CYAN}"
cat << "EOF"
    ____                 __________  __  ___
   / __ \___ _   __     / ____/ __ \/  |/  /
  / / / / _ \ | / /    / /   / /_/ / /|_/ / 
 / /_/ /  __/ |/ /    / /___/ _, _/ /  / /  
/_____/\___/|___/     \____/_/ |_/_/  /_/   
                                             
   🏋️  Gym Member Management System
EOF
echo -e "${NC}"

# Create logs directory
mkdir -p logs

# Check if running
check_port() {
    lsof -i :$1 >/dev/null 2>&1
}

# Stop existing services
echo -e "${YELLOW}→${NC} Checking for existing services..."
if check_port 8080; then
    echo -e "${YELLOW}  Stopping backend on :8080${NC}"
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if check_port 3000; then
    echo -e "${YELLOW}  Stopping frontend on :3000${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    sleep 1
fi

# Check MongoDB
echo -e "${BLUE}→${NC} Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}  MongoDB not running, attempting to start...${NC}"
    
    if command -v brew &> /dev/null; then
        brew services start mongodb-community &>/dev/null || true
        sleep 3
        
        if pgrep -x "mongod" > /dev/null; then
            echo -e "${GREEN}  ✓ MongoDB started${NC}"
        else
            echo -e "${RED}  ✗ Failed to start MongoDB${NC}"
            echo -e "${YELLOW}  Please start MongoDB manually: brew services start mongodb-community${NC}"
            exit 1
        fi
    else
        echo -e "${RED}  ✗ Homebrew not found${NC}"
        echo -e "${YELLOW}  Please install and start MongoDB manually${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}  ✓ MongoDB is running${NC}"
fi

# Start Backend
echo -e "${BLUE}→${NC} Starting Backend (Go API)..."
cd backend

# Check .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}  Creating .env from defaults...${NC}"
    cat > .env << 'ENVEOF'
MONGODB_URI=mongodb://localhost:27017
PORT=8080
SESSION_SECRET=dev-secret-change-in-production
SESSION_MAX_AGE=604800
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ENVEOF
    echo -e "${GREEN}  ✓ Created .env${NC}"
fi

# Start backend with nohup for better stability
nohup go run main.go > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${CYAN}  Backend PID: $BACKEND_PID${NC}"
cd ..

# Wait for backend with health check
echo -e "${BLUE}→${NC} Waiting for backend..."
BACKEND_READY=false
for i in {1..30}; do
    if curl -s http://localhost:8080/health >/dev/null 2>&1; then
        BACKEND_READY=true
        echo -e "${GREEN}  ✓ Backend ready on http://localhost:8080${NC}"
        break
    fi
    sleep 1
    printf "."
done
echo ""

if [ "$BACKEND_READY" = false ]; then
    echo -e "${RED}  ✗ Backend failed to start${NC}"
    echo -e "${YELLOW}  Check logs: tail -f logs/backend.log${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start Frontend
echo -e "${BLUE}→${NC} Starting Frontend (Next.js)..."
cd frontend

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  Installing dependencies (this may take a few minutes)...${NC}"
    npm install --silent
    echo -e "${GREEN}  ✓ Dependencies installed${NC}"
fi

# Clean .next directory (prevents build cache issues)
if [ -d ".next" ]; then
    echo -e "${YELLOW}  Cleaning build cache...${NC}"
    rm -rf .next
fi

# Fix common Next.js issues
if [ ! -d "node_modules/@next/swc-darwin-x64" ] && [ "$(uname)" = "Darwin" ]; then
    echo -e "${YELLOW}  Installing Next.js SWC compiler...${NC}"
    npm install --save-optional @next/swc-darwin-x64 --silent
fi

# Start frontend with nohup for better stability
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${CYAN}  Frontend PID: $FRONTEND_PID${NC}"
cd ..

# Wait for frontend with health check
echo -e "${BLUE}→${NC} Waiting for frontend..."
FRONTEND_READY=false
for i in {1..45}; do
    if check_port 3000; then
        # Give it a moment to fully initialize
        sleep 2
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            FRONTEND_READY=true
            echo -e "${GREEN}  ✓ Frontend ready on http://localhost:3000${NC}"
            break
        fi
    fi
    sleep 1
    printf "."
done
echo ""

if [ "$FRONTEND_READY" = false ]; then
    echo -e "${RED}  ✗ Frontend failed to start${NC}"
    echo -e "${YELLOW}  Check logs: tail -f logs/frontend.log${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

# Success!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                                                ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}     ${GREEN}✓${NC} All Services Running Successfully!     ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${MAGENTA}Services:${NC}"
echo -e "    ${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "    ${BLUE}Backend:${NC}   http://localhost:8080"
echo -e "    ${BLUE}Health:${NC}    http://localhost:8080/health"
echo ""
echo -e "  ${MAGENTA}Logs:${NC}"
echo -e "    ${CYAN}Backend:${NC}   tail -f logs/backend.log"
echo -e "    ${CYAN}Frontend:${NC}  tail -f logs/frontend.log"
echo -e "    ${CYAN}Both:${NC}      tail -f logs/*.log"
echo ""
echo -e "  ${MAGENTA}Quick Commands:${NC}"
echo -e "    ${CYAN}Stop:${NC}      ./stop-dev.sh"
echo -e "    ${CYAN}Restart:${NC}   ./stop-dev.sh && ./dev.sh"
echo -e "    ${CYAN}Logs:${NC}      ./logs.sh"
echo ""
echo -e "  ${RED}Press Ctrl+C in terminal running processes to stop${NC}"
echo ""

# Store PIDs for later reference
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo -e "${GREEN}🚀 Ready to develop!${NC}"
echo ""
