# Docker Troubleshooting Guide

This guide helps you resolve common Docker issues with the Maktabi project.

## Table of Contents
- [Entrypoint Error](#entrypoint-error)
- [Container Keeps Restarting](#container-keeps-restarting)
- [Database Connection Issues](#database-connection-issues)
- [Port Already in Use](#port-already-in-use)
- [Clean Slate Rebuild](#clean-slate-rebuild)

---

## Entrypoint Error

### Symptom
```
exec ./docker-entrypoint.sh: no such file or directory
```

The container status shows "Restarting" repeatedly.

### Cause
You're running an **old cached Docker image** that was built before recent fixes. Docker caches images, so pulling the latest code doesn't automatically update running containers.

### Solution

**Option 1: Quick Rebuild (Recommended)**
```bash
./docker-rebuild.sh
```

**Option 2: Manual Rebuild**
```bash
# Stop containers
docker compose down

# Remove old images
docker rmi maktabi-backend:latest maktabi-frontend:latest

# Rebuild and start
docker compose build --no-cache
docker compose up -d
```

**Option 3: Nuclear Option (Clean Everything)**
```bash
# Stop and remove everything including volumes (⚠️ deletes all data)
docker compose down -v

# Remove all maktabi images
docker images | grep maktabi | awk '{print $3}' | xargs docker rmi -f

# Rebuild from scratch
docker compose up --build -d
```

### Verification
After rebuilding, check if the container is running:
```bash
docker compose ps
```

You should see:
```
NAME                IMAGE                   STATUS
maktabi_backend     maktabi-backend:latest  Up
maktabi_frontend    maktabi-frontend:latest Up
maktabi_postgres    postgres:16-alpine      Up (healthy)
```

View logs to confirm it started correctly:
```bash
docker compose logs backend
```

Expected output:
```
==========================================
Starting Maktabi Backend
==========================================
Running Prisma migrations...
✓ Migrations completed successfully
...
Starting NestJS application...
```

---

## Container Keeps Restarting

### Symptom
When running `docker compose ps`, you see a container with status "Restarting".

### Possible Causes & Solutions

**1. Old cached image** → See [Entrypoint Error](#entrypoint-error) above

**2. Database connection failure**
```bash
# Check if postgres is healthy
docker compose ps postgres

# View backend logs
docker compose logs backend
```

If you see database connection errors, ensure postgres is healthy and DATABASE_URL is correct.

**3. Missing environment variables**
```bash
# Check backend environment
docker compose config | grep -A 20 "backend:"
```

Ensure all required variables are set in `docker-compose.yml`:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `FRONTEND_URL`

**4. Port already in use**
```bash
# Check what's using port 3001
lsof -i :3001
# or on Linux
sudo netstat -tulpn | grep 3001
```

Stop the conflicting service or change the port in `docker-compose.yml`.

---

## Database Connection Issues

### Symptom
Backend logs show:
```
Can't reach database server
```

### Solution

**1. Check postgres status**
```bash
docker compose ps postgres
```

Should show "Up (healthy)". If not:
```bash
# Restart postgres
docker compose restart postgres

# Check logs
docker compose logs postgres
```

**2. Old volume with wrong credentials**
```bash
# Remove old volume and start fresh
docker compose down -v
docker compose up -d
```

**3. Wrong DATABASE_URL**

Check `docker-compose.yml` line 48:
```yaml
DATABASE_URL: "postgresql://maktabi:maktabi123@postgres:5432/maktabi_db"
```

Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

---

## Port Already in Use

### Symptom
```
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3001 -> 0.0.0.0:0: listen tcp 0.0.0.0:3001: bind: address already in use
```

### Solution

**Option 1: Stop the conflicting service**
```bash
# Find what's using the port
lsof -i :3001
# Kill the process
kill -9 <PID>
```

**Option 2: Change the port mapping**

Edit `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "3002:3001"  # Changed from 3001:3001
```

Then update frontend environment:
```yaml
services:
  frontend:
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:3002"  # Changed from 3001
```

---

## Clean Slate Rebuild

When nothing else works, start completely fresh:

```bash
# 1. Stop everything
docker compose down -v

# 2. Remove all containers
docker rm -f $(docker ps -aq) 2>/dev/null || true

# 3. Remove all maktabi images
docker images | grep maktabi | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true

# 4. Clean up Docker system
docker system prune -af

# 5. Rebuild and start
docker compose build --no-cache
docker compose up -d

# 6. Check status
docker compose ps
docker compose logs -f
```

---

## Useful Commands

```bash
# View all container statuses
docker compose ps

# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f backend

# Restart a service
docker compose restart backend

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Rebuild a specific service
docker compose build --no-cache backend

# Execute command in running container
docker compose exec backend sh

# View environment variables in container
docker compose exec backend env

# Check Docker disk usage
docker system df
```

---

## Prevention Tips

1. **Always rebuild after pulling code changes:**
   ```bash
   git pull
   docker compose build
   docker compose up -d
   ```

2. **Use the rebuild script for major updates:**
   ```bash
   ./docker-rebuild.sh
   ```

3. **Monitor logs regularly:**
   ```bash
   docker compose logs -f
   ```

4. **Keep Docker system clean:**
   ```bash
   docker system prune -f
   ```

---

## Still Having Issues?

1. Check the [main README](../README.md) for setup instructions
2. Check [PRISMA_OPENSSL_FIX.md](./PRISMA_OPENSSL_FIX.md) for Prisma-specific issues
3. View detailed error logs:
   ```bash
   docker compose logs --tail=100 backend
   ```
4. Create an issue on GitHub with:
   - Output of `docker compose ps`
   - Output of `docker compose logs backend`
   - Your Docker version: `docker --version`
   - Your OS and version
