import { NextResponse } from "next/server";
import { recordUsage, refuseIfOverBudget } from "@/lib/ops/guard";
import { generateObject, type LanguageModelUsage } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { NotAuthenticatedError, requireScoped } from "@/lib/auth/session";
import { attempts, questions } from "@/lib/db/schema";
import { getModel, withRetry } from "@/lib/ai/model";
import { coachSystem, coachUser } from "@/lib/ai/prompts";
import { coachResponseSchema } from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

const requestSchema = z.object({
  attemptId: z.number().int(),
  images: z
    .array(z.string().regex(/^data:image\/(jpeg|png|webp);base64,/))
    .min(1)
    .max(3),
});

export async function POST(request: Request) {
  let sdb;
  try {
    ({ sdb } = await requireScoped());
  } catch (e) {
    if (e instanceof NotAuthenticatedError) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }
    throw e;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set. Add it to .env.local." },
      { status: 500 },
    );
  }

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid request: expected attemptId and 1–3 data-URL images." },
      { status: 400 },
    );
  }

  // Scoped: coaching someone else's attempt would disclose both their
  // answer and their scratch work.
  const attempt = await sdb.row(attempts, eq(attempts.id, body.attemptId));
  if (!attempt) {
    return NextResponse.json(
      { error: `Attempt ${body.attemptId} not found.` },
      { status: 404 },
    );
  }
  const question = await sdb.q
    .select()
    .from(questions)
    .where(eq(questions.id, attempt.questionId))
    .get();
  if (!question) {
    return NextResponse.json(
      { error: `Question ${attempt.questionId} not found.` },
      { status: 404 },
    );
  }

  // The scratch images are kept in the database (as data URLs) so the
  // record survives on hosts without a persistent filesystem.

  const trapForSelected =
    attempt.selectedIndex !== question.correctIndex
      ? (question.trapMap?.[String(attempt.selectedIndex)] ?? null)
      : null;

  // Rate and cost guard before the call, never after: the point is to
  // avoid spending, not to record having spent.
  const refusal = await refuseIfOverBudget(sdb.userId, "coach");
  if (refusal) return refusal;

  let coach;
  let usage: LanguageModelUsage | undefined;
  try {
    const { object, usage: reported } = await withRetry(async () =>
      generateObject({
        model: await getModel(),
        temperature: 0.2,
        schema: coachResponseSchema,
        system: coachSystem(),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: coachUser({
                  stemMd: question.stemMd,
                  choices: question.choices,
                  correctIndex: question.correctIndex,
                  selectedIndex: attempt.selectedIndex,
                  timeSeconds: attempt.timeSeconds,
                  confidence: attempt.confidence,
                  subtopic: question.subtopic,
                  trapForSelected,
                  imageCount: body.images.length,
                }),
              },
              ...body.images.map((image) => ({
                type: "image" as const,
                image,
              })),
            ],
          },
        ],
      }),
    );
    coach = object;
    usage = reported;
    await recordUsage(sdb.userId, "coach", usage, true);
  } catch (e) {
    // A failed call still reached the provider and was still billed, so
    // it is still metered — a meter that only counted successes would
    // under-report exactly when something is going wrong.
    await recordUsage(sdb.userId, "coach", usage, false);
    const message = e instanceof Error ? e.message : "The coach call failed.";
    return NextResponse.json(
      { error: `Post-mortem failed after retries: ${message}` },
      { status: 502 },
    );
  }

  const feedbackMd = [
    `**Divergence point**\n\n${coach.divergence_point_md}`,
    `**Diagnosis**\n\n${coach.diagnosis_md}`,
    `**Fastest path**\n\n${coach.fastest_path_md}`,
    `**Trigger cue**\n\n${coach.trigger_cue_md}`,
    `**Takeaway**\n\n${coach.takeaway_15_words}`,
  ].join("\n\n");

  await sdb.update(
    attempts,
    {
      scratchImagePath: JSON.stringify(body.images),
      aiFeedbackMd: feedbackMd,
    },
    eq(attempts.id, attempt.id),
  );

  return NextResponse.json({ coach });
}
