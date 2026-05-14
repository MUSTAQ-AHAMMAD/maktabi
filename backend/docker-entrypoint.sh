#!/bin/sh
set -e

echo "=========================================="
echo "Starting Maktabi Backend"
echo "=========================================="

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy
if [ $? -eq 0 ]; then
  echo "✓ Migrations completed successfully"
else
  echo "✗ Migrations failed"
  exit 1
fi

# Run seed script (optional - don't fail if it errors)
echo "Running database seed..."
if node dist/prisma/seed.js; then
  echo "✓ Database seeded successfully"
else
  echo "⚠ Seed failed or data already exists (this is usually fine)"
fi

# Start the application
echo "Starting NestJS application..."
exec node dist/src/main
