import fs from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE, type Locale } from "./i18n/types.ts";

/**
 * The guide pages: Markdown with a small front-matter block, read from
 * `content/guides/<locale>/`.
 *
 * Same shape as the lesson chapters, and for the same reason — prose
 * belongs in files a person can edit and diff, not in a template. A guide
 * with no translation falls back to English rather than 404ing.
 */

export type GuideMeta = {
  slug: string;
  title: string;
  /** One sentence; used as the meta description and the index blurb. */
  summary: string;
  /** ISO date; shown as "uppdaterad" and fed to the sitemap. */
  updated: string;
  /** Rounded up from a 200-words-per-minute count at build time. */
  minutes: number;
  locale: Locale;
  fallback: boolean;
};

export type Guide = GuideMeta & { body: string };

/** Declared here rather than discovered, so the order on the index page is
 *  an editorial decision and not an artefact of the filesystem. */
export const GUIDE_SLUGS = [
  "gmat-focus-quant",
  "gmat-vs-hogskoleprovet",
  "handelshogskolan-gmat",
  "plugga-infor-gmat",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export function isGuideSlug(value: string): value is GuideSlug {
  return (GUIDE_SLUGS as readonly string[]).includes(value);
}

const ROOT = path.join(process.cwd(), "content", "guides");

function parseFrontMatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: raw };
  const block = raw.slice(3, end);
  const meta: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const at = line.indexOf(":");
    if (at === -1) continue;
    meta[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: raw.slice(end + 4).replace(/^\n+/, "") };
}

function readFile(slug: string, locale: Locale): string | null {
  const file = path.join(ROOT, locale, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

export function readGuide(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Guide | null {
  if (!isGuideSlug(slug)) return null;
  let served: Locale = locale;
  let raw = readFile(slug, locale);
  if (raw === null) {
    // Fall back to the other language rather than dropping the guide.
    // An English reader losing three of four guides from the index is a
    // worse outcome than reading one of them in Swedish behind a banner
    // that says so.
    served = locale === "sv" ? "en" : "sv";
    raw = readFile(slug, served);
  }
  if (raw === null) return null;

  const { meta, body } = parseFrontMatter(raw);
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: meta.title ?? slug,
    summary: meta.summary ?? "",
    updated: meta.updated ?? "",
    minutes: Math.max(1, Math.round(words / 200)),
    locale: served,
    fallback: served !== locale,
    body,
  };
}

export function listGuides(locale: Locale = DEFAULT_LOCALE): GuideMeta[] {
  return GUIDE_SLUGS.map((slug) => readGuide(slug, locale)).filter(
    (g): g is Guide => g !== null,
  );
}
