import { count, desc } from "drizzle-orm";
import { SectionTabs } from "@/components/section-tabs";
import { PatternsClient, type CategoryStats } from "@/components/patterns/patterns-client";
import { db } from "@/lib/db";
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
  const ratings = new Map(
    (await db.select().from(eloRatings).all()).map((r) => [
      r.category,
      r.rating,
    ]),
  );
  const attemptCounts = new Map(
    (
      await db
        .select({ category: patternAttempts.category, n: count() })
        .from(patternAttempts)
        .groupBy(patternAttempts.category)
        .all()
    ).map((r) => [r.category, r.n]),
  );

  // Speed trend per category: last 20 answers vs the 20 before those.
  const msRows = await db
    .select({ category: patternAttempts.category, ms: patternAttempts.ms })
    .from(patternAttempts)
    .orderBy(desc(patternAttempts.id))
    .limit(8000)
    .all();
  const msByCategory = new Map<string, number[]>();
  for (const r of msRows) {
    const list = msByCategory.get(r.category) ?? [];
    if (list.length < 40) {
      list.push(r.ms);
      msByCategory.set(r.category, list);
    }
  }
  const avgMs = (list: number[] | undefined, from: number, to: number) => {
    const slice = (list ?? []).slice(from, to);
    if (slice.length < 8) return null;
    return slice.reduce((s, x) => s + x, 0) / slice.length;
  };

  const stats: CategoryStats[] = await Promise.all(
    PATTERN_CATEGORIES.map(async (c) => ({
      key: c.key,
      label: c.label,
      rating: Math.round(ratings.get(c.key) ?? ELO_START),
      attempts: attemptCounts.get(c.key) ?? 0,
      bestRound: await bestRoundScore(c.key),
      streak: await computeCategoryStreak(c.key),
      avgMsRecent: avgMs(msByCategory.get(c.key), 0, 20),
      avgMsPrior: avgMs(msByCategory.get(c.key), 20, 40),
    })),
  );

  return (
    <div className="space-y-4">
      <SectionTabs group="trainers" />
      <h1 className="font-display text-xl font-semibold">Pattern trainer</h1>
      <PatternsClient
        stats={stats}
        dayStreak={await computeDayStreak()}
        mixedBest={await bestRoundScore("mixed")}
        autoStart={autoStart}
      />
    </div>
  );
}
