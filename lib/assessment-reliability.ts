import type { Confidence } from "./taxonomy.ts";

/**
 * Pure assessment policy. Database adapters should hydrate these facts from
 * persisted attempts and the server-owned answer key; callers never provide a
 * client-computed score.
 */
export const ASSESSMENT_TIERS = ["easy", "medium", "hard"] as const;
export type AssessmentTier = (typeof ASSESSMENT_TIERS)[number];

/** Provisional concept-certification bars, intentionally explicit by tier. */
export const PROVISIONAL_PASS_THRESHOLDS: Record<AssessmentTier, number> = {
  easy: 0.9,
  medium: 0.8,
  hard: 0.7,
};

export const DEFAULT_RECERTIFICATION_DAYS = 28;
export const DEFAULT_RECENT_ITEM_DAYS = 14;
const DAY_MS = 86_400_000;

export type QuestionIdentity = number | string;

export type IndependentAnswerFact = {
  correct: boolean;
  confidence?: Confidence | null;
  /** True when any instructional hint was exposed before commitment. */
  hinted?: boolean;
  hintsUsed?: number;
  /** A reveal followed by a correct click is review, not an independent solve. */
  solutionRevealed?: boolean;
};

/** Lucky or assisted correct answers remain attempts, but never mastery wins. */
export function isIndependentCorrect(fact: IndependentAnswerFact): boolean {
  return (
    fact.correct &&
    fact.confidence !== "guess" &&
    fact.hinted !== true &&
    (fact.hintsUsed ?? 0) === 0 &&
    fact.solutionRevealed !== true
  );
}

export type MasteryEvidence = {
  attempts: number;
  rawCorrect: number;
  independentCorrect: number;
  rawAccuracy: number;
  independentAccuracy: number;
};

/** The denominator never shrinks when a correct answer was assisted. */
export function summarizeMasteryEvidence(
  facts: readonly IndependentAnswerFact[],
): MasteryEvidence {
  const attempts = facts.length;
  const rawCorrect = facts.filter((fact) => fact.correct).length;
  const independentCorrect = facts.filter(isIndependentCorrect).length;
  return {
    attempts,
    rawCorrect,
    independentCorrect,
    rawAccuracy: attempts === 0 ? 0 : rawCorrect / attempts,
    independentAccuracy:
      attempts === 0 ? 0 : independentCorrect / attempts,
  };
}

export type AssessmentAttemptFact = {
  questionId: QuestionIdentity;
  /** Persisted learner response. */
  selectedIndex: number;
  /** Joined from the server-owned question record. */
  correctIndex: number;
  confidence?: Confidence | null;
  hinted?: boolean;
  hintsUsed?: number;
  solutionRevealed?: boolean;
};

export type AssessmentIntegrityIssue =
  | "empty_definition"
  | "duplicate_expected_question"
  | "missing_completion_marker"
  | "missing_attempt"
  | "duplicate_attempt"
  | "unexpected_attempt"
  | "invalid_pass_threshold";

export type AssessmentScore = {
  tier: AssessmentTier;
  passThreshold: number;
  requiredIndependentCorrect: number;
  expectedCount: number;
  answeredCount: number;
  rawCorrect: number;
  independentCorrect: number;
  rawAccuracy: number;
  independentAccuracy: number;
  /** True only for a closed session with exactly one answer per roster item. */
  fullTestCompleted: boolean;
  passed: boolean;
  integrityIssues: AssessmentIntegrityIssue[];
};

export type AssessmentScoringInput = {
  tier: AssessmentTier;
  expectedQuestionIds: readonly QuestionIdentity[];
  attempts: readonly AssessmentAttemptFact[];
  completedAtMs: number | null;
  /** Used only by adapters that must grade a documented legacy policy. */
  passThresholdOverride?: number;
};

/**
 * Recompute a score from the expected roster and persisted answer facts.
 * Duplicate, missing, or out-of-roster attempts are integrity failures rather
 * than extra chances. `completedAtMs` is the trusted server completion marker.
 */
export function scoreAssessment(input: AssessmentScoringInput): AssessmentScore {
  const threshold =
    input.passThresholdOverride ?? PROVISIONAL_PASS_THRESHOLDS[input.tier];
  const issues = new Set<AssessmentIntegrityIssue>();
  const expected = new Set<QuestionIdentity>();

  if (input.expectedQuestionIds.length === 0) issues.add("empty_definition");
  for (const questionId of input.expectedQuestionIds) {
    if (expected.has(questionId)) issues.add("duplicate_expected_question");
    expected.add(questionId);
  }
  if (input.completedAtMs == null) issues.add("missing_completion_marker");
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
    issues.add("invalid_pass_threshold");
  }

  const byQuestion = new Map<QuestionIdentity, AssessmentAttemptFact[]>();
  for (const fact of input.attempts) {
    if (!expected.has(fact.questionId)) {
      issues.add("unexpected_attempt");
      continue;
    }
    const facts = byQuestion.get(fact.questionId) ?? [];
    facts.push(fact);
    byQuestion.set(fact.questionId, facts);
  }

  let answeredCount = 0;
  let rawCorrect = 0;
  let independentCorrect = 0;
  for (const questionId of expected) {
    const facts = byQuestion.get(questionId) ?? [];
    if (facts.length === 0) {
      issues.add("missing_attempt");
      continue;
    }
    if (facts.length > 1) {
      issues.add("duplicate_attempt");
      continue;
    }

    answeredCount++;
    const fact = facts[0];
    const correct = fact.selectedIndex === fact.correctIndex;
    if (correct) rawCorrect++;
    if (isIndependentCorrect({ ...fact, correct })) independentCorrect++;
  }

  const expectedCount = expected.size;
  const rawAccuracy = expectedCount === 0 ? 0 : rawCorrect / expectedCount;
  const independentAccuracy =
    expectedCount === 0 ? 0 : independentCorrect / expectedCount;
  const requiredIndependentCorrect =
    expectedCount === 0 || !Number.isFinite(threshold)
      ? 0
      : Math.ceil(threshold * expectedCount);
  const integrityIssues = [...issues];
  const fullTestCompleted =
    input.completedAtMs != null &&
    expectedCount > 0 &&
    answeredCount === expectedCount &&
    !issues.has("duplicate_expected_question") &&
    !issues.has("duplicate_attempt") &&
    !issues.has("unexpected_attempt");
  const passed =
    fullTestCompleted &&
    integrityIssues.length === 0 &&
    independentCorrect >= requiredIndependentCorrect;

  return {
    tier: input.tier,
    passThreshold: threshold,
    requiredIndependentCorrect,
    expectedCount,
    answeredCount,
    rawCorrect,
    independentCorrect,
    rawAccuracy,
    independentAccuracy,
    fullTestCompleted,
    passed,
    integrityIssues,
  };
}

export type VariantItem = {
  questionId: QuestionIdentity;
  /** Stable stem/template family. Falls back to the item itself. */
  variantFamilyId?: QuestionIdentity | null;
};

export type RecentVariantAttempt = VariantItem & {
  attemptedAtMs: number;
};

export type AssessmentExclusionReason = "recent_item" | "sibling_variant";

export type AssessmentExclusionHooks = {
  excludedQuestionIds: QuestionIdentity[];
  excludedVariantFamilyIds: QuestionIdentity[];
  reasonsFor(item: VariantItem): AssessmentExclusionReason[];
  isEligible(item: VariantItem): boolean;
};

export function variantFamilyId(item: VariantItem): QuestionIdentity {
  return item.variantFamilyId ?? item.questionId;
}

/**
 * Build selector hooks from recent history. An exact repeat and every sibling
 * in its variant family sit out for the same lookback window.
 */
export function createAssessmentExclusionHooks(
  history: readonly RecentVariantAttempt[],
  options: { nowMs: number; lookbackDays?: number },
): AssessmentExclusionHooks {
  const lookbackDays = options.lookbackDays ?? DEFAULT_RECENT_ITEM_DAYS;
  const cutoff = options.nowMs - Math.max(0, lookbackDays) * DAY_MS;
  const recent = history.filter((attempt) => attempt.attemptedAtMs >= cutoff);
  const questionIds = new Set(recent.map((attempt) => attempt.questionId));
  const familyIds = new Set(recent.map(variantFamilyId));

  const reasonsFor = (item: VariantItem): AssessmentExclusionReason[] => {
    if (questionIds.has(item.questionId)) return ["recent_item"];
    if (familyIds.has(variantFamilyId(item))) return ["sibling_variant"];
    return [];
  };

  return {
    excludedQuestionIds: [...questionIds],
    excludedVariantFamilyIds: [...familyIds],
    reasonsFor,
    isEligible: (item) => reasonsFor(item).length === 0,
  };
}

export type TimedTransferEligibility =
  | { eligible: true; reason: null }
  | {
      eligible: false;
      reason: "assessment_incomplete" | "accuracy_not_proven";
    };

/** Time pressure is earned only after a complete accuracy gate is passed. */
export function timedTransferEligibility(
  score: Pick<AssessmentScore, "fullTestCompleted" | "passed">,
): TimedTransferEligibility {
  if (!score.fullTestCompleted) {
    return { eligible: false, reason: "assessment_incomplete" };
  }
  if (!score.passed) {
    return { eligible: false, reason: "accuracy_not_proven" };
  }
  return { eligible: true, reason: null };
}

export type RecertificationReason = "stale" | "slipping" | "failed";
export type CertificationStatus =
  | "unproven"
  | "accuracy_proven"
  | "certified"
  | "recertification_required"
  | "recertifying";

export type CertificationState = {
  status: CertificationStatus;
  accuracyProvenAtMs: number | null;
  certifiedAtMs: number | null;
  recertificationRequiredAtMs: number | null;
  recertificationReason: RecertificationReason | null;
};

export const INITIAL_CERTIFICATION_STATE: CertificationState = {
  status: "unproven",
  accuracyProvenAtMs: null,
  certifiedAtMs: null,
  recertificationRequiredAtMs: null,
  recertificationReason: null,
};

export type CertificationEvent =
  | { type: "accuracy_passed"; atMs: number }
  | { type: "timed_transfer_passed"; atMs: number }
  | { type: "evaluate_staleness"; nowMs: number; staleAfterDays?: number }
  | { type: "evidence_slipped"; atMs: number }
  | { type: "recertification_started"; atMs: number }
  | { type: "recertification_passed"; atMs: number }
  | { type: "recertification_failed"; atMs: number };

export type CertificationTransition = {
  state: CertificationState;
  accepted: boolean;
  rejection: "accuracy_required" | "invalid_transition" | null;
};

function accepted(state: CertificationState): CertificationTransition {
  return { state, accepted: true, rejection: null };
}

function rejected(
  state: CertificationState,
  rejection: NonNullable<CertificationTransition["rejection"]>,
): CertificationTransition {
  return { state, accepted: false, rejection };
}

/**
 * Explicit certification state machine. It prevents a timed pass from
 * bypassing accuracy, turns aged or slipping evidence into a recertification
 * requirement, and requires recertification to be started before it can pass.
 */
export function transitionCertification(
  state: CertificationState,
  event: CertificationEvent,
): CertificationTransition {
  switch (event.type) {
    case "accuracy_passed":
      if (state.status !== "unproven" && state.status !== "accuracy_proven") {
        return rejected(state, "invalid_transition");
      }
      return accepted({
        status: "accuracy_proven",
        accuracyProvenAtMs: event.atMs,
        certifiedAtMs: null,
        recertificationRequiredAtMs: null,
        recertificationReason: null,
      });

    case "timed_transfer_passed":
      if (state.status !== "accuracy_proven") {
        return rejected(state, "accuracy_required");
      }
      return accepted({
        status: "certified",
        accuracyProvenAtMs: state.accuracyProvenAtMs,
        certifiedAtMs: event.atMs,
        recertificationRequiredAtMs: null,
        recertificationReason: null,
      });

    case "evaluate_staleness": {
      if (state.status !== "certified" || state.certifiedAtMs == null) {
        return accepted(state);
      }
      const staleAfterDays =
        event.staleAfterDays ?? DEFAULT_RECERTIFICATION_DAYS;
      if (event.nowMs - state.certifiedAtMs < staleAfterDays * DAY_MS) {
        return accepted(state);
      }
      return accepted({
        ...state,
        status: "recertification_required",
        recertificationRequiredAtMs: event.nowMs,
        recertificationReason: "stale",
      });
    }

    case "evidence_slipped":
      if (state.status === "accuracy_proven") {
        return accepted({ ...INITIAL_CERTIFICATION_STATE });
      }
      if (state.status !== "certified") return accepted(state);
      return accepted({
        ...state,
        status: "recertification_required",
        recertificationRequiredAtMs: event.atMs,
        recertificationReason: "slipping",
      });

    case "recertification_started":
      if (state.status !== "recertification_required") {
        return rejected(state, "invalid_transition");
      }
      return accepted({ ...state, status: "recertifying" });

    case "recertification_passed":
      if (state.status !== "recertifying") {
        return rejected(state, "invalid_transition");
      }
      return accepted({
        status: "certified",
        accuracyProvenAtMs: event.atMs,
        certifiedAtMs: event.atMs,
        recertificationRequiredAtMs: null,
        recertificationReason: null,
      });

    case "recertification_failed":
      if (state.status !== "recertifying") {
        return rejected(state, "invalid_transition");
      }
      return accepted({
        ...state,
        status: "recertification_required",
        recertificationRequiredAtMs: event.atMs,
        recertificationReason: "failed",
      });
  }
}
