import { desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { patternAttempts, sessions } from "./db/schema.ts";
import { dayIndex, dayKey, keyFromDayIndex } from "./local-day.ts";
import { appTimeZone } from "./settings.ts";

/** Consecutive local days (user timezone) with pattern work, ending today. */
export async function computeDayStreak(): Promise<number> {
  const tz = await appTimeZone();
  const rows = await db
    .select({ createdAt: patternAttempts.createdAt })
    .from(patternAttempts)
    .orderBy(desc(patternAttempts.id))
    .limit(20_000)
    .all();
  const days = new Set(rows.map((r) => dayKey(r.createdAt, tz)));
  const today = dayIndex(new Date(), tz);
  let streak = 0;
  while (days.has(keyFromDayIndex(today - streak))) streak++;
  return streak;
}

/** Current consecutive-correct run for one category. */
export async function computeCategoryStreak(
  category: string,
): Promise<number> {
  const recent = await db
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
export async function bestRoundScore(
  categorySelection: string,
): Promise<number> {
  const pastSessions = await db
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
