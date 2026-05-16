#!/bin/bash
# ============================================================================
# Quick Docker Fix Script
# ============================================================================
# Run this if you encounter "exec /app/docker-entrypoint.sh: no such file"
# ============================================================================

set -e

echo "🔧 Docker Quick Fix Script"
echo "=========================="
echo ""

# Fix line endings
echo "1. Fixing line endings..."
if command -v dos2unix &> /dev/null; then
    dos2unix backend/docker-entrypoint.sh 2>/dev/null || true
    echo "✅ Line endings fixed with dos2unix"
else
    sed -i 's/\r$//' backend/docker-entrypoint.sh
    echo "✅ Line endings fixed with sed"
fi

# Make executable
echo ""
echo "2. Making script executable..."
chmod +x backend/docker-entrypoint.sh
echo "✅ Script is now executable"

# Validate
echo ""
echo "3. Running validation..."
./docker-validate.sh

# Clean rebuild
echo ""
echo "4. Cleaning Docker environment..."
docker-compose down -v
docker system prune -f

# Build
echo ""
echo "5. Building Docker images..."
docker-compose build --no-cache

# Start
echo ""
echo "6. Starting containers..."
docker-compose up -d

# Check logs
echo ""
echo "7. Checking backend logs..."
sleep 5
docker logs maktabi_backend

echo ""
echo "✅ Done! Check logs above for any errors."
echo "   If backend started successfully, visit http://localhost:3001"
