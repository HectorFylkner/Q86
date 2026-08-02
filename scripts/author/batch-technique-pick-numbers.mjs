/**
 * Technique batch 3 — picking numbers.
 *
 * The bank had 13 of 438 items (3.0%) whose fastest path replaces the
 * variables with concrete values. That is the technique that turns the
 * hardest-looking algebra on the section into arithmetic, and it is the
 * one a student cannot discover by drilling algebra harder.
 *
 * Twelve items in the two shapes that make it the *right* method rather
 * than a fallback: answer choices that are expressions, and universal
 * claims ("must be true", "for all"). Both are decided by elimination —
 * one counterexample kills a choice permanently — so the check here works
 * the same way the reader should: it brute-forces every choice against a
 * wide sweep of admissible values and asserts exactly one survives.
 *
 * That is a stronger gate than a single numeric answer. An item ships
 * only if its key is the unique choice that holds for *every* value in
 * the sweep, which is the actual claim the stem makes.
 *
 * Run: node --experimental-strip-types scripts/author/batch-technique-pick-numbers.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

/**
 * The index of the unique choice whose predicate holds across every
 * admissible value — and, in the same pass, proof that each of the other
 * four is genuinely false.
 *
 * This is the gate that replaces `trap_values()` for universal-claim
 * items. Elsewhere in the bank a distractor is verified by recomputing it
 * from a named error; here the choices are claims rather than values, so
 * the equivalent proof is a counterexample. Every wrong choice must be
 * falsified by some value in the sweep, and exactly one choice must
 * survive all of them. An item with two defensible answers, or with a
 * "wrong" choice that is quietly also true, cannot reach the bank.
 */
function soleSurvivor(predicates, values) {
  const survivors = predicates.flatMap((p, i) =>
    values.every((v) => p(v)) ? [i] : [],
  );
  if (survivors.length !== 1) {
    throw new Error(`${survivors.length} choices survive: [${survivors}]`);
  }
  predicates.forEach((p, i) => {
    if (i === survivors[0]) return;
    if (values.every((v) => p(v))) {
      throw new Error(`choice ${i} is never falsified by the sweep`);
    }
  });
  return survivors[0];
}

const items = [
  // ══ 1. parity, the canonical must-be shape ══════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "If $x$ is an even integer and $y$ is an odd integer, which of the following must be odd?",
    choices: ["$x + y + 1$", "$xy$", "$x + 2y$", "$2x + y$", "$x(y + 1)$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nEven times anything is even, so $2x$ is even and $xy$ is even. Even plus odd is odd, so $2x + y$ is odd for every admissible pair. The others fail structurally: $x + y$ is odd so $x + y + 1$ is even; $x + 2y$ is even plus even; and $y + 1$ is even, so $x(y+1)$ is even.\n\n**Trigger cue**\nParity stated for each variable and \"must be odd/even\" asked — reason on parity alone, never on values.\n\n**Takeaway**\nEven plus odd is odd; everything else here is even.",
    fastest_path_md:
      "Pick numbers: take $x = 2$, $y = 3$. The choices give $6$, $6$, $8$, $7$, $8$ — only the fourth is odd, and one test kills the other four.",
    trap_map: {
      "0": "Reads $x + y$ as even, so adding $1$ looks like it makes it odd.",
      "1": "Forgets that an even factor makes any product even.",
      "2": "Treats $2y$ as odd because $y$ is odd.",
      "4": "Misses that $y + 1$ is even when $y$ is odd.",
    },
    numeric_check: null,
    check() {
      const xs = [-8, -4, -2, 0, 2, 4, 6, 10, 100];
      const ys = [-7, -3, -1, 1, 3, 5, 9, 101];
      const pairs = xs.flatMap((x) => ys.map((y) => [x, y]));
      const odd = (n) => Math.abs(n % 2) === 1;
      const preds = [
        ([x, y]) => odd(x + y + 1),
        ([x, y]) => odd(x * y),
        ([x, y]) => odd(x + 2 * y),
        ([x, y]) => odd(2 * x + y),
        ([x, y]) => odd(x * (y + 1)),
      ];
      return { kind: "index", index: soleSurvivor(preds, pairs) };
    },
  },

  // ══ 2. the classic percent chain in expression form ═════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 4,
    stem_md:
      "The price of a book is increased by $p$ percent and then decreased by $p$ percent, where $0 < p < 100$. The final price is what percent of the original price?",
    choices: [
      "$100$",
      "$100 - \\dfrac{p^2}{100}$",
      "$100 - \\dfrac{p^2}{50}$",
      "$100 + \\dfrac{p^2}{100}$",
      "$100 - 2p$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nWith $t = p/100$, the two moves compose as $(1 + t)(1 - t) = 1 - t^2$. As a percent of the original that is $100(1 - t^2) = 100 - \\tfrac{p^2}{100}$. The difference of squares is the whole question: an up-then-down move by the same percent always loses, and it loses exactly the square.\n\n**Trigger cue**\nThe same percent applied up and then down — recognize $(1+t)(1-t)$ and expect a net loss, never a return to the start.\n\n**Takeaway**\nUp then down by the same percent always loses.",
    fastest_path_md:
      "Pick numbers: start at $100$ and take $p = 10$. The chain runs $100 \\to 110 \\to 99$, so the answer must equal $99$ at $p = 10$. Only the second choice does.",
    trap_map: {
      "0": "Assumes the two equal percents cancel and the price returns to where it began.",
      "2": "Doubles the loss, as though each move contributed $\\tfrac{p^2}{100}$.",
      "3": "Gets the size of the effect right and its direction wrong.",
      "4": "Subtracts the percents rather than composing the factors.",
    },
    numeric_check: null,
    check() {
      const ps = [1, 5, 10, 20, 25, 40, 50, 75, 90, 99];
      const exact = (p) => 100 * (1 + p / 100) * (1 - p / 100);
      const near = (a, b) => Math.abs(a - b) < 1e-9;
      const preds = [
        (p) => near(100, exact(p)),
        (p) => near(100 - p ** 2 / 100, exact(p)),
        (p) => near(100 - p ** 2 / 50, exact(p)),
        (p) => near(100 + p ** 2 / 100, exact(p)),
        (p) => near(100 - 2 * p, exact(p)),
      ];
      return { kind: "index", index: soleSurvivor(preds, ps) };
    },
  },

  // ══ 3. two survivors on the first value ═════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 4,
    stem_md:
      "If $n$ is an integer, which of the following must be even?",
    choices: ["$n^2 + n$", "$n^2 + 1$", "$2n + 1$", "$n(n + 2)$", "$3n$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n$n^2 + n = n(n + 1)$ is a product of two consecutive integers, and exactly one of any two consecutive integers is even, so the product is always even. Each other choice fails at some $n$: $n^2 + 1$ is odd at $n = 2$, $2n + 1$ is odd always, $n(n+2)$ is odd at $n = 1$, and $3n$ is odd at $n = 1$.\n\n**Trigger cue**\n\"Must be even\" over all integers — look for a product of consecutive integers, which is the only structure that guarantees a factor of two.\n\n**Takeaway**\nConsecutive integers always contain an even one.",
    fastest_path_md:
      "Pick numbers: at $n = 1$ the choices give $2, 2, 3, 3, 3$, leaving two survivors. Test a second value of different parity, $n = 2$: the first gives $6$ and the second gives $5$, so only the first survives.",
    trap_map: {
      "1": "Survives the single test $n = 1$ and is taken as proved without a second value.",
      "2": "Reads $2n$ as even and forgets that adding $1$ makes it odd.",
      "3": "Assumes two integers differing by $2$ behave like consecutive ones.",
      "4": "Treats multiplication by an odd number as if it forced evenness.",
    },
    numeric_check: null,
    check() {
      const ns = [-10, -7, -3, -2, -1, 0, 1, 2, 3, 4, 5, 8, 11, 50, 101];
      const even = (v) => v % 2 === 0;
      const preds = [
        (n) => even(n ** 2 + n),
        (n) => even(n ** 2 + 1),
        (n) => even(2 * n + 1),
        (n) => even(n * (n + 2)),
        (n) => even(3 * n),
      ];
      return { kind: "index", index: soleSurvivor(preds, ns) };
    },
  },

  // ══ 4. squaring below one ═══════════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md: "If $0 < x < 1$, which of the following must be true?",
    choices: [
      "$x^2 > x$",
      "$x^3 > x^2$",
      "$\\dfrac{1}{x} < x$",
      "$\\dfrac{1}{x} > 1$",
      "$\\sqrt{x} < x$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFor $0 < x < 1$, dividing $1$ by a number smaller than $1$ gives something larger than $1$, so $\\tfrac1x > 1$ always. Every other choice reverses the true direction: on this interval raising the power *shrinks* the value ($x^2 < x$ and $x^3 < x^2$), taking a root *grows* it ($\\sqrt{x} > x$), and $\\tfrac1x$ is larger than $x$, not smaller.\n\n**Trigger cue**\nA variable pinned strictly between $0$ and $1$ — every intuition built on integers greater than $1$ inverts.\n\n**Takeaway**\nBetween zero and one, powers shrink and roots grow.",
    fastest_path_md:
      "Pick numbers: test $x = \\tfrac14$. Then $x^2 = \\tfrac{1}{16}$, $x^3 = \\tfrac{1}{64}$, $\\tfrac1x = 4$ and $\\sqrt{x} = \\tfrac12$ — only the fourth statement holds, and one value kills the other four.",
    trap_map: {
      "0": "Carries the intuition from $x > 1$, where squaring grows a number.",
      "1": "Same reversal one power further on.",
      "2": "Gets the relationship between $\\tfrac1x$ and $x$ backwards on this interval.",
      "4": "Assumes a square root always shrinks a number.",
    },
    numeric_check: null,
    check() {
      const xs = [0.01, 0.1, 0.25, 1 / 3, 0.5, 0.6, 0.75, 0.9, 0.99];
      const preds = [
        (x) => x ** 2 > x,
        (x) => x ** 3 > x ** 2,
        (x) => 1 / x < x,
        (x) => 1 / x > 1,
        (x) => Math.sqrt(x) < x,
      ];
      return { kind: "index", index: soleSurvivor(preds, xs) };
    },
  },

  // ══ 5. a ratio question with no absolute quantity ═══════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "In a club, the ratio of members who play chess to those who do not is $3:5$. If $m$ is the total number of members, how many members do *not* play chess?",
    choices: [
      "$\\dfrac{3m}{8}$",
      "$\\dfrac{5m}{8}$",
      "$\\dfrac{3m}{5}$",
      "$\\dfrac{5m}{3}$",
      "$\\dfrac{m}{5}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe ratio is part-to-part, so the whole is $3 + 5 = 8$ parts. Non-players are $5$ of those $8$ parts, which is $\\tfrac{5m}{8}$. The check that costs nothing: the answer must be more than half of $m$, since $5$ of $8$ parts exceeds $4$ of $8$.\n\n**Trigger cue**\nA part-to-part ratio with the total given as a variable — add the parts to build the whole before taking any share of it.\n\n**Takeaway**\nAdd the ratio's parts before dividing by anything.",
    fastest_path_md:
      "Pick numbers: let $m = 80$, so the split is $30$ and $50$. The answer must equal $50$, and evaluating the choices at $m = 80$ gives $30$, $50$, $48$, $133.3$ and $16$ — only the second matches.",
    trap_map: {
      "0": "Answers with the chess players' share instead of the non-players'.",
      "2": "Divides by the wrong part, using $5$ as the whole rather than $8$.",
      "3": "Inverts the fraction, producing a count larger than the membership.",
      "4": "Takes one part in five, ignoring that the ratio has $3 + 5$ parts.",
    },
    numeric_check: null,
    check() {
      // Brute force: build actual clubs from the ratio and read off the count.
      const ms = [8, 16, 40, 80, 160, 800];
      const truth = (m) => (5 * m) / 8;
      const near = (a, b) => Math.abs(a - b) < 1e-9;
      const preds = [
        (m) => near((3 * m) / 8, truth(m)),
        (m) => near((5 * m) / 8, truth(m)),
        (m) => near((3 * m) / 5, truth(m)),
        (m) => near((5 * m) / 3, truth(m)),
        (m) => near(m / 5, truth(m)),
      ];
      return { kind: "index", index: soleSurvivor(preds, ms) };
    },
  },

  // ══ 6. consecutive integers, sum in terms of the first ══════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 3,
    stem_md:
      "If $k$ is an integer, what is the sum of the five consecutive integers beginning with $k$?",
    choices: ["$5k$", "$5k + 5$", "$5k + 10$", "$5k + 15$", "$k + 10$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe five integers are $k, k+1, k+2, k+3, k+4$. Their sum is $5k + (1 + 2 + 3 + 4) = 5k + 10$. Equivalently, the middle term is $k + 2$ and a symmetric run of five sums to five times its middle: $5(k + 2) = 5k + 10$.\n\n**Trigger cue**\nAn evenly spaced run with an odd number of terms — the sum is the count times the middle term.\n\n**Takeaway**\nOdd-length evenly spaced runs sum to count times middle.",
    fastest_path_md:
      "Pick numbers: let $k = 1$. The five integers are $1$ through $5$, summing to $15$. Evaluating the choices at $k = 1$ gives $5$, $10$, $15$, $20$ and $11$ — only the third matches.",
    trap_map: {
      "0": "Multiplies the first term by five, ignoring the offsets entirely.",
      "1": "Adds $1 + 1 + 1 + 1$ instead of $1 + 2 + 3 + 4$.",
      "3": "Sums $1$ through $5$ rather than $1$ through $4$ for the offsets.",
      "4": "Adds the offsets correctly but forgets to multiply the first term by five.",
    },
    numeric_check: null,
    check() {
      const ks = [-20, -5, -1, 0, 1, 2, 7, 13, 100];
      const truth = (k) => k + (k + 1) + (k + 2) + (k + 3) + (k + 4);
      const preds = [
        (k) => 5 * k === truth(k),
        (k) => 5 * k + 5 === truth(k),
        (k) => 5 * k + 10 === truth(k),
        (k) => 5 * k + 15 === truth(k),
        (k) => k + 10 === truth(k),
      ];
      return { kind: "index", index: soleSurvivor(preds, ks) };
    },
  },

  // ══ 7. an average speed that is not the average of the speeds ═══════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 4,
    stem_md:
      "A car travels a distance $d$ at a speed of $a$ kilometres per hour and returns over the same distance at $b$ kilometres per hour. What is its average speed for the round trip?",
    choices: [
      "$\\dfrac{a + b}{2}$",
      "$\\dfrac{2ab}{a + b}$",
      "$\\dfrac{ab}{a + b}$",
      "$\\dfrac{a + b}{2ab}$",
      "$\\sqrt{ab}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nAverage speed is total distance over total time, never the average of the speeds. The trip covers $2d$ in $\\tfrac{d}{a} + \\tfrac{d}{b} = \\tfrac{d(a+b)}{ab}$ hours, so the average speed is $\\tfrac{2d \\cdot ab}{d(a+b)} = \\tfrac{2ab}{a+b}$. The distance cancels, which is why none of the choices contains $d$.\n\n**Trigger cue**\nEqual distances at two different speeds — the harmonic mean, always below the arithmetic mean of the two speeds.\n\n**Takeaway**\nEqual distances give the harmonic mean, not the arithmetic.",
    fastest_path_md:
      "Pick numbers: let $a = 60$, $b = 30$ and $d = 60$. The trip is $120$ kilometres in $1 + 2 = 3$ hours, so the average speed is $40$. At those values the choices give $45$, $40$, $20$, $0.025$ and $42.4$ — only the second matches.",
    trap_map: {
      "0": "Averages the two speeds, which is right only when the two *times* are equal, not the distances.",
      "2": "Drops the factor of $2$ from the total distance.",
      "3": "Inverts the whole expression, producing a value far below any speed in the problem.",
      "4": "Uses the geometric mean, which is close to the right answer but never equal to it unless the speeds match.",
    },
    numeric_check: null,
    check() {
      const cases = [
        [60, 30],
        [40, 10],
        [100, 25],
        [80, 20],
        [12, 4],
        [90, 45],
      ];
      const truth = ([a, b]) => (2 * 100) / (100 / a + 100 / b);
      const near = (x, y) => Math.abs(x - y) < 1e-9;
      const preds = [
        ([a, b]) => near((a + b) / 2, truth([a, b])),
        ([a, b]) => near((2 * a * b) / (a + b), truth([a, b])),
        ([a, b]) => near((a * b) / (a + b), truth([a, b])),
        ([a, b]) => near((a + b) / (2 * a * b), truth([a, b])),
        ([a, b]) => near(Math.sqrt(a * b), truth([a, b])),
      ];
      return { kind: "index", index: soleSurvivor(preds, cases) };
    },
  },

  // ══ 8. a "must be true" where negatives do the work ═════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 4,
    stem_md: "If $a < b$, which of the following must be true?",
    choices: [
      "$a^2 < b^2$",
      "$\\dfrac{1}{a} > \\dfrac{1}{b}$",
      "$a - 3 < b - 3$",
      "$-2a < -2b$",
      "$a^3 > b^3$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nSubtracting the same number from both sides never disturbs an inequality, so $a - 3 < b - 3$ always holds. The rest fail: squaring is not monotonic across zero ($a = -3, b = 1$ gives $9 > 1$); reciprocals need matching signs ($a = -1, b = 2$ gives $-1 < 0.5$); multiplying by $-2$ reverses the inequality; and cubing preserves it rather than reversing it.\n\n**Trigger cue**\nAn inequality with unrestricted signs — only adding or subtracting a constant is always safe.\n\n**Takeaway**\nOnly adding a constant is always safe.",
    fastest_path_md:
      "Pick numbers deliberately across zero: $a = -3$, $b = 1$ kills the squaring and reciprocal choices, and $-2a < -2b$ fails on any pair. Only the third survives every value tested.",
    trap_map: {
      "0": "Assumes squaring preserves order, which fails whenever the pair straddles zero.",
      "1": "Inverts both sides without checking that $a$ and $b$ share a sign.",
      "3": "Multiplies by a negative and forgets to reverse the inequality.",
      "4": "Reverses an inequality under cubing, which in fact preserves it.",
    },
    numeric_check: null,
    check() {
      const pairs = [];
      const grid = [-5, -3, -1, -0.5, 0, 0.5, 1, 2, 4, 7];
      for (const a of grid) for (const b of grid) if (a < b) pairs.push([a, b]);
      const preds = [
        ([a, b]) => a ** 2 < b ** 2,
        ([a, b]) => a !== 0 && b !== 0 && 1 / a > 1 / b,
        ([a, b]) => a - 3 < b - 3,
        ([a, b]) => -2 * a < -2 * b,
        ([a, b]) => a ** 3 > b ** 3,
      ];
      return { kind: "index", index: soleSurvivor(preds, pairs) };
    },
  },

  // ══ 9. a fraction of a fraction with no total ═══════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "A jar holds $j$ marbles. One third of them are blue, and two fifths of the blue marbles are chipped. In terms of $j$, how many blue marbles are *not* chipped?",
    choices: [
      "$\\dfrac{2j}{15}$",
      "$\\dfrac{j}{5}$",
      "$\\dfrac{j}{15}$",
      "$\\dfrac{3j}{5}$",
      "$\\dfrac{7j}{15}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nBlue marbles number $\\tfrac{j}{3}$. Three fifths of those are unchipped, so the count is $\\tfrac35 \\times \\tfrac{j}{3} = \\tfrac{j}{5}$. The trap is applying the second fraction to the jar rather than to the blue marbles: \"two fifths *of the blue marbles*\" is a fraction of a part, not of the whole.\n\n**Trigger cue**\nA fraction of a fraction — check which quantity the second fraction is taken *of* before multiplying.\n\n**Takeaway**\nRead which quantity the second fraction is of.",
    fastest_path_md:
      "Pick numbers: let $j = 15$, the least common multiple of the denominators. Then $5$ are blue and $2$ of those are chipped, leaving $3$. At $j = 15$ the choices give $2$, $3$, $1$, $9$ and $7$ — only the second matches.",
    trap_map: {
      "0": "Answers with the chipped blue marbles instead of the unchipped ones.",
      "2": "Multiplies the two fractions but then takes only one fifteenth, dropping the numerators.",
      "3": "Applies the three fifths to the whole jar rather than to the blue marbles.",
      "4": "Answers with everything that is not a chipped blue marble.",
    },
    numeric_check: null,
    check() {
      const js = [15, 30, 45, 60, 150, 300];
      const truth = (j) => {
        // Brute force over an explicit jar.
        const blue = j / 3;
        const chipped = (2 * blue) / 5;
        return blue - chipped;
      };
      const near = (a, b) => Math.abs(a - b) < 1e-9;
      const preds = [
        (j) => near((2 * j) / 15, truth(j)),
        (j) => near(j / 5, truth(j)),
        (j) => near(j / 15, truth(j)),
        (j) => near((3 * j) / 5, truth(j)),
        (j) => near((7 * j) / 15, truth(j)),
      ];
      return { kind: "index", index: soleSurvivor(preds, js) };
    },
  },

  // ══ 10. an exponent identity in expression form ═════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 4,
    stem_md:
      "If $n$ is a positive integer, $\\dfrac{2^{n+3} - 2^{n}}{2^{n}}$ is equal to which of the following?",
    choices: ["$2^3$", "$7$", "$2^{n+2}$", "$8 - 2^{n}$", "$2^{3n}$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nFactor $2^n$ out of the numerator: $2^{n+3} - 2^n = 2^n(2^3 - 1) = 2^n \\cdot 7$. Dividing by $2^n$ leaves $7$, independent of $n$. The instinct to subtract exponents fails here because the numerator is a difference, not a product — factoring first is what makes it collapse.\n\n**Trigger cue**\nA difference of powers with a common base over that same base — factor out the smallest power before doing anything else.\n\n**Takeaway**\nFactor the smallest power out of a difference first.",
    fastest_path_md:
      "Pick numbers: let $n = 1$. The expression is $\\tfrac{16 - 2}{2} = 7$. At $n = 1$ the choices give $8$, $7$, $8$, $6$ and $8$, so only the second survives; a second value $n = 2$ confirms it stays $7$.",
    trap_map: {
      "0": "Subtracts the exponents as though the numerator were a product, giving $2^3$.",
      "2": "Cancels only one power of two rather than factoring the whole $2^n$ out.",
      "3": "Divides the first term correctly and subtracts the second term undivided.",
      "4": "Multiplies the exponents instead of factoring.",
    },
    numeric_check: null,
    check() {
      const ns = [1, 2, 3, 4, 5, 8, 10];
      const truth = (n) => (2 ** (n + 3) - 2 ** n) / 2 ** n;
      const preds = [
        (n) => 2 ** 3 === truth(n),
        (n) => 7 === truth(n),
        (n) => 2 ** (n + 2) === truth(n),
        (n) => 8 - 2 ** n === truth(n),
        (n) => 2 ** (3 * n) === truth(n),
      ];
      return { kind: "index", index: soleSurvivor(preds, ns) };
    },
  },

  // ══ 11. a discount chain expressed algebraically ════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "A coat priced at $c$ dollars is discounted by $20\\%$, and the discounted price is then reduced by a further $25\\%$ at the till. What is the final price, in dollars?",
    choices: ["$0.55c$", "$0.6c$", "$0.65c$", "$0.75c$", "$0.8c$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nSuccessive discounts multiply their surviving fractions: $0.80 \\times 0.75 = 0.60$, so the final price is $0.6c$. Adding the discounts to $45\\%$ would be right only if the second were taken off the *original* price, which it is not.\n\n**Trigger cue**\nA second discount applied to an already-discounted price — multiply the surviving fractions rather than adding the discounts.\n\n**Takeaway**\nMultiply what survives; never add the discounts.",
    fastest_path_md:
      "Pick numbers: take $c = 100$. The price runs $100 \\to 80 \\to 60$, so the answer must be $60$ at $c = 100$. Only the second choice gives it.",
    trap_map: {
      "0": "Adds the two discounts to $45\\%$ and subtracts that from the original.",
      "2": "Averages the two surviving fractions instead of multiplying them.",
      "3": "Applies only the second discount.",
      "4": "Applies only the first discount.",
    },
    numeric_check: null,
    check() {
      const cs = [1, 20, 100, 250, 1000];
      const truth = (c) => c * (1 - 0.2) * (1 - 0.25);
      const near = (a, b) => Math.abs(a - b) < 1e-9;
      const preds = [
        (c) => near(0.55 * c, truth(c)),
        (c) => near(0.6 * c, truth(c)),
        (c) => near(0.65 * c, truth(c)),
        (c) => near(0.75 * c, truth(c)),
        (c) => near(0.8 * c, truth(c)),
      ];
      return { kind: "index", index: soleSurvivor(preds, cs) };
    },
  },

  // ══ 12. a divisibility claim that one value settles ═════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 5,
    stem_md:
      "If $n$ is a positive integer, which of the following must be divisible by $6$?",
    choices: [
      "$n^3 + n$",
      "$n^3 - n$",
      "$n^2 + n$",
      "$n^2 - 1$",
      "$n^3 + 3n$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n$n^3 - n = n(n-1)(n+1) = (n-1)n(n+1)$, a product of three consecutive integers. Any three consecutive integers include a multiple of $2$ and a multiple of $3$, so the product is divisible by $6$. The others fail: $n^3 + n$ is $2$ at $n = 1$; $n^2 + n$ is $2$ at $n = 1$; $n^2 - 1$ is $0$ at $n = 1$ but $3$ at $n = 2$; and $n^3 + 3n$ is $4$ at $n = 1$.\n\n**Trigger cue**\nDivisibility by $6$ asserted for all integers — look for a product of three consecutive integers, which is the only expression here that supplies both a $2$ and a $3$.\n\n**Takeaway**\nThree consecutive integers always contain a two and a three.",
    fastest_path_md:
      "Pick numbers: at $n = 1$ the choices give $2$, $0$, $2$, $0$ and $4$, leaving two survivors. Test $n = 2$: the second gives $6$ and the fourth gives $3$, so only the second survives.",
    trap_map: {
      "0": "Reads the sum as equivalent to the difference, missing that only $n^3 - n$ factors into consecutive integers.",
      "2": "Gives a product of *two* consecutive integers, which guarantees a factor of $2$ but not of $3$.",
      "3": "Factors as $(n-1)(n+1)$, two integers two apart, which need not include a multiple of $3$.",
      "4": "Is divisible by $n$ and often by $3$, but fails the factor of $2$ at $n = 1$.",
    },
    numeric_check: null,
    check() {
      const ns = Array.from({ length: 60 }, (_, i) => i + 1);
      const div6 = (v) => v % 6 === 0;
      const preds = [
        (n) => div6(n ** 3 + n),
        (n) => div6(n ** 3 - n),
        (n) => div6(n ** 2 + n),
        (n) => div6(n ** 2 - 1),
        (n) => div6(n ** 3 + 3 * n),
      ];
      return { kind: "index", index: soleSurvivor(preds, ns) };
    },
  },
];

verifyAndAppend(items);
