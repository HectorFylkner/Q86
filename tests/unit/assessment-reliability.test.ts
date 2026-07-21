import { describe, expect, it } from "vitest";
import {
  ASSESSMENT_TIERS,
  DEFAULT_RECERTIFICATION_DAYS,
  INITIAL_CERTIFICATION_STATE,
  PROVISIONAL_PASS_THRESHOLDS,
  createAssessmentExclusionHooks,
  isIndependentCorrect,
  scoreAssessment,
  summarizeMasteryEvidence,
  timedTransferEligibility,
  transitionCertification,
  type AssessmentAttemptFact,
  type AssessmentTier,
  type CertificationState,
} from "../../lib/assessment-reliability.ts";

const DAY_MS = 86_400_000;
const COMPLETE_AT = 1_750_000_000_000;

function roster(size = 10): string[] {
  return Array.from({ length: size }, (_, index) => `q-${index + 1}`);
}

function answerFacts(
  expected: readonly string[],
  independentCorrect: number,
): AssessmentAttemptFact[] {
  return expected.map((questionId, index) => ({
    questionId,
    selectedIndex: index < independentCorrect ? 2 : 1,
    correctIndex: 2,
    confidence: "lock",
  }));
}

function scoreAt(tier: AssessmentTier, correct: number) {
  const expectedQuestionIds = roster();
  return scoreAssessment({
    tier,
    expectedQuestionIds,
    attempts: answerFacts(expectedQuestionIds, correct),
    completedAtMs: COMPLETE_AT,
  });
}

describe("tier-specific provisional gates", () => {
  it("publishes the explicit 90/80/70 policy", () => {
    expect(PROVISIONAL_PASS_THRESHOLDS).toEqual({
      easy: 0.9,
      medium: 0.8,
      hard: 0.7,
    });
  });

  it.each([
    ["easy", 9],
    ["medium", 8],
    ["hard", 7],
  ] as const)("%s passes at its exact boundary", (tier, correct) => {
    const score = scoreAt(tier, correct);
    expect(score.requiredIndependentCorrect).toBe(correct);
    expect(score.passed).toBe(true);
  });

  it.each([
    ["easy", 8],
    ["medium", 7],
    ["hard", 6],
  ] as const)("%s fails one answer below its boundary", (tier, correct) => {
    expect(scoreAt(tier, correct).passed).toBe(false);
  });

  it("has a defined threshold for every exported tier", () => {
    expect(Object.keys(PROVISIONAL_PASS_THRESHOLDS).sort()).toEqual(
      [...ASSESSMENT_TIERS].sort(),
    );
  });
});

describe("server-recomputed full-test scoring", () => {
  it("derives correctness from selectedIndex and the server answer key", () => {
    const forged = {
      questionId: "q-1",
      selectedIndex: 1,
      correctIndex: 4,
      confidence: "lock" as const,
      // An untrusted client field is deliberately ignored.
      correct: true,
    };
    const score = scoreAssessment({
      tier: "hard",
      expectedQuestionIds: ["q-1"],
      attempts: [forged],
      completedAtMs: COMPLETE_AT,
    });
    expect(score.rawCorrect).toBe(0);
    expect(score.passed).toBe(false);
  });

  it("requires the trusted completion marker even with a perfect roster", () => {
    const expectedQuestionIds = roster();
    const score = scoreAssessment({
      tier: "easy",
      expectedQuestionIds,
      attempts: answerFacts(expectedQuestionIds, 10),
      completedAtMs: null,
    });
    expect(score.fullTestCompleted).toBe(false);
    expect(score.passed).toBe(false);
    expect(score.integrityIssues).toContain("missing_completion_marker");
  });

  it("does not turn a shortened perfect test into a pass", () => {
    const expectedQuestionIds = roster();
    const score = scoreAssessment({
      tier: "hard",
      expectedQuestionIds,
      attempts: answerFacts(expectedQuestionIds.slice(0, 9), 9),
      completedAtMs: COMPLETE_AT,
    });
    expect(score.answeredCount).toBe(9);
    expect(score.fullTestCompleted).toBe(false);
    expect(score.integrityIssues).toContain("missing_attempt");
    expect(score.passed).toBe(false);
  });

  it("blocks duplicate attempts instead of granting another chance", () => {
    const expectedQuestionIds = roster();
    const facts = answerFacts(expectedQuestionIds, 10);
    facts.push({ ...facts[0] });
    const score = scoreAssessment({
      tier: "easy",
      expectedQuestionIds,
      attempts: facts,
      completedAtMs: COMPLETE_AT,
    });
    expect(score.integrityIssues).toContain("duplicate_attempt");
    expect(score.fullTestCompleted).toBe(false);
    expect(score.passed).toBe(false);
  });

  it("blocks attempts outside the server-selected roster", () => {
    const expectedQuestionIds = roster();
    const facts = answerFacts(expectedQuestionIds, 10);
    facts.push({
      questionId: "not-on-roster",
      selectedIndex: 0,
      correctIndex: 0,
      confidence: "lock",
    });
    const score = scoreAssessment({
      tier: "easy",
      expectedQuestionIds,
      attempts: facts,
      completedAtMs: COMPLETE_AT,
    });
    expect(score.integrityIssues).toContain("unexpected_attempt");
    expect(score.passed).toBe(false);
  });

  it("rejects an invalid roster with a repeated expected item", () => {
    const score = scoreAssessment({
      tier: "hard",
      expectedQuestionIds: ["q-1", "q-1"],
      attempts: answerFacts(["q-1"], 1),
      completedAtMs: COMPLETE_AT,
    });
    expect(score.integrityIssues).toContain("duplicate_expected_question");
    expect(score.passed).toBe(false);
  });

  it("supports a documented legacy threshold without changing tier policy", () => {
    const expectedQuestionIds = roster(8);
    const score = scoreAssessment({
      tier: "easy",
      expectedQuestionIds,
      attempts: answerFacts(expectedQuestionIds, 6),
      completedAtMs: COMPLETE_AT,
      passThresholdOverride: 0.75,
    });
    expect(score.requiredIndependentCorrect).toBe(6);
    expect(score.passed).toBe(true);
    expect(PROVISIONAL_PASS_THRESHOLDS.easy).toBe(0.9);
  });
});

describe("independent mastery evidence", () => {
  it("does not credit lucky, hinted, or post-reveal correct answers", () => {
    const evidence = summarizeMasteryEvidence([
      { correct: true, confidence: "lock" },
      { correct: true, confidence: "guess" },
      { correct: true, confidence: "lean", hinted: true },
      { correct: true, confidence: "lock", hintsUsed: 1 },
      { correct: true, confidence: "lock", solutionRevealed: true },
      { correct: false, confidence: "lock" },
    ]);
    expect(evidence).toEqual({
      attempts: 6,
      rawCorrect: 5,
      independentCorrect: 1,
      rawAccuracy: 5 / 6,
      independentAccuracy: 1 / 6,
    });
  });

  it("keeps assisted corrects in the assessment denominator", () => {
    const expectedQuestionIds = roster();
    const facts = answerFacts(expectedQuestionIds, 10);
    facts[0].confidence = "guess";
    facts[1].hinted = true;
    const score = scoreAssessment({
      tier: "easy",
      expectedQuestionIds,
      attempts: facts,
      completedAtMs: COMPLETE_AT,
    });
    expect(score.rawCorrect).toBe(10);
    expect(score.independentCorrect).toBe(8);
    expect(score.independentAccuracy).toBe(0.8);
    expect(score.passed).toBe(false);
  });

  it("classifies only unassisted, non-guess corrects as independent", () => {
    expect(isIndependentCorrect({ correct: true, confidence: "lean" })).toBe(
      true,
    );
    expect(isIndependentCorrect({ correct: true, confidence: "guess" })).toBe(
      false,
    );
    expect(isIndependentCorrect({ correct: true, hinted: true })).toBe(false);
    expect(isIndependentCorrect({ correct: false, confidence: "lock" })).toBe(
      false,
    );
  });
});

describe("recent-item and sibling-variant exclusion hooks", () => {
  it("excludes exact repeats and siblings, while releasing old families", () => {
    const nowMs = COMPLETE_AT;
    const hooks = createAssessmentExclusionHooks(
      [
        {
          questionId: "recent-root",
          variantFamilyId: "family-a",
          attemptedAtMs: nowMs - 2 * DAY_MS,
        },
        {
          questionId: "old-item",
          variantFamilyId: "family-old",
          attemptedAtMs: nowMs - 15 * DAY_MS,
        },
        {
          questionId: "standalone",
          attemptedAtMs: nowMs,
        },
      ],
      { nowMs, lookbackDays: 14 },
    );

    expect(
      hooks.reasonsFor({
        questionId: "recent-root",
        variantFamilyId: "family-a",
      }),
    ).toEqual(["recent_item"]);
    expect(
      hooks.reasonsFor({
        questionId: "recent-sibling",
        variantFamilyId: "family-a",
      }),
    ).toEqual(["sibling_variant"]);
    expect(
      hooks.isEligible({ questionId: "fresh", variantFamilyId: "family-old" }),
    ).toBe(true);
    expect(hooks.isEligible({ questionId: "standalone" })).toBe(false);
  });

  it("treats a variant without a family id as its own family", () => {
    const hooks = createAssessmentExclusionHooks(
      [{ questionId: 42, attemptedAtMs: COMPLETE_AT }],
      { nowMs: COMPLETE_AT },
    );
    expect(hooks.excludedVariantFamilyIds).toEqual([42]);
    expect(hooks.isEligible({ questionId: 43 })).toBe(true);
  });
});

describe("timed transfer and certification lifecycle", () => {
  it("withholds timed transfer until a complete accuracy pass exists", () => {
    expect(
      timedTransferEligibility({ fullTestCompleted: false, passed: false }),
    ).toEqual({ eligible: false, reason: "assessment_incomplete" });
    expect(
      timedTransferEligibility({ fullTestCompleted: true, passed: false }),
    ).toEqual({ eligible: false, reason: "accuracy_not_proven" });
    expect(
      timedTransferEligibility({ fullTestCompleted: true, passed: true }),
    ).toEqual({ eligible: true, reason: null });
  });

  it("rejects a timed pass that tries to bypass the accuracy gate", () => {
    const transition = transitionCertification(INITIAL_CERTIFICATION_STATE, {
      type: "timed_transfer_passed",
      atMs: COMPLETE_AT,
    });
    expect(transition.accepted).toBe(false);
    expect(transition.rejection).toBe("accuracy_required");
    expect(transition.state).toEqual(INITIAL_CERTIFICATION_STATE);
  });

  it("moves accuracy_proven → certified only after timed transfer", () => {
    const accuracy = transitionCertification(INITIAL_CERTIFICATION_STATE, {
      type: "accuracy_passed",
      atMs: COMPLETE_AT,
    });
    expect(accuracy.state.status).toBe("accuracy_proven");

    const timed = transitionCertification(accuracy.state, {
      type: "timed_transfer_passed",
      atMs: COMPLETE_AT + DAY_MS,
    });
    expect(timed.state.status).toBe("certified");
    expect(timed.state.certifiedAtMs).toBe(COMPLETE_AT + DAY_MS);
  });

  it("becomes stale at the policy boundary, not one millisecond early", () => {
    const certified: CertificationState = {
      status: "certified",
      accuracyProvenAtMs: COMPLETE_AT,
      certifiedAtMs: COMPLETE_AT,
      recertificationRequiredAtMs: null,
      recertificationReason: null,
    };
    const boundary =
      COMPLETE_AT + DEFAULT_RECERTIFICATION_DAYS * DAY_MS;
    const fresh = transitionCertification(certified, {
      type: "evaluate_staleness",
      nowMs: boundary - 1,
    });
    expect(fresh.state.status).toBe("certified");

    const stale = transitionCertification(certified, {
      type: "evaluate_staleness",
      nowMs: boundary,
    });
    expect(stale.state.status).toBe("recertification_required");
    expect(stale.state.recertificationReason).toBe("stale");
  });

  it("requires start → pass and refreshes certification timestamps", () => {
    const required: CertificationState = {
      status: "recertification_required",
      accuracyProvenAtMs: COMPLETE_AT - 30 * DAY_MS,
      certifiedAtMs: COMPLETE_AT - 29 * DAY_MS,
      recertificationRequiredAtMs: COMPLETE_AT,
      recertificationReason: "stale",
    };
    const directPass = transitionCertification(required, {
      type: "recertification_passed",
      atMs: COMPLETE_AT + DAY_MS,
    });
    expect(directPass.accepted).toBe(false);

    const started = transitionCertification(required, {
      type: "recertification_started",
      atMs: COMPLETE_AT,
    });
    expect(started.state.status).toBe("recertifying");
    const passed = transitionCertification(started.state, {
      type: "recertification_passed",
      atMs: COMPLETE_AT + DAY_MS,
    });
    expect(passed.state).toEqual({
      status: "certified",
      accuracyProvenAtMs: COMPLETE_AT + DAY_MS,
      certifiedAtMs: COMPLETE_AT + DAY_MS,
      recertificationRequiredAtMs: null,
      recertificationReason: null,
    });
  });

  it("returns a failed recertification to the required state", () => {
    const recertifying: CertificationState = {
      status: "recertifying",
      accuracyProvenAtMs: COMPLETE_AT - 30 * DAY_MS,
      certifiedAtMs: COMPLETE_AT - 29 * DAY_MS,
      recertificationRequiredAtMs: COMPLETE_AT,
      recertificationReason: "slipping",
    };
    const failed = transitionCertification(recertifying, {
      type: "recertification_failed",
      atMs: COMPLETE_AT + DAY_MS,
    });
    expect(failed.state.status).toBe("recertification_required");
    expect(failed.state.recertificationReason).toBe("failed");
  });

  it("slipping evidence removes an accuracy-only gate and recertifies a full certification", () => {
    const accuracyOnly = transitionCertification(INITIAL_CERTIFICATION_STATE, {
      type: "accuracy_passed",
      atMs: COMPLETE_AT,
    }).state;
    expect(
      transitionCertification(accuracyOnly, {
        type: "evidence_slipped",
        atMs: COMPLETE_AT + DAY_MS,
      }).state,
    ).toEqual(INITIAL_CERTIFICATION_STATE);

    const certified = transitionCertification(accuracyOnly, {
      type: "timed_transfer_passed",
      atMs: COMPLETE_AT + DAY_MS,
    }).state;
    const slipped = transitionCertification(certified, {
      type: "evidence_slipped",
      atMs: COMPLETE_AT + 2 * DAY_MS,
    });
    expect(slipped.state.status).toBe("recertification_required");
    expect(slipped.state.recertificationReason).toBe("slipping");
  });
});
