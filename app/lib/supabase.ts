import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types/database";

// Typed Supabase client for public catalog data (products, categories).
// It doesn't read cookies, so it's safe to share as one instance and to use
// from both server and client components. For anything tied to a logged-in
// user, use the cookie-based client in lib/supabase/server.ts instead.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// The ticket names NEXT_PUBLIC_SUPABASE_ANON_KEY; our .env.local (and the
// lib/supabase/* clients) use the newer name NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
// Both hold the same public key, so accept either.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
