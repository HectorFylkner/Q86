import type { Subtopic } from "../../lib/taxonomy.ts";
import { entityId } from "./ids.ts";
import { PILOT_CONCEPT_IDS, PILOT_CONCEPTS } from "./pilot-concepts.ts";
import type {
  ArchetypeRecord,
  CheckRecord,
  ExampleRecord,
  MisconceptionRecord,
  SourceRef,
} from "./types.ts";

const E = PILOT_CONCEPT_IDS.exponents;
const A = PILOT_CONCEPT_IDS.algebraicTranslation;
const P = PILOT_CONCEPT_IDS.probability;

const lessonSource = (
  chapter: Subtopic,
  section: string,
  anchor: string,
): SourceRef => ({
  kind: "q86_lesson",
  path: `content/lessons/${chapter}.md`,
  section,
  anchor,
  checkedOn: "2026-07-21",
});

const bankSource = (anchor: string): SourceRef => ({
  kind: "q86_bank",
  path: "scripts/seed-bank.json",
  section: "questions",
  anchor,
  checkedOn: "2026-07-21",
});

type MisconceptionSpec = {
  chapter: Subtopic;
  name: string;
  conceptId: string;
  plausible: string;
  detect: string;
  correction: string;
};

const misconceptionSpecs: readonly MisconceptionSpec[] = [
  { chapter: "exponents_roots_properties", name: "dividing by the variable", conceptId: E.preserveZero, plausible: "Cancellation usually simplifies equations, so the hidden nonzero assumption is easy to miss.", detect: "The proposed divisor contains a variable whose zero status is not established.", correction: "Move all terms to one side, factor, and keep the zero-factor case." },
  { chapter: "exponents_roots_properties", name: "square root of x squared equals x", conceptId: E.evenSign, plausible: "Square and square root look like inverse operations.", detect: "A principal root is being used to recover a variable whose sign is unknown.", correction: "Replace the expression with absolute value and test both signs." },
  { chapter: "exponents_roots_properties", name: "equating exponents too early", conceptId: E.commonBase, plausible: "Matching notation suggests the exponential function is always one-to-one.", detect: "The common base is unknown or could be zero, one, or negative.", correction: "Verify a positive base other than one before equating exponents." },
  { chapter: "exponents_roots_properties", name: "adding exponents across a plus sign", conceptId: E.repeated, plausible: "The product rule is memorable and is overgeneralized to addition.", detect: "A plus sign separates the powered terms.", correction: "Factor identical terms by their count; do not add exponents." },
  { chapter: "exponents_roots_properties", name: "tower confusion", conceptId: E.nesting, plausible: "Both forms display multiple exponents close together.", detect: "Exponents are multiplied without parentheses enclosing the lower power.", correction: "Mark the scope of each exponent and evaluate a tower from the top." },
  { chapter: "exponents_roots_properties", name: "assuming one power representation", conceptId: E.fluency, plausible: "The first familiar representation feels unique.", detect: "A power-rich constant has integer base and exponent constraints.", correction: "Factor the prime exponent and enumerate every allowed base-exponent pair." },
  { chapter: "exponents_roots_properties", name: "keeping impossible substitution roots", conceptId: E.hiddenQuadratic, plausible: "Both roots solve the transformed quadratic.", detect: "A root assigned to a positive exponential expression is nonpositive.", correction: "State the substitution range first and discard roots outside it." },
  { chapter: "exponents_roots_properties", name: "squaring makes bigger", conceptId: E.ordering, plausible: "The claim works for familiar integers greater than one.", detect: "The variable can lie between zero and one or be negative.", correction: "Split the number line at zero and one before comparing powers." },

  { chapter: "algebraic_translation", name: "reversed subtraction", conceptId: A.order, plausible: "The amount named first is written first automatically.", detect: "The English form is 'k less than m.'", correction: "Write the reference m first, then subtract k." },
  { chapter: "algebraic_translation", name: "difference order", conceptId: A.order, plausible: "Difference is treated as an unsigned distance.", detect: "The phrase says 'difference of y and x' but the equation uses x minus y.", correction: "Preserve the named order unless absolute difference is explicitly intended." },
  { chapter: "algebraic_translation", name: "answering the wrong quantity", conceptId: A.linkedOneVariable, plausible: "The solved variable feels like the endpoint of the work.", detect: "The final question names a different linked quantity.", correction: "Translate the solved variable back to the quantity requested in the stem." },
  { chapter: "algebraic_translation", name: "aging one person", conceptId: A.ages, plausible: "Attention stays on the person whose ratio is described.", detect: "Elapsed time was added to only one current age.", correction: "Shift every person's age before applying the future relation." },
  { chapter: "algebraic_translation", name: "strictness slip", conceptId: A.inequalityWords, plausible: "Everyday speech blurs at least with more than.", detect: "A boundary-including phrase has been translated with a strict sign.", correction: "Use inclusive signs for at least and at most, then test the boundary." },
  { chapter: "algebraic_translation", name: "wrong-direction rounding", conceptId: A.integerEndpoints, plausible: "Nearest-integer rounding is used out of habit.", detect: "The rounded value does not actually satisfy the original bound.", correction: "Step to the nearest allowed integer in the direction of the solution set." },
  { chapter: "algebraic_translation", name: "auto-insufficient equation counting", conceptId: A.integerConstraints, plausible: "The two-unknowns/one-equation heuristic is often useful over the reals.", detect: "The stem also imposes positivity, integrality, or tight bounds.", correction: "Enumerate all feasible lattice points before judging uniqueness." },
  { chapter: "algebraic_translation", name: "trusting the translated equation over the words", conceptId: A.dictionary, plausible: "Correct algebra can make an incorrect setup look polished.", detect: "The answer checks in the equation but not in the original sentence.", correction: "Read the solution back through the original words and units." },

  { chapter: "probability", name: "frozen denominator", conceptId: P.withoutReplacement, plausible: "The initial pool size stays salient across every draw.", detect: "A no-replacement sequence reuses the initial numerator or denominator.", correction: "Update both remaining total and relevant favorable count after each draw." },
  { chapter: "probability", name: "adding when multiplication is required", conceptId: P.independent, plausible: "And/or language is easy to map to arithmetic by keyword.", detect: "A joint path is calculated by adding marginal probabilities.", correction: "Multiply along one independent path; add only disjoint alternative paths." },
  { chapter: "probability", name: "wrong complement", conceptId: P.complement, plausible: "The easiest failure case is mistaken for the whole logical opposite.", detect: "The proposed complement leaves valid middle cases uncounted.", correction: "Negate the threshold exactly: not at least k means at most k minus one." },
  { chapter: "probability", name: "ordered-unordered mixing", conceptId: P.combinations, plausible: "Both counts describe the same objects and seem interchangeable.", detect: "The numerator distinguishes order while the denominator uses combinations, or vice versa.", correction: "Define one elementary outcome and use that convention on both sides." },
  { chapter: "probability", name: "forgetting the overlap", conceptId: P.union, plausible: "Adding A and B feels like the literal translation of or.", detect: "Outcomes satisfying both events are present in each addend.", correction: "Subtract the intersection once unless the events are disjoint." },
  { chapter: "probability", name: "false fifty-fifty symmetry", conceptId: P.basic, plausible: "Reversing two unequal labels appears to pair every outcome.", detect: "Ties or fixed points remain unpaired under the proposed symmetry.", correction: "Count ties and reversals explicitly before claiming one half." },
  { chapter: "probability", name: "whole-population denominator", conceptId: P.restricted, plausible: "The full population is the most visible total in the stem.", detect: "Selection occurs only after restricting to a named subgroup.", correction: "Use the conditioned subgroup as the new sample space." },
];

export const PILOT_MISCONCEPTIONS: readonly MisconceptionRecord[] =
  misconceptionSpecs.map((spec) => ({
    id: entityId("misconception", spec.chapter, spec.name),
    conceptId: spec.conceptId,
    title: spec.name,
    whyItFeelsPlausible: spec.plausible,
    detectionCue: spec.detect,
    correction: spec.correction,
    source: lessonSource(spec.chapter, "Trap gallery", spec.name),
  }));

type ArchetypeSpec = {
  chapter: Subtopic;
  name: string;
  conceptId: string;
  cue: string;
  response: string;
  bankEvidence?: string;
};

const archetypeSpecs: readonly ArchetypeSpec[] = [
  { chapter: "exponents_roots_properties", name: "mixed related bases", conceptId: E.commonBase, cue: "mix of related bases", response: "Convert every quantity to the smallest shared prime base." },
  { chapter: "exponents_roots_properties", name: "same power repeated", conceptId: E.repeated, cue: "same power added to itself", response: "Count copies and factor the common power." },
  { chapter: "exponents_roots_properties", name: "even power sign recovery", conceptId: E.evenSign, cue: "square root of x squared or another even power", response: "Recover magnitude, then test both signs." },
  { chapter: "exponents_roots_properties", name: "hidden exponential quadratic", conceptId: E.hiddenQuadratic, cue: "both a^(2x) and a^x", response: "Substitute y = a^x and enforce y's range." },
  { chapter: "exponents_roots_properties", name: "exponential growth comparison", conceptId: E.commonBase, cue: "doubles or halves every fixed interval", response: "Model the multiplier with an exponent and compare powers." },
  { chapter: "exponents_roots_properties", name: "power ordering by region", conceptId: E.ordering, cue: "compare a value, its power, and its root", response: "Split at zero and one before ordering." },
  { chapter: "exponents_roots_properties", name: "power-rich constant representations", conceptId: E.fluency, cue: "4096 or another power-rich constant", response: "Prime-factor and enumerate valid base-exponent pairs." },

  { chapter: "algebraic_translation", name: "verbal inequality", conceptId: A.inequalityWords, cue: "less than, at least, or at most in a sentence", response: "Translate phrase by phrase and preserve strictness." },
  { chapter: "algebraic_translation", name: "leftover and shortfall", conceptId: A.sameTotal, cue: "money left over or more money needed", response: "Write current money two ways and equate." },
  { chapter: "algebraic_translation", name: "sum and difference", conceptId: A.sumDifference, cue: "sum S and difference D", response: "Use half-sum and half-difference." },
  { chapter: "algebraic_translation", name: "age timeline", conceptId: A.ages, cue: "in t years", response: "Shift every age before applying the relation." },
  { chapter: "algebraic_translation", name: "integer value equation", conceptId: A.integerConstraints, cue: "item values with integer counts", response: "Bound and enumerate using divisibility before judging sufficiency." },
  { chapter: "algebraic_translation", name: "parameterized third equation", conceptId: A.consistency, cue: "third equation holds automatically", response: "Solve the first two and substitute into the third." },
  { chapter: "algebraic_translation", name: "reversed digits", conceptId: A.digits, cue: "reversing digits changes the number", response: "Use place-value coefficients and the 99-times digit difference." },
  { chapter: "algebraic_translation", name: "fixed pool shares", conceptId: A.fixedPool, cue: "each of m gets d more than each of n", response: "Write T/m = T/n + d with the correct direction." },

  { chapter: "probability", name: "at least one complement", conceptId: P.atLeastOne, cue: "at least one", response: "Compute one minus the probability of none." },
  { chapter: "probability", name: "without-replacement sequence", conceptId: P.withoutReplacement, cue: "without replacement or one after another", response: "Multiply conditional fractions with a shrinking pool." },
  { chapter: "probability", name: "committee quota", conceptId: P.combinations, cue: "committee or team with a type quota", response: "Count favorable combinations over all combinations." },
  { chapter: "probability", name: "integer multiple union", conceptId: P.union, cue: "multiple of a or multiple of b", response: "Use inclusion-exclusion and subtract lcm overlap." },
  { chapter: "probability", name: "exactly one independent event", conceptId: P.exactlyOne, cue: "exactly one of two events", response: "Add success-failure and failure-success paths." },
  { chapter: "probability", name: "restricted subgroup selection", conceptId: P.restricted, cue: "selected from a named subgroup", response: "Use the subgroup as the denominator." },
  { chapter: "probability", name: "parity event", conceptId: P.parity, cue: "sum or product is even or odd", response: "Translate to parity cases before counting." },
  { chapter: "probability", name: "circular adjacency", conceptId: P.circular, cue: "two named people adjacent around a circle", response: "Fix one person and count adjacent seats among remaining seats." },
  { chapter: "probability", name: "first special item position", conceptId: P.withoutReplacement, cue: "first special item is the kth tested", response: "Multiply the exact ordinary-prefix then special sequence." },
  { chapter: "probability", name: "exact-k repeated trials", conceptId: P.exactK, cue: "exactly k successes in n fixed independent trials", response: "Choose success positions and multiply the binomial path probability.", bankEvidence: "seed questions 493 and 494" },
  { chapter: "probability", name: "occupancy collision", conceptId: P.occupancy, cue: "independent choices collide in one of labeled categories", response: "Count all-distinct assignments as the complement when cheaper.", bankEvidence: "seed question 498" },
  { chapter: "probability", name: "matching fixed points", conceptId: P.fixedPoints, cue: "objects randomly assigned to matching labeled destinations", response: "Choose fixed positions and derange the rest.", bankEvidence: "seed question 499" },
  { chapter: "probability", name: "inverse composition", conceptId: P.inverseComposition, cue: "draw probability given; infer population count", response: "Invert the conditional product and enumerate bounded integer counts.", bankEvidence: "seed question 501" },
  { chapter: "probability", name: "finite stopping time", conceptId: P.stoppingTime, cue: "repeat until first success or a fixed cap", response: "Enumerate exact disjoint stopping paths.", bankEvidence: "seed question 502" },
];

const EXPLICIT_ARCHETYPES: readonly ArchetypeRecord[] = archetypeSpecs.map(
  (spec) => {
    const id = entityId("archetype", spec.chapter, spec.name);
    return {
      id,
      conceptId: spec.conceptId,
      title: spec.name,
      decisionCue: spec.cue,
      response: spec.response,
      surfaceFormIds: [id.replace(/^archetype\./, "surface.")],
      source: spec.bankEvidence
        ? bankSource(spec.bankEvidence)
        : lessonSource(spec.chapter, "Trigger cues", spec.cue),
    };
  },
);

const explicitArchetypeIds = new Set(EXPLICIT_ARCHETYPES.map((item) => item.id));
const METHOD_DERIVED_ARCHETYPES: readonly ArchetypeRecord[] = PILOT_CONCEPTS.flatMap(
  (concept) => concept.archetypeIds
    .filter((id) => !explicitArchetypeIds.has(id))
    .map((id) => ({
      id,
      conceptId: concept.id,
      title: concept.title,
      decisionCue: concept.methods[0]?.decisionCues.join("; ") ?? concept.title,
      response: concept.methods[0]?.procedure.join(" ") ?? concept.objective,
      surfaceFormIds: [id.replace(/^archetype\./, "surface.")],
      source: {
        kind: "curriculum_decision" as const,
        path: "curriculum/v3/pilot-concepts.ts",
        section: "methods",
        anchor: concept.id,
        checkedOn: "2026-07-21" as const,
      },
    })),
);

export const PILOT_ARCHETYPES: readonly ArchetypeRecord[] = [
  ...EXPLICIT_ARCHETYPES,
  ...METHOD_DERIVED_ARCHETYPES,
];

type ExampleSpec = Omit<ExampleRecord, "id" | "source"> & { name: string };
const exampleSpecs: readonly ExampleSpec[] = [
  { name: "common-base quotient", chapter: "exponents_roots_properties", conceptIds: [E.commonBase, E.combine, E.nesting], authoredDifficulty: 2, role: "foundation", sourceQuestionNeedle: "25^{4}" },
  { name: "repeated power common base", chapter: "exponents_roots_properties", conceptIds: [E.repeated, E.commonBase], authoredDifficulty: 3, role: "application", sourceQuestionNeedle: "3^{x} + 3^{x}" },
  { name: "hidden exponential quadratic", chapter: "exponents_roots_properties", conceptIds: [E.hiddenQuadratic, E.commonBase], authoredDifficulty: 5, role: "transfer_or_boundary", sourceQuestionNeedle: "4^{x} - 10" },
  { name: "sentence equation", chapter: "algebraic_translation", conceptIds: [A.dictionary, A.order], authoredDifficulty: 2, role: "foundation", sourceQuestionNeedle: "four times a number" },
  { name: "leftover shortfall", chapter: "algebraic_translation", conceptIds: [A.sameTotal], authoredDifficulty: 3, role: "application", sourceQuestionNeedle: "poster at a shop" },
  { name: "integer constrained sufficiency", chapter: "algebraic_translation", conceptIds: [A.integerConstraints], authoredDifficulty: 4, role: "transfer_or_boundary", sourceQuestionNeedle: "snack stand sells apples" },
  { name: "two draws without replacement", chapter: "probability", conceptIds: [P.withoutReplacement], authoredDifficulty: 2, role: "foundation", sourceQuestionNeedle: "jar contains" },
  { name: "at least two committee quota", chapter: "probability", conceptIds: [P.combinations], authoredDifficulty: 4, role: "application", sourceQuestionNeedle: "reading club selects" },
  { name: "first defective position", chapter: "probability", conceptIds: [P.withoutReplacement], authoredDifficulty: 5, role: "transfer_or_boundary", sourceQuestionNeedle: "flashlights contains exactly" },
];

export const PILOT_EXAMPLES: readonly ExampleRecord[] = exampleSpecs.map((spec) => ({
  ...spec,
  id: entityId("example", spec.chapter, spec.name),
  source: lessonSource(spec.chapter, "Worked examples", spec.sourceQuestionNeedle),
}));

type CheckSpec = { chapter: Subtopic; name: string; concepts: readonly string[]; needle: string };
const checkSpecs: readonly CheckSpec[] = [
  { chapter: "exponents_roots_properties", name: "prime-power conversion fluency", concepts: [E.commonBase, E.fluency], needle: "convert $4, 8, 9" },
  { chapter: "exponents_roots_properties", name: "absolute-value sign explanation", concepts: [E.evenSign], needle: "state why $\\sqrt{x^{2}} = |x|$" },
  { chapter: "exponents_roots_properties", name: "repeated power collapse", concepts: [E.repeated], needle: "collapse $n$ identical copies" },
  { chapter: "exponents_roots_properties", name: "hidden quadratic substitution", concepts: [E.hiddenQuadratic], needle: "substitute $y = a^{x}$" },
  { chapter: "exponents_roots_properties", name: "power ordering regions", concepts: [E.ordering], needle: "rank $x$, $x^{2}$" },
  { chapter: "exponents_roots_properties", name: "power equals one cases", concepts: [E.equalsOne, E.commonBase], needle: "list every case that makes $w^{k} = 1$" },
  { chapter: "exponents_roots_properties", name: "radical square extraction", concepts: [E.radicals], needle: "simplify any $\\sqrt{N}$" },
  { chapter: "algebraic_translation", name: "subtraction word order", concepts: [A.order], needle: "translate \"$k$ less than $m$\"" },
  { chapter: "algebraic_translation", name: "inequality phrase mapping", concepts: [A.inequalityWords], needle: "map \"at least / at most" },
  { chapter: "algebraic_translation", name: "integer-bound direction", concepts: [A.integerEndpoints], needle: "round in the correct direction" },
  { chapter: "algebraic_translation", name: "leftover shortfall setup", concepts: [A.sameTotal], needle: "leftover/shortfall money problems" },
  { chapter: "algebraic_translation", name: "age shift all people", concepts: [A.ages], needle: "add $t$ to every age" },
  { chapter: "algebraic_translation", name: "integer sufficiency check", concepts: [A.integerConstraints], needle: "test integer and positivity constraints" },
  { chapter: "algebraic_translation", name: "check original sentence", concepts: [A.dictionary], needle: "original sentence" },
  { chapter: "probability", name: "name exact complement", concepts: [P.complement], needle: "name the exact complement" },
  { chapter: "probability", name: "shrink draws", concepts: [P.withoutReplacement], needle: "shrink both numerator and denominator" },
  { chapter: "probability", name: "combination sample consistency", concepts: [P.combinations], needle: "never mix ordered with unordered" },
  { chapter: "probability", name: "union overlap", concepts: [P.union], needle: "subtract the overlap" },
  { chapter: "probability", name: "exactly one formula", concepts: [P.exactlyOne], needle: "write $p(1-q) + (1-p)q$" },
  { chapter: "probability", name: "restricted denominator", concepts: [P.restricted], needle: "restricts the sample space" },
  { chapter: "probability", name: "parity and symmetry first", concepts: [P.parity, P.circular], needle: "parity and symmetry" },
];

export const PILOT_CHECKS: readonly CheckRecord[] = checkSpecs.map((spec) => ({
  id: entityId("check", spec.chapter, spec.name),
  chapter: spec.chapter,
  conceptIds: spec.concepts,
  evidenceKind: "self_report_prompt",
  isGraded: false,
  sourceTextNeedle: spec.needle,
  source: lessonSource(spec.chapter, "Before you drill", spec.needle),
}));
