/**
 * The message catalog is a nested object of plain strings, so it crosses
 * the server/client boundary as data — no functions to serialise, no
 * runtime to ship. Interpolation is `{name}` placeholders, filled by `t()`.
 *
 * `sv` is the source of truth for the key set (ADR 0004); `en` is typed
 * against it, so a missing English string is a compile error rather than a
 * blank on the page.
 */
export type Messages = { [key: string]: string | Messages };

/** Widens a literal catalog so the other locale can be typed against its
 *  shape without having to repeat its exact strings. */
export type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};

/** Every dotted path through a catalog, as a union of string literals. */
export type MessageKey<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : MessageKey<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export const LOCALES = ["sv", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "sv";

export const LOCALE_NAMES: Record<Locale, string> = {
  sv: "Svenska",
  en: "English",
};

/** The BCP 47 tag Intl should use for each locale. */
export const INTL_LOCALE: Record<Locale, string> = {
  sv: "sv-SE",
  en: "en-GB",
};

export function isLocale(value: unknown): value is Locale {
  return value === "sv" || value === "en";
}
