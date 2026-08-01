/**
 * Quality pass, batch 5 — 12 new D5 items across the equal_unequal_alg
 * skill: 2 each for min_max_optimization, quadratics_factoring,
 * inequalities, linear_systems, functions_sequences and
 * algebraic_translation (each 14 → 16).
 *
 * Run: node --experimental-strip-types scripts/author/batch-q5-algebra.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ══ min_max_optimization ════════════════════════════════════════════════

  // ── 1. a lattice optimum that is not the continuous one ────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 5,
    stem_md:
      "If $x$ and $y$ are positive integers satisfying $3x + 4y = 100$, what is the greatest possible value of $xy$?",
    choices: ["$168$", "$192$", "$200$", "$208$", "$\\frac{625}{3}$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nSolving for $x$ gives $x = \\dfrac{100 - 4y}{3}$, which is a positive integer only when $100 - 4y \\equiv 0 \\pmod 3$. Since $100 \\equiv 1$ and $4y \\equiv y \\pmod 3$, this requires $y \\equiv 1 \\pmod 3$, so $y \\in \\{1, 4, 7, 10, 13, 16, 19, 22\\}$.\n\nTreating $y$ as continuous, $xy = \\dfrac{y(100 - 4y)}{3}$ is a downward parabola peaking at $y = 12.5$. The admissible values on either side are $y = 10$ (giving $x = 20$, $xy = 200$) and $y = 13$ (giving $x = 16$, $xy = 208$). The larger is $208$.\n\n**Trigger cue**\nA product maximized under a linear integer constraint — locate the continuous optimum, then test the *admissible* lattice points on both sides of it; the nearest integer is often not admissible.\n\n**Takeaway**\nCheck both admissible neighbours of the continuous optimum.",
    fastest_path_md:
      "The parabola peaks at $y = 12.5$, and $y$ must be $\\equiv 1 \\pmod 3$. Test $y = 13 \\Rightarrow x = 16 \\Rightarrow 208$ and $y = 10 \\Rightarrow x = 20 \\Rightarrow 200$. Answer $208$.",
    trap_map: {
      "0": "Tests only a few small admissible values and stops at $y = 7$, $x = 24$, giving $168$.",
      "1": "Tests $y = 16$, $x = 12$ and stops at $192$ without checking closer to the peak.",
      "2": "Takes the admissible point *below* the continuous optimum, $y = 10$, without testing $y = 13$.",
      "4": "Uses the continuous optimum $y = 12.5$, $x = \\tfrac{50}{3}$, ignoring that both must be integers.",
    },
    numeric_check: "16*13",
    check() {
      // Enumerate every positive integer solution of the constraint.
      let best = 0;
      for (let x = 1; 3 * x < 100; x++) {
        const rest = 100 - 3 * x;
        if (rest % 4 !== 0) continue;
        const y = rest / 4;
        if (y > 0) best = Math.max(best, x * y);
      }
      if (best === 0) throw new Error("no positive integer solutions");
      return { kind: "value", value: best };
    },
    trap_values() {
      const xy = (y) => ((100 - 4 * y) / 3) * y;
      return { "0": xy(7), "1": xy(16), "2": xy(10), "4": xy(12.5) };
    },
  },

  // ── 2. three sides of fencing against a wall ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 5,
    stem_md:
      "A rectangular pen is to be built along a straight river wall, so that fencing is needed on only three sides — the wall forms the fourth. With exactly $60$ meters of fencing available, what is the greatest possible area of the pen, in square meters?",
    choices: ["$225$", "$400$", "$450$", "$900$", "$1{,}800$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $w$ be each of the two sides perpendicular to the wall and $L$ the side parallel to it. The fencing constraint is $2w + L = 60$, so $L = 60 - 2w$ and the area is $A(w) = w(60 - 2w) = -2w^2 + 60w$. This parabola peaks at $w = \\dfrac{-60}{2(-2)} = 15$, giving $L = 30$ and $A = 450$.\n\nNote the shape: the optimal pen is *twice* as long as it is deep, not square — the wall side is free, so the geometry tilts toward it.\n\n**Trigger cue**\nA fixed perimeter with one side free — write the constraint with the correct number of fenced sides before optimizing; the free side changes the optimal shape.\n\n**Takeaway**\nOne free side makes the optimal rectangle twice as long as deep.",
    fastest_path_md:
      "$A = w(60 - 2w)$ peaks halfway between its roots $w = 0$ and $w = 30$, so $w = 15$, $L = 30$, $A = 450$.",
    trap_map: {
      "0": "Fences all four sides, making a $15 \\times 15$ square out of a $60$-meter perimeter: $225$.",
      "1": "Splits the fencing into three equal $20$-meter sides: $20 \\times 20 = 400$.",
      "3": "Uses $L = 60 - w$ instead of $60 - 2w$, fencing only one side perpendicular to the wall: peak at $w = 30$, area $900$.",
      "4": "Treats the wall side as free extra length rather than a constraint, taking $L = 60$ and $w = 30$: $1{,}800$.",
    },
    numeric_check: "15*(60 - 2*15)",
    check() {
      // Scan depths in centimeters against the real fencing constraint.
      let best = 0;
      for (let cm = 1; cm < 3000; cm++) {
        const w = cm / 100;
        const L = 60 - 2 * w;
        if (L <= 0) break;
        best = Math.max(best, w * L);
      }
      return { kind: "value", value: best };
    },
    trap_values() {
      return { "0": 15 * 15, "1": 20 * 20, "3": 30 * (60 - 30), "4": 30 * 60 };
    },
  },

  // ══ quadratics_factoring ════════════════════════════════════════════════

  // ── 3. all constants giving distinct positive integer roots ────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 5,
    stem_md:
      "The quadratic $x^2 - 7x + k$ has two distinct positive integer roots, and $k$ is a positive integer. What is the sum of all possible values of $k$?",
    choices: ["$6$", "$12$", "$22$", "$28$", "$56$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nIf the roots are $r$ and $s$, then $r + s = 7$ and $rs = k$. The unordered pairs of distinct positive integers summing to $7$ are $\\{1,6\\}$, $\\{2,5\\}$ and $\\{3,4\\}$, giving $k = 6$, $10$ and $12$. Their sum is $6 + 10 + 12 = 28$. (Because $7$ is odd, no pair of equal roots exists, so \"distinct\" costs nothing here.)\n\n**Trigger cue**\n\"Integer roots\" with a fixed sum — enumerate unordered pairs from the sum, not divisors from the product; $\\{r,s\\}$ and $\\{s,r\\}$ give the same $k$.\n\n**Takeaway**\nEnumerate unordered root pairs; swapping them repeats the same $k$.",
    fastest_path_md:
      "Pairs summing to $7$: $1{+}6$, $2{+}5$, $3{+}4$, with products $6$, $10$, $12$. Sum $= 28$.",
    trap_map: {
      "0": "Reports only the smallest admissible $k$, $1 \\times 6 = 6$.",
      "1": "Reports only the largest admissible $k$, $3 \\times 4 = 12$.",
      "2": "Discards the $\\{1,6\\}$ pair as trivial: $10 + 12 = 22$.",
      "4": "Counts $(r,s)$ and $(s,r)$ as different, doubling every value: $2 \\times 28 = 56$.",
    },
    numeric_check: "6 + 10 + 12",
    check() {
      // Test every candidate k by factoring the quadratic outright.
      let total = 0;
      for (let k = 1; k <= 200; k++) {
        const disc = 49 - 4 * k;
        if (disc <= 0) continue; // distinct real roots required
        const root = Math.round(Math.sqrt(disc));
        if (root * root !== disc) continue;
        const r = (7 - root) / 2;
        const s = (7 + root) / 2;
        if (!Number.isInteger(r) || !Number.isInteger(s)) continue;
        if (r > 0 && s > 0 && r !== s) total += k;
      }
      return { kind: "value", value: total };
    },
    trap_values() {
      return { "0": 6, "1": 12, "2": 10 + 12, "4": 2 * 28 };
    },
  },

  // ── 4. counting the linear coefficients with integer roots ─────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 5,
    stem_md:
      "For how many integer values of $b$ does the equation $x^2 + bx + 36 = 0$ have at least one integer root?",
    choices: ["$5$", "$8$", "$9$", "$10$", "$18$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nIf one root is an integer, so is the other, since the roots multiply to $36$ and sum to $-b$. The unordered pairs of integers with product $36$ are $\\{1,36\\}$, $\\{2,18\\}$, $\\{3,12\\}$, $\\{4,9\\}$, $\\{6,6\\}$ and their all-negative counterparts — ten pairs, with sums $37, 20, 15, 13, 12$ and $-37, -20, -15, -13, -12$. Since $b$ is the negative of the sum, that is $10$ distinct values of $b$.\n\n**Trigger cue**\n\"Integer roots\" with a fixed *product* — enumerate factor pairs of the constant, remembering the both-negative pairs and any perfect-square pair.\n\n**Takeaway**\nFactor pairs come in both signs; a square contributes one pair each.",
    fastest_path_md:
      "Factor pairs of $36$: $(1,36),(2,18),(3,12),(4,9),(6,6)$ — five, doubled by sign, so $10$ values of $b$.",
    trap_map: {
      "0": "Counts only the pairs of positive roots, missing the all-negative pairs: $5$.",
      "1": "Discards the repeated root $\\{6,6\\}$ as not being \"two roots\", leaving $8$.",
      "2": "Counts the repeated-root case once overall rather than once per sign: $9$.",
      "4": "Counts $(r,s)$ and $(s,r)$ as different, doubling each unequal pair: $18$.",
    },
    numeric_check: "10",
    check() {
      // Test each b directly for an integer root.
      const values = new Set();
      for (let b = -200; b <= 200; b++) {
        const disc = b * b - 144;
        if (disc < 0) continue;
        const root = Math.round(Math.sqrt(disc));
        if (root * root !== disc) continue;
        for (const sign of [1, -1]) {
          const x = (-b + sign * root) / 2;
          if (Number.isInteger(x)) values.add(b);
        }
      }
      return { kind: "value", value: values.size };
    },
    trap_values() {
      const pairs = [];
      for (let r = 1; r * r <= 36; r++) {
        if (36 % r === 0) pairs.push([r, 36 / r]);
      }
      const unequal = pairs.filter(([r, s]) => r !== s).length;
      const equal = pairs.length - unequal;
      return {
        "0": pairs.length,
        "1": 2 * unequal,
        "2": 2 * unequal + equal,
        "4": 2 * (2 * unequal + equal),
      };
    },
  },

  // ══ inequalities ════════════════════════════════════════════════════════

  // ── 5. sign analysis of a cubic product ────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 5,
    stem_md:
      "How many positive integers $n$ satisfy $(n - 3)(n - 8)(n - 15) < 0$?",
    choices: ["$2$", "$6$", "$8$", "$10$", "$11$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe three factors change sign at $3$, $8$ and $15$. To the right of $15$ all three are positive, so the product is positive; crossing each root flips the sign. Reading leftward from $n > 15$: positive, then negative on $8 < n < 15$, positive on $3 < n < 8$, negative on $n < 3$.\n\nThe strict inequality excludes the roots themselves. The positive integers in the negative regions are $n \\in \\{1, 2\\}$ — two of them — and $n \\in \\{9, 10, 11, 12, 13, 14\\}$ — six of them. Total: $8$.\n\n**Trigger cue**\nA product of linear factors compared with zero — mark the roots on a line and alternate signs from the far right; count only what the strictness allows.\n\n**Takeaway**\nSigns alternate across simple roots; strict inequalities drop them.",
    fastest_path_md:
      "Negative on $n < 3$ and on $8 < n < 15$. Positive integers: $\\{1,2\\}$ and $\\{9, \\ldots, 14\\}$, so $2 + 6 = 8$.",
    trap_map: {
      "0": "Counts only the region below $3$, missing the interval between $8$ and $15$.",
      "1": "Counts only the interval $8 < n < 15$, missing $n = 1$ and $n = 2$.",
      "3": "Reads the inequality as $\\le$, adding the roots $n = 3$ and $n = 8$ where the product is zero.",
      "4": "Reads the inequality as $\\le$ and includes all three roots, $3$, $8$ and $15$.",
    },
    numeric_check: "8",
    check() {
      let count = 0;
      for (let n = 1; n <= 5000; n++) {
        if ((n - 3) * (n - 8) * (n - 15) < 0) count++;
      }
      return { kind: "value", value: count };
    },
    trap_values() {
      let below = 0;
      let middle = 0;
      let withRoots = 0;
      let allRoots = 0;
      for (let n = 1; n <= 5000; n++) {
        const p = (n - 3) * (n - 8) * (n - 15);
        if (p < 0 && n < 3) below++;
        if (p < 0 && n > 8) middle++;
        if (p < 0 || n === 3 || n === 8) withRoots++;
        if (p <= 0) allRoots++;
      }
      return { "0": below, "1": middle, "3": withRoots, "4": allRoots };
    },
  },

  // ── 6. maximizing an expression over a rectangle of values ─────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 5,
    stem_md:
      "If $-2 \\le x \\le 5$ and $-7 \\le y \\le 3$, what is the greatest possible value of $x^2 - xy$?",
    choices: ["$10$", "$25$", "$35$", "$60$", "$84$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFor any fixed $x$, the expression $x^2 - xy$ is *linear* in $y$, so its maximum over an interval of $y$ occurs at an endpoint — $y = -7$ when $x > 0$, and $y = 3$ when $x < 0$. That reduces the problem to two single-variable cases:\n\n- $x > 0$: maximize $x^2 + 7x$ on $(0, 5]$, increasing, so $x = 5$ gives $25 + 35 = 60$.\n- $x < 0$: maximize $x^2 - 3x$ on $[-2, 0)$, decreasing in $x$, so $x = -2$ gives $4 + 6 = 10$.\n\nThe greatest value is $60$.\n\n**Trigger cue**\nAn expression over independent ranges — check whether it is linear in one variable; if so, only that variable's endpoints matter, and the two terms cannot be maximized separately.\n\n**Takeaway**\nMaximize the whole expression at corners, never term by term.",
    fastest_path_md:
      "The four corners give $60$, $10$, $-10$ and $10$. The largest is $x = 5$, $y = -7$: $25 + 35 = 60$.",
    trap_map: {
      "0": "Evaluates only at $x = 5$, $y = 3$: $25 - 15 = 10$.",
      "1": "Maximizes $x^2$ alone and drops the $-xy$ term: $25$.",
      "2": "Maximizes $-xy$ alone and drops the $x^2$ term: $-(5)(-7) = 35$.",
      "4": "Applies $y$'s wider range to $x$ as well, taking $x^2$ up to $49$: $49 + 35 = 84$.",
    },
    numeric_check: "5^2 - 5*(-7)",
    check() {
      // Scan the whole rectangle on a fine grid.
      let best = -Infinity;
      for (let xi = -200; xi <= 500; xi++) {
        for (let yi = -700; yi <= 300; yi++) {
          const x = xi / 100;
          const y = yi / 100;
          best = Math.max(best, x * x - x * y);
        }
      }
      return { kind: "value", value: best };
    },
    trap_values() {
      return { "0": 25 - 15, "1": 25, "2": 35, "4": 49 + 35 };
    },
  },

  // ══ linear_systems ══════════════════════════════════════════════════════

  // ── 7. a cyclic three-variable system ──────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 5,
    stem_md:
      "If $x + y = 13$, $y + z = 21$, and $x + z = 16$, what is the value of $xyz$?",
    choices: ["$25$", "$432$", "$1{,}728$", "$2{,}700$", "$4{,}368$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nAdding all three equations counts each variable twice: $2(x + y + z) = 13 + 21 + 16 = 50$, so $x + y + z = 25$. Each variable is then the total minus the equation that omits it: $z = 25 - 13 = 12$, $x = 25 - 21 = 4$, $y = 25 - 16 = 9$. Hence $xyz = 4 \\times 9 \\times 12 = 432$.\n\n**Trigger cue**\nEvery pair sum given but no single variable — add all the equations and halve; each variable then falls out by one subtraction, with no elimination needed.\n\n**Takeaway**\nSum all pair equations, halve, then subtract to isolate each.",
    fastest_path_md:
      "$x+y+z = 50/2 = 25$, so $z = 12$, $x = 4$, $y = 9$, and $xyz = 432$.",
    trap_map: {
      "0": "Answers with $x + y + z = 25$ rather than the product.",
      "2": "Assumes all three variables equal the largest of them, $12$, giving $12^3 = 1{,}728$.",
      "3": "Forgets to halve, taking $x + y + z = 50$ — then $x = 50 - 21 = 29$ and the rest follow wrongly; keeping $25$ for $x$ instead gives $y = -12$, $z = -9$ and a product of $2{,}700$.",
      "4": "Multiplies the three given sums, $13 \\times 21 \\times 16 = 4{,}368$.",
    },
    numeric_check: "4*9*12",
    check() {
      // Search integer triples directly.
      const found = [];
      for (let x = -60; x <= 60; x++) {
        for (let y = -60; y <= 60; y++) {
          for (let z = -60; z <= 60; z++) {
            if (x + y === 13 && y + z === 21 && x + z === 16) found.push(x * y * z);
          }
        }
      }
      if (found.length !== 1) throw new Error(`expected one triple, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 25, "2": 12 ** 3, "3": 25 * -12 * -9, "4": 13 * 21 * 16 };
    },
  },

  // ── 8. a coin system with a ratio constraint ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 5,
    stem_md:
      "A cash drawer contains only nickels (worth $5$ cents), dimes ($10$ cents), and quarters ($25$ cents) — $60$ coins in all, worth $\\$9.50$ altogether. There are twice as many dimes as nickels. How many quarters are in the drawer?",
    choices: ["$11$", "$22$", "$27$", "$30$", "$33$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $n$ be the nickels; then the dimes number $2n$ and the quarters $q = 60 - 3n$. In cents: $5n + 10(2n) + 25(60 - 3n) = 950$, so $25n + 1500 - 75n = 950$, giving $50n = 550$ and $n = 11$. Then $q = 60 - 33 = 27$. Check: $11$ nickels ($55$¢), $22$ dimes ($\\$2.20$), $27$ quarters ($\\$6.75$) — $60$ coins, $\\$9.50$.\n\n**Trigger cue**\nThree coin types with a ratio between two of them — the ratio collapses three unknowns to one, so write everything in terms of the smallest count before touching the value equation.\n\n**Takeaway**\nA ratio between two unknowns collapses three coins to one.",
    fastest_path_md:
      "With $n$ nickels, a nickel-plus-two-dimes group is worth $25$¢ — the same as a quarter. So all $60$ coins average out to $25n + 25(60-3n) = 950$, giving $n = 11$ and $q = 27$.",
    trap_map: {
      "0": "Answers with the number of nickels, $11$.",
      "1": "Answers with the number of dimes, $22$.",
      "3": "Reads the ratio backwards as twice as many nickels as dimes, which gives $10$ dimes, $20$ nickels and $30$ quarters.",
      "4": "Answers with the nickels and dimes together, $11 + 22 = 33$.",
    },
    numeric_check: "60 - 3*11",
    check() {
      // Enumerate every admissible drawer.
      const found = [];
      for (let n = 0; n <= 60; n++) {
        for (let d = 0; d <= 60; d++) {
          const q = 60 - n - d;
          if (q < 0) continue;
          if (d !== 2 * n) continue;
          if (5 * n + 10 * d + 25 * q === 950) found.push(q);
        }
      }
      if (found.length !== 1) throw new Error(`expected one drawer, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      // The reversed-ratio drawer, solved the same way.
      let reversed = null;
      for (let d = 0; d <= 60; d++) {
        const n = 2 * d;
        const q = 60 - n - d;
        if (q < 0) continue;
        if (5 * n + 10 * d + 25 * q === 950) reversed = q;
      }
      return { "0": 11, "1": 22, "3": reversed, "4": 11 + 22 };
    },
  },

  // ══ functions_sequences ═════════════════════════════════════════════════

  // ── 9. where two compositions agree ────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 5,
    stem_md:
      "Let $f(x) = 2x - 3$ and $g(x) = x^2 + 1$. What is the sum of all real values of $x$ for which $f(g(x)) = g(f(x))$?",
    choices: ["$-6$", "$3$", "$\\frac{11}{2}$", "$6$", "$12$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nCompose in both orders: $f(g(x)) = 2(x^2+1) - 3 = 2x^2 - 1$, while $g(f(x)) = (2x-3)^2 + 1 = 4x^2 - 12x + 10$. Setting them equal gives $2x^2 - 1 = 4x^2 - 12x + 10$, i.e. $2x^2 - 12x + 11 = 0$. Its discriminant is $144 - 88 = 56 > 0$, so there are two real roots, and by Vieta their sum is $\\dfrac{12}{2} = 6$.\n\n**Trigger cue**\n\"Sum of all values\" from a quadratic — Vieta gives $-b/a$ directly; there is no reason to compute the roots themselves.\n\n**Takeaway**\nComposition does not commute; sum the roots with Vieta.",
    fastest_path_md:
      "$2x^2 - 1 = 4x^2 - 12x + 10$ reduces to $2x^2 - 12x + 11 = 0$. The sum of the roots is $12/2 = 6$.",
    trap_map: {
      "0": "Flips the sign in Vieta's sum, reporting $b/a$ instead of $-b/a$.",
      "1": "Reports the vertex $-\\dfrac{b}{2a} = 3$, which is the *mean* of the roots rather than their sum.",
      "2": "Reports the product of the roots, $c/a = \\tfrac{11}{2}$.",
      "4": "Uses $-b = 12$ without dividing by the leading coefficient $a = 2$.",
    },
    numeric_check: "12/2",
    check() {
      // Locate the roots numerically by sign change and bisection, then
      // add them — no use of the quadratic formula.
      const f = (x) => 2 * x - 3;
      const g = (x) => x * x + 1;
      const h = (x) => f(g(x)) - g(f(x));
      const roots = [];
      const step = 1e-3;
      for (let x = -50; x < 50; x += step) {
        const a = x;
        const b = x + step;
        if (h(a) === 0) roots.push(a);
        else if (h(a) * h(b) < 0) {
          let lo = a;
          let hi = b;
          for (let i = 0; i < 200; i++) {
            const mid = (lo + hi) / 2;
            if (h(lo) * h(mid) <= 0) hi = mid;
            else lo = mid;
          }
          roots.push((lo + hi) / 2);
        }
      }
      if (roots.length !== 2) throw new Error(`expected two roots, found ${roots.length}`);
      return { kind: "value", value: Math.round((roots[0] + roots[1]) * 1e6) / 1e6 };
    },
    trap_values() {
      return { "0": -6, "1": 12 / 4, "2": 11 / 2, "4": 12 };
    },
  },

  // ── 10. a recursion whose increments accumulate ────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 5,
    stem_md:
      "A function $f$ on the positive integers satisfies $f(1) = 3$ and $f(n+1) = f(n) + 2n + 1$ for every $n \\ge 1$. What is $f(10)$?",
    choices: ["$21$", "$83$", "$100$", "$102$", "$123$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe increments telescope: $f(n) = f(1) + \\sum_{k=1}^{n-1}(2k+1)$. That sum is $2\\cdot\\dfrac{(n-1)n}{2} + (n-1) = n^2 - 1$, so $f(n) = 3 + n^2 - 1 = n^2 + 2$. Hence $f(10) = 102$.\n\nThe shape is worth recognizing: $2n+1$ is the gap between consecutive squares, so a recursion adding $2n+1$ builds a shifted square.\n\n**Trigger cue**\nA recursion whose increment depends on $n$ — sum the increments rather than iterating; $2n+1$ in particular signals consecutive squares.\n\n**Takeaway**\nIncrements of $2n+1$ accumulate into a square.",
    fastest_path_md:
      "Adding $2n+1$ steps between consecutive squares, so $f(n) = n^2 + 2$ and $f(10) = 102$.",
    trap_map: {
      "0": "Applies the increment once instead of accumulating it: $3 + 2(9) = 21$.",
      "1": "Stops one step early at $f(9) = 81 + 2 = 83$.",
      "2": "Drops the constant, answering $10^2 = 100$.",
      "4": "Runs one step too far to $f(11) = 121 + 2 = 123$.",
    },
    numeric_check: "10^2 + 2",
    check() {
      let f = 3;
      for (let n = 1; n < 10; n++) f = f + 2 * n + 1;
      return { kind: "value", value: f };
    },
    trap_values() {
      const closed = (n) => n * n + 2;
      return { "0": 3 + 2 * 9, "1": closed(9), "2": 100, "4": closed(11) };
    },
  },

  // ══ algebraic_translation ═══════════════════════════════════════════════

  // ── 11. a switch between two groups ────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "algebraic_translation",
    difficulty: 5,
    stem_md:
      "At a certain office, the number of employees who commute by train is $3$ more than twice the number who commute by bicycle, and every employee does one or the other. If $5$ of the cyclists switched to the train, the number commuting by train would be exactly $4$ times the number still cycling. How many employees currently cycle?",
    choices: ["$9$", "$14$", "$31$", "$36$", "$45$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $c$ be the current cyclists; then the train riders number $t = 2c + 3$. After five people move from bicycle to train, the counts are $t + 5$ and $c - 5$, and the condition reads $t + 5 = 4(c - 5)$. Substituting: $2c + 8 = 4c - 20$, so $2c = 28$ and $c = 14$.\n\nCheck: $14$ cyclists and $31$ train riders; after the switch, $9$ and $36$, and $36 = 4 \\times 9$.\n\n**Trigger cue**\nA transfer between two groups — one group's gain is the other's loss, so both counts change in the *same* equation; write the after-state fully before setting the condition.\n\n**Takeaway**\nA transfer moves both counts; write the after-state for both.",
    fastest_path_md:
      "$2c + 3 + 5 = 4(c-5)$ gives $2c + 8 = 4c - 20$, so $c = 14$.",
    trap_map: {
      "0": "Answers with the cyclists remaining *after* the switch, $14 - 5 = 9$.",
      "2": "Answers with the current number of train riders, $2(14) + 3 = 31$.",
      "3": "Answers with the train riders after the switch, $31 + 5 = 36$.",
      "4": "Answers with the total number of employees, $14 + 31 = 45$.",
    },
    numeric_check: "(3 + 5 + 20)/2",
    check() {
      const found = [];
      for (let c = 6; c <= 5000; c++) {
        const t = 2 * c + 3;
        if (t + 5 === 4 * (c - 5)) found.push(c);
      }
      if (found.length !== 1) throw new Error(`expected one count, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      const c = 14;
      const t = 2 * c + 3;
      return { "0": c - 5, "2": t, "3": t + 5, "4": c + t };
    },
  },

  // ── 12. two ages pinned at two different times ─────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "algebraic_translation",
    difficulty: 5,
    stem_md:
      "Three years ago, Marta was four times as old as her son. Seven years from now, the sum of their two ages will be $45$. How old is Marta now?",
    choices: ["$8$", "$15$", "$20$", "$23$", "$30$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $m$ and $s$ be their current ages. \"Three years ago\" applies to both: $m - 3 = 4(s - 3)$, so $m = 4s - 9$. \"Seven years from now\" also applies to both, adding $7$ to each: $(m + 7) + (s + 7) = 45$, so $m + s = 31$. Substituting, $4s - 9 + s = 31$, giving $s = 8$ and $m = 23$.\n\nCheck: three years ago they were $20$ and $5$, and $20 = 4 \\times 5$; in seven years they will be $30$ and $15$, summing to $45$.\n\n**Trigger cue**\nA time shift in an age problem — apply it to *every* person in the sentence; a sum of two ages moves by twice the shift, not once.\n\n**Takeaway**\nShift every age in the sentence, and sums shift twice.",
    fastest_path_md:
      "$m = 4s - 9$ and $m + s = 31$ give $5s = 40$, so $s = 8$ and $m = 23$.",
    trap_map: {
      "0": "Answers with the son's current age, $8$.",
      "1": "Answers with the son's age in seven years, $15$.",
      "2": "Answers with Marta's age three years ago, $20$.",
      "4": "Answers with Marta's age seven years from now, $30$.",
    },
    numeric_check: "4*8 - 9",
    check() {
      const found = [];
      for (let m = 4; m <= 120; m++) {
        for (let s = 4; s <= 120; s++) {
          if (m - 3 === 4 * (s - 3) && m + 7 + (s + 7) === 45) found.push(m);
        }
      }
      if (found.length !== 1) throw new Error(`expected one pair, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 8, "1": 8 + 7, "2": 23 - 3, "4": 23 + 7 };
    },
  },
];

verifyAndAppend(items, {
  dryRun: !process.env.APPEND,
  requireTrapValues: true,
});
