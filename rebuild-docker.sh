#!/bin/bash
set -e

echo "=========================================="
echo "Rebuilding Maktabi Docker Containers"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Stop all running containers"
echo "2. Remove old containers and images"
echo "3. Rebuild from scratch"
echo "4. Start fresh containers"
echo ""

# Stop and remove containers
echo "→ Stopping containers..."
docker-compose down

# Remove old images to force rebuild
echo "→ Removing old images..."
docker rmi maktabi-backend:latest 2>/dev/null || true
docker rmi maktabi-frontend:latest 2>/dev/null || true
docker images | grep 'maktabi' | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# Rebuild without cache
echo "→ Building fresh images (this may take a few minutes)..."
docker-compose build --no-cache

# Start containers
echo "→ Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "→ Waiting for services to start..."
sleep 5

# Show status
echo ""
echo "=========================================="
echo "Container Status"
echo "=========================================="
docker-compose ps

echo ""
echo "✓ Rebuild complete!"
echo ""
echo "Check logs with:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo ""
echo "Access services at:"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo ""
