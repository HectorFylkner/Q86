/**
 * Batch: series_patterns (counting_sets_series_prob_stats / arithmetic).
 * Six PS items, one per cell: D2 real, D3 pure, D4 real, D4 pure, D5 pure, D5 real.
 * Run: node scripts/author/batch-series_patterns.mjs   (APPEND=1 to write the bank)
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // 1. D2 PS real — repeating color cycle, count one color in the first N
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 2,
    stem_md:
      "A jewelry maker strings beads onto a cord in a repeating pattern: $1$ red bead, then $2$ blue beads, then $1$ green bead, after which the pattern starts over. If she strings exactly $30$ beads, how many of them are blue?",
    choices: ["$7$", "$10$", "$14$", "$15$", "$16$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe pattern red, blue, blue, green repeats every $4$ beads and contains $2$ blue beads per cycle. Since $30 = 7 \\cdot 4 + 2$, there are $7$ complete cycles contributing $7 \\cdot 2 = 14$ blue beads, and the $2$ leftover beads are red then blue — one more blue. Total: $14 + 1 = 15$.\n\n**Trigger cue**\n\nA repeating pattern with a \"how many of X among the first $N$\" ask: divide $N$ by the cycle length and walk the remainder by hand.\n\n**Takeaway**\n\nCount full cycles, then check the leftover beads.",
    fastest_path_md:
      "Cycle length $4$ with $2$ blue each. $30 \\div 4 = 7$ remainder $2$, and the leftover pair is red, blue. So $7 \\cdot 2 + 1 = 15$.",
    trap_map: {
      "0": "Counts the $7$ complete cycles (equivalently, the green beads) instead of the blue beads.",
      "1": "Divides $30$ by the $3$ colors rather than by the $4$-bead cycle length.",
      "2": "Takes $7$ full cycles times $2$ blue but ignores the $2$ leftover beads.",
      "4": "Assumes the partial cycle contributes both of its blue beads, rounding up to $8$ full cycles.",
    },
    numeric_check: "7*2+1",
    check() {
      const cycle = ["R", "B", "B", "G"];
      let blue = 0;
      for (let i = 0; i < 30; i++) if (cycle[i % 4] === "B") blue++;
      return { kind: "value", value: blue };
    },
  },

  // 2. D3 PS pure — linear recursion, iterate to a nearby term
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 3,
    stem_md:
      "In a sequence, $a_1 = 3$ and $a_{n+1} = 2a_n - 1$ for all $n \\ge 1$. What is the value of $a_5$?",
    choices: ["$17$", "$18$", "$33$", "$63$", "$65$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nIterate the rule four times: $a_2 = 2(3) - 1 = 5$, $a_3 = 2(5) - 1 = 9$, $a_4 = 2(9) - 1 = 17$, $a_5 = 2(17) - 1 = 33$.\n\n**Trigger cue**\n\nA recursion asked for a nearby term: iterate directly and label each index — no closed form needed.\n\n**Takeaway**\n\nFor nearby terms, four labeled iterations beat any formula.",
    fastest_path_md:
      "Double and subtract $1$ each step: $3 \\to 5 \\to 9 \\to 17 \\to 33$. (Each term is one more than a power of $2$, confirming the march.)",
    trap_map: {
      "0": "Stops one step early at $a_4 = 17$.",
      "1": "Applies $2(a_n - 1)$ each step — subtracting before doubling gives $3 \\to 4 \\to 6 \\to 10 \\to 18$.",
      "3": "Uses $a_{n+1} = 2a_n + 1$, flipping the sign: $3 \\to 7 \\to 15 \\to 31 \\to 63$.",
      "4": "Iterates one step too far, landing on $a_6 = 65$.",
    },
    numeric_check: "2*17-1",
    check() {
      let a = 3;
      for (let n = 1; n < 5; n++) a = 2 * a - 1;
      return { kind: "value", value: a };
    },
  },

  // 3. D4 PS real — arithmetic series total over 12 months
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 4,
    stem_md:
      "Priya starts a savings jar with a \\$12 deposit in January. In each month after January, she deposits \\$5 more than she deposited the month before. What is the total amount she deposits during the 12 months from January through December?",
    choices: ["\\$67", "\\$330", "\\$474", "\\$534", "\\$804"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe deposits form an arithmetic sequence with first term $12$, common difference $5$, and $12$ terms, so December's deposit is $12 + 11 \\cdot 5 = 67$. The total is the average of the first and last deposits times the number of months: $\\frac{(12 + 67) \\cdot 12}{2} = 79 \\cdot 6 = 474$.\n\n**Trigger cue**\n\n\"Same increase every period, total over all periods\": find the last term, then average the ends and multiply by the count.\n\n**Takeaway**\n\nArithmetic total equals average of endpoints times term count.",
    fastest_path_md:
      "December's deposit is $12 + 11 \\cdot 5 = 67$. Pair first with last: $\\frac{12 + 67}{2} \\cdot 12 = 79 \\cdot 6 = 474$.",
    trap_map: {
      "0": "Finds December's single deposit of $\\$67$ instead of the year's total.",
      "1": "Adds only the $\\$5$ increases ($5 \\cdot 66 = 330$), dropping the twelve $\\$12$ base deposits.",
      "3": "Runs the increases from $1$ through $12$ instead of $0$ through $11$: $144 + 5 \\cdot 78 = 534$.",
      "4": "Multiplies December's $\\$67$ by $12$, as if every month matched the largest deposit.",
    },
    numeric_check: "(12+67)*12/2",
    check() {
      let total = 0;
      let deposit = 12;
      for (let m = 1; m <= 12; m++) {
        total += deposit;
        deposit += 5;
      }
      return { kind: "value", value: total };
    },
  },

  // 4. D4 PS pure — telescoping sum
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 4,
    stem_md:
      "For every positive integer $n$, the $n$th term of a sequence is defined by $t_n = \\frac{1}{n} - \\frac{1}{n+1}$. What is the sum of the first $20$ terms of this sequence?",
    choices: [
      "$\\frac{1}{21}$",
      "$\\frac{1}{20}$",
      "$\\frac{19}{20}$",
      "$\\frac{20}{21}$",
      "$\\frac{21}{22}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nWrite the sum out: $\\left(\\frac{1}{1} - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\cdots + \\left(\\frac{1}{20} - \\frac{1}{21}\\right)$. Every intermediate fraction cancels with its neighbor, leaving only $1 - \\frac{1}{21} = \\frac{20}{21}$.\n\n**Trigger cue**\n\nTerms shaped like $\\frac{1}{n} - \\frac{1}{n+1}$ signal a telescoping sum: expand the first two and last terms to see what survives.\n\n**Takeaway**\n\nTelescoping sums collapse to first piece minus last piece.",
    fastest_path_md:
      "Test small cases: $1$ term gives $\\frac{1}{2}$, $2$ terms give $\\frac{2}{3}$, $3$ terms give $\\frac{3}{4}$ — the running sum is $\\frac{n}{n+1}$, so $20$ terms give $\\frac{20}{21}$.",
    trap_map: {
      "0": "Keeps only the surviving tail $\\frac{1}{21}$ and forgets the leading $1$.",
      "1": "Reports the positive part of the $20$th term, $\\frac{1}{20}$, instead of summing.",
      "2": "Telescopes to $1 - \\frac{1}{20}$, subtracting the wrong tail fraction (off by one).",
      "4": "Runs the telescope one term too far, computing $1 - \\frac{1}{22}$.",
    },
    numeric_check: "1 - 1/21",
    check() {
      let sum = 0;
      for (let n = 1; n <= 20; n++) sum += 1 / n - 1 / (n + 1);
      return { kind: "value", value: sum };
    },
  },

  // 5. D5 PS pure — hidden period-6 recursion, sum of first 100 terms
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "In a sequence, $a_1 = 4$, $a_2 = 7$, and $a_n = a_{n-1} - a_{n-2}$ for all $n \\ge 3$. What is the sum of the first $100$ terms of the sequence?",
    choices: ["$-4$", "$0$", "$3$", "$10$", "$18$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nGenerate terms: $4, 7, 3, -4, -7, -3$, then $a_7 = 4$ and $a_8 = 7$, so the sequence repeats with period $6$, and each six-term block sums to $0$. Since $100 = 16 \\cdot 6 + 4$, the $96$ terms in full blocks contribute $0$, and the sum equals $a_{97} + a_{98} + a_{99} + a_{100} = 4 + 7 + 3 + (-4) = 10$.\n\n**Trigger cue**\n\nA recursion like $a_n = a_{n-1} - a_{n-2}$ asked about a distant index: generate terms until the pair $(a_1, a_2)$ reappears, then use the cycle.\n\n**Takeaway**\n\nFind the cycle, cancel full blocks, add the remainder.",
    fastest_path_md:
      "Six terms in, the block $4, 7, 3, -4, -7, -3$ cancels to $0$ (each value appears with both signs). Only terms $97$–$100$ matter: $4 + 7 + 3 - 4 = 10$.",
    trap_map: {
      "0": "Computes the single term $a_{100} = -4$ instead of the sum.",
      "1": "Assumes $100$ terms split into complete cycles that all cancel to $0$.",
      "2": "Miscounts the remainder as $5$ leftover terms: $4 + 7 + 3 - 4 - 7 = 3$.",
      "4": "Drops the sign on the fourth leftover term, adding $4 + 7 + 3 + 4 = 18$.",
    },
    numeric_check: "4+7+3-4",
    check() {
      const a = [null, 4, 7];
      for (let n = 3; n <= 100; n++) a[n] = a[n - 1] - a[n - 2];
      let sum = 0;
      for (let n = 1; n <= 100; n++) sum += a[n];
      return { kind: "value", value: sum };
    },
  },

  // 6. D5 PS real — arithmetic series with periodic skipped terms
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "A stamping machine is programmed to produce $5$ parts during its 1st minute of operation and to increase its output by $3$ parts in each minute thereafter. However, during every 5th minute (the 5th, 10th, 15th, and so on) the machine pauses to cool and produces nothing, even though its programmed output level keeps rising on schedule. How many parts does the machine actually produce during its first $20$ minutes of operation?",
    choices: ["$440$", "$500$", "$512$", "$574$", "$670$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe scheduled output in minute $n$ is $5 + 3(n-1) = 3n + 2$, so the twenty scheduled outputs run from $5$ to $62$ and total $\\frac{(5 + 62) \\cdot 20}{2} = 670$. Cooling wipes out minutes $5, 10, 15, 20$, whose scheduled outputs are $17, 32, 47, 62$, totaling $158$. Actual production is $670 - 158 = 512$.\n\n**Trigger cue**\n\nA regular series with periodic exceptions: total the clean series first, then subtract exactly the excluded terms — never rebuild the series around the gaps.\n\n**Takeaway**\n\nSum the full pattern, then subtract the skipped terms.",
    fastest_path_md:
      "Full arithmetic sum: $\\frac{(5 + 62) \\cdot 20}{2} = 670$. The four cooling minutes cost $17 + 32 + 47 + 62 = 158$. So $670 - 158 = 512$.",
    trap_map: {
      "0": "Lets the schedule stall during pauses, summing $16$ consecutive terms $5$ through $50$ for $440$.",
      "1": "Subtracts the outputs of minutes $6, 11, 16, 21$ ($20 + 35 + 50 + 65 = 170$) — off by one on which levels are skipped.",
      "3": "Forgets that minute $20$ is itself a cooling minute, removing only three pauses: $670 - 96 = 574$.",
      "4": "Sums all twenty scheduled outputs and ignores the cooling pauses entirely.",
    },
    numeric_check: "670-158",
    check() {
      let total = 0;
      for (let m = 1; m <= 20; m++) {
        const scheduled = 5 + 3 * (m - 1);
        total += m % 5 === 0 ? 0 : scheduled;
      }
      return { kind: "value", value: total };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
