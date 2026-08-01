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
