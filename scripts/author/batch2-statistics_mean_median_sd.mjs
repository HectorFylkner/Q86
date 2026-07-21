/**
 * Batch 2: 13 new questions for subtopic statistics_mean_median_sd
 * (fundamental_skill counting_sets_series_prob_stats).
 * Cells: D2 PS real x2, D3 PS pure x3, D3 PS real x2, D3 DS pure,
 * D4 PS pure, D4 DS pure, D4 DS real, D5 PS pure, D5 PS real.
 * Run: node --experimental-strip-types scripts/author/batch2-statistics_mean_median_sd.mjs
 * (dry run unless --append)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ─────────────────────────────────────────────── 1. D2 PS real — k SDs below the mean
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 2,
    stem_md:
      "The weights of the packages shipped by a warehouse last week had an average (arithmetic mean) of $70$ kilograms and a standard deviation of $4.5$ kilograms. Which of the following weights, in kilograms, is exactly $2.5$ standard deviations below the mean?",
    choices: ["$58.75$", "$61$", "$65.5$", "$67.5$", "$81.25$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nOne standard deviation is $4.5$ kilograms, so $2.5$ standard deviations is $2.5 \\times 4.5 = 11.25$ kilograms. A weight exactly that far below the mean is $70 - 11.25 = 58.75$ kilograms.\n\n**Trigger cue**\n\n\"Exactly $k$ standard deviations above/below the mean\": convert $k$ standard deviations into units first, then shift from the mean.\n\n**Takeaway**\n\nMultiply the count by the SD, then shift from the mean.",
    fastest_path_md:
      "Two SDs is $9$ and half an SD is $2.25$, so drop $11.25$ from $70$: $58.75$.",
    trap_map: {
      "1": "Subtracts only $2$ standard deviations: $70 - 9 = 61$.",
      "2": "Subtracts one standard deviation instead of $2.5$: $70 - 4.5 = 65.5$.",
      "3": "Subtracts the multiplier $2.5$ itself rather than $2.5$ standard deviations.",
      "4": "Adds $2.5$ standard deviations, reading \"below\" as \"above\": $70 + 11.25$.",
    },
    numeric_check: "70 - 2.5*4.5",
    check() {
      // brute force: scan a fine grid of weights and keep those sitting
      // exactly 2.5 SDs below the mean
      const hits = [];
      for (let t = 0; t <= 20000; t++) {
        const v = t / 100;
        if (Math.abs((70 - v) / 4.5 - 2.5) < 1e-9) hits.push(v);
      }
      if (hits.length !== 1) throw new Error(`expected unique weight, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ─────────────────────────────────────────────── 2. D2 PS real — mean minus median
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 2,
    stem_md:
      "The noon temperatures recorded in a certain city on five consecutive days were $61$, $68$, $62$, $74$, and $65$ degrees Fahrenheit. For these five days, how many degrees greater was the mean noon temperature than the median noon temperature?",
    choices: ["$0$", "$1$", "$2.5$", "$4$", "$5$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe mean is $\\dfrac{61 + 68 + 62 + 74 + 65}{5} = \\dfrac{330}{5} = 66$. Sorting the temperatures gives $61, 62, 65, 68, 74$, so the median is the third value, $65$. The mean exceeds the median by $66 - 65 = 1$.\n\n**Trigger cue**\n\nMean versus median of a small raw list: total for the mean, sort for the median — never read the middle of the unsorted list.\n\n**Takeaway**\n\nThe median lives in the sorted list, not the given order.",
    fastest_path_md:
      "The values pair around $66$ ($61/74$ overshoots by $+3$, $68/62$ balances, $65$ is $-1$): mean $66$; sorted middle is $65$; difference $1$.",
    trap_map: {
      "0": "Assumes the mean and the median of any list are equal.",
      "2": "Averages the two middle sorted values $62$ and $65$ as if the count were even, getting a median of $63.5$.",
      "3": "Takes the middle value of the unsorted list, $62$, as the median: $66 - 62 = 4$.",
      "4": "Compares the mean with the smallest temperature instead of the median: $66 - 61 = 5$.",
    },
    numeric_check: "330/5 - 65",
    check() {
      // recompute both statistics directly from the raw data
      const data = [61, 68, 62, 74, 65];
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const sorted = [...data].sort((a, b) => a - b);
      const median = sorted[(sorted.length - 1) / 2];
      return { kind: "value", value: mean - median };
    },
  },

  // ─────────────────────────────────────────────── 3. D3 PS pure — added value raises the mean
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "When the number $x$ is added to the list $5, 9, 14, 20$, the average (arithmetic mean) of the numbers in the list increases by $2$. What is the value of $x$?",
    choices: ["$2$", "$8$", "$12$", "$14$", "$22$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nThe original four numbers total $5 + 9 + 14 + 20 = 48$, so their mean is $12$. The new mean is $12 + 2 = 14$ over five numbers, so the new total is $5 \\times 14 = 70$. Therefore $x = 70 - 48 = 22$.\n\n**Trigger cue**\n\nOne value joins a list and the mean moves by a known amount: convert both means to totals, or charge the whole shift to the newcomer.\n\n**Takeaway**\n\nThe newcomer funds the mean's rise for every list member.",
    fastest_path_md:
      "The newcomer must supply $+2$ for each of the $5$ members on top of the old mean: $x = 12 + 5 \\times 2 = 22$.",
    trap_map: {
      "0": "Reports the increase in the mean itself rather than the added number.",
      "1": "Uses a new total of $4 \\times 14 = 56$, forgetting the list now has five numbers: $56 - 48 = 8$.",
      "2": "Multiplies the old mean by five, ignoring the $2$-point increase: $60 - 48 = 12$.",
      "3": "Assumes the added number simply equals the new mean, $14$.",
    },
    numeric_check: "5*14 - 48",
    check() {
      // brute force: scan candidate x values in steps of 0.5 and keep those
      // for which the 5-number mean exceeds the 4-number mean by exactly 2
      const base = [5, 9, 14, 20];
      const oldMean = base.reduce((a, b) => a + b, 0) / base.length;
      const hits = [];
      for (let t = -400; t <= 400; t++) {
        const x = t / 2;
        const newMean = (base.reduce((a, b) => a + b, 0) + x) / 5;
        if (Math.abs(newMean - (oldMean + 2)) < 1e-12) hits.push(x);
      }
      if (hits.length !== 1) throw new Error(`expected unique x, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ─────────────────────────────────────────────── 4. D3 PS real — deficit to reach a target mean
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "For the first $10$ days of a month, a salesperson's daily sales averaged $480$ dollars. What is the least possible total value of the salesperson's sales, in dollars, for days $11$ and $12$ combined that would make the average (arithmetic mean) of the daily sales for the first $12$ days at least $500$ dollars?",
    choices: ["$200$", "$700$", "$960$", "$1{,}000$", "$1{,}200$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nAn average of at least $500$ dollars over $12$ days requires a total of at least $12 \\times 500 = 6000$ dollars. The first $10$ days produced $10 \\times 480 = 4800$ dollars, so days $11$ and $12$ must contribute at least $6000 - 4800 = 1200$ dollars.\n\n**Trigger cue**\n\n\"Average must reach $T$ after more periods\": compare the required total with the total already banked.\n\n**Takeaway**\n\nBelow-target days build a deficit the remaining days must repay.",
    fastest_path_md:
      "The first $10$ days run $20$ dollars/day short, a $200$-dollar deficit; two on-target days plus the repayment give $2 \\times 500 + 200 = 1200$.",
    trap_map: {
      "0": "Reports only the accumulated shortfall of $10 \\times 20 = 200$ dollars, not the two days' required sales.",
      "1": "Adds the $200$-dollar shortfall to a single day's target: $500 + 200 = 700$.",
      "2": "Uses the old average for the two new days: $2 \\times 480 = 960$.",
      "3": "Multiplies the target by the two new days but ignores the accumulated shortfall: $2 \\times 500 = 1000$.",
    },
    numeric_check: "12*500 - 10*480",
    check() {
      // brute force: scan combined totals for days 11-12 from 0 upward and
      // return the first that pushes the 12-day mean to at least 500
      const banked = 10 * 480;
      for (let t = 0; t <= 10000; t++) {
        if ((banked + t) / 12 >= 500) return { kind: "value", value: t };
      }
      throw new Error("no feasible total found");
    },
  },

  // ─────────────────────────────────────────────── 5. D3 PS pure (algebra) — chained pair averages
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "If the average (arithmetic mean) of $x$ and $y$ is $20$ and the average (arithmetic mean) of $y$ and $z$ is $45$, what is the value of $z - x$?",
    choices: ["$12.5$", "$25$", "$45$", "$50$", "$65$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nConvert the averages to totals: $x + y = 40$ and $y + z = 90$. Subtracting the first equation from the second cancels $y$: $(y + z) - (x + y) = z - x = 90 - 40 = 50$.\n\n**Trigger cue**\n\nTwo pair-averages sharing a variable: subtract the totals so the shared variable cancels.\n\n**Takeaway**\n\nConvert averages to totals before adding or subtracting them.",
    fastest_path_md:
      "$z - x = (y+z) - (x+y) = 2(45) - 2(20) = 50$ — the shared $y$ vanishes on subtraction.",
    trap_map: {
      "0": "Halves the difference of the averages instead of doubling it: $(45-20)/2$.",
      "1": "Subtracts the averages without converting them to totals: $45 - 20 = 25$.",
      "2": "Reports the average of $y$ and $z$ instead of $z - x$.",
      "4": "Adds the two averages instead of subtracting the totals: $20 + 45 = 65$.",
    },
    numeric_check: "2*(45-20)",
    check() {
      // brute force: sweep y over a grid; x and z are then forced by the two
      // averages. Confirm z - x is the same for every y (well-defined) and
      // return it.
      const diffs = new Set();
      let value = null;
      for (let t = -400; t <= 400; t++) {
        const y = t / 2;
        const x = 2 * 20 - y;
        const z = 2 * 45 - y;
        value = z - x;
        diffs.add(value.toFixed(9));
      }
      if (diffs.size !== 1) throw new Error(`z - x not determined: ${[...diffs]}`);
      return { kind: "value", value };
    },
  },

  // ─────────────────────────────────────────────── 6. D3 PS pure — addition minimizing the SD
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "Which of the following numbers, when added to the list $2, 4, 5, 8, 11$, results in a list of six numbers with the least standard deviation?",
    choices: ["$0$", "$5$", "$6$", "$8$", "$11$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe list totals $30$, so its mean is $6$. Adding a value equal to the mean leaves the mean at $6$ and contributes zero to the sum of squared deviations, while spreading that sum over six values instead of five. Any other candidate both shifts the mean and adds its own nonzero deviation, so $6$ yields the least standard deviation.\n\n**Trigger cue**\n\n\"Which added value changes the standard deviation least/most\": judge each candidate by its distance from the mean.\n\n**Takeaway**\n\nAdding a value at the mean minimizes the new standard deviation.",
    fastest_path_md:
      "Compute the mean, $30/5 = 6$; the candidate sitting exactly on the mean adds no spread — pick $6$ with no SD computation.",
    trap_map: {
      "0": "Assumes adding $0$ \"adds nothing\" and so cannot widen the spread, but $0$ is the candidate farthest from the mean.",
      "1": "Adds the median of the list, confusing the positional middle with the balance point that standard deviation uses.",
      "3": "Duplicates a value already in the list, assuming a repeat can never increase the standard deviation.",
      "4": "Matches the largest value so the maximum does not grow, ignoring that $11$ sits far from the mean.",
    },
    numeric_check: "6",
    check() {
      // brute force: simulate the SD of the 6-number list for every choice
      // and return the candidate with the strictly smallest SD
      const base = [2, 4, 5, 8, 11];
      const sd = (xs) => {
        const m = xs.reduce((a, b) => a + b, 0) / xs.length;
        return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length);
      };
      const cands = [0, 5, 6, 8, 11];
      const sds = cands.map((c) => sd([...base, c]));
      const min = Math.min(...sds);
      const winners = cands.filter((_, i) => Math.abs(sds[i] - min) < 1e-12);
      if (winners.length !== 1) throw new Error(`expected unique minimizer, got ${winners}`);
      return { kind: "value", value: winners[0] };
    },
  },

  // ─────────────────────────────────────────────── 7. D3 PS real — greatest possible median
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "A help desk recorded the number of calls it received on each of $5$ days. If the average (arithmetic mean) number of calls per day for the $5$ days was $30$, what is the greatest possible value of the median number of calls for the $5$ days?",
    choices: ["$30$", "$37$", "$50$", "$75$", "$150$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe $5$ daily counts total $5 \\times 30 = 150$. In sorted order the median is the $3$rd value, and the $4$th and $5$th values must be at least as large, so a median of $m$ forces the top three values to total at least $3m$. Thus $3m \\le 150$, so $m \\le 50$. The counts $0, 0, 50, 50, 50$ achieve $m = 50$.\n\n**Trigger cue**\n\n\"Greatest possible median with a fixed mean\": the median plus everything above it must fit inside the fixed total.\n\n**Takeaway**\n\nA median of $m$ claims $m$ from every upper-half position.",
    fastest_path_md:
      "Zero out the two low days; the top three positions each need at least the median, so $3m \\le 150$ gives $m = 50$.",
    trap_map: {
      "0": "Believes the median can never exceed the mean, capping it at $30$.",
      "1": "Requires the top four positions to be at least the median: $\\lfloor 150/4 \\rfloor = 37$.",
      "3": "Requires only the median position and one value above it to carry the total: $150/2 = 75$.",
      "4": "Assigns the entire total to the median position, ignoring the two positions above it.",
    },
    numeric_check: "150/3",
    check() {
      // brute force: enumerate all sorted nonnegative-integer 5-tuples with
      // sum 150 and track the largest 3rd element
      let best = -1;
      const TOTAL = 150;
      for (let a = 0; a * 5 <= TOTAL; a++) {
        for (let b = a; a + b * 4 <= TOTAL; b++) {
          for (let c = b; a + b + c * 3 <= TOTAL; c++) {
            const rem = TOTAL - a - b - c;
            for (let d = c; d <= rem; d++) {
              const e = rem - d;
              if (e >= d) best = Math.max(best, c);
            }
          }
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ─────────────────────────────────────────────── 8. D4 PS pure — range couples the extremes
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 4,
    stem_md:
      "Five positive integers have an average (arithmetic mean) of $8$, a median of $8$, and a range of $12$. What is the greatest possible value of the largest of the five integers?",
    choices: ["$12$", "$13$", "$16$", "$20$", "$22$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSort the integers as $a \\le b \\le 8 \\le d \\le e$ with total $5 \\times 8 = 40$. The range condition ties the ends together: $e = a + 12$, so maximizing $e$ means maximizing $a$, not minimizing it. Substituting, $a + b + 8 + d + (a + 12) = 40$, so $2a + b + d = 20$. With $b$ at its floor $a$ and $d$ at its floor $8$: $3a + 8 = 20$, so $a = 4$ and $e = 16$. Check: $4, 4, 8, 8, 16$ has mean $8$, median $8$, range $12$.\n\n**Trigger cue**\n\nFixed mean and median plus a fixed range: the range chains the largest value to the smallest, flipping the usual minimize-the-rest instinct.\n\n**Takeaway**\n\nA fixed range drags the maximum up only by dragging the minimum up.",
    fastest_path_md:
      "Since $e = a + 12$, push $a$ up: floor $b = a$ and $d = 8$, solve $3a + 28 = 40$ to get $a = 4$, $e = 16$.",
    trap_map: {
      "0": "Reports the range itself as the largest value.",
      "1": "Sets the smallest integer to $1$ and adds the range, ignoring that the total then cannot reach $40$.",
      "3": "Adds the range to the median instead of to the smallest value: $8 + 12 = 20$.",
      "4": "Minimizes the other four values as $1, 1, 8, 8$ and ignores the range condition entirely: $40 - 18 = 22$.",
    },
    numeric_check: "16",
    check() {
      // brute force: enumerate all sorted positive-integer 5-tuples with
      // median 8, sum 40, and range 12; track the largest max element
      let best = -1;
      for (let a = 1; a <= 8; a++) {
        for (let b = a; b <= 8; b++) {
          const c = 8;
          for (let d = c; d <= 40; d++) {
            const e = 40 - a - b - c - d;
            if (e >= d && e - a === 12) best = Math.max(best, e);
          }
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ─────────────────────────────────────────────── 9. D5 PS pure — distinctness forces the whole set
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "A set consists of $7$ distinct positive integers whose average (arithmetic mean) is $12$. If the median of the set is as large as possible, what is the largest integer in the set?",
    choices: ["$15$", "$18$", "$20$", "$21$", "$63$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe seven integers total $84$. For median $m$, the three below it are distinct positive integers, so they total at least $1 + 2 + 3 = 6$; the three above are distinct integers exceeding $m$, so they total at least $(m+1) + (m+2) + (m+3) = 3m + 6$. Then $6 + m + 3m + 6 \\le 84$ gives $m \\le 18$. At $m = 18$ the budget is exact: the bottom must be $1, 2, 3$ and the top must total $84 - 6 - 18 = 60 = 19 + 20 + 21$, its minimum — so the set is forced to be $\\{1, 2, 3, 18, 19, 20, 21\\}$ and the largest integer is $21$.\n\n**Trigger cue**\n\n\"Distinct integers\" with an extremal mean/median question: floors are staircases ($1, 2, 3$ and $m+1, m+2, m+3$), not flat values.\n\n**Takeaway**\n\nWhen the extremal budget is exact, every element is forced.",
    fastest_path_md:
      "Staircase floors give $4m + 12 \\le 84$, so $m = 18$; the slack is zero, forcing the top three to be exactly $19, 20, 21$.",
    trap_map: {
      "0": "Assumes a fixed mean of $12$ makes the integers the consecutive run $9$ through $15$ and reports its largest value.",
      "1": "Reports the maximum median instead of the largest integer in the set.",
      "2": "Drops the distinctness requirement, using floors $1, 1, 1$ and a flat top to get a median (and largest) of $20$.",
      "4": "Maximizes the largest integer directly ($84 - (1+2+3+4+5+6) = 63$) instead of first maximizing the median.",
    },
    numeric_check: "21",
    check() {
      // brute force: enumerate every strictly increasing 7-tuple of positive
      // integers summing to 84; per median, record the largest possible max;
      // then answer for the maximal median.
      const byMedian = new Map();
      const build = (arr, start, remaining, slots) => {
        if (slots === 0) {
          if (remaining === 0) {
            const median = arr[3];
            const largest = arr[6];
            const cur = byMedian.get(median) ?? -1;
            if (largest > cur) byMedian.set(median, largest);
          }
          return;
        }
        for (let v = start; ; v++) {
          let minSum = 0;
          for (let j = 0; j < slots; j++) minSum += v + j;
          if (minSum > remaining) break;
          arr.push(v);
          build(arr, v + 1, remaining - v, slots - 1);
          arr.pop();
        }
      };
      build([], 1, 84, 7);
      const maxMedian = Math.max(...byMedian.keys());
      return { kind: "value", value: byMedian.get(maxMedian) };
    },
  },

  // ─────────────────────────────────────────────── 10. D5 PS real — least count under mean + median
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "Each of $25$ customers rated a restaurant with an integer number of stars from $1$ to $5$, inclusive. The average (arithmetic mean) of the ratings was $4.6$, and the median of the ratings was $5$. What is the least possible number of customers who gave a rating of $5$ stars?",
    choices: ["$12$", "$13$", "$15$", "$22$", "$23$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe $25$ ratings total $25 \\times 4.6 = 115$. The median condition puts a $5$ in the $13$th sorted position, so at least $13$ ratings are $5$ — but the mean tightens this. With $k$ fives, each of the other $25 - k$ ratings is at most $4$, so $115 \\le 5k + 4(25 - k) = 100 + k$, forcing $k \\ge 15$. And $k = 15$ works: ten $4$s and fifteen $5$s total $40 + 75 = 115$, with the $13$th value equal to $5$. The least possible number is $15$.\n\n**Trigger cue**\n\n\"Least possible number of X\" under a fixed mean: give every non-X value its maximum and see how many X the total still demands.\n\n**Takeaway**\n\nMinimizing one count means maximizing what everyone else contributes.",
    fastest_path_md:
      "Cap the non-fives at $4$: $115 \\le 100 + k$ gives $k \\ge 15$, which beats the median's floor of $13$ — check ten $4$s, fifteen $5$s works.",
    trap_map: {
      "0": "Counts only the positions strictly above the median position, $25 - 13 = 12$.",
      "1": "Uses only the median condition (positions $13$ through $25$), missing that the mean forces two more fives.",
      "3": "Computes the greatest possible number of fives from the surplus over all-ones, $\\lfloor (115-25)/4 \\rfloor = 22$, instead of the least.",
      "4": "Starts from thirteen $5$s and twelve $1$s, then converts $1$s to $5$s to reach the mean — overcounting because non-fives may be $4$s.",
    },
    numeric_check: "15",
    check() {
      // brute force: enumerate all rating frequency vectors (n1..n5), keep
      // those matching the count, total, and an explicitly computed median,
      // and take the smallest n5.
      let best = Infinity;
      for (let n1 = 0; n1 <= 25; n1++) {
        for (let n2 = 0; n1 + n2 <= 25; n2++) {
          for (let n3 = 0; n1 + n2 + n3 <= 25; n3++) {
            for (let n4 = 0; n1 + n2 + n3 + n4 <= 25; n4++) {
              const n5 = 25 - n1 - n2 - n3 - n4;
              const total = n1 + 2 * n2 + 3 * n3 + 4 * n4 + 5 * n5;
              if (total !== 115) continue;
              const arr = [
                ...Array(n1).fill(1),
                ...Array(n2).fill(2),
                ...Array(n3).fill(3),
                ...Array(n4).fill(4),
                ...Array(n5).fill(5),
              ];
              if (arr[12] !== 5) continue; // median of 25 values
              best = Math.min(best, n5);
            }
          }
        }
      }
      if (!Number.isFinite(best)) throw new Error("no feasible rating vector");
      return { kind: "value", value: best };
    },
  },

  // ─────────────────────────────────────────────── 11. D3 DS pure — spacing plus location fixes the median
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "A certain list consists of $5$ numbers. What is the median of the numbers in the list?\n\n(1) The average (arithmetic mean) of the numbers in the list is $12$.\n\n(2) The numbers in the list are consecutive even integers.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nStatement (1): a mean of $12$ leaves the median free — $12, 12, 12, 12, 12$ has median $12$, while $0, 0, 0, 0, 60$ has median $0$ — insufficient. Statement (2): five consecutive even integers $a, a+2, a+4, a+6, a+8$ have median $a + 4$, which depends on the unknown $a$ — insufficient. Together: consecutive even integers are evenly spaced, so their median equals their mean, which is $12$ — sufficient. The answer is (C).\n\n**Trigger cue**\n\nA DS median question with one statement about spacing and one about the mean: evenly spaced data converts mean information into median information.\n\n**Takeaway**\n\nEvenly spaced lists tie the median to the mean.",
    fastest_path_md:
      "(1) fixes location but not shape, (2) fixes shape but not location; evenly spaced means median $=$ mean, so only together do they pin $12$ — (C).",
    trap_map: {
      "0": "Assumes a known mean pins the median, but lists with mean $12$ can have any median.",
      "1": "Sees that evenly spaced numbers have median equal to mean but forgets statement (2) alone gives no value for either.",
      "3": "Credits each statement alone, though the mean alone says nothing about spacing and the spacing alone says nothing about location.",
      "4": "Misses that even spacing makes the median equal the mean, so the statements together fix the median.",
    },
    numeric_check: null,
    check() {
      // enumerate candidate lists; decide sufficiency by uniqueness of the
      // median across all candidates consistent with each statement
      const lists = [];
      const grid = [];
      for (let v = 0; v <= 60; v += 6) grid.push(v);
      const rec = (start, cur) => {
        if (cur.length === 5) {
          lists.push([...cur]);
          return;
        }
        for (let i = start; i < grid.length; i++) {
          cur.push(grid[i]);
          rec(i, cur);
          cur.pop();
        }
      };
      rec(0, []);
      for (let a = -60; a <= 60; a += 2) lists.push([a, a + 2, a + 4, a + 6, a + 8]);
      const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
      const median = (xs) => [...xs].sort((p, q) => p - q)[2];
      const isConsecEven = (xs) => {
        const s = [...xs].sort((p, q) => p - q);
        return (
          s.every((v) => v % 2 === 0) &&
          s.every((v, i) => i === 0 || v - s[i - 1] === 2)
        );
      };
      const s1 = lists.filter((l) => Math.abs(mean(l) - 12) < 1e-9);
      const s2 = lists.filter(isConsecEven);
      const both = lists.filter((l) => Math.abs(mean(l) - 12) < 1e-9 && isConsecEven(l));
      const unique = (arr) => arr.length > 0 && new Set(arr.map(median)).size === 1;
      const suff1 = unique(s1);
      const suff2 = unique(s2);
      let index;
      if (suff1 && suff2) index = 3;
      else if (suff1) index = 0;
      else if (suff2) index = 1;
      else index = unique(both) ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // ─────────────────────────────────────────────── 12. D4 DS pure — bounding the SD without computing it
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 4,
    stem_md:
      "The average (arithmetic mean) of the numbers in list $L$ is $40$. Is the standard deviation of the numbers in $L$ less than $15$?\n\n(1) Each number in $L$ is between $30$ and $50$, inclusive.\n\n(2) The range of the numbers in $L$ is $20$.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe question is yes/no, so a bound settles it. Statement (1): every number lies within $10$ of the mean $40$, so every squared deviation is at most $100$ and the standard deviation is at most $10 < 15$ — a definite yes, sufficient. Statement (2): for any data set, the standard deviation never exceeds half the range (the extreme case splits the values evenly between the two endpoints); half of $20$ is $10 < 15$ — a definite yes, sufficient. The answer is (D).\n\n**Trigger cue**\n\nDS asking whether the standard deviation clears a threshold: look for width constraints that bound the spread — exact values are not needed.\n\n**Takeaway**\n\nStandard deviation is at most half the range.",
    fastest_path_md:
      "Each statement traps the data in a window of width $20$, and the SD of any set is at most half that width, $10 < 15$ — both sufficient, (D).",
    trap_map: {
      "0": "Trusts the explicit $30$-to-$50$ bounds but doubts that a range alone can cap the standard deviation.",
      "1": "Judges the range statement stronger than the interval statement, though (1) also confines every value to a window of width $20$.",
      "2": "Combines the statements to bound the spread, not noticing each alone already confines the values to a width-$20$ window.",
      "4": "Believes no statement short of the actual values can determine a standard-deviation comparison.",
    },
    numeric_check: null,
    check() {
      // enumerate candidate lists with mean 40 (grid lists of length 1-5 plus
      // half-and-half spread families); decide each statement by whether the
      // yes/no answer "sd < 15" is consistent across all matching candidates
      const sd = (xs) => {
        const m = xs.reduce((s, x) => s + x, 0) / xs.length;
        return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length);
      };
      const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
      const pool = [];
      const grid = [];
      for (let v = 0; v <= 100; v += 5) grid.push(v);
      const gen = (start, cur) => {
        if (cur.length > 0) pool.push([...cur]);
        if (cur.length === 5) return;
        for (let i = start; i < grid.length; i++) {
          cur.push(grid[i]);
          gen(i, cur);
          cur.pop();
        }
      };
      gen(0, []);
      for (let k = 0; k <= 50; k++) {
        pool.push([...Array(5).fill(40 - k), ...Array(5).fill(40 + k)]);
      }
      const pool40 = pool.filter((l) => Math.abs(mean(l) - 40) < 1e-9);
      const answer = (l) => sd(l) < 15;
      const s1 = pool40.filter((l) => l.every((v) => v >= 30 && v <= 50));
      const s2 = pool40.filter((l) => Math.max(...l) - Math.min(...l) === 20);
      const both = pool40.filter(
        (l) => l.every((v) => v >= 30 && v <= 50) && Math.max(...l) - Math.min(...l) === 20,
      );
      // sanity: the pool must contain "no" cases overall, or the test is vacuous
      if (!pool40.some((l) => !answer(l))) throw new Error("pool has no sd >= 15 case");
      const consistent = (arr) => arr.length > 0 && new Set(arr.map(answer)).size === 1;
      const suff1 = consistent(s1);
      const suff2 = consistent(s2);
      let index;
      if (suff1 && suff2) index = 3;
      else if (suff1) index = 0;
      else if (suff2) index = 1;
      else index = consistent(both) ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // ─────────────────────────────────────────────── 13. D4 DS real — counts around a benchmark pin the median
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 4,
    stem_md:
      "Company X has exactly $15$ employees. What is the median annual salary of the $15$ employees?\n\n(1) Exactly $7$ of the employees have annual salaries less than $\\$40{,}000$.\n\n(2) Exactly $7$ of the employees have annual salaries greater than $\\$40{,}000$.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWith $15$ salaries, the median is the $8$th in sorted order. Statement (1): the $8$th salary is at least $\\$40{,}000$ but could be $\\$40{,}000$ or $\\$90{,}000$ — insufficient. Statement (2): symmetrically, the $8$th salary is at most $\\$40{,}000$ but otherwise free — insufficient. Together: $7$ salaries are below $\\$40{,}000$ and $7$ are above, which accounts for $14$ employees; the one remaining salary is neither below nor above $\\$40{,}000$, so it equals $\\$40{,}000$ exactly and occupies the $8$th position. The median is $\\$40{,}000$ — sufficient. The answer is (C).\n\n**Trigger cue**\n\nDS statements counting values strictly below and strictly above a benchmark: check whether the leftover positions land exactly on the benchmark.\n\n**Takeaway**\n\nSeven below and seven above force the eighth onto the benchmark.",
    fastest_path_md:
      "$7 + 7 = 14$ of $15$; the leftover employee earns exactly $\\$40{,}000$ and sits $8$th — the median. Each count alone leaves the $8$th salary floating.",
    trap_map: {
      "0": "Concludes from statement (1) alone that the median is $\\$40{,}000$, though the $8$th salary could be any amount not below it.",
      "1": "Concludes from statement (2) alone that the median is $\\$40{,}000$, though the $8$th salary could be any amount not above it.",
      "3": "Credits each statement alone with locating the median at the benchmark, when each only bounds it from one side.",
      "4": "Notes that neither statement names an actual salary, missing that together they force the $8$th salary to be exactly $\\$40{,}000$.",
    },
    numeric_check: null,
    check() {
      // enumerate salary distributions over a value grid; decide sufficiency
      // by uniqueness of the (directly computed) median under each statement
      const vals = [30000, 35000, 40000, 45000, 50000];
      const medians1 = new Set();
      const medians2 = new Set();
      const mediansBoth = new Set();
      let c1 = 0;
      let c2 = 0;
      let cb = 0;
      for (let a = 0; a <= 15; a++) {
        for (let b = 0; a + b <= 15; b++) {
          for (let c = 0; a + b + c <= 15; c++) {
            for (let d = 0; a + b + c + d <= 15; d++) {
              const e = 15 - a - b - c - d;
              const counts = [a, b, c, d, e];
              const arr = [];
              counts.forEach((n, i) => {
                for (let j = 0; j < n; j++) arr.push(vals[i]);
              });
              arr.sort((p, q) => p - q);
              const median = arr[7];
              const below = arr.filter((v) => v < 40000).length;
              const above = arr.filter((v) => v > 40000).length;
              if (below === 7) {
                medians1.add(median);
                c1++;
              }
              if (above === 7) {
                medians2.add(median);
                c2++;
              }
              if (below === 7 && above === 7) {
                mediansBoth.add(median);
                cb++;
              }
            }
          }
        }
      }
      const suff1 = c1 > 0 && medians1.size === 1;
      const suff2 = c2 > 0 && medians2.size === 1;
      const suffBoth = cb > 0 && mediansBoth.size === 1;
      let index;
      if (suff1 && suff2) index = 3;
      else if (suff1) index = 0;
      else if (suff2) index = 1;
      else index = suffBoth ? 2 : 4;
      return { kind: "index", index };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
