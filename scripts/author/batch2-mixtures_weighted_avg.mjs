/**
 * Batch 2: 15 new questions for subtopic "mixtures_weighted_avg"
 * (fundamental_skill "rates_ratio_percent").
 *
 * Coverage extends the original set into: dollar-weighted returns, reverse
 * combined averages, alloy part-to-part ratios, one-component ratio shifts,
 * variable-expression weighted averages, pairwise-average systems, invariant
 * solids (drying), transfer-between-lists insight, simultaneous exchange,
 * integer-constrained blends, and the subtopic's first three DS items.
 *
 * Difficulty mix: D2 x2, D3 x7 (5 PS + 2 DS), D4 x4 (3 PS + 1 DS), D5 x2.
 *
 * Run: node --experimental-strip-types scripts/author/batch2-mixtures_weighted_avg.mjs
 * (dry run unless --append)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

// A/B/C/D/E from statement sufficiencies, decided by enumeration results.
const dsIndex = (s1, s2, together) =>
  s1 && s2 ? 3 : s1 ? 0 : s2 ? 1 : together ? 2 : 4;

const items = [
  // ── 1. D2 PS real arithmetic — dollar-weighted return ─────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 2,
    stem_md:
      "Last year Amir invested $\\$2{,}000$ in Fund X, which returned $3\\%$ for the year, and $\\$6{,}000$ in Fund Y, which returned $7\\%$ for the year. The total return on the two investments was what percent of the total amount invested?",
    choices: ["4", "5", "6", "8", "10"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nFund X returned $0.03 \\times 2{,}000 = 60$ dollars and Fund Y returned $0.07 \\times 6{,}000 = 420$ dollars. The total return is $480$ dollars on $8{,}000$ dollars invested, and $\\dfrac{480}{8{,}000} = 6\\%$.\n\n**Trigger cue**\nTwo investments of different sizes at different percent returns, with the overall percent asked: weight each rate by its dollar amount.\n\n**Takeaway**\nOverall return is the dollar-weighted average of the individual rates.",
    fastest_path_md:
      "The amounts are in ratio $1:3$, so the overall rate sits three-quarters of the way from $3\\%$ to $7\\%$: $3 + \\frac{3}{4}(4) = 6\\%$.",
    trap_map: {
      "0": "Swaps the weights, applying $7\\%$ to the $\\$2{,}000$ and $3\\%$ to the $\\$6{,}000$.",
      "1": "Takes the simple average of $3\\%$ and $7\\%$, ignoring the unequal amounts invested.",
      "3": "Divides the $\\$480$ total return by the $\\$6{,}000$ in Fund Y alone.",
      "4": "Adds the two percent returns.",
    },
    numeric_check: "(2000*0.03 + 6000*0.07)/8000*100",
    check() {
      // recompute in integer dollar-percent units
      const returnUnits = 2000 * 3 + 6000 * 7;
      const invested = 2000 + 6000;
      return { kind: "value", value: returnUnits / invested };
    },
  },

  // ── 2. D2 PS pure arithmetic — add weaker solution to hit target ──
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 2,
    stem_md:
      "How many liters of a solution that is $30\\%$ acid must be added to $10$ liters of a solution that is $60\\%$ acid in order to obtain a solution that is $40\\%$ acid?",
    choices: ["5", "10", "20", "30", "60"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $x$ be the number of liters of the $30\\%$ solution added. Acid is conserved: $0.30x + 0.60(10) = 0.40(x + 10)$. So $0.3x + 6 = 0.4x + 4$, giving $0.1x = 2$ and $x = 20$.\n\n**Trigger cue**\n\"How many liters must be added\" to bring a known volume to a target concentration: one solute-conservation equation, or alligation on the distances.\n\n**Takeaway**\nMixing amounts are proportional to the opposite distances from the target.",
    fastest_path_md:
      "Alligation: the distances from $40\\%$ are $10$ (to $30\\%$) and $20$ (to $60\\%$), so added : original $= 20:10 = 2:1$. Twice $10$ liters is $20$.",
    trap_map: {
      "0": "Makes each amount proportional to its own distance from $40\\%$ instead of the opposite one, giving $10 \\times \\frac{1}{2} = 5$.",
      "1": "Assumes equal volumes of the two solutions are required.",
      "3": "Reports the total volume of the final mixture, $x + 10 = 30$.",
      "4": "Drops the added volume from the final total, solving $0.3x + 6 = 0.4x$.",
    },
    numeric_check: "20",
    check() {
      // brute force in tenths of a liter with exact integers
      const hits = [];
      for (let k = 1; k <= 10000; k++) {
        // acid units: (tenth-liter x percent)
        if (30 * k + 60 * 100 === 40 * (k + 100)) hits.push(k / 10);
      }
      if (hits.length !== 1) throw new Error("x not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 3. D3 PS real arithmetic — reverse combined average ───────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "The $24$ students in Class A had an average (arithmetic mean) score of $82$ on a certain test. When the scores of the $16$ students in Class B are included, the average score for all $40$ students is $76$. What was the average score for Class B?",
    choices: ["61", "67", "70", "72", "79"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nAll $40$ scores total $40 \\times 76 = 3{,}040$, and Class A's scores total $24 \\times 82 = 1{,}968$. Class B's scores therefore total $3{,}040 - 1{,}968 = 1{,}072$, so Class B's average is $1{,}072 \\div 16 = 67$.\n\n**Trigger cue**\nOne group's average plus the combined average, with the other group's average asked: subtract totals, or balance deviations around the combined mean.\n\n**Takeaway**\nDeviations above and below the combined mean must cancel exactly.",
    fastest_path_md:
      "Balance around $76$: Class A sits $6$ above with weight $24$, a surplus of $144$. Class B's $16$ students must sit $144/16 = 9$ below, at $67$.",
    trap_map: {
      "0": "Scales Class A's $6$-point surplus by $\\frac{40}{16}$ instead of $\\frac{24}{16}$, landing at $76 - 15 = 61$.",
      "2": "Assumes the classes are the same size, computing $2(76) - 82 = 70$.",
      "3": "Swaps the class sizes, weighting Class A by $16$ and Class B by $24$.",
      "4": "Averages Class A's mean with the combined mean: $\\frac{82 + 76}{2}$.",
    },
    numeric_check: "67",
    check() {
      // scan every candidate Class B average in hundredths of a point
      const hits = [];
      for (let h = 0; h <= 10000; h++) {
        // totals in hundredth-points
        if (24 * 8200 + 16 * h === 40 * 7600) hits.push(h / 100);
      }
      if (hits.length !== 1) throw new Error("avg not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 4. D3 PS pure arithmetic — alloy part-to-part ratios ──────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "Alloy $X$ is $3$ parts copper to $2$ parts zinc by weight, and alloy $Y$ is $1$ part copper to $4$ parts zinc by weight. If $10$ kilograms of alloy $X$ are melted together with $5$ kilograms of alloy $Y$, then copper is what fraction of the weight of the resulting alloy?",
    choices: [
      "$\\dfrac{1}{3}$",
      "$\\dfrac{2}{5}$",
      "$\\dfrac{7}{15}$",
      "$\\dfrac{8}{15}$",
      "$\\dfrac{7}{8}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nAlloy $X$ is $\\dfrac{3}{5}$ copper, contributing $\\dfrac{3}{5} \\times 10 = 6$ kg of copper; alloy $Y$ is $\\dfrac{1}{5}$ copper, contributing $\\dfrac{1}{5} \\times 5 = 1$ kg. Copper totals $6 + 1 = 7$ kg of the $15$-kg alloy, a fraction of $\\dfrac{7}{15}$.\n\n**Trigger cue**\nComponents described by part-to-part ratios: convert each ratio to a part-of-whole fraction before weighting by the amounts mixed.\n\n**Takeaway**\nConvert part-to-part ratios to fractions of the whole before averaging.",
    fastest_path_md:
      "$X$ splits its $10$ kg as $6 + 4$; $Y$ splits its $5$ kg as $1 + 4$. Copper is $6 + 1 = 7$ of $15$ kilograms.",
    trap_map: {
      "0": "Swaps the masses, melting $5$ kg of $X$ with $10$ kg of $Y$ to get $\\frac{3+2}{15}$.",
      "1": "Averages the copper fractions $\\frac{3}{5}$ and $\\frac{1}{5}$ without weighting by the alloy masses.",
      "3": "Computes the zinc fraction of the new alloy instead of the copper fraction.",
      "4": "Reports the copper-to-zinc ratio $7:8$ as if it were copper's fraction of the total.",
    },
    numeric_check: "7/15",
    check() {
      // simulate in grams, distributing each alloy into its ratio parts
      const partX = 10000 / (3 + 2);
      const partY = 5000 / (1 + 4);
      let copper = 0;
      for (let i = 0; i < 3; i++) copper += partX;
      for (let i = 0; i < 1; i++) copper += partY;
      const total = 10000 + 5000;
      return { kind: "value", value: copper / total };
    },
  },

  // ── 5. D3 PS real algebra — two-rate investment split ─────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "Naomi invested a total of $\\$10{,}000$ in two funds. For one year, Fund A earned $3\\%$ simple annual interest and Fund B earned $7\\%$ simple annual interest, and the two funds together earned $\\$560$ in interest. How much of the $\\$10{,}000$ was invested in Fund B?",
    choices: [
      "$\\$3{,}500$",
      "$\\$5{,}000$",
      "$\\$5{,}600$",
      "$\\$6{,}500$",
      "$\\$8{,}000$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $b$ be the number of dollars in Fund B. Then $0.03(10{,}000 - b) + 0.07b = 560$, so $300 + 0.04b = 560$, giving $0.04b = 260$ and $b = 6{,}500$.\n\n**Trigger cue**\nA fixed total split across two rates with the blended dollar result given: anchor on one rate and let the difference carry the split.\n\n**Takeaway**\nAnchor on one rate; each shifted dollar earns the rate difference.",
    fastest_path_md:
      "All at $3\\%$ would earn $300$ dollars; the extra $260$ dollars comes from Fund B money earning $4$ extra cents per dollar, so $b = 260/0.04 = 6{,}500$.",
    trap_map: {
      "0": "Solves correctly but reports the amount in Fund A.",
      "1": "Assumes the total was split equally between the two funds.",
      "2": "Divides the $\\$560$ of interest by the sum of the two rates, $10\\%$.",
      "4": "Attributes all $\\$560$ of interest to Fund B, dividing by $7\\%$.",
    },
    numeric_check: "6500",
    check() {
      // brute force every whole-dollar split
      const hits = [];
      for (let b = 0; b <= 10000; b++) {
        // interest in dollar-percent units
        if (3 * (10000 - b) + 7 * b === 56000) hits.push(b);
      }
      if (hits.length !== 1) throw new Error("b not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 6. D3 PS pure algebra — expression choices (p and q) ──────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "The average (arithmetic mean) of $p$ numbers is $q$, and the average of $q$ other numbers is $p$, where $p$ and $q$ are distinct positive integers. In terms of $p$ and $q$, what is the average of all $p + q$ numbers?",
    choices: [
      "$\\dfrac{p+q}{2}$",
      "$\\dfrac{2pq}{p+q}$",
      "$pq$",
      "$\\dfrac{pq}{p+q}$",
      "$\\dfrac{p^2+q^2}{p+q}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe first group's sum is $p \\cdot q$ and the second group's sum is $q \\cdot p$, so all $p + q$ numbers sum to $2pq$. The overall average is $\\dfrac{2pq}{p+q}$.\n\n**Trigger cue**\nGroup averages whose sizes are the letters themselves: work with group sums (size $\\times$ mean), never with the means directly.\n\n**Takeaway**\nCombine groups by summing size-times-mean, then divide by total count.",
    fastest_path_md:
      "Test $p = 2$, $q = 4$: the sums are $8$ and $8$, so the average of the $6$ numbers is $\\dfrac{16}{6} = \\dfrac{8}{3}$. Only $\\dfrac{2pq}{p+q}$ produces $\\dfrac{8}{3}$.",
    trap_map: {
      "0": "Averages the two group means without weighting by the group sizes.",
      "2": "Divides the combined sum $2pq$ by $2$ instead of by the $p+q$ numbers.",
      "3": "Counts the combined sum as $pq$, forgetting that each group contributes $pq$.",
      "4": "Forms each group's sum as size times its own size ($p \\cdot p$ and $q \\cdot q$), swapping count and mean.",
    },
    numeric_check: null,
    check(q) {
      // candidate formulas mirror the five choices, in order
      const formulas = [
        (p, qq) => (p + qq) / 2,
        (p, qq) => (2 * p * qq) / (p + qq),
        (p, qq) => p * qq,
        (p, qq) => (p * qq) / (p + qq),
        (p, qq) => (p * p + qq * qq) / (p + qq),
      ];
      // simulate concrete lists with the stated means, for several (p, q)
      const pairs = [
        [2, 4],
        [3, 7],
        [5, 6],
        [8, 3],
        [9, 2],
      ];
      const alive = new Set([0, 1, 2, 3, 4]);
      for (const [p, qq] of pairs) {
        const buildList = (count, mean) => {
          const vals = [];
          let partial = 0;
          for (let i = 0; i < count - 1; i++) {
            const v = mean + (i + 1); // arbitrary spread
            vals.push(v);
            partial += v;
          }
          vals.push(count * mean - partial); // forces exact mean
          return vals;
        };
        const all = [...buildList(p, qq), ...buildList(qq, p)];
        const avg = all.reduce((s, v) => s + v, 0) / all.length;
        for (const k of [...alive]) {
          if (Math.abs(formulas[k](p, qq) - avg) > 1e-9) alive.delete(k);
        }
      }
      if (alive.size !== 1)
        throw new Error("surviving formulas: " + [...alive].join(","));
      return { kind: "index", index: [...alive][0] };
    },
  },

  // ── 7. D3 PS real algebra — ratio shift, one component fixed ──────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "A dispenser contains a mixture of syrup and water in which the ratio of syrup to water is $5:1$ by volume. After $6$ liters of water are added to the dispenser, the ratio of syrup to water becomes $5:3$. How many liters of syrup does the dispenser contain?",
    choices: ["3", "9", "15", "18", "24"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet the volumes be $5x$ liters of syrup and $x$ liters of water. Adding water changes only the water: $\\dfrac{5x}{x+6} = \\dfrac{5}{3}$. Cross-multiplying, $15x = 5x + 30$, so $x = 3$ and the syrup is $5x = 15$ liters.\n\n**Trigger cue**\nA ratio that changes when only one component is added: the untouched component links the two ratio snapshots.\n\n**Takeaway**\nAnchor on the unchanged component when one part of a ratio moves.",
    fastest_path_md:
      "Syrup is $5$ parts in both ratios, so a \"part\" has the same size before and after: water grows from $1$ part to $3$ parts, so $2$ parts $= 6$ liters and syrup $= 5 \\times 3 = 15$.",
    trap_map: {
      "0": "Reports the original volume of water, $x = 3$, instead of the syrup.",
      "1": "Reports the final volume of water, $3 + 6 = 9$.",
      "3": "Reports the original total volume, $18$ liters.",
      "4": "Reports the final total volume, $24$ liters.",
    },
    numeric_check: "15",
    check() {
      // brute force the original water volume in hundredths of a liter
      const hits = [];
      for (let k = 1; k <= 10000; k++) {
        // syrup = 5k; after adding 600 hundredths of water, ratio must be 5:3
        if (3 * (5 * k) === 5 * (k + 600)) hits.push((5 * k) / 100);
      }
      if (hits.length !== 1) throw new Error("syrup not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 8. D3 DS real arithmetic — ratio vs difference of weights ─────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "On a certain exam, the average (arithmetic mean) score of the students in Group A was $74$, and the average score of the students in Group B was $86$. Every student who took the exam is in exactly one of the two groups. What was the average score of all the students who took the exam?\n\n(1) Group B has $12$ more students than Group A.\n\n(2) Group B has $50\\%$ more students than Group A.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\nWith $a$ and $b$ students, the combined average is $\\dfrac{74a + 86b}{a + b}$, which depends only on the ratio $b:a$.\n\nStatement (1): $b = a + 12$. The ratio still varies: $a = 12, b = 24$ gives $\\dfrac{74(12) + 86(24)}{36} = 82$, while $a = 36, b = 48$ gives $\\dfrac{74(36) + 86(48)}{84} \\approx 80.9$. Not sufficient.\n\nStatement (2): $b = 1.5a$, so the sizes are in ratio $2:3$ and the average is $\\dfrac{2(74) + 3(86)}{5} = 81.2$ for every $a$. Sufficient.\n\n**Trigger cue**\nA combined average asked from two group averages: sufficiency hinges on the ratio of group sizes, not the absolute counts.\n\n**Takeaway**\nWeighted averages need the weight ratio; a fixed difference never fixes it.",
    fastest_path_md:
      "The blend depends only on the size ratio. (2) fixes the ratio at $2:3$ — sufficient. (1) fixes only the difference: $12$ vs $24$ students and $36$ vs $48$ students give different blends — not sufficient.",
    trap_map: {
      "0": "Takes the fixed head-count difference in (1) as determining the blend, though the size ratio still varies.",
      "2": "Combines the statements to extract actual counts, not needed because the ratio in (2) already answers alone.",
      "3": "Treats any relation between the group sizes as sufficient, but (1) leaves the ratio — and the average — varying.",
      "4": "Demands actual student counts, though the combined average depends only on the ratio of the group sizes.",
    },
    numeric_check: null,
    check() {
      const avg = (a, b) => (74 * a + 86 * b) / (a + b);
      // statement (1): b = a + 12, enumerate all sizes
      const set1 = new Set();
      for (let a = 1; a <= 300; a++) set1.add(avg(a, a + 12).toFixed(9));
      // statement (2): b = 1.5a, enumerate even a for integer counts
      const set2 = new Set();
      for (let a = 2; a <= 400; a += 2) set2.add(avg(a, (3 * a) / 2).toFixed(9));
      // together: a + 12 = 1.5a  → enumerate and intersect
      const setT = new Set();
      for (let a = 1; a <= 300; a++) {
        const b = a + 12;
        if (2 * b === 3 * a) setT.add(avg(a, b).toFixed(9));
      }
      const s1 = set1.size === 1;
      const s2 = set2.size === 1;
      const st = setT.size === 1;
      return { kind: "index", index: dsIndex(s1, s2, st) };
    },
  },

  // ── 9. D3 DS pure algebra — drain-replace, two equivalent facts ───
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "A container held $10$ liters of a solution that was $30\\%$ acid by volume. Then $x$ liters of the solution were removed and replaced with $x$ liters of pure water, where $0 < x < 10$. What is the value of $x$?\n\n(1) The resulting solution is $18\\%$ acid by volume.\n\n(2) The removal and replacement decreased the amount of acid in the container by $1.2$ liters.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\nStatement (1): all remaining acid sits in the kept $10 - x$ liters of original solution, so $0.30(10 - x) = 0.18(10)$, giving $10 - x = 6$ and $x = 4$. A unique value — sufficient.\n\nStatement (2): the drained $x$ liters were $30\\%$ acid, so the acid removed is $0.30x = 1.2$, giving $x = 4$. A unique value — sufficient.\n\n**Trigger cue**\nRemove-and-replace with water: acid changes only through what is drained, so either the final percent or the acid lost pins the drained volume.\n\n**Takeaway**\nThe drained portion carries solute out in proportion to its volume.",
    fastest_path_md:
      "Each statement is one linear equation in the single unknown $x$ — (1) gives $0.3(10 - x) = 1.8$ and (2) gives $0.3x = 1.2$ — so each alone is sufficient; no solving needed.",
    trap_map: {
      "0": "Accepts the final concentration in (1) but misses that the drained liquid in (2) was exactly $30\\%$ acid, making (2) a one-unknown equation too.",
      "1": "Accepts the acid loss in (2) but doubts (1), missing that the final percent of a fixed $10$ liters pins the remaining acid and hence $x$.",
      "2": "Combines the statements out of habit even though each alone determines $x$.",
      "4": "Treats both statements as relationships with two unknowns, overlooking that the total volume is fixed at $10$ liters.",
    },
    numeric_check: null,
    check() {
      // enumerate x in hundredths of a liter over 0 < x < 10
      const sols1 = [];
      const sols2 = [];
      for (let h = 1; h <= 999; h++) {
        // (1): acid left 30*(1000-h) hundredth-liter-percent units = 18*1000
        if (30 * (1000 - h) === 18 * 1000) sols1.push(h);
        // (2): acid removed 0.30*(h/100) liters = 1.2  ⇔  3h = 1200
        if (3 * h === 1200) sols2.push(h);
      }
      const together = sols1.filter((h) => sols2.includes(h));
      const s1 = sols1.length === 1;
      const s2 = sols2.length === 1;
      const st = together.length === 1;
      if (together.length === 0) throw new Error("statements contradict");
      return { kind: "index", index: dsIndex(s1, s2, st) };
    },
  },

  // ── 10. D4 DS pure algebra — midpoint comparison insight ──────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 4,
    stem_md:
      "A chemist mixes $x$ liters of Solution R, which is $15\\%$ acid, with $y$ liters of Solution S, which is $35\\%$ acid, where $x > 0$ and $y > 0$. Is the resulting mixture more than $25\\%$ acid?\n\n(1) $y > x$\n\n(2) $x + y = 10$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe mixture is $\\dfrac{15x + 35y}{x + y}$ percent acid, and $25\\%$ is exactly the midpoint of $15\\%$ and $35\\%$. Compare: $\\dfrac{15x + 35y}{x+y} > 25 \\iff 15x + 35y > 25x + 25y \\iff y > x$.\n\nStatement (1): $y > x$, so the answer is a definite yes. Sufficient.\n\nStatement (2): with $x + y = 10$, the pair $x = 1, y = 9$ gives $33\\%$ (yes) while $x = 9, y = 1$ gives $17\\%$ (no). Not sufficient.\n\n**Trigger cue**\nA yes/no comparison of a blend against the exact midpoint of the two concentrations: only which component dominates matters.\n\n**Takeaway**\nA mixture beats the midpoint exactly when the stronger component outweighs.",
    fastest_path_md:
      "Spot that $25$ is the midpoint of $15$ and $35$: the blend exceeds it exactly when there is more of the stronger solution. (1) states precisely that; (2) fixes only the total volume.",
    trap_map: {
      "1": "Prefers the concrete total in (2), but a fixed $10$ liters still allows any blend from near $15\\%$ to near $35\\%$.",
      "2": "Assumes (1) needs the actual volumes from (2), though the midpoint comparison depends only on which volume is larger.",
      "3": "Reads both statements as pinning down the mixture, but (2) alone leaves the concentration on either side of $25\\%$.",
      "4": "Rejects (1) because the exact concentration cannot be computed, though only a comparison is asked.",
    },
    numeric_check: null,
    check() {
      // enumerate volumes in quarter-liters; answer(i,j) for x=i/4, y=j/4
      const moreThan25 = (i, j) => 15 * i + 35 * j > 25 * (i + j);
      const ans1 = new Set();
      const ans2 = new Set();
      const ansT = new Set();
      for (let i = 1; i <= 60; i++) {
        for (let j = 1; j <= 60; j++) {
          if (j > i) ans1.add(moreThan25(i, j));
          if (i + j === 40) ans2.add(moreThan25(i, j));
          if (j > i && i + j === 40) ansT.add(moreThan25(i, j));
        }
      }
      const s1 = ans1.size === 1;
      const s2 = ans2.size === 1;
      const st = ansT.size === 1;
      return { kind: "index", index: dsIndex(s1, s2, st) };
    },
  },

  // ── 11. D4 PS pure arithmetic — pairwise equal-volume system ──────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 4,
    stem_md:
      "Each of solutions $A$, $B$, and $C$ has a constant acid concentration. Combining equal volumes of $A$ and $B$ produces a $26\\%$ acid solution, combining equal volumes of $B$ and $C$ produces a $36\\%$ acid solution, and combining equal volumes of $A$ and $C$ produces a $34\\%$ acid solution. The concentration of solution $C$ is what percent?",
    choices: ["24", "28", "36", "44", "48"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nEqual-volume mixing averages the concentrations, so $a + b = 52$, $b + c = 72$, and $a + c = 68$. Adding all three equations: $2(a + b + c) = 192$, so $a + b + c = 96$. Then $c = 96 - (a + b) = 96 - 52 = 44$.\n\n**Trigger cue**\nAll pairwise blends of several unknown solutions given: sum the pair equations to reach the grand total, then subtract the pair missing your target.\n\n**Takeaway**\nSumming all pairwise sums counts each unknown exactly twice.",
    fastest_path_md:
      "Pair sums are $52$, $72$, $68$; their total $192$ counts each solution twice, so $a + b + c = 96$ and $c = 96 - 52 = 44$.",
    trap_map: {
      "0": "Solves the system but reports solution $A$'s concentration, $24$.",
      "1": "Solves the system but reports solution $B$'s concentration, $28$.",
      "2": "Repeats the given concentration of the $B$-and-$C$ blend instead of isolating $C$.",
      "4": "Subtracts $A$'s concentration rather than $B$'s from the $B{+}C$ pair sum: $72 - 24$.",
    },
    numeric_check: "44",
    check() {
      // exhaustive search over all triples in half-percent units
      const cs = new Set();
      for (let a = 0; a <= 200; a++) {
        for (let b = 0; b <= 200; b++) {
          if (a + b !== 104) continue; // (a+b)/2 = 26 in half-units
          for (let c = 0; c <= 200; c++) {
            if (b + c === 144 && a + c === 136) cs.add(c / 2);
          }
        }
      }
      if (cs.size !== 1) throw new Error("c not unique: " + [...cs].join(","));
      return { kind: "value", value: [...cs][0] };
    },
  },

  // ── 12. D4 PS real arithmetic — invariant solids (drying) ─────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 4,
    stem_md:
      "A batch of freshly harvested mushrooms weighs $80$ kilograms and is $90\\%$ water by weight. After several days of drying, the mushrooms are $75\\%$ water by weight. What is the weight, in kilograms, of the batch after drying? (Only water is lost during drying.)",
    choices: ["8", "32", "48", "60", "68"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe non-water solids weigh $0.10 \\times 80 = 8$ kilograms and do not change. After drying, the solids make up $100 - 75 = 25\\%$ of the batch, so the total weight is $\\dfrac{8}{0.25} = 32$ kilograms.\n\n**Trigger cue**\nA water percentage that falls as something dries or concentrates: track the fixed non-water part, never the water.\n\n**Takeaway**\nAnchor on the invariant solids; water percentages mislead.",
    fastest_path_md:
      "Solids stay at $8$ kg while their share jumps from $10\\%$ to $25\\%$ — a factor of $2.5$ — so the total weight divides by $2.5$: $80 \\to 32$.",
    trap_map: {
      "0": "Reports the weight of the solids alone.",
      "2": "Reports the water lost, $80 - 32 = 48$, instead of the remaining weight.",
      "3": "Takes $75\\%$ of the original $80$ kilograms.",
      "4": "Subtracts the $15$-point drop as $15\\%$ of the original weight: $80 - 12 = 68$.",
    },
    numeric_check: "8/0.25",
    check() {
      // scan every candidate final weight in hundredths of a kilogram
      const solids = 80 * 100 * (1 - 0.9); // 800 hundredths, unchanged
      const hits = [];
      for (let W = Math.ceil(solids) + 1; W <= 8000; W++) {
        // water fraction must be exactly 75%: (W - solids) * 100 === 75 * W
        if ((W - solids) * 100 === 75 * W) hits.push(W / 100);
      }
      if (hits.length !== 1) throw new Error("W not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 13. D4 PS pure algebra — transfer raising both averages ───────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 4,
    stem_md:
      "The average (arithmetic mean) of the numbers in list $X$ is $25$, and the average of the numbers in list $Y$ is $35$. One number is removed from list $Y$ and added to list $X$, after which the average of list $X$ is greater than $25$ and the average of list $Y$ is greater than $35$. Which of the following could be the number that was moved?",
    choices: ["22", "25", "32", "35", "38"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nAdding a number to a list raises its average exactly when the number exceeds the current average, and removing a number raises the average exactly when the number is below it. So the moved number $v$ must satisfy $v > 25$ (to raise $X$'s average) and $v < 35$ (so its removal raises $Y$'s average). Only $32$ lies strictly between $25$ and $35$.\n\n**Trigger cue**\nOne value moved between two groups with both averages rising: the value must sit strictly between the two averages.\n\n**Takeaway**\nA value strictly between two means raises both when transferred.",
    fastest_path_md:
      "Both averages rise only if the number is above $25$ (helping $X$) and below $35$ (its loss helping $Y$): pick the lone choice strictly between them.",
    trap_map: {
      "0": "Below $25$: appending $22$ to list $X$ would lower $X$'s average, not raise it.",
      "1": "Equal to $X$'s average, which would leave $X$'s average unchanged rather than greater.",
      "3": "Equal to $Y$'s average, which would leave $Y$'s average unchanged rather than greater.",
      "4": "Above $35$: removing $38$ from list $Y$ would lower $Y$'s average, not raise it.",
    },
    numeric_check: null,
    check(q) {
      // for each choice, search concrete list sizes for a configuration
      // where both averages strictly increase after the transfer
      const feasible = [];
      q.choices.forEach((c, idx) => {
        const v = Number(c);
        let ok = false;
        for (let nX = 1; nX <= 8 && !ok; nX++) {
          for (let nY = 2; nY <= 9 && !ok; nY++) {
            const newX = (25 * nX + v) / (nX + 1);
            const newY = (35 * nY - v) / (nY - 1);
            if (newX > 25 + 1e-9 && newY > 35 + 1e-9) ok = true;
          }
        }
        if (ok) feasible.push(idx);
      });
      if (feasible.length !== 1)
        throw new Error("feasible choices: " + feasible.join(","));
      return { kind: "index", index: feasible[0] };
    },
  },

  // ── 14. D5 PS pure algebra — simultaneous exchange ────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "Vessel $A$ contains $8$ liters of a $10\\%$ acid solution, and vessel $B$ contains $4$ liters of a $40\\%$ acid solution. The same volume, $v$ liters, is removed from each vessel at the same time; the liquid removed from $A$ is then poured into $B$, and the liquid removed from $B$ is poured into $A$. After this exchange, the solutions in the two vessels have equal concentrations. What is the value of $v$?",
    choices: ["$\\dfrac{4}{3}$", "$\\dfrac{8}{3}$", "$4$", "$\\dfrac{16}{3}$", "$8$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nAfter the exchange, vessel $A$ again holds $8$ liters with acid $0.10(8-v) + 0.40v = 0.8 + 0.3v$, and vessel $B$ holds $4$ liters with acid $0.40(4-v) + 0.10v = 1.6 - 0.3v$. Setting the concentrations equal: $\\dfrac{0.8 + 0.3v}{8} = \\dfrac{1.6 - 0.3v}{4}$. Cross-multiplying, $3.2 + 1.2v = 12.8 - 2.4v$, so $3.6v = 9.6$ and $v = \\dfrac{8}{3}$.\n\n**Trigger cue**\nAn equal swap that ends with equal concentrations: total acid is conserved, so both vessels must land exactly on the pooled concentration.\n\n**Takeaway**\nEqual final concentrations force each vessel to the pooled average.",
    fastest_path_md:
      "Equal concentrations must both equal the pooled $\\dfrac{0.8 + 1.6}{12} = 20\\%$. Vessel $A$ needs $1.6$ liters of acid but holds $0.8$, and each swapped liter nets $0.4 - 0.1 = 0.3$: $v = \\dfrac{0.8}{0.3} = \\dfrac{8}{3}$.",
    trap_map: {
      "0": "Equates the amounts of acid in the two vessels instead of their concentrations, solving $0.8 + 0.3v = 1.6 - 0.3v$.",
      "2": "Targets the simple average of $10\\%$ and $40\\%$, solving $0.8 + 0.3v = 0.25(8)$.",
      "3": "Divides vessel $A$'s acid by the combined $12$ liters, solving $\\dfrac{0.8 + 0.3v}{12} = 0.20$.",
      "4": "Models the exchange sequentially — pour $v$ into $B$, mix, then return $v$ liters — which yields $v = 8$.",
    },
    numeric_check: "8/3",
    check() {
      // simulate the simultaneous exchange and search for the balancing v
      const gap = (v) => {
        const acidA = 0.1 * (8 - v) + 0.4 * v;
        const acidB = 0.4 * (4 - v) + 0.1 * v;
        return acidA / 8 - acidB / 4;
      };
      // uniqueness: count sign changes across (0, 4)
      let changes = 0;
      let prev = gap(0.0005);
      for (let k = 1; k <= 7999; k++) {
        const cur = gap(0.0005 + k * 0.0005);
        if ((prev < 0 && cur >= 0) || (prev > 0 && cur <= 0)) changes++;
        prev = cur;
      }
      if (changes !== 1) throw new Error("expected one root, saw " + changes);
      // bisection to full precision
      let lo = 0;
      let hi = 4;
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        if (gap(lo) * gap(mid) <= 0) hi = mid;
        else lo = mid;
      }
      return { kind: "value", value: (lo + hi) / 2 };
    },
  },

  // ── 15. D5 PS pure arithmetic — integer blends, divisibility ──────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A chemist will prepare $12$ liters of solution by combining $j$ liters of a $15\\%$ acid solution with $k$ liters of a $35\\%$ acid solution, where $j$ and $k$ are positive integers and $j + k = 12$. For how many of the possible pairs $(j, k)$ is the acid concentration of the resulting solution equal to a whole-number percent?",
    choices: ["3", "4", "5", "11", "21"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe concentration is $\\dfrac{15j + 35k}{12} = \\dfrac{15(12 - k) + 35k}{12} = \\dfrac{180 + 20k}{12} = 15 + \\dfrac{5k}{3}$ percent. Since $5$ and $3$ share no factor, this is a whole number exactly when $k$ is a multiple of $3$. With $1 \\le k \\le 11$, that means $k = 3, 6, 9$, giving $20\\%$, $25\\%$, and $30\\%$ — $3$ pairs.\n\n**Trigger cue**\nA blend restricted to integer amounts and an integer percent: simplify the weighted average until it becomes a divisibility condition on one variable.\n\n**Takeaway**\nInteger-mixture counts reduce to a divisibility condition after simplifying.",
    fastest_path_md:
      "Each liter shifted from the $15\\%$ batch to the $35\\%$ batch adds $\\dfrac{20}{12} = \\dfrac{5}{3}$ points, so whole-number landings occur every third liter: $k = 3, 6, 9$.",
    trap_map: {
      "1": "Also counts $k = 12$, a mixture that uses none of the $15\\%$ solution.",
      "2": "Counts the pure cases $k = 0$ and $k = 12$ along with the three valid blends.",
      "3": "Counts all eleven positive-integer pairs, ignoring the whole-number-percent requirement.",
      "4": "Counts every whole-number percent from $15$ to $35$ as attainable.",
    },
    numeric_check: "3",
    check() {
      // enumerate every admissible pair and test the percent directly
      let count = 0;
      for (let k = 1; k <= 11; k++) {
        const j = 12 - k;
        const numerator = 15 * j + 35 * k; // concentration = numerator / 12
        if (numerator % 12 === 0) count++;
      }
      return { kind: "value", value: count };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
