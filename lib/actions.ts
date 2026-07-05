"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
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
import { USER_RETIRED_KEY, userRetiredIds } from "./db/seed-bank.ts";
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
import { rampBudgets } from "./ramp-server.ts";
import type { RampBudget } from "./ramp.ts";
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
  /** Timed-transfer ramp target per question id (lib/ramp.ts). */
  budgets: Record<number, RampBudget>;
};

export async function startDrill(config: {
  filter: QuestionFilter;
  count: number;
  timing: DrillTiming;
  focus?: SessionFocus;
}): Promise<StartDrillResult> {
  const picked = await selectQuestions(config.filter, config.count);
  if (picked.length === 0) {
    return {
      error:
        "No verified questions match this filter. Generate some from this screen or run pnpm seed.",
      sessionId: null,
      questions: [],
      budgets: {},
    };
  }
  const session = await db
    .insert(sessions)
    .values({
      mode: "drill",
      config: config as unknown as Record<string, unknown>,
    })
    .returning()
    .get();
  return {
    error: null,
    sessionId: session.id,
    questions: picked,
    budgets: await rampBudgets(picked),
  };
}

/** Chapter test: the pass-bar gate behind a Learn chapter. */
export async function startChapterTest(
  subtopic: Subtopic,
): Promise<StartDrillResult> {
  const picked = await selectChapterTest(subtopic);
  if (picked.length < 4) {
    return {
      error: "Not enough verified questions in this chapter for a test.",
      sessionId: null,
      questions: [],
      budgets: {},
    };
  }
  const session = await db
    .insert(sessions)
    .values({
      mode: "drill",
      config: { chapter_test: subtopic, count: picked.length },
    })
    .returning()
    .get();
  return {
    error: null,
    sessionId: session.id,
    questions: picked,
    budgets: await rampBudgets(picked),
  };
}

export async function startRedoSession(
  questionIds: number[],
): Promise<StartDrillResult> {
  if (questionIds.length === 0) {
    return {
      error: "Nothing due to redo.",
      sessionId: null,
      questions: [],
      budgets: {},
    };
  }
  const rows = await db
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
  const session = await db
    .insert(sessions)
    .values({ mode: "redo", config: { questionIds } })
    .returning()
    .get();
  return {
    error: null,
    sessionId: session.id,
    questions: ordered,
    budgets: await rampBudgets(ordered),
  };
}

/** Start a drill with an exact question list (redo of twins, coach
 *  prescriptions, queue redos run through the normal drill runner). */
export async function startDrillWithQuestions(
  questionIds: number[],
): Promise<StartDrillResult> {
  if (questionIds.length === 0) {
    return {
      error: "No questions to drill.",
      sessionId: null,
      questions: [],
      budgets: {},
    };
  }
  const rows = await db
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
      budgets: {},
    };
  }
  const session = await db
    .insert(sessions)
    .values({ mode: "drill", config: { questionIds } })
    .returning()
    .get();
  return {
    error: null,
    sessionId: session.id,
    questions: ordered,
    budgets: await rampBudgets(ordered),
  };
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
  const q = await db
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .get();
  if (!q) throw new Error(`Question ${input.questionId} not found`);
  const correct = input.selectedIndex === q.correctIndex;

  const attempt = await db
    .insert(attempts)
    .values({
      questionId: input.questionId,
      sessionId: input.sessionId,
      mode: input.mode,
      focus: input.focus ?? "focused",
      selectedIndex: input.selectedIndex,
      correct,
      timeSeconds: input.timeSeconds,
      confidence: input.confidence,
    })
    .returning()
    .get();

  if (input.mode === "redo") {
    // A redo miss whose ladder item is already cleared (or was never
    // queued) must not vanish silently — re-enter the ladder at stage 0.
    const applied = await applyRedoResult(q.id, correct, input.timeSeconds);
    if (!applied && !correct) await enqueueMiss(q.id, attempt.id);
  } else if (!correct) {
    await enqueueMiss(q.id, attempt.id);
  }

  return { attemptId: attempt.id, correct };
}

export type QuestionHistoryRow = {
  correct: boolean;
  timeSeconds: number;
  mode: SessionMode;
  focus: SessionFocus;
  createdAt: Date;
};

/** Every recorded attempt on one question, newest first (max 12). */
export async function getQuestionHistory(
  questionId: number,
): Promise<QuestionHistoryRow[]> {
  return db
    .select({
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
      mode: attempts.mode,
      focus: attempts.focus,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .where(eq(attempts.questionId, questionId))
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
  await db.update(attempts).set(patch).where(eq(attempts.id, attemptId)).run();
}

export async function finishSession(
  sessionId: number,
  summary: Record<string, unknown>,
): Promise<void> {
  await db
    .update(sessions)
    .set({ endedAt: new Date(), summary })
    .where(eq(sessions.id, sessionId))
    .run();
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
  const total = config.kind === "full" ? 21 : 7;
  const picked = await selectTimedSet(total, config.skill);
  if (picked.length < total) {
    return {
      error: `Not enough verified questions for a ${total}-question set (${picked.length} available). Run pnpm seed or generate more from the drill screen.`,
      sessionId: null,
      questions: [],
      budgets: {},
      mode: null,
    };
  }
  const mode = config.kind === "full" ? "section_sim" : "timed_set";
  const session = await db
    .insert(sessions)
    .values({ mode, config: config as unknown as Record<string, unknown> })
    .returning()
    .get();
  // Timed sets run on the section clock; per-question ramp budgets do
  // not apply there.
  return {
    error: null,
    sessionId: session.id,
    questions: picked,
    budgets: {},
    mode,
  };
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

  const questionRows = await db
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

  await db.transaction(async (tx) => {
    for (const result of input.results) {
      const q = byId.get(result.questionId);
      if (!q) throw new Error(`Question ${result.questionId} not found`);
      const correct = result.selectedIndex === q.correctIndex;
      correctByQuestionId[q.id] = correct;
      const attempt = await tx
        .insert(attempts)
        .values({
          questionId: q.id,
          sessionId: input.sessionId,
          mode: input.mode,
          focus: input.focus ?? "focused",
          selectedIndex: result.selectedIndex,
          correct,
          timeSeconds: result.timeSeconds,
          confidence: result.confidence,
        })
        .returning()
        .get();
      attemptIdByQuestionId[q.id] = attempt.id;
    }

    for (const edit of input.edits) {
      const q = byId.get(edit.questionId);
      if (!q) continue;
      await tx
        .insert(edits)
        .values({
          sessionId: input.sessionId,
          questionId: edit.questionId,
          fromIndex: edit.fromIndex,
          toIndex: edit.toIndex,
          fromCorrect: edit.fromIndex === q.correctIndex,
          toCorrect: edit.toIndex === q.correctIndex,
          reason: edit.reason,
          justification: edit.justification.trim(),
        })
        .run();
    }
  });

  // Redo enqueue outside the transaction: it has its own dedupe logic.
  for (const result of input.results) {
    if (!correctByQuestionId[result.questionId]) {
      await enqueueMiss(
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

  const allEdits = await db.select().from(edits).all();
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
  await db
    .update(sessions)
    .set({ endedAt: new Date(), summary })
    .where(eq(sessions.id, input.sessionId))
    .run();

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
  const score = input.items.filter((i) => i.correct).length;

  // Previous best round score for this selection, from session summaries.
  const previousBest = await bestRoundScore(input.category);

  const touched = [...new Set(input.items.map((i) => i.category))];
  const oldRatings: Record<string, number> = {};
  for (const category of touched) {
    const row = await db
      .select()
      .from(eloRatings)
      .where(eq(eloRatings.category, category))
      .get();
    oldRatings[category] = row?.rating ?? ELO_START;
  }

  const newRatings = { ...oldRatings };
  await db.transaction(async (tx) => {
    await tx
      .insert(sessions)
      .values({
        mode: "pattern",
        config: { category: input.category },
        endedAt: new Date(),
        summary: { category: input.category, score, total: input.items.length },
      })
      .run();
    for (const item of input.items) {
      await tx
        .insert(patternAttempts)
        .values({
          category: item.category,
          promptText: item.promptText,
          correctAnswer: item.correctAnswer,
          userAnswer: item.userAnswer,
          ms: item.ms,
          correct: item.correct,
        })
        .run();
      newRatings[item.category] = nextRating(
        newRatings[item.category],
        item.difficultyRating,
        item.correct,
      );
    }
    for (const category of touched) {
      await tx
        .insert(eloRatings)
        .values({
          category,
          rating: newRatings[category],
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: eloRatings.category,
          set: { rating: newRatings[category], updatedAt: new Date() },
        })
        .run();
    }
  });

  const dayStreak = await computeDayStreak();
  const categoryStreaks: Record<string, number> = {};
  for (const category of touched) {
    categoryStreaks[category] = await computeCategoryStreak(category);
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
  await db
    .insert(sessions)
    .values({
      mode: "pattern",
      config: { kind: "decision" },
      endedAt: new Date(),
      summary: {
        kind: "decision",
        total: input.total,
        aligned: input.aligned,
        calls: input.calls,
      },
    })
    .run();
}

// ---------------------------------------------------------------------------
// Settings & baseline import (F8, F9)
// ---------------------------------------------------------------------------

export async function saveSetting(
  key:
    | "test_date"
    | "timed_set_cadence"
    | "weight_overrides"
    | "model"
    | "timezone",
  value: string,
): Promise<void> {
  await putSetting(key, value);
}

export async function saveBaselineReport(input: {
  rawText: string;
  parsed: ParsedReport;
}): Promise<{ id: number }> {
  const row = await db
    .insert(baselineReports)
    .values({
      rawText: input.rawText,
      parsed: input.parsed as unknown as Record<string, unknown>,
    })
    .returning()
    .get();
  return { id: row.id };
}

// ---------------------------------------------------------------------------
// Takeaway deck grading (SRS) & content flags
// ---------------------------------------------------------------------------

export async function gradeDeckCard(
  questionId: number,
  grade: ReviewGrade,
): Promise<void> {
  const existing =
    (await db
      .select()
      .from(deckReviews)
      .where(eq(deckReviews.questionId, questionId))
      .get()) ?? null;
  const next = nextReview(existing, grade);
  const dueAt = new Date(Date.now() + next.intervalDays * 86_400_000);
  if (existing) {
    await db
      .update(deckReviews)
      .set({ ...next, dueAt, updatedAt: new Date() })
      .where(eq(deckReviews.questionId, questionId))
      .run();
  } else {
    await db.insert(deckReviews).values({ questionId, ...next, dueAt }).run();
  }
}

export async function flagQuestion(input: {
  questionId: number;
  reason: FlagReason;
  note?: string;
}): Promise<void> {
  await db
    .insert(questionFlags)
    .values({
      questionId: input.questionId,
      reason: input.reason,
      note: input.note?.trim() || null,
    })
    .run();
}

/** Resolve a flag; optionally retire the question (verified=false — rows
 *  are never deleted, and the seed loader will not re-verify it). */
export async function resolveFlag(
  flagId: number,
  retire: boolean,
): Promise<void> {
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
    await putSetting(USER_RETIRED_KEY, JSON.stringify([...retired]));
  }
  revalidatePath("/analytics");
}
