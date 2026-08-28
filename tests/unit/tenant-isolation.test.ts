import "../helpers/test-env.ts";
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scopedFor } from "@/lib/db/scoped";
import {
  attempts,
  deckReviews,
  edits,
  eloRatings,
  patternAttempts,
  questionFlags,
  redoQueue,
  sessions,
  settings,
} from "@/lib/db/schema";
import * as actions from "@/lib/actions";
import { gatherAnalytics } from "@/lib/analytics";
import { todaysDeck } from "@/lib/deck";
import { computeLadders } from "@/lib/mastery";
import { gatherPlanInputs, daysToTest } from "@/lib/plan-server";
import { chapterTestStates } from "@/lib/chapter-tests";
import { getSetting } from "@/lib/settings";
import {
  asUser,
  makePaidAccount,
  migrateTestDb,
  seedQuestions,
  type TestAccount,
} from "../helpers/db";

/**
 * The done-condition for M1: a request authenticated as user B must not be
 * able to read or mutate any row belonging to user A, through any server
 * action.
 *
 * User A is given a populated history first — sessions, attempts, an edit
 * ledger, a redo queue, pattern ratings, a deck card, settings and a flag.
 * Then every read runs as B and must come back empty, and every write runs
 * as B naming A's row ids and must leave A's rows untouched.
 */
describe("tenant isolation", () => {
  let alice: TestAccount;
  let bob: TestAccount;
  let qids: number[];
  let aliceSessionId: number;
  let aliceAttemptId: number;

  beforeAll(async () => {
    await migrateTestDb();
    qids = await seedQuestions();
    // Both on a paid plan: this file is about isolation, not the paywall,
    // so both accounts must be able to reach every feature.
    alice = await makePaidAccount("alice@example.com");
    bob = await makePaidAccount("bob@example.com");

    // --- Alice builds a history through the real server actions ---------
    asUser(alice);
    const drill = await actions.startDrill({
      filter: {},
      count: 3,
      timing: "untimed",
    });
    expect(drill.error).toBeNull();
    aliceSessionId = drill.sessionId as number;

    const first = drill.questions[0];
    const logged = await actions.logAttempt({
      sessionId: aliceSessionId,
      questionId: first.id,
      mode: "drill",
      // Deliberately wrong, so a redo-queue row and a deck card both exist.
      selectedIndex: (first.correctIndex + 1) % 5,
      timeSeconds: 91.5,
      confidence: "lean",
    });
    aliceAttemptId = logged.attemptId;
    expect(logged.correct).toBe(false);

    await actions.tagAttempt(aliceAttemptId, {
      errorType: "content_gap",
      userNotes: "alice-private-note",
    });
    await actions.saveSetting("test_date", "2026-12-01");
    // Graded by explicit id, not by whatever the drill happened to pick,
    // so the per-account comparison below is deterministic.
    await actions.gradeDeckCard(qids[0], "forgot");
    await actions.flagQuestion({
      questionId: first.id,
      reason: "ambiguous",
      note: "alice-private-flag",
    });
    await actions.savePatternRound({
      category: "units_digit_cycles",
      items: [
        {
          category: "units_digit_cycles",
          promptText: "7^23",
          correctAnswer: "3",
          userAnswer: "3",
          ms: 3000,
          correct: true,
          difficultyRating: 1200,
        },
      ],
    });
    await actions.finishSession(aliceSessionId, { correct: 0, total: 1 });

    // A timed section, for the edit ledger.
    const timed = await actions.startTimedSet({ kind: "mini", showTimer: true });
    expect(timed.error).toBeNull();
    const timedQuestion = timed.questions[0];
    await actions.saveTimedSession({
      sessionId: timed.sessionId as number,
      mode: "timed_set",
      results: timed.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex,
        timeSeconds: 60,
        confidence: "lock" as const,
        bookmarked: false,
        timeViolation: false,
      })),
      edits: [
        {
          questionId: timedQuestion.id,
          fromIndex: (timedQuestion.correctIndex + 2) % 5,
          toIndex: timedQuestion.correctIndex,
          reason: "misread",
          justification: "alice-private-justification for the record here",
        },
      ],
      durationSeconds: 420,
      notReachedCount: 0,
    });
  });

  it("gave Alice rows in every user-owned table", async () => {
    const a = scopedFor(alice.id);
    expect((await a.rows(sessions)).length).toBeGreaterThan(0);
    expect((await a.rows(attempts)).length).toBeGreaterThan(0);
    expect((await a.rows(edits)).length).toBeGreaterThan(0);
    expect((await a.rows(redoQueue)).length).toBeGreaterThan(0);
    expect((await a.rows(patternAttempts)).length).toBeGreaterThan(0);
    expect((await a.rows(eloRatings)).length).toBeGreaterThan(0);
    expect((await a.rows(settings)).length).toBeGreaterThan(0);
    expect((await a.rows(deckReviews)).length).toBeGreaterThan(0);
    expect((await a.rows(questionFlags)).length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------
  // Reads
  // -------------------------------------------------------------------

  it("shows Bob none of Alice's rows through the scoped accessor", async () => {
    const b = scopedFor(bob.id);
    for (const table of [
      sessions,
      attempts,
      edits,
      redoQueue,
      patternAttempts,
      eloRatings,
      settings,
      deckReviews,
      questionFlags,
    ]) {
      expect(await b.rows(table)).toEqual([]);
    }
  });

  it("shows Bob an empty analytics page", async () => {
    const data = await gatherAnalytics(scopedFor(bob.id));
    expect(data.attemptCount).toBe(0);
    expect(data.casualExcluded).toBe(0);
    expect(data.editLedger.total).toBe(0);
    expect(data.redoCompliance.open).toBe(0);
    expect(data.eloBars.every((bar) => bar.rating === 1200)).toBe(true);
  });

  it("shows Bob an empty deck, ladder, plan and chapter state", async () => {
    const b = scopedFor(bob.id);
    const deck = await todaysDeck(b);
    expect(deck.cards).toEqual([]);
    expect(deck.due + deck.fresh + deck.scheduled).toBe(0);

    const ladders = await computeLadders(b);
    expect(ladders.every((l) => l.rungs.every((r) => r.total === 0))).toBe(true);

    const inputs = await gatherPlanInputs(b);
    expect(
      Object.values(inputs.skillAccuracy).reduce((s, r) => s + r.total, 0),
    ).toBe(0);
    expect(inputs.dueRedoCount).toBe(0);
    expect(await daysToTest(b)).toBeNull();
    expect(await chapterTestStates(b)).toEqual({});
    expect(await getSetting(b, "test_date")).toBeNull();
  });

  it("hides Alice's attempt history for a question Bob has not attempted", async () => {
    asUser(bob);
    expect(await actions.getQuestionHistory(qids[0])).toEqual([]);
    asUser(alice);
    expect((await actions.getQuestionHistory(qids[0])).length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------
  // Writes
  // -------------------------------------------------------------------

  it("refuses to let Bob tag Alice's attempt", async () => {
    asUser(bob);
    await actions.tagAttempt(aliceAttemptId, {
      errorType: "calculation_error",
      userNotes: "bob-was-here",
    });

    const row = await db
      .select()
      .from(attempts)
      .where(eq(attempts.id, aliceAttemptId))
      .get();
    expect(row?.userNotes).toBe("alice-private-note");
    expect(row?.errorType).toBe("content_gap");
    expect(row?.userId).toBe(alice.id);
  });

  it("refuses to let Bob close Alice's session", async () => {
    asUser(bob);
    await actions.finishSession(aliceSessionId, { correct: 999, total: 999 });

    const row = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, aliceSessionId))
      .get();
    expect((row?.summary as { correct?: number })?.correct).toBe(0);
  });

  it("refuses to let Bob append attempts to Alice's session", async () => {
    asUser(bob);
    const before = await scopedFor(alice.id).rows(
      attempts,
      eq(attempts.sessionId, aliceSessionId),
    );

    await expect(
      actions.saveTimedSession({
        sessionId: aliceSessionId,
        mode: "timed_set",
        results: [
          {
            questionId: qids[0],
            selectedIndex: 0,
            timeSeconds: 30,
            confidence: "guess",
            bookmarked: false,
            timeViolation: false,
          },
        ],
        edits: [],
        durationSeconds: 30,
        notReachedCount: 0,
      }),
    ).rejects.toThrow(/not found/i);

    const after = await scopedFor(alice.id).rows(
      attempts,
      eq(attempts.sessionId, aliceSessionId),
    );
    expect(after.length).toBe(before.length);
  });

  it("attaches Bob's own attempt to no session when he forges Alice's id", async () => {
    asUser(bob);
    const { attemptId } = await actions.logAttempt({
      sessionId: aliceSessionId,
      questionId: qids[1],
      mode: "drill",
      selectedIndex: 0,
      timeSeconds: 40,
      confidence: "guess",
    });
    const row = await db
      .select()
      .from(attempts)
      .where(eq(attempts.id, attemptId))
      .get();
    expect(row?.userId).toBe(bob.id);
    // The forged session id is dropped rather than honoured.
    expect(row?.sessionId).toBeNull();
  });

  it("keeps deck grading, settings and ELO per account", async () => {
    asUser(bob);
    await actions.gradeDeckCard(qids[0], "good");
    await actions.saveSetting("test_date", "2027-01-01");
    await actions.savePatternRound({
      category: "units_digit_cycles",
      items: [
        {
          category: "units_digit_cycles",
          promptText: "3^17",
          correctAnswer: "3",
          userAnswer: "9",
          ms: 5000,
          correct: false,
          difficultyRating: 1200,
        },
      ],
    });

    const a = scopedFor(alice.id);
    const b = scopedFor(bob.id);

    // Same question, two accounts, two independent schedules: Alice
    // forgot it (reps reset, one lapse), Bob got it (one rep, no lapse).
    const aliceCard = await a.row(
      deckReviews,
      eq(deckReviews.questionId, qids[0]),
    );
    const bobCard = await b.row(
      deckReviews,
      eq(deckReviews.questionId, qids[0]),
    );
    expect({ reps: aliceCard?.reps, lapses: aliceCard?.lapses }).toEqual({
      reps: 0,
      lapses: 1,
    });
    expect({ reps: bobCard?.reps, lapses: bobCard?.lapses }).toEqual({
      reps: 1,
      lapses: 0,
    });
    expect(aliceCard?.ease).toBeLessThan(2.5);
    expect(bobCard?.ease).toBe(2.5);

    expect(await getSetting(a, "test_date")).toBe("2026-12-01");
    expect(await getSetting(b, "test_date")).toBe("2027-01-01");

    const aliceElo = await a.row(
      eloRatings,
      eq(eloRatings.category, "units_digit_cycles"),
    );
    const bobElo = await b.row(
      eloRatings,
      eq(eloRatings.category, "units_digit_cycles"),
    );
    expect(aliceElo?.rating).toBeGreaterThan(1200);
    expect(bobElo?.rating).toBeLessThan(1200);
  });

  it("refuses flag resolution to a non-admin", async () => {
    const flag = await scopedFor(alice.id).rows(questionFlags);
    asUser(bob);
    await expect(actions.resolveFlag(flag[0].id, true)).rejects.toThrow();
    const still = await db
      .select()
      .from(questionFlags)
      .where(eq(questionFlags.id, flag[0].id))
      .get();
    expect(still?.status).toBe("open");
  });

  it("refuses every action to an unauthenticated caller", async () => {
    const { signOut } = await import("../helpers/db");
    signOut();
    await expect(
      actions.startDrill({ filter: {}, count: 1, timing: "untimed" }),
    ).rejects.toThrow(/not authenticated/i);
    await expect(actions.getQuestionHistory(qids[0])).rejects.toThrow(
      /not authenticated/i,
    );
    await expect(actions.saveSetting("test_date", "2030-01-01")).rejects.toThrow(
      /not authenticated/i,
    );
  });

  it("cannot build a scoped accessor without an owner", () => {
    expect(() => scopedFor("")).toThrow(/non-empty userId/);
  });
});
