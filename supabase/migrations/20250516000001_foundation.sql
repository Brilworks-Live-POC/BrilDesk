-- ============================================================
-- Phase 1: Foundation — Tables, RLS, Auth trigger
-- BrilDesk WhatsApp Shared Inbox
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp" with schema extensions;

-- ---------- Enums ----------
create type public.user_role as enum ('agent', 'manager', 'admin', 'superadmin');
create type public.conversation_status as enum ('open', 'waiting', 'resolved', 'closed');
create type public.message_direction as enum ('inbound', 'outbound');
create type public.sender_type as enum ('contact', 'agent', 'system');
create type public.message_status as enum ('sent', 'delivered', 'read', 'failed');
create type public.routing_type as enum ('round_robin', 'least_busy', 'manual');

-- ---------- Tables ----------

-- Teams (organizations / workspaces)
create table public.teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Profiles (extends auth.users)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  name       text not null,
  role       public.user_role not null default 'agent',
  team_id    uuid references public.teams(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_team_id on public.profiles(team_id);
create index idx_profiles_email   on public.profiles(email);

-- Conversations (WhatsApp contacts)
create table public.conversations (
  id               uuid primary key default uuid_generate_v4(),
  wa_contact_phone text not null,
  wa_contact_name  text,
  status           public.conversation_status not null default 'open',
  priority         text not null default 'medium',
  assigned_to_id   uuid references public.profiles(id) on delete set null,
  team_id          uuid references public.teams(id) on delete set null,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_conversations_status_assigned on public.conversations(status, assigned_to_id);
create index idx_conversations_last_msg        on public.conversations(last_message_at desc);
create index idx_conversations_phone           on public.conversations(wa_contact_phone);
create index idx_conversations_team_id         on public.conversations(team_id);

-- Messages
create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction       public.message_direction not null,
  body            text,
  media_url       text,
  media_type      text,
  wa_message_id   text unique,
  sender_type     public.sender_type not null,
  sender_id       uuid references public.profiles(id) on delete set null,
  status          public.message_status not null default 'sent',
  timestamp       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index idx_messages_conv_ts     on public.messages(conversation_id, timestamp);
create index idx_messages_wa_msg_id   on public.messages(wa_message_id);

-- Routing rules
create table public.routing_rules (
  id         uuid primary key default uuid_generate_v4(),
  team_id    uuid not null references public.teams(id) on delete cascade,
  type       public.routing_type not null default 'round_robin',
  is_active  boolean not null default true,
  config     jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_routing_rules_team_id on public.routing_rules(team_id);

-- Quick replies
create table public.quick_replies (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  body          text not null,
  team_id       uuid references public.teams(id) on delete set null,
  created_by_id uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_quick_replies_team_id on public.quick_replies(team_id);

-- Audit logs
create table public.audit_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  action     text not null,
  entity     text not null,
  entity_id  text not null,
  details    jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_user_id   on public.audit_logs(user_id);
create index idx_audit_logs_entity    on public.audit_logs(entity, entity_id);
create index idx_audit_logs_created   on public.audit_logs(created_at);

-- Tags
create table public.tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  color      text not null default '#6B7280',
  team_id    uuid not null references public.teams(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index idx_tags_team_name on public.tags(team_id, name);

-- Conversation tags (junction)
create table public.conversation_tags (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  tag_id          uuid not null references public.tags(id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (conversation_id, tag_id)
);

-- ---------- updated_at trigger function ----------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_updated_at before update on public.teams          for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.profiles       for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.conversations  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.routing_rules  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.quick_replies  for each row execute function public.handle_updated_at();

-- ---------- Auth trigger: auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'agent')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.teams             enable row level security;
alter table public.profiles          enable row level security;
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;
alter table public.routing_rules     enable row level security;
alter table public.quick_replies     enable row level security;
alter table public.audit_logs        enable row level security;
alter table public.tags              enable row level security;
alter table public.conversation_tags enable row level security;

-- Helper: get the current user's profile role
create or replace function public.current_user_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- Helper: get the current user's team_id
create or replace function public.current_user_team_id()
returns uuid as $$
  select team_id from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- ---- Superadmin bypass (full access to all tables) ----

-- teams
create policy "superadmin_teams" on public.teams
  for all using (public.current_user_role() = 'superadmin');

-- profiles
create policy "superadmin_profiles" on public.profiles
  for all using (public.current_user_role() = 'superadmin');

-- conversations
create policy "superadmin_conversations" on public.conversations
  for all using (public.current_user_role() = 'superadmin');

-- messages
create policy "superadmin_messages" on public.messages
  for all using (public.current_user_role() = 'superadmin');

-- routing_rules
create policy "superadmin_routing_rules" on public.routing_rules
  for all using (public.current_user_role() = 'superadmin');

-- quick_replies
create policy "superadmin_quick_replies" on public.quick_replies
  for all using (public.current_user_role() = 'superadmin');

-- audit_logs
create policy "superadmin_audit_logs" on public.audit_logs
  for all using (public.current_user_role() = 'superadmin');

-- tags
create policy "superadmin_tags" on public.tags
  for all using (public.current_user_role() = 'superadmin');

-- conversation_tags
create policy "superadmin_conversation_tags" on public.conversation_tags
  for all using (public.current_user_role() = 'superadmin');

-- ---- Teams ----

-- All authenticated users can read their own team
create policy "team_members_select" on public.teams
  for select using (id = public.current_user_team_id());

-- Admins can update their team
create policy "admin_teams_update" on public.teams
  for update using (
    id = public.current_user_team_id()
    and public.current_user_role() = 'admin'
  );

-- ---- Profiles ----

-- Users can read profiles in their team
create policy "team_profiles_select" on public.profiles
  for select using (team_id = public.current_user_team_id());

-- Users can update their own profile
create policy "own_profile_update" on public.profiles
  for update using (id = auth.uid());

-- Admins can update any profile in their team (role changes, etc.)
create policy "admin_profiles_update" on public.profiles
  for update using (
    team_id = public.current_user_team_id()
    and public.current_user_role() = 'admin'
  );

-- ---- Conversations ----

-- Agents: see conversations assigned to them in their team
create policy "agent_conversations_select" on public.conversations
  for select using (
    team_id = public.current_user_team_id()
    and (
      public.current_user_role() in ('manager', 'admin')
      or assigned_to_id = auth.uid()
    )
  );

-- Agents can update conversations assigned to them
create policy "agent_conversations_update" on public.conversations
  for update using (
    team_id = public.current_user_team_id()
    and (
      public.current_user_role() in ('manager', 'admin')
      or assigned_to_id = auth.uid()
    )
  );

-- Managers/admins can insert conversations
create policy "manager_conversations_insert" on public.conversations
  for insert with check (
    team_id = public.current_user_team_id()
    and public.current_user_role() in ('manager', 'admin')
  );

-- ---- Messages ----

-- Users can see messages for conversations they can access
create policy "team_messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.team_id = public.current_user_team_id()
        and (
          public.current_user_role() in ('manager', 'admin')
          or c.assigned_to_id = auth.uid()
        )
    )
  );

-- Agents can insert messages into their assigned conversations
create policy "agent_messages_insert" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.team_id = public.current_user_team_id()
        and (
          public.current_user_role() in ('manager', 'admin')
          or c.assigned_to_id = auth.uid()
        )
    )
  );

-- ---- Routing Rules ----

-- Team members can read routing rules
create policy "team_routing_rules_select" on public.routing_rules
  for select using (team_id = public.current_user_team_id());

-- Admins can manage routing rules
create policy "admin_routing_rules_all" on public.routing_rules
  for all using (
    team_id = public.current_user_team_id()
    and public.current_user_role() = 'admin'
  );

-- ---- Quick Replies ----

-- Team members can read quick replies
create policy "team_quick_replies_select" on public.quick_replies
  for select using (team_id = public.current_user_team_id());

-- Any team member can create quick replies
create policy "team_quick_replies_insert" on public.quick_replies
  for insert with check (team_id = public.current_user_team_id());

-- Creator or admin can update/delete quick replies
create policy "quick_replies_update" on public.quick_replies
  for update using (
    team_id = public.current_user_team_id()
    and (created_by_id = auth.uid() or public.current_user_role() = 'admin')
  );

create policy "quick_replies_delete" on public.quick_replies
  for delete using (
    team_id = public.current_user_team_id()
    and (created_by_id = auth.uid() or public.current_user_role() = 'admin')
  );

-- ---- Audit Logs ----

-- Admins and managers can read audit logs for their team
create policy "manager_audit_logs_select" on public.audit_logs
  for select using (
    public.current_user_role() in ('manager', 'admin')
    and exists (
      select 1 from public.profiles p
      where p.id = audit_logs.user_id
        and p.team_id = public.current_user_team_id()
    )
  );

-- Any authenticated user can insert audit logs (own actions)
create policy "user_audit_logs_insert" on public.audit_logs
  for insert with check (user_id = auth.uid());

-- ---- Tags ----

-- Team members can read tags
create policy "team_tags_select" on public.tags
  for select using (team_id = public.current_user_team_id());

-- Admins/managers can manage tags
create policy "manager_tags_all" on public.tags
  for all using (
    team_id = public.current_user_team_id()
    and public.current_user_role() in ('manager', 'admin')
  );

-- ---- Conversation Tags ----

-- Same access as conversations
create policy "team_conversation_tags_select" on public.conversation_tags
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_tags.conversation_id
        and c.team_id = public.current_user_team_id()
    )
  );

create policy "team_conversation_tags_insert" on public.conversation_tags
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_tags.conversation_id
        and c.team_id = public.current_user_team_id()
        and (
          public.current_user_role() in ('manager', 'admin')
          or c.assigned_to_id = auth.uid()
        )
    )
  );

create policy "team_conversation_tags_delete" on public.conversation_tags
  for delete using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_tags.conversation_id
        and c.team_id = public.current_user_team_id()
        and (
          public.current_user_role() in ('manager', 'admin')
          or c.assigned_to_id = auth.uid()
        )
    )
  );

-- ---- Service role bypass ----
-- The service_role key bypasses RLS by default in Supabase.
-- No additional policies needed for workers using the service role client.
