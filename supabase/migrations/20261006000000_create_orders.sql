-- T53 (issue #53): orders and order_items for the checkout flow.
--
-- The project does not run the Supabase CLI, so this file is both the source
-- of truth for the schema and the script to paste into the dashboard's SQL
-- editor (or apply with `psql -f`). It targets a project that already has the
-- products / categories / reviews tables.
--
-- Conventions follow the rest of the schema: money is numeric(10,2) (exact
-- decimals, never float), timestamps are timestamptz, and every foreign key
-- gets an index because Postgres does not create one automatically.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

-- Order lifecycle: checkout creates 'pending'; a confirmed Stripe payment
-- moves it to 'paid'; fulfilment advances it to 'shipped' / 'delivered'.
create type public.order_status as enum (
  'pending',
  'paid',
  'shipped',
  'delivered'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Null for guest checkout; set when a signed-in user places the order.
  user_id uuid references auth.users (id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  total numeric(10, 2) not null default 0 check (total >= 0),
  status public.order_status not null default 'pending',
  -- Stripe Checkout Session id, used to reconcile the success redirect/receipt.
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  -- Nullable so deleting a product does not erase order history.
  product_id integer references public.products (id) on delete set null,
  -- name/price are snapshots taken at checkout: products can be renamed,
  -- repriced or deleted later, but an order must keep what was paid.
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null check (quantity > 0)
);

-- ---------------------------------------------------------------------------
-- Indexes (foreign keys are not indexed automatically)
-- ---------------------------------------------------------------------------

create index orders_user_id_idx on public.orders (user_id);
create index orders_customer_email_idx on public.orders (customer_email);
create index orders_stripe_session_id_idx on public.orders (stripe_session_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers may read only their own orders: matched by auth uid (signed-in) or
-- by the email carried in the JWT (guest orders placed with the same address).
-- The `(select auth.uid())` / `(select auth.jwt())` wrapper is evaluated once
-- per query instead of once per row.
create policy "Customers can read their own orders"
  on public.orders
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or customer_email = (select auth.jwt() ->> 'email')
  );

-- Checkout runs as the caller (guest = anon, signed-in = authenticated), so
-- inserts are allowed for both. A signed-in caller may only attribute the
-- order to themselves; guests must leave user_id null.
create policy "Customers can create orders"
  on public.orders
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

-- order_items are readable only through a visible parent order; the EXISTS
-- subquery is itself filtered by the orders SELECT policy above.
create policy "Customers can read their own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
    )
  );

-- Inserts mirror the orders insert policy. The parent's ownership cannot be
-- re-checked here (a freshly inserted guest order is not yet readable), so the
-- policy only gates reachability, not which order id is used.
create policy "Customers can create order items"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Data API grants
-- ---------------------------------------------------------------------------

-- RLS still decides which rows are visible; these grants only decide whether
-- the roles can reach the tables through PostgREST at all.
grant select, insert on public.orders to anon, authenticated;
grant select, insert on public.order_items to anon, authenticated;