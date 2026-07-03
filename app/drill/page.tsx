import { count, eq } from "drizzle-orm";
import { DrillClient } from "@/components/drill/drill-client";
import type { CountRow } from "@/components/drill/drill-setup";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DrillPage({
  searchParams,
}: {
  searchParams: Promise<{ qids?: string; plan?: string }>;
}) {
  const { qids, plan } = await searchParams;
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

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Drill</h1>
      <DrillClient
        rows={rows}
        autoStartIds={autoStartIds?.length ? autoStartIds : null}
      />
    </div>
  );
}
