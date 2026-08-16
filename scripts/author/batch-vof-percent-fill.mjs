/**
 * Batch: 40 items closing the last eight subtopics below the coverage
 * floor.
 *   percent_change_chains          D2 ×4, D3 ×2, D4 ×2   (rates_ratio_percent)
 *   abs_value_number_line_decimals D2 ×2, D3 ×2
 *   consecutive_evenly_spaced      D2 ×4, D3 ×2, D5 ×2
 *   divisibility_gcf_lcm           D3 ×4
 *   must_be_true_testing           D2 ×2
 *   parity_signs                   D2 ×4
 *   prime_factorization            D2 ×4
 *   remainders_units_digits        D2 ×2, D3 ×4
 * Trap language tracks each chapter's own gallery.
 * Run: node scripts/author/batch-vof-percent-fill.mjs   (APPEND=1 to write)
 */
import { choiceIndexForValue, verifyAndAppend } from "./harness.mjs";

const V = {
  format: "problem_solving",
  content_domain: "arithmetic",
  fundamental_skill: "value_order_factors",
};
const R = {
  format: "problem_solving",
  content_domain: "arithmetic",
  fundamental_skill: "rates_ratio_percent",
  subtopic: "percent_change_chains",
};

const items = [
  // ===================== percent_change_chains =====================
  {
    ...R,
    context: "real",
    difficulty: 2,
    stem_md:
      "The population of a town increased from $4{,}000$ to $4{,}600$. By what percent did the population increase?",
    choices: ["$13\\%$", "$15\\%$", "$60\\%$", "$85\\%$", "$115\\%$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nPercent change is the change over the *original* value: $\\frac{4600-4000}{4000} = \\frac{600}{4000} = 0.15 = 15\\%$.\n\n**Trigger cue**\n\n\"By what percent did it increase\": divide the change by the starting value, and report the change — not the factor.\n\n**Takeaway**\n\nPercent change divides by where you started.",
    fastest_path_md: "$\\frac{600}{4000} = \\frac{3}{20} = 15\\%$.",
    trap_map: {
      "0": "Divides the change by the new value, $\\frac{600}{4600}$.",
      "2": "Reports the change in hundreds as a percent.",
      "3": "Reports the original as a percent of the new value.",
      "4": "Reports the factor $1.15$ as a percent instead of the increase it represents.",
    },
    numeric_check: null,
    check(q) {
      const before = 4000;
      const after = 4600;
      return choiceIndexForValue(q.choices, ((after - before) / before) * 100);
    },
  },
  {
    ...R,
    context: "real",
    difficulty: 2,
    stem_md:
      "After a $25\\%$ increase, the price of a bicycle is $\\$350$. What was the price, in dollars, before the increase?",
    choices: ["$262.50$", "$280$", "$300$", "$325$", "$437.50$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe new price is $1.25$ times the old, so the old price is $\\frac{350}{1.25} = 280$. Undoing an increase means dividing by the factor, never subtracting the same percent.\n\n**Trigger cue**\n\n\"After a $p\\%$ increase the value is $y$; find the original\": divide by $1 + \\frac{p}{100}$.\n\n**Takeaway**\n\nUndo an increase by dividing, not by subtracting.",
    fastest_path_md: "$\\frac{350}{1.25} = 280$.",
    trap_map: {
      "0": "Subtracts $25\\%$ of the *new* price instead of dividing.",
      "2": "Rounds the division to a convenient figure without checking $1.25 \\times 300$.",
      "3": "Subtracts $25$ dollars rather than $25$ percent.",
      "4": "Multiplies by $1.25$ instead of dividing.",
    },
    numeric_check: "350/1.25",
    check() {
      let answer = null;
      for (let cents = 1; cents <= 100000; cents++) {
        const p = cents / 100;
        if (Math.abs(p * 1.25 - 350) < 1e-9) answer = p;
      }
      if (answer == null) throw new Error("no price");
      return { kind: "value", value: answer };
    },
  },
  {
    ...R,
    context: "pure",
    difficulty: 2,
    stem_md:
      "A quantity is increased by $30\\%$ and the result is then decreased by $30\\%$. The final quantity is what percent of the original?",
    choices: ["$91\\%$", "$94\\%$", "$100\\%$", "$106\\%$", "$109\\%$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nFactors multiply: $1.30 \\times 0.70 = 0.91$, so the final quantity is $91\\%$ of the original. The identity $(1+x)(1-x) = 1 - x^{2}$ gives $1 - 0.09$ directly.\n\n**Trigger cue**\n\nUp then down by the same percent: the answer is always $1 - x^{2}$, a net loss.\n\n**Takeaway**\n\nEqual up-and-down changes lose $x^{2}$ of the original.",
    fastest_path_md: "$1 - 0.30^{2} = 0.91$.",
    trap_map: {
      "1": "Subtracts $30\\%$ of $20\\%$, mixing the two changes.",
      "2": "Assumes the two equal percents cancel.",
      "3": "Applies the decrease to the original rather than to the increased value.",
      "4": "Adds the squared term instead of subtracting it.",
    },
    numeric_check: null,
    check(q) {
      let value = 100;
      value *= 1 + 0.3;
      value *= 1 - 0.3;
      return choiceIndexForValue(q.choices, value);
    },
  },
  {
    ...R,
    context: "real",
    difficulty: 2,
    stem_md:
      "A shirt priced at $\\$45$ is marked down by $20\\%$. What is the sale price, in dollars?",
    choices: ["$9$", "$25$", "$36$", "$43$", "$54$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nA $20\\%$ markdown leaves $80\\%$ of the price: $45 \\times 0.80 = 36$.\n\n**Trigger cue**\n\n\"Marked down by $p\\%$\": multiply by $1 - \\frac{p}{100}$ in one step rather than computing the discount and subtracting.\n\n**Takeaway**\n\nMultiply by what remains, not by what is removed.",
    fastest_path_md: "$45 - 9 = 36$.",
    trap_map: {
      "0": "Reports the discount rather than the sale price.",
      "1": "Subtracts $20$ dollars instead of $20$ percent.",
      "3": "Subtracts $2$, misplacing the decimal in the discount.",
      "4": "Adds the $20\\%$ instead of subtracting it.",
    },
    numeric_check: "45*0.8",
    check() {
      const price = 45;
      const discount = price * 0.2;
      return { kind: "value", value: price - discount };
    },
  },
  {
    ...R,
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $x$ is $25\\%$ greater than $y$, then $y$ is what percent less than $x$?",
    choices: ["$16\\%$", "$20\\%$", "$25\\%$", "$33\\%$", "$75\\%$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nSet $y = 100$; then $x = 125$. The question now anchors on $x$: $y$ falls short of $x$ by $25$, which is $\\frac{25}{125} = 20\\%$ of $x$.\n\n**Trigger cue**\n\n\"$x$ is $p\\%$ greater than $y$; $y$ is what percent less than $x$\": the base flips — compute $1 - \\frac{1}{1+p}$.\n\n**Takeaway**\n\nThe base is whatever follows \"than\"; flipping it changes the percent.",
    fastest_path_md: "$1 - \\frac{1}{1.25} = 1 - 0.8 = 20\\%$.",
    trap_map: {
      "0": "Divides the gap by a base of $150$, mixing the two quantities.",
      "2": "Reuses the given $25\\%$, ignoring that the base changed.",
      "3": "Inverts the wrong way, computing $\\frac{1}{1.25} - ...$ as a third.",
      "4": "Reports $y$ as a percent of $x$ minus the gap, confusing \"less than\" with \"percent of\".",
    },
    numeric_check: null,
    check(q) {
      const y = 100;
      const x = y * 1.25;
      return choiceIndexForValue(q.choices, ((x - y) / x) * 100);
    },
  },
  {
    ...R,
    context: "real",
    difficulty: 3,
    stem_md:
      "A stock rose $20\\%$ in the first quarter and then fell during the second quarter, ending the half-year $8\\%$ above where it started. By what percent did the stock fall in the second quarter?",
    choices: ["$8\\%$", "$10\\%$", "$12\\%$", "$14\\%$", "$28\\%$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe net factor is $1.08$ and the first factor is $1.20$, so the second factor is $\\frac{1.08}{1.20} = 0.90$ — a fall of $10\\%$.\n\n**Trigger cue**\n\n\"Rose, then fell, and ended $q\\%$ above the start\": divide the net factor by the known factor to isolate the unknown leg.\n\n**Takeaway**\n\nDivide the net factor by the leg you know.",
    fastest_path_md: "$\\frac{1.08}{1.20} = 0.9$, so a $10\\%$ fall.",
    trap_map: {
      "0": "Reports the net gain as the second-quarter fall.",
      "2": "Subtracts the net gain from the first-quarter rise, $20 - 8$.",
      "3": "Divides the point gap by the net factor rather than dividing the factors.",
      "4": "Adds the rise and the net gain.",
    },
    numeric_check: null,
    check(q) {
      let answer = null;
      for (let bp = 0; bp <= 10000; bp++) {
        const drop = bp / 10000;
        if (Math.abs(1.2 * (1 - drop) - 1.08) < 1e-9) answer = drop * 100;
      }
      if (answer == null) throw new Error("no drop");
      return choiceIndexForValue(q.choices, answer);
    },
  },
  {
    ...R,
    context: "real",
    difficulty: 4,
    stem_md:
      "A retailer's revenue fell $20\\%$ in one year. By what percent must the following year's revenue rise in order to return to the original level?",
    choices: ["$20\\%$", "$22\\%$", "$25\\%$", "$30\\%$", "$80\\%$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nAfter the fall the revenue is $0.80$ of the original, and the recovery factor must satisfy $0.80k = 1$, so $k = 1.25$ — a rise of $25\\%$. The recovery percent is always larger than the fall, because it acts on a smaller base.\n\n**Trigger cue**\n\n\"What percent gain restores the original\": take the reciprocal factor $\\frac{1}{1 - p}$ and subtract $1$.\n\n**Takeaway**\n\nRecovery is the reciprocal factor, never the same percent back.",
    fastest_path_md: "$\\frac{1}{0.8} = 1.25$, so $25\\%$.",
    trap_map: {
      "0": "Assumes the same percent back restores the original.",
      "1": "Averages the fall and the true recovery.",
      "3": "Overshoots by applying the reciprocal to the wrong base.",
      "4": "Reports the surviving fraction, $80\\%$, rather than the required gain.",
    },
    numeric_check: null,
    check(q) {
      let answer = null;
      for (let bp = 0; bp <= 20000; bp++) {
        const gain = bp / 10000;
        if (Math.abs(0.8 * (1 + gain) - 1) < 1e-9) answer = gain * 100;
      }
      if (answer == null) throw new Error("no gain");
      return choiceIndexForValue(q.choices, answer);
    },
  },
  {
    ...R,
    context: "real",
    difficulty: 4,
    stem_md:
      "A laptop's price is reduced by $k\\%$, and the reduced price is then reduced by a further $2k\\%$. If the final price is $72\\%$ of the original price and $k$ is a positive integer, what is the value of $k$?",
    choices: ["$5$", "$10$", "$15$", "$20$", "$28$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe two reductions multiply: $\\left(1 - \\frac{k}{100}\\right)\\left(1 - \\frac{2k}{100}\\right) = 0.72$. Rather than expanding, test the integer choices — $k = 10$ gives $0.90 \\times 0.80 = 0.72$ exactly. (Expanding confirms uniqueness: $k^{2} - 150k + 1400 = 0$ has roots $10$ and $140$, and $k = 140$ would make the second factor negative.)\n\n**Trigger cue**\n\n\"Reduced by $k\\%$ then by $2k\\%$\" with $k$ a positive integer: set the factor product equal to the target and test the answer choices rather than expanding.\n\n**Takeaway**\n\nTest the choices against the factor product; discard roots that make a factor negative.",
    fastest_path_md: "$0.9 \\times 0.8 = 0.72$, so $k = 10$.",
    trap_map: {
      "0": "Reports half of $k$.",
      "2": "Treats both reductions as $k$, solving $(1 - \\frac{k}{100})^{2} = 0.72$.",
      "3": "Reports the second reduction, $2k$, rather than $k$.",
      "4": "Reports the total percentage drop, $100 - 72$, instead of $k$.",
    },
    numeric_check: "10",
    check() {
      const hits = [];
      for (let k = 1; k <= 49; k++) {
        if (Math.abs((1 - k / 100) * (1 - (2 * k) / 100) - 0.72) < 1e-9) hits.push(k);
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ===================== abs_value_number_line_decimals =====================
  {
    ...V,
    subtopic: "abs_value_number_line_decimals",
    context: "pure",
    difficulty: 2,
    stem_md: "If $|x - 3| = 7$, what is the sum of all possible values of $x$?",
    choices: ["$-4$", "$3$", "$6$", "$10$", "$14$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite both branches immediately: $x - 3 = 7$ or $x - 3 = -7$, so $x = 10$ or $x = -4$. Their sum is $6$ — twice the anchor $3$, as symmetry guarantees.\n\n**Trigger cue**\n\nAn absolute value set equal to a number: write $a \\pm d$ before touching anything else.\n\n**Takeaway**\n\nSolutions of $|x-a| = d$ sum to $2a$.",
    fastest_path_md: "Symmetry about $3$: the sum is $2(3) = 6$.",
    trap_map: {
      "0": "Keeps only the negative branch.",
      "1": "Reports the anchor rather than the sum of the roots.",
      "3": "Keeps only the positive branch.",
      "4": "Adds the anchor and the distance, $3 + 7 + 4$-style arithmetic.",
    },
    numeric_check: "10 + (-4)",
    check() {
      let sum = 0;
      for (let x = -100; x <= 100; x++) if (Math.abs(x - 3) === 7) sum += x;
      return { kind: "value", value: sum };
    },
  },
  {
    ...V,
    subtopic: "abs_value_number_line_decimals",
    context: "pure",
    difficulty: 2,
    stem_md:
      "On the number line, what is the distance between $-4.6$ and $7.8$?",
    choices: ["$3.2$", "$4.6$", "$7.8$", "$12.4$", "$36$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nDistance is $|7.8 - (-4.6)| = |7.8 + 4.6| = 12.4$. The two points sit on opposite sides of zero, so their distances from zero add.\n\n**Trigger cue**\n\nA distance across zero: the magnitudes add — subtracting them answers a different question.\n\n**Takeaway**\n\nDistances on opposite sides of zero add.",
    fastest_path_md: "$4.6 + 7.8 = 12.4$.",
    trap_map: {
      "0": "Subtracts the magnitudes, $7.8 - 4.6$.",
      "1": "Reports one point's distance from zero.",
      "2": "Reports the other point's distance from zero.",
      "4": "Multiplies the two magnitudes.",
    },
    numeric_check: "7.8 - (-4.6)",
    check() {
      const a = -4.6;
      const b = 7.8;
      return { kind: "value", value: Math.round(Math.abs(b - a) * 1e9) / 1e9 };
    },
  },
  {
    ...V,
    subtopic: "abs_value_number_line_decimals",
    context: "pure",
    difficulty: 3,
    stem_md: "How many integers $n$ satisfy $|n - 5| < 4$?",
    choices: ["$6$", "$7$", "$8$", "$9$", "$10$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe inequality says $n$ is strictly within $4$ of $5$: $1 < n < 9$. The integers strictly between are $2$ through $8$, which is $8 - 2 + 1 = 7$ values. A strict inequality excludes both boundary values.\n\n**Trigger cue**\n\n\"How many integers satisfy $|n - a| < d$\": convert to the open interval $(a-d,\\, a+d)$, then count inclusively over the integers actually inside.\n\n**Takeaway**\n\nStrict inequality drops both endpoints.",
    fastest_path_md: "$1 < n < 9$ gives $n = 2 \\ldots 8$: seven integers.",
    trap_map: {
      "0": "Drops one interior integer as well as the two endpoints.",
      "2": "Includes one of the excluded endpoints.",
      "3": "Includes both endpoints, treating $<$ as $\\le$.",
      "4": "Counts the full span $2d + 2$.",
    },
    numeric_check: "7",
    check() {
      let count = 0;
      for (let n = -200; n <= 200; n++) if (Math.abs(n - 5) < 4) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...V,
    subtopic: "abs_value_number_line_decimals",
    context: "real",
    difficulty: 3,
    stem_md:
      "A machine part is acceptable if its length $\\ell$, in centimeters, satisfies $|\\ell - 12.5| \\le 0.04$. What is the difference, in centimeters, between the greatest and least acceptable lengths?",
    choices: ["$0.04$", "$0.05$", "$0.08$", "$0.4$", "$12.54$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe acceptable interval runs from $12.5 - 0.04 = 12.46$ to $12.5 + 0.04 = 12.54$. Its width is $2 \\times 0.04 = 0.08$ — twice the tolerance, because the tolerance is a radius.\n\n**Trigger cue**\n\nA tolerance written as $|x - c| \\le r$: the band's width is $2r$, not $r$.\n\n**Takeaway**\n\nTolerance is a radius; the band is twice as wide.",
    fastest_path_md: "$2 \\times 0.04 = 0.08$.",
    trap_map: {
      "0": "Reports the tolerance itself rather than the width of the band.",
      "1": "Uses a rounding radius of half a tenth instead of the stated tolerance.",
      "3": "Misplaces the decimal, reporting ten times the tolerance.",
      "4": "Reports the greatest acceptable length rather than the difference.",
    },
    numeric_check: "12.54 - 12.46",
    check() {
      let lo = null;
      let hi = null;
      for (let thousandths = 12000; thousandths <= 13000; thousandths++) {
        const len = thousandths / 1000;
        if (Math.abs(len - 12.5) <= 0.04 + 1e-12) {
          if (lo === null) lo = len;
          hi = len;
        }
      }
      return { kind: "value", value: Math.round((hi - lo) * 1e9) / 1e9 };
    },
  },

  // ===================== consecutive_evenly_spaced =====================
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 2,
    stem_md: "How many integers are there from $34$ through $128$, inclusive?",
    choices: ["$93$", "$94$", "$95$", "$96$", "$162$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nInclusive counts add one after the subtraction: $128 - 34 + 1 = 95$. The subtraction alone counts gaps, not terms.\n\n**Trigger cue**\n\n\"From $a$ through $b$, inclusive\": count $b - a + 1$.\n\n**Takeaway**\n\nSubtract for gaps; add one for terms.",
    fastest_path_md: "$128 - 34 + 1 = 95$.",
    trap_map: {
      "0": "Subtracts and then removes one more.",
      "1": "Counts gaps, $128 - 34$.",
      "3": "Adds two instead of one.",
      "4": "Adds the endpoints.",
    },
    numeric_check: "128 - 34 + 1",
    check() {
      let count = 0;
      for (let n = 34; n <= 128; n++) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 2,
    stem_md:
      "The sum of five consecutive integers is $145$. What is the least of the five integers?",
    choices: ["$25$", "$27$", "$29$", "$31$", "$33$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nWith an odd count, the mean equals the median: $\\frac{145}{5} = 29$ is the middle integer. The five run $27, 28, 29, 30, 31$, so the least is $27$.\n\n**Trigger cue**\n\nAn odd number of consecutive integers with a given sum: divide by the count to land directly on the middle term.\n\n**Takeaway**\n\nOdd count means the mean is the middle term.",
    fastest_path_md: "Middle $= \\frac{145}{5} = 29$; least $= 29 - 2 = 27$.",
    trap_map: {
      "0": "Steps four back from the middle instead of two.",
      "2": "Reports the middle integer.",
      "3": "Steps forward from the middle instead of back.",
      "4": "Reports the greatest of the five.",
    },
    numeric_check: "27",
    check() {
      for (let a = -500; a <= 500; a++) {
        let sum = 0;
        for (let k = 0; k < 5; k++) sum += a + k;
        if (sum === 145) return { kind: "value", value: a };
      }
      throw new Error("no run");
    },
  },
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If the least of six consecutive even integers is $18$, what is the greatest?",
    choices: ["$26$", "$28$", "$30$", "$32$", "$36$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe span of $n$ evenly spaced terms is $(n-1)d$, so with $n = 6$ and $d = 2$ the span is $10$. The greatest is $18 + 10 = 28$.\n\n**Trigger cue**\n\n\"$n$ consecutive even integers\": span $= (n-1) \\times 2$, one step fewer than the count.\n\n**Takeaway**\n\nSpan is one step short of the count times the gap.",
    fastest_path_md: "$18 + 2(5) = 28$.",
    trap_map: {
      "0": "Takes four steps instead of five.",
      "2": "Takes six steps, using $n$ rather than $n-1$.",
      "3": "Takes seven steps.",
      "4": "Adds $18$ to itself, treating the span as the least value.",
    },
    numeric_check: "18 + 10",
    check() {
      const run = [];
      for (let k = 0; k < 6; k++) run.push(18 + 2 * k);
      return { kind: "value", value: Math.max(...run) };
    },
  },
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 2,
    stem_md: "What is the sum of the integers from $-8$ through $12$, inclusive?",
    choices: ["$36$", "$42$", "$44$", "$54$", "$78$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe terms from $-8$ through $8$ cancel in pairs, leaving $9 + 10 + 11 + 12 = 42$. Alternatively, the count is $12 - (-8) + 1 = 21$ and the endpoint average is $\\frac{-8+12}{2} = 2$, so the sum is $21 \\times 2 = 42$.\n\n**Trigger cue**\n\nA consecutive run spanning zero: the symmetric part cancels — sum only the tail past the mirror point.\n\n**Takeaway**\n\nSymmetric terms cancel; sum what is left over.",
    fastest_path_md: "$-8$ through $8$ cancels; $9+10+11+12 = 42$.",
    trap_map: {
      "0": "Drops one term from the surviving tail.",
      "2": "Cancels $-8$ through $7$ only, leaving one term too many.",
      "3": "Uses $27$ terms, miscounting across zero.",
      "4": "Sums $1$ through $12$ and ignores the negative half entirely.",
    },
    numeric_check: "42",
    check() {
      let sum = 0;
      for (let n = -8; n <= 12; n++) sum += n;
      return { kind: "value", value: sum };
    },
  },
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 3,
    stem_md:
      "How many multiples of $7$ are there between $-20$ and $50$?",
    choices: ["$7$", "$9$", "$10$", "$11$", "$12$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nPin the first and last qualifying values: the least multiple of $7$ above $-20$ is $-14$, and the greatest below $50$ is $49$. The multiples run $-14, -7, 0, 7, \\ldots, 49$, which is $\\frac{49 - (-14)}{7} + 1 = 10$ values. Zero and the negatives are multiples too.\n\n**Trigger cue**\n\n\"How many multiples between\": find the first and last qualifying values explicitly, then count $\\frac{\\text{last}-\\text{first}}{d} + 1$.\n\n**Takeaway**\n\nZero and negatives are multiples; pin both ends first.",
    fastest_path_md: "$-14$ to $49$ in steps of $7$: $\\frac{63}{7} + 1 = 10$.",
    trap_map: {
      "0": "Counts only the positive multiples, $7$ through $49$.",
      "1": "Skips zero.",
      "3": "Includes $-21$, which lies outside the range.",
      "4": "Counts gaps and adds two, or includes both out-of-range neighbours.",
    },
    numeric_check: "10",
    check() {
      let count = 0;
      for (let n = -19; n <= 49; n++) if (n % 7 === 0) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 3,
    stem_md:
      "The sum of four consecutive integers is $158$. What is the greatest of the four?",
    choices: ["$38$", "$39$", "$40$", "$41$", "$42$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nAn even count of consecutive integers has a half-integer median, so do not divide by $4$ and expect a term. Writing them as $n, n+1, n+2, n+3$ gives $4n + 6 = 158$, so $n = 38$ and the greatest is $41$.\n\n**Trigger cue**\n\nAn even count of consecutive integers: check parity before dividing — the sum of $4$ consecutives is never a multiple of $4$.\n\n**Takeaway**\n\nEven counts have no middle term to land on.",
    fastest_path_md: "$4n + 6 = 158 \\Rightarrow n = 38$; greatest $= 41$.",
    trap_map: {
      "0": "Reports the least of the four.",
      "1": "Divides $158$ by $4$ and rounds down to a term.",
      "2": "Rounds the quotient up to a term.",
      "4": "Takes one step too many past the least value.",
    },
    numeric_check: "41",
    check() {
      for (let n = -500; n <= 500; n++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) sum += n + k;
        if (sum === 158) return { kind: "value", value: n + 3 };
      }
      throw new Error("no run");
    },
  },
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 5,
    stem_md:
      "The sum of $k$ consecutive positive integers is $75$, where $k > 1$. What is the greatest possible value of $k$?",
    choices: ["$3$", "$5$", "$6$", "$10$", "$15$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFor $k$ consecutive integers starting at $a$, the sum is $ka + \\frac{k(k-1)}{2} = 75$, so $k(2a + k - 1) = 150$. A larger $k$ forces a smaller start, and $a \\ge 1$ is what caps $k$. Test the divisors of $150$ downwards: $k = 15$ needs $2a + 14 = 10$, so $a = -2$ — illegal. $k = 10$ needs $2a + 9 = 15$, so $a = 3$, and indeed $3 + 4 + \\cdots + 12 = 75$. So the greatest legal $k$ is $10$.\n\n**Trigger cue**\n\n\"Sum of $k$ consecutive positive integers\": write $k(2a + k - 1) = 2S$ and walk the divisors of $2S$ downwards, discarding any that force $a$ below $1$.\n\n**Takeaway**\n\nThe positivity of the first term is what caps the run length.",
    fastest_path_md:
      "$k(2a+k-1) = 150$; $k = 10$ gives $a = 3$, while $k = 15$ would need $a = -2$.",
    trap_map: {
      "0": "Stops at a small divisor without pushing $k$ upward.",
      "1": "Takes the largest odd $k$ for which the mean is itself a term.",
      "2": "Stops one legal step short of the maximum.",
      "4": "Takes the largest divisor of $150$ below $25$ without checking that the first term stays positive.",
    },
    numeric_check: "10",
    check() {
      let best = 0;
      for (let a = 1; a <= 75; a++) {
        let sum = 0;
        for (let k = 1; a + k - 1 <= 75; k++) {
          sum += a + k - 1;
          if (sum === 75 && k > 1) best = Math.max(best, k);
          if (sum > 75) break;
        }
      }
      return { kind: "value", value: best };
    },
  },
  {
    ...V,
    subtopic: "consecutive_evenly_spaced",
    context: "pure",
    difficulty: 5,
    stem_md:
      "Set $S$ consists of $n$ consecutive even integers whose sum is $0$. If the greatest member of $S$ is $18$, what is the value of $n$?",
    choices: ["$9$", "$10$", "$17$", "$19$", "$20$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nA set of consecutive terms summing to $0$ must be symmetric about $0$, so it runs from $-18$ to $18$ in steps of $2$. The count is $\\frac{18 - (-18)}{2} + 1 = 19$. The count is odd because the symmetric set includes $0$ itself.\n\n**Trigger cue**\n\nEvenly spaced terms summing to zero: the set is symmetric about zero, so the endpoints are negatives of each other.\n\n**Takeaway**\n\nA zero sum forces symmetry about zero, centre included.",
    fastest_path_md: "$-18$ to $18$ by $2$: $\\frac{36}{2} + 1 = 19$.",
    trap_map: {
      "0": "Counts only the positive members.",
      "1": "Counts the positive members and zero.",
      "2": "Counts gaps rather than terms, $\\frac{36}{2} - 1$.",
      "4": "Adds one term too many, as if the count had to be even.",
    },
    numeric_check: "19",
    check() {
      const set = [];
      for (let n = -18; n <= 18; n += 2) set.push(n);
      if (set.reduce((a, b) => a + b, 0) !== 0) throw new Error("not zero-sum");
      if (Math.max(...set) !== 18) throw new Error("wrong greatest");
      return { kind: "value", value: set.length };
    },
  },

  // ===================== divisibility_gcf_lcm =====================
  {
    ...V,
    subtopic: "divisibility_gcf_lcm",
    context: "pure",
    difficulty: 3,
    stem_md:
      "What is the least positive integer that is divisible by each of $6$, $8$, and $15$?",
    choices: ["$30$", "$60$", "$120$", "$240$", "$720$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nTake the maximum power of each prime: $6 = 2 \\cdot 3$, $8 = 2^{3}$, $15 = 3 \\cdot 5$. The lcm is $2^{3} \\cdot 3 \\cdot 5 = 120$ — far below the raw product $720$.\n\n**Trigger cue**\n\n\"Divisible by each of…\": take the lcm prime by prime at the maximum exponent; multiply only when the numbers are pairwise coprime.\n\n**Takeaway**\n\nLCM takes each prime at its largest exponent.",
    fastest_path_md: "$2^{3}\\cdot 3\\cdot 5 = 120$.",
    trap_map: {
      "0": "Takes the lcm of $6$ and $15$ only.",
      "1": "Misses the third factor of $2$ that $8$ requires.",
      "3": "Doubles the lcm unnecessarily.",
      "4": "Multiplies all three numbers instead of taking the lcm.",
    },
    numeric_check: "120",
    check() {
      for (let n = 1; n <= 10000; n++) {
        if (n % 6 === 0 && n % 8 === 0 && n % 15 === 0) {
          return { kind: "value", value: n };
        }
      }
      throw new Error("none found");
    },
  },
  {
    ...V,
    subtopic: "divisibility_gcf_lcm",
    context: "pure",
    difficulty: 3,
    stem_md:
      "How many integers from $1$ through $200$, inclusive, are divisible by $4$ or by $6$?",
    choices: ["$50$", "$66$", "$67$", "$83$", "$116$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nCount each set and subtract the overlap once: multiples of $4$ number $50$, multiples of $6$ number $33$, and multiples of $\\mathrm{lcm}(4,6) = 12$ number $16$. So $50 + 33 - 16 = 67$.\n\n**Trigger cue**\n\n\"Divisible by $a$ or $b$\": count each, then subtract the multiples of the lcm exactly once.\n\n**Takeaway**\n\n\"Or\" subtracts the lcm's multiples once.",
    fastest_path_md: "$50 + 33 - 16 = 67$.",
    trap_map: {
      "0": "Counts only the multiples of $4$.",
      "1": "Subtracts the multiples of $24$ instead of $12$.",
      "3": "Subtracts the overlap twice, answering \"exactly one\".",
      "4": "Adds the two counts without subtracting the overlap at all.",
    },
    numeric_check: "50 + 33 - 16",
    check() {
      let count = 0;
      for (let n = 1; n <= 200; n++) if (n % 4 === 0 || n % 6 === 0) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...V,
    subtopic: "divisibility_gcf_lcm",
    context: "pure",
    difficulty: 3,
    stem_md:
      "What is the greatest common factor of $168$ and $252$?",
    choices: ["$12$", "$14$", "$28$", "$42$", "$84$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nFactor both: $168 = 2^{3}\\cdot 3\\cdot 7$ and $252 = 2^{2}\\cdot 3^{2}\\cdot 7$. Take each shared prime at its *smaller* exponent: $2^{2}\\cdot 3\\cdot 7 = 84$.\n\n**Trigger cue**\n\nA gcf of two concrete numbers: factor both and take minimum exponents — or subtract, since $252 - 168 = 84$ divides both.\n\n**Takeaway**\n\nGCF takes each shared prime at its smaller exponent.",
    fastest_path_md: "$252 - 168 = 84$, and $84$ divides both.",
    trap_map: {
      "0": "Drops the shared factor of $7$.",
      "1": "Uses $2 \\cdot 7$, dropping a factor of $2$ and the $3$.",
      "2": "Uses $2^{2}\\cdot 7$, dropping the shared $3$.",
      "3": "Uses $2 \\cdot 3 \\cdot 7$, taking only one factor of $2$.",
    },
    numeric_check: "84",
    check() {
      let best = 1;
      for (let d = 1; d <= 252; d++) if (168 % d === 0 && 252 % d === 0) best = d;
      return { kind: "value", value: best };
    },
  },
  {
    ...V,
    subtopic: "divisibility_gcf_lcm",
    context: "real",
    difficulty: 3,
    stem_md:
      "Two lighthouses flash at regular intervals: one every $18$ seconds and the other every $24$ seconds. They flash together at midnight. How many times during the next $12$ minutes do they flash together again?",
    choices: ["$6$", "$10$", "$12$", "$20$", "$40$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThey coincide every $\\mathrm{lcm}(18, 24) = 72$ seconds. Twelve minutes is $720$ seconds, so coincidences fall at $72, 144, \\ldots, 720$ — that is $\\frac{720}{72} = 10$ times after the midnight flash.\n\n**Trigger cue**\n\nTwo repeating cycles coinciding: the joint period is the lcm, not the product.\n\n**Takeaway**\n\nCoincidence period is the lcm of the two intervals.",
    fastest_path_md: "$\\mathrm{lcm}(18,24) = 72$; $\\frac{720}{72} = 10$.",
    trap_map: {
      "0": "Uses the gcf, $6$, in place of the lcm.",
      "2": "Divides the $720$ seconds by $60$, mixing units.",
      "3": "Uses a joint period of $36$ seconds.",
      "4": "Uses a joint period of $18$ seconds, ignoring the second lighthouse.",
    },
    numeric_check: "720/72",
    check() {
      let count = 0;
      for (let t = 1; t <= 12 * 60; t++) if (t % 18 === 0 && t % 24 === 0) count++;
      return { kind: "value", value: count };
    },
  },

  // ===================== must_be_true_testing =====================
  {
    ...V,
    subtopic: "must_be_true_testing",
    content_domain: "algebra",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $x$ is an integer and $x^{2}$ is even, which of the following must be true?",
    choices: [
      "$x$ is odd.",
      "$x$ is even.",
      "$x$ is positive.",
      "$x$ is divisible by $4$.",
      "$x = 0$.",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nAn odd integer squared is odd, so an even square forces an even root: $x$ must be even. The others fall to counterexamples — $x = -2$ kills \"positive\", $x = 2$ kills \"divisible by $4$\" and \"$x = 0$\", and $x = 2$ kills \"odd\".\n\n**Trigger cue**\n\n\"Must be true\": prove the survivor, then demolish each other choice with a single counterexample.\n\n**Takeaway**\n\nOne counterexample kills a \"must\"; one example proves only \"could\".",
    fastest_path_md: "Odd$^{2}$ is odd, so an even square needs an even $x$.",
    trap_map: {
      "0": "Inverts the parity rule.",
      "2": "Forgets that negative integers square to positives too.",
      "3": "Generalizes from $x = 4$ without testing $x = 2$.",
      "4": "Treats the only guaranteed case as the only possible one.",
    },
    numeric_check: null,
    check(q) {
      const claims = [
        (x) => Math.abs(x % 2) === 1,
        (x) => x % 2 === 0,
        (x) => x > 0,
        (x) => x % 4 === 0,
        (x) => x === 0,
      ];
      const survivors = [];
      claims.forEach((claim, i) => {
        let holds = true;
        for (let x = -400; x <= 400; x++) {
          if ((x * x) % 2 === 0 && !claim(x)) holds = false;
        }
        if (holds) survivors.push(i);
      });
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },
  {
    ...V,
    subtopic: "must_be_true_testing",
    content_domain: "algebra",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $ab > 0$, which of the following must be true?",
    choices: [
      "$a > 0$",
      "$a + b > 0$",
      "$a - b > 0$",
      "$\\dfrac{a}{b} > 0$",
      "$a > b$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$ab > 0$ means $a$ and $b$ are both nonzero and share a sign, which forces $\\frac{a}{b} > 0$. Every other choice falls to $a = b = -1$: the product is positive while $a < 0$, $a + b < 0$, and $a - b = 0$; and $a = 1, b = 2$ kills \"$a > b$\".\n\n**Trigger cue**\n\nA sign condition on a product: it fixes the *relationship* between the signs, never the individual signs.\n\n**Takeaway**\n\nA positive product means matching signs, not positive terms.",
    fastest_path_md: "Same sign $\\Rightarrow$ quotient positive; $a = b = -1$ kills the rest.",
    trap_map: {
      "0": "Reads a positive product as \"both factors positive\".",
      "1": "Assumes matching signs makes the sum positive.",
      "2": "Assumes an order between $a$ and $b$ that the condition never supplies.",
      "4": "Same error, in the other direction.",
    },
    numeric_check: null,
    check(q) {
      const claims = [
        (a, b) => a > 0,
        (a, b) => a + b > 0,
        (a, b) => a - b > 0,
        (a, b) => a / b > 0,
        (a, b) => a > b,
      ];
      const survivors = [];
      claims.forEach((claim, i) => {
        let holds = true;
        for (let ai = -60; ai <= 60; ai++)
          for (let bi = -60; bi <= 60; bi++) {
            const a = ai / 4;
            const b = bi / 4;
            if (a * b > 0 && !claim(a, b)) holds = false;
          }
        if (holds) survivors.push(i);
      });
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },

  // ===================== parity_signs =====================
  {
    ...V,
    subtopic: "parity_signs",
    content_domain: "algebra",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $m$ and $n$ are integers and $m$ is odd, which of the following must be an even integer?",
    choices: ["$m + n$", "$mn$", "$m + n^{2}$", "$3m + 1$", "$m^{2} + n$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$m$ odd makes $3m$ odd, and odd $+\\, 1$ is even — no information about $n$ is needed. Every other choice depends on $n$'s parity: with $n$ even, $m+n$, $m+n^{2}$, and $m^{2}+n$ are all odd, and $mn$ is even only when $n$ is.\n\n**Trigger cue**\n\n\"Must be even\" with one parity known: find the expression that never consults the unknown.\n\n**Takeaway**\n\nA \"must\" holds for every allowed value, not a convenient one.",
    fastest_path_md: "$3(\\text{odd}) = \\text{odd}$, and odd $+\\, 1$ is even.",
    trap_map: {
      "0": "Assumes $n$ is even, which the stem never says.",
      "1": "Assumes $n$ is even so the product is even.",
      "2": "Assumes $n^{2}$ is odd.",
      "4": "Assumes $n$ is odd so that odd $+$ odd is even.",
    },
    numeric_check: null,
    check(q) {
      const forms = [
        (m, n) => m + n,
        (m, n) => m * n,
        (m, n) => m + n * n,
        (m, n) => 3 * m + 1,
        (m, n) => m * m + n,
      ];
      const survivors = [];
      forms.forEach((f, i) => {
        let holds = true;
        for (let m = -41; m <= 41; m += 2)
          for (let n = -40; n <= 40; n++) {
            if (Math.abs(f(m, n) % 2) === 1) holds = false;
          }
        if (holds) survivors.push(i);
      });
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },
  {
    ...V,
    subtopic: "parity_signs",
    content_domain: "algebra",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $xyz < 0$ and $x > 0$, which of the following must be true?",
    choices: [
      "$y < 0$ and $z < 0$",
      "$y > 0$ and $z > 0$",
      "$yz < 0$",
      "$y + z < 0$",
      "$y + z > 0$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nDividing by the positive $x$ leaves $yz < 0$: $y$ and $z$ have opposite signs. That is all the condition gives. Choices A and B fix individual signs it never fixes, and both sum claims fail — $y = 5$, $z = -1$ makes the sum positive while $y = -5$, $z = 1$ makes it negative.\n\n**Trigger cue**\n\nA negative product with one sign known: divide out the known factor and read the sign condition on what remains.\n\n**Takeaway**\n\nA negative product fixes a sign relationship, not each sign.",
    fastest_path_md: "Divide by $x > 0$: $yz < 0$.",
    trap_map: {
      "0": "Reads \"negative product\" as \"all factors negative\".",
      "1": "Reverses the sign requirement entirely.",
      "3": "Assumes opposite signs force a negative sum.",
      "4": "Assumes opposite signs force a positive sum.",
    },
    numeric_check: null,
    check(q) {
      const claims = [
        (y, z) => y < 0 && z < 0,
        (y, z) => y > 0 && z > 0,
        (y, z) => y * z < 0,
        (y, z) => y + z < 0,
        (y, z) => y + z > 0,
      ];
      const survivors = [];
      claims.forEach((claim, i) => {
        let holds = true;
        for (let xi = 1; xi <= 20; xi++)
          for (let yi = -20; yi <= 20; yi++)
            for (let zi = -20; zi <= 20; zi++) {
              const x = xi / 2;
              const y = yi / 2;
              const z = zi / 2;
              if (x * y * z < 0 && !claim(y, z)) holds = false;
            }
        if (holds) survivors.push(i);
      });
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },
  {
    ...V,
    subtopic: "parity_signs",
    content_domain: "arithmetic",
    context: "pure",
    difficulty: 2,
    stem_md:
      "How many of the integers from $1$ through $30$, inclusive, are both even and not divisible by $3$?",
    choices: ["$5$", "$10$", "$12$", "$15$", "$20$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThere are $15$ even integers in the range. Of those, the ones divisible by $3$ are the multiples of $6$: $6, 12, 18, 24, 30$ — five of them. So $15 - 5 = 10$ qualify.\n\n**Trigger cue**\n\n\"Even and not divisible by $3$\": count the evens, then remove the multiples of $6$ — the overlap is the lcm.\n\n**Takeaway**\n\nThe overlap of two divisibility conditions is their lcm.",
    fastest_path_md: "$15$ evens minus $5$ multiples of $6$ is $10$.",
    trap_map: {
      "0": "Counts the multiples of $6$ that were removed.",
      "2": "Removes only the multiples of $12$.",
      "3": "Counts every even integer, forgetting the second condition.",
      "4": "Counts every integer not divisible by $3$ and halves nothing.",
    },
    numeric_check: "15 - 5",
    check() {
      let count = 0;
      for (let n = 1; n <= 30; n++) if (n % 2 === 0 && n % 3 !== 0) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...V,
    subtopic: "parity_signs",
    content_domain: "algebra",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $p$ and $q$ are integers with $p + q$ odd, which of the following must be odd?",
    choices: ["$p$", "$q$", "$pq$", "$p - q$", "$p^{2} + q^{2} + 1$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nAn odd sum means exactly one of $p$, $q$ is odd. Then $p - q$ is also odd, since subtraction preserves parity behaviour: odd $-$ even and even $-$ odd are both odd. The individual variables are not pinned down, $pq$ is even (one factor is even), and $p^{2}+q^{2}+1$ is odd $+$ even $+ 1$, which is even.\n\n**Trigger cue**\n\nA parity condition on a sum: it tells you the two terms differ in parity, never which is which.\n\n**Takeaway**\n\nAn odd sum means mismatched parities; the difference is odd too.",
    fastest_path_md: "One odd, one even $\\Rightarrow p - q$ is odd.",
    trap_map: {
      "0": "Fixes $p$ as the odd one, which the condition never determines.",
      "1": "Fixes $q$ as the odd one.",
      "2": "Forgets that one factor is even, making the product even.",
      "4": "Miscounts the parity of $p^{2}+q^{2}$, which is odd, so adding $1$ makes it even.",
    },
    numeric_check: null,
    check(q) {
      const forms = [
        (p, r) => p,
        (p, r) => r,
        (p, r) => p * r,
        (p, r) => p - r,
        (p, r) => p * p + r * r + 1,
      ];
      const survivors = [];
      forms.forEach((f, i) => {
        let holds = true;
        for (let p = -40; p <= 40; p++)
          for (let r = -40; r <= 40; r++) {
            if (Math.abs((p + r) % 2) !== 1) continue;
            if (Math.abs(f(p, r) % 2) !== 1) holds = false;
          }
        if (holds) survivors.push(i);
      });
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },

  // ===================== prime_factorization =====================
  {
    ...V,
    subtopic: "prime_factorization",
    context: "pure",
    difficulty: 2,
    stem_md: "How many positive divisors does $60$ have?",
    choices: ["$6$", "$8$", "$10$", "$12$", "$16$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$60 = 2^{2}\\cdot 3\\cdot 5$. Each exponent contributes $e_i + 1$ choices, including the choice of taking none: $(2+1)(1+1)(1+1) = 12$.\n\n**Trigger cue**\n\n\"How many divisors\": prime-factorize, add one to each exponent, multiply.\n\n**Takeaway**\n\nDivisor count multiplies the exponents *plus one*.",
    fastest_path_md: "$(2+1)(1+1)(1+1) = 12$.",
    trap_map: {
      "0": "Multiplies the exponents without adding one, $2 \\cdot 1 \\cdot 1$ scaled up.",
      "1": "Adds one to only two of the three exponents.",
      "2": "Counts only the divisors up to $\\sqrt{60}$ and doubles.",
      "4": "Adds two to each exponent.",
    },
    numeric_check: "12",
    check() {
      let count = 0;
      for (let d = 1; d <= 60; d++) if (60 % d === 0) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...V,
    subtopic: "prime_factorization",
    context: "pure",
    difficulty: 2,
    stem_md: "What is the greatest prime factor of $255$?",
    choices: ["$3$", "$5$", "$11$", "$17$", "$51$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nStart the factor tree at $2$ and work up: $255$ is odd, ends in $5$ so $255 = 5 \\times 51$, and $51 = 3 \\times 17$. So $255 = 3 \\cdot 5 \\cdot 17$ and the greatest prime factor is $17$.\n\n**Trigger cue**\n\n\"Greatest prime factor\": peel off small primes until what remains is prime — do not stop at a composite.\n\n**Takeaway**\n\nKeep factoring until every piece is prime.",
    fastest_path_md: "$255 = 5 \\cdot 51 = 5 \\cdot 3 \\cdot 17$.",
    trap_map: {
      "0": "Reports the smallest prime factor.",
      "1": "Stops at the first factor found.",
      "2": "Guesses a prime that does not divide $255$.",
      "4": "Stops at the composite factor $51$.",
    },
    numeric_check: "17",
    check() {
      let n = 255;
      let greatest = 1;
      for (let d = 2; d <= n; d++) {
        while (n % d === 0) {
          greatest = d;
          n /= d;
        }
      }
      return { kind: "value", value: greatest };
    },
  },
  {
    ...V,
    subtopic: "prime_factorization",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $n = 2^{4} \\cdot 3^{2} \\cdot 7$, which of the following is NOT a factor of $n$?",
    choices: ["$14$", "$24$", "$36$", "$56$", "$81$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nA factor may use each prime only up to its exponent in $n$. $81 = 3^{4}$ needs four $3$s, but $n$ supplies only two. The others fit: $14 = 2\\cdot 7$, $24 = 2^{3}\\cdot 3$, $36 = 2^{2}\\cdot 3^{2}$, $56 = 2^{3}\\cdot 7$.\n\n**Trigger cue**\n\n\"Which is NOT a factor\": factor each choice and compare exponents prime by prime against the given factorization.\n\n**Takeaway**\n\nA factor never needs more of a prime than the number has.",
    fastest_path_md: "$81 = 3^{4}$ but $n$ carries only $3^{2}$.",
    trap_map: {
      "0": "Assumes the presence of $7$ is unusual and rejects it.",
      "1": "Miscounts the available $2$s as fewer than three.",
      "2": "Miscounts the available $3$s when both primes appear.",
      "3": "Rejects a combination of $2^{3}$ and $7$ that $n$ does supply.",
    },
    numeric_check: null,
    check(q) {
      const n = 2 ** 4 * 3 ** 2 * 7;
      const values = [14, 24, 36, 56, 81];
      const nonFactors = values.flatMap((v, i) => (n % v === 0 ? [] : [i]));
      if (nonFactors.length !== 1) throw new Error(`non-factors: ${nonFactors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: nonFactors[0] };
    },
  },
  {
    ...V,
    subtopic: "prime_factorization",
    context: "pure",
    difficulty: 2,
    stem_md:
      "How many trailing zeros does $30!$ end in?",
    choices: ["$5$", "$6$", "$7$", "$8$", "$30$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nTrailing zeros come from factors of $10 = 2 \\cdot 5$, and $5$s are scarcer. Count them with the full sum: $\\left\\lfloor \\frac{30}{5} \\right\\rfloor + \\left\\lfloor \\frac{30}{25} \\right\\rfloor = 6 + 1 = 7$. The extra one comes from $25$, which contributes two $5$s.\n\n**Trigger cue**\n\n\"Trailing zeros of $n!$\": run $\\lfloor n/5 \\rfloor + \\lfloor n/25 \\rfloor + \\cdots$ — every multiple of $25$ counts twice.\n\n**Takeaway**\n\nCount fives with the full floor sum, not just once each.",
    fastest_path_md: "$6 + 1 = 7$.",
    trap_map: {
      "0": "Counts $\\left\\lfloor \\frac{30}{6} \\right\\rfloor$ rather than dividing by $5$.",
      "1": "Counts each multiple of $5$ once, missing the second $5$ inside $25$.",
      "3": "Adds an extra term for $125$, which contributes nothing below $30$.",
      "4": "Counts one zero per factor in the factorial.",
    },
    numeric_check: "7",
    check() {
      let value = 1n;
      for (let k = 2n; k <= 30n; k++) value *= k;
      let zeros = 0;
      while (value % 10n === 0n) {
        zeros++;
        value /= 10n;
      }
      return { kind: "value", value: zeros };
    },
  },

  // ===================== remainders_units_digits =====================
  {
    ...V,
    subtopic: "remainders_units_digits",
    context: "pure",
    difficulty: 2,
    stem_md: "What is the remainder when $437$ is divided by $8$?",
    choices: ["$1$", "$3$", "$5$", "$6$", "$7$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$8 \\times 54 = 432$, and $437 - 432 = 5$. Since $0 \\le 5 < 8$, the remainder is $5$.\n\n**Trigger cue**\n\nA plain remainder: find the largest multiple of the divisor at or below the number, then subtract.\n\n**Takeaway**\n\nThe remainder is what's left after the largest multiple fits.",
    fastest_path_md: "$432 = 8 \\cdot 54$; $437 - 432 = 5$.",
    trap_map: {
      "0": "Divides by $4$ instead of $8$.",
      "1": "Reports the shortfall to the next multiple, $8 - 5$.",
      "3": "Uses $8 \\times 53$ as the largest multiple that fits.",
      "4": "Uses $430$ as the largest multiple of $8$ below $437$.",
    },
    numeric_check: "437 - 432",
    check() {
      let n = 437;
      while (n >= 8) n -= 8;
      return { kind: "value", value: n };
    },
  },
  {
    ...V,
    subtopic: "remainders_units_digits",
    context: "pure",
    difficulty: 2,
    stem_md: "What is the units digit of $3^{24}$?",
    choices: ["$1$", "$3$", "$6$", "$7$", "$9$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nUnits digits of powers of $3$ cycle $3, 9, 7, 1$ with period $4$. Since $24$ is a multiple of $4$, the exponent lands at the *end* of the cycle — position $4$, not position $0$ — so the units digit is $1$.\n\n**Trigger cue**\n\nA units digit of a large power: build the cycle, then read $n \\bmod 4$, mapping a remainder of $0$ to the cycle's last position.\n\n**Takeaway**\n\nA remainder of zero means the end of the cycle, not the start.",
    fastest_path_md: "$3^{4} = 81$; $24$ is a multiple of $4$, so the digit is $1$.",
    trap_map: {
      "1": "Maps a remainder of $0$ to the first cycle position.",
      "2": "Uses a cycle drawn from powers of $6$.",
      "3": "Lands on the third cycle position.",
      "4": "Lands on the second cycle position.",
    },
    numeric_check: "1",
    check() {
      let value = 1n;
      for (let k = 0; k < 24; k++) value *= 3n;
      return { kind: "value", value: Number(value % 10n) };
    },
  },
  {
    ...V,
    subtopic: "remainders_units_digits",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $n$ leaves a remainder of $4$ when divided by $7$, what is the remainder when $3n + 2$ is divided by $7$?",
    choices: ["$0$", "$2$", "$4$", "$5$", "$6$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nSubstitute the remainder itself: $n \\equiv 4 \\pmod 7$, so $3n + 2 \\equiv 3(4) + 2 = 14 \\equiv 0 \\pmod 7$. No actual value of $n$ is needed.\n\n**Trigger cue**\n\nAn expression in $n$ with $n$'s remainder given: substitute the remainder and reduce — the answer never depends on which $n$ you pick.\n\n**Takeaway**\n\nSubstitute the remainder; reduce at the end.",
    fastest_path_md: "$3(4) + 2 = 14 \\equiv 0 \\pmod 7$.",
    trap_map: {
      "1": "Adds the remainder and the constant, $4 + 2$, then reduces.",
      "2": "Reports the original remainder unchanged.",
      "3": "Computes $3(4) + 2$ but reduces modulo $9$.",
      "4": "Computes $3 + 4 - 1$, mixing coefficient and remainder.",
    },
    numeric_check: "0",
    check() {
      const results = new Set();
      for (let n = 4; n <= 400; n += 7) results.add((3 * n + 2) % 7);
      if (results.size !== 1) throw new Error(`results: ${[...results]}`);
      return { kind: "value", value: [...results][0] };
    },
  },
  {
    ...V,
    subtopic: "remainders_units_digits",
    context: "pure",
    difficulty: 3,
    stem_md:
      "What is the units digit of $7^{35}$?",
    choices: ["$1$", "$3$", "$5$", "$7$", "$9$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nPowers of $7$ cycle $7, 9, 3, 1$ with period $4$. Since $35 = 4(8) + 3$, the exponent lands at position $3$ of the cycle, whose units digit is $3$.\n\n**Trigger cue**\n\nA units digit of a large power: build the four-term cycle, reduce the exponent mod $4$, and read the position.\n\n**Takeaway**\n\nReduce the exponent modulo the cycle length, then read the position.",
    fastest_path_md: "$35 \\equiv 3 \\pmod 4$; the third digit in $7,9,3,1$ is $3$.",
    trap_map: {
      "0": "Maps the remainder $3$ to the cycle's last position.",
      "2": "Assumes odd powers end in $5$.",
      "3": "Uses the base's own units digit, position $1$.",
      "4": "Lands on position $2$ of the cycle.",
    },
    numeric_check: "3",
    check() {
      let value = 1n;
      for (let k = 0; k < 35; k++) value *= 7n;
      return { kind: "value", value: Number(value % 10n) };
    },
  },
  {
    ...V,
    subtopic: "remainders_units_digits",
    context: "real",
    difficulty: 3,
    stem_md:
      "A conference begins on a Tuesday. If it runs for $100$ consecutive days, on what day of the week does the final day fall?",
    choices: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nDay $1$ is Tuesday, so day $k$ is $k - 1$ steps after Tuesday. Day $100$ is $99$ steps on, and $99 = 7(14) + 1$, so it is one day past Tuesday: Wednesday.\n\n**Trigger cue**\n\nA day-of-week question: count *steps*, $k - 1$, not days — day $8$ repeats day $1$'s weekday.\n\n**Takeaway**\n\nDay $k$ is $k-1$ steps from day one.",
    fastest_path_md: "$99 \\equiv 1 \\pmod 7$: one day past Tuesday.",
    trap_map: {
      "0": "Steps backwards from Tuesday.",
      "1": "Uses $100 \\equiv 2 \\pmod 7$ and then subtracts, landing back on the start.",
      "3": "Uses $100$ steps instead of $99$.",
      "4": "Uses $101$ steps.",
    },
    numeric_check: null,
    check(q) {
      const week = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      let index = week.indexOf("Tuesday");
      for (let day = 2; day <= 100; day++) index = (index + 1) % 7;
      const label = week[index];
      const hits = q.choices.flatMap((c, i) => (c === label ? [i] : []));
      if (hits.length !== 1) throw new Error(`"${label}" matched ${hits.length}`);
      return { kind: "index", index: hits[0] };
    },
  },
  {
    ...V,
    subtopic: "remainders_units_digits",
    context: "pure",
    difficulty: 3,
    stem_md:
      "When a positive integer $n$ is divided by $12$, the remainder is $7$. What is the remainder when $n$ is divided by $4$?",
    choices: ["$0$", "$1$", "$2$", "$3$", "$7$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$n = 12q + 7$. Since $4$ divides $12$, the $12q$ term contributes nothing, and $7 = 4(1) + 3$ leaves a remainder of $3$. This works only because $4$ divides $12$ — remainders do not transfer between unrelated moduli.\n\n**Trigger cue**\n\nA remainder asked for a divisor of the original modulus: reduce the known remainder by the new divisor.\n\n**Takeaway**\n\nA remainder passes down cleanly only to divisors of its modulus.",
    fastest_path_md: "$7 = 4 + 3$, so the remainder is $3$.",
    trap_map: {
      "0": "Assumes the smaller divisor divides $n$ exactly.",
      "1": "Divides the remainder $7$ by $4$ and reports the quotient.",
      "2": "Reduces $7$ modulo $5$.",
      "4": "Carries the remainder $7$ across unchanged, though $7 > 4$.",
    },
    numeric_check: "3",
    check() {
      const results = new Set();
      for (let n = 7; n <= 1200; n += 12) results.add(n % 4);
      if (results.size !== 1) throw new Error(`results: ${[...results]}`);
      return { kind: "value", value: [...results][0] };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
