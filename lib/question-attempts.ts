import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  currentQuestionDiagnosis,
  currentQuestionMisconceptionIds,
} from "./db/curriculum-mappings.ts";
import {
  assistanceEvents,
  attempts,
  conceptRemediations,
  edits,
  questions,
  sessions,
} from "./db/schema.ts";
import {
  exposedVariantFamilyIds,
  openConceptRemediation,
  parseBoundConceptRemediation,
  remediationCanResolveFromFreshQuestion,
} from "./concept-remediations.ts";
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

const REMEDIATION_PACE_SECONDS: Record<number, number> = {
  1: 90,
  2: 100,
  3: 120,
  4: 145,
  5: 165,
};

type QuestionRemediationTrigger =
  | "wrong"
  | "slow"
  | "hinted"
  | "low_confidence"
  | "changed_from_correct";

function remediationTrigger(input: {
  correct: boolean;
  confidence: Confidence;
  timeSeconds: number;
  difficulty: number;
  timeViolation?: boolean;
  changedFromCorrect?: boolean;
  assisted?: boolean;
}): QuestionRemediationTrigger | null {
  if (input.changedFromCorrect) return "changed_from_correct";
  if (!input.correct) return "wrong";
  if (input.assisted) return "hinted";
  if (input.confidence === "guess") return "low_confidence";
  if (
    input.timeViolation ||
    input.timeSeconds > (REMEDIATION_PACE_SECONDS[input.difficulty] ?? 135)
  ) {
    return "slow";
  }
  return null;
}

function remediationValues(input: {
  attemptId: number;
  conceptId: string;
  misconceptionId: string | null;
  trigger: QuestionRemediationTrigger;
  questionId: number;
}): typeof conceptRemediations.$inferInsert {
  const misconceptionTarget =
    input.trigger === "wrong" && input.misconceptionId != null;
  return {
    remediationUid: `remediation.q86.${randomUUID()}`,
    conceptId: input.conceptId,
    misconceptionId: input.misconceptionId,
    sourceQuestionAttemptId: input.attemptId,
    trigger: input.trigger,
    actionType: misconceptionTarget
      ? "review_misconception"
      : input.trigger === "wrong" || input.trigger === "changed_from_correct"
        ? "review_concept"
        : "targeted_practice",
    actionTargetId: misconceptionTarget
      ? input.misconceptionId!
      : input.conceptId,
    priority:
      input.trigger === "changed_from_correct"
        ? 1
        : input.trigger === "wrong"
          ? 2
          : input.trigger === "low_confidence"
            ? 3
            : input.trigger === "hinted"
              ? 3
              : 4,
    rationaleMd:
      input.trigger === "changed_from_correct"
        ? `Question ${input.questionId}: Review & Edit moved away from the correct answer; re-establish the exact concept before another timed transfer.`
        : input.trigger === "wrong"
          ? `Question ${input.questionId}: the independently submitted answer missed; review the mapped concept and retry unseen aligned practice.`
          : input.trigger === "low_confidence"
            ? `Question ${input.questionId}: a guessed correct answer does not count as independent evidence; prove it on another aligned item.`
            : input.trigger === "hinted"
              ? `Question ${input.questionId}: pre-answer assistance means this response is guided evidence; retry a fresh aligned item independently.`
              : `Question ${input.questionId}: accuracy held, but pace exceeded the current difficulty guardrail; repeat aligned work with timing only after the method is stable.`,
  };
}

/** Persist a single displayed answer as canonical attempt history. */
export async function recordQuestionAttempt(
  input: LogAttemptInput,
): Promise<{
  attemptId: number;
  correct: boolean;
  conceptId: string | null;
  remediationCreated: boolean;
  remediationResolved: boolean;
}> {
  const question = await db
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .get();
  if (question == null) throw new Error(`Question ${input.questionId} not found`);
  if (input.sessionId == null) {
    throw new Error("A persisted session is required to record an answer.");
  }
  const questionSession = await loadQuestionSession(
    input.sessionId,
    input.mode,
  );
  if (questionSession.session.endedAt != null) {
    throw new Error(`Session ${input.sessionId} has already ended.`);
  }
  const canonicalSelectedIndex = canonicalIndexForQuestion(
    input.selectedIndex,
    question,
    questionSession.choiceOrderRoster,
  );
  const correct = canonicalSelectedIndex === question.correctIndex;
  const sessionItem = questionSession.sessionItems.find(
    (item) => item.questionId === question.id,
  );
  const assistance = sessionItem
    ? await db
        .select({ id: assistanceEvents.id })
        .from(assistanceEvents)
        .where(eq(assistanceEvents.sessionItemId, sessionItem.id))
        .get()
    : null;
  const diagnosis = await currentQuestionDiagnosis({
    questionId: question.id,
    questionContentVersion: question.contentVersion,
    canonicalChoiceIndex: correct ? undefined : canonicalSelectedIndex,
  });
  const trigger = remediationTrigger({
    correct,
    confidence: input.confidence,
    timeSeconds: input.timeSeconds,
    difficulty: question.difficulty,
    assisted: assistance != null,
  });
  const focus = input.focus ?? "focused";
  const bound = parseBoundConceptRemediation(questionSession.session.config);
  const existingAttempts = await db
    .select()
    .from(attempts)
    .where(
      and(
        eq(attempts.sessionId, input.sessionId),
        eq(attempts.questionId, input.questionId),
      ),
    )
    .limit(2)
    .all();
  if (existingAttempts.length > 1) {
    throw new Error(
      `Session ${input.sessionId} has duplicate answers for question ${input.questionId}.`,
    );
  }
  const existing = existingAttempts[0];
  if (existing) {
    if (
      existing.mode !== input.mode ||
      existing.focus !== focus ||
      existing.selectedIndex !== canonicalSelectedIndex ||
      existing.confidence !== input.confidence ||
      Math.abs(existing.timeSeconds - input.timeSeconds) > 0.01
    ) {
      throw new Error("This session item already has a different submitted answer.");
    }
    const existingRemediation = await db
      .select({ id: conceptRemediations.id })
      .from(conceptRemediations)
      .where(eq(conceptRemediations.sourceQuestionAttemptId, existing.id))
      .get();
    const resolvedBound = bound
      ? await db
          .select({
            status: conceptRemediations.status,
            resolutionEvidence: conceptRemediations.resolutionEvidence,
          })
          .from(conceptRemediations)
          .where(
            and(
              eq(conceptRemediations.id, bound.id),
              eq(conceptRemediations.remediationUid, bound.remediationUid),
              eq(conceptRemediations.conceptId, bound.conceptId),
            ),
          )
          .get()
      : null;
    return {
      attemptId: existing.id,
      correct: existing.correct,
      conceptId: diagnosis?.conceptId ?? existing.errorConceptId ?? null,
      remediationCreated: existingRemediation != null,
      remediationResolved:
        resolvedBound?.status === "resolved" &&
        resolvedBound.resolutionEvidence?.questionAttemptId === existing.id,
    };
  }

  const boundRemediation = bound
    ? await openConceptRemediation(bound.id, bound.conceptId)
    : null;
  const priorFamilies = boundRemediation
    ? await exposedVariantFamilyIds({ excludeSessionId: input.sessionId })
    : [];
  const misconceptionIds =
    boundRemediation?.actionType === "review_misconception"
      ? await currentQuestionMisconceptionIds({
          questionId: question.id,
          questionContentVersion: question.contentVersion,
          conceptId: boundRemediation.conceptId,
        })
      : [];
  const variantFamilyId = question.twinOf ?? question.id;
  const canResolveBoundRemediation = Boolean(
    bound &&
      boundRemediation &&
      bound.remediationUid === boundRemediation.remediationUid &&
      bound.conceptId === boundRemediation.conceptId &&
      remediationCanResolveFromFreshQuestion(boundRemediation) &&
      questionSession.session.mode === "drill" &&
      focus === "focused" &&
      sessionItem != null &&
      sessionItem.blueprintSlot ===
        `remediation.${boundRemediation.id}.fresh-independent-check` &&
      // SQLite's default timestamp has one-second granularity, so equality is
      // possible even though the action-bound session was created afterward.
      questionSession.session.startedAt.getTime() >=
        boundRemediation.createdAt.getTime() &&
      question.verified &&
      diagnosis?.conceptId === boundRemediation.conceptId &&
      trigger == null &&
      assistance == null &&
      !priorFamilies.includes(variantFamilyId) &&
      (boundRemediation.actionType !== "review_misconception" ||
        (boundRemediation.misconceptionId != null &&
          misconceptionIds.includes(boundRemediation.misconceptionId))),
  );

  const stored = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(attempts)
      .values({
        questionId: input.questionId,
        sessionId: input.sessionId,
        mode: input.mode,
        focus,
        selectedIndex: canonicalSelectedIndex,
        correct,
        timeSeconds: input.timeSeconds,
        confidence: input.confidence,
        errorConceptId: trigger ? diagnosis?.conceptId ?? null : null,
        misconceptionId: trigger ? diagnosis?.misconceptionId ?? null : null,
      })
      .returning()
      .get();
    if (trigger && diagnosis) {
      await tx
        .insert(conceptRemediations)
        .values(
          remediationValues({
            attemptId: inserted.id,
            conceptId: diagnosis.conceptId,
            misconceptionId: diagnosis.misconceptionId,
            trigger,
            questionId: question.id,
          }),
        )
        .run();
    }
    let remediationResolved = false;
    if (
      canResolveBoundRemediation &&
      boundRemediation &&
      bound &&
      sessionItem &&
      diagnosis
    ) {
      const resolved = await tx
        .update(conceptRemediations)
        .set({
          status: "resolved",
          resolvedAt: new Date(),
          updatedAt: new Date(),
          resolutionEvidence: {
            kind: "independent_fresh_roster_success",
            questionAttemptId: inserted.id,
            sessionId: input.sessionId,
            sessionItemId: sessionItem.id,
            blueprintSlot: sessionItem.blueprintSlot,
            questionUid: sessionItem.questionUid,
            questionContentVersion: sessionItem.questionContentVersion,
            mappingVersion: diagnosis.mappingVersion,
            variantFamilyId,
            confidence: input.confidence,
            timeSeconds: input.timeSeconds,
            serverVerifiedCorrect: true,
            freshnessPolicy: "no-prior-roster-or-attempt-in-family",
          },
        })
        .where(
          and(
            eq(conceptRemediations.id, bound.id),
            eq(conceptRemediations.remediationUid, bound.remediationUid),
            eq(conceptRemediations.conceptId, bound.conceptId),
            inArray(conceptRemediations.status, ["open", "in_progress"]),
          ),
        )
        .returning({ id: conceptRemediations.id })
        .get();
      remediationResolved = resolved != null;
    }
    return { attempt: inserted, remediationResolved };
  });
  const attempt = stored.attempt;

  if (input.mode === "redo") {
    await applyRedoResult(question.id, correct, input.timeSeconds);
  } else if (!correct) {
    await enqueueMiss(question.id, attempt.id);
  }

  return {
    attemptId: attempt.id,
    correct,
    conceptId: diagnosis?.conceptId ?? null,
    remediationCreated: trigger != null && diagnosis != null,
    remediationResolved: stored.remediationResolved,
  };
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
  const assistedSessionItemIds = new Set(
    questionSession.sessionItems.length > 0
      ? (
          await db
            .select({ sessionItemId: assistanceEvents.sessionItemId })
            .from(assistanceEvents)
            .where(
              inArray(
                assistanceEvents.sessionItemId,
                questionSession.sessionItems.map((item) => item.id),
              ),
            )
            .all()
        ).flatMap((event) =>
          event.sessionItemId == null ? [] : [event.sessionItemId],
        )
      : [],
  );
  const sessionItemByQuestionId = new Map(
    questionSession.sessionItems.map((item) => [item.questionId, item]),
  );
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
  const changedFromCorrect = new Set(
    canonicalEdits.flatMap((edit) => {
      const question = byId.get(edit.questionId);
      return question &&
        edit.fromIndex === question.correctIndex &&
        edit.toIndex !== question.correctIndex
        ? [edit.questionId]
        : [];
    }),
  );
  const diagnoses = new Map(
    await Promise.all(
      canonicalResults.map(async (result) => {
        const question = byId.get(result.questionId)!;
        const correct = result.selectedIndex === question.correctIndex;
        return [
          result.questionId,
          await currentQuestionDiagnosis({
            questionId: question.id,
            questionContentVersion: question.contentVersion,
            canonicalChoiceIndex: correct
              ? undefined
              : result.selectedIndex,
          }),
        ] as const;
      }),
    ),
  );

  const attemptIdByQuestionId: Record<number, number> = {};
  const correctByQuestionId: Record<number, boolean> = {};

  await db.transaction(async (tx) => {
    for (const result of canonicalResults) {
      const question = byId.get(result.questionId);
      if (question == null) {
        throw new Error(`Question ${result.questionId} not found`);
      }
      const correct = result.selectedIndex === question.correctIndex;
      const diagnosis = diagnoses.get(question.id) ?? null;
      const trigger = remediationTrigger({
        correct,
        confidence: result.confidence,
        timeSeconds: result.timeSeconds,
        difficulty: question.difficulty,
        timeViolation: result.timeViolation,
        changedFromCorrect: changedFromCorrect.has(question.id),
        assisted: assistedSessionItemIds.has(
          sessionItemByQuestionId.get(question.id)?.id ?? -1,
        ),
      });
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
          errorConceptId: trigger ? diagnosis?.conceptId ?? null : null,
          misconceptionId: trigger ? diagnosis?.misconceptionId ?? null : null,
        })
        .returning()
        .get();
      attemptIdByQuestionId[question.id] = attempt.id;
      if (trigger && diagnosis) {
        await tx
          .insert(conceptRemediations)
          .values(
            remediationValues({
              attemptId: attempt.id,
              conceptId: diagnosis.conceptId,
              misconceptionId: diagnosis.misconceptionId,
              trigger,
              questionId: question.id,
            }),
          )
          .run();
      }
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
