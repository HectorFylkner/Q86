/**
 * Batch: 5 new ratios_proportions items (rates_ratio_percent / arithmetic).
 * Cells: D5 PS real, D4 PS pure, D2 PS pure, D4 PS pure, D4 PS pure.
 * Run from repo root: node scripts/author/batch-ratios_proportions.mjs
 * Set APPEND=1 to actually write to the bank.
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ── 1. D5 PS real ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "A caterer makes fruit punch by combining two ready-made blends. In Blend A, the ratio of juice to sparkling water is $5:3$; in Blend B, the ratio of juice to sparkling water is $1:3$. The caterer combines the blends to produce $96$ liters of punch in which the ratio of juice to sparkling water is $1:1$. How many liters of Blend A does the caterer use?",
    choices: ["32", "48", "60", "64", "80"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nBlend A is $\\dfrac{5}{8}$ juice and Blend B is $\\dfrac{1}{4}$ juice. Let $A$ be the liters of Blend A, so Blend B contributes $96 - A$ liters. A $1:1$ punch is half juice, i.e. $48$ liters of juice: $\\dfrac{5A}{8} + \\dfrac{96 - A}{4} = 48$. Multiplying by $8$ gives $5A + 2(96 - A) = 384$, so $3A = 192$ and $A = 64$.\n\n**Trigger cue**\nTwo mixtures with known part ratios blended to hit a target ratio: convert each ratio to a fraction of its whole, then balance a single component.\n\n**Takeaway**\nConvert part ratios to fractions of the whole before mixing.",
    fastest_path_md:
      "Alligation on the juice fraction: Blend A is $\\dfrac{5}{8}$ juice, Blend B is $\\dfrac{2}{8}$, target $\\dfrac{4}{8}$. Distances are $1$ and $2$ eighths; invert them to get $A:B = 2:1$, so $A = \\dfrac{2}{3}(96) = 64$.",
    trap_map: {
      "0": "Inverts the alligation weights, mixing $A:B = 1:2$ — this is Blend B's volume, not Blend A's.",
      "1": "Assumes the two blends are used in equal amounts because the target ratio is $1:1$.",
      "2": "Computes $\\dfrac{5}{8}$ of the total $96$ liters — Blend A's juice fraction applied to the whole punch.",
      "4": "Mixes the blends in the ratio of their juice parts, $5:1$, giving $\\dfrac{5}{6}$ of $96$.",
    },
    numeric_check: "96*2/3",
    check() {
      // Brute force: try every integer number of liters of Blend A and see
      // which one makes total juice equal total sparkling water.
      const total = 96;
      const hits = [];
      for (let A = 0; A <= total; A++) {
        const B = total - A;
        const juice = (5 * A) / 8 + (1 * B) / 4;
        const water = (3 * A) / 8 + (3 * B) / 4;
        if (Math.abs(juice - water) < 1e-9) hits.push(A);
      }
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 2. D4 PS pure ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "Positive numbers $a$, $b$, $c$, and $d$ satisfy $\\dfrac{a}{b} = \\dfrac{c}{d} = \\dfrac{4}{9}$. If $a + c = 36$, what is the value of $b + d$?",
    choices: ["16", "45", "72", "81", "117"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFrom $\\dfrac{a}{b} = \\dfrac{4}{9}$ we get $b = \\dfrac{9a}{4}$, and likewise $d = \\dfrac{9c}{4}$. Therefore $b + d = \\dfrac{9}{4}(a + c) = \\dfrac{9}{4}(36) = 81$.\n\n**Trigger cue**\nSeveral fractions all equal to one ratio, with a sum of numerators given: the sum of numerators over the sum of denominators preserves that same ratio.\n\n**Takeaway**\nEqual ratios: numerator sums and denominator sums keep the same ratio.",
    fastest_path_md:
      "Mediant of equal fractions: $\\dfrac{a+c}{b+d} = \\dfrac{4}{9}$ directly, so $b + d = \\dfrac{9}{4} \\cdot 36 = 81$.",
    trap_map: {
      "0": "Scales in the wrong direction, computing $\\dfrac{4}{9}$ of $36$.",
      "1": "Computes the difference $(b+d) - (a+c)$ — the $5$ extra ratio parts — instead of $b+d$ itself.",
      "2": "Doubles $a + c$ instead of scaling it by $\\dfrac{9}{4}$.",
      "4": "Reports the grand total $a + b + c + d$ rather than $b + d$.",
    },
    numeric_check: "36*9/4",
    check() {
      // Brute force: enumerate integer quadruples (a, b, c, d) with
      // a/b = c/d = 4/9 and a + c = 36; record b + d for every model.
      const sums = new Set();
      let models = 0;
      for (let a = 1; a <= 35; a++) {
        const c = 36 - a;
        let b = null, d = null;
        for (let t = 1; t <= 400; t++) {
          if (9 * a === 4 * t) b = t;
          if (9 * c === 4 * t) d = t;
        }
        if (b == null || d == null) continue;
        models++;
        sums.add(b + d);
      }
      if (models < 3) throw new Error("too few models found");
      if (sums.size !== 1) throw new Error(`b+d not unique: ${[...sums]}`);
      return { kind: "value", value: [...sums][0] };
    },
  },

  // ── 3. D2 PS pure ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 2,
    stem_md:
      "Two positive numbers are in the ratio $3:5$. If the sum of the two numbers is $96$, what is the smaller number?",
    choices: ["12", "32", "36", "48", "60"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWrite the numbers as $3k$ and $5k$ for some $k > 0$. Then $3k + 5k = 8k = 96$, so $k = 12$ and the smaller number is $3k = 36$.\n\n**Trigger cue**\nA ratio together with a total: the total spans $3 + 5 = 8$ equal parts, so find one part first.\n\n**Takeaway**\nDivide the total by the sum of the ratio parts first.",
    fastest_path_md:
      "$96 \\div 8 = 12$ per part; the smaller number is $3 \\times 12 = 36$.",
    trap_map: {
      "0": "Reports the size of one part, $k = 12$, instead of the smaller number.",
      "1": "Divides $96$ by $3$ rather than by the $8$ total parts.",
      "3": "Halves the total, ignoring the $3:5$ split.",
      "4": "Reports the larger number ($5$ parts) instead of the smaller.",
    },
    numeric_check: "96*3/8",
    check() {
      // Brute force: every integer pair (x, y) with x + y = 96 and x:y = 3:5.
      const hits = [];
      for (let x = 1; x <= 95; x++) {
        const y = 96 - x;
        if (5 * x === 3 * y) hits.push(Math.min(x, y));
      }
      if (hits.length !== 1) throw new Error(`expected unique pair, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 4. D4 PS pure ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "The ratio of $x$ to $y$ is $9:5$, where $x$ and $y$ are positive. If $x$ is decreased by $20$ percent and $y$ is increased by $20$ percent, what is the value of $\\dfrac{x}{y}$ after these changes?",
    choices: [
      "$\\dfrac{5}{6}$",
      "$\\dfrac{6}{5}$",
      "$\\dfrac{36}{25}$",
      "$\\dfrac{9}{5}$",
      "$\\dfrac{27}{10}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $x = 9t$ and $y = 5t$. After the changes, $x$ becomes $0.8(9t) = 7.2t$ and $y$ becomes $1.2(5t) = 6t$. So $\\dfrac{x}{y} = \\dfrac{7.2t}{6t} = \\dfrac{6}{5}$.\n\n**Trigger cue**\nPercent changes applied to the two terms of a ratio: multiply the ratio by the single factor $\\dfrac{0.8}{1.2}$ instead of recomputing values.\n\n**Takeaway**\nEqual percent changes on both terms do not cancel.",
    fastest_path_md:
      "Scale the ratio once: $\\dfrac{9}{5} \\cdot \\dfrac{0.8}{1.2} = \\dfrac{9}{5} \\cdot \\dfrac{2}{3} = \\dfrac{6}{5}$.",
    trap_map: {
      "0": "Computes the new value of $\\dfrac{y}{x}$, inverting the requested ratio.",
      "2": "Applies only the $20\\%$ decrease to $x$ and leaves $y$ unchanged.",
      "3": "Assumes the equal-size percent changes cancel, leaving the ratio unchanged at $\\dfrac{9}{5}$.",
      "4": "Swaps the changes, increasing $x$ by $20\\%$ and decreasing $y$ by $20\\%$.",
    },
    numeric_check: "6/5",
    check() {
      // Brute force: run the percent changes on many concrete (x, y) pairs
      // in ratio 9:5 and confirm the new x/y is the same constant.
      const vals = new Set();
      for (let t = 1; t <= 60; t++) {
        const x = 9 * t;
        const y = 5 * t;
        const newX = x * (1 - 0.2);
        const newY = y * (1 + 0.2);
        vals.add(Math.round((newX / newY) * 1e9) / 1e9);
      }
      if (vals.size !== 1) throw new Error(`ratio not constant: ${[...vals]}`);
      return { kind: "value", value: [...vals][0] };
    },
  },

  // ── 5. D4 PS pure ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 4,
    stem_md:
      "If $x$, $y$, and $z$ are positive numbers such that $2x = 3y = 8z$, what is the value of $\\dfrac{x}{z}$?",
    choices: [
      "$\\dfrac{1}{4}$",
      "$\\dfrac{2}{3}$",
      "$\\dfrac{3}{2}$",
      "$\\dfrac{8}{3}$",
      "4",
    ],
    correct_index: 4,
    solution_md:
      "**Formal path**\nSet the common value equal to a convenient number: $2x = 3y = 8z = 24$, the least common multiple of the coefficients. Then $x = 12$, $y = 8$, and $z = 3$, so $\\dfrac{x}{z} = \\dfrac{12}{3} = 4$. Any other common value scales all three numbers equally, leaving the ratio unchanged.\n\n**Trigger cue**\nA chain of equal products such as $2x = 3y = 8z$: assign the chain the LCM of the coefficients to get clean integer values.\n\n**Takeaway**\nIn equal-product chains, each variable is inversely proportional to its coefficient.",
    fastest_path_md:
      "From $2x = 8z$ alone: $\\dfrac{x}{z} = \\dfrac{8}{2} = 4$ — the coefficients swap places.",
    trap_map: {
      "0": "Reads $2x = 8z$ as $x:z = 2:8$, using the coefficients directly as the ratio parts.",
      "1": "Takes $x:y$ straight from the coefficients as $2:3$ instead of inverting them.",
      "2": "Correctly finds $x:y = 3:2$ but reports that pair instead of $x:z$.",
      "3": "Computes $y:z = 8:3$ instead of $x:z$.",
    },
    numeric_check: "8/2",
    check() {
      // Brute force: enumerate integer triples (x, y, z) satisfying
      // 2x = 3y = 8z and record x/z for every model found.
      const vals = new Set();
      let models = 0;
      for (let x = 1; x <= 600; x++) {
        for (let z = 1; z <= 600; z++) {
          if (2 * x !== 8 * z) continue;
          const L = 2 * x;
          if (L % 3 !== 0) continue; // y = L/3 must be a positive integer
          models++;
          vals.add(x / z);
        }
      }
      if (models < 3) throw new Error("too few models found");
      if (vals.size !== 1) throw new Error(`x/z not constant: ${[...vals]}`);
      return { kind: "value", value: [...vals][0] };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
