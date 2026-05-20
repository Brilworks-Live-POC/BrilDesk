import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client for browser / client-side usage.
 * Uses the public anon key — all access is governed by RLS.
 */
export function createBrowserClient(): TypedSupabaseClient {
  // Access process.env.NEXT_PUBLIC_* directly so Next.js can inline
  // the values at build time. Dynamic access (process.env[name]) does
  // not get replaced by webpack's DefinePlugin.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient<Database>(url, anonKey);
}
