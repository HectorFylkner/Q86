/**
 * Q86 seed script — installs the committed 360-question trusted bank.
 *
 * The default path is offline and idempotent. `--api` is intentionally
 * disabled: model cross-solves once admitted defective questions to the bank,
 * so API-generated candidates now enter the app's Question QA quarantine
 * instead of participating in seed completion.
 *
 * Usage: pnpm seed          Load scripts/seed-bank.json
 *        pnpm seed --plan   Print the historical target distribution
 *        pnpm seed --api    Exit safely with migration guidance
 */

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist; database configuration may come from the host.
}

import { SKILL_BY_SUBTOPIC } from "../lib/taxonomy.ts";
import { buildPlan, type PlanItem } from "./seed-plan.ts";

function printPlanSummary(plan: PlanItem[]): void {
  const bySkill = new Map<string, number>();
  const byDifficulty = new Map<number, number>();
  const byFormat = new Map<string, number>();
  for (const item of plan) {
    const skill = SKILL_BY_SUBTOPIC[item.subtopic];
    bySkill.set(skill, (bySkill.get(skill) ?? 0) + 1);
    byDifficulty.set(item.difficulty, (byDifficulty.get(item.difficulty) ?? 0) + 1);
    byFormat.set(item.format, (byFormat.get(item.format) ?? 0) + 1);
  }
  console.log(`Plan: ${plan.length} items`);
  console.log("  by skill:", Object.fromEntries(bySkill));
  console.log("  by difficulty:", Object.fromEntries([...byDifficulty].sort()));
  console.log("  by format:", Object.fromEntries(byFormat));
}

async function main(): Promise<void> {
  if (process.argv.includes("--api")) {
    console.error(
      [
        "pnpm seed --api is disabled for safety.",
        "A brute-force audit found 22 defective questions among 43 candidates",
        "that had passed the old model cross-solve gate.",
        "",
        "Generate candidates from Drill or Post-mortem instead. They remain",
        "quarantined until you complete all three checks in Progress → Question QA.",
        "Use scripts/author/ for programmatically verified additions to the seed bank.",
      ].join("\n"),
    );
    process.exitCode = 1;
    return;
  }

  if (process.argv.includes("--plan")) {
    printPlanSummary(buildPlan());
    return;
  }

  const [{ ensureDbReady }, { loadBank, verifiedSeedCount }] =
    await Promise.all([
      import("../lib/db/bootstrap.ts"),
      import("../lib/db/seed-bank.ts"),
    ]);
  await ensureDbReady();

  const { inserted, updated, retired } = await loadBank();
  console.log(
    `Seed bank loaded: ${inserted} inserted, ${updated} refreshed, ${retired} retired, ${await verifiedSeedCount()} trusted seed questions total.`,
  );
}

await main();
