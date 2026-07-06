/**
 * Batch 2: 13 new probability items (counting_sets_series_prob_stats).
 * Cells: D2 PS real, D2 PS pure, D3 PS real x2, D3 PS pure, D3 PS real (algebra,
 * expression choices), D3 DS real, D4 PS real, D4 PS pure, D4 DS pure, D4 DS real,
 * D5 PS pure, D5 PS real.
 * Run: node --experimental-strip-types scripts/author/batch2-probability.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1 — D2 PS real: independent events, both occur
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 2,
    stem_md:
      "The probability of rain on Saturday is $0.2$, and the probability of rain on Sunday is $0.3$. If rain on the two days is independent, what is the probability that it rains on both days?",
    choices: ["$0.06$", "$0.24$", "$0.44$", "$0.50$", "$0.56$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nFor independent events, $P(A \\text{ and } B) = P(A) \\cdot P(B)$. Here $P(\\text{both days}) = 0.2 \\cdot 0.3 = 0.06$.\n\n**Trigger cue**\n\nIndependent events joined by \"both\" or \"and\": multiply the individual probabilities.\n\n**Takeaway**\n\nIndependent events both happen with probability equal to the product.",
    fastest_path_md:
      "Multiply directly: $0.2 \\times 0.3 = 0.06$ — independence licenses the product, no cases needed.",
    trap_map: {
      "1": "Computes rain on Sunday but not Saturday: $0.8 \\cdot 0.3$.",
      "2": "Computes the probability of rain on at least one of the two days.",
      "3": "Adds the two probabilities instead of multiplying them.",
      "4": "Computes the probability of rain on neither day: $0.8 \\cdot 0.7$.",
    },
    numeric_check: "0.2*0.3",
    check() {
      const pSat = 0.2;
      const pSun = 0.3;
      let p = 0;
      for (const a of [0, 1]) {
        for (const b of [0, 1]) {
          const prob = (a ? pSat : 1 - pSat) * (b ? pSun : 1 - pSun);
          if (a === 1 && b === 1) p += prob;
        }
      }
      return { kind: "value", value: p };
    },
  },

  // 2 — D2 PS pure: sum of two dice equals 8
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 2,
    stem_md:
      "Two fair six-sided dice are rolled. What is the probability that the sum of the two numbers showing is $8$?",
    choices: [
      "$\\dfrac{1}{12}$",
      "$\\dfrac{1}{9}$",
      "$\\dfrac{5}{36}$",
      "$\\dfrac{1}{6}$",
      "$\\dfrac{5}{12}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThere are $6 \\cdot 6 = 36$ equally likely ordered outcomes. The ordered pairs summing to $8$ are $(2,6), (3,5), (4,4), (5,3), (6,2)$ — five outcomes. The probability is $\\tfrac{5}{36}$.\n\n**Trigger cue**\n\nSum of two dice: count ordered pairs out of $36$, remembering a double counts once.\n\n**Takeaway**\n\nCount ordered outcomes over $36$; doubles appear only once.",
    fastest_path_md:
      "List the pairs that hit $8$: $(2,6), (3,5), (4,4), (5,3), (6,2)$ — that is $5$ of $36$.",
    trap_map: {
      "0": "Counts the three unordered pairs $\\{2,6\\}, \\{3,5\\}, \\{4,4\\}$ over $36$ ordered outcomes.",
      "1": "Omits the $(4,4)$ outcome, counting only the four mixed ordered pairs.",
      "3": "Double-counts the double, treating $(4,4)$ as two distinct ordered outcomes.",
      "4": "Divides the $5$ favorable outcomes by $12$, the sum of the faces, instead of $36$.",
    },
    numeric_check: "5/36",
    check() {
      let hit = 0;
      let total = 0;
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          total++;
          if (a + b === 8) hit++;
        }
      }
      return { kind: "value", value: hit / total };
    },
  },

  // 3 — D3 PS real: binomial, exactly 2 of 3
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "A basketball player makes each free throw with probability $0.8$, independently of her other attempts. If she attempts exactly $3$ free throws, what is the probability that she makes exactly $2$ of them?",
    choices: ["$0.128$", "$0.384$", "$0.512$", "$0.640$", "$0.896$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nA make–make–miss outcome in one particular order has probability $0.8 \\cdot 0.8 \\cdot 0.2 = 0.128$. The miss can fall on any of the $3$ attempts, giving $3$ disjoint orders: $3 \\cdot 0.128 = 0.384$.\n\n**Trigger cue**\n\n\"Exactly $k$ of $n$ independent trials\": one-order probability times the number of arrangements.\n\n**Takeaway**\n\nExactly $k$ needs the arrangement count times the one-order probability.",
    fastest_path_md:
      "Three equally likely positions for the single miss: $3 \\times (0.8^2 \\cdot 0.2) = 3 \\times 0.128 = 0.384$.",
    trap_map: {
      "0": "Computes one order only, $0.8 \\cdot 0.8 \\cdot 0.2$, forgetting the $3$ arrangements of the miss.",
      "2": "Computes the probability that she makes all three free throws.",
      "3": "Computes $0.8^2$ for the first two attempts and ignores the third attempt entirely.",
      "4": "Computes the probability that she makes at least two of the three free throws.",
    },
    numeric_check: "3*0.8*0.8*0.2",
    check() {
      const p = 0.8;
      let total = 0;
      for (let mask = 0; mask < 8; mask++) {
        let makes = 0;
        let prob = 1;
        for (let t = 0; t < 3; t++) {
          if (mask & (1 << t)) {
            makes++;
            prob *= p;
          } else {
            prob *= 1 - p;
          }
        }
        if (makes === 2) total += prob;
      }
      return { kind: "value", value: total };
    },
  },

  // 4 — D3 PS pure: more heads than tails in 4 flips
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "A fair coin is flipped $4$ times. What is the probability that the coin lands heads up more times than it lands tails up?",
    choices: [
      "$\\dfrac{1}{4}$",
      "$\\dfrac{5}{16}$",
      "$\\dfrac{3}{8}$",
      "$\\dfrac{1}{2}$",
      "$\\dfrac{11}{16}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThere are $2^4 = 16$ equally likely sequences. More heads than tails means $3$ or $4$ heads: $\\binom{4}{3} + \\binom{4}{4} = 4 + 1 = 5$ sequences, so the probability is $\\tfrac{5}{16}$.\n\n**Trigger cue**\n\n\"More heads than tails\" over an even number of flips: ties exist, so symmetry alone gives less than $\\tfrac{1}{2}$.\n\n**Takeaway**\n\nTies break coin symmetry; count winning head counts directly.",
    fastest_path_md:
      "By symmetry, $P(\\text{more heads}) = \\tfrac{1 - P(\\text{tie})}{2} = \\tfrac{1 - 6/16}{2} = \\tfrac{5}{16}$.",
    trap_map: {
      "0": "Counts only the $4$ sequences with exactly three heads, missing the all-heads sequence.",
      "2": "Computes the probability of equally many heads and tails, $6/16$.",
      "3": "Splits more-heads and more-tails evenly while forgetting that ties are possible.",
      "4": "Counts heads at least as often as tails, wrongly including the $6$ tied sequences.",
    },
    numeric_check: "5/16",
    check() {
      let hit = 0;
      let total = 0;
      for (let mask = 0; mask < 16; mask++) {
        total++;
        let heads = 0;
        for (let t = 0; t < 4; t++) if (mask & (1 << t)) heads++;
        if (heads > 4 - heads) hit++;
      }
      return { kind: "value", value: hit / total };
    },
  },

  // 5 — D3 PS real: one of each color without replacement
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "A gift box contains $4$ dark chocolates and $6$ milk chocolates. If $2$ chocolates are selected at random from the box, without replacement, what is the probability that one is a dark chocolate and one is a milk chocolate?",
    choices: [
      "$\\dfrac{2}{15}$",
      "$\\dfrac{4}{15}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{12}{25}$",
      "$\\dfrac{8}{15}$",
    ],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nDark then milk has probability $\\tfrac{4}{10} \\cdot \\tfrac{6}{9} = \\tfrac{24}{90}$, and milk then dark has probability $\\tfrac{6}{10} \\cdot \\tfrac{4}{9} = \\tfrac{24}{90}$. The two orders are disjoint, so the total is $\\tfrac{48}{90} = \\tfrac{8}{15}$.\n\n**Trigger cue**\n\n\"One of each\" from two draws without replacement: two disjoint orders, each a shrinking-denominator product.\n\n**Takeaway**\n\n\"One of each\" happens in two orders — double the product.",
    fastest_path_md:
      "Complement of same-color: $1 - \\tfrac{4 \\cdot 3}{90} - \\tfrac{6 \\cdot 5}{90} = 1 - \\tfrac{42}{90} = \\tfrac{8}{15}$.",
    trap_map: {
      "0": "Computes the probability that both chocolates are dark: $\\tfrac{4}{10} \\cdot \\tfrac{3}{9}$.",
      "1": "Computes only the dark-then-milk order, forgetting milk-then-dark.",
      "2": "Computes the probability that both chocolates are milk: $\\tfrac{6}{10} \\cdot \\tfrac{5}{9}$.",
      "3": "Treats the draws as with replacement: $2 \\cdot \\tfrac{4}{10} \\cdot \\tfrac{6}{10}$.",
    },
    numeric_check: "48/90",
    check() {
      // items 0..3 dark, 4..9 milk; enumerate ordered draws without replacement
      let hit = 0;
      let total = 0;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (i === j) continue;
          total++;
          const iDark = i < 4;
          const jDark = j < 4;
          if (iDark !== jDark) hit++;
        }
      }
      return { kind: "value", value: hit / total };
    },
  },

  // 6 — D3 PS real (algebra, expression choices): at least one of 2 days in terms of p
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "On each day that a certain machine operates, the probability that it will malfunction is $p$, independently of what happens on any other day. In terms of $p$, what is the probability that the machine will malfunction on at least one of the next $2$ days on which it operates?",
    choices: ["$p^2$", "$2p$", "$1 - p^2$", "$2p - p^2$", "$(1-p)^2$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe complement of \"at least one malfunction\" is \"no malfunction on either day,\" which has probability $(1-p)^2$ by independence. So the answer is $1 - (1-p)^2 = 1 - (1 - 2p + p^2) = 2p - p^2$.\n\n**Trigger cue**\n\n\"At least one\" over independent repeats: take one minus the probability that it never happens.\n\n**Takeaway**\n\n\"At least one\" is one minus the all-clear probability.",
    fastest_path_md:
      "Test $p = 1$: the answer must be $1$, eliminating all but $p^2$ and $2p - p^2$; then $p = \\tfrac{1}{2}$ must give $\\tfrac{3}{4}$, keeping only $2p - p^2$.",
    trap_map: {
      "0": "Computes the probability that the machine malfunctions on both days.",
      "1": "Adds the two days' probabilities without subtracting the both-days overlap.",
      "2": "Complements the both-days event instead of the no-malfunction event.",
      "4": "Stops at the probability of no malfunction, forgetting to subtract from $1$.",
    },
    numeric_check: null,
    check() {
      // truth by enumeration of the two days' outcomes; match against each choice
      const truth = (p) => {
        let tot = 0;
        for (const d1 of [0, 1]) {
          for (const d2 of [0, 1]) {
            const pr = (d1 ? p : 1 - p) * (d2 ? p : 1 - p);
            if (d1 === 1 || d2 === 1) tot += pr;
          }
        }
        return tot;
      };
      const candidates = [
        (p) => p * p,
        (p) => 2 * p,
        (p) => 1 - p * p,
        (p) => 2 * p - p * p,
        (p) => (1 - p) * (1 - p),
      ];
      const samples = [0.13, 0.5, 0.87];
      const matches = [0, 1, 2, 3, 4].filter((i) =>
        samples.every((p) => Math.abs(candidates[i](p) - truth(p)) < 1e-12),
      );
      if (matches.length !== 1) throw new Error(`ambiguous match: ${matches}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // 7 — D3 DS real: probability red, ratio vs total
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "A jar contains only red marbles and blue marbles. If one marble is to be selected at random from the jar, what is the probability that the marble selected will be red?\n\n(1) The jar contains a total of $24$ marbles.\n\n(2) The ratio of the number of red marbles to the number of blue marbles in the jar is $3$ to $5$.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nWith $r$ red and $b$ blue marbles, the probability is $\\tfrac{r}{r+b}$. Statement (1): $r + b = 24$ allows any split from $1$ red to $23$ red, so the probability is not fixed — insufficient. Statement (2): $r = 3k$ and $b = 5k$ for some positive integer $k$, so the probability is $\\tfrac{3k}{8k} = \\tfrac{3}{8}$ for every $k$ — sufficient. The answer is (B).\n\n**Trigger cue**\n\nA probability question about a mixture: a part-to-part ratio alone fixes the part-to-whole fraction.\n\n**Takeaway**\n\nProbability is a fraction; a ratio alone can fix it.",
    fastest_path_md:
      "The ratio alone gives $\\tfrac{3}{3+5} = \\tfrac{3}{8}$ with no total needed, while a total alone says nothing about the color split — (B).",
    trap_map: {
      "0": "Assumes a known total pins down the red count, but $24$ marbles alone say nothing about the color split.",
      "2": "Believes an actual marble count must accompany the ratio, though $3k$ red of $8k$ total is $\\tfrac{3}{8}$ for every $k$.",
      "3": "Grants the total the same power as the ratio, but the total leaves the split completely open.",
      "4": "Demands both exact counts, overlooking that probability is a fraction the ratio already determines.",
    },
    numeric_check: null,
    check() {
      // enumerate (red, blue) configurations and decide sufficiency by uniqueness
      const configs = [];
      for (let r = 1; r <= 120; r++) {
        for (let b = 1; b <= 120; b++) configs.push([r, b]);
      }
      const prob = ([r, b]) => (r / (r + b)).toFixed(12);
      const s1 = configs.filter(([r, b]) => r + b === 24);
      const s2 = configs.filter(([r, b]) => 5 * r === 3 * b);
      const both = configs.filter(([r, b]) => r + b === 24 && 5 * r === 3 * b);
      const unique = (arr) => arr.length > 0 && new Set(arr.map(prob)).size === 1;
      const suff1 = unique(s1);
      const suff2 = unique(s2);
      let index;
      if (suff1 && suff2) index = 3;
      else if (suff1) index = 0;
      else if (suff2) index = 1;
      else index = unique(both) ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 8 — D4 PS real: birthday-type collision among 3 choosers, 4 options
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 4,
    stem_md:
      "Each of $3$ coworkers independently selects one of $4$ food trucks for lunch, with each truck equally likely to be selected. What is the probability that at least two of the coworkers select the same truck?",
    choices: [
      "$\\dfrac{1}{16}$",
      "$\\dfrac{3}{8}$",
      "$\\dfrac{7}{16}$",
      "$\\dfrac{5}{8}$",
      "$\\dfrac{3}{4}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThere are $4^3 = 64$ equally likely selections. All three trucks differ in $4 \\cdot 3 \\cdot 2 = 24$ of them, so the probability of no shared truck is $\\tfrac{24}{64} = \\tfrac{3}{8}$, and the probability that at least two coworkers share a truck is $1 - \\tfrac{3}{8} = \\tfrac{5}{8}$.\n\n**Trigger cue**\n\n\"At least two match\" among independent random choices: complement through the all-different count.\n\n**Takeaway**\n\n\"At least two share\" is one minus all-distinct.",
    fastest_path_md:
      "Sequentially: the second coworker avoids $1$ truck, the third avoids $2$, so $1 - \\tfrac{3}{4} \\cdot \\tfrac{2}{4} = 1 - \\tfrac{3}{8} = \\tfrac{5}{8}$.",
    trap_map: {
      "0": "Computes the probability that all three coworkers select the same truck: $4/64$.",
      "1": "Stops at the complement, reporting the probability that all three trucks differ.",
      "2": "Uses $1 - \\left(\\tfrac{3}{4}\\right)^2$, requiring the third coworker to differ from only one other.",
      "4": "Adds the three pairwise match probabilities $3 \\cdot \\tfrac{1}{4}$ without inclusion–exclusion.",
    },
    numeric_check: "1 - 24/64",
    check() {
      let hit = 0;
      let total = 0;
      for (let a = 0; a < 4; a++) {
        for (let b = 0; b < 4; b++) {
          for (let c = 0; c < 4; c++) {
            total++;
            if (a === b || b === c || a === c) hit++;
          }
        }
      }
      return { kind: "value", value: hit / total };
    },
  },

  // 9 — D4 PS pure: exactly one fixed point among 4 letters
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 4,
    stem_md:
      "Each of $4$ letters is placed at random into one of $4$ addressed envelopes, one letter per envelope. What is the probability that exactly one letter is placed in the envelope bearing its own address?",
    choices: [
      "$\\dfrac{1}{6}$",
      "$\\dfrac{1}{4}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{3}{8}$",
      "$\\dfrac{5}{8}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThere are $4! = 24$ equally likely placements. Choose which letter is correctly placed ($4$ ways); the other $3$ letters must all be misplaced. For $3$ items, listing shows exactly $2$ such arrangements (the two $3$-cycles). Favorable count $= 4 \\cdot 2 = 8$, so the probability is $\\tfrac{8}{24} = \\tfrac{1}{3}$.\n\n**Trigger cue**\n\n\"Exactly $m$ in the correct position\": choose the fixed points, then derange the remainder.\n\n**Takeaway**\n\nFix who matches, then derange the rest.",
    fastest_path_md:
      "Recall the $3$-item derangement count is $2$: $4$ choices of the matched letter $\\times\\, 2$ gives $\\tfrac{8}{24} = \\tfrac{1}{3}$.",
    trap_map: {
      "0": "Counts the $4$ choices of the matched letter but assumes the other three misplace in only one way.",
      "1": "Reports the probability that one particular letter lands correctly, not that exactly one does.",
      "3": "Computes the probability that no letter is correctly placed: $9/24$.",
      "4": "Computes the probability that at least one letter is correctly placed: $15/24$.",
    },
    numeric_check: "8/24",
    check() {
      const perms = [];
      const permute = (a, k = 0) => {
        if (k === a.length) {
          perms.push([...a]);
          return;
        }
        for (let i = k; i < a.length; i++) {
          [a[k], a[i]] = [a[i], a[k]];
          permute(a, k + 1);
          [a[k], a[i]] = [a[i], a[k]];
        }
      };
      permute([0, 1, 2, 3]);
      let hit = 0;
      for (const p of perms) {
        let fixed = 0;
        for (let i = 0; i < 4; i++) if (p[i] === i) fixed++;
        if (fixed === 1) hit++;
      }
      return { kind: "value", value: hit / perms.length };
    },
  },

  // 10 — D4 DS pure: P(A or B) needs P(B) and the overlap
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 4,
    stem_md:
      "The probability that event $A$ occurs is $0.4$. What is the probability that event $A$ or event $B$ (or both) occurs?\n\n(1) The probability that event $B$ occurs is $0.5$.\n\n(2) Events $A$ and $B$ cannot both occur.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = 0.4 + P(B) - P(A \\cap B)$. Statement (1) gives $P(B) = 0.5$, but $P(A \\cap B)$ can be anywhere from $0$ to $0.4$, putting the union anywhere from $0.5$ to $0.9$ — insufficient. Statement (2) gives $P(A \\cap B) = 0$, but $P(B)$ is unknown — insufficient. Together: $0.4 + 0.5 - 0 = 0.9$ — sufficient. The answer is (C).\n\n**Trigger cue**\n\nA union probability with one marginal given: audit the statements for the other marginal AND the overlap.\n\n**Takeaway**\n\nThe union needs both the second probability and the overlap.",
    fastest_path_md:
      "The addition rule has two unknowns, $P(B)$ and $P(A \\cap B)$; statement (1) supplies exactly one and statement (2) the other — (C).",
    trap_map: {
      "0": "Applies $P(A) + P(B)$ under statement (1) alone, silently assuming the overlap is zero.",
      "1": "Thinks mutual exclusivity alone pins down the union, though statement (2) gives no value for $P(B)$.",
      "3": "Assumes no overlap in (1) and misreads (2) as also supplying a value for $P(B)$.",
      "4": "Hunts for a separately stated $P(A \\cap B)$, missing that statement (2) already fixes it at $0$.",
    },
    numeric_check: null,
    check() {
      // enumerate (P(B), P(A∩B)) in integer percent; decide sufficiency by uniqueness
      const pA = 40;
      const states = [];
      for (let pB = 0; pB <= 100; pB++) {
        for (let pAB = 0; pAB <= Math.min(pA, pB); pAB++) {
          if (pA + pB - pAB <= 100) states.push([pB, pAB]);
        }
      }
      const union = ([pB, pAB]) => pA + pB - pAB;
      const s1 = states.filter(([pB]) => pB === 50);
      const s2 = states.filter(([, pAB]) => pAB === 0);
      const both = states.filter(([pB, pAB]) => pB === 50 && pAB === 0);
      const unique = (arr) => arr.length > 0 && new Set(arr.map(union)).size === 1;
      const suff1 = unique(s1);
      const suff2 = unique(s2);
      let index;
      if (suff1 && suff2) index = 3;
      else if (suff1) index = 0;
      else if (suff2) index = 1;
      else index = unique(both) ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 11 — D4 DS real: invert a both-green probability to a count
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 4,
    stem_md:
      "A box contains $10$ chips, each of which is either red or green. If $2$ chips are to be selected at random from the box, without replacement, what is the probability that both selected chips will be red?\n\n(1) The probability that both selected chips would be green is $\\dfrac{1}{15}$.\n\n(2) The box contains more than $6$ red chips.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nWith $g$ green chips, $P(\\text{both green}) = \\tfrac{g(g-1)}{10 \\cdot 9}$. Statement (1): $\\tfrac{g(g-1)}{90} = \\tfrac{1}{15}$ gives $g(g-1) = 6$, so $g = 3$; then there are $7$ red chips and $P(\\text{both red}) = \\tfrac{7 \\cdot 6}{90} = \\tfrac{7}{15}$ — sufficient. Statement (2): the red count could be $7$, $8$, $9$, or $10$, each giving a different probability — insufficient. The answer is (A).\n\n**Trigger cue**\n\nA without-replacement pair probability stated as data: invert $\\tfrac{k(k-1)}{n(n-1)}$ back to the count $k$.\n\n**Takeaway**\n\nInvert pair probabilities to exact counts; ranges are rarely sufficient.",
    fastest_path_md:
      "$\\tfrac{1}{15} = \\tfrac{6}{90}$ and $3 \\cdot 2 = 6$ forces exactly $3$ green, hence $7$ red; \"more than $6$ red\" still spans four different answers — (A).",
    trap_map: {
      "1": "Reads \"more than $6$ red\" as exactly $7$, though $8$, $9$, or $10$ red chips give different probabilities.",
      "2": "Thinks the green-pair probability needs the red-count bound on top, but $g(g-1) = 6$ already forces $g = 3$.",
      "3": "Accepts the range in statement (2) as if every count above $6$ gave the same both-red probability.",
      "4": "Treats statement (1) as information about green chips only, never converting it into a red count.",
    },
    numeric_check: null,
    check() {
      // enumerate every possible red count 0..10 and decide sufficiency by uniqueness
      const counts = [];
      for (let r = 0; r <= 10; r++) counts.push(r);
      const pRed = (r) => ((r * (r - 1)) / 90).toFixed(12);
      // statement filters use exact integer arithmetic, not the solution's algebra
      const s1 = counts.filter((r) => (10 - r) * (9 - r) * 15 === 90);
      const s2 = counts.filter((r) => r > 6);
      const both = counts.filter((r) => (10 - r) * (9 - r) * 15 === 90 && r > 6);
      const unique = (arr) => arr.length > 0 && new Set(arr.map(pRed)).size === 1;
      const suff1 = unique(s1);
      const suff2 = unique(s2);
      let index;
      if (suff1 && suff2) index = 3;
      else if (suff1) index = 0;
      else if (suff2) index = 1;
      else index = unique(both) ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 12 — D5 PS pure: stopping rule, parity of the number of flips
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "A fair coin is to be flipped until it lands heads up for the first time or until it has been flipped $4$ times, whichever occurs first. What is the probability that the coin will be flipped an even number of times?",
    choices: [
      "$\\dfrac{1}{8}$",
      "$\\dfrac{1}{4}$",
      "$\\dfrac{5}{16}$",
      "$\\dfrac{3}{8}$",
      "$\\dfrac{1}{2}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe process uses $1$ flip with probability $\\tfrac{1}{2}$ (H), $2$ flips with probability $\\tfrac{1}{4}$ (TH), $3$ flips with probability $\\tfrac{1}{8}$ (TTH), and $4$ flips with probability $\\tfrac{1}{8}$ (TTT followed by either result). An even count means $2$ or $4$ flips: $\\tfrac{1}{4} + \\tfrac{1}{8} = \\tfrac{3}{8}$.\n\n**Trigger cue**\n\n\"Until ... or at most $n$ times\": partition by stopping time and remember the forced final flip.\n\n**Takeaway**\n\nStopping rules end sequences early; count flips used, not heads.",
    fastest_path_md:
      "Even means TH immediately or reaching flip $4$; three opening tails force a fourth flip regardless of its result, so $\\tfrac{1}{4} + \\tfrac{1}{8} = \\tfrac{3}{8}$.",
    trap_map: {
      "0": "Counts only the four-flip cases, $\\tfrac{1}{8}$, dropping the two-flip TH case.",
      "1": "Counts only the TH case, missing that four flips is also an even count.",
      "2": "Requires the fourth flip to be heads, overlooking that four tails also ends at four flips.",
      "4": "Assumes even and odd flip counts are equally likely.",
    },
    numeric_check: "6/16",
    check() {
      // enumerate all 16 equally likely length-4 head/tail strings;
      // flips used = position of first head, or 4 if no head appears
      let hit = 0;
      let total = 0;
      for (let mask = 0; mask < 16; mask++) {
        total++;
        let flips = 4;
        for (let t = 0; t < 4; t++) {
          if (mask & (1 << t)) {
            flips = t + 1;
            break;
          }
        }
        if (flips % 2 === 0) hit++;
      }
      return { kind: "value", value: hit / total };
    },
  },

  // 13 — D5 PS real: random pairing into teams of two
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "Six children, including Marta and Julio, are to be divided at random into $3$ teams of $2$ children each. What is the probability that Marta and Julio will be on the same team?",
    choices: [
      "$\\dfrac{1}{15}$",
      "$\\dfrac{1}{6}$",
      "$\\dfrac{1}{5}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{2}{5}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe six children split into unordered pairs in $\\tfrac{6!}{2^3 \\cdot 3!} = 15$ ways. If Marta and Julio form one team, the remaining four children pair up in $3$ ways, so $3$ of the $15$ divisions are favorable: $\\tfrac{3}{15} = \\tfrac{1}{5}$.\n\n**Trigger cue**\n\nRandom split into pairs, \"same team\": condition on one person and count her possible partners.\n\n**Takeaway**\n\nFix one person; the partner is uniform over the rest.",
    fastest_path_md:
      "Marta's teammate is equally likely to be any of the other $5$ children, so the probability it is Julio is $\\tfrac{1}{5}$.",
    trap_map: {
      "0": "Counts a single favorable division out of $15$, forgetting the other four children still pair in $3$ ways.",
      "1": "Makes Julio one of $6$ equally likely teammates, wrongly including Marta herself in the pool.",
      "3": "Reasons that the pair must land in one of the $3$ teams, so the probability is $\\tfrac{1}{3}$.",
      "4": "Doubles the correct $\\tfrac{1}{5}$ to account for the two orders within the team.",
    },
    numeric_check: "3/15",
    check() {
      // brute force: assign the 6 children to 6 slots in all 720 ways;
      // teams are slot pairs (0,1), (2,3), (4,5); Marta = 0, Julio = 1
      const perms = [];
      const permute = (a, k = 0) => {
        if (k === a.length) {
          perms.push([...a]);
          return;
        }
        for (let i = k; i < a.length; i++) {
          [a[k], a[i]] = [a[i], a[k]];
          permute(a, k + 1);
          [a[k], a[i]] = [a[i], a[k]];
        }
      };
      permute([0, 1, 2, 3, 4, 5]);
      let hit = 0;
      for (const p of perms) {
        const teamOf = (person) => Math.floor(p.indexOf(person) / 2);
        if (teamOf(0) === teamOf(1)) hit++;
      }
      return { kind: "value", value: hit / perms.length };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
