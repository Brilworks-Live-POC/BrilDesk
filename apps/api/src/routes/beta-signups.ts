import { Hono } from "hono";
import type { Env, AppVariables } from "../types.js";
import { createClient } from "@supabase/supabase-js";

const betaSignups = new Hono<{ Bindings: Env; Variables: AppVariables }>();

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BD-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getSupabase(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

// POST /api/beta-signups — create a new beta signup
betaSignups.post("/", async (c) => {
  const body = await c.req.json();
  const { name, email, team_size, messages_per_day, referral, utm_source, utm_medium, utm_campaign, utm_content } = body;

  if (!name || !email || !team_size || !messages_per_day) {
    return c.json({ error: "Missing required fields: name, email, team_size, messages_per_day" }, 400);
  }

  const supabase = getSupabase(c.env);

  // Check if email already exists
  const { data: existing } = await supabase
    .from("beta_signups")
    .select("id, queue_position, referral_code")
    .eq("email", email)
    .single();

  if (existing) {
    return c.json({
      queue_position: existing.queue_position,
      referral_code: existing.referral_code,
      already_signed_up: true,
    });
  }

  // Get current max queue position
  const { data: maxRow } = await supabase
    .from("beta_signups")
    .select("queue_position")
    .order("queue_position", { ascending: false })
    .limit(1)
    .single();

  const nextPosition = (maxRow?.queue_position ?? 0) + 1;
  const referralCode = generateReferralCode();

  // Insert signup
  const { data: signup, error } = await supabase
    .from("beta_signups")
    .insert({
      name,
      email,
      team_size,
      messages_per_day,
      queue_position: nextPosition,
      referral_code: referralCode,
      referred_by: referral || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
    })
    .select("id, queue_position, referral_code")
    .single();

  if (error) {
    console.error("[beta-signups] Insert error:", error);
    return c.json({ error: "Failed to create signup" }, 500);
  }

  // If referred by someone, increment their referral count and move them up
  if (referral) {
    const { data: referrer } = await supabase
      .from("beta_signups")
      .select("id, queue_position, referral_count")
      .eq("referral_code", referral)
      .single();

    if (referrer) {
      const newPosition = Math.max(1, referrer.queue_position - 5);
      await supabase
        .from("beta_signups")
        .update({
          referral_count: referrer.referral_count + 1,
          queue_position: newPosition,
        })
        .eq("id", referrer.id);
    }
  }

  return c.json({
    queue_position: signup!.queue_position,
    referral_code: signup!.referral_code,
    already_signed_up: false,
  }, 201);
});

// POST /api/beta-signups/qualify — save qualification answers (non-blocking)
betaSignups.post("/qualify", async (c) => {
  const body = await c.req.json();
  const { email, answers } = body;

  if (!email || !answers) {
    return c.json({ error: "Missing email or answers" }, 400);
  }

  // For now, just log qualification answers. Could store in a separate table later.
  console.log("[beta-signups] Qualification:", { email, answers });
  return c.json({ ok: true });
});

export default betaSignups;
