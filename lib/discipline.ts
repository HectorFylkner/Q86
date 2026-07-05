import {
  predictCell,
  recommend,
  type DecideRecommendation,
} from "./decide-rules.ts";
import { SINK_RATIO, TIME_BENCH } from "./pacing.ts";
import type { Difficulty, Subtopic } from "./taxonomy.ts";

/**
 * Triage discipline: the join between what your record says a question
 * is worth and what you actually did on the clock. /decide trains the
 * call; this engine measures whether the call shows up in real timed
 * sections. One 3-minute question ruins a section — the community
 * consensus nobody measures.
 */
export type TriageVerdict = {
  /** Predicted accuracy for the cell, 0..1 (lib/decide-rules.ts). */
  predicted: number;
  /** Personal attempts behind the prediction (0 = difficulty prior). */
  sample: number;
  recommendation: DecideRecommendation;
  /** Your most recent explicit /decide call on this cell, if any. */
  yourCall: DecideRecommendation | null;
};

export type DisciplineItem = {
  attemptId: number;
  questionId: number;
  /** Local day index of the attempt (lib/local-day.ts). */
  dayIdx: number;
  subtopic: Subtopic;
  difficulty: Difficulty;
  timeSeconds: number;
  correct: boolean;
  verdict: TriageVerdict;
};

export type SunkCost = DisciplineItem & {
  benchSeconds: number;
  /** Seconds past the 1.5× benchmark line — time your record says was
   *  donated. */
  overBySeconds: number;
};

/** Sunk-cost violations: you stayed past 1.5× benchmark on a question
 *  your own record rated guess-or-bail. Worst ratio first. */
export function sunkCosts(items: DisciplineItem[]): SunkCost[] {
  return items
    .filter(
      (it) =>
        it.verdict.recommendation !== "solve" &&
        it.timeSeconds > TIME_BENCH[it.difficulty] * SINK_RATIO,
    )
    .map((it) => ({
      ...it,
      benchSeconds: TIME_BENCH[it.difficulty],
      overBySeconds:
        it.timeSeconds - TIME_BENCH[it.difficulty] * SINK_RATIO,
    }))
    .sort(
      (a, b) =>
        b.timeSeconds / TIME_BENCH[b.difficulty] -
        a.timeSeconds / TIME_BENCH[a.difficulty],
    );
}

/** Triage honored: on a guess-or-bail cell you kept to the benchmark and
 *  moved on — the discipline the drill trains, observed in the wild. */
export function triageWins(items: DisciplineItem[]): DisciplineItem[] {
  return items.filter(
    (it) =>
      it.verdict.recommendation !== "solve" &&
      it.timeSeconds <= TIME_BENCH[it.difficulty],
  );
}

export type DecideRound = { dayIdx: number; total: number; aligned: number };

export type WeeklyDiscipline = {
  /** First day of the bucket, "YYYY-MM-DD". */
  weekStartKey: string;
  timedAnswered: number;
  sunkCosts: number;
  secondsDonated: number;
  decideCalls: number;
  decideAligned: number;
};

/** Weekly buckets, oldest first; bucket 0 ends today (user timezone). */
export function weeklyDiscipline(
  items: DisciplineItem[],
  decideRounds: DecideRound[],
  todayIdx: number,
  keyFromDayIndex: (index: number) => string,
  weeks = 8,
): WeeklyDiscipline[] {
  const buckets: WeeklyDiscipline[] = [];
  for (let back = weeks - 1; back >= 0; back--) {
    buckets.push({
      weekStartKey: keyFromDayIndex(todayIdx - back * 7 - 6),
      timedAnswered: 0,
      sunkCosts: 0,
      secondsDonated: 0,
      decideCalls: 0,
      decideAligned: 0,
    });
  }
  const bucketOf = (dayIdx: number): WeeklyDiscipline | null => {
    const back = Math.floor((todayIdx - dayIdx) / 7);
    if (back < 0 || back >= weeks) return null;
    return buckets[weeks - 1 - back];
  };
  const sunk = new Set(sunkCosts(items).map((s) => s.attemptId));
  for (const it of items) {
    const b = bucketOf(it.dayIdx);
    if (!b) continue;
    b.timedAnswered++;
    if (sunk.has(it.attemptId)) {
      b.sunkCosts++;
      b.secondsDonated += Math.round(
        it.timeSeconds - TIME_BENCH[it.difficulty] * SINK_RATIO,
      );
    }
  }
  for (const r of decideRounds) {
    const b = bucketOf(r.dayIdx);
    if (!b) continue;
    b.decideCalls += r.total;
    b.decideAligned += r.aligned;
  }
  return buckets;
}

/** Verdict for one cell, given its personal record. */
export function verdictFor(
  stats: { correct: number; total: number } | null,
  difficulty: Difficulty,
  yourCall: DecideRecommendation | null = null,
): TriageVerdict {
  const { predicted, sample } = predictCell(stats, difficulty);
  return { predicted, sample, recommendation: recommend(predicted), yourCall };
}
