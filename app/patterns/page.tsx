import { count } from "drizzle-orm";
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
    db
      .select()
      .from(eloRatings)
      .all()
      .map((r) => [r.category, r.rating]),
  );
  const attemptCounts = new Map(
    db
      .select({ category: patternAttempts.category, n: count() })
      .from(patternAttempts)
      .groupBy(patternAttempts.category)
      .all()
      .map((r) => [r.category, r.n]),
  );

  const stats: CategoryStats[] = PATTERN_CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    rating: Math.round(ratings.get(c.key) ?? ELO_START),
    attempts: attemptCounts.get(c.key) ?? 0,
    bestRound: bestRoundScore(c.key),
    streak: computeCategoryStreak(c.key),
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Pattern trainer</h1>
      <PatternsClient
        stats={stats}
        dayStreak={computeDayStreak()}
        mixedBest={bestRoundScore("mixed")}
        autoStart={autoStart}
      />
    </div>
  );
}
