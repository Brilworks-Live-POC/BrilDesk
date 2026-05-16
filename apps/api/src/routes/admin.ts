import { Hono } from "hono";
import { z } from "zod";
import { requireRole } from "../middleware/auth.js";
import type { Env, AppVariables } from "../types.js";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// All admin routes require at least admin role
app.use("/*", requireRole("admin", "superadmin"));

/**
 * GET /api/admin/users — list users
 * Admin: team-scoped. Superadmin: all users.
 */
app.get("/users", async (c) => {
  const user = c.get("user");
  const serviceClient = c.get("serviceClient");

  let query = serviceClient
    .from("profiles")
    .select("id, email, name, role, team_id, avatar_url, created_at")
    .order("created_at", { ascending: false });

  if (user.role === "admin" && user.team_id) {
    query = query.eq("team_id", user.team_id);
  }

  const { data, error } = await query;

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

const roleUpdateSchema = z.object({
  role: z.enum(["agent", "manager", "admin", "superadmin"]),
});

/**
 * PATCH /api/admin/users/:id/role — update user role
 * Admin: can set agent/manager within team. Superadmin: any role.
 */
app.patch("/users/:id/role", async (c) => {
  const user = c.get("user");
  const serviceClient = c.get("serviceClient");
  const targetId = c.req.param("id");

  const raw = await c.req.json();
  const parsed = roleUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const newRole = parsed.data.role;

  // Only superadmin can assign superadmin or admin role
  if (
    (newRole === "superadmin" || newRole === "admin") &&
    user.role !== "superadmin"
  ) {
    return c.json({ error: "Only superadmin can assign admin/superadmin roles" }, 403);
  }

  // Admin can only update users in their team
  if (user.role === "admin" && user.team_id) {
    const { data: target } = await serviceClient
      .from("profiles")
      .select("team_id")
      .eq("id", targetId)
      .single();

    if (!target || target.team_id !== user.team_id) {
      return c.json({ error: "Cannot modify users outside your team" }, 403);
    }
  }

  const { data, error } = await serviceClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetId)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

/**
 * GET /api/admin/teams — list all teams (superadmin only)
 */
app.get("/teams", requireRole("superadmin"), async (c) => {
  const serviceClient = c.get("serviceClient");

  const { data, error } = await serviceClient
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

/**
 * GET /api/admin/stats — dashboard statistics
 */
app.get("/stats", async (c) => {
  const user = c.get("user");
  const serviceClient = c.get("serviceClient");

  const teamFilter =
    user.role === "superadmin" ? {} : { team_id: user.team_id };

  // Parallel queries for stats
  const [convResult, openResult, usersResult, todayMsgResult] =
    await Promise.all([
      serviceClient
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .match(teamFilter),
      serviceClient
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .match({ ...teamFilter, status: "open" }),
      serviceClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .match(user.role === "superadmin" ? {} : { team_id: user.team_id }),
      serviceClient
        .from("messages")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0]),
    ]);

  return c.json({
    data: {
      total_conversations: convResult.count ?? 0,
      open_conversations: openResult.count ?? 0,
      total_users: usersResult.count ?? 0,
      messages_today: todayMsgResult.count ?? 0,
    },
  });
});

export default app;
