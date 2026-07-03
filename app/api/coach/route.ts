import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
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

  const attempt = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, body.attemptId))
    .get();
  if (!attempt) {
    return NextResponse.json(
      { error: `Attempt ${body.attemptId} not found.` },
      { status: 404 },
    );
  }
  const question = await db
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

  let coach;
  try {
    const { object } = await withRetry(async () =>
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
  } catch (e) {
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

  await db
    .update(attempts)
    .set({
      scratchImagePath: JSON.stringify(body.images),
      aiFeedbackMd: feedbackMd,
    })
    .where(eq(attempts.id, attempt.id))
    .run();

  return NextResponse.json({ coach });
}
