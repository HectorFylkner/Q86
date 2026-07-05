/**
 * Mastery-ladder rules, database-free (the ladder assembly lives in
 * lib/mastery.ts). A rung is mastered by sustained accuracy — at least
 * MIN_ATTEMPTS focused attempts in that cell with ≥ MASTERY_BAR accuracy
 * over the most recent MASTERY_WINDOW.
 */
export const MASTERY_BAR = 0.85;
export const MIN_ATTEMPTS = 6;
export const MASTERY_WINDOW = 10;

export type RungState = "mastered" | "working" | "untouched" | "empty";

export function rungState(
  recentCorrect: boolean[],
  available: number,
): RungState {
  if (available === 0) return "empty";
  const total = recentCorrect.length;
  if (total === 0) return "untouched";
  const correct = recentCorrect.filter(Boolean).length;
  if (total >= MIN_ATTEMPTS && correct / total >= MASTERY_BAR) {
    return "mastered";
  }
  return "working";
}
