import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'

const PROTECTED_PREFIXES = ['/account'];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Splits a leading locale segment off a pathname: "/sv/account" becomes
// { locale: "sv", path: "/account" }. Paths without a locale prefix (e.g. the
// non-localized /admin) keep their path and get the default locale.
function splitLocale(pathname: string) {
  const [, first = '', ...rest] = pathname.split('/')
  const locale = routing.locales.find((l) => l === first)
  return locale
    ? { locale, path: `/${rest.join('/')}` }
    : { locale: routing.defaultLocale, path: pathname }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  // Routes live under /<locale>/..., so the guard compares the path without
  // its locale prefix and sends visitors to the login page of their locale.
  const { locale, path } = splitLocale(request.nextUrl.pathname)

  if (
    !user &&
    isProtectedPath(path) &&
    !path.startsWith('/auth') &&
    // the OAuth consent route sends unauthenticated visitors to the login page
    // itself, so that it can preserve the authorization in the `next` parameter
    path !== '/oauth/consent'
  ) {
    // no user on a protected route, potentially respond by redirecting the
    // user to the login page, preserving the original URL in `next` so they
    // can be sent back after signing in
    const url = request.nextUrl.clone()
    const next = `${request.nextUrl.pathname}${request.nextUrl.search}`
    url.pathname = `/${locale}/auth/login`
    url.search = `?next=${encodeURIComponent(next)}`
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
