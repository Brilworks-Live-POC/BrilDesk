# Code Quality Standards

This document defines the code quality standards, review process, and tooling enforced across the BrilDesk project.

## Code Review Process

Every change goes through pull request review before merging. Reviews enforce:

- **TypeScript strict mode compliance** — all packages compile with `"strict": true`. No `any` casts without justification.
- **Zod input validation at every API boundary** — all request bodies and query params are validated with Zod schemas using `safeParse()`. Invalid input returns `400` with structured error details.
- **Parameterized queries only** — no string-concatenated SQL. All database access goes through the Supabase client SDK, which parameterizes queries by default.
- **Auth middleware coverage on all protected routes** — every non-public endpoint validates the JWT via Supabase auth middleware before processing.
- **Tests for new features and bug fixes** — new functionality and regressions require accompanying test coverage.

### Review Checklist

Reviewers should verify:

| Check | What to look for |
|---|---|
| Type safety | No `as any`, no `@ts-ignore` without explanation |
| Input validation | Zod schema defined and applied for all user-supplied data |
| SQL safety | No raw SQL string concatenation; Supabase client or parameterized queries only |
| Auth | Protected routes use auth middleware; RLS policies cover the table |
| Error handling | Errors return structured JSON with appropriate HTTP status codes |
| Secrets | No hardcoded credentials, API keys, or tokens in source |
| Naming | Consistent naming conventions (camelCase for variables, PascalCase for types) |

## Static Analysis and Tooling

### TypeScript Strict Mode

All packages enforce TypeScript strict mode via the shared base config at `packages/tsconfig/base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  }
}
```

**Target runtimes:**
- API (`apps/api`): ES2022, module ES2022
- Web (`apps/web`): ES2017, JSX preserve (Next.js)
- Shared (`packages/shared`): ES2022, module ESNext

Run type checking across all packages:

```bash
pnpm turbo typecheck
```

### ESLint

ESLint v9 with TypeScript ESLint is enforced across backend and frontend. The shared config lives at `packages/eslint-config/base.js`.

**Key rules:**
- `@typescript-eslint/no-unused-vars`: warn (underscore-prefixed params ignored)
- `@typescript-eslint/no-explicit-any`: warn

**Ignored paths:** `dist/`, `.next/`, `node_modules/`

Run linting across all packages:

```bash
pnpm turbo lint
```

### Prettier

Prettier v3.5 enforces consistent formatting. Configuration (`.prettierrc`):

- Semicolons: enabled
- Single quotes: enabled
- Trailing commas: all
- Print width: 100

Run formatting:

```bash
pnpm format
```

### Zod Runtime Validation

Zod v3.24 provides runtime schema validation at every API boundary. All API routes in `apps/api/src/routes/` follow this pattern:

```typescript
const schema = z.object({
  field: z.string().min(1),
  id: z.string().uuid(),
});

const result = schema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error.flatten() });
}
```

**Routes with Zod validation:**
- `messages.ts` — sendMessageSchema, noteSchema
- `conversations.ts` — conversation filters and updates
- `profiles.ts` — profile creation and updates
- `admin.ts` — admin operations
- `quick-replies.ts` — quick reply CRUD

## Build Pipeline

Turbo v2.5 orchestrates all build, lint, and typecheck tasks with dependency-aware caching:

```bash
# Full quality check
pnpm turbo lint typecheck build

# Individual checks
pnpm turbo lint        # ESLint across all packages
pnpm turbo typecheck   # TypeScript strict mode across all packages
pnpm turbo build       # Production builds
```

### Pipeline Dependency Order

```
packages/shared (lint + typecheck)
    |
    +---> apps/api (lint + typecheck + build)
    +---> apps/web (lint + typecheck + build)
```

## CI/CD Integration

### Current Enforcement

Quality checks are enforced locally via Turbo commands. The build pipeline runs:

1. `pnpm turbo lint` — ESLint across all packages
2. `pnpm turbo typecheck` — TypeScript strict mode compilation
3. `pnpm turbo build` — production build (Cloudflare Workers for API, Cloudflare Pages for Web)

### Recommended CI Additions

The following tools can be integrated into the client's CI pipeline post-handover:

| Tool | Purpose | Integration |
|---|---|---|
| **SonarQube** | Static code analysis, code smells, duplications | GitHub Actions or self-hosted |
| **Snyk** | Dependency vulnerability scanning | `snyk test` in CI pipeline |
| **GitHub Actions** | Automated PR checks | `.github/workflows/ci.yml` |

### Recommended GitHub Actions Workflow

```yaml
name: CI
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint
      - run: pnpm turbo typecheck
      - run: pnpm turbo build
```

## Security Standards

### Input Validation

- All user input validated with Zod schemas before processing
- UUID format enforced for all ID parameters
- String length constraints on text fields

### Authentication

- Supabase Auth with JWT tokens
- Auth middleware validates tokens on every protected route
- Row Level Security (RLS) policies enforce data isolation at the database level

### SQL Injection Prevention

- All database access through Supabase client SDK (parameterized by default)
- No raw SQL string concatenation anywhere in the codebase
- Database functions use `SECURITY DEFINER` with explicit search path

### Secrets Management

- All secrets stored as environment variables, never in source code
- Production secrets managed via `wrangler secret put`
- `.env` files excluded from version control via `.gitignore`

## Testing Standards

### Current State

The project does not yet have a unit/integration testing framework configured. This is a known gap.

### Recommended Setup

- **Framework:** Vitest (fast, TypeScript-native, compatible with the ESM module system)
- **API testing:** Supertest or direct handler invocation for Hono routes
- **Coverage target:** 80% for business logic, 100% for Zod schemas

### Test Categories

| Category | Scope | Priority |
|---|---|---|
| Unit tests | Zod schemas, utility functions, type guards | High |
| Integration tests | API route handlers with real Supabase (test project) | High |
| E2E tests | Critical user flows (login, send message, view inbox) | Medium |

## Environment

- **Node.js:** >=20
- **Package manager:** pnpm v10.33.2
- **Monorepo orchestration:** Turbo v2.5.0
- **Runtime:** Cloudflare Workers (API), Cloudflare Pages (Web)
