/**
 * The public origin of the site, used as `metadataBase` so relative URLs in
 * page metadata (canonical, Open Graph) become absolute. A configured
 * NEXT_PUBLIC_SITE_URL wins, then the Vercel production host, then localhost.
 */
export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  const raw =
    configured || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");

  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
}
