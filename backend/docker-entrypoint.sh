#!/bin/sh
set -e

# ============================================================================
# Maktabi Backend Docker Entrypoint Script
# ============================================================================
# This script performs database migrations and starts the NestJS application
# It includes defensive validation to prevent common Docker issues
# ============================================================================

echo "=========================================="
echo "Maktabi Backend Container Starting"
echo "=========================================="

# Pre-flight validation checks
echo "🔍 Running pre-flight validation..."
echo "Current directory: $(pwd)"
echo "Current user: $(whoami)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Verify critical files exist
echo ""
echo "📂 Verifying application structure..."
if [ ! -f "dist/src/main.js" ]; then
  echo "❌ ERROR: Application main file not found at dist/src/main.js"
  echo "📁 Contents of /app:"
  ls -la /app
  echo ""
  echo "📁 Contents of /app/dist:"
  ls -la /app/dist || echo "dist directory does not exist"
  exit 1
fi
echo "✅ Application main file found"

if [ ! -d "node_modules" ]; then
  echo "❌ ERROR: node_modules directory not found"
  ls -la /app
  exit 1
fi
echo "✅ node_modules directory found"

if [ ! -d "prisma" ]; then
  echo "❌ ERROR: prisma directory not found"
  ls -la /app
  exit 1
fi
echo "✅ Prisma directory found"

# Verify Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
  echo "⚠️  WARNING: Prisma client may not be properly generated"
  echo "Attempting to generate Prisma client..."
  npx prisma generate || echo "⚠️  Prisma generate failed (may be okay if already generated)"
fi

echo ""
echo "=========================================="
echo "Starting Maktabi Backend Application"
echo "=========================================="

# Run Prisma migrations
echo ""
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy
if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migrations failed"
  exit 1
fi

# Run seed script (optional - don't fail if it errors)
echo ""
echo "🌱 Running database seed..."
if node dist/prisma/seed.js; then
  echo "✅ Database seeded successfully"
else
  echo "⚠️  Seed failed or data already exists (this is usually fine)"
fi

# Start the application
echo ""
echo "=========================================="
echo "🚀 Starting NestJS application..."
echo "=========================================="
exec node dist/src/main
