import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

// ---- WhatsApp Cloud API Webhook ----

/**
 * GET /api/webhook/whatsapp — hub verification (required by Meta)
 */
app.get("/whatsapp", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === c.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("[Webhook] WhatsApp hub verified");
    return c.text(challenge ?? "", 200);
  }

  return c.json({ error: "Forbidden" }, 403);
});

/**
 * POST /api/webhook/whatsapp — inbound message handler
 *
 * Meta sends events here when a WhatsApp user sends a message.
 * We:
 *  1. Verify the payload signature (X-Hub-Signature-256)
 *  2. Upsert the contact as a conversation row
 *  3. Insert the message
 *  4. Update conversation last_message_at
 *
 * Supabase Realtime notifies the frontend automatically via the
 * change capture on messages / conversations tables.
 */
app.post("/whatsapp", async (c) => {
  const rawBody = await c.req.text();

  // Meta signature verification
  const signature = c.req.header("X-Hub-Signature-256");
  if (signature) {
    const isValid = await verifySignature(
      rawBody,
      signature,
      c.env.WHATSAPP_VERIFY_TOKEN,
    );
    if (!isValid) {
      return c.json({ error: "Invalid signature" }, 401);
    }
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  // Service-role client — webhook bypasses user auth
  const serviceClient = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue;

      for (const msg of value.messages) {
        const from = msg.from; // phone number
        const contactName =
          value.contacts?.find((c) => c.wa_id === from)?.profile?.name ?? null;
        const body =
          msg.type === "text" ? (msg.text?.body ?? null) : null;
        const waMessageId = msg.id;

        // Upsert conversation — find by phone or create
        const { data: conversation, error: convError } = await serviceClient
          .from("conversations")
          .upsert(
            {
              wa_contact_phone: from,
              wa_contact_name: contactName,
              status: "open",
              last_message_at: new Date().toISOString(),
            },
            { onConflict: "wa_contact_phone", ignoreDuplicates: false },
          )
          .select("id")
          .single();

        if (convError || !conversation) {
          console.error("[Webhook] Failed to upsert conversation:", convError?.message);
          continue;
        }

        // Insert message
        const { error: msgError } = await serviceClient.from("messages").insert({
          conversation_id: conversation.id,
          direction: "inbound",
          body,
          sender_type: "contact",
          wa_message_id: waMessageId,
          status: "delivered",
          timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
        });

        if (msgError) {
          console.error("[Webhook] Failed to insert message:", msgError.message);
        }
      }
    }
  }

  // Meta expects a 200 OK
  return c.json({ status: "ok" });
});

/**
 * POST /api/webhook/whatsapp/status — message status updates from Meta
 * (delivered, read, failed)
 */
app.post("/whatsapp/status", async (c) => {
  const rawBody = await c.req.text();
  let payload: WhatsAppStatusPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppStatusPayload;
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const serviceClient = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const status of change.value?.statuses ?? []) {
        const mapped =
          status.status === "read"
            ? "read"
            : status.status === "delivered"
              ? "delivered"
              : status.status === "failed"
                ? "failed"
                : null;

        if (!mapped) continue;

        await serviceClient
          .from("messages")
          .update({ status: mapped })
          .eq("wa_message_id", status.id);
      }
    }
  }

  return c.json({ status: "ok" });
});

// ---- Signature verification ----

async function verifySignature(
  body: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const expected = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === expected;
}

// ---- Type definitions for WhatsApp Cloud API payloads ----

interface WhatsAppContact {
  wa_id: string;
  profile?: { name?: string };
}

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

interface WhatsAppWebhookPayload {
  entry?: {
    changes?: {
      value?: {
        contacts?: WhatsAppContact[];
        messages?: WhatsAppMessage[];
      };
    }[];
  }[];
}

interface WhatsAppStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
}

interface WhatsAppStatusPayload {
  entry?: {
    changes?: {
      value?: {
        statuses?: WhatsAppStatus[];
      };
    }[];
  }[];
}

export default app;
