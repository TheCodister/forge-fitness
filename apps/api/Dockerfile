# syntax=docker/dockerfile:1.7
# Multi-stage build for @forge/api. Build context = repo root.
#   docker build -f apps/api/Dockerfile -t forge-api .

ARG NODE_VERSION=22-alpine

# ---------- deps: install workspace deps for build ----------
FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter @forge/api... --filter @forge/shared...

# ---------- build: compile TS + prisma client ----------
FROM deps AS build
WORKDIR /repo
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter @forge/shared run build
RUN pnpm --filter @forge/api exec prisma generate
RUN pnpm --filter @forge/api run build

# ---------- runtime: production node_modules + dist ----------
FROM node:${NODE_VERSION} AS prod-deps
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --prod --frozen-lockfile --filter @forge/api... --filter @forge/shared...

FROM node:${NODE_VERSION} AS runtime
RUN apk add --no-cache openssl tini
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps /repo/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/src/generated ./apps/api/src/generated
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json

WORKDIR /app/apps/api
USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:4000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
