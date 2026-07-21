import assert from "node:assert/strict";
import test from "node:test";
import { buildCurriculumV3 } from "../curriculum/v3/graph.ts";
import { PILOT_CONCEPT_IDS } from "../curriculum/v3/pilot-concepts.ts";
import { PROBABILITY_AT_LEAST_ONE_SEGMENT } from "../curriculum/v3/segments/probability-at-least-one.ts";
import { PROBABILITY_SEGMENTS } from "../curriculum/v3/segments/probability.ts";
import type { AnswerSpec, ConceptSegment } from "../curriculum/v3/segments/types.ts";
import { validateConceptSegments } from "../curriculum/v3/segments/validate.ts";

const probabilityIds = Object.values(PILOT_CONCEPT_IDS.probability);
const allProbabilitySegments: readonly ConceptSegment[] = [
  ...PROBABILITY_SEGMENTS,
  PROBABILITY_AT_LEAST_ONE_SEGMENT,
];
const knownConceptIds = new Set(
  buildCurriculumV3().concepts.map((concept) => concept.id),
);

function answerFor(id: string): AnswerSpec {
  for (const segment of allProbabilitySegments) {
    for (const item of [...segment.examples, ...segment.checks]) {
      if (item.id === id) return item.answer;
    }
  }
  throw new Error("Missing authored item " + id);
}

test("the fifteen new segments complete all sixteen stable probability leaves", () => {
  assert.equal(PROBABILITY_SEGMENTS.length, 15);
  assert.equal(allProbabilitySegments.length, 16);
  assert.deepEqual(
    [...new Set(allProbabilitySegments.map((segment) => segment.conceptId))].sort(),
    [...probabilityIds].sort(),
  );
  assert.deepEqual(
    validateConceptSegments(allProbabilitySegments, knownConceptIds),
    [],
  );
  assert.ok(
    PROBABILITY_SEGMENTS.every(
      (segment) =>
        segment.sourcePath === "curriculum/v3/segments/probability.ts" &&
        probabilityIds.includes(
          segment.conceptId as (typeof probabilityIds)[number],
        ),
    ),
  );
});

test("every probability segment carries independent practice and progressive support", () => {
  for (const segment of PROBABILITY_SEGMENTS) {
    assert.equal(segment.examples.length, 3, segment.conceptId);
    assert.equal(segment.misconceptions.length, 3, segment.conceptId);
    assert.equal(segment.checks.length, 6, segment.conceptId);
    assert.deepEqual(
      new Set(segment.examples.map((example) => example.role)),
      new Set(["foundation", "application", "transfer_or_boundary"]),
      segment.conceptId,
    );
    assert.ok(
      segment.checks.some((check) => check.independence === "guided"),
      segment.conceptId,
    );
    assert.ok(
      segment.checks.some((check) => check.independence === "independent"),
      segment.conceptId,
    );
    for (const item of [...segment.examples, ...segment.checks]) {
      assert.deepEqual(
        item.hints.map((hint) => hint.kind),
        ["goal", "trigger", "setup", "next_move"],
        item.id,
      );
    }
  }
});

test("advanced probability answer keys preserve exact arithmetic and boundary cases", () => {
  assert.deepEqual(
    answerFor("check.q86.probability.combinations.at-least-one-blue"),
    { kind: "numeric", value: 23 / 28 },
  );
  assert.deepEqual(
    answerFor("example.q86.probability.exact-k.three-of-five"),
    { kind: "numeric", value: 80 / 243 },
  );
  assert.deepEqual(
    answerFor("example.q86.probability.occupancy.exactly-one-pair"),
    { kind: "numeric", value: 9 / 16 },
  );
  assert.deepEqual(
    answerFor("example.q86.probability.fixed-points.three-of-five"),
    { kind: "numeric", value: 1 / 12 },
  );
  assert.deepEqual(
    answerFor("check.q86.probability.fixed-points.exactly-two-of-three-impossible"),
    { kind: "numeric", value: 0 },
  );
  assert.deepEqual(
    answerFor("example.q86.probability.inverse-composition.nonunique-mixed-draw"),
    {
      kind: "exact",
      acceptedAnswers: ["4 or 6", "4, 6", "4 and 6", "{4,6}", "{4, 6}"],
    },
  );
  assert.deepEqual(
    answerFor("example.q86.probability.stopping-time.even-with-cap-four"),
    { kind: "numeric", value: 14 / 27 },
  );
});
