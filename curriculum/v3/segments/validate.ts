import type {
  AnswerSpec,
  ConceptSegment,
  ProgressiveHint,
} from "./types.ts";

export type SegmentIssue = { code: string; message: string };

const STABLE_ENTITY_ID =
  /^(?:example|check|prereq|contrast|misconception|hint)\.q86\.[a-z0-9._-]+$/;
const HINT_ORDER = ["goal", "trigger", "setup", "next_move"] as const;

function answerIssues(ownerId: string, answer: AnswerSpec): SegmentIssue[] {
  const issues: SegmentIssue[] = [];
  if (answer.kind === "exact" && answer.acceptedAnswers.length === 0) {
    issues.push({ code: "empty_answer_key", message: `${ownerId} has no accepted answer` });
  }
  if (answer.kind === "numeric" && !Number.isFinite(answer.value)) {
    issues.push({ code: "invalid_numeric_key", message: `${ownerId} has a non-finite answer` });
  }
  if (
    answer.kind === "multiple_choice" &&
    (answer.choices.length < 2 ||
      answer.correctIndex < 0 ||
      answer.correctIndex >= answer.choices.length)
  ) {
    issues.push({ code: "invalid_choice_key", message: `${ownerId} has an invalid choice key` });
  }
  return issues;
}

function hintIssues(ownerId: string, hints: readonly ProgressiveHint[]): SegmentIssue[] {
  const issues: SegmentIssue[] = [];
  if (hints.length !== HINT_ORDER.length) {
    issues.push({ code: "hint_ladder_size", message: `${ownerId} needs exactly four pre-solution hints` });
    return issues;
  }
  HINT_ORDER.forEach((kind, index) => {
    if (hints[index]?.kind !== kind) {
      issues.push({
        code: "hint_ladder_order",
        message: `${ownerId} hint ${index + 1} must be ${kind}`,
      });
    }
  });
  return issues;
}

export function validateConceptSegments(
  segments: readonly ConceptSegment[],
  knownConceptIds: ReadonlySet<string>,
): SegmentIssue[] {
  const issues: SegmentIssue[] = [];
  const stableIds: string[] = [];
  const conceptIds = new Set<string>();

  for (const segment of segments) {
    if (conceptIds.has(segment.conceptId)) {
      issues.push({ code: "duplicate_segment", message: `Duplicate segment for ${segment.conceptId}` });
    }
    conceptIds.add(segment.conceptId);
    if (!knownConceptIds.has(segment.conceptId)) {
      issues.push({ code: "orphan_segment", message: `Unknown concept ${segment.conceptId}` });
    }
    if (!/^curriculum\/v3\/segments\/[a-z0-9-]+\.ts$/.test(segment.sourcePath)) {
      issues.push({ code: "invalid_segment_source", message: `${segment.conceptId} has invalid source ${segment.sourcePath}` });
    }
    if (segment.objective.length < 30) {
      issues.push({ code: "thin_objective", message: `${segment.conceptId} objective is not observable` });
    }
    if (segment.prerequisiteChecks.length === 0) {
      issues.push({ code: "missing_prerequisite_check", message: `${segment.conceptId} has no prerequisite check` });
    }
    if (segment.procedure.length < 3) {
      issues.push({ code: "thin_procedure", message: `${segment.conceptId} needs a repeatable procedure` });
    }
    if (segment.examples.length < 3) {
      issues.push({ code: "example_floor", message: `${segment.conceptId} has ${segment.examples.length}/3 examples` });
    }
    const roles = new Set(segment.examples.map((example) => example.role));
    for (const role of ["foundation", "application", "transfer_or_boundary"] as const) {
      if (!roles.has(role)) {
        issues.push({ code: "example_role_gap", message: `${segment.conceptId} lacks a ${role} example` });
      }
    }
    if (segment.misconceptions.length < 3) {
      issues.push({ code: "misconception_floor", message: `${segment.conceptId} has ${segment.misconceptions.length}/3 misconceptions` });
    }
    if (segment.checks.length < 6) {
      issues.push({ code: "check_floor", message: `${segment.conceptId} has ${segment.checks.length}/6 checks` });
    }
    if (!segment.checks.some((check) => check.independence === "guided")) {
      issues.push({ code: "guided_check_gap", message: `${segment.conceptId} lacks a guided check` });
    }
    if (!segment.checks.some((check) => check.independence === "independent")) {
      issues.push({ code: "independent_check_gap", message: `${segment.conceptId} lacks an independent check` });
    }
    if (segment.retrievalPrompts.length < 2) {
      issues.push({ code: "retrieval_prompt_gap", message: `${segment.conceptId} needs later retrieval prompts` });
    }
    if (segment.speedMethod.unsafeWhen.length === 0) {
      issues.push({ code: "unsafe_condition_gap", message: `${segment.conceptId} speed method lacks an unsafe condition` });
    }

    stableIds.push(segment.contrastPair.id);
    for (const check of segment.prerequisiteChecks) {
      stableIds.push(check.id);
      issues.push(...answerIssues(check.id, check.answer));
      for (const prerequisite of check.prerequisiteConceptIds) {
        if (!knownConceptIds.has(prerequisite)) {
          issues.push({ code: "orphan_prerequisite_check", message: `${check.id} names ${prerequisite}` });
        }
      }
    }
    for (const example of segment.examples) {
      stableIds.push(example.id, ...example.hints.map((hint) => hint.id));
      issues.push(...answerIssues(example.id, example.answer));
      issues.push(...hintIssues(example.id, example.hints));
      for (const conceptId of example.conceptIds) {
        if (!knownConceptIds.has(conceptId)) {
          issues.push({ code: "orphan_example_concept", message: `${example.id} names ${conceptId}` });
        }
      }
    }
    for (const misconception of segment.misconceptions) stableIds.push(misconception.id);
    for (const check of segment.checks) {
      stableIds.push(check.id, ...check.hints.map((hint) => hint.id));
      issues.push(...answerIssues(check.id, check.answer));
      issues.push(...hintIssues(check.id, check.hints));
      for (const conceptId of check.conceptIds) {
        if (!knownConceptIds.has(conceptId)) {
          issues.push({ code: "orphan_check_concept", message: `${check.id} names ${conceptId}` });
        }
      }
    }
  }

  const seen = new Set<string>();
  for (const id of stableIds) {
    if (!STABLE_ENTITY_ID.test(id)) {
      issues.push({ code: "invalid_segment_id", message: `Invalid stable segment ID ${id}` });
    }
    if (seen.has(id)) {
      issues.push({ code: "duplicate_segment_id", message: `Duplicate stable segment ID ${id}` });
    }
    seen.add(id);
  }
  return issues;
}
