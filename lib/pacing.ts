import type { Difficulty } from "./taxonomy.ts";

/**
 * Per-difficulty time benchmarks for timed work, in seconds. The section
 * average is ~128s/question (21 in 45:00); harder questions earn more of
 * that budget. A question is a "time sink" when it ran half again over
 * its benchmark, and "rushed" when answered wrong in under half of it.
 */
export const TIME_BENCH: Record<Difficulty, number> = {
  2: 100,
  3: 125,
  4: 150,
  5: 170,
};

/** Benchmark for a raw difficulty read off a question row. D1 was retired
 *  from the taxonomy, so anything below D2 (or above D5) clamps into range
 *  rather than returning undefined and poisoning the arithmetic. */
export function benchSeconds(difficulty: number): number {
  const d = Math.min(5, Math.max(2, Math.round(difficulty))) as Difficulty;
  return TIME_BENCH[d];
}

export const SINK_RATIO = 1.5;
export const RUSH_RATIO = 0.5;

export type PacedItem = {
  index: number; // 0-based question position
  difficulty: Difficulty;
  timeSeconds: number;
  correct: boolean;
};

export type PacingRead = {
  /** Average time vs benchmark per difficulty actually seen. */
  byDifficulty: Array<{
    difficulty: Difficulty;
    n: number;
    avgSeconds: number;
    benchSeconds: number;
  }>;
  sinks: PacedItem[]; // worst first
  rushedWrong: PacedItem[];
};

export function pacingRead(items: PacedItem[]): PacingRead {
  const byDiff = new Map<Difficulty, { total: number; n: number }>();
  for (const it of items) {
    const agg = byDiff.get(it.difficulty) ?? { total: 0, n: 0 };
    agg.total += it.timeSeconds;
    agg.n += 1;
    byDiff.set(it.difficulty, agg);
  }
  const byDifficulty = [...byDiff.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([difficulty, { total, n }]) => ({
      difficulty,
      n,
      avgSeconds: total / n,
      benchSeconds: benchSeconds(difficulty),
    }));

  const sinks = items
    .filter((it) => it.timeSeconds > benchSeconds(it.difficulty) * SINK_RATIO)
    .sort(
      (a, b) =>
        b.timeSeconds / benchSeconds(b.difficulty) -
        a.timeSeconds / benchSeconds(a.difficulty),
    );

  const rushedWrong = items.filter(
    (it) =>
      !it.correct && it.timeSeconds < benchSeconds(it.difficulty) * RUSH_RATIO,
  );

  return { byDifficulty, sinks, rushedWrong };
}
