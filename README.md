# Forge Fitness

Plan workouts, schedule sessions, and track your strength progress. A full-stack web application for managing workout templates, scheduling training sessions, and monitoring exercise performance.

## 🎯 Overview

Forge Fitness is a comprehensive workout tracking and management system built with modern web technologies. It enables users to:

- **Create and manage workout templates** with custom exercise configurations
- **Schedule workout sessions** with planned sets, reps, and weight targets
- **Track actual performance** to monitor progress over time
- **View progress reports** to analyze workout history and improvements
- **Manage exercise library** with detailed exercise information and categorization

## ✨ Features

### Authentication

- Secure user registration and login
- Session-based authentication with JWT tokens
- Password hashing with bcryptjs

### Workout Management

- **Templates**: Create reusable workout templates with multiple exercises
- **Sessions**: Schedule workout sessions based on templates or custom configurations
- **Status Tracking**: Monitor session status (scheduled, in_progress, completed, cancelled)

### Exercise Database

- Pre-populated exercise catalog with 100+ exercises
- Categorized by type (cardio, strength, flexibility, mobility, conditioning)
- Organized by muscle groups (chest, back, legs, shoulders, arms, core, full_body)
- Equipment information and exercise descriptions

### Performance Tracking

- Log actual sets, reps, and weight per exercise
- Compare planned vs. actual performance
- Add session notes and comments
- Progress reports and analytics

### Reporting

- Progress summaries and trend analysis
- Performance metrics aggregation

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom animations
- **Component Library**: shadcn/ui with Base UI components
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for validation
- **State Management**: [TanStack React Query](https://tanstack.com/query/latest)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [jose](https://github.com/panva/jose) for JWT handling
- **Password Hashing**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)


### Database

- **Provider**: PostgreSQL with Prisma Adapter
- **ORM**: [Prisma](https://www.prisma.io/)
- **Client**: Custom generated client in `src/generated/prisma`

### Testing & Quality

- **Testing Framework**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/)

## 📁 Project Structure

```
forge-fitness/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── (app)/               # Protected routes
│   │   │   ├── dashboard/       # Dashboard page
│   │   │   ├── reports/         # Reports pages
│   │   │   ├── templates/       # Workout templates management
│   │   │   └── workouts/        # Workout sessions management
│   │   ├── (auth)/              # Public auth routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── exercises/       # Exercise endpoints
│   │   │   ├── reports/         # Reports endpoints
│   │   │   ├── workout-sessions/
│   │   │   └── workout-templates/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx        # React providers (QueryClient, etc.)
│   ├── components/              # Shared React components
│   │   ├── layout/              # Layout components
│   │   ├── shared/              # Shared components (PageHeader, StatCard)
│   │   └── ui/                  # UI components (shadcn/ui)
│   ├── features/                # Feature modules (organized by domain)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── exercises/
│   │   ├── reports/
│   │   ├── templates/
│   │   └── workouts/
│   │       ├── api/             # React Query hooks
│   │       └── components/      # Feature-specific components
│   ├── generated/               # Auto-generated code
│   │   └── prisma/              # Prisma client
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions and helpers
│   │   ├── api/                 # HTTP client utilities
│   │   ├── auth/                # Authentication utilities
│   │   ├── db/                  # Database utilities
│   │   ├── schemas/             # Zod validation schemas
│   │   └── server/              # Server-side utilities
│   └── types/                   # TypeScript type definitions
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.mjs                 # Database seeding script
│   ├── seed.test.ts             # Seed script tests
│   └── exercise-catalog.mjs     # Exercise data
├── docs/
│   └── openapi.yaml             # API documentation
├── public/                       # Static assets
└── Configuration files
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    ├── vitest.config.ts
    ├── components.json           # shadcn/ui config
    └── package.json
```

## 🗄 Database Schema

### Core Models

**User**

- id, email, passwordHash, displayName
- Relations: workoutTemplates, workoutSessions

**Exercise**

- id, slug, name, description, category, muscleGroup, equipment
- Categories: cardio, strength, flexibility, mobility, conditioning
- Muscle Groups: chest, back, legs, shoulders, arms, core, full_body

**WorkoutTemplate**

- id, userId, name, description, isArchived
- Many-to-many with Exercise via WorkoutTemplateExercise
- One-to-many with WorkoutSession

**WorkoutSession**

- id, userId, templateId, name, status, scheduledAt, startedAt, completedAt, comments
- Status: scheduled, in_progress, completed, cancelled
- Many-to-many with Exercise via WorkoutSessionExercise

**WorkoutTemplateExercise & WorkoutSessionExercise**

- Link tables storing exercise configuration (sets, reps, weight, rest times)
- Tracks planned vs. actual performance in sessions

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (or npm/yarn/bun)
- PostgreSQL database


### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository>
   cd job-application-agent
   pnpm install
   ```

2. **Set up environment variables**
   Create `.env.local`:

   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/forge_fitness
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **Set up the database**

   ```bash
   pnpm db:push          # Push schema to database
   pnpm prisma:generate # Generate Prisma client
   pnpm db:seed         # Seed with exercise data
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests with Vitest
pnpm test:watch       # Run tests in watch mode
pnpm prisma:generate  # Generate Prisma client
pnpm db:push          # Sync schema with database
pnpm db:seed          # Seed database with exercises
```

## 🔌 API Routes

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Exercises

- `GET /api/exercises` - List all exercises
- `GET /api/exercises/[id]` - Get exercise details

### Workout Templates

- `GET /api/workout-templates` - List user's templates
- `POST /api/workout-templates` - Create template
- `GET /api/workout-templates/[id]` - Get template
- `PATCH /api/workout-templates/[id]` - Update template
- `DELETE /api/workout-templates/[id]` - Delete template

### Workout Sessions

- `GET /api/workout-sessions` - List user's sessions
- `POST /api/workout-sessions` - Create session
- `GET /api/workout-sessions/[id]` - Get session
- `PATCH /api/workout-sessions/[id]` - Update session
- `DELETE /api/workout-sessions/[id]` - Delete session

### Reports

- `GET /api/reports/progress` - Get progress metrics
- `GET /api/reports/summary` - Get summary statistics

## 🎨 UI Components

- Custom shadcn/ui component library in `src/components/ui/`
- Tailwind CSS with custom animations
- Dark theme optimized design
- Responsive layout with `app-shell` component

## 🧪 Testing

Tests are located alongside source files with `.test.ts` extension.

```bash
# Run all tests
pnpm test

# Watch mode during development
pnpm test:watch
```

## 🔐 Security Features

- JWT-based authentication with jose
- Password hashing with bcryptjs
- Security headers configured in `next.config.ts`:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera, microphone, geolocation disabled

## 🚢 Deployment

The monorepo splits into two independently deployable artifacts:

- **`@forge/web`** — Next.js static export served from a CDN (Amplify Hosting).
- **`@forge/api`** — Fastify server packaged as a container image (ECS Fargate).

### Web (AWS Amplify Hosting)

`apps/web/amplify.yml` defines the build. Amplify installs the workspace from
the repo root and outputs static assets to `apps/web/out/`.

Required app env vars:

| Var                    | Value                            |
| ---------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`  | `https://<api-domain>` (no `/api`) |

SPA fallback rewrites (Amplify console → *Rewrites and redirects*). Dynamic
`[id]` routes pre-render a placeholder HTML at `/<segment>/_/index.html`;
deep links must rewrite to the placeholder so the client hook can read the id
from the URL and fetch the real record. **Per-segment**, not a single blanket
rule — a blanket `/index.html` rewrite would render the root route instead:

```
/workouts/<*>   →  /workouts/_/index.html    200 (Rewrite)
/templates/<*>  →  /templates/_/index.html   200 (Rewrite)
/trainer/<*>    →  /trainer/_/index.html     200 (Rewrite)
```

Place these above any generic 404 fallback. Static siblings (`/workouts`,
`/workouts/new`) still serve their own HTML files.

Security headers ship in `amplify.yml` (`X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`) since `output: 'export'` disables Next's
`headers()` config.

### API (ECS Fargate)

Build the container image from repo root:

```bash
docker build -f apps/api/Dockerfile -t forge-api:latest .
```

Task definition notes:

- **Port**: `4000` (matches `PORT` default in `apps/api/src/config.ts`).
- **Health check**: `HEALTHCHECK` in the Dockerfile probes `GET /health`; ALB
  target group should also point at `/health`.
- **Command**: image `CMD` is `node dist/index.js`; no override needed.
- **Prisma migrations**: run `pnpm --filter @forge/api exec prisma migrate deploy`
  as a one-shot task or CI step before rollout — the runtime image excludes the
  Prisma CLI.

Required env vars:

| Var                       | Notes                                                     |
| ------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`            | Postgres connection string                                |
| `JWT_SECRET`              | ≥32 chars, used to sign `ff_token`                        |
| `JWT_TTL_SECONDS`         | Optional, default 604800 (7 days)                         |
| `ENCRYPTION_SECRET`       | 32-byte hex, encrypts per-user AI API keys at rest        |
| `COOKIE_DOMAIN`           | Set to shared eTLD+1 if web + api live on different hosts |
| `COOKIE_SECURE`           | `true` in prod                                            |
| `CORS_ORIGINS`            | Comma-separated web origins allowed to send credentials   |
| `GEMINI_API_KEY`          | Optional, used by conversation-title generator            |
| `TRUST_CLIENT_IP_HEADERS` | `true` if fronted by an ALB/proxy that sets XFF           |

Because `ff_token` is `SameSite=None; Secure` in production, the web and api
domains must share a parent domain (e.g. `app.forge.example` + `api.forge.example`)
for the cookie to flow.

### Vercel fallback

Both apps also deploy to Vercel if AWS is unavailable. Import each as a
separate Vercel project (a monorepo can host multiple).

**Web (`@forge/web`)** — `apps/web/vercel.json`
- Root directory: `apps/web`
- Framework: Next.js (auto-detected). `output: 'export'` still applies; Vercel
  serves the emitted `out/` as static assets.
- Env: `NEXT_PUBLIC_API_URL` = api deployment URL.
- SPA rewrites for dynamic `[id]` routes are declared in `vercel.json`
  (`/workouts/:id → /workouts/_/`, same for templates + trainer). Security
  headers ship in the same file.

**API (`@forge/api`)** — `apps/api/vercel.json` + `apps/api/api/index.ts`
- Root directory: `apps/api`
- Runtime: `nodejs22.x` serverless function. `api/index.ts` mounts the whole
  Fastify app and dispatches every request via `app.server.emit("request",...)`.
- `vercel.json` rewrites `/(.*) → /api` so every path lands in the function.
- Prisma generate runs in `buildCommand`; the generated client is bundled via
  `includeFiles`.
- Same env vars as ECS (`DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_SECRET`,
  `CORS_ORIGINS`, `COOKIE_DOMAIN`, `COOKIE_SECURE=true`, optional
  `GEMINI_API_KEY`).
- `maxDuration: 60` on the function to allow SSE streaming past the 10s hobby
  default. Long-running SSE still terminates at the platform limit — chat
  responses that outlast it get cut off. ECS remains preferred for streaming.

Same cookie constraint applies: web and api must share an eTLD+1 for
`SameSite=None; Secure` cookies to flow (e.g. `app.forge.example` +
`api.forge.example`).

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Zod Validation](https://zod.dev/)

## 📄 License

This project is private and proprietary.
