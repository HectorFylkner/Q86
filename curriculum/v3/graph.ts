import { buildCoreIdeaInventory, buildInventoryConcepts } from "./inventory.ts";
import {
  PILOT_ARCHETYPES,
  PILOT_CHECKS,
  PILOT_EXAMPLES,
  PILOT_MISCONCEPTIONS,
} from "./pilot-evidence.ts";
import { PILOT_CONCEPTS } from "./pilot-concepts.ts";
import { applySegmentEvidence } from "./segments/evidence.ts";

export const CURRICULUM_V3_SCHEMA_VERSION = "3.0.0" as const;
export const CURRICULUM_V3_CONTENT_VERSION = "3.0.0-draft.1" as const;

export function buildCurriculumV3() {
  const coreIdeaInventory = buildCoreIdeaInventory();
  const segmentEvidence = applySegmentEvidence(PILOT_CONCEPTS);
  const concepts = [
    ...segmentEvidence.concepts,
    ...buildInventoryConcepts(coreIdeaInventory),
  ];
  return {
    schemaVersion: CURRICULUM_V3_SCHEMA_VERSION,
    contentVersion: CURRICULUM_V3_CONTENT_VERSION,
    concepts,
    coreIdeaInventory,
    misconceptions: [...PILOT_MISCONCEPTIONS, ...segmentEvidence.misconceptions],
    archetypes: PILOT_ARCHETYPES,
    examples: [...PILOT_EXAMPLES, ...segmentEvidence.examples],
    checks: [...PILOT_CHECKS, ...segmentEvidence.checks],
    provenance: {
      localLessonCorpusCheckedOn: "2026-07-21",
      localBankCheckedOn: "2026-07-21",
      externalPatternEvidence: {
        status: "not embedded in graph records",
        note: "This artifact describes original Q86 content and does not import competitor or official question content.",
      },
    },
  } as const;
}

export type CurriculumV3 = ReturnType<typeof buildCurriculumV3>;
