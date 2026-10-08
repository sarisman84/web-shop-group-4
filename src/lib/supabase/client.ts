import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Browser Supabase client for client components ("use client").
 *
 * Uses the cookies present in the browser, so RLS policies see the caller's
 * real role. Only create this inside client components; server-side code must
 * use the cookie-aware server client (`./server`) through the data layer.
 *
 * Client components that need Supabase queries should call this factory
 * and use the returned client directly, rather than building
 * `supabase.from(...)` chains inline.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
