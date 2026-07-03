/**
 * Batch: exponents_roots_properties (fundamental_skill value_order_factors,
 * content_domain algebra). 9 items — see cell plan in the task.
 * Run from repo root: node scripts/author/batch-exponents_roots_properties.mjs
 * Append for real with: APPEND=1 node scripts/author/batch-exponents_roots_properties.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

/**
 * DS sufficiency by enumeration. `models` is a finite list of scenarios all
 * consistent with the stem; s1/s2 are the statement predicates; answer maps
 * a model to the question's answer (number or boolean). Returns the canonical
 * DS index 0..4.
 */
function dsVerdict(models, s1, s2, answer) {
  const set1 = models.filter(s1);
  const set2 = models.filter(s2);
  const both = models.filter((m) => s1(m) && s2(m));
  if (models.length < 2 || set1.length < 1 || set2.length < 1 || both.length < 1) {
    throw new Error(
      `degenerate model sets: all=${models.length} s1=${set1.length} s2=${set2.length} both=${both.length}`,
    );
  }
  const key = (v) => (typeof v === "number" ? v.toFixed(9) : String(v));
  const decided = (set) => new Set(set.map((m) => key(answer(m)))).size === 1;
  const suff1 = decided(set1);
  const suff2 = decided(set2);
  const suffBoth = decided(both);
  if (suff1 && suff2) return 3;
  if (suff1) return 0;
  if (suff2) return 1;
  if (suffBoth) return 2;
  return 4;
}

const items = [
  // ── Cell 1: D4 DS pure — equating exponents needs base ≠ 1 ────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 4,
    stem_md:
      "If $b$ is a positive number, what is the value of $x$?\n\n(1) $b^{x} = b^{2x - 6}$\n\n(2) $b = 3$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\nStatement (1): if $b \\ne 1$, equal powers of the same base force equal exponents, so $x = 2x - 6$ and $x = 6$. But $b = 1$ also satisfies $b^{x} = b^{2x-6}$ for every $x$, since both sides equal $1$. So $x$ is not determined — insufficient.\n\nStatement (2): $b = 3$ carries no information about $x$ — insufficient.\n\nTogether: $b = 3 \\ne 1$, so exponents must match: $x = 2x - 6 \\Rightarrow x = 6$, a unique value. Sufficient.\n\n**Trigger cue**\nAn equation of the form $b^{\\text{stuff}} = b^{\\text{other stuff}}$: before equating exponents, ask whether the base could be $1$.\n\n**Takeaway**\nEquating exponents requires a base other than $1$.",
    fastest_path_md:
      "Statement (2) contains no $x$, so B and D die instantly. For (1), test $b = 1$: every $x$ works, so A dies. Together $3^{x} = 3^{2x-6}$ forces $x = 6$ — C.",
    trap_map: {
      "0": "Equates the exponents in statement (1) immediately, forgetting that $b = 1$ satisfies the equation for every $x$.",
      "1": "Treats knowing the base as knowing the whole equation, though statement (2) says nothing about $x$.",
      "3": "Combines both errors: equates exponents in (1) and credits (2) with fixing $x$ on its own.",
      "4": "Misses that once $b = 3 \\ne 1$ is known, the exponent equation $x = 2x - 6$ has the single solution $x = 6$.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (const b of [0.25, 0.5, 1, 2, 3, 4]) {
        for (let k = -40; k <= 40; k++) models.push({ b, x: k / 4 });
      }
      const s1 = (m) => Math.abs(Math.log(m.b) * ((2 * m.x - 6) - m.x)) < 1e-9;
      const s2 = (m) => m.b === 3;
      // sanity: statement (1) admits the b=1 family plus the x=6 family
      if (models.filter(s1).length < 20) throw new Error("statement (1) model set too small");
      return { kind: "index", index: dsVerdict(models, s1, s2, (m) => m.x) };
    },
  },

  // ── Cell 2: D2 PS pure — negative exponent on a fraction ──────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 2,
    stem_md: "What is the value of $\\left(\\dfrac{1}{2}\\right)^{-3}$?",
    choices: ["-8", "-6", "$\\dfrac{1}{8}$", "6", "8"],
    correct_index: 4,
    solution_md:
      "**Formal path**\nA negative exponent inverts the base: $\\left(\\dfrac{1}{2}\\right)^{-3} = \\left(\\dfrac{2}{1}\\right)^{3} = 2^{3} = 8$.\n\n**Trigger cue**\nA negative exponent on a fraction: flip the fraction and the exponent turns positive.\n\n**Takeaway**\nA negative exponent inverts the base, never the sign.",
    fastest_path_md:
      "Flip the fraction to clear the negative exponent: $\\left(\\tfrac12\\right)^{-3} = 2^{3} = 8$.",
    trap_map: {
      "0": "Inverts the fraction correctly but also attaches the exponent's negative sign to the result, giving $-8$.",
      "1": "Multiplies the denominator by the exponent, $2 \\times (-3) = -6$, instead of applying the power.",
      "2": "Ignores the negative sign entirely and computes $\\left(\\tfrac12\\right)^{3} = \\tfrac18$.",
      "3": "Multiplies $2$ by $3$ after dropping both the fraction and the negative sign.",
    },
    numeric_check: "(1/2)^(-3)",
    check() {
      return { kind: "value", value: Math.pow(1 / 2, -3) };
    },
  },

  // ── Cell 3: D4 DS pure — sign of a negative base via exponent parity ──────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 4,
    stem_md:
      "If $n$ is an integer, is $(-5)^{n} > 0$?\n\n(1) $(-5)^{n+1} < 0$\n\n(2) $5^{n} < 1$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n$(-5)^{n}$ is positive exactly when $n$ is even, so the question asks: is $n$ even?\n\nStatement (1): $(-5)^{n+1} < 0$ means $n + 1$ is odd, so $n$ is even. The answer is a definite yes — sufficient.\n\nStatement (2): $5^{n} < 1$ means $n < 0$. Then $n = -1$ gives $(-5)^{-1} = -\\tfrac{1}{5} < 0$ (no), while $n = -2$ gives $(-5)^{-2} = \\tfrac{1}{25} > 0$ (yes) — insufficient.\n\n**Trigger cue**\nA negative base raised to an integer power: the sign depends only on the parity of the exponent, not its size or sign.\n\n**Takeaway**\nA negative base is positive exactly at even integer exponents.",
    fastest_path_md:
      "Parity is everything. (1) says $n+1$ is odd, so $n$ is even — definite yes. (2) only says $n < 0$: test $n = -1$ (no) and $n = -2$ (yes). Answer A.",
    trap_map: {
      "1": "Reads $5^{n} < 1$ as forcing a negative power and assumes a negative exponent makes $(-5)^{n}$ negative.",
      "2": "Believes the parity from (1) still needs the sign information from (2) before the question can be answered.",
      "3": "Credits (2) with fixing the sign of $(-5)^{n}$, though negative even and odd exponents give opposite signs.",
      "4": "Assumes the sign of $(-5)^{n}$ cannot be settled without knowing $n$ itself, missing the parity shortcut in (1).",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let n = -8; n <= 8; n++) models.push({ n });
      const s1 = (m) => Math.pow(-5, m.n + 1) < 0;
      const s2 = (m) => Math.pow(5, m.n) < 1;
      if (models.filter(s1).length < 5 || models.filter(s2).length < 5)
        throw new Error("statement model sets too small");
      return {
        kind: "index",
        index: dsVerdict(models, s1, s2, (m) => Math.pow(-5, m.n) > 0),
      };
    },
  },

  // ── Cell 4: D3 PS pure — combining unlike radicals ────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 3,
    stem_md:
      "If $\\sqrt{72} + \\sqrt{50} - \\sqrt{8} = k\\sqrt{2}$, what is the value of $k$?",
    choices: ["3", "9", "13", "57", "114"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nPull the largest perfect square out of each radicand: $\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$, $\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$, and $\\sqrt{8} = \\sqrt{4 \\cdot 2} = 2\\sqrt{2}$. Then\n$$6\\sqrt{2} + 5\\sqrt{2} - 2\\sqrt{2} = (6 + 5 - 2)\\sqrt{2} = 9\\sqrt{2},$$\nso $k = 9$.\n\n**Trigger cue**\nA sum or difference of square roots set equal to a multiple of one surd: simplify each radical to that common surd, then combine coefficients.\n\n**Takeaway**\nSimplify each radical to a common surd, then add coefficients.",
    fastest_path_md:
      "$\\sqrt{72} = 6\\sqrt{2}$, $\\sqrt{50} = 5\\sqrt{2}$, $\\sqrt{8} = 2\\sqrt{2}$; coefficients give $6 + 5 - 2 = 9$.",
    trap_map: {
      "0": "Swaps the signs on the last two terms and computes $6 - 5 + 2 = 3$.",
      "2": "Ignores the minus sign and adds all three coefficients: $6 + 5 + 2 = 13$.",
      "3": "Combines everything under one radical first — $\\sqrt{72 + 50 - 8} = \\sqrt{2 \\cdot 57}$ — and reads off $57$ as $k$.",
      "4": "Adds and subtracts the radicands directly to get $\\sqrt{114}$ and reports the radicand $114$.",
    },
    numeric_check: "(sqrt(72)+sqrt(50)-sqrt(8))/sqrt(2)",
    check() {
      const k = (Math.sqrt(72) + Math.sqrt(50) - Math.sqrt(8)) / Math.sqrt(2);
      return { kind: "value", value: k };
    },
  },

  // ── Cell 5: D4 DS pure — root vs. base for 0 < x < 1 ──────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 4,
    stem_md:
      "If $x > 0$, is $\\sqrt{x} > x$?\n\n(1) $x^{2} < 4$\n\n(2) $x^{3} < x$",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\nFor $x > 0$, squaring both sides of $\\sqrt{x} > x$ gives $x > x^{2}$, i.e. $x(1 - x) > 0$, i.e. $0 < x < 1$. So the question is: is $x < 1$?\n\nStatement (1): $x^{2} < 4$ with $x > 0$ gives $0 < x < 2$. Then $x = \\tfrac{1}{2}$ answers yes while $x = \\tfrac{3}{2}$ answers no — insufficient.\n\nStatement (2): $x^{3} < x$ with $x > 0$ divides by the positive number $x$ to give $x^{2} < 1$, so $0 < x < 1$. The answer is a definite yes — sufficient.\n\n**Trigger cue**\nComparing $x$ with $\\sqrt{x}$ or with powers of $x$ for positive $x$: everything reduces to where $x$ sits relative to $1$.\n\n**Takeaway**\nFor positive $x$, $\\sqrt{x}$ exceeds $x$ only when $x < 1$.",
    fastest_path_md:
      "Translate the question first: for $x > 0$, $\\sqrt{x} > x$ exactly when $x < 1$. (2) $x^{3} < x$ divides to $x^{2} < 1$, so $x < 1$ — sufficient. (1) allows both $x = \\tfrac12$ and $x = \\tfrac32$ — insufficient. B.",
    trap_map: {
      "0": "Reads $x^{2} < 4$ as $x < 2$ and assumes every such $x$ has $\\sqrt{x} > x$, ignoring values between $1$ and $2$.",
      "2": "Thinks (2) still needs (1)'s upper bound, not seeing that $x^{3} < x$ with $x > 0$ already forces $x < 1$.",
      "3": "Credits (1) as well, overlooking that $x = \\tfrac32$ satisfies $x^{2} < 4$ yet gives $\\sqrt{x} < x$.",
      "4": "Fails to decode $x^{3} < x$ into $0 < x < 1$ and concludes neither statement settles the comparison.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let k = 1; k <= 40; k++) models.push({ x: k / 8 });
      const s1 = (m) => m.x * m.x < 4;
      const s2 = (m) => m.x * m.x * m.x < m.x;
      if (models.filter(s1).length < 5 || models.filter(s2).length < 5)
        throw new Error("statement model sets too small");
      return {
        kind: "index",
        index: dsVerdict(models, s1, s2, (m) => Math.sqrt(m.x) > m.x),
      };
    },
  },

  // ── Cell 6: D4 DS pure — the three ways a power equals 1 ──────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 4,
    stem_md:
      "What is the value of $x$?\n\n(1) $7^{x^{2}} = 7^{4x - 3}$\n\n(2) $x^{x - 3} = 1$",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\nStatement (1): the base $7$ exceeds $1$, so the exponents are equal: $x^{2} = 4x - 3$, i.e. $(x - 1)(x - 3) = 0$, so $x = 1$ or $x = 3$ — two values, insufficient.\n\nStatement (2): a power equals $1$ in three ways — exponent $0$ with nonzero base ($x = 3$), base $1$ ($x = 1$), or base $-1$ with an even integer exponent ($x = -1$, since $(-1)^{-4} = 1$). So $x \\in \\{-1, 1, 3\\}$ — insufficient.\n\nTogether: the intersection is $\\{1, 3\\}$, still two candidate values — insufficient.\n\n**Trigger cue**\nAny equation of the form $(\\text{expression})^{(\\text{expression})} = 1$: enumerate all three cases before judging sufficiency.\n\n**Takeaway**\n$a^{b} = 1$ has three cases; intersecting them can stay ambiguous.",
    fastest_path_md:
      "Test $x = 1$ and $x = 3$: both satisfy statement (1) ($7^{1} = 7^{1}$ and $7^{9} = 7^{9}$) and both satisfy statement (2) ($1^{-2} = 1$ and $3^{0} = 1$). Two survivors of both statements — E, no further work needed.",
    trap_map: {
      "0": "Solves $x^{2} = 4x - 3$ but keeps only the root $x = 3$, missing $x = 1$ from the factoring.",
      "1": "Reads $x^{x-3} = 1$ as forcing the exponent to be $0$, so $x = 3$ uniquely — missing the base-$1$ and base-$(-1)$ cases.",
      "2": "Drops $x = 1$ from one of the two solution sets, so the intersection appears to collapse to the single value $3$.",
      "3": "Believes each statement independently pins $x = 3$, overlooking the second root in (1) and the extra cases in (2).",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let k = -40; k <= 40; k++) models.push({ x: k / 4 });
      const s1 = (m) => Math.abs(m.x * m.x - (4 * m.x - 3)) < 1e-9;
      const s2 = (m) => {
        const e = m.x - 3;
        if (m.x > 0) return Math.abs(Math.pow(m.x, e) - 1) < 1e-9;
        if (m.x < 0 && Number.isInteger(e))
          return Math.abs(Math.pow(m.x, e) - 1) < 1e-9;
        return false; // x = 0 or negative non-integer base: power undefined
      };
      const n1 = models.filter(s1).length;
      const n2 = models.filter(s2).length;
      if (n1 < 2 || n2 < 3) throw new Error(`model sets too small: s1=${n1} s2=${n2}`);
      return { kind: "index", index: dsVerdict(models, s1, s2, (m) => m.x) };
    },
  },

  // ── Cell 7: D5 PS pure — quadratic in disguise via u = 2^x ────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 5,
    stem_md:
      "If $2^{2x} - 6 \\cdot 2^{x} + 8 = 0$, what is the sum of all possible values of $x$?",
    choices: ["1", "2", "3", "6", "8"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $u = 2^{x}$, so $u > 0$ and $2^{2x} = u^{2}$. The equation becomes\n$$u^{2} - 6u + 8 = 0 \\Rightarrow (u - 2)(u - 4) = 0 \\Rightarrow u = 2 \\text{ or } u = 4.$$\nConverting back: $2^{x} = 2$ gives $x = 1$, and $2^{x} = 4$ gives $x = 2$. The sum of all possible values is $1 + 2 = 3$.\n\n**Trigger cue**\n$2^{2x}$ appearing alongside $2^{x}$ is a quadratic in disguise: substitute $u = 2^{x}$.\n\n**Takeaway**\nSubstitute $u = 2^{x}$; solve the quadratic; convert roots back.",
    fastest_path_md:
      "See $(2^{x})^{2} - 6(2^{x}) + 8 = 0$, factor as $(2^{x} - 2)(2^{x} - 4) = 0$, so $x = 1$ or $2$; sum $= 3$.",
    trap_map: {
      "0": "Keeps only the root $2^{x} = 2$, reporting $x = 1$ alone.",
      "1": "Keeps only the root $2^{x} = 4$, reporting $x = 2$ alone.",
      "3": "Sums the roots of the quadratic in $u$ ($2 + 4 = 6$) without converting back to $x$.",
      "4": "Multiplies the $u$-roots ($2 \\cdot 4 = 8$) — the quadratic's constant term — instead of converting to $x$.",
    },
    numeric_check: "1 + 2",
    check() {
      // Locate every real root of f(x) = 2^(2x) - 6*2^x + 8 by sign-change
      // bisection on a fine grid, then sum them.
      const f = (x) => Math.pow(2, 2 * x) - 6 * Math.pow(2, x) + 8;
      const roots = [];
      const start = -10.0001; // offset so no grid point is an exact root
      const step = 0.005;
      let prevX = start;
      let prev = f(start);
      for (let i = 1; i <= 4001; i++) {
        const x = start + i * step;
        const cur = f(x);
        if ((prev < 0) !== (cur < 0)) {
          let lo = prevX, hi = x;
          for (let k = 0; k < 100; k++) {
            const mid = (lo + hi) / 2;
            if ((f(lo) < 0) !== (f(mid) < 0)) hi = mid;
            else lo = mid;
          }
          roots.push((lo + hi) / 2);
        }
        prevX = x;
        prev = cur;
      }
      if (roots.length !== 2) throw new Error(`expected 2 roots, found ${roots.length}`);
      return { kind: "value", value: roots.reduce((a, b) => a + b, 0) };
    },
  },

  // ── Cell 8: D5 DS pure — representations of 2^12 as a perfect power ───────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 5,
    stem_md:
      "If $x$ and $y$ are integers greater than $1$ and $x^{y} = 4{,}096$, what is the value of $x$?\n\n(1) $x > y$\n\n(2) $y$ is the square of an integer.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\n$4{,}096 = 2^{12}$, so $x$ must be a power of $2$, say $x = 2^{d}$, with $dy = 12$. The pairs $(x, y)$ with both integers greater than $1$ are $(2, 12)$, $(4, 6)$, $(8, 4)$, $(16, 3)$, and $(64, 2)$.\n\nStatement (1): $x > y$ keeps $(8, 4)$, $(16, 3)$, and $(64, 2)$, so $x$ could be $8$, $16$, or $64$ — insufficient.\n\nStatement (2): among the possible exponents $\\{12, 6, 4, 3, 2\\}$, only $y = 4$ is a perfect square, forcing $(x, y) = (8, 4)$ and $x = 8$ — sufficient.\n\n**Trigger cue**\nA fixed number equated to $x^{y}$ with integer unknowns: prime-factorize it and list every base–exponent split before touching the statements.\n\n**Takeaway**\nList every base–exponent split of the prime power first.",
    fastest_path_md:
      "$4{,}096 = 2^{12}$: the splits are $2^{12}, 4^{6}, 8^{4}, 16^{3}, 64^{2}$. Scan the exponents $\\{12, 6, 4, 3, 2\\}$ for perfect squares — only $4$ qualifies, so (2) alone nails $x = 8$. (1) still allows $8$, $16$, $64$. B.",
    trap_map: {
      "0": "Assumes $x > y$ leaves a single split, overlooking that $(8,4)$, $(16,3)$, and $(64,2)$ all satisfy it.",
      "2": "Misses that $4$ is the only perfect square among the possible exponents, so combines the statements unnecessarily.",
      "3": "Believes $x > y$ forces the extreme split $64^{2}$ uniquely while also crediting (2).",
      "4": "Never enumerates the finitely many power representations of $4{,}096$ and assumes the ambiguity survives both statements.",
    },
    numeric_check: null,
    check() {
      const N = 4096;
      const models = [];
      for (let x = 2; x <= N; x++) {
        let v = x;
        let y = 1;
        while (v < N) {
          v *= x;
          y++;
        }
        if (v === N && y >= 2) models.push({ x, y });
      }
      if (models.length !== 5) throw new Error(`expected 5 models, found ${models.length}`);
      const s1 = (m) => m.x > m.y;
      const s2 = (m) => Number.isInteger(Math.sqrt(m.y));
      return { kind: "index", index: dsVerdict(models, s1, s2, (m) => m.x) };
    },
  },

  // ── Cell 9: D5 PS real — fractional exponent on a k-fold-per-unit scale ───
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 5,
    stem_md:
      "A geological survey office reports ground tremors on a scale for which each increase of $1$ in the reading corresponds to the released energy being multiplied by $9$. During one survey, station P records a tremor with a reading of $4.5$, and station Q records a tremor with a reading of $3$. The energy released by the tremor at P is how many times the energy released by the tremor at Q?",
    choices: ["3", "12", "13.5", "27", "81"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nIf a reading of $r$ corresponds to energy $E_{0} \\cdot 9^{r}$, the ratio of the two energies is\n$$\\frac{E_{0} \\cdot 9^{4.5}}{E_{0} \\cdot 9^{3}} = 9^{4.5 - 3} = 9^{1.5} = 9^{1} \\cdot 9^{1/2} = 9 \\cdot 3 = 27.$$\n\n**Trigger cue**\nAn \"each unit multiplies the quantity by $k$\" scale: the ratio between two readings is $k^{\\text{difference}}$, and a fractional difference calls for roots.\n\n**Takeaway**\nHalf-unit steps contribute the square root of the scale factor.",
    fastest_path_md:
      "The reading difference is $1.5$, so the ratio is $9^{1.5} = 9 \\cdot \\sqrt{9} = 27$: the full unit contributes $9$ and the half unit contributes $3$.",
    trap_map: {
      "0": "Uses only the half-unit step, computing $9^{0.5} = 3$.",
      "1": "Adds the unit factor $9$ and the half-unit factor $3$ instead of multiplying them.",
      "2": "Multiplies $9$ by the reading difference $1.5$ instead of raising $9$ to that power.",
      "4": "Rounds the $1.5$-unit difference up to $2$ full units and computes $9^{2} = 81$.",
    },
    numeric_check: "9^1.5",
    check() {
      const energy = (r) => Math.pow(9, r); // common E0 cancels in the ratio
      return { kind: "value", value: energy(4.5) / energy(3) };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
