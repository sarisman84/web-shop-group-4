-- T115 (issue #193): contact_messages for the contact page.
--
-- Like the other migrations in this folder, this file is the source of truth
-- for the schema and the script to paste into the dashboard's SQL editor (the
-- project does not run the Supabase CLI). Apply it once, after
-- 20261008000000_add_shipping_address_to_orders.sql.
--
-- The table is an inbox: visitors (anon) and signed-in users (authenticated)
-- may drop a message into it, but nobody may read, update or delete one
-- through the Data API. Staff read it from the dashboard, not from the app,
-- so there is deliberately no select/update/delete policy or grant.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.contact_messages enable row level security;

-- The form is public: both guests and signed-in visitors may send a message.
-- The policy exists only so the insert grant is not dead letter; there is no
-- select/update/delete policy, so the table stays write-only for every role.
create policy "Visitors can send a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Data API grants
-- ---------------------------------------------------------------------------

-- Supabase's default privileges hand every new table full access to anon and
-- authenticated, so the explicit revoke undoes that first. Only insert is
-- re-granted: the roles may reach the table through PostgREST, but the
-- missing select/update/delete grants (and the missing policies) keep the
-- inbox unreadable from the app.
revoke all on public.contact_messages from anon, authenticated;

grant insert on public.contact_messages to anon, authenticated;
