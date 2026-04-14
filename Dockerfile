# ═══════════════════════════════════════════════════════════════
# TTAI — Production Dockerfile (Multi-stage Next.js 14)
# ═══════════════════════════════════════════════════════════════
#
# Build:   docker build -t ttai .
# Run:     docker run -p 3000:3000 -e GOOGLE_GENERATIVE_AI_API_KEY=... ttai
# Deploy:  see deploy.sh for Cloud Run deployment
#
# Image size: ~200MB (standalone Next.js output + Node.js alpine)

# ─── Stage 1: Dependencies ─────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./

# Copy package.json for each workspace
COPY apps/ttai-web/package.json ./apps/ttai-web/
COPY packages/ai-core/package.json ./packages/ai-core/
COPY packages/db/package.json ./packages/db/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/ttai-web/node_modules ./apps/ttai-web/node_modules
COPY --from=deps /app/packages/ai-core/node_modules ./packages/ai-core/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules

# Copy all source
COPY . .

# Build the Next.js app (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/ttai-web && npx next build

# ─── Stage 3: Production Runtime ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/apps/ttai-web/.next/standalone ./
COPY --from=builder /app/apps/ttai-web/.next/static ./apps/ttai-web/.next/static
COPY --from=builder /app/apps/ttai-web/public ./apps/ttai-web/public

# Create data directory (for temple JSON files)
RUN mkdir -p /app/apps/ttai-web/data/temples && chown -R nextjs:nodejs /app/apps/ttai-web/data

USER nextjs
EXPOSE 3000

# Start the Next.js server
CMD ["node", "apps/ttai-web/server.js"]
