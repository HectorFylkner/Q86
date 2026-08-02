/**
 * Quality pass, batch 3 — 12 new D5 items across two rates_ratio_percent
 * subtopics: 6 percent_change_chains (10 → 16) and 6 ratios_proportions
 * (10 → 16).
 *
 * Run: node --experimental-strip-types scripts/author/batch-q5-percent-ratios.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

/** Reduce a pair to lowest terms and render it as an "a:b" choice. */
function ratioLabel(a, b) {
  const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
  const scale = 1000;
  let p = Math.round(a * scale);
  let q = Math.round(b * scale);
  const g = gcd(p, q);
  return `$${p / g}:${q / g}$`;
}

const items = [
  // ══ percent_change_chains ═══════════════════════════════════════════════

  // ── 1. an unknown-k chain that clears to a quadratic ────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "A share price rises by $k\\%$ during January and then falls by $(k + 10)\\%$ during February, ending February $16\\%$ below where it started January. If $k$ is a positive integer, what is $k$?",
    choices: ["$8$", "$16$", "$20$", "$30$", "$40$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWrite $t = k/100$. The two moves compose as $(1 + t)\\left(1 - t - 0.1\\right) = 0.84$. Expanding: $0.9 - 0.1t - t^2 = 0.84$, so $t^2 + 0.1t - 0.06 = 0$. Multiplying by $100$ and writing in $k$: $k^2 + 10k - 600 = 0$, which factors as $(k + 30)(k - 20) = 0$. The positive root is $k = 20$; check it: $1.20 \\times 0.70 = 0.84$.\n\n**Trigger cue**\nTwo chained changes with the *same* unknown appearing in both — set the factor product equal to the target factor and clear to a quadratic; discard roots that make a factor non-positive.\n\n**Takeaway**\nUnknown-percent chains are quadratics; verify the surviving root.",
    fastest_path_md:
      "Test the choices against $\\left(1 + \\tfrac{k}{100}\\right)\\left(1 - \\tfrac{k+10}{100}\\right) = 0.84$: $k = 20$ gives $1.2 \\times 0.7 = 0.84$ on the first try.",
    trap_map: {
      "0": "Averages the $16\\%$ net decline across the two months: $16/2 = 8$.",
      "1": "Answers with the net two-month decline $16$ rather than with $k$.",
      "3": "Answers with February's decline $k + 10 = 30$ rather than January's rise.",
      "4": "Drops the extra ten points, solving $(1+t)(1-t) = 0.84$ for $t^2 = 0.16$ and $k = 40$.",
    },
    numeric_check: "(-0.1 + sqrt(0.01 + 0.24))/2*100",
    check() {
      // Test every integer k against the actual two-move price path.
      const found = [];
      for (let k = 1; k <= 89; k++) {
        const after = 1 * (1 + k / 100) * (1 - (k + 10) / 100);
        if (Math.abs(after - 0.84) < 1e-12) found.push(k);
      }
      if (found.length !== 1) throw new Error(`expected one k, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 16 / 2, "1": 16, "3": 20 + 10, "4": Math.sqrt(1 - 0.84) * 100 };
    },
  },

  // ── 2. reversing a chain back to the original ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "A subscription's price was raised by $25\\%$, and the new price was later cut by $12\\%$. The price after both changes is $\\$264$. What was the price before either change?",
    choices: [
      "$\\$211.20$",
      "$\\$237.60$",
      "$\\$240$",
      "$\\$290.40$",
      "$\\$300$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe chain multiplies the original by $1.25 \\times 0.88 = 1.10$. To undo a chain, divide by the net factor rather than applying the opposite percents: the original is $264/1.10 = \\$240$. Check: $240 \\times 1.25 = 300$, and $300 \\times 0.88 = 264$.\n\n**Trigger cue**\nA final figure after a chain, with the original requested — divide by the product of the factors; never subtract the percents back off.\n\n**Takeaway**\nUndo a percent chain by dividing by its net factor.",
    fastest_path_md:
      "$1.25 \\times 0.88 = 1.1$, so the original is $264/1.1 = \\$240$.",
    trap_map: {
      "0": "Reverses only the $25\\%$ increase and stops: $264/1.25 = \\$211.20$.",
      "1": "Treats the net $+10\\%$ as removable by taking $10\\%$ off the final price: $264 \\times 0.9 = \\$237.60$.",
      "3": "Applies both changes forward instead of reversing them: $264 \\times 1.25 \\times 0.88 = \\$290.40$.",
      "4": "Reverses only the $12\\%$ cut and stops: $264/0.88 = \\$300$.",
    },
    numeric_check: "264/(1.25*0.88)",
    check() {
      // Scan original prices in cents and replay the two changes forward.
      const found = [];
      for (let cents = 1; cents <= 100_000; cents++) {
        const p = cents / 100;
        if (Math.abs(p * 1.25 * 0.88 - 264) < 1e-9) found.push(p);
      }
      if (found.length !== 1) throw new Error(`expected one price, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 264 / 1.25,
        "1": 264 * 0.9,
        "3": 264 * 1.25 * 0.88,
        "4": 264 / 0.88,
      };
    },
  },

  // ── 3. a conditional percentage read back against a new base ───────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "In a survey, $60\\%$ of the respondents own a car. Half of the car owners also own a bicycle, and three quarters of those who do not own a car own a bicycle. What percent of the bicycle owners do not own a car?",
    choices: ["$30$", "$40$", "$50$", "$60$", "$75$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nTake $100$ respondents. Car owners: $60$, of whom $30$ own bicycles. Non-owners: $40$, of whom $\\tfrac34 \\times 40 = 30$ own bicycles. Bicycle owners total $30 + 30 = 60$, and $30$ of them own no car, so the answer is $30/60 = 50\\%$.\n\n**Trigger cue**\nA percentage asked *of a group that is itself computed* — build the two-way table on a base of $100$ first, then read the ratio the question actually asks for.\n\n**Takeaway**\nRead which group is the base before dividing; build the table.",
    fastest_path_md:
      "On $100$ people: $60$ car owners give $30$ cyclists; $40$ non-owners give $30$ cyclists. Half of the $60$ cyclists own no car.",
    trap_map: {
      "0": "Answers with the share of *all respondents* who cycle without a car, $30\\%$, rather than the share of cyclists.",
      "1": "Answers with the share of respondents who own no car, $40\\%$.",
      "3": "Answers with the share of respondents who own a car, $60\\%$ — which is also the number of cyclists, making the coincidence tempting.",
      "4": "Answers with the conditional given in the stem, $75\\%$ of non-owners, without converting the base.",
    },
    numeric_check: "100*(0.4*0.75)/(0.6*0.5 + 0.4*0.75)",
    check() {
      // Enumerate a concrete population of 1000 respondents.
      const n = 1000;
      const carOwners = 0.6 * n;
      const nonOwners = n - carOwners;
      const cyclingOwners = 0.5 * carOwners;
      const cyclingNonOwners = 0.75 * nonOwners;
      const cyclists = cyclingOwners + cyclingNonOwners;
      return { kind: "value", value: (100 * cyclingNonOwners) / cyclists };
    },
    trap_values() {
      return { "0": 100 * 0.4 * 0.75, "1": 40, "3": 60, "4": 75 };
    },
  },

  // ── 4. a chain anchored by an absolute change ──────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "A town's population fell by $20\\%$ during the 1990s and then rose by $30\\%$ during the 2000s. The population at the end of the 2000s was $4{,}160$ greater than it had been at the start of the 1990s. What was the population at the start of the 1990s?",
    choices: [
      "$20{,}800$",
      "$41{,}600$",
      "$83{,}200$",
      "$104{,}000$",
      "$108{,}160$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe net factor is $0.8 \\times 1.3 = 1.04$, so the population grew by $4\\%$ over the two decades. That $4\\%$ is the stated $4{,}160$ people, so the starting population is $4160/0.04 = 104{,}000$. Check: $104{,}000 \\to 83{,}200 \\to 108{,}160$, which is $4{,}160$ more than $104{,}000$.\n\n**Trigger cue**\nA percent chain plus one absolute difference — chain the factors, subtract $1$, and divide the absolute figure by the remainder.\n\n**Takeaway**\nDown twenty then up thirty is up four, not up ten.",
    fastest_path_md:
      "$0.8 \\times 1.3 = 1.04$, a net $+4\\%$, so the start was $4160/0.04 = 104{,}000$.",
    trap_map: {
      "0": "Uses only the $20\\%$ decline as the net change: $4160/0.2 = 20{,}800$.",
      "1": "Adds the percents to a net $+10\\%$: $4160/0.1 = 41{,}600$.",
      "2": "Answers with the population at the end of the 1990s, $0.8 \\times 104{,}000 = 83{,}200$.",
      "4": "Answers with the population at the end of the 2000s, $1.04 \\times 104{,}000 = 108{,}160$.",
    },
    numeric_check: "4160/(0.8*1.3 - 1)",
    check() {
      // Scan starting populations and replay both decades.
      const found = [];
      for (let p = 1; p <= 400_000; p++) {
        const end = p * 0.8 * 1.3;
        if (Math.abs(end - p - 4160) < 1e-6) found.push(p);
      }
      if (found.length !== 1) throw new Error(`expected one population, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 4160 / 0.2,
        "1": 4160 / 0.1,
        "2": 0.8 * 104_000,
        "4": 0.8 * 1.3 * 104_000,
      };
    },
  },

  // ── 5. an unknown leg isolated out of a known net change ───────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "A retailer's annual revenue grew by $25\\%$ from 2022 to 2023 and then fell from 2023 to 2024. Over the two years combined, revenue grew by $5\\%$. By what percent did revenue fall from 2023 to 2024?",
    choices: ["$5$", "$16$", "$20$", "$25$", "$84$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe two factors multiply to the net factor: $1.25 \\times f = 1.05$, so $f = 1.05/1.25 = 0.84$. A factor of $0.84$ is a decline of $1 - 0.84 = 0.16$, i.e. $16\\%$.\n\n**Trigger cue**\nOne leg of a chain unknown with the net change given — divide the net factor by the known factor, then convert the surviving factor into a percent change.\n\n**Takeaway**\nIsolate a chain's unknown leg by dividing, not subtracting.",
    fastest_path_md:
      "Start at $100$: 2023 is $125$, 2024 must be $105$. The drop is $20$ on a base of $125$, which is $16\\%$.",
    trap_map: {
      "0": "Answers with the two-year net growth $5\\%$ rather than the 2024 decline.",
      "2": "Subtracts the percents instead of dividing the factors: $25 - 5 = 20$.",
      "3": "Answers with the first year's growth $25\\%$.",
      "4": "Answers with 2024 revenue as a percent of 2023 revenue, $84$, instead of the decline.",
    },
    numeric_check: "100*(1 - 1.05/1.25)",
    check() {
      // Search integer percentage declines against the actual chain.
      const found = [];
      for (let d = 1; d <= 99; d++) {
        if (Math.abs(1.25 * (1 - d / 100) - 1.05) < 1e-12) found.push(d);
      }
      if (found.length !== 1) throw new Error(`expected one decline, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 5, "2": 25 - 5, "3": 25, "4": 100 * (1.05 / 1.25) };
    },
  },

  // ── 6. an asymmetric recovery ──────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "A fund lost $30\\%$ of its value during its first year. During its second year it gained $x\\%$, and at the end of the second year it stood $5\\%$ above its original value. What is $x$?",
    choices: ["$5$", "$30$", "$35$", "$50$", "$150$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe factors multiply to the net factor: $0.7(1 + x/100) = 1.05$, so $1 + x/100 = 1.05/0.7 = 1.5$ and $x = 50$. The gain is far larger than the loss because it acts on a base that shrank to $70\\%$.\n\n**Trigger cue**\nA loss followed by a recovery past the starting point — divide the target factor by the surviving factor; the required gain always exceeds the loss.\n\n**Takeaway**\nRecovering a loss always needs a larger percent than the loss.",
    fastest_path_md:
      "Start at $100$: after the loss, $70$; the target is $105$; $105/70 = 1.5$, so a $50\\%$ gain.",
    trap_map: {
      "0": "Answers with the two-year net gain $5\\%$ rather than the second year's gain.",
      "1": "Answers with the first year's loss $30\\%$, assuming a symmetric recovery.",
      "2": "Adds the percents to reach the net: $-30 + 35 = +5$.",
      "4": "Reports the recovery factor $1.5$ as a $150\\%$ gain rather than a $50\\%$ gain.",
    },
    numeric_check: "100*(1.05/0.7 - 1)",
    check() {
      const found = [];
      for (let x = 1; x <= 400; x++) {
        if (Math.abs(0.7 * (1 + x / 100) - 1.05) < 1e-12) found.push(x);
      }
      if (found.length !== 1) throw new Error(`expected one gain, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 5, "1": 30, "2": 5 + 30, "4": 100 * (1.05 / 0.7) };
    },
  },

  // ══ ratios_proportions ══════════════════════════════════════════════════

  // ── 7. a ratio shifted by adding to one part ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "A jar holds red and blue marbles in the ratio $5:3$. After $20$ more blue marbles are dropped in and no red ones, the ratio of red to blue becomes $5:8$. How many red marbles are in the jar?",
    choices: ["$4$", "$12$", "$20$", "$32$", "$52$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWrite the original counts as $5k$ red and $3k$ blue — the ratio fixes them only up to a common multiplier. After the addition: $\\dfrac{5k}{3k + 20} = \\dfrac{5}{8}$. Cross-multiplying, $40k = 15k + 100$, so $25k = 100$ and $k = 4$. The reds number $5k = 20$.\n\n**Trigger cue**\nA ratio before and after a change to one part only — introduce the multiplier $k$ immediately; the ratio alone can never give counts.\n\n**Takeaway**\nA ratio needs a multiplier before it can give a count.",
    fastest_path_md:
      "Red is unchanged, so its share of the ratio is fixed: blue goes from $3$ parts to $8$ parts of the *same* size, and those $5$ extra parts are the $20$ marbles. One part is $4$, so red $= 5 \\times 4 = 20$.",
    trap_map: {
      "0": "Cross-multiplies carelessly, leaving the $20$ outside the parenthesis: $40k = 15k + 20$ gives $k = 0.8$ and $5k = 4$.",
      "1": "Answers with the blue marbles before the addition, $3k = 12$.",
      "3": "Answers with the blue marbles after the addition, $3k + 20 = 32$.",
      "4": "Answers with the total after the addition, $20 + 32 = 52$.",
    },
    numeric_check: "5*(5*20/25)",
    check() {
      // Search actual marble counts, not the algebra.
      const found = [];
      for (let red = 1; red <= 2000; red++) {
        for (let blue = 1; blue <= 2000; blue++) {
          if (red * 3 !== blue * 5) continue; // red:blue = 5:3
          if (red * 8 === (blue + 20) * 5) found.push(red);
        }
      }
      if (found.length !== 1) throw new Error(`expected one count, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 5 * (20 / 25), "1": 12, "3": 12 + 20, "4": 20 + 32 };
    },
  },

  // ── 8. two ratios chained through a shared term ────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "In a workshop the ratio of hammers to saws is $3:4$, and the ratio of saws to drills is $6:5$. There are $12$ more drills than hammers. How many saws are in the workshop?",
    choices: ["$24$", "$108$", "$120$", "$144$", "$372$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe shared term is saws, which appears as $4$ in one ratio and $6$ in the other. Scale both to their least common multiple, $12$: hammers$:$saws $= 9:12$ and saws$:$drills $= 12:10$. So hammers$:$saws$:$drills $= 9:12:10$. Drills exceed hammers by $10 - 9 = 1$ part, and that part is $12$ items. Saws $= 12 \\times 12 = 144$.\n\n**Trigger cue**\nTwo ratios sharing one quantity — rescale both so the shared term matches before joining them; the raw numbers never line up by themselves.\n\n**Takeaway**\nMatch the shared term's value before chaining two ratios.",
    fastest_path_md:
      "Scale saws to $12$ in both: $9:12$ and $12:10$, so $9:12:10$. The drill–hammer gap is one part $= 12$, so saws $= 144$.",
    trap_map: {
      "0": "Splices the two ratios without rescaling the shared term, reading $3:4:5$ and making the gap $2$ parts: $12/2 = 6$ per part, so saws $= 4 \\times 6 = 24$.",
      "1": "Answers with the number of hammers, $9 \\times 12 = 108$.",
      "2": "Answers with the number of drills, $10 \\times 12 = 120$.",
      "4": "Answers with the total number of tools, $108 + 144 + 120 = 372$.",
    },
    numeric_check: "12*12/(10-9)",
    check() {
      // Search integer tool counts satisfying every stated relation.
      const found = [];
      for (let saws = 1; saws <= 3000; saws++) {
        if ((saws * 3) % 4 !== 0) continue;
        const hammers = (saws * 3) / 4;
        if ((saws * 5) % 6 !== 0) continue;
        const drills = (saws * 5) / 6;
        if (drills - hammers === 12) found.push(saws);
      }
      if (found.length !== 1) throw new Error(`expected one count, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 4 * (12 / 2), "1": 9 * 12, "2": 10 * 12, "4": 108 + 144 + 120 };
    },
  },

  // ── 9. joint variation, direct one way and inverse the other ───────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "The number of days a crew needs to finish a job varies directly with the size of the job and inversely with the number of workers on the crew. Six workers finish a $300$-unit job in $10$ days. How many days will eight workers need for a $500$-unit job?",
    choices: [
      "$7.5$",
      "$8$",
      "$12.5$",
      "$\\frac{50}{3}$",
      "$\\frac{200}{9}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe relation is $d = c \\cdot \\dfrac{J}{W}$. From the given case, $10 = c \\cdot \\dfrac{300}{6}$, so $c = \\dfrac{1}{5}$. Then $d = \\dfrac{1}{5} \\cdot \\dfrac{500}{8} = 12.5$ days.\n\n**Trigger cue**\n\"Varies directly with … and inversely with …\" — build the single constant $c$ from the given case, then substitute; scaling the two ratios separately is the same thing done in two steps, and easy to invert by accident.\n\n**Takeaway**\nMultiply by the direct ratio, divide by the inverse one.",
    fastest_path_md:
      "Scale by ratios: $10 \\times \\dfrac{500}{300} \\times \\dfrac{6}{8} = 10 \\times \\dfrac53 \\times \\dfrac34 = 12.5$ days.",
    trap_map: {
      "0": "Scales only for the crew and ignores the larger job: $10 \\times \\tfrac68 = 7.5$.",
      "1": "Inverts both ratios: $10 \\times \\tfrac{300}{500} \\times \\tfrac{8}{6} = 8$.",
      "3": "Scales only for the job and ignores the larger crew: $10 \\times \\tfrac{500}{300} = \\tfrac{50}{3}$.",
      "4": "Treats the crew as a direct factor rather than an inverse one: $10 \\times \\tfrac{500}{300} \\times \\tfrac{8}{6} = \\tfrac{200}{9}$.",
    },
    numeric_check: "10*(500/300)*(6/8)",
    check() {
      // Rebuild the constant from the given case by search, then apply it.
      let c = null;
      for (let n = 1; n <= 10_000; n++) {
        const candidate = n / 10_000;
        if (Math.abs(candidate * (300 / 6) - 10) < 1e-12) c = candidate;
      }
      if (c == null) throw new Error("no constant reproduces the given case");
      return { kind: "value", value: c * (500 / 8) };
    },
    trap_values() {
      return {
        "0": 10 * (6 / 8),
        "1": 10 * (300 / 500) * (8 / 6),
        "3": 10 * (500 / 300),
        "4": 10 * (500 / 300) * (8 / 6),
      };
    },
  },

  // ── 10. combining two mixtures of different volumes ────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "Container A holds $40$ liters of a milk-and-water mixture in the ratio $3:1$. Container B holds $30$ liters of a milk-and-water mixture in the ratio $2:3$. Both containers are emptied into a single vat. In the combined mixture, what is the ratio of milk to water?",
    choices: ["$2:3$", "$3:2$", "$5:3$", "$5:4$", "$23:17$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nConvert each ratio to actual liters before combining. Container A: $\\tfrac34 \\times 40 = 30$ liters of milk and $10$ of water. Container B: $\\tfrac25 \\times 30 = 12$ liters of milk and $18$ of water. Totals: $42$ liters of milk and $28$ of water, a ratio of $42:28 = 3:2$.\n\n**Trigger cue**\nTwo ratios combined at *different* volumes — ratios cannot be added or averaged; convert each to quantities, add the quantities, then re-form the ratio.\n\n**Takeaway**\nConvert ratios to amounts before combining; never add ratios.",
    fastest_path_md:
      "A gives $30$ and $10$; B gives $12$ and $18$. Totals $42$ and $28$, which is $3:2$.",
    trap_map: {
      "0": "Reports water to milk instead of milk to water.",
      "2": "Pairs A's milk with B's water only, $30:18$, ignoring the other half of each container.",
      "3": "Adds the ratio terms directly, $(3+2):(1+3) = 5:4$, as though the volumes were irrelevant.",
      "4": "Averages the two milk fractions as if the volumes matched: $\\tfrac12\\left(\\tfrac34 + \\tfrac25\\right) = \\tfrac{23}{40}$, giving $23:17$.",
    },
    numeric_check: null,
    check(q) {
      // Work in liters from first principles and reduce.
      const milk = (3 / 4) * 40 + (2 / 5) * 30;
      const water = 40 + 30 - milk;
      const label = ratioLabel(milk, water);
      const index = q.choices.indexOf(label);
      if (index < 0) throw new Error(`computed ${label}, not among the choices`);
      return { kind: "index", index };
    },
    trap_values() {
      const milk = (3 / 4) * 40 + (2 / 5) * 30;
      const water = 40 + 30 - milk;
      const avg = (3 / 4 + 2 / 5) / 2;
      return {
        "0": ratioLabel(water, milk),
        "2": ratioLabel((3 / 4) * 40, (3 / 5) * 30),
        "3": ratioLabel(3 + 2, 1 + 3),
        "4": ratioLabel(avg, 1 - avg),
      };
    },
  },

  // ── 11. proportional shares plus an internal transfer ──────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "Three partners divide a profit in the ratio $2:3:5$. The largest share exceeds the smallest by $\\$4{,}500$. The middle partner then gives $20\\%$ of her share to the partner with the smallest share. How many dollars does the smallest-share partner end up with?",
    choices: [
      "$\\$900$",
      "$\\$3{,}000$",
      "$\\$3{,}600$",
      "$\\$3{,}900$",
      "$\\$4{,}500$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet one part be $u$. The shares are $2u$, $3u$, $5u$, and $5u - 2u = 3u = 4500$, so $u = 1500$ and the shares are $\\$3{,}000$, $\\$4{,}500$, $\\$7{,}500$. The transfer is $0.20 \\times 4500 = \\$900$, so the smallest partner finishes with $3000 + 900 = \\$3{,}900$.\n\n**Trigger cue**\nA ratio pinned by the *difference* between two shares — the difference is a whole number of parts, so divide it by that count to size one part.\n\n**Takeaway**\nA stated difference between shares sizes one ratio part.",
    fastest_path_md:
      "The gap $5 - 2 = 3$ parts is $\\$4{,}500$, so a part is $\\$1{,}500$. Smallest $= \\$3{,}000$; the transfer is $20\\%$ of $\\$4{,}500 = \\$900$; total $\\$3{,}900$.",
    trap_map: {
      "0": "Answers with the transfer itself, $\\$900$, rather than the resulting share.",
      "1": "Answers with the smallest share before the transfer, $\\$3{,}000$.",
      "2": "Answers with what the middle partner keeps, $0.8 \\times 4500 = \\$3{,}600$.",
      "4": "Answers with the middle share $\\$4{,}500$ — numerically the same as the stated difference, which makes it doubly tempting.",
    },
    numeric_check: "2*(4500/3) + 0.2*3*(4500/3)",
    check() {
      // Search the part size directly against the stated difference.
      let unit = null;
      for (let u = 1; u <= 20_000; u++) {
        if (5 * u - 2 * u === 4500) unit = u;
      }
      if (unit == null) throw new Error("no part size fits the stated difference");
      const shares = [2 * unit, 3 * unit, 5 * unit];
      const transfer = 0.2 * shares[1];
      return { kind: "value", value: shares[0] + transfer };
    },
    trap_values() {
      return { "0": 0.2 * 4500, "1": 3000, "2": 0.8 * 4500, "4": 4500 };
    },
  },

  // ── 12. the binding constraint in a scaled recipe ──────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 5,
    stem_md:
      "A dough recipe calls for flour, sugar, and butter by weight in the ratio $8:3:2$. A baker has $5$ kilograms of flour, $1.5$ kilograms of sugar, and $1.2$ kilograms of butter, and no way to obtain more of any of them. What is the greatest weight of dough, in kilograms, that he can make?",
    choices: ["$5$", "$6.5$", "$7.7$", "$7.8$", "$8.125$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nOne \"unit\" of the recipe is $8 + 3 + 2 = 13$ parts. Each ingredient permits a certain number of units: flour $5/8 = 0.625$, sugar $1.5/3 = 0.5$, butter $1.2/2 = 0.6$. The batch is capped by the smallest of these — sugar, at $0.5$ units — so the dough weighs $0.5 \\times 13 = 6.5$ kilograms.\n\n**Trigger cue**\nFixed supplies against a fixed recipe ratio — divide each supply by its ratio part and take the *minimum*; the binding ingredient is rarely the scarcest by weight.\n\n**Takeaway**\nDivide each supply by its ratio part; the minimum binds.",
    fastest_path_md:
      "Units available: $5/8 = 0.625$, $1.5/3 = 0.5$, $1.2/2 = 0.6$. Sugar binds at $0.5$, so the dough is $0.5 \\times 13 = 6.5$ kg.",
    trap_map: {
      "0": "Answers with the flour on hand, $5$ kilograms, treating the largest supply as the batch size.",
      "2": "Adds all three supplies, $5 + 1.5 + 1.2 = 7.7$, ignoring that the ratio forbids using them all.",
      "3": "Scales by butter, the second-tightest ingredient: $0.6 \\times 13 = 7.8$.",
      "4": "Scales by flour, the loosest ingredient: $0.625 \\times 13 = 8.125$.",
    },
    numeric_check: "13*min(5/8, 1.5/3, 1.2/2)",
    check() {
      // Grow the batch gram by gram until an ingredient runs out.
      const parts = { flour: 8, sugar: 3, butter: 2 };
      const have = { flour: 5, sugar: 1.5, butter: 1.2 };
      const total = 13;
      let best = 0;
      for (let grams = 1; grams <= 20_000; grams++) {
        const dough = grams / 1000;
        const ok = Object.keys(parts).every(
          (k) => (dough * parts[k]) / total <= have[k] + 1e-12,
        );
        if (ok) best = dough;
        else break;
      }
      return { kind: "value", value: best };
    },
    trap_values() {
      return { "0": 5, "2": 5 + 1.5 + 1.2, "3": 13 * (1.2 / 2), "4": 13 * (5 / 8) };
    },
  },
];

verifyAndAppend(items, {
  dryRun: !process.env.APPEND,
  requireTrapValues: true,
});
