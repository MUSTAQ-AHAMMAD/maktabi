#!/bin/bash

# Docker Rebuild Script for Maktabi Project
# Forces a complete rebuild of all Docker images

set -e

echo "🔨 Maktabi Docker Rebuild Script"
echo "================================="
echo ""
echo "This script will:"
echo "  1. Stop all running containers"
echo "  2. Remove old images"
echo "  3. Rebuild images from scratch (no cache)"
echo "  4. Start the services"
echo ""

# Function to check if docker-compose command exists
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    elif docker compose version &> /dev/null 2>&1; then
        echo "docker compose"
    else
        echo "ERROR: Neither 'docker-compose' nor 'docker compose' found."
        exit 1
    fi
}

DOCKER_COMPOSE=$(check_docker_compose)
echo "✓ Using: $DOCKER_COMPOSE"
echo ""

# Step 1: Stop containers
echo "Step 1: Stopping all containers..."
$DOCKER_COMPOSE down || true
echo "✓ Containers stopped"
echo ""

# Step 2: Remove containers
echo "Step 2: Removing containers..."
docker rm -f maktabi_backend maktabi_frontend maktabi_postgres 2>/dev/null || true
echo "✓ Containers removed"
echo ""

# Step 3: Remove images
echo "Step 3: Removing old images..."
docker rmi -f maktabi-backend:latest 2>/dev/null || true
docker rmi -f maktabi-frontend:latest 2>/dev/null || true
# Remove any dangling images from previous builds
docker images -f "dangling=true" -q | xargs -r docker rmi -f 2>/dev/null || true
echo "✓ Old images removed"
echo ""

# Step 4: Rebuild
echo "Step 4: Rebuilding images (no cache)..."
$DOCKER_COMPOSE build --no-cache
echo "✓ Images rebuilt"
echo ""

# Step 5: Start services
echo "Step 5: Starting services..."
$DOCKER_COMPOSE up -d
echo "✓ Services started"
echo ""

# Step 6: Show status
echo "Waiting for services to initialize..."
sleep 5
echo ""
$DOCKER_COMPOSE ps
echo ""

# Step 7: Show logs
echo "Recent logs:"
echo "============"
$DOCKER_COMPOSE logs --tail=20
echo ""

echo "✅ Rebuild complete!"
echo ""
echo "Useful commands:"
echo "  View logs:        $DOCKER_COMPOSE logs -f"
echo "  Check status:     $DOCKER_COMPOSE ps"
echo "  Stop services:    $DOCKER_COMPOSE down"
echo "  Restart service:  $DOCKER_COMPOSE restart backend"
echo ""
