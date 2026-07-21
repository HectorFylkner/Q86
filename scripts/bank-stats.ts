import fs from "node:fs";
import path from "node:path";
import { computeBankStats, type BankStatsQuestion } from "../lib/bank-stats.ts";

const bankPath = path.join(process.cwd(), "scripts", "seed-bank.json");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8")) as {
  questions: BankStatsQuestion[];
};
const stats = computeBankStats(bank.questions);

console.log(`Questions: ${stats.total}`);
console.log(`Problem Solving: ${stats.problemSolving}`);
console.log(`Data Sufficiency bridge: ${stats.dataSufficiency}`);
console.log(
  `Canonical PS keys A–E: ${stats.canonicalKeyPositions.problemSolving.join(" / ")}`,
);
console.log(
  `Canonical DS keys A–E: ${stats.canonicalKeyPositions.dataSufficiency.join(" / ")}`,
);
for (const [subtopic, count] of Object.entries(stats.bySubtopic).sort()) {
  console.log(`${subtopic}: ${count}`);
}
