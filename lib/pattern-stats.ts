import { desc, eq, sql } from "drizzle-orm";
import { db } from "./db/index.ts";
import { patternAttempts, sessions } from "./db/schema.ts";

/** Consecutive local days with pattern work, ending today. */
export function computeDayStreak(): number {
  const dayRows = db.all<{ d: string }>(
    sql`select distinct date(created_at / 1000.0, 'unixepoch', 'localtime') as d
        from pattern_attempts order by d desc`,
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
export function computeCategoryStreak(category: string): number {
  const recent = db
    .select({ correct: patternAttempts.correct })
    .from(patternAttempts)
    .where(eq(patternAttempts.category, category))
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
export function bestRoundScore(categorySelection: string): number {
  const pastSessions = db
    .select()
    .from(sessions)
    .where(eq(sessions.mode, "pattern"))
    .all();
  return pastSessions.reduce((best, s) => {
    const summary = s.summary as { category?: string; score?: number } | null;
    if (!summary || summary.category !== categorySelection) return best;
    return Math.max(best, summary.score ?? 0);
  }, 0);
}
