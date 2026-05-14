FROM node:22-slim AS builder
WORKDIR /app
# Install dependencies first
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund || \
    (npm cache clean --force && npm install --legacy-peer-deps --no-audit --no-fund)
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
