import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  attempts,
  deckReviews,
  questions,
  settings,
} from "../db/schema.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "../taxonomy.ts";

/**
 * Per-account activity, read across accounts.
 *
 * The lifecycle dispatcher runs outside any request, so there is no
 * session and no `ScopedDb` to scope through. Every query here takes the
 * user id as a bound parameter and is read-only — the same shape the
 * billing webhook uses, and allowed by name in the tenancy structural
 * test for the same reason.
 */

export type WeekSummary = {
  attempts: number;
  correct: number;
  /** Distinct local days with at least one attempt, 0–7. */
  days: number;
  reviewed: number;
  weakestSkill: FundamentalSkill | null;
};

const DAY = 86_400_000;

export async function weekSummary(
  userId: string,
  now: Date = new Date(),
): Promise<WeekSummary> {
  const since = new Date(now.getTime() - 7 * DAY);

  const rows = await db
    .select({
      correct: attempts.correct,
      skill: questions.fundamentalSkill,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .innerJoin(questions, eq(questions.id, attempts.questionId))
    .where(
      and(
        eq(attempts.userId, userId),
        gte(attempts.createdAt, since),
        // Casual attempts are excluded from analytics everywhere else, so
        // a weekly summary that counted them would disagree with the app.
        eq(attempts.focus, "focused"),
      ),
    )
    .all();

  const perSkill = new Map<FundamentalSkill, { correct: number; total: number }>(
    FUNDAMENTAL_SKILLS.map((s) => [s, { correct: 0, total: 0 }]),
  );
  const days = new Set<string>();
  let correct = 0;
  for (const row of rows) {
    if (row.correct) correct++;
    days.add(row.createdAt.toISOString().slice(0, 10));
    const record = perSkill.get(row.skill);
    if (record) {
      record.total++;
      if (row.correct) record.correct++;
    }
  }

  // `updatedAt` moves on every grading, so this counts cards touched in
  // the window rather than cards that exist.
  const reviewedRows = await db
    .select({ n: sql<number>`count(*)` })
    .from(deckReviews)
    .where(
      and(eq(deckReviews.userId, userId), gte(deckReviews.updatedAt, since)),
    )
    .get();

  // Only skills with enough attempts to mean anything; three is the same
  // floor the drill weighting uses before it trusts a rate.
  let weakestSkill: FundamentalSkill | null = null;
  let worst = 1.1;
  for (const skill of FUNDAMENTAL_SKILLS) {
    const record = perSkill.get(skill);
    if (!record || record.total < 3) continue;
    const rate = record.correct / record.total;
    if (rate < worst) {
      worst = rate;
      weakestSkill = skill;
    }
  }

  return {
    attempts: rows.length,
    correct,
    days: days.size,
    reviewed: reviewedRows?.n ?? 0,
    weakestSkill,
  };
}

/**
 * Consecutive local days with a focused attempt, ending on `endingOn`.
 *
 * Separate from `computeDayStreak` in lib/pattern-stats.ts, which counts
 * pattern-trainer days only and always ends today. This one counts real
 * question work and can end yesterday, which is what "the streak broke"
 * has to ask.
 */
export async function attemptStreak(
  userId: string,
  endingOn: Date,
): Promise<number> {
  const rows = await db.all<{ d: string }>(
    sql`select distinct date(created_at / 1000.0, 'unixepoch') as d
        from attempts
        where user_id = ${userId} and focus = 'focused'
        order by d desc`,
  );
  const have = new Set(rows.map((r) => r.d));
  let streak = 0;
  for (let i = 0; ; i++) {
    const day = new Date(endingOn.getTime() - i * DAY)
      .toISOString()
      .slice(0, 10);
    if (!have.has(day)) break;
    streak++;
  }
  return streak;
}

/** The account's test date setting, parsed, or null. */
export async function testDateFor(userId: string): Promise<Date | null> {
  const row = await db
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.userId, userId), eq(settings.key, "test_date")))
    .get();
  if (!row?.value) return null;
  const parsed = new Date(`${row.value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / DAY);
}
