"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireAdmin, requireScoped } from "./auth/session.ts";
import {
  DailyLimitError,
  dailyAllowance,
  gateAction,
} from "./billing/entitlements.ts";
import { db } from "./db/index.ts";
import type { ScopedDb } from "./db/scoped.ts";
import {
  attempts,
  baselineReports,
  deckReviews,
  edits,
  eloRatings,
  patternAttempts,
  questionFlags,
  questions,
  sessions,
  type Question,
} from "./db/schema.ts";
import { putAppSetting } from "./db/app-settings.ts";
import { userRetiredIds } from "./db/seed-bank.ts";
import { selectChapterTest } from "./chapter-tests.ts";
import { nextReview, type ReviewGrade } from "./srs.ts";
import { ELO_START, nextRating } from "./elo.ts";
import {
  bestRoundScore,
  computeCategoryStreak,
  computeDayStreak,
} from "./pattern-stats.ts";
import { putSetting } from "./settings.ts";
import type { ParsedReport } from "./ai/schemas.ts";
import {
  selectQuestions,
  selectTimedSet,
  type QuestionFilter,
} from "./engine.ts";
import { applyRedoResult, enqueueMiss } from "./redo.ts";
import type {
  Confidence,
  EditReason,
  ErrorType,
  FlagReason,
  FundamentalSkill,
  SessionFocus,
  SessionMode,
  Subtopic,
} from "./taxonomy.ts";

export type DrillTiming = "untimed" | "soft";

export type StartDrillResult = {
  error: string | null;
  sessionId: number | null;
  questions: Question[];
};

export async function startDrill(config: {
  filter: QuestionFilter;
  count: number;
  timing: DrillTiming;
  focus?: SessionFocus;
}): Promise<StartDrillResult> {
  const { sdb, entitlements } = await gateAction("drill");
  const allowance = await dailyAllowance(sdb, entitlements);
  if (allowance.remaining === 0) {
    return {
      error: `Dagens gräns på ${allowance.limit} frågor är nådd. Uppgradera för obegränsad träning, eller kom tillbaka i morgon.`,
      sessionId: null,
      questions: [],
    };
  }
  // A free account gets what is left of today rather than an error.
  const wanted =
    allowance.remaining == null
      ? config.count
      : Math.min(config.count, allowance.remaining);
  const picked = await selectQuestions(sdb, config.filter, wanted);
  if (picked.length === 0) {
    return {
      error:
        "No verified questions match this filter. Generate some from this screen or run pnpm seed.",
      sessionId: null,
      questions: [],
    };
  }
  const session = await sdb.insert(sessions, {
    mode: "drill",
    config: config as unknown as Record<string, unknown>,
  });
  return { error: null, sessionId: session.id, questions: picked };
}

/** Chapter test: the pass-bar gate behind a Learn chapter. */
export async function startChapterTest(
  subtopic: Subtopic,
): Promise<StartDrillResult> {
  const { sdb } = await gateAction("drill");
  const picked = await selectChapterTest(sdb, subtopic);
  if (picked.length < 4) {
    return {
      error: "Not enough verified questions in this chapter for a test.",
      sessionId: null,
      questions: [],
    };
  }
  const session = await sdb.insert(sessions, {
    mode: "drill",
    config: { chapter_test: subtopic, count: picked.length },
  });
  return { error: null, sessionId: session.id, questions: picked };
}

export async function startRedoSession(
  questionIds: number[],
): Promise<StartDrillResult> {
  const { sdb } = await gateAction("queue");
  if (questionIds.length === 0) {
    return { error: "Nothing due to redo.", sessionId: null, questions: [] };
  }
  const rows = await sdb.q
    .select()
    .from(questions)
    .where(
      and(inArray(questions.id, questionIds), eq(questions.verified, true)),
    )
    .all();
  const byId = new Map(rows.map((q) => [q.id, q]));
  const ordered = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q));
  const session = await sdb.insert(sessions, {
    mode: "redo",
    config: { questionIds },
  });
  return { error: null, sessionId: session.id, questions: ordered };
}

/** Start a drill with an exact question list (redo of twins, coach
 *  prescriptions, queue redos run through the normal drill runner). */
export async function startDrillWithQuestions(
  questionIds: number[],
): Promise<StartDrillResult> {
  const { sdb } = await gateAction("drill");
  if (questionIds.length === 0) {
    return { error: "No questions to drill.", sessionId: null, questions: [] };
  }
  const rows = await sdb.q
    .select()
    .from(questions)
    .where(
      and(inArray(questions.id, questionIds), eq(questions.verified, true)),
    )
    .all();
  const byId = new Map(rows.map((q) => [q.id, q]));
  const ordered = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q));
  if (ordered.length === 0) {
    return {
      error: "Those questions no longer exist.",
      sessionId: null,
      questions: [],
    };
  }
  const session = await sdb.insert(sessions, {
    mode: "drill",
    config: { questionIds },
  });
  return { error: null, sessionId: session.id, questions: ordered };
}

export async function logAttempt(input: {
  sessionId: number | null;
  questionId: number;
  mode: SessionMode;
  selectedIndex: number;
  timeSeconds: number;
  confidence: Confidence;
  focus?: SessionFocus;
}): Promise<{ attemptId: number; correct: boolean }> {
  const { sdb, entitlements } = await gateAction("drill");
  // Re-checked here as well as at session start: a client that replays
  // this call must not be able to spend more than the day's allowance.
  const allowance = await dailyAllowance(sdb, entitlements);
  if (allowance.remaining === 0) {
    throw new DailyLimitError(allowance.limit as number);
  }
  const q = await sdb.q
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .get();
  if (!q) throw new Error(`Question ${input.questionId} not found`);
  const correct = input.selectedIndex === q.correctIndex;

  // A session id supplied by the client is only honoured if the caller
  // owns that session; otherwise the attempt is recorded unattached.
  const sessionId = await ownedSessionId(sdb, input.sessionId);

  const attempt = await sdb.insert(attempts, {
    questionId: input.questionId,
    sessionId,
    mode: input.mode,
    focus: input.focus ?? "focused",
    selectedIndex: input.selectedIndex,
    correct,
    timeSeconds: input.timeSeconds,
    confidence: input.confidence,
  });

  if (input.mode === "redo") {
    await applyRedoResult(sdb, q.id, correct, input.timeSeconds);
  } else if (!correct) {
    await enqueueMiss(sdb, q.id, attempt.id);
  }

  return { attemptId: attempt.id, correct };
}

/** Null unless the session exists and belongs to the caller. Client-sent
 *  ids are untrusted input, so they are resolved through the tenant
 *  predicate before anything is written against them. */
async function ownedSessionId(
  sdb: ScopedDb,
  candidate: number | null,
): Promise<number | null> {
  if (candidate == null) return null;
  const owned = await sdb.row(sessions, eq(sessions.id, candidate));
  return owned ? owned.id : null;
}

export type QuestionHistoryRow = {
  correct: boolean;
  timeSeconds: number;
  mode: SessionMode;
  focus: SessionFocus;
  createdAt: Date;
};

/**
 * The actions below stay on `requireScoped()` rather than `gateAction()`
 * on purpose: reading your own history, tagging your own miss, closing
 * your own session, changing a preference, and reporting a bad question
 * are not features to sell. A free account that finds an error in the bank
 * must be able to say so.
 */

/** Every recorded attempt on one question, newest first (max 12). */
export async function getQuestionHistory(
  questionId: number,
): Promise<QuestionHistoryRow[]> {
  const { sdb } = await requireScoped();
  return sdb.q
    .select({
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
      mode: attempts.mode,
      focus: attempts.focus,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .where(sdb.own(attempts, eq(attempts.questionId, questionId)))
    .orderBy(desc(attempts.id))
    .limit(12)
    .all();
}

export async function tagAttempt(
  attemptId: number,
  patch: {
    errorType?: ErrorType | null;
    errorSubtag?: Subtopic | null;
    userNotes?: string | null;
  },
): Promise<void> {
  const { sdb } = await requireScoped();
  await sdb.update(attempts, patch, eq(attempts.id, attemptId));
}

export async function finishSession(
  sessionId: number,
  summary: Record<string, unknown>,
): Promise<void> {
  const { sdb } = await requireScoped();
  await sdb.update(
    sessions,
    { endedAt: new Date(), summary },
    eq(sessions.id, sessionId),
  );
}

// ---------------------------------------------------------------------------
// Timed sets & section simulation (F3)
// ---------------------------------------------------------------------------

export type TimedKind = "full" | "mini";

export type StartTimedResult = StartDrillResult & {
  mode: "timed_set" | "section_sim" | null;
};

export async function startTimedSet(config: {
  kind: TimedKind;
  skill?: FundamentalSkill;
  showTimer: boolean;
  focus?: SessionFocus;
}): Promise<StartTimedResult> {
  const { sdb } = await gateAction("timed");
  const total = config.kind === "full" ? 21 : 7;
  const picked = await selectTimedSet(sdb, total, config.skill);
  if (picked.length < total) {
    return {
      error: `Not enough verified questions for a ${total}-question set (${picked.length} available). Run pnpm seed or generate more from the drill screen.`,
      sessionId: null,
      questions: [],
      mode: null,
    };
  }
  const mode = config.kind === "full" ? "section_sim" : "timed_set";
  const session = await sdb.insert(sessions, {
    mode,
    config: config as unknown as Record<string, unknown>,
  });
  return { error: null, sessionId: session.id, questions: picked, mode };
}

export type TimedResultInput = {
  questionId: number;
  selectedIndex: number;
  timeSeconds: number;
  confidence: Confidence;
  bookmarked: boolean;
  timeViolation: boolean;
};

export type TimedEditInput = {
  questionId: number;
  fromIndex: number;
  toIndex: number;
  reason: EditReason;
  justification: string;
};

export type SaveTimedResponse = {
  attemptIdByQuestionId: Record<number, number>;
  correctByQuestionId: Record<number, boolean>;
  sessionEditNet: number;
  lifetimeEditNet: number;
};

export async function saveTimedSession(input: {
  sessionId: number;
  mode: "timed_set" | "section_sim";
  results: TimedResultInput[];
  edits: TimedEditInput[];
  durationSeconds: number;
  notReachedCount: number;
  focus?: SessionFocus;
}): Promise<SaveTimedResponse> {
  const { sdb } = await gateAction("timed");
  if (input.edits.length > 3) {
    throw new Error("A section allows at most 3 edits.");
  }
  for (const edit of input.edits) {
    if (edit.justification.trim().length < 20) {
      throw new Error(
        "Every edit needs a justification of at least 20 characters.",
      );
    }
  }

  // The session must be the caller's, or the whole save is refused —
  // otherwise a forged id could append attempts to a stranger's section.
  const sessionId = await ownedSessionId(sdb, input.sessionId);
  if (sessionId == null) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  const questionRows = await sdb.q
    .select()
    .from(questions)
    .where(
      inArray(
        questions.id,
        input.results.map((r) => r.questionId),
      ),
    )
    .all();
  const byId = new Map(questionRows.map((q) => [q.id, q]));

  const attemptIdByQuestionId: Record<number, number> = {};
  const correctByQuestionId: Record<number, boolean> = {};

  await sdb.transaction(async (tx) => {
    for (const result of input.results) {
      const q = byId.get(result.questionId);
      if (!q) throw new Error(`Question ${result.questionId} not found`);
      const correct = result.selectedIndex === q.correctIndex;
      correctByQuestionId[q.id] = correct;
      const attempt = await tx.insert(attempts, {
        questionId: q.id,
        sessionId,
        mode: input.mode,
        focus: input.focus ?? "focused",
        selectedIndex: result.selectedIndex,
        correct,
        timeSeconds: result.timeSeconds,
        confidence: result.confidence,
      });
      attemptIdByQuestionId[q.id] = attempt.id;
    }

    for (const edit of input.edits) {
      const q = byId.get(edit.questionId);
      if (!q) continue;
      await tx.add(edits, {
        sessionId,
        questionId: edit.questionId,
        fromIndex: edit.fromIndex,
        toIndex: edit.toIndex,
        fromCorrect: edit.fromIndex === q.correctIndex,
        toCorrect: edit.toIndex === q.correctIndex,
        reason: edit.reason,
        justification: edit.justification.trim(),
      });
    }
  });

  // Redo enqueue outside the transaction: it has its own dedupe logic.
  for (const result of input.results) {
    if (!correctByQuestionId[result.questionId]) {
      await enqueueMiss(
        sdb,
        result.questionId,
        attemptIdByQuestionId[result.questionId],
      );
    }
  }

  const sessionEditNet = input.edits.reduce((net, edit) => {
    const q = byId.get(edit.questionId);
    if (!q) return net;
    return (
      net +
      (edit.toIndex === q.correctIndex ? 1 : 0) -
      (edit.fromIndex === q.correctIndex ? 1 : 0)
    );
  }, 0);

  const allEdits = await sdb.rows(edits);
  const lifetimeEditNet = allEdits.reduce(
    (net, e) => net + (e.toCorrect ? 1 : 0) - (e.fromCorrect ? 1 : 0),
    0,
  );

  const correctCount = Object.values(correctByQuestionId).filter(Boolean).length;
  const summary = {
    total: input.results.length + input.notReachedCount,
    answered: input.results.length,
    correct: correctCount,
    timeViolations: input.results.filter((r) => r.timeViolation).length,
    sub60Wrong: input.results.filter(
      (r) => r.timeSeconds < 60 && !correctByQuestionId[r.questionId],
    ).length,
    editCount: input.edits.length,
    editNet: sessionEditNet,
    notReached: input.notReachedCount,
    durationSeconds: input.durationSeconds,
  };
  await sdb.update(
    sessions,
    { endedAt: new Date(), summary },
    eq(sessions.id, sessionId),
  );

  return {
    attemptIdByQuestionId,
    correctByQuestionId,
    sessionEditNet,
    lifetimeEditNet,
  };
}

// ---------------------------------------------------------------------------
// Pattern trainer (F6)
// ---------------------------------------------------------------------------

export type PatternRoundItem = {
  category: string;
  promptText: string;
  correctAnswer: string;
  userAnswer: string;
  ms: number;
  correct: boolean;
  difficultyRating: number;
};

export type PatternRoundResult = {
  oldRatings: Record<string, number>;
  newRatings: Record<string, number>;
  dayStreak: number;
  categoryStreaks: Record<string, number>;
  personalBest: { previous: number; current: number; isNew: boolean };
};

export async function savePatternRound(input: {
  category: string; // a category key or "mixed"
  items: PatternRoundItem[];
}): Promise<PatternRoundResult> {
  const { sdb } = await gateAction("patterns");
  const score = input.items.filter((i) => i.correct).length;

  // Previous best round score for this selection, from session summaries.
  const previousBest = await bestRoundScore(sdb, input.category);

  const touched = [...new Set(input.items.map((i) => i.category))];
  const oldRatings: Record<string, number> = {};
  for (const category of touched) {
    const row = await sdb.row(
      eloRatings,
      eq(eloRatings.category, category),
    );
    oldRatings[category] = row?.rating ?? ELO_START;
  }

  const newRatings = { ...oldRatings };
  await sdb.transaction(async (tx) => {
    await tx.add(sessions, {
      mode: "pattern",
      config: { category: input.category },
      endedAt: new Date(),
      summary: { category: input.category, score, total: input.items.length },
    });
    for (const item of input.items) {
      await tx.add(patternAttempts, {
        category: item.category,
        promptText: item.promptText,
        correctAnswer: item.correctAnswer,
        userAnswer: item.userAnswer,
        ms: item.ms,
        correct: item.correct,
      });
      newRatings[item.category] = nextRating(
        newRatings[item.category],
        item.difficultyRating,
        item.correct,
      );
    }
    for (const category of touched) {
      // The rating is per account, so the conflict target is the composite
      // key — a shared (category) target would collide across users.
      await tx.q
        .insert(eloRatings)
        .values({
          userId: tx.userId,
          category,
          rating: newRatings[category],
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [eloRatings.userId, eloRatings.category],
          set: { rating: newRatings[category], updatedAt: new Date() },
        })
        .run();
    }
  });

  const dayStreak = await computeDayStreak(sdb);
  const categoryStreaks: Record<string, number> = {};
  for (const category of touched) {
    categoryStreaks[category] = await computeCategoryStreak(sdb, category);
  }

  return {
    oldRatings,
    newRatings,
    dayStreak,
    categoryStreaks,
    personalBest: {
      previous: previousBest,
      current: score,
      isNew: score > previousBest,
    },
  };
}

// ---------------------------------------------------------------------------
// Decision drills
// ---------------------------------------------------------------------------

export async function saveDecisionRound(input: {
  total: number;
  aligned: number;
  calls: Array<{ questionId: number; call: string; recommendation: string }>;
}): Promise<void> {
  const { sdb } = await gateAction("decide");
  await sdb.add(sessions, {
    mode: "pattern",
    config: { kind: "decision" },
    endedAt: new Date(),
    summary: {
      kind: "decision",
      total: input.total,
      aligned: input.aligned,
      calls: input.calls,
    },
  });
}

// ---------------------------------------------------------------------------
// Settings & baseline import (F8, F9)
// ---------------------------------------------------------------------------

export async function saveSetting(
  key: "test_date" | "timed_set_cadence" | "weight_overrides" | "locale",
  value: string,
): Promise<void> {
  const { sdb } = await requireScoped();
  await putSetting(sdb, key, value);
}

export async function saveBaselineReport(input: {
  rawText: string;
  parsed: ParsedReport;
}): Promise<{ id: number }> {
  const { sdb } = await gateAction("import");
  const row = await sdb.insert(baselineReports, {
    rawText: input.rawText,
    parsed: input.parsed as unknown as Record<string, unknown>,
  });
  return { id: row.id };
}

// ---------------------------------------------------------------------------
// Takeaway deck grading (SRS) & content flags
// ---------------------------------------------------------------------------

export async function gradeDeckCard(
  questionId: number,
  grade: ReviewGrade,
): Promise<void> {
  const { sdb } = await gateAction("deck");
  const existing = await sdb.row(
    deckReviews,
    eq(deckReviews.questionId, questionId),
  );
  const next = nextReview(existing, grade);
  const dueAt = new Date(Date.now() + next.intervalDays * 86_400_000);
  if (existing) {
    await sdb.update(
      deckReviews,
      { ...next, dueAt, updatedAt: new Date() },
      eq(deckReviews.questionId, questionId),
    );
  } else {
    await sdb.add(deckReviews, { questionId, ...next, dueAt });
  }
}

export async function flagQuestion(input: {
  questionId: number;
  reason: FlagReason;
  note?: string;
}): Promise<void> {
  const { sdb } = await requireScoped();
  await sdb.add(questionFlags, {
    questionId: input.questionId,
    reason: input.reason,
    note: input.note?.trim() || null,
  });
}

/**
 * Resolve a flag; optionally retire the question (verified=false — rows
 * are never deleted, and the seed loader will not re-verify it).
 *
 * Retiring is a change to the shared bank, so its consequence reaches
 * every account. That makes it adjudication rather than a preference, and
 * ADR 0001 §3 puts it behind the admin role: a subscriber can report a
 * question, but only the operator can withdraw one.
 */
export async function resolveFlag(
  flagId: number,
  retire: boolean,
): Promise<void> {
  await requireAdmin();
  const flag = await db
    .select()
    .from(questionFlags)
    .where(eq(questionFlags.id, flagId))
    .get();
  if (!flag) return;
  await db
    .update(questionFlags)
    .set({ status: "resolved" })
    .where(eq(questionFlags.id, flagId))
    .run();
  if (retire) {
    await db
      .update(questions)
      .set({ verified: false })
      .where(eq(questions.id, flag.questionId))
      .run();
    const retired = await userRetiredIds();
    retired.add(flag.questionId);
    await putAppSetting("user_retired_qids", JSON.stringify([...retired]));
  }
  revalidatePath("/analytics");
}
