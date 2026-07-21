import assert from "node:assert/strict";
import test from "node:test";
import { buildCurriculumV3 } from "../curriculum/v3/graph.ts";
import { PILOT_CONCEPT_IDS } from "../curriculum/v3/pilot-concepts.ts";
import { ALGEBRAIC_TRANSLATION_SEGMENTS } from "../curriculum/v3/segments/algebraic-translation.ts";
import { validateConceptSegments } from "../curriculum/v3/segments/validate.ts";

const curriculum = buildCurriculumV3();
const knownConceptIds = new Set(curriculum.concepts.map((concept) => concept.id));
const expectedConceptIds = Object.values(PILOT_CONCEPT_IDS.algebraicTranslation).sort();

test("all 13 algebraic-translation leaves have complete, valid segments", () => {
  assert.equal(ALGEBRAIC_TRANSLATION_SEGMENTS.length, 13);
  assert.deepEqual(
    ALGEBRAIC_TRANSLATION_SEGMENTS.map((segment) => segment.conceptId).sort(),
    expectedConceptIds,
  );
  assert.deepEqual(
    validateConceptSegments(ALGEBRAIC_TRANSLATION_SEGMENTS, knownConceptIds),
    [],
  );

  for (const segment of ALGEBRAIC_TRANSLATION_SEGMENTS) {
    const concept = curriculum.concepts.find((candidate) => candidate.id === segment.conceptId);
    assert.equal(concept?.kind, "assessable_leaf");
    assert.equal(concept?.parentSubtopic, "algebraic_translation");
    assert.equal(segment.sourcePath, "curriculum/v3/segments/algebraic-translation.ts");
    assert.equal(segment.examples.length, 3);
    assert.equal(segment.misconceptions.length, 3);
    assert.equal(segment.checks.length, 6);
    assert.deepEqual(
      new Set(segment.examples.map((example) => example.role)),
      new Set(["foundation", "application", "transfer_or_boundary"]),
    );
    assert.equal(segment.checks.filter((check) => check.independence === "guided").length, 3);
    assert.equal(segment.checks.filter((check) => check.independence === "independent").length, 3);
    for (const item of [...segment.examples, ...segment.checks]) {
      assert.ok(item.conceptIds.includes(segment.conceptId), item.id);
      assert.deepEqual(
        item.hints.map((hint) => hint.kind),
        ["goal", "trigger", "setup", "next_move"],
      );
    }
  }
});

test("translation segment evidence has stable, unique entity IDs", () => {
  const stableIds = ALGEBRAIC_TRANSLATION_SEGMENTS.flatMap((segment) => [
    segment.contrastPair.id,
    ...segment.prerequisiteChecks.map((item) => item.id),
    ...segment.examples.flatMap((item) => [item.id, ...item.hints.map((hint) => hint.id)]),
    ...segment.misconceptions.map((item) => item.id),
    ...segment.checks.flatMap((item) => [item.id, ...item.hints.map((hint) => hint.id)]),
  ]);

  assert.equal(new Set(stableIds).size, stableIds.length);
  for (const id of stableIds) {
    assert.match(id, /^(?:example|check|prereq|contrast|misconception|hint)\.q86\.[a-z0-9._-]+$/);
  }
  assert.equal(ALGEBRAIC_TRANSLATION_SEGMENTS.flatMap((segment) => segment.examples).length, 39);
  assert.equal(ALGEBRAIC_TRANSLATION_SEGMENTS.flatMap((segment) => segment.checks).length, 78);
  assert.equal(ALGEBRAIC_TRANSLATION_SEGMENTS.flatMap((segment) => segment.misconceptions).length, 39);
  assert.equal(
    ALGEBRAIC_TRANSLATION_SEGMENTS.flatMap((segment) => [
      ...segment.examples.flatMap((item) => item.hints),
      ...segment.checks.flatMap((item) => item.hints),
    ]).length,
    468,
  );
});

test("representative answer keys preserve translation direction and boundary math", () => {
  const items = ALGEBRAIC_TRANSLATION_SEGMENTS.flatMap((segment) => [
    ...segment.examples,
    ...segment.checks,
  ]);
  const answerFor = (suffix: string) => {
    const item = items.find((candidate) => candidate.id.endsWith(suffix));
    assert.ok(item, suffix);
    return item.answer;
  };

  assert.deepEqual(answerFor("dictionary.three-times-a-sum"), {
    kind: "multiple_choice",
    choices: ["$3x+4=27$", "$3(x+4)=27$", "$x+12=27$", "$(3x)+4x=27$"],
    correctIndex: 1,
  });
  assert.deepEqual(answerFor("integer-endpoints.negative-strict-upper-bound"), {
    kind: "numeric",
    value: -3,
  });
  assert.deepEqual(answerFor("linked-one-variable.three-times-count"), {
    kind: "numeric",
    value: 36,
  });
  assert.deepEqual(answerFor("fixed-pool.six-versus-nine-transfer"), {
    kind: "numeric",
    value: 270,
  });
  assert.deepEqual(answerFor("consistency.third-equation-parameter"), {
    kind: "numeric",
    value: 4,
  });
  assert.deepEqual(answerFor("digits.three-digit-reversal-transfer"), {
    kind: "numeric",
    value: 834,
  });
  assert.deepEqual(answerFor("integer-constraints.nonnegative-includes-zero"), {
    kind: "numeric",
    value: 3,
  });
});
