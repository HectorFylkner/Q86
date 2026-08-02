import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  SOLUTION_STRATEGIES,
  STRATEGY_LABELS,
  STRATEGY_NOTES,
  isSolutionStrategy,
  primaryStrategy,
  strategiesFor,
} from "../lib/solution-strategy.ts";

/**
 * The classifier's job is to be *conservative*: it may miss a shortcut,
 * but it must never label an algebraic grind as a shortcut, because the
 * technique drills and the "you never reach for this" panel are both
 * built on top of it. These tests pin that asymmetry down, and pin the
 * LaTeX-stripping that a previous version of this file got wrong — the
 * bank writes maths inline, so a signature written against readable
 * prose silently never fires without it.
 */
describe("solution-strategy classifier", () => {
  test("an unrecognized path is structural, not a guess", () => {
    const hits = strategiesFor(
      "Let $r$ be the rate. Then $d = rt$ gives $r = 60$, and substituting into the second equation yields $t = 3$.",
    );
    assert.deepEqual(
      hits.map((h) => h.strategy),
      ["structural"],
    );
    assert.equal(primaryStrategy("nothing recognizable here"), "structural");
  });

  test("structural is never returned alongside a shortcut", () => {
    const hits = strategiesFor("Backsolve from choice C.");
    assert.ok(
      !hits.some((h) => h.strategy === "structural"),
      "structural is the empty case, so it must not co-occur",
    );
  });

  test("LaTeX delimiters do not hide a shortcut from the matcher", () => {
    // Reaches a naive matcher as `Test $(` — the exact bug this
    // normalization exists to fix.
    const hits = strategiesFor("Test $(x, y) = (-1, 2)$ against each choice.");
    assert.ok(
      hits.some((h) => h.strategy === "pick_numbers"),
      "picking numbers must survive inline maths",
    );
  });

  test("LaTeX macros are stripped rather than matched as words", () => {
    // \times contains "time", \frac contains "rac" — neither is prose.
    const hits = strategiesFor(
      "$\\frac{3}{4} \\times \\frac{8}{9} = \\frac{2}{3}$",
    );
    assert.deepEqual(
      hits.map((h) => h.strategy),
      ["structural"],
      "pure computation is structural however it is typeset",
    );
  });

  test("each strategy is recognized from bank-shaped prose", () => {
    const cases: Array<[string, string]> = [
      ["backsolve", "Backsolve: start at choice C, $31$ adults."],
      ["pick_numbers", "Pick numbers: take the original price as $100$."],
      ["estimate", "Estimate: $4.02/1.98$ rounds to $2$, so the answer is in the thousands."],
      ["pattern", "The units digit cycles with period $4$, so $7^{83}$ ends in $3$."],
      ["eliminate", "Only choice D is positive, which eliminates the rest."],
    ];
    for (const [expected, path] of cases) {
      const hits = strategiesFor(path);
      assert.ok(
        hits.some((h) => h.strategy === expected),
        `expected ${expected} from: ${path}`,
      );
    }
  });

  test("evidence is a real substring of the normalized path", () => {
    const path = "Backsolve from choice C; the remaining choices are eliminated.";
    for (const hit of strategiesFor(path)) {
      assert.ok(
        path.toLowerCase().includes(hit.evidence.toLowerCase().trim()),
        `evidence ${JSON.stringify(hit.evidence)} must come from the path`,
      );
    }
  });

  test("a path using two techniques is credited with both", () => {
    const hits = strategiesFor(
      "Estimate the product as $600$, which eliminates A, B and E.",
    );
    const found = hits.map((h) => h.strategy).sort();
    assert.deepEqual(found, ["eliminate", "estimate"]);
  });

  test("primaryStrategy prefers the technique that saves the most", () => {
    // Backsolving outranks elimination when both are present: it finishes
    // the question, elimination only narrows it.
    assert.equal(
      primaryStrategy("Backsolve from C, which also eliminates A and B."),
      "backsolve",
    );
    assert.equal(
      primaryStrategy("Estimate to $600$, eliminating A and B."),
      "estimate",
    );
  });

  test("primaryStrategy is total — every path gets exactly one label", () => {
    for (const path of ["", "   ", "$$", "\\frac{1}{2}", "solve it"]) {
      const s = primaryStrategy(path);
      assert.ok(
        (SOLUTION_STRATEGIES as readonly string[]).includes(s),
        `${JSON.stringify(path)} produced ${s}`,
      );
    }
  });

  test("every strategy has a label and a teaching note", () => {
    for (const s of SOLUTION_STRATEGIES) {
      assert.ok(STRATEGY_LABELS[s]?.length > 0, `${s} needs a label`);
      assert.ok(STRATEGY_NOTES[s]?.length > 40, `${s} needs a real note`);
    }
  });

  test("isSolutionStrategy rejects anything not in the list", () => {
    assert.ok(isSolutionStrategy("backsolve"));
    assert.ok(!isSolutionStrategy("Backsolve"));
    assert.ok(!isSolutionStrategy("__proto__"));
    assert.ok(!isSolutionStrategy(""));
  });
});
