import { PILOT_CONCEPT_IDS } from "../pilot-concepts.ts";
import type { ConceptSegment, ProgressiveHint } from "./types.ts";

const P = PILOT_CONCEPT_IDS.probability;

function hints(
  owner: string,
  copy: Record<ProgressiveHint["kind"], string>,
): ProgressiveHint[] {
  return (["goal", "trigger", "setup", "next_move"] as const).map((kind) => ({
    id: `hint.q86.probability.${owner}.${kind.replace("_", "-")}`,
    kind,
    textMd: copy[kind],
  }));
}

export const PROBABILITY_AT_LEAST_ONE_SEGMENT: ConceptSegment = {
  conceptId: P.atLeastOne,
  contentVersion: "3.0.0",
  sourcePath: "curriculum/v3/segments/probability-at-least-one.ts",
  objective:
    "Given an at-least-one event, compute its probability through the exact all-none complement and use conditional factors when sampling without replacement.",
  prerequisiteChecks: [
    {
      id: "prereq.q86.probability.at-least-one.exact-complement-language",
      prerequisiteConceptIds: [P.complement],
      promptMd:
        "Without calculating, state the exact complement of: **at least one selected tile is blue**.",
      answer: {
        kind: "exact",
        acceptedAnswers: [
          "no selected tile is blue",
          "none of the selected tiles is blue",
          "zero selected tiles are blue",
        ],
      },
      explanationMd:
        "The count of blue tiles can be $0,1,2,\\ldots$. Negating “at least one” leaves exactly the $0$ case.",
    },
  ],
  intuitiveModelMd:
    "Imagine every possible draw path as a branch on a tree. “At least one success” usually occupies many branches: success first, success later, or several successes. Its complement—**no successes**—is one clean branch. Count that branch, then take the probability mass left over.",
  formalRuleMd:
    "If $A$ is the event “at least one success,” then $A^c$ is “zero successes,” so $$P(A)=1-P(A^c).$$ For draws without replacement, the all-failure branch uses conditional factors: $$P(A^c)=P(F_1)P(F_2\\mid F_1)\\cdots P(F_n\\mid F_1\\cap\\cdots\\cap F_{n-1}).$$ The numerator and denominator both change after each draw.",
  procedure: [
    "Translate the target literally: at least one success means the complement is zero successes.",
    "Write the entire all-failure path before doing arithmetic.",
    "Decide whether factors stay fixed (independent trials or replacement) or shrink (without replacement).",
    "Multiply the failure factors, subtract the product from one, and check that the result is between zero and one.",
  ],
  examples: [
    {
      id: "example.q86.probability.at-least-one.die-rolls",
      conceptIds: [P.atLeastOne, P.independent],
      authoredDifficulty: 2,
      role: "foundation",
      questionMd:
        "A fair six-sided die is rolled three times. What is the probability that at least one roll is a $6$?",
      intendedMethod: "complement with independent trials",
      answer: { kind: "numeric", value: 91 / 216 },
      answerLabelMd: "$\\frac{91}{216}$",
      solutionMd:
        "The complement is no $6$ on all three independent rolls. Its probability is $\\left(\\frac{5}{6}\\right)^3=\\frac{125}{216}$. Therefore, $$P(\\text{at least one }6)=1-\\frac{125}{216}=\\frac{91}{216}.$$",
      hints: hints("at-least-one-die-rolls", {
        goal: "Replace the many successful paths with one opposite event.",
        trigger: "The phrase **at least one** should trigger the complement.",
        setup: "Write $1-P(\\text{no }6\\text{ in three rolls})$.",
        next_move: "Each failure has probability $\\frac56$; multiply three fixed factors.",
      }),
    },
    {
      id: "example.q86.probability.at-least-one-colored-tiles-without-replacement",
      conceptIds: [P.atLeastOne, P.withoutReplacement],
      authoredDifficulty: 3,
      role: "application",
      questionMd:
        "A bag contains $4$ red tiles and $6$ white tiles. Two tiles are drawn without replacement. What is the probability that at least one is red?",
      intendedMethod: "complement with a shrinking pool",
      answer: { kind: "numeric", value: 2 / 3 },
      answerLabelMd: "$\\frac{2}{3}$",
      solutionMd:
        "The complement is drawing two white tiles. Because the first white tile is not replaced, $$P(\\text{two white})=\\frac{6}{10}\\cdot\\frac{5}{9}=\\frac13.$$ Hence, $$P(\\text{at least one red})=1-\\frac13=\\frac23.$$",
      hints: hints("at-least-one-colored-tiles", {
        goal: "Find the probability left after the all-white path.",
        trigger: "At least one red becomes zero red, or two white.",
        setup: "Write $1-\\frac{6}{10}\\cdot\\square$.",
        next_move: "After one white leaves, $5$ white tiles remain among $9$ total.",
      }),
    },
    {
      id: "example.q86.probability.at-least-one-quality-inspection",
      conceptIds: [P.atLeastOne, P.withoutReplacement],
      authoredDifficulty: 4,
      role: "transfer_or_boundary",
      questionMd:
        "A tray holds $12$ components, $3$ of which are flawed. Four components are inspected without replacement. What is the probability that the inspection finds at least one flawed component?",
      intendedMethod: "longer all-sound complement with cancellation",
      answer: { kind: "numeric", value: 41 / 55 },
      answerLabelMd: "$\\frac{41}{55}$",
      solutionMd:
        "The complement is that all four inspected components are sound. The sound count and total both shrink: $$P(\\text{all sound})=\\frac9{12}\\cdot\\frac8{11}\\cdot\\frac7{10}\\cdot\\frac6{9}=\\frac{14}{55}.$$ Thus, $$P(\\text{at least one flawed})=1-\\frac{14}{55}=\\frac{41}{55}.$$",
      hints: hints("at-least-one-quality-inspection", {
        goal: "Compute the single path on which the inspection misses every flaw.",
        trigger: "At least one flawed is easier through all four sound.",
        setup: "Start $1-\\frac9{12}\\cdot\\frac8{11}\\cdot\\frac7{10}\\cdot\\frac6{9}$.",
        next_move: "Cancel before multiplying; the all-sound product reduces to $\\frac{14}{55}$.",
      }),
    },
  ],
  contrastPair: {
    id: "contrast.q86.probability.at-least-one.replacement-versus-no-replacement",
    caseAMd:
      "With replacement from a bag with $4$ red and $6$ white tiles, two draws give $$1-\\left(\\frac6{10}\\right)^2=\\frac{16}{25}.$$",
    caseBMd:
      "Without replacement from the same bag, two draws give $$1-\\frac6{10}\\cdot\\frac5{9}=\\frac23.$$",
    explanationMd:
      "The target and complement are identical in both cases. Only the process changes: replacement keeps the failure factor fixed; no replacement makes the second factor conditional.",
  },
  misconceptions: [
    {
      id: "misconception.q86.probability.at-least-one.exactly-one-substitution",
      title: "Replacing at least one with exactly one",
      whyItFeelsPlausible:
        "The first qualifying count is one, so it is easy to stop there and ignore paths with two or more successes.",
      detectionCue:
        "Your favorable cases require one success and failures everywhere else.",
      correctionMd:
        "Use the complement of zero successes; it automatically includes one, two, and every larger possible success count.",
    },
    {
      id: "misconception.q86.probability.at-least-one.frozen-without-replacement-pool",
      title: "Freezing the pool without replacement",
      whyItFeelsPlausible:
        "The original totals are visually prominent, and repeated independent-trial formulas use the same fraction each time.",
      detectionCue:
        "Two adjacent no-replacement factors have the same denominator.",
      correctionMd:
        "After each failure, reduce both the remaining total and the remaining failure count before writing the next factor.",
    },
    {
      id: "misconception.q86.probability.at-least-one.wrong-negation",
      title: "Negating at least one as at least one failure",
      whyItFeelsPlausible:
        "The word “not” gets attached to the object instead of to the entire threshold statement.",
      detectionCue:
        "The proposed complement can occur at the same time as the target event.",
      correctionMd:
        "Negate the success count: not $S\\ge1$ is $S=0$, not “at least one failure.”",
    },
  ],
  checks: [
    {
      id: "check.q86.probability.at-least-one.name-the-zero-success-complement",
      conceptIds: [P.atLeastOne, P.complement],
      authoredDifficulty: 1,
      independence: "guided",
      promptMd: "What is the complement of **at least one machine stops** during a shift?",
      intendedMethod: "exact logical negation",
      answer: {
        kind: "exact",
        acceptedAnswers: ["no machine stops", "zero machines stop", "none of the machines stops"],
      },
      explanationMd: "Negating a count of at least one leaves a count of zero.",
      hints: hints("at-least-one-name-complement", {
        goal: "State the one event that makes the target false.",
        trigger: "Negate the count threshold, not just the noun.",
        setup: "Write the target as $S\\ge1$.",
        next_move: "Its complement is $S=0$.",
      }),
    },
    {
      id: "check.q86.probability.at-least-one.two-independent-attempts",
      conceptIds: [P.atLeastOne, P.independent],
      authoredDifficulty: 2,
      independence: "guided",
      promptMd:
        "An independent attempt succeeds with probability $\\frac14$. What is the probability of at least one success in two attempts?",
      intendedMethod: "independent all-failure complement",
      answer: { kind: "numeric", value: 7 / 16 },
      explanationMd: "$1-\\left(\\frac34\\right)^2=1-\\frac9{16}=\\frac7{16}$.",
      hints: hints("at-least-one-two-attempts", {
        goal: "Remove the probability that both attempts fail.",
        trigger: "At least one signals a zero-success complement.",
        setup: "Each failure has probability $\\frac34$.",
        next_move: "Evaluate $1-\\left(\\frac34\\right)^2$.",
      }),
    },
    {
      id: "check.q86.probability.at-least-one.two-draws-shrinking-pool",
      conceptIds: [P.atLeastOne, P.withoutReplacement],
      authoredDifficulty: 3,
      independence: "guided",
      promptMd:
        "A box contains $2$ marked tokens and $8$ unmarked tokens. Two are drawn without replacement. Find the probability of at least one marked token.",
      intendedMethod: "without-replacement all-unmarked complement",
      answer: { kind: "numeric", value: 17 / 45 },
      explanationMd: "$1-\\frac8{10}\\cdot\\frac7{9}=1-\\frac{28}{45}=\\frac{17}{45}$.",
      hints: hints("at-least-one-two-draws", {
        goal: "Subtract the all-unmarked path from one.",
        trigger: "Without replacement means the second factor changes.",
        setup: "Write $1-\\frac8{10}\\cdot\\frac7{9}$.",
        next_move: "Reduce $\\frac{56}{90}$ before subtracting.",
      }),
    },
    {
      id: "check.q86.probability.at-least-one.replacement-three-draws",
      conceptIds: [P.atLeastOne, P.independent],
      authoredDifficulty: 3,
      independence: "independent",
      promptMd:
        "A jar is sampled three times with replacement. Each draw has probability $\\frac3{10}$ of being green. Find the probability of at least one green draw.",
      intendedMethod: "fixed-factor complement",
      answer: { kind: "numeric", value: 657 / 1000 },
      explanationMd: "$1-\\left(\\frac7{10}\\right)^3=1-\\frac{343}{1000}=\\frac{657}{1000}$.",
      hints: hints("at-least-one-replacement-three-draws", {
        goal: "Compute one minus three failures.",
        trigger: "Replacement keeps every failure probability unchanged.",
        setup: "The all-failure probability is $\\left(\\frac7{10}\\right)^3$.",
        next_move: "Subtract $\\frac{343}{1000}$ from one.",
      }),
    },
    {
      id: "check.q86.probability.at-least-one.premium-items-without-replacement",
      conceptIds: [P.atLeastOne, P.withoutReplacement],
      authoredDifficulty: 4,
      independence: "independent",
      promptMd:
        "A lot contains $5$ premium and $15$ standard items. Three items are selected without replacement. What is the probability that at least one is premium?",
      intendedMethod: "three-factor shrinking complement",
      answer: { kind: "numeric", value: 137 / 228 },
      explanationMd:
        "$1-\\frac{15}{20}\\cdot\\frac{14}{19}\\cdot\\frac{13}{18}=1-\\frac{91}{228}=\\frac{137}{228}$.",
      hints: hints("at-least-one-premium-items", {
        goal: "Find the probability that every selected item is standard.",
        trigger: "At least one premium becomes all standard.",
        setup: "Use $\\frac{15}{20},\\frac{14}{19},\\frac{13}{18}$ in order.",
        next_move: "The product reduces to $\\frac{91}{228}$; subtract it from one.",
      }),
    },
    {
      id: "check.q86.probability.at-least-one.threshold-boundary",
      conceptIds: [P.atLeastOne, P.complement],
      authoredDifficulty: 4,
      independence: "independent",
      promptMd: "Which event is the exact complement of **at least two successes**?",
      intendedMethod: "threshold negation",
      answer: {
        kind: "multiple_choice",
        choices: [
          "No successes",
          "Exactly one success",
          "Zero or one success",
          "At least one failure",
        ],
        correctIndex: 2,
      },
      explanationMd:
        "Not $S\\ge2$ means $S<2$, so the complement contains both $S=0$ and $S=1$. This is why the all-none shortcut is specific to an at-least-one target.",
      hints: hints("at-least-one-threshold-boundary", {
        goal: "Negate the whole inequality that describes the success count.",
        trigger: "A threshold above one has more than one complementary count.",
        setup: "Write the target as $S\\ge2$.",
        next_move: "Negating gives $S<2$, which includes $0$ and $1$.",
      }),
    },
  ],
  speedMethod: {
    methodMd:
      "Write the skeleton $1-(\\text{failure path})$ immediately. For no-replacement draws, write every shrinking factor before multiplying, then cancel across the product.",
    safeWhen: [
      "The target is exactly at least one success.",
      "The all-none path has known independent or conditional factors.",
    ],
    unsafeWhen: [
      "The target is at least two or another threshold whose complement contains several counts.",
      "You reuse a fixed failure probability even though outcomes are sampled without replacement.",
    ],
  },
  recapMd:
    "At least one is a counting signal, not a multiplication rule. Name the exact zero-success complement, model the process honestly, multiply that one failure path, and subtract from one.",
  retrievalPrompts: [
    "Why does at least one collapse to one all-none path, while at least two does not?",
    "From memory, write the two-draw all-failure product with and without replacement.",
    "What visible feature tells you that the second probability factor must shrink?",
  ],
};
