# BrilDesk Deployment Guide

## Prerequisites

- **Node.js** >= 20
- **pnpm** v10+ (`npm install -g pnpm`)
- **Wrangler CLI** (bundled as dev dependency, or `npm install -g wrangler`)
- **Supabase CLI** (`npm install -g supabase` or via Homebrew)
- A **Supabase** project (cloud or self-hosted)
- A **Cloudflare** account with Workers and Pages enabled
- A **Meta WhatsApp Business** account with Cloud API access
- A **Resend** account for transactional email

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd brildesk
pnpm install
```

### 2. Environment Configuration

Copy the example env file and fill in values:

```bash
cp .env.example .env
```

See [Environment Configuration Guide](./environment-config.md) for details on each variable.

### 3. Start Supabase Locally

```bash
supabase start
```

This starts local Supabase services:
- API: `http://localhost:54321`
- Database: `localhost:54322`
- Studio: `http://localhost:54323`

The CLI outputs `anon key`, `service_role key`, and `JWT secret` — use these in your `.env`.

### 4. Apply Migrations

```bash
supabase db reset
```

This applies all migrations in `supabase/migrations/` and runs `supabase/seed.sql` for development data.

**Seed accounts (password: `password123`):**

| Email | Role | Team |
|---|---|---|
| `superadmin@brildesk.com` | superadmin | — |
| `admin@brildesk.com` | admin | Sales Team |
| `manager@brildesk.com` | manager | Sales Team |
| `agent1@brildesk.com` | agent | Sales Team |
| `agent2@brildesk.com` | agent | Sales Team |

### 5. Start Development Servers

```bash
pnpm dev
```

This runs Turborepo in parallel:
- **Web (Next.js):** `http://localhost:3000`
- **API (Hono/Wrangler):** `http://localhost:8787`

Or start individually:

```bash
# API only
cd apps/api && pnpm dev

# Web only
cd apps/web && pnpm dev
```

### 6. Generate TypeScript Types (after schema changes)

```bash
pnpm db:types
```

Runs `supabase gen types typescript` and writes to `packages/supabase/src/database.types.ts`.

## Build

### Full Build

```bash
pnpm build
```

Turborepo builds packages first (dependency order), then apps:
- `packages/shared` and `packages/supabase` compile TypeScript
- `apps/web` builds via `@cloudflare/next-on-pages` -> output in `.vercel/output/static`
- `apps/api` builds via `wrangler deploy --dry-run --outdir=dist`

### Individual Builds

```bash
# Web
cd apps/web && pnpm build

# API
cd apps/api && pnpm build
```

### Typecheck and Lint

```bash
pnpm typecheck
pnpm lint
```

## Deployment

### API (Cloudflare Workers)

#### 1. Configure Wrangler

The API uses `apps/api/wrangler.toml` with environment-specific worker names:
- Default: `brildesk-api`
- Staging: `brildesk-api-staging`
- Production: `brildesk-api-production`

#### 2. Set Secrets

```bash
cd apps/api

# Required secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put WHATSAPP_VERIFY_TOKEN
wrangler secret put WHATSAPP_ACCESS_TOKEN
wrangler secret put WHATSAPP_PHONE_NUMBER_ID
wrangler secret put RESEND_API_KEY

# Optional secrets
wrangler secret put RESEND_WEBHOOK_SECRET
```

For environment-specific secrets, add `--env staging` or `--env production`.

#### 3. Deploy

```bash
# Default environment
cd apps/api && pnpm deploy

# Staging
wrangler deploy --env staging

# Production
wrangler deploy --env production
```

### Web (Cloudflare Pages)

#### 1. Configure Wrangler

The web app uses `apps/web/wrangler.toml`:
- Pages build output: `.vercel/output/static`
- Compatibility flags: `nodejs_compat`

#### 2. Build

```bash
cd apps/web && pnpm build
```

This runs `@cloudflare/next-on-pages` which transforms the Next.js output for Cloudflare Pages.

#### 3. Preview Locally

```bash
cd apps/web && pnpm preview
```

Runs `wrangler pages dev` against the built output.

#### 4. Deploy

```bash
cd apps/web && pnpm deploy
```

Runs `wrangler pages deploy .vercel/output/static`.

Environment variables for the web app must be set in the Cloudflare Pages dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### Database (Supabase)

#### Applying Migrations to Production

```bash
# Link to your Supabase project
supabase link --project-ref <project-ref>

# Push migrations
supabase db push
```

#### Creating New Migrations

```bash
# Create a new migration file
supabase migration new <migration_name>

# Edit the generated file in supabase/migrations/

# Test locally
supabase db reset

# Push to production
supabase db push
```

## WhatsApp Webhook Setup

1. In the Meta Developer Console, configure the webhook URL:
   - **Callback URL:** `https://api.brildesk.com/api/webhooks/whatsapp`
   - **Verify token:** Same value as `WHATSAPP_VERIFY_TOKEN` secret

2. Subscribe to webhook fields:
   - `messages` — for inbound messages
   - `message_deliveries` — for delivery/read status updates (status callback URL: `/api/webhooks/whatsapp/status`)

## Resend Email Webhook Setup

1. In the Resend dashboard, configure the webhook URL:
   - **Endpoint URL:** `https://api.brildesk.com/api/email/webhook?token=<RESEND_WEBHOOK_SECRET>`
   - **Events:** `email.sent`, `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`

## Turborepo Pipeline

Defined in `turbo.json`:

| Task | Dependencies | Cached | Notes |
|---|---|---|---|
| `build` | `^build` (packages first) | Yes | Outputs: `.next/**`, `.vercel/**`, `dist/**` |
| `dev` | — | No | Persistent (long-running) |
| `deploy` | `build` | No | |
| `lint` | `^build` | Yes | |
| `typecheck` | `^build` | Yes | |

## Architecture Notes

- The web app is a Next.js 15 app compiled for Cloudflare Pages via `@cloudflare/next-on-pages`. This means it runs on Cloudflare's edge network, not a traditional Node.js server.
- The API runs as a Cloudflare Worker with `nodejs_compat` flag for Node.js API compatibility.
- Both apps share types and database client code through workspace packages (`@brildesk/shared`, `@brildesk/supabase`), which are transpiled by Next.js via `transpilePackages` config.
- Supabase provides the database, authentication, and realtime infrastructure as a managed service.
