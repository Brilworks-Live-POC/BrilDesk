import { Hono } from "hono";
import { z } from "zod";
import type { Env, AppVariables } from "../types.js";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

/**
 * GET /api/profiles/me — current user's profile
 */
app.get("/me", async (c) => {
  const user = c.get("user");
  const supabase = c.get("supabase");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, team_id, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return c.json({ error: "Profile not found" }, 404);
  }

  return c.json({ data });
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

/**
 * PATCH /api/profiles/me — update own profile
 */
app.patch("/me", async (c) => {
  const user = c.get("user");
  const supabase = c.get("supabase");

  const raw = await c.req.json();
  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

/**
 * GET /api/profiles/:id — get another user's public profile (team-scoped)
 */
app.get("/:id", async (c) => {
  const supabase = c.get("supabase");
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, team_id, avatar_url")
    .eq("id", id)
    .single();

  if (error || !data) {
    return c.json({ error: "Profile not found" }, 404);
  }

  return c.json({ data });
});

export default app;
