import fs from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE, type Locale } from "./i18n/types.ts";

/**
 * The legal pages, kept as Markdown in `content/legal/<locale>/` for one
 * reason: a lawyer has to be able to read and edit them without opening a
 * component. The owner's review (docs/PROGRESS.md lists it as outstanding)
 * happens against these files.
 */

export const LEGAL_SLUGS = [
  "integritetspolicy",
  "kopvillkor",
  "angerratt",
] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalDocument = {
  slug: LegalSlug;
  title: string;
  updated: string;
  body: string;
  locale: Locale;
  fallback: boolean;
};

const ROOT = path.join(process.cwd(), "content", "legal");

function read(slug: LegalSlug, locale: Locale): string | null {
  const file = path.join(ROOT, locale, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

export function readLegal(
  slug: LegalSlug,
  locale: Locale = DEFAULT_LOCALE,
): LegalDocument | null {
  let served: Locale = locale;
  let raw = read(slug, locale);
  if (raw === null && locale !== "sv") {
    // Swedish is the authoritative text: these documents describe
    // obligations under Swedish law, so an untranslated page falls back to
    // Swedish rather than to English.
    served = "sv";
    raw = read(slug, "sv");
  }
  if (raw === null) return null;

  let title: string = slug;
  let updated = "";
  let body = raw;
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      for (const line of raw.slice(3, end).split("\n")) {
        const at = line.indexOf(":");
        if (at === -1) continue;
        const key = line.slice(0, at).trim();
        const value = line
          .slice(at + 1)
          .trim()
          .replace(/^"(.*)"$/, "$1");
        if (key === "title") title = value;
        if (key === "updated") updated = value;
      }
      body = raw.slice(end + 4).replace(/^\n+/, "");
    }
  }

  return { slug, title, updated, body, locale: served, fallback: served !== locale };
}
