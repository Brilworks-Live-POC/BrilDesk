import { Hono } from "hono";
import { z } from "zod";
import type { Env, AppVariables } from "../types";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

/**
 * GET /api/conversations — list with pagination and filters
 */
app.get("/", async (c) => {
  const user = c.get("user");
  const supabase = c.get("supabase");

  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") ?? 20)));
  const offset = (page - 1) * limit;
  const status = c.req.query("status");
  const assignee = c.req.query("assignee");

  let query = supabase
    .from("conversations")
    .select("*, assigned_to:profiles!assigned_to_id(id, name, email)", {
      count: "exact",
    })
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  // For non-superadmin, filter by team
  if (user.role !== "superadmin" && user.team_id) {
    query = query.eq("team_id", user.team_id);
  }

  if (status) {
    query = query.eq("status", status);
  }
  if (assignee) {
    query = query.eq("assigned_to_id", assignee);
  }

  const { data, error, count } = await query;

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({
    data,
    pagination: { page, limit, total: count ?? 0 },
  });
});

/**
 * GET /api/conversations/:id — single conversation with messages
 */
app.get("/:id", async (c) => {
  const supabase = c.get("supabase");
  const id = c.req.param("id");

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*, assigned_to:profiles!assigned_to_id(id, name, email)")
    .eq("id", id)
    .single();

  if (error || !conversation) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("timestamp", { ascending: true });

  return c.json({ data: { ...conversation, messages: messages ?? [] } });
});

const assignSchema = z.object({ assigned_to_id: z.string().uuid() });

/**
 * PATCH /api/conversations/:id/assign — assign agent
 */
app.patch("/:id/assign", async (c) => {
  const supabase = c.get("supabase");
  const id = c.req.param("id");

  const body = await c.req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { data, error } = await supabase
    .from("conversations")
    .update({ assigned_to_id: parsed.data.assigned_to_id })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

const statusSchema = z.object({
  status: z.enum(["open", "waiting", "resolved", "closed"]),
});

/**
 * PATCH /api/conversations/:id/status — update status
 */
app.patch("/:id/status", async (c) => {
  const supabase = c.get("supabase");
  const id = c.req.param("id");

  const body = await c.req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { data, error } = await supabase
    .from("conversations")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

export default app;
