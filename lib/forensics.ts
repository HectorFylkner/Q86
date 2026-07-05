import { ERROR_TYPES, type ErrorType } from "./taxonomy.ts";

/**
 * Careless-error forensics: recurrence trends per error mechanism. At the
 * top of the scale one careless miss erases weeks of work — the question
 * that matters is not "how many calculation errors have I ever made" but
 * "is the rate falling."
 */
export type ForensicRow = {
  dayIdx: number;
  correct: boolean;
  errorType: ErrorType | null;
};

export type ErrorWeek = {
  /** First day of the bucket, "YYYY-MM-DD". */
  weekStartKey: string;
  attempts: number;
  /** Wrong answers that carry an error tag. */
  classified: number;
  counts: Record<ErrorType, number>;
};

/** Weekly buckets, oldest first; the last bucket ends today. */
export function weeklyErrorRates(
  rows: ForensicRow[],
  todayIdx: number,
  keyFromDayIndex: (index: number) => string,
  weeks = 8,
): ErrorWeek[] {
  const buckets: ErrorWeek[] = [];
  for (let back = weeks - 1; back >= 0; back--) {
    const counts = {} as Record<ErrorType, number>;
    for (const et of ERROR_TYPES) counts[et] = 0;
    buckets.push({
      weekStartKey: keyFromDayIndex(todayIdx - back * 7 - 6),
      attempts: 0,
      classified: 0,
      counts,
    });
  }
  for (const r of rows) {
    const back = Math.floor((todayIdx - r.dayIdx) / 7);
    if (back < 0 || back >= weeks) continue;
    const b = buckets[weeks - 1 - back];
    b.attempts++;
    if (!r.correct && r.errorType) {
      b.classified++;
      b.counts[r.errorType]++;
    }
  }
  return buckets;
}

/** The error mechanisms worth charting: highest lifetime counts first. */
export function topMechanisms(
  weekly: ErrorWeek[],
  limit = 4,
): ErrorType[] {
  const totals = ERROR_TYPES.map((et) => ({
    et,
    n: weekly.reduce((s, w) => s + w.counts[et], 0),
  }));
  return totals
    .filter((t) => t.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((t) => t.et);
}
