/**
 * Batch: 5 new questions for subtopic "mixtures_weighted_avg"
 * (fundamental_skill "rates_ratio_percent", content_domain "algebra").
 * Cells: D5 PS pure, D3 PS pure, D2 PS real, D4 PS real, D5 PS pure.
 *
 * Run: node scripts/author/batch-mixtures_weighted_avg.mjs
 * (dry run unless APPEND=1)
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ── 1. D5 PS pure ────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A data set is formed by combining group $G_1$, which has $m$ values with mean $20$, and group $G_2$, which has $n$ values with mean $50$; the mean of the combined set is $30$. After $12$ more values with mean $50$ are added to the combined set, the mean of the full set becomes $35$. What is the value of $m$?",
    choices: ["12", "24", "36", "48", "80"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe group sums are $20m$ and $50n$. The first combination gives $\\dfrac{20m+50n}{m+n}=30$, so $20m+50n=30m+30n$, which simplifies to $20n=10m$, i.e. $m=2n$. The $12$ added values have sum $600$, so $\\dfrac{20m+50n+600}{m+n+12}=35$. Since $20m+50n=30(m+n)$, this becomes $30(m+n)+600=35(m+n)+420$, so $5(m+n)=180$ and $m+n=36$. With $m=2n$: $n=12$ and $m=24$.\n\n**Trigger cue**\nTwo group means plus their combined mean fix only the ratio of group sizes; a second combining event with a known new mean pins the absolute sizes.\n\n**Takeaway**\nCombined averages fix size ratios; a second average fixes actual sizes.",
    fastest_path_md:
      "Deviations from the final mean $35$: the $12$ new values sit $15$ above, a surplus of $180$; the original $m+n$ values sit $5$ below, so $5(m+n)=180$ and $m+n=36$. The mean $30$ lies at distances $10$ and $20$ from $20$ and $50$, so $m:n=20:10=2:1$, giving $m=24$.",
    trap_map: {
      "0": "Solves the system correctly but reports $n=12$, the size of $G_2$, instead of $m$.",
      "2": "Reports the combined size $m+n=36$ rather than $m$ alone.",
      "3": "Reports the final count $m+n+12=48$ after the new values are added.",
      "4": "Leaves the $12$ added values out of the count, solving $\\frac{90n+600}{3n}=35$ to get $m=80$.",
    },
    numeric_check: "2*(180/15)",
    check() {
      // brute force: find all integer (m, n) satisfying both stated means
      const sols = [];
      for (let n = 1; n <= 500; n++) {
        for (let m = 1; m <= 500; m++) {
          if (20 * m + 50 * n !== 30 * (m + n)) continue;
          if (20 * m + 50 * n + 50 * 12 !== 35 * (m + n + 12)) continue;
          sols.push(m);
        }
      }
      const uniq = [...new Set(sols)];
      if (uniq.length !== 1) throw new Error("m not unique: " + uniq.join(","));
      return { kind: "value", value: uniq[0] };
    },
  },

  // ── 2. D3 PS pure ────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "When $x$ liters of a solution that is $20\\%$ alcohol are combined with $y$ liters of a solution that is $50\\%$ alcohol, the result is a solution that is $42\\%$ alcohol. What is the value of $\\dfrac{x}{y}$?",
    choices: [
      "$\\dfrac{4}{11}$",
      "$\\dfrac{2}{5}$",
      "$\\dfrac{11}{15}$",
      "$\\dfrac{5}{2}$",
      "$\\dfrac{11}{4}$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\nTotal alcohol is conserved: $0.20x + 0.50y = 0.42(x+y)$. Multiplying by $100$: $20x + 50y = 42x + 42y$, so $8y = 22x$ and $\\dfrac{x}{y} = \\dfrac{8}{22} = \\dfrac{4}{11}$.\n\n**Trigger cue**\nA mixture concentration strictly between two component concentrations, with the mixing ratio asked: write the weighted average once, or jump straight to alligation.\n\n**Takeaway**\nMixing amounts are inversely proportional to distances from the mixture concentration.",
    fastest_path_md:
      "Alligation: distances from $42$ are $42-20=22$ and $50-42=8$. Amounts are in the inverse ratio, so $x:y = 8:22 = 4:11$.",
    trap_map: {
      "1": "Forms the ratio of the two concentrations, $20:50 = 2:5$, instead of the ratio of the volumes.",
      "2": "Computes $\\frac{y}{x+y}=\\frac{11}{15}$, the stronger solution's share of the mixture, not $\\frac{x}{y}$.",
      "3": "Uses the inverted concentration ratio $50:20 = 5:2$.",
      "4": "Sets the volumes directly proportional to the alligation distances $22:8$ instead of inversely proportional.",
    },
    numeric_check: "4/11",
    check() {
      // brute force: every integer (x, y) pair matching the stated balance
      const ratios = new Set();
      let hits = 0;
      for (let x = 1; x <= 300; x++) {
        for (let y = 1; y <= 300; y++) {
          if (20 * x + 50 * y === 42 * (x + y)) {
            ratios.add(x / y);
            hits++;
          }
        }
      }
      if (hits < 3) throw new Error("too few models found");
      if (ratios.size !== 1) throw new Error("x/y not unique");
      return { kind: "value", value: [...ratios][0] };
    },
  },

  // ── 3. D2 PS real ────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 2,
    stem_md:
      "A juice stand makes a punch by mixing $6$ liters of a juice that is $10\\%$ sugar by volume with $4$ liters of a juice that is $25\\%$ sugar by volume. The punch is what percent sugar by volume?",
    choices: ["1.6", "16", "17.5", "19", "20"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nSugar from the first juice: $0.10 \\times 6 = 0.6$ liters. Sugar from the second: $0.25 \\times 4 = 1$ liter. The punch holds $0.6 + 1 = 1.6$ liters of sugar in $6 + 4 = 10$ liters, so its concentration is $\\dfrac{1.6}{10} = 16\\%$.\n\n**Trigger cue**\nTwo ingredients with known concentrations and volumes: total the pure component, then divide by the total volume.\n\n**Takeaway**\nWeight each concentration by its volume; never average concentrations directly.",
    fastest_path_md:
      "Sugar: $0.6 + 1 = 1.6$ liters out of $10$ liters, so $16\\%$. (Sanity check: closer to $10\\%$ than to $25\\%$ because more of the weaker juice is used.)",
    trap_map: {
      "0": "Reports the $1.6$ liters of sugar instead of converting to a percent of the $10$-liter punch.",
      "2": "Takes the simple average of $10$ and $25$, ignoring the unequal volumes.",
      "3": "Swaps the weights, applying $10\\%$ to $4$ liters and $25\\%$ to $6$ liters.",
      "4": "Uses the part-to-part ratio $4:6$ instead of the part-to-whole ratio $4:10$, computing $10 + \\frac{4}{6}(15) = 20$.",
    },
    numeric_check: "(0.10*6 + 0.25*4)/(6+4)*100",
    check() {
      // simulate in milliliters
      const sugarML = 6000 * 0.10 + 4000 * 0.25;
      const totalML = 6000 + 4000;
      return { kind: "value", value: (sugarML / totalML) * 100 };
    },
  },

  // ── 4. D4 PS real ────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 4,
    stem_md:
      "A car radiator contains $6$ liters of coolant that is $25\\%$ antifreeze. A mechanic drains some of the coolant and replaces it with an equal volume of pure antifreeze, after which the radiator again contains $6$ liters of coolant, now $75\\%$ antifreeze. How many liters of coolant did the mechanic drain?",
    choices: ["2", "3", "4", "4.5", "12"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $x$ be the liters drained and replaced. The kept $6-x$ liters remain $25\\%$ antifreeze, and the $x$ liters added are $100\\%$ antifreeze: $0.25(6-x) + x = 0.75 \\times 6$. So $1.5 + 0.75x = 4.5$, giving $0.75x = 3$ and $x = 4$.\n\n**Trigger cue**\nDrain-and-replace with a pure component: the final mix is the kept portion blended with the pure addition, so one weighted-average equation finishes it.\n\n**Takeaway**\nDrained liquid carries the component out; account for it before adding.",
    fastest_path_md:
      "Replacing a fraction $f$ of a $25\\%$ mix with $100\\%$ antifreeze lands at $75\\%$ when $f = \\dfrac{75-25}{100-25} = \\dfrac{2}{3}$. So $\\dfrac{2}{3} \\times 6 = 4$ liters.",
    trap_map: {
      "0": "Inverts the kept-to-replaced ratio, replacing $\\frac{1}{3}$ of the coolant instead of $\\frac{2}{3}$.",
      "1": "Ignores the antifreeze that leaves with the drained coolant, solving $1.5 + x = 4.5$.",
      "3": "Reports the final amount of antifreeze in the radiator, $4.5$ liters, not the amount drained.",
      "4": "Adds pure antifreeze without draining anything, solving $1.5 + x = 0.75(6+x)$.",
    },
    numeric_check: "6*(75-25)/(100-25)",
    check() {
      // brute force over drained volume in hundredths of a liter, exact integers
      const hits = [];
      for (let k = 0; k <= 600; k++) {
        // antifreeze after replacing k/100 L, in (0.01 L × percent) units
        const antifreeze = 25 * (600 - k) + 100 * k;
        if (antifreeze === 75 * 600) hits.push(k / 100);
      }
      if (hits.length !== 1) throw new Error("x not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 5. D5 PS pure ────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A container holds $V$ liters of an acid solution of unknown concentration. If $8$ liters of pure acid were added, the concentration would rise by exactly $15$ percentage points; if instead $8$ liters of pure water were added, the concentration would fall by exactly $10$ percentage points. What is the value of $V$?",
    choices: ["16", "24", "32", "40", "56"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet the concentration be $p\\%$, so the container holds $\\dfrac{pV}{100}$ liters of acid. Adding $8$ liters of water keeps the acid fixed: $\\dfrac{pV}{100} = \\dfrac{(p-10)(V+8)}{100}$, which expands to $pV = pV + 8p - 10V - 80$, so $8p = 10(V+8)$. Adding $8$ liters of acid: $\\dfrac{pV}{100} + 8 = \\dfrac{(p+15)(V+8)}{100}$, which expands to $800 = 8p + 15(V+8)$. Substituting $8p = 10(V+8)$ gives $800 = 25(V+8)$, so $V + 8 = 32$ and $V = 24$.\n\n**Trigger cue**\nTwo hypothetical additions to the same unknown solution: write one conservation equation per scenario, then eliminate the unknown concentration.\n\n**Takeaway**\nEqual additions give equal final volumes; subtract scenarios to eliminate unknowns.",
    fastest_path_md:
      "Both scenarios end at $V+8$ liters and differ only in swapping $8$ liters of water for $8$ liters of acid — a difference of $8$ liters of pure acid, i.e. $800$ percent-liters. That gap equals the $15 + 10 = 25$-point spread: $\\dfrac{800}{V+8} = 25$, so $V + 8 = 32$ and $V = 24$.",
    trap_map: {
      "0": "Finds the final volume $32$ but subtracts the $8$ added liters twice, once for each scenario.",
      "2": "Solves $25(V+8) = 800$ correctly but reports the final volume $V+8 = 32$.",
      "3": "Reports the original concentration, $40$ percent, instead of the volume.",
      "4": "Averages the $15$- and $10$-point shifts instead of adding them, computing $\\frac{800}{12.5} - 8 = 56$.",
    },
    numeric_check: "100*8/(15+10) - 8",
    check() {
      // brute force: all integer (V, p) satisfying both hypothetical additions exactly
      const sols = [];
      for (let V = 1; V <= 500; V++) {
        for (let p = 1; p <= 99; p++) {
          const waterOK = p * V === (p - 10) * (V + 8);
          const acidOK = p * V + 100 * 8 === (p + 15) * (V + 8);
          if (waterOK && acidOK) sols.push(V);
        }
      }
      const uniq = [...new Set(sols)];
      if (uniq.length !== 1) throw new Error("V not unique: " + uniq.join(","));
      return { kind: "value", value: uniq[0] };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
