import { cookies } from "next/headers";
import { currentUser } from "../auth/session.ts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./types.ts";

/**
 * Resolving the locale (ADR 0004): the signed-in account's preference,
 * then a cookie set by the language toggle, then Swedish.
 *
 * Accept-Language is deliberately *not* consulted. A large share of
 * Swedish users run an English-language browser or operating system, so
 * the header would serve English to much of the audience this product is
 * built for. Swedish is the default; the toggle — which is on the
 * credential screens too, not only inside the app — is how anyone else
 * changes it, and the choice is remembered.
 *
 * There is no locale segment in the URL. The application is served from
 * unprefixed paths and the public site is Swedish at the root, because the
 * search intent Q86 targets is Swedish.
 */

export const LOCALE_COOKIE = "q86_locale";

export async function getLocale(): Promise<Locale> {
  const user = await currentUser();
  if (user && isLocale(user.locale)) return user.locale;

  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  return DEFAULT_LOCALE;
}
