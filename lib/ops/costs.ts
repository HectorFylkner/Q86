/**
 * What a call to the model costs.
 *
 * Prices are per million tokens in USD, converted at a fixed rate, and
 * they are wrong the moment Anthropic changes them — which is why they are
 * here, in one file, rather than spread through the routes, and why
 * `api_usage` stores the token counts as well as the derived cost. A price
 * change is then a re-read of history, not a lost one.
 *
 * The caps below exist to stop a runaway loop or an abusive account, not
 * to price the product. They are deliberately generous for a real user and
 * ruinous for a script.
 */

/** USD per million tokens, Claude Sonnet class. */
export const USD_PER_MTOK_INPUT = 3;
export const USD_PER_MTOK_OUTPUT = 15;

/**
 * SEK per USD. A fixed rate, not a live one: a cost cap that moves with
 * the exchange rate is a cap that fails at the worst moment, and being
 * approximately right is the entire requirement here.
 */
export const SEK_PER_USD = 11;

/** Integer öre, rounded up: a cap must never under-count. */
export function costOre(inputTokens: number, outputTokens: number): number {
  const usd =
    (inputTokens / 1_000_000) * USD_PER_MTOK_INPUT +
    (outputTokens / 1_000_000) * USD_PER_MTOK_OUTPUT;
  return Math.ceil(usd * SEK_PER_USD * 100);
}

/** The three endpoints that spend money. */
export const METERED_ROUTES = ["generate", "coach", "parse-report"] as const;
export type MeteredRoute = (typeof METERED_ROUTES)[number];

export type RouteLimits = {
  /** Calls allowed in a rolling hour. */
  perHour: number;
  /** Calls allowed in a rolling day. */
  perDay: number;
};

/**
 * Per-route call limits. Coach is the one a subscriber uses often, so it
 * is the loosest; generate writes into the shared bank and is admin-only
 * anyway, so its limit is a backstop rather than a policy.
 */
export const ROUTE_LIMITS: Record<MeteredRoute, RouteLimits> = {
  generate: { perHour: 6, perDay: 20 },
  coach: { perHour: 20, perDay: 60 },
  "parse-report": { perHour: 5, perDay: 15 },
};

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * The hard monthly cost cap for one account, in öre. Default 50 kr, which
 * is a fifth of the monthly plan — a subscriber cannot cost more than they
 * pay without an operator deciding so.
 */
export function userMonthlyCapOre(): number {
  return envInt("AI_USER_MONTHLY_CAP_ORE", 5_000);
}

/**
 * The hard monthly cost cap across every account. This is the one that
 * matters at three in the morning: it bounds the whole bill, not one
 * account's share of it. Default 2 000 kr.
 */
export function globalMonthlyCapOre(): number {
  return envInt("AI_GLOBAL_MONTHLY_CAP_ORE", 200_000);
}
