/**
 * Batch: 11 new mixtures_weighted_avg items (rates_ratio_percent).
 * Cells: D2 ×3, D3 ×5, D4 ×3 — the subtopic could not fill one blend.
 * Trap language tracks the chapter: unweighted averaging, inverted lever,
 * shrinking solute during evaporation, linear thinking in repeated
 * replacement, percentage points read as percent change, midpoint reflex.
 * Run: node scripts/author/batch-mixtures_weighted_avg-v2.mjs
 *      (APPEND=1 to write the bank)
 */
import { choiceIndexForValue, verifyAndAppend } from "./harness.mjs";

const S = {
  format: "problem_solving",
  content_domain: "arithmetic",
  context: "real",
  fundamental_skill: "rates_ratio_percent",
  subtopic: "mixtures_weighted_avg",
};

const items = [
  // 1 — D2: weight by count, never average the averages
  {
    ...S,
    difficulty: 2,
    stem_md:
      "A class of $12$ students averaged $75$ on a test, and a second class of $18$ students averaged $85$ on the same test. What was the average score of all $30$ students?",
    choices: ["$79$", "$80$", "$81$", "$82$", "$83$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWork in totals: $12 \\times 75 = 900$ and $18 \\times 85 = 1530$, so the combined total is $2430$ over $30$ students, giving $\\frac{2430}{30} = 81$.\n\n**Trigger cue**\n\n\"Average of the two groups combined\": sum both totals and divide by the combined count — never average the two averages.\n\n**Takeaway**\n\nCombine totals, not averages; weights are the counts.",
    fastest_path_md:
      "The larger class pulls the mean toward $85$: $75 + \\frac{18}{30}(10) = 81$.",
    trap_map: {
      "0": "Weights the groups backwards, pulling the mean toward the smaller class.",
      "1": "Averages the two averages, $\\frac{75+85}{2}$.",
      "3": "Overshoots the lever, using a weight of $\\frac{7}{10}$.",
      "4": "Pulls the mean nearly all the way to the larger group's average.",
    },
    numeric_check: "(12*75 + 18*85)/30",
    check() {
      const scores = [];
      for (let i = 0; i < 12; i++) scores.push(75);
      for (let i = 0; i < 18; i++) scores.push(85);
      const total = scores.reduce((a, b) => a + b, 0);
      return { kind: "value", value: total / scores.length };
    },
  },

  // 2 — D2: the ledger of pure substance
  {
    ...S,
    difficulty: 2,
    stem_md:
      "How many liters of a $10\\%$ salt solution must be mixed with $4$ liters of a $30\\%$ salt solution to produce a solution that is $15\\%$ salt?",
    choices: ["$8$", "$10$", "$12$", "$16$", "$20$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $x$ be the liters of the $10\\%$ solution. Salt in equals salt out: $0.10x + 0.30(4) = 0.15(x + 4)$, so $0.10x + 1.2 = 0.15x + 0.6$, giving $0.05x = 0.6$ and $x = 12$.\n\n**Trigger cue**\n\n\"Mix $x$ liters of $a\\%$ with $y$ liters of $b\\%$ to reach $c\\%$\": write the salt ledger, or use the lever — distances $5$ and $15$ mean a $3 : 1$ volume ratio.\n\n**Takeaway**\n\nTrack the pure substance; the totals take care of themselves.",
    fastest_path_md:
      "Distances from $15$: the $10\\%$ side is $5$ away, the $30\\%$ side is $15$ away, so volumes run $15 : 5 = 3 : 1$. Three times $4$ is $12$.",
    trap_map: {
      "0": "Inverts the lever, giving the larger volume to the farther ingredient.",
      "1": "Averages the two concentrations rather than weighting them.",
      "3": "Reports the total volume of the finished mixture.",
      "4": "Uses a $5 : 1$ ratio, reading the distances off the wrong endpoints.",
    },
    numeric_check: "12",
    check() {
      let answer = null;
      for (let tenths = 0; tenths <= 1000; tenths++) {
        const x = tenths / 10;
        if (Math.abs(0.1 * x + 0.3 * 4 - 0.15 * (x + 4)) < 1e-9) answer = x;
      }
      if (answer == null) throw new Error("no solution");
      return { kind: "value", value: answer };
    },
  },

  // 3 — D2: weighted average of unit prices
  {
    ...S,
    difficulty: 2,
    stem_md:
      "A grocer blends $15$ kilograms of tea costing $\\$8$ per kilogram with $10$ kilograms of tea costing $\\$13$ per kilogram. What is the cost, in dollars per kilogram, of the blend?",
    choices: ["$9$", "$10$", "$10.50$", "$11$", "$21$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nTotal cost is $15(8) + 10(13) = 120 + 130 = 250$ for $25$ kilograms, so the blend costs $\\frac{250}{25} = 10$ per kilogram.\n\n**Trigger cue**\n\n\"Cost per kilogram of the blend\": weighted average of the unit prices, with the quantities as weights.\n\n**Takeaway**\n\nBlend price is total cost over total weight.",
    fastest_path_md: "$\\frac{120 + 130}{25} = \\frac{250}{25} = 10$.",
    trap_map: {
      "0": "Weights the prices backwards, pulling toward the cheaper tea too hard.",
      "2": "Averages the two prices, ignoring the unequal weights.",
      "3": "Pulls the blend toward the more expensive tea.",
      "4": "Adds the two unit prices rather than averaging them.",
    },
    numeric_check: "(15*8 + 10*13)/25",
    check() {
      let cost = 0;
      let kilos = 0;
      for (let i = 0; i < 15; i++) {
        cost += 8;
        kilos++;
      }
      for (let i = 0; i < 10; i++) {
        cost += 13;
        kilos++;
      }
      return { kind: "value", value: cost / kilos };
    },
  },

  // 4 — D3: evaporation freezes the solute
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A tank holds $60$ liters of a solution that is $8\\%$ acid. How many liters of water must evaporate so that the remaining solution is $12\\%$ acid?",
    choices: ["$15$", "$20$", "$24$", "$36$", "$40$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nOnly water leaves, so the acid stays at $0.08(60) = 4.8$ liters. For that to be $12\\%$ of the new volume $V$, $V = \\frac{4.8}{0.12} = 40$. The water evaporated is $60 - 40 = 20$ liters.\n\n**Trigger cue**\n\n\"Water evaporates\": freeze the solute, divide it by the target concentration to get the new total, then subtract.\n\n**Takeaway**\n\nEvaporation removes water only — the pure amount never moves.",
    fastest_path_md:
      "Acid $4.8$ L fixed; new volume $= \\frac{4.8}{0.12} = 40$; evaporate $20$.",
    trap_map: {
      "0": "Uses the percentage-point gap of $4$ as a fraction of $60$ divided by $16$.",
      "2": "Reduces the acid along with the water, as if evaporation removed solution.",
      "3": "Reports the volume that would remain if the concentration merely rose by $12$ points.",
      "4": "Reports the remaining volume rather than the amount evaporated.",
    },
    numeric_check: "60 - 4.8/0.12",
    check() {
      const acid = 0.08 * 60;
      let removed = null;
      for (let tenths = 0; tenths <= 600; tenths++) {
        const out = tenths / 10;
        if (Math.abs(acid - 0.12 * (60 - out)) < 1e-9) removed = out;
      }
      if (removed == null) throw new Error("no solution");
      return { kind: "value", value: removed };
    },
  },

  // 5 — D3: pure liquid is a 100% solution
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A radiator contains $18$ liters of a mixture that is $25\\%$ antifreeze. How many liters of pure antifreeze must be added so that the mixture becomes $40\\%$ antifreeze?",
    choices: ["$2.7$", "$4.5$", "$5$", "$6$", "$10.8$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nTreat pure antifreeze as a $100\\%$ solution. With $x$ liters added, $0.25(18) + x = 0.40(18 + x)$, so $4.5 + x = 7.2 + 0.4x$, giving $0.6x = 2.7$ and $x = 4.5$.\n\n**Trigger cue**\n\n\"Replaced with / add pure antifreeze\": the added liquid enters the weighted average at $100\\%$.\n\n**Takeaway**\n\nPure means $100\\%$ — put it in the ledger at full strength.",
    fastest_path_md:
      "Lever from $25$ and $100$ to $40$: distances $15$ and $60$, so volumes $60 : 15 = 4 : 1$; $\\frac{18}{4} = 4.5$.",
    trap_map: {
      "0": "Reports the percentage-point gap applied to the original volume, $0.15(18)$.",
      "2": "Rounds the answer to a whole number of liters.",
      "3": "Uses a $3 : 1$ lever ratio, misreading the distance to $100\\%$.",
      "4": "Reports the non-antifreeze share of the target mixture, $0.6 \\times 18$.",
    },
    numeric_check: "4.5",
    check() {
      let answer = null;
      for (let hundredths = 0; hundredths <= 5000; hundredths++) {
        const x = hundredths / 100;
        if (Math.abs(0.25 * 18 + x - 0.4 * (18 + x)) < 1e-9) answer = x;
      }
      if (answer == null) throw new Error("no solution");
      return { kind: "value", value: answer };
    },
  },

  // 6 — D3: percentage points add, they do not multiply
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A juice blend is $30\\%$ mango. A distributor reformulates it so that the mango content rises by $12$ percentage points. The reformulated blend's mango content is what percent of the original blend's mango content?",
    choices: ["$12\\%$", "$40\\%$", "$112\\%$", "$140\\%$", "$142\\%$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nPercentage points add: the new content is $30 + 12 = 42$ percent. As a fraction of the original $30$, that is $\\frac{42}{30} = 1.4 = 140\\%$.\n\n**Trigger cue**\n\n\"Rises by $n$ percentage points\": add $n$ to the concentration; only a \"rises by $n$ percent\" would multiply it.\n\n**Takeaway**\n\nPoints add to the rate; percents multiply it.",
    fastest_path_md: "$30 + 12 = 42$; $\\frac{42}{30} = 140\\%$.",
    trap_map: {
      "0": "Reports the size of the shift rather than the comparison asked for.",
      "1": "Reports the new mango percentage of the blend, not of the old content.",
      "2": "Reads \"$12$ percentage points\" as a $12\\%$ increase, giving $\\times 1.12$.",
      "4": "Adds $12$ to $130$, mixing the point shift into the ratio.",
    },
    numeric_check: null,
    check(q) {
      const original = 30;
      const updated = original + 12;
      return choiceIndexForValue(q.choices, (updated / original) * 100);
    },
  },

  // 7 — D3: the lever, read off distances
  {
    ...S,
    difficulty: 3,
    stem_md:
      "Solution X is $20\\%$ alcohol and solution Y is $50\\%$ alcohol. In what ratio, by volume, must X and Y be mixed to produce a solution that is $30\\%$ alcohol?",
    choices: ["$1 : 2$", "$2 : 1$", "$2 : 3$", "$3 : 2$", "$5 : 2$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLedger: $0.20x + 0.50y = 0.30(x+y)$, so $0.20y = 0.10x$ and $\\frac{x}{y} = 2$. The ratio is $2 : 1$. The lever says the same thing: the target sits $10$ from X and $20$ from Y, so X carries twice the weight.\n\n**Trigger cue**\n\nTwo concentrations and a target: distances from the target give the volumes, crossed over.\n\n**Takeaway**\n\nThe mean sits near the heavy component — short distance, big weight.",
    fastest_path_md:
      "Distances $10$ and $20$; volumes are the reversed distances, $20 : 10 = 2 : 1$.",
    trap_map: {
      "0": "Inverts the lever, assigning the larger volume to the farther solution.",
      "2": "Uses the raw distances as the volume ratio without crossing them.",
      "3": "Uses the concentrations' own ratio rather than their distances from the target.",
      "4": "Compares $50$ to $20$ instead of comparing both to the target.",
    },
    numeric_check: null,
    check(q) {
      // Brute-force whole-liter mixes; keep every (x, y) hitting 30% exactly.
      const ratios = new Set();
      for (let x = 1; x <= 60; x++)
        for (let y = 1; y <= 60; y++) {
          if (Math.abs(0.2 * x + 0.5 * y - 0.3 * (x + y)) < 1e-9) {
            const gcd = (a, b) => (b ? gcd(b, a % b) : a);
            const g = gcd(x, y);
            ratios.add(`${x / g}:${y / g}`);
          }
        }
      if (ratios.size !== 1) throw new Error(`ratios: ${[...ratios]}`);
      const want = [...ratios][0];
      const hits = [];
      q.choices.forEach((c, i) => {
        const nums = c.match(/\d+/g);
        if (!nums || nums.length !== 2) return;
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const [a, b] = nums.map(Number);
        const g = gcd(a, b);
        if (`${a / g}:${b / g}` === want) hits.push(i);
      });
      if (hits.length !== 1) throw new Error(`matches: ${hits}`);
      return { kind: "index", index: hits[0] };
    },
  },

  // 8 — D3: the removed portion carries both components
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A $40$-liter tank is filled with a solution that is $25\\%$ acid. If $8$ liters of the solution are drained and replaced with $8$ liters of water, what percent of the resulting $40$ liters is acid?",
    choices: ["$15\\%$", "$17\\%$", "$20\\%$", "$21\\%$", "$25\\%$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe drained $8$ liters carries acid in the current proportion, so $0.25(8) = 2$ liters of acid leave. Acid falls from $10$ to $8$ liters, and the volume returns to $40$, giving $\\frac{8}{40} = 20\\%$.\n\n**Trigger cue**\n\n\"Drawn off and replaced\": the removed mixture carries solute and water in the current ratio — the retention factor is $\\frac{V-k}{V}$.\n\n**Takeaway**\n\nDraining removes solute too, in the current proportion.",
    fastest_path_md:
      "Retention is $\\frac{32}{40} = 0.8$, so $25\\% \\times 0.8 = 20\\%$.",
    trap_map: {
      "0": "Subtracts $8$ percentage points, treating liters as points.",
      "1": "Uses $\\frac{8}{47}$-style arithmetic, adding the replacement to the volume.",
      "3": "Applies the retention factor to the volume rather than to the concentration.",
      "4": "Assumes only water was drained, leaving the concentration unchanged.",
    },
    numeric_check: null,
    check(q) {
      const volume = 40;
      let acid = 0.25 * volume;
      const drained = 8;
      acid -= acid * (drained / volume);
      return choiceIndexForValue(q.choices, (acid / volume) * 100);
    },
  },

  // 9 — D4: repeated replacement decays geometrically
  {
    ...S,
    difficulty: 4,
    stem_md:
      "A $50$-liter container is full of pure syrup. Ten liters are drawn off and replaced with water; the container is stirred, and the process is repeated twice more. How many liters of syrup remain in the container?",
    choices: ["$20$", "$25.6$", "$29$", "$32$", "$35$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nEach cycle keeps $\\frac{50-10}{50} = \\frac{4}{5}$ of whatever syrup is present. Three cycles leave $50\\left(\\frac{4}{5}\\right)^{3} = 50 \\times \\frac{64}{125} = 25.6$ liters.\n\n**Trigger cue**\n\n\"Drawn off and replaced\" more than once: multiply by the retention factor $\\left(\\frac{V-k}{V}\\right)$ once per cycle.\n\n**Takeaway**\n\nRepeated replacement is geometric decay, not repeated subtraction.",
    fastest_path_md: "$50 \\cdot \\left(\\frac{4}{5}\\right)^{3} = 50 \\cdot \\frac{64}{125} = 25.6$.",
    trap_map: {
      "0": "Subtracts $10$ liters of syrup per cycle, $50 - 30$.",
      "2": "Applies the retention factor twice instead of three times, then rounds.",
      "3": "Applies the retention factor only twice, $50\\left(\\frac{4}{5}\\right)^{2}$.",
      "4": "Subtracts $10$ liters once and then applies one retention factor.",
    },
    numeric_check: "50*(4/5)^3",
    check() {
      const volume = 50;
      let syrup = 50;
      for (let cycle = 0; cycle < 3; cycle++) {
        syrup -= syrup * (10 / volume);
      }
      return { kind: "value", value: syrup };
    },
  },

  // 10 — D4: two scenarios pin down an unknown concentration
  {
    ...S,
    difficulty: 4,
    stem_md:
      "A chemist mixes $6$ liters of a $c\\%$ acid solution with $4$ liters of a $45\\%$ acid solution and obtains a solution that is $33\\%$ acid. What is the value of $c$?",
    choices: ["$15$", "$21$", "$25$", "$29$", "$33$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nAcid in equals acid out: $\\frac{c}{100}(6) + 0.45(4) = 0.33(10)$. The right side is $3.3$ liters and the known solution contributes $1.8$, so the unknown solution must contribute $1.5$ liters across $6$ liters of volume: $\\frac{c}{100} = \\frac{1.5}{6} = 0.25$, giving $c = 25$.\n\n**Trigger cue**\n\nOne unknown concentration with both volumes known: one ledger equation, one unknown.\n\n**Takeaway**\n\nWrite the pure-substance ledger; the unknown falls out.",
    fastest_path_md:
      "Acid needed $3.3$; the $45\\%$ solution brings $1.8$; the remaining $1.5$ over $6$ liters is $25\\%$.",
    trap_map: {
      "0": "Weights by the swapped volumes, running the lever backwards.",
      "1": "Averages the two concentrations, ignoring that the volumes differ.",
      "3": "Shifts the target down by an unweighted share of the $12$-point gap.",
      "4": "Restates the target concentration of the finished solution.",
    },
    numeric_check: "25",
    check() {
      let answer = null;
      for (let hundredths = 0; hundredths <= 10000; hundredths++) {
        const c = hundredths / 100;
        if (Math.abs((c / 100) * 6 + 0.45 * 4 - 0.33 * 10) < 1e-9) answer = c;
      }
      if (answer == null) throw new Error("no solution");
      return { kind: "value", value: answer };
    },
  },

  // 11 — D4: two blends combined, tracked through one ingredient
  {
    ...S,
    difficulty: 4,
    stem_md:
      "Blend P mixes juice and water in the ratio $1 : 3$, and blend Q mixes juice and water in the ratio $2 : 3$. If $8$ liters of P are combined with $10$ liters of Q, what fraction of the resulting mixture is juice?",
    choices: [
      "$\\dfrac{1}{4}$",
      "$\\dfrac{3}{10}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{2}{5}$",
      "$\\dfrac{13}{20}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nConvert each ratio to a fraction of its whole: P is $\\frac{1}{4}$ juice and Q is $\\frac{2}{5}$ juice. Juice totals $8\\left(\\frac{1}{4}\\right) + 10\\left(\\frac{2}{5}\\right) = 2 + 4 = 6$ liters out of $18$, which is $\\frac{6}{18} = \\frac{1}{3}$.\n\n**Trigger cue**\n\nTwo blends combined: convert each ratio to a fraction of the whole *before* combining, then track one ingredient's total.\n\n**Takeaway**\n\nRatios must become fractions of the whole before they can be mixed.",
    fastest_path_md: "Juice $= 2 + 4 = 6$ of $18$ liters, so $\\frac{1}{3}$.",
    trap_map: {
      "0": "Reports blend P's juice fraction alone.",
      "1": "Averages the two juice fractions without weighting by volume.",
      "3": "Reports blend Q's juice fraction alone.",
      "4": "Adds the two juice fractions instead of weighting them.",
    },
    numeric_check: "6/18",
    check() {
      const juiceP = 8 * (1 / (1 + 3));
      const juiceQ = 10 * (2 / (2 + 3));
      return { kind: "value", value: (juiceP + juiceQ) / 18 };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
