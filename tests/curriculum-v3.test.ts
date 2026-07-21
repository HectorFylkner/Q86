import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  buildCoverageLedger,
  buildQuestionMappings,
  readSeedBank,
} from "../curriculum/v3/coverage.ts";
import { buildCurriculumV3, type CurriculumV3 } from "../curriculum/v3/graph.ts";
import { PILOT_SUBTOPICS } from "../curriculum/v3/pilot-concepts.ts";
import type { ConceptRecord, CoverageLedger } from "../curriculum/v3/types.ts";
import {
  prerequisiteIssues,
  validateCurriculumV3,
  withProductionReadyConcept,
} from "../curriculum/v3/validate.ts";

const curriculum = buildCurriculumV3();
const ledger = buildCoverageLedger(curriculum);

function withConcepts(concepts: readonly ConceptRecord[]): CurriculumV3 {
  return { ...curriculum, concepts } as unknown as CurriculumV3;
}

test("all 279 core ideas across 24 content and 2 strategy chapters have stable dispositions", () => {
  assert.equal(curriculum.coreIdeaInventory.length, 279);
  assert.equal(new Set(curriculum.coreIdeaInventory.map((item) => item.chapter)).size, 26);
  assert.equal(
    curriculum.coreIdeaInventory.filter((item) => item.disposition === "deliberate_merge").length,
    12,
  );
  assert.equal(
    curriculum.coreIdeaInventory.filter((item) => item.disposition === "out_of_scope").length,
    0,
  );
  for (const item of curriculum.coreIdeaInventory) {
    assert.match(item.sourceIdeaId, /^idea\.q86\.[a-z0-9._-]+$/);
    assert.doesNotMatch(item.sourceIdeaId, /(?:idea|core)-?\d+(?:$|\.)/);
    assert.ok(item.rationale.length > 20);
  }
});

test("pilot graph contains 43 rich leaves and includes bank-introduced probability families", () => {
  const pilot = curriculum.concepts.filter((concept) => concept.kind === "assessable_leaf");
  assert.equal(pilot.length, 43);
  assert.deepEqual(
    Object.fromEntries(PILOT_SUBTOPICS.map((chapter) => [
      chapter,
      pilot.filter((concept) => concept.parentSubtopic === chapter).length,
    ])),
    {
      exponents_roots_properties: 14,
      algebraic_translation: 13,
      probability: 16,
    },
  );
  for (const concept of pilot) {
    assert.ok(concept.objective.length >= 30);
    assert.ok(concept.boundaries.length > 0);
    assert.ok(concept.edgeCases.length > 0);
    assert.ok(concept.methods.length > 0);
    assert.ok(concept.archetypeIds.length > 0);
    assert.ok(concept.surfaceFormIds.length > 0);
    assert.equal(concept.productionReady, false);
  }
  for (const family of [
    "exact-k-successes-in-repeated-trials",
    "occupancy-collision-probability",
    "matching-and-fixed-point-probability",
    "inverse-without-replacement-composition-inference",
    "finite-stopping-time-probability",
  ]) {
    assert.ok(pilot.some((concept) => concept.id.endsWith(family)), family);
  }
});

test("current graph, evidence references, and readiness claims validate", () => {
  assert.deepEqual(validateCurriculumV3(curriculum, ledger), []);
});

test("prerequisite validator rejects missing IDs and cycles", () => {
  const [first, second] = curriculum.concepts;
  const cyclic = [
    { ...first, prerequisiteConceptIds: [second.id] },
    { ...second, prerequisiteConceptIds: [first.id, "c.q86.quant.missing.concept"] },
    ...curriculum.concepts.slice(2),
  ];
  const codes = prerequisiteIssues(cyclic).map((issue) => issue.code);
  assert.ok(codes.includes("missing_prerequisite"));
  assert.ok(codes.includes("prerequisite_cycle"));
});

test("full validator detects duplicate IDs and orphan core-idea mappings", () => {
  const duplicate = withConcepts([...curriculum.concepts, curriculum.concepts[0]]);
  const duplicateLedger = buildCoverageLedger(duplicate);
  assert.ok(
    validateCurriculumV3(duplicate, duplicateLedger)
      .some((issue) => issue.code === "duplicate_stable_id"),
  );

  const orphan = {
    ...curriculum,
    coreIdeaInventory: curriculum.coreIdeaInventory.map((item, index) =>
      index === 0
        ? { ...item, canonicalConceptId: "c.q86.quant.missing.orphan" }
        : item,
    ),
  } as unknown as CurriculumV3;
  assert.ok(
    validateCurriculumV3(orphan, buildCoverageLedger(orphan))
      .some((issue) => issue.code === "orphan_idea_mapping"),
  );
});

test("full validator detects orphan question mappings", () => {
  const firstMapped = ledger.questionMappings.findIndex((item) => item.status === "mapped");
  assert.ok(firstMapped >= 0);
  const badLedger = {
    ...ledger,
    questionMappings: ledger.questionMappings.map((item, index) =>
      index === firstMapped
        ? { ...item, primaryConceptId: "c.q86.quant.missing.question-concept" }
        : item,
    ),
  } as CoverageLedger;
  assert.ok(
    validateCurriculumV3(curriculum, badLedger)
      .some((issue) => issue.code === "orphan_question_concept"),
  );
});

test("production-ready cannot be asserted below evidence floors", () => {
  const conceptId = curriculum.concepts.find((concept) => concept.kind === "assessable_leaf")!.id;
  const falselyReady = withProductionReadyConcept(curriculum, conceptId);
  const falseLedger = buildCoverageLedger(falselyReady);
  assert.ok(
    validateCurriculumV3(falselyReady, falseLedger)
      .some((issue) => issue.code === "invalid_production_ready"),
  );
});

test("coverage reads all 603 bank questions and dispositions every item", () => {
  assert.equal(ledger.generatedFrom.bankQuestionCount, 603);
  assert.equal(ledger.questionMappings.length, 603);
  assert.equal(ledger.questionMappings.filter((item) => item.status === "mapped").length, 78);
  assert.equal(ledger.unresolvedQuestionIds.length, 525);
  assert.equal(
    ledger.questionMappings.filter((item) => item.mappingConfidence === "provisional_fallback").length,
    0,
  );
  assert.equal(ledger.productionReadyConceptIds.length, 0);
  assert.equal(
    new Set(ledger.concepts.flatMap((item) => item.replayablyVerifiedQuestionIds)).size,
    0,
  );
});

test("checked-in machine-readable coverage ledger matches the live audit", () => {
  const snapshot: unknown = JSON.parse(
    fs.readFileSync("curriculum/v3/coverage-ledger.json", "utf8"),
  );
  const expected = {
    schemaVersion: ledger.schemaVersion,
    generatedFrom: ledger.generatedFrom,
    policy: ledger.policy,
    summary: {
      mappedQuestions: ledger.questionMappings.filter((item) => item.status === "mapped").length,
      unresolvedQuestions: ledger.unresolvedQuestionIds.length,
      teachingReadyConceptSegments: ledger.concepts.filter(
        (item) => item.lessonStatus === "production_ready",
      ).length,
      productionReadyConcepts: ledger.productionReadyConceptIds.length,
      replayablyVerifiedQuestions: new Set(
        ledger.concepts.flatMap((item) => item.replayablyVerifiedQuestionIds),
      ).size,
    },
    concepts: ledger.concepts,
  };
  assert.deepEqual(snapshot, expected);
});

test("question content identity is independent of bank array position", () => {
  const bank = readSeedBank();
  const forward = buildQuestionMappings(curriculum, bank).map((item) => item.questionUid).sort();
  const reverseBank = { ...bank, questions: [...bank.questions].reverse() };
  const reversed = buildQuestionMappings(curriculum, reverseBank).map((item) => item.questionUid).sort();
  assert.deepEqual(reversed, forward);
  assert.deepEqual(
    buildQuestionMappings(curriculum, bank).map((item) => item.questionUid),
    bank.questions.map((question) => question.uid),
  );
});
