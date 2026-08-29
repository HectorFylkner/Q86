import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { apiUsage } from "../db/schema.ts";
import {
  ROUTE_LIMITS,
  costOre,
  globalMonthlyCapOre,
  userMonthlyCapOre,
  type MeteredRoute,
} from "./costs.ts";

/**
 * The guard in front of every endpoint that spends money.
 *
 * Two questions, asked in this order because they fail differently: has
 * this account made too many calls too quickly (rate), and has the month
 * already cost too much (budget)? A rate limit protects the service; a
 * cost cap protects the bill, and a runaway loop trips the first long
 * before the second.
 *
 * Metering happens after the call, with the provider's own token counts,
 * because that is the only honest number. The cost of the call in flight
 * is therefore never counted against its own check — which is why the caps
 * are set well below what a single call could ever spend.
 */

export type Denial = {
  reason: "rate_hour" | "rate_day" | "user_cap" | "global_cap";
  /** Seconds until the same call would be allowed, when that is knowable. */
  retryAfter: number | null;
};

export type BudgetCheck = { ok: true } | { ok: false; denial: Denial };

const HOUR = 3_600_000;
const DAY = 86_400_000;

/** YYYY-MM in UTC. The month boundary is UTC everywhere, so a cap does not
 *  move with the reader's timezone. */
export function monthKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

async function callsSince(userId: string, route: string, since: Date) {
  const row = await db
    .select({ n: sql<number>`count(*)` })
    .from(apiUsage)
    .where(
      and(
        eq(apiUsage.userId, userId),
        eq(apiUsage.route, route),
        gte(apiUsage.createdAt, since),
      ),
    )
    .get();
  return row?.n ?? 0;
}

export async function monthSpendOre(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const row = await db
    .select({ total: sql<number>`coalesce(sum(${apiUsage.costOre}), 0)` })
    .from(apiUsage)
    .where(
      and(eq(apiUsage.userId, userId), eq(apiUsage.month, monthKey(now))),
    )
    .get();
  return row?.total ?? 0;
}

export async function globalMonthSpendOre(
  now: Date = new Date(),
): Promise<number> {
  const row = await db
    .select({ total: sql<number>`coalesce(sum(${apiUsage.costOre}), 0)` })
    .from(apiUsage)
    .where(eq(apiUsage.month, monthKey(now)))
    .get();
  return row?.total ?? 0;
}

export async function checkBudget(
  userId: string,
  route: MeteredRoute,
  now: Date = new Date(),
): Promise<BudgetCheck> {
  const limits = ROUTE_LIMITS[route];

  const inHour = await callsSince(userId, route, new Date(now.getTime() - HOUR));
  if (inHour >= limits.perHour) {
    return { ok: false, denial: { reason: "rate_hour", retryAfter: 3600 } };
  }

  const inDay = await callsSince(userId, route, new Date(now.getTime() - DAY));
  if (inDay >= limits.perDay) {
    return { ok: false, denial: { reason: "rate_day", retryAfter: 86_400 } };
  }

  if ((await monthSpendOre(userId, now)) >= userMonthlyCapOre()) {
    return { ok: false, denial: { reason: "user_cap", retryAfter: null } };
  }

  if ((await globalMonthSpendOre(now)) >= globalMonthlyCapOre()) {
    // Deliberately last and deliberately blunt. When this trips, every
    // account is refused until the operator raises the cap or the month
    // turns — which is the correct behaviour for a bill that is running
    // away, and a worse experience than any alternative except the bill.
    return { ok: false, denial: { reason: "global_cap", retryAfter: null } };
  }

  return { ok: true };
}

export type Usage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

/**
 * Record what a call cost. Called on success and on failure alike: a call
 * that reached the provider was billed whether or not the answer was
 * usable, and a meter that only counted successes would under-report
 * exactly when something is going wrong.
 */
export async function meter(input: {
  userId: string;
  route: MeteredRoute;
  usage?: Usage;
  ok: boolean;
  now?: Date;
}): Promise<number> {
  const now = input.now ?? new Date();
  const inputTokens = Math.max(0, Math.round(input.usage?.inputTokens ?? 0));
  const outputTokens = Math.max(0, Math.round(input.usage?.outputTokens ?? 0));
  const cost = costOre(inputTokens, outputTokens);

  await db.insert(apiUsage).values({
    userId: input.userId,
    route: input.route,
    month: monthKey(now),
    inputTokens,
    outputTokens,
    costOre: cost,
    ok: input.ok,
    createdAt: now,
  });
  return cost;
}

/** The message a denial turns into, as a catalog key. */
export function denialKey(denial: Denial): string {
  return `limits.${denial.reason}`;
}
