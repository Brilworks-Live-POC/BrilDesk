/**
 * @brildesk/supabase — Browser client (Cloudflare Pages / Next.js client components)
 *
 * Uses the anon key. RLS policies enforce access control.
 */
export { createBrowserClient } from "./client.js";
export type { Database, Tables, InsertDto, UpdateDto, Enums, Json } from "./database.types.js";
