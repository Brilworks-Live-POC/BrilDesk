import type { Env } from "../types";
import { createClient } from "@supabase/supabase-js";

const RESEND_API = "https://api.resend.com";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  templateKey: string;
  category: "transactional" | "marketing";
  metadata?: Record<string, string>;
  headers?: Record<string, string>;
}

interface ResendResponse {
  id: string;
}

interface ResendError {
  statusCode: number;
  message: string;
  name: string;
}

/**
 * Check if an email address has unsubscribed from a given category.
 */
export async function isUnsubscribed(
  env: Env,
  email: string,
  category: "transactional" | "marketing",
): Promise<boolean> {
  // Never block transactional email (CAN-SPAM allows transactional without opt-in)
  if (category === "transactional") return false;

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await supabase
    .from("email_unsubscribes")
    .select("id")
    .eq("email", email)
    .eq("category", category)
    .single();

  return !!data;
}

/**
 * Send an email via Resend and log it in the email_sends table.
 */
export async function sendEmail(
  env: Env,
  options: SendEmailOptions,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const {
    to,
    subject,
    html,
    from = `BrilDesk <${env.EMAIL_FROM_ADDRESS || "hello@brildesk.com"}>`,
    replyTo,
    templateKey,
    category,
    metadata = {},
    headers = {},
  } = options;

  // Check unsubscribe status for marketing emails
  if (await isUnsubscribed(env, to, category)) {
    return { success: false, error: "recipient_unsubscribed" };
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Add List-Unsubscribe header for marketing emails (CAN-SPAM / RFC 8058)
  const emailHeaders: Record<string, string> = { ...headers };
  if (category === "marketing") {
    const unsubUrl = `${env.API_BASE_URL || "https://api.brildesk.com"}/api/email/unsubscribe?email=${encodeURIComponent(to)}&category=marketing`;
    emailHeaders["List-Unsubscribe"] = `<${unsubUrl}>`;
    emailHeaders["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  // Insert tracking row
  const { data: sendRow, error: insertErr } = await supabase
    .from("email_sends")
    .insert({
      to_email: to,
      from_email: from,
      subject,
      template_key: templateKey,
      category,
      status: "queued",
      metadata,
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error("[email] Failed to insert tracking row:", insertErr);
    return { success: false, error: "tracking_insert_failed" };
  }

  // Call Resend API
  const body: Record<string, unknown> = {
    from,
    to: [to],
    subject,
    html,
    headers: emailHeaders,
  };
  if (replyTo) body.reply_to = replyTo;

  const res = await fetch(`${RESEND_API}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json()) as ResendError;
    console.error("[email] Resend API error:", err);
    // Update tracking row to failed status
    await supabase
      .from("email_sends")
      .update({ status: "bounced", metadata: { ...metadata, error: err.message } })
      .eq("id", sendRow!.id);
    return { success: false, error: err.message };
  }

  const result = (await res.json()) as ResendResponse;

  // Update tracking row with Resend ID
  await supabase
    .from("email_sends")
    .update({ status: "sent", resend_id: result.id })
    .eq("id", sendRow!.id);

  return { success: true, id: result.id };
}

/**
 * Send a batch of emails (up to 100 per Resend batch call).
 */
export async function sendBatchEmails(
  env: Env,
  emails: SendEmailOptions[],
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Send sequentially to respect rate limits and track individually
  for (const email of emails) {
    const result = await sendEmail(env, email);
    if (result.success) {
      sent++;
    } else {
      failed++;
      errors.push(`${email.to}: ${result.error}`);
    }
  }

  return { sent, failed, errors };
}
