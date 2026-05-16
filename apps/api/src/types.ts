import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cloudflare Worker environment bindings.
 */
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  RESEND_API_KEY: string;
  RESEND_WEBHOOK_SECRET?: string;
  EMAIL_FROM_ADDRESS?: string;
  API_BASE_URL?: string;
}

export type UserRole = "agent" | "manager" | "admin" | "superadmin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  team_id: string | null;
}

/**
 * Hono context variables set by middleware.
 */
export interface AppVariables {
  user: AuthUser;
  supabase: SupabaseClient;
  serviceClient: SupabaseClient;
}
