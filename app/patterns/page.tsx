import { count } from "drizzle-orm";
import { SectionTabs } from "@/components/section-tabs";
import { PatternsClient, type CategoryStats } from "@/components/patterns/patterns-client";
import { requireFeature } from "@/lib/billing/entitlements";
import { eloRatings, patternAttempts } from "@/lib/db/schema";
import { ELO_START } from "@/lib/elo";
import { PATTERN_CATEGORIES } from "@/lib/generators";
import {
  bestRoundScore,
  computeCategoryStreak,
  computeDayStreak,
} from "@/lib/pattern-stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PatternsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const autoStart = PATTERN_CATEGORIES.some((c) => c.key === start)
    ? (start as (typeof PATTERN_CATEGORIES)[number]["key"])
    : start === "mixed"
      ? ("mixed" as const)
      : null;
  const { sdb } = await requireFeature("patterns");
  const ratings = new Map(
    (await sdb.rows(eloRatings)).map((r) => [r.category, r.rating]),
  );
  const attemptCounts = new Map(
    (
      await sdb.q
        .select({ category: patternAttempts.category, n: count() })
        .from(patternAttempts)
        .where(sdb.own(patternAttempts))
        .groupBy(patternAttempts.category)
        .all()
    ).map((r) => [r.category, r.n]),
  );

  const stats: CategoryStats[] = await Promise.all(
    PATTERN_CATEGORIES.map(async (c) => ({
      key: c.key,
      label: c.label,
      rating: Math.round(ratings.get(c.key) ?? ELO_START),
      attempts: attemptCounts.get(c.key) ?? 0,
      bestRound: await bestRoundScore(sdb, c.key),
      streak: await computeCategoryStreak(sdb, c.key),
    })),
  );

  return (
    <div className="space-y-4">
      <SectionTabs group="trainers" />
      <h1 className="font-display text-xl font-semibold">Pattern trainer</h1>
      <PatternsClient
        stats={stats}
        dayStreak={await computeDayStreak(sdb)}
        mixedBest={await bestRoundScore(sdb, "mixed")}
        autoStart={autoStart}
      />
    </div>
  );
}
