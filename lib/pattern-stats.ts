import { desc, eq, sql } from "drizzle-orm";
import { db } from "./db/index.ts";
import { eloRatings, patternAttempts, sessions } from "./db/schema.ts";
import { ELO_START, nextRating } from "./elo.ts";
import {
  PATTERN_CATEGORY_KEYS,
  PATTERN_CATEGORY_LABELS,
  type PatternCategoryKey,
} from "./generators/index.ts";

/** The notional rating of a generated pattern item. Matches the value the
 *  trainers themselves grade against. */
const ITEM_RATING = 1250;

/** Consecutive local days with pattern work, ending today. */
export async function computeDayStreak(): Promise<number> {
  const dayRows = await db.all<{ d: string }>(
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

/**
 * Rating history per pattern category.
 *
 * This used to be computed inside `gatherAnalytics` and drawn on the
 * report. The trainers page already owns the categories and shows their
 * current ratings, so the history belongs beside them: one home per
 * fact, and the report stops carrying a chart about a feature it does
 * not otherwise mention.
 */
export type EloTrajectoryPoint = { n: number; rating: number };

export type EloTrajectory = {
  category: PatternCategoryKey;
  label: string;
  points: EloTrajectoryPoint[];
  current: number;
  delta: number;
};

export async function eloTrajectories(): Promise<EloTrajectory[]> {
  const rows = await db
    .select({
      category: patternAttempts.category,
      correct: patternAttempts.correct,
      id: patternAttempts.id,
    })
    .from(patternAttempts)
    .orderBy(patternAttempts.id)
    .all();
  const current = new Map(
    (await db.select().from(eloRatings).all()).map((r) => [r.category, r.rating]),
  );

  return PATTERN_CATEGORY_KEYS.map((category) => {
    const subset = rows.filter((r) => r.category === category);
    let rating = ELO_START;
    const all: EloTrajectoryPoint[] = [{ n: 0, rating: ELO_START }];
    for (const [i, row] of subset.entries()) {
      rating = nextRating(rating, ITEM_RATING, row.correct);
      all.push({ n: i + 1, rating: Math.round(rating) });
    }
    // Thin to at most 60 points so a long history still draws cleanly.
    const step = Math.max(1, Math.ceil(all.length / 60));
    const points = all.filter((_, i) => i % step === 0 || i === all.length - 1);
    return {
      category,
      label: PATTERN_CATEGORY_LABELS[category],
      points,
      current: Math.round(current.get(category) ?? rating),
      delta: Math.round(rating - ELO_START),
    };
  });
}
