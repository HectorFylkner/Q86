"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  edits,
  eloRatings,
  patternAttempts,
  questions,
  sessions,
  type Question,
} from "./db/schema.ts";
import { ELO_START, nextRating } from "./elo.ts";
import {
  bestRoundScore,
  computeCategoryStreak,
  computeDayStreak,
} from "./pattern-stats.ts";
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
  FundamentalSkill,
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
}): Promise<StartDrillResult> {
  const picked = selectQuestions(config.filter, config.count);
  if (picked.length === 0) {
    return {
      error:
        "No verified questions match this filter. Generate some from this screen or run pnpm seed.",
      sessionId: null,
      questions: [],
    };
  }
  const session = db
    .insert(sessions)
    .values({
      mode: "drill",
      config: config as unknown as Record<string, unknown>,
    })
    .returning()
    .get();
  return { error: null, sessionId: session.id, questions: picked };
}

export async function startRedoSession(
  questionIds: number[],
): Promise<StartDrillResult> {
  if (questionIds.length === 0) {
    return { error: "Nothing due to redo.", sessionId: null, questions: [] };
  }
  const rows = db
    .select()
    .from(questions)
    .where(inArray(questions.id, questionIds))
    .all();
  const byId = new Map(rows.map((q) => [q.id, q]));
  const ordered = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q));
  const session = db
    .insert(sessions)
    .values({ mode: "redo", config: { questionIds } })
    .returning()
    .get();
  return { error: null, sessionId: session.id, questions: ordered };
}

/** Start a drill with an exact question list (redo of twins, coach
 *  prescriptions, queue redos run through the normal drill runner). */
export async function startDrillWithQuestions(
  questionIds: number[],
): Promise<StartDrillResult> {
  if (questionIds.length === 0) {
    return { error: "No questions to drill.", sessionId: null, questions: [] };
  }
  const rows = db
    .select()
    .from(questions)
    .where(inArray(questions.id, questionIds))
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
  const session = db
    .insert(sessions)
    .values({ mode: "drill", config: { questionIds } })
    .returning()
    .get();
  return { error: null, sessionId: session.id, questions: ordered };
}

export async function logAttempt(input: {
  sessionId: number | null;
  questionId: number;
  mode: SessionMode;
  selectedIndex: number;
  timeSeconds: number;
  confidence: Confidence;
}): Promise<{ attemptId: number; correct: boolean }> {
  const q = db
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .get();
  if (!q) throw new Error(`Question ${input.questionId} not found`);
  const correct = input.selectedIndex === q.correctIndex;

  const attempt = db
    .insert(attempts)
    .values({
      questionId: input.questionId,
      sessionId: input.sessionId,
      mode: input.mode,
      selectedIndex: input.selectedIndex,
      correct,
      timeSeconds: input.timeSeconds,
      confidence: input.confidence,
    })
    .returning()
    .get();

  if (input.mode === "redo") {
    applyRedoResult(q.id, correct, input.timeSeconds);
  } else if (!correct) {
    enqueueMiss(q.id, attempt.id);
  }

  return { attemptId: attempt.id, correct };
}

export async function tagAttempt(
  attemptId: number,
  patch: {
    errorType?: ErrorType | null;
    errorSubtag?: Subtopic | null;
    userNotes?: string | null;
  },
): Promise<void> {
  db.update(attempts).set(patch).where(eq(attempts.id, attemptId)).run();
}

export async function finishSession(
  sessionId: number,
  summary: Record<string, unknown>,
): Promise<void> {
  db.update(sessions)
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
}): Promise<StartTimedResult> {
  const total = config.kind === "full" ? 21 : 7;
  const picked = selectTimedSet(total, config.skill);
  if (picked.length < total) {
    return {
      error: `Not enough verified questions for a ${total}-question set (${picked.length} available). Run pnpm seed or generate more from the drill screen.`,
      sessionId: null,
      questions: [],
      mode: null,
    };
  }
  const mode = config.kind === "full" ? "section_sim" : "timed_set";
  const session = db
    .insert(sessions)
    .values({ mode, config: config as unknown as Record<string, unknown> })
    .returning()
    .get();
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
}): Promise<SaveTimedResponse> {
  for (const edit of input.edits) {
    if (edit.justification.trim().length < 20) {
      throw new Error(
        "Every edit needs a justification of at least 20 characters.",
      );
    }
  }

  const questionRows = db
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

  db.transaction((tx) => {
    for (const result of input.results) {
      const q = byId.get(result.questionId);
      if (!q) throw new Error(`Question ${result.questionId} not found`);
      const correct = result.selectedIndex === q.correctIndex;
      correctByQuestionId[q.id] = correct;
      const attempt = tx
        .insert(attempts)
        .values({
          questionId: q.id,
          sessionId: input.sessionId,
          mode: input.mode,
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
      tx.insert(edits)
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
      enqueueMiss(result.questionId, attemptIdByQuestionId[result.questionId]);
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

  const allEdits = db.select().from(edits).all();
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
  db.update(sessions)
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
  const previousBest = bestRoundScore(input.category);

  db.insert(sessions)
    .values({
      mode: "pattern",
      config: { category: input.category },
      endedAt: new Date(),
      summary: { category: input.category, score, total: input.items.length },
    })
    .run();

  const touched = [...new Set(input.items.map((i) => i.category))];
  const oldRatings: Record<string, number> = {};
  for (const category of touched) {
    const row = db
      .select()
      .from(eloRatings)
      .where(eq(eloRatings.category, category))
      .get();
    oldRatings[category] = row?.rating ?? ELO_START;
  }

  const newRatings = { ...oldRatings };
  db.transaction((tx) => {
    for (const item of input.items) {
      tx.insert(patternAttempts)
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
      tx.insert(eloRatings)
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

  const dayStreak = computeDayStreak();
  const categoryStreaks: Record<string, number> = {};
  for (const category of touched) {
    categoryStreaks[category] = computeCategoryStreak(category);
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
