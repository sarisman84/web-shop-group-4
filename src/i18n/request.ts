import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Fall back to the default locale when the request has no
  // locale (e.g. non-localized admin routes or build-time prerender).
  const locale =
    requested && routing.locales.includes(requested)
      ? requested
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
