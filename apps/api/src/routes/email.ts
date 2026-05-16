import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Env, AppVariables } from "../types.js";

const emailRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

function getSupabase(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

// ---------- Public: One-click unsubscribe (GET + POST for RFC 8058) ----------

emailRoutes.get("/unsubscribe", async (c) => {
  const email = c.req.query("email");
  const category = c.req.query("category") || "marketing";

  if (!email) {
    return c.html("<h1>Invalid unsubscribe link</h1>", 400);
  }

  const supabase = getSupabase(c.env);
  await supabase.from("email_unsubscribes").upsert(
    { email, category, reason: "one-click" },
    { onConflict: "email,category" },
  );

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="margin:0;padding:40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;">
      <h1 style="color:#111827;">You've been unsubscribed</h1>
      <p style="color:#6b7280;font-size:16px;">
        You will no longer receive ${category} emails from BrilDesk.
      </p>
      <p style="color:#6b7280;font-size:14px;margin-top:24px;">
        If this was a mistake, contact us at support@brildesk.com.
      </p>
    </body>
    </html>
  `);
});

// POST handler for RFC 8058 List-Unsubscribe-Post
emailRoutes.post("/unsubscribe", async (c) => {
  const email = c.req.query("email");
  const category = c.req.query("category") || "marketing";

  if (!email) {
    return c.json({ error: "Missing email" }, 400);
  }

  const supabase = getSupabase(c.env);
  await supabase.from("email_unsubscribes").upsert(
    { email, category, reason: "list-unsubscribe-post" },
    { onConflict: "email,category" },
  );

  return c.json({ ok: true });
});

// ---------- Resend webhook: open/click/bounce tracking ----------

emailRoutes.post("/webhook", async (c) => {
  // Resend sends webhook events for email status changes.
  // In production, verify the webhook signature via the svix headers.
  // For now, we rely on the webhook URL being secret.
  const webhookSecret = c.env.RESEND_WEBHOOK_SECRET;

  if (webhookSecret) {
    // Basic shared-secret check via query param (simple alternative to svix verification)
    const token = c.req.query("token");
    if (token !== webhookSecret) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  const payload = await c.req.json();
  const { type, data } = payload;

  if (!type || !data) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const supabase = getSupabase(c.env);
  const resendId = data.email_id;

  if (!resendId) {
    return c.json({ ok: true }); // Ignore events without email_id
  }

  const updateFields: Record<string, unknown> = {};

  switch (type) {
    case "email.sent":
      updateFields.status = "sent";
      break;
    case "email.delivered":
      updateFields.status = "delivered";
      break;
    case "email.opened":
      updateFields.status = "opened";
      updateFields.opened_at = new Date().toISOString();
      break;
    case "email.clicked":
      updateFields.status = "clicked";
      updateFields.clicked_at = new Date().toISOString();
      break;
    case "email.bounced":
      updateFields.status = "bounced";
      updateFields.bounced_at = new Date().toISOString();
      break;
    case "email.complained":
      updateFields.status = "complained";
      // Auto-unsubscribe on complaint (CAN-SPAM)
      if (data.to?.[0]) {
        await supabase.from("email_unsubscribes").upsert(
          { email: data.to[0], category: "marketing", reason: "complaint" },
          { onConflict: "email,category" },
        );
      }
      break;
    default:
      return c.json({ ok: true }); // Unknown event type, ignore
  }

  if (Object.keys(updateFields).length > 0) {
    await supabase
      .from("email_sends")
      .update(updateFields)
      .eq("resend_id", resendId);
  }

  return c.json({ ok: true });
});

export default emailRoutes;
