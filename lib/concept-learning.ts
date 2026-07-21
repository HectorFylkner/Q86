import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  conceptLearningAttempts,
  conceptRemediations,
} from "./db/schema.ts";

export type ConceptLearningEvidence = {
  attempts: number;
  independentInitialCorrect: number;
  hintedAttempts: number;
  declaredUnknown: number;
  openRemediations: number;
  latestAttemptAt: Date | null;
};

export async function conceptLearningEvidence(
  conceptId: string,
): Promise<ConceptLearningEvidence> {
  const attempts = await db
    .select()
    .from(conceptLearningAttempts)
    .where(eq(conceptLearningAttempts.conceptId, conceptId))
    .orderBy(desc(conceptLearningAttempts.createdAt))
    .all();
  const remediations = await db
    .select({ id: conceptRemediations.id })
    .from(conceptRemediations)
    .where(
      and(
        eq(conceptRemediations.conceptId, conceptId),
        eq(conceptRemediations.status, "open"),
      ),
    )
    .all();
  return {
    attempts: attempts.length,
    independentInitialCorrect: attempts.filter(
      (attempt) =>
        attempt.initialCorrect &&
        !attempt.declaredUnknown &&
        attempt.highestHintLevel === 0,
    ).length,
    hintedAttempts: attempts.filter((attempt) => attempt.highestHintLevel > 0).length,
    declaredUnknown: attempts.filter((attempt) => attempt.declaredUnknown).length,
    openRemediations: remediations.length,
    latestAttemptAt: attempts[0]?.createdAt ?? null,
  };
}
