import { ALGEBRAIC_TRANSLATION_SEGMENTS } from "./algebraic-translation.ts";
import { EXPONENT_SEGMENTS } from "./exponents.ts";
import { PROBABILITY_AT_LEAST_ONE_SEGMENT } from "./probability-at-least-one.ts";
import { PROBABILITY_SEGMENTS } from "./probability.ts";
import type { ConceptSegment } from "./types.ts";

export const PILOT_CONCEPT_SEGMENTS = [
  ...EXPONENT_SEGMENTS,
  ...ALGEBRAIC_TRANSLATION_SEGMENTS,
  ...PROBABILITY_SEGMENTS,
  PROBABILITY_AT_LEAST_ONE_SEGMENT,
] as const satisfies readonly ConceptSegment[];

export function segmentByConceptId(conceptId: string) {
  return PILOT_CONCEPT_SEGMENTS.find((segment) => segment.conceptId === conceptId) ?? null;
}
