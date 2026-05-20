import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Create a Supabase client for browser / client-side usage.
 * Uses @supabase/ssr's createBrowserClient so auth tokens are stored
 * in cookies (not localStorage), which the Next.js middleware can read.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createSSRBrowserClient<Database>(url, anonKey);
}
