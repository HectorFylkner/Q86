/**
 * One-time/idempotent bank identity assignment.
 *
 * Existing UIDs and versions are never regenerated. Missing values are
 * assigned from content (not array position), then persisted in the bank.
 * Future editorial changes must preserve uid and increment content_version.
 *
 * Usage: node --experimental-strip-types scripts/assign-question-uids.ts
 */
import fs from "node:fs";
import path from "node:path";
import {
  deriveSeedQuestionUid,
  SEED_QUESTION_UID_PATTERN,
} from "../lib/question-uid.ts";

type QuestionRecord = Record<string, unknown> & {
  uid?: unknown;
  content_version?: unknown;
  format: string;
  subtopic: string;
  stem_md: string;
};

const bankPath = path.join(import.meta.dirname, "seed-bank.json");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8")) as {
  questions: QuestionRecord[];
};
const seen = new Set<string>();
let assigned = 0;

bank.questions = bank.questions.map((question) => {
  const uid =
    typeof question.uid === "string" && question.uid.length > 0
      ? question.uid
      : deriveSeedQuestionUid(question);
  const contentVersion =
    Number.isInteger(question.content_version) &&
    Number(question.content_version) >= 1
      ? Number(question.content_version)
      : 1;

  if (!SEED_QUESTION_UID_PATTERN.test(uid)) {
    throw new Error(`Invalid seed question UID: ${uid}`);
  }
  if (seen.has(uid)) throw new Error(`Duplicate seed question UID: ${uid}`);
  seen.add(uid);
  if (question.uid == null || question.content_version == null) assigned++;

  const content = { ...question };
  delete content.uid;
  delete content.content_version;
  return { uid, content_version: contentVersion, ...content };
});

fs.writeFileSync(bankPath, `${JSON.stringify(bank, null, 1)}\n`);
console.log(
  `Question identity assignment complete: ${bank.questions.length} total, ${assigned} updated.`,
);
