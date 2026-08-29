import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * The application is behind a session and has nothing to index; the public
 * site does. Disallowing the app paths keeps crawl budget on the pages
 * that can actually rank, and keeps a signed-out crawler from filling the
 * index with login redirects.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/idag",
          "/learn",
          "/drill",
          "/timed",
          "/deck",
          "/queue",
          "/patterns",
          "/decide",
          "/mastery",
          "/analytics",
          "/import",
          "/postmortem",
          "/konto",
          "/reset-password",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
