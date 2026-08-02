import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";
import {
  SOLUTION_STRATEGIES,
  STRATEGY_CHAPTER,
  STRATEGY_DRILL_SIZE,
  primaryStrategy,
  type SolutionStrategy,
} from "../lib/solution-strategy.ts";

/**
 * The coverage guard.
 *
 * A technique chapter ends with a "prove it" button that opens a drill of
 * items practising that technique. If the bank does not hold enough of
 * them, the button leads to a three-question session and the chapter
 * teaches something the platform cannot make you practise — which is the
 * exact deficit this workstream existed to close (estimation stood at 2
 * items in 438 before it).
 *
 * This reads the seed bank rather than the database so it runs anywhere,
 * and it fails the moment a chapter outruns its items again.
 */
const bank = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "..", "scripts", "seed-bank.json"),
    "utf8",
  ),
) as { questions: Array<{ fastest_path_md: string; subtopic: string }> };

const byStrategy = new Map<SolutionStrategy, typeof bank.questions>();
for (const s of SOLUTION_STRATEGIES) byStrategy.set(s, []);
for (const q of bank.questions) {
  byStrategy.get(primaryStrategy(q.fastest_path_md))!.push(q);
}

describe("technique coverage in the seed bank", () => {
  test("every chaptered technique can fill a full drill block", () => {
    for (const strategy of SOLUTION_STRATEGIES) {
      if (!STRATEGY_CHAPTER[strategy]) continue;
      const n = byStrategy.get(strategy)!.length;
      assert.ok(
        n >= STRATEGY_DRILL_SIZE,
        `${strategy} has ${n} items; a drill block needs ${STRATEGY_DRILL_SIZE}`,
      );
    }
  });

  test("a technique drill spans several subtopics, so recognition is not given away", () => {
    for (const strategy of SOLUTION_STRATEGIES) {
      if (!STRATEGY_CHAPTER[strategy]) continue;
      const subtopics = new Set(
        byStrategy.get(strategy)!.map((q) => q.subtopic),
      );
      assert.ok(
        subtopics.size >= 5,
        `${strategy} spans only ${subtopics.size} subtopics — a drill of one topic teaches the topic, not the technique`,
      );
    }
  });

  test("shortcut techniques are a real share of the bank, not a token", () => {
    const shortcut = SOLUTION_STRATEGIES.filter(
      (s) => s !== "structural",
    ).reduce((n, s) => n + byStrategy.get(s)!.length, 0);
    const share = shortcut / bank.questions.length;
    assert.ok(
      share >= 0.2,
      `only ${(share * 100).toFixed(1)}% of the bank practises a non-algebraic technique`,
    );
  });

  test("every strategy with a chapter names a chapter that exists", () => {
    for (const strategy of SOLUTION_STRATEGIES) {
      const slug = STRATEGY_CHAPTER[strategy];
      if (!slug) continue;
      const file = path.join(
        import.meta.dirname,
        "..",
        "content",
        "techniques",
        `${slug}.md`,
      );
      assert.ok(fs.existsSync(file), `${strategy} points at a missing ${slug}.md`);
    }
  });
});
