/**
 * Mastery thresholds, in their own module with no imports.
 *
 * `lib/mastery.ts` opens a database connection, so anything a client
 * component needs from it has to live somewhere the bundler can reach
 * without dragging `node:fs` into the browser build.
 */

/** Accuracy a difficulty rung must sustain to count as mastered. */
export const MASTERY_BAR = 0.85;

/** Attempts required in a rung before its accuracy means anything. */
export const MIN_ATTEMPTS = 6;

/** How many recent attempts per rung the ladder looks at. */
export const MASTERY_WINDOW = 10;

import type { FundamentalSkill, Subtopic } from "./taxonomy.ts";

/** The 24-subtopic × 4-difficulty grid, shaped here rather than in
 *  lib/mastery.ts so the client chart can import the type without
 *  dragging the database in with it. */
export type MasteryCell = {
  difficulty: number;
  correct: number;
  total: number;
  /** Verified bank items at this cell, so an empty cell distinguishes
   *  "never attempted" from "nothing to attempt". */
  available: number;
};

export type MasteryGridRow = {
  subtopic: Subtopic;
  skill: FundamentalSkill;
  label: string;
  cells: MasteryCell[];
  total: number;
  correct: number;
};

export const MASTERY_BANDS = [2, 3, 4, 5];
