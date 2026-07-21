import { parseLesson } from "../../lib/lesson-parse.ts";
import { readLesson } from "../../lib/lessons.ts";
import { buildCoverageLedger, readSeedBank, stableQuestionUid } from "./coverage.ts";
import { buildCurriculumV3, type CurriculumV3 } from "./graph.ts";
import { PILOT_SUBTOPICS } from "./pilot-concepts.ts";
import type { ConceptRecord, CoverageLedger } from "./types.ts";

export type CurriculumValidationIssue = {
  code: string;
  message: string;
};

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function prerequisiteIssues(
  concepts: readonly ConceptRecord[],
): CurriculumValidationIssue[] {
  const issues: CurriculumValidationIssue[] = [];
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  for (const concept of concepts) {
    for (const prerequisite of concept.prerequisiteConceptIds) {
      if (!conceptIds.has(prerequisite)) {
        issues.push({
          code: "missing_prerequisite",
          message: `${concept.id} requires missing concept ${prerequisite}`,
        });
      }
      if (prerequisite === concept.id) {
        issues.push({
          code: "self_prerequisite",
          message: `${concept.id} lists itself as a prerequisite`,
        });
      }
    }
  }

  const state = new Map<string, "visiting" | "visited">();
  const stack: string[] = [];
  const visit = (id: string) => {
    if (state.get(id) === "visited") return;
    if (state.get(id) === "visiting") {
      const cycleAt = stack.indexOf(id);
      const cycle = [...stack.slice(cycleAt), id];
      issues.push({
        code: "prerequisite_cycle",
        message: `Prerequisite cycle: ${cycle.join(" -> ")}`,
      });
      return;
    }
    state.set(id, "visiting");
    stack.push(id);
    const concept = concepts.find((candidate) => candidate.id === id);
    for (const prerequisite of concept?.prerequisiteConceptIds ?? []) {
      if (conceptIds.has(prerequisite)) visit(prerequisite);
    }
    stack.pop();
    state.set(id, "visited");
  };
  for (const concept of concepts) visit(concept.id);
  return issues;
}

function evidenceSourceIssues(curriculum: CurriculumV3): CurriculumValidationIssue[] {
  const issues: CurriculumValidationIssue[] = [];
  const parsedByChapter = new Map<string, NonNullable<ReturnType<typeof parseLesson>>>();
  for (const chapter of PILOT_SUBTOPICS) {
    const lesson = readLesson(chapter);
    const parsed = lesson && parseLesson(lesson.body);
    if (!parsed) {
      issues.push({ code: "pilot_lesson_parse", message: `Pilot lesson ${chapter} does not parse` });
      continue;
    }
    parsedByChapter.set(chapter, parsed);
  }

  for (const example of curriculum.examples) {
    const parsed = parsedByChapter.get(example.chapter);
    if (!parsed?.examples.some((item) => item.question.includes(example.sourceQuestionNeedle))) {
      issues.push({
        code: "orphan_example_source",
        message: `${example.id} cannot find question needle ${example.sourceQuestionNeedle}`,
      });
    }
  }
  for (const check of curriculum.checks) {
    const parsed = parsedByChapter.get(check.chapter);
    if (!parsed?.checklist.some((item) => item.includes(check.sourceTextNeedle))) {
      issues.push({
        code: "orphan_check_source",
        message: `${check.id} cannot find checklist needle ${check.sourceTextNeedle}`,
      });
    }
  }
  return issues;
}

export function validateCurriculumV3(
  curriculum = buildCurriculumV3(),
  ledger = buildCoverageLedger(curriculum),
): CurriculumValidationIssue[] {
  const issues: CurriculumValidationIssue[] = [];
  const conceptIds = new Set(curriculum.concepts.map((concept) => concept.id));
  const misconceptionIds = new Set(curriculum.misconceptions.map((item) => item.id));
  const archetypeIds = new Set(curriculum.archetypes.map((item) => item.id));
  const surfaceIds = new Set(curriculum.archetypes.flatMap((item) => item.surfaceFormIds));
  const bank = readSeedBank();

  const globallyStableIds = [
    ...curriculum.concepts.map((item) => item.id),
    ...curriculum.concepts.flatMap((item) => item.methods.map((method) => method.id)),
    ...curriculum.coreIdeaInventory.map((item) => item.sourceIdeaId),
    ...curriculum.misconceptions.map((item) => item.id),
    ...curriculum.archetypes.map((item) => item.id),
    ...curriculum.archetypes.flatMap((item) => item.surfaceFormIds),
    ...curriculum.examples.map((item) => item.id),
    ...curriculum.checks.map((item) => item.id),
    ...ledger.questionMappings.map((item) => item.questionUid),
  ];
  for (const duplicate of duplicateValues(globallyStableIds)) {
    issues.push({ code: "duplicate_stable_id", message: `Duplicate stable ID ${duplicate}` });
  }
  for (const id of globallyStableIds) {
    if (!/^(?:c|idea|method|misconception|archetype|surface|example|check|question)\.q86\.[a-z0-9._-]+$/.test(id)) {
      issues.push({ code: "invalid_stable_id", message: `Invalid stable ID ${id}` });
    }
  }

  const chapterIdeaCounts = new Map<string, number>();
  for (const item of curriculum.coreIdeaInventory) {
    chapterIdeaCounts.set(item.chapter, (chapterIdeaCounts.get(item.chapter) ?? 0) + 1);
    if (item.disposition === "out_of_scope") {
      if (item.canonicalConceptId !== null)
        issues.push({ code: "invalid_out_of_scope", message: `${item.sourceIdeaId} is out of scope but has a canonical concept` });
    } else if (!item.canonicalConceptId || !conceptIds.has(item.canonicalConceptId)) {
      issues.push({ code: "orphan_idea_mapping", message: `${item.sourceIdeaId} maps to missing concept ${item.canonicalConceptId}` });
    }
  }
  if (chapterIdeaCounts.size !== 26) {
    issues.push({ code: "chapter_inventory_count", message: `Expected 26 inventoried chapters, found ${chapterIdeaCounts.size}` });
  }

  issues.push(...prerequisiteIssues(curriculum.concepts));
  for (const concept of curriculum.concepts) {
    if (concept.canonicalOwner !== concept.id) {
      issues.push({ code: "invalid_canonical_owner", message: `${concept.id} names ${concept.canonicalOwner} as owner; leaf records must own themselves` });
    }
    for (const confusable of concept.confusableConceptIds) {
      if (!conceptIds.has(confusable))
        issues.push({ code: "missing_confusable", message: `${concept.id} references missing confusable ${confusable}` });
    }
    for (const misconception of concept.misconceptionIds) {
      if (!misconceptionIds.has(misconception))
        issues.push({ code: "missing_misconception", message: `${concept.id} references missing misconception ${misconception}` });
    }
    for (const archetype of concept.archetypeIds) {
      if (!archetypeIds.has(archetype))
        issues.push({ code: "missing_archetype", message: `${concept.id} references missing archetype ${archetype}` });
    }
    for (const surface of concept.surfaceFormIds) {
      if (!surfaceIds.has(surface))
        issues.push({ code: "missing_surface_form", message: `${concept.id} references missing surface form ${surface}` });
    }
    if (concept.kind === "assessable_leaf") {
      if (concept.boundaries.length === 0 || concept.edgeCases.length === 0 || concept.methods.length === 0)
        issues.push({ code: "thin_pilot_record", message: `${concept.id} lacks a boundary, edge case, or method` });
      if (concept.objective.length < 30)
        issues.push({ code: "thin_pilot_objective", message: `${concept.id} objective is not observable enough` });
    }
  }

  for (const item of curriculum.misconceptions) {
    if (!conceptIds.has(item.conceptId))
      issues.push({ code: "orphan_misconception", message: `${item.id} maps to missing ${item.conceptId}` });
  }
  for (const item of curriculum.archetypes) {
    if (!conceptIds.has(item.conceptId))
      issues.push({ code: "orphan_archetype", message: `${item.id} maps to missing ${item.conceptId}` });
  }
  for (const item of [...curriculum.examples, ...curriculum.checks]) {
    for (const conceptId of item.conceptIds) {
      if (!conceptIds.has(conceptId))
        issues.push({ code: "orphan_evidence_mapping", message: `${item.id} maps to missing ${conceptId}` });
    }
  }

  if (ledger.questionMappings.length !== bank.questions.length) {
    issues.push({ code: "orphan_question", message: `Expected ${bank.questions.length} question dispositions, found ${ledger.questionMappings.length}` });
  }
  const expectedQuestionIds = new Set(bank.questions.map(stableQuestionUid));
  for (const mapping of ledger.questionMappings) {
    if (!expectedQuestionIds.has(mapping.questionUid))
      issues.push({ code: "orphan_question_mapping", message: `${mapping.questionUid} is absent from the bank` });
    if (mapping.status === "mapped") {
      if (!mapping.primaryConceptId || !conceptIds.has(mapping.primaryConceptId))
        issues.push({ code: "orphan_question_concept", message: `${mapping.questionUid} maps to missing ${mapping.primaryConceptId}` });
      for (const secondary of mapping.secondaryConceptIds) {
        if (!conceptIds.has(secondary))
          issues.push({ code: "orphan_question_secondary", message: `${mapping.questionUid} has missing secondary ${secondary}` });
      }
      if (mapping.archetypeId && !archetypeIds.has(mapping.archetypeId))
        issues.push({ code: "orphan_question_archetype", message: `${mapping.questionUid} has missing archetype ${mapping.archetypeId}` });
      if (mapping.surfaceFormId && !surfaceIds.has(mapping.surfaceFormId))
        issues.push({ code: "orphan_question_surface", message: `${mapping.questionUid} has missing surface ${mapping.surfaceFormId}` });
    } else if (mapping.primaryConceptId !== null) {
      issues.push({ code: "invalid_unresolved_question", message: `${mapping.questionUid} is unresolved but names ${mapping.primaryConceptId}` });
    }
  }

  const coverageById = new Map(ledger.concepts.map((item) => [item.conceptId, item]));
  for (const concept of curriculum.concepts) {
    const coverage = coverageById.get(concept.id);
    if (!coverage) {
      issues.push({ code: "missing_coverage_cell", message: `No coverage cell for ${concept.id}` });
      continue;
    }
    if (concept.productionReady && (
      concept.lessonStatus !== "production_ready"
      || concept.assessmentStatus !== "eligible"
      || !coverage.assessmentEligible
      || coverage.shortfalls.length > 0
    )) {
      issues.push({
        code: "invalid_production_ready",
        message: `${concept.id} is marked production-ready without the required teaching and assessment evidence: ${coverage.shortfalls.join(", ")}`,
      });
    }
  }
  issues.push(...evidenceSourceIssues(curriculum));
  return issues;
}

export function withProductionReadyConcept(
  curriculum: CurriculumV3,
  conceptId: string,
): CurriculumV3 {
  return {
    ...curriculum,
    concepts: curriculum.concepts.map((concept) =>
      concept.id === conceptId
        ? { ...concept, productionReady: true, lessonStatus: "production_ready" as const, assessmentStatus: "eligible" as const }
        : concept,
    ),
  } as CurriculumV3;
}

export function validateCurrentCurriculum(): {
  curriculum: CurriculumV3;
  ledger: CoverageLedger;
  issues: CurriculumValidationIssue[];
} {
  const curriculum = buildCurriculumV3();
  const ledger = buildCoverageLedger(curriculum);
  return { curriculum, ledger, issues: validateCurriculumV3(curriculum, ledger) };
}
