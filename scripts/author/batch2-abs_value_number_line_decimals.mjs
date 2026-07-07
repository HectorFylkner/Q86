/**
 * Batch 2: abs_value_number_line_decimals (fundamental_skill value_order_factors).
 * Nine items extending the original batch into angles the bank misses:
 * magnitude-vs-value comparison, decimal-grid counting, tolerance accumulation,
 * ordering powers of a negative decimal, nested absolute values, minimax
 * placement, line-configuration case work, a DS whose statements share an
 * identical solution set, and a coupled L1 deviation budget.
 *
 * Every check() recomputes the answer by brute force over a discretized
 * number line (integer tenths/hundredths so arithmetic is exact) — never by
 * transcribing the solution algebra.
 *
 * Run: node --experimental-strip-types scripts/author/batch2-abs_value_number_line_decimals.mjs
 * (dry run unless --append)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D2 PS real — least change in absolute value among signed decimals
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 2,
    stem_md:
      "Over five successive days, the water level of a reservoir changed by $-0.62$, $0.40$, $-0.05$, $0.13$, and $-0.50$ meters. What was the change, in meters, on the day for which the absolute value of the change was least?",
    choices: ["$-0.62$", "$-0.50$", "$-0.05$", "$0.13$", "$0.40$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe absolute values of the five changes are $0.62$, $0.40$, $0.05$, $0.13$, and $0.50$. The least of these is $0.05$, which comes from the change $-0.05$. The sign records only the direction of the change, not its size.\n\n**Trigger cue**\n\nWhen a question ranks changes by absolute value, strip every sign before comparing and restore the sign only in the answer.\n\n**Takeaway**\n\nAbsolute value compares sizes; the sign only records direction.",
    fastest_path_md:
      "Ignore the signs and scan the magnitudes: $0.05$ is smallest, so the answer is $-0.05$.",
    trap_map: {
      "0": "Picks the least change by value (the most negative), not by absolute value.",
      "1": "Place-value slip that reads $-0.50$ as smaller in size than $-0.05$.",
      "3": "Discards the negative changes and takes the least positive change.",
      "4": "Misreads the question as asking for the greatest change.",
    },
    numeric_check: "-0.05",
    check() {
      // work in integer hundredths; pick the entry of least magnitude
      const changes = [-62, 40, -5, 13, -50];
      let best = changes[0];
      for (const c of changes) if (Math.abs(c) < Math.abs(best)) best = c;
      return { kind: "value", value: best / 100 };
    },
  },

  // 2. D3 PS pure — counting decimal grid points inside an absolute-value band
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 3,
    stem_md:
      "How many multiples of $0.25$ satisfy the inequality $|x - 1.1| < 0.9$?",
    choices: ["4", "6", "7", "8", "9"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe inequality unpacks to $1.1 - 0.9 < x < 1.1 + 0.9$, that is $0.2 < x < 2.0$. Multiples of $0.25$ are the numbers $0.25k$ for integers $k$; the condition $0.2 < 0.25k < 2.0$ gives $0.8 < k < 8$, so $k = 1, 2, \\ldots, 7$. Note that $2.0 = 0.25 \\cdot 8$ is excluded by the strict inequality. There are $7$ such multiples.\n\n**Trigger cue**\n\nWhen a question counts members of a decimal grid inside $|x - c| < r$, convert to endpoints and index the grid points as $k$-multiples.\n\n**Takeaway**\n\nConvert the band to endpoints, then index grid points as multiples.",
    fastest_path_md:
      "The band is $(0.2,\\ 2.0)$. Writing candidates as $0.25k$ forces $0.8 < k < 8$, so $k$ runs from $1$ to $7$: seven values.",
    trap_map: {
      "0": "Counts only the values ending in $.25$ or $.75$ as multiples of $0.25$.",
      "1": "Skips $1$, not recognizing an integer as a multiple of $0.25$.",
      "3": "Treats the strict inequality as $\\le$, letting $x = 2$ in.",
      "4": "Counts every multiple of $0.25$ from $0$ to $2$ inclusive.",
    },
    numeric_check: "7",
    check() {
      // brute force in integer hundredths: x = k/100, multiples of 0.25 are k % 25 === 0
      let count = 0;
      for (let k = -1000; k <= 1000; k++) {
        if (k % 25 === 0 && Math.abs(k - 110) < 90) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // 3. D3 PS real — tolerance accumulation across three parts
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 3,
    stem_md:
      "A beam is formed by joining three boards end to end. The length $b$ of each board, in meters, satisfies $|b - 2.4| \\le 0.05$. What is the difference, in meters, between the greatest possible length and the least possible length of the beam?",
    choices: ["$0.05$", "$0.10$", "$0.15$", "$0.30$", "$0.60$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nEach board's length lies in $[2.35,\\ 2.45]$. The beam is longest when all three boards are at $2.45$, total $7.35$, and shortest when all three are at $2.35$, total $7.05$. The difference is $7.35 - 7.05 = 0.30$ — three boards, each contributing a full range of $2(0.05) = 0.10$.\n\n**Trigger cue**\n\nWhen several toleranced parts are combined, the individual ranges add: extremes come from pushing every part the same way.\n\n**Takeaway**\n\nRanges add: $n$ parts of radius $r$ span $2nr$.",
    fastest_path_md:
      "Each board swings over a range of $0.10$, and the three swings add: $3(0.10) = 0.30$. No endpoint arithmetic needed.",
    trap_map: {
      "0": "Reports a single board's one-sided tolerance rather than any range.",
      "1": "Uses the range of one board, forgetting the beam has three.",
      "2": "Adds the three tolerances in one direction only.",
      "4": "Doubles the correct range, counting the two directions twice.",
    },
    numeric_check: "0.30",
    check() {
      // brute force in integer hundredths: each board 235..245
      let min = Infinity;
      let max = -Infinity;
      for (let a = 235; a <= 245; a++) {
        for (let b = 235; b <= 245; b++) {
          for (let c = 235; c <= 245; c++) {
            const total = a + b + c;
            if (total < min) min = total;
            if (total > max) max = total;
          }
        }
      }
      return { kind: "value", value: (max - min) / 100 };
    },
  },

  // 4. D3 PS pure — ordering signed powers of a decimal between -1 and 0
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 3,
    stem_md: "If $x = -0.8$, which of the following has the greatest value?",
    choices: ["$x^2$", "$-x^3$", "$x^4$", "$-x^5$", "$-x$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nCompute each value: $x^2 = 0.64$, $-x^3 = 0.512$, $x^4 = 0.4096$, $-x^5 = 0.32768$, and $-x = 0.8$. Every option is positive and equals a power of $0.8$: the five choices are $0.8^2$, $0.8^3$, $0.8^4$, $0.8^5$, and $0.8^1$. Since the base is between $0$ and $1$, higher powers are smaller, so the first power $-x = 0.8$ is greatest.\n\n**Trigger cue**\n\nWhen powers of a number between $-1$ and $0$ are compared, rewrite each option as $\\pm|x|^n$ and rank by exponent.\n\n**Takeaway**\n\nFor a base between 0 and 1, higher powers are smaller.",
    fastest_path_md:
      "Every choice equals $0.8^n$ with $n = 2, 3, 4, 5, 1$ respectively. Powers of $0.8$ shrink as $n$ grows, so $n = 1$ wins — no multiplication required.",
    trap_map: {
      "0": "Assumes squaring gives the largest result, though powers of $0.8$ shrink.",
      "1": "Expects the cube to outgrow the first power once the sign is flipped.",
      "2": "Believes even powers grow with the exponent.",
      "3": "Believes the highest exponent, once made positive, must dominate.",
    },
    numeric_check: null,
    check() {
      // evaluate each choice numerically at x = -0.8 and find the unique argmax
      const x = -0.8;
      const values = [x ** 2, -(x ** 3), x ** 4, -(x ** 5), -x];
      let best = 0;
      for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
      for (let i = 0; i < values.length; i++) {
        if (i !== best && Math.abs(values[i] - values[best]) < 1e-12)
          throw new Error("tie for greatest value");
      }
      return { kind: "index", index: best };
    },
  },

  // 5. D4 PS pure — nested absolute values, sum of all solutions
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "What is the sum of all values of $x$ that satisfy $\\bigl||x + 1.5| - 4\\bigr| = 2.5$?",
    choices: ["$-8$", "$-6$", "$-3$", "$0$", "$6$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nPeel the outer absolute value: $|x + 1.5| - 4 = \\pm 2.5$, so $|x + 1.5| = 6.5$ or $|x + 1.5| = 1.5$ (both are nonnegative, so both branches survive). The first gives $x = 5$ or $x = -8$; the second gives $x = 0$ or $x = -3$. All four solutions are symmetric in pairs about $-1.5$, and their sum is $5 - 8 + 0 - 3 = -6$.\n\n**Trigger cue**\n\nA nested absolute-value equation: substitute for the inner block and peel one layer at a time, checking each branch is nonnegative.\n\n**Takeaway**\n\nEach absolute-value branch contributes a pair symmetric about the center.",
    fastest_path_md:
      "Both branches produce solution pairs centered at $-1.5$, so four solutions sum to $4(-1.5) = -6$ — no need to find any of them.",
    trap_map: {
      "0": "Reports only the least solution instead of the sum.",
      "2": "Keeps only the branch $|x + 1.5| = 1.5$, dropping the $6.5$ branch.",
      "3": "Assumes the four solutions pair off symmetrically about zero.",
      "4": "Flips the sign of the center, treating the solutions as symmetric about $+1.5$.",
    },
    numeric_check: "-6",
    check() {
      // brute force in integer tenths: x = t/10
      const sols = [];
      for (let t = -300; t <= 300; t++) {
        if (Math.abs(Math.abs(t + 15) - 40) === 25) sols.push(t);
      }
      if (sols.length !== 4) throw new Error(`expected 4 solutions, got ${sols.length}`);
      return { kind: "value", value: sols.reduce((a, b) => a + b, 0) / 10 };
    },
  },

  // 6. D4 PS real — minimax placement (contrast with median-sum minimization)
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "Three cabins stand beside a straight trail, at the $1.3$-kilometer, $2.9$-kilometer, and $5.5$-kilometer markers. A water station will be built at the point on the trail for which the greatest of the three distances from the station to the cabins is as small as possible. What is that greatest distance, in kilometers?",
    choices: ["$2.1$", "$2.6$", "$2.9$", "$3.4$", "$4.2$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nFor a station at position $p$, the distances to the outer cabins satisfy $|p - 1.3| + |p - 5.5| \\ge 5.5 - 1.3 = 4.2$, so the larger of the two is at least $2.1$ — no placement can beat $2.1$. At the midpoint of the outer cabins, $p = 3.4$, the distances are $2.1$, $0.5$, and $2.1$, so the greatest is exactly $2.1$. The bound is achieved, and the middle cabin never matters.\n\n**Trigger cue**\n\n\"Make the greatest distance as small as possible\" calls for the midpoint of the extreme points — unlike minimizing a total, which calls for the median.\n\n**Takeaway**\n\nMinimax distance equals half the spread of the extreme points.",
    fastest_path_md:
      "Only the outer cabins constrain the worst case: the best possible worst distance is half their spread, $(5.5 - 1.3)/2 = 2.1$.",
    trap_map: {
      "1": "Builds at the middle cabin, which minimizes the total distance, not the greatest one.",
      "2": "Reports the middle cabin's marker position rather than a distance.",
      "3": "Reports the optimal station position $3.4$ instead of the resulting distance.",
      "4": "Uses the full spread between the outer cabins, forgetting the midpoint halves it.",
    },
    numeric_check: "2.1",
    check() {
      // brute force station position in integer tenths over a wide window
      const cabins = [13, 29, 55];
      let best = Infinity;
      for (let p = -200; p <= 300; p++) {
        let worst = 0;
        for (const c of cabins) worst = Math.max(worst, Math.abs(p - c));
        if (worst < best) best = worst;
      }
      return { kind: "value", value: best / 10 };
    },
  },

  // 7. D4 PS real — same-side vs opposite-side configurations on a line
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "Three houses, F, G, and H, stand on a straight road. The distance between F and G is $4.5$ kilometers, and the distance between G and H is $2.7$ kilometers. What is the difference, in kilometers, between the greatest possible distance and the least possible distance between F and H?",
    choices: ["$1.8$", "$2.7$", "$4.5$", "$5.4$", "$7.2$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nPlace G anywhere on the road; F sits $4.5$ to one side and H sits $2.7$ to one side. If F and H are on opposite sides of G, the distance is $4.5 + 2.7 = 7.2$; if they are on the same side, it is $4.5 - 2.7 = 1.8$. On a line these are the only two configurations, so the difference between the greatest and least possible distances is $7.2 - 1.8 = 5.4$.\n\n**Trigger cue**\n\nDistances along a line with the order of points unspecified: test the same-side and opposite-side placements before answering.\n\n**Takeaway**\n\nOn a line, unknown order means sum or difference of distances.",
    fastest_path_md:
      "The two possible distances are the sum and the difference of the givens, so the answer is $(4.5 + 2.7) - (4.5 - 2.7) = 2(2.7) = 5.4$.",
    trap_map: {
      "0": "Reports the least possible distance instead of the difference asked for.",
      "1": "Subtracts the larger given distance from the greatest possible one: $7.2 - 4.5$.",
      "2": "Subtracts the smaller given distance from the greatest possible one: $7.2 - 2.7$.",
      "4": "Reports the greatest possible distance instead of the difference asked for.",
    },
    numeric_check: "5.4",
    check() {
      // brute force in integer tenths: enumerate all placements of F, G, H
      const dists = new Set();
      for (let g = -60; g <= 60; g++) {
        for (let f = -200; f <= 200; f++) {
          if (Math.abs(f - g) !== 45) continue;
          for (let h = -200; h <= 200; h++) {
            if (Math.abs(g - h) !== 27) continue;
            dists.add(Math.abs(f - h));
          }
        }
      }
      if (dists.size < 2) throw new Error("expected at least 2 distinct distances");
      const arr = [...dists];
      return { kind: "value", value: (Math.max(...arr) - Math.min(...arr)) / 10 };
    },
  },

  // 8. D5 DS pure — two statements with identical solution sets (E-trap)
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 5,
    stem_md:
      "What is the value of $x$?\n\n(1) $|x - 1.2| = 2|x - 3|$\n\n(2) $|x - 3.6| = 1.2$",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nStatement (1): for $x \\ge 3$, $x - 1.2 = 2(x - 3)$ gives $x = 4.8$; for $1.2 \\le x < 3$, $x - 1.2 = 2(3 - x)$ gives $x = 2.4$; for $x < 1.2$ the case yields $x = 4.8$, rejected. So (1) allows $x = 2.4$ or $4.8$ — insufficient. Statement (2): $x = 3.6 \\pm 1.2$, so $x = 2.4$ or $4.8$ — insufficient. The two statements have the same solution set, so together they still allow both values: not sufficient. Answer E.\n\n**Trigger cue**\n\nTwo absolute-value statements each yielding a pair of values: before choosing C, test every candidate from one statement in the other.\n\n**Takeaway**\n\nCombining statements helps only if their solution sets differ.",
    fastest_path_md:
      "Solve (2) first: $x = 2.4$ or $4.8$. Plug both into (1): $|1.2| = 2|{-0.6}|$ and $|3.6| = 2|1.8|$ — both survive, so even together $x$ is not fixed.",
    trap_map: {
      "0": "Solves (1) with a single case and finds only $x = 4.8$.",
      "1": "Takes only $x = 3.6 + 1.2$ from (2), missing $2.4$.",
      "2": "Assumes two different-looking equations must pin down one common value, without testing both candidates.",
      "3": "Drops one case in each statement, leaving each with a single solution.",
    },
    numeric_check: null,
    check() {
      // enumerate x on an integer-tenths grid; question asks for a unique value
      const grid = [];
      for (let t = -300; t <= 300; t++) grid.push(t);
      const s1 = (t) => Math.abs(t - 12) === 2 * Math.abs(t - 30);
      const s2 = (t) => Math.abs(t - 36) === 12;
      const p1 = grid.filter(s1);
      const p2 = grid.filter(s2);
      const p12 = grid.filter((t) => s1(t) && s2(t));
      if (!p1.length || !p2.length || !p12.length) throw new Error("empty statement pool");
      const unique = (pool) => new Set(pool).size === 1;
      const suff1 = unique(p1);
      const suff2 = unique(p2);
      const suffBoth = unique(p12);
      let index;
      if (suff1 && suff2) index = 3;
      else if (suff1) index = 0;
      else if (suff2) index = 1;
      else if (suffBoth) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 9. D5 PS pure — coupled deviation budget (single L1 constraint)
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 5,
    stem_md:
      "If $|x - 2.5| + |y - 1.5| \\le 2$, what is the greatest possible value of $|x - y|$?",
    choices: ["$1$", "$2$", "$3$", "$4$", "$5$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite $x = 2.5 + a$ and $y = 1.5 + b$ with $|a| + |b| \\le 2$. Then $x - y = 1 + (a - b)$, and $|a - b| \\le |a| + |b| \\le 2$, so $x - y$ lies in $[-1,\\ 3]$. The absolute value is greatest at the right end: $|x - y| = 3$, achieved by spending the whole budget on $x$ in the positive direction, $x = 4.5$, $y = 1.5$.\n\n**Trigger cue**\n\nA single bound on a sum of absolute deviations is a shared budget — the deviations cannot both be maximal, unlike two separate interval constraints.\n\n**Takeaway**\n\nA shared deviation budget adds to the center gap.",
    fastest_path_md:
      "By the triangle inequality, $|x - y| \\le |x - 2.5| + |1.5 - y| + |2.5 - 1.5| \\le 2 + 1 = 3$, and $x = 4.5$, $y = 1.5$ attains it.",
    trap_map: {
      "0": "Evaluates only at the centers $x = 2.5$, $y = 1.5$, allowing no deviation.",
      "1": "Uses the deviation budget alone and drops the $1$-unit gap between the centers.",
      "3": "Gives each variable the whole budget of $2$ but forgets the center gap.",
      "4": "Reads the constraint as two independent bounds $|x - 2.5| \\le 2$ and $|y - 1.5| \\le 2$.",
    },
    numeric_check: "3",
    check() {
      // brute force in integer tenths: x = tx/10, y = ty/10
      let best = -Infinity;
      for (let tx = -100; tx <= 150; tx++) {
        for (let ty = -100; ty <= 150; ty++) {
          if (Math.abs(tx - 25) + Math.abs(ty - 15) <= 20) {
            const v = Math.abs(tx - ty);
            if (v > best) best = v;
          }
        }
      }
      return { kind: "value", value: best / 10 };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
