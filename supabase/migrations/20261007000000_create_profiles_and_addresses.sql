-- T92 (issue #112): profiles and addresses for the account page (epic #14).
--
-- Like the orders migration, this file is the source of truth for the schema
-- and the script to paste into the dashboard's SQL editor (the project does
-- not run the Supabase CLI). Apply it once, after
-- 20261006000000_create_orders.sql.
--
-- `profiles` is the signed-in user's personal details, `addresses` their
-- saved delivery addresses (PRD §5.3, Kontosida). Every row of both tables
-- belongs to exactly one auth user, so all policies match auth.uid() and
-- `anon` gets no grants at all.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per auth.users row, created in the same statement that creates the
-- auth user (see handle_new_user below).
--
-- id is both the primary key and the foreign key: the profile *is* the user's
-- private data, so there is no separate surrogate key, and deleting the auth
-- user cascades to the profile.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Nullable on purpose: sign-up only requires email and password, so the
  -- row is created empty and the account page fills it in later.
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Saved delivery addresses. Unlike orders, which snapshot the customer name
-- and email at checkout, these are reusable: checkout picks one and copies
-- its contents into the order.
--
-- postal_code is text, not integer: leading zeros ("114 55", "01234") are
-- data, and a Swedish "123 45" is not a number at all.
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  street text not null,
  postal_code text not null,
  city text not null,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (foreign keys are not indexed automatically)
-- ---------------------------------------------------------------------------

create index addresses_user_id_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Gives every new auth user a profile row, so a signed-in caller can never
-- find their own user without a profile (the account page then reads an
-- empty row instead of nothing).
--
-- SECURITY DEFINER is required: sign-up runs as `anon`, which has no INSERT
-- grant on public.profiles and would also fail the insert policy below
-- (auth.uid() is not populated yet while the auth.users row is being
-- written). The function therefore runs as its owner, `postgres`, who owns
-- the table. An empty search_path keeps the body from picking up any
-- attacker-created objects, so every reference is schema-qualified.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- updated_at is stamped by the database so it stays correct no matter which
-- client writes the row (the app must not remember to set it itself).
create or replace function public.profiles_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function public.profiles_touch_updated_at();

-- Users who registered before this migration exist in auth.users with no
-- profile row; the trigger only fires on new inserts. Same guarded insert as
-- above, so re-running the migration is harmless.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

-- Owner-only on both tables: the row's owner must be the signed-in caller.
-- The `(select auth.uid())` wrapper reads the JWT once per query instead of
-- once per row, exactly like the orders policies.
--
-- Update gets both USING and WITH CHECK: USING decides which rows the caller
-- may reach (and a SELECT policy is what makes them reachable at all), WITH
-- CHECK stops them from re-pointing a row at another user id.

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (id = (select auth.uid()));

create policy "Users can read their own addresses"
  on public.addresses
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can create their own addresses"
  on public.addresses
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own addresses"
  on public.addresses
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own addresses"
  on public.addresses
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Data API grants
-- ---------------------------------------------------------------------------

-- RLS decides which rows are visible; these grants only decide whether the
-- roles can reach the tables through PostgREST at all (new tables may also
-- need to be exposed under the project's Data API settings).
--
-- Nothing here is for `anon`: personal data is reachable only with a
-- session, so the explicit revoke undoes the blanket grant that Supabase's
-- default privileges hand to every new table.
revoke all on public.profiles from anon;
revoke all on public.addresses from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
