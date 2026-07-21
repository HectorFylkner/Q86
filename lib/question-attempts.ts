import { eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, edits, questions, sessions } from "./db/schema.ts";
import { canonicalIndexForQuestion } from "./question-choice-order.ts";
import { loadQuestionSession } from "./question-session.ts";
import { applyRedoResult, enqueueMiss } from "./redo.ts";
import type {
  Confidence,
  EditReason,
  SessionFocus,
  SessionMode,
} from "./taxonomy.ts";

export type LogAttemptInput = {
  sessionId: number | null;
  questionId: number;
  mode: SessionMode;
  /** Index in the display order returned when the session was created. */
  selectedIndex: number;
  timeSeconds: number;
  confidence: Confidence;
  focus?: SessionFocus;
};

/** Persist a single displayed answer as canonical attempt history. */
export async function recordQuestionAttempt(
  input: LogAttemptInput,
): Promise<{ attemptId: number; correct: boolean }> {
  const question = await db
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .get();
  if (question == null) throw new Error(`Question ${input.questionId} not found`);
  if (input.sessionId == null) {
    throw new Error("A persisted session is required to record an answer.");
  }
  const { choiceOrderRoster } = await loadQuestionSession(
    input.sessionId,
    input.mode,
  );
  const canonicalSelectedIndex = canonicalIndexForQuestion(
    input.selectedIndex,
    question,
    choiceOrderRoster,
  );
  const correct = canonicalSelectedIndex === question.correctIndex;

  const attempt = await db
    .insert(attempts)
    .values({
      questionId: input.questionId,
      sessionId: input.sessionId,
      mode: input.mode,
      focus: input.focus ?? "focused",
      selectedIndex: canonicalSelectedIndex,
      correct,
      timeSeconds: input.timeSeconds,
      confidence: input.confidence,
    })
    .returning()
    .get();

  if (input.mode === "redo") {
    await applyRedoResult(question.id, correct, input.timeSeconds);
  } else if (!correct) {
    await enqueueMiss(question.id, attempt.id);
  }

  return { attemptId: attempt.id, correct };
}

export type TimedResultInput = {
  questionId: number;
  /** Final index in the display order returned for this session. */
  selectedIndex: number;
  timeSeconds: number;
  confidence: Confidence;
  bookmarked: boolean;
  timeViolation: boolean;
};

export type TimedEditInput = {
  questionId: number;
  /** Both indexes use the persisted display order for this session. */
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

/** Convert timed display answers/edits to canonical indexes before all writes. */
export async function saveTimedQuestionSession(input: {
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

  const questionSession = await loadQuestionSession(
    input.sessionId,
    input.mode,
  );
  if (questionSession.session.endedAt != null) {
    throw new Error(`Session ${input.sessionId} has already been submitted.`);
  }
  if (
    !Number.isSafeInteger(input.notReachedCount) ||
    input.notReachedCount < 0
  ) {
    throw new Error("notReachedCount must be a non-negative integer.");
  }
  const expectedQuestionIds = new Set(questionSession.questionIds);
  const resultQuestionIds = input.results.map((result) => result.questionId);
  if (new Set(resultQuestionIds).size !== resultQuestionIds.length) {
    throw new Error(
      "A timed session cannot submit two answers for one question.",
    );
  }
  if (
    resultQuestionIds.some((questionId) => !expectedQuestionIds.has(questionId))
  ) {
    throw new Error("A timed answer is outside this session's question roster.");
  }
  if (
    input.results.length + input.notReachedCount !==
    questionSession.questionIds.length
  ) {
    throw new Error(
      "Answered and not-reached counts do not match the session roster.",
    );
  }
  const editQuestionIds = input.edits.map((edit) => edit.questionId);
  if (new Set(editQuestionIds).size !== editQuestionIds.length) {
    throw new Error("A question can be edited at most once in a timed session.");
  }
  const displayedResultByQuestionId = new Map(
    input.results.map((result) => [result.questionId, result]),
  );
  for (const edit of input.edits) {
    const finalResult = displayedResultByQuestionId.get(edit.questionId);
    if (finalResult == null || finalResult.selectedIndex !== edit.toIndex) {
      throw new Error("Every edit must end at the submitted final answer.");
    }
  }

  const questionRows = await db
    .select()
    .from(questions)
    .where(inArray(questions.id, questionSession.questionIds))
    .all();
  const byId = new Map(questionRows.map((question) => [question.id, question]));
  if (byId.size !== questionSession.questionIds.length) {
    throw new Error(
      "One or more questions in this timed session no longer exist.",
    );
  }
  const canonicalResults = input.results.map((result) => {
    const question = byId.get(result.questionId);
    if (question == null) {
      throw new Error(`Question ${result.questionId} not found`);
    }
    return {
      ...result,
      selectedIndex: canonicalIndexForQuestion(
        result.selectedIndex,
        question,
        questionSession.choiceOrderRoster,
      ),
    };
  });
  const canonicalEdits = input.edits.map((edit) => {
    const question = byId.get(edit.questionId);
    if (question == null) {
      throw new Error(`Question ${edit.questionId} not found`);
    }
    return {
      ...edit,
      fromIndex: canonicalIndexForQuestion(
        edit.fromIndex,
        question,
        questionSession.choiceOrderRoster,
      ),
      toIndex: canonicalIndexForQuestion(
        edit.toIndex,
        question,
        questionSession.choiceOrderRoster,
      ),
    };
  });

  const attemptIdByQuestionId: Record<number, number> = {};
  const correctByQuestionId: Record<number, boolean> = {};

  await db.transaction(async (tx) => {
    for (const result of canonicalResults) {
      const question = byId.get(result.questionId);
      if (question == null) {
        throw new Error(`Question ${result.questionId} not found`);
      }
      const correct = result.selectedIndex === question.correctIndex;
      correctByQuestionId[question.id] = correct;
      const attempt = await tx
        .insert(attempts)
        .values({
          questionId: question.id,
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
      attemptIdByQuestionId[question.id] = attempt.id;
    }

    for (const edit of canonicalEdits) {
      const question = byId.get(edit.questionId);
      if (question == null) {
        throw new Error(`Question ${edit.questionId} not found`);
      }
      await tx
        .insert(edits)
        .values({
          sessionId: input.sessionId,
          questionId: edit.questionId,
          fromIndex: edit.fromIndex,
          toIndex: edit.toIndex,
          fromCorrect: edit.fromIndex === question.correctIndex,
          toCorrect: edit.toIndex === question.correctIndex,
          reason: edit.reason,
          justification: edit.justification.trim(),
        })
        .run();
    }
  });

  // Redo enqueue stays outside the transaction because it owns deduplication.
  for (const result of canonicalResults) {
    if (!correctByQuestionId[result.questionId]) {
      await enqueueMiss(
        result.questionId,
        attemptIdByQuestionId[result.questionId],
      );
    }
  }

  const sessionEditNet = canonicalEdits.reduce((net, edit) => {
    const question = byId.get(edit.questionId);
    if (question == null) return net;
    return (
      net +
      (edit.toIndex === question.correctIndex ? 1 : 0) -
      (edit.fromIndex === question.correctIndex ? 1 : 0)
    );
  }, 0);

  const allEdits = await db.select().from(edits).all();
  const lifetimeEditNet = allEdits.reduce(
    (net, edit) =>
      net + (edit.toCorrect ? 1 : 0) - (edit.fromCorrect ? 1 : 0),
    0,
  );
  const correctCount = Object.values(correctByQuestionId).filter(Boolean).length;
  const summary = {
    total: input.results.length + input.notReachedCount,
    answered: input.results.length,
    correct: correctCount,
    timeViolations: input.results.filter((result) => result.timeViolation).length,
    sub60Wrong: input.results.filter(
      (result) =>
        result.timeSeconds < 60 && !correctByQuestionId[result.questionId],
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
