import { Hono } from "hono";
import { z } from "zod";
import type { Env, AppVariables } from "../types.js";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  body: z.string().min(1),
});

/**
 * POST /api/messages — send outbound message
 *
 * Inserts a message record, calls WhatsApp Cloud API to deliver,
 * and updates conversation last_message_at.
 */
app.post("/", async (c) => {
  const user = c.get("user");
  const supabase = c.get("supabase");

  const raw = await c.req.json();
  const parsed = sendMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { conversation_id, body } = parsed.data;

  // Fetch conversation to get the phone number
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("wa_contact_phone")
    .eq("id", conversation_id)
    .single();

  if (convError || !conversation) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  // Send via WhatsApp Cloud API
  const waResponse = await fetch(
    `https://graph.facebook.com/v21.0/${c.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: conversation.wa_contact_phone,
        type: "text",
        text: { body },
      }),
    },
  );

  const waResult = (await waResponse.json()) as {
    messages?: { id: string }[];
    error?: { message: string };
  };

  if (!waResponse.ok || waResult.error) {
    return c.json(
      { error: waResult.error?.message ?? "WhatsApp API error" },
      502,
    );
  }

  const waMessageId = waResult.messages?.[0]?.id ?? null;

  // Store the message
  const { data: message, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      direction: "outbound",
      body,
      sender_type: "agent",
      sender_id: user.id,
      wa_message_id: waMessageId,
      status: "sent",
    })
    .select()
    .single();

  if (insertError) {
    return c.json({ error: insertError.message }, 500);
  }

  // Update conversation last_message_at
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversation_id);

  return c.json({ data: message }, 201);
});

export default app;
