import { sv } from "./sv.ts";
import { en } from "./en.ts";
import {
  DEFAULT_LOCALE,
  type Locale,
  type MessageKey,
  type Messages,
  type Widen,
} from "./types.ts";

/**
 * This module must stay free of `next/headers`: the catalogs and the
 * translator cross into client components, and a server-only import here
 * breaks the client build. Request-scoped resolution lives in ./server.ts.
 */

/** The catalog shape: Swedish keys, widened so both locales fit it. */
export type Dictionary = Widen<typeof sv>;
export type Key = MessageKey<typeof sv>;

const CATALOGS: Record<Locale, Dictionary> = { sv, en };

export function getDictionary(locale: Locale): Dictionary {
  return CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
}

function lookup(catalog: Messages, key: string): string | null {
  let node: string | Messages | undefined = catalog;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return null;
    node = node[part];
  }
  return typeof node === "string" ? node : null;
}

/** Fills `{name}` placeholders. An absent value is left visible, so a
 *  missing argument shows up in review rather than disappearing. */
function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  );
}

export type Translate = (
  key: Key,
  params?: Record<string, string | number>,
) => string;

/**
 * Builds a translator for one locale. English is the fallback for any key
 * the active catalog is missing — which the type system makes impossible
 * for `en`, and which therefore only ever happens if a catalog is edited
 * as data rather than as code.
 */
export function translator(locale: Locale): Translate {
  const catalog = getDictionary(locale);
  return (key, params) => {
    const found =
      lookup(catalog as unknown as Messages, key) ??
      lookup(en as unknown as Messages, key);
    // A key with no string anywhere is a bug; showing it beats showing "".
    return interpolate(found ?? key, params);
  };
}
