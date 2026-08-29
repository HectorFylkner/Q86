import type { MetadataRoute } from "next";
import { GUIDE_SLUGS, readGuide } from "@/lib/guides";
import { LEGAL_SLUGS, readLegal } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";

/**
 * Every public URL, and nothing behind the paywall. The application's own
 * routes are deliberately absent: they require a session, so listing them
 * would only feed crawlers a wall of redirects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, priority: 1 },
    { url: absoluteUrl("/priser"), lastModified: now, priority: 0.9 },
    { url: absoluteUrl("/diagnos"), lastModified: now, priority: 0.9 },
    { url: absoluteUrl("/guider"), lastModified: now, priority: 0.8 },
  ];

  const guides: MetadataRoute.Sitemap = GUIDE_SLUGS.map((slug) => {
    const guide = readGuide(slug, "sv");
    return {
      url: absoluteUrl(`/guider/${slug}`),
      lastModified: guide?.updated ? new Date(guide.updated) : now,
      priority: 0.7,
    };
  });

  const legal: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => {
    const doc = readLegal(slug, "sv");
    return {
      url: absoluteUrl(`/${slug}`),
      lastModified: doc?.updated ? new Date(doc.updated) : now,
      priority: 0.3,
    };
  });

  return [...core, ...guides, ...legal];
}
