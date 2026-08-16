/**
 * Batch: 11 new ratios_proportions items (rates_ratio_percent).
 * Cells: D2 ×3, D3 ×7, D5 ×1 — the subtopic had no D3 items at all.
 * Trap language tracks the chapter: ratio numbers read as counts, the old
 * ratio assumed to survive an addition, chaining without aligning the
 * shared term, flipping direct and inverse, reading $2x = 3y$ as $2:3$.
 * Run: node scripts/author/batch-ratios_proportions-v2.mjs
 *      (APPEND=1 to write the bank)
 */
import { choiceIndexForValue, verifyAndAppend } from "./harness.mjs";

const S = {
  format: "problem_solving",
  content_domain: "arithmetic",
  fundamental_skill: "rates_ratio_percent",
  subtopic: "ratios_proportions",
};

/** Reduce a ratio tuple to lowest terms, for checks whose answer is a
 *  ratio rather than a number. */
function reduce(parts) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const g = parts.reduce((a, b) => gcd(a, b));
  return parts.map((p) => p / g);
}

/** Index of the choice naming exactly this ratio, e.g. "$12 : 8 : 3$". */
function ratioIndex(choices, parts) {
  const want = reduce(parts).join(":");
  const hits = [];
  choices.forEach((c, i) => {
    const nums = c.match(/\d+/g);
    if (nums && nums.length === parts.length && reduce(nums.map(Number)).join(":") === want) {
      hits.push(i);
    }
  });
  if (hits.length !== 1) throw new Error(`ratio ${want} matches ${hits.length} choices`);
  return { kind: "index", index: hits[0] };
}

const items = [
  // 1 — D2: the multiplier comes first
  {
    ...S,
    context: "real",
    difficulty: 2,
    stem_md:
      "The ratio of red marbles to blue marbles in a jar is $4 : 7$. If the jar contains $132$ marbles in all and no other colors, how many of them are blue?",
    choices: ["$12$", "$48$", "$77$", "$84$", "$88$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nWrite the counts as $4k$ and $7k$. The total is $11k = 132$, so $k = 12$ and the blue count is $7k = 84$.\n\n**Trigger cue**\n\n\"The ratio is $m : n$\" plus a total: divide the total by $m + n$ once, then multiply.\n\n**Takeaway**\n\nRatio numbers are parts, not counts — find the multiplier first.",
    fastest_path_md: "$132 \\div 11 = 12$; $12 \\times 7 = 84$.",
    trap_map: {
      "0": "Reports the multiplier $k$ rather than the blue count.",
      "1": "Reports the red count, $4k$.",
      "2": "Divides by $12$ parts instead of $11$.",
      "4": "Reads the ratio as $1 : 2$ and takes two-thirds of the total.",
    },
    numeric_check: "132/11*7",
    check() {
      for (let k = 1; k <= 500; k++) {
        if (4 * k + 7 * k === 132) return { kind: "value", value: 7 * k };
      }
      throw new Error("no multiplier");
    },
  },

  // 2 — D2: inverse proportion
  {
    ...S,
    context: "pure",
    difficulty: 2,
    stem_md:
      "The variable $y$ is inversely proportional to $x$. When $x = 6$, $y = 15$. What is the value of $y$ when $x = 10$?",
    choices: ["$5.4$", "$9$", "$11$", "$25$", "$90$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nInverse proportionality means $xy = k$ is constant: $k = 6 \\times 15 = 90$. At $x = 10$, $y = \\frac{90}{10} = 9$.\n\n**Trigger cue**\n\n\"Inversely proportional to $x$\": write $y = \\frac{k}{x}$ before touching any numbers — the product, not the quotient, is fixed.\n\n**Takeaway**\n\nInverse means the product stays constant.",
    fastest_path_md: "$x$ grows by $\\frac{10}{6}$, so $y$ shrinks by it: $15 \\cdot \\frac{6}{10} = 9$.",
    trap_map: {
      "0": "Divides by the ratio $\\frac{10}{6}$ twice, as if $y$ varied inversely with $x^{2}$.",
      "2": "Subtracts the increase in $x$ from $y$, $15 - 4$.",
      "3": "Treats the relationship as direct, scaling $y$ up by $\\frac{10}{6}$.",
      "4": "Reports the constant $k$ instead of the new $y$.",
    },
    numeric_check: "90/10",
    check() {
      const k = 6 * 15;
      let y = null;
      for (let tenths = 1; tenths <= 2000; tenths++) {
        const candidate = tenths / 10;
        if (Math.abs(10 * candidate - k) < 1e-9) y = candidate;
      }
      if (y == null) throw new Error("no y");
      return { kind: "value", value: y };
    },
  },

  // 3 — D2: coefficients swap sides
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $3x = 4y$ and $y \\neq 0$, what is the ratio of $x$ to $y$?",
    choices: ["$1 : 12$", "$3 : 4$", "$4 : 3$", "$7 : 12$", "$12 : 1$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nDivide both sides by $3y$: $\\frac{x}{y} = \\frac{4}{3}$, so $x : y = 4 : 3$. Check with a concrete pair: $x = 4$, $y = 3$ gives $3(4) = 4(3) = 12$.\n\n**Trigger cue**\n\n\"$ax = by$\": the coefficients swap sides — $x : y = b : a$. Solve it explicitly or plug the LCM.\n\n**Takeaway**\n\nIn $ax = by$ the coefficients cross over.",
    fastest_path_md:
      "Set the common value to $12$: $x = 4$, $y = 3$, so $4 : 3$.",
    trap_map: {
      "0": "Divides the coefficients into the LCM but reports the parts in the wrong order.",
      "1": "Reads the coefficients straight off, $3 : 4$, without swapping them.",
      "3": "Adds the coefficients into the second term.",
      "4": "Multiplies the coefficients into a single part.",
    },
    numeric_check: null,
    check(q) {
      const pairs = [];
      for (let x = 1; x <= 60; x++) {
        for (let y = 1; y <= 60; y++) if (3 * x === 4 * y) pairs.push([x, y]);
      }
      const reduced = pairs.map(([x, y]) => reduce([x, y]).join(":"));
      if (new Set(reduced).size !== 1) throw new Error("ratio not constant");
      return ratioIndex(q.choices, pairs[0]);
    },
  },

  // 4 — D3: chain two ratios through the shared term
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $x : y = 2 : 5$ and $y : z = 3 : 4$, what is $x : z$?",
    choices: ["$1 : 2$", "$3 : 10$", "$5 : 6$", "$8 : 15$", "$10 : 3$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nMake the shared term match: scale $x : y = 2 : 5$ by $3$ to get $6 : 15$, and scale $y : z = 3 : 4$ by $5$ to get $15 : 20$. Then $x : y : z = 6 : 15 : 20$, so $x : z = 6 : 20 = 3 : 10$.\n\n**Trigger cue**\n\nTwo ratios sharing one variable: rescale both so the shared term is their LCM, then read the combined ratio off in one line.\n\n**Takeaway**\n\nThe shared term must be identical in both ratios first.",
    fastest_path_md: "$\\frac{x}{z} = \\frac{x}{y}\\cdot\\frac{y}{z} = \\frac{2}{5}\\cdot\\frac{3}{4} = \\frac{3}{10}$.",
    trap_map: {
      "0": "Chains without aligning, reading the parts as $2 : 5 : 4$ and taking $2 : 4$.",
      "2": "Aligns on the wrong term, effectively using $y : x$ in the first ratio.",
      "3": "Crosses the terms, computing $2 \\cdot 4 : 5 \\cdot 3$.",
      "4": "Finds the right ratio but reports it as $z : x$.",
    },
    numeric_check: null,
    check(q) {
      const found = [];
      for (let x = 1; x <= 200; x++) {
        for (let y = 1; y <= 200; y++) {
          for (let z = 1; z <= 200; z++) {
            if (x * 5 === y * 2 && y * 4 === z * 3) found.push([x, z]);
          }
        }
      }
      if (found.length === 0) throw new Error("no triple");
      const reduced = new Set(found.map(([x, z]) => reduce([x, z]).join(":")));
      if (reduced.size !== 1) throw new Error("ratio not constant");
      return ratioIndex(q.choices, found[0]);
    },
  },

  // 5 — D3: an addition demands a fresh equation
  {
    ...S,
    context: "real",
    difficulty: 3,
    stem_md:
      "In a certain class the ratio of boys to girls is $3 : 5$. If $12$ more boys join the class and no one leaves, the ratio of boys to girls becomes $9 : 10$. How many girls are in the class?",
    choices: ["$8$", "$24$", "$36$", "$40$", "$64$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nWrite the counts as $3k$ boys and $5k$ girls. After the arrivals, $\\frac{3k+12}{5k} = \\frac{9}{10}$, so $10(3k+12) = 45k$, i.e. $30k + 120 = 45k$ and $k = 8$. The girls number $5k = 40$.\n\n**Trigger cue**\n\n\"If $n$ more are added, the ratio becomes …\": parts as $mk$ and $nk$, apply the change, cross-multiply the new ratio.\n\n**Takeaway**\n\nAn addition breaks the old ratio; write a fresh equation.",
    fastest_path_md:
      "$10(3k+12) = 45k \\Rightarrow k = 8$; girls $= 5(8) = 40$.",
    trap_map: {
      "0": "Reports the multiplier $k$ rather than a head count.",
      "1": "Reports the original number of boys, $3k$.",
      "2": "Reports the number of boys after the twelve arrive.",
      "4": "Reports the original class total, $8k$.",
    },
    numeric_check: "5*8",
    check() {
      const hits = [];
      for (let k = 1; k <= 500; k++) {
        if ((3 * k + 12) * 10 === 5 * k * 9) hits.push(5 * k);
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 6 — D3: equal ratios add across
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $\\dfrac{a}{b} = \\dfrac{3}{7}$, $\\dfrac{c}{d} = \\dfrac{3}{7}$, and $a + c = 24$, what is the value of $b + d$?",
    choices: ["$10$", "$28$", "$31$", "$56$", "$168$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nEqual ratios add across: if $\\frac{a}{b} = \\frac{c}{d} = \\frac{3}{7}$, then $\\frac{a+c}{b+d}$ equals that same $\\frac{3}{7}$. So $\\frac{24}{b+d} = \\frac{3}{7}$ and $b + d = \\frac{24 \\times 7}{3} = 56$.\n\n**Trigger cue**\n\nTwo equal ratios with a sum given across the numerators: the sum of numerators over the sum of denominators is the same ratio.\n\n**Takeaway**\n\nEqual ratios stay equal when you add across them.",
    fastest_path_md: "$\\frac{24}{?} = \\frac{3}{7} \\Rightarrow ? = 24 \\cdot \\frac{7}{3} = 56$.",
    trap_map: {
      "0": "Adds the ratio's own terms, $3 + 7$.",
      "1": "Halves the numerator sum before scaling, using $\\frac{24}{6}\\cdot 7$.",
      "2": "Adds $24 + 7$.",
      "4": "Multiplies by $7$ without dividing by $3$.",
    },
    numeric_check: "24*7/3",
    check() {
      const sums = new Set();
      for (let a = 1; a < 24; a++) {
        const c = 24 - a;
        if ((a * 7) % 3 !== 0 || (c * 7) % 3 !== 0) continue;
        sums.add((a * 7) / 3 + (c * 7) / 3);
      }
      if (sums.size !== 1) throw new Error(`sums: ${[...sums]}`);
      return { kind: "value", value: [...sums][0] };
    },
  },

  // 7 — D3: inverse-square proportion
  {
    ...S,
    context: "real",
    difficulty: 3,
    stem_md:
      "The intensity of a light source is inversely proportional to the square of the distance from the source. At a distance of $4$ metres the intensity is $45$ units. What is the intensity, in units, at a distance of $6$ metres?",
    choices: ["$20$", "$22.5$", "$30$", "$67.5$", "$101.25$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nWrite $I = \\frac{k}{d^{2}}$. From $45 = \\frac{k}{16}$, $k = 720$. At $d = 6$, $I = \\frac{720}{36} = 20$.\n\n**Trigger cue**\n\n\"Inversely proportional to the square of\": the distance ratio gets squared and divides — $\\left(\\frac{4}{6}\\right)^{2}$ of the old intensity.\n\n**Takeaway**\n\nInverse-square: scale by the squared ratio, and divide.",
    fastest_path_md:
      "Distance $\\times \\frac{3}{2}$, so intensity $\\times \\left(\\frac{2}{3}\\right)^{2} = \\frac{4}{9}$: $45 \\cdot \\frac{4}{9} = 20$.",
    trap_map: {
      "1": "Halves the intensity, treating the distance as though it had doubled.",
      "2": "Uses a plain inverse rather than an inverse square, $45 \\cdot \\frac{4}{6}$.",
      "3": "Treats intensity as directly proportional to distance.",
      "4": "Scales up by the squared ratio instead of down.",
    },
    numeric_check: "720/36",
    check() {
      const k = 45 * 4 ** 2;
      return { kind: "value", value: k / 6 ** 2 };
    },
  },

  // 8 — D3: equal products, LCM plug
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $x$, $y$, and $z$ are positive numbers with $2x = 3y = 8z$, what is $x : y : z$?",
    choices: [
      "$2 : 3 : 8$",
      "$3 : 2 : 8$",
      "$4 : 6 : 16$",
      "$8 : 12 : 3$",
      "$12 : 8 : 3$",
    ],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nSet the common value to the LCM of the coefficients, $24$: then $x = 12$, $y = 8$, and $z = 3$, so $x : y : z = 12 : 8 : 3$. Check: $2(12) = 3(8) = 8(3) = 24$.\n\n**Trigger cue**\n\n\"$ax = by = cz$\": set the common value to $\\mathrm{lcm}(a,b,c)$ and read each variable straight off.\n\n**Takeaway**\n\nEqual products invert the coefficients; plug the LCM.",
    fastest_path_md: "Common value $24$: $x = 12$, $y = 8$, $z = 3$.",
    trap_map: {
      "0": "Reads the coefficients off as the ratio without inverting them.",
      "1": "Swaps only the first two coefficients.",
      "2": "Doubles the coefficients, which still fails to invert them.",
      "3": "Inverts the ratio for $z$ only, leaving $x$ and $y$ in coefficient order.",
    },
    numeric_check: null,
    check(q) {
      const triples = [];
      for (let x = 1; x <= 120; x++) {
        for (let y = 1; y <= 120; y++) {
          for (let z = 1; z <= 120; z++) {
            if (2 * x === 3 * y && 3 * y === 8 * z) triples.push([x, y, z]);
          }
        }
      }
      if (triples.length === 0) throw new Error("no triple");
      const reduced = new Set(triples.map((t) => reduce(t).join(":")));
      if (reduced.size !== 1) throw new Error("ratio not constant");
      return ratioIndex(q.choices, triples[0]);
    },
  },

  // 9 — D3: shift one part of a blend to a new ratio
  {
    ...S,
    context: "real",
    difficulty: 3,
    stem_md:
      "A coffee blend contains beans of type A and type B in the ratio $5 : 3$ by weight. How many kilograms of type B must be added to $32$ kilograms of this blend so that the ratio of A to B becomes $5 : 7$?",
    choices: ["$8$", "$12$", "$16$", "$20$", "$28$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nIn $32$ kilograms the parts are $\\frac{5}{8}(32) = 20$ of A and $\\frac{3}{8}(32) = 12$ of B. Only B changes, so $\\frac{20}{12 + b} = \\frac{5}{7}$, giving $12 + b = 28$ and $b = 16$.\n\n**Trigger cue**\n\nOne ingredient added to a fixed blend: convert the ratio to actual amounts first, then hold the untouched quantity constant.\n\n**Takeaway**\n\nAdding to one part leaves the other part fixed — anchor on it.",
    fastest_path_md:
      "A stays $20$; the new ratio makes B $= \\frac{7}{5}(20) = 28$, so add $28 - 12 = 16$.",
    trap_map: {
      "0": "Uses the difference in the ratio's second terms, $7 - 3$, as kilograms.",
      "1": "Reports the original amount of B.",
      "3": "Reports the amount of A, which does not change.",
      "4": "Reports the new total amount of B rather than the amount added.",
    },
    numeric_check: "28 - 12",
    check() {
      const a = (32 * 5) / 8;
      const b0 = (32 * 3) / 8;
      const hits = [];
      for (let tenths = 0; tenths <= 2000; tenths++) {
        const add = tenths / 10;
        if (Math.abs(a * 7 - (b0 + add) * 5) < 1e-9) hits.push(add);
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 10 — D3: compose two fractional relations
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $x$ is $\\dfrac{3}{5}$ of $y$, and $y$ is $\\dfrac{10}{9}$ of $z$, then $x$ is what fraction of $z$?",
    choices: [
      "$\\dfrac{27}{50}$",
      "$\\dfrac{3}{5}$",
      "$\\dfrac{2}{3}$",
      "$\\dfrac{10}{9}$",
      "$\\dfrac{3}{2}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n\"$x$ is $\\frac{3}{5}$ of $y$\" means $x = \\frac{3}{5}y$, and $y = \\frac{10}{9}z$. Substituting, $x = \\frac{3}{5}\\cdot\\frac{10}{9}z = \\frac{30}{45}z = \\frac{2}{3}z$.\n\n**Trigger cue**\n\nTwo \"is a fraction of\" statements sharing a middle variable: multiply the fractions in the order the chain runs.\n\n**Takeaway**\n\nChained \"fraction of\" statements multiply, front to back.",
    fastest_path_md: "$\\frac{3}{5}\\cdot\\frac{10}{9} = \\frac{2}{3}$.",
    trap_map: {
      "0": "Inverts the second fraction before multiplying.",
      "1": "Reports only the first relation.",
      "3": "Reports only the second relation.",
      "4": "Inverts the product, answering what fraction $z$ is of $x$.",
    },
    numeric_check: "2/3",
    check() {
      const ratios = new Set();
      for (const z of [9, 45, 90, 180]) {
        const y = (10 / 9) * z;
        const x = (3 / 5) * y;
        ratios.add((x / z).toFixed(10));
      }
      if (ratios.size !== 1) throw new Error(`ratios: ${[...ratios]}`);
      return { kind: "value", value: Number([...ratios][0]) };
    },
  },

  // 11 — D5: three-way alignment plus a shift equation
  {
    ...S,
    context: "real",
    difficulty: 5,
    stem_md:
      "At a company, the ratio of managers to engineers is $2 : 9$ and the ratio of engineers to interns is $6 : 5$. After the company hires $30$ additional interns and no one else, the ratio of engineers to interns becomes $9 : 10$. How many managers does the company have?",
    choices: ["$6$", "$24$", "$30$", "$90$", "$108$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nAlign on engineers. Scale $2 : 9$ by $2$ to get managers $:$ engineers $= 4 : 18$, and scale $6 : 5$ by $3$ to get engineers $:$ interns $= 18 : 15$. So the three counts are $4k$, $18k$, $15k$. After the hires, $\\frac{18k}{15k+30} = \\frac{9}{10}$, so $180k = 135k + 270$, giving $k = 6$. Managers number $4k = 24$.\n\n**Trigger cue**\n\nTwo ratios sharing a middle group, plus a change to one end: align the shared term to its LCM, write all three as multiples of one $k$, then let the change give the equation.\n\n**Takeaway**\n\nAlign first, then let the change fix the multiplier.",
    fastest_path_md:
      "$4 : 18 : 15$; $180k = 9(15k+30) \\Rightarrow k = 6$; managers $= 24$.",
    trap_map: {
      "0": "Reports the multiplier $k$ rather than a head count.",
      "2": "Reports the number of interns hired, which the stem already gave.",
      "3": "Reports the original number of interns.",
      "4": "Reports the number of engineers.",
    },
    numeric_check: "4*6",
    check() {
      const hits = [];
      // Brute-force whole staffs, not the aligned parts: any (m, e, i) with
      // both ratios exact and the post-hire ratio exact.
      for (let e = 1; e <= 4000; e++) {
        if (e * 2 % 9 !== 0) continue;
        const m = (e * 2) / 9;
        if (e * 5 % 6 !== 0) continue;
        const i = (e * 5) / 6;
        if (e * 10 === (i + 30) * 9) hits.push(m);
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
