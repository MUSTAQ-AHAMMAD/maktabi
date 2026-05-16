#!/bin/bash
set -e

echo "============================================"
echo "QUICK FIX for docker-entrypoint.sh error"
echo "============================================"
echo ""
echo "This will fix the 'exec /app/docker-entrypoint.sh: no such file or directory' error"
echo ""

# Stop containers
echo "→ Stopping containers..."
docker-compose down 2>/dev/null || docker stop maktabi_backend 2>/dev/null || true

# Remove ONLY the backend image to force rebuild
echo "→ Removing old backend image..."
docker rmi maktabi-backend:latest 2>/dev/null || true
docker rmi backend-backend:latest 2>/dev/null || true
docker images | grep -E 'backend.*backend|maktabi.*backend' | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# Rebuild ONLY backend (faster than full rebuild)
echo "→ Rebuilding backend image..."
cd "$(dirname "$0")"
docker-compose build --no-cache backend

# Start containers
echo "→ Starting containers..."
docker-compose up -d

# Show backend logs
echo ""
echo "============================================"
echo "Backend is starting... Showing logs:"
echo "============================================"
sleep 2
docker-compose logs -f backend
