import { generateObject, type LanguageModel } from "ai";
import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { questions, type Question } from "../db/schema.ts";
import { DS_CHOICES, type QuestionSource } from "../taxonomy.ts";
import { getModel, withRetry } from "./model.ts";
import {
  generatorSystem,
  generatorUser,
  twinGeneratorUser,
  type GenerationSpec,
} from "./prompts.ts";
import { generatedQuestionSchema, type GeneratedQuestion } from "./schemas.ts";
import { evaluateExpression, verifyCandidate } from "./verify.ts";

const GENERATOR_TEMPERATURE = 0.7;
/** §8.2: mismatch → regenerate (max 2 retries), else discard. */
const MAX_GENERATION_ATTEMPTS = 3;

export type PipelineSuccess = {
  ok: true;
  question: Question;
  attemptsUsed: number;
};
export type PipelineFailure = {
  ok: false;
  attemptsUsed: number;
  failures: string[];
};
export type PipelineResult = PipelineSuccess | PipelineFailure;

/** Structural checks before we spend a verification call. */
function postProcess(
  raw: GeneratedQuestion,
  spec: GenerationSpec,
): { candidate: GeneratedQuestion; trapMap: Record<string, string> } | string {
  const candidate = { ...raw };

  if (spec.format === "data_sufficiency") {
    // The five canonical DS choices are fixed by convention; normalize to
    // our exact rendering so every DS question is uniform.
    candidate.choices = [...DS_CHOICES];
    candidate.numeric_check = null;
  }

  const trapMap: Record<string, string> = {};
  for (const trap of candidate.traps) {
    if (trap.choice_index === candidate.correct_index) continue;
    trapMap[String(trap.choice_index)] = trap.mistake;
  }
  const wrongIndexes = [0, 1, 2, 3, 4].filter(
    (i) => i !== candidate.correct_index,
  );
  const missing = wrongIndexes.filter((i) => !trapMap[String(i)]);
  if (missing.length > 0) {
    return `trap_map missing entries for wrong choice indexes ${missing.join(", ")}`;
  }

  if (candidate.numeric_check) {
    const value = evaluateExpression(candidate.numeric_check);
    if (value == null) {
      return `numeric_check "${candidate.numeric_check}" is not evaluable by mathjs`;
    }
  }

  return { candidate, trapMap };
}

/**
 * §8.1 + §8.2: generate one question, verify it independently, and insert
 * it with verified = true. Verification failures regenerate up to 2 times,
 * then the question is discarded and the failure reasons returned.
 * API-level errors (after §8.4 retries) throw.
 */
export async function createVerifiedQuestion(
  spec: GenerationSpec,
  opts: {
    source: QuestionSource;
    twinOf?: number;
  },
  model?: LanguageModel,
): Promise<PipelineResult> {
  const failures: string[] = [];

  let twinSource: Question | null = null;
  if (opts.twinOf != null) {
    twinSource =
      db.select().from(questions).where(eq(questions.id, opts.twinOf)).get() ??
      null;
    if (!twinSource) {
      return {
        ok: false,
        attemptsUsed: 0,
        failures: [`twin source question ${opts.twinOf} not found`],
      };
    }
  }

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const prompt = twinSource
      ? twinGeneratorUser(spec, {
          stemMd: twinSource.stemMd,
          solutionMd: twinSource.solutionMd,
          context: twinSource.context,
        })
      : generatorUser(spec);

    const { object: raw } = await withRetry(() =>
      generateObject({
        model: model ?? getModel(),
        temperature: GENERATOR_TEMPERATURE,
        schema: generatedQuestionSchema,
        system: generatorSystem(),
        prompt,
      }),
    );

    const processed = postProcess(raw, spec);
    if (typeof processed === "string") {
      failures.push(`attempt ${attempt}: ${processed}`);
      continue;
    }
    const { candidate, trapMap } = processed;

    const verification = await verifyCandidate(
      {
        stem_md: candidate.stem_md,
        choices: candidate.choices,
        correct_index: candidate.correct_index,
        numeric_check: candidate.numeric_check,
      },
      model,
    );

    if (!verification.passed) {
      failures.push(`attempt ${attempt}: ${verification.detail}`);
      continue;
    }

    const question = db
      .insert(questions)
      .values({
        source: opts.source,
        format: spec.format,
        contentDomain: candidate.content_domain,
        context: spec.context,
        fundamentalSkill: spec.skill,
        subtopic: spec.subtopic,
        difficulty: spec.difficulty,
        stemMd: candidate.stem_md,
        choices: candidate.choices,
        correctIndex: candidate.correct_index,
        solutionMd: candidate.solution_md,
        fastestPathMd: candidate.fastest_path_md,
        trapMap,
        numericCheck: candidate.numeric_check,
        verified: true,
        twinOf: opts.twinOf ?? null,
      })
      .returning()
      .get();

    return { ok: true, question, attemptsUsed: attempt };
  }

  return {
    ok: false,
    attemptsUsed: MAX_GENERATION_ATTEMPTS,
    failures,
  };
}
