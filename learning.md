# Learnings & Operational Notes

## Cloudflare Pages Deployment

### Project Names
- **`brildesk-web-dev`** — the main app (`app.brildesk.saas-yard.com`), deployed from `apps/app/`
- **`brildesk-marketing-dev`** — marketing site (`brildesk.saas-yard.com`), deployed from `apps/marketing/`
- Deploy is **manual** (no git integration). Pushing to GitHub does NOT auto-deploy.

### Credentials (env vars)
- `cloudflare_token` — Cloudflare API token
- `cloudflare_account_id` — Cloudflare account ID

### Deploy Command
```bash
cd apps/app
npx @cloudflare/next-on-pages          # build for Cloudflare Pages
CLOUDFLARE_API_TOKEN=$cloudflare_token \
CLOUDFLARE_ACCOUNT_ID=$cloudflare_account_id \
npx wrangler pages deploy .vercel/output/static --project-name brildesk-web-dev --branch main --commit-dirty=true
```

### Production Environment Variables
The Cloudflare Pages project requires these env vars set in the **production** environment (not just preview):
- `NEXT_PUBLIC_SUPABASE_URL` — production Supabase URL (`https://yqbzdaaprgcnainzrrqm.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — production Supabase anon key
- `NEXT_PUBLIC_API_URL` — API worker URL (`https://brildesk-api-dev.vksingh-bril.workers.dev`)

**Lesson learned:** If env vars are only in preview but not production, the deploy will return a 500 error because the middleware can't connect to Supabase.

### Client-Side Env Var Inlining
- `NEXT_PUBLIC_*` env vars must be available at **build time** for Next.js to inline them into client-side JavaScript bundles.
- The shared `@brildesk/supabase` package uses a dynamic `getEnv()` function (`process.env[name]`), but Next.js still inlines the values when the underlying webpack DefinePlugin replaces `process.env.NEXT_PUBLIC_*` before the dynamic lookup.
- Setting env vars only as Cloudflare Pages runtime env vars is **not enough** — they must be present during `next build`.
- Solution: create `apps/app/.env.production` with the production `NEXT_PUBLIC_*` values. This file is safe to commit since it only contains public (anon) keys.

### Build Script
- `package.json` `build` script is `next build` (not `@cloudflare/next-on-pages`) to avoid recursive invocation when `vercel build` calls `pnpm run build`.
- Use `pages:build` or run `npx @cloudflare/next-on-pages` directly for Cloudflare Pages builds.

### Wrangler Config
- `wrangler.toml` only supports `preview` and `production` environments for Pages — `staging` will cause a validation error.

## PWA Implementation

### Files Added
- `apps/app/public/manifest.json` — web app manifest
- `apps/app/public/sw.js` — service worker (network-first for navigation, cache-first for static assets)
- `apps/app/public/icons/` — app icons (192x192, 512x512, regular + maskable)
- `apps/app/src/app/layout.tsx` — PWA metadata (manifest link, viewport, theme-color, apple-touch-icon, SW registration)

### Middleware Considerations
- PWA static files (`manifest.json`, `sw.js`, `/icons/*`) must be excluded from the Next.js middleware matcher, otherwise the auth middleware redirects unauthenticated requests for these files to `/login`.
- Exclusion is done in `src/middleware.ts` matcher regex AND in the `isPublicRoute` check in `src/lib/supabase/middleware.ts`.

### Service Worker Strategy
- **Network-first** for page navigations (with offline fallback to cached shell)
- **Cache-first** for static assets (`_next/static`, icons, fonts, CSS, JS)
- **Network-only** for API (`/api/`) and auth (`/auth/`) routes — never cached
