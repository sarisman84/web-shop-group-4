import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Cookie-aware Supabase client for server components and server actions.
 *
 * Reads the session from the request cookies, so RLS policies see the
 * caller's real role (anon or authenticated). Always await it inside the
 * function that uses it — never store the client in a module-level variable
 * (a server component's client is bound to one request's cookies).
 *
 * Server-side code should normally go through the data layer in
 * `src/lib/data/` instead of calling this directly; it is the one place a
 * server Supabase client is created.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
