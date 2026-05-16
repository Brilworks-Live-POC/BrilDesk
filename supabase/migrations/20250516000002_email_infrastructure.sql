-- ============================================================
-- Email Infrastructure: send tracking + unsubscribe management
-- ============================================================

-- ---------- Enums ----------
create type public.email_status as enum ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained');
create type public.email_category as enum ('transactional', 'marketing');

-- ---------- Email sends (tracking table) ----------
create table public.email_sends (
  id            uuid primary key default uuid_generate_v4(),
  to_email      text not null,
  from_email    text not null default 'hello@brildesk.com',
  subject       text not null,
  template_key  text not null,
  category      public.email_category not null default 'transactional',
  status        public.email_status not null default 'queued',
  resend_id     text,
  metadata      jsonb not null default '{}',
  opened_at     timestamptz,
  clicked_at    timestamptz,
  bounced_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_email_sends_to       on public.email_sends(to_email);
create index idx_email_sends_template on public.email_sends(template_key);
create index idx_email_sends_status   on public.email_sends(status);
create index idx_email_sends_created  on public.email_sends(created_at);

-- ---------- Email unsubscribes (CAN-SPAM compliance) ----------
create table public.email_unsubscribes (
  id            uuid primary key default uuid_generate_v4(),
  email         text not null,
  category      public.email_category not null default 'marketing',
  reason        text,
  unsubscribed_at timestamptz not null default now()
);

create unique index idx_email_unsub_email_cat on public.email_unsubscribes(email, category);

-- ---------- RLS ----------
alter table public.email_sends enable row level security;
alter table public.email_unsubscribes enable row level security;

-- Superadmin can see everything
create policy "superadmin_email_sends" on public.email_sends
  for all using (public.current_user_role() = 'superadmin');

create policy "superadmin_email_unsubscribes" on public.email_unsubscribes
  for all using (public.current_user_role() = 'superadmin');

-- Admins can read email sends for their team context
create policy "admin_email_sends_select" on public.email_sends
  for select using (public.current_user_role() in ('admin', 'manager'));

-- Service role handles inserts/updates (bypasses RLS by default)
