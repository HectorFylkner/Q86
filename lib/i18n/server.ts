import { translator, type Translate } from "./index.ts";
import { getLocale } from "./locale.ts";
import type { Locale } from "./types.ts";

/**
 * Request-scoped translation, kept apart from ./index.ts because resolving
 * the locale reads cookies and headers — server-only work that must not be
 * pulled into a client bundle.
 */

/** Server components and server actions: the translator for this request. */
export async function getT(): Promise<Translate> {
  return translator(await getLocale());
}

/** Both at once, for the common case of needing to format as well. */
export async function getI18n(): Promise<{ locale: Locale; t: Translate }> {
  const locale = await getLocale();
  return { locale, t: translator(locale) };
}
