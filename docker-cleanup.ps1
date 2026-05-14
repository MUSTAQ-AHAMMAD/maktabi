# Docker Cleanup Script for Maktabi Project (PowerShell)
# Safely stops and removes containers, images, and volumes

Write-Host "🧹 Maktabi Docker Cleanup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "ERROR: Docker is not running or not installed." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Stopping all containers..." -ForegroundColor Yellow
docker-compose down 2>$null
docker-compose -f docker-compose.db-only.yml down 2>$null

Write-Host ""
Write-Host "Step 2: Removing containers..." -ForegroundColor Yellow
docker rm -f maktabi_backend maktabi_frontend maktabi_postgres 2>$null

Write-Host ""
Write-Host "Step 3: Removing images..." -ForegroundColor Yellow
docker rmi maktabi-backend:latest maktabi-frontend:latest 2>$null

Write-Host ""
Write-Host "Step 4: Removing volumes (optional)..." -ForegroundColor Yellow
$response = Read-Host "Do you want to remove volumes (this will delete all database data)? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    docker volume rm maktabi_postgres_data 2>$null
    Write-Host "✓ Volumes removed" -ForegroundColor Green
} else {
    Write-Host "✓ Volumes kept" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 5: Pruning unused Docker resources..." -ForegroundColor Yellow
docker system prune -f

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start fresh, run:" -ForegroundColor Cyan
Write-Host "  docker-compose up -d"
Write-Host ""
Write-Host "Or for database only:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.db-only.yml up -d"
