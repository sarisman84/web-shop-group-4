import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Admin routes are not localized, so the middleware must not
  // redirect /admin to /sv/admin.
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
