/**
 * The aggregation arithmetic behind Progress, with no database and no
 * clock in it.
 *
 * These are the numbers the user reads as "how am I doing". Silent
 * breakage here does not crash anything — it just quietly reports the
 * wrong thing for as long as nobody checks, which is why they live
 * apart from the queries and are covered by tests.
 */

export type TimeBucketEdge = {
  /** Inclusive lower bound in seconds. */
  from: number;
  /** Exclusive upper bound; null means open-ended. */
  to: number | null;
  label: string;
};

export type Bucketed = TimeBucketEdge & { correct: number; total: number };

/**
 * Split attempts into time buckets. Boundaries are half-open [from, to)
 * so an attempt lands in exactly one bucket and none is counted twice.
 */
export function bucketByTime(
  rows: ReadonlyArray<{ timeSeconds: number; correct: boolean }>,
  edges: ReadonlyArray<TimeBucketEdge>,
): Bucketed[] {
  return edges.map((edge) => {
    const subset = rows.filter(
      (r) =>
        r.timeSeconds >= edge.from && (edge.to == null || r.timeSeconds < edge.to),
    );
    return {
      ...edge,
      correct: subset.filter((r) => r.correct).length,
      total: subset.length,
    };
  });
}

/** Whole-percent accuracy; an empty denominator is null, never zero. */
export function accuracyPct(correct: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((correct / total) * 100);
}

/**
 * The median of a numeric sample. Even-length samples take the mean of
 * the two middle values — the median of an even set is not "the one
 * after the middle".
 */
export function median(values: ReadonlyArray<number>): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Mastery-grid ink level: 0 = untouched, 1..4 = increasing accuracy. */
export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

export function masteryLevel(
  cell: { correct: number; total: number },
  masteryBar: number,
): MasteryLevel {
  if (cell.total === 0) return 0;
  const accuracy = cell.correct / cell.total;
  if (accuracy < 0.5) return 1;
  if (accuracy < 0.7) return 2;
  if (accuracy < masteryBar) return 3;
  return 4;
}

/** A cell worth working: enough evidence, and below the bar. */
export function needsWork(
  cell: { correct: number; total: number },
  masteryBar: number,
  minAttempts: number,
): boolean {
  return cell.total >= minAttempts && cell.correct / cell.total < masteryBar;
}

/**
 * Trailing-window accuracy at a point in time.
 *
 * Returns null rather than 0 when the window is empty: an accuracy of
 * zero and an absence of attempts look identical on a chart, and only
 * one of them is bad news.
 */
export function windowAccuracy(
  rows: ReadonlyArray<{ at: number; correct: boolean }>,
  windowEndMs: number,
  windowDays: number,
): number | null {
  const start = windowEndMs - windowDays * 86_400_000;
  const subset = rows.filter((r) => r.at > start && r.at <= windowEndMs);
  return accuracyPct(subset.filter((r) => r.correct).length, subset.length);
}

/**
 * Calibration: the gap between how sure the user was and how right they
 * were. A positive gap is overconfidence — the expensive direction on a
 * test whose decisive skill is knowing when to abandon a question.
 */
export type CalibrationRow = {
  bucket: string;
  expected: number;
  actual: number | null;
  total: number;
  /** expected − actual, in points; null with no data. */
  gap: number | null;
};

export function calibration<K extends string>(
  rows: ReadonlyArray<{ confidence: K; correct: boolean }>,
  expectedByBucket: Record<K, number>,
  buckets: ReadonlyArray<K>,
): CalibrationRow[] {
  return buckets.map((bucket) => {
    const subset = rows.filter((r) => r.confidence === bucket);
    const actual = accuracyPct(
      subset.filter((r) => r.correct).length,
      subset.length,
    );
    return {
      bucket,
      expected: expectedByBucket[bucket],
      actual,
      total: subset.length,
      gap: actual == null ? null : expectedByBucket[bucket] - actual,
    };
  });
}

/**
 * One number for calibration overall: the attempt-weighted mean absolute
 * gap. Weighted, because a 40-point miss on two attempts says much less
 * than a 10-point miss on two hundred.
 */
export function calibrationError(rows: ReadonlyArray<CalibrationRow>): number | null {
  const usable = rows.filter((r) => r.gap != null && r.total > 0);
  const weight = usable.reduce((s, r) => s + r.total, 0);
  if (weight === 0) return null;
  return (
    usable.reduce((s, r) => s + Math.abs(r.gap as number) * r.total, 0) / weight
  );
}
