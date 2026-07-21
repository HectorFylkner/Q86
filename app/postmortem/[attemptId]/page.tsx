import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PostmortemClient } from "@/components/postmortem/postmortem-client";
import { db } from "@/lib/db";
import { attempts, questions, sessions } from "@/lib/db/schema";
import {
  displayIndexForQuestion,
  parsePersistedQuestionChoiceRoster,
  questionInDisplayOrder,
} from "@/lib/question-choice-order";
import { SESSION_CHOICE_ROSTER_KEY } from "@/lib/question-session";

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

  // Attempts and edits remain canonical in the ledger. For a current session
  // roster, reconstruct the exact presentation the learner originally saw.
  // Legacy sessions (or content revised since the attempt) remain readable in
  // canonical order instead of guessing at a permutation.
  let presentedAttempt = attempt;
  let presentedQuestion = question;
  if (attempt.sessionId != null) {
    const attemptSession = await db
      .select({ config: sessions.config })
      .from(sessions)
      .where(eq(sessions.id, attempt.sessionId))
      .get();
    const choiceOrderRoster = parsePersistedQuestionChoiceRoster(
      attemptSession?.config[SESSION_CHOICE_ROSTER_KEY],
    );
    if (choiceOrderRoster != null) {
      try {
        presentedAttempt = {
          ...attempt,
          selectedIndex: displayIndexForQuestion(
            attempt.selectedIndex,
            question,
            choiceOrderRoster,
          ),
        };
        presentedQuestion = questionInDisplayOrder(
          question,
          choiceOrderRoster,
        );
      } catch {
        // Revised content cannot safely reuse an older permutation.
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">
        Whiteboard post-mortem
      </h1>
      <PostmortemClient
        attempt={presentedAttempt}
        question={presentedQuestion}
      />
    </div>
  );
}
