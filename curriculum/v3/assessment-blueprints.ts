import type { QuestionFormat } from "../../lib/taxonomy.ts";
import { PILOT_CONCEPTS, PILOT_SUBTOPICS } from "./pilot-concepts.ts";
import type { CurriculumV3 } from "./graph.ts";

export const ASSESSMENT_BLUEPRINT_VERSION = "3.0.0" as const;

export const CONCEPT_EVIDENCE_STAGES = [
  "diagnostic_or_test_out",
  "chapter_easy",
  "chapter_medium",
  "chapter_hard",
  "delayed_short",
  "delayed_long",
  "timed_transfer",
] as const;

export type ConceptEvidenceStage = (typeof CONCEPT_EVIDENCE_STAGES)[number];

type StagePolicy = {
  difficulty: readonly [min: number, max: number];
  formats: readonly QuestionFormat[];
  timed: boolean;
};

export const CONCEPT_STAGE_POLICY: Readonly<
  Record<ConceptEvidenceStage, StagePolicy>
> = {
  diagnostic_or_test_out: {
    difficulty: [2, 4],
    formats: ["problem_solving", "data_sufficiency"],
    timed: false,
  },
  chapter_easy: {
    difficulty: [1, 2],
    formats: ["problem_solving", "data_sufficiency"],
    timed: false,
  },
  chapter_medium: {
    difficulty: [3, 4],
    formats: ["problem_solving", "data_sufficiency"],
    timed: false,
  },
  chapter_hard: {
    difficulty: [4, 5],
    formats: ["problem_solving", "data_sufficiency"],
    timed: false,
  },
  delayed_short: {
    difficulty: [2, 4],
    formats: ["problem_solving", "data_sufficiency"],
    timed: false,
  },
  delayed_long: {
    difficulty: [3, 5],
    formats: ["problem_solving", "data_sufficiency"],
    timed: false,
  },
  timed_transfer: {
    difficulty: [3, 5],
    // Current GMAT Quant section semantics: certification transfer uses PS.
    // DS remains usable in the untimed Data Insights bridge stages above.
    formats: ["problem_solving"],
    timed: true,
  },
};

export type AssessmentBlueprintSlot = {
  id: string;
  conceptId: string;
  stage: ConceptEvidenceStage;
  difficulty: readonly [min: number, max: number];
  formats: readonly QuestionFormat[];
  requiresUnseenQuestion: true;
  requiresDistinctVariantFamily: true;
  requiresReplayableVerification: true;
};

export type ChapterAssessmentBlueprint = {
  id: string;
  version: typeof ASSESSMENT_BLUEPRINT_VERSION;
  parentSubtopic: (typeof PILOT_SUBTOPICS)[number];
  requiredConceptIds: readonly string[];
  slots: readonly AssessmentBlueprintSlot[];
  minimumDifficultyBandsPerConcept: 3;
  minimumSurfaceFormsPerConcept: 2;
};

function slotId(
  chapter: string,
  stage: ConceptEvidenceStage,
  conceptId: string,
): string {
  return `slot.q86.${chapter}.${stage}.${conceptId.split(".").at(-1)}`;
}

export const PILOT_ASSESSMENT_BLUEPRINTS: readonly ChapterAssessmentBlueprint[] =
  PILOT_SUBTOPICS.map((parentSubtopic) => {
    const requiredConceptIds = PILOT_CONCEPTS.filter(
      (concept) => concept.parentSubtopic === parentSubtopic,
    ).map((concept) => concept.id);
    return {
      id: `blueprint.q86.${parentSubtopic}.concept-certification`,
      version: ASSESSMENT_BLUEPRINT_VERSION,
      parentSubtopic,
      requiredConceptIds,
      slots: CONCEPT_EVIDENCE_STAGES.flatMap((stage) => {
        const policy = CONCEPT_STAGE_POLICY[stage];
        return requiredConceptIds.map((conceptId) => ({
          id: slotId(parentSubtopic, stage, conceptId),
          conceptId,
          stage,
          difficulty: policy.difficulty,
          formats: policy.formats,
          requiresUnseenQuestion: true as const,
          requiresDistinctVariantFamily: true as const,
          requiresReplayableVerification: true as const,
        }));
      }),
      minimumDifficultyBandsPerConcept: 3,
      minimumSurfaceFormsPerConcept: 2,
    };
  });

export function requiredUniqueScoredItemsForConcept(conceptId: string): number {
  return PILOT_ASSESSMENT_BLUEPRINTS.reduce(
    (required, blueprint) =>
      Math.max(
        required,
        new Set(
          blueprint.slots
            .filter((slot) => slot.conceptId === conceptId)
            .map((slot) => slot.stage),
        ).size,
      ),
    0,
  );
}

export type AssessmentBlueprintIssue = { code: string; message: string };

export function validateAssessmentBlueprints(
  curriculum: CurriculumV3,
  blueprints = PILOT_ASSESSMENT_BLUEPRINTS,
): AssessmentBlueprintIssue[] {
  const issues: AssessmentBlueprintIssue[] = [];
  const knownConceptIds = new Set(
    curriculum.concepts.map((concept) => concept.id),
  );
  const ids = [
    ...blueprints.map((blueprint) => blueprint.id),
    ...blueprints.flatMap((blueprint) =>
      blueprint.slots.map((slot) => slot.id),
    ),
  ];
  if (new Set(ids).size !== ids.length) {
    issues.push({
      code: "duplicate_blueprint_id",
      message: "Assessment blueprint and slot IDs must be globally unique.",
    });
  }
  for (const blueprint of blueprints) {
    const expected = new Set(
      PILOT_CONCEPTS.filter(
        (concept) => concept.parentSubtopic === blueprint.parentSubtopic,
      ).map((concept) => concept.id),
    );
    if (
      expected.size !== blueprint.requiredConceptIds.length ||
      blueprint.requiredConceptIds.some((conceptId) => !expected.has(conceptId))
    ) {
      issues.push({
        code: "blueprint_concept_roster",
        message: `${blueprint.id} does not contain the exact pilot concept roster.`,
      });
    }
    for (const conceptId of blueprint.requiredConceptIds) {
      if (!knownConceptIds.has(conceptId)) {
        issues.push({
          code: "orphan_blueprint_concept",
          message: `${blueprint.id} names missing concept ${conceptId}.`,
        });
      }
      for (const stage of CONCEPT_EVIDENCE_STAGES) {
        const matches = blueprint.slots.filter(
          (slot) => slot.conceptId === conceptId && slot.stage === stage,
        );
        if (matches.length !== 1) {
          issues.push({
            code: "blueprint_stage_cardinality",
            message: `${blueprint.id} needs exactly one ${stage} slot for ${conceptId}; found ${matches.length}.`,
          });
        }
      }
    }
    for (const slot of blueprint.slots) {
      if (!expected.has(slot.conceptId)) {
        issues.push({
          code: "blueprint_cross_chapter_slot",
          message: `${slot.id} does not belong to ${blueprint.parentSubtopic}.`,
        });
      }
      const policy = CONCEPT_STAGE_POLICY[slot.stage];
      if (
        slot.difficulty[0] !== policy.difficulty[0] ||
        slot.difficulty[1] !== policy.difficulty[1] ||
        slot.formats.join("|") !== policy.formats.join("|")
      ) {
        issues.push({
          code: "blueprint_stage_policy",
          message: `${slot.id} diverges from the ${slot.stage} policy.`,
        });
      }
    }
  }
  return issues;
}
