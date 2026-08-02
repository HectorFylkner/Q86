import { and, count, desc, eq, gt, lte } from "drizzle-orm";
import { SectionTabs } from "@/components/section-tabs";
import { QueueClient, type DueRow, type LogRow } from "@/components/queue/queue-client";
import { db } from "@/lib/db";
import { attempts, questions, redoQueue } from "@/lib/db/schema";

/** A redo is "overdue" once a full day past its due date — the same
 *  day-grain the +2/+7/+21 schedule is written in. */
const DAY_MS = 86_400_000;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const now = new Date();

  const due = (await db
    .select({
      id: redoQueue.id,
      questionId: redoQueue.questionId,
      stage: redoQueue.stage,
      dueAt: redoQueue.dueAt,
      skill: questions.fundamentalSkill,
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
    })
    .from(redoQueue)
    .innerJoin(questions, eq(redoQueue.questionId, questions.id))
    .where(and(eq(redoQueue.cleared, false), lte(redoQueue.dueAt, now)))
    .orderBy(redoQueue.dueAt)
    .all()) as DueRow[];

  const upcoming = (await db
    .select({
      id: redoQueue.id,
      questionId: redoQueue.questionId,
      stage: redoQueue.stage,
      dueAt: redoQueue.dueAt,
      skill: questions.fundamentalSkill,
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
    })
    .from(redoQueue)
    .innerJoin(questions, eq(redoQueue.questionId, questions.id))
    .where(and(eq(redoQueue.cleared, false), gt(redoQueue.dueAt, now)))
    .orderBy(redoQueue.dueAt)
    .limit(30)
    .all()) as DueRow[];

  const log = (await db
    .select({
      id: attempts.id,
      createdAt: attempts.createdAt,
      mode: attempts.mode,
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
      confidence: attempts.confidence,
      errorType: attempts.errorType,
      errorSubtag: attempts.errorSubtag,
      userNotes: attempts.userNotes,
      skill: questions.fundamentalSkill,
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      format: questions.format,
      context: questions.context,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .orderBy(desc(attempts.id))
    .limit(500)
    .all()) as LogRow[];

  // Compliance belongs here rather than on the report: this is the page
  // that can act on it. It used to be duplicated on /analytics, which
  // could only tell you the number.
  const cleared =
    (
      await db
        .select({ n: count() })
        .from(redoQueue)
        .where(eq(redoQueue.cleared, true))
        .get()
    )?.n ?? 0;
  const overdue = due.filter((r) => r.dueAt.getTime() < now.getTime() - DAY_MS)
    .length;

  return (
    <div className="space-y-4">
      <SectionTabs group="review" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">
          Redo queue &amp; error log
        </h1>
        <p className="font-mono text-[11px] text-graphite">
          {due.length} due ·{" "}
          <span className={overdue > 0 ? "text-amber" : undefined}>
            {overdue} overdue
          </span>{" "}
          · {cleared} cleared by cold solve
        </p>
      </div>
      <QueueClient
        due={due}
        upcoming={upcoming}
        log={log}
        autoStart={start === "1"}
      />
    </div>
  );
}
