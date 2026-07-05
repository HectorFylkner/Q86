import { TIME_BENCH } from "./pacing.ts";
import type { Confidence, Difficulty } from "./taxonomy.ts";

/**
 * The timed-transfer ramp: per subtopic × difficulty cell, the clock
 * tightens only after accuracy is proven at the looser regime. "90%
 * accuracy untimed, collapse under the clock" is the classic
 * practice-to-test gap; the fix is to earn time pressure, never to
 * train under it before the cell is accurate.
 *
 *   build → no clock shown; get the cell accurate first.
 *   soft  → accuracy proven; train under a soft cap (bench × 1.4).
 *   exam  → accuracy holds inside the soft cap; train at exam pace.
 *
 * Stages derive from the rolling window alone, so a collapse in a cell
 * automatically loosens its clock again. Advisory throughout: the ramp
 * changes what the timer says, never what you may attempt.
 */
export type RampStage = "build" | "soft" | "exam";

export type RampAttempt = {
  correct: boolean;
  timeSeconds: number;
  confidence?: Confidence;
};

/** Guessed corrects are luck, not pace evidence. */
function solid(a: RampAttempt): boolean {
  return a.correct && a.confidence !== "guess";
}

/** Rolling window per cell; matches the mastery window. */
export const RAMP_WINDOW = 10;
/** Below this sample size the cell stays in build. */
export const RAMP_MIN_ATTEMPTS = 4;
/** Window accuracy (and paced-accuracy) needed to advance a regime. */
export const RAMP_PROVE_BAR = 0.8;
/** Soft cap = exam benchmark × this, rounded to 5s. */
export const SOFT_CAP_RATIO = 1.4;

export const RAMP_STAGE_LABELS: Record<RampStage, string> = {
  build: "no clock yet",
  soft: "soft cap",
  exam: "exam pace",
};

export function softCapSeconds(difficulty: Difficulty): number {
  return Math.round((TIME_BENCH[difficulty] * SOFT_CAP_RATIO) / 5) * 5;
}

/** Stage for one cell from its most recent attempts (newest first). */
export function rampStage(
  recent: RampAttempt[],
  difficulty: Difficulty,
): RampStage {
  const window = recent.slice(0, RAMP_WINDOW);
  if (window.length < RAMP_MIN_ATTEMPTS) return "build";
  const accuracy = window.filter(solid).length / window.length;
  if (accuracy < RAMP_PROVE_BAR) return "build";
  const cap = softCapSeconds(difficulty);
  const pacedRate =
    window.filter((a) => solid(a) && a.timeSeconds <= cap).length /
    window.length;
  return pacedRate < RAMP_PROVE_BAR ? "soft" : "exam";
}

export type RampBudget = {
  stage: RampStage;
  /** Target to show on the drill clock; null in build (no clock yet). */
  budgetSeconds: number | null;
  benchSeconds: number;
};

export function budgetFor(
  recent: RampAttempt[],
  difficulty: Difficulty,
): RampBudget {
  const stage = rampStage(recent, difficulty);
  return {
    stage,
    budgetSeconds:
      stage === "build"
        ? null
        : stage === "soft"
          ? softCapSeconds(difficulty)
          : TIME_BENCH[difficulty],
    benchSeconds: TIME_BENCH[difficulty],
  };
}

export function clampDifficulty(d: number): Difficulty {
  return (d >= 1 && d <= 5 ? d : 3) as Difficulty;
}
