# Separate frontend and backend deployment

Forge Fitness now has two deployable processes:

- `pnpm build:frontend` creates a fully static Next.js export in `out/` for AWS Amplify Hosting.
- `pnpm start:backend` starts the Fastify API on `PORT` (4000 by default).

## 1. Deploy the Fastify API to ECS/Fargate

The backend container is configured for ECS with a non-root runtime, structured stdout logs, container liveness and load-balancer readiness endpoints, and graceful `SIGTERM` shutdown.

Build from the repository root. Use an immutable tag such as the Git commit SHA:

```bash
docker build --platform linux/amd64 -f backend/Dockerfile -t forge-fitness-api:GIT_SHA .
docker tag forge-fitness-api:GIT_SHA ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/forge-fitness-api:GIT_SHA
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/forge-fitness-api:GIT_SHA
```

Copy `ecs/task-definition.example.json`, replace `ACCOUNT_ID`, `REGION`, `IMAGE_TAG`, frontend domain, role ARN, and secret ARNs, then register it:

```bash
aws ecs register-task-definition --cli-input-json file://ecs/task-definition.json
```

Create an ECS Fargate service using `awsvpc` networking and container port 4000. If the service uses an Application Load Balancer:

- create the target group with target type `ip`;
- configure its health path as `/api/health/ready`;
- route HTTPS traffic to container `forge-fitness-api` on port 4000;
- allow the task security group to receive port 4000 only from the ALB security group;
- give the service a health-check grace period, for example 30 seconds;
- enable the ECS deployment circuit breaker and rollback.

The ECS container health check uses `/api/health/live`, which only confirms that the Node.js process accepts requests. Readiness uses `/api/health/ready`, which additionally checks PostgreSQL. The existing `/api/health` endpoint remains a readiness alias.

Set these backend environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Cookie JWT signing secret; at least 32 characters in production. `NEXTAUTH_SECRET` is accepted only as a migration fallback. |
| `FRONTEND_URL` | Yes | Exact frontend origin allowed by CORS; comma-separate multiple origins |
| `COOKIE_SAME_SITE` | Usually | Set to `none` if frontend and API are on different sites; otherwise `lax` |
| `COOKIE_DOMAIN` | No | Shared parent domain such as `.example.com` when using subdomains |
| `EXERCISE_IMAGE_BASE_URL` | If used | Public exercise image base URL |
| `EXERCISEDB_API_KEY` | If used | ExerciseDB image-proxy key |
| `ENCRYPTION_SECRET` | For AI trainer | Exactly 32 bytes encoded as hexadecimal; encrypts stored provider keys |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google login | OAuth client credentials |
| `GOOGLE_REDIRECT_URI` | For Google login | API callback such as `https://api.example.com/api/auth/google/callback` |

Use ECS `secrets` entries backed by Secrets Manager or SSM Parameter Store for `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_SECRET`, Google client secret, and external API keys. The task execution role needs permission to read those secrets; `ecs/execution-role-secrets-policy.example.json` contains the project-specific policy portion. Attach the standard ECS task execution-role permissions for ECR and CloudWatch Logs separately.

### Database migration task

> **Required before the first deployment:** this repository currently has a Prisma schema but no committed `prisma/migrations` history. Create and review a baseline migration before using the migration image:
>
> ```bash
> mkdir -p prisma/migrations/0_init
> pnpm exec prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
> ```
>
> For a new empty production database, let the migration task apply `0_init`. For an existing database whose schema already matches, mark the baseline as applied once with `pnpm exec prisma migrate resolve --applied 0_init` using a controlled migration environment. Never run the baseline SQL against an already populated matching database.

Build the Dockerfile's migration target and push it under a separate immutable tag:

```bash
docker build --platform linux/amd64 --target migration -f backend/Dockerfile -t forge-fitness-api:migration-GIT_SHA .
docker tag forge-fitness-api:migration-GIT_SHA ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/forge-fitness-api:migration-GIT_SHA
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/forge-fitness-api:migration-GIT_SHA
```

Register the adjusted `ecs/migration-task-definition.example.json` and run it as a one-off Fargate task in subnets that can reach the production database. Wait for exit code 0 before updating the API service. Do not run migrations from every API replica at startup.

For reliable cookies, use same-site custom domains such as `app.example.com` and `api.example.com`. With an Amplify domain and unrelated API domain, set `COOKIE_SAME_SITE=none`; browser third-party-cookie policies can still affect that arrangement.

## 2. Deploy the static frontend to Amplify

The committed `amplify.yml` activates pinned pnpm, installs dependencies, runs the static build, and publishes `out/`. This also fixes the original `pnpm: command not found` failure.

Set these Amplify environment variables:

```text
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_EXERCISE_IMAGE_BASE_URL=https://images.example.com/exercises
```

`NEXT_PUBLIC_API_URL` is embedded at build time, so rebuild after changing it. Never put database credentials, JWT secrets, Google client secrets, or AI encryption keys in frontend variables.

## 3. Google OAuth

Register this authorized redirect URI in Google Cloud:

```text
https://api.example.com/api/auth/google/callback
```

The backend redirects successful sign-ins to `FRONTEND_URL/dashboard`.

## 4. Local development

Copy `.env.example` to `.env`, configure the database and secret, then run:

```bash
pnpm install
pnpm dev
```

The frontend runs on port 3000 and Fastify on port 4000.
