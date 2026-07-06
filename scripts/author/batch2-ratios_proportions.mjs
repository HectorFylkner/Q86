/**
 * Batch 2: ratios_proportions (fundamental_skill rates_ratio_percent).
 * Fifteen items extending the original batch into angles the bank misses:
 * difference-splits, ratio equivalence of mixed numbers, single-term change,
 * limiting-ingredient ratios, joint variation, mean proportional, coefficient
 * chains, inverse gear proportion, three DS items (the subtopic had none),
 * conserved-total transfer, LCM-bridged integer chains, invariant-difference
 * removal, and symmetric equal ratios.
 *
 * Difficulty mix: D2 x2, D3 x7, D4 x4, D5 x2. Formats: 12 PS + 3 DS.
 * Every check() recomputes the answer by brute-force enumeration over the
 * stem's raw conditions — never by transcribing the solution's algebra.
 *
 * Run from repo root:
 *   node --experimental-strip-types scripts/author/batch2-ratios_proportions.mjs
 * (dry run unless --append is passed)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ── 1. D2 PS pure — ratio given with a DIFFERENCE, not a sum ───────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 2,
    stem_md:
      "Two positive numbers are in the ratio $9:4$. If the larger number exceeds the smaller number by $45$, what is the larger number?",
    choices: ["36", "45", "81", "90", "117"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite the numbers as $9k$ and $4k$ for some $k > 0$. Their difference is $9k - 4k = 5k = 45$, so $k = 9$ and the larger number is $9k = 81$.\n\n**Trigger cue**\n\nA ratio paired with a difference: the difference spans $9 - 4 = 5$ ratio parts, so size one part from the difference.\n\n**Takeaway**\n\nDivide the difference by the difference of the ratio parts.",
    fastest_path_md:
      "$45 \\div 5 = 9$ per part; the larger number is $9 \\times 9 = 81$.",
    trap_map: {
      "0": "Reports the smaller number, $4k = 36$, instead of the larger.",
      "1": "Divides the difference by the $9$ parts of the larger number, making one part $5$ and the larger number $45$.",
      "3": "Doubles the difference instead of scaling by the ratio parts.",
      "4": "Reports the sum of the two numbers, $81 + 36$.",
    },
    numeric_check: "45*9/5",
    check() {
      // Brute force: every positive integer pair with difference 45 whose
      // ratio is exactly 9:4 (cross products equal).
      const hits = [];
      for (let s = 1; s <= 2000; s++) {
        const l = s + 45;
        if (4 * l === 9 * s) hits.push(l);
      }
      if (hits.length !== 1) throw new Error(`expected unique pair, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 2. D2 PS pure — ratio equivalence with mixed numbers ───────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 2,
    stem_md:
      "The ratio of $2\\frac{1}{2}$ to $3\\frac{1}{3}$ is equal to which of the following ratios?",
    choices: ["$1:2$", "$2:3$", "$3:4$", "$4:3$", "$3:2$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nConvert to improper fractions: $2\\frac{1}{2} = \\dfrac{5}{2}$ and $3\\frac{1}{3} = \\dfrac{10}{3}$. Multiply both terms of the ratio $\\dfrac{5}{2} : \\dfrac{10}{3}$ by $6$ to clear denominators: $15 : 20$, which reduces to $3:4$.\n\n**Trigger cue**\n\nA ratio of mixed numbers or fractions: scale both terms by the least common multiple of the denominators before reducing.\n\n**Takeaway**\n\nClear fractions from a ratio by scaling both terms equally.",
    fastest_path_md:
      "Divide directly: $\\dfrac{5/2}{10/3} = \\dfrac{5}{2} \\cdot \\dfrac{3}{10} = \\dfrac{3}{4}$, so the ratio is $3:4$.",
    trap_map: {
      "0": "Compares only the improper-fraction numerators $5$ and $10$, ignoring the denominators.",
      "1": "Compares only the whole-number parts $2$ and $3$ of the mixed numbers.",
      "3": "Inverts the correct ratio.",
      "4": "Compares only the fractional parts $\\frac{1}{2}$ and $\\frac{1}{3}$, which stand in ratio $3:2$.",
    },
    numeric_check: null,
    check() {
      // Brute force: compute the target quotient from the mixed numbers,
      // then parse every a:b choice and find which one matches.
      const target = (2 + 1 / 2) / (3 + 1 / 3);
      const matches = [];
      this.choices.forEach((c, idx) => {
        const m = c.match(/(\d+)\s*:\s*(\d+)/);
        if (!m) return;
        if (Math.abs(Number(m[1]) / Number(m[2]) - target) < 1e-9) matches.push(idx);
      });
      if (matches.length !== 1) throw new Error(`expected one matching ratio, got ${matches}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 3. D3 PS pure — change ONE term of the ratio ───────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "The ratio of $a$ to $b$ is $7:3$, where $a$ and $b$ are positive. If $b$ is increased by $12$ and $a$ is unchanged, the ratio of $a$ to $b$ becomes $7:5$. What is the value of $a$?",
    choices: ["18", "30", "42", "60", "84"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $a = 7k$ and $b = 3k$. After the increase, $\\dfrac{7k}{3k + 12} = \\dfrac{7}{5}$. Cross-multiplying, $35k = 21k + 84$, so $14k = 84$, $k = 6$, and $a = 7k = 42$.\n\n**Trigger cue**\n\nThe unchanged quantity keeps the same number of parts ($7$) in both ratios, so the part size is the same before and after.\n\n**Takeaway**\n\nWhen one term's parts repeat, the part size is fixed.",
    fastest_path_md:
      "Since $a$ is $7$ parts in both ratios, one part is the same size throughout: $b$ grows from $3$ to $5$ parts, so $12 = 2$ parts, one part is $6$, and $a = 42$.",
    trap_map: {
      "0": "Reports the original value of $b$, which is $18$.",
      "1": "Reports the new value of $b$ after the increase.",
      "3": "Reports the original total $a + b$ instead of $a$.",
      "4": "Treats the added $12$ as the value of one ratio part, computing $7 \\times 12$.",
    },
    numeric_check: "42",
    check() {
      // Brute force: enumerate positive integer pairs with a:b = 7:3 and
      // test the after-change ratio condition 5a = 7(b + 12) directly.
      const hits = [];
      for (let a = 1; a <= 7000; a++) {
        if ((3 * a) % 7 !== 0) continue;
        const b = (3 * a) / 7;
        if (b < 1) continue;
        if (5 * a === 7 * (b + 12)) hits.push(a);
      }
      if (hits.length !== 1) throw new Error(`expected unique a, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 4. D3 PS real — limiting ingredient in a fixed ratio ───────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "A paint mixture requires red, yellow, and white pigment in the ratio $3:2:7$ by volume. A decorator has $9$ liters of red pigment, $5$ liters of yellow pigment, and $21$ liters of white pigment. What is the greatest volume of the mixture, in liters, that the decorator can prepare?",
    choices: ["24", "30", "35", "36", "60"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nOne \"unit\" of mixture is $3 + 2 + 7 = 12$ liters, using $3$ liters of red, $2$ of yellow, and $7$ of white. The stocks allow $\\dfrac{9}{3} = 3$ units from red, $\\dfrac{5}{2} = 2.5$ units from yellow, and $\\dfrac{21}{7} = 3$ units from white. Yellow is the binding constraint at $2.5$ units, so the maximum volume is $2.5 \\times 12 = 30$ liters.\n\n**Trigger cue**\n\nA fixed recipe ratio with unequal stocks on hand: compute stock $\\div$ part for each ingredient and let the smallest quotient set the scale.\n\n**Takeaway**\n\nThe ingredient with the smallest stock-to-part quotient limits output.",
    fastest_path_md:
      "Yellow is $\\dfrac{2}{12} = \\dfrac{1}{6}$ of the mixture, so the mixture can be at most $6 \\times 5 = 30$ liters; check red and white allow more.",
    trap_map: {
      "0": "Allows only whole $12$-liter batches, rounding the $2.5$ possible units down to $2$.",
      "2": "Adds all the available pigment, $9 + 5 + 21$, ignoring that the ratio must be maintained.",
      "3": "Uses the red or white quotient of $3$ units, overlooking that yellow runs out first.",
      "4": "Treats yellow as one part of twelve rather than two, computing $5 \\times 12$.",
    },
    numeric_check: "30",
    check() {
      // Brute force: scan candidate mixture volumes in hundredths of a liter
      // and keep the largest one whose ingredient demands fit the stocks.
      let best = 0;
      for (let cv = 0; cv <= 6000; cv++) {
        const v = cv / 100;
        const red = (3 * v) / 12;
        const yellow = (2 * v) / 12;
        const white = (7 * v) / 12;
        if (red <= 9 + 1e-9 && yellow <= 5 + 1e-9 && white <= 21 + 1e-9) {
          if (v > best) best = v;
        }
      }
      if (best <= 0) throw new Error("no feasible volume found");
      return { kind: "value", value: best };
    },
  },

  // ── 5. D3 PS pure — joint (direct + inverse) variation ─────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "A quantity $y$ is directly proportional to $x$ and inversely proportional to $z$. When $x = 4$ and $z = 9$, $y = 12$. What is the value of $y$ when $x = 6$ and $z = 27$?",
    choices: ["4", "6", "18", "24", "54"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe variation means $y = \\dfrac{kx}{z}$ for a constant $k$. From the first data point, $12 = \\dfrac{4k}{9}$, so $k = 27$. Then $y = \\dfrac{27 \\cdot 6}{27} = 6$.\n\n**Trigger cue**\n\n\"Directly proportional to ... and inversely proportional to ...\" is one model with one constant: $y = kx/z$, pinned by a single data point.\n\n**Takeaway**\n\nScale $y$ by direct factors and inverted inverse factors.",
    fastest_path_md:
      "Skip $k$: multiply $y$ by the change factors, $12 \\times \\dfrac{6}{4} \\times \\dfrac{9}{27} = 12 \\times \\dfrac{3}{2} \\times \\dfrac{1}{3} = 6$.",
    trap_map: {
      "0": "Applies only the inverse change in $z$, computing $12 \\times \\frac{9}{27}$.",
      "2": "Applies only the direct change in $x$, computing $12 \\times \\frac{6}{4}$.",
      "3": "Swaps the roles, treating $y$ as inverse in $x$ and direct in $z$.",
      "4": "Treats $y$ as directly proportional to both $x$ and $z$.",
    },
    numeric_check: "6",
    check() {
      // Brute force: grid-search the constant k in y = kx/z against the
      // given data point, then evaluate the model at the new point.
      const ks = [];
      for (let i = 1; i <= 10000; i++) {
        const k = i / 100;
        if (Math.abs((k * 4) / 9 - 12) < 1e-9) ks.push(k);
      }
      if (ks.length !== 1) throw new Error(`expected unique k, got ${ks}`);
      return { kind: "value", value: (ks[0] * 6) / 27 };
    },
  },

  // ── 6. D3 PS pure — mean proportional (continued proportion) ───────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "Positive numbers $a$, $b$, and $c$ satisfy $a:b = b:c$. If $a = 8$ and $c = 18$, what is the value of $b$?",
    choices: ["10", "12", "13", "26", "144"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe proportion $a:b = b:c$ means $\\dfrac{a}{b} = \\dfrac{b}{c}$, so $b^2 = ac = 8 \\cdot 18 = 144$. Since $b$ is positive, $b = 12$.\n\n**Trigger cue**\n\nA repeated middle term, $a:b = b:c$: the middle term is the geometric mean of the outer terms.\n\n**Takeaway**\n\nThe middle term of a continued proportion is the geometric mean.",
    fastest_path_md:
      "$b = \\sqrt{8 \\cdot 18} = \\sqrt{144} = 12$; spot $8 \\cdot 18 = 16 \\cdot 9$ to take the root instantly.",
    trap_map: {
      "0": "Uses the difference $c - a = 10$ as the middle term, treating the proportion like a common difference.",
      "2": "Takes the arithmetic mean of $8$ and $18$ instead of the geometric mean.",
      "3": "Adds $8$ and $18$ instead of combining them multiplicatively.",
      "4": "Finds $b^2 = 144$ but forgets to take the square root.",
    },
    numeric_check: "12",
    check() {
      // Brute force: scan b on a tenths grid and keep values where the two
      // ratios 8/b and b/18 agree.
      const hits = [];
      for (let i = 1; i <= 4000; i++) {
        const b = i / 10;
        if (Math.abs(8 / b - b / 18) < 1e-12) hits.push(b);
      }
      if (hits.length !== 1) throw new Error(`expected unique b, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 7. D3 PS pure — coefficient equations, ratio inverts coefficients ──
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "If $3a = 4b$ and $5b = 6c$, where $a$, $b$, and $c$ are positive, what is the value of $\\dfrac{a}{c}$?",
    choices: [
      "$\\dfrac{1}{2}$",
      "$\\dfrac{5}{8}$",
      "$\\dfrac{9}{10}$",
      "$\\dfrac{10}{9}$",
      "$\\dfrac{8}{5}$",
    ],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nFrom $3a = 4b$, $\\dfrac{a}{b} = \\dfrac{4}{3}$; from $5b = 6c$, $\\dfrac{b}{c} = \\dfrac{6}{5}$. Multiply the links: $\\dfrac{a}{c} = \\dfrac{a}{b} \\cdot \\dfrac{b}{c} = \\dfrac{4}{3} \\cdot \\dfrac{6}{5} = \\dfrac{24}{15} = \\dfrac{8}{5}$.\n\n**Trigger cue**\n\nEquations of the form $pa = qb$: the ratio $a:b$ is the coefficients reversed, $q:p$ — then chain the links through the shared variable.\n\n**Takeaway**\n\nIn $pa = qb$, the ratio $a:b$ equals $q:p$.",
    fastest_path_md:
      "Smart number: let $b = 6$, so $a = \\dfrac{4 \\cdot 6}{3} = 8$ and $c = \\dfrac{5 \\cdot 6}{6} = 5$; then $\\dfrac{a}{c} = \\dfrac{8}{5}$.",
    trap_map: {
      "0": "Reads $a:c$ directly from the outer coefficients $3$ and $6$.",
      "1": "Uses the coefficients as the ratio parts ($a:b = 3:4$, $b:c = 5:6$), producing the inverse of the answer.",
      "2": "Inverts the second equation's coefficients but not the first, computing $\\frac{3}{4} \\cdot \\frac{6}{5}$.",
      "3": "Inverts the first equation's coefficients but not the second, computing $\\frac{4}{3} \\cdot \\frac{5}{6}$.",
    },
    numeric_check: "8/5",
    check() {
      // Brute force: enumerate integer triples satisfying both equations
      // exactly and record a/c across every model found.
      const vals = new Set();
      let models = 0;
      for (let b = 1; b <= 600; b++) {
        if ((4 * b) % 3 !== 0 || (5 * b) % 6 !== 0) continue;
        const a = (4 * b) / 3;
        const c = (5 * b) / 6;
        models++;
        vals.add(a / c);
      }
      if (models < 3) throw new Error("too few models found");
      if (vals.size !== 1) throw new Error(`a/c not constant: ${[...vals]}`);
      return { kind: "value", value: [...vals][0] };
    },
  },

  // ── 8. D3 PS real — meshed gears, inverse proportion ───────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "Gear A, which has $20$ teeth, meshes with gear B, which has $30$ teeth, so that the two gears turn together without slipping. How many revolutions does gear B make while gear A makes $36$ revolutions?",
    choices: ["16", "24", "26", "36", "54"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nMeshed gears pass the same number of teeth at the point of contact. Gear A passes $20 \\times 36 = 720$ teeth, so gear B must also pass $720$ teeth: $\\dfrac{720}{30} = 24$ revolutions.\n\n**Trigger cue**\n\nMeshed gears (or a belt over pulleys): the product teeth $\\times$ revolutions is equal on both sides, so revolutions vary inversely with teeth.\n\n**Takeaway**\n\nMeshed gears: revolutions are inversely proportional to teeth counts.",
    fastest_path_md:
      "Bigger gear turns slower: $36 \\times \\dfrac{20}{30} = 24$.",
    trap_map: {
      "0": "Applies the $\\frac{2}{3}$ teeth factor twice, computing $36 \\times \\frac{4}{9}$.",
      "2": "Subtracts the $10$-tooth difference from the $36$ revolutions.",
      "3": "Assumes meshed gears make equal numbers of revolutions.",
      "4": "Uses direct instead of inverse proportion, computing $36 \\times \\frac{30}{20}$.",
    },
    numeric_check: "24",
    check() {
      // Brute force: count total teeth passed by gear A, then step gear B
      // one revolution at a time until it has passed the same count.
      const passed = 20 * 36;
      for (let r = 1; r <= 100000; r++) {
        if (30 * r === passed) return { kind: "value", value: r };
        if (30 * r > passed) break;
      }
      throw new Error("no whole number of revolutions matches");
    },
  },

  // ── 9. D3 DS pure — what fixes a ratio (answer A) ──────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "If $x$ and $y$ are positive numbers, what is the value of the ratio $\\dfrac{x}{y}$?\n\n(1) $\\dfrac{x+y}{y} = \\dfrac{12}{5}$\n\n(2) $x - y = 14$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nStatement (1): $\\dfrac{x+y}{y} = \\dfrac{x}{y} + 1 = \\dfrac{12}{5}$, so $\\dfrac{x}{y} = \\dfrac{7}{5}$ — sufficient. Statement (2) fixes only the difference: $(x, y) = (21, 7)$ gives $\\dfrac{x}{y} = 3$ while $(28, 14)$ gives $2$ — not sufficient. The answer is A.\n\n**Trigger cue**\n\nA \"what is the ratio\" question: a scale-invariant (homogeneous) condition determines the ratio, while any fixed absolute difference leaves the scale free.\n\n**Takeaway**\n\nHomogeneous equations fix ratios; absolute differences do not.",
    fastest_path_md:
      "(1) is built entirely from $\\frac{x}{y}$ — doubling both $x$ and $y$ changes nothing — so it locks the ratio without solving. (2) dies on the pairs $(21, 7)$ and $(28, 14)$.",
    trap_map: {
      "1": "Treats the concrete difference in (2) as pinning down both numbers while dismissing (1) as one equation in two unknowns.",
      "2": "Combines the statements to find $x$ and $y$ individually, missing that the ratio needs only (1).",
      "3": "Assumes the fixed difference in (2) fixes the ratio, though $x:y$ changes as the pair scales.",
      "4": "Counts two unknowns in each statement and concludes no single statement can fix the ratio.",
    },
    numeric_check: null,
    check() {
      // Enumerate positive integer pairs; a statement is sufficient when
      // every pair it allows produces the same ratio x/y.
      const r1 = new Set();
      const r2 = new Set();
      const rb = new Set();
      for (let x = 1; x <= 400; x++) {
        for (let y = 1; y <= 400; y++) {
          const c1 = 5 * (x + y) === 12 * y;
          const c2 = x - y === 14;
          if (c1) r1.add(x / y);
          if (c2) r2.add(x / y);
          if (c1 && c2) rb.add(x / y);
        }
      }
      if (r1.size === 0 || r2.size === 0) throw new Error("a statement has no models");
      if (rb.size === 0) throw new Error("statements inconsistent");
      const s1 = r1.size === 1;
      const s2 = r2.size === 1;
      const both = rb.size === 1;
      let index;
      if (s1 && s2) index = 3;
      else if (s1) index = 0;
      else if (s2) index = 1;
      else if (both) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // ── 10. D4 DS real — two linear conditions pin a ratio (answer C) ──────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "A jar contains only red marbles and green marbles. What is the ratio of the number of red marbles to the number of green marbles in the jar?\n\n(1) If $6$ green marbles were added to the jar, the ratio of the number of red marbles to the number of green marbles would be $3:5$.\n\n(2) The jar contains $18$ fewer red marbles than green marbles.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $r$ and $g$ be the counts. Statement (1): $\\dfrac{r}{g+6} = \\dfrac{3}{5}$, i.e. $5r = 3g + 18$; the pairs $(6, 4)$ and $(9, 9)$ both work yet give ratios $3:2$ and $1:1$ — not sufficient. Statement (2): $r = g - 18$; $(2, 20)$ and $(18, 36)$ give $1:10$ and $1:2$ — not sufficient. Together: substituting $r = g - 18$ into $5r = 3g + 18$ gives $5g - 90 = 3g + 18$, so $g = 54$, $r = 36$, and the ratio is $2:3$ — sufficient. The answer is C.\n\n**Trigger cue**\n\nA ratio question where each statement is one linear relation between the counts: a line that misses the origin never fixes a ratio alone, but two independent lines meet in one point.\n\n**Takeaway**\n\nA non-homogeneous linear relation alone cannot fix a ratio.",
    fastest_path_md:
      "Each statement has a constant term, so scaling breaks it — test two quick pairs each to kill A, B, and D. Two independent linear equations then force one $(r, g)$: choose C without solving.",
    trap_map: {
      "0": "Assumes the hypothetical $3:5$ ratio in (1) determines the current ratio, though many jars satisfy it.",
      "1": "Treats the fixed difference of $18$ in (2) as fixing the ratio, which actually changes with the jar's size.",
      "3": "Accepts each statement alone after testing only one pair of counts that happens to work.",
      "4": "Stops at \"two unknowns, one equation each\" without noticing the two conditions intersect in a single pair.",
    },
    numeric_check: null,
    check() {
      // Enumerate marble counts; sufficiency = all allowed jars share one
      // red:green ratio.
      const r1 = new Set();
      const r2 = new Set();
      const rb = new Set();
      for (let r = 1; r <= 1000; r++) {
        for (let g = 1; g <= 1000; g++) {
          const c1 = 5 * r === 3 * (g + 6);
          const c2 = g - r === 18;
          if (c1) r1.add(r / g);
          if (c2) r2.add(r / g);
          if (c1 && c2) rb.add(r / g);
        }
      }
      if (r1.size === 0 || r2.size === 0) throw new Error("a statement has no models");
      if (rb.size === 0) throw new Error("statements inconsistent");
      const s1 = r1.size === 1;
      const s2 = r2.size === 1;
      const both = rb.size === 1;
      let index;
      if (s1 && s2) index = 3;
      else if (s1) index = 0;
      else if (s2) index = 1;
      else if (both) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // ── 11. D4 DS real — integer ratio + range constraint (answer D) ───────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "Each game that a certain team has played ended in a win or a loss, and the ratio of the team's wins to its losses is $5:3$. How many games has the team won?\n\n(1) The team has played more than $30$ and fewer than $40$ games.\n\n(2) The team has won $8$ more games than it has lost.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nWins and losses are whole numbers in ratio $5:3$, so wins $= 5k$ and losses $= 3k$ for a positive integer $k$, and the total is $8k$. Statement (1): $30 < 8k < 40$ forces $8k = 32$, so $k = 4$ and wins $= 20$ — sufficient. Statement (2): $5k - 3k = 8$ gives $k = 4$ and wins $= 20$ — sufficient. The answer is D.\n\n**Trigger cue**\n\nA count ratio plus a range: totals must be multiples of the part sum, so count the multiples inside the range before declaring a range insufficient.\n\n**Takeaway**\n\nInteger ratios make totals multiples of the part sum.",
    fastest_path_md:
      "Totals are multiples of $8$, and only $32$ lies strictly between $30$ and $40$ — (1) is sufficient. (2) reads $2k = 8$ at sight.",
    trap_map: {
      "0": "Forgets that the stem's $5:3$ ratio turns the difference in (2) into the single equation $2k = 8$.",
      "1": "Assumes the range in (1) allows several totals, missing that only one multiple of $8$ lies between $30$ and $40$.",
      "2": "Underestimates each statement alone and combines them out of habit.",
      "4": "Ignores that wins and losses must be whole numbers, so dismisses both the range and the difference.",
    },
    numeric_check: null,
    check() {
      // Enumerate all integer win/loss records in exact 5:3 ratio, then
      // apply each statement as a filter; sufficiency = one possible win count.
      const base = [];
      for (let w = 1; w <= 400; w++) {
        for (let l = 1; l <= 400; l++) {
          if (3 * w === 5 * l) base.push({ w, l });
        }
      }
      const wins1 = new Set(base.filter((m) => m.w + m.l > 30 && m.w + m.l < 40).map((m) => m.w));
      const wins2 = new Set(base.filter((m) => m.w - m.l === 8).map((m) => m.w));
      const winsB = new Set(
        base.filter((m) => m.w + m.l > 30 && m.w + m.l < 40 && m.w - m.l === 8).map((m) => m.w),
      );
      if (wins1.size === 0 || wins2.size === 0) throw new Error("a statement has no models");
      if (winsB.size === 0) throw new Error("statements inconsistent");
      const s1 = wins1.size === 1;
      const s2 = wins2.size === 1;
      const both = winsB.size === 1;
      let index;
      if (s1 && s2) index = 3;
      else if (s1) index = 0;
      else if (s2) index = 1;
      else if (both) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // ── 12. D4 PS pure — transfer conserves the total, ratio inverts ───────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "The positive numbers $x$ and $y$ are in the ratio $7:5$. When $8$ is subtracted from $x$ and added to $y$, the two resulting numbers are in the ratio $5:7$. What is the value of $x$?",
    choices: ["4", "20", "28", "48", "56"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $x = 7k$ and $y = 5k$. Then $\\dfrac{7k - 8}{5k + 8} = \\dfrac{5}{7}$, so $49k - 56 = 25k + 40$, giving $24k = 96$, $k = 4$, and $x = 28$.\n\n**Trigger cue**\n\nAn amount moved from one quantity to the other: the total is conserved, so both ratios split the same total into $12$ parts.\n\n**Takeaway**\n\nTransfers conserve the total; compare parts of that fixed total.",
    fastest_path_md:
      "The total $12k$ never changes, and $x$ falls from $7$ parts to $5$ parts of it — so the $8$ moved equals $2$ parts, one part is $4$, and $x = 28$.",
    trap_map: {
      "0": "Reports the size of one ratio part, $k = 4$, instead of $x$.",
      "1": "Reports the original value of $y$ rather than $x$.",
      "3": "Reports the combined total $x + y$.",
      "4": "Sets the two new amounts equal to each other instead of in the ratio $5:7$.",
    },
    numeric_check: "28",
    check() {
      // Brute force: enumerate integer pairs in ratio 7:5 and test the
      // after-transfer ratio condition with exact cross products.
      const hits = [];
      for (let x = 1; x <= 1000; x++) {
        if ((5 * x) % 7 !== 0) continue;
        const y = (5 * x) / 7;
        if (y < 1) continue;
        if (7 * (x - 8) === 5 * (y + 8) && x - 8 > 0) hits.push(x);
      }
      if (hits.length !== 1) throw new Error(`expected unique x, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 13. D4 PS pure — chained ratios + integrality (LCM bridge) ─────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "Positive integers $x$, $y$, and $z$ satisfy $x:y = 7:12$ and $y:z = 8:5$. What is the least possible value of $x + y + z$?",
    choices: ["24", "32", "43", "53", "106"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFor $x = \\dfrac{7y}{12}$ to be an integer, $y$ must be a multiple of $12$; for $z = \\dfrac{5y}{8}$ to be an integer, $y$ must be a multiple of $8$. So $y$ is a multiple of $\\operatorname{lcm}(12, 8) = 24$. Taking $y = 24$ gives $x = 14$ and $z = 15$, so the least sum is $14 + 24 + 15 = 53$.\n\n**Trigger cue**\n\nTwo ratios sharing a middle term with an integer requirement: set the shared term to the LCM of its two ratio values.\n\n**Takeaway**\n\nBridge chained ratios through the LCM of the shared term.",
    fastest_path_md:
      "$y$ must serve both $12$ and $8$, so $y = 24$; scale each ratio to it: $x:y:z = 14:24:15$, sum $53$.",
    trap_map: {
      "0": "Carries $z$ straight from the second ratio without rescaling, adding $7 + 12 + 5$.",
      "1": "Adds all four ratio numbers, $7 + 12 + 8 + 5$.",
      "2": "Rescales $x$ and $y$ to $14$ and $24$ but leaves $z$ at $5$.",
      "4": "Scales the shared term to $48$ instead of the least common multiple $24$.",
    },
    numeric_check: "53",
    check() {
      // Brute force: enumerate y, derive x and z when the exact ratio
      // conditions admit integers, and track the minimum sum.
      let best = Infinity;
      let models = 0;
      for (let y = 1; y <= 1000; y++) {
        if ((7 * y) % 12 !== 0 || (5 * y) % 8 !== 0) continue;
        const x = (7 * y) / 12;
        const z = (5 * y) / 8;
        if (x < 1 || z < 1) continue;
        models++;
        const sum = x + y + z;
        if (sum < best) best = sum;
      }
      if (models < 3) throw new Error("too few models found");
      return { kind: "value", value: best };
    },
  },

  // ── 14. D5 PS pure — equal removals preserve the difference ────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "A box contains red, white, and blue chips in the ratio $4:5:6$. An equal number of red chips and blue chips are then removed from the box, and afterward the ratio of the number of red chips to the number of blue chips in the box is $1:2$. If the box contains $30$ white chips, how many red chips remain in the box?",
    choices: ["6", "12", "18", "24", "36"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nWith counts $4k$, $5k$, $6k$, the white chips give $5k = 30$, so $k = 6$: $24$ red and $36$ blue. Removing $n$ of each, $\\dfrac{24 - n}{36 - n} = \\dfrac{1}{2}$, so $48 - 2n = 36 - n$ and $n = 12$. The red chips remaining number $24 - 12 = 12$.\n\n**Trigger cue**\n\nEqual amounts removed from (or added to) two quantities: their difference is invariant, so anchor the new ratio to that difference.\n\n**Takeaway**\n\nEqual removals preserve the difference; anchor the new ratio there.",
    fastest_path_md:
      "The red–blue gap stays $36 - 24 = 12$ through equal removals, and in a $1:2$ ratio the gap equals the smaller term — so $12$ red chips remain.",
    trap_map: {
      "0": "Reports the value of one ratio part, $k = 6$.",
      "2": "Removes chips only from red, solving $\\frac{24 - n}{36} = \\frac{1}{2}$.",
      "3": "Reports the number of red chips before the removal.",
      "4": "Reports the number of blue chips before the removal.",
    },
    numeric_check: "12",
    check() {
      // Brute force: find k from the white count, then try every removal
      // size n and keep those matching the 1:2 condition exactly.
      const ks = [];
      for (let k = 1; k <= 200; k++) if (5 * k === 30) ks.push(k);
      if (ks.length !== 1) throw new Error(`expected unique k, got ${ks}`);
      const red0 = 4 * ks[0];
      const blue0 = 6 * ks[0];
      const hits = [];
      for (let n = 0; n < blue0; n++) {
        const red = red0 - n;
        const blue = blue0 - n;
        if (red >= 1 && blue >= 1 && 2 * red === blue) hits.push(red);
      }
      if (hits.length !== 1) throw new Error(`expected unique removal, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 15. D5 PS pure — symmetric equal ratios collapse by summing ────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "If $a$, $b$, and $c$ are positive numbers such that $\\dfrac{a}{b+c} = \\dfrac{b}{a+c} = \\dfrac{c}{a+b}$, what is the value of each of these three equal ratios?",
    choices: [
      "$\\dfrac{1}{3}$",
      "$\\dfrac{1}{2}$",
      "$\\dfrac{2}{3}$",
      "$1$",
      "$\\dfrac{3}{2}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLet each ratio equal $r$. Then $a = r(b+c)$, $b = r(a+c)$, and $c = r(a+b)$. Adding all three equations gives $a + b + c = r \\cdot 2(a + b + c)$. Since $a + b + c > 0$, divide both sides by it: $2r = 1$, so $r = \\dfrac{1}{2}$.\n\n**Trigger cue**\n\nSeveral equal ratios whose numerators and denominators are symmetric in the variables: add the equations (or use the mediant, sum of numerators over sum of denominators).\n\n**Takeaway**\n\nSum symmetric ratio equations to collapse the unknowns.",
    fastest_path_md:
      "The condition is symmetric and holds for $a = b = c$, so plug that in: each ratio is $\\dfrac{a}{2a} = \\dfrac{1}{2}$.",
    trap_map: {
      "0": "Divides each number by the sum of all three instead of by the other two.",
      "2": "Computes the complement $\\frac{b+c}{a+b+c}$ instead of the given ratio.",
      "3": "Assumes the symmetry forces each numerator to equal its denominator.",
      "4": "Reports the sum of the three ratios instead of their common value.",
    },
    numeric_check: "1/2",
    check() {
      // Brute force: sweep all positive integer triples up to 24 and test
      // the two ratio equalities with exact cross products; record the
      // common ratio for every triple that qualifies.
      const vals = new Set();
      let models = 0;
      for (let a = 1; a <= 24; a++) {
        for (let b = 1; b <= 24; b++) {
          for (let c = 1; c <= 24; c++) {
            // a/(b+c) = b/(a+c)  <=>  a(a+c) = b(b+c)
            if (a * (a + c) !== b * (b + c)) continue;
            // b/(a+c) = c/(a+b)  <=>  b(a+b) = c(a+c)
            if (b * (a + b) !== c * (a + c)) continue;
            models++;
            vals.add(a / (b + c));
          }
        }
      }
      if (models < 5) throw new Error("too few models found");
      if (vals.size !== 1) throw new Error(`ratio not constant: ${[...vals]}`);
      return { kind: "value", value: [...vals][0] };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
