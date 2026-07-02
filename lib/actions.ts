"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  questions,
  sessions,
  type Question,
} from "./db/schema.ts";
import { selectQuestions, type QuestionFilter } from "./engine.ts";
import { applyRedoResult, enqueueMiss } from "./redo.ts";
import type {
  Confidence,
  ErrorType,
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
