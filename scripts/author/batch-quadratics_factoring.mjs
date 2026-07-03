/**
 * Batch: quadratics_factoring (equal_unequal_alg / algebra) — 7 items.
 * D2 PS pure, D3 PS pure, D3 PS real, D4 PS pure, D4 DS pure, D4 PS pure, D5 DS pure.
 * Run: node scripts/author/batch-quadratics_factoring.mjs
 * (add --experimental-strip-types below Node 22.18)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ── 1. D2 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 2,
    stem_md:
      "If $(x - 3)^2 = 25$, what is the sum of all possible values of $x$?",
    choices: ["$-2$", "$2$", "$6$", "$8$", "$16$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nTake square roots with both signs: $x - 3 = \\pm 5$, so $x = 8$ or $x = -2$. The sum is $8 + (-2) = 6$. Equivalently, expanding gives $x^2 - 6x - 16 = 0$, whose root sum is $6$.\n\n**Trigger cue**\n\nA squared binomial equal to a constant: unwrap with $\\pm$ before expanding anything.\n\n**Takeaway**\n\nEvery positive square has two square roots.",
    fastest_path_md:
      "Unwrap directly: $x - 3 = \\pm 5$, so $x = 8$ or $x = -2$; the sum is $6$. No expansion needed.",
    trap_map: {
      "0": "Reports only the root that comes from the negative square root.",
      "1": "Sign slip on the binomial: solving $x + 3 = 5$ instead of $x - 3 = 5$.",
      "3": "Takes only the positive square root and reports that single root.",
      "4": "Reports the constant $16$ from the expanded quadratic $x^2 - 6x - 16 = 0$ instead of the root sum.",
    },
    numeric_check: "8 + (-2)",
    check() {
      const roots = [];
      for (let x = -1000; x <= 1000; x++) if ((x - 3) * (x - 3) === 25) roots.push(x);
      // a monic integer quadratic has at most 2 roots; finding 2 means we have them all
      if (roots.length !== 2) throw new Error("expected exactly 2 roots, got " + roots);
      return { kind: "value", value: roots.reduce((a, b) => a + b, 0) };
    },
  },

  // ── 2. D3 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 3,
    stem_md:
      "If $x \\neq y$, and both $x$ and $y$ satisfy $t^2 - 5t + 6 = 0$, what is the value of $xy$?",
    choices: ["$-6$", "$-5$", "$5$", "$6$", "$13$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFactor: $t^2 - 5t + 6 = (t - 2)(t - 3)$, so the equation's only solutions are $2$ and $3$. Since $x$ and $y$ are distinct solutions, $\\{x, y\\} = \\{2, 3\\}$, and $xy = 2 \\cdot 3 = 6$ — the constant term, exactly as Vieta guarantees.\n\n**Trigger cue**\n\nTwo different variables satisfying the same quadratic must be that quadratic's two roots.\n\n**Takeaway**\n\nDistinct solutions of one quadratic are its two roots.",
    fastest_path_md:
      "Distinct $x$ and $y$ solving the same monic quadratic are its two roots, so $xy$ is the constant term: $6$. No factoring needed.",
    trap_map: {
      "0": "Flips the sign of the constant term when reading off the product.",
      "1": "Reports the raw middle coefficient $-5$, confusing the product with the (sign-flipped) sum.",
      "2": "Computes the root sum $x + y$ instead of the product.",
      "4": "Computes $x^2 + y^2 = 4 + 9$ instead of $xy$.",
    },
    numeric_check: "2*3",
    check() {
      const sols = [];
      for (let t = -1000; t <= 1000; t++) if (t * t - 5 * t + 6 === 0) sols.push(t);
      if (sols.length !== 2) throw new Error("expected exactly 2 solutions, got " + sols);
      const products = new Set();
      for (const x of sols) for (const y of sols) if (x !== y) products.add(x * y);
      if (products.size !== 1) throw new Error("xy is not uniquely determined");
      return { kind: "value", value: [...products][0] };
    },
  },

  // ── 3. D3 PS real ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 3,
    stem_md:
      "An emergency flare is fired straight up from the ground, and its height, in meters, $t$ seconds after firing is $40t - 5t^2$. At what value of $t$, in seconds, is the flare at a height of $60$ meters while descending?",
    choices: ["$2$", "$4$", "$6$", "$8$", "$12$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSet $40t - 5t^2 = 60$. Dividing by $5$ gives $t^2 - 8t + 12 = 0$, which factors as $(t - 2)(t - 6) = 0$. The flare is at $60$ meters at $t = 2$ (rising) and at $t = 6$ (falling, since the peak occurs at $t = 4$). The descending pass is at $t = 6$.\n\n**Trigger cue**\n\nA projectile height reached twice: the larger root of the crossing equation is the way down.\n\n**Takeaway**\n\nOf two crossing times, the later one is descending.",
    fastest_path_md:
      "Backsolve: $t = 6$ gives $240 - 180 = 60$ ✓, and $6$ is past the peak at $t = 4$, so the flare is descending.",
    trap_map: {
      "0": "Takes the first time the flare reaches $60$ meters, which is on the way up.",
      "1": "Reports the time of the peak instead of the descending crossing.",
      "3": "Reports the time the flare returns to the ground ($h = 0$).",
      "4": "Reports the product of the two crossing times from the reduced quadratic.",
    },
    numeric_check: "8 - 2",
    check() {
      const h = (t) => 40 * t - 5 * t * t;
      const crossings = [];
      for (let t = 0; t <= 200; t++) if (h(t) === 60) crossings.push(t);
      // the crossing equation is quadratic (at most 2 roots); 2 found = all found
      if (crossings.length !== 2) throw new Error("expected exactly 2 crossings, got " + crossings);
      let peakT = 0;
      for (let i = 0; i <= 20000; i++) {
        const t = i / 1000;
        if (h(t) > h(peakT)) peakT = t;
      }
      const descending = crossings.filter((t) => t > peakT);
      if (descending.length !== 1) throw new Error("descending crossing not unique");
      return { kind: "value", value: descending[0] };
    },
  },

  // ── 4. D4 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 4,
    stem_md:
      "If $x^2 - 4x - 3 = 0$, what is the value of $x^4 - 8x^3 + 16x^2$?",
    choices: ["$-3$", "$3$", "$6$", "$9$", "$16$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFrom $x^2 - 4x - 3 = 0$, isolate the repeated block: $x^2 - 4x = 3$. The target is a perfect square of that block: $x^4 - 8x^3 + 16x^2 = (x^2 - 4x)^2 = 3^2 = 9$.\n\n**Trigger cue**\n\nA quartic whose coefficients echo the given quadratic: hunt for $(x^2 + bx)^2$ structure instead of solving for $x$.\n\n**Takeaway**\n\nRewrite ugly polynomials as powers of a known expression.",
    fastest_path_md:
      "Spot the structure: $x^4 - 8x^3 + 16x^2 = (x^2 - 4x)^2$, and the equation says $x^2 - 4x = 3$, so the value is $9$. Never solve for $x$ (the roots are irrational).",
    trap_map: {
      "0": "Reports the quadratic's constant term with its sign.",
      "1": "Finds $x^2 - 4x = 3$ but forgets to square it.",
      "2": "Doubles $3$ instead of squaring it.",
      "4": "Grabs the coefficient $16$ from the target expression.",
    },
    numeric_check: "3^2",
    check() {
      // locate both roots of x^2 - 4x - 3 = 0 by sign-change scan + bisection
      const f = (x) => x * x - 4 * x - 3;
      const roots = [];
      const step = 0.001;
      for (let i = -100000; i < 100000; i++) {
        const a = i * step;
        const b = (i + 1) * step;
        if (f(a) === 0) roots.push(a);
        else if (f(a) * f(b) < 0) {
          let lo = a, hi = b;
          for (let k = 0; k < 200; k++) {
            const mid = (lo + hi) / 2;
            if (f(lo) * f(mid) <= 0) hi = mid;
            else lo = mid;
          }
          roots.push((lo + hi) / 2);
        }
      }
      if (roots.length !== 2) throw new Error("expected 2 roots, got " + roots.length);
      const g = (x) => x ** 4 - 8 * x ** 3 + 16 * x ** 2;
      const vals = roots.map(g);
      if (Math.abs(vals[0] - vals[1]) > 1e-6) throw new Error("target differs across roots: " + vals);
      return { kind: "value", value: vals[0] };
    },
  },

  // ── 5. D4 DS pure ─────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 4,
    stem_md:
      "What is the value of $x$?\n\n(1) $x^2 = 5x$\n\n(2) $x^2 + x - 30 = 0$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n(1): Move everything to one side — $x^2 - 5x = x(x - 5) = 0$, so $x = 0$ or $x = 5$: two values, not sufficient. (2): $x^2 + x - 30 = (x + 6)(x - 5) = 0$, so $x = -6$ or $x = 5$: not sufficient. Together, the only value in both root sets is $x = 5$ — sufficient. Answer: both statements together.\n\n**Trigger cue**\n\nTwo quadratic statements about one unknown: list each root set fully, then intersect — and never divide by a variable that could be zero.\n\n**Takeaway**\n\nIntersect root sets; dividing by $x$ deletes the root zero.",
    fastest_path_md:
      "(1) $x(x - 5) = 0$: $\\{0, 5\\}$. (2) $(x + 6)(x - 5) = 0$: $\\{-6, 5\\}$. Each set has two values, but they share only $5$ — combined sufficient.",
    trap_map: {
      "0": "Divides statement (1) by $x$, silently discarding the root $x = 0$ and making (1) look sufficient.",
      "1": "Drops statement (2)'s negative root $-6$ as if it were extraneous, leaving $x = 5$ alone.",
      "3": "Makes both slips at once: divides by $x$ in (1) and discards the negative root in (2).",
      "4": "Sees two candidates from each statement but never intersects the two root sets.",
    },
    numeric_check: null,
    check() {
      const s1 = [];
      const s2 = [];
      for (let x = -1000; x <= 1000; x++) {
        if (x * x === 5 * x) s1.push(x);
        if (x * x + x - 30 === 0) s2.push(x);
      }
      // each statement is a monic integer quadratic: at most 2 roots, and any
      // rational root is an integer — finding 2 integers means the sets are complete
      if (s1.length !== 2) throw new Error("statement (1) models: " + s1);
      if (s2.length !== 2) throw new Error("statement (2) models: " + s2);
      const both = s1.filter((x) => s2.includes(x));
      if (both.length < 1) throw new Error("statements inconsistent");
      const uniq = (arr) => new Set(arr).size === 1;
      const a = uniq(s1);
      const b = uniq(s2);
      const c = uniq(both);
      let index;
      if (a && b) index = 3;
      else if (a) index = 0;
      else if (b) index = 1;
      else if (c) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // ── 6. D4 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 4,
    stem_md:
      "The roots of $x^2 - 8x + 12 = 0$ are $r$ and $s$. Which of the following equations has roots $r + 2$ and $s + 2$?",
    choices: [
      "$x^2 - 10x + 14 = 0$",
      "$x^2 - 10x + 32 = 0$",
      "$x^2 - 12x + 16 = 0$",
      "$x^2 - 12x + 32 = 0$",
      "$x^2 + 12x + 32 = 0$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFactor: $x^2 - 8x + 12 = (x - 2)(x - 6)$, so $\\{r, s\\} = \\{2, 6\\}$. The new roots are $4$ and $8$, with sum $12$ and product $32$. The monic equation with those roots is $x^2 - 12x + 32 = 0$.\n\n**Trigger cue**\n\n\"Equation whose roots are shifted copies of the old roots\": rebuild from the new sum and product rather than manipulating the original equation.\n\n**Takeaway**\n\nShifting each root by $k$ adds $2k$ to the sum.",
    fastest_path_md:
      "Roots of the original: factor pair of $12$ summing to $8$, i.e. $2$ and $6$. New roots $4$ and $8$: sum $12$, product $32$, so $x^2 - 12x + 32 = 0$. Confirm by plugging $x = 4$ into the choice.",
    trap_map: {
      "0": "Adds $2$ to each original coefficient instead of to each root.",
      "1": "Shifts the root sum by only $2$ (one root moved) even though the product is handled correctly.",
      "2": "Computes the new product as $12 + 4$ instead of $(2+2)(6+2)$.",
      "4": "Sign error rebuilding from Vieta: this equation's roots are $-4$ and $-8$.",
    },
    numeric_check: null,
    check(q) {
      const roots = [];
      for (let x = -1000; x <= 1000; x++) if (x * x - 8 * x + 12 === 0) roots.push(x);
      if (roots.length !== 2) throw new Error("expected 2 original roots, got " + roots);
      const shifted = roots.map((r) => r + 2);
      const matches = [];
      q.choices.forEach((ch, i) => {
        const m = ch.match(/x\^2\s*([+-])\s*(\d+)x\s*([+-])\s*(\d+)/);
        if (!m) throw new Error("unparseable choice: " + ch);
        const b = (m[1] === "-" ? -1 : 1) * Number(m[2]);
        const c = (m[3] === "-" ? -1 : 1) * Number(m[4]);
        if (shifted.every((r) => r * r + b * r + c === 0)) matches.push(i);
      });
      if (matches.length !== 1) throw new Error("matching choices: " + matches);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 7. D5 DS pure ─────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 5,
    stem_md:
      "If $x$ and $y$ are positive integers with $x > y$, what is the value of $xy$?\n\n(1) $x^2 - y^2 = 13$\n\n(2) $x + y = 13$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\n(1): $x^2 - y^2 = (x - y)(x + y) = 13$. Both factors are positive integers with $x + y > x - y$, and $13$ is prime, so the only split is $x - y = 1$, $x + y = 13$, forcing $(x, y) = (7, 6)$ and $xy = 42$ — sufficient. (2): $x + y = 13$ allows $(12, 1), (11, 2), \\ldots, (7, 6)$, whose products differ — not sufficient. Answer: statement (1) alone.\n\n**Trigger cue**\n\nA difference of squares equal to a prime, with integer variables: factor it and match the factor pairs — one equation can pin two unknowns.\n\n**Takeaway**\n\nInteger constraints can make one equation sufficient.",
    fastest_path_md:
      "$13$ is prime, so $(x - y)(x + y) = 13$ forces $x - y = 1$ and $x + y = 13$: statement (1) alone pins $(7, 6)$. A bare sum, statement (2), leaves many pairs.",
    trap_map: {
      "1": "Dismisses (1) as one equation with two unknowns while assuming the sum in (2) pins the pair.",
      "2": "Combines the statements after reflexively dismissing (1) as one equation in two unknowns.",
      "3": "Assumes any statement that fixes $x + y$ also fixes $xy$, granting (2) alongside (1).",
      "4": "Treats both statements as underdetermined and never tests the integer factor pairs of $13$.",
    },
    numeric_check: null,
    check() {
      const N = 600;
      const s1 = [];
      const s2 = [];
      for (let x = 2; x <= N; x++) {
        for (let y = 1; y < x; y++) {
          if (x * x - y * y === 13) s1.push([x, y]);
          if (x + y === 13) s2.push([x, y]);
        }
      }
      // completeness: (x-y)(x+y)=13 with positive integers forces x+y <= 13,
      // and x+y=13 is bounded, so all models of each statement lie in the grid
      if (s1.length < 1) throw new Error("no models for statement (1)");
      if (s2.length < 3) throw new Error("too few models for statement (2): " + s2.length);
      const both = s1.filter(([x, y]) => x + y === 13);
      if (both.length < 1) throw new Error("statements inconsistent");
      const uniq = (pairs) => new Set(pairs.map(([x, y]) => x * y)).size === 1;
      const a = uniq(s1);
      const b = uniq(s2);
      const c = uniq(both);
      let index;
      if (a && b) index = 3;
      else if (a) index = 0;
      else if (b) index = 1;
      else if (c) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
