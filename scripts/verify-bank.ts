/**
 * Mechanical and semantic-static verification for a committed question bank.
 *
 * Usage:
 *   node --experimental-strip-types scripts/verify-bank.ts
 *   node --experimental-strip-types scripts/verify-bank.ts --bank path/to/bank.json
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  evaluateExpression,
  latexChoiceToExpression,
  numbersAgree,
} from "../lib/ai/verify.ts";
import { SEED_QUESTION_UID_PATTERN } from "../lib/question-uid.ts";
import { DS_CHOICES } from "../lib/taxonomy.ts";

export type VerifiableBankQuestion = {
  uid: string;
  content_version: number;
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

export type BankVerificationReport = {
  failures: string[];
  questionCount: number;
  problemSolvingCount: number;
  numericEvidenceCount: number;
  bySkill: Map<string, number>;
};

const SEMANTIC_RED_FLAGS: ReadonlyArray<[RegExp, string]> = [
  [
    /\b(?:does not|doesn't|did not) match (?:the )?(?:choices|options)\b/i,
    "claims the derivation does not match the choices",
  ],
  [
    /\b(?:finalized )?intended (?:problem|question|version)\b/i,
    "rewrites or substitutes an intended problem",
  ],
  [/\bfinal resolved version\b/i, "introduces a replacement final version"],
  [/\bpersistent mismatch\b/i, "acknowledges a persistent mismatch"],
  [
    /\banswer choices correspond to\b/i,
    "infers the question from its answer choices",
  ],
  [
    /\bselect .{0,50}(?:because|since).{0,50}(?:listed|choice)\b/i,
    "selects an answer because it appears in the choices",
  ],
  [/\btesting (?:the )?answer choices\b/i, "back-solves from answer choices"],
  [/\bwait\s*[—–-]/i, "contains narrated mid-solution correction"],
  [/\.{3}\s*(?:but\s+)?actually\b/i, "contains narrated self-correction"],
  [/\bbut instead use\b/i, "abandons a derivation mid-solution"],
];

function bankPathFromArgs(args: string[]): string {
  const equalsArg = args.find((arg) => arg.startsWith("--bank="));
  if (equalsArg) {
    const value = equalsArg.slice("--bank=".length);
    if (!value) throw new Error("--bank requires a path.");
    return path.resolve(process.cwd(), value);
  }
  const index = args.indexOf("--bank");
  if (index >= 0) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error("--bank requires a path.");
    }
    return path.resolve(process.cwd(), value);
  }
  return path.join(import.meta.dirname, "seed-bank.json");
}

export function verifyBankData(bank: {
  questions: VerifiableBankQuestion[];
}): BankVerificationReport {
  const failures: string[] = [];
  const fail = (
    index: number,
    question: VerifiableBankQuestion,
    message: string,
  ) => {
    failures.push(
      `[${index}] ${question.uid ?? "missing-uid"} · ${question.subtopic} D${question.difficulty}: ${message}\n    stem: ${String(question.stem_md).slice(0, 80)}`,
    );
  };
  const seenUids = new Map<string, number>();
  const seenStems = new Map<string, number>();
  let problemSolvingCount = 0;
  let numericEvidenceCount = 0;

  bank.questions.forEach((question, index) => {
    if (!SEED_QUESTION_UID_PATTERN.test(question.uid)) {
      fail(index, question, `invalid or missing uid: ${question.uid}`);
    } else if (seenUids.has(question.uid)) {
      fail(
        index,
        question,
        `duplicate uid (first used at index ${seenUids.get(question.uid)})`,
      );
    } else seenUids.set(question.uid, index);
    if (
      !Number.isInteger(question.content_version) ||
      question.content_version < 1
    ) {
      fail(
        index,
        question,
        `content_version must be a positive integer: ${question.content_version}`,
      );
    }
    if (seenStems.has(question.stem_md)) {
      fail(
        index,
        question,
        `duplicate stem (first used at index ${seenStems.get(question.stem_md)})`,
      );
    } else seenStems.set(question.stem_md, index);

    if (!Array.isArray(question.choices) || question.choices.length !== 5) {
      fail(index, question, "must have exactly 5 choices");
      return;
    }
    if (new Set(question.choices.map((choice) => choice.trim())).size !== 5)
      fail(index, question, "choices must be distinct");
    if (question.correct_index < 0 || question.correct_index > 4)
      fail(
        index,
        question,
        `correct_index out of range: ${question.correct_index}`,
      );
    if (question.difficulty < 1 || question.difficulty > 5)
      fail(index, question, `difficulty out of range: ${question.difficulty}`);
    if (question.stem_md.trim().length < 20)
      fail(index, question, "stem too short");

    const wrong = [0, 1, 2, 3, 4].filter(
      (choiceIndex) => choiceIndex !== question.correct_index,
    );
    for (const choiceIndex of wrong) {
      if (!question.trap_map[String(choiceIndex)])
        fail(
          index,
          question,
          `trap_map missing entry for wrong choice ${choiceIndex}`,
        );
    }

    for (const header of [
      "**Formal path**",
      "**Trigger cue**",
      "**Takeaway**",
    ]) {
      if (!question.solution_md.includes(header))
        fail(index, question, `solution_md missing ${header}`);
    }
    const takeaway =
      question.solution_md.split("**Takeaway**")[1]?.trim() ?? "";
    if (takeaway.split(/\s+/).filter(Boolean).length >= 15)
      fail(index, question, "takeaway must be under 15 words");
    if (question.fastest_path_md.trim().length < 10)
      fail(index, question, "fastest_path_md too short");

    const semanticText = `${question.solution_md}\n${question.fastest_path_md}`;
    for (const [pattern, label] of SEMANTIC_RED_FLAGS) {
      if (pattern.test(semanticText)) {
        fail(index, question, `semantic red flag: ${label}`);
      }
    }

    if (question.format === "data_sufficiency") {
      if (question.choices.join("|") !== DS_CHOICES.join("|"))
        fail(index, question, "DS choices must be the canonical five");
      if (question.numeric_check != null)
        fail(index, question, "DS items must not carry a numeric_check");
      if (!/\(1\)/.test(question.stem_md) || !/\(2\)/.test(question.stem_md))
        fail(index, question, "DS stem must contain statements (1) and (2)");
    }

    if (question.format === "problem_solving") {
      problemSolvingCount++;
      const values = question.choices.map((choice) => {
        const expression = latexChoiceToExpression(choice);
        return expression == null ? null : evaluateExpression(expression);
      });
      if (values.every((value) => value != null) && question.numeric_check == null) {
        fail(
          index,
          question,
          "all PS choices are numeric/parseable but numeric_check evidence is missing",
        );
      }
    }

    if (question.numeric_check != null) {
      numericEvidenceCount++;
      const expected = evaluateExpression(question.numeric_check);
      if (expected == null) {
        fail(
          index,
          question,
          `numeric_check not evaluable: ${question.numeric_check}`,
        );
        return;
      }
      const keyedExpression = latexChoiceToExpression(
        question.choices[question.correct_index],
      );
      const keyed =
        keyedExpression == null ? null : evaluateExpression(keyedExpression);
      if (keyed == null || !numbersAgree(expected, keyed)) {
        fail(
          index,
          question,
          `numeric_check ${question.numeric_check} = ${expected} but keyed choice parses to ${keyed}`,
        );
      }
      for (const choiceIndex of wrong) {
        const expression = latexChoiceToExpression(
          question.choices[choiceIndex],
        );
        const value = expression == null ? null : evaluateExpression(expression);
        if (value != null && numbersAgree(expected, value)) {
          fail(
            index,
            question,
            `distractor ${choiceIndex} also equals the computed answer`,
          );
        }
      }
    }
  });

  const bySkill = new Map<string, number>();
  for (const question of bank.questions) {
    bySkill.set(
      question.fundamental_skill,
      (bySkill.get(question.fundamental_skill) ?? 0) + 1,
    );
  }
  return {
    failures,
    questionCount: bank.questions.length,
    problemSolvingCount,
    numericEvidenceCount,
    bySkill,
  };
}

function run(): void {
  let bankPath: string;
  try {
    bankPath = bankPathFromArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }
  const bank = JSON.parse(fs.readFileSync(bankPath, "utf8")) as {
    questions: VerifiableBankQuestion[];
  };
  const report = verifyBankData(bank);
  for (const failure of report.failures) console.error(`✗ ${failure}`);
  console.log(
    `Bank: ${report.questionCount} questions — ${[...report.bySkill.entries()]
      .map(([skill, count]) => `${skill}: ${count}`)
      .join(", ")}`,
  );
  console.log(
    `Deterministic numeric evidence: ${report.numericEvidenceCount}/${report.problemSolvingCount} PS items.`,
  );
  if (report.failures.length > 0) {
    console.error(`${report.failures.length} verification failures.`);
    process.exitCode = 1;
    return;
  }
  console.log("All bank questions pass mechanical and semantic-static verification.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  run();
}
