# @forge/api

Fastify backend for Forge Fitness. Owns database access, auth, and AI routes.
Deploys to ECS (Fargate). Frontend (`@forge/web`) talks to it via `NEXT_PUBLIC_API_URL`.

## Dev

```bash
cp .env.example .env
pnpm --filter @forge/api run db:generate
pnpm --filter @forge/api run dev
```
