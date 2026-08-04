import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";
import {
  TRAP_RULE_IDS,
  classifyTrap,
  classifyTrapRule,
  ruleTier,
  trapLabel,
  trapLabelWeight,
} from "../lib/trap-classify.ts";
import { ERROR_TYPES, type ErrorType } from "../lib/taxonomy.ts";

/**
 * The classifier's contract is not "label everything" — it is "when you
 * label, be right, and say how sure you are".
 *
 * The properties below are the ones the diagnosis depends on and that a
 * later widening could quietly break. They deliberately do *not* pin
 * individual sentences to individual types: that is what
 * `content/trap-gold.json` and `pnpm check:traps` are for, measured against
 * a blind hand-labelled sample rather than against assertions written by
 * whoever last edited the rules.
 */

const GOLD = path.join(import.meta.dirname, "..", "content", "trap-gold.json");
type GoldRow = { text: string; label: ErrorType | null | "unlabelled"; split: "train" | "test" };
const gold = JSON.parse(readFileSync(GOLD, "utf8")).samples as GoldRow[];

describe("trap classifier", () => {
  test("declines rather than guesses", () => {
    // A choice description with no mistake in it must not be bucketed.
    assert.equal(classifyTrap("The number 12."), null);
    assert.equal(classifyTrap(""), null);
    assert.equal(classifyTrap("$x = 4$"), null);
    assert.equal(trapLabel(null), "Unclassified");
  });

  test("every label it returns is one of the six error types", () => {
    for (const row of gold) {
      const got = classifyTrap(row.text);
      if (got != null) assert.ok(ERROR_TYPES.includes(got), `${got} is not an error type`);
    }
  });

  test("rule ids are unique, and every fired rule resolves to a tier", () => {
    assert.equal(new Set(TRAP_RULE_IDS).size, TRAP_RULE_IDS.length);
    for (const row of gold) {
      const rule = classifyTrapRule(row.text);
      if (classifyTrap(row.text) == null) {
        assert.equal(rule, null, `declined but reported rule ${rule}`);
      } else {
        assert.ok(rule != null && TRAP_RULE_IDS.includes(rule), `unknown rule ${rule}`);
        assert.ok(ruleTier(rule) != null, `rule ${rule} has no tier`);
      }
    }
  });

  test("classify and rule agree about whether anything fired", () => {
    for (const row of gold) {
      assert.equal(
        classifyTrap(row.text) == null,
        classifyTrapRule(row.text) == null,
        `disagreement on: ${row.text}`,
      );
    }
  });

  test("the weight never exceeds the tier's measured precision", () => {
    // Both values are the tiers' blind-test precision rounded down (87.5% and
    // 63.2%). If a future edit raises them, the audit's numbers have to move
    // first — this signal must not claim more than has been shown.
    assert.equal(trapLabelWeight("Sign slip on the center."), 1);
    assert.ok(trapLabelWeight("Adds the two radii instead of intersecting the intervals.") <= 0.7);
    assert.equal(trapLabelWeight("The number 12."), 0);
    for (const row of gold) {
      const w = trapLabelWeight(row.text);
      assert.ok(w >= 0 && w <= 1);
      assert.equal(w === 0, classifyTrap(row.text) == null);
    }
  });

  test("a named rule always outranks an inferred one on the same sentence", () => {
    // Ordering is the whole design: the specific bands read a sentence before
    // the catch-alls do. A sentence carrying an explicit slip word must not
    // fall through to the operation-shaped fallback.
    const both = "Multiplies the two totals instead of adding them, with a sign slip on the second.";
    assert.equal(ruleTier(classifyTrapRule(both)), "named");
    assert.equal(classifyTrap(both), "calculation_error");
  });

  test("the gold set is a genuine holdout: no sentence is in both splits", () => {
    const train = new Set(gold.filter((r) => r.split === "train").map((r) => r.text));
    for (const row of gold.filter((r) => r.split === "test")) {
      assert.ok(!train.has(row.text), `test sentence also in train: ${row.text}`);
    }
    assert.ok(gold.filter((r) => r.split === "test").length >= 100);
    assert.ok(
      gold.every((r) => r.label !== "unlabelled"),
      "every drawn sentence must be hand-labelled before it can be measured",
    );
  });
});
