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

### Client-Side Env Var Inlining (Critical)
- `NEXT_PUBLIC_*` env vars must be available at **build time** for Next.js to inline them into client-side JavaScript bundles.
- **Next.js only inlines literal `process.env.NEXT_PUBLIC_*` access.** Dynamic access like `process.env[name]` does NOT get replaced by webpack DefinePlugin, even if the variable name starts with `NEXT_PUBLIC_`.
- The shared `@brildesk/supabase` package originally used a dynamic `getEnv()` helper (`process.env[name]`) — this caused a client-side crash because the values were never inlined. **Fixed** by changing to direct `process.env.NEXT_PUBLIC_SUPABASE_URL` access in `packages/supabase/src/client.ts`.
- Setting env vars only as Cloudflare Pages runtime env vars is **not enough** — they must be present during `next build`.
- Solution: `apps/app/.env.production` contains the production `NEXT_PUBLIC_*` values (safe to commit since these are public anon keys).

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

### Service Worker Cache Versioning
- The SW uses a `CACHE_NAME` constant (e.g., `brildesk-v2`). When bumped, the activate handler clears all old caches.
- **Important:** If a broken deploy gets cached by the SW, the stale JS will keep being served even after redeploying. Bump the cache version to force cache clearing.
- The SW file itself (`sw.js`) is served without cache headers, so browsers check for updates on each page load. But the cached assets inside the SW cache persist until the new SW activates and clears them.
