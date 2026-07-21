import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  verifyBankData,
  type VerifiableBankQuestion,
} from "../scripts/verify-bank.ts";

function bankFixture(): { questions: VerifiableBankQuestion[] } {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "scripts", "seed-bank.json"), "utf8"),
  );
}

test("the committed bank passes identity, evidence, and semantic-static checks", () => {
  const report = verifyBankData(bankFixture());
  assert.deepEqual(report.failures, []);
  assert.equal(report.questionCount, 603);
  assert.equal(report.problemSolvingCount, 496);
  assert.equal(report.numericEvidenceCount, 434);
});

test("the verifier rejects duplicate IDs, narrated correction, and missing PS evidence", () => {
  const bank = bankFixture();
  const numeric = bank.questions.find(
    (question) =>
      question.format === "problem_solving" && question.numeric_check != null,
  );
  assert.ok(numeric);
  numeric.uid = bank.questions.find((question) => question !== numeric)!.uid;
  numeric.numeric_check = null;
  numeric.solution_md +=
    "\n\nWait — use a different intended problem instead. Some value... actually choose C.";

  const failures = verifyBankData(bank).failures.join("\n");
  assert.match(failures, /duplicate uid/);
  assert.match(failures, /numeric_check evidence is missing/);
  assert.match(failures, /narrated mid-solution correction/);
  assert.match(failures, /narrated self-correction/);
  assert.match(failures, /intended problem/);
});
