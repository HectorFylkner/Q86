import type { Confidence } from "./taxonomy.ts";

/**
 * Mastery-ladder rules, database-free (the ladder assembly lives in
 * lib/mastery.ts). A rung is mastered by sustained accuracy — at least
 * MIN_ATTEMPTS focused attempts in that cell with ≥ MASTERY_BAR accuracy
 * over the most recent MASTERY_WINDOW. A guessed correct is luck, not
 * mastery: it stays in the window total but never in the correct count.
 */
export const MASTERY_BAR = 0.85;
export const MIN_ATTEMPTS = 6;
export const MASTERY_WINDOW = 10;

export type RungState = "mastered" | "working" | "untouched" | "empty";

export type CellAttempt = { correct: boolean; confidence?: Confidence };

/** Correct on your own steam — not a guess that happened to land. */
export function solidCorrect(a: CellAttempt): boolean {
  return a.correct && a.confidence !== "guess";
}

export function rungState(
  recent: CellAttempt[],
  available: number,
): RungState {
  if (available === 0) return "empty";
  const total = recent.length;
  if (total === 0) return "untouched";
  const correct = recent.filter(solidCorrect).length;
  if (total >= MIN_ATTEMPTS && correct / total >= MASTERY_BAR) {
    return "mastered";
  }
  return "working";
}
