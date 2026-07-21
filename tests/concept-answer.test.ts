import assert from "node:assert/strict";
import test from "node:test";
import {
  conceptContentVersionNumber,
  gradeConceptAnswer,
  parseSimpleNumericAnswer,
} from "../lib/concept-answer.ts";

test("concept answers grade exact text, fractions, decimals, and choices", () => {
  assert.equal(
    gradeConceptAnswer(
      { kind: "exact", acceptedAnswers: ["No selected tile is blue"] },
      "  no selected tile is blue. ",
    ),
    true,
  );
  assert.equal(parseSimpleNumericAnswer(" 91 / 216 "), 91 / 216);
  assert.equal(parseSimpleNumericAnswer("50%"), 0.5);
  assert.equal(
    gradeConceptAnswer({ kind: "numeric", value: 2 / 3 }, "2/3"),
    true,
  );
  assert.equal(
    gradeConceptAnswer(
      { kind: "multiple_choice", choices: ["a", "b", "c"], correctIndex: 2 },
      "2",
    ),
    true,
  );
});

test("concept content versions convert deterministically for immutable evidence", () => {
  assert.equal(conceptContentVersionNumber("3.0.0"), 3_000_000);
  assert.equal(conceptContentVersionNumber("3.4.12-draft.2"), 3_004_012);
  assert.throws(() => conceptContentVersionNumber("draft"));
});
