import type { MetadataRoute } from "next";

// Served at /robots.txt. Without this route the path fell through to an HTML
// page, which crawlers (and Lighthouse's SEO audit) treat as an invalid file.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or session-bound pages; the wildcard covers /sv/... and /en/...
        disallow: ["/admin", "/api", "/*/account", "/*/checkout", "/*/cart"],
      },
    ],
  };
}
