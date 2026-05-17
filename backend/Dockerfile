FROM node:20-slim AS builder

# Install OpenSSL 3.x and necessary libraries for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Set working directory with absolute path
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy Prisma configuration and schema first
COPY prisma.config.ts ./
COPY prisma ./prisma

# Copy application source code
COPY . .

# Generate Prisma client and build application
RUN npx prisma generate
RUN npm run build

# Verify build output exists
RUN test -f /app/dist/src/main.js || (echo "ERROR: Build failed - main.js not found" && exit 1)

FROM node:20-slim AS runner

# Install OpenSSL 3.x and necessary libraries for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Set working directory with absolute path
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma configuration and schema for migrations
COPY prisma.config.ts ./
COPY prisma ./prisma

# Copy and configure entrypoint script with absolute path
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Make entrypoint script executable and validate it comprehensively
RUN chmod +x /app/docker-entrypoint.sh && \
    # Verify the script exists at the expected absolute path
    test -f /app/docker-entrypoint.sh || (echo "ERROR: Entrypoint script not found at /app/docker-entrypoint.sh" && exit 1) && \
    # Verify it is executable
    test -x /app/docker-entrypoint.sh || (echo "ERROR: Entrypoint script is not executable" && exit 1) && \
    # Verify it has Unix line endings (no carriage returns)
    ! grep -q $'\r' /app/docker-entrypoint.sh || (echo "ERROR: Entrypoint script has Windows CRLF line endings" && exit 1) && \
    # Verify it has a proper shebang
    head -n 1 /app/docker-entrypoint.sh | grep -q '^#!' || (echo "ERROR: Entrypoint script missing shebang" && exit 1) && \
    # Display verification success
    echo "✅ Entrypoint script validated successfully" && \
    # Show file details for debugging
    ls -lh /app/docker-entrypoint.sh && \
    # Show first line (shebang)
    head -n 1 /app/docker-entrypoint.sh

# Set Prisma environment variables
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING="1"
ENV NODE_ENV="production"

# Expose application port
EXPOSE 3001

# Health check to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });" || exit 1

# Use absolute path for entrypoint to avoid any path resolution issues
# This ensures the script can be found regardless of Docker context
ENTRYPOINT ["/app/docker-entrypoint.sh"]
