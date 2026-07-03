/**
 * Batch: 7 new overlapping_sets items (counting_sets_series_prob_stats / arithmetic).
 * Cells: D2 PS real, D2 PS pure, D3 PS pure, D4 PS pure, D4 PS pure, D5 PS pure, D5 PS real.
 * Run: node scripts/author/batch-overlapping_sets.mjs   (APPEND=1 to write to the bank)
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ── 1. D2 PS real ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 2,
    stem_md:
      "Of the $80$ diners at a food festival, $47$ visited the taco stand, $36$ visited the noodle stand, and $12$ visited both stands. How many diners visited exactly one of the two stands?",
    choices: ["$9$", "$35$", "$59$", "$71$", "$83$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nDiners at the taco stand only: $47 - 12 = 35$. Diners at the noodle stand only: $36 - 12 = 24$. Exactly one stand: $35 + 24 = 59$.\n\n**Trigger cue**\n\nWhen the question asks for \"exactly one,\" strip the overlap out of each set before adding.\n\n**Takeaway**\n\nExactly one means each set minus the overlap, summed.",
    fastest_path_md:
      "Taco only $47 - 12 = 35$; noodle only $36 - 12 = 24$; total $35 + 24 = 59$.",
    trap_map: {
      "0": "Computes the diners who visited neither stand, $80 - (47 + 36 - 12)$.",
      "1": "Counts only the taco-only group, $47 - 12$, forgetting the noodle-only diners.",
      "3": "Reports the union $47 + 36 - 12$, which still includes the both-stand diners.",
      "4": "Adds $47 + 36$ without removing the overlap at all.",
    },
    numeric_check: "(47-12)+(36-12)",
    check() {
      // Simulate the 80 diners directly: taco = diners 0..46, noodle = 35..70.
      const taco = new Set();
      const noodle = new Set();
      for (let d = 0; d < 47; d++) taco.add(d);
      for (let d = 35; d < 71; d++) noodle.add(d);
      let both = 0;
      for (const d of taco) if (noodle.has(d)) both++;
      if (taco.size !== 47 || noodle.size !== 36 || both !== 12)
        throw new Error("simulation does not match stem data");
      let exactlyOne = 0;
      for (let d = 0; d < 80; d++) {
        const t = taco.has(d);
        const n = noodle.has(d);
        if (t !== n) exactlyOne++;
      }
      return { kind: "value", value: exactlyOne };
    },
  },

  // ── 2. D2 PS pure ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 2,
    stem_md:
      "Sets $A$ and $B$ satisfy $|A| = 33$, $|B| = 24$, and $|A \\cup B| = 49$. How many elements are in $A \\cap B$?",
    choices: ["$8$", "$16$", "$25$", "$41$", "$57$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nBy inclusion–exclusion, $|A \\cap B| = |A| + |B| - |A \\cup B| = 33 + 24 - 49 = 8$.\n\n**Trigger cue**\n\nWhen both set sizes and the union are given, apply inclusion–exclusion in one step.\n\n**Takeaway**\n\nOverlap equals the sum of the sizes minus the union.",
    fastest_path_md:
      "$33 + 24 = 57$ counts the overlap twice; the union counts it once, so overlap $= 57 - 49 = 8$.",
    trap_map: {
      "1": "Computes $49 - 33$, the elements in $B$ only, and mistakes it for the overlap.",
      "2": "Computes $49 - 24$, the elements in $A$ only, and mistakes it for the overlap.",
      "3": "Reports the number of elements in exactly one of the sets.",
      "4": "Adds $33 + 24$ and ignores the union constraint entirely.",
    },
    numeric_check: "33+24-49",
    check() {
      // Construct concrete sets: A = {0..32}, B = {25..48}, and count directly.
      const A = new Set();
      const B = new Set();
      for (let x = 0; x <= 32; x++) A.add(x);
      for (let x = 25; x <= 48; x++) B.add(x);
      const union = new Set([...A, ...B]);
      if (A.size !== 33 || B.size !== 24 || union.size !== 49)
        throw new Error("constructed sets do not match stem data");
      let inter = 0;
      for (const x of A) if (B.has(x)) inter++;
      return { kind: "value", value: inter };
    },
  },

  // ── 3. D3 PS pure ──────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 3,
    stem_md:
      "In a group of $90$ elements, the number of elements having property $R$ is twice the number having property $S$. If $15$ elements have both properties and $21$ elements have neither, how many elements have property $R$?",
    choices: ["$28$", "$41$", "$46$", "$56$", "$69$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nElements with at least one property: $90 - 21 = 69$. Inclusion–exclusion gives $R + S - 15 = 69$, so $R + S = 84$. With $R = 2S$, $3S = 84$, so $S = 28$ and $R = 56$.\n\n**Trigger cue**\n\nA ratio between set sizes plus a neither count: set one variable and write the inclusion–exclusion equation.\n\n**Takeaway**\n\nTranslate the ratio into one variable inside inclusion–exclusion.",
    fastest_path_md:
      "Backsolve: try $R = 56$, so $S = 28$; union $= 56 + 28 - 15 = 69$ and $69 + 21 = 90$. Done.",
    trap_map: {
      "0": "Solves correctly but reports $S$ instead of $R$.",
      "1": "Reports the elements with $R$ only, $56 - 15$.",
      "2": "Sets $R + S = 69$, forgetting to add the overlap back into the union equation.",
      "4": "Reports the union, the count with at least one property.",
    },
    numeric_check: "2*(90-21+15)/3",
    check() {
      // Enumerate every candidate size of S and keep those consistent with the stem.
      const results = new Set();
      for (let s = 0; s <= 90; s++) {
        const r = 2 * s;
        if (r > 90) continue;
        const both = 15;
        const rOnly = r - both;
        const sOnly = s - both;
        if (rOnly < 0 || sOnly < 0) continue;
        if (rOnly + sOnly + both + 21 !== 90) continue;
        results.add(r);
      }
      if (results.size !== 1)
        throw new Error("R not uniquely determined: " + [...results].join(","));
      return { kind: "value", value: [...results][0] };
    },
  },

  // ── 4. D4 PS pure (min overlap) ───────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 4,
    stem_md:
      "Sets $A$ and $B$ are each subsets of a set $T$ that has exactly $100$ elements. If $A$ has $63$ elements and $B$ has $58$ elements, what is the least possible number of elements in $A \\cap B$?",
    choices: ["$0$", "$21$", "$37$", "$42$", "$58$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nSince $A \\cup B \\subseteq T$, $|A \\cup B| \\le 100$. Then $|A \\cap B| = |A| + |B| - |A \\cup B| \\ge 63 + 58 - 100 = 21$, achieved when the union fills all of $T$.\n\n**Trigger cue**\n\n\"Least possible overlap\" with a fixed universe: push the union to its maximum, the whole set.\n\n**Takeaway**\n\nMinimum overlap is the amount the sizes' sum exceeds the total.",
    fastest_path_md:
      "$63 + 58 = 121$ memberships must fit into $100$ slots, so at least $21$ elements are counted twice.",
    trap_map: {
      "0": "Assumes the sets could be disjoint, ignoring that $63 + 58$ exceeds $100$.",
      "2": "Reports $100 - 63$, the complement of $A$.",
      "3": "Reports $100 - 58$, the complement of $B$.",
      "4": "Finds the greatest possible overlap, $\\min(63, 58)$, instead of the least.",
    },
    numeric_check: "63+58-100",
    check() {
      // Enumerate every candidate overlap and keep the smallest feasible one.
      const feasible = [];
      for (let k = 0; k <= 58; k++) {
        const aOnly = 63 - k;
        const bOnly = 58 - k;
        const neither = 100 - (aOnly + bOnly + k);
        if (aOnly >= 0 && bOnly >= 0 && neither >= 0) feasible.push(k);
      }
      if (feasible.length < 3) throw new Error("too few feasible overlaps");
      return { kind: "value", value: Math.min(...feasible) };
    },
  },

  // ── 5. D4 PS pure (conditional fraction) ──────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 4,
    stem_md:
      "In a certain finite set, $45\\%$ of the elements have property $P$, $30\\%$ have property $Q$, and $40\\%$ have neither property. What fraction of the elements that have property $P$ also have property $Q$?",
    choices: [
      "$\\frac{3}{20}$",
      "$\\frac{1}{4}$",
      "$\\frac{1}{3}$",
      "$\\frac{1}{2}$",
      "$\\frac{2}{3}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nElements with at least one property: $100\\% - 40\\% = 60\\%$. Both: $45\\% + 30\\% - 60\\% = 15\\%$. The question asks for a fraction of $P$, not of the whole set: $\\frac{15}{45} = \\frac{1}{3}$.\n\n**Trigger cue**\n\n\"What fraction of the elements in $X$...\" signals a conditional ratio: divide by $|X|$, never by the total.\n\n**Takeaway**\n\nUse the asked-about group, not the total, as denominator.",
    fastest_path_md:
      "Neither $40\\%$ gives union $60\\%$, so both $= 15\\%$; then $\\frac{15}{45} = \\frac{1}{3}$.",
    trap_map: {
      "0": "Finds both correctly as $15\\%$ but divides by the whole set instead of by $P$.",
      "1": "Divides $15$ by the union $60$ rather than by the $45$ in $P$.",
      "3": "Divides $15$ by the $30$ in $Q$, answering the reverse question.",
      "4": "Computes the fraction of $P$ that is not in $Q$.",
    },
    numeric_check: "15/45",
    check() {
      // Take a 100-element model and enumerate the overlap consistent with the stem.
      const results = new Set();
      for (let b = 0; b <= 30; b++) {
        const pOnly = 45 - b;
        const qOnly = 30 - b;
        if (pOnly < 0 || qOnly < 0) continue;
        const neither = 100 - (pOnly + qOnly + b);
        if (neither !== 40) continue;
        results.add(b);
      }
      if (results.size !== 1)
        throw new Error("overlap not unique: " + [...results].join(","));
      const both = [...results][0];
      return { kind: "value", value: both / 45 };
    },
  },

  // ── 6. D5 PS pure (three sets, at least two) ──────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 5,
    stem_md:
      "Each element of a $90$-element set belongs to at least one of the sets $X$, $Y$, and $Z$. Set $X$ has $52$ elements, set $Y$ has $44$ elements, and set $Z$ has $38$ elements. If exactly $12$ elements belong to all three sets, how many elements belong to at least two of the sets?",
    choices: ["$12$", "$20$", "$32$", "$44$", "$56$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $d$ be the count in exactly two sets and $t = 12$ the count in all three. Summing the set sizes counts doubles twice and triples three times: $52 + 44 + 38 = 90 + d + 2t$. So $134 = 90 + d + 24$, giving $d = 20$. At least two: $d + t = 20 + 12 = 32$.\n\n**Trigger cue**\n\nThree set sizes plus a union: the surplus $\\sum|S_i| - |\\text{union}|$ counts doubles once and triples twice.\n\n**Takeaway**\n\nSize surplus over the union counts doubles once, triples twice.",
    fastest_path_md:
      "Surplus $= 52 + 44 + 38 - 90 = 44$; it counts the $12$ triples twice, so at least two $= 44 - 12 = 32$.",
    trap_map: {
      "0": "Reports only the elements that belong to all three sets.",
      "1": "Finds the exactly-two count $20$ but forgets to add back the all-three elements.",
      "3": "Treats the surplus $52 + 44 + 38 - 90$ as the at-least-two count, double-counting the triple overlap.",
      "4": "Adds the all-three count to the surplus $44$, which already counts those elements twice.",
    },
    numeric_check: "52+44+38-90-12",
    check() {
      // Exhaustive search over the three pairwise-only regions with the triple fixed.
      const t = 12;
      const answers = new Set();
      let models = 0;
      for (let xy = 0; xy <= 52; xy++) {
        for (let xz = 0; xz <= 52; xz++) {
          for (let yz = 0; yz <= 52; yz++) {
            const onlyX = 52 - xy - xz - t;
            const onlyY = 44 - xy - yz - t;
            const onlyZ = 38 - xz - yz - t;
            if (onlyX < 0 || onlyY < 0 || onlyZ < 0) continue;
            const total = onlyX + onlyY + onlyZ + xy + xz + yz + t;
            if (total !== 90) continue; // union must cover all 90 elements
            models++;
            answers.add(xy + xz + yz + t);
          }
        }
      }
      if (models < 3) throw new Error("too few models found: " + models);
      if (answers.size !== 1)
        throw new Error("answer not invariant: " + [...answers].join(","));
      return { kind: "value", value: [...answers][0] };
    },
  },

  // ── 7. D5 PS real (matrix with a cross-cell relation) ─────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 5,
    stem_md:
      "A consulting firm employs $180$ people, of whom $110$ are analysts and the rest are support staff. Exactly $85$ of the employees work remotely and the others work in the office. If the number of analysts who work remotely is twice the number of support staff who work in the office, how many analysts work in the office?",
    choices: ["$15$", "$30$", "$55$", "$80$", "$95$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSupport staff: $180 - 110 = 70$. Let $s$ be the support staff in the office, so the analysts working remotely number $2s$ and the support staff working remotely number $70 - s$. Remote total: $2s + (70 - s) = 85$, so $s = 15$. Analysts remotely: $30$; analysts in the office: $110 - 30 = 80$.\n\n**Trigger cue**\n\nTwo binary attributes with a relation linking cells across categories: build the double-set matrix and put one variable in the linked cell.\n\n**Takeaway**\n\nOne variable in the linked cell; rows and columns close themselves.",
    fastest_path_md:
      "Backsolve: analysts in office $80$ gives analysts remote $30$, support remote $55$, support office $15$, and $30 = 2 \\cdot 15$ checks.",
    trap_map: {
      "0": "Solves for the support staff in the office, the variable itself.",
      "1": "Reports the analysts who work remotely.",
      "2": "Reports the support staff who work remotely.",
      "4": "Reports the total number of employees in the office.",
    },
    numeric_check: "110-2*15",
    check() {
      // Enumerate the free cell (analysts remote) and test the whole matrix.
      const answers = new Set();
      for (let aR = 0; aR <= 110; aR++) {
        const sR = 85 - aR;
        if (sR < 0 || sR > 70) continue;
        const aO = 110 - aR;
        const sO = 70 - sR;
        if (aO < 0 || sO < 0) continue;
        if (aR !== 2 * sO) continue;
        answers.add(aO);
      }
      if (answers.size !== 1)
        throw new Error("matrix not uniquely determined: " + [...answers].join(","));
      return { kind: "value", value: [...answers][0] };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
