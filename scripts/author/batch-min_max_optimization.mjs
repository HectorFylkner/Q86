/**
 * Batch: 7 new min_max_optimization items (equal_unequal_alg / algebra).
 * Cells: D2 PS real, D2 PS real, D2 PS pure, D3 DS pure, D3 PS real,
 *        D3 DS pure, D5 PS real.
 * Run from repo root: node scripts/author/batch-min_max_optimization.mjs
 * (dry run unless APPEND=1)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

/**
 * DS helper: given a full model list plus statement predicates and an
 * answer function (number for value questions, boolean for yes/no),
 * derive the canonical sufficiency index by enumeration.
 */
function dsSufficiencyIndex(models, s1, s2, answerOf) {
  const m1 = models.filter(s1);
  const m2 = models.filter(s2);
  const m12 = models.filter((m) => s1(m) && s2(m));
  if (m1.length < 3 || m2.length < 3 || m12.length < 1) {
    throw new Error(`too few models: s1=${m1.length} s2=${m2.length} both=${m12.length}`);
  }
  const determined = (set) =>
    new Set(set.map((m) => JSON.stringify(answerOf(m)))).size === 1;
  const d1 = determined(m1);
  const d2 = determined(m2);
  const d12 = determined(m12);
  if (d1 && d2) return 3;
  if (d1) return 0;
  if (d2) return 1;
  if (d12) return 2;
  return 4;
}

/** Enumerate nondecreasing integer tuples of given length in [lo, hi] with a fixed sum. */
function nondecreasingTuples(length, lo, hi, sum) {
  const out = [];
  const rec = (prefix, minVal, remaining, slots) => {
    if (slots === 0) {
      if (remaining === 0) out.push([...prefix]);
      return;
    }
    for (let v = minVal; v <= hi; v++) {
      const rest = remaining - v;
      if (rest < v * (slots - 1)) break; // later slots must each be >= v
      if (rest > hi * (slots - 1)) continue;
      prefix.push(v);
      rec(prefix, v, rest, slots - 1);
      prefix.pop();
    }
  };
  rec([], lo, sum, length);
  return out;
}

const items = [
  // ── 1. D2 PS real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 2,
    stem_md:
      "A community theater sells adult tickets for $\\$12$ each and child tickets for $\\$7$ each. A group buys exactly $9$ tickets, including at least $2$ adult tickets and at least $3$ child tickets. What is the least possible total amount, in dollars, that the group pays for the tickets?",
    choices: ["$45$", "$63$", "$73$", "$78$", "$93$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $a$ be the number of adult tickets, so the child count is $9 - a$ with $2 \\le a \\le 6$. The cost is $12a + 7(9 - a) = 63 + 5a$, which increases with $a$, so take $a = 2$: the cost is $63 + 10 = 73$.\n\n**Trigger cue**\n\nA fixed group size, two prices, and per-type minimums: push the count toward the cheaper type.\n\n**Takeaway**\n\nTo minimize cost, load the count onto the cheapest allowed option.",
    fastest_path_md:
      "Child tickets are cheaper, so buy only the forced $2$ adult tickets and make the other $7$ child tickets: $2 \\cdot 12 + 7 \\cdot 7 = 24 + 49 = 73$.",
    trap_map: {
      "0": "Prices only the required $2$ adult and $3$ child tickets, ignoring the other $4$ tickets.",
      "1": "Buys all $9$ tickets as child tickets, violating the adult minimum.",
      "3": "Swaps the minimums, buying $3$ adult and $6$ child tickets.",
      "4": "Maximizes instead of minimizes, filling the remaining tickets with adult tickets.",
    },
    numeric_check: "2*12 + 7*7",
    check() {
      let best = Infinity;
      for (let a = 0; a <= 9; a++) {
        const c = 9 - a;
        if (a < 2 || c < 3) continue;
        best = Math.min(best, 12 * a + 7 * c);
      }
      return { kind: "value", value: best };
    },
  },

  // ── 2. D2 PS real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 2,
    stem_md:
      "An online tutoring platform charges each new tutor a one-time registration fee of $\\$35$ and pays $\\$18$ per completed session. What is the least number of sessions a new tutor must complete so that her total pay, after the registration fee is deducted, is at least $\\$400$?",
    choices: ["$22$", "$23$", "$24$", "$25$", "$26$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nLet $n$ be the number of sessions. Require $18n - 35 \\ge 400$, so $18n \\ge 435$ and $n \\ge 24.1\\overline{6}$. The least integer satisfying this is $n = 25$.\n\n**Trigger cue**\n\nA \"least number needed to reach a target\" with a fixed deduction: set up a linear inequality and round up.\n\n**Takeaway**\n\nSolve the inequality, then round up to the next whole unit.",
    fastest_path_md:
      "Test the boundary: $18 \\cdot 24 - 35 = 397$, just short of $400$; one more session gives $415$. Answer $25$.",
    trap_map: {
      "0": "Divides $400$ by $18$ and rounds down, ignoring the fee entirely.",
      "1": "Divides $400$ by $18$ and rounds up, forgetting the $\\$35$ fee.",
      "2": "Rounds $435/18 \\approx 24.2$ down, leaving the tutor $\\$3$ short of the goal.",
      "4": "Adds an unnecessary extra session after correctly rounding up to $25$.",
    },
    numeric_check: "ceil((400 + 35)/18)",
    check() {
      for (let n = 1; n <= 1000; n++) {
        if (18 * n - 35 >= 400) return { kind: "value", value: n };
      }
      throw new Error("no solution found");
    },
  },

  // ── 3. D2 PS pure ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 2,
    stem_md:
      "If $2 \\le a \\le 7$ and $-4 \\le b \\le 3$, what is the least possible value of $ab$?",
    choices: ["$-28$", "$-12$", "$-8$", "$6$", "$21$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nFor a fixed $b$, the product $ab$ is linear in $a$, so its extremes occur at $a \\in \\{2, 7\\}$; likewise $b \\in \\{-4, 3\\}$. The four corner products are $2(-4) = -8$, $7(-4) = -28$, $2(3) = 6$, and $7(3) = 21$. The least is $-28$.\n\n**Trigger cue**\n\nMin or max of a product of variables confined to intervals: evaluate every endpoint pair.\n\n**Takeaway**\n\nProducts over intervals take extreme values at endpoint pairs.",
    fastest_path_md:
      "The most negative product pairs the largest positive value with the most negative one: $7 \\cdot (-4) = -28$.",
    trap_map: {
      "1": "Multiplies the two bounds of $b$'s own interval, $-4 \\cdot 3$.",
      "2": "Pairs the least $a$ with the least $b$: $2 \\cdot (-4) = -8$.",
      "3": "Assumes the least product comes from the least positive values, $2 \\cdot 3 = 6$.",
      "4": "Computes the greatest possible value, $7 \\cdot 3 = 21$, instead of the least.",
    },
    numeric_check: "7*(-4)",
    check() {
      let best = Infinity;
      for (let a = 2; a <= 7; a += 0.25) {
        for (let b = -4; b <= 3; b += 0.25) {
          best = Math.min(best, a * b);
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ── 4. D3 DS pure ────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 3,
    stem_md:
      "A list consists of five integers whose sum is $60$. Is the greatest integer in the list at least $15$?\n\n(1) The least integer in the list is $4$.\n\n(2) Every integer in the list is less than $15$.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nStatement (2): every integer is less than $15$, so the greatest is at most $14$ — a definite No. Sufficient. Statement (1): the other four integers sum to $56$. The list $4, 14, 14, 14, 14$ answers No, while $4, 4, 4, 4, 44$ answers Yes. Not sufficient. Answer: statement (2) alone.\n\n**Trigger cue**\n\nA yes/no question about a list's greatest value under a sum constraint: test extreme allocations for each statement.\n\n**Takeaway**\n\nA guaranteed no settles a yes/no question.",
    fastest_path_md:
      "(2) caps every entry below $15$, so the answer is a definite No — sufficient. For (1), compare $4, 14, 14, 14, 14$ with $4, 4, 4, 4, 44$: both legal, different answers.",
    trap_map: {
      "0": "Assumes the least value $4$ forces one of the remaining four (summing to $56$) up to $15$, overrating the pigeonhole bound of $14$.",
      "2": "Combines the statements without noticing that (2) alone already forces a definite No.",
      "3": "Credits (1) with sufficiency by rounding the average $56/4 = 14$ up to $15$.",
      "4": "Treats the definite No from (2) as a failure to answer rather than as sufficiency.",
    },
    numeric_check: null,
    check() {
      const models = nondecreasingTuples(5, -10, 70, 60);
      const idx = dsSufficiencyIndex(
        models,
        (m) => Math.min(...m) === 4,
        (m) => Math.max(...m) < 15,
        (m) => Math.max(...m) >= 15,
      );
      return { kind: "index", index: idx };
    },
  },

  // ── 5. D3 PS real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 3,
    stem_md:
      "A carpenter has $60$ board-feet of lumber. Each chair requires $4$ board-feet and each table requires $9$ board-feet. If the carpenter must build at least $3$ chairs and at least $2$ tables, what is the greatest total number of chairs and tables he can build?",
    choices: ["$10$", "$11$", "$12$", "$13$", "$15$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nMaximize $c + t$ subject to $4c + 9t \\le 60$, $c \\ge 3$, $t \\ge 2$. Chairs use fewer board-feet per piece, so hold tables at the minimum $t = 2$: then $4c \\le 60 - 18 = 42$, giving $c \\le 10$. The total is $10 + 2 = 12$. Every additional table consumes lumber worth more than two chairs, so the count only drops.\n\n**Trigger cue**\n\nMaximizing a count under one resource cap: satisfy the costly minimums, then spend everything on the cheapest item.\n\n**Takeaway**\n\nMeet expensive requirements minimally, then maximize the cheap item.\n",
    fastest_path_md:
      "Hold tables at $2$: $60 - 18 = 42$ board-feet buys $\\lfloor 42/4 \\rfloor = 10$ chairs, so $10 + 2 = 12$ pieces.",
    trap_map: {
      "0": "Insists all $60$ board-feet be used exactly, building $6$ chairs and $4$ tables.",
      "1": "Builds $3$ tables instead of the minimum $2$, leaving lumber for only $8$ chairs.",
      "3": "Rounds $42/4 = 10.5$ up to $11$ chairs, exceeding the available lumber.",
      "4": "Ignores the required tables and converts all $60$ board-feet into chairs.",
    },
    numeric_check: "floor((60 - 2*9)/4) + 2",
    check() {
      let best = -Infinity;
      for (let c = 0; c <= 20; c++) {
        for (let t = 0; t <= 10; t++) {
          if (c >= 3 && t >= 2 && 4 * c + 9 * t <= 60) {
            best = Math.max(best, c + t);
          }
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ── 6. D3 DS pure ────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 3,
    stem_md:
      "If $x$ and $y$ are numbers, is $xy \\le 49$?\n\n(1) $x + y = 14$\n\n(2) $x - y = 4$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nStatement (1): with $x + y = 14$, we get $xy = x(14 - x) = 49 - (x - 7)^2 \\le 49$, so the answer is always Yes. Sufficient. Statement (2): $x = 9, y = 5$ gives $xy = 45$ (Yes), while $x = 12, y = 8$ gives $xy = 96$ (No). Not sufficient. Answer: statement (1) alone.\n\n**Trigger cue**\n\nA product bound when the sum is fixed: complete the square or recall the equal-split maximum.\n\n**Takeaway**\n\nA fixed sum caps the product at the equal split.",
    fastest_path_md:
      "A fixed sum of $14$ caps the product at $7 \\cdot 7 = 49$, so (1) forces Yes. For (2), test $(9, 5)$ and $(12, 8)$ — different answers.",
    trap_map: {
      "1": "Tests only modest pairs for (2), such as $(9, 5)$, and never a large pair like $(12, 8)$.",
      "2": "Insists the individual values of $x$ and $y$ are needed, missing that (1) bounds the product by itself.",
      "3": "Assumes each linear relation pins down $xy$ well enough to compare with $49$.",
      "4": "Believes a yes/no product question requires the exact value of $xy$, which neither statement gives.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let i = -60; i <= 60; i++) {
        for (let j = -60; j <= 60; j++) {
          models.push([i / 2, j / 2]);
        }
      }
      const idx = dsSufficiencyIndex(
        models,
        ([x, y]) => x + y === 14,
        ([x, y]) => x - y === 4,
        ([x, y]) => x * y <= 49,
      );
      return { kind: "index", index: idx };
    },
  },

  // ── 7. D5 PS real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 5,
    stem_md:
      "A manager must assign exactly $40$ shifts among $7$ employees. Each employee must be assigned at least $4$ shifts, and no employee may be assigned more than twice as many shifts as any other employee. What is the greatest number of shifts that can be assigned to any one employee?",
    choices: ["$8$", "$10$", "$11$", "$12$", "$16$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLet $L$ be the fewest shifts any employee receives, so everyone has between $L$ and $2L$ shifts. If the top employee gets $M$, the other six get at least $L$ each, so $M \\le 40 - 6L$; the ratio rule adds $M \\le 2L$. The first bound falls as $L$ grows while the second rises, so the best $L$ balances them: $2L = 40 - 6L$ gives $L = 5$ and $M = 10$. The assignment $5, 5, 5, 5, 5, 5, 10$ uses all $40$ shifts and obeys every rule; $M = 11$ would need $L \\ge 6$, but $6 \\cdot 6 + 11 = 47 > 40$.\n\n**Trigger cue**\n\nA fixed total with a cap tying the largest share to the smallest: give everyone else the same low amount and balance the two bounds.\n\n**Takeaway**\n\nA max-to-min ratio cap ties the top to the bottom value.",
    fastest_path_md:
      "Give the other six employees $L$ shifts each: $M = 40 - 6L$ must satisfy $M \\le 2L$, so $40 - 6L \\le 2L$ and $L \\ge 5$. Then $M = 40 - 30 = 10$.",
    trap_map: {
      "0": "Anchors the minimum at the required $4$ and caps the top at $2 \\cdot 4 = 8$.",
      "2": "Caps the top at twice the average $40/7 \\approx 5.7$ and rounds to $11$.",
      "3": "Doubles the rounded-up average of $6$ without checking that the shifts still total $40$.",
      "4": "Drops the ratio rule and gives the other six employees the bare minimum of $4$ shifts each.",
    },
    numeric_check: "40 - 6*5",
    check() {
      // enumerate every nondecreasing 7-tuple of integers >= 4 summing to 40,
      // keep those whose max <= 2 * min, and track the largest entry seen.
      const tuples = nondecreasingTuples(7, 4, 40, 40);
      let best = -Infinity;
      for (const t of tuples) {
        if (t[t.length - 1] <= 2 * t[0]) {
          best = Math.max(best, t[t.length - 1]);
        }
      }
      return { kind: "value", value: best };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
