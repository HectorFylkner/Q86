import { desc, eq, sql } from "drizzle-orm";
import type { ScopedDb } from "./db/scoped.ts";
import { patternAttempts, sessions } from "./db/schema.ts";

/** Consecutive local days with pattern work, ending today. */
export async function computeDayStreak(sdb: ScopedDb): Promise<number> {
  // Raw SQL for SQLite's date functions; the tenant predicate is bound in
  // rather than interpolated, and is not optional.
  const dayRows = await sdb.q.all<{ d: string }>(
    sql`select distinct date(created_at / 1000.0, 'unixepoch', 'localtime') as d
        from pattern_attempts
        where user_id = ${sdb.userId}
        order by d desc`,
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < dayRows.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = [
      expected.getFullYear(),
      String(expected.getMonth() + 1).padStart(2, "0"),
      String(expected.getDate()).padStart(2, "0"),
    ].join("-");
    if (dayRows[i]?.d === expectedStr) streak++;
    else break;
  }
  return streak;
}

/** Current consecutive-correct run for one category. */
export async function computeCategoryStreak(
  sdb: ScopedDb,
  category: string,
): Promise<number> {
  const recent = await sdb.q
    .select({ correct: patternAttempts.correct })
    .from(patternAttempts)
    .where(sdb.own(patternAttempts, eq(patternAttempts.category, category)))
    .orderBy(desc(patternAttempts.id))
    .limit(200)
    .all();
  let streak = 0;
  for (const row of recent) {
    if (row.correct) streak++;
    else break;
  }
  return streak;
}

/** Best round score for a category selection ("mixed" or a category key),
 *  from pattern session summaries. */
export async function bestRoundScore(
  sdb: ScopedDb,
  categorySelection: string,
): Promise<number> {
  const pastSessions = await sdb.rows(
    sessions,
    eq(sessions.mode, "pattern"),
  );
  return pastSessions.reduce((best, s) => {
    const summary = s.summary as { category?: string; score?: number } | null;
    if (!summary || summary.category !== categorySelection) return best;
    return Math.max(best, summary.score ?? 0);
  }, 0);
}
