"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { segmentByConceptId } from "../curriculum/v3/segments/index.ts";
import type {
  AnswerSpec,
  ConceptSegment,
  RetrievalCheck,
  SegmentExample,
} from "../curriculum/v3/segments/types.ts";
import {
  answerLabel,
  conceptContentVersionNumber,
  gradeConceptAnswer,
} from "./concept-answer.ts";
import { db } from "./db/index.ts";
import {
  assistanceEvents,
  conceptLearningAttempts,
  conceptRemediations,
} from "./db/schema.ts";

const requestSchema = z.object({
  conceptId: z.string().min(10).max(240),
  itemUid: z.string().min(10).max(260),
  itemKind: z.enum(["example", "check"]),
  itemContentVersion: z.string().min(5).max(40),
  originalAnswer: z.string().max(500).nullable(),
  originalMethod: z.string().max(240).nullable(),
  declaredUnknown: z.boolean(),
  correction: z.string().max(500).nullable(),
  highestHintLevel: z.number().int().min(0).max(4),
  timeSeconds: z.number().finite().min(0).max(14_400),
});

type ConceptItem = SegmentExample | RetrievalCheck;

function findCanonicalItem(
  segment: ConceptSegment,
  itemKind: "example" | "check",
  itemUid: string,
): ConceptItem | null {
  const items = itemKind === "example" ? segment.examples : segment.checks;
  return items.find((item) => item.id === itemUid) ?? null;
}

function solutionFor(item: ConceptItem): string {
  return "solutionMd" in item ? item.solutionMd : item.explanationMd;
}

function displayAnswer(item: ConceptItem): string {
  return "answerLabelMd" in item ? item.answerLabelMd : answerLabel(item.answer);
}

export type FinalizeConceptItemResult = {
  error: string | null;
  attemptId: number | null;
  initialCorrect: boolean;
  finalCorrect: boolean;
  answerLabelMd: string;
  solutionMd: string;
  remediationCreated: boolean;
};

export async function finalizeConceptItem(
  rawInput: z.input<typeof requestSchema>,
): Promise<FinalizeConceptItemResult> {
  const input = requestSchema.parse(rawInput);
  const segment = segmentByConceptId(input.conceptId);
  if (!segment || segment.contentVersion !== input.itemContentVersion) {
    return {
      error: "This concept changed while it was open. Reload before recording evidence.",
      attemptId: null,
      initialCorrect: false,
      finalCorrect: false,
      answerLabelMd: "",
      solutionMd: "",
      remediationCreated: false,
    };
  }
  const item = findCanonicalItem(segment, input.itemKind, input.itemUid);
  if (!item || !item.conceptIds.includes(input.conceptId)) {
    return {
      error: "That learning item is not part of this concept.",
      attemptId: null,
      initialCorrect: false,
      finalCorrect: false,
      answerLabelMd: "",
      solutionMd: "",
      remediationCreated: false,
    };
  }
  const original = input.originalAnswer?.trim() || null;
  const correction = input.correction?.trim() || null;
  if (!input.declaredUnknown && (!original || !input.originalMethod?.trim())) {
    return {
      error: "Commit both an answer and a method, or choose ‘I don’t know yet.’",
      attemptId: null,
      initialCorrect: false,
      finalCorrect: false,
      answerLabelMd: "",
      solutionMd: "",
      remediationCreated: false,
    };
  }

  const initialCorrect =
    !input.declaredUnknown && original != null
      ? gradeConceptAnswer(item.answer as AnswerSpec, original)
      : false;
  const finalAnswer = correction ?? original;
  const finalCorrect =
    finalAnswer != null
      ? gradeConceptAnswer(item.answer as AnswerSpec, finalAnswer)
      : false;
  const attemptUid = `learning.q86.${randomUUID()}`;
  let remediationCreated = false;

  const attempt = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(conceptLearningAttempts)
      .values({
        attemptUid,
        conceptId: input.conceptId,
        itemUid: item.id,
        itemContentVersion: conceptContentVersionNumber(segment.contentVersion),
        itemKind: input.itemKind,
        originalAnswer: original,
        originalMethod: input.originalMethod?.trim() || null,
        declaredUnknown: input.declaredUnknown,
        highestHintLevel: input.highestHintLevel,
        correction,
        finalAnswer,
        initialCorrect,
        finalCorrect,
        timeSeconds: input.timeSeconds,
      })
      .returning()
      .get();

    const events: Array<typeof assistanceEvents.$inferInsert> = Array.from(
      { length: input.highestHintLevel },
      (_, index) => ({
        eventUid: `assistance.q86.${randomUUID()}`,
        conceptId: input.conceptId,
        learningAttemptId: inserted.id,
        kind: "hint_opened" as const,
        hintLevel: index + 1,
        details: {
          itemUid: item.id,
          itemKind: input.itemKind,
          contentVersion: segment.contentVersion,
        },
      }),
    );
    events.push({
      eventUid: `assistance.q86.${randomUUID()}`,
      conceptId: input.conceptId,
      learningAttemptId: inserted.id,
      kind: "worked_solution_revealed" as const,
      hintLevel: null,
      details: {
        itemUid: item.id,
        itemKind: input.itemKind,
        contentVersion: segment.contentVersion,
      },
    });
    await tx.insert(assistanceEvents).values(events).run();

    if (!initialCorrect || input.highestHintLevel > 0) {
      remediationCreated = true;
      await tx
        .insert(conceptRemediations)
        .values({
          remediationUid: `remediation.q86.${randomUUID()}`,
          conceptId: input.conceptId,
          sourceLearningAttemptId: inserted.id,
          trigger: input.highestHintLevel > 0 ? "hinted" : "wrong",
          actionType: input.itemKind === "check" ? "retry_check" : "review_concept",
          actionTargetId: input.itemKind === "check" ? item.id : input.conceptId,
          priority: input.declaredUnknown || !finalCorrect ? 2 : 3,
          rationaleMd: input.declaredUnknown
            ? "No independent answer was committed; revisit the concept and retry unseen retrieval."
            : input.highestHintLevel > 0
              ? "The answer used assistance; retry later without hints before counting it as independent evidence."
              : "The initial answer missed; review the exact method and retry this capability.",
        })
        .run();
    }
    return inserted;
  });

  if (process.env.Q86_SKIP_REVALIDATE !== "1") {
    const { revalidatePath } = await import("next/cache");
    revalidatePath(
      `/learn/${segment.conceptId.split(".")[3]}/${segment.conceptId}`,
    );
    revalidatePath("/coverage");
    revalidatePath("/queue");
  }
  return {
    error: null,
    attemptId: attempt.id,
    initialCorrect,
    finalCorrect,
    answerLabelMd: displayAnswer(item),
    solutionMd: solutionFor(item),
    remediationCreated,
  };
}
