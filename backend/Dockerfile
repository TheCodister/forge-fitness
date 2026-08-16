# Build from the repository root:
# docker build -f backend/Dockerfile -t forge-fitness-api .
FROM node:22-alpine AS base

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS verify
COPY backend ./backend
COPY prisma ./prisma
RUN pnpm build:backend

# A separate target for a one-off ECS migration task.
FROM verify AS migration
ENV NODE_ENV=production
CMD ["pnpm", "--dir", "backend", "db:migrate:deploy"]

FROM base AS production-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
RUN pnpm install --filter forge-fitness-api --frozen-lockfile --prod

FROM node:22-alpine AS runtime
WORKDIR /app/backend

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000

COPY --from=production-dependencies --chown=node:node /app/node_modules /app/node_modules
COPY --from=production-dependencies --chown=node:node /app/backend/node_modules ./node_modules
COPY --chown=node:node backend ./

USER node
EXPOSE 4000
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "--import", "tsx", "server.ts"]
