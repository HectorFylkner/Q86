import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import {
  createVerifiedQuestion,
  type PipelineResult,
} from "@/lib/ai/pipeline";
import type { GenerationSpec } from "@/lib/ai/prompts";
import {
  ALL_SUBTOPICS,
  CONTEXTS,
  FORMATS,
  FUNDAMENTAL_SKILLS,
  SKILL_BY_SUBTOPIC,
  SUBTOPICS_BY_SKILL,
  type Context,
  type QuestionFormat,
  type Subtopic,
} from "@/lib/taxonomy";

export const runtime = "nodejs";
// Vercel Hobby (fluid compute) caps at 300s; a 10-question batch fits.
export const maxDuration = 300;

const requestSchema = z.object({
  count: z.number().int().min(1).max(15).optional(),
  skill: z.enum(FUNDAMENTAL_SKILLS).optional(),
  subtopics: z
    .array(z.enum(ALL_SUBTOPICS as [Subtopic, ...Subtopic[]]))
    .min(1)
    .optional(),
  difficultyMin: z.number().int().min(1).max(5).default(2),
  difficultyMax: z.number().int().min(1).max(5).default(5),
  format: z.enum(FORMATS).optional(),
  context: z.enum(CONTEXTS).optional(),
  twinOf: z.number().int().optional(),
});

/** Global difficulty mix ≈ 10% D2 / 30% D3 / 40% D4 / 20% D5, restricted
 *  to the requested range. */
const DIFFICULTY_WEIGHTS: Record<number, number> = {
  1: 5,
  2: 10,
  3: 30,
  4: 40,
  5: 20,
};

function sampleDifficulty(min: number, max: number): number {
  const allowed = [1, 2, 3, 4, 5].filter((d) => d >= min && d <= max);
  const total = allowed.reduce((s, d) => s + DIFFICULTY_WEIGHTS[d], 0);
  let r = Math.random() * total;
  for (const d of allowed) {
    r -= DIFFICULTY_WEIGHTS[d];
    if (r <= 0) return d;
  }
  return allowed[allowed.length - 1] ?? 3;
}

function buildSpecs(
  req: z.infer<typeof requestSchema>,
  count: number,
): GenerationSpec[] {
  const specs: GenerationSpec[] = [];
  for (let i = 0; i < count; i++) {
    let subtopic: Subtopic;
    if (req.subtopics?.length) {
      subtopic = req.subtopics[i % req.subtopics.length];
    } else if (req.skill) {
      const pool = SUBTOPICS_BY_SKILL[req.skill];
      subtopic = pool[Math.floor(Math.random() * pool.length)];
    } else {
      subtopic = ALL_SUBTOPICS[Math.floor(Math.random() * ALL_SUBTOPICS.length)];
    }
    const skill = SKILL_BY_SUBTOPIC[subtopic];
    const dsEligible =
      skill === "value_order_factors" || skill === "equal_unequal_alg";
    const format: QuestionFormat =
      req.format ??
      (dsEligible && Math.random() < 0.25
        ? "data_sufficiency"
        : "problem_solving");
    const context: Context =
      req.context ?? (Math.random() < 0.5 ? "pure" : "real");
    specs.push({
      skill,
      subtopic,
      difficulty: sampleDifficulty(req.difficultyMin, req.difficultyMax),
      format,
      context,
    });
  }
  return specs;
}

async function runPool<T>(
  items: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await items[i]();
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );
  return results;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set. Add it to .env.local." },
      { status: 500 },
    );
  }

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch (e) {
    return NextResponse.json(
      {
        error: `Invalid request: ${e instanceof z.ZodError ? e.issues.map((i) => i.message).join("; ") : "malformed JSON"}`,
      },
      { status: 400 },
    );
  }

  let specs: GenerationSpec[];
  let source: "generated" | "twin" = "generated";
  let twinOf: number | undefined;

  if (body.twinOf != null) {
    const sourceQuestion = await db
      .select()
      .from(questions)
      .where(eq(questions.id, body.twinOf))
      .get();
    if (!sourceQuestion) {
      return NextResponse.json(
        { error: `Question ${body.twinOf} not found.` },
        { status: 404 },
      );
    }
    source = "twin";
    twinOf = body.twinOf;
    const flipped: Context = sourceQuestion.context === "pure" ? "real" : "pure";
    specs = Array.from({ length: body.count ?? 1 }, () => ({
      skill: sourceQuestion.fundamentalSkill,
      subtopic: sourceQuestion.subtopic,
      difficulty: sourceQuestion.difficulty,
      format: sourceQuestion.format,
      context: body.context ?? flipped,
    }));
  } else {
    specs = buildSpecs(body, body.count ?? 10);
  }

  // Isolate item failures: one thrown pipeline task must not abort the
  // batch while sibling workers keep inserting.
  const results: PipelineResult[] = await runPool(
    specs.map((spec) => async (): Promise<PipelineResult> => {
      try {
        return await createVerifiedQuestion(spec, { source, twinOf });
      } catch (e) {
        return {
          ok: false,
          attemptsUsed: 0,
          failures: [
            `API error after retries: ${e instanceof Error ? e.message : String(e)}`,
          ],
        };
      }
    }),
    3,
  );

  const verified = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  if (
    verified.length === 0 &&
    failed.length > 0 &&
    failed.every((r) => !r.ok && r.failures[0]?.startsWith("API error"))
  ) {
    return NextResponse.json(
      { error: `Generation failed: ${(failed[0] as { failures: string[] }).failures[0]}` },
      { status: 502 },
    );
  }
  const response = {
    requested: specs.length,
    verified: verified.length,
    failed: failed.length,
    questionIds: verified.map((r) => (r.ok ? r.question.id : -1)),
    failures: failed.flatMap((r) => (r.ok ? [] : r.failures)),
  };
  console.log(
    `[generate] verified ${response.verified}/${response.requested}` +
      (response.failed > 0 ? ` (${response.failed} discarded)` : ""),
  );
  return NextResponse.json(response);
}
