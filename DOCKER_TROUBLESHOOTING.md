# Docker Troubleshooting Guide

## "exec ./docker-entrypoint.sh: no such file or directory" Error

If you see this error repeating continuously in your Docker logs, it means the container cannot execute the entrypoint script. This guide will help you fix it.

### Root Causes

This error typically occurs due to one of these issues:

1. **Stale/Cached Docker Image** - You're running an old image that has issues
2. **Windows Line Endings (CRLF)** - The script was created on Windows with CRLF line endings instead of Unix LF
3. **Missing Interpreter** - The shell specified in the shebang (`#!/bin/sh`) doesn't exist in the container
4. **Non-executable Script** - The script doesn't have execute permissions

### Solution

Follow these steps to fix the issue:

#### 1. Clean Up Old Docker Resources

First, remove all old containers, images, and build cache:

```bash
# Stop and remove all containers
docker-compose down

# Remove the specific backend image
docker rmi maktabi-backend:latest

# Remove ALL unused images and build cache (CAUTION: This affects all Docker images)
docker system prune -a --volumes

# Or be more selective - just remove maktabi images
docker images | grep maktabi | awk '{print $3}' | xargs docker rmi -f
```

#### 2. Rebuild from Scratch

Build the images completely from scratch without using cache:

```bash
# Rebuild without cache
docker-compose build --no-cache

# Start the services
docker-compose up -d
```

#### 3. Verify the Fix

Check if the container is running properly:

```bash
# Check container status
docker-compose ps

# Check logs for the backend
docker-compose logs backend

# You should see:
# ==========================================
# Starting Maktabi Backend
# ==========================================
# Running Prisma migrations...
```

### What Was Fixed

The following changes have been made to prevent this issue:

1. **`.gitattributes` file added** - Forces all shell scripts to use Unix (LF) line endings, even when edited on Windows
2. **Dockerfile validation** - Added build-time validation to ensure:
   - The script exists and is executable
   - The script has proper Unix line endings (no CRLF)
3. **Absolute path for ENTRYPOINT** - Changed from `./docker-entrypoint.sh` to `/app/docker-entrypoint.sh` to avoid path resolution issues

### Prevention

To prevent this issue in the future:

1. **Always rebuild after pulling changes:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **On Windows, ensure Git is configured to handle line endings:**
   ```bash
   git config --global core.autocrlf input
   ```

3. **If editing shell scripts on Windows:**
   - Use an editor that supports Unix line endings (VS Code, Notepad++, etc.)
   - Set the file to use LF line endings, not CRLF
   - The `.gitattributes` file will now enforce this automatically

### Still Having Issues?

If the problem persists after following these steps:

1. **Check if the build succeeds:**
   ```bash
   docker-compose build backend
   ```

   You should see: `✓ Entrypoint script validated successfully`

2. **Manually test the image:**
   ```bash
   docker run --rm -it maktabi-backend:latest sh
   # Inside the container:
   ls -la /app/docker-entrypoint.sh
   /app/docker-entrypoint.sh  # This will fail without DATABASE_URL but should start
   ```

3. **Check for port conflicts:**
   ```bash
   # On Linux/Mac:
   sudo lsof -i :3001

   # On Windows:
   netstat -ano | findstr :3001
   ```

4. **Verify Docker daemon is working:**
   ```bash
   docker version
   docker info
   ```

### Getting Help

If none of these solutions work, please provide:
- Output of `docker-compose logs backend`
- Output of `docker-compose build backend`
- Your operating system (Windows/Mac/Linux)
- Docker version (`docker --version`)
