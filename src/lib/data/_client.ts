import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Internal to the data layer — do not import outside src/lib/data/
// (the underscore prefix marks it as non-public API).
//
// Every read and write in this folder goes through this one client, so the
// SSR context creates exactly one cookie-aware Supabase client per request.
// `React.cache` dedupes by arguments: no matter how many data functions a
// page or server action awaits, they all share the same client instance for
// the duration of the request.
//
// The client is created lazily on first use (inside an async function), so
// importing this module never touches `cookies()` at module scope.
export const getSupabase = cache(async () => createClient());
