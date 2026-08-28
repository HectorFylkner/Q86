import { enGB, sv } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";
import { INTL_LOCALE, type Locale } from "./types.ts";

/**
 * Every date, number and price in Q86 goes through here, so nothing has to
 * remember that a Swedish reader expects "28 augusti 2026", "1 234,5" and
 * "1 495 kr" — a comma decimal separator and a space as the thousands
 * separator (ADR 0004). The examples here are deliberately not real plan
 * prices: those live only in lib/billing/pricing.ts.
 */

const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

function memo<T extends Intl.DateTimeFormat | Intl.NumberFormat>(
  key: string,
  build: () => T,
): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const made = build();
  cache.set(key, made);
  return made;
}

export function formatDate(
  value: Date | number,
  locale: Locale,
  style: "long" | "short" | "numeric" = "long",
): string {
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : style === "short"
        ? { month: "short", day: "numeric" }
        : { year: "numeric", month: "2-digit", day: "2-digit" };
  return memo(`d:${locale}:${style}`, () =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], options),
  ).format(value);
}

export function formatDateTime(value: Date | number, locale: Locale): string {
  return memo(`dt:${locale}`, () =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  ).format(value);
}

/** "1 234,5" in Swedish, "1,234.5" in English. */
export function formatNumber(
  value: number,
  locale: Locale,
  maximumFractionDigits = 1,
): string {
  return memo(`n:${locale}:${maximumFractionDigits}`, () =>
    new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits }),
  ).format(value);
}

/** "62 %" — Swedish puts a space before the sign; English does not. */
export function formatPercent(
  fraction: number,
  locale: Locale,
  maximumFractionDigits = 0,
): string {
  return memo(`p:${locale}:${maximumFractionDigits}`, () =>
    new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: "percent",
      maximumFractionDigits,
    }),
  ).format(fraction);
}

/** Integer öre in, "1 495 kr" out. */
export function formatCurrency(ore: number, locale: Locale): string {
  const kronor = ore / 100;
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: Number.isInteger(kronor) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(kronor);
}

const relativeCache = new Map<Locale, Intl.RelativeTimeFormat>();

/** "i går", "för 3 dagar sedan" / "yesterday", "3 days ago".
 *  Negative is in the past, which is how RelativeTimeFormat reads it. */
export function formatRelativeDays(days: number, locale: Locale): string {
  let formatter = relativeCache.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], {
      numeric: "auto",
    });
    relativeCache.set(locale, formatter);
  }
  return formatter.format(days, "day");
}

/** Days between now and a past instant, as a relative phrase. */
export function formatAgo(value: Date | number, locale: Locale): string {
  const then = value instanceof Date ? value.getTime() : value;
  const days = Math.round((then - Date.now()) / 86_400_000);
  return formatRelativeDays(days, locale);
}

/** The date-fns locale object, for the few places that want its
 *  finer-grained relative phrasing ("för 2 timmar sedan"). */
export function dateFnsLocale(locale: Locale): DateFnsLocale {
  return locale === "sv" ? sv : enGB;
}

/** m:ss, which is locale-independent but wanted in one place anyway. */
export function formatSeconds(total: number): string {
  const whole = Math.max(0, Math.round(total));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
