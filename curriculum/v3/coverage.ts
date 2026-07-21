import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Context, QuestionFormat, Subtopic } from "../../lib/taxonomy.ts";
import { requiredUniqueScoredItemsForConcept } from "./assessment-blueprints.ts";
import { buildCurriculumV3, type CurriculumV3 } from "./graph.ts";
import { PILOT_CONCEPT_IDS, PILOT_SUBTOPICS } from "./pilot-concepts.ts";
import type {
  CoverageCell,
  CoverageLedger,
  QuestionMapping,
} from "./types.ts";

type BankQuestion = {
  uid: string;
  content_version: number;
  format: QuestionFormat;
  content_domain: string;
  context: Context;
  fundamental_skill: string;
  subtopic: Subtopic;
  difficulty: number;
  stem_md: string;
  choices: string[];
  correct_index: number;
  solution_md: string;
  fastest_path_md: string;
  trap_map: Record<string, string>;
  numeric_check: string | null;
  provenance?: string;
};

type Bank = { description: string; questions: BankQuestion[] };

export const COVERAGE_POLICY = {
  minimumExamples: 3,
  minimumGradedImmediateChecks: 6,
  minimumNamedMisconceptions: 3,
  minimumReplayablyVerifiedScoredItems: 6,
  minimumDifficultyBands: 3,
  minimumSurfaceForms: 2,
} as const;

export function readSeedBank(): Bank {
  const bankPath = path.join(process.cwd(), "scripts", "seed-bank.json");
  return JSON.parse(fs.readFileSync(bankPath, "utf8")) as Bank;
}

function normalizeIdentityText(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

/** Stable under bank-array reordering and canonical answer-choice reordering. */
export function legacyQuestionUid(question: BankQuestion): string {
  const correct = normalizeIdentityText(question.choices[question.correct_index] ?? "");
  const choices = question.choices.map(normalizeIdentityText).sort();
  const identity = JSON.stringify({
    format: question.format,
    subtopic: question.subtopic,
    stem: normalizeIdentityText(question.stem_md),
    correct,
    choices,
  });
  return `question.q86.${createHash("sha256").update(identity).digest("hex").slice(0, 24)}`;
}

/** The UID committed with the bank item is authoritative. The content-derived
 * identifier remains only as a compatibility audit for pre-identity fixtures. */
export function bankQuestionUid(question: BankQuestion): string {
  return question.uid || legacyQuestionUid(question);
}

type MappingRule = {
  id: string;
  conceptId: string;
  pattern: RegExp;
  secondary?: readonly string[];
};

const E = PILOT_CONCEPT_IDS.exponents;
const A = PILOT_CONCEPT_IDS.algebraicTranslation;
const P = PILOT_CONCEPT_IDS.probability;

const exponentRules: readonly MappingRule[] = [
  { id: "hidden-quadratic", conceptId: E.hiddenQuadratic, pattern: /2\^\{?2x\}?|9\^\{x\}\s*-\s*4|4\^\{x\}\s*-\s*10/i },
  { id: "negative-exponent", conceptId: E.zeroNegative, pattern: /\}\^\{-\d|\)\^\{-\d/i },
  { id: "repeated-equal-power", conceptId: E.repeated, pattern: /2\^\{x\}\s*\+\s*2\^\{x\}|same power added/i },
  { id: "radical-simplification", conceptId: E.radicals, pattern: /sqrt\{72\}|sqrt\{50\}|sqrt\{8\}/i },
  { id: "fractional-root", conceptId: E.fractional, pattern: /x\^\{3\}\s*=\s*64|sqrt\{x\}\s*=\s*2\\sqrt|value of x\^\{2\} \+ \\sqrt/i },
  { id: "ordering-regions", conceptId: E.ordering, pattern: /sqrt\{x\}\s*>\s*x|x\^\{?2\}?\s*>\s*x|x\^\{3\}\s*<\s*x/i },
  { id: "power-equals-one", conceptId: E.equalsOne, pattern: /x\^\{x\s*-\s*3\}\s*=\s*1/i },
  { id: "even-power-sign-loss", conceptId: E.evenSign, pattern: /sqrt\{x\^\{2\}\}|value of \$x\^3\$.*x\^4\s*=\s*16x\^2/is },
  { id: "power-sign", conceptId: E.powerSign, pattern: /\(-5\)\^\{|is \$x\^\{y\} > 0/i },
  { id: "preserve-zero", conceptId: E.preserveZero, pattern: /x\^2\s*=\s*2x|x\^\{2\}\s*=\s*2x/i },
  { id: "power-representations", conceptId: E.fluency, pattern: /4\{,\}096|4096|perfect square|a\^b\s*=\s*b\^a/i },
  { id: "same-base-combination", conceptId: E.combine, pattern: /6\^\{6\}.*2\^\{6\}|product rule|quotient rule/i },
  { id: "nested-power", conceptId: E.nesting, pattern: /3\^\{2x\s*\+\s*1\}|power of a power/i },
  { id: "common-base", conceptId: E.commonBase, pattern: /9\^|27\^|4\^\{x\}\s*=\s*8|doubles every|multiplied by \$9\$|b\^\{x\}\s*=|3\^\{x\}\s*=\s*5/i },
];

const algebraRules: readonly MappingRule[] = [
  { id: "digit-place-value", conceptId: A.digits, pattern: /three-digit|digits? (?:that )?sum|reversing its digits/i },
  { id: "third-equation-consistency", conceptId: A.consistency, pattern: /third equation|system consistent|for what value of \$k\$.*holds automatically/is },
  { id: "integer-inequality-system", conceptId: A.integerConstraints, pattern: /both integers|all three of the following conditions.*\$\$/is, secondary: [A.inequalityWords] },
  { id: "age-shift", conceptId: A.ages, pattern: /years|years old|old as/i },
  { id: "fixed-pool", conceptId: A.fixedPool, pattern: /fixed total amount|crew has \$?6\$? workers|each earns/i },
  { id: "leftover-shortfall", conceptId: A.sameTotal, pattern: /left over|leftover|would need|one-time enrollment fee/i },
  { id: "pairwise-sums", conceptId: A.pairwise, pattern: /sum of \$a\$ and \$b\$.*sum of \$a\$ and \$c\$/is },
  { id: "integer-endpoint", conceptId: A.integerEndpoints, pattern: /smallest integer|greatest integer|how many integers|value of the integer.*greater than.*less than/is, secondary: [A.inequalityWords] },
  { id: "integer-constraint", conceptId: A.integerConstraints, pattern: /positive integers?|whole number|coins worth|snacks for.*drinks for|pencils cost.*erasers cost/is },
  { id: "sum-difference", conceptId: A.sumDifference, pattern: /sum of two|their difference|points combined|together they donated|sum of \$a\$ and twice \$b\$.*sum of \$b\$ and twice \$a\$/is },
  { id: "linked-quantity", conceptId: A.linkedOneVariable, pattern: /twice as many|larger number is|same rate for each month/i },
  { id: "verbal-inequality", conceptId: A.inequalityWords, pattern: /at least|greater than|smaller than|fewer than|differs from/i },
  { id: "subtraction-order", conceptId: A.order, pattern: /difference of|less than|subtracted from/i },
  { id: "phrase-dictionary", conceptId: A.dictionary, pattern: /times the sum|times a number|half of a number|times the result|is equal to|equals/i },
];

const probabilityRules: readonly MappingRule[] = [
  { id: "finite-stopping-time", conceptId: P.stoppingTime, pattern: /until it lands heads|whichever occurs first|flipped an even number of times/i },
  { id: "inverse-composition", conceptId: P.inverseComposition, pattern: /what is the probability that both selected.*\(1\).*probability that both selected/is, secondary: [P.withoutReplacement] },
  { id: "fixed-points", conceptId: P.fixedPoints, pattern: /letters?.*addressed envelopes|own address/i },
  { id: "occupancy-collision", conceptId: P.occupancy, pattern: /coworkers.*food trucks|same truck|at least two.*same/i },
  { id: "exact-k-trials", conceptId: P.exactK, pattern: /free throw|coin is flipped \$4\$ times|makes exactly \$2\$|heads up more times/i, secondary: [P.independent] },
  { id: "circular-adjacency", conceptId: P.circular, pattern: /circular table|adjacent chairs/i },
  { id: "restricted-subgroup", conceptId: P.restricted, pattern: /remote employees is selected|one of .* subgroup/i },
  { id: "exactly-one", conceptId: P.exactlyOne, pattern: /exactly one of the two|morning bus.*evening bus/is, secondary: [P.independent] },
  { id: "union", conceptId: P.union, pattern: /multiple of \$4\$ or|event \$A\$ or event \$B\$/i },
  { id: "parity-event", conceptId: P.parity, pattern: /sum of the two.*even|product of the two.*even/i, secondary: [P.withoutReplacement] },
  { id: "at-least-one-selection", conceptId: P.atLeastOne, pattern: /team.*at least one|includes at least one senior/is, secondary: [P.complement, P.combinations] },
  { id: "committee-combination", conceptId: P.combinations, pattern: /team of|committee of|books at random|divided at random into.*teams/i },
  { id: "at-least-one", conceptId: P.atLeastOne, pattern: /at least one|at least two.*same/i, secondary: [P.complement] },
  { id: "first-special-position", conceptId: P.withoutReplacement, pattern: /first (?:dead battery|defective).*third|first defective.*fourth/i },
  { id: "without-replacement", conceptId: P.withoutReplacement, pattern: /without replacement|two socks|two chocolates/i },
  { id: "independent-intersection", conceptId: P.independent, pattern: /independently|independent.*both days|rains on both/i },
  { id: "basic-equiprobable", conceptId: P.basic, pattern: /fair|selected at random|probability/i },
];

const ruleByPilot: Readonly<Record<(typeof PILOT_SUBTOPICS)[number], readonly MappingRule[]>> = {
  exponents_roots_properties: exponentRules,
  algebraic_translation: algebraRules,
  probability: probabilityRules,
};

function classifyPilot(
  question: BankQuestion,
): { conceptId: string; secondary: readonly string[]; ruleId: string; fallback: boolean } {
  const rules = ruleByPilot[question.subtopic as (typeof PILOT_SUBTOPICS)[number]];
  const rule = rules.find((candidate) => candidate.pattern.test(question.stem_md));
  if (rule) {
    return {
      conceptId: rule.conceptId,
      secondary: rule.secondary ?? [],
      ruleId: rule.id,
      fallback: false,
    };
  }
  const fallback = question.subtopic === "exponents_roots_properties"
    ? E.commonBase
    : question.subtopic === "algebraic_translation"
      ? A.dictionary
      : P.basic;
  return { conceptId: fallback, secondary: [], ruleId: "mixed-legacy-fallback", fallback: true };
}

export function buildQuestionMappings(
  curriculum: CurriculumV3,
  bank = readSeedBank(),
): QuestionMapping[] {
  const conceptById = new Map(curriculum.concepts.map((concept) => [concept.id, concept]));
  return bank.questions.map((question, bankIndex) => {
    const questionUid = bankQuestionUid(question);
    const verificationStatus = question.numeric_check == null
      ? "structural_only" as const
      : "numeric_answer_alignment" as const;
    if (!PILOT_SUBTOPICS.includes(question.subtopic as (typeof PILOT_SUBTOPICS)[number])) {
      return {
        questionUid,
        questionContentVersion: question.content_version,
        bankIndex,
        parentSubtopic: question.subtopic,
        status: "unresolved",
        primaryConceptId: null,
        secondaryConceptIds: [],
        archetypeId: null,
        surfaceFormId: null,
        mappingConfidence: "unresolved",
        verificationStatus,
        replayableVerification: false,
        reason: "Explicitly dispositioned as unresolved until this non-pilot subtopic receives a curated leaf-level mapping.",
      };
    }

    const classification = classifyPilot(question);
    const concept = conceptById.get(classification.conceptId);
    if (!concept) throw new Error(`Classifier returned missing concept ${classification.conceptId}`);
    return {
      questionUid,
      questionContentVersion: question.content_version,
      bankIndex,
      parentSubtopic: question.subtopic,
      status: "mapped",
      primaryConceptId: classification.conceptId,
      secondaryConceptIds: classification.secondary,
      archetypeId: concept.archetypeIds[0] ?? null,
      surfaceFormId: concept.surfaceFormIds[0] ?? null,
      mappingConfidence: classification.fallback ? "provisional_fallback" : "curated_rule",
      verificationStatus,
      replayableVerification: false,
      reason: classification.fallback
        ? "Pilot item has a provisional chapter fallback and cannot support assessment eligibility."
        : `Matched reviewed semantic rule ${classification.ruleId}; human editorial sign-off remains required.`,
    };
  });
}

function tally(values: readonly (string | number | null)[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const value of values) {
    const key = value == null ? "unclassified" : String(value);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

export function buildCoverageLedger(
  curriculum = buildCurriculumV3(),
  bank = readSeedBank(),
): CoverageLedger {
  const mappings = buildQuestionMappings(curriculum, bank);
  const questionsByUid = new Map(
    bank.questions.map((question) => [bankQuestionUid(question), question]),
  );

  const concepts: CoverageCell[] = curriculum.concepts.map((concept) => {
    const examples = curriculum.examples.filter((example) => example.conceptIds.includes(concept.id));
    const checks = curriculum.checks.filter((check) => check.conceptIds.includes(concept.id));
    const misconceptions = curriculum.misconceptions.filter((item) => item.conceptId === concept.id);
    const questionMappings = mappings.filter((mapping) => mapping.primaryConceptId === concept.id);
    const replayable = questionMappings.filter((mapping) => mapping.replayableVerification);
    const questions = questionMappings.map((mapping) => questionsByUid.get(mapping.questionUid)!);
    const difficultyBands = new Set(questions.map((question) => question.difficulty));
    const surfaceForms = new Set(
      questionMappings.map((mapping) => mapping.surfaceFormId).filter(Boolean),
    );
    const gradedChecks = checks.filter((check) => check.isGraded);
    const scoredItemRequirement = Math.max(
      COVERAGE_POLICY.minimumReplayablyVerifiedScoredItems,
      requiredUniqueScoredItemsForConcept(concept.id),
    );
    const shortfalls: string[] = [];
    if (examples.length < COVERAGE_POLICY.minimumExamples)
      shortfalls.push(`worked examples ${examples.length}/${COVERAGE_POLICY.minimumExamples}`);
    if (gradedChecks.length < COVERAGE_POLICY.minimumGradedImmediateChecks)
      shortfalls.push(`graded immediate checks ${gradedChecks.length}/${COVERAGE_POLICY.minimumGradedImmediateChecks}`);
    if (misconceptions.length < COVERAGE_POLICY.minimumNamedMisconceptions)
      shortfalls.push(`named misconceptions ${misconceptions.length}/${COVERAGE_POLICY.minimumNamedMisconceptions}`);
    if (replayable.length < scoredItemRequirement)
      shortfalls.push(`replayably verified scored items ${replayable.length}/${scoredItemRequirement}`);
    if (difficultyBands.size < COVERAGE_POLICY.minimumDifficultyBands)
      shortfalls.push(`difficulty bands ${difficultyBands.size}/${COVERAGE_POLICY.minimumDifficultyBands}`);
    if (surfaceForms.size < COVERAGE_POLICY.minimumSurfaceForms)
      shortfalls.push(`surface forms ${surfaceForms.size}/${COVERAGE_POLICY.minimumSurfaceForms}`);
    if (questionMappings.some((mapping) => mapping.mappingConfidence !== "curated_rule"))
      shortfalls.push("question mapping includes provisional fallback");

    return {
      conceptId: concept.id,
      prerequisites: concept.prerequisiteConceptIds,
      lessonStatus: concept.lessonStatus,
      productionReady: concept.productionReady,
      exampleIds: examples.map((item) => item.id),
      gradedCheckIds: gradedChecks.map((item) => item.id),
      selfReportCheckIds: checks.filter((item) => !item.isGraded).map((item) => item.id),
      misconceptionIds: misconceptions.map((item) => item.id),
      rawScoredQuestionIds: questionMappings.map((item) => item.questionUid),
      replayablyVerifiedQuestionIds: replayable.map((item) => item.questionUid),
      scoredItemRequirement,
      countsByDifficulty: tally(questions.map((question) => question.difficulty)),
      countsByFormat: tally(questions.map((question) => question.format)),
      countsByContext: tally(questions.map((question) => question.context)),
      countsByArchetype: tally(questionMappings.map((mapping) => mapping.archetypeId)),
      countsBySurfaceForm: tally(questionMappings.map((mapping) => mapping.surfaceFormId)),
      assessmentEligible: shortfalls.length === 0 && concept.assessmentStatus === "eligible",
      shortfalls,
    };
  });

  return {
    schemaVersion: "3.0.0",
    generatedFrom: {
      bankPath: "scripts/seed-bank.json",
      bankQuestionCount: bank.questions.length,
      lessonPath: "content/lessons/*.md",
      coreIdeaCount: curriculum.coreIdeaInventory.length,
    },
    policy: COVERAGE_POLICY,
    questionMappings: mappings,
    concepts,
    unresolvedQuestionIds: mappings
      .filter((mapping) => mapping.status === "unresolved")
      .map((mapping) => mapping.questionUid),
    productionReadyConceptIds: concepts
      .filter((concept) => concept.productionReady)
      .map((concept) => concept.conceptId),
  };
}
