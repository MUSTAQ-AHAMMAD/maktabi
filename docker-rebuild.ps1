# Docker Rebuild Script for Maktabi (PowerShell)
# This script completely rebuilds Docker images without cache to fix persistent issues

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Maktabi Docker Complete Rebuild" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Stopping all containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✓ Containers stopped" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Removing Maktabi images..." -ForegroundColor Yellow
# Remove images if they exist (don't fail if they don't)
try {
    docker rmi maktabi-backend:latest 2>$null
} catch {
    Write-Host "  Backend image not found (OK)" -ForegroundColor Gray
}
try {
    docker rmi maktabi-frontend:latest 2>$null
} catch {
    Write-Host "  Frontend image not found (OK)" -ForegroundColor Gray
}
Write-Host "✓ Images removed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Rebuilding images without cache..." -ForegroundColor Yellow
docker-compose build --no-cache
Write-Host "✓ Images rebuilt" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Starting services..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✓ Services started" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Rebuild complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking service status..."
docker-compose ps
Write-Host ""
Write-Host "To view logs, run:"
Write-Host "  docker-compose logs -f backend"
Write-Host "  docker-compose logs -f frontend"
Write-Host ""
Write-Host "Services should be available at:"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:3001"
Write-Host "  Swagger:  http://localhost:3001/api/docs"
