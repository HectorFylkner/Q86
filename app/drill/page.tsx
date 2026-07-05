import { count, eq } from "drizzle-orm";
import { DrillClient } from "@/components/drill/drill-client";
import type { CountRow } from "@/components/drill/drill-setup";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import {
  CHAPTER_TIERS,
  type ChapterTier,
} from "@/lib/chapter-test-config";
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
    test?: string;
    tier?: string;
  }>;
}) {
  const { qids, plan, sub, d, n, test, tier } = await searchParams;
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

  // Mastery-ladder deep link: /drill?sub=<subtopic>&d=<difficulty>.
  // Coach prescriptions arrive without a rung: /drill?sub=<subtopic>&n=<count>.
  const rungDifficulty = Number(d);
  const prescribedCount = Number(n);
  const autoStartRung =
    sub && ALL_SUBTOPICS.includes(sub as Subtopic)
      ? Number.isInteger(rungDifficulty) &&
        rungDifficulty >= 2 &&
        rungDifficulty <= 5
        ? { subtopic: sub, difficulty: rungDifficulty, count: 6 }
        : Number.isInteger(prescribedCount) &&
            prescribedCount >= 1 &&
            prescribedCount <= 20
          ? { subtopic: sub, difficulty: null, count: prescribedCount }
          : null
      : null;

  // Chapter-test deep link from a Learn chapter: /drill?test=<subtopic>
  // with an optional &tier=; without one, the next unpassed tier (or the
  // highest passed tier, for re-certification) is chosen here.
  let autoStartTest: { subtopic: Subtopic; tier: ChapterTier } | null = null;
  if (test && ALL_SUBTOPICS.includes(test as Subtopic)) {
    const subtopic = test as Subtopic;
    if (CHAPTER_TIERS.includes(tier as ChapterTier)) {
      autoStartTest = { subtopic, tier: tier as ChapterTier };
    } else {
      const { chapterTestStates } = await import("@/lib/chapter-tests");
      const state = (await chapterTestStates())[subtopic];
      autoStartTest = { subtopic, tier: state?.next ?? "easy" };
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">
        {autoStartTest ? "Chapter test" : "Drill"}
      </h1>
      <DrillClient
        rows={rows}
        autoStartIds={autoStartIds?.length ? autoStartIds : null}
        autoStartRung={autoStartRung}
        autoStartTest={autoStartTest}
      />
    </div>
  );
}
