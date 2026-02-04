#!/bin/bash

# Seed database with mock data using API calls

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🌱 Seeding database with mock data...${NC}"
echo ""

# Check if backend is running
if ! curl -s http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${RED}✗ Backend is not running${NC}"
    echo -e "${YELLOW}Start it with: ./start.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Array of items to create
declare -a items=(
    '{"name":"Laptop","description":"High-performance laptop for development","price":1299.99}'
    '{"name":"Wireless Mouse","description":"Ergonomic wireless mouse with precision tracking","price":29.99}'
    '{"name":"Mechanical Keyboard","description":"RGB mechanical keyboard with Cherry MX switches","price":149.99}'
    '{"name":"USB-C Hub","description":"7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader","price":49.99}'
    '{"name":"Monitor","description":"27-inch 4K monitor with HDR support","price":399.99}'
    '{"name":"Headphones","description":"Noise-cancelling wireless headphones","price":249.99}'
    '{"name":"Webcam","description":"1080p HD webcam with auto-focus","price":79.99}'
    '{"name":"Standing Desk","description":"Electric standing desk with memory presets","price":599.99}'
    '{"name":"Desk Lamp","description":"LED desk lamp with adjustable brightness","price":39.99}'
    '{"name":"External SSD","description":"1TB portable SSD with USB-C connection","price":129.99}'
)

# Create each item
count=0
for item in "${items[@]}"; do
    response=$(curl -s -X POST http://localhost:8080/api/items \
        -H "Content-Type: application/json" \
        -d "$item")
    
    if [ $? -eq 0 ]; then
        ((count++))
        echo -e "${GREEN}✓${NC} Created item $count/10"
    else
        echo -e "${RED}✗${NC} Failed to create item"
    fi
done

echo ""
echo -e "${GREEN}🎉 Database seeding complete!${NC}"
echo -e "   Created ${BLUE}$count${NC} items"
echo ""
echo -e "View items:"
echo -e "  ${YELLOW}curl http://localhost:8080/api/items${NC}"
echo -e "  ${YELLOW}open http://localhost:8080/api/items${NC}"
echo ""
