#!/bin/bash
#
# Docker Rebuild Script for Maktabi
# This script completely rebuilds Docker images without cache to fix persistent issues
#

set -e

echo "========================================"
echo "Maktabi Docker Complete Rebuild"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Stopping all containers...${NC}"
docker-compose down
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo -e "${YELLOW}Step 2: Removing Maktabi images...${NC}"
# Remove images if they exist (don't fail if they don't)
docker rmi maktabi-backend:latest 2>/dev/null || echo "  Backend image not found (OK)"
docker rmi maktabi-frontend:latest 2>/dev/null || echo "  Frontend image not found (OK)"
echo -e "${GREEN}✓ Images removed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Rebuilding images without cache...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Images rebuilt${NC}"
echo ""

echo -e "${YELLOW}Step 4: Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo "========================================"
echo -e "${GREEN}✓ Rebuild complete!${NC}"
echo "========================================"
echo ""
echo "Checking service status..."
docker-compose ps
echo ""
echo "To view logs, run:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo ""
echo "Services should be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Swagger:  http://localhost:3001/api/docs"
