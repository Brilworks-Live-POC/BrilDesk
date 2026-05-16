import { Hono } from "hono";
import { z } from "zod";
import type { Env, AppVariables } from "../types";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

/**
 * GET /api/quick-replies — list quick replies for the user's team
 */
app.get("/", async (c) => {
  const supabase = c.get("supabase");
  const user = c.get("user");

  let query = supabase
    .from("quick_replies")
    .select("*")
    .order("created_at", { ascending: false });

  if (user.role !== "superadmin" && user.team_id) {
    query = query.eq("team_id", user.team_id);
  }

  const { data, error } = await query;

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

/**
 * GET /api/quick-replies/:id
 */
app.get("/:id", async (c) => {
  const supabase = c.get("supabase");
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("quick_replies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return c.json({ error: "Quick reply not found" }, 404);
  }

  return c.json({ data });
});

const quickReplySchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
});

/**
 * POST /api/quick-replies — create a new quick reply
 */
app.post("/", async (c) => {
  const supabase = c.get("supabase");
  const user = c.get("user");

  const raw = await c.req.json();
  const parsed = quickReplySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { data, error } = await supabase
    .from("quick_replies")
    .insert({
      title: parsed.data.title,
      body: parsed.data.body,
      team_id: user.team_id,
      created_by_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data }, 201);
});

/**
 * PUT /api/quick-replies/:id — update quick reply
 */
app.put("/:id", async (c) => {
  const supabase = c.get("supabase");
  const id = c.req.param("id");

  const raw = await c.req.json();
  const parsed = quickReplySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { data, error } = await supabase
    .from("quick_replies")
    .update({ title: parsed.data.title, body: parsed.data.body })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

/**
 * DELETE /api/quick-replies/:id
 */
app.delete("/:id", async (c) => {
  const supabase = c.get("supabase");
  const id = c.req.param("id");

  const { error } = await supabase
    .from("quick_replies")
    .delete()
    .eq("id", id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

export default app;
