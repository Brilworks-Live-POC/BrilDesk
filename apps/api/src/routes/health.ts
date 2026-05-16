import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /health — liveness + readiness probe.
 * Verifies Supabase connectivity without requiring auth.
 */
app.get("/", async (c) => {
  const start = Date.now();

  let dbOk = false;
  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    // Lightweight check: just hit the REST metadata endpoint
    const { error } = await supabase.from("teams").select("id").limit(1);
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? "ok" : "degraded";
  const latencyMs = Date.now() - start;

  return c.json(
    {
      status,
      services: { supabase: dbOk ? "ok" : "error" },
      latencyMs,
      timestamp: new Date().toISOString(),
    },
    dbOk ? 200 : 503,
  );
});

export default app;
