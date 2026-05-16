# Docker Entrypoint Issues - Complete Root Cause Analysis and Prevention

## Problem: `exec /app/docker-entrypoint.sh: no such file or directory`

This error occurs when Docker cannot execute the entrypoint script. Despite the error message saying "no such file or directory", the file often **does exist** but cannot be executed due to various issues.

## Root Causes (In Order of Likelihood)

### 1. **Windows CRLF Line Endings** ⭐ MOST COMMON
**What happens:**
- Windows uses CRLF (`\r\n`) for line endings
- Unix/Linux uses LF (`\n`) for line endings
- When a shell script with CRLF is executed on Linux, the shell interpreter path becomes `#!/bin/sh\r` instead of `#!/bin/sh`
- Linux cannot find an interpreter at `/bin/sh\r` (note the invisible `\r`)
- Docker reports "no such file or directory" referring to the interpreter, not the script

**How it happens:**
1. Developer on Windows creates/edits `docker-entrypoint.sh`
2. Git checks out the file with CRLF endings (if `.gitattributes` not configured)
3. File gets copied into Docker image with CRLF
4. Container startup fails

**Fix:**
- Ensure `.gitattributes` has: `*.sh text eol=lf`
- Convert existing file: `dos2unix docker-entrypoint.sh` or `sed -i 's/\r$//' docker-entrypoint.sh`
- Re-commit and rebuild Docker image

### 2. **Missing Shebang**
**What happens:**
- Without `#!/bin/sh` or `#!/bin/bash` at the top, the script cannot be executed directly
- The ENTRYPOINT tries to execute the file, but the OS doesn't know which interpreter to use

**Fix:**
- Add `#!/bin/sh` as the very first line
- Use `/bin/sh` for Alpine Linux (more compatible)
- Use `/bin/bash` only if bash is installed in the image

### 3. **Missing Execute Permissions**
**What happens:**
- The file exists but isn't executable
- Linux refuses to execute non-executable files

**Fix in Dockerfile:**
```dockerfile
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
```

### 4. **Wrong COPY Path in Dockerfile**
**What happens:**
- Script is copied to wrong location (e.g., `/docker-entrypoint.sh` instead of `/app/docker-entrypoint.sh`)
- ENTRYPOINT references `/app/docker-entrypoint.sh` but file is elsewhere

**Fix:**
```dockerfile
WORKDIR /app
COPY docker-entrypoint.sh /app/docker-entrypoint.sh  # Use absolute path
ENTRYPOINT ["/app/docker-entrypoint.sh"]              # Use absolute path
```

### 5. **Volume Mounts Overwriting Container Files**
**What happens:**
- `docker-compose.yml` mounts host directory to `/app`
- Mount overwrites the entire `/app` directory from the image
- The `docker-entrypoint.sh` that was COPYed during build is now hidden

**Example of problematic config:**
```yaml
services:
  backend:
    volumes:
      - ./backend:/app  # ❌ This overwrites everything in /app
```

**Fix:**
- Remove volume mounts in production
- For development, mount specific subdirectories:
```yaml
volumes:
  - ./backend/src:/app/src  # ✅ Only mount source code
```

### 6. **.dockerignore Excluding the Script**
**What happens:**
- `.dockerignore` contains `*.sh` or `docker-entrypoint.sh`
- Script is never copied into Docker build context
- COPY command silently fails

**Fix in .dockerignore:**
```dockerignore
# ❌ Don't do this:
*.sh

# ✅ Or explicitly allow it:
*.sh
!docker-entrypoint.sh
```

### 7. **Wrong ENTRYPOINT Syntax**
**What happens:**
- Shell form vs exec form behaves differently
- Wrong form can cause script not to be found

**Wrong:**
```dockerfile
ENTRYPOINT /app/docker-entrypoint.sh           # Shell form - can have issues
ENTRYPOINT docker-entrypoint.sh                # Relative path - unreliable
```

**Correct:**
```dockerfile
ENTRYPOINT ["/app/docker-entrypoint.sh"]       # Exec form with absolute path
```

### 8. **Base Image Missing Shell**
**What happens:**
- Using a minimal base image like `scratch` or `distroless`
- No `/bin/sh` interpreter exists
- Script cannot be executed

**Fix:**
- Use images with shell: `node:20-slim`, `node:20-alpine`
- Or use binary-only ENTRYPOINT for distroless images

### 9. **File Encoding Issues**
**What happens:**
- File saved with unusual encoding (UTF-16, etc.)
- Shell cannot parse the file
- Hidden Unicode characters in shebang

**Fix:**
- Save file as UTF-8
- Verify with: `file docker-entrypoint.sh` should show "UTF-8 text"
- Check for BOM (Byte Order Mark): `hexdump -C docker-entrypoint.sh | head`

## Why Container Keeps Restarting

Docker's `restart: unless-stopped` policy means:
1. Container starts → entrypoint fails → container exits
2. Docker sees exit → restarts container (per restart policy)
3. Container starts → entrypoint fails → container exits
4. Loop continues indefinitely

**Check logs:**
```bash
docker logs maktabi_backend
docker logs -f maktabi_backend  # Follow logs
```

## Complete Fix Applied to This Repository

### ✅ 1. Enhanced docker-entrypoint.sh
- Added pre-flight validation checks
- Verifies all critical files exist before starting
- Provides detailed debugging output
- Validates Node.js, npm, directory structure
- Clear error messages if anything is wrong

### ✅ 2. Improved Dockerfile
- Uses absolute paths everywhere (`/app/docker-entrypoint.sh`)
- Explicitly validates script at build time:
  - Checks file exists
  - Checks it's executable
  - Checks for CRLF line endings
  - Checks for proper shebang
- Makes script executable with `chmod +x`
- Adds build verification to fail fast

### ✅ 3. Comprehensive .gitattributes
- Forces LF line endings for all shell scripts: `*.sh text eol=lf`
- Forces LF for Docker files: `Dockerfile text eol=lf`
- Covers all file types: `.js`, `.ts`, `.json`, `.yml`, etc.
- Marks binary files explicitly to prevent corruption

### ✅ 4. Improved .dockerignore
- Explicitly documents that `docker-entrypoint.sh` must NOT be excluded
- Only excludes truly unnecessary files
- Keeps `package-lock.json` for reproducible builds
- Lists all critical files that must be included

### ✅ 5. Docker Compose Validation
- No volume mounts that overwrite `/app`
- Proper dependency ordering with health checks
- Environment variables properly set

### ✅ 6. Validation Script (`docker-validate.sh`)
- Run before building to catch issues early
- Checks for CRLF line endings
- Verifies shebang exists
- Validates Dockerfile configuration
- Checks .gitattributes and .dockerignore

## How to Use

### Before Building
```bash
# Validate Docker configuration
./docker-validate.sh

# If validation passes, rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### If Issues Persist

1. **Check line endings:**
```bash
file backend/docker-entrypoint.sh
od -c backend/docker-entrypoint.sh | head -20
```

2. **Fix line endings if needed:**
```bash
# Install dos2unix (if not available)
# Ubuntu/Debian: sudo apt-get install dos2unix
# macOS: brew install dos2unix
dos2unix backend/docker-entrypoint.sh

# Or use sed:
sed -i 's/\r$//' backend/docker-entrypoint.sh
```

3. **Re-normalize Git line endings:**
```bash
# Remove all files from Git's cache
git rm -rf --cached .

# Re-add them (will apply .gitattributes rules)
git add .

# Commit the fixed line endings
git commit -m "Fix line endings for cross-platform compatibility"
```

4. **Rebuild completely:**
```bash
# Stop and remove everything
docker-compose down -v
docker system prune -af

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

5. **Check container logs:**
```bash
docker logs maktabi_backend
docker logs -f maktabi_backend  # Follow real-time
```

## Prevention Mechanisms Now in Place

1. **`.gitattributes`**: Enforces LF line endings for all text files
2. **Dockerfile validation**: Build fails if script has wrong format
3. **Entrypoint pre-flight checks**: Script validates environment before running
4. **Validation script**: Catch issues before building
5. **Comprehensive documentation**: This file explains all scenarios
6. **Absolute paths**: No ambiguity about file locations
7. **Healthcheck**: Container reports unhealthy state instead of silent failures

## Cross-Platform Compatibility

This setup now works reliably on:
- ✅ Windows 10/11 with Docker Desktop
- ✅ Windows with WSL2
- ✅ macOS (Intel and Apple Silicon)
- ✅ Linux (Ubuntu, Debian, Alpine, etc.)
- ✅ CI/CD pipelines (GitHub Actions, GitLab CI, etc.)

## Testing the Fix

```bash
# 1. Validate configuration
./docker-validate.sh

# 2. Clean rebuild
docker-compose down -v
docker-compose build --no-cache

# 3. Start services
docker-compose up -d

# 4. Check backend logs (should see pre-flight validation output)
docker logs maktabi_backend

# 5. Verify backend is running
curl http://localhost:3001/health

# 6. Check all services are healthy
docker-compose ps
```

## Summary

The most common cause of `exec /app/docker-entrypoint.sh: no such file or directory` on Windows is **CRLF line endings**. The fix requires:

1. Proper `.gitattributes` configuration (✅ Applied)
2. Converting existing files to LF (✅ Verified)
3. Dockerfile validation at build time (✅ Applied)
4. Runtime pre-flight checks (✅ Applied)

All these fixes have been applied to this repository. The Docker setup is now production-grade and cross-platform compatible.
