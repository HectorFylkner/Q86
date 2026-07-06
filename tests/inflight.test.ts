import { describe, expect, it } from "vitest";
import {
  SNAPSHOT_MAX_AGE_MS,
  isValidDrillSnapshot,
  isValidTimedSnapshot,
  type DrillSnapshot,
  type TimedSnapshot,
} from "../lib/inflight.ts";

function timedSnap(overrides: Partial<TimedSnapshot> = {}): TimedSnapshot {
  return {
    v: 1,
    sessionId: 7,
    kind: "full",
    mode: "section_sim",
    focus: "focused",
    showTimer: false,
    questionIds: [1, 2, 3],
    answers: [
      {
        selectedIndex: 0,
        confidence: "lean",
        timeSeconds: 80,
        timeViolation: false,
      },
      null,
      null,
    ],
    bookmarks: [false, true, false],
    editRecords: [],
    currentIndex: 1,
    stage: "running",
    endsAt: Date.now() + 30 * 60 * 1000,
    questionStartedAt: Date.now() - 20_000,
    savedAt: Date.now(),
    ...overrides,
  };
}

function drillSnap(overrides: Partial<DrillSnapshot> = {}): DrillSnapshot {
  return {
    v: 1,
    sessionId: 9,
    mode: "drill",
    timing: "soft",
    focus: "focused",
    test: null,
    questionIds: [4, 5, 6],
    results: [
      {
        questionId: 4,
        selectedIndex: 2,
        correct: true,
        timeSeconds: 95,
        confidence: "lock",
        attemptId: 12,
        saveFailed: false,
        errorType: null,
      },
    ],
    index: 1,
    phase: "answering",
    questionStartedAt: Date.now() - 5_000,
    savedAt: Date.now(),
    ...overrides,
  };
}

describe("isValidTimedSnapshot", () => {
  it("accepts a well-formed snapshot", () => {
    expect(isValidTimedSnapshot(timedSnap())).toBe(true);
  });

  it("accepts the review stage and an expired clock (resume finalizes it)", () => {
    expect(
      isValidTimedSnapshot(timedSnap({ stage: "review", endsAt: Date.now() - 1 })),
    ).toBe(true);
  });

  it("rejects null, junk, and wrong versions", () => {
    expect(isValidTimedSnapshot(null)).toBe(false);
    expect(isValidTimedSnapshot("{}")).toBe(false);
    expect(isValidTimedSnapshot({})).toBe(false);
    expect(isValidTimedSnapshot(timedSnap({ v: 2 as never }))).toBe(false);
  });

  it("rejects answers/questionIds length mismatch", () => {
    expect(isValidTimedSnapshot(timedSnap({ answers: [null] }))).toBe(false);
    expect(isValidTimedSnapshot(timedSnap({ questionIds: [] }))).toBe(false);
  });

  it("rejects stages that cannot be resumed", () => {
    expect(
      isValidTimedSnapshot(timedSnap({ stage: "summary" as never })),
    ).toBe(false);
  });

  it("rejects snapshots older than the resume window", () => {
    expect(
      isValidTimedSnapshot(
        timedSnap({ savedAt: Date.now() - SNAPSHOT_MAX_AGE_MS - 1 }),
      ),
    ).toBe(false);
  });
});

describe("isValidDrillSnapshot", () => {
  it("accepts a well-formed snapshot in both phases", () => {
    expect(isValidDrillSnapshot(drillSnap())).toBe(true);
    expect(
      isValidDrillSnapshot(drillSnap({ index: 0, phase: "revealed" })),
    ).toBe(true);
  });

  it("rejects an out-of-range index", () => {
    expect(isValidDrillSnapshot(drillSnap({ index: 3 }))).toBe(false);
    expect(isValidDrillSnapshot(drillSnap({ index: -1 }))).toBe(false);
  });

  it("rejects more results than questions", () => {
    const r = drillSnap().results[0];
    expect(
      isValidDrillSnapshot(drillSnap({ results: [r, r, r, r] })),
    ).toBe(false);
  });

  it("rejects the done phase and stale snapshots", () => {
    expect(isValidDrillSnapshot(drillSnap({ phase: "done" as never }))).toBe(
      false,
    );
    expect(
      isValidDrillSnapshot(
        drillSnap({ savedAt: Date.now() - SNAPSHOT_MAX_AGE_MS - 1 }),
      ),
    ).toBe(false);
  });
});
