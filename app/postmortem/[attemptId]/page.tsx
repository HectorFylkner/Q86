import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PostmortemClient } from "@/components/postmortem/postmortem-client";
import { db } from "@/lib/db";
import { attempts, questions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PostmortemPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const id = Number(attemptId);
  if (!Number.isInteger(id)) notFound();

  const attempt = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, id))
    .get();
  if (!attempt) notFound();
  const question = await db
    .select()
    .from(questions)
    .where(eq(questions.id, attempt.questionId))
    .get();
  if (!question) notFound();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">
        Whiteboard post-mortem
      </h1>
      <PostmortemClient attempt={attempt} question={question} />
    </div>
  );
}
