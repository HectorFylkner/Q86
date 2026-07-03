import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel, withRetry } from "@/lib/ai/model";
import { reportParserSystem, reportParserUser } from "@/lib/ai/prompts";
import { parsedReportSchema } from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  rawText: z.string().min(40).max(100_000),
});

/** Parses only — saving happens after the user confirms the parsed result. */
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
      { error: "Paste at least a few lines of score-report text." },
      { status: 400 },
    );
  }

  try {
    const { object } = await withRetry(async () =>
      generateObject({
        model: await getModel(),
        temperature: 0,
        schema: parsedReportSchema,
        system: reportParserSystem(),
        prompt: reportParserUser(body.rawText),
      }),
    );
    return NextResponse.json({ parsed: object });
  } catch (e) {
    const message = e instanceof Error ? e.message : "The parser call failed.";
    return NextResponse.json(
      { error: `Report parsing failed after retries: ${message}` },
      { status: 502 },
    );
  }
}
