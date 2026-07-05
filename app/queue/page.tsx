import { and, desc, eq, gt, lte } from "drizzle-orm";
import { SectionTabs } from "@/components/section-tabs";
import { ExternalMissForm } from "@/components/queue/external-miss-form";
import { QueueClient, type DueRow, type LogRow } from "@/components/queue/queue-client";
import { db } from "@/lib/db";
import { attempts, questions, redoQueue } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const now = new Date();

  const dueRaw = await db
    .select({
      id: redoQueue.id,
      questionId: redoQueue.questionId,
      stage: redoQueue.stage,
      dueAt: redoQueue.dueAt,
      skill: questions.fundamentalSkill,
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      source: questions.source,
      stemMd: questions.stemMd,
    })
    .from(redoQueue)
    .innerJoin(questions, eq(redoQueue.questionId, questions.id))
    .where(and(eq(redoQueue.cleared, false), lte(redoQueue.dueAt, now)))
    .orderBy(redoQueue.dueAt)
    .all();
  const due: DueRow[] = dueRaw.map((r) => ({
    ...r,
    external: r.source === "external",
    // The stub's first stem line is "**Outside material** — <source>".
    sourceLabel:
      r.source === "external"
        ? (r.stemMd.split("\n")[0] ?? "").replace(/\*\*[^*]+\*\*\s*—\s*/, "")
        : null,
  }));

  const upcomingRaw = await db
    .select({
      id: redoQueue.id,
      questionId: redoQueue.questionId,
      stage: redoQueue.stage,
      dueAt: redoQueue.dueAt,
      skill: questions.fundamentalSkill,
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      source: questions.source,
      stemMd: questions.stemMd,
    })
    .from(redoQueue)
    .innerJoin(questions, eq(redoQueue.questionId, questions.id))
    .where(and(eq(redoQueue.cleared, false), gt(redoQueue.dueAt, now)))
    .orderBy(redoQueue.dueAt)
    .limit(30)
    .all();
  const upcoming: DueRow[] = upcomingRaw.map((r) => ({
    ...r,
    external: r.source === "external",
    sourceLabel:
      r.source === "external"
        ? (r.stemMd.split("\n")[0] ?? "").replace(/\*\*[^*]+\*\*\s*—\s*/, "")
        : null,
  }));

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

  return (
    <div className="space-y-4">
      <SectionTabs group="review" />
      <h1 className="font-display text-xl font-semibold">
        Redo queue &amp; error log
      </h1>
      <ExternalMissForm />
      <QueueClient
        due={due}
        upcoming={upcoming}
        log={log}
        autoStart={start === "1"}
      />
    </div>
  );
}
