// Documentation drift gate: prose claims in README.md/DEPLOY.md and the
// lesson corpus must stay in sync with scripts/seed-bank.json and the
// taxonomy, so shipping new content forces a docs update.

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ALL_SUBTOPICS } from "../lib/taxonomy.ts";

const at = (rel: string) => fileURLToPath(new URL(`../${rel}`, import.meta.url));

interface SeedQuestion {
  difficulty: number;
  choices: string[];
  correct_index: number;
}

const bank = JSON.parse(fs.readFileSync(at("scripts/seed-bank.json"), "utf8")) as {
  description: string;
  questions: SeedQuestion[];
};

const readme = fs.readFileSync(at("README.md"), "utf8");
const deploy = fs.readFileSync(at("DEPLOY.md"), "utf8");

function counts(text: string, pattern: RegExp): number[] {
  return [...text.matchAll(pattern)].map((m) => Number(m[1]));
}

describe("seed bank shape", () => {
  it("has a description and a non-empty questions array", () => {
    expect(bank.description.trim()).not.toBe("");
    expect(Array.isArray(bank.questions)).toBe(true);
    expect(bank.questions.length).toBeGreaterThan(0);
  });

  it("gives every question exactly 5 choices", () => {
    bank.questions.forEach((q, i) => {
      expect(q.choices.length, `questions[${i}]`).toBe(5);
    });
  });

  it("keeps every correct_index in 0-4", () => {
    bank.questions.forEach((q, i) => {
      expect(Number.isInteger(q.correct_index), `questions[${i}]`).toBe(true);
      expect(q.correct_index, `questions[${i}]`).toBeGreaterThanOrEqual(0);
      expect(q.correct_index, `questions[${i}]`).toBeLessThanOrEqual(4);
    });
  });

  it("keeps every difficulty in 2-5", () => {
    bank.questions.forEach((q, i) => {
      expect(Number.isInteger(q.difficulty), `questions[${i}]`).toBe(true);
      expect(q.difficulty, `questions[${i}]`).toBeGreaterThanOrEqual(2);
      expect(q.difficulty, `questions[${i}]`).toBeLessThanOrEqual(5);
    });
  });
});

describe("documentation question counts", () => {
  const expected = bank.questions.length;

  it("README's every \"N-question bank\" mention matches the seed bank", () => {
    const found = counts(readme, /(\d+)[- ]question bank/g);
    expect(found.length).toBeGreaterThan(0);
    for (const n of found) expect(n).toBe(expected);
  });

  it("DEPLOY's \"all N verified questions\" claim matches the seed bank", () => {
    const found = counts(deploy, /all (\d+) verified questions/g);
    expect(found.length).toBeGreaterThan(0);
    for (const n of found) expect(n).toBe(expected);
  });

  it("DEPLOY never states a stale \"N-question bank\" count", () => {
    for (const n of counts(deploy, /(\d+)[- ]question bank/g)) {
      expect(n).toBe(expected);
    }
  });
});

describe("lesson corpus", () => {
  it("has one lesson file per taxonomy subtopic", () => {
    const files = fs
      .readdirSync(at("content/lessons"))
      .filter((f) => f.endsWith(".md"));
    expect(files).toHaveLength(ALL_SUBTOPICS.length);
  });
});
