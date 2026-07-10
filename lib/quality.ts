import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db/index.ts";
import { questions, type Question } from "./db/schema.ts";
import { userRetiredIds } from "./db/seed-bank.ts";

const MODEL_QUESTION_SOURCES: Array<"generated" | "twin"> = [
  "generated",
  "twin",
];

const approvalSchema = z.object({
  questionId: z.number().int().positive(),
  attestations: z.object({
    solvedIndependently: z.literal(true),
    singleCorrectAnswer: z.literal(true),
    explanationAndTrapsChecked: z.literal(true),
  }),
});

export type QuestionApprovalInput = {
  questionId: number;
  attestations: {
    solvedIndependently: boolean;
    singleCorrectAnswer: boolean;
    explanationAndTrapsChecked: boolean;
  };
};

export type QuestionApprovalResult =
  | { ok: true; questionId: number }
  | { ok: false; error: string };

function isModelSource(source: string): source is "generated" | "twin" {
  return source === "generated" || source === "twin";
}

/** Model-checked candidates awaiting a human decision, newest first. */
export async function quarantinedQuestionCandidates(): Promise<Question[]> {
  const [rows, retiredIds] = await Promise.all([
    db
      .select()
      .from(questions)
      .where(
        and(
          eq(questions.verified, false),
          inArray(questions.source, MODEL_QUESTION_SOURCES),
        ),
      )
      .orderBy(desc(questions.createdAt))
      .all(),
    userRetiredIds(),
  ]);
  return rows.filter((question) => !retiredIds.has(question.id));
}

/**
 * Promote exactly one quarantined model candidate after all human checks.
 * Seed rows, already-approved rows, and any user-retired row fail closed.
 */
export async function approveModelCheckedCandidate(
  input: QuestionApprovalInput,
): Promise<QuestionApprovalResult> {
  const parsed = approvalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Complete all three review attestations before approval.",
    };
  }

  const candidate = await db
    .select({
      id: questions.id,
      source: questions.source,
      verified: questions.verified,
    })
    .from(questions)
    .where(eq(questions.id, parsed.data.questionId))
    .get();

  if (!candidate) return { ok: false, error: "Candidate not found." };
  if (!isModelSource(candidate.source)) {
    return {
      ok: false,
      error: "Only generated or twin candidates can be approved here.",
    };
  }
  if (candidate.verified) {
    return { ok: false, error: "This question is already approved." };
  }
  if ((await userRetiredIds()).has(candidate.id)) {
    return {
      ok: false,
      error: "This question was retired and cannot be re-approved.",
    };
  }

  const promoted = await db
    .update(questions)
    .set({ verified: true })
    .where(
      and(
        eq(questions.id, candidate.id),
        eq(questions.verified, false),
        inArray(questions.source, MODEL_QUESTION_SOURCES),
      ),
    )
    .returning({ id: questions.id })
    .get();

  if (!promoted) {
    return {
      ok: false,
      error: "The candidate changed while it was being reviewed. Reload and retry.",
    };
  }
  return { ok: true, questionId: promoted.id };
}
