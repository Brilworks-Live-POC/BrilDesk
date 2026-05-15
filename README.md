# BrilDesk — WhatsApp Shared Inbox

A shared WhatsApp inbox for sales teams, featuring real-time messaging, agent routing, CRM integration, and deal tracking.

## Architecture

```
brildesk/
├── apps/
│   ├── web/          # Next.js 15 (App Router, Tailwind CSS, Auth.js v5)
│   └── api/          # Fastify (TypeScript, Prisma, Socket.IO, BullMQ)
├── packages/
│   ├── shared/       # Shared types, constants, validators
│   ├── tsconfig/     # Shared TypeScript configs
│   └── eslint-config/# Shared ESLint configs
├── turbo.json        # Turborepo pipeline config
└── pnpm-workspace.yaml
```

### Monorepo Decision

**Turborepo + pnpm workspaces.** Chosen because:
- Small team (< 5 devs) — single repo reduces coordination overhead
- Shared types between frontend and backend avoid drift
- Unified CI/CD pipeline is simpler to maintain
- Turborepo caching speeds up builds as the project grows

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Backend | Fastify 5, TypeScript |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| Auth | Auth.js v5 (email/password + Google SSO) |
| Real-time | Socket.IO |
| Queues | BullMQ + Redis |
| WhatsApp | WhatsApp Cloud API |
| CRM | Zoho Bigin (Phase 2) |
| Deployment | Vercel (web) + Railway (api) + Supabase (DB) |

## Prerequisites

- Node.js >= 20
- pnpm >= 10
- PostgreSQL (or Supabase account)
- Redis

## Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url> brildesk
   cd brildesk
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database, Redis, and API credentials
   ```

3. **Set up the database:**
   ```bash
   pnpm db:generate    # Generate Prisma client
   pnpm db:migrate     # Run migrations
   pnpm db:seed        # Seed demo data
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - API health check: http://localhost:3001/health

## Demo Credentials (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@brildesk.com | password123 | admin |
| agent1@brildesk.com | password123 | agent |
| agent2@brildesk.com | password123 | agent |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm format` | Format all files with Prettier |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed demo data |
