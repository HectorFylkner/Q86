/**
 * Re-verifies every question in scripts/seed-bank.json mechanically:
 *   - structural rules (5 distinct choices, valid key, full trap coverage,
 *     solution contract headers, takeaway under 15 words)
 *   - DS items use the canonical five choices and no numeric_check
 *   - numeric_check evaluates via mathjs and equals the keyed choice's
 *     value while differing from every other parseable choice
 *
 * Usage: node scripts/verify-bank.ts   (exits 1 on any failure)
 */

import fs from "node:fs";
import path from "node:path";
import {
  evaluateExpression,
  latexChoiceToExpression,
  numbersAgree,
} from "../lib/ai/verify.ts";
import { DS_CHOICES } from "../lib/taxonomy.ts";

type BankQuestion = {
  format: string;
  content_domain: string;
  context: string;
  fundamental_skill: string;
  subtopic: string;
  difficulty: number;
  stem_md: string;
  choices: string[];
  correct_index: number;
  solution_md: string;
  fastest_path_md: string;
  trap_map: Record<string, string>;
  numeric_check: string | null;
};

const BANK_PATH = path.join(import.meta.dirname, "seed-bank.json");
const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8")) as {
  questions: BankQuestion[];
};

let failures = 0;
const fail = (index: number, q: BankQuestion, message: string) => {
  failures++;
  console.error(
    `✗ [${index}] ${q.subtopic} D${q.difficulty}: ${message}\n    stem: ${q.stem_md.slice(0, 80)}`,
  );
};

bank.questions.forEach((q, index) => {
  if (q.choices.length !== 5) fail(index, q, "must have exactly 5 choices");
  if (new Set(q.choices.map((c) => c.trim())).size !== 5)
    fail(index, q, "choices must be distinct");
  if (q.correct_index < 0 || q.correct_index > 4)
    fail(index, q, `correct_index out of range: ${q.correct_index}`);
  if (q.difficulty < 1 || q.difficulty > 5)
    fail(index, q, `difficulty out of range: ${q.difficulty}`);
  if (q.stem_md.trim().length < 20) fail(index, q, "stem too short");

  const wrong = [0, 1, 2, 3, 4].filter((i) => i !== q.correct_index);
  for (const i of wrong) {
    if (!q.trap_map[String(i)])
      fail(index, q, `trap_map missing entry for wrong choice ${i}`);
  }

  for (const header of ["**Formal path**", "**Trigger cue**", "**Takeaway**"]) {
    if (!q.solution_md.includes(header))
      fail(index, q, `solution_md missing ${header}`);
  }
  const takeaway = q.solution_md.split("**Takeaway**")[1]?.trim() ?? "";
  if (takeaway.split(/\s+/).filter(Boolean).length >= 15)
    fail(index, q, "takeaway must be under 15 words");
  if (q.fastest_path_md.trim().length < 10)
    fail(index, q, "fastest_path_md too short");

  if (q.format === "data_sufficiency") {
    if (q.choices.join("|") !== DS_CHOICES.join("|"))
      fail(index, q, "DS choices must be the canonical five");
    if (q.numeric_check != null)
      fail(index, q, "DS items must not carry a numeric_check");
    if (!/\(1\)/.test(q.stem_md) || !/\(2\)/.test(q.stem_md))
      fail(index, q, "DS stem must contain statements (1) and (2)");
  }

  if (q.numeric_check != null) {
    const expected = evaluateExpression(q.numeric_check);
    if (expected == null) {
      fail(index, q, `numeric_check not evaluable: ${q.numeric_check}`);
      return;
    }
    const keyedExpr = latexChoiceToExpression(q.choices[q.correct_index]);
    const keyed = keyedExpr == null ? null : evaluateExpression(keyedExpr);
    if (keyed == null || !numbersAgree(expected, keyed)) {
      fail(
        index,
        q,
        `numeric_check ${q.numeric_check} = ${expected} but keyed choice parses to ${keyed}`,
      );
    }
    for (const i of wrong) {
      const expr = latexChoiceToExpression(q.choices[i]);
      const value = expr == null ? null : evaluateExpression(expr);
      if (value != null && numbersAgree(expected, value)) {
        fail(index, q, `distractor ${i} also equals the computed answer`);
      }
    }
  }
});

const bySkill = new Map<string, number>();
for (const q of bank.questions) {
  bySkill.set(q.fundamental_skill, (bySkill.get(q.fundamental_skill) ?? 0) + 1);
}
console.log(
  `Bank: ${bank.questions.length} questions — ${[...bySkill.entries()]
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ")}`,
);
if (failures > 0) {
  console.error(`${failures} verification failures.`);
  process.exit(1);
}
console.log("All bank questions pass mechanical verification.");
