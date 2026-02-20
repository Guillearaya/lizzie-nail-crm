# ═══════════════════════════════════════════════════
# LIZZIE NAIL CRM — PRODUCTION DOCKERFILE
# ═══════════════════════════════════════════════════

FROM node:20-slim AS base

# Install python and build tools for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Re-install runtime dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=base /app/next.config.mjs ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Ensure data directory exists for SQLite
RUN mkdir -p data

EXPOSE 3000

CMD ["npm", "start"]
