import { count, eq } from "drizzle-orm";
import { DrillClient } from "@/components/drill/drill-client";
import type { CountRow } from "@/components/drill/drill-setup";
import {
  CHAPTER_TIERS,
  TIER_SPEC,
  type ChapterTier,
} from "@/lib/chapter-test-config";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import {
  STRATEGY_DRILL_SIZE,
  STRATEGY_LABELS,
  isSolutionStrategy,
} from "@/lib/solution-strategy";
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
    test?: string;
    tier?: string;
    strat?: string;
  }>;
}) {
  const { qids, plan, sub, d, test, tier, strat } = await searchParams;
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

  // Technique deep link from a Learn technique chapter:
  // /drill?strat=<strategy> — every bank item whose fastest path is that
  // technique, hardest last, so the set drills the approach across
  // subtopics rather than one subtopic across approaches.
  const strategy =
    !autoStartIds?.length && strat && isSolutionStrategy(strat) ? strat : null;
  if (strategy) {
    const { strategyDrillIds } = await import("@/lib/strategy-server");
    autoStartIds = await strategyDrillIds(strategy, STRATEGY_DRILL_SIZE);
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

  // Mastery-ladder deep link: /drill?sub=<subtopic>&d=<difficulty>
  const rungDifficulty = Number(d);
  const autoStartRung =
    sub && Number.isInteger(rungDifficulty) && rungDifficulty >= 2 && rungDifficulty <= 5
      ? { subtopic: sub, difficulty: rungDifficulty }
      : null;

  // Chapter-test deep link from a Learn chapter:
  // /drill?test=<subtopic>&tier=<foundation|exam|top_band>
  const autoStartTest =
    test && ALL_SUBTOPICS.includes(test as Subtopic)
      ? (test as Subtopic)
      : null;
  const autoStartTier: ChapterTier =
    tier && (CHAPTER_TIERS as readonly string[]).includes(tier)
      ? (tier as ChapterTier)
      : "foundation";

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">
        {autoStartTest
          ? `Chapter test · ${TIER_SPEC[autoStartTier].label}`
          : strategy
            ? `Technique drill · ${STRATEGY_LABELS[strategy]}`
            : "Drill"}
      </h1>
      <DrillClient
        rows={rows}
        autoStartIds={autoStartIds?.length ? autoStartIds : null}
        autoStartRung={autoStartRung}
        autoStartTest={autoStartTest}
        autoStartTier={autoStartTier}
      />
    </div>
  );
}
