#!/bin/bash
set -e

# ============================================================================
# Docker Setup Validation Script
# ============================================================================
# This script validates the Docker configuration to prevent common issues
# Run this before building Docker images to catch problems early
# ============================================================================

echo "=========================================="
echo "Docker Setup Validation"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo "1. Checking backend docker-entrypoint.sh..."
if [ ! -f "backend/docker-entrypoint.sh" ]; then
    print_error "backend/docker-entrypoint.sh not found"
else
    print_success "Entrypoint script exists"

    # Check shebang
    FIRST_LINE=$(head -n 1 backend/docker-entrypoint.sh)
    if [[ ! "$FIRST_LINE" =~ ^#! ]]; then
        print_error "Entrypoint script missing shebang (#!/bin/sh or #!/bin/bash)"
    else
        print_success "Shebang found: $FIRST_LINE"
    fi

    # Check for CRLF line endings
    if grep -q $'\r' backend/docker-entrypoint.sh; then
        print_error "Entrypoint script has Windows CRLF line endings - must be LF only"
        echo "  Fix with: dos2unix backend/docker-entrypoint.sh"
        echo "  Or: sed -i 's/\r$//' backend/docker-entrypoint.sh"
    else
        print_success "Line endings are LF (Unix-style)"
    fi

    # Check file permissions
    if [ ! -x "backend/docker-entrypoint.sh" ]; then
        print_warning "Entrypoint script is not executable locally (Docker will fix this)"
    else
        print_success "Script is executable"
    fi
fi

echo ""
echo "2. Checking backend Dockerfile..."
if [ ! -f "backend/Dockerfile" ]; then
    print_error "backend/Dockerfile not found"
else
    print_success "Dockerfile exists"

    # Check if COPY docker-entrypoint.sh exists
    if ! grep -q "COPY.*docker-entrypoint.sh" backend/Dockerfile; then
        print_error "Dockerfile does not copy docker-entrypoint.sh"
    else
        print_success "Dockerfile copies docker-entrypoint.sh"
    fi

    # Check if chmod +x exists
    if ! grep -q "chmod +x.*docker-entrypoint.sh" backend/Dockerfile; then
        print_warning "Dockerfile does not make entrypoint executable"
    else
        print_success "Dockerfile makes entrypoint executable"
    fi

    # Check ENTRYPOINT format
    if ! grep -q 'ENTRYPOINT \["/app/docker-entrypoint.sh"\]' backend/Dockerfile; then
        if grep -q "ENTRYPOINT.*docker-entrypoint.sh" backend/Dockerfile; then
            print_warning "ENTRYPOINT exists but may not use absolute path or exec form"
        else
            print_error "ENTRYPOINT not found in Dockerfile"
        fi
    else
        print_success "ENTRYPOINT uses correct absolute path and exec form"
    fi
fi

echo ""
echo "3. Checking .gitattributes..."
if [ ! -f ".gitattributes" ]; then
    print_warning ".gitattributes not found - create one to enforce LF line endings"
else
    print_success ".gitattributes exists"

    if ! grep -q "*.sh.*eol=lf" .gitattributes; then
        print_error ".gitattributes does not enforce LF for .sh files"
    else
        print_success ".gitattributes enforces LF for shell scripts"
    fi
fi

echo ""
echo "4. Checking .dockerignore..."
if [ ! -f "backend/.dockerignore" ]; then
    print_warning "backend/.dockerignore not found"
else
    print_success "backend/.dockerignore exists"

    # Check if docker-entrypoint.sh is excluded
    if grep -q "^docker-entrypoint.sh" backend/.dockerignore; then
        print_error "docker-entrypoint.sh is excluded by .dockerignore - it MUST be included"
    elif grep -q "^\*.sh" backend/.dockerignore; then
        print_error "*.sh is excluded by .dockerignore - docker-entrypoint.sh will not be copied"
    else
        print_success ".dockerignore does not exclude docker-entrypoint.sh"
    fi
fi

echo ""
echo "5. Checking docker-compose.yml..."
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found"
else
    print_success "docker-compose.yml exists"

    # Check for problematic volume mounts
    if grep -A 10 "backend:" docker-compose.yml | grep -q "volumes:"; then
        print_warning "Backend service has volume mounts - ensure they don't overwrite /app"
    else
        print_success "No volume mounts on backend service"
    fi
fi

echo ""
echo "6. Checking for Unicode or hidden characters..."
if command -v file &> /dev/null; then
    FILE_TYPE=$(file backend/docker-entrypoint.sh)
    if echo "$FILE_TYPE" | grep -q "Unicode"; then
        print_success "File encoding: UTF-8"
    fi
    if echo "$FILE_TYPE" | grep -qi "CRLF"; then
        print_error "File has CRLF line endings detected by file command"
    fi
fi

echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
echo -e "${RED}Errors: $ERRORS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo ""
    print_success "All checks passed! Docker setup looks good."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo ""
    echo -e "${YELLOW}Validation passed with warnings. Review warnings above.${NC}"
    exit 0
else
    echo ""
    print_error "Validation failed! Fix errors above before building Docker images."
    exit 1
fi
