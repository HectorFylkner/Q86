import {
  SOLUTION_STRATEGIES,
  type SolutionStrategy,
} from "./solution-strategy.ts";

/** Pure half of the technique panel: no database, so it is testable and
 *  importable from anywhere. lib/strategy-server.ts supplies the rows. */

export type StrategyAttempt = {
  strategy: SolutionStrategy;
  correct: boolean;
  seconds: number;
};

export type StrategyRow = {
  strategy: SolutionStrategy;
  /** Verified bank items whose fastest path is primarily this strategy. */
  bankItems: number;
  attempts: number;
  correct: number;
  /** Null until there are enough attempts to mean anything. */
  accuracy: number | null;
  medianSeconds: number | null;
};

export type StrategyReport = {
  rows: StrategyRow[];
  /** Median seconds across attempts on `structural` items — the baseline
   *  a shortcut is supposed to beat. */
  baselineSeconds: number | null;
  /** Shortcut strategies the user is no faster on than their own
   *  structural baseline: evidence the shortcut is not being taken. */
  unreached: SolutionStrategy[];
  totalAttempts: number;
};

/** Minimum attempts before a per-strategy number is shown at all. Below
 *  this, a single bad question moves the median more than a habit does. */
export const STRATEGY_MIN_ATTEMPTS = 5;

export function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function summarizeStrategies(
  attempts: StrategyAttempt[],
  bankItems: Record<SolutionStrategy, number>,
): StrategyReport {
  const acc = new Map<
    SolutionStrategy,
    { n: number; correct: number; seconds: number[] }
  >();
  for (const s of SOLUTION_STRATEGIES) {
    acc.set(s, { n: 0, correct: 0, seconds: [] });
  }
  for (const a of attempts) {
    const bucket = acc.get(a.strategy);
    if (!bucket) continue;
    bucket.n += 1;
    if (a.correct) bucket.correct += 1;
    // A zero or negative time is a logging artefact, not a fast solve.
    if (a.seconds > 0) bucket.seconds.push(a.seconds);
  }

  const structural = acc.get("structural")!;
  const baselineSeconds =
    structural.seconds.length >= STRATEGY_MIN_ATTEMPTS
      ? median(structural.seconds)
      : null;

  const rows: StrategyRow[] = SOLUTION_STRATEGIES.map((strategy) => {
    const bucket = acc.get(strategy)!;
    return {
      strategy,
      bankItems: bankItems[strategy] ?? 0,
      attempts: bucket.n,
      correct: bucket.correct,
      accuracy:
        bucket.n >= STRATEGY_MIN_ATTEMPTS ? bucket.correct / bucket.n : null,
      medianSeconds:
        bucket.seconds.length >= STRATEGY_MIN_ATTEMPTS
          ? median(bucket.seconds)
          : null,
    };
  });

  // "Unreached" is a claim about a habit, so the comparison has to be
  // fair: shortcut strategies only, both sides above the attempt floor,
  // and only when the shortcut saves nothing. A shortcut that is no
  // faster than the grind was not actually taken.
  const unreached = rows
    .filter(
      (r) =>
        r.strategy !== "structural" &&
        r.medianSeconds !== null &&
        baselineSeconds !== null &&
        r.medianSeconds >= baselineSeconds,
    )
    .map((r) => r.strategy);

  return {
    rows,
    baselineSeconds,
    unreached,
    totalAttempts: attempts.length,
  };
}
