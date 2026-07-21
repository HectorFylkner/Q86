import assert from "node:assert/strict";
import test from "node:test";
import { buildCurriculumV3 } from "../curriculum/v3/graph.ts";
import { PILOT_CONCEPT_SEGMENTS } from "../curriculum/v3/segments/index.ts";
import type { ConceptSegment } from "../curriculum/v3/segments/types.ts";
import { validateConceptSegments } from "../curriculum/v3/segments/validate.ts";

const curriculum = buildCurriculumV3();
const conceptIds = new Set(curriculum.concepts.map((concept) => concept.id));

test("registered production micro-lessons meet the complete segment contract", () => {
  assert.ok(PILOT_CONCEPT_SEGMENTS.length > 0);
  assert.deepEqual(validateConceptSegments(PILOT_CONCEPT_SEGMENTS, conceptIds), []);
  for (const segment of PILOT_CONCEPT_SEGMENTS) {
    assert.equal(segment.examples.length, 3);
    assert.equal(segment.misconceptions.length, 3);
    assert.equal(segment.checks.length, 6);
    assert.deepEqual(
      new Set(segment.examples.map((example) => example.role)),
      new Set(["foundation", "application", "transfer_or_boundary"]),
    );
    assert.ok(segment.checks.some((check) => check.independence === "guided"));
    assert.ok(segment.checks.some((check) => check.independence === "independent"));
    for (const item of [...segment.examples, ...segment.checks]) {
      assert.deepEqual(
        item.hints.map((hint) => hint.kind),
        ["goal", "trigger", "setup", "next_move"],
      );
    }
  }
});

test("segment validation rejects hollow evidence and a broken hint ladder", () => {
  const source = PILOT_CONCEPT_SEGMENTS[0];
  const broken = {
    ...source,
    examples: source.examples.slice(0, 1),
    checks: source.checks.slice(0, 2).map((check, index) =>
      index === 0 ? { ...check, hints: [...check.hints].reverse() } : check,
    ),
    misconceptions: source.misconceptions.slice(0, 1),
  } as unknown as ConceptSegment;
  const codes = validateConceptSegments([broken], conceptIds).map((issue) => issue.code);
  assert.ok(codes.includes("example_floor"));
  assert.ok(codes.includes("check_floor"));
  assert.ok(codes.includes("misconception_floor"));
  assert.ok(codes.includes("hint_ladder_order"));
});

test("segment evidence enriches coverage but does not manufacture assessment readiness", () => {
  for (const segment of PILOT_CONCEPT_SEGMENTS) {
    const concept = curriculum.concepts.find((item) => item.id === segment.conceptId);
    assert.equal(concept?.lessonStatus, "production_ready");
    assert.equal(concept?.productionReady, false);
    assert.ok(
      segment.misconceptions.every((item) => concept?.misconceptionIds.includes(item.id)),
    );
  }
});
