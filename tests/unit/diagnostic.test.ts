import "../helpers/test-env.ts";
import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import {
  BAND_CEILING,
  BAND_FLOOR,
  DIAGNOSTIC_LENGTH,
  diagnosticQuestions,
  normaliseAnswers,
  scoreDiagnostic,
} from "@/lib/diagnostic";
import { previewWeek } from "@/lib/diagnostic-plan";
import { migrateTestDb } from "../helpers/db";
import { FUNDAMENTAL_SKILLS, SUBTOPICS_BY_SKILL } from "@/lib/taxonomy";

/**
 * The free diagnostic is the only surface an anonymous stranger can reach
 * that touches the question bank, so it gets its own tests: that it serves
 * a balanced set, that it never hands out the answer key, that the band it
 * reports is honest about its own precision, and that the plan preview is
 * the product's real planner rather than a mock-up.
 */

const ROOT = process.cwd();

/** Enough of a bank that three questions per skill exist at three
 *  difficulties, which is what the selection rule needs. */
async function seedBalancedBank(): Promise<void> {
  const rows: Array<typeof questions.$inferInsert> = [];
  for (const skill of FUNDAMENTAL_SKILLS) {
    const subtopics = SUBTOPICS_BY_SKILL[skill];
    for (let i = 0; i < 5; i++) {
      rows.push({
        source: "seed",
        format: "problem_solving",
        contentDomain: "arithmetic",
        context: "pure",
        fundamentalSkill: skill,
        subtopic: subtopics[i % subtopics.length],
        difficulty: (i % 5) + 1,
        stemMd: `Stem ${skill} ${i}`,
        choices: ["A", "B", "C", "D", "E"],
        // A different correct index per row, so a test that answers "all
        // 0" cannot accidentally score full marks.
        correctIndex: i % 5,
        solutionMd: "Solution.",
        fastestPathMd: "Fast path.",
        trapMap: { "0": "a named mistake" },
        verified: true,
      });
    }
  }
  await db.insert(questions).values(rows);
}

beforeAll(async () => {
  await migrateTestDb();
  await seedBalancedBank();
});

describe("the diagnostic set", () => {
  it("serves three questions per fundamental skill", async () => {
    const set = await diagnosticQuestions();
    expect(set).toHaveLength(DIAGNOSTIC_LENGTH);
    for (const skill of FUNDAMENTAL_SKILLS) {
      expect(set.filter((q) => q.fundamentalSkill === skill)).toHaveLength(3);
    }
  });

  it("is the same set on every call, so two readers can compare", async () => {
    const first = (await diagnosticQuestions()).map((q) => q.id);
    const second = (await diagnosticQuestions()).map((q) => q.id);
    expect(second).toEqual(first);
  });

  it("never leaves the answer key or the solution in the payload", async () => {
    const set = await diagnosticQuestions();
    for (const question of set) {
      expect(Object.keys(question)).not.toContain("correctIndex");
      expect(Object.keys(question)).not.toContain("solutionMd");
      expect(Object.keys(question)).not.toContain("trapMap");
    }
    // Serialising the whole payload is what actually reaches the browser.
    expect(JSON.stringify(set)).not.toContain("correctIndex");
  });

  it("climbs in difficulty inside each skill", async () => {
    const set = await diagnosticQuestions();
    for (const skill of FUNDAMENTAL_SKILLS) {
      const run = set
        .filter((q) => q.fundamentalSkill === skill)
        .map((q) => q.difficulty);
      expect(run).toEqual([...run].sort((a, b) => a - b));
    }
  });
});

describe("scoring", () => {
  it("puts a perfect score at the ceiling and a blank one at the floor", async () => {
    const set = await diagnosticQuestions();
    const blank = await scoreDiagnostic(set.map(() => null));
    expect(blank.correct).toBe(0);
    expect(blank.bandLow).toBe(BAND_FLOOR);

    // Recover the key the only legitimate way a test can: from the bank.
    const key = await Promise.all(
      set.map(async (q) => {
        const row = await db.query.questions.findFirst({
          where: (t, { eq }) => eq(t.id, q.id),
        });
        return row?.correctIndex ?? 0;
      }),
    );
    const perfect = await scoreDiagnostic(key);
    expect(perfect.correct).toBe(DIAGNOSTIC_LENGTH);
    expect(perfect.bandHigh).toBe(BAND_CEILING);
  });

  it("reports an interval, never a point estimate", async () => {
    const set = await diagnosticQuestions();
    const result = await scoreDiagnostic(set.map((_, i) => i % 5));
    expect(result.bandHigh).toBeGreaterThan(result.bandLow);
    expect(result.bandLow).toBeGreaterThanOrEqual(BAND_FLOOR);
    expect(result.bandHigh).toBeLessThanOrEqual(BAND_CEILING);
  });

  it("names the weakest skill from the answers, not at random", async () => {
    const set = await diagnosticQuestions();
    const key = await Promise.all(
      set.map(async (q) => {
        const row = await db.query.questions.findFirst({
          where: (t, { eq }) => eq(t.id, q.id),
        });
        return row?.correctIndex ?? 0;
      }),
    );
    // Get everything right except one skill, which is answered blind.
    const target = FUNDAMENTAL_SKILLS[2];
    const answers = key.map((correct, i) =>
      set[i].fundamentalSkill === target ? (correct + 1) % 5 : correct,
    );
    const result = await scoreDiagnostic(answers);
    expect(result.weakestSkill).toBe(target);
    expect(result.perSkill.find((r) => r.skill === target)?.correct).toBe(0);
    // The named subtopic must be one that was actually missed.
    if (result.weakestSubtopic) {
      const missed = set
        .filter((q) => q.fundamentalSkill === target)
        .map((q) => q.subtopic);
      expect(missed).toContain(result.weakestSubtopic);
    }
  });

  it("ignores a longer or malformed answer array", () => {
    expect(normaliseAnswers("nope")).toEqual([]);
    expect(normaliseAnswers([0, 9, -1, "2", null, 3])).toEqual([
      0,
      null,
      null,
      null,
      null,
      3,
    ]);
    expect(normaliseAnswers(new Array(50).fill(0))).toHaveLength(
      DIAGNOSTIC_LENGTH,
    );
  });
});

describe("the plan preview", () => {
  it("returns seven days built by the product's own planner", async () => {
    const set = await diagnosticQuestions();
    const result = await scoreDiagnostic(set.map(() => 0));
    const { days, weights } = previewWeek(result);

    expect(days).toHaveLength(7);
    expect(days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const day of days) expect(day.drillTotal).toBeGreaterThan(0);
    // Day one has nothing to review yet; every later day does.
    expect(days[0].review).toBe(false);
    expect(days.slice(1).every((d) => d.review)).toBe(true);
    // The weights are a distribution over the four skills.
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("weights the plan toward the skill the diagnostic found weakest", async () => {
    const set = await diagnosticQuestions();
    const key = await Promise.all(
      set.map(async (q) => {
        const row = await db.query.questions.findFirst({
          where: (t, { eq }) => eq(t.id, q.id),
        });
        return row?.correctIndex ?? 0;
      }),
    );
    const target = FUNDAMENTAL_SKILLS[1];
    const answers = key.map((correct, i) =>
      set[i].fundamentalSkill === target ? (correct + 1) % 5 : correct,
    );
    const { weights } = previewWeek(await scoreDiagnostic(answers));
    const others = FUNDAMENTAL_SKILLS.filter((s) => s !== target);
    for (const other of others) {
      expect(weights[target]).toBeGreaterThan(weights[other]);
    }
  });
});

describe("public content", () => {
  it("keeps the guides and legal pages present in Swedish", () => {
    for (const dir of ["guides", "legal"]) {
      const base = path.join(ROOT, "content", dir, "sv");
      expect(fs.existsSync(base)).toBe(true);
      expect(fs.readdirSync(base).length).toBeGreaterThan(0);
    }
  });

  it("makes no score guarantee anywhere on the public site", () => {
    // marknadsföringslagen is strict about unsubstantiated claims, and a
    // guarantee is the easiest one to write by accident.
    const banned = [
      /garanter(ar|ad|as)\s+(?:dig\s+)?(?:ett\s+)?(?:högre\s+)?(?:poäng|resultat)/i,
      /poänggaranti(?!\.)/i,
      /guaranteed\s+score/i,
    ];
    const files: string[] = [];
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(md|tsx?)$/.test(entry.name)) files.push(full);
      }
    }
    walk(path.join(ROOT, "content", "guides"));
    walk(path.join(ROOT, "content", "legal"));
    walk(path.join(ROOT, "components", "site"));

    const offenders: string[] = [];
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      for (const pattern of banned) {
        if (pattern.test(source)) {
          offenders.push(`${path.relative(ROOT, file)} matches ${pattern}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("states the GMAC disclaimer in the shared footer copy", () => {
    const sv = fs.readFileSync(path.join(ROOT, "lib/i18n/sv.ts"), "utf8");
    expect(sv).toMatch(/oberoende tjänst utan koppling till GMAC/);
    expect(sv).toMatch(/varumärken som tillhör GMAC/);
  });
});
