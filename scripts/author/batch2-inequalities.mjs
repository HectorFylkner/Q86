/**
 * Batch 2: 11 new "inequalities" items (equal_unequal_alg / algebra).
 * Cells: D2 PS pure, D2 PS real, D3 PS pure ×3, D3 PS real, D4 PS pure ×2,
 *        D4 DS pure, D5 PS pure, D5 DS pure.
 * Coverage extensions vs. batch 1: quadratic-inequality integer counts,
 * absolute-value inequalities (single and summed), ordering powers on (0,1),
 * ordered-negatives must-be-true, denominator-sign traps, break-even plan
 * comparison, budget ceiling with a fixed first-unit fee, DS on x^3 vs x,
 * DS on the AM–GM equality case.
 * Run from repo root:
 *   node --experimental-strip-types scripts/author/batch2-inequalities.mjs
 * (dry run unless --append)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ── 1. D2 PS pure — greatest integer under a strict linear bound ───────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 2,
    stem_md: "What is the greatest integer $x$ for which $4x + 7 < 31$?",
    choices: ["$4$", "$5$", "$6$", "$7$", "$9$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nSubtract $7$: $4x < 24$. Divide by $4$: $x < 6$. The bound is strict, so $x = 6$ itself fails; the greatest integer strictly below $6$ is $5$. Check: $4(5) + 7 = 27 < 31$.\n\n**Trigger cue**\n\n\"Greatest integer\" with a strict inequality: solve for the boundary, then step just inside it.\n\n**Takeaway**\n\nA strict boundary excludes itself; take the nearest integer inside.",
    fastest_path_md:
      "Backsolve the boundary: $x = 6$ gives $4(6) + 7 = 31$, which is not less than $31$, so drop to $5$.",
    trap_map: {
      "0": "Steps one integer further inside than the strict inequality requires, discarding the valid $x = 5$.",
      "2": "Treats $<$ as $\\le$, accepting $x = 6$ even though $4(6) + 7 = 31$ exactly.",
      "3": "Ignores the $+7$, solving $4x < 31$ to get $x < 7.75$.",
      "4": "Adds $7$ to the right side instead of subtracting, solving $4x < 38$.",
    },
    numeric_check: "5",
    check() {
      let best = null;
      for (let x = -1000; x <= 1000; x++) {
        if (4 * x + 7 < 31) best = x; // ascending loop: last hit is the max
      }
      return { kind: "value", value: best };
    },
  },

  // ── 2. D2 PS real — greatest count under a budget with a first-unit fee ─
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 2,
    stem_md:
      "A parking garage charges \\$5.50 for the first hour and \\$3 for each additional hour. If a customer parks for a whole number of hours, what is the greatest number of hours of parking for which the total charge is at most \\$26?",
    choices: ["$5$", "$6$", "$7$", "$8$", "$9$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFor $h$ hours the charge is $5.50 + 3(h - 1)$. Require $5.50 + 3(h - 1) \\le 26$, so $3(h - 1) \\le 20.50$, giving $h - 1 \\le 6\\tfrac{5}{6}$. Since $h - 1$ is a whole number, $h - 1 \\le 6$, so $h \\le 7$. Check: $5.50 + 3(6) = 23.50 \\le 26$, while $8$ hours cost $26.50$.\n\n**Trigger cue**\n\nGreatest count under a spending cap with a differently priced first unit: subtract the fixed part, divide, round down, restore the first unit.\n\n**Takeaway**\n\nUnder a ceiling round down; then add back the separately priced first unit.",
    fastest_path_md:
      "Money left after the first hour: $26 - 5.50 = 20.50$, which buys $6$ full extra hours ($18$); $1 + 6 = 7$.",
    trap_map: {
      "0": "Subtracts the \\$5.50 first-hour charge twice before dividing by \\$3.",
      "1": "Finds the $6$ additional hours but forgets to add the first hour back.",
      "3": "Rounds $20.50/3 \\approx 6.8$ up to $7$ additional hours — overshooting the cap — before adding the first hour.",
      "4": "Divides the entire \\$26 by \\$3, ignoring the pricier first hour, then adds the first hour on top.",
    },
    numeric_check: "7",
    check() {
      let best = null;
      for (let h = 1; h <= 1000; h++) {
        const cents = 550 + 300 * (h - 1);
        if (cents <= 2600) best = h;
      }
      return { kind: "value", value: best };
    },
  },

  // ── 3. D3 PS pure — integer count for a quadratic inequality ───────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 3,
    stem_md: "How many integers $n$ satisfy $n^2 < 8n - 12$?",
    choices: ["$2$", "$3$", "$4$", "$5$", "$7$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nBring everything to one side: $n^2 - 8n + 12 < 0$, which factors as $(n - 2)(n - 6) < 0$. An upward-opening parabola is negative strictly between its roots, so $2 < n < 6$. The integers are $3, 4, 5$ — three of them.\n\n**Trigger cue**\n\nA squared term compared with a linear expression: move everything to one side, factor, and read the sign between the roots.\n\n**Takeaway**\n\nAn upward parabola is negative strictly between its roots.",
    fastest_path_md:
      "Roots $2$ and $6$ jump out (sum $8$, product $12$); strictly between them sit exactly $3, 4, 5$.",
    trap_map: {
      "0": "Counts the integers from $3$ to $5$ as $5 - 3 = 2$, a fence-post error.",
      "2": "Reports $6 - 2 = 4$, the width of the interval, instead of counting its interior integers.",
      "3": "Includes the roots $2$ and $6$, treating the strict inequality as $\\le$.",
      "4": "Drops the $-12$, solving $n^2 < 8n$ to get $0 < n < 8$.",
    },
    numeric_check: "3",
    check() {
      let count = 0;
      for (let n = -1000; n <= 1000; n++) {
        if (n * n < 8 * n - 12) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // ── 4. D3 PS pure — must-be-true for ordered negatives ─────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 3,
    stem_md: "If $a < b < 0$, which of the following must be true?",
    choices: [
      "$a^2 < b^2$",
      "$\\dfrac{1}{a} < \\dfrac{1}{b}$",
      "$ab < b^2$",
      "$a + b < ab$",
      "$a^2 < ab$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nBoth numbers are negative, so $a + b < 0$ while $ab > 0$; hence $a + b < ab$ always. The others all fail: $a$ has the larger magnitude, so $a^2 > b^2$; reciprocals of same-sign numbers reverse order, so $\\dfrac{1}{a} > \\dfrac{1}{b}$; multiplying $a < b$ by the negative $b$ flips to $ab > b^2$; multiplying by the negative $a$ flips to $a^2 > ab$.\n\n**Trigger cue**\n\nOrdered negative variables in a must-be-true: any step that multiplies or reciprocates flips the order — only sign facts survive.\n\n**Takeaway**\n\nTwo negatives: the sum stays negative, the product turns positive.",
    fastest_path_md:
      "A negative plus a negative is negative; a negative times a negative is positive — so $a + b < ab$ with no computation. One pair like $a = -3$, $b = -1$ eliminates every other choice.",
    trap_map: {
      "0": "Assumes squaring preserves the order, though $a$ has the larger magnitude.",
      "1": "Keeps the direction when reciprocating, but same-sign reciprocals reverse it.",
      "2": "Multiplies $a < b$ by $b$ without flipping the inequality, though $b < 0$.",
      "4": "Multiplies $a < b$ by $a$ without flipping the inequality, though $a < 0$.",
    },
    numeric_check: null,
    check() {
      // Enumerate ordered negative pairs on a quarter-integer grid and find
      // the unique choice whose predicate holds for every pair.
      const preds = [
        (a, b) => a * a < b * b,
        (a, b) => 1 / a < 1 / b,
        (a, b) => a * b < b * b,
        (a, b) => a + b < a * b,
        (a, b) => a * a < a * b,
      ];
      const pairs = [];
      for (let i = -40; i <= -2; i++) {
        for (let j = i + 1; j <= -1; j++) {
          pairs.push([i / 4, j / 4]); // a < b < 0
        }
      }
      if (pairs.length < 100) throw new Error("too few pairs");
      const holding = [];
      preds.forEach((p, idx) => {
        if (pairs.every(([a, b]) => p(a, b))) holding.push(idx);
      });
      if (holding.length !== 1)
        throw new Error(`expected 1 always-true choice, got ${holding}`);
      return { kind: "index", index: holding[0] };
    },
  },

  // ── 5. D3 PS real — break-even between two linear plans ────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 3,
    stem_md:
      "A phone carrier offers two plans. Plan A has no monthly fee and charges \\$0.25 per minute of use. Plan B has a monthly fee of \\$14.95 and charges \\$0.10 per minute of use. What is the least whole number of minutes of monthly use for which Plan B costs less than Plan A?",
    choices: ["$60$", "$99$", "$100$", "$101$", "$150$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFor $m$ minutes, Plan B beats Plan A when $14.95 + 0.10m < 0.25m$, i.e. $14.95 < 0.15m$, i.e. $m > 99\\tfrac{2}{3}$. The least whole number of minutes is $100$. Check: at $m = 100$, Plan B costs $\\$24.95$ against Plan A's $\\$25.00$; at $m = 99$, $\\$24.85$ against $\\$24.75$ — Plan A still wins.\n\n**Trigger cue**\n\nTwo linear cost plans with a \"for how many units is one cheaper\" ask: set the fee against the per-unit savings, then round in the required direction.\n\n**Takeaway**\n\nBreak-even is fee divided by per-unit savings; round past it.",
    fastest_path_md:
      "Plan B saves $15$ cents a minute but costs \\$14.95 up front: $1495/15 = 99\\tfrac{2}{3}$, so $100$ minutes.",
    trap_map: {
      "0": "Divides the fee by Plan A's full rate, $14.95/0.25$, ignoring Plan B's own per-minute charge.",
      "1": "Rounds the break-even $99\\tfrac{2}{3}$ down instead of up.",
      "3": "Rounds up correctly to $100$, then adds one more minute \"for safety\" because the inequality is strict.",
      "4": "Divides the fee by Plan B's own rate, $14.95/0.10$, instead of by the savings per minute.",
    },
    numeric_check: "100",
    check() {
      for (let m = 1; m <= 100000; m++) {
        // work in cents to keep the arithmetic exact
        if (1495 + 10 * m < 25 * m) return { kind: "value", value: m };
      }
      throw new Error("no break-even found");
    },
  },

  // ── 6. D3 PS pure — ordering powers and reciprocal on (0, 1) ───────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 3,
    stem_md:
      "If $0 < x < 1$, which of the following lists $x^3$, $x$, and $\\dfrac{1}{x}$ in order from least to greatest?",
    choices: [
      "$x < x^3 < \\dfrac{1}{x}$",
      "$\\dfrac{1}{x} < x < x^3$",
      "$x^3 < x < \\dfrac{1}{x}$",
      "$x^3 < \\dfrac{1}{x} < x$",
      "$x < \\dfrac{1}{x} < x^3$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSince $0 < x < 1$, we have $x^2 < 1$; multiplying by the positive $x$ gives $x^3 < x$. Also $x < 1$ with $x > 0$ gives $\\dfrac{1}{x} > 1 > x$. Chaining: $x^3 < x < \\dfrac{1}{x}$.\n\n**Trigger cue**\n\nPowers and reciprocals of a variable pinned in $(0,1)$: higher powers shrink, reciprocals jump above $1$.\n\n**Takeaway**\n\nBetween $0$ and $1$, powers shrink and reciprocals exceed $1$.",
    fastest_path_md:
      "Test $x = \\dfrac{1}{2}$: the three values are $\\dfrac{1}{8}$, $\\dfrac{1}{2}$, and $2$ — only one listed order matches.",
    trap_map: {
      "0": "Believes cubing increases any positive number, though it shrinks numbers between $0$ and $1$.",
      "1": "Applies the ordering that holds for $x > 1$, where $\\dfrac{1}{x} < x < x^3$.",
      "3": "Also shrinks $x$ by reciprocation, placing $\\dfrac{1}{x}$ below $x$ even though $\\dfrac{1}{x} > 1$.",
      "4": "Puts $\\dfrac{1}{x}$ above $x$ correctly but lets the cube dominate everything, as if powers always grow.",
    },
    numeric_check: null,
    check() {
      // Sample x across (0,1), compute the triple, and find the unique
      // ordering that holds at every sample.
      const preds = [
        ([c, x, r]) => x < c && c < r,
        ([c, x, r]) => r < x && x < c,
        ([c, x, r]) => c < x && x < r,
        ([c, x, r]) => c < r && r < x,
        ([c, x, r]) => x < r && r < c,
      ];
      const samples = [];
      for (let k = 1; k <= 99; k++) {
        const x = k / 100;
        samples.push([x ** 3, x, 1 / x]);
      }
      const holding = [];
      preds.forEach((p, i) => {
        if (samples.every(p)) holding.push(i);
      });
      if (holding.length !== 1)
        throw new Error(`expected 1 valid ordering, got ${holding}`);
      return { kind: "index", index: holding[0] };
    },
  },

  // ── 7. D4 PS pure — variable in the denominator, sign trap ─────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 4,
    stem_md: "How many integers $n$ satisfy $\\dfrac{1}{n - 2} \\ge \\dfrac{1}{6}$?",
    choices: ["$5$", "$6$", "$7$", "$8$", "Infinitely many"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe left side must be at least $\\dfrac{1}{6} > 0$, which forces $n - 2 > 0$. For positive denominators, $\\dfrac{1}{n-2} \\ge \\dfrac{1}{6}$ holds exactly when $n - 2 \\le 6$. So $0 < n - 2 \\le 6$, i.e. $3 \\le n \\le 8$: six integers. Any $n < 2$ makes the left side negative, and $n = 2$ is excluded outright.\n\n**Trigger cue**\n\nAn inequality with the variable in a denominator: split by the denominator's sign before clearing it — cross-multiplying blindly is the planted error.\n\n**Takeaway**\n\nNever cross-multiply by an expression whose sign is unknown.",
    fastest_path_md:
      "The fraction can only reach $\\dfrac{1}{6}$ if $n - 2$ is a positive number at most $6$, so $n - 2 \\in \\{1, \\dots, 6\\}$: six integers.",
    trap_map: {
      "0": "Treats $\\ge$ as strict, dropping $n = 8$, where equality holds.",
      "2": "Solves $2 \\le n \\le 8$, including $n = 2$, where the expression is undefined.",
      "3": "Cross-multiplies to $n \\le 8$ and assumes $n$ must be positive, counting $1$ through $8$.",
      "4": "Cross-multiplies by $n - 2$ without checking its sign, getting $n \\le 8$ for every integer.",
    },
    numeric_check: "6",
    check() {
      let count = 0;
      for (let n = -100000; n <= 100000; n++) {
        if (n === 2) continue;
        if (1 / (n - 2) >= 1 / 6) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // ── 8. D4 DS pure — is x^3 > x? ────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 4,
    stem_md: "Is $x^3 > x$?\n\n(1) $x > 1$\n\n(2) $x^2 > 1$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nWrite $x^3 - x = x(x - 1)(x + 1)$, which is positive exactly on $-1 < x < 0$ or $x > 1$. (1) $x > 1$: all three factors are positive, so $x^3 > x$ — sufficient. (2) $x^2 > 1$ means $x > 1$ or $x < -1$: $x = 2$ gives $8 > 2$ (yes), but $x = -2$ gives $-8 < -2$ (no) — not sufficient. Answer: statement (1) alone.\n\n**Trigger cue**\n\nComparing $x^3$ with $x$: factor the difference and read signs region by region — never divide both sides by $x$.\n\n**Takeaway**\n\n$x^3 - x$ changes sign at $-1$, $0$, and $1$.",
    fastest_path_md:
      "Sign-chart $x(x-1)(x+1)$: (1) pins $x$ in the rightmost, all-positive region — sufficient. (2) also allows the region $x < -1$, where the product is negative — one test value, $x = -2$, kills it.",
    trap_map: {
      "1": "Credits (2) after testing only positive values such as $x = 2$, missing $x = -2$, where $x^3 = -8 < -2$.",
      "2": "Distrusts (1) alone and reaches for both statements, though $x > 1$ already forces $x^3 = x \\cdot x^2 > x$.",
      "3": "Reads $x^2 > 1$ as $x > 1$, dropping the branch $x < -1$.",
      "4": "Expects a specific value of $x$ and treats the yes/no question as unanswerable without one.",
    },
    numeric_check: null,
    check() {
      // Enumerate x on a quarter grid; decide sufficiency by uniformity of
      // the yes/no answer over each statement's model set.
      const models = [];
      for (let k = -60; k <= 60; k++) {
        const x = k / 4;
        models.push({ s1: x > 1, s2: x * x > 1, ans: x ** 3 > x });
      }
      const sufficient = (filter) => {
        const ms = models.filter(filter);
        if (ms.length < 5) throw new Error("too few models for a statement");
        const yes = ms.filter((m) => m.ans).length;
        return yes === 0 || yes === ms.length;
      };
      const s1 = sufficient((m) => m.s1);
      const s2 = sufficient((m) => m.s2);
      const both = sufficient((m) => m.s1 && m.s2);
      let index;
      if (s1 && s2) index = 3;
      else if (s1) index = 0;
      else if (s2) index = 1;
      else if (both) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // ── 9. D4 PS pure — sum of two absolute values as distance ─────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 4,
    stem_md: "How many integers $x$ satisfy $|x - 4| + |x + 3| < 9$?",
    choices: ["$6$", "$7$", "$8$", "$9$", "$10$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nRead $|x - 4| + |x + 3|$ as the total distance from $x$ to the anchors $4$ and $-3$. For $-3 \\le x \\le 4$ the sum is the anchor gap, $7$, which already beats $9$. Moving $t$ units beyond either anchor adds $2t$, so the sum reaches $9$ exactly one unit outside each anchor: solutions are $-4 < x < 5$. The integers are $-3, -2, \\dots, 4$ — eight of them.\n\n**Trigger cue**\n\nA sum of two absolute values compared with a constant: read it as total distance to two anchor points instead of opening cases.\n\n**Takeaway**\n\nDistance sums are constant between anchors, growing by $2$ per unit outside.",
    fastest_path_md:
      "Anchor gap is $7 < 9$, so everything from $-3$ to $4$ works, and the slack $9 - 7 = 2$ buys one extra unit on each side — but no new integer strictly inside $(-4, -3)$ or $(4, 5)$. Count $-3$ through $4$: eight.",
    trap_map: {
      "0": "Excludes the anchor points $x = -3$ and $x = 4$, where one absolute-value term is zero but the sum is only $7$.",
      "1": "Reports the distance between the anchors — the constant sum $7$ — instead of counting solutions.",
      "3": "Admits one boundary value, $x = -4$ or $x = 5$, where the sum equals $9$ exactly.",
      "4": "Treats the derived bounds $-4 < x < 5$ as inclusive on both ends.",
    },
    numeric_check: "8",
    check() {
      let count = 0;
      for (let x = -1000; x <= 1000; x++) {
        if (Math.abs(x - 4) + Math.abs(x + 3) < 9) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // ── 10. D5 PS pure — intersecting a quadratic and an absolute value ────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 5,
    stem_md:
      "How many integers $x$ satisfy both $x^2 - 5x - 24 < 0$ and $|x - 1| > 3$?",
    choices: ["$2$", "$3$", "$4$", "$5$", "$10$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nFactor the quadratic: $(x - 8)(x + 3) < 0$, so $-3 < x < 8$. The absolute value gives $x - 1 > 3$ or $x - 1 < -3$, i.e. $x > 4$ or $x < -2$. Intersect: $-3 < x < -2$ contains no integer, and $4 < x < 8$ contains $5, 6, 7$. Count: $3$.\n\n**Trigger cue**\n\nTwo simultaneous conditions — a quadratic and an absolute value: solve each to intervals, intersect, and only then count integers, checking every endpoint.\n\n**Takeaway**\n\nIntersect the solution intervals first; count integers last, endpoint by endpoint.",
    fastest_path_md:
      "The quadratic pens $x$ strictly between $-3$ and $8$; inside that pen $|x - 1| > 3$ keeps only $5, 6, 7$, since the other branch $x < -2$ traps no integer there.",
    trap_map: {
      "0": "Counts the integers from $5$ to $7$ as $7 - 5 = 2$, a fence-post error.",
      "2": "Relaxes the quadratic to $\\le 0$, admitting $x = 8$.",
      "3": "Relaxes $|x - 1| > 3$ to $\\ge 3$, admitting $x = -2$ and $x = 4$.",
      "4": "Drops the absolute-value condition entirely and counts every integer with $-3 < x < 8$.",
    },
    numeric_check: "3",
    check() {
      let count = 0;
      for (let x = -1000; x <= 1000; x++) {
        if (x * x - 5 * x - 24 < 0 && Math.abs(x - 1) > 3) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // ── 11. D5 DS pure — AM–GM with the equality case as the crux ──────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 5,
    stem_md:
      "If $x \\ne 0$, is $x + \\dfrac{1}{x} > 2$?\n\n(1) $x > 0$\n\n(2) $x \\ne 1$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite $x + \\dfrac{1}{x} - 2 = \\dfrac{(x-1)^2}{x}$. (1) alone: for $x > 0$ the expression is $\\ge 0$, but $x = 1$ gives exactly $2$ (answer no) while $x = 2$ gives $2.5$ (answer yes) — not sufficient. (2) alone: $x = 2$ gives yes, but $x = -1$ gives $-2$ — not sufficient. Together: $x > 0$ and $x \\ne 1$ make $\\dfrac{(x-1)^2}{x}$ strictly positive, so $x + \\dfrac{1}{x} > 2$ — sufficient.\n\n**Trigger cue**\n\n$x + \\dfrac{1}{x}$ compared with $2$: reach for AM–GM or the identity $\\dfrac{(x-1)^2}{x}$, then hunt the equality case.\n\n**Takeaway**\n\nAM–GM needs positivity, and its equality case can flip a yes/no.",
    fastest_path_md:
      "The gap $x + \\dfrac{1}{x} - 2 = \\dfrac{(x-1)^2}{x}$ is positive exactly when $x > 0$ and $x \\ne 1$; each statement supplies exactly one of those two conditions, so only together do they settle it.",
    trap_map: {
      "0": "Applies AM–GM to (1) and answers yes, overlooking that equality at $x = 1$ makes the answer no.",
      "1": "Sees (2) exclude the equality case but forgets negative $x$, where $x + 1/x \\le -2$.",
      "3": "Combines both oversights, crediting each statement alone.",
      "4": "Expects a numeric value of $x$ and gives up, missing that the two constraints together force the strict bound.",
    },
    numeric_check: null,
    check() {
      // Enumerate x on an eighth grid (so x = 1 is hit exactly); decide
      // sufficiency by uniformity of the answer over each model set.
      const models = [];
      for (let k = -80; k <= 80; k++) {
        if (k === 0) continue;
        const x = k / 8;
        models.push({ s1: x > 0, s2: x !== 1, ans: x + 1 / x > 2 });
      }
      const sufficient = (filter) => {
        const ms = models.filter(filter);
        if (ms.length < 5) throw new Error("too few models for a statement");
        const yes = ms.filter((m) => m.ans).length;
        return yes === 0 || yes === ms.length;
      };
      const s1 = sufficient((m) => m.s1);
      const s2 = sufficient((m) => m.s2);
      const both = sufficient((m) => m.s1 && m.s2);
      let index;
      if (s1 && s2) index = 3;
      else if (s1) index = 0;
      else if (s2) index = 1;
      else if (both) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
