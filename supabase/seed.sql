-- ============================================================
-- Seed data for BrilDesk development
-- Run with: supabase db reset (applies migrations + seed)
-- ============================================================

-- ---------- Teams ----------
insert into public.teams (id, name, description) values
  ('a0000000-0000-0000-0000-000000000001', 'Sales Team', 'Primary sales team for WhatsApp support'),
  ('a0000000-0000-0000-0000-000000000002', 'Support Team', 'Customer support team');

-- ---------- Auth Users + Profiles ----------
-- Password for all dev users: password123
-- bcrypt hash of "password123" (cost 10)
-- Supabase stores auth users in auth.users; we insert there and the trigger creates profiles.
-- For seeding we insert profiles directly since the trigger only fires on real signups.

-- Superadmin (no team — can see everything)
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
values (
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'superadmin@brildesk.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"name": "Super Admin", "role": "superadmin"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- Admin (Sales Team)
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
values (
  'b0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'admin@brildesk.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"name": "Admin User", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- Manager (Sales Team)
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
values (
  'b0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'manager@brildesk.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"name": "Manager User", "role": "manager"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- Agent 1 (Sales Team)
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
values (
  'b0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'agent1@brildesk.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"name": "Alice Agent", "role": "agent"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- Agent 2 (Sales Team)
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
values (
  'b0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'agent2@brildesk.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"name": "Bob Agent", "role": "agent"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- The auth trigger creates profiles, but we need to set team_id after the fact.
-- Update profiles with team assignments:
update public.profiles set team_id = 'a0000000-0000-0000-0000-000000000001'
where id in (
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000005'
);

-- ---------- Routing Rule ----------
insert into public.routing_rules (team_id, type, is_active, config) values
  ('a0000000-0000-0000-0000-000000000001', 'round_robin', true, '{"lastAssignedIndex": 0}');

-- ---------- Tags ----------
insert into public.tags (id, name, color, team_id) values
  ('c0000000-0000-0000-0000-000000000001', 'VIP', '#EF4444', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Billing', '#3B82F6', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'Technical', '#8B5CF6', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000004', 'New Lead', '#10B981', 'a0000000-0000-0000-0000-000000000001');

-- ---------- Conversations ----------
insert into public.conversations (id, wa_contact_phone, wa_contact_name, status, priority, assigned_to_id, team_id, last_message_at) values
  ('d0000000-0000-0000-0000-000000000001', '+919876543210', 'Rahul Sharma',  'open',     'high',   'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', now() - interval '1 hour'),
  ('d0000000-0000-0000-0000-000000000002', '+919876543211', 'Priya Patel',   'open',     'medium', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', now() - interval '2 hours'),
  ('d0000000-0000-0000-0000-000000000003', '+919876543212', 'Amit Kumar',    'waiting',  'medium', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', now() - interval '3 hours'),
  ('d0000000-0000-0000-0000-000000000004', '+919876543213', 'Sneha Gupta',   'resolved', 'low',    'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', now() - interval '4 hours'),
  ('d0000000-0000-0000-0000-000000000005', '+919876543214', 'Vikram Singh',  'resolved', 'medium', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', now() - interval '5 hours');

-- ---------- Conversation Tags ----------
insert into public.conversation_tags (conversation_id, tag_id) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004');

-- ---------- Messages ----------
insert into public.messages (conversation_id, direction, body, sender_type, sender_id, status, timestamp) values
  -- Conversation 1: Rahul Sharma
  ('d0000000-0000-0000-0000-000000000001', 'inbound',  'Hi, I need help with my order',                                         'contact', null,                                    'delivered', now() - interval '1 hour' - interval '2 minutes'),
  ('d0000000-0000-0000-0000-000000000001', 'outbound', 'Hello Rahul! I''d be happy to help. Could you share your order number?', 'agent',   'b0000000-0000-0000-0000-000000000004', 'read',      now() - interval '1 hour' - interval '1 minute'),
  ('d0000000-0000-0000-0000-000000000001', 'inbound',  'Sure, it''s ORD-1000',                                                  'contact', null,                                    'delivered', now() - interval '1 hour'),

  -- Conversation 2: Priya Patel
  ('d0000000-0000-0000-0000-000000000002', 'inbound',  'Hi, I need help with my order',                                         'contact', null,                                    'delivered', now() - interval '2 hours' - interval '2 minutes'),
  ('d0000000-0000-0000-0000-000000000002', 'outbound', 'Hello Priya! I''d be happy to help. Could you share your order number?', 'agent',   'b0000000-0000-0000-0000-000000000005', 'read',      now() - interval '2 hours' - interval '1 minute'),
  ('d0000000-0000-0000-0000-000000000002', 'inbound',  'Sure, it''s ORD-1001',                                                  'contact', null,                                    'delivered', now() - interval '2 hours'),

  -- Conversation 3: Amit Kumar
  ('d0000000-0000-0000-0000-000000000003', 'inbound',  'Hi, I need help with my order',                                         'contact', null,                                    'delivered', now() - interval '3 hours' - interval '2 minutes'),
  ('d0000000-0000-0000-0000-000000000003', 'outbound', 'Hello Amit! I''d be happy to help. Could you share your order number?',  'agent',   'b0000000-0000-0000-0000-000000000004', 'read',      now() - interval '3 hours' - interval '1 minute'),
  ('d0000000-0000-0000-0000-000000000003', 'inbound',  'Sure, it''s ORD-1002',                                                  'contact', null,                                    'delivered', now() - interval '3 hours'),

  -- Conversation 4: Sneha Gupta
  ('d0000000-0000-0000-0000-000000000004', 'inbound',  'Hi, I need help with my order',                                         'contact', null,                                    'delivered', now() - interval '4 hours' - interval '2 minutes'),
  ('d0000000-0000-0000-0000-000000000004', 'outbound', 'Hello Sneha! I''d be happy to help. Could you share your order number?', 'agent',   'b0000000-0000-0000-0000-000000000005', 'read',      now() - interval '4 hours' - interval '1 minute'),
  ('d0000000-0000-0000-0000-000000000004', 'inbound',  'Sure, it''s ORD-1003',                                                  'contact', null,                                    'delivered', now() - interval '4 hours'),

  -- Conversation 5: Vikram Singh
  ('d0000000-0000-0000-0000-000000000005', 'inbound',  'Hi, I need help with my order',                                          'contact', null,                                    'delivered', now() - interval '5 hours' - interval '2 minutes'),
  ('d0000000-0000-0000-0000-000000000005', 'outbound', 'Hello Vikram! I''d be happy to help. Could you share your order number?', 'agent',   'b0000000-0000-0000-0000-000000000004', 'read',      now() - interval '5 hours' - interval '1 minute'),
  ('d0000000-0000-0000-0000-000000000005', 'inbound',  'Sure, it''s ORD-1004',                                                   'contact', null,                                    'delivered', now() - interval '5 hours');

-- ---------- Quick Replies ----------
insert into public.quick_replies (title, body, team_id, created_by_id) values
  ('Greeting',       'Hello! Thank you for reaching out to BrilDesk. How can I help you today?', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('Order Status',   'I''d be happy to check your order status. Could you share your order number?', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('Closing',        'Thank you for contacting us! Is there anything else I can help you with?', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('Away',           'I''m currently away but will get back to you as soon as possible. Thank you for your patience!', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004');

-- ---------- Audit Logs ----------
insert into public.audit_logs (user_id, action, entity, entity_id, details) values
  ('b0000000-0000-0000-0000-000000000002', 'created', 'team',         'a0000000-0000-0000-0000-000000000001', '{"name": "Sales Team"}'),
  ('b0000000-0000-0000-0000-000000000002', 'assigned', 'conversation', 'd0000000-0000-0000-0000-000000000001', '{"assignedTo": "Alice Agent"}');
