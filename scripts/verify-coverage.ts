/**
 * Chapter-test coverage gate.
 *
 * Every subtopic must be able to serve its chapter test twice over with no
 * question repeating: D2 ≥ 4, D3 ≥ 6, D4 ≥ 4, D5 ≥ 2 (lib/coverage.ts).
 * Before this gate existed the selector padded a short blend silently with
 * whatever it could find, so a starved subtopic produced a test that
 * looked like eight questions and wasn't the blend at all — and you only
 * found out mid-test. Now the bank fails at authoring time instead.
 *
 * Usage: pnpm verify:coverage   (exits 1 on any shortfall)
 */

import fs from "node:fs";
import path from "node:path";
import {
  COVERAGE_FLOOR,
  COVERAGE_TAKES,
  coverageLine,
  coverageReport,
  type DifficultyCounts,
} from "../lib/coverage.ts";
import {
  ALL_SUBTOPICS,
  DIFFICULTIES,
  SKILL_BY_SUBTOPIC,
  type Difficulty,
  type Subtopic,
} from "../lib/taxonomy.ts";

type BankQuestion = {
  format: string;
  subtopic: string;
  fundamental_skill: string;
  difficulty: number;
};

const BANK_PATH = path.join(import.meta.dirname, "seed-bank.json");
const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8")) as {
  questions: BankQuestion[];
};

const counts: Partial<Record<Subtopic, DifficultyCounts>> = {};
let offScope = 0;
let mismatchedSkill = 0;
for (const q of bank.questions) {
  if (q.format !== "problem_solving") {
    offScope++;
    continue;
  }
  if (!ALL_SUBTOPICS.includes(q.subtopic as Subtopic)) {
    console.error(`✗ unknown subtopic in bank: ${q.subtopic}`);
    offScope++;
    continue;
  }
  const subtopic = q.subtopic as Subtopic;
  if (SKILL_BY_SUBTOPIC[subtopic] !== q.fundamental_skill) {
    console.error(
      `✗ ${subtopic}: fundamental_skill is "${q.fundamental_skill}", taxonomy says "${SKILL_BY_SUBTOPIC[subtopic]}"`,
    );
    mismatchedSkill++;
  }
  const bucket = (counts[subtopic] ??= {});
  const d = q.difficulty as Difficulty;
  bucket[d] = (bucket[d] ?? 0) + 1;
}

const report = coverageReport(counts);
const short = report.filter((c) => !c.fillsFloor);

console.log(
  `Coverage floor: ${DIFFICULTIES.map((d) => `D${d} ≥ ${COVERAGE_FLOOR[d]}`).join(
    ", ",
  )} per subtopic (chapter-test blend × ${COVERAGE_TAKES} takes, no repeats).`,
);
for (const c of [...report].sort((a, b) => a.subtopic.localeCompare(b.subtopic))) {
  console.log(`  ${c.fillsFloor ? "✓" : "✗"} ${coverageLine(c)}`);
}

const total = report.reduce((s, c) => s + c.total, 0);
console.log(
  `\n${report.length} subtopics, ${total} problem-solving questions in scope.`,
);

if (mismatchedSkill > 0) {
  console.error(
    `\n${mismatchedSkill} question(s) carry a fundamental_skill that contradicts lib/taxonomy.ts.`,
  );
}

if (short.length > 0) {
  console.error(`\n✗ ${short.length} subtopic(s) below the coverage floor:`);
  for (const c of short) {
    const cannotEvenFillOnce = c.fillsOnce ? "" : "  ← cannot fill one take";
    console.error(
      `  ${c.subtopic}: ${c.shortfall
        .map((s) => `D${s.difficulty} needs ${s.need - s.have} more (${s.have}/${s.need})`)
        .join(", ")}${cannotEvenFillOnce}`,
    );
  }
  console.error(
    "\nAuthor the missing items through scripts/author/harness.mjs — never by hand-editing the bank.",
  );
}

if (short.length > 0 || mismatchedSkill > 0 || offScope > 0) {
  if (offScope > 0)
    console.error(`${offScope} out-of-scope item(s) in the bank.`);
  process.exit(1);
}
console.log("Every subtopic can serve its chapter test twice with no repeats.");
