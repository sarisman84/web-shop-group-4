import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Browser Supabase client for client components ("use client").
 *
 * Uses the cookies present in the browser, so RLS policies see the caller's
 * real role. Only create this inside client components; server-side code must
 * use the cookie-aware server client (`./server`) through the data layer.
 *
 * Client components should normally call the shared query in
 * `src/lib/data/search.ts` (passing this client in) rather than building
 * `supabase.from(...)` chains inline.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
