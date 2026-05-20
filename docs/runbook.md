# BrilDesk Production Runbook

## Health Checks

### API Health Endpoint

```
GET https://api.brildesk.com/health
```

**Healthy response (200):**
```json
{
  "status": "ok",
  "services": { "supabase": "ok" },
  "latencyMs": 42,
  "timestamp": "2026-05-20T10:00:00.000Z"
}
```

**Degraded response (503):**
```json
{
  "status": "degraded",
  "services": { "supabase": "error" },
  "latencyMs": 5000,
  "timestamp": "2026-05-20T10:00:00.000Z"
}
```

### Supabase Dashboard

Monitor database health, connection counts, and query performance via the Supabase project dashboard.

### Cloudflare Dashboard

Monitor Worker/Pages request counts, error rates, CPU time, and latency via the Cloudflare dashboard.

## Common Incidents

### 1. WhatsApp Messages Not Arriving

**Symptoms:** Inbound messages from WhatsApp users do not appear in the inbox.

**Diagnosis:**
1. Check API health: `curl https://api.brildesk.com/health`
2. Check Cloudflare Worker logs for errors on `/api/webhooks/whatsapp`
3. Verify `WHATSAPP_VERIFY_TOKEN` secret matches Meta Developer Console config
4. Check Meta Developer Console webhook status for delivery failures
5. Check Supabase database connectivity

**Resolution:**
- If webhook verification failed: ensure `WHATSAPP_VERIFY_TOKEN` matches in both Cloudflare secrets and Meta console
- If Supabase is unreachable: check Supabase project status page, verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- If Meta is not sending webhooks: re-subscribe to webhook fields in the Meta Developer Console

### 2. Outbound Messages Failing

**Symptoms:** Agents see errors when sending messages; `502` responses from `/api/messages`.

**Diagnosis:**
1. Check Worker logs for WhatsApp API error responses
2. Verify `WHATSAPP_ACCESS_TOKEN` is valid and not expired
3. Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
4. Check WhatsApp Business API rate limits

**Resolution:**
- Expired access token: generate a new long-lived token in Meta Developer Console and update the Wrangler secret
- Rate limited: wait for rate limit window to reset; consider requesting higher throughput from Meta
- Invalid phone number ID: verify in Meta Business Manager

### 3. Users Cannot Log In

**Symptoms:** Login page returns errors or redirects loop.

**Diagnosis:**
1. Check if Supabase Auth service is operational
2. Check browser console for specific error messages
3. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Cloudflare Pages
4. For Google OAuth: verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Supabase Auth config

**Resolution:**
- Supabase Auth down: check Supabase status page; wait for recovery
- Missing env vars: set them in Cloudflare Pages dashboard and redeploy
- OAuth misconfiguration: verify redirect URLs in both Google Cloud Console and Supabase Auth settings

### 4. Real-time Updates Not Working

**Symptoms:** Conversations/messages do not update in real-time; users must refresh to see new data.

**Diagnosis:**
1. Check browser console for WebSocket connection errors
2. Verify Supabase Realtime is enabled for the project
3. Check that tables are in the `supabase_realtime` publication (`messages`, `conversations`, `profiles`, `reminders`)
4. Check RLS policies — realtime respects RLS, so policy issues will silently filter out changes

**Resolution:**
- WebSocket blocked: check if corporate firewall/proxy blocks WSS connections
- Tables not in publication: run SQL to add them:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE messages, conversations, profiles, reminders;
  ```
- RLS filtering changes: verify the user's profile has correct `team_id` and `role`

### 5. Email Delivery Issues

**Symptoms:** Confirmation emails, referral notifications, or marketing emails not being received.

**Diagnosis:**
1. Check `email_sends` table for send status (`queued`, `sent`, `bounced`, etc.)
2. Check Resend dashboard for delivery status and bounce reports
3. Verify `RESEND_API_KEY` is valid
4. Check `email_unsubscribes` — the user may have opted out

**Resolution:**
- Bouncing: check recipient email validity; review Resend bounce details
- API key expired: regenerate in Resend dashboard and update Wrangler secret
- Unsubscribed: if transactional email, check that `category` is correctly set (transactional emails bypass unsubscribe)

### 6. RLS Policy Errors (403/Empty Results)

**Symptoms:** Users see empty data or get "Profile not found" / "Insufficient permissions" errors.

**Diagnosis:**
1. Check the user's `profiles` row: `role` and `team_id` must be set
2. New users without `team_id` can only access onboarding-related routes
3. Check if `current_user_role()` and `current_user_team_id()` return expected values

**Resolution:**
- Missing team_id: user needs to complete onboarding (create or join a team)
- Wrong role: update via admin panel or direct SQL:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
  ```

## Rollback Procedures

### API Rollback (Cloudflare Workers)

Cloudflare Workers maintains deployment history. To rollback:

1. Go to Cloudflare Dashboard -> Workers & Pages -> `brildesk-api-production`
2. Navigate to "Deployments" tab
3. Find the last known-good deployment
4. Click "Rollback to this deployment"

Or via CLI:

```bash
# List recent deployments
wrangler deployments list

# Rollback to a specific deployment
wrangler rollback <deployment-id>
```

### Web Rollback (Cloudflare Pages)

1. Go to Cloudflare Dashboard -> Workers & Pages -> `brildesk-web-production`
2. Navigate to "Deployments" tab
3. Click "Rollback" on the last known-good deployment

### Database Rollback

Supabase does not support automatic migration rollback. For schema changes:

1. Create a new migration that reverses the problematic changes
2. Test locally with `supabase db reset`
3. Push to production with `supabase db push`

For data issues, restore from Supabase's point-in-time recovery (available on Pro plan):

1. Go to Supabase Dashboard -> Project Settings -> Database -> Backups
2. Select a recovery point before the incident
3. Restore to a new project, verify data, then promote

## Escalation Paths

| Severity | Description | Action |
|---|---|---|
| P1 - Critical | All messaging down, no users can log in | Investigate immediately; rollback if needed; notify CEO |
| P2 - High | Partial outage (e.g., one team affected, emails failing) | Investigate within 1 hour; apply fix or workaround |
| P3 - Medium | Degraded performance, non-critical feature broken | Investigate within 4 hours; schedule fix |
| P4 - Low | Cosmetic issues, minor bugs | Track in issue tracker; fix in next sprint |

### External Service Status Pages

- **Supabase:** https://status.supabase.com
- **Cloudflare:** https://www.cloudflarestatus.com
- **Meta/WhatsApp:** https://metastatus.com
- **Resend:** https://resend-status.com

## Monitoring Checklist

### Daily

- [ ] Check `GET /health` returns `status: "ok"`
- [ ] Review Cloudflare Worker error rates
- [ ] Check for bounced emails in `email_sends` table

### Weekly

- [ ] Review Supabase database size and connection counts
- [ ] Check Cloudflare Worker CPU time trends
- [ ] Review audit logs for unusual activity
- [ ] Verify WhatsApp webhook subscription is active in Meta console

### Monthly

- [ ] Rotate `WHATSAPP_ACCESS_TOKEN` if using short-lived tokens
- [ ] Review and clean up old resolved/closed conversations
- [ ] Check Supabase billing and usage
- [ ] Review Cloudflare Workers billing and request counts
