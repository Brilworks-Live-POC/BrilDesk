import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client for browser / client-side usage.
 * Uses the public anon key — all access is governed by RLS.
 */
export function createBrowserClient(): TypedSupabaseClient {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient<Database>(url, anonKey);
}

function getEnv(name: string): string {
  // Works in both Node (process.env) and edge/browser contexts
  const value =
    typeof process !== "undefined" && process.env
      ? process.env[name]
      : undefined;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
