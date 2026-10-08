import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const handleI18n = createIntlMiddleware(routing);

// Admin and API routes, and anything with a file extension (robots.txt,
// sitemap.xml, ...), are not localized: they only get the session refresh.
function isLocalized(pathname: string) {
  return !/^\/(admin|api|_vercel)(\/|$)/.test(pathname) && !pathname.includes('.');
}

export async function proxy(request: NextRequest) {
  // Refresh the Supabase session first (and guard protected routes); a
  // redirect to the login page is returned as is.
  const sessionResponse = await updateSession(request);
  if (sessionResponse.headers.has('location')) return sessionResponse;

  if (!isLocalized(request.nextUrl.pathname)) return sessionResponse;

  // next-intl adds the locale prefix (redirect) or rewrites to the locale
  // route. Carry the refreshed session cookies over to its response.
  const intlResponse = handleI18n(request);
  sessionResponse.cookies.getAll().forEach((cookie) => intlResponse.cookies.set(cookie));
  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
