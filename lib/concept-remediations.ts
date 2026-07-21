import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  conceptRemediations,
  questions,
  sessionItems,
} from "./db/schema.ts";

export const CONCEPT_REMEDIATION_CONFIG_KEY =
  "conceptRemediation" as const;

export type BoundConceptRemediation = {
  id: number;
  remediationUid: string;
  conceptId: string;
};

export function parseBoundConceptRemediation(
  config: Record<string, unknown>,
): BoundConceptRemediation | null {
  const value = config[CONCEPT_REMEDIATION_CONFIG_KEY];
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as Record<string, unknown>;
  return Number.isSafeInteger(candidate.id) &&
    Number(candidate.id) > 0 &&
    typeof candidate.remediationUid === "string" &&
    candidate.remediationUid.startsWith("remediation.q86.") &&
    typeof candidate.conceptId === "string" &&
    candidate.conceptId.startsWith("c.q86.")
    ? {
        id: Number(candidate.id),
        remediationUid: candidate.remediationUid,
        conceptId: candidate.conceptId,
      }
    : null;
}

export async function openConceptRemediation(
  remediationId: number,
  conceptId: string,
) {
  if (!Number.isSafeInteger(remediationId) || remediationId <= 0) return null;
  return (
    (await db
      .select()
      .from(conceptRemediations)
      .where(
        and(
          eq(conceptRemediations.id, remediationId),
          eq(conceptRemediations.conceptId, conceptId),
          inArray(conceptRemediations.status, ["open", "in_progress"]),
        ),
      )
      .get()) ?? null
  );
}

/**
 * Treat a question as exposed as soon as it enters any immutable roster, even
 * if the learner never answered it. This is deliberately stricter than attempt
 * history and prevents an abandoned session from manufacturing "unseen" work.
 */
export async function exposedVariantFamilyIds(input?: {
  excludeSessionId?: number;
  excludeAttemptId?: number;
}): Promise<number[]> {
  const rosterRows = await db
    .select({
      sessionId: sessionItems.sessionId,
      questionId: questions.id,
      twinOf: questions.twinOf,
    })
    .from(sessionItems)
    .innerJoin(questions, eq(sessionItems.questionId, questions.id))
    .all();
  const attemptRows = await db
    .select({
      attemptId: attempts.id,
      sessionId: attempts.sessionId,
      questionId: questions.id,
      twinOf: questions.twinOf,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .all();
  return [
    ...new Set([
      ...rosterRows
        .filter((row) => row.sessionId !== input?.excludeSessionId)
        .map((row) => row.twinOf ?? row.questionId),
      ...attemptRows
        .filter(
          (row) =>
            row.attemptId !== input?.excludeAttemptId &&
            row.sessionId !== input?.excludeSessionId,
        )
        .map((row) => row.twinOf ?? row.questionId),
    ]),
  ];
}

export function remediationCanResolveFromFreshQuestion(
  remediation: typeof conceptRemediations.$inferSelect,
): boolean {
  if (
    remediation.trigger === "manual" ||
    remediation.trigger === "retention_slip" ||
    remediation.trigger === "stale"
  ) {
    return false;
  }
  return [
    "review_concept",
    "review_misconception",
    "retry_check",
    "targeted_practice",
  ].includes(remediation.actionType);
}
