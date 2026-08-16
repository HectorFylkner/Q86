/**
 * The strategy playbook: short prose notes that sit beside the concept
 * chapters and cover the things a subtopic chapter cannot — how to read
 * your own misses, how to spend the clock, how to read a stem, when a
 * guess is the right move.
 *
 * These are the destinations the miss-to-prescription loop routes to
 * (lib/prescriptions.ts). This module stays free of node builtins so it
 * can be imported from client components; the markdown itself is read in
 * lib/strategy-content.ts.
 */

export const STRATEGY_NOTES = [
  "reading-your-misses",
  "pacing-and-the-clock",
  "reading-the-stem",
  "guessing-and-bailing",
] as const;

export type StrategyNoteId = (typeof STRATEGY_NOTES)[number];

export const STRATEGY_NOTE_TITLES: Record<StrategyNoteId, string> = {
  "reading-your-misses": "Reading your misses",
  "pacing-and-the-clock": "Pacing and the clock",
  "reading-the-stem": "Reading the stem",
  "guessing-and-bailing": "Guessing and bailing",
};

/** The "##" section headings of a note, for its on-page rail. Anchors come
 *  from headingAnchor() in components/math.tsx, which is what the renderer
 *  actually stamps onto the elements. */
export function noteSections(body: string): string[] {
  return body.split("\n").flatMap((line) => {
    const m = line.match(/^##\s+(.*?)\s*$/);
    return m && !line.startsWith("###") ? [m[1]] : [];
  });
}
