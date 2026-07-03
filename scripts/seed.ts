/**
 * Q86 seed script — produces 180 verified questions (§12 phase 2).
 *
 * Distribution:
 *   - Value/Order/Factors: 70 (≥7 per VOF subtopic)
 *   - Equalities/Inequalities/Algebra (excl. translation): 35
 *   - Counting/Sets/Series/Prob/Stats: 30
 *   - Rates/Ratio/Percent: 20
 *   - algebraic_translation (13) + mixed across all skills (12): 25
 *   - Difficulty ≈ 10% D2 / 30% D3 / 40% D4 / 20% D5
 *   - ~25% of VOF and Equal/Unequal items in DS format
 *
 * Resumable: progress persists in the settings table; rerunning continues
 * where it stopped and tops up any verification shortfall. Aborts after 15
 * consecutive verification failures and reports the failure pattern.
 *
 * Usage: pnpm seed          (requires ANTHROPIC_API_KEY in .env.local)
 *        pnpm seed --plan   (print the generation plan, no API calls)
 */

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist; the key may come from the environment
}

import { and, count, eq } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { questions, settings } from "../lib/db/schema.ts";
import { createVerifiedQuestion } from "../lib/ai/pipeline.ts";
import {
  SKILL_BY_SUBTOPIC,
  SUBTOPICS_BY_SKILL,
  type Context,
  type QuestionFormat,
  type Subtopic,
} from "../lib/taxonomy.ts";
import { mulberry32, pick, shuffle } from "../lib/generators/rng.ts";

const TARGET_TOTAL = 180;
const MAX_CONSECUTIVE_FAILURES = 15;
const CONCURRENCY = 3;
const PLAN_SEED = 8686;

type PlanItem = {
  subtopic: Subtopic;
  difficulty: number;
  format: QuestionFormat;
  context: Context;
};

function buildPlan(): PlanItem[] {
  const rng = mulberry32(PLAN_SEED);
  const subtopics: Subtopic[] = [];

  // VOF: 7 per subtopic (56) + 14 more cycling → 70
  const vof = SUBTOPICS_BY_SKILL.value_order_factors;
  for (const s of vof) for (let i = 0; i < 7; i++) subtopics.push(s);
  for (let i = 0; i < 14; i++) subtopics.push(vof[i % vof.length]);

  // Equal/Unequal excluding algebraic_translation: 7 × 5 = 35
  const eu = SUBTOPICS_BY_SKILL.equal_unequal_alg.filter(
    (s) => s !== "algebraic_translation",
  );
  for (const s of eu) for (let i = 0; i < 7; i++) subtopics.push(s);

  // Counting/Sets/Series/Prob/Stats: 6 × 5 = 30
  for (const s of SUBTOPICS_BY_SKILL.counting_sets_series_prob_stats)
    for (let i = 0; i < 6; i++) subtopics.push(s);

  // Rates/Ratio/Percent: 4 × 5 = 20
  for (const s of SUBTOPICS_BY_SKILL.rates_ratio_percent)
    for (let i = 0; i < 4; i++) subtopics.push(s);

  // algebraic_translation 13 + mixed 12 = 25
  for (let i = 0; i < 13; i++) subtopics.push("algebraic_translation");
  const all = Object.values(SUBTOPICS_BY_SKILL).flat() as Subtopic[];
  for (let i = 0; i < 12; i++) subtopics.push(pick(rng, all));

  if (subtopics.length !== TARGET_TOTAL) {
    throw new Error(`plan builds ${subtopics.length} items, expected 180`);
  }

  // Difficulty deck: exactly 18 D2 / 54 D3 / 72 D4 / 36 D5
  const difficulties = shuffle(
    [
      ...Array<number>(18).fill(2),
      ...Array<number>(54).fill(3),
      ...Array<number>(72).fill(4),
      ...Array<number>(36).fill(5),
    ],
    rng,
  );

  const items: PlanItem[] = subtopics.map((subtopic, i) => ({
    subtopic,
    difficulty: difficulties[i],
    format: "problem_solving" as QuestionFormat,
    context: "pure" as Context,
  }));

  // DS format: exactly 25% of VOF + Equal/Unequal items
  const dsEligible = items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => {
      const skill = SKILL_BY_SUBTOPIC[item.subtopic];
      return skill === "value_order_factors" || skill === "equal_unequal_alg";
    });
  const dsPickCount = Math.round(dsEligible.length * 0.25);
  for (const { i } of shuffle(dsEligible, rng).slice(0, dsPickCount)) {
    items[i].format = "data_sufficiency";
  }

  // Context: VOF leans pure (60%) — the diagnosed gap; everything else 50/50
  for (const item of items) {
    const isVof = SKILL_BY_SUBTOPIC[item.subtopic] === "value_order_factors";
    item.context = rng() < (isVof ? 0.6 : 0.5) ? "pure" : "real";
  }

  return shuffle(items, rng);
}

function verifiedSeedCount(): number {
  const row = db
    .select({ n: count() })
    .from(questions)
    .where(and(eq(questions.source, "seed"), eq(questions.verified, true)))
    .get();
  return row?.n ?? 0;
}

function getProgress(): number {
  const row = db
    .select()
    .from(settings)
    .where(eq(settings.key, "seed_progress"))
    .get();
  return row ? Number(row.value) : 0;
}

function setProgress(n: number): void {
  db.insert(settings)
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
function buildTopUp(plan: PlanItem[], deficit: number): PlanItem[] {
  const rng = mulberry32(Date.now() % 2 ** 31);
  const target = new Map<Subtopic, number>();
  for (const item of plan)
    target.set(item.subtopic, (target.get(item.subtopic) ?? 0) + 1);
  const actualRows = db
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
  try {
    verifiedSeedCount();
  } catch {
    console.error("The database has no tables. Run pnpm db:push first.");
    process.exit(1);
  }

  const plan = buildPlan();

  if (process.argv.includes("--plan")) {
    printPlanSummary(plan);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local, then rerun pnpm seed.",
    );
    process.exit(1);
  }

  let verified = verifiedSeedCount();
  let consumed = getProgress();
  if (verified === 0 && consumed > 0) {
    console.log("Database has no seed questions but progress > 0 — resetting.");
    consumed = 0;
    setProgress(0);
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
          setProgress(consumed);
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
    const topUp = buildTopUp(plan, TARGET_TOTAL - verified);
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
  const bySkillRows = db
    .select({ skill: questions.fundamentalSkill, n: count() })
    .from(questions)
    .where(and(eq(questions.source, "seed"), eq(questions.verified, true)))
    .groupBy(questions.fundamentalSkill)
    .all();
  for (const row of bySkillRows) console.log(`  ${row.skill}: ${row.n}`);
}

await main();
