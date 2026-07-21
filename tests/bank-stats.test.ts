import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { computeBankStats, type BankStatsQuestion } from "../lib/bank-stats.ts";

test("bank statistics are derived and internally consistent", () => {
  const bank = JSON.parse(fs.readFileSync("scripts/seed-bank.json", "utf8")) as {
    questions: BankStatsQuestion[];
  };
  const stats = computeBankStats(bank.questions);
  assert.equal(stats.total, bank.questions.length);
  assert.equal(stats.problemSolving + stats.dataSufficiency, stats.total);
  assert.equal(
    Object.values(stats.bySubtopic).reduce((sum, n) => sum + n, 0),
    stats.total,
  );
  assert.equal(
    stats.canonicalKeyPositions.problemSolving.reduce((sum, n) => sum + n, 0),
    stats.problemSolving,
  );
  assert.equal(
    stats.canonicalKeyPositions.dataSufficiency.reduce((sum, n) => sum + n, 0),
    stats.dataSufficiency,
  );
});
