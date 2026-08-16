/**
 * Chapter-test coverage: the contract between the bank and the test layer.
 *
 * A chapter test draws CHAPTER_TEST_BLEND — two D2, three D3, two D4, one
 * D5 — from a single subtopic. For that test to be honest it has to be
 * takeable *twice* with no question repeating, or a retake is just a
 * memory check on the same eight stems. So the floor per subtopic is the
 * blend doubled: D2 ≥ 4, D3 ≥ 6, D4 ≥ 4, D5 ≥ 2.
 *
 * This module is pure — it takes counts, not a database — so the same
 * rules run against the committed bank in the authoring gate
 * (scripts/verify-coverage.ts) and against the installed rows at runtime.
 */

import { CHAPTER_TEST_BLEND } from "./chapter-test-config.ts";
import {
  ALL_SUBTOPICS,
  DIFFICULTIES,
  SUBTOPIC_LABELS,
  type Difficulty,
  type Subtopic,
} from "./taxonomy.ts";

/** How many distinct takes of a chapter test must be possible with no
 *  question repeating across them. */
export const COVERAGE_TAKES = 2;

/** Per-difficulty floor: the blend, multiplied by the take requirement. */
export const COVERAGE_FLOOR: Record<Difficulty, number> = Object.fromEntries(
  DIFFICULTIES.map((d) => [
    d,
    (CHAPTER_TEST_BLEND.find(([bd]) => bd === d)?.[1] ?? 0) * COVERAGE_TAKES,
  ]),
) as Record<Difficulty, number>;

export type DifficultyCounts = Partial<Record<Difficulty, number>>;

export type SubtopicCoverage = {
  subtopic: Subtopic;
  label: string;
  counts: Record<Difficulty, number>;
  total: number;
  /** Missing items per difficulty, only where short. */
  shortfall: Array<{ difficulty: Difficulty; have: number; need: number }>;
  /** Fills the blend at least once. */
  fillsOnce: boolean;
  /** Fills the blend COVERAGE_TAKES times with no repeats. */
  fillsFloor: boolean;
};

export function coverageFor(
  subtopic: Subtopic,
  counts: DifficultyCounts,
): SubtopicCoverage {
  const filled = Object.fromEntries(
    DIFFICULTIES.map((d) => [d, counts[d] ?? 0]),
  ) as Record<Difficulty, number>;
  const shortfall = DIFFICULTIES.flatMap((d) => {
    const need = COVERAGE_FLOOR[d];
    return filled[d] < need
      ? [{ difficulty: d, have: filled[d], need }]
      : [];
  });
  const fillsOnce = CHAPTER_TEST_BLEND.every(
    ([d, n]) => filled[d as Difficulty] >= n,
  );
  return {
    subtopic,
    label: SUBTOPIC_LABELS[subtopic],
    counts: filled,
    total: DIFFICULTIES.reduce((s, d) => s + filled[d], 0),
    shortfall,
    fillsOnce,
    fillsFloor: shortfall.length === 0,
  };
}

/** Coverage for all 24 subtopics, worst first. `countsBySubtopic` may omit
 *  subtopics entirely — a missing subtopic reads as zero everywhere, which
 *  is exactly the regression the gate exists to catch. */
export function coverageReport(
  countsBySubtopic: Partial<Record<Subtopic, DifficultyCounts>>,
): SubtopicCoverage[] {
  return ALL_SUBTOPICS.map((s) =>
    coverageFor(s, countsBySubtopic[s] ?? {}),
  ).sort(
    (a, b) =>
      b.shortfall.length - a.shortfall.length ||
      a.total - b.total ||
      a.subtopic.localeCompare(b.subtopic),
  );
}

/** One line per subtopic, aligned, for the CLI gate and the Learn page. */
export function coverageLine(c: SubtopicCoverage): string {
  const cells = DIFFICULTIES.map(
    (d) =>
      `D${d} ${String(c.counts[d]).padStart(2)}/${COVERAGE_FLOOR[d]}` +
      (c.counts[d] < COVERAGE_FLOOR[d] ? "!" : " "),
  ).join("  ");
  return `${c.subtopic.padEnd(32)} ${cells}  total ${String(c.total).padStart(3)}`;
}
