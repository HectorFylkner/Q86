/**
 * Batch 2: quadratics_factoring (equal_unequal_alg / algebra) — 11 items.
 * D2 PS pure (arith), D3 PS pure, D3 PS real, D3 PS pure, D3 DS pure,
 * D4 PS pure, D4 PS real, D4 PS pure, D5 DS pure, D5 PS pure, D5 PS pure.
 * New angles vs batch 1: numeric difference of squares, non-monic Vieta
 * reciprocals, triangular-number real context, biquadratic, perfect-square DS,
 * root-gap via symmetric functions, uniform-border area, common-root parameter,
 * factor-pair DS where combining still fails (E), Simon's factoring trick,
 * self-referential coefficients-as-roots.
 * Run: node --experimental-strip-types scripts/author/batch2-quadratics_factoring.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ── 1. D2 PS pure (arithmetic) — numeric difference of squares ─────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 2,
    stem_md: "What is the value of $41^2 - 39^2$?",
    choices: ["$4$", "$80$", "$160$", "$320$", "$6{,}400$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nApply the difference-of-squares identity: $41^2 - 39^2 = (41 - 39)(41 + 39) = 2 \\cdot 80 = 160$. No squaring is ever required.\n\n**Trigger cue**\n\nA difference of two squares of nearby numbers: factor as $(a-b)(a+b)$ instead of computing either square.\n\n**Takeaway**\n\nFactor differences of squares before ever squaring.",
    fastest_path_md:
      "Both numbers straddle $40$: $(40+1)^2 - (40-1)^2 = 4 \\cdot 40 = 160$, since the $40^2$ and $1$ terms cancel.",
    trap_map: {
      "0": "Squares the difference, computing $(41 - 39)^2$ instead of factoring.",
      "1": "Keeps the sum $41 + 39$ but drops the factor $(41 - 39) = 2$.",
      "3": "Multiplies the sum by the squared difference, $(41-39)^2(41+39)$.",
      "4": "Squares the sum, computing $(41 + 39)^2$.",
    },
    numeric_check: "160",
    check() {
      // direct arithmetic, independent of the factoring identity
      return { kind: "value", value: 41 * 41 - 39 * 39 };
    },
  },

  // ── 2. D3 PS pure — reciprocal root sum, non-monic quadratic ───────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 3,
    stem_md:
      "If $r$ and $s$ are the two roots of the equation $2x^2 - 7x + 3 = 0$, what is the value of $\\dfrac{1}{r} + \\dfrac{1}{s}$?",
    choices: [
      "$\\dfrac{3}{7}$",
      "$\\dfrac{7}{6}$",
      "$\\dfrac{7}{3}$",
      "$\\dfrac{7}{2}$",
      "$\\dfrac{14}{3}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nCombine the reciprocals: $\\dfrac{1}{r} + \\dfrac{1}{s} = \\dfrac{r + s}{rs}$. For $2x^2 - 7x + 3 = 0$, Vieta with leading coefficient $2$ gives $r + s = \\dfrac{7}{2}$ and $rs = \\dfrac{3}{2}$, so the value is $\\dfrac{7/2}{3/2} = \\dfrac{7}{3}$. (Check: the equation factors as $(2x-1)(x-3)$, roots $\\tfrac{1}{2}$ and $3$, and $2 + \\tfrac{1}{3} = \\tfrac{7}{3}$.)\n\n**Trigger cue**\n\nA sum of root reciprocals: convert to $\\frac{r+s}{rs}$ and read both off the coefficients — never solve for the roots.\n\n**Takeaway**\n\nReciprocal root sums come straight from the coefficients.",
    fastest_path_md:
      "For $ax^2 + bx + c$, $\\frac{1}{r} + \\frac{1}{s} = \\frac{-b/a}{c/a} = \\frac{-b}{c}$: the $a$ cancels, giving $\\frac{7}{3}$ in one step.",
    trap_map: {
      "0": "Inverts the target, computing $\\frac{rs}{r+s}$ instead of $\\frac{r+s}{rs}$.",
      "1": "Uses the raw constant $3$ as the product, ignoring the leading coefficient only in $rs$.",
      "3": "Reports the root sum $r + s$ itself instead of the reciprocal sum.",
      "4": "Uses the raw coefficient $7$ as the sum, ignoring the leading coefficient only in $r + s$.",
    },
    numeric_check: "7/3",
    check() {
      // locate both roots of 2x^2 - 7x + 3 by sign-change scan + bisection
      const f = (x) => 2 * x * x - 7 * x + 3;
      const roots = [];
      for (let i = -20000; i < 20000; i++) {
        const a = i / 1000;
        const b = (i + 1) / 1000;
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
      // a quadratic has at most 2 roots; finding 2 means we have them all
      if (roots.length !== 2) throw new Error("expected 2 roots, got " + roots.length);
      return { kind: "value", value: 1 / roots[0] + 1 / roots[1] };
    },
  },

  // ── 3. D3 PS real — handshake count, quadratic in disguise ─────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 3,
    stem_md:
      "At a meeting, each of the $n$ people present shook hands exactly once with each of the other people present. If there was a total of $66$ handshakes, what is the value of $n$?",
    choices: ["$11$", "$12$", "$33$", "$66$", "$132$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nEach unordered pair of people accounts for one handshake, so $\\dfrac{n(n-1)}{2} = 66$, i.e. $n^2 - n - 132 = 0$. Factor: $(n - 12)(n + 11) = 0$. Since $n$ must be positive, $n = 12$.\n\n**Trigger cue**\n\n\"Everyone shakes hands once with everyone else\": the total is $\\frac{n(n-1)}{2}$, and setting it equal to a number yields a factorable quadratic.\n\n**Takeaway**\n\nPairwise handshakes total $n(n-1)/2$; solve the quadratic, keep the positive root.",
    fastest_path_md:
      "Backsolve the middle choices: $n = 12$ gives $\\frac{12 \\cdot 11}{2} = 66$ ✓. Two consecutive integers multiplying to $132$ is fast to spot.",
    trap_map: {
      "0": "Reports the absolute value of the rejected root $-11$ of $n^2 - n - 132 = 0$ (equivalently, uses $n(n+1)/2$).",
      "2": "Divides the $66$ handshakes by $2$ and stops, as if that yielded the head count.",
      "3": "Assumes one handshake per person, equating $n$ to the handshake total.",
      "4": "Doubles $66$ to get $n(n-1) = 132$ and reports that product instead of solving for $n$.",
    },
    numeric_check: "12",
    check() {
      // simulate: count actual pairs for each n, find the n producing 66
      const hits = [];
      for (let n = 2; n <= 500; n++) {
        let count = 0;
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) count++;
        if (count === 66) hits.push(n);
      }
      // pair count is strictly increasing in n, so at most one hit exists
      if (hits.length !== 1) throw new Error("expected exactly 1 solution, got " + hits);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 4. D3 PS pure — biquadratic, product of all real solutions ─────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 3,
    stem_md:
      "What is the product of all real numbers $x$ that satisfy $x^4 - 13x^2 + 36 = 0$?",
    choices: ["$-36$", "$0$", "$6$", "$13$", "$36$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nSubstitute $y = x^2$: $y^2 - 13y + 36 = (y - 4)(y - 9) = 0$, so $x^2 = 4$ or $x^2 = 9$. The real solutions are $x = \\pm 2$ and $x = \\pm 3$ — four of them. Their product is $(2)(-2)(3)(-3) = (-4)(-9) = 36$.\n\n**Trigger cue**\n\nA quartic with only even powers of $x$: substitute $y = x^2$, factor the quadratic in $y$, then remember each positive $y$ yields two $x$-values.\n\n**Takeaway**\n\nEven-power quartics hide a quadratic; keep every $\\pm$ root.",
    fastest_path_md:
      "Each root pairs with its negative, so the product is $(-x^2)(-x^2)$ over the two $x^2$ values: $(-4)(-9) = 36$ — no need to list the four roots.",
    trap_map: {
      "0": "Flips the sign, applying the odd-degree rule that the root product is minus the constant.",
      "1": "Computes the sum of the four solutions instead of the product.",
      "2": "Multiplies only the two positive solutions, $2 \\cdot 3$.",
      "3": "Reports the magnitude of the middle coefficient instead of computing anything.",
    },
    numeric_check: "36",
    check() {
      // brute-force integer scan; a quartic has at most 4 roots, so finding 4 means all found
      const roots = [];
      for (let x = -100; x <= 100; x++) {
        if (x ** 4 - 13 * x * x + 36 === 0) roots.push(x);
      }
      if (roots.length !== 4) throw new Error("expected 4 real roots, got " + roots);
      return { kind: "value", value: roots.reduce((a, b) => a * b, 1) };
    },
  },

  // ── 5. D3 DS pure — perfect square in disguise + sign information ──────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 3,
    stem_md:
      "What is the value of $x + y$?\n\n(1) $x^2 + 2xy + y^2 = 49$\n\n(2) $x > 0$ and $y > 0$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n(1): The left side is a perfect square: $(x + y)^2 = 49$, so $x + y = 7$ or $x + y = -7$ — two values, not sufficient. (2): Positivity alone says nothing about the size of $x + y$ — not sufficient. Together: $x > 0$ and $y > 0$ force $x + y > 0$, which eliminates $-7$ and leaves $x + y = 7$ — sufficient. Answer: both statements together.\n\n**Trigger cue**\n\n$x^2 + 2xy + y^2$ is $(x+y)^2$ in disguise; a squared quantity always leaves a $\\pm$ ambiguity that only sign information can resolve.\n\n**Takeaway**\n\nA squared quantity yields two candidates until signs decide.",
    fastest_path_md:
      "Read (1) as $(x+y)^2 = 49$ instantly: two candidates, $\\pm 7$. Statement (2) is exactly the sign filter that ambiguity needs — combined, sufficient.",
    trap_map: {
      "0": "Takes only the positive square root of $49$, making statement (1) alone look sufficient.",
      "1": "Dismisses (1) as one equation in two unknowns while crediting the sign constraints in (2) with fixing $x + y$.",
      "3": "Takes the positive root in (1) and separately assumes positivity in (2) pins the pair, granting each alone.",
      "4": "Never recognizes the perfect square, sees two unknowns in one equation, and dismisses everything.",
    },
    numeric_check: null,
    check() {
      // enumerate (x, y) on a quarter-step grid; every model class of each
      // statement is represented: (1) forces (x+y)^2 = 49, and the grid holds
      // pairs on both the x+y = 7 and x+y = -7 branches, plus assorted
      // positive pairs for (2). Grid values are exact in binary floats.
      const s1 = [];
      const s2 = [];
      for (let i = -160; i <= 160; i++) {
        for (let j = -160; j <= 160; j++) {
          const x = i / 4;
          const y = j / 4;
          if (x * x + 2 * x * y + y * y === 49) s1.push([x, y]);
          if (x > 0 && y > 0) s2.push([x, y]);
        }
      }
      if (s1.length < 4) throw new Error("too few models for (1): " + s1.length);
      const both = s1.filter(([x, y]) => x > 0 && y > 0);
      if (both.length < 2) throw new Error("too few combined models");
      const sums1 = new Set(s1.map(([x, y]) => x + y));
      if (!sums1.has(7) || !sums1.has(-7)) throw new Error("grid missed a branch of (1)");
      const uniq = (pairs) => new Set(pairs.map(([x, y]) => x + y)).size === 1;
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

  // ── 6. D4 PS pure — root gap of an irrational-root quadratic ───────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 4,
    stem_md:
      "If $r$ and $s$ are the roots of the equation $x^2 - 6x + 7 = 0$, what is the value of $|r - s|$?",
    choices: ["$\\sqrt{2}$", "$\\sqrt{22}$", "$2\\sqrt{2}$", "$6$", "$8$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nVieta gives $r + s = 6$ and $rs = 7$. Then $(r - s)^2 = (r + s)^2 - 4rs = 36 - 28 = 8$, so $|r - s| = \\sqrt{8} = 2\\sqrt{2}$. Solving for the roots ($3 \\pm \\sqrt{2}$) works but wastes time.\n\n**Trigger cue**\n\nAsked for a combination of roots when the quadratic doesn't factor over the integers: build it from $r + s$ and $rs$, never from the roots themselves.\n\n**Takeaway**\n\nRoot gaps come from $(r+s)^2 - 4rs$, not from solving.",
    fastest_path_md:
      "The gap between the roots is $\\dfrac{\\sqrt{b^2 - 4ac}}{a} = \\sqrt{36 - 28} = 2\\sqrt{2}$ — the discriminant hands it over directly.",
    trap_map: {
      "0": "Computes the vertex-to-root distance $\\sqrt{(r+s)^2/4 - rs} = \\sqrt{2}$ and forgets to double it.",
      "1": "Applies the $r^2 + s^2$ identity, computing $\\sqrt{36 - 2 \\cdot 7}$ instead of subtracting $4rs$.",
      "3": "Reports the root sum $r + s$ instead of the gap.",
      "4": "Stops at $(r - s)^2 = 8$ and forgets the square root.",
    },
    numeric_check: "2*sqrt(2)",
    check() {
      // locate both roots by sign-change scan + bisection, then take the gap
      const f = (x) => x * x - 6 * x + 7;
      const roots = [];
      for (let i = -20000; i < 20000; i++) {
        const a = i / 1000;
        const b = (i + 1) / 1000;
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
      return { kind: "value", value: Math.abs(roots[0] - roots[1]) };
    },
  },

  // ── 7. D4 PS real — uniform walkway around a pool ──────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 4,
    stem_md:
      "A rectangular pool $8$ meters wide and $12$ meters long is surrounded on all sides by a walkway of uniform width. If the area of the walkway is $224$ square meters, what is the width of the walkway, in meters?",
    choices: ["$2$", "$4$", "$8$", "$14$", "$28$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nA walkway of width $w$ adds $2w$ to each dimension, so the outer rectangle is $(8 + 2w)(12 + 2w)$. The walkway area is the outer area minus the pool: $(8 + 2w)(12 + 2w) - 96 = 224$. Expanding: $4w^2 + 40w - 224 = 0$, i.e. $w^2 + 10w - 56 = 0$, which factors as $(w + 14)(w - 4) = 0$. Since $w > 0$, $w = 4$.\n\n**Trigger cue**\n\nA border of uniform width around a rectangle: the frame adds twice the width to each dimension, and \"border area\" means outer minus inner.\n\n**Takeaway**\n\nA uniform border adds twice its width to each dimension.",
    fastest_path_md:
      "Backsolve: $w = 4$ makes the outer rectangle $16 \\times 20 = 320$, and $320 - 96 = 224$ ✓. Testing the middle choice first ends it in one step.",
    trap_map: {
      "0": "Halves the correct width again, double-counting the two-sides adjustment.",
      "2": "Adds the width to each dimension only once, solving $(8 + w)(12 + w) - 96 = 224$.",
      "3": "Reports the absolute value of the rejected root $-14$ of $w^2 + 10w - 56 = 0$.",
      "4": "Reports the absolute value of the rejected root $-28$ from the width-added-once setup.",
    },
    numeric_check: "4",
    check() {
      // walkway area is strictly increasing in w for w > 0, so bisect for the unique solution
      const area = (w) => (8 + 2 * w) * (12 + 2 * w) - 8 * 12;
      if (!(area(0) < 224 && area(100) > 224)) throw new Error("bracket failed");
      let lo = 0, hi = 100;
      for (let k = 0; k < 300; k++) {
        const mid = (lo + hi) / 2;
        if (area(mid) < 224) lo = mid;
        else hi = mid;
      }
      return { kind: "value", value: (lo + hi) / 2 };
    },
  },

  // ── 8. D4 PS pure — parameter values sharing exactly one root ──────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 4,
    stem_md:
      "The equations $x^2 - 7x + 12 = 0$ and $x^2 + bx - 12 = 0$ have exactly one root in common. What is the sum of all possible values of $b$?",
    choices: ["$-7$", "$-1$", "$0$", "$1$", "$7$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFactor the first equation: $(x - 3)(x - 4) = 0$, so the shared root must be $3$ or $4$. If $3$ is a root of the second equation: $9 + 3b - 12 = 0$ gives $b = 1$ (then $x^2 + x - 12 = (x + 4)(x - 3)$, sharing only $3$ ✓). If $4$ is a root: $16 + 4b - 12 = 0$ gives $b = -1$ (then $(x - 4)(x + 3)$, sharing only $4$ ✓). The sum is $1 + (-1) = 0$.\n\n**Trigger cue**\n\n\"Common root\" with a parameter: a shared root must satisfy the parameter-free equation first, so find its roots and substitute each into the other equation.\n\n**Takeaway**\n\nA shared root satisfies both equations; test each candidate root.",
    fastest_path_md:
      "The shared root is $3$ or $4$; each substitution $b = \\frac{12 - r^2}{r}$ takes seconds and gives $1$ and $-1$ — symmetric values summing to $0$.",
    trap_map: {
      "0": "Assumes the equations share both roots and matches the middle coefficients, taking $b = -7$.",
      "1": "Substitutes only the root $4$, missing the case where the shared root is $3$.",
      "3": "Substitutes only the root $3$, missing the case where the shared root is $4$.",
      "4": "Reports the root sum of the first equation instead of the sum of the $b$-values.",
    },
    numeric_check: "0",
    check() {
      // roots of the parameter-free equation by integer scan (monic integer
      // quadratic: 2 found = all found)
      const roots1 = [];
      for (let x = -200; x <= 200; x++) if (x * x - 7 * x + 12 === 0) roots1.push(x);
      if (roots1.length !== 2) throw new Error("expected 2 roots, got " + roots1);
      // any common root lies in roots1, and each choice of common root forces
      // one b, so scanning a fine b-grid and keeping exact matches is complete
      const near = (u, v) => Math.abs(u - v) < 1e-9;
      const found = [];
      for (let i = -400; i <= 400; i++) {
        const b = i / 4;
        const disc = b * b + 48; // b^2 - 4(1)(-12) > 0 always
        const r1 = (-b + Math.sqrt(disc)) / 2;
        const r2 = (-b - Math.sqrt(disc)) / 2;
        const common = roots1.filter((r) => near(r, r1) || near(r, r2));
        if (common.length === 1) found.push(b);
      }
      if (found.length !== 2) throw new Error("expected 2 values of b, got " + found);
      return { kind: "value", value: found.reduce((a, x) => a + x, 0) };
    },
  },

  // ── 9. D5 DS pure — factor pairs where combining still fails ───────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 5,
    stem_md:
      "If $k$ is a positive integer, what is the value of $k$?\n\n(1) The equation $x^2 - kx + 8 = 0$ has two distinct roots, each of which is a positive integer.\n\n(2) $k$ is a multiple of $3$.",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\n(1): The roots multiply to $8$ and sum to $k$. Distinct positive integer pairs with product $8$: $(1, 8)$ giving $k = 9$, and $(2, 4)$ giving $k = 6$. Two values — not sufficient. (2): $k \\in \\{3, 6, 9, \\ldots\\}$ — not sufficient. Together: test each survivor from (1) against (2) — but $6$ and $9$ are BOTH multiples of $3$, so two values remain. Not sufficient even combined. Answer: E.\n\n**Trigger cue**\n\nInteger-root conditions mean factor pairs of the constant term; when combining statements, test every surviving candidate — extra information does not automatically narrow.\n\n**Takeaway**\n\nCombined sufficiency requires testing every surviving candidate.\n",
    fastest_path_md:
      "List (1)'s candidates first: $k = 6$ or $9$. Then run them through (2): both are multiples of $3$, so nothing is eliminated — E in seconds.",
    trap_map: {
      "0": "Finds only the factor pair $(2, 4)$ of $8$, missing $(1, 8)$, and thinks (1) alone forces $k = 6$.",
      "1": "Dismisses (1) as unsolvable with an unknown in it and treats the multiple-of-3 condition as naming one value.",
      "2": "Assumes combining must narrow $\\{6, 9\\}$ to one value without actually testing each against (2).",
      "3": "Makes both slips: keeps a single factor pair in (1) and reads (2) as pinning a specific multiple.",
    },
    numeric_check: null,
    check() {
      const N = 2000;
      const s1 = [];
      const s2 = [];
      for (let k = 1; k <= N; k++) {
        // brute integer-root scan: monic quadratic has at most 2 roots, so
        // finding 2 distinct positive integers means both roots qualify
        const intRoots = [];
        for (let x = 1; x <= N; x++) if (x * x - k * x + 8 === 0) intRoots.push(x);
        if (intRoots.length === 2) s1.push(k);
        if (k % 3 === 0) s2.push(k);
      }
      // completeness: positive integer roots of x^2 - kx + 8 multiply to 8,
      // so each root is at most 8 and k = root sum is at most 9 — well inside N
      if (s1.length < 1) throw new Error("no models for statement (1)");
      if (s2.length < 3) throw new Error("too few models for statement (2)");
      const both = s1.filter((k) => k % 3 === 0);
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

  // ── 10. D5 PS pure — Simon's factoring trick with a max constraint ─────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 5,
    stem_md:
      "If $x$ and $y$ are positive integers such that $xy + 5x + 2y = 100$, what is the greatest possible value of $x + y$?",
    choices: ["$14$", "$17$", "$20$", "$22$", "$27$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nForce a factorization by adding $5 \\cdot 2 = 10$ to both sides: $xy + 5x + 2y + 10 = 110$, so $(x + 2)(y + 5) = 110$. With $x, y \\geq 1$, we need $x + 2 \\geq 3$ and $y + 5 \\geq 6$. Divisor pairs of $110 = 2 \\cdot 5 \\cdot 11$ meeting both bounds: $(5, 22) \\to (x, y) = (3, 17)$; $(10, 11) \\to (8, 6)$; $(11, 10) \\to (9, 5)$. The sums are $20$, $14$, $14$, so the greatest is $20$.\n\n**Trigger cue**\n\n$xy$ plus linear terms with an integer constraint: add the product of the two linear coefficients and factor (Simon's trick), then enumerate divisor pairs.\n\n**Takeaway**\n\nAdd the shift product to force integer factor pairs.",
    fastest_path_md:
      "After $(x+2)(y+5) = 110$, a sum is maximized by the most lopsided legal split: push $x + 2$ down to its smallest allowed divisor, $5$, giving $(3, 17)$ and sum $20$.",
    trap_map: {
      "0": "Stops at the factor pair $10 \\times 11$, reporting $(8, 6)$ without checking lopsided splits.",
      "1": "Reports the greatest possible value of $y$ alone rather than $x + y$.",
      "3": "Factors to $(x + 2)(y + 5) = 100$, forgetting to add $10$ to the right side too.",
      "4": "Maximizes $(x + 2) + (y + 5) = 5 + 22$ and forgets to remove the shifts.",
    },
    numeric_check: "20",
    check() {
      // exhaustive: xy + 5x + 2y = 100 with x, y >= 1 forces x, y < 100
      let best = -Infinity;
      let count = 0;
      for (let x = 1; x <= 200; x++) {
        for (let y = 1; y <= 200; y++) {
          if (x * y + 5 * x + 2 * y === 100) {
            count++;
            if (x + y > best) best = x + y;
          }
        }
      }
      if (count < 2) throw new Error("expected multiple solutions, got " + count);
      return { kind: "value", value: best };
    },
  },

  // ── 11. D5 PS pure — coefficients that are their own roots ─────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 5,
    stem_md:
      "If $q \\neq 0$ and the two solutions of the equation $x^2 + px + q = 0$ are $p$ and $q$, what is the value of $p + q$?",
    choices: ["$-3$", "$-2$", "$-1$", "$1$", "$3$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nVieta on $x^2 + px + q$ with roots $p$ and $q$: the product gives $pq = q$, and since $q \\neq 0$, dividing by $q$ yields $p = 1$. The sum gives $p + q = -p = -1$, so $q = -2$. Check: $x^2 + x - 2 = (x - 1)(x + 2)$ has roots $1$ and $-2$, which are exactly $p$ and $q$ ✓. Thus $p + q = -1$.\n\n**Trigger cue**\n\nCoefficients that reappear as the roots: write both Vieta equations, and use the given nonzero value to divide safely.\n\n**Takeaway**\n\nDivide by a variable only when it is known nonzero.",
    fastest_path_md:
      "Take the product equation first: $pq = q$ collapses to $p = 1$ in one step because $q \\neq 0$; the sum equation then hands over $q = -2$. The answer is the sum itself, $-p = -1$.",
    trap_map: {
      "0": "Computes $q - p = -2 - 1$ instead of $p + q$.",
      "1": "Reports $q$ alone (equivalently the product $pq$) instead of the sum.",
      "3": "Reports $p$ alone instead of the sum.",
      "4": "Computes $p - q = 1 - (-2)$ instead of $p + q$.",
    },
    numeric_check: "1 + (-2)",
    check() {
      // brute-force grid search: for each (p, q), compute the quadratic's
      // actual roots and demand the root multiset equal {p, q}. Vieta forces
      // any solution to satisfy pq = q and p + q = -p exactly, i.e. the
      // integer point (1, -2), so the quarter-step grid provably contains
      // every solution.
      const near = (u, v) => Math.abs(u - v) < 1e-9;
      const sums = new Set();
      for (let i = -320; i <= 320; i++) {
        for (let j = -320; j <= 320; j++) {
          const p = i / 4;
          const q = j / 4;
          if (q === 0) continue;
          const disc = p * p - 4 * q;
          if (disc < 0) continue;
          const s = Math.sqrt(disc);
          const r1 = (-p + s) / 2;
          const r2 = (-p - s) / 2;
          const match =
            (near(r1, p) && near(r2, q)) || (near(r1, q) && near(r2, p));
          if (match) sums.add(p + q);
        }
      }
      if (sums.size !== 1) throw new Error("p + q not unique: " + [...sums]);
      return { kind: "value", value: [...sums][0] };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
