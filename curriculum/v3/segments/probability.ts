import { PILOT_CONCEPT_IDS } from "../pilot-concepts.ts";
import type { ConceptSegment, ProgressiveHint } from "./types.ts";

const P = PILOT_CONCEPT_IDS.probability;

function hints(
  owner: string,
  goal: string,
  trigger: string,
  setup: string,
  nextMove: string,
): ProgressiveHint[] {
  const copy = { goal, trigger, setup, next_move: nextMove };
  return (["goal", "trigger", "setup", "next_move"] as const).map((kind) => ({
    id: `hint.q86.probability.${owner}.${kind.replace("_", "-")}`,
    kind,
    textMd: copy[kind],
  }));
}

const SOURCE = "curriculum/v3/segments/probability.ts" as const;

export const PROBABILITY_SEGMENTS: readonly ConceptSegment[] = [
  {
    conceptId: P.basic,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given a finite experiment, define equally likely elementary outcomes and compute a probability from favorable and total counts in the same representation.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.basic.count-a-complete-set",
        prerequisiteConceptIds: [],
        promptMd: "How many integers are in the inclusive list from $4$ through $11$?",
        answer: { kind: "numeric", value: 8 },
        explanationMd: String.raw`Inclusive counting gives $11-4+1=8$. A sample-space count must include both endpoints when both are possible outcomes.`,
      },
    ],
    intuitiveModelMd:
      "Picture probability as evenly distributed tickets. If every elementary outcome owns one ticket, the probability of an event is the fraction of all tickets carrying a favorable outcome. The fraction is valid only after you verify that the tickets really are equally likely.",
    formalRuleMd: String.raw`For a finite equiprobable sample space $S$ and event $E\subseteq S$, $$P(E)=\frac{|E|}{|S|}.$$ The numerator and denominator must count the same kind of elementary outcome. If outcomes have unequal probabilities, use $$P(E)=\sum_{s\in E}P(s)$$ instead.`,
    procedure: [
      "State exactly what one elementary outcome records.",
      "Verify from fairness, uniform random selection, or symmetry that those outcomes are equally likely.",
      "Count every elementary outcome and every favorable one using the same representation.",
      "Divide favorable by total, simplify, and check that the result lies from zero through one.",
    ],
    examples: [
      {
        id: "example.q86.probability.basic.eight-sector-spinner",
        conceptIds: [P.basic],
        authoredDifficulty: 1,
        role: "foundation",
        questionMd:
          "A fair spinner has $8$ equal sectors, $3$ of them teal. What is the probability of landing on teal?",
        intendedMethod: "count equally likely sectors",
        answer: { kind: "numeric", value: 3 / 8 },
        answerLabelMd: "$\\frac{3}{8}$",
        solutionMd: String.raw`Each equal sector is one equally likely outcome. There are $3$ favorable sectors among $8$, so $$P(\text{teal})=\frac38.$$`,
        hints: hints(
          "basic.spinner",
          "Identify the equal-sized outcomes and the favorable subset.",
          "The word fair and the equal sectors justify equal likelihood.",
          "Use favorable teal sectors over all sectors.",
          "Substitute $3$ over $8$ and simplify if possible.",
        ),
      },
      {
        id: "example.q86.probability.basic.multiple-of-five-ticket",
        conceptIds: [P.basic],
        authoredDifficulty: 2,
        role: "application",
        questionMd:
          "One integer is chosen uniformly from $1$ through $24$. What is the probability that it is a multiple of $5$?",
        intendedMethod: "list favorable integers in an inclusive uniform range",
        answer: { kind: "numeric", value: 1 / 6 },
        answerLabelMd: "$\\frac{1}{6}$",
        solutionMd: String.raw`The $24$ integers are equally likely. The favorable values are $5,10,15,20$, so $$P(\text{multiple of }5)=\frac4{24}=\frac16.$$`,
        hints: hints(
          "basic.multiple-five",
          "Count the selected integers and then the multiples of five among them.",
          "Uniform selection makes individual integers—not verbal categories—equiprobable.",
          "List $5,10,15,20$ over a denominator of $24$.",
          "Reduce $\\frac4{24}$ by dividing numerator and denominator by $4$.",
        ),
      },
      {
        id: "example.q86.probability.basic.false-half-symmetry",
        conceptIds: [P.basic],
        authoredDifficulty: 3,
        role: "transfer_or_boundary",
        questionMd:
          "A fair die is rolled. What is the probability that the result is less than $5$?",
        intendedMethod: "count faces rather than outcome labels",
        answer: { kind: "numeric", value: 2 / 3 },
        answerLabelMd: "$\\frac{2}{3}$",
        solutionMd: String.raw`The two labels “less than $5$” and “not less than $5$” are not equally likely. Four of the six faces, $1,2,3,4$, are favorable. Therefore, $$P(\text{result}<5)=\frac46=\frac23.$$`,
        hints: hints(
          "basic.false-half",
          "Measure probability on die faces, not on the two verbal possibilities.",
          "Two event labels do not imply two equally likely events.",
          "The favorable face set is $\\{1,2,3,4\\}$.",
          "Place its $4$ members over all $6$ faces and reduce.",
        ),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.basic.equal-outcomes-versus-equal-labels",
      caseAMd:
        "A fair coin has two equally likely elementary outcomes, so one named face has probability $1/2$.",
      caseBMd:
        "A fair die has two labels, “below $5$” and “at least $5$,” but those labels contain $4$ and $2$ faces, so they are not equally likely.",
      explanationMd:
        "Favorable-over-total applies to equally likely elementary outcomes. Event names are collections of outcomes and need not divide the probability mass evenly.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.basic.two-labels-means-half",
        title: "Two labels must mean fifty-fifty",
        whyItFeelsPlausible:
          "Every event can be described as happening or not happening, which visually creates two boxes.",
        detectionCue:
          "The work writes $1/2$ without counting the elementary outcomes inside each box.",
        correctionMd:
          "Return to the fair elementary outcomes, count how many belong to each event, and divide those counts.",
      },
      {
        id: "misconception.q86.probability.basic.mismatched-counting-units",
        title: "Mixing counting units",
        whyItFeelsPlausible:
          "A favorable category count can look comparable to a total object count even though they describe different units.",
        detectionCue:
          "The numerator counts categories, arrangements, or pairs while the denominator counts individual objects.",
        correctionMd:
          "Write a sentence defining one elementary outcome, then make both counts answer that same sentence.",
      },
      {
        id: "misconception.q86.probability.basic.unproved-equiprobability",
        title: "Assuming outcomes are equally likely",
        whyItFeelsPlausible:
          "The phrase “at random” is often remembered as permission to divide counts automatically.",
        detectionCue:
          "No fairness, uniform-choice, or symmetry statement supports the denominator count.",
        correctionMd:
          "Confirm equal likelihood explicitly; otherwise add the probabilities of favorable outcomes instead of dividing raw counts.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.basic.ten-cards",
        conceptIds: [P.basic],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "A card is chosen uniformly from cards numbered $1$ through $10$. Find $P(\\text{number}>7)$.",
        intendedMethod: "count favorable numbered cards",
        answer: { kind: "numeric", value: 3 / 10 },
        explanationMd: "The favorable cards are $8,9,10$, so the probability is $3/10$.",
        hints: hints("basic.check-ten", "Count the favorable cards.", "Uniform selection makes all ten cards equally likely.", "List the integers above seven.", "Put the three favorable values over ten."),
      },
      {
        id: "check.q86.probability.basic.odd-die",
        conceptIds: [P.basic],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "What is the probability of an odd result on a fair six-sided die?",
        intendedMethod: "count odd faces",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "$1,3,5$ are favorable, so $3/6=1/2$.",
        hints: hints("basic.check-odd", "List the odd faces.", "A fair die has six equiprobable faces.", "Use $\\{1,3,5\\}$ over all six faces.", "Reduce $3/6$."),
      },
      {
        id: "check.q86.probability.basic.range-endpoints",
        conceptIds: [P.basic],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "One integer is chosen uniformly from $7$ through $16$. What is the probability it is at most $9$?",
        intendedMethod: "inclusive range count",
        answer: { kind: "numeric", value: 3 / 10 },
        explanationMd: "There are $16-7+1=10$ total integers and $7,8,9$ are favorable.",
        hints: hints("basic.check-range", "Count both inclusive endpoints.", "The total is not $16-7$ because both endpoint values can be chosen.", "Use $10$ total values and $3$ favorable values.", "Form $3/10$."),
      },
      {
        id: "check.q86.probability.basic.prime-sector",
        conceptIds: [P.basic],
        authoredDifficulty: 2,
        independence: "independent",
        promptMd: "A fair $9$-sector spinner is labeled $1$ through $9$. Find the probability of a prime label.",
        intendedMethod: "count prime-labeled equal sectors",
        answer: { kind: "numeric", value: 4 / 9 },
        explanationMd: "$2,3,5,7$ are the four prime labels among nine equal sectors.",
        hints: hints("basic.check-prime", "Identify all prime labels.", "Remember that $1$ is not prime.", "Count $2,3,5,7$.", "Use $4$ favorable sectors over $9$."),
      },
      {
        id: "check.q86.probability.basic.multiple-seven",
        conceptIds: [P.basic],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "An integer is selected uniformly from $10$ through $39$. Find the probability it is divisible by $7$.",
        intendedMethod: "inclusive total and multiple count",
        answer: { kind: "numeric", value: 2 / 15 },
        explanationMd: "There are $30$ values; $14,21,28,35$ are favorable, so $4/30=2/15$.",
        hints: hints("basic.check-seven", "Count the range and its multiples of seven.", "Use inclusive counting for the denominator.", "There are $30$ values and four favorable multiples.", "Reduce $4/30$."),
      },
      {
        id: "check.q86.probability.basic.category-boundary",
        conceptIds: [P.basic],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "A fair die is rolled. Find the probability that the result is either $1$ or greater than $2$.",
        intendedMethod: "list the union of favorable faces",
        answer: { kind: "numeric", value: 5 / 6 },
        explanationMd: "The favorable faces are $1,3,4,5,6$; only $2$ is excluded.",
        hints: hints("basic.check-category", "List the actual favorable faces.", "The word either joins two disjoint face sets here.", "Combine $\\{1\\}$ with $\\{3,4,5,6\\}$.", "Five of six faces qualify."),
      },
    ],
    speedMethod: {
      methodMd:
        "Write one-line sets for favorable and total outcomes; if every listed total outcome has the same chance, divide their sizes immediately.",
      safeWhen: [
        "The elementary outcomes are explicitly fair or uniformly selected.",
        "Numerator and denominator count the same type of outcome.",
      ],
      unsafeWhen: [
        "Only the event labels, rather than their elementary outcomes, appear symmetric.",
        "The random mechanism assigns unequal probabilities to different outcomes.",
      ],
    },
    recapMd:
      "Probability is favorable probability mass over total mass. Raw favorable-over-total counting is a shortcut earned by equiprobability, not by the mere presence of randomness.",
    retrievalPrompts: [
      "What sentence should you complete before counting: one elementary outcome records what?",
      "Give an example in which two verbal outcomes do not each have probability one-half.",
      "Why must the numerator and denominator use the same representation?",
    ],
  },

  {
    conceptId: P.complement,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given a target event, state its disjoint and exhaustive logical complement, compute that opposite event, and subtract its probability from one.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.complement.event-count",
        prerequisiteConceptIds: [P.basic],
        promptMd: "A fair die is rolled. What is the probability of a result in $\\{1,2\\}$?",
        answer: { kind: "numeric", value: 1 / 3 },
        explanationMd: "Two of six equally likely faces are favorable, so $2/6=1/3$.",
      },
    ],
    intuitiveModelMd:
      "Draw a box around the entire sample space. An event colors part of the box; its complement is every uncolored point, with no overlap and no gap. If one side has a cleaner description, calculate that side and use the total probability of one.",
    formalRuleMd: String.raw`For any event $A$, its complement $A^c$ contains exactly the outcomes outside $A$. Therefore, $$A\cap A^c=\varnothing,\qquad A\cup A^c=S,$$ and $$P(A)=1-P(A^c).$$ Negating a threshold changes its direction: the complement of $X\ge k$ is $X\le k-1$.`,
    procedure: [
      "Describe the target event with a set, count condition, or inequality.",
      "Negate the entire description and verify that no outcome fits both events or neither event.",
      "Compute the easier of the event and complement probabilities.",
      "If you computed the complement, subtract it from one and check the two probabilities sum to one.",
    ],
    examples: [
      {
        id: "example.q86.probability.complement.not-prime",
        conceptIds: [P.complement, P.basic],
        authoredDifficulty: 1,
        role: "foundation",
        questionMd:
          "A token numbered from $1$ through $12$ is selected uniformly. What is the probability that its number is not prime?",
        intendedMethod: "count the smaller prime complement",
        answer: { kind: "numeric", value: 7 / 12 },
        answerLabelMd: "$\\frac{7}{12}$",
        solutionMd: String.raw`The prime complement is $\{2,3,5,7,11\}$, with probability $5/12$. Thus, $$P(\text{not prime})=1-\frac5{12}=\frac7{12}.$$`,
        hints: hints("complement.not-prime", "Count the opposite event if it is shorter.", "Not prime has prime as its exact complement.", "List the five primes through twelve.", "Subtract $5/12$ from one."),
      },
      {
        id: "example.q86.probability.complement.maximum-two-dice",
        conceptIds: [P.complement, P.independent],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "Two fair dice are rolled. What is the probability that the larger result is at least $5$?",
        intendedMethod: "negate a maximum threshold",
        answer: { kind: "numeric", value: 5 / 9 },
        answerLabelMd: "$\\frac{5}{9}$",
        solutionMd: String.raw`The complement of maximum at least $5$ is that both dice are at most $4$. That has probability $(4/6)^2=4/9$. Hence, $$P(\max\ge5)=1-\frac49=\frac59.$$`,
        hints: hints("complement.max-dice", "Describe when the maximum fails to reach five.", "Not $\\max\\ge5$ means both results are at most four.", "Write $1-(4/6)(4/6)$.", "Simplify the complement to $4/9$ and subtract."),
      },
      {
        id: "example.q86.probability.complement.threshold-boundary",
        conceptIds: [P.complement],
        authoredDifficulty: 4,
        role: "transfer_or_boundary",
        questionMd:
          "A process records a nonnegative integer $X$. Which event is the exact complement of $X\\ge3$?",
        intendedMethod: "logical threshold negation",
        answer: {
          kind: "multiple_choice",
          choices: ["$X=0$", "$X\\le2$", "$X<3$ but $X\\ne2$", "$X\\ge4$"],
          correctIndex: 1,
        },
        answerLabelMd: "$X\\le2$",
        solutionMd: String.raw`An integer fails $X\ge3$ precisely when it is below $3$, which for a nonnegative integer means $X\in\{0,1,2\}$. Thus the complement is $X\le2$, not only $X=0$.`,
        hints: hints("complement.threshold", "Negate the full inequality.", "A threshold above one leaves several counts on the other side.", "Change $X\\ge3$ to $X<3$.", "Use integrality to rewrite $X<3$ as $X\\le2$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.complement.exact-negation-versus-partial-opposite",
      caseAMd: "The complement of at least $3$ successes is at most $2$ successes.",
      caseBMd: "Zero successes is only one part of that complement; one or two successes are also outside the target.",
      explanationMd:
        "A usable complement must be exhaustive. A merely different or extreme case can leave uncounted outcomes between the two descriptions.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.complement.opposite-extreme-only",
        title: "Choosing only the opposite extreme",
        whyItFeelsPlausible:
          "Words such as “at least” make zero feel like the natural opposite endpoint.",
        detectionCue:
          "There are middle counts that satisfy neither the target nor the proposed complement.",
        correctionMd:
          "Negate the inequality symbolically, then translate the entire resulting range back into words.",
      },
      {
        id: "misconception.q86.probability.complement.overlapping-opposite",
        title: "Using an event that still overlaps the target",
        whyItFeelsPlausible:
          "Negating one noun can sound opposite even when both statements can occur together.",
        detectionCue:
          "You can construct an outcome that makes both the event and its alleged complement true.",
        correctionMd:
          "Test disjointness and exhaustiveness separately before applying one minus.",
      },
      {
        id: "misconception.q86.probability.complement.forgetting-subtraction",
        title: "Reporting the easier opposite event",
        whyItFeelsPlausible:
          "Most of the arithmetic is spent on the complement, so that intermediate result feels final.",
        detectionCue:
          "The answer describes the event you chose to avoid rather than the event in the question.",
        correctionMd:
          "Label the intermediate probability as $P(A^c)$ and finish with $1-P(A^c)$.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.complement.not-six",
        conceptIds: [P.complement],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "A fair die is rolled. Find the probability that the result is not $6$.",
        intendedMethod: "one minus one face",
        answer: { kind: "numeric", value: 5 / 6 },
        explanationMd: "$1-P(6)=1-1/6=5/6$.",
        hints: hints("complement.check-not-six", "Use the single-face opposite.", "Exactly six is the complement of not six.", "Write $1-1/6$.", "Subtract to obtain $5/6$."),
      },
      {
        id: "check.q86.probability.complement.negate-at-most",
        conceptIds: [P.complement],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "What is the exact complement of **at most four errors**?",
        intendedMethod: "threshold negation",
        answer: { kind: "exact", acceptedAnswers: ["at least five errors", "5 or more errors", "five or more errors"] },
        explanationMd: "Not $E\\le4$ means $E\\ge5$ for an integer error count.",
        hints: hints("complement.check-at-most", "Negate the count inequality.", "At most four means $E\\le4$.", "Negation gives $E>4$.", "For an integer count, $E>4$ means at least five."),
      },
      {
        id: "check.q86.probability.complement.card-range",
        conceptIds: [P.complement, P.basic],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "A card numbered $1$ through $20$ is selected uniformly. Find $P(\\text{number is not divisible by }4)$.",
        intendedMethod: "subtract multiples of four",
        answer: { kind: "numeric", value: 3 / 4 },
        explanationMd: "Five cards are divisible by $4$, so the complement has probability $1-5/20=3/4$.",
        hints: hints("complement.check-div-four", "Count the divisible-by-four complement.", "The multiples are $4,8,12,16,20$.", "Write $1-5/20$.", "Reduce to $3/4$."),
      },
      {
        id: "check.q86.probability.complement.maximum-three",
        conceptIds: [P.complement, P.independent],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Two fair dice are rolled. Find the probability that their maximum exceeds $3$.",
        intendedMethod: "all-results-at-most-three complement",
        answer: { kind: "numeric", value: 3 / 4 },
        explanationMd: "The complement is both dice at most $3$: $(3/6)^2=1/4$. Subtracting gives $3/4$.",
        hints: hints("complement.check-max-three", "Describe when the maximum does not exceed three.", "Both dice must be at most three.", "Use $1-(3/6)^2$.", "Subtract $1/4$ from one."),
      },
      {
        id: "check.q86.probability.complement.at-least-four-negation",
        conceptIds: [P.complement],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Which event is the complement of **at least four arrivals are late**?",
        intendedMethod: "exact threshold negation",
        answer: {
          kind: "multiple_choice",
          choices: ["No arrivals are late", "Exactly three are late", "At most three are late", "At least five are late"],
          correctIndex: 2,
        },
        explanationMd: "Every count below four—zero through three—belongs to the complement.",
        hints: hints("complement.check-four-arrivals", "Capture every count that fails the target.", "Not at least four means fewer than four.", "For integer counts, fewer than four is at most three.", "Choose the option containing zero, one, two, and three."),
      },
      {
        id: "check.q86.probability.complement.nonempty-test",
        conceptIds: [P.complement],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "An event $A$ has probability $7/15$. Find $P(A^c)$.",
        intendedMethod: "subtract from total probability",
        answer: { kind: "numeric", value: 8 / 15 },
        explanationMd: "$P(A^c)=1-7/15=8/15$.",
        hints: hints("complement.check-symbolic", "Use the exhaustive pair total.", "$A$ and $A^c$ have probabilities summing to one.", "Write $1-7/15$.", "Convert one to $15/15$."),
      },
    ],
    speedMethod: {
      methodMd:
        "Translate the target into an inequality or explicit set, place the word NOT around the whole statement, and simplify the negation before counting.",
      safeWhen: [
        "The proposed complement is disjoint from and exhaustive with the target.",
        "The complement has fewer or cleaner cases than the target.",
      ],
      unsafeWhen: [
        "The proposed opposite leaves middle cases uncovered.",
        "The arithmetic result for the complement is reported without subtracting from one.",
      ],
    },
    recapMd:
      "A complement is not a vague opposite. It is the exact remainder of the sample space: no overlap, no gap, and a total probability of one.",
    retrievalPrompts: [
      "Negate at least seven successes without using the word not.",
      "What two logical tests must a proposed complement pass?",
      "Why is zero successes not the complement of at least three successes?",
    ],
  },

  {
    conceptId: P.independent,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given a joint event, verify that its component events are independent and multiply their marginal probabilities without confusing intersection with alternatives.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.independent.multiply-fractions",
        prerequisiteConceptIds: [P.basic],
        promptMd: "Compute $\\frac{2}{3}\\cdot\\frac{3}{5}$.",
        answer: { kind: "numeric", value: 2 / 5 },
        explanationMd: "Cancel the common factor of $3$, or multiply and reduce: $6/15=2/5$.",
      },
    ],
    intuitiveModelMd:
      "An intersection is a path through successive gates: the outcome must pass the first gate and the second. Independence means the first result does not resize the second gate. The fraction of paths surviving both gates is therefore the product of the two unchanged fractions.",
    formalRuleMd: String.raw`Events $A$ and $B$ are independent when $$P(B\mid A)=P(B),$$ equivalently $$P(A\cap B)=P(A)P(B).$$ For several mutually independent trials, multiply the probability required at each trial. The word “and” identifies an intersection, but multiplication of marginal probabilities is justified only by independence.`,
    procedure: [
      "Translate the target into a joint path using and or intersection notation.",
      "Verify independence from separate random mechanisms, replacement, or an explicit independence statement.",
      "Write the marginal probability required at each stage and multiply them.",
      "Check that the intersection probability is no larger than any component probability.",
    ],
    examples: [
      {
        id: "example.q86.probability.independent.coin-and-die",
        conceptIds: [P.independent, P.basic],
        authoredDifficulty: 1,
        role: "foundation",
        questionMd:
          "A fair coin is tossed and a fair die is rolled. What is the probability of a head and an even die result?",
        intendedMethod: "multiply independent mechanism probabilities",
        answer: { kind: "numeric", value: 1 / 4 },
        answerLabelMd: "$\\frac{1}{4}$",
        solutionMd: String.raw`The coin and die are separate mechanisms. Thus, $$P(H\text{ and even})=P(H)P(\text{even})=\frac12\cdot\frac36=\frac14.$$`,
        hints: hints("independent.coin-die", "Build the path that satisfies both requirements.", "Separate fair devices make the events independent.", "Use $P(H)=1/2$ and $P(\\text{even})=3/6$.", "Multiply the two fractions and reduce."),
      },
      {
        id: "example.q86.probability.independent.two-sensors",
        conceptIds: [P.independent],
        authoredDifficulty: 2,
        role: "application",
        questionMd:
          "Two independent sensors detect a signal with probabilities $4/5$ and $7/10$, respectively. What is the probability that both detect it?",
        intendedMethod: "independent intersection product",
        answer: { kind: "numeric", value: 14 / 25 },
        answerLabelMd: "$\\frac{14}{25}$",
        solutionMd: String.raw`Independence is explicit, and both detections are required. Therefore, $$P(\text{both})=\frac45\cdot\frac7{10}=\frac{28}{50}=\frac{14}{25}.$$`,
        hints: hints("independent.sensors", "Find the probability that the path passes both sensors.", "The word independent licenses multiplication of marginal probabilities.", "Write $(4/5)(7/10)$.", "Cancel the factor of two before multiplying."),
      },
      {
        id: "example.q86.probability.independent.same-die-boundary",
        conceptIds: [P.independent, P.basic],
        authoredDifficulty: 4,
        role: "transfer_or_boundary",
        questionMd:
          "One fair die is rolled. Let $A$ be an even result and $B$ be a result greater than $3$. What is $P(A\\cap B)$?",
        intendedMethod: "count the intersection because the events are dependent",
        answer: { kind: "numeric", value: 1 / 3 },
        answerLabelMd: "$\\frac{1}{3}$",
        solutionMd: String.raw`The intersection is $\{4,6\}$, so $P(A\cap B)=2/6=1/3$. Although $P(A)=P(B)=1/2$, their product $1/4$ is wrong: knowing the result is even changes the chance that it exceeds $3$ to $2/3$.`,
        hints: hints("independent.same-die", "Determine which die faces satisfy both descriptions.", "Two events on one roll are not automatically independent.", "Intersect $\\{2,4,6\\}$ with $\\{4,5,6\\}$.", "Count $\\{4,6\\}$ over all six faces."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.independent.separate-trials-versus-shared-trial",
      caseAMd:
        "A coin landing heads and a separate die landing even are independent, so $(1/2)(1/2)=1/4$.",
      caseBMd:
        "On one die, being even and exceeding $3$ share the same result; direct intersection gives $2/6$, not $(1/2)(1/2)$.",
      explanationMd:
        "The grammar of and identifies what must happen together. The random mechanism—not the grammar—determines whether marginal probabilities may be multiplied.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.independent.and-always-multiply",
        title: "Treating and as automatic multiplication",
        whyItFeelsPlausible:
          "Many introductory examples deliberately pair and with independent devices.",
        detectionCue:
          "Marginal probabilities are multiplied without checking whether one event changes the other.",
        correctionMd:
          "Use and to define the intersection; then separately prove independence or compute a conditional factor.",
      },
      {
        id: "misconception.q86.probability.independent.adding-joint-events",
        title: "Adding events that must both occur",
        whyItFeelsPlausible:
          "Addition is familiar from combining counts, and the two named events look like separate contributions.",
        detectionCue:
          "The calculated joint probability exceeds one of its component probabilities.",
        correctionMd:
          "A both-event is more restrictive than either component; for independent events, multiply rather than add.",
      },
      {
        id: "misconception.q86.probability.independent.confusing-disjoint-and-independent",
        title: "Confusing disjoint with independent",
        whyItFeelsPlausible:
          "Both words suggest that events are somehow separate.",
        detectionCue:
          "Two positive-probability events that cannot occur together are labeled independent.",
        correctionMd:
          "Disjoint positive-probability events have intersection zero, so observing one makes the other impossible; they are dependent.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.independent.two-coins",
        conceptIds: [P.independent],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "Two fair coins are tossed independently. Find $P(\\text{two heads})$.",
        intendedMethod: "two-stage independent product",
        answer: { kind: "numeric", value: 1 / 4 },
        explanationMd: "$(1/2)(1/2)=1/4$.",
        hints: hints("independent.check-coins", "Require heads at both stages.", "The tosses are explicitly independent.", "Write $(1/2)(1/2)$.", "Multiply to get $1/4$."),
      },
      {
        id: "check.q86.probability.independent.three-successes",
        conceptIds: [P.independent],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "An independent trial succeeds with probability $2/3$. Find the probability of three successive successes.",
        intendedMethod: "repeat a fixed probability factor",
        answer: { kind: "numeric", value: 8 / 27 },
        explanationMd: "$(2/3)^3=8/27$.",
        hints: hints("independent.check-three", "Build the all-success path.", "Independence keeps every factor at $2/3$.", "Write $(2/3)^3$.", "Cube numerator and denominator."),
      },
      {
        id: "check.q86.probability.independent.success-failure",
        conceptIds: [P.independent],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Two independent attempts have success probability $3/5$. Find the probability of success followed by failure.",
        intendedMethod: "ordered independent path",
        answer: { kind: "numeric", value: 6 / 25 },
        explanationMd: "The failure probability is $2/5$, so $(3/5)(2/5)=6/25$.",
        hints: hints("independent.check-sf", "Translate each required stage.", "Failure is the complement of success.", "Use $3/5$ then $2/5$.", "Multiply the ordered factors."),
      },
      {
        id: "check.q86.probability.independent.devices",
        conceptIds: [P.independent],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Independent devices operate correctly with probabilities $9/10$ and $5/6$. Find the probability both operate correctly.",
        intendedMethod: "independent intersection product",
        answer: { kind: "numeric", value: 3 / 4 },
        explanationMd: "$(9/10)(5/6)=45/60=3/4$.",
        hints: hints("independent.check-devices", "Require both correct-operation events.", "Independence is given.", "Write $(9/10)(5/6)$.", "Cancel $5$ with $10$ and $3$ with $6$."),
      },
      {
        id: "check.q86.probability.independent.boundary-test",
        conceptIds: [P.independent, P.basic],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "On one fair die, $A=\\{1,2,3\\}$ and $B=\\{3,4\\}$. Find $P(A\\cap B)$.",
        intendedMethod: "direct intersection rather than unsupported product",
        answer: { kind: "numeric", value: 1 / 6 },
        explanationMd: "The only shared face is $3$, so the intersection probability is $1/6$.",
        hints: hints("independent.check-boundary", "Find outcomes shared by both sets.", "No independence claim is given.", "Intersect $\\{1,2,3\\}$ and $\\{3,4\\}$.", "One of six faces remains."),
      },
      {
        id: "check.q86.probability.independent.sanity-bound",
        conceptIds: [P.independent],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Independent events have probabilities $2/5$ and $3/8$. Find their intersection probability.",
        intendedMethod: "multiply and apply intersection bound",
        answer: { kind: "numeric", value: 3 / 20 },
        explanationMd: "$(2/5)(3/8)=6/40=3/20$, which is below both marginals.",
        hints: hints("independent.check-bound", "Use the supplied independence relation.", "The target is their intersection.", "Multiply $(2/5)(3/8)$.", "Reduce $6/40$ to $3/20$."),
      },
    ],
    speedMethod: {
      methodMd:
        "Mark each required stage with a fraction and connect stages with multiplication only after circling the wording or process that guarantees independence.",
      safeWhen: [
        "Trials are explicitly independent or arise from separate fair mechanisms.",
        "Sampling with replacement preserves the relevant distribution.",
      ],
      unsafeWhen: [
        "Sampling without replacement changes the remaining pool.",
        "Both events are properties of one outcome and independence has not been verified.",
      ],
    },
    recapMd:
      "Independent and means multiply: the joint path keeps each marginal factor unchanged. Without independence, retain the intersection target but replace a marginal factor with a conditional calculation.",
    retrievalPrompts: [
      "What numerical sanity bound must every intersection probability satisfy?",
      "Why can two disjoint positive-probability events not be independent?",
      "Separate the jobs of the word and and the condition of independence.",
    ],
  },

  {
    conceptId: P.withoutReplacement,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given a specified sequence of draws without replacement, update favorable and total counts after every draw and multiply the resulting conditional probabilities.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.without-replacement.remaining-pool",
        prerequisiteConceptIds: [P.basic],
        promptMd: "A bag starts with $7$ objects. After one object is removed and not returned, how many objects remain?",
        answer: { kind: "numeric", value: 6 },
        explanationMd: "Without replacement, the removed object leaves the pool, so $7-1=6$ remain.",
      },
    ],
    intuitiveModelMd:
      "Imagine crossing out the object drawn and rewriting the bag inventory before reaching in again. Every factor is a fresh snapshot. The denominator always drops by one; a type-specific numerator drops only when that type was removed.",
    formalRuleMd: String.raw`For sequential events $A_1,\ldots,A_r$, $$P(A_1\cap\cdots\cap A_r)=P(A_1)P(A_2\mid A_1)\cdots P(A_r\mid A_1\cap\cdots\cap A_{r-1}).$$ Without replacement from $N$ objects, the next denominator is $N-1,N-2,\ldots$. Each favorable count reflects the exact earlier removals.`,
    procedure: [
      "Write the required draw order, including the type needed at each position.",
      "Before each draw, record the remaining total and the remaining count of the required type.",
      "Form one conditional fraction per draw and multiply the ordered factors.",
      "Cancel before multiplying and verify no numerator exceeds its current denominator.",
    ],
    examples: [
      {
        id: "example.q86.probability.without-replacement.blue-then-amber",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd:
          "A bag contains $3$ blue and $2$ amber tokens. Two are drawn without replacement. What is the probability of blue first and amber second?",
        intendedMethod: "ordered shrinking-pool product",
        answer: { kind: "numeric", value: 3 / 10 },
        answerLabelMd: "$\\frac{3}{10}$",
        solutionMd: String.raw`Blue first has probability $3/5$. After a blue leaves, both amber tokens remain among $4$ total, so $$P(B\text{ then }A)=\frac35\cdot\frac24=\frac3{10}.$$`,
        hints: hints("without.blue-amber", "Track the inventory after the first draw.", "Without replacement shrinks the denominator.", "Use $3/5$ first, then $2/4$ because no amber was removed.", "Multiply and reduce."),
      },
      {
        id: "example.q86.probability.without-replacement.two-flawed",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "Among $8$ components, $3$ are flawed. Two are inspected without replacement. What is the probability that both are flawed?",
        intendedMethod: "same-type numerator and denominator shrink",
        answer: { kind: "numeric", value: 3 / 28 },
        answerLabelMd: "$\\frac{3}{28}$",
        solutionMd: String.raw`The first flawed component leaves $2$ flawed among $7$ total. Thus, $$P(FF)=\frac38\cdot\frac27=\frac6{56}=\frac3{28}.$$`,
        hints: hints("without.two-flawed", "Write a factor for each flawed draw.", "Both the favorable count and total count shrink after the first flawed item.", "Use $(3/8)(2/7)$.", "Reduce $6/56$ to $3/28$."),
      },
      {
        id: "example.q86.probability.without-replacement.blue-red-blue",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 4,
        role: "transfer_or_boundary",
        questionMd:
          "A box contains $4$ blue and $3$ red markers. Three are drawn without replacement. Find the probability of blue, then red, then blue.",
        intendedMethod: "multi-type ordered conditional path",
        answer: { kind: "numeric", value: 6 / 35 },
        answerLabelMd: "$\\frac{6}{35}$",
        solutionMd: String.raw`The inventory changes after each specified color: $$P(BRB)=\frac47\cdot\frac36\cdot\frac35=\frac{36}{210}=\frac6{35}.$$ For the third draw, only $3$ blue markers remain because the first draw removed blue.`,
        hints: hints("without.brb", "Update the color inventory at all three positions.", "A red second draw leaves the blue count unchanged after its initial decrease.", "Write $(4/7)(3/6)(3/5)$.", "Cancel before multiplying to obtain $6/35$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.without-replacement.fixed-versus-shrinking-factor",
      caseAMd:
        "With replacement, two blue draws from $3$ blue among $5$ use $(3/5)(3/5)$.",
      caseBMd:
        "Without replacement, the same target uses $(3/5)(2/4)$ because one blue object and one total object are gone.",
      explanationMd:
        "The first factor matches. Replacement determines whether the second probability resets or conditions on the first removal.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.without-replacement.frozen-denominator",
        title: "Freezing the original denominator",
        whyItFeelsPlausible:
          "The initial total is stated prominently and repeated-trial formulas often reuse it.",
        detectionCue:
          "Adjacent factors retain the same denominator although objects are not returned.",
        correctionMd:
          "Reduce the total by one after every draw before writing the next fraction.",
      },
      {
        id: "misconception.q86.probability.without-replacement.always-shrinking-numerator",
        title: "Shrinking every type numerator",
        whyItFeelsPlausible:
          "The phrase shrink as you go can be overgeneralized to every count in the bag.",
        detectionCue:
          "A color count decreases even though the previous draw removed a different color.",
        correctionMd:
          "Decrease only the numerator for the removed type; every removal still decreases the total.",
      },
      {
        id: "misconception.q86.probability.without-replacement.ignoring-order",
        title: "Replacing a specified path with an unordered event",
        whyItFeelsPlausible:
          "The same selected objects appear in several possible orders.",
        detectionCue:
          "The calculation includes both blue-red and red-blue when the question specifies one order.",
        correctionMd:
          "Write the requested color at each draw position before assigning conditional factors.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.without-replacement.two-green",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "A bag has $2$ green and $3$ white tokens. Two are drawn without replacement. Find $P(GG)$.",
        intendedMethod: "two same-type conditional factors",
        answer: { kind: "numeric", value: 1 / 10 },
        explanationMd: "$(2/5)(1/4)=1/10$.",
        hints: hints("without.check-green", "Track two green removals.", "Both green and total counts shrink after the first draw.", "Write $(2/5)(1/4)$.", "Multiply to get $2/20=1/10$."),
      },
      {
        id: "check.q86.probability.without-replacement.red-then-white",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "A box has $4$ red and $6$ white objects. Find the probability of red then white without replacement.",
        intendedMethod: "different-type conditional product",
        answer: { kind: "numeric", value: 4 / 15 },
        explanationMd: "$(4/10)(6/9)=24/90=4/15$ because the red removal leaves all six white objects.",
        hints: hints("without.check-rw", "Update the pool after red is removed.", "The white numerator remains six while the denominator becomes nine.", "Use $(4/10)(6/9)$.", "Reduce the product to $4/15$."),
      },
      {
        id: "check.q86.probability.without-replacement.three-sound",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 3,
        independence: "guided",
        promptMd: "Seven of $9$ parts are sound. Three are drawn without replacement. Find the probability all three are sound.",
        intendedMethod: "three-factor same-type path",
        answer: { kind: "numeric", value: 5 / 12 },
        explanationMd: "$(7/9)(6/8)(5/7)=5/12$ after cancellation.",
        hints: hints("without.check-sound", "Write one sound factor per draw.", "Both sound and total counts drop each time.", "Use $(7/9)(6/8)(5/7)$.", "Cancel the sevens, then reduce $30/72$."),
      },
      {
        id: "check.q86.probability.without-replacement.white-blue-white",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "A jar contains $5$ white and $3$ blue beads. Find $P(WBW)$ in three draws without replacement.",
        intendedMethod: "ordered three-stage color path",
        answer: { kind: "numeric", value: 5 / 28 },
        explanationMd: "$(5/8)(3/7)(4/6)=60/336=5/28$.",
        hints: hints("without.check-wbw", "Track which color count changes after each draw.", "After white then blue, four white remain among six total.", "Write $(5/8)(3/7)(4/6)$.", "Cancel before multiplying to reach $5/28$."),
      },
      {
        id: "check.q86.probability.without-replacement.last-special",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "A bag has $1$ gold and $4$ gray tokens. Three are drawn without replacement. Find the probability the gold token is drawn third.",
        intendedMethod: "gray-gray-gold path",
        answer: { kind: "numeric", value: 1 / 5 },
        explanationMd: "The required path is gray, gray, gold: $(4/5)(3/4)(1/3)=1/5$.",
        hints: hints("without.check-gold-third", "Translate third into the exact prefix path.", "Gold third requires two gray draws first.", "Use $(4/5)(3/4)(1/3)$.", "Cancel all intermediate factors."),
      },
      {
        id: "check.q86.probability.without-replacement.sequence-boundary",
        conceptIds: [P.withoutReplacement],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "A box has $3$ black and $3$ white tiles. Find the probability of black, black, white without replacement.",
        intendedMethod: "ordered shrinking fractions",
        answer: { kind: "numeric", value: 3 / 20 },
        explanationMd: "$(3/6)(2/5)(3/4)=18/120=3/20$.",
        hints: hints("without.check-bbw", "Use the specified color at every position.", "The two black draws reduce black from three to one before the white draw.", "Write $(3/6)(2/5)(3/4)$.", "Reduce $18/120$ to $3/20$."),
      },
    ],
    speedMethod: {
      methodMd:
        "Draw a tiny inventory table and cross out the drawn type after each factor; cancel across the full product before multiplying.",
      safeWhen: [
        "The question specifies an ordered sequence of draws.",
        "Every removal and remaining count is unambiguous.",
      ],
      unsafeWhen: [
        "The target is unordered and several draw orders must be combined.",
        "A removed object is silently treated as though it were replaced.",
      ],
    },
    recapMd:
      "Without replacement is conditional multiplication. Each fraction is a snapshot of the remaining pool, so the denominator always shrinks and only removed types lose numerator count.",
    retrievalPrompts: [
      "After drawing red from a red-blue bag, which counts change before a blue draw?",
      "Write the generic numerator and denominator pattern for drawing three special objects from $s$ special among $N$.",
      "Why can blue-red and red-blue have equal probabilities yet still be different paths?",
    ],
  },

  {
    conceptId: P.combinations,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given an unordered random selection, count favorable and total groups consistently with combinations, splitting quota conditions into disjoint exact-count cases.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.combinations.choose-six-two",
        prerequisiteConceptIds: [P.basic],
        promptMd: "How many unordered pairs can be chosen from $6$ distinct objects?",
        answer: { kind: "numeric", value: 15 },
        explanationMd: String.raw`There are $\binom62=6\cdot5/2=15$ unordered pairs.`,
      },
    ],
    intuitiveModelMd:
      "Imagine every possible selected group written on one card. If the procedure chooses groups uniformly, each card is one elementary outcome. Count favorable group-cards and all group-cards with the same unordered convention.",
    formalRuleMd: String.raw`The number of unordered $r$-member subsets from $n$ distinct objects is $$\binom nr=\frac{n!}{r!(n-r)!}.$$ If a uniformly random group of size $r$ is selected, $$P(E)=\frac{\text{favorable groups}}{\binom nr}.$$ For a quota, multiply choices across categories within a case and add disjoint exact-count cases.`,
    procedure: [
      "Confirm that selection order and role assignment do not define different outcomes.",
      "Count all size-$r$ groups with one combination expression.",
      "Translate the favorable condition into one exact quota or several disjoint quota cases.",
      "Multiply category choices within each case, add cases, divide by the total, and simplify.",
    ],
    examples: [
      {
        id: "example.q86.probability.combinations.committee-includes-lina",
        conceptIds: [P.combinations, P.basic],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd:
          "A $3$-person committee is selected uniformly from $7$ people. What is the probability that Lina is selected?",
        intendedMethod: "fix one member and choose the remainder",
        answer: { kind: "numeric", value: 3 / 7 },
        answerLabelMd: "$\\frac{3}{7}$",
        solutionMd: String.raw`There are $\binom73=35$ committees. Favorable committees contain Lina and choose $2$ of the other $6$: $\binom62=15$. Thus, $$P=\frac{15}{35}=\frac37.$$`,
        hints: hints("combinations.lina", "Count all committees and those with Lina fixed.", "Order within a committee is irrelevant.", "Use $\\binom73$ total and $\\binom62$ favorable.", "Compute $15/35$ and reduce."),
      },
      {
        id: "example.q86.probability.combinations.two-history-books",
        conceptIds: [P.combinations],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "Four books are selected uniformly from $6$ history and $4$ science books. What is the probability that exactly $2$ selected books are history books?",
        intendedMethod: "multiply category combinations for an exact quota",
        answer: { kind: "numeric", value: 3 / 7 },
        answerLabelMd: "$\\frac{3}{7}$",
        solutionMd: String.raw`There are $\binom{10}4=210$ total groups. Exactly two history books requires choosing $2$ of $6$ history and $2$ of $4$ science: $$\frac{\binom62\binom42}{\binom{10}4}=\frac{15\cdot6}{210}=\frac37.$$`,
        hints: hints("combinations.history", "Translate exactly two history into category choices.", "A four-book group with two history must also have two science.", "Use $\\binom62\\binom42/\\binom{10}4$.", "Evaluate $90/210$ and reduce."),
      },
      {
        id: "example.q86.probability.combinations.at-least-two-analysts",
        conceptIds: [P.combinations],
        authoredDifficulty: 5,
        role: "transfer_or_boundary",
        questionMd:
          "A team of $4$ is selected uniformly from $5$ analysts and $3$ designers. What is the probability that at least $2$ analysts are selected?",
        intendedMethod: "sum disjoint exact-quota combination cases",
        answer: { kind: "numeric", value: 13 / 14 },
        answerLabelMd: "$\\frac{13}{14}$",
        solutionMd: String.raw`The total is $\binom84=70$. Favorable analyst counts are $2,3,4$: $$\binom52\binom32+\binom53\binom31+\binom54\binom30=30+30+5=65.$$ Therefore, $P=65/70=13/14$.`,
        hints: hints("combinations.analysts", "Split at least two into exact analyst counts.", "The possible counts are two, three, or four analysts.", "Write one analyst-choice times designer-choice product for each count.", "Add $30+30+5$ and divide by $70$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.combinations.unordered-groups-versus-ordered-paths",
      caseAMd:
        "Selecting one red and one blue object as an unordered pair counts each physical pair once with combinations.",
      caseBMd:
        "Drawing red then blue records a sequence; blue then red is a distinct path even if the final pair is the same.",
      explanationMd:
        "Either representation can solve an order-irrelevant event, but favorable and total counts must use one representation consistently.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.combinations.ordered-numerator-unordered-denominator",
        title: "Mixing ordered and unordered counts",
        whyItFeelsPlausible:
          "A favorable sequence is easy to imagine while the total number of groups is easy to compute.",
        detectionCue:
          "The numerator distinguishes first and second positions but the denominator is a combination.",
        correctionMd:
          "Define one outcome as either a sequence or a group, and use that definition in both counts.",
      },
      {
        id: "misconception.q86.probability.combinations.quota-without-remainder",
        title: "Choosing the target category but not the remainder",
        whyItFeelsPlausible:
          "The stated quota receives attention while the remaining seats feel automatic.",
        detectionCue:
          "The favorable count contains only $\\binom ak$ even though the group also needs members from another category.",
        correctionMd:
          "After choosing the quota, multiply by the number of ways to fill every remaining group position.",
      },
      {
        id: "misconception.q86.probability.combinations.at-least-as-exactly",
        title: "Counting at least as exactly",
        whyItFeelsPlausible:
          "The threshold count is the first favorable case and often has the largest count.",
        detectionCue:
          "Only the minimum qualifying category count appears in the numerator.",
        correctionMd:
          "List every feasible exact count at or above the threshold and add their disjoint group counts.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.combinations.includes-one-person",
        conceptIds: [P.combinations],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "A pair is chosen from $5$ people. What is the probability a specified person is in the pair?",
        intendedMethod: "fix one and choose one",
        answer: { kind: "numeric", value: 2 / 5 },
        explanationMd: "$\\binom41/\\binom52=4/10=2/5$.",
        hints: hints("combinations.check-person", "Fix the specified person in favorable pairs.", "Choose the other member from four people.", "Divide $\\binom41$ by $\\binom52$.", "Reduce $4/10$."),
      },
      {
        id: "check.q86.probability.combinations.two-red",
        conceptIds: [P.combinations],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Two balls are selected from $4$ red and $3$ blue balls. Find the probability both are red.",
        intendedMethod: "unordered favorable and total pairs",
        answer: { kind: "numeric", value: 2 / 7 },
        explanationMd: "$\\binom42/\\binom72=6/21=2/7$.",
        hints: hints("combinations.check-red", "Count red pairs over all pairs.", "Order is irrelevant to the selected pair.", "Use $\\binom42/\\binom72$.", "Reduce $6/21$."),
      },
      {
        id: "check.q86.probability.combinations.one-of-each",
        conceptIds: [P.combinations],
        authoredDifficulty: 3,
        independence: "guided",
        promptMd: "Three items are chosen from $5$ type A and $4$ type B items. Find the probability of exactly $2$ type A items.",
        intendedMethod: "two-category exact quota",
        answer: { kind: "numeric", value: 10 / 21 },
        explanationMd: "$\\binom52\\binom41/\\binom93=40/84=10/21$.",
        hints: hints("combinations.check-two-a", "Fill all three selected positions by category count.", "Exactly two A forces exactly one B.", "Use $\\binom52\\binom41/\\binom93$.", "Reduce $40/84$."),
      },
      {
        id: "check.q86.probability.combinations.no-juniors",
        conceptIds: [P.combinations],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "A committee of $3$ is chosen from $6$ seniors and $2$ juniors. Find the probability of no juniors.",
        intendedMethod: "choose all members from one category",
        answer: { kind: "numeric", value: 5 / 14 },
        explanationMd: "$\\binom63/\\binom83=20/56=5/14$.",
        hints: hints("combinations.check-no-junior", "Count all-senior committees.", "No juniors means all three come from the six seniors.", "Use $\\binom63/\\binom83$.", "Reduce $20/56$."),
      },
      {
        id: "check.q86.probability.combinations.at-least-one-blue",
        conceptIds: [P.combinations, P.complement],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Three balls are selected from $5$ red and $3$ blue balls. Find the probability of at least one blue ball.",
        intendedMethod: "unordered all-red complement",
        answer: { kind: "numeric", value: 23 / 28 },
        explanationMd: "$1-\\binom53/\\binom83=1-10/56=46/56=23/28$.",
        hints: hints("combinations.check-at-least-blue", "Use the all-red group as a complement.", "At least one blue excludes only zero blue.", "Write $1-\\binom53/\\binom83$.", "Subtract $10/56$ from one to obtain $23/28$."),
      },
      {
        id: "check.q86.probability.combinations.at-least-two-specialists",
        conceptIds: [P.combinations],
        authoredDifficulty: 5,
        independence: "independent",
        promptMd: "A group of $3$ is selected from $4$ specialists and $4$ generalists. Find the probability of at least $2$ specialists.",
        intendedMethod: "sum exact-two and exact-three cases",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "$(\\binom42\\binom41+\\binom43)/\\binom83=(24+4)/56=1/2$.",
        hints: hints("combinations.check-specialists", "Split the threshold into exact counts.", "Favorable groups have exactly two or exactly three specialists.", "Use $\\binom42\\binom41+\\binom43$ over $\\binom83$.", "Compute $28/56$."),
      },
    ],
    speedMethod: {
      methodMd:
        "Write the denominator $\\binom nr$ first, then annotate every favorable case with category counts that sum to $r$.",
      safeWhen: [
        "A selected group is uniform and internal order is irrelevant.",
        "Quota cases are disjoint and together exhaust the target event.",
      ],
      unsafeWhen: [
        "Selected roles or positions make different orders distinct.",
        "The numerator and denominator use different outcome representations.",
      ],
    },
    recapMd:
      "Combination probability treats each unordered selected group as one outcome. Count all groups and favorable groups consistently, multiplying across categories and adding only disjoint quota cases.",
    retrievalPrompts: [
      "How do you count exactly two type A members in a four-person group?",
      "What diagnostic reveals an ordered numerator over an unordered denominator?",
      "Translate at least two specialists into exact-count cases before writing combinations.",
    ],
  },

  {
    conceptId: P.union,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given two event descriptions joined by or, compute their union by adding individual probabilities and subtracting the overlap exactly once.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.union.identify-overlap",
        prerequisiteConceptIds: [P.basic],
        promptMd: "Among integers $1$ through $12$, how many are divisible by both $2$ and $3$?",
        answer: { kind: "numeric", value: 2 },
        explanationMd: "Divisibility by both means divisibility by $6$; the values are $6$ and $12$.",
      },
    ],
    intuitiveModelMd:
      "Picture two overlapping circles. Adding both circle areas counts the lens-shaped overlap twice—once with each circle. Subtracting that lens once leaves every outcome in either circle counted exactly once.",
    formalRuleMd:
      "For any events $A$ and $B$, $$P(A\\cup B)=P(A)+P(B)-P(A\\cap B).$$ If $A$ and $B$ are mutually exclusive, the intersection probability is zero and simple addition is valid. Independence does not mean zero overlap; for independent events the overlap is often $P(A)P(B)$.",
    procedure: [
      "Define event A, event B, and the outcomes satisfying both.",
      "Compute the probability or count of each event in one common sample space.",
      "Add the two event values and subtract the intersection value once.",
      "Check that the union is at least as large as either event and no larger than one.",
    ],
    examples: [
      {
        id: "example.q86.probability.union.multiples-two-or-five",
        conceptIds: [P.union, P.basic],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd:
          "One integer is selected uniformly from $1$ through $20$. What is the probability that it is divisible by $2$ or by $5$?",
        intendedMethod: "integer-count inclusion-exclusion",
        answer: { kind: "numeric", value: 3 / 5 },
        answerLabelMd: "$\\frac{3}{5}$",
        solutionMd:
          "There are $10$ multiples of $2$ and $4$ multiples of $5$. The $2$ multiples of $10$ are in both lists. Thus the favorable count is $10+4-2=12$, and $$P=\\frac{12}{20}=\\frac35.$$",
        hints: hints("union.two-five", "Count both divisibility sets without double-counting.", "Numbers divisible by ten lie in both sets.", "Use $10+4-2$ favorable values.", "Divide $12$ by $20$ and reduce."),
      },
      {
        id: "example.q86.probability.union.known-event-probabilities",
        conceptIds: [P.union],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "Events $A$ and $B$ satisfy $P(A)=3/5$, $P(B)=1/2$, and $P(A\\cap B)=1/4$. Find $P(A\\cup B)$.",
        intendedMethod: "probability inclusion-exclusion",
        answer: { kind: "numeric", value: 17 / 20 },
        answerLabelMd: "$\\frac{17}{20}$",
        solutionMd:
          "Apply inclusion-exclusion directly: $$P(A\\cup B)=\\frac35+\\frac12-\\frac14=\\frac{12+10-5}{20}=\\frac{17}{20}.$$",
        hints: hints("union.known", "Combine both events while removing one duplicate overlap.", "Use the union formula.", "Write $3/5+1/2-1/4$.", "Use denominator $20$ to obtain $17/20$."),
      },
      {
        id: "example.q86.probability.union.squares-or-cubes",
        conceptIds: [P.union, P.basic],
        authoredDifficulty: 5,
        role: "transfer_or_boundary",
        questionMd:
          "An integer is chosen uniformly from $1$ through $100$. What is the probability that it is a perfect square or a perfect cube?",
        intendedMethod: "count overlap as sixth powers",
        answer: { kind: "numeric", value: 3 / 25 },
        answerLabelMd: "$\\frac{3}{25}$",
        solutionMd:
          "There are $10$ squares ($1^2$ through $10^2$) and $4$ cubes ($1^3$ through $4^3$). A number in both sets is a sixth power; $1$ and $64$ are the two sixth powers at most $100$. The union has $10+4-2=12$ values, so $P=12/100=3/25$.",
        hints: hints("union.square-cube", "Count squares, cubes, and numbers that are both.", "A number that is both a square and cube is a sixth power.", "Use $10+4-2$ favorable integers.", "Reduce $12/100$ to $3/25$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.union.disjoint-versus-independent",
      caseAMd:
        "Odd and even on one die are disjoint, so their union probability is $1/2+1/2=1$.",
      caseBMd:
        "Heads on a coin and even on an independent die overlap in joint outcomes, so their union is $1/2+1/2-1/4=3/4$.",
      explanationMd:
        "Disjoint means the overlap is empty. Independent means observing one does not change the other; independent positive-probability events do overlap.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.union.forgetting-overlap",
        title: "Adding overlapping events directly",
        whyItFeelsPlausible:
          "The word or suggests addition, and each individual event count is easy to see.",
        detectionCue:
          "Outcomes satisfying both conditions appear once in each addend.",
        correctionMd:
          "Name the intersection before adding, then subtract its count or probability once.",
      },
      {
        id: "misconception.q86.probability.union.subtracting-all-of-one-event",
        title: "Removing an entire event instead of its overlap",
        whyItFeelsPlausible:
          "The instruction to avoid double-counting can be remembered as a broad subtraction.",
        detectionCue:
          "The result equals only one event or is smaller than one of the component probabilities.",
        correctionMd:
          "Subtract only outcomes in both events; outcomes exclusive to each event remain in the union.",
      },
      {
        id: "misconception.q86.probability.union.independent-means-no-overlap",
        title: "Treating independent events as disjoint",
        whyItFeelsPlausible:
          "Both terms sound like the events are separate.",
        detectionCue:
          "A positive overlap is set to zero solely because independence is stated.",
        correctionMd:
          "For independent events, compute the overlap as a product; set it to zero only when simultaneous occurrence is impossible.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.union.multiples-three-or-four",
        conceptIds: [P.union],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "From $1$ through $24$, what is the probability of selecting a multiple of $3$ or $4$?",
        intendedMethod: "count union of divisibility sets",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "There are $8+6-2=12$ favorable values; the overlap is the two multiples of $12$.",
        hints: hints("union.check-three-four", "Count each set and their shared multiples.", "The overlap consists of multiples of $12$.", "Use $8+6-2$.", "Divide $12$ by $24$."),
      },
      {
        id: "check.q86.probability.union.probability-values",
        conceptIds: [P.union],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "If $P(A)=2/5$, $P(B)=1/3$, and $P(A\\cap B)=1/10$, find $P(A\\cup B)$.",
        intendedMethod: "union formula",
        answer: { kind: "numeric", value: 19 / 30 },
        explanationMd: "$2/5+1/3-1/10=12/30+10/30-3/30=19/30$.",
        hints: hints("union.check-values", "Add both probabilities and remove their overlap.", "Use inclusion-exclusion.", "Write $2/5+1/3-1/10$.", "Convert to denominator $30$."),
      },
      {
        id: "check.q86.probability.union.disjoint-colors",
        conceptIds: [P.union],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "A bag draw is red with probability $1/4$ and blue with probability $2/5$; colors are mutually exclusive. Find $P(\\text{red or blue})$.",
        intendedMethod: "disjoint union addition",
        answer: { kind: "numeric", value: 13 / 20 },
        explanationMd: "The overlap is zero, so $1/4+2/5=5/20+8/20=13/20$.",
        hints: hints("union.check-colors", "Use the fact that one draw cannot have both colors.", "Mutually exclusive means zero overlap.", "Add $1/4+2/5$.", "Use denominator $20$."),
      },
      {
        id: "check.q86.probability.union.multiples-six-or-eight",
        conceptIds: [P.union],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "An integer is selected from $1$ through $48$. Find the probability it is divisible by $6$ or $8$.",
        intendedMethod: "LCM overlap inclusion-exclusion",
        answer: { kind: "numeric", value: 1 / 4 },
        explanationMd: "Counts are $8$ and $6$ with $2$ multiples of $24$ in both: $(8+6-2)/48=1/4$.",
        hints: hints("union.check-six-eight", "Find the least common multiple for the overlap.", "Numbers in both sets are divisible by $24$.", "Count $8+6-2$ favorable values.", "Reduce $12/48$."),
      },
      {
        id: "check.q86.probability.union.independent-events",
        conceptIds: [P.union, P.independent],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Independent events have probabilities $1/2$ and $1/5$. Find the probability that at least one occurs.",
        intendedMethod: "independent overlap then inclusion-exclusion",
        answer: { kind: "numeric", value: 3 / 5 },
        explanationMd: "Their overlap is $(1/2)(1/5)=1/10$, so $1/2+1/5-1/10=3/5$.",
        hints: hints("union.check-independent", "Compute the overlap before applying the union formula.", "Independence makes the intersection a product, not zero.", "Use $1/2+1/5-(1/2)(1/5)$.", "Convert to tenths."),
      },
      {
        id: "check.q86.probability.union.sanity-check",
        conceptIds: [P.union],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "If $P(A)=0.7$, $P(B)=0.6$, and $P(A\\cap B)=0.4$, find $P(A\\cup B)$.",
        intendedMethod: "decimal inclusion-exclusion",
        answer: { kind: "numeric", value: 0.9 },
        explanationMd: "$0.7+0.6-0.4=0.9$, which is at least each marginal and at most one.",
        hints: hints("union.check-sanity", "Remove one copy of the shared probability.", "The raw sum counts the intersection twice.", "Compute $0.7+0.6-0.4$.", "Confirm the result does not exceed one."),
      },
    ],
    speedMethod: {
      methodMd:
        "Write A + B - BOTH above the work as soon as or joins potentially overlapping conditions.",
      safeWhen: [
        "Both events and their intersection are defined in the same sample space.",
        "The overlap can be counted directly or derived from valid independence.",
      ],
      unsafeWhen: [
        "The events are assumed disjoint merely because they have different names.",
        "Counts and probabilities from different denominators are combined directly.",
      ],
    },
    recapMd:
      "Or means union. Add the two event masses, recognize the mass counted twice, and subtract that intersection once; skip the subtraction only when overlap is impossible.",
    retrievalPrompts: [
      "Why are independent events usually not mutually exclusive?",
      "What set is the overlap of multiples of $a$ and multiples of $b$?",
      "State two bounds that a computed union probability should satisfy.",
    ],
  },

  {
    conceptId: P.exactlyOne,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given two independent events, compute the probability that exactly one occurs by adding the two disjoint success-failure orders.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.exactly-one.success-complement",
        prerequisiteConceptIds: [P.independent, P.union],
        promptMd: "If an event has probability $3/8$, what is its failure probability?",
        answer: { kind: "numeric", value: 5 / 8 },
        explanationMd: "Success and failure are complements, so $1-3/8=5/8$.",
      },
    ],
    intuitiveModelMd:
      "A two-event outcome table has four cells: both fail, A only, B only, and both succeed. Exactly one selects the two off-diagonal cells. Calculate each cell as a success-failure path and add them because they cannot happen together.",
    formalRuleMd:
      "For independent events $A$ and $B$ with $P(A)=p$ and $P(B)=q$, $$P(\\text{exactly one})=P(A\\cap B^c)+P(A^c\\cap B)=p(1-q)+(1-p)q.$$ This excludes both $A\\cap B$ and $A^c\\cap B^c$.",
    procedure: [
      "Write the two qualifying cases: A occurs and B does not, or A does not and B occurs.",
      "Replace every nonoccurrence probability with its complement.",
      "Multiply within each independent case and add the two disjoint case probabilities.",
      "Verify that neither both-success nor both-failure was included.",
    ],
    examples: [
      {
        id: "example.q86.probability.exactly-one.unequal-attempts",
        conceptIds: [P.exactlyOne, P.independent],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd:
          "Independent attempts A and B succeed with probabilities $1/3$ and $1/4$. What is the probability that exactly one succeeds?",
        intendedMethod: "add success-failure and failure-success paths",
        answer: { kind: "numeric", value: 5 / 12 },
        answerLabelMd: "$\\frac{5}{12}$",
        solutionMd:
          "The qualifying paths are A succeeds while B fails and A fails while B succeeds: $$\\frac13\\cdot\\frac34+\\frac23\\cdot\\frac14=\\frac14+\\frac16=\\frac5{12}.$$",
        hints: hints("exactly-one.unequal", "List both ways to get one success.", "Exactly one means success-failure or failure-success.", "Write $(1/3)(3/4)+(2/3)(1/4)$.", "Add $1/4+1/6$."),
      },
      {
        id: "example.q86.probability.exactly-one.coin-die",
        conceptIds: [P.exactlyOne, P.independent],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "A fair coin is tossed and a fair die is rolled independently. What is the probability that exactly one of these occurs: the coin shows heads; the die shows a number greater than $4$?",
        intendedMethod: "two unequal event paths",
        answer: { kind: "numeric", value: 1 / 2 },
        answerLabelMd: "$\\frac{1}{2}$",
        solutionMd:
          "The event probabilities are $1/2$ and $2/6=1/3$. Thus, $$P(\\text{exactly one})=\\frac12\\cdot\\frac23+\\frac12\\cdot\\frac13=\\frac13+\\frac16=\\frac12.$$",
        hints: hints("exactly-one.coin-die", "Find each event probability, then list the off-diagonal cases.", "The die event has two favorable faces.", "Use $(1/2)(2/3)+(1/2)(1/3)$.", "Add $1/3+1/6$."),
      },
      {
        id: "example.q86.probability.exactly-one.high-reliability",
        conceptIds: [P.exactlyOne, P.independent],
        authoredDifficulty: 4,
        role: "transfer_or_boundary",
        questionMd:
          "Independent systems operate with probabilities $4/5$ and $7/10$. What is the probability that exactly one operates?",
        intendedMethod: "asymmetric operation-failure paths",
        answer: { kind: "numeric", value: 19 / 50 },
        answerLabelMd: "$\\frac{19}{50}$",
        solutionMd:
          "The two paths are first operates and second fails, or first fails and second operates: $$\\frac45\\cdot\\frac3{10}+\\frac15\\cdot\\frac7{10}=\\frac{12}{50}+\\frac7{50}=\\frac{19}{50}.$$",
        hints: hints("exactly-one.systems", "Pair each system's operation with the other's failure.", "Failure probabilities are $1/5$ and $3/10$.", "Write $(4/5)(3/10)+(1/5)(7/10)$.", "Add the numerators over $50$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.exactly-one.exactly-one-versus-at-least-one",
      caseAMd:
        "Exactly one of A and B includes A-only and B-only but excludes both-success.",
      caseBMd:
        "At least one includes A-only, B-only, and both-success.",
      explanationMd:
        "The difference is the shared success cell. A result that includes $P(A\\cap B)$ answers at least one, not exactly one.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.exactly-one.counting-one-order",
        title: "Counting only one success-failure order",
        whyItFeelsPlausible:
          "The phrase exactly one sounds like a single case.",
        detectionCue:
          "The formula contains $p(1-q)$ but no symmetric case with A failing.",
        correctionMd:
          "Write both labels A-only and B-only before substituting probabilities.",
      },
      {
        id: "misconception.q86.probability.exactly-one.including-both-success",
        title: "Answering at least one",
        whyItFeelsPlausible:
          "At least one and exactly one share two prominent favorable cases.",
        detectionCue:
          "The complement of both-failure is used without removing both-success.",
        correctionMd:
          "Use only success-failure paths, or subtract both-success from the at-least-one probability.",
      },
      {
        id: "misconception.q86.probability.exactly-one.using-success-twice",
        title: "Forgetting failure complements",
        whyItFeelsPlausible:
          "Both stated numbers are success probabilities and therefore readily available.",
        detectionCue:
          "Each path multiplies $p$ and $q$, so both paths describe two successes rather than exactly one.",
        correctionMd:
          "Every exactly-one path contains one success factor and one failure factor.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.exactly-one.two-fair-coins",
        conceptIds: [P.exactlyOne],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "Two fair coins are tossed. Find the probability of exactly one head.",
        intendedMethod: "HT or TH",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "$P(HT)+P(TH)=1/4+1/4=1/2$.",
        hints: hints("exactly-one.check-coins", "List the two qualifying sequences.", "They are HT and TH.", "Each has probability $1/4$.", "Add the two disjoint paths."),
      },
      {
        id: "check.q86.probability.exactly-one.one-half-one-third",
        conceptIds: [P.exactlyOne],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Independent events have probabilities $1/2$ and $1/3$. Find the probability exactly one occurs.",
        intendedMethod: "two off-diagonal products",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "$(1/2)(2/3)+(1/2)(1/3)=1/3+1/6=1/2$.",
        hints: hints("exactly-one.check-half-third", "Pair each success with the other failure.", "The failure probabilities are $1/2$ and $2/3$.", "Write $(1/2)(2/3)+(1/2)(1/3)$.", "Add to get $1/2$."),
      },
      {
        id: "check.q86.probability.exactly-one.one-quarter",
        conceptIds: [P.exactlyOne],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Two independent attempts each succeed with probability $1/4$. Find the probability of exactly one success.",
        intendedMethod: "two equal success-failure orders",
        answer: { kind: "numeric", value: 3 / 8 },
        explanationMd: "$2(1/4)(3/4)=6/16=3/8$.",
        hints: hints("exactly-one.check-quarter", "The two qualifying paths have equal probability.", "There are two choices for which attempt succeeds.", "Compute $2(1/4)(3/4)$.", "Reduce $6/16$."),
      },
      {
        id: "check.q86.probability.exactly-one.three-fourths-one-fifth",
        conceptIds: [P.exactlyOne],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Independent events have probabilities $3/4$ and $1/5$. Find the probability exactly one occurs.",
        intendedMethod: "asymmetric off-diagonal products",
        answer: { kind: "numeric", value: 13 / 20 },
        explanationMd: "$(3/4)(4/5)+(1/4)(1/5)=12/20+1/20=13/20$.",
        hints: hints("exactly-one.check-three-fourths", "Use one success and one failure in each order.", "The complement probabilities are $1/4$ and $4/5$.", "Write $(3/4)(4/5)+(1/4)(1/5)$.", "Add over denominator $20$."),
      },
      {
        id: "check.q86.probability.exactly-one.both-high",
        conceptIds: [P.exactlyOne],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Two independent components work with probabilities $9/10$ and $4/5$. Find the probability exactly one fails.",
        intendedMethod: "work-fail or fail-work",
        answer: { kind: "numeric", value: 13 / 50 },
        explanationMd: "$(9/10)(1/5)+(1/10)(4/5)=9/50+4/50=13/50$.",
        hints: hints("exactly-one.check-high", "Exactly one fails is also exactly one works.", "Use work-fail and fail-work.", "Write $(9/10)(1/5)+(1/10)(4/5)$.", "Add $9/50+4/50$."),
      },
      {
        id: "check.q86.probability.exactly-one.boundary-distinction",
        conceptIds: [P.exactlyOne, P.union],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Independent events each have probability $1/2$. By how much does their at-least-one probability exceed their exactly-one probability?",
        intendedMethod: "identify both-success as the difference",
        answer: { kind: "numeric", value: 1 / 4 },
        explanationMd: "The difference is the both-success event, with probability $(1/2)(1/2)=1/4$.",
        hints: hints("exactly-one.check-boundary", "Compare which outcome cell one event includes and the other excludes.", "Only both-success separates at least one from exactly one.", "Compute the independent intersection.", "Multiply $(1/2)(1/2)$."),
      },
    ],
    speedMethod: {
      methodMd:
        "Sketch a two-by-two success/failure grid and select the two off-diagonal cells; for equal probabilities $p$, compress them to $2p(1-p)$.",
      safeWhen: [
        "There are exactly two independent events.",
        "Both success and failure probabilities are known.",
      ],
      unsafeWhen: [
        "The events are dependent, so path factors require conditionals.",
        "The target is at least one or exactly one among more than two trials.",
      ],
    },
    recapMd:
      "Exactly one of two consists of two disjoint paths: success-failure and failure-success. Multiply within each independent path, then add the paths.",
    retrievalPrompts: [
      "Which outcome cell distinguishes exactly one from at least one?",
      "Write the exactly-one formula for unequal event probabilities $p$ and $q$.",
      "Why does $2p(1-p)$ require equal probabilities and independence?",
    ],
  },

  {
    conceptId: P.restricted,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given an explicit condition or restricted subgroup, redefine the sample space and count favorable outcomes within that same restricted denominator.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.restricted.subgroup-fraction",
        prerequisiteConceptIds: [P.basic],
        promptMd: "Among $10$ remote employees, $4$ are designers. What fraction of the remote employees are designers?",
        answer: { kind: "numeric", value: 2 / 5 },
        explanationMd: "The relevant subgroup is the $10$ remote employees, so the fraction is $4/10=2/5$.",
      },
    ],
    intuitiveModelMd:
      "A condition closes the door on every outcome outside a smaller room. Once you know the outcome lies in that room, spread total probability one across only the outcomes still possible and count the target inside that room.",
    formalRuleMd:
      "For events $A$ and $C$ with $P(C)>0$, $$P(A\\mid C)=\\frac{P(A\\cap C)}{P(C)}.$$ In a finite equiprobable model, this becomes $$P(A\\mid C)=\\frac{|A\\cap C|}{|C|}.$$ The condition $C$ supplies the new denominator.",
    procedure: [
      "Identify the condition that has already occurred or defines the eligible pool.",
      "Remove outcomes that violate the condition and count the remaining restricted sample space.",
      "Count target outcomes that also satisfy the condition.",
      "Divide the within-condition favorable count by the within-condition total and check both use the same pool.",
    ],
    examples: [
      {
        id: "example.q86.probability.restricted.remote-designers",
        conceptIds: [P.restricted, P.basic],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd:
          "A company has $30$ employees. Of its $10$ remote employees, $4$ are designers. Given that a randomly selected employee is remote, what is the probability the employee is a designer?",
        intendedMethod: "use the conditioned subgroup as denominator",
        answer: { kind: "numeric", value: 2 / 5 },
        answerLabelMd: "$\\frac{2}{5}$",
        solutionMd:
          "The condition rules out the $20$ nonremote employees. Within the $10$ remote employees, $4$ are designers, so the probability is $4/10=2/5$.",
        hints: hints("restricted.remote", "Restrict attention to employees still possible after the condition.", "Given remote changes the denominator from thirty to ten.", "Use four remote designers over ten remote employees.", "Reduce $4/10$."),
      },
      {
        id: "example.q86.probability.restricted.even-multiple-three",
        conceptIds: [P.restricted],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "An integer is selected uniformly from $1$ through $40$. Given that it is divisible by $3$, what is the probability it is even?",
        intendedMethod: "count favorable values within multiples of three",
        answer: { kind: "numeric", value: 6 / 13 },
        answerLabelMd: "$\\frac{6}{13}$",
        solutionMd:
          "The restricted space is the $13$ multiples of $3$ from $3$ through $39$. The even ones are the $6$ multiples of $6$ from $6$ through $36$. Thus the conditional probability is $6/13$.",
        hints: hints("restricted.multiple-three", "List or count only multiples of three.", "Within that set, even means divisible by six.", "There are thirteen eligible multiples and six favorable multiples.", "Form $6/13$."),
      },
      {
        id: "example.q86.probability.restricted.even-sum-dice",
        conceptIds: [P.restricted, P.parity],
        authoredDifficulty: 4,
        role: "transfer_or_boundary",
        questionMd:
          "Two fair dice are rolled. Given that their sum is even, what is the probability that both results are odd?",
        intendedMethod: "restrict to same-parity ordered pairs",
        answer: { kind: "numeric", value: 1 / 2 },
        answerLabelMd: "$\\frac{1}{2}$",
        solutionMd:
          "An even sum requires both odd or both even. There are $3\\cdot3=9$ odd-odd pairs and $3\\cdot3=9$ even-even pairs, so the restricted space has $18$ pairs and $9$ are odd-odd. The probability is $9/18=1/2$.",
        hints: hints("restricted.even-sum", "Build the sample space satisfying the known even sum.", "Even sums arise from same-parity pairs.", "Count nine odd-odd and nine even-even ordered pairs.", "Divide the nine favorable pairs by eighteen eligible pairs."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.restricted.condition-before-versus-target-after",
      caseAMd:
        "Given that the employee is remote, remote employees form the denominator and remote designers form the numerator.",
      caseBMd:
        "Asking whether an unrestricted employee is both remote and a designer keeps all employees in the denominator.",
      explanationMd:
        "A given condition changes what outcomes remain possible. A joint target does not announce that one component is already known.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.restricted.whole-population-denominator",
        title: "Keeping the original denominator",
        whyItFeelsPlausible:
          "The full population is stated first and often has the most prominent number.",
        detectionCue:
          "The denominator includes outcomes that contradict the given condition.",
        correctionMd:
          "Cross out every ineligible outcome and recount the denominator from the conditioned subgroup.",
      },
      {
        id: "misconception.q86.probability.restricted.favorable-outside-condition",
        title: "Counting favorable outcomes outside the restriction",
        whyItFeelsPlausible:
          "The target trait may occur throughout the population.",
        detectionCue:
          "The numerator counts all target members rather than target members who also satisfy the condition.",
        correctionMd:
          "Use the intersection of target and condition in the numerator.",
      },
      {
        id: "misconception.q86.probability.restricted.reversing-condition",
        title: "Reversing the conditional direction",
        whyItFeelsPlausible:
          "The same two labels appear in both $P(A\\mid C)$ and $P(C\\mid A)$.",
        detectionCue:
          "The denominator is the target group rather than the group named after given.",
        correctionMd:
          "Read the vertical bar as among: target probability among the conditioned outcomes.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.restricted.blue-given-dark",
        conceptIds: [P.restricted],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "A box has $7$ dark objects, $3$ of them blue. Given a selected object is dark, find the probability it is blue.",
        intendedMethod: "within-subgroup fraction",
        answer: { kind: "numeric", value: 3 / 7 },
        explanationMd: "The seven dark objects form the restricted denominator and three are favorable.",
        hints: hints("restricted.check-dark", "Use only objects allowed by the condition.", "Dark supplies the denominator.", "Count three blue-dark objects among seven dark objects.", "Form $3/7$."),
      },
      {
        id: "check.q86.probability.restricted.multiple-four",
        conceptIds: [P.restricted],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "An integer from $1$ through $30$ is known to be divisible by $5$. Find the probability it is also divisible by $2$.",
        intendedMethod: "restrict to multiples of five",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "The six multiples of $5$ are eligible; $10,20,30$ are even, so $3/6=1/2$.",
        hints: hints("restricted.check-five", "List the multiples allowed by the condition.", "Even multiples of five are multiples of ten.", "Count six eligible and three favorable.", "Reduce $3/6$."),
      },
      {
        id: "check.q86.probability.restricted.card-suit",
        conceptIds: [P.restricted],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Among $12$ project cards, $5$ are urgent; $2$ of the urgent cards are finance cards. Given a selected card is urgent, find the probability it is a finance card.",
        intendedMethod: "conditioned category fraction",
        answer: { kind: "numeric", value: 2 / 5 },
        explanationMd: "Only the five urgent cards remain in the sample space, and two qualify.",
        hints: hints("restricted.check-urgent", "Discard nonurgent cards.", "Given urgent sets the denominator to five.", "Use two urgent finance cards over five urgent cards.", "The fraction is $2/5$."),
      },
      {
        id: "check.q86.probability.restricted.die-greater-two",
        conceptIds: [P.restricted],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "A fair die result is known to exceed $2$. Find the probability the result is even.",
        intendedMethod: "restrict face set",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "The restricted faces are $3,4,5,6$; $4$ and $6$ are favorable.",
        hints: hints("restricted.check-die", "List faces that survive the condition.", "Only $3,4,5,6$ remain possible.", "Within them, count $4$ and $6$.", "Use $2/4=1/2$."),
      },
      {
        id: "check.q86.probability.restricted.sum-seven",
        conceptIds: [P.restricted],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Two fair dice have a sum of $7$. What is the probability the first die is greater than the second?",
        intendedMethod: "enumerate conditioned ordered pairs",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "Six pairs sum to seven; $(4,3),(5,2),(6,1)$ have the first result larger.",
        hints: hints("restricted.check-sum-seven", "Enumerate only ordered pairs with sum seven.", "There are six such pairs.", "Three have first coordinate larger.", "Use $3/6$."),
      },
      {
        id: "check.q86.probability.restricted.reverse-direction",
        conceptIds: [P.restricted],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Of $20$ files, $8$ are encrypted, and $6$ are both encrypted and archived. Given a file is encrypted, find the probability it is archived.",
        intendedMethod: "intersection over conditioned set",
        answer: { kind: "numeric", value: 3 / 4 },
        explanationMd: "$P(\\text{archived}\\mid\\text{encrypted})=6/8=3/4$.",
        hints: hints("restricted.check-files", "Place the group after given in the denominator.", "Encrypted is the conditioned pool.", "Use six archived-and-encrypted files over eight encrypted files.", "Reduce $6/8$."),
      },
    ],
    speedMethod: {
      methodMd:
        "Rewrite given C as AMONG C, circle C as the denominator, and count the target only inside that circle.",
      safeWhen: [
        "The condition is explicit and has positive probability.",
        "Eligible outcomes remain equally likely after the restriction.",
      ],
      unsafeWhen: [
        "Given is mistaken for a second target in an unrestricted joint event.",
        "The conditioned outcomes have unequal original probabilities that counting alone ignores.",
      ],
    },
    recapMd:
      "Conditioning redraws the sample-space boundary. The denominator is the event known to have occurred; the numerator is the target inside that event.",
    retrievalPrompts: [
      "Translate $P(A\\mid C)$ into an among sentence.",
      "Which event supplies the numerator and denominator in a conditioned finite sample space?",
      "Explain why $P(A\\mid C)$ and $P(C\\mid A)$ usually differ.",
    ],
  },

  {
    conceptId: P.parity,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given random integer selections, translate sum or product parity into odd-even cases and compute those cases with the correct dependence model.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.parity.rules",
        prerequisiteConceptIds: [P.basic],
        promptMd: "What parity pair makes a sum odd?",
        answer: { kind: "exact", acceptedAnswers: ["one odd and one even", "odd and even", "different parity"] },
        explanationMd: "A sum is odd exactly when one addend is odd and the other is even.",
      },
    ],
    intuitiveModelMd:
      "Reduce every integer to one of two colors: odd or even. Operations then follow a tiny color table. A sum is even when the colors match; a product is even unless every factor is odd.",
    formalRuleMd:
      "For integers, odd + odd and even + even are even, while odd + even is odd. A product is odd only if every factor is odd, so $$P(\\text{product even})=1-P(\\text{all factors odd}).$$ Parity probabilities must reflect the actual counts and replacement rules in the sample space.",
    procedure: [
      "Translate the numerical target into required parity patterns.",
      "Count odd and even outcomes in each actual selection pool.",
      "Choose disjoint direct cases for a sum or the all-odd complement for an even product.",
      "Multiply independent or conditional factors as the process requires, then add disjoint patterns.",
    ],
    examples: [
      {
        id: "example.q86.probability.parity.odd-product-spinners",
        conceptIds: [P.parity, P.independent],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd:
          "Independent fair spinners are labeled $1$ through $4$ and $1$ through $5$. What is the probability their product is odd?",
        intendedMethod: "both factors odd",
        answer: { kind: "numeric", value: 3 / 10 },
        answerLabelMd: "$\\frac{3}{10}$",
        solutionMd:
          "A product is odd only when both factors are odd. The first spinner has $2/4$ odd labels and the second has $3/5$, so $P=(2/4)(3/5)=3/10$.",
        hints: hints("parity.odd-product", "Translate product odd into factor parities.", "Every factor must be odd.", "Use $(2/4)(3/5)$.", "Reduce the product to $3/10$."),
      },
      {
        id: "example.q86.probability.parity.even-sum-without-replacement",
        conceptIds: [P.parity, P.withoutReplacement],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "Two distinct tokens are selected from tokens numbered $1$ through $6$. What is the probability their sum is even?",
        intendedMethod: "same-parity unordered cases",
        answer: { kind: "numeric", value: 2 / 5 },
        answerLabelMd: "$\\frac{2}{5}$",
        solutionMd:
          "An even sum requires two odd or two even tokens. There are three of each parity, so favorable pairs number $\\binom32+\\binom32=6$ out of $\\binom62=15$. Thus $P=6/15=2/5$.",
        hints: hints("parity.even-sum", "List the same-parity cases.", "Even sums are odd-odd or even-even.", "Use $\\binom32+\\binom32$ over $\\binom62$.", "Reduce $6/15$."),
      },
      {
        id: "example.q86.probability.parity.even-product-complement",
        conceptIds: [P.parity, P.complement, P.withoutReplacement],
        authoredDifficulty: 4,
        role: "transfer_or_boundary",
        questionMd:
          "Two distinct integers are selected from $1$ through $7$. What is the probability their product is even?",
        intendedMethod: "complement of two odd selections",
        answer: { kind: "numeric", value: 5 / 7 },
        answerLabelMd: "$\\frac{5}{7}$",
        solutionMd:
          "There are four odd integers. The product fails to be even only if both selected integers are odd: $(4/7)(3/6)=2/7$. Therefore, $P(\\text{even product})=1-2/7=5/7$.",
        hints: hints("parity.even-product", "Use the one parity pattern that makes the product odd.", "The complement is selecting two odd integers.", "Write $1-(4/7)(3/6)$.", "Subtract $2/7$ from one."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.parity.sum-even-versus-product-even",
      caseAMd:
        "A two-integer sum is even when both integers have the same parity: odd-odd or even-even.",
      caseBMd:
        "A two-integer product is even when at least one integer is even; its clean complement is odd-odd.",
      explanationMd:
        "The same target word even creates different logical events under addition and multiplication.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.parity.equal-odd-even-assumption",
        title: "Assuming half odd and half even",
        whyItFeelsPlausible:
          "Consecutive integer lists often alternate evenly.",
        detectionCue:
          "Parity probabilities are set to $1/2$ without counting an odd-sized or restricted range.",
        correctionMd:
          "Count odd and even values in the actual pool before assigning factors.",
      },
      {
        id: "misconception.q86.probability.parity.same-rule-for-sum-and-product",
        title: "Using one evenness rule for both operations",
        whyItFeelsPlausible:
          "The target property is called even in both questions.",
        detectionCue:
          "At least one even is used for an even sum or same parity is used for an even product.",
        correctionMd:
          "Write a two-row parity table for the stated operation before calculating.",
      },
      {
        id: "misconception.q86.probability.parity.ignoring-no-replacement",
        title: "Freezing parity probabilities",
        whyItFeelsPlausible:
          "Parity feels like a stable property of the range.",
        detectionCue:
          "The second odd or even factor keeps its original numerator and denominator after a token is removed.",
        correctionMd:
          "Update remaining parity counts just like color counts in any without-replacement draw.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.parity.sum-odd-two-dice",
        conceptIds: [P.parity],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "Two fair dice are rolled. Find the probability their sum is odd.",
        intendedMethod: "different-parity paths",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "Odd-even or even-odd gives $2(1/2)(1/2)=1/2$.",
        hints: hints("parity.check-sum-odd", "List parity orders producing an odd sum.", "Use odd-even and even-odd.", "Each order has probability $1/4$.", "Add the two orders."),
      },
      {
        id: "check.q86.probability.parity.product-odd",
        conceptIds: [P.parity],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Two independent integers are each selected uniformly from $1$ through $8$. Find the probability their product is odd.",
        intendedMethod: "all factors odd",
        answer: { kind: "numeric", value: 1 / 4 },
        explanationMd: "Each selection is odd with probability $4/8=1/2$, so the product is odd with probability $1/4$.",
        hints: hints("parity.check-product-odd", "Require odd parity for both factors.", "One even factor would make the product even.", "Use $(4/8)^2$.", "Square $1/2$."),
      },
      {
        id: "check.q86.probability.parity.product-even",
        conceptIds: [P.parity, P.complement],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Two fair dice are rolled. Find the probability their product is even.",
        intendedMethod: "all-odd complement",
        answer: { kind: "numeric", value: 3 / 4 },
        explanationMd: "$1-(3/6)^2=1-1/4=3/4$.",
        hints: hints("parity.check-product-even", "Use the unique way for the product to be odd.", "Both dice must be odd.", "Write $1-(3/6)^2$.", "Subtract $1/4$ from one."),
      },
      {
        id: "check.q86.probability.parity.range-one-seven",
        conceptIds: [P.parity],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Independent selections are made from $1$ through $7$. Find the probability their sum is even.",
        intendedMethod: "same-parity cases with unequal counts",
        answer: { kind: "numeric", value: 25 / 49 },
        explanationMd: "There are four odds and three evens, so $(4/7)^2+(3/7)^2=25/49$.",
        hints: hints("parity.check-seven", "Count odd and even labels before using same-parity cases.", "The range has four odd and three even values.", "Compute $(4/7)^2+(3/7)^2$.", "Add $16/49+9/49$."),
      },
      {
        id: "check.q86.probability.parity.no-replacement-sum-odd",
        conceptIds: [P.parity, P.withoutReplacement],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Two distinct integers are selected from $1$ through $8$. Find the probability their sum is odd.",
        intendedMethod: "one odd and one even unordered pair",
        answer: { kind: "numeric", value: 4 / 7 },
        explanationMd: "There are $4\\cdot4=16$ odd-even pairs among $\\binom82=28$ pairs, so $16/28=4/7$.",
        hints: hints("parity.check-no-replace", "Count unordered pairs with different parity.", "Choose one of four odds and one of four evens.", "Use $16/\\binom82$.", "Reduce $16/28$."),
      },
      {
        id: "check.q86.probability.parity.three-factor-even",
        conceptIds: [P.parity, P.complement],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Three independent fair die results are multiplied. Find the probability the product is even.",
        intendedMethod: "complement of all three odd",
        answer: { kind: "numeric", value: 7 / 8 },
        explanationMd: "The product is odd only if all three dice are odd: $1-(1/2)^3=7/8$.",
        hints: hints("parity.check-three", "Find the only all-factor pattern producing an odd product.", "Every die must be odd.", "Write $1-(3/6)^3$.", "Subtract $1/8$ from one."),
      },
    ],
    speedMethod: {
      methodMd:
        "Write S: same parity for even sum and P: one minus all odd for even product, then count the pool's actual odd-even split.",
      safeWhen: [
        "The random values are integers and their parity counts are known.",
        "Dependence from replacement or nonreplacement is modeled correctly.",
      ],
      unsafeWhen: [
        "Odd and even are assumed equally frequent in an odd-sized or filtered pool.",
        "The sum rule is substituted for the product rule or vice versa.",
      ],
    },
    recapMd:
      "Parity compresses many values into two classes. Even sums require matching parity; even products require at least one even factor, usually handled through the all-odd complement.",
    retrievalPrompts: [
      "State the parity patterns for an odd sum, an even sum, and an odd product.",
      "Why is an even product often easier by complement?",
      "How does without replacement change a second parity factor?",
    ],
  },

  {
    conceptId: P.circular,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given a uniform random circular seating, fix one named person by rotational symmetry and compute adjacency from the favorable remaining seats.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.circular.adjacent-seats",
        prerequisiteConceptIds: [P.basic],
        promptMd: "In a circle with at least $3$ seats, how many seats are directly adjacent to a specified seat?",
        answer: { kind: "numeric", value: 2 },
        explanationMd: "A seat has one immediate neighbor clockwise and one immediate neighbor counterclockwise.",
      },
    ],
    intuitiveModelMd:
      "Rotate the whole circle until person A sits at the top. Rotation changes no adjacency relationship. Person B is then equally likely to occupy any remaining seat, and exactly the two seats touching A are favorable.",
    formalRuleMd:
      "For $n\\ge3$ people seated uniformly around a circle, fix named person A. Named person B is uniform among the $n-1$ remaining positions, of which $2$ are adjacent to A. Hence $$P(A\\text{ adjacent to }B)=\\frac{2}{n-1}.$$ This symmetry argument assumes uniform seating on a cycle.",
    procedure: [
      "Fix the first named person to remove irrelevant rotation.",
      "Count the positions still available to the second named person.",
      "Count the two positions immediately neighboring the fixed person.",
      "Divide favorable positions by remaining positions; for more named people, assign their positions without replacement.",
    ],
    examples: [
      {
        id: "example.q86.probability.circular.six-people-adjacent",
        conceptIds: [P.circular, P.basic],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd:
          "Six people are seated uniformly at random around a round table. What is the probability that Ava and Ben sit next to each other?",
        intendedMethod: "fix Ava and count Ben's positions",
        answer: { kind: "numeric", value: 2 / 5 },
        answerLabelMd: "$\\frac{2}{5}$",
        solutionMd:
          "Fix Ava. Ben is equally likely to occupy any of the other $5$ seats, and $2$ of those seats border Ava. The probability is $2/5$.",
        hints: hints("circular.six", "Use rotation to hold one person still.", "Fix Ava; only Ben's relative position matters.", "Count two adjacent seats among five remaining.", "Form $2/5$."),
      },
      {
        id: "example.q86.probability.circular.eight-not-adjacent",
        conceptIds: [P.circular, P.complement],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "Eight people are seated uniformly around a circle. What is the probability that two named people are not adjacent?",
        intendedMethod: "complement of two favorable adjacent positions",
        answer: { kind: "numeric", value: 5 / 7 },
        answerLabelMd: "$\\frac{5}{7}$",
        solutionMd:
          "Fix one named person. The other has $7$ possible seats, $2$ adjacent and $5$ nonadjacent. Therefore, $P(\\text{not adjacent})=5/7$, equivalently $1-2/7$.",
        hints: hints("circular.eight-not", "Fix one person and count nonneighbor seats.", "Two of seven remaining seats are adjacent.", "There are five nonadjacent positions.", "Use $5/7$."),
      },
      {
        id: "example.q86.probability.circular.two-neighbors-of-a",
        conceptIds: [P.circular, P.withoutReplacement],
        authoredDifficulty: 5,
        role: "transfer_or_boundary",
        questionMd:
          "Seven people are seated uniformly around a circle. What is the probability that named people Ben and Cara occupy the two seats adjacent to Ava?",
        intendedMethod: "assign two named people to two adjacent positions",
        answer: { kind: "numeric", value: 1 / 15 },
        answerLabelMd: "$\\frac{1}{15}$",
        solutionMd:
          "Fix Ava. Ben may take either adjacent seat, probability $2/6$. Once Ben does, Cara must take the one other adjacent seat, probability $1/5$. Thus $P=(2/6)(1/5)=1/15$.",
        hints: hints("circular.two-neighbors", "Fix Ava and fill both neighboring positions with the two named people.", "Ben has two favorable seats; Cara then has one.", "Write $(2/6)(1/5)$.", "Reduce $2/30$ to $1/15$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.circular.circular-adjacency-versus-linear-adjacency",
      caseAMd:
        "In a circle, the first and last drawn positions are adjacent, and every seat has two neighbors.",
      caseBMd:
        "In a line, two endpoint seats have only one neighbor, so fixing a person does not always leave exactly two favorable seats.",
      explanationMd:
        "The $2/(n-1)$ shortcut uses cycle symmetry. A line has endpoints and needs a different count.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.circular.denominator-n",
        title: "Keeping all n seats in the denominator",
        whyItFeelsPlausible:
          "The circle visibly contains $n$ seats.",
        detectionCue:
          "After one named person is fixed, the second person is still said to have $n$ possible seats.",
        correctionMd:
          "The fixed person's occupied seat is unavailable, leaving $n-1$ equally likely relative positions.",
      },
      {
        id: "misconception.q86.probability.circular.one-adjacent-seat",
        title: "Counting only one direction",
        whyItFeelsPlausible:
          "Clockwise order is often used to describe circular arrangements.",
        detectionCue:
          "Only the clockwise or counterclockwise neighbor is counted.",
        correctionMd:
          "Include both immediate neighbors unless the question specifies a direction.",
      },
      {
        id: "misconception.q86.probability.circular.using-circle-rule-on-line",
        title: "Ignoring endpoints in a line",
        whyItFeelsPlausible:
          "Both settings use the word adjacent and display neighboring seats.",
        detectionCue:
          "The $2/(n-1)$ result is applied to a row or another structure with endpoints.",
        correctionMd:
          "Verify that every position has two symmetric neighbors; otherwise count linear arrangements or condition on position.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.circular.five-people",
        conceptIds: [P.circular],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "Five people sit uniformly around a circle. Find the probability two named people are adjacent.",
        intendedMethod: "two of four remaining seats",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "Fix one person; two of four remaining seats are adjacent.",
        hints: hints("circular.check-five", "Fix the first named person.", "The second has four possible seats.", "Two seats are adjacent.", "Compute $2/4$."),
      },
      {
        id: "check.q86.probability.circular.ten-people",
        conceptIds: [P.circular],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Ten people sit uniformly around a circle. Find the probability two named people are adjacent.",
        intendedMethod: "adjacent-position symmetry",
        answer: { kind: "numeric", value: 2 / 9 },
        explanationMd: "Fix one; two of nine remaining seats border that person.",
        hints: hints("circular.check-ten", "Hold one person fixed.", "Nine relative seats remain.", "Count the two neighboring seats.", "Use $2/9$."),
      },
      {
        id: "check.q86.probability.circular.six-not-adjacent",
        conceptIds: [P.circular, P.complement],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Six people sit around a circle. Find the probability two named people are not adjacent.",
        intendedMethod: "nonadjacent positions or complement",
        answer: { kind: "numeric", value: 3 / 5 },
        explanationMd: "Among five remaining positions, three are nonadjacent; equivalently $1-2/5=3/5$.",
        hints: hints("circular.check-six-not", "Count remaining positions after fixing one person.", "Two of five are adjacent.", "Subtract $2/5$ from one.", "The result is $3/5$."),
      },
      {
        id: "check.q86.probability.circular.three-boundary",
        conceptIds: [P.circular],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Three people sit around a circle. Find the probability two named people are adjacent.",
        intendedMethod: "small-n boundary",
        answer: { kind: "numeric", value: 1 },
        explanationMd: "Every pair among three circular seats is adjacent; $2/(3-1)=1$.",
        hints: hints("circular.check-three", "Inspect the smallest valid circle.", "Both remaining seats border the fixed seat.", "Use two favorable out of two.", "The probability is one."),
      },
      {
        id: "check.q86.probability.circular.nine-neighbors",
        conceptIds: [P.circular],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Nine people sit around a circle. Find the probability that two specified people occupy the two seats adjacent to a third specified person.",
        intendedMethod: "two ordered adjacent assignments",
        answer: { kind: "numeric", value: 1 / 28 },
        explanationMd: "Fix the third person. The specified neighbors occupy the adjacent seats with probability $(2/8)(1/7)=1/28$.",
        hints: hints("circular.check-nine-neighbors", "Fix the person whose neighbors are prescribed.", "The first specified neighbor has two choices and the second then has one.", "Use $(2/8)(1/7)$.", "Reduce $2/56$."),
      },
      {
        id: "check.q86.probability.circular.opposite-eight",
        conceptIds: [P.circular],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Eight people sit around a circle. What is the probability two named people sit directly opposite each other?",
        intendedMethod: "one favorable relative position",
        answer: { kind: "numeric", value: 1 / 7 },
        explanationMd: "After fixing one person, exactly one of seven remaining seats is opposite.",
        hints: hints("circular.check-opposite", "Fix one person and identify the unique opposite seat.", "There is one favorable relative position.", "The second person has seven possible seats.", "Use $1/7$."),
      },
    ],
    speedMethod: {
      methodMd:
        "Fix one named person immediately; for a second named person, use favorable relative seats over $n-1$.",
      safeWhen: [
        "Seating is uniform around a cycle and only relative position matters.",
        "Every seat has the same adjacency structure.",
      ],
      unsafeWhen: [
        "The arrangement is linear, has special seats, or uses nonuniform assignment.",
        "More than two named occupants must satisfy a pattern and remaining positions are treated as independent.",
      ],
    },
    recapMd:
      "Circular symmetry lets you anchor one person without loss. The next named person is uniform over the remaining relative positions, including two neighbors in an ordinary circle.",
    retrievalPrompts: [
      "Why does fixing one person not change a uniform circular adjacency probability?",
      "Derive $2/(n-1)$ without counting full arrangements.",
      "What structural feature makes the same shortcut unsafe for a row?",
    ],
  },

  {
    conceptId: P.exactK,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given n independent equal-probability trials, compute exactly k successes by choosing their positions and weighting every resulting success-failure sequence.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.exact-k.position-count",
        prerequisiteConceptIds: [P.independent, P.combinations],
        promptMd: "In a sequence of $5$ trials, how many ways can exactly $2$ positions be designated successes?",
        answer: { kind: "numeric", value: 10 },
        explanationMd: "Choose the two success positions: $\\binom52=10$.",
      },
    ],
    intuitiveModelMd:
      "First build one path with $k$ S symbols and $n-k$ F symbols. Every rearrangement has the same probability when trials are independent and the success chance stays fixed. Count those rearrangements and multiply by one path's probability.",
    formalRuleMd:
      "For $n$ independent Bernoulli trials with constant success probability $p$, if $X$ counts successes, $$P(X=k)=\\binom nk p^k(1-p)^{n-k}.$$ The combination chooses success positions; the powers give the probability of each such sequence.",
    procedure: [
      "Verify a fixed number of independent trials and one constant success probability.",
      "Translate exactly k into k success factors and n minus k failure factors.",
      "Count the possible success-position sets with $\\binom nk$.",
      "Multiply $\\binom nk p^k(1-p)^{n-k}$ and confirm no other success counts were included.",
    ],
    examples: [
      {
        id: "example.q86.probability.exact-k.two-heads-four",
        conceptIds: [P.exactK, P.independent],
        authoredDifficulty: 2,
        role: "foundation",
        questionMd: "A fair coin is tossed $4$ times. What is the probability of exactly $2$ heads?",
        intendedMethod: "binomial exact-count formula",
        answer: { kind: "numeric", value: 3 / 8 },
        answerLabelMd: "$\\frac{3}{8}$",
        solutionMd:
          "Choose the two head positions in $\\binom42=6$ ways. Every sequence has probability $(1/2)^4=1/16$, so $P=6/16=3/8$.",
        hints: hints("exact-k.two-four", "Choose where the two heads occur.", "Every four-toss sequence with two heads has the same probability.", "Use $\\binom42(1/2)^2(1/2)^2$.", "Compute $6/16$ and reduce."),
      },
      {
        id: "example.q86.probability.exact-k.three-of-five",
        conceptIds: [P.exactK, P.independent],
        authoredDifficulty: 3,
        role: "application",
        questionMd:
          "Five independent attempts each succeed with probability $2/3$. Find the probability of exactly $3$ successes.",
        intendedMethod: "unequal success-failure binomial weight",
        answer: { kind: "numeric", value: 80 / 243 },
        answerLabelMd: "$\\frac{80}{243}$",
        solutionMd:
          "Choose the three success positions, then weight each path: $$\\binom53\\left(\\frac23\\right)^3\\left(\\frac13\\right)^2=10\\cdot\\frac8{27}\\cdot\\frac19=\\frac{80}{243}.$$",
        hints: hints("exact-k.three-five", "Separate position count from one sequence probability.", "Exactly three successes leaves two failures.", "Use $\\binom53(2/3)^3(1/3)^2$.", "Multiply $10\\cdot8/243$."),
      },
      {
        id: "example.q86.probability.exact-k.majority-five-coins",
        conceptIds: [P.exactK, P.union],
        authoredDifficulty: 4,
        role: "transfer_or_boundary",
        questionMd: "A fair coin is tossed $5$ times. What is the probability of more heads than tails?",
        intendedMethod: "sum disjoint exact-k cases",
        answer: { kind: "numeric", value: 1 / 2 },
        answerLabelMd: "$\\frac{1}{2}$",
        solutionMd:
          "More heads means exactly $3$, $4$, or $5$ heads. The favorable sequence count is $\\binom53+\\binom54+\\binom55=10+5+1=16$ out of $2^5=32$, so the probability is $1/2$.",
        hints: hints("exact-k.majority", "Translate more heads into exact head counts.", "With five tosses, the qualifying counts are three, four, and five.", "Add $\\binom53+\\binom54+\\binom55$.", "Divide $16$ by $32$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.exact-k.exactly-versus-at-least",
      caseAMd:
        "Exactly $2$ successes uses one binomial term: $\\binom n2p^2(1-p)^{n-2}$.",
      caseBMd:
        "At least $2$ successes requires adding terms for $2,3,\\ldots,n$ or using the complement of zero and one success.",
      explanationMd:
        "A binomial term owns one success count. Threshold events generally require several disjoint count terms.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.exact-k.one-sequence-only",
        title: "Computing one order only",
        whyItFeelsPlausible:
          "Writing $p^k(1-p)^{n-k}$ visibly contains the right numbers of successes and failures.",
        detectionCue:
          "No combination factor accounts for the locations of the successes.",
        correctionMd:
          "Multiply the one-path probability by $\\binom nk$ distinct success-position choices.",
      },
      {
        id: "misconception.q86.probability.exact-k.using-p-for-failures",
        title: "Weighting failures with the success probability",
        whyItFeelsPlausible:
          "The given probability $p$ dominates the problem statement.",
        detectionCue:
          "The expression has total exponent $n$ on $p$ and no $1-p$ factor.",
        correctionMd:
          "Use one $p$ for each success and one $1-p$ for each failure.",
      },
      {
        id: "misconception.q86.probability.exact-k.variable-trials-binomial",
        title: "Using a fixed-n formula after early stopping",
        whyItFeelsPlausible:
          "Both settings mention repeated successes and failures.",
        detectionCue:
          "The process can end early, yet all paths are forced to have length $n$.",
        correctionMd:
          "Use the binomial shortcut only when all $n$ trials occur; enumerate stopping paths when trial count is variable.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.exact-k.one-head-three",
        conceptIds: [P.exactK],
        authoredDifficulty: 1,
        independence: "guided",
        promptMd: "A fair coin is tossed $3$ times. Find the probability of exactly $1$ head.",
        intendedMethod: "three success positions",
        answer: { kind: "numeric", value: 3 / 8 },
        explanationMd: "$\\binom31/2^3=3/8$.",
        hints: hints("exact-k.check-one-three", "Choose the head's position.", "There are three one-head sequences.", "Use $\\binom31(1/2)^3$.", "Compute $3/8$."),
      },
      {
        id: "check.q86.probability.exact-k.two-success-three",
        conceptIds: [P.exactK],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Three independent trials have success probability $1/4$. Find the probability of exactly $2$ successes.",
        intendedMethod: "binomial exact count",
        answer: { kind: "numeric", value: 9 / 64 },
        explanationMd: "$\\binom32(1/4)^2(3/4)=3\\cdot3/64=9/64$.",
        hints: hints("exact-k.check-two-three", "Choose two success positions and one failure.", "The failure probability is $3/4$.", "Use $\\binom32(1/4)^2(3/4)$.", "Multiply to get $9/64$."),
      },
      {
        id: "check.q86.probability.exact-k.zero-success-four",
        conceptIds: [P.exactK],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Four independent trials have success probability $2/5$. Find the probability of exactly $0$ successes.",
        intendedMethod: "all-failure boundary binomial term",
        answer: { kind: "numeric", value: 81 / 625 },
        explanationMd: "$(3/5)^4=81/625$; $\\binom40=1$.",
        hints: hints("exact-k.check-zero", "Exactly zero means every trial fails.", "Each failure has probability $3/5$.", "Use $(3/5)^4$.", "Raise numerator and denominator to the fourth power."),
      },
      {
        id: "check.q86.probability.exact-k.four-of-six",
        conceptIds: [P.exactK],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Six independent trials each succeed with probability $1/2$. Find the probability of exactly $4$ successes.",
        intendedMethod: "fair binomial sequence count",
        answer: { kind: "numeric", value: 15 / 64 },
        explanationMd: "$\\binom64/2^6=15/64$.",
        hints: hints("exact-k.check-four-six", "Choose four of six success positions.", "All six-trial fair paths have probability $1/64$.", "Use $\\binom64/64$.", "Evaluate $\\binom64=15$."),
      },
      {
        id: "check.q86.probability.exact-k.two-of-five-low-p",
        conceptIds: [P.exactK],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Five independent trials each succeed with probability $1/5$. Find the probability of exactly $2$ successes.",
        intendedMethod: "binomial exact count with three failures",
        answer: { kind: "numeric", value: 128 / 625 },
        explanationMd: "$\\binom52(1/5)^2(4/5)^3=10\\cdot64/3125=128/625$.",
        hints: hints("exact-k.check-two-five", "Pair two successes with three failures.", "Count the success positions with $\\binom52$.", "Use $10(1/5)^2(4/5)^3$.", "Reduce $640/3125$ to $128/625$."),
      },
      {
        id: "check.q86.probability.exact-k.at-most-one",
        conceptIds: [P.exactK, P.union],
        authoredDifficulty: 5,
        independence: "independent",
        promptMd: "Four fair coin tosses are made. Find the probability of at most $1$ head.",
        intendedMethod: "sum zero-head and one-head terms",
        answer: { kind: "numeric", value: 5 / 16 },
        explanationMd: "$(\\binom40+\\binom41)/16=(1+4)/16=5/16$.",
        hints: hints("exact-k.check-at-most", "Translate the threshold into exact counts.", "At most one means zero or one head.", "Add $\\binom40+\\binom41$ favorable paths.", "Divide five by sixteen."),
      },
    ],
    speedMethod: {
      methodMd:
        "Write C(n,k), then exactly k copies of p and n-k copies of q, where q equals one minus p.",
      safeWhen: [
        "All n trials occur, are independent, and share one success probability.",
        "The target is one exact count or an explicit sum of exact counts.",
      ],
      unsafeWhen: [
        "Success probabilities change, trials depend on previous outcomes, or the process stops early.",
        "Exactly k is confused with at least k.",
      ],
    },
    recapMd:
      "An exact-k probability is number of qualifying position patterns times probability of one pattern. The binomial formula packages those two ingredients for fixed independent equal-probability trials.",
    retrievalPrompts: [
      "Explain the separate jobs of $\\binom nk$, $p^k$, and $(1-p)^{n-k}$.",
      "How would you turn at most two successes into exact-k terms?",
      "Name three process features required before using the binomial shortcut.",
    ],
  },

  {
    conceptId: P.occupancy,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given independent assignments into labeled categories, count collision-free or specified occupancy patterns and divide by all labeled assignments.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.occupancy.labeled-assignments",
        prerequisiteConceptIds: [P.independent, P.complement, P.combinations],
        promptMd: "Three named people each choose one of $4$ rooms. How many labeled choice assignments are possible?",
        answer: { kind: "numeric", value: 64 },
        explanationMd: "Each named person has four choices, independently, so there are $4^3=64$ assignments.",
      },
    ],
    intuitiveModelMd:
      "Write each named chooser's category as an ordered string. The string R1-R2-R1 differs from R1-R1-R2 because a different person made each choice. A collision repeats a category label; no collision uses distinct labels throughout.",
    formalRuleMd:
      "If $r$ labeled objects independently choose among $m$ labeled categories uniformly, there are $m^r$ assignments. For $r\\le m$, $$P(\\text{all distinct})=\\frac{m(m-1)\\cdots(m-r+1)}{m^r},$$ so $$P(\\text{at least one collision})=1-P(\\text{all distinct}).$$ Other occupancy patterns require choosing which objects share and which labeled categories they use.",
    procedure: [
      "Define one assignment by recording the category chosen by each labeled object.",
      "Count all assignments as a product, usually $m^r$ for uniform independent choices.",
      "Translate the target into collision-free, one-pair, all-together, or other disjoint occupancy patterns.",
      "Count favorable labeled assignments, divide by the total, and check category labels and chooser identities were preserved.",
    ],
    examples: [
      {
        id: "example.q86.probability.occupancy.three-people-three-rooms",
        conceptIds: [P.occupancy, P.complement],
        authoredDifficulty: 3,
        role: "foundation",
        questionMd:
          "Three named people independently choose one of $3$ rooms uniformly. What is the probability that at least two choose the same room?",
        intendedMethod: "complement of all rooms distinct",
        answer: { kind: "numeric", value: 7 / 9 },
        answerLabelMd: "$\\frac{7}{9}$",
        solutionMd:
          "There are $3^3=27$ assignments. The only collision-free assignments place one person in each room, which can happen in $3!=6$ ways. Thus $P(\\text{collision})=1-6/27=7/9$.",
        hints: hints("occupancy.three-three", "Count the collision-free complement.", "No collision forces all three room choices to be distinct.", "Use $1-3!/3^3$.", "Subtract $6/27$ and reduce."),
      },
      {
        id: "example.q86.probability.occupancy.four-into-five-distinct",
        conceptIds: [P.occupancy],
        authoredDifficulty: 4,
        role: "application",
        questionMd:
          "Four named files are independently assigned uniformly to one of $5$ servers. What is the probability all four go to different servers?",
        intendedMethod: "falling product over all assignments",
        answer: { kind: "numeric", value: 24 / 125 },
        answerLabelMd: "$\\frac{24}{125}$",
        solutionMd:
          "There are $5^4$ assignments. Distinct placement gives $5$ choices, then $4$, then $3$, then $2$: $$P=\\frac{5\\cdot4\\cdot3\\cdot2}{5^4}=\\frac{120}{625}=\\frac{24}{125}.$$",
        hints: hints("occupancy.four-five", "Assign files one at a time without repeating a server.", "Available distinct servers decrease from five to two.", "Use $(5\\cdot4\\cdot3\\cdot2)/5^4$.", "Reduce $120/625$."),
      },
      {
        id: "example.q86.probability.occupancy.exactly-one-pair",
        conceptIds: [P.occupancy, P.combinations],
        authoredDifficulty: 5,
        role: "transfer_or_boundary",
        questionMd:
          "Three named shoppers independently choose one of $4$ entrances uniformly. What is the probability that exactly two choose the same entrance and the third chooses a different entrance?",
        intendedMethod: "choose paired people and labeled categories",
        answer: { kind: "numeric", value: 9 / 16 },
        answerLabelMd: "$\\frac{9}{16}$",
        solutionMd:
          "Choose the paired shoppers in $\\binom32=3$ ways, their shared entrance in $4$ ways, and the third shopper's different entrance in $3$ ways. Of $4^3=64$ assignments, $3\\cdot4\\cdot3=36$ are favorable, giving $36/64=9/16$.",
        hints: hints("occupancy.one-pair", "Choose who shares before choosing category labels.", "Exactly two excludes all three together.", "Use $\\binom32\\cdot4\\cdot3$ over $4^3$.", "Reduce $36/64$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.occupancy.labeled-versus-unlabeled-categories",
      caseAMd:
        "For three people choosing rooms 1 and 2, AAB and BBA are distinct assignments because room labels and people matter.",
      caseBMd:
        "If categories were unlabeled and only group sizes mattered, both outcomes would share the occupancy pattern 2-plus-1.",
      explanationMd:
        "The standard $m^r$ denominator counts labeled assignments. Switching to unlabeled occupancy patterns changes likelihoods and cannot be mixed with that denominator.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.occupancy.unlabeled-denominator",
        title: "Counting only occupancy shapes",
        whyItFeelsPlausible:
          "Patterns such as all separate or one pair are visually simple and few in number.",
        detectionCue:
          "The denominator counts partitions like 3, 2-plus-1, and 1-plus-1-plus-1 as equally likely.",
        correctionMd:
          "Count assignments of named choosers to labeled categories; occupancy shapes contain different numbers of assignments.",
      },
      {
        id: "misconception.q86.probability.occupancy.birthday-pair-sum",
        title: "Adding pair-collision probabilities",
        whyItFeelsPlausible:
          "Each possible pair provides an apparent route to a collision.",
        detectionCue:
          "Assignments with three people together are counted once for every pair.",
        correctionMd:
          "For at least one collision, use the all-distinct complement unless overlaps are handled explicitly.",
      },
      {
        id: "misconception.q86.probability.occupancy.confusing-with-matching",
        title: "Imposing one-to-one destinations",
        whyItFeelsPlausible:
          "Assignment language resembles permutations into dedicated positions.",
        detectionCue:
          "Later choosers are forbidden from a used category even though collisions are allowed.",
        correctionMd:
          "Keep all category choices available on each independent assignment unless the process states a capacity constraint.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.occupancy.two-people-three-rooms",
        conceptIds: [P.occupancy],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Two people independently choose one of $3$ rooms uniformly. Find the probability they choose the same room.",
        intendedMethod: "second matches first",
        answer: { kind: "numeric", value: 1 / 3 },
        explanationMd: "After any first choice, one of three choices matches it; equivalently $3/9=1/3$.",
        hints: hints("occupancy.check-two", "Condition on the first person's room.", "The second has one matching choice among three.", "Use $1/3$.", "No further multiplication is needed after fixing the first."),
      },
      {
        id: "check.q86.probability.occupancy.three-four-all-distinct",
        conceptIds: [P.occupancy],
        authoredDifficulty: 3,
        independence: "guided",
        promptMd: "Three people choose among $4$ rooms independently. Find the probability all choose different rooms.",
        intendedMethod: "decreasing distinct-choice product",
        answer: { kind: "numeric", value: 3 / 8 },
        explanationMd: "$(4/4)(3/4)(2/4)=24/64=3/8$.",
        hints: hints("occupancy.check-distinct", "Let the first choose freely, then avoid used rooms.", "Available new rooms are four, three, then two.", "Use $(4\\cdot3\\cdot2)/4^3$.", "Reduce $24/64$."),
      },
      {
        id: "check.q86.probability.occupancy.three-four-collision",
        conceptIds: [P.occupancy, P.complement],
        authoredDifficulty: 3,
        independence: "guided",
        promptMd: "Three people choose among $4$ rooms independently. Find the probability at least two share a room.",
        intendedMethod: "all-distinct complement",
        answer: { kind: "numeric", value: 5 / 8 },
        explanationMd: "The all-distinct probability is $3/8$, so the collision probability is $5/8$.",
        hints: hints("occupancy.check-collision", "Use the result for no repeated room.", "At least one collision complements all distinct.", "Write $1-24/64$.", "Subtract $3/8$ from one."),
      },
      {
        id: "check.q86.probability.occupancy.all-same",
        conceptIds: [P.occupancy],
        authoredDifficulty: 3,
        independence: "independent",
        promptMd: "Four people choose among $3$ rooms independently. Find the probability all choose the same room.",
        intendedMethod: "choose shared room over all assignments",
        answer: { kind: "numeric", value: 1 / 27 },
        explanationMd: "There are three all-same assignments among $3^4=81$, so $3/81=1/27$.",
        hints: hints("occupancy.check-all-same", "Choose the common labeled room.", "Each of three rooms creates one all-together assignment.", "Use $3/3^4$.", "Reduce $3/81$."),
      },
      {
        id: "check.q86.probability.occupancy.exactly-pair-three-rooms",
        conceptIds: [P.occupancy],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Three people choose among $3$ rooms independently. Find the probability exactly two share a room.",
        intendedMethod: "choose pair, shared room, distinct room",
        answer: { kind: "numeric", value: 2 / 3 },
        explanationMd: "$\\binom32\\cdot3\\cdot2=18$ favorable assignments out of $27$, giving $2/3$.",
        hints: hints("occupancy.check-pair-three", "Choose the paired people and both category labels.", "The third person's room must differ from the pair's.", "Use $3\\cdot3\\cdot2/27$.", "Reduce $18/27$."),
      },
      {
        id: "check.q86.probability.occupancy.four-four-collision",
        conceptIds: [P.occupancy, P.complement],
        authoredDifficulty: 5,
        independence: "independent",
        promptMd: "Four people choose among $4$ rooms independently. Find the probability at least two share a room.",
        intendedMethod: "complement of bijective assignments",
        answer: { kind: "numeric", value: 29 / 32 },
        explanationMd: "All distinct has probability $4!/4^4=24/256=3/32$, so a collision has probability $29/32$.",
        hints: hints("occupancy.check-four-four", "Subtract the one-person-per-room assignments.", "All distinct assignments are permutations of four room labels.", "Write $1-4!/4^4$.", "Subtract $3/32$ from one."),
      },
    ],
    speedMethod: {
      methodMd:
        "Use labeled assignment strings for the denominator; for any-collision questions, write one minus a falling distinct-choice product.",
      safeWhen: [
        "Named objects choose independently among equally likely labeled categories.",
        "Categories have no capacity constraint unless the target imposes one.",
      ],
      unsafeWhen: [
        "Categories are unlabeled, weighted unequally, or capacity-limited.",
        "Overlapping pair-collision events are added without inclusion-exclusion.",
      ],
    },
    recapMd:
      "Occupancy probability counts labeled assignments. Collisions are repeated category labels, and their cleanest count is often everything minus the falling-product assignments with all labels distinct.",
    retrievalPrompts: [
      "Why are occupancy patterns themselves not equally likely?",
      "Write the all-distinct probability for $r$ people and $m$ rooms.",
      "How do you count exactly one pair among three named choosers?",
    ],
  },

  {
    conceptId: P.fixedPoints,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given a random one-to-one matching, compute an exact number of correct matches by choosing fixed positions and deranging every remaining item.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.fixed-points.permutations-four",
        prerequisiteConceptIds: [P.basic, P.combinations],
        promptMd: "How many one-to-one assignments of $4$ distinct letters to $4$ addressed envelopes are possible?",
        answer: { kind: "numeric", value: 24 },
        explanationMd: "A one-to-one assignment is a permutation, so there are $4!=24$ possibilities.",
      },
    ],
    intuitiveModelMd:
      "A fixed point is an item landing in its own labeled home. After choosing which homes are correct, every remaining item must avoid its own home; if even one of them returns home, the count of correct matches is larger than intended.",
    formalRuleMd:
      "Let $D_m$ be the number of derangements of $m$ objects: $$D_m=m!\\sum_{j=0}^{m}\\frac{(-1)^j}{j!},$$ with $D_0=1,D_1=0,D_2=1,D_3=2,D_4=9,D_5=44$. Among $n!$ uniform permutations, exactly $k$ fixed points occur in $$\\binom nkD_{n-k}$$ permutations, so $$P(X=k)=\\frac{\\binom nkD_{n-k}}{n!}.$$",
    procedure: [
      "Verify that objects and destinations are distinct and assignments are one-to-one.",
      "Choose the k objects that will occupy their correct positions.",
      "Derange all n minus k remaining objects so none adds another fixed point.",
      "Multiply by $\\binom nk$, divide by $n!$, and inspect small remainders such as $D_1=0$.",
    ],
    examples: [
      {
        id: "example.q86.probability.fixed-points.one-of-three",
        conceptIds: [P.fixedPoints, P.combinations],
        authoredDifficulty: 3,
        role: "foundation",
        questionMd:
          "Three letters are placed uniformly into three addressed envelopes, one letter per envelope. What is the probability exactly one letter reaches its correct envelope?",
        intendedMethod: "choose one fixed point and swap the remaining two",
        answer: { kind: "numeric", value: 1 / 2 },
        answerLabelMd: "$\\frac{1}{2}$",
        solutionMd:
          "Choose the one correct letter in $\\binom31=3$ ways. The other two must swap, and $D_2=1$. Thus there are $3$ favorable permutations among $3!=6$, giving $1/2$.",
        hints: hints("fixed.one-three", "Choose the sole correct match, then forbid correctness among the rest.", "Two remaining letters have one derangement: they swap.", "Use $\\binom31D_2/3!$.", "Compute $3/6$."),
      },
      {
        id: "example.q86.probability.fixed-points.none-of-four",
        conceptIds: [P.fixedPoints],
        authoredDifficulty: 4,
        role: "application",
        questionMd:
          "Four labeled keys are assigned uniformly to four labeled locks, one key per lock. What is the probability no key goes to its matching lock?",
        intendedMethod: "four-object derangement count",
        answer: { kind: "numeric", value: 3 / 8 },
        answerLabelMd: "$\\frac{3}{8}$",
        solutionMd:
          "There are $D_4=9$ derangements among $4!=24$ one-to-one assignments. Therefore, $P=9/24=3/8$.",
        hints: hints("fixed.none-four", "Count permutations with zero fixed positions.", "The four-object derangement count is nine.", "Use $D_4/4!=9/24$.", "Reduce to $3/8$."),
      },
      {
        id: "example.q86.probability.fixed-points.three-of-five",
        conceptIds: [P.fixedPoints, P.combinations],
        authoredDifficulty: 5,
        role: "transfer_or_boundary",
        questionMd:
          "Five reports are randomly assigned one-to-one to five labeled folders. What is the probability exactly $3$ reports enter their correct folders?",
        intendedMethod: "choose three fixed points and derange two",
        answer: { kind: "numeric", value: 1 / 12 },
        answerLabelMd: "$\\frac{1}{12}$",
        solutionMd:
          "Choose the three correct reports in $\\binom53=10$ ways. The two remaining reports must swap, so $D_2=1$. Divide by $5!=120$: $10/120=1/12$.",
        hints: hints("fixed.three-five", "Choose the three fixed reports first.", "The two remaining reports must both be wrong, so they swap.", "Use $\\binom53D_2/5!$.", "Reduce $10/120$."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.fixed-points.exactly-n-minus-two-versus-n-minus-one",
      caseAMd:
        "Exactly $n-2$ fixed points is possible: the last two objects swap, so $D_2=1$.",
      caseBMd:
        "Exactly $n-1$ fixed points is impossible: the final object has only its own destination, so $D_1=0$.",
      explanationMd:
        "One mismatch cannot exist alone in a one-to-one assignment. Mismatches occur in cycles of length at least two.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.fixed-points.permuting-remainder-freely",
        title: "Permuting the remainder without deranging it",
        whyItFeelsPlausible:
          "After choosing the intended correct positions, the remaining objects appear unrestricted.",
        detectionCue:
          "The count uses $(n-k)!$ and therefore includes additional correct matches.",
        correctionMd:
          "Use $D_{n-k}$ so every remaining object is forced away from its own destination.",
      },
      {
        id: "misconception.q86.probability.fixed-points.exactly-n-minus-one",
        title: "Treating n minus one fixed points as feasible",
        whyItFeelsPlausible:
          "Any count from zero through n seems like a possible number of successes.",
        detectionCue:
          "A proposed assignment leaves one object and only its correct destination unused.",
        correctionMd:
          "Recognize $D_1=0$: the last unmatched object must be correct, producing n fixed points instead.",
      },
      {
        id: "misconception.q86.probability.fixed-points.occupancy-denominator",
        title: "Allowing shared destinations",
        whyItFeelsPlausible:
          "Both matching and occupancy problems use assignment language.",
        detectionCue:
          "The denominator is $n^n$ even though each destination receives exactly one object.",
        correctionMd:
          "One-to-one matching has $n!$ permutation outcomes; $n^n$ belongs to independent choices with collisions allowed.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.fixed-points.none-of-two",
        conceptIds: [P.fixedPoints],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Two letters are randomly placed one per addressed envelope. Find the probability neither is correct.",
        intendedMethod: "single swap derangement",
        answer: { kind: "numeric", value: 1 / 2 },
        explanationMd: "One of the two permutations swaps both letters, so $D_2/2!=1/2$.",
        hints: hints("fixed.check-none-two", "List the two one-to-one assignments.", "Only the swap has no fixed point.", "Use $1/2!$.", "The probability is $1/2$."),
      },
      {
        id: "check.q86.probability.fixed-points.all-three",
        conceptIds: [P.fixedPoints],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Three objects are randomly matched one-to-one with their three labels. Find the probability all are correct.",
        intendedMethod: "identity permutation over all permutations",
        answer: { kind: "numeric", value: 1 / 6 },
        explanationMd: "Only the identity permutation is all correct among $3!=6$ permutations.",
        hints: hints("fixed.check-all-three", "Count the unique fully correct assignment.", "There is one identity permutation.", "Divide one by $3!$.", "Compute $1/6$."),
      },
      {
        id: "check.q86.probability.fixed-points.exactly-two-of-four",
        conceptIds: [P.fixedPoints],
        authoredDifficulty: 3,
        independence: "guided",
        promptMd: "Four objects are randomly matched one-to-one. Find the probability exactly $2$ are correct.",
        intendedMethod: "choose fixed pair and derange pair",
        answer: { kind: "numeric", value: 1 / 4 },
        explanationMd: "$\\binom42D_2/4!=6/24=1/4$.",
        hints: hints("fixed.check-two-four", "Choose the two correct positions.", "The remaining two must swap.", "Use $\\binom42D_2/4!$.", "Reduce $6/24$."),
      },
      {
        id: "check.q86.probability.fixed-points.exactly-one-of-four",
        conceptIds: [P.fixedPoints],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Four objects are randomly matched one-to-one. Find the probability exactly $1$ is correct.",
        intendedMethod: "choose fixed point and derange three",
        answer: { kind: "numeric", value: 1 / 3 },
        explanationMd: "$\\binom41D_3/4!=4\\cdot2/24=1/3$.",
        hints: hints("fixed.check-one-four", "Choose one correct position and derange the rest.", "$D_3=2$.", "Use $4\\cdot2/24$.", "Reduce $8/24$."),
      },
      {
        id: "check.q86.probability.fixed-points.exactly-two-of-three-impossible",
        conceptIds: [P.fixedPoints],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Three objects are randomly matched one-to-one. Find the probability exactly $2$ are correct.",
        intendedMethod: "recognize one-mismatch impossibility",
        answer: { kind: "numeric", value: 0 },
        explanationMd: "If two are correct, the only remaining object must also occupy its own remaining destination; $D_1=0$.",
        hints: hints("fixed.check-impossible", "Inspect the destination left for the third object.", "Two correct matches leave the third correct match forced.", "Use $\\binom32D_1/3!$.", "Since $D_1=0$, the probability is zero."),
      },
      {
        id: "check.q86.probability.fixed-points.none-of-five",
        conceptIds: [P.fixedPoints],
        authoredDifficulty: 5,
        independence: "independent",
        promptMd: "Five objects are randomly matched one-to-one. Given $D_5=44$, find the probability none is correct.",
        intendedMethod: "derangements over all permutations",
        answer: { kind: "numeric", value: 11 / 30 },
        explanationMd: "$D_5/5!=44/120=11/30$.",
        hints: hints("fixed.check-none-five", "Use the supplied derangement count as the favorable numerator.", "All one-to-one assignments number $5!$.", "Write $44/120$.", "Divide numerator and denominator by four."),
      },
    ],
    speedMethod: {
      methodMd:
        "Write choose fixed × derange rest over n factorial; memorize $D_1=0,D_2=1,D_3=2,D_4=9$ for small GMAT-style cases.",
      safeWhen: [
        "Assignments are uniform, one-to-one, and object-destination labels correspond.",
        "The target asks for an exact fixed-point count.",
      ],
      unsafeWhen: [
        "Multiple objects may share a destination or choices are independent occupancy assignments.",
        "The remainder is counted with a factorial instead of a derangement.",
      ],
    },
    recapMd:
      "Exact fixed-point counting has two locks: choose which positions are correct, then force every remaining position to be wrong. That second lock is a derangement, not a free permutation.",
    retrievalPrompts: [
      "Why is exactly $n-1$ fixed points impossible?",
      "State the numerator for exactly $k$ fixed points among $n$ objects.",
      "How does the denominator distinguish matching from occupancy?",
    ],
  },

  {
    conceptId: P.inverseComposition,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given a without-replacement draw probability and a known total population, solve for every bounded integer composition consistent with that probability.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.inverse-composition.forward-two-draw",
        prerequisiteConceptIds: [P.withoutReplacement],
        promptMd: "A bag has $5$ red among $8$ tokens. What is the probability of drawing two red tokens without replacement?",
        answer: { kind: "numeric", value: 5 / 14 },
        explanationMd: "$(5/8)(4/7)=20/56=5/14$.",
      },
    ],
    intuitiveModelMd:
      "Ordinary probability sends an inventory through a draw rule to produce a number. Inverse composition runs that machine backward: put an unknown count into the same conditional fractions, equate them to the observed probability, and retain only physical integer inventories.",
    formalRuleMd:
      "If $x$ of $N$ objects are favorable, then two favorable draws without replacement have probability $$\\frac{x}{N}\\frac{x-1}{N-1}.$$ A favorable-then-unfavorable draw has probability $$\\frac{x}{N}\\frac{N-x}{N-1}.$$ Solve the resulting equation subject to $$0\\le x\\le N,\\qquad x\\in\\mathbb Z,$$ and report every feasible value.",
    procedure: [
      "Define an integer variable for the unknown category count and express all other counts from the known total.",
      "Write the exact ordered or unordered draw probability using the unknown count.",
      "Equate the expression to the given probability and solve algebraically or enumerate the bounded integers.",
      "Substitute every candidate into the original draw model, reject noninteger or out-of-range roots, and test whether the answer is unique.",
    ],
    examples: [
      {
        id: "example.q86.probability.inverse-composition.ten-two-red",
        conceptIds: [P.inverseComposition, P.withoutReplacement],
        authoredDifficulty: 4,
        role: "foundation",
        questionMd:
          "A bag contains $10$ tokens, $x$ of them red. The probability that two tokens drawn without replacement are both red is $1/3$. How many red tokens are in the bag?",
        intendedMethod: "invert a same-type conditional product",
        answer: { kind: "numeric", value: 6 },
        answerLabelMd: "$6$",
        solutionMd:
          "Set $(x/10)((x-1)/9)=1/3$. Then $x(x-1)=30$, so $x^2-x-30=0=(x-6)(x+5)$. The physical integer count is $x=6$; $-5$ is invalid.",
        hints: hints("inverse.ten-red", "Put the unknown favorable count into both draw factors.", "After one red draw, red count becomes $x-1$.", "Solve $x(x-1)/90=1/3$.", "Factor $x^2-x-30$ and keep the bounded nonnegative root."),
      },
      {
        id: "example.q86.probability.inverse-composition.twelve-two-blue",
        conceptIds: [P.inverseComposition, P.withoutReplacement],
        authoredDifficulty: 4,
        role: "application",
        questionMd:
          "A box contains $12$ beads, $b$ of them blue. Two beads drawn without replacement are both blue with probability $5/22$. Find $b$.",
        intendedMethod: "solve and validate bounded integer root",
        answer: { kind: "numeric", value: 6 },
        answerLabelMd: "$6$",
        solutionMd:
          "The model is $b(b-1)/(12\\cdot11)=5/22$, so $b(b-1)=30$. The roots are $6$ and $-5$; only $b=6$ is a feasible bead count.",
        hints: hints("inverse.twelve-blue", "Write the two-blue conditional product.", "The denominator product is $12\\cdot11$.", "Cross-multiply to get $b(b-1)=30$.", "Select the integer root between zero and twelve."),
      },
      {
        id: "example.q86.probability.inverse-composition.nonunique-mixed-draw",
        conceptIds: [P.inverseComposition, P.withoutReplacement],
        authoredDifficulty: 5,
        role: "transfer_or_boundary",
        questionMd:
          "A bag has $10$ tokens, $g$ green and the rest white. The probability of drawing green first and white second without replacement is $4/15$. What are all possible values of $g$?",
        intendedMethod: "solve a symmetric bounded integer equation",
        answer: { kind: "exact", acceptedAnswers: ["4 or 6", "4, 6", "4 and 6", "{4,6}", "{4, 6}"] },
        answerLabelMd: "$4$ or $6$",
        solutionMd:
          "The probability equation is $(g/10)((10-g)/9)=4/15$, so $g(10-g)=24$. Thus $g^2-10g+24=0=(g-4)(g-6)$, and both $g=4$ and $g=6$ are valid inventories. The evidence does not identify a unique composition.",
        hints: hints("inverse.nonunique", "Model green then white with two different type counts.", "The white count is $10-g$ and stays unchanged after a green draw.", "Solve $g(10-g)/90=4/15$.", "Keep both bounded integer roots rather than forcing uniqueness."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.inverse-composition.forward-versus-inverse",
      caseAMd:
        "Forward: knowing $6$ red among $10$ gives $(6/10)(5/9)=1/3$ for two red.",
      caseBMd:
        "Inverse: knowing the probability $1/3$ creates $x(x-1)=30$, whose roots must be filtered by inventory constraints.",
      explanationMd:
        "The probability law is identical. Inverse work adds algebra, integer bounds, and a uniqueness audit.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.inverse-composition.frozen-favorable-count",
        title: "Reusing x on the second favorable draw",
        whyItFeelsPlausible:
          "The unknown category size is represented by one memorable variable.",
        detectionCue:
          "The numerator product is $x^2$ despite sampling without replacement.",
        correctionMd:
          "After one favorable removal, use $x-1$ favorable objects and $N-1$ total objects.",
      },
      {
        id: "misconception.q86.probability.inverse-composition.accepting-algebraic-root",
        title: "Accepting every algebraic root",
        whyItFeelsPlausible:
          "Solving the equation feels like the end of the mathematics.",
        detectionCue:
          "A negative, fractional, or above-total population count is reported.",
        correctionMd:
          "Apply integer and range constraints, then substitute surviving candidates into the original probability.",
      },
      {
        id: "misconception.q86.probability.inverse-composition.forcing-uniqueness",
        title: "Stopping after the first feasible composition",
        whyItFeelsPlausible:
          "Many textbook inverse questions are designed with one positive root.",
        detectionCue:
          "A second bounded root or symmetric composition is not tested.",
        correctionMd:
          "Enumerate all integers from zero to the known total or inspect every algebraic root before claiming uniqueness.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.inverse-composition.eight-special",
        conceptIds: [P.inverseComposition],
        authoredDifficulty: 3,
        independence: "guided",
        promptMd: "A box has $8$ objects. Two special objects are drawn without replacement with probability $3/14$. How many objects are special?",
        intendedMethod: "invert two-special probability",
        answer: { kind: "numeric", value: 4 },
        explanationMd: "$x(x-1)/56=3/14$ gives $x(x-1)=12$, so $x=4$.",
        hints: hints("inverse.check-eight", "Use $x$ then $x-1$ favorable objects.", "The total denominator is $8\\cdot7=56$.", "Solve $x(x-1)=12$.", "Keep the feasible root $4$."),
      },
      {
        id: "check.q86.probability.inverse-composition.fifteen-special",
        conceptIds: [P.inverseComposition],
        authoredDifficulty: 4,
        independence: "guided",
        promptMd: "A bag has $15$ tokens. The probability two draws without replacement are both marked is $1/5$. How many tokens are marked?",
        intendedMethod: "solve bounded integer quadratic",
        answer: { kind: "numeric", value: 7 },
        explanationMd: "$x(x-1)/(15\\cdot14)=1/5$ gives $x(x-1)=42$, so $x=7$.",
        hints: hints("inverse.check-fifteen", "Write the same-type two-draw model.", "Use denominator $210$.", "Solve $x(x-1)=42$.", "The bounded positive root is seven."),
      },
      {
        id: "check.q86.probability.inverse-composition.nine-mixed",
        conceptIds: [P.inverseComposition],
        authoredDifficulty: 4,
        independence: "guided",
        promptMd: "A bag has $9$ tokens, $x$ of one type. The probability of that type first and the other type second is $1/4$. Find all possible $x$.",
        intendedMethod: "symmetric mixed-type inverse",
        answer: { kind: "exact", acceptedAnswers: ["3 or 6", "3, 6", "3 and 6", "{3,6}", "{3, 6}"] },
        explanationMd: "$x(9-x)/72=1/4$ gives $x(9-x)=18$, whose feasible roots are $3$ and $6$.",
        hints: hints("inverse.check-nine", "Represent the other type by $9-x$.", "After the first chosen type leaves, the other-type count is unchanged.", "Solve $x(9-x)=18$.", "Retain both feasible roots."),
      },
      {
        id: "check.q86.probability.inverse-composition.twenty-standard",
        conceptIds: [P.inverseComposition],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "A lot has $20$ items. Two standard items are drawn without replacement with probability $12/19$. How many items are nonstandard?",
        intendedMethod: "infer standard count then subtract",
        answer: { kind: "numeric", value: 4 },
        explanationMd: "$s(s-1)/380=12/19$ gives $s(s-1)=240$ and $s=16$, leaving $4$ nonstandard.",
        hints: hints("inverse.check-twenty", "Solve first for the number of standard items.", "Use $s(s-1)/(20\\cdot19)$.", "The equation is $s(s-1)=240$, giving $s=16$.", "Subtract sixteen from twenty."),
      },
      {
        id: "check.q86.probability.inverse-composition.at-least-one",
        conceptIds: [P.inverseComposition, P.complement],
        authoredDifficulty: 5,
        independence: "independent",
        promptMd: "A bag has $12$ tokens. In two draws without replacement, the probability of at least one marked token is $5/11$. How many tokens are marked?",
        intendedMethod: "invert the all-unmarked complement",
        answer: { kind: "numeric", value: 3 },
        explanationMd: "The all-unmarked probability is $6/11$. If $u$ are unmarked, $u(u-1)/132=6/11$, so $u=9$ and $12-9=3$ are marked.",
        hints: hints("inverse.check-at-least", "Convert the observed event to an all-unmarked probability.", "The complement probability is $6/11$.", "Solve $u(u-1)/(12\\cdot11)=6/11$.", "Find $u=9$ and subtract from twelve."),
      },
      {
        id: "check.q86.probability.inverse-composition.seven-red",
        conceptIds: [P.inverseComposition],
        authoredDifficulty: 5,
        independence: "independent",
        promptMd: "A bag has $7$ tokens. The probability of two red draws without replacement is $10/21$. How many tokens are red?",
        intendedMethod: "solve and validate composition",
        answer: { kind: "numeric", value: 5 },
        explanationMd: "$r(r-1)/42=10/21$ gives $r(r-1)=20$, so the feasible count is $r=5$.",
        hints: hints("inverse.check-seven", "Use the two-red conditional product.", "The denominator product is forty-two.", "Solve $r(r-1)=20$.", "Select the root five rather than negative four."),
      },
    ],
    speedMethod: {
      methodMd:
        "Clear the known denominator product first, then test the short bounded integer list for consecutive products $x(x-1)$ or symmetric products $x(N-x)$.",
      safeWhen: [
        "The total population and sampling process are fully specified.",
        "All integer roots are checked against bounds and the original probability.",
      ],
      unsafeWhen: [
        "A continuous algebraic root is accepted as an object count.",
        "A symmetric mixed-type equation is assumed to have only one feasible composition.",
      ],
    },
    recapMd:
      "Inverse composition uses the ordinary without-replacement model backward. The decisive final step is not algebra alone but a complete bounded-integer and uniqueness check.",
    retrievalPrompts: [
      "Write the inverse equation for two favorable draws from $x$ favorable among $N$.",
      "Why can a favorable-then-unfavorable probability produce two valid compositions?",
      "List the three filters every algebraic population root must pass.",
    ],
  },

  {
    conceptId: P.stoppingTime,
    contentVersion: "3.0.0",
    sourcePath: SOURCE,
    objective:
      "Given repeated independent trials that stop at first success or a finite cap, enumerate the exact prefix paths for requested stopping times.",
    prerequisiteChecks: [
      {
        id: "prereq.q86.probability.stopping-time.failure-prefix",
        prerequisiteConceptIds: [P.independent, P.complement],
        promptMd: "Independent trials succeed with probability $1/3$. What is the probability the first two trials both fail?",
        answer: { kind: "numeric", value: 4 / 9 },
        explanationMd: "Each failure has probability $2/3$, so the two-failure prefix has probability $(2/3)^2=4/9$.",
      },
    ],
    intuitiveModelMd:
      "Think of a path that is erased as soon as success occurs. To stop at time $t$ before the cap, the path must show failures in positions $1$ through $t-1$ and success at $t$. To last all the way to the cap, only the earlier positions must fail; the final outcome may be success or failure because the cap stops the process either way.",
    formalRuleMd:
      "Let each independent trial succeed with probability $p$, fail with $q=1-p$, and let $T$ be the number of trials performed when the process stops at first success or at cap $n$. Then $$P(T=t)=q^{t-1}p\\quad(1\\le t<n),$$ while $$P(T=n)=q^{n-1}.$$ The cap term omits a final $p$ because reaching trial $n$ already determines the process length.",
    procedure: [
      "List all stopping times from one through the finite cap.",
      "Translate the target into the allowed stopping-time values.",
      "For each time before the cap, write failures up to that time followed by success; for the cap, require only all earlier failures.",
      "Multiply within each prefix and add the disjoint allowed-time probabilities.",
    ],
    examples: [
      {
        id: "example.q86.probability.stopping-time.exactly-three-of-four",
        conceptIds: [P.stoppingTime, P.independent],
        authoredDifficulty: 3,
        role: "foundation",
        questionMd:
          "A fair coin is tossed until the first head or until $4$ tosses have occurred. What is the probability the process lasts exactly $3$ tosses?",
        intendedMethod: "failure-failure-success prefix",
        answer: { kind: "numeric", value: 1 / 8 },
        answerLabelMd: "$\\frac{1}{8}$",
        solutionMd:
          "Because $3$ is before the cap, exactly three tosses requires TTH: two failures followed by success. Its probability is $(1/2)^3=1/8$.",
        hints: hints("stopping.exact-three", "Write the prefix that prevents earlier stopping and stops on toss three.", "The first two tosses must be tails and the third must be heads.", "Use $(1/2)(1/2)(1/2)$.", "Multiply to obtain $1/8$."),
      },
      {
        id: "example.q86.probability.stopping-time.even-with-cap-three",
        conceptIds: [P.stoppingTime, P.independent],
        authoredDifficulty: 4,
        role: "application",
        questionMd:
          "A fair die is rolled until a $6$ appears or until $3$ rolls have occurred. What is the probability the process lasts an even number of rolls?",
        intendedMethod: "single allowed pre-cap stopping time",
        answer: { kind: "numeric", value: 5 / 36 },
        answerLabelMd: "$\\frac{5}{36}$",
        solutionMd:
          "Possible lengths are $1,2,3$, so the only even length is $2$. That requires a non-$6$ first and a $6$ second: $(5/6)(1/6)=5/36$.",
        hints: hints("stopping.even-three", "List the possible process lengths and keep the even ones.", "Only length two qualifies because the cap is three.", "Use failure then success: $(5/6)(1/6)$.", "Multiply to get $5/36$."),
      },
      {
        id: "example.q86.probability.stopping-time.even-with-cap-four",
        conceptIds: [P.stoppingTime, P.independent, P.union],
        authoredDifficulty: 5,
        role: "transfer_or_boundary",
        questionMd:
          "Independent trials succeed with probability $1/3$ and stop at first success or after $4$ trials. What is the probability the process lasts an even number of trials?",
        intendedMethod: "add time-two and reached-cap prefixes",
        answer: { kind: "numeric", value: 14 / 27 },
        answerLabelMd: "$\\frac{14}{27}$",
        solutionMd:
          "The even stopping times are $2$ and $4$. Length $2$ has probability $(2/3)(1/3)=2/9$. Length $4$ means the first three trials fail; the fourth result is unrestricted, so its probability is $(2/3)^3=8/27$. The total is $2/9+8/27=14/27$.",
        hints: hints("stopping.even-four", "Split the target into each even stopping time.", "Time two needs FS; reaching cap four needs FFF before the final trial.", "Write $(2/3)(1/3)+(2/3)^3$.", "Convert $2/9$ to $6/27$ and add."),
      },
    ],
    contrastPair: {
      id: "contrast.q86.probability.stopping-time.stop-before-cap-versus-reach-cap",
      caseAMd:
        "Stopping at time $t<n$ requires $t-1$ failures and then a success: $q^{t-1}p$.",
      caseBMd:
        "Lasting to time $n$ requires only $n-1$ initial failures: $q^{n-1}$; trial $n$ happens regardless of its result.",
      explanationMd:
        "Before the cap, success causes the specified stop. At the cap, either the first success or the administrative limit can end the process.",
    },
    misconceptions: [
      {
        id: "misconception.q86.probability.stopping-time.final-success-at-cap",
        title: "Requiring success on the capped trial",
        whyItFeelsPlausible:
          "Every earlier exact stopping time ends with success.",
        detectionCue:
          "The probability of lasting to cap $n$ is written $q^{n-1}p$.",
        correctionMd:
          "Reaching the cap determines the length; sum success and failure on the final trial to obtain the factor one.",
      },
      {
        id: "misconception.q86.probability.stopping-time.outcomes-after-stop",
        title: "Multiplying outcomes after first success",
        whyItFeelsPlausible:
          "Fixed-trial probability habits fill every position up to the cap.",
        detectionCue:
          "A path contains a success followed by later trial outcomes.",
        correctionMd:
          "End the path at its first success; those later trials never occur.",
      },
      {
        id: "misconception.q86.probability.stopping-time.binomial-substitution",
        title: "Using exact-k binomial counts",
        whyItFeelsPlausible:
          "The setup repeats independent success-failure trials with a constant probability.",
        detectionCue:
          "Success positions are chosen freely even though a success would stop the process.",
        correctionMd:
          "Enumerate valid failure prefixes; trial count is variable and positions after the first success do not exist.",
      },
    ],
    checks: [
      {
        id: "check.q86.probability.stopping-time.reach-cap-three",
        conceptIds: [P.stoppingTime],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Fair coin tosses stop at the first head or after $3$ tosses. Find the probability the process reaches toss $3$.",
        intendedMethod: "two-failure prefix",
        answer: { kind: "numeric", value: 1 / 4 },
        explanationMd: "Reaching toss three requires tails on the first two tosses: $(1/2)^2=1/4$.",
        hints: hints("stopping.check-cap-three", "Ask what must happen before toss three begins.", "The first two tosses must both fail.", "Use $(1/2)^2$.", "The third toss outcome is unrestricted."),
      },
      {
        id: "check.q86.probability.stopping-time.exactly-two",
        conceptIds: [P.stoppingTime],
        authoredDifficulty: 2,
        independence: "guided",
        promptMd: "Trials succeed with probability $2/5$ and stop at first success or after $5$ trials. Find $P(T=2)$.",
        intendedMethod: "failure-success prefix",
        answer: { kind: "numeric", value: 6 / 25 },
        explanationMd: "$T=2$ requires failure then success: $(3/5)(2/5)=6/25$.",
        hints: hints("stopping.check-two", "Prevent stopping at one, then stop at two.", "Use failure followed by success.", "Write $(3/5)(2/5)$.", "Multiply to obtain $6/25$."),
      },
      {
        id: "check.q86.probability.stopping-time.success-by-three",
        conceptIds: [P.stoppingTime, P.complement],
        authoredDifficulty: 3,
        independence: "guided",
        promptMd: "Trials succeed with probability $1/4$. Find the probability of at least one success within the first $3$ trials.",
        intendedMethod: "all-failure complement",
        answer: { kind: "numeric", value: 37 / 64 },
        explanationMd: "$1-(3/4)^3=1-27/64=37/64$.",
        hints: hints("stopping.check-success-three", "Use the path with no success in three trials.", "The all-failure probability is $(3/4)^3$.", "Write $1-27/64$.", "Subtract to get $37/64$."),
      },
      {
        id: "check.q86.probability.stopping-time.fair-odd-cap-five",
        conceptIds: [P.stoppingTime],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Fair coin tosses stop at first head or after $5$ tosses. Find the probability the process lasts an odd number of tosses.",
        intendedMethod: "sum T equals one, three, and capped five",
        answer: { kind: "numeric", value: 11 / 16 },
        explanationMd: "$P(T=1)+P(T=3)+P(T=5)=1/2+1/8+1/16=11/16$.",
        hints: hints("stopping.check-odd-five", "List the odd process lengths.", "Use H, TTH, and reaching toss five after TTTT.", "Add $1/2+1/8+1/16$.", "Convert to sixteenths."),
      },
      {
        id: "check.q86.probability.stopping-time.reach-cap-four",
        conceptIds: [P.stoppingTime],
        authoredDifficulty: 4,
        independence: "independent",
        promptMd: "Trials succeed with probability $1/5$ and stop at first success or after $4$ trials. Find $P(T=4)$.",
        intendedMethod: "three-failure prefix to cap",
        answer: { kind: "numeric", value: 64 / 125 },
        explanationMd: "Reaching the cap requires failures on the first three trials: $(4/5)^3=64/125$.",
        hints: hints("stopping.check-cap-four", "Require the process not to stop in the first three trials.", "The fourth result does not affect whether four trials occur.", "Use $(4/5)^3$.", "Cube numerator and denominator."),
      },
      {
        id: "check.q86.probability.stopping-time.at-most-two",
        conceptIds: [P.stoppingTime],
        authoredDifficulty: 5,
        independence: "independent",
        promptMd: "Trials succeed with probability $2/3$ and stop at first success or after $4$ trials. Find $P(T\\le2)$.",
        intendedMethod: "add time-one and time-two paths",
        answer: { kind: "numeric", value: 8 / 9 },
        explanationMd: "$P(T=1)+P(T=2)=2/3+(1/3)(2/3)=2/3+2/9=8/9$.",
        hints: hints("stopping.check-at-most-two", "Split the event into stopping at one or two.", "The paths are S and FS.", "Write $2/3+(1/3)(2/3)$.", "Convert $2/3$ to $6/9$ and add."),
      },
    ],
    speedMethod: {
      methodMd:
        "Make a stopping-time row 1 through n; write $q^{t-1}p$ under each pre-cap time and $q^{n-1}$ under the cap, then add only requested columns.",
      safeWhen: [
        "Trials are independent with constant success probability and stop at first success or the stated cap.",
        "The event concerns the process length or success by the cap.",
      ],
      unsafeWhen: [
        "The stopping rule differs, such as stopping after multiple successes.",
        "A final success factor is attached automatically to the cap term.",
      ],
    },
    recapMd:
      "Stopping-time probability counts valid prefixes, not completed fixed-length sequences. Before the cap, stop paths end in success; at the cap, surviving failures alone guarantee the full length.",
    retrievalPrompts: [
      "Why is $P(T=n)=q^{n-1}$ rather than $q^{n-1}p$ under a hard cap?",
      "Write the path for stopping exactly at time four when the cap is six.",
      "What makes a binomial position count invalid after first-success stopping?",
    ],
  },
];
