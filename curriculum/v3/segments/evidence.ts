import type { Subtopic } from "../../../lib/taxonomy.ts";
import type {
  CheckRecord,
  ConceptRecord,
  ExampleRecord,
  MisconceptionRecord,
  SourceRef,
} from "../types.ts";
import { PILOT_CONCEPT_SEGMENTS } from "./index.ts";
import type { ConceptSegment } from "./types.ts";

const sourceFor = (segment: ConceptSegment): SourceRef => ({
  kind: "curriculum_decision",
  path: segment.sourcePath,
  section: "structured concept segment",
  anchor: segment.conceptId,
  checkedOn: "2026-07-21",
});

export function applySegmentEvidence(concepts: readonly ConceptRecord[]) {
  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
  const segmentById = new Map(
    PILOT_CONCEPT_SEGMENTS.map((segment) => [segment.conceptId, segment]),
  );
  const enrichedConcepts = concepts.map((concept) => {
    const segment = segmentById.get(concept.id);
    if (!segment) return concept;
    return {
      ...concept,
      objective: segment.objective,
      lessonStatus: "production_ready" as const,
      misconceptionIds: [
        ...new Set([
          ...concept.misconceptionIds,
          ...segment.misconceptions.map((item) => item.id),
        ]),
      ],
      contentVersion: segment.contentVersion,
    };
  });

  const examples: ExampleRecord[] = PILOT_CONCEPT_SEGMENTS.flatMap((segment) => {
    const owner = conceptById.get(segment.conceptId);
    if (!owner) return [];
    const source = sourceFor(segment);
    return segment.examples.map((example) => ({
      id: example.id,
      chapter: owner.parentSubtopic as Subtopic,
      conceptIds: example.conceptIds,
      authoredDifficulty: example.authoredDifficulty,
      role: example.role,
      sourceQuestionNeedle: example.id,
      source,
    }));
  });

  const checks: CheckRecord[] = PILOT_CONCEPT_SEGMENTS.flatMap((segment) => {
    const owner = conceptById.get(segment.conceptId);
    if (!owner) return [];
    const source = sourceFor(segment);
    return segment.checks.map((check) => ({
      id: check.id,
      chapter: owner.parentSubtopic as Subtopic,
      conceptIds: check.conceptIds,
      evidenceKind: "graded_retrieval" as const,
      isGraded: true,
      sourceTextNeedle: check.id,
      source,
    }));
  });

  const misconceptions: MisconceptionRecord[] = PILOT_CONCEPT_SEGMENTS.flatMap(
    (segment) => {
      const source = sourceFor(segment);
      return segment.misconceptions.map((item) => ({
        id: item.id,
        conceptId: segment.conceptId,
        title: item.title,
        whyItFeelsPlausible: item.whyItFeelsPlausible,
        detectionCue: item.detectionCue,
        correction: item.correctionMd,
        source,
      }));
    },
  );

  return { concepts: enrichedConcepts, examples, checks, misconceptions };
}
