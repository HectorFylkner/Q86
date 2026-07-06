import { describe, expect, it } from "vitest";
import {
  NEW_CARD,
  nextReview,
  previewIntervals,
  REVIEW_GRADES,
  type ReviewState,
} from "../lib/srs.ts";

const DAY_MS = 86_400_000;

const sampleStates: (ReviewState | null)[] = [
  null,
  NEW_CARD,
  { ease: 2.5, intervalDays: 1, reps: 1, lapses: 0 },
  { ease: 2.3, intervalDays: 3, reps: 2, lapses: 1 },
  { ease: 1.3, intervalDays: 10, reps: 5, lapses: 3 },
  { ease: 2.5, intervalDays: 120, reps: 9, lapses: 0 },
];

describe("NEW_CARD", () => {
  it("starts unseen with default ease", () => {
    expect(NEW_CARD).toEqual({ ease: 2.5, intervalDays: 0, reps: 0, lapses: 0 });
  });

  it("null state is treated as a new card", () => {
    for (const grade of REVIEW_GRADES) {
      expect(nextReview(null, grade)).toEqual(nextReview(NEW_CARD, grade));
    }
  });
});

describe("nextReview: forgot", () => {
  it("resets interval to 1d, resets reps, counts a lapse", () => {
    const s: ReviewState = { ease: 2.5, intervalDays: 30, reps: 6, lapses: 2 };
    const next = nextReview(s, "forgot");
    expect(next.intervalDays).toBe(1);
    expect(next.reps).toBe(0);
    expect(next.lapses).toBe(3);
  });

  it("drops ease by 0.2, floored at 1.3", () => {
    expect(nextReview({ ...NEW_CARD }, "forgot").ease).toBeCloseTo(2.3);
    // partial step near the floor still clamps, never undershoots
    expect(
      nextReview({ ease: 1.35, intervalDays: 4, reps: 2, lapses: 1 }, "forgot").ease,
    ).toBe(1.3);
    let s: ReviewState = NEW_CARD;
    for (let i = 0; i < 20; i++) s = nextReview(s, "forgot");
    expect(s.ease).toBe(1.3);
    expect(s.lapses).toBe(20);
  });

  it("relearns through the 1d → 3d ladder after a lapse", () => {
    const lapsed = nextReview(
      { ease: 2.5, intervalDays: 30, reps: 6, lapses: 0 },
      "forgot",
    );
    const first = nextReview(lapsed, "good");
    const second = nextReview(first, "good");
    expect(first.intervalDays).toBe(1);
    expect(second.intervalDays).toBe(3);
  });
});

describe("nextReview: hard", () => {
  it("counts a rep, keeps lapses, drops ease by 0.05 floored at 1.3", () => {
    const s: ReviewState = { ease: 2.5, intervalDays: 10, reps: 3, lapses: 1 };
    const next = nextReview(s, "hard");
    expect(next.reps).toBe(4);
    expect(next.lapses).toBe(1);
    expect(next.ease).toBeCloseTo(2.45);
    expect(
      nextReview({ ease: 1.31, intervalDays: 5, reps: 4, lapses: 2 }, "hard").ease,
    ).toBe(1.3);
  });

  it("grows ~20% at mature intervals and never below 1d", () => {
    expect(nextReview(NEW_CARD, "hard").intervalDays).toBe(1);
    expect(
      nextReview({ ease: 2.5, intervalDays: 10, reps: 3, lapses: 0 }, "hard")
        .intervalDays,
    ).toBe(12);
  });

  it("never shrinks the interval", () => {
    for (let i = 0; i <= 60; i++) {
      const next = nextReview({ ease: 2.0, intervalDays: i, reps: 2, lapses: 0 }, "hard");
      expect(next.intervalDays).toBeGreaterThanOrEqual(Math.max(1, i));
    }
  });

  // Fixed defect: round(1 * 1.2) = 1 and round(2 * 1.2) = 2 used to stall
  // a repeatedly-hard card forever; hard now grows by at least one day.
  it("grows the interval from 1d and 2d", () => {
    expect(
      nextReview({ ease: 2.5, intervalDays: 1, reps: 2, lapses: 0 }, "hard")
        .intervalDays,
    ).toBeGreaterThan(1);
    expect(
      nextReview({ ease: 2.5, intervalDays: 2, reps: 2, lapses: 0 }, "hard")
        .intervalDays,
    ).toBeGreaterThan(2);
  });

  it("grows slower than good on a mature card", () => {
    const s: ReviewState = { ease: 2.2, intervalDays: 20, reps: 4, lapses: 0 };
    expect(nextReview(s, "hard").intervalDays).toBeLessThan(
      nextReview(s, "good").intervalDays,
    );
  });
});

describe("nextReview: good", () => {
  it("follows the 1d → 3d → interval×ease ladder", () => {
    const first = nextReview(NEW_CARD, "good");
    const second = nextReview(first, "good");
    const third = nextReview(second, "good");
    expect(first.intervalDays).toBe(1);
    expect(second.intervalDays).toBe(3);
    expect(third.intervalDays).toBe(Math.round(3 * 2.5));
    expect([first.reps, second.reps, third.reps]).toEqual([1, 2, 3]);
  });

  it("leaves ease and lapses untouched", () => {
    const s: ReviewState = { ease: 1.7, intervalDays: 8, reps: 3, lapses: 2 };
    const next = nextReview(s, "good");
    expect(next.ease).toBe(1.7);
    expect(next.lapses).toBe(2);
  });

  it("still grows at the 1.3 ease floor", () => {
    const s: ReviewState = { ease: 1.3, intervalDays: 10, reps: 5, lapses: 4 };
    expect(nextReview(s, "good").intervalDays).toBe(13);
  });
});

describe("nextReview: invariants", () => {
  it("does not mutate the input state", () => {
    const s: ReviewState = { ease: 2.1, intervalDays: 7, reps: 3, lapses: 1 };
    const copy = { ...s };
    for (const grade of REVIEW_GRADES) nextReview(s, grade);
    expect(s).toEqual(copy);
  });

  it("always yields ease >= 1.3 and interval >= 1", () => {
    for (const state of sampleStates) {
      for (const grade of REVIEW_GRADES) {
        const next = nextReview(state, grade);
        expect(next.ease).toBeGreaterThanOrEqual(1.3);
        expect(next.intervalDays).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(next.intervalDays)).toBe(true);
      }
    }
  });
});

describe("previewIntervals", () => {
  it("matches nextReview for every grade and state", () => {
    for (const state of sampleStates) {
      const preview = previewIntervals(state);
      expect(Object.keys(preview).sort()).toEqual([...REVIEW_GRADES].sort());
      for (const grade of REVIEW_GRADES) {
        expect(preview[grade]).toBe(nextReview(state, grade).intervalDays);
      }
    }
  });
});

describe("dueAt arithmetic", () => {
  // mirrors lib/actions.ts: dueAt = now + intervalDays * 86_400_000
  it("schedules a first good review exactly one day out", () => {
    const now = Date.UTC(2026, 6, 6, 12, 0, 0);
    const next = nextReview(null, "good");
    const dueAt = new Date(now + next.intervalDays * DAY_MS);
    expect(dueAt.toISOString()).toBe("2026-07-07T12:00:00.000Z");
  });

  it("scales linearly with intervalDays", () => {
    const now = Date.UTC(2026, 0, 1);
    const s: ReviewState = { ease: 2.5, intervalDays: 3, reps: 2, lapses: 0 };
    for (const grade of REVIEW_GRADES) {
      const next = nextReview(s, grade);
      const dueAt = new Date(now + next.intervalDays * DAY_MS);
      expect((dueAt.getTime() - now) / DAY_MS).toBe(next.intervalDays);
    }
  });
});
