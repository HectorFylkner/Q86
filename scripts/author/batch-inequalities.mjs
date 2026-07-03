/**
 * Batch: 7 new "inequalities" items (equal_unequal_alg / algebra).
 * Cells: D3 PS pure ×2, D3 PS real, D4 PS pure, D4 DS pure, D5 PS pure ×2.
 * Run from repo root: node scripts/author/batch-inequalities.mjs
 * (dry run unless APPEND=1)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ── 1. D3 PS pure — integers in a compound linear inequality ──────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 3,
    stem_md:
      "How many integers $n$ satisfy $-4 \\le 3n + 5 < 20$?",
    choices: ["$4$", "$5$", "$7$", "$8$", "$9$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSubtract $5$ from all three parts: $-9 \\le 3n < 15$. Divide by $3$: $-3 \\le n < 5$. The integers are $-3, -2, \\dots, 4$, and there are $4 - (-3) + 1 = 8$ of them.\n\n**Trigger cue**\n\nA compound inequality with the unknown in the middle: operate on all three parts at once, then count endpoints carefully.\n\n**Takeaway**\n\nUndo operations across all three parts, then count integers inclusively.",
    fastest_path_md:
      "Only the boundaries matter: $n = -3$ gives $3n + 5 = -4$ (kept by $\\le$); $n = 5$ gives $20$ (excluded by $<$). Count $-3$ through $4$: $8$ integers.",
    trap_map: {
      "0": "Counts only the positive solutions $1$ through $4$.",
      "1": "Counts only the nonnegative solutions $0$ through $4$, dropping the negatives.",
      "2": "Drops $n = -3$ by treating the left-hand $\\le$ as strict.",
      "4": "Includes $n = 5$ by treating the right-hand $<$ as $\\le$.",
    },
    numeric_check: "8",
    check() {
      let count = 0;
      for (let n = -1000; n <= 1000; n++) {
        const v = 3 * n + 5;
        if (-4 <= v && v < 20) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // ── 2. D3 PS pure — least product over two intervals ──────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 3,
    stem_md:
      "If $-6 \\le a \\le 3$ and $-2 \\le b \\le 4$, what is the least possible value of $ab$?",
    choices: ["$-24$", "$-12$", "$-8$", "$-6$", "$12$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nA product of two bounded variables attains its extremes at endpoint pairs. The four candidates are $(-6)(-2) = 12$, $(-6)(4) = -24$, $(3)(-2) = -6$, and $(3)(4) = 12$. The least is $-24$.\n\n**Trigger cue**\n\nOptimizing a product over intervals that include negatives: check all four endpoint pairings — sign behavior makes intuition unreliable.\n\n**Takeaway**\n\nExtreme products come from testing all four endpoint pairs.",
    fastest_path_md:
      "The most negative product pairs opposite signs with the largest magnitudes: $-6$ and $4$ give $-24$; no other endpoint pair goes lower.",
    trap_map: {
      "1": "Attaches the negative sign to the wrong bound of $b$, computing $3 \\cdot (-4)$.",
      "2": "Multiplies $b$'s own two endpoints, $(-2)(4)$.",
      "3": "Pairs $a$'s maximum with $b$'s minimum, $(3)(-2)$, without testing the other cross pair.",
      "4": "Multiplies minimum by minimum, $(-6)(-2)$, assuming the least inputs give the least product.",
    },
    numeric_check: "-24",
    check() {
      let min = Infinity;
      for (let ai = -24; ai <= 12; ai++) {
        for (let bi = -8; bi <= 16; bi++) {
          const a = ai / 4;
          const b = bi / 4;
          const p = a * b;
          if (p < min) min = p;
        }
      }
      return { kind: "value", value: min };
    },
  },

  // ── 3. D3 PS real — least count to clear a profit threshold ───────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 3,
    stem_md:
      "A school club sells raffle tickets for $\\$7$ each and paid $\\$134$ to have the tickets printed. What is the least number of tickets the club must sell for its profit to be more than $\\$500$?",
    choices: ["$53$", "$72$", "$90$", "$91$", "$92$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nLet $n$ be the number of tickets sold. Profit is $7n - 134$, so require $7n - 134 > 500$, i.e. $7n > 634$, i.e. $n > \\dfrac{634}{7} = 90\\dfrac{4}{7}$. The least integer above this is $91$. Check: $7(91) - 134 = 503 > 500$.\n\n**Trigger cue**\n\nA \"least number needed to exceed\" question: build the strict inequality, solve for the boundary, then round up.\n\n**Takeaway**\n\nRound the boundary value in the direction the inequality demands.",
    fastest_path_md:
      "Backsolve at the boundary: $n = 90$ gives $630 - 134 = 496$ — not enough; $n = 91$ gives $637 - 134 = 503$ — done.",
    trap_map: {
      "0": "Subtracts the printing cost from the target, solving $7n > 500 - 134$.",
      "1": "Ignores the printing cost entirely, solving $7n > 500$.",
      "2": "Rounds $\\dfrac{634}{7} \\approx 90.6$ down instead of up.",
      "4": "Rounds up correctly to $91$, then adds one more ticket \"to be safe\" because the inequality is strict.",
    },
    numeric_check: "91",
    check() {
      for (let n = 0; n <= 10000; n++) {
        if (7 * n - 134 > 500) return { kind: "value", value: n };
      }
      throw new Error("no n found");
    },
  },

  // ── 4. D4 PS pure — full range of a quotient ──────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 4,
    stem_md:
      "If $2 < x < 7$ and $1 < y < 4$, which of the following describes all possible values of $\\dfrac{x}{y}$?",
    choices: [
      "$\\dfrac{1}{2} < \\dfrac{x}{y} < \\dfrac{7}{4}$",
      "$\\dfrac{7}{4} < \\dfrac{x}{y} < 2$",
      "$1 < \\dfrac{x}{y} < 7$",
      "$\\dfrac{1}{2} < \\dfrac{x}{y} < 7$",
      "$2 < \\dfrac{x}{y} < 7$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nAll quantities are positive, so $\\dfrac{x}{y}$ increases with $x$ and decreases with $y$. Largest values: $x$ near $7$ over $y$ near $1$, approaching $7$. Smallest values: $x$ near $2$ over $y$ near $4$, approaching $\\dfrac{2}{4} = \\dfrac{1}{2}$. Every original bound is strict, so neither extreme is attained: $\\dfrac{1}{2} < \\dfrac{x}{y} < 7$.\n\n**Trigger cue**\n\nRange of a quotient of bounded positive quantities: pair each numerator bound with the opposite denominator bound.\n\n**Takeaway**\n\nQuotient extremes pair numerator bounds with opposite denominator bounds.",
    fastest_path_md:
      "Biggest fraction = biggest top over smallest bottom: $\\dfrac{7}{1} = 7$. Smallest = smallest top over biggest bottom: $\\dfrac{2}{4} = \\dfrac{1}{2}$. Strict bounds stay strict.",
    trap_map: {
      "0": "Divides both of $x$'s bounds by $y$'s largest value, getting $\\dfrac{2}{4}$ and $\\dfrac{7}{4}$.",
      "1": "Pairs the bounds coordinate-wise — $\\dfrac{2}{1}$ and $\\dfrac{7}{4}$ — then lists them in increasing order.",
      "2": "Assumes the quotient must exceed $1$ because $x$'s bounds are larger than $y$'s.",
      "4": "Divides both of $x$'s bounds by $y$'s smallest value, getting $\\dfrac{2}{1}$ and $\\dfrac{7}{1}$.",
    },
    numeric_check: null,
    check() {
      // Brute-force the attainable set of x/y, then find the unique choice
      // whose region contains every sampled value.
      const preds = [
        (v) => v > 1 / 2 && v < 7 / 4,
        (v) => v > 7 / 4 && v < 2,
        (v) => v > 1 && v < 7,
        (v) => v > 1 / 2 && v < 7,
        (v) => v > 2 && v < 7,
      ];
      const samples = [];
      for (let xi = 41; xi <= 139; xi++) {
        for (let yi = 21; yi <= 79; yi++) {
          samples.push(xi / 20 / (yi / 20)); // x in (2,7), y in (1,4)
        }
      }
      if (samples.length < 1000) throw new Error("too few samples");
      const containing = [];
      preds.forEach((p, i) => {
        if (samples.every(p)) containing.push(i);
      });
      if (containing.length !== 1)
        throw new Error(`expected 1 containing choice, got ${containing}`);
      return { kind: "index", index: containing[0] };
    },
  },

  // ── 5. D4 DS pure — combining two linear inequalities ─────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 4,
    stem_md:
      "Is $3x + 5y > 19$?\n\n(1) $x + y > 5$\n\n(2) $x - y < 1$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n(1) alone: $(x, y) = (0, 6)$ gives $3x + 5y = 30$ — yes; $(x, y) = \\left(6, -\\tfrac{1}{2}\\right)$ gives $x + y = 5\\tfrac{1}{2} > 5$ but $3x + 5y = 15\\tfrac{1}{2}$ — no. Not sufficient. (2) alone: $(0, 6)$ gives yes; $(0, 0)$ gives no. Not sufficient. Together: $3x + 5y = 4(x + y) - (x - y)$. Statement (1) gives $4(x + y) > 20$ and statement (2) gives $-(x - y) > -1$; adding, $3x + 5y > 19$ — sufficient.\n\n**Trigger cue**\n\nA question about a linear combination of variables: try to build the target expression from the statements with positive multipliers before hunting for values.\n\n**Takeaway**\n\nCombine inequalities by adding positive multiples; never subtract or solve them like equations.",
    fastest_path_md:
      "Spot $3x + 5y = 4(x + y) - (x - y)$: four times (1) plus the reversed (2) gives $3x + 5y > 4(5) - 1 = 19$ exactly. Quick counterexamples like $\\left(6, -\\tfrac{1}{2}\\right)$ and $(0, 0)$ kill each statement alone.",
    trap_map: {
      "0": "Declares (1) sufficient after testing only balanced pairs, missing cases like $\\left(6, -\\tfrac{1}{2}\\right)$ where $x + y > 5$ but $3x + 5y = 15\\tfrac{1}{2}$.",
      "1": "Declares (2) sufficient even though $x - y < 1$ puts no floor under $x$ and $y$, e.g. $(0, 0)$ versus $(0, 6)$.",
      "3": "Confirms each statement with one convenient example instead of searching for a counterexample.",
      "4": "Tries to solve for $x$ and $y$ individually, finds no unique point, and concludes the inequalities cannot bound $3x + 5y$.",
    },
    numeric_check: null,
    check() {
      // Enumerate models on a grid; decide sufficiency by whether the
      // yes/no answer is uniform over each statement's model set.
      const models = [];
      for (let xi = -40; xi <= 40; xi++) {
        for (let yi = -40; yi <= 40; yi++) {
          const x = xi / 4;
          const y = yi / 4;
          models.push({
            s1: x + y > 5,
            s2: x - y < 1,
            ans: 3 * x + 5 * y > 19,
          });
        }
      }
      const sufficient = (filter) => {
        const ms = models.filter(filter);
        if (ms.length < 10) throw new Error("too few models for a statement");
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

  // ── 6. D5 PS pure — integer max of a product under a strict constraint ─
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 5,
    stem_md:
      "If $x$ and $y$ are positive integers such that $5x + 3y < 40$, what is the greatest possible value of $xy$?",
    choices: ["$11$", "$20$", "$24$", "$25$", "$26$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSince $x$ and $y$ are integers, $5x + 3y < 40$ means $5x + 3y \\le 39$, so $x$ runs from $1$ to $7$. For each $x$ the largest $y$ is $\\left\\lfloor \\dfrac{39 - 5x}{3} \\right\\rfloor$, giving pairs $(1, 11), (2, 9), (3, 8), (4, 6), (5, 4), (6, 3), (7, 1)$ with products $11, 18, 24, 24, 20, 18, 7$. The maximum is $24$.\n\n**Trigger cue**\n\nInteger optimization under a strict linear constraint: convert the strict inequality to its attainable $\\le$ bound, then scan the short feasible list.\n\n**Takeaway**\n\nWith integers, convert strict inequalities to attainable bounds first.",
    fastest_path_md:
      "Only $x = 1$ through $7$ are feasible; pair each with its biggest legal $y$ and compare the seven products — they peak at $24$ for $(3, 8)$ and $(4, 6)$.",
    trap_map: {
      "0": "Maximizes one variable alone, taking $x = 1$ and $y = 11$.",
      "1": "Greedily maxes out $x$ first: $x = 5$, $y = 4$ gives $20$.",
      "3": "Treats the strict $< 40$ as $\\le 40$, admitting $x = y = 5$ since $5(5) + 3(5) = 40$.",
      "4": "Optimizes over real numbers — maximum $\\dfrac{40^2}{60} = 26.\\overline{6}$ — then rounds down.",
    },
    numeric_check: "24",
    check() {
      let best = -Infinity;
      for (let x = 1; x <= 100; x++) {
        for (let y = 1; y <= 100; y++) {
          if (5 * x + 3 * y < 40 && x * y > best) best = x * y;
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ── 7. D5 PS pure — reciprocal of an interval straddling zero ─────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 5,
    stem_md:
      "If $-\\dfrac{1}{4} \\le x < \\dfrac{1}{5}$ and $x \\ne 0$, which of the following describes all possible values of $\\dfrac{1}{x}$?",
    choices: [
      "$-4 \\le \\dfrac{1}{x} < 5$",
      "$\\dfrac{1}{x} \\le -4$",
      "$\\dfrac{1}{x} > 5$",
      "$\\dfrac{1}{x} \\le -4$ or $\\dfrac{1}{x} > 5$",
      "$\\dfrac{1}{x} < -4$ or $\\dfrac{1}{x} \\ge 5$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSplit at zero, since reciprocation only preserves comparisons within one sign. For $-\\dfrac{1}{4} \\le x < 0$: reciprocals of same-sign numbers reverse order, so $\\dfrac{1}{x} \\le -4$, with equality at $x = -\\dfrac{1}{4}$ and values plunging to $-\\infty$ as $x \\to 0^-$. For $0 < x < \\dfrac{1}{5}$: $\\dfrac{1}{x} > 5$, unbounded above as $x \\to 0^+$. Union: $\\dfrac{1}{x} \\le -4$ or $\\dfrac{1}{x} > 5$.\n\n**Trigger cue**\n\nTaking reciprocals over an interval that contains zero: split into sign-pure pieces; never reciprocate the endpoints blindly.\n\n**Takeaway**\n\nReciprocating an interval straddling zero yields two unbounded rays.",
    fastest_path_md:
      "Probe values: $x = -\\dfrac{1}{4} \\Rightarrow -4$; $x = -\\dfrac{1}{100} \\Rightarrow -100$; $x = \\dfrac{1}{10} \\Rightarrow 10$. Only one choice contains all three, with $-4$ itself included.",
    trap_map: {
      "0": "Reciprocates the endpoints but keeps a single interval, ignoring the break at $x = 0$.",
      "1": "Uses only the negative values of $x$.",
      "2": "Uses only the positive values of $x$.",
      "4": "Attaches the equalities to the wrong endpoints: $x = -\\dfrac{1}{4}$ is attainable, so $-4$ must be included, while $5$ is not.",
    },
    numeric_check: null,
    check() {
      // Brute-force sample x over the stem's interval (exact rationals
      // k/400 so the endpoint x = -1/4 is hit exactly), compute 1/x, and
      // find the unique choice whose region contains every sample.
      const preds = [
        (v) => v >= -4 && v < 5,
        (v) => v <= -4,
        (v) => v > 5,
        (v) => v <= -4 || v > 5,
        (v) => v < -4 || v >= 5,
      ];
      const samples = [];
      for (let k = -100; k <= 79; k++) {
        if (k === 0) continue;
        samples.push(400 / k); // 1/x for x = k/400 in [-1/4, 1/5)
      }
      if (samples.length < 100) throw new Error("too few samples");
      const containing = [];
      preds.forEach((p, i) => {
        if (samples.every(p)) containing.push(i);
      });
      if (containing.length !== 1)
        throw new Error(`expected 1 containing choice, got ${containing}`);
      return { kind: "index", index: containing[0] };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
