-- ============================================================
-- Beta Signups: email capture + referral mechanic
-- ============================================================

create table public.beta_signups (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  email           text not null unique,
  team_size       text not null,
  messages_per_day text not null,
  queue_position  integer not null,
  referral_code   text not null unique,
  referred_by     text references public.beta_signups(referral_code),
  referral_count  integer not null default 0,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  created_at      timestamptz not null default now()
);

create index idx_beta_signups_email on public.beta_signups(email);
create index idx_beta_signups_referral_code on public.beta_signups(referral_code);
create index idx_beta_signups_queue_position on public.beta_signups(queue_position);

-- No RLS — this table is accessed via API worker with service-role key
