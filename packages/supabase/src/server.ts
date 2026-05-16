/**
 * @brildesk/supabase/server — Server-side clients for Cloudflare Workers and Node.
 *
 * Two client flavours:
 *  - createServerClient(accessToken): per-request client that impersonates
 *    the authenticated user (RLS-governed).
 *  - createServiceClient(): uses the service_role key, bypasses RLS.
 *    Use only for admin/system operations (webhooks, cron, superadmin views).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

export type TypedSupabaseClient = SupabaseClient<Database>;

export interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Per-request client that forwards the user's JWT.
 * Use inside Cloudflare Workers / Hono middleware after extracting
 * the access token from the Authorization header.
 */
export function createServerClient(
  env: SupabaseEnv,
  accessToken: string,
): TypedSupabaseClient {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Service-role client — bypasses RLS. Use for:
 *  - Webhook handlers (WhatsApp inbound)
 *  - Background workers / cron jobs
 *  - Superadmin data access layer
 */
export function createServiceClient(env: SupabaseEnv): TypedSupabaseClient {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type { Database, Tables, InsertDto, UpdateDto, Enums, Json } from "./database.types.js";
