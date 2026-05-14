#!/bin/bash

# Docker Cleanup Script for Maktabi Project
# Safely stops and removes containers, images, and volumes

echo "🧹 Maktabi Docker Cleanup Script"
echo "================================="
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

echo "Step 1: Stopping all containers..."
$DOCKER_COMPOSE down
$DOCKER_COMPOSE -f docker-compose.db-only.yml down 2>/dev/null || true

echo ""
echo "Step 2: Removing containers..."
docker rm -f maktabi_backend maktabi_frontend maktabi_postgres 2>/dev/null || true

echo ""
echo "Step 3: Removing images..."
docker rmi maktabi-backend:latest maktabi-frontend:latest 2>/dev/null || true

echo ""
echo "Step 4: Removing volumes (optional)..."
read -p "Do you want to remove volumes (this will delete all database data)? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    docker volume rm maktabi_postgres_data 2>/dev/null || true
    echo "✓ Volumes removed"
else
    echo "✓ Volumes kept"
fi

echo ""
echo "Step 5: Pruning unused Docker resources..."
docker system prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To start fresh, run:"
echo "  docker-compose up -d"
echo ""
echo "Or for database only:"
echo "  docker-compose -f docker-compose.db-only.yml up -d"
