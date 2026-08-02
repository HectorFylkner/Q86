/**
 * Foundation batch 2 of 4 — counting, series, probability, statistics.
 *
 * Same brief as batch 1 (see batch-foundation-rates.mjs): the foundation
 * tier draws a chapter's easiest band at the highest pass bar in the
 * ladder, and four chapters in this skill had fewer easy items than that
 * band holds.
 *
 * Every check here enumerates. A sequence question is answered by building
 * the sequence term by term, a probability question by listing the
 * marbles, a median by repeatedly stripping the extremes — never by the
 * closed form the written solution teaches. If the formula in the solution
 * is wrong, an enumeration disagrees with it; a check that reuses the
 * formula agrees with itself.
 *
 * Run: node --experimental-strip-types scripts/author/batch-foundation-counting.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ══ series_patterns — 3 items ═══════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 2,
    stem_md:
      "The first term of a sequence is $7$, and each term after the first is $4$ greater than the term immediately before it. What is the $12$th term of the sequence?",
    choices: ["$47$", "$48$", "$51$", "$55$", "$84$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nGetting from the $1$st term to the $12$th takes $11$ steps, not $12$: $7 + 11(4) = 7 + 44 = 51$.\n\n**Trigger cue**\nAny evenly spaced sequence: the number of *steps* is one less than the number of *terms*. Writing the first three terms out is the cheapest way to keep that straight.\n\n**Takeaway**\nSteps are one fewer than terms.",
    fastest_path_md:
      "$7 + 11 \\cdot 4 = 51$. Count the gaps between terms, not the terms.",
    trap_map: {
      "0": "Takes $10$ steps — off by one in the safe-feeling direction.",
      "1": "Multiplies $12 \\times 4$ and forgets the starting term entirely.",
      "3": "Takes $12$ steps, counting the first term as though it were a step.",
      "4": "Multiplies the first term by the term number instead of adding the common difference.",
    },
    numeric_check: "7+11*4",
    check() {
      let term = 7;
      for (let i = 1; i < 12; i++) term += 4;
      return { kind: "value", value: term };
    },
    trap_values() {
      let ten = 7;
      for (let i = 0; i < 10; i++) ten += 4;
      let twelve = 7;
      for (let i = 0; i < 12; i++) twelve += 4;
      return { "0": ten, "1": 12 * 4, "3": twelve, "4": 7 * 12 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 2,
    stem_md:
      "What is the sum of all the integers from $1$ to $40$, inclusive?",
    choices: ["$780$", "$800$", "$820$", "$861$", "$1{,}640$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nPair the ends: $1 + 40 = 41$, $2 + 39 = 41$, and so on for $20$ pairs, giving $20 \\times 41 = 820$.\n\n**Trigger cue**\nA consecutive run is evenly spaced, so sum $=$ average $\\times$ count. The average of an evenly spaced list is the average of its two ends: $(1 + 40)/2 = 20.5$, times $40$ terms.\n\n**Takeaway**\nSum equals the average of the ends times the count.",
    fastest_path_md:
      "$\\dfrac{40 \\cdot 41}{2} = 820$, or twenty pairs each summing to $41$.",
    trap_map: {
      "0": "Stops at $39$, dropping the last term.",
      "1": "Uses $\\dfrac{n \\cdot n}{2}$ — forgets the $+1$ in the pairing.",
      "3": "Runs to $41$, adding a term the range does not contain.",
      "4": "Computes $n(n+1)$ and never halves it.",
    },
    numeric_check: "40*41/2",
    check() {
      let sum = 0;
      for (let k = 1; k <= 40; k++) sum += k;
      return { kind: "value", value: sum };
    },
    trap_values() {
      let to39 = 0;
      for (let k = 1; k <= 39; k++) to39 += k;
      let to41 = 0;
      for (let k = 1; k <= 41; k++) to41 += k;
      return { "0": to39, "1": (40 * 40) / 2, "3": to41, "4": 40 * 41 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 3,
    stem_md:
      "A sequence begins $2, 5, 8, 11, \\ldots$, and each term after the first is $3$ greater than the term before it. How many terms of the sequence are less than $100$?",
    choices: ["$32$", "$33$", "$34$", "$49$", "$98$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe terms are $2 + 3k$ for $k = 0, 1, 2, \\ldots$, and $2 + 3k < 100$ gives $k < 32.67$, so $k$ runs from $0$ to $32$ — that is $33$ values. The last qualifying term is $2 + 96 = 98$.\n\n**Trigger cue**\n\"How many terms\" on an evenly spaced list: find the last one that qualifies, then count with $\\dfrac{\\text{last} - \\text{first}}{\\text{difference}} + 1$. The $+1$ is the term the subtraction drops.\n\n**Takeaway**\nCount evenly spaced terms with divide-then-add-one.",
    fastest_path_md:
      "Last term under $100$ is $98$. Then $(98 - 2)/3 + 1 = 32 + 1 = 33$.",
    trap_map: {
      "0": "Counts the steps from $2$ to $98$ and forgets to add the first term back.",
      "2": "Counts $101$ as though it were under $100$.",
      "3": "Reads the common difference as $2$ and counts $2, 4, \\ldots, 98$.",
      "4": "Reports the largest qualifying term rather than how many terms there are.",
    },
    numeric_check: "(98-2)/3+1",
    check() {
      let count = 0;
      for (let term = 2; term < 100; term += 3) count++;
      return { kind: "value", value: count };
    },
    trap_values() {
      let steps = 0;
      for (let term = 2 + 3; term < 100; term += 3) steps++;
      let withExtra = 0;
      for (let term = 2; term <= 101; term += 3) withExtra++;
      let byTwo = 0;
      for (let term = 2; term < 100; term += 2) byTwo++;
      let last = 2;
      while (last + 3 < 100) last += 3;
      return { "0": steps, "2": withExtra, "3": byTwo, "4": last };
    },
  },

  // ══ statistics_mean_median_sd — 2 items ═════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 2,
    stem_md:
      "What is the median of the list $2,\\ 7,\\ 11,\\ 4,\\ 20,\\ 10$?",
    choices: ["$7$", "$8.5$", "$9$", "$10$", "$18$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nSort first: $2, 4, 7, 10, 11, 20$. With an even count there is no single middle, so the median is the average of the two middle values: $(7 + 10)/2 = 8.5$.\n\n**Trigger cue**\nMedian always means *sort first*. An even-length list has two middle values and the median is their average — which is often a value not in the list at all.\n\n**Takeaway**\nSort, then average the two middles when the count is even.",
    fastest_path_md:
      "Sorted: $2, 4, \\mathbf{7}, \\mathbf{10}, 11, 20$. Median $= (7 + 10)/2 = 8.5$.",
    trap_map: {
      "0": "Takes the lower of the two middle values instead of averaging them.",
      "2": "Reports the mean ($54/6 = 9$) rather than the median.",
      "3": "Takes the upper of the two middle values.",
      "4": "Reports the range, $20 - 2$.",
    },
    numeric_check: "(7+10)/2",
    check() {
      // Strip the extremes in pairs until the middle is all that is left.
      let rest = [2, 7, 11, 4, 20, 10];
      while (rest.length > 2) {
        const lo = Math.min(...rest);
        const hi = Math.max(...rest);
        rest.splice(rest.indexOf(lo), 1);
        rest.splice(rest.indexOf(hi), 1);
      }
      return { kind: "value", value: (rest[0] + rest[1]) / 2 };
    },
    trap_values() {
      const sorted = [2, 7, 11, 4, 20, 10].sort((a, b) => a - b);
      let sum = 0;
      for (const v of sorted) sum += v;
      return {
        "0": sorted[2],
        "2": sum / sorted.length,
        "3": sorted[3],
        "4": sorted[sorted.length - 1] - sorted[0],
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "The average (arithmetic mean) of $5$ numbers is $14$. Four of the numbers are $8$, $11$, $16$ and $20$. What is the fifth number?",
    choices: ["$13.75$", "$14$", "$15$", "$55$", "$70$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nAn average of $14$ over $5$ numbers means the total is $5 \\times 14 = 70$. The four given numbers sum to $55$, so the fifth is $70 - 55 = 15$.\n\n**Trigger cue**\nAn average with one value missing is a subtraction problem in disguise: convert the average into a total, subtract what you have, and the remainder is the missing value.\n\n**Takeaway**\nAverage times count is a total you can subtract from.",
    fastest_path_md:
      "Total $= 5(14) = 70$; given $= 55$; missing $= 15$.",
    trap_map: {
      "0": "Averages the four given numbers instead of using the stated average of five.",
      "1": "Reports the average itself, as though the missing value had to equal it.",
      "3": "Reports the sum of the four given numbers.",
      "4": "Reports the total of all five.",
    },
    numeric_check: "5*14-(8+11+16+20)",
    check() {
      // Search hundredths for the value that makes the mean exactly 14.
      const given = [8, 11, 16, 20];
      const found = [];
      for (let x = -10000; x <= 10000; x++) {
        let sum = x;
        for (const g of given) sum += g * 100;
        if (sum === 5 * 14 * 100) found.push(x / 100);
      }
      if (found.length !== 1) throw new Error(`${found.length} values work`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      const given = [8, 11, 16, 20];
      let sum = 0;
      for (const g of given) sum += g;
      return { "0": sum / given.length, "1": 14, "3": sum, "4": 5 * 14 };
    },
  },

  // ══ combinatorics — 1 item ══════════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 2,
    stem_md:
      "A restaurant offers $4$ appetizers and $6$ main courses. How many different meals consisting of exactly one appetizer and one main course are possible?",
    choices: ["$10$", "$24$", "$45$", "$90$", "$720$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nEvery appetizer can pair with every main course, so the choices multiply: $4 \\times 6 = 24$.\n\n**Trigger cue**\n\"One of each\" is the fundamental counting principle — independent slots multiply. \"How many ways to choose $2$ from a pool\" is a combination and looks nothing like this, even though the words are similar.\n\n**Takeaway**\nOne from each list means multiply the list sizes.",
    fastest_path_md:
      "$4 \\cdot 6 = 24$. Two independent slots, so multiply.",
    trap_map: {
      "0": "Adds the two menus instead of multiplying them.",
      "2": "Treats the meal as choosing any $2$ items from all $10$: $\\binom{10}{2} = 45$, which allows two appetizers.",
      "3": "Counts ordered pairs from all $10$ items: $10 \\times 9$.",
      "4": "Reaches for a factorial, $6!$, when nothing is being arranged.",
    },
    numeric_check: "4*6",
    check() {
      let meals = 0;
      for (let a = 0; a < 4; a++) {
        for (let m = 0; m < 6; m++) meals++;
      }
      return { kind: "value", value: meals };
    },
    trap_values() {
      let pairsOfTen = 0;
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) pairsOfTen++;
      }
      let factorial = 1;
      for (let k = 2; k <= 6; k++) factorial *= k;
      return { "0": 4 + 6, "2": pairsOfTen, "3": 10 * 9, "4": factorial };
    },
  },

  // ══ probability — 1 item ════════════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 2,
    stem_md:
      "A bag contains $4$ red marbles, $5$ green marbles and $3$ blue marbles. One marble is drawn at random. What is the probability that the marble drawn is **not** green?",
    choices: [
      "$\\dfrac{1}{4}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{5}{12}$",
      "$\\dfrac{7}{12}$",
      "$\\dfrac{7}{11}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThere are $4 + 5 + 3 = 12$ marbles, of which $4 + 3 = 7$ are not green, so the probability is $7/12$. Equivalently $1 - 5/12 = 7/12$.\n\n**Trigger cue**\n\"Not\" is a complement: it is every outcome except one category, so the denominator does not change. Subtracting from $1$ is usually faster than adding the surviving categories.\n\n**Takeaway**\nA complement changes the numerator, never the denominator.",
    fastest_path_md:
      "$1 - \\dfrac{5}{12} = \\dfrac{7}{12}$.",
    trap_map: {
      "0": "Counts only the blue marbles, $3/12$, reading \"not green\" as one specific other colour.",
      "1": "Counts only the red marbles, $4/12$.",
      "2": "Gives the probability that the marble *is* green — the complement never taken.",
      "4": "Removes the drawn marble from the total, using $7/11$. Nothing has been drawn yet, so the total is still $12$.",
    },
    numeric_check: "7/12",
    check() {
      const bag = [];
      for (let i = 0; i < 4; i++) bag.push("red");
      for (let i = 0; i < 5; i++) bag.push("green");
      for (let i = 0; i < 3; i++) bag.push("blue");
      let notGreen = 0;
      for (const m of bag) if (m !== "green") notGreen++;
      return { kind: "value", value: notGreen / bag.length };
    },
    trap_values() {
      return { "0": 3 / 12, "1": 4 / 12, "2": 5 / 12, "4": 7 / 11 };
    },
  },
];

verifyAndAppend(items, { requireTrapValues: true });
