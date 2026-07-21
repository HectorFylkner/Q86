import { PROBABILITY_AT_LEAST_ONE_SEGMENT } from "./probability-at-least-one.ts";

export const PILOT_CONCEPT_SEGMENTS = [PROBABILITY_AT_LEAST_ONE_SEGMENT] as const;

export function segmentByConceptId(conceptId: string) {
  return PILOT_CONCEPT_SEGMENTS.find((segment) => segment.conceptId === conceptId) ?? null;
}
