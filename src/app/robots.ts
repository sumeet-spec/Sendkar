import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything behind login has no reason to be crawled, and /api holds
      // webhook endpoints, not pages.
      disallow: ["/dashboard", "/inbox", "/campaigns", "/contacts", "/settings", "/flows", "/api"],
    },
    sitemap: "https://www.sendkar.shop/sitemap.xml",
  };
}
