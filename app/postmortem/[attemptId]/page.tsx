import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PostmortemClient } from "@/components/postmortem/postmortem-client";
import { requireScoped } from "@/lib/auth/session";
import { attempts, questions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PostmortemPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { user, sdb } = await requireScoped();
  const { attemptId } = await params;
  const id = Number(attemptId);
  if (!Number.isInteger(id)) notFound();

  // Scoped read: another account's attempt id is indistinguishable from an
  // attempt that does not exist.
  const attempt = await sdb.row(attempts, eq(attempts.id, id));
  if (!attempt) notFound();

  const question = await sdb.q
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
      <PostmortemClient
        attempt={attempt}
        question={question}
        canGenerate={user.role === "admin"}
      />
    </div>
  );
}
