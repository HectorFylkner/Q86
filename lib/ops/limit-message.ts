import type { Key, Translate } from "../i18n/index.ts";

/**
 * Turn a refusal from a metered endpoint into a sentence.
 *
 * The routes answer with a machine-readable `reason`, never a sentence,
 * for the same reason the auth actions do (ADR 0004): the wording lives in
 * the catalog and one endpoint serves both locales.
 */
const REASONS = ["rate_hour", "rate_day", "user_cap", "global_cap"] as const;

export function limitMessage(
  t: Translate,
  body: { error?: string; reason?: string } | null,
): string | null {
  if (!body || body.error !== "over_budget") return null;
  const reason = REASONS.find((r) => r === body.reason);
  return t(`limits.${reason ?? "rate_hour"}` as Key);
}
