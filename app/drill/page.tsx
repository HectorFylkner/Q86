import { count, eq } from "drizzle-orm";
import { DrillClient } from "@/components/drill/drill-client";
import type { CountRow } from "@/components/drill/drill-setup";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { buildCurriculumV3 } from "@/curriculum/v3/graph";
import { ALL_SUBTOPICS, type Subtopic } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DrillPage({
  searchParams,
}: {
  searchParams: Promise<{
    qids?: string;
    plan?: string;
    sub?: string;
    d?: string;
    n?: string;
    fmt?: string;
    test?: string;
    concept?: string;
    remediation?: string;
  }>;
}) {
  const { qids, plan, sub, d, n, fmt, test, concept, remediation } =
    await searchParams;
  let autoStartIds =
    qids
      ?.split(",")
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0) ?? null;

  // One-click launch of today's weighted drill block (F8).
  if (!autoStartIds?.length && plan === "1") {
    const { todaysPlan, selectPlanDrillIds } = await import("@/lib/plan-server");
    autoStartIds = await selectPlanDrillIds(await todaysPlan());
  }

  // Format drill deep link (the DS strategy chapter's "drill this now"):
  // /drill?fmt=data_sufficiency&n=8
  if (
    !autoStartIds?.length &&
    (fmt === "problem_solving" || fmt === "data_sufficiency")
  ) {
    const { selectQuestions } = await import("@/lib/engine");
    const requested = Number(n);
    const count =
      Number.isInteger(requested) && requested >= 1 && requested <= 21
        ? requested
        : 8;
    autoStartIds = (await selectQuestions({ formats: [fmt] }, count)).map(
      (q) => q.id,
    );
  }

  const rows = (await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      format: questions.format,
      count: count(),
    })
    .from(questions)
    .where(eq(questions.verified, true))
    .groupBy(questions.subtopic, questions.difficulty, questions.format)
    .all()) as CountRow[];

  // Subtopic deep links: /drill?sub=<subtopic>&d=<difficulty> pins a
  // mastery-ladder rung; /drill?sub=<subtopic>&n=<count> (no d) is a
  // coach prescription or reread follow-up across all difficulties.
  const rungDifficulty = Number(d);
  const prescribedCount = Number(n);
  const autoStartRung =
    sub && Number.isInteger(rungDifficulty) && rungDifficulty >= 2 && rungDifficulty <= 5
      ? { subtopic: sub, difficulty: rungDifficulty }
      : sub && ALL_SUBTOPICS.includes(sub as Subtopic) && !d
        ? {
            subtopic: sub,
            difficulty: null,
            count:
              Number.isInteger(prescribedCount) &&
              prescribedCount >= 1 &&
              prescribedCount <= 21
                ? prescribedCount
                : undefined,
          }
        : null;

  // Chapter-test deep link from a Learn chapter: /drill?test=<subtopic>
  const autoStartTest =
    test && ALL_SUBTOPICS.includes(test as Subtopic)
      ? (test as Subtopic)
      : null;
  const requestedConceptCount = Number(n);
  const conceptRecord = concept
    ? buildCurriculumV3().concepts.find((item) => item.id === concept)
    : null;
  const remediationId = Number(remediation);
  const autoStartConcept = conceptRecord
    ? {
        conceptId: conceptRecord.id,
        title: conceptRecord.title,
        count:
          Number.isInteger(requestedConceptCount) &&
          requestedConceptCount >= 1 &&
          requestedConceptCount <= 21
            ? requestedConceptCount
            : 6,
        remediationId:
          Number.isSafeInteger(remediationId) && remediationId > 0
            ? remediationId
            : undefined,
      }
    : null;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">
        {autoStartTest
          ? "Chapter test"
          : autoStartConcept
            ? `Concept practice · ${autoStartConcept.title}`
            : "Drill"}
      </h1>
      <DrillClient
        rows={rows}
        autoStartIds={autoStartIds?.length ? autoStartIds : null}
        autoStartRung={autoStartRung}
        autoStartTest={autoStartTest}
        autoStartConcept={autoStartConcept}
      />
    </div>
  );
}
