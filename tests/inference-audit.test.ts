import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { MIN_LABELLED } from "../lib/inference-audit.ts";
import { attributeError } from "../lib/error-inference.ts";
import { ERROR_TYPES } from "../lib/taxonomy.ts";

/**
 * The arithmetic of "was the suggestion any good", pinned without a database.
 *
 * `suggestionAgreement()` itself is a query, and its behaviour against real
 * rows is checked by `pnpm check:inference` — which drives the actual write
 * path rather than a copy of it. What is worth pinning here is the part a
 * future edit is most likely to get wrong: the rule that a rate is withheld
 * below the floor rather than printed on noise, and the property the whole
 * record depends on — that a suggestion is a *function of the attempt*, so an
 * override is only meaningful if the suggestion beside it was the one shown.
 */

/** The same shape `suggestionAgreement()` folds rows into, extracted so the
 *  rule can be tested without standing up a database. */
function agreementRate(accepted: number, labelled: number): number | null {
  return labelled >= MIN_LABELLED ? accepted / labelled : null;
}

describe("inference audit", () => {
  test("a rate is withheld below the floor, not printed on noise", () => {
    assert.equal(agreementRate(0, 0), null);
    assert.equal(agreementRate(9, 10), null);
    assert.equal(agreementRate(1, MIN_LABELLED - 1), null);
    assert.equal(agreementRate(0, MIN_LABELLED), 0);
    assert.equal(agreementRate(MIN_LABELLED, MIN_LABELLED), 1);
  });

  test("the floor is high enough that one session cannot set it", () => {
    // A ten-question drill must not be able to produce a printable rate; the
    // card exists to be trusted, and a number off one sitting would not be.
    assert.ok(MIN_LABELLED > 10);
  });

  test("the suggestion is a function of the attempt, so it is reproducible", () => {
    const input = {
      correct: false,
      timeSeconds: 210,
      difficulty: 4 as const,
      confidence: "lock" as const,
      selectedIndex: 1,
      correctIndex: 3,
      chosenTrap: "Adds the two times directly instead of adding their rates.",
      subtopicAccuracy: 0.3,
      subtopicAttempts: 12,
    };
    const a = attributeError(input);
    const b = attributeError(input);
    assert.deepEqual(a.best, b.best);
    assert.ok(a.best != null);
    assert.ok(ERROR_TYPES.includes(a.best.errorType));
    // …and the confidence stored beside it is the normalized share, so it is
    // comparable across attempts rather than a raw score.
    const total = a.candidates.reduce((s, c) => s + c.confidence, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `candidate shares sum to ${total}`);
  });

  test("a correct answer yields no suggestion to record", () => {
    const a = attributeError({
      correct: true,
      timeSeconds: 90,
      difficulty: 3,
      confidence: "lean",
      selectedIndex: 2,
      correctIndex: 2,
      chosenTrap: null,
      subtopicAccuracy: 0.8,
      subtopicAttempts: 20,
    });
    assert.equal(a.best, null);
    assert.deepEqual(a.candidates, []);
  });

  test("an evidence-free miss still returns no suggestion, so a zero is recordable", () => {
    // This is the case the write path stores as "we looked and found
    // nothing" — distinguishable from "nobody looked", which is what the
    // RECORDED gate turns on.
    const a = attributeError({
      correct: false,
      timeSeconds: 128,
      difficulty: 3,
      confidence: "lean",
      selectedIndex: 0,
      correctIndex: 2,
      chosenTrap: null,
      subtopicAccuracy: null,
      subtopicAttempts: 0,
    });
    assert.equal(a.best, null);
  });
});
