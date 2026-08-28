import type { Key, Translate } from "../i18n/index.ts";

/**
 * Server actions return codes, not sentences, so the wording lives in the
 * catalog and one action serves both locales (ADR 0004).
 *
 * This lives outside the form components because both a server page (the
 * `?error=` branch after an OAuth redirect) and a client form need it, and
 * a function exported from a `"use client"` module cannot be called on the
 * server.
 */
export function authMessage(t: Translate, code: string | null): string | null {
  if (!code) return null;
  const key = `auth.errors.${code}` as Key;
  const message = t(key);
  return message === key ? t("auth.errors.generic") : message;
}
