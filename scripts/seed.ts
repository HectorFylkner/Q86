/**
 * Q86 seed script — installs the 180-question verified bank (§12 phase 2).
 *
 * Default mode loads scripts/seed-bank.json — questions that already
 * passed verification (the two-model pipeline or authored-with-
 * programmatic-verification) — offline, idempotently, no API key needed.
 *
 * --api generates fresh questions through the §8 pipeline instead
 * (requires ANTHROPIC_API_KEY): resumable, tops up shortfalls, aborts
 * after 15 consecutive verification failures with a pattern report.
 *
 * Distribution (both modes):
 *   - Value/Order/Factors: 70 (≥7 per VOF subtopic)
 *   - Equalities/Inequalities/Algebra (excl. translation): 35
 *   - Counting/Sets/Series/Prob/Stats: 30
 *   - Rates/Ratio/Percent: 20
 *   - algebraic_translation (13) + mixed across all skills (12): 25
 *   - Difficulty ≈ 10% D2 / 30% D3 / 40% D4 / 20% D5
 *   - ~25% of VOF and Equal/Unequal items in DS format
 *
 * Usage: pnpm seed          (offline, from scripts/seed-bank.json)
 *        pnpm seed --api    (generate via the AI pipeline)
 *        pnpm seed --plan   (print the generation plan, no API calls)
 */

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist; the key may come from the environment
}

import fs from "node:fs";
import path from "node:path";
import { and, count, eq } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { ensureDbReady } from "../lib/db/bootstrap.ts";
import { loadBank, verifiedSeedCount } from "../lib/db/seed-bank.ts";
import { questions, settings } from "../lib/db/schema.ts";
import { createVerifiedQuestion } from "../lib/ai/pipeline.ts";
import { SKILL_BY_SUBTOPIC, type Subtopic } from "../lib/taxonomy.ts";
import { mulberry32, pick, shuffle } from "../lib/generators/rng.ts";
import { buildPlan, TARGET_TOTAL, type PlanItem } from "./seed-plan.ts";

const MAX_CONSECUTIVE_FAILURES = 15;
const CONCURRENCY = 3;

async function getProgress(): Promise<number> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "seed_progress"))
    .get();
  return row ? Number(row.value) : 0;
}

async function setProgress(n: number): Promise<void> {
  await db
    .insert(settings)
    .values({ key: "seed_progress", value: String(n) })
    .onConflictDoUpdate({ target: settings.key, set: { value: String(n) } })
    .run();
}

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

/** Top-up items for shortfall: aim generation at underfilled subtopics. */
async function buildTopUp(
  plan: PlanItem[],
  deficit: number,
): Promise<PlanItem[]> {
  const rng = mulberry32(Date.now() % 2 ** 31);
  const target = new Map<Subtopic, number>();
  for (const item of plan)
    target.set(item.subtopic, (target.get(item.subtopic) ?? 0) + 1);
  const actualRows = await db
    .select({ subtopic: questions.subtopic, n: count() })
    .from(questions)
    .where(and(eq(questions.source, "seed"), eq(questions.verified, true)))
    .groupBy(questions.subtopic)
    .all();
  const actual = new Map(actualRows.map((r) => [r.subtopic, r.n]));

  const candidates: PlanItem[] = [];
  for (const [subtopic, t] of target) {
    const missing = t - (actual.get(subtopic) ?? 0);
    for (let i = 0; i < missing; i++) {
      const skill = SKILL_BY_SUBTOPIC[subtopic];
      const dsEligible =
        skill === "value_order_factors" || skill === "equal_unequal_alg";
      candidates.push({
        subtopic,
        difficulty: pick(rng, [3, 4, 4, 5]),
        format:
          dsEligible && rng() < 0.25 ? "data_sufficiency" : "problem_solving",
        context: rng() < 0.5 ? "pure" : "real",
      });
    }
  }
  return shuffle(candidates, rng).slice(0, deficit);
}


async function main() {
  // Applies the schema to an empty database and no-ops otherwise, so a
  // fresh clone can run `pnpm seed` (or nothing at all) directly.
  await ensureDbReady();

  const plan = buildPlan();

  if (process.argv.includes("--plan")) {
    printPlanSummary(plan);
    return;
  }

  if (!process.argv.includes("--api")) {
    const { inserted, updated, retired } = await loadBank();
    console.log(
      `Seed bank loaded: ${inserted} inserted, ${updated} refreshed, ${retired} retired, ${await verifiedSeedCount()} verified seed questions total.`,
    );
    return;
  }

  console.warn(
    [
      "⚠ --api generates questions gated only by an LLM cross-solve plus a",
      "  numeric spot-check. A brute-force audit of a previous API run found",
      "  22 of 43 generated questions mathematically defective despite that",
      "  gate. Prefer the committed bank; if you generate, re-verify every",
      "  new question with a programmatic check (see scripts/author/).",
    ].join("\n"),
  );

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local, then rerun pnpm seed.",
    );
    process.exit(1);
  }

  let verified = await verifiedSeedCount();
  let consumed = await getProgress();
  if (verified === 0 && consumed > 0) {
    console.log("Database has no seed questions but progress > 0 — resetting.");
    consumed = 0;
    await setProgress(0);
  }

  if (verified >= TARGET_TOTAL) {
    console.log(`Seed bank already complete: ${verified} verified questions.`);
    return;
  }

  console.log(
    `Seeding: ${verified}/${TARGET_TOTAL} verified so far, resuming at plan item ${consumed}.`,
  );

  let queue: PlanItem[] = plan.slice(consumed);
  let failed = 0;
  let consecutiveFailures = 0;
  const failuresBySubtopic = new Map<string, number>();
  const recentFailures: string[] = [];
  let aborted = false;

  async function runItem(item: PlanItem): Promise<void> {
    const skill = SKILL_BY_SUBTOPIC[item.subtopic];
    const label = `${skill}/${item.subtopic} D${item.difficulty} ${
      item.format === "data_sufficiency" ? "DS" : "PS"
    } ${item.context}`;
    let ok = false;
    let reason = "";
    try {
      const result = await createVerifiedQuestion(
        {
          skill,
          subtopic: item.subtopic,
          difficulty: item.difficulty,
          format: item.format,
          context: item.context,
        },
        { source: "seed" },
      );
      ok = result.ok;
      if (!result.ok) reason = result.failures.at(-1) ?? "unknown";
    } catch (e) {
      reason = `API error: ${e instanceof Error ? e.message : String(e)}`;
    }

    if (ok) {
      verified++;
      consecutiveFailures = 0;
    } else {
      failed++;
      consecutiveFailures++;
      failuresBySubtopic.set(
        item.subtopic,
        (failuresBySubtopic.get(item.subtopic) ?? 0) + 1,
      );
      recentFailures.push(`${label}: ${reason}`);
      if (recentFailures.length > 5) recentFailures.shift();
    }
    console.log(
      `[${String(verified).padStart(3)}/${TARGET_TOTAL} verified | ${failed} failed] ${
        ok ? "✓" : "✗"
      } ${label}${ok ? "" : ` — ${reason}`}`,
    );
  }

  async function drainQueue(fromPlan: boolean): Promise<void> {
    let next = 0;
    async function worker() {
      while (next < queue.length && !aborted) {
        const item = queue[next++];
        if (fromPlan) {
          // Progress advances at dispatch, not completion, so a rerun
          // never replays items other workers already picked up; any
          // in-flight losses are restored by the top-up phase.
          consumed++;
          await setProgress(consumed);
        }
        await runItem(item);
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) aborted = true;
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker),
    );
  }

  await drainQueue(true);

  // Top up any shortfall from discarded questions (also covers reruns).
  while (!aborted && verified < TARGET_TOTAL) {
    const topUp = await buildTopUp(plan, TARGET_TOTAL - verified);
    if (topUp.length === 0) break;
    console.log(`Topping up shortfall: ${topUp.length} more questions.`);
    queue = topUp;
    await drainQueue(false);
  }

  if (aborted) {
    console.error(
      `\nAborted: ${MAX_CONSECUTIVE_FAILURES} consecutive verification failures.`,
    );
    console.error("Failure pattern by subtopic:");
    for (const [subtopic, n] of [...failuresBySubtopic].sort(
      (a, b) => b[1] - a[1],
    )) {
      console.error(`  ${subtopic}: ${n}`);
    }
    console.error("Most recent failures:");
    for (const f of recentFailures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(
    `\nDone. ${verified} verified seed questions (${failed} candidates discarded).`,
  );
  const bySkillRows = await db
    .select({ skill: questions.fundamentalSkill, n: count() })
    .from(questions)
    .where(and(eq(questions.source, "seed"), eq(questions.verified, true)))
    .groupBy(questions.fundamentalSkill)
    .all();
  for (const row of bySkillRows) console.log(`  ${row.skill}: ${row.n}`);
}

await main();
