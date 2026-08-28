import type { MetadataRoute } from "next";

const BASE_URL = "https://www.sendkar.shop";

// Only the public, unauthenticated routes — everything under the dashboard
// requires login and has no business being indexed.
const PUBLIC_ROUTES = ["", "/signup", "/login", "/privacy", "/terms", "/support", "/changelog"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.5,
  }));
}
