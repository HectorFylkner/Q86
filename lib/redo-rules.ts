/**
 * The redo ladder's transition rules, database-free (the queue I/O lives
 * in lib/redo.ts). Stage 0|1|2 → due +2d / +7d / +21d after the
 * scheduling event.
 */
export const STAGE_DELAY_DAYS = [2, 7, 21] as const;

/** Day-21 cold-solve gate: correct, unaided, within 2:30. */
export const COLD_SOLVE_LIMIT_SECONDS = 150;

export type RedoStage = 0 | 1 | 2;

/** What an attempt proves: a guessed correct is luck, not evidence. */
export type RedoOutcome = "wrong" | "lucky" | "solid";

export function redoOutcome(
  correct: boolean,
  confidence: string | null | undefined,
): RedoOutcome {
  if (!correct) return "wrong";
  return confidence === "guess" ? "lucky" : "solid";
}

export type RedoTransition =
  | { cleared: true }
  | { cleared: false; stage: RedoStage; delayDays: number };

/**
 * Solid: stage 0 → 1 (+7d), stage 1 → 2 (+21d); stage 2 clears only via
 * the cold-solve gate (≤ 2:30), otherwise it re-enters at stage 1 (+7d).
 * Wrong at any stage: back to stage 0 (+2d).
 * Lucky (guessed correct): no progress, no regress — same stage, checked
 * again in +2d.
 */
export function nextRedoState(
  stage: RedoStage,
  outcome: RedoOutcome,
  timeSeconds: number,
): RedoTransition {
  if (outcome === "wrong") {
    return { cleared: false, stage: 0, delayDays: STAGE_DELAY_DAYS[0] };
  }
  if (outcome === "lucky") {
    return { cleared: false, stage, delayDays: STAGE_DELAY_DAYS[0] };
  }
  if (stage === 0) {
    return { cleared: false, stage: 1, delayDays: STAGE_DELAY_DAYS[1] };
  }
  if (stage === 1) {
    return { cleared: false, stage: 2, delayDays: STAGE_DELAY_DAYS[2] };
  }
  if (timeSeconds <= COLD_SOLVE_LIMIT_SECONDS) {
    return { cleared: true };
  }
  return { cleared: false, stage: 1, delayDays: STAGE_DELAY_DAYS[1] };
}
