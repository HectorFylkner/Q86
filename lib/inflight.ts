/**
 * In-flight session snapshots: every answer checkpoints the run into
 * localStorage so a refresh, crash, or navigation never loses work.
 * The Today page reads these to offer "pick up the pen"; the runners
 * clear them the moment a session is saved or torn up.
 *
 * The section clock is wall-time (endsAt), so a resumed sim keeps the
 * time that passed while away — exam-faithful by construction.
 */

import type { TimedEditInput } from "./actions.ts";
import type { Confidence, ErrorType, SessionFocus } from "./taxonomy.ts";

export const TIMED_SNAPSHOT_KEY = "q86:inflight:timed";
export const DRILL_SNAPSHOT_KEY = "q86:inflight:drill";

/** Snapshots older than this are stale enough to sweep, not resume. */
export const SNAPSHOT_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export type TimedSnapshot = {
  v: 1;
  sessionId: number;
  kind: "full" | "mini";
  mode: "timed_set" | "section_sim";
  focus: SessionFocus;
  showTimer: boolean;
  questionIds: number[];
  answers: ({
    selectedIndex: number;
    confidence: Confidence;
    timeSeconds: number;
    timeViolation: boolean;
  } | null)[];
  bookmarks: boolean[];
  editRecords: TimedEditInput[];
  currentIndex: number;
  stage: "running" | "review";
  endsAt: number;
  questionStartedAt: number;
  savedAt: number;
};

export type DrillSnapshot = {
  v: 1;
  sessionId: number;
  mode: "drill" | "redo";
  timing: "untimed" | "soft";
  focus: SessionFocus;
  test: string | null;
  questionIds: number[];
  results: {
    questionId: number;
    selectedIndex: number;
    correct: boolean;
    timeSeconds: number;
    confidence: Confidence;
    attemptId: number | null;
    saveFailed: boolean;
    errorType: ErrorType | null;
  }[];
  index: number;
  phase: "answering" | "revealed";
  questionStartedAt: number;
  savedAt: number;
};

export function isValidTimedSnapshot(x: unknown): x is TimedSnapshot {
  const s = x as TimedSnapshot | null;
  return (
    s != null &&
    s.v === 1 &&
    typeof s.sessionId === "number" &&
    Array.isArray(s.questionIds) &&
    s.questionIds.length > 0 &&
    Array.isArray(s.answers) &&
    s.answers.length === s.questionIds.length &&
    Array.isArray(s.bookmarks) &&
    Array.isArray(s.editRecords) &&
    typeof s.currentIndex === "number" &&
    (s.stage === "running" || s.stage === "review") &&
    typeof s.endsAt === "number" &&
    typeof s.savedAt === "number" &&
    Date.now() - s.savedAt < SNAPSHOT_MAX_AGE_MS
  );
}

export function isValidDrillSnapshot(x: unknown): x is DrillSnapshot {
  const s = x as DrillSnapshot | null;
  return (
    s != null &&
    s.v === 1 &&
    typeof s.sessionId === "number" &&
    Array.isArray(s.questionIds) &&
    s.questionIds.length > 0 &&
    Array.isArray(s.results) &&
    s.results.length <= s.questionIds.length &&
    typeof s.index === "number" &&
    s.index >= 0 &&
    s.index < s.questionIds.length &&
    (s.phase === "answering" || s.phase === "revealed") &&
    typeof s.savedAt === "number" &&
    Date.now() - s.savedAt < SNAPSHOT_MAX_AGE_MS
  );
}

function read<T>(key: string, validate: (x: unknown) => x is T): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or privacy mode — persistence is best-effort by design.
  }
}

function clear(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const readTimedSnapshot = () =>
  read(TIMED_SNAPSHOT_KEY, isValidTimedSnapshot);
export const writeTimedSnapshot = (s: TimedSnapshot) =>
  write(TIMED_SNAPSHOT_KEY, s);
export const clearTimedSnapshot = () => clear(TIMED_SNAPSHOT_KEY);

export const readDrillSnapshot = () =>
  read(DRILL_SNAPSHOT_KEY, isValidDrillSnapshot);
export const writeDrillSnapshot = (s: DrillSnapshot) =>
  write(DRILL_SNAPSHOT_KEY, s);
export const clearDrillSnapshot = () => clear(DRILL_SNAPSHOT_KEY);
