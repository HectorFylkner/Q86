/** The deterministic 180-item generation plan (§12 phase 2), shared by
 *  the seed script and the authoring tools. */

import {
  SKILL_BY_SUBTOPIC,
  SUBTOPICS_BY_SKILL,
  type Context,
  type QuestionFormat,
  type Subtopic,
} from "../lib/taxonomy.ts";
import { mulberry32, pick, shuffle } from "../lib/generators/rng.ts";

export const TARGET_TOTAL = 180;
const PLAN_SEED = 8686;

export type PlanItem = {
  subtopic: Subtopic;
  difficulty: number;
  format: QuestionFormat;
  context: Context;
};

export function buildPlan(): PlanItem[] {
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

