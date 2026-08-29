import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  accessGrants,
  apiUsage,
  attempts,
  emailLog,
  questionFlags,
  questions,
  subscriptions,
  users,
} from "../db/schema.ts";
import { monthKey } from "./budget.ts";
import { globalMonthlyCapOre, userMonthlyCapOre } from "./costs.ts";

/**
 * Everything the admin surface reads, in one module.
 *
 * Every query here is cross-tenant by design — that is what an operator
 * surface is — so the page above it must gate on `requireAdmin()`. The
 * structural test in tests/unit/paywall-structure.test.ts checks that it
 * does; nothing in this file checks a role, because a module that
 * sometimes enforces and sometimes does not is worse than one that never
 * claims to.
 */

export type AccountRow = {
  id: string;
  email: string;
  createdAt: Date;
  locale: string;
  role: string;
  plan: string | null;
  status: string | null;
  currentPeriodEnd: Date | null;
  grantedUntil: Date | null;
  attempts: number;
  spendOre: number;
};

export async function accountRows(limit = 100): Promise<AccountRow[]> {
  const month = monthKey();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      locale: users.locale,
      role: users.role,
      plan: subscriptions.plan,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(users)
    .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .all();

  const out: AccountRow[] = [];
  for (const row of rows) {
    const grant = await db
      .select({ expiresAt: accessGrants.expiresAt })
      .from(accessGrants)
      .where(
        and(
          eq(accessGrants.userId, row.id),
          gte(accessGrants.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(accessGrants.expiresAt))
      .get();
    const attemptCount = await db
      .select({ n: sql<number>`count(*)` })
      .from(attempts)
      .where(eq(attempts.userId, row.id))
      .get();
    const spend = await db
      .select({ total: sql<number>`coalesce(sum(${apiUsage.costOre}), 0)` })
      .from(apiUsage)
      .where(and(eq(apiUsage.userId, row.id), eq(apiUsage.month, month)))
      .get();

    out.push({
      ...row,
      grantedUntil: grant?.expiresAt ?? null,
      attempts: attemptCount?.n ?? 0,
      spendOre: spend?.total ?? 0,
    });
  }
  return out;
}

export type SpendSummary = {
  month: string;
  totalOre: number;
  capOre: number;
  userCapOre: number;
  byRoute: Array<{ route: string; calls: number; ore: number; failed: number }>;
  topAccounts: Array<{ userId: string; ore: number }>;
};

export async function spendSummary(): Promise<SpendSummary> {
  const month = monthKey();
  const byRoute = await db
    .select({
      route: apiUsage.route,
      calls: sql<number>`count(*)`,
      ore: sql<number>`coalesce(sum(${apiUsage.costOre}), 0)`,
      failed: sql<number>`sum(case when ${apiUsage.ok} then 0 else 1 end)`,
    })
    .from(apiUsage)
    .where(eq(apiUsage.month, month))
    .groupBy(apiUsage.route)
    .all();

  const topAccounts = await db
    .select({
      userId: apiUsage.userId,
      ore: sql<number>`coalesce(sum(${apiUsage.costOre}), 0)`,
    })
    .from(apiUsage)
    .where(eq(apiUsage.month, month))
    .groupBy(apiUsage.userId)
    .orderBy(sql`sum(${apiUsage.costOre}) desc`)
    .limit(5)
    .all();

  return {
    month,
    totalOre: byRoute.reduce((sum, row) => sum + row.ore, 0),
    capOre: globalMonthlyCapOre(),
    userCapOre: userMonthlyCapOre(),
    byRoute,
    topAccounts,
  };
}

export type Counts = {
  accounts: number;
  paid: number;
  granted: number;
  openFlags: number;
  bankVerified: number;
  bankRetired: number;
  emailsThisWeek: number;
};

export async function counts(): Promise<Counts> {
  const one = async (query: Promise<{ n: number } | undefined>) =>
    (await query)?.n ?? 0;

  return {
    accounts: await one(
      db.select({ n: sql<number>`count(*)` }).from(users).get(),
    ),
    paid: await one(
      db
        .select({ n: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          sql`${subscriptions.plan} != 'free' and ${subscriptions.status} in ('active','trialing','past_due','canceled')`,
        )
        .get(),
    ),
    granted: await one(
      db
        .select({ n: sql<number>`count(distinct ${accessGrants.userId})` })
        .from(accessGrants)
        .where(gte(accessGrants.expiresAt, new Date()))
        .get(),
    ),
    openFlags: await one(
      db
        .select({ n: sql<number>`count(*)` })
        .from(questionFlags)
        .where(eq(questionFlags.status, "open"))
        .get(),
    ),
    bankVerified: await one(
      db
        .select({ n: sql<number>`count(*)` })
        .from(questions)
        .where(eq(questions.verified, true))
        .get(),
    ),
    bankRetired: await one(
      db
        .select({ n: sql<number>`count(*)` })
        .from(questions)
        .where(eq(questions.verified, false))
        .get(),
    ),
    emailsThisWeek: await one(
      db
        .select({ n: sql<number>`count(*)` })
        .from(emailLog)
        .where(gte(emailLog.sentAt, new Date(Date.now() - 7 * 86_400_000)))
        .get(),
    ),
  };
}
