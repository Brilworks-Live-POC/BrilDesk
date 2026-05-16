import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";
import type { Env, AppVariables, UserRole } from "../types";

/**
 * Auth middleware: verifies Supabase JWT from Authorization header,
 * fetches user profile, and sets context variables.
 */
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: AppVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  // Create a per-request client with the user's JWT
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify the token by fetching the user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  // Fetch the profile to get role and team_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, team_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return c.json({ error: "User profile not found" }, 403);
  }

  // Service-role client for operations that bypass RLS
  const serviceClient = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  c.set("user", {
    id: user.id,
    email: user.email ?? "",
    role: profile.role as UserRole,
    team_id: profile.team_id,
  });
  c.set("supabase", supabase);
  c.set("serviceClient", serviceClient);

  await next();
});

/**
 * Role guard factory: returns middleware that rejects if user role
 * is not in the allowed list.
 */
export function requireRole(...roles: UserRole[]) {
  return createMiddleware<{
    Bindings: Env;
    Variables: AppVariables;
  }>(async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json({ error: "Insufficient permissions" }, 403);
    }
    await next();
  });
}
