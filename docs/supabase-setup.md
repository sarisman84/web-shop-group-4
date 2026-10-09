# Supabase Setup

All catalog, order, review and account data lives in [Supabase](https://supabase.com)
Postgres, reached from the server through `@supabase/ssr`. There is no separate
mock backend.

## Credentials

Add your project credentials to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is accepted as an alias for the publishable key.

## Clients

- `src/lib/supabase/client.ts` — browser client for client components
  (`"use client"`). Uses the cookies present in the browser, so RLS policies see
  the caller's real role.
- `src/lib/supabase/server.ts` — cookie-aware client for server components and
  server actions. The session is read from the request cookies, so RLS sees the
  caller's real role (anon or authenticated).
- `src/lib/supabase/middleware.ts` — refreshes the Supabase session on every
  request and protects the `/account` routes.

Server-side code should not call these directly. It goes through the data layer
in `src/lib/data/` (one module per table, re-exported from
`src/lib/data/index.ts`), which uses a single shared cookie-aware client per
request — deduped with `React.cache` in `src/lib/data/_client.ts` — so RLS
policies always see the caller's session. Client components that need their own
client import `createClient()` from `src/lib/supabase/client.ts` directly.

## Tables

- `products` — catalog items. `meta` is a jsonb object holding `createdAt`,
  `updatedAt`, `barcode` and `qrCode`; the `createdAt`/`updatedAt` stamps are
  maintained by the `products_touch_meta` trigger.
- `categories` — category lookup, referenced by `products.category_id`.
  `description` (nullable, T100) feeds the per-category introduction on the
  catalogue page.
- `reviews` — product reviews, referenced by `reviews.product_id`.
- `orders` — one row per checkout: customer details, `total`, `status`
  (`pending`/`paid`/`shipped`/`delivered`), the Stripe session id and a
  snapshot of the shipping address (`shipping_street`, `shipping_postal_code`,
  `shipping_city`, `shipping_country`). Created by `src/lib/data/orders.ts`.
- `order_items` — the lines of an order, each a name/price snapshot of a
  product at checkout time.
- `profiles` — the signed-in user's personal details (`first_name`,
  `last_name`, `phone`, `updated_at`). One row per auth user, created empty by
  the `handle_new_user` trigger on `auth.users` — email stays in Auth and is
  read through `supabase.auth`.
- `addresses` — a user's saved delivery addresses (`street`, `postal_code`,
  `city`, `country`, `is_default`), owned by `user_id`.

## Row Level Security

- Catalog reads (`products`, `categories`, `reviews`) are public. `insert`,
  `update` and `delete` on `products` are restricted to authenticated users, so
  a write from a signed-out visitor is rejected by Postgres rather than by the
  UI. Every write in the data layer reads the row back afterwards, because an
  update or delete blocked by RLS returns no error and no rows.
- Orders are readable only by their owner: the select policy matches either the
  signed-in `user_id` or the customer email on the JWT. Guest checkout has no
  session, so the confirmation page uses the Stripe session id to record the
  order rather than reading it back.
- `profiles` and `addresses` are owner-only: all four operations
  (select/insert/update/delete) require `auth.uid()` to match the row
  (`profiles.id`, `addresses.user_id`), and `anon` has no grants on either
  table. Another user's rows are invisible, and an update cannot move a row to
  someone else's id.

## Applying Migrations

The schema lives in `supabase/migrations/`. The project does not run the
Supabase CLI, so each file is applied once by pasting its SQL into the
Supabase SQL editor (or `psql -f`). Apply them in filename order:

1. `20261006000000_create_orders.sql` — `orders` + `order_items`, status enum,
   indexes, RLS policies and Data API grants.
2. `20261007000000_create_profiles_and_addresses.sql` — `profiles` +
   `addresses`, the `handle_new_user` trigger, RLS policies and grants.
3. `20261008000000_add_category_description.sql` — nullable `description` on
   `categories`.
4. `20261008000000_add_shipping_address_to_orders.sql` — shipping-address
   snapshot columns on `orders`.

The `products`, `categories` and `reviews` tables predate the migrations
folder and were created directly in the dashboard.

## Seed Data

The seed catalog is based on [dummyjson.com](https://dummyjson.com/docs/products),
adapted to the schema in `src/types/database.ts`. It is not committed to the
repository — the live project's tables are seeded through the Supabase table
editor.
