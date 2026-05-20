# BrilDesk API Reference

## Overview

The BrilDesk API is built with [Hono](https://hono.dev/) and deployed on Cloudflare Workers. It serves as the backend for WhatsApp messaging, user management, and webhook processing.

**Base URL:**
- Local: `http://localhost:8787`
- Production: `https://api.brildesk.com`

## Authentication

All routes under `/api/*` (except public routes listed below) require a Bearer JWT token in the `Authorization` header:

```
Authorization: Bearer <supabase-jwt>
```

The auth middleware:
1. Extracts and validates the JWT via `supabase.auth.getUser(token)`
2. Fetches the user's profile (role, team_id) from the `profiles` table
3. Sets context: `user` object, `supabase` (user-scoped client), `serviceClient` (RLS-bypass client)

**Roles:** `agent | manager | admin | superadmin`

Invalid or missing tokens return `401`. Missing profile returns `403`.

## Global Middleware

- **Logger** — request logging via `hono/logger`
- **CORS** — origins: `http://localhost:3000`, `https://app.brildesk.com`; methods: GET, POST, PATCH, PUT, DELETE, OPTIONS; credentials: true

## Error Format

All errors return JSON:

```json
{ "error": "Error description" }
```

Validation errors (Zod) return flattened error objects:

```json
{ "error": { "fieldErrors": { "body": ["Required"] }, "formErrors": [] } }
```

**Global handlers:** 404 returns `{ "error": "Not found" }`, 500 returns `{ "error": "Internal server error" }`.

---

## Public Routes

These routes require no authentication.

### `GET /health`

Health check and readiness probe. Verifies Supabase connectivity.

**Response 200:**
```json
{
  "status": "ok",
  "services": { "supabase": "ok" },
  "latencyMs": 42,
  "timestamp": "2026-05-20T10:00:00.000Z"
}
```

**Response 503** (Supabase unreachable):
```json
{
  "status": "degraded",
  "services": { "supabase": "error" },
  "latencyMs": 5000,
  "timestamp": "2026-05-20T10:00:00.000Z"
}
```

---

### `POST /api/beta-signups`

Create a beta waitlist signup.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "team_size": "10-50",
  "messages_per_day": "500",
  "referral": "BD-ABC123",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "launch",
  "utm_content": "hero-cta"
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `email` | string | Yes |
| `team_size` | string | Yes |
| `messages_per_day` | string | Yes |
| `referral` | string | No |
| `utm_source` | string | No |
| `utm_medium` | string | No |
| `utm_campaign` | string | No |
| `utm_content` | string | No |

**Response 201** (new signup):
```json
{
  "queue_position": 42,
  "referral_code": "BD-ABC123",
  "already_signed_up": false
}
```

**Response 200** (existing email):
```json
{
  "queue_position": 42,
  "referral_code": "BD-ABC123",
  "already_signed_up": true
}
```

**Side effects:**
- Sends `signup-confirmation` email (non-blocking via `waitUntil`)
- If `referral` matches an existing signup: bumps referrer up 5 positions and sends `referral-notification` email

**Response 400:** `{ "error": "Missing required fields: name, email, team_size, messages_per_day" }`

---

### `POST /api/beta-signups/qualify`

Save qualification survey answers (logged, not persisted to DB).

**Request body:**
```json
{ "email": "jane@example.com", "answers": { "industry": "SaaS" } }
```

**Response 200:** `{ "ok": true }`
**Response 400:** `{ "error": "Missing email or answers" }`

---

### `GET /api/webhooks/whatsapp`

Meta webhook hub verification. Called by Meta when setting up the webhook subscription.

**Query params:** `hub.mode`, `hub.verify_token`, `hub.challenge`

**Response 200:** Returns `hub.challenge` as plain text (when `mode=subscribe` and token matches `WHATSAPP_VERIFY_TOKEN`)
**Response 403:** `{ "error": "Forbidden" }`

---

### `POST /api/webhooks/whatsapp`

Inbound WhatsApp message handler. Called by Meta when a user sends a message.

**Headers:** `X-Hub-Signature-256: sha256=<hmac>` (optional, verified when present)

**Request body:** Meta WhatsApp Cloud API webhook payload

**Processing:**
1. Verifies HMAC-SHA256 signature (uses `WHATSAPP_VERIFY_TOKEN` as secret)
2. Upserts `conversations` row (ON CONFLICT `wa_contact_phone`)
3. Inserts `messages` row (`direction: "inbound"`, `sender_type: "contact"`, `status: "delivered"`)
4. Supabase Realtime propagates changes to frontend

**Response 200:** `{ "status": "ok" }`
**Response 400:** `{ "error": "Invalid JSON" }`
**Response 401:** `{ "error": "Invalid signature" }`

---

### `POST /api/webhooks/whatsapp/status`

WhatsApp message delivery status updates (sent -> delivered -> read, or failed).

**Request body:** Meta status update payload

**Processing:** Updates `messages.status` matched by `wa_message_id`. Status values: `read`, `delivered`, `failed`.

**Response 200:** `{ "status": "ok" }`
**Response 400:** `{ "error": "Invalid JSON" }`

---

### `GET /api/email/unsubscribe`

One-click unsubscribe (renders HTML confirmation page).

**Query params:**
| Param | Required | Default |
|---|---|---|
| `email` | Yes | — |
| `category` | No | `marketing` |

**Response 200:** HTML unsubscribe confirmation page
**Response 400:** HTML error page

**Side effect:** Upserts `email_unsubscribes` with `reason: "one-click"`.

---

### `POST /api/email/unsubscribe`

RFC 8058 `List-Unsubscribe-Post` handler (called by email clients).

**Query params:** Same as GET above.

**Response 200:** `{ "ok": true }`
**Response 400:** `{ "error": "Missing email" }`

---

### `POST /api/email/webhook`

Resend email event webhook for delivery tracking.

**Auth:** If `RESEND_WEBHOOK_SECRET` is set, requires `?token=<secret>` query param.

**Request body:**
```json
{
  "type": "email.delivered",
  "data": {
    "email_id": "resend_xxx",
    "to": ["user@example.com"]
  }
}
```

**Supported event types and DB updates to `email_sends`:**

| Event | Status Update | Additional |
|---|---|---|
| `email.sent` | `status: "sent"` | — |
| `email.delivered` | `status: "delivered"` | — |
| `email.opened` | `status: "opened"` | `opened_at: now` |
| `email.clicked` | `status: "clicked"` | `clicked_at: now` |
| `email.bounced` | `status: "bounced"` | `bounced_at: now` |
| `email.complained` | `status: "complained"` | Auto-unsubscribes from marketing |

**Response 200:** `{ "ok": true }`
**Response 400:** `{ "error": "Invalid payload" }`
**Response 401:** `{ "error": "Unauthorized" }`

---

## Protected Routes

All routes below require `Authorization: Bearer <jwt>`.

### Conversations

#### `GET /api/conversations`

List conversations with pagination and filters.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |
| `status` | string | — | Filter: `open`, `waiting`, `resolved`, `closed` |
| `assignee` | string | — | Filter by `assigned_to_id` (UUID) |

**Scoping:** Non-superadmin users see only their team's conversations.

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "wa_contact_phone": "+15551234567",
      "wa_contact_name": "John Doe",
      "status": "open",
      "priority": "medium",
      "assigned_to_id": "uuid",
      "team_id": "uuid",
      "last_message_at": "2026-05-20T10:00:00Z",
      "assigned_to": { "id": "uuid", "name": "Alice", "email": "alice@example.com" }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}
```

Ordered by `last_message_at` descending.

---

#### `GET /api/conversations/:id`

Get a single conversation with full message history.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "wa_contact_phone": "+15551234567",
    "status": "open",
    "assigned_to": { "id": "uuid", "name": "Alice", "email": "alice@example.com" },
    "messages": [
      {
        "id": "uuid",
        "direction": "inbound",
        "body": "Hello",
        "sender_type": "contact",
        "status": "delivered",
        "timestamp": "2026-05-20T09:00:00Z"
      }
    ]
  }
}
```

Messages ordered by `timestamp` ascending.

**Response 404:** `{ "error": "Conversation not found" }`

---

#### `PATCH /api/conversations/:id/assign`

Assign a conversation to an agent.

**Request body:**
```json
{ "assigned_to_id": "uuid" }
```

**Response 200:** `{ "data": { ...updated conversation } }`
**Response 400:** Zod validation error (invalid UUID)

---

#### `PATCH /api/conversations/:id/status`

Update conversation status.

**Request body:**
```json
{ "status": "resolved" }
```

Valid values: `open`, `waiting`, `resolved`, `closed`

**Response 200:** `{ "data": { ...updated conversation } }`
**Response 400:** Zod validation error

---

### Messages

#### `POST /api/messages`

Send an outbound WhatsApp message.

**Request body:**
```json
{
  "conversation_id": "uuid",
  "body": "Hello, how can I help?"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `conversation_id` | string (UUID) | Yes | Must exist |
| `body` | string | Yes | Min 1 character |

**Processing:**
1. Validates with Zod
2. Fetches `wa_contact_phone` from conversation
3. Calls WhatsApp Cloud API v21.0 `POST /{phone_id}/messages`
4. Inserts message row (`direction: "outbound"`, `sender_type: "agent"`)
5. Updates `conversations.last_message_at`

**Response 201:** `{ "data": { ...message row } }`
**Response 404:** `{ "error": "Conversation not found" }`
**Response 502:** `{ "error": "WhatsApp API error message" }` (WA API failure)

---

#### `POST /api/messages/note`

Save an internal note (not sent via WhatsApp).

**Request body:**
```json
{
  "conversation_id": "uuid",
  "body": "Customer prefers morning calls"
}
```

**Response 201:** `{ "data": { ...message row } }` — `sender_type: "system"`, `direction: "outbound"`, `status: "delivered"`
**Response 404:** `{ "error": "Conversation not found" }`

---

### Profiles

#### `GET /api/profiles/me`

Get the authenticated user's profile.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "email": "agent@example.com",
    "name": "Alice",
    "role": "agent",
    "team_id": "uuid",
    "avatar_url": null,
    "created_at": "2026-05-16T00:00:00Z"
  }
}
```

**Response 404:** `{ "error": "Profile not found" }`

---

#### `PATCH /api/profiles/me`

Update the authenticated user's profile.

**Request body (all optional):**
```json
{
  "name": "Alice Agent",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

| Field | Type | Constraints |
|---|---|---|
| `name` | string | 1-200 characters |
| `avatar_url` | string or null | Valid URL |

**Response 200:** `{ "data": { ...updated profile } }`
**Response 400:** Zod validation error

---

#### `GET /api/profiles/:id`

Get another user's public profile (team-scoped via RLS).

**Response 200:** `{ "data": { ...profile } }`
**Response 404:** `{ "error": "Profile not found" }`

---

### Quick Replies

#### `GET /api/quick-replies`

List quick replies for the user's team. Ordered by `created_at` descending.

**Scoping:** Non-superadmin users see only their team's replies.

**Response 200:** `{ "data": [ ...quick_reply rows ] }`

---

#### `GET /api/quick-replies/:id`

Get a single quick reply.

**Response 200:** `{ "data": { ...quick_reply } }`
**Response 404:** `{ "error": "Quick reply not found" }`

---

#### `POST /api/quick-replies`

Create a new quick reply.

**Request body:**
```json
{
  "title": "Greeting",
  "body": "Hello! How can I help you today?"
}
```

| Field | Type | Constraints |
|---|---|---|
| `title` | string | 1-200 characters |
| `body` | string | 1-2000 characters |

**Response 201:** `{ "data": { ...quick_reply, team_id: user.team_id, created_by_id: user.id } }`
**Response 400:** Zod validation error

---

#### `PUT /api/quick-replies/:id`

Update a quick reply.

**Request body:** Same as POST.

**Response 200:** `{ "data": { ...updated quick_reply } }`
**Response 400:** Zod validation error

---

#### `DELETE /api/quick-replies/:id`

Delete a quick reply.

**Response 200:** `{ "success": true }`

---

## Admin Routes

All admin routes require role `admin` or `superadmin`.

### `GET /api/admin/users`

List user profiles.

**Scoping:** `admin` sees only their team. `superadmin` sees all users.

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "agent@example.com",
      "name": "Alice",
      "role": "agent",
      "team_id": "uuid",
      "avatar_url": null,
      "created_at": "2026-05-16T00:00:00Z"
    }
  ]
}
```

Ordered by `created_at` descending.

---

### `PATCH /api/admin/users/:id/role`

Update a user's role.

**Request body:**
```json
{ "role": "manager" }
```

Valid values: `agent`, `manager`, `admin`, `superadmin`

**Role guards:**
- Only `superadmin` can assign `admin` or `superadmin` roles -> `403`
- `admin` can only update users within their own team -> `403`

**Response 200:** `{ "data": { ...updated profile } }`
**Response 403:** `{ "error": "Only superadmin can assign admin/superadmin roles" }` or `{ "error": "Cannot modify users outside your team" }`

---

### `GET /api/admin/teams`

List all teams. **Requires `superadmin` role.**

**Response 200:** `{ "data": [ ...team rows ] }`
**Response 403:** `{ "error": "Insufficient permissions" }` (if called by `admin`)

---

### `GET /api/admin/stats`

Dashboard statistics.

**Scoping:** `admin` sees team-scoped counts. `superadmin` sees global counts.

**Response 200:**
```json
{
  "data": {
    "total_conversations": 500,
    "open_conversations": 42,
    "total_users": 15,
    "messages_today": 123
  }
}
```

`messages_today` counts messages with `created_at >= today (UTC)`.
