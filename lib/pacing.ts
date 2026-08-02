import type { Difficulty } from "./taxonomy.ts";

/**
 * Per-difficulty time benchmarks for timed work, in seconds. The section
 * average is ~128s/question (21 in 45:00); harder questions earn more of
 * that budget. A question is a "time sink" when it ran half again over
 * its benchmark, and "rushed" when answered wrong in under half of it.
 */
export const TIME_BENCH: Record<Difficulty, number> = {
  1: 85,
  2: 100,
  3: 125,
  4: 150,
  5: 170,
};

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
      benchSeconds: TIME_BENCH[difficulty],
    }));

  const sinks = items
    .filter((it) => it.timeSeconds > TIME_BENCH[it.difficulty] * SINK_RATIO)
    .sort(
      (a, b) =>
        b.timeSeconds / TIME_BENCH[b.difficulty] -
        a.timeSeconds / TIME_BENCH[a.difficulty],
    );

  const rushedWrong = items.filter(
    (it) => !it.correct && it.timeSeconds < TIME_BENCH[it.difficulty] * RUSH_RATIO,
  );

  return { byDifficulty, sinks, rushedWrong };
}

// ─────────────────────────────────────────────────────────────────────────
// Section checkpoints
// ─────────────────────────────────────────────────────────────────────────

/**
 * The pacing checkpoint system.
 *
 * The previous checkpoints were Q7·30:00 and Q14·15:00 — round numbers
 * that do not correspond to even pacing. Entering question 7 means six
 * questions are done, which at 45/21 minutes each consumes 12.86 minutes
 * and leaves 32:09, not 30:00. A student who hits the displayed target is
 * therefore two minutes behind and being told they are on pace.
 *
 * These are derived instead: the target on entering question `q` is
 * `total - (q - 1) * total / count`, rounded to the nearest minute, which
 * is what every published pacing table is computing. Four of them on the
 * full section, because four is the most a reader will actually memorize
 * and the interval between them is short enough that a deficit is still
 * recoverable when it is found.
 *
 * The band is the other half. Inside 90 seconds of target you are on pace
 * and should change nothing; outside it you act at the *next* question,
 * never mid-question. Without a band, a checkpoint reads as a deadline
 * and manufactures the rushing it exists to prevent.
 */
export const CHECKPOINT_BAND_SECONDS = 90;

/** Questions at which the full 21-question section reports a checkpoint. */
export const FULL_CHECKPOINT_QUESTIONS = [5, 9, 14, 18] as const;
/** Questions at which the 7-question mini set reports a checkpoint. */
export const MINI_CHECKPOINT_QUESTIONS = [3, 5] as const;

export type SectionCheckpoint = {
  /** 1-based question number this checkpoint is measured on entering. */
  question: number;
  /** Seconds that should remain on entering it, on even pacing. */
  remainingTarget: number;
  /** "Q5 · 36:00" — the question and the target, as displayed. */
  label: string;
};

function mmss(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Even-pacing targets for a section, rounded to the nearest minute so the
 * numbers are memorable. Rounding to the minute moves a target by at most
 * 30 seconds — a third of the band — so it never changes the verdict.
 */
export function sectionCheckpoints(
  totalSeconds: number,
  questionCount: number,
  atQuestions: readonly number[],
): SectionCheckpoint[] {
  const perQuestion = totalSeconds / questionCount;
  return atQuestions
    .filter((q) => q >= 1 && q <= questionCount)
    .map((question) => {
      const exact = totalSeconds - (question - 1) * perQuestion;
      const remainingTarget = Math.round(exact / 60) * 60;
      return {
        question,
        remainingTarget,
        label: `Q${question} · ${mmss(remainingTarget)}`,
      };
    });
}

export type PaceVerdict = "ahead" | "on_pace" | "behind";

/**
 * Where the clock stands against a checkpoint. Only the band boundary
 * matters: a verdict of "on pace" is an instruction to change nothing.
 */
export function paceVerdict(
  remainingSeconds: number,
  checkpoint: SectionCheckpoint,
  band: number = CHECKPOINT_BAND_SECONDS,
): PaceVerdict {
  const delta = remainingSeconds - checkpoint.remainingTarget;
  if (delta > band) return "ahead";
  if (delta < -band) return "behind";
  return "on_pace";
}

/** The last checkpoint at or before the question being entered, if any. */
export function checkpointFor(
  question: number,
  checkpoints: SectionCheckpoint[],
): SectionCheckpoint | null {
  let found: SectionCheckpoint | null = null;
  for (const cp of checkpoints) {
    if (cp.question <= question) found = cp;
  }
  return found;
}
