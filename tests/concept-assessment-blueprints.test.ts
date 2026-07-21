import assert from "node:assert/strict";
import test from "node:test";
import {
  CONCEPT_EVIDENCE_STAGES,
  PILOT_ASSESSMENT_BLUEPRINTS,
  requiredUniqueScoredItemsForConcept,
  validateAssessmentBlueprints,
} from "../curriculum/v3/assessment-blueprints.ts";
import { buildCoverageLedger } from "../curriculum/v3/coverage.ts";
import { buildCurriculumV3 } from "../curriculum/v3/graph.ts";
import { PILOT_CONCEPTS } from "../curriculum/v3/pilot-concepts.ts";

const curriculum = buildCurriculumV3();

test("pilot chapter blueprints cover every concept at every closed-loop stage", () => {
  assert.equal(PILOT_ASSESSMENT_BLUEPRINTS.length, 3);
  assert.deepEqual(validateAssessmentBlueprints(curriculum), []);
  assert.equal(
    PILOT_ASSESSMENT_BLUEPRINTS.flatMap((blueprint) => blueprint.slots)
      .length,
    PILOT_CONCEPTS.length * CONCEPT_EVIDENCE_STAGES.length,
  );
  for (const concept of PILOT_CONCEPTS) {
    assert.equal(
      requiredUniqueScoredItemsForConcept(concept.id),
      CONCEPT_EVIDENCE_STAGES.length,
    );
  }
});

test("the blueprint raises pilot proof demand and keeps unavailable tests closed", () => {
  const ledger = buildCoverageLedger(curriculum);
  const pilotIds = new Set(PILOT_CONCEPTS.map((concept) => concept.id));
  const pilotCells = ledger.concepts.filter((cell) =>
    pilotIds.has(cell.conceptId),
  );
  assert.equal(pilotCells.length, 43);
  assert.ok(pilotCells.every((cell) => cell.scoredItemRequirement === 7));
  assert.ok(pilotCells.every((cell) => !cell.assessmentEligible));
  assert.ok(
    pilotCells.every((cell) =>
      cell.shortfalls.includes("replayably verified scored items 0/7"),
    ),
  );
  const nonPilot = ledger.concepts.find((cell) => !pilotIds.has(cell.conceptId));
  assert.equal(nonPilot?.scoredItemRequirement, 6);
});
