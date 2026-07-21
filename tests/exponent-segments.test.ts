import assert from "node:assert/strict";
import test from "node:test";
import { buildCurriculumV3 } from "../curriculum/v3/graph.ts";
import { PILOT_CONCEPT_IDS } from "../curriculum/v3/pilot-concepts.ts";
import { EXPONENT_SEGMENTS } from "../curriculum/v3/segments/exponents.ts";
import { validateConceptSegments } from "../curriculum/v3/segments/validate.ts";

const curriculum = buildCurriculumV3();
const knownConceptIds = new Set(curriculum.concepts.map((concept) => concept.id));
const expectedExponentIds = new Set(Object.values(PILOT_CONCEPT_IDS.exponents));

function segment(conceptId: string) {
  const match = EXPONENT_SEGMENTS.find((item) => item.conceptId === conceptId);
  assert.ok(match, `missing segment ${conceptId}`);
  return match;
}

test("exponent segments cover every pilot leaf exactly once", () => {
  assert.equal(EXPONENT_SEGMENTS.length, 14);
  assert.deepEqual(
    new Set(EXPONENT_SEGMENTS.map((item) => item.conceptId)),
    expectedExponentIds,
  );
  assert.deepEqual(validateConceptSegments(EXPONENT_SEGMENTS, knownConceptIds), []);
});

test("every exponent segment carries complete independent lesson evidence", () => {
  for (const item of EXPONENT_SEGMENTS) {
    assert.equal(item.sourcePath, "curriculum/v3/segments/exponents.ts");
    assert.equal(item.examples.length, 3, `${item.conceptId} example count`);
    assert.equal(item.misconceptions.length, 3, `${item.conceptId} misconception count`);
    assert.equal(item.checks.length, 6, `${item.conceptId} check count`);
    assert.deepEqual(
      new Set(item.examples.map((example) => example.role)),
      new Set(["foundation", "application", "transfer_or_boundary"]),
    );
    assert.equal(
      item.checks.filter((check) => check.independence === "guided").length,
      3,
      `${item.conceptId} guided split`,
    );
    assert.equal(
      item.checks.filter((check) => check.independence === "independent").length,
      3,
      `${item.conceptId} independent split`,
    );
    for (const exercise of [...item.examples, ...item.checks]) {
      assert.deepEqual(
        exercise.hints.map((hint) => hint.kind),
        ["goal", "trigger", "setup", "next_move"],
      );
    }
  }
});

test("stable IDs and representative answer keys survive arithmetic spot checks", () => {
  const E = PILOT_CONCEPT_IDS.exponents;

  const fractional = segment(E.fractional);
  assert.equal(
    fractional.examples[0].id,
    "example.q86.exponents.fractional.perfect-fourth-root",
  );
  assert.deepEqual(fractional.examples[0].answer, { kind: "numeric", value: 27 });
  assert.deepEqual(fractional.examples[1].answer, { kind: "numeric", value: 4 });

  const commonBase = segment(E.commonBase);
  assert.equal(commonBase.examples[0].answer.kind, "numeric");
  assert.equal(commonBase.examples[0].answer.value, 5);
  assert.equal(commonBase.checks[3].answer.kind, "numeric");
  assert.equal(commonBase.checks[3].answer.value, -3 / 2);

  const preserveZero = segment(E.preserveZero);
  assert.equal(
    preserveZero.examples[2].id,
    "example.q86.exponents.preserve-zero.exponential-variable-factor",
  );
  assert.equal(preserveZero.examples[2].answer.kind, "exact");
  assert.ok(preserveZero.examples[2].answer.acceptedAnswers.includes("0, 2"));

  const radicals = segment(E.radicals);
  assert.deepEqual(radicals.examples[2].answer, { kind: "numeric", value: 4 });

  const hiddenQuadratic = segment(E.hiddenQuadratic);
  assert.deepEqual(hiddenQuadratic.examples[1].answer, { kind: "numeric", value: 1 });

  const fluency = segment(E.fluency);
  assert.deepEqual(fluency.checks[0].answer, { kind: "numeric", value: 3 });
});

