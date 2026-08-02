import type { ErrorType } from "./taxonomy.ts";

/**
 * The bridge from a miss back to the chapter.
 *
 * Every strong prep product has one. Khan Academy's official SAT course
 * is built around it: from a question you got wrong you jump straight to
 * the lesson covering the skill you need. Q86 had the chapters and the
 * misses and nothing joining them — the only link from a result to a
 * chapter was on the chapter test, which is the one place you were
 * already in the chapter.
 *
 * This version is sharper than "here is the chapter", because Q86 knows
 * something Khan's does not: *why* the question was missed. The six error
 * types map onto different sections of the chapter, and sending a
 * calculation error to the trap gallery would waste the trip. A misread
 * needs the trigger cues; a content gap needs the core ideas; a
 * time-pressure miss needs the speed moves, not more theory.
 *
 * The section ids match the anchors rendered by app/learn/[subtopic].
 */
export type MissBridge = {
  /** Anchor within the chapter page. */
  anchor: string;
  /** What the reader is being sent to, in the chapter's own words. */
  section: string;
  /** Why this section, for this error. One line, shown on the link. */
  because: string;
};

const BRIDGE: Record<ErrorType, MissBridge> = {
  content_gap: {
    anchor: "ideas",
    section: "The core ideas",
    because: "the rule itself is what was missing",
  },
  setup_error: {
    anchor: "cues",
    section: "Trigger cues",
    because: "the stem was read correctly and pointed at the wrong method",
  },
  calculation_error: {
    anchor: "speed",
    section: "Speed moves",
    because: "the method was right and the arithmetic was where it broke",
  },
  misread: {
    anchor: "traps",
    section: "Trap gallery",
    because: "this is the shape a misread is usually built to cause",
  },
  time_pressure: {
    anchor: "speed",
    section: "Speed moves",
    because: "the shortcut that would have bought the time is here",
  },
  guess: {
    anchor: "ideas",
    section: "The core ideas",
    because: "a guess means the chapter has not landed yet",
  },
};

/** Where an unclassified miss goes: the cues, because the first thing to
 *  re-learn is what the question was asking for. */
const UNCLASSIFIED: MissBridge = {
  anchor: "cues",
  section: "Trigger cues",
  because: "start by re-reading what this question shape asks for",
};

export function missBridge(errorType: ErrorType | null | undefined): MissBridge {
  return errorType ? (BRIDGE[errorType] ?? UNCLASSIFIED) : UNCLASSIFIED;
}

/** The full href for a chapter, anchored at the right section. */
export function missBridgeHref(
  subtopic: string,
  errorType: ErrorType | null | undefined,
): string {
  return `/learn/${subtopic}#${missBridge(errorType).anchor}`;
}
