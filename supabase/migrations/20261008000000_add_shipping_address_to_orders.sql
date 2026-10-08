-- T109 (issue #177): shipping-address snapshot on orders.
--
-- Stripe Hosted Checkout now collects a delivery address (shipping_address_collection,
-- SE only) and a shipping method, so the order keeps a copy of what was delivered to
-- — the same snapshot pattern the orders table already uses for customer name and
-- email (T53). The address is copied into the order at checkout time; future address
-- changes on the buyer's account must not rewrite order history.
--
-- Like the orders migration, this file is the source of truth for the schema and the
-- script to paste into the dashboard's SQL editor (the project does not run the
-- Supabase CLI). Apply it once, after 20261006000000_create_orders.sql.
--
-- The four columns mirror the four required fields of a saved address (T92):
-- street, postal_code, city and country. postal_code is text, not integer: leading
-- zeros ("114 55", "01234") are data, and a Swedish "123 45" is not a number at all.
-- No separate snapshot table: the fields are flat columns, like every other order
-- column, and nothing filters, sorts or searches on them so no index is needed.
--
-- They are NOT NULL with an empty-string default so orders that predate this
-- migration (which carry no address at all) keep a well-formed row, and every new
-- order gets real values from the paid Stripe session.

alter table public.orders
  add column if not exists shipping_street text not null default '',
  add column if not exists shipping_postal_code text not null default '',
  add column if not exists shipping_city text not null default '',
  add column if not exists shipping_country text not null default '';