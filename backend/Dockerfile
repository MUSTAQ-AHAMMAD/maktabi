FROM node:20-slim AS builder

# Install OpenSSL 3.x and necessary libraries for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner

# Install OpenSSL 3.x and necessary libraries for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY docker-entrypoint.sh ./

# Make entrypoint script executable and verify it
RUN chmod +x ./docker-entrypoint.sh && \
    # Verify the script exists and is executable
    test -x ./docker-entrypoint.sh && \
    # Verify it has Unix line endings (no carriage returns)
    ! grep -q $'\r' ./docker-entrypoint.sh && \
    echo "✓ Entrypoint script validated successfully"

# Set OpenSSL version for Prisma to avoid detection issues
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING="1"

EXPOSE 3001
# Use absolute path to avoid any path resolution issues
ENTRYPOINT ["/app/docker-entrypoint.sh"]
