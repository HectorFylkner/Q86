/**
 * Q86 seed script — installs the committed trusted bank. Counts are derived
 * from scripts/seed-bank.json; run scripts/bank-stats.ts for the current mix.
 *
 * The default path is offline and idempotent. `--api` is intentionally
 * disabled: model cross-solves once admitted defective questions to the bank,
 * so API-generated candidates now enter the app's Question QA quarantine
 * instead of participating in seed completion.
 *
 * Usage: pnpm seed          Load scripts/seed-bank.json
 *        pnpm seed --plan   Print the current committed-bank distribution
 *        pnpm seed --api    Exit safely with migration guidance
 */

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist; database configuration may come from the host.
}

import fs from "node:fs";
import path from "node:path";
import {
  computeBankStats,
  type BankStatsQuestion,
} from "../lib/bank-stats.ts";

function printBankSummary(): void {
  const bank = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "scripts", "seed-bank.json"), "utf8"),
  ) as { questions: BankStatsQuestion[] };
  const stats = computeBankStats(bank.questions);
  console.log(`Committed bank: ${stats.total} items`);
  console.log("  by skill:", stats.bySkill);
  console.log("  by difficulty:", stats.byDifficulty);
  console.log("  by format:", {
    problem_solving: stats.problemSolving,
    data_sufficiency: stats.dataSufficiency,
  });
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
    printBankSummary();
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
