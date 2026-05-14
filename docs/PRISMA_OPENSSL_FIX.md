# Prisma OpenSSL Configuration Fix

## Problem

When running Prisma commands in Docker, the following errors occurred:

```
Error: Could not parse schema engine response: SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON

prisma:warn Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-1.1.x".
```

## Root Cause

The issue was caused by:

1. **Missing OpenSSL libraries**: The `node:20-slim` base image had `openssl` installed but was missing the `libssl3` library package that Prisma's binary engines need to run properly.

2. **Implicit binary target detection**: Prisma was attempting to auto-detect the OpenSSL version at runtime, which was failing in the Docker environment, causing it to default to the wrong version (`openssl-1.1.x` instead of `openssl-3.0.x`).

3. **Truncated error messages**: The schema engine was failing to load, but the error message was being truncated during JSON parsing, making debugging difficult.

## Solution

### 1. Updated Dockerfile

Added explicit installation of `libssl3` and `ca-certificates` packages:

```dockerfile
# Install OpenSSL 3.x and necessary libraries for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*
```

Added environment variables to explicitly configure Prisma's OpenSSL target:

```dockerfile
# Set OpenSSL version for Prisma to avoid detection issues
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING="1"
```

### 2. Updated prisma/schema.prisma

Added explicit binary targets configuration:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

This ensures:
- `"native"` target works for local development on different platforms
- `"debian-openssl-3.0.x"` target is available for Docker builds

### 3. Updated docker-compose.yml

Added environment variable to docker-compose configuration:

```yaml
environment:
  PRISMA_CLI_BINARY_TARGETS: "debian-openssl-3.0.x"
```

## Testing

After applying the fix, all Prisma commands work correctly:

```bash
✓ npx prisma --version       # Shows correct binaryTarget: debian-openssl-3.0.x
✓ npx prisma validate         # Schema validation succeeds
✓ npx prisma generate         # Client generation succeeds
✓ Prisma Client import        # Runtime import works
```

No OpenSSL warnings are displayed.

## Impact

- **Docker builds**: Now work without OpenSSL detection errors
- **Database migrations**: Will run successfully in Docker containers
- **Prisma operations**: All Prisma commands work reliably
- **Development**: Local development unaffected (uses "native" target)

## Future Considerations

- If upgrading Prisma to a major version, verify the binary targets are still compatible
- If changing the base Docker image (e.g., from Debian to Alpine), update the binaryTargets accordingly
- The `libssl3` package is for OpenSSL 3.x; if downgrading OpenSSL, adjust package name

## References

- [Prisma Binary Targets Documentation](https://www.prisma.io/docs/concepts/components/prisma-engines/query-engine#binary-targets)
- [Prisma OpenSSL Issues](https://github.com/prisma/prisma/issues?q=is%3Aissue+openssl)
