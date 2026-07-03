/**
 * Batch: 6 new questions for subtopic statistics_mean_median_sd.
 * Cells: D2 PS pure, D4 PS pure, D4 PS pure, D5 PS real, D3 PS real, D5 PS real.
 * Run from repo root: node scripts/author/batch-statistics_mean_median_sd.mjs
 * (dry run unless APPEND=1)
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ─────────────────────────────────────────────── 1. D2 PS pure
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 2,
    stem_md:
      "The average (arithmetic mean) of five numbers is $14$. Four of the numbers are $9$, $12$, $15$, and $18$. What is the fifth number?",
    choices: ["$2$", "$13.5$", "$14$", "$16$", "$34$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFive numbers with mean $14$ must total $5 \\times 14 = 70$. The four given numbers total $9 + 12 + 15 + 18 = 54$, so the fifth number is $70 - 54 = 16$.\n\n**Trigger cue**\nA mean with one missing value: convert the mean to a total, then subtract what is known.\n\n**Takeaway**\nA mean is just a total divided by the count.",
    fastest_path_md:
      "Target total $5 \\times 14 = 70$; the given four sum to $54$; $70 - 54 = 16$.",
    trap_map: {
      "0": "Uses a target total of $4 \\times 14 = 56$ (multiplying by the number of known values) before subtracting the four given numbers.",
      "1": "Averages the four given numbers ($54 / 4 = 13.5$) instead of solving for the fifth.",
      "2": "Assumes the fifth number must equal the mean itself.",
      "4": "Drops the $18$ from the known values and computes $70 - 36$.",
    },
    numeric_check: "5*14-(9+12+15+18)",
    check() {
      // brute force: scan candidate fifth values and keep those whose set has mean 14
      const given = [9, 12, 15, 18];
      const hits = [];
      for (let v = -400; v <= 400; v++) {
        const x = v / 2; // step 0.5
        const sum = given.reduce((a, b) => a + b, 0) + x;
        if (Math.abs(sum / 5 - 14) < 1e-12) hits.push(x);
      }
      if (hits.length !== 1) throw new Error(`expected unique fifth value, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ─────────────────────────────────────────────── 2. D4 PS pure
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 4,
    stem_md:
      "Five positive integers have a median of $10$ and an average (arithmetic mean) of $12$. What is the greatest possible value of the largest of the five integers?",
    choices: ["$30$", "$36$", "$38$", "$40$", "$48$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe five integers total $5 \\times 12 = 60$, and in sorted order the third integer is the median, $10$. To maximize the largest integer, minimize the other four subject to the order: the two smallest can each be $1$, the third must be $10$, and the fourth can be as small as the median, $10$. That leaves $60 - 1 - 1 - 10 - 10 = 38$ for the largest.\n\n**Trigger cue**\nMaximizing one member of a set with a fixed mean and median: pin the median, then push every other value to its floor.\n\n**Takeaway**\nTo maximize one value, minimize all the others legally.",
    fastest_path_md:
      "Floor everything else: $1, 1, 10, 10$ uses $22$ of the total $60$, so the maximum is $60 - 22 = 38$.",
    trap_map: {
      "0": "Sets the three smallest integers all equal to the median $10$ and computes $60 - 30$.",
      "1": "Assumes the five integers must be distinct, using $1, 2, 10, 11$ for the others.",
      "3": "Lets the two smallest values be $0$, forgetting the integers are positive.",
      "4": "Forgets the fourth integer must be at least the median, subtracting only $1 + 1 + 10$ from $60$.",
    },
    numeric_check: "60-1-1-10-10",
    check() {
      // brute force: enumerate all sorted 5-tuples of positive integers with
      // median 10 and sum 60; track the largest possible max element.
      let best = -Infinity;
      for (let a = 1; a <= 10; a++) {
        for (let b = a; b <= 10; b++) {
          const c = 10;
          for (let d = c; d <= 60; d++) {
            const e = 60 - a - b - c - d;
            if (e >= d) best = Math.max(best, e);
          }
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ─────────────────────────────────────────────── 3. D4 PS pure
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 4,
    stem_md:
      "A data set consists of measurements that are not all equal. Which of the following operations must leave the standard deviation of the data set unchanged?",
    choices: [
      "Increasing each measurement by $8$",
      "Increasing each measurement by $8\\%$",
      "Doubling each measurement and then decreasing each result by $8$",
      "Increasing the largest measurement by $8$ and decreasing the smallest measurement by $8$",
      "Increasing each measurement greater than the mean by $8$ and decreasing each measurement less than the mean by $8$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\nStandard deviation measures the gaps between values and their mean. Adding the same constant to every measurement slides the whole set — every gap, and hence the standard deviation, is unchanged. A percent increase scales every gap by $1.08$; doubling scales every gap by $2$, and the later $-8$ shift cannot undo that; moving the extremes outward, or moving every value away from the mean, widens the gaps. Only the uniform shift preserves the standard deviation.\n\n**Trigger cue**\nOperations on a whole data set: ask what happens to the gaps, not to the values.\n\n**Takeaway**\nShifts preserve standard deviation; scalings and spreadings change it.",
    fastest_path_md:
      "Standard deviation ignores location. A uniform $+8$ shift moves the set without stretching it — done, no computation.",
    trap_map: {
      "1": "Treats a uniform percent increase like a uniform shift; scaling stretches every gap and multiplies the standard deviation by $1.08$.",
      "2": "Assumes the $-8$ undoes the doubling; a constant shift cannot shrink the doubled spread.",
      "3": "Sees that the mean is unchanged and concludes the standard deviation is too; pushing the extremes outward increases spread.",
      "4": "Believes symmetric moves cancel; moving values away from the mean on both sides increases every deviation.",
    },
    numeric_check: null,
    check() {
      // simulate each operation on many random non-constant integer sets and
      // find which one preserves the standard deviation in every trial
      const sd = (xs) => {
        const m = xs.reduce((a, b) => a + b, 0) / xs.length;
        return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length);
      };
      const ops = [
        (xs) => xs.map((x) => x + 8),
        (xs) => xs.map((x) => x * 1.08),
        (xs) => xs.map((x) => 2 * x - 8),
        (xs) => {
          const ys = [...xs];
          ys[ys.indexOf(Math.max(...ys))] += 8;
          ys[ys.indexOf(Math.min(...ys))] -= 8;
          return ys;
        },
        (xs) => {
          const m = xs.reduce((a, b) => a + b, 0) / xs.length;
          return xs.map((x) => (x > m ? x + 8 : x < m ? x - 8 : x));
        },
      ];
      // seeded LCG so the check is deterministic
      let seed = 123456789;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      const preserved = ops.map(() => true);
      for (let t = 0; t < 500; t++) {
        const n = 3 + Math.floor(rand() * 6);
        const xs = Array.from({ length: n }, () => 1 + Math.floor(rand() * 50));
        if (new Set(xs).size === 1) xs[0] += 3; // enforce "not all equal"
        const base = sd(xs);
        ops.forEach((op, i) => {
          if (Math.abs(sd(op(xs)) - base) > 1e-9) preserved[i] = false;
        });
      }
      const winners = preserved.flatMap((p, i) => (p ? [i] : []));
      if (winners.length !== 1)
        throw new Error(`expected exactly one invariant operation, got ${winners}`);
      return { kind: "index", index: winners[0] };
    },
  },

  // ─────────────────────────────────────────────── 4. D5 PS real
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "Each of the $20$ students in a class took a placement test on which every score is an integer from $0$ to $100$, inclusive. The class mean was $73$, and no student scored below $60$. What is the greatest possible number of students who scored exactly $100$?",
    choices: ["$2$", "$6$", "$7$", "$9$", "$14$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe $20$ scores total $20 \\times 73 = 1460$. If every student scored the minimum $60$, the total would be $1200$, so there are $1460 - 1200 = 260$ surplus points to distribute. Each student raised from $60$ to $100$ consumes $40$ of the surplus, so at most $\\lfloor 260/40 \\rfloor = 6$ students can score $100$. Feasibility check: six $100$s leave $860$ points for $14$ students — thirteen at $60$ and one at $80$ works. Seven $100$s would leave $760$ for $13$ students, below the required minimum $13 \\times 60 = 780$.\n\n**Trigger cue**\nMaximizing a count under a fixed mean: set everyone else to the extreme allowed value and budget the surplus.\n\n**Takeaway**\nFix the total, floor the rest, divide the surplus.",
    fastest_path_md:
      "Surplus over an all-$60$ class: $1460 - 1200 = 260$. Each $100$-scorer costs $40$ of it: $\\lfloor 260/40 \\rfloor = 6$.",
    trap_map: {
      "0": "Divides the $260$-point surplus by $100$ instead of by the $40$-point gap between the floor and the maximum.",
      "2": "Rounds $260/40 = 6.5$ up to $7$, which would force the remaining students below the $60$ minimum.",
      "3": "Measures each top scorer's cost from the mean ($100 - 73 = 27$ points) rather than from the $60$ floor.",
      "4": "Ignores the $60$-point minimum entirely and computes $\\lfloor 1460/100 \\rfloor$.",
    },
    numeric_check: "floor((20*73-20*60)/(100-60))",
    check() {
      // brute force: for each count k of 100-scorers, try to construct an
      // explicit valid score assignment for the remaining students.
      const total = 20 * 73;
      let best = -1;
      for (let k = 0; k <= 20; k++) {
        const rest = 20 - k;
        let restSum = total - 100 * k;
        if (restSum < 0) continue;
        // greedy witness: start everyone at 60, pour surplus up to 100 each
        const scores = Array(rest).fill(60);
        let leftover = restSum - 60 * rest;
        if (leftover < 0) continue;
        for (let i = 0; i < rest && leftover > 0; i++) {
          const add = Math.min(40, leftover);
          scores[i] += add;
          leftover -= add;
        }
        if (leftover !== 0) continue; // can't fit under the 100 cap
        const full = [...Array(k).fill(100), ...scores];
        const ok =
          full.length === 20 &&
          full.every((s) => Number.isInteger(s) && s >= 60 && s <= 100) &&
          full.reduce((a, b) => a + b, 0) === total;
        if (ok) best = Math.max(best, k);
      }
      return { kind: "value", value: best };
    },
  },

  // ─────────────────────────────────────────────── 5. D3 PS real
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "A hiking club has $8$ members whose average (arithmetic mean) age is $32$ years. When one member leaves the club and a new member aged $20$ joins, the club again has $8$ members, and their average age is $30$ years. How old, in years, is the member who left?",
    choices: ["$16$", "$30$", "$32$", "$36$", "$52$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe original total of the ages is $8 \\times 32 = 256$. After the swap the total is $8 \\times 30 = 240$. If the departing member's age is $L$, then $256 - L + 20 = 240$, so $L = 256 + 20 - 240 = 36$.\n\n**Trigger cue**\nOne member swapped and the mean given before and after: work with the two totals, not the means.\n\n**Takeaway**\nMembership changes are bookkeeping on totals.",
    fastest_path_md:
      "Totals: before $256$, after $240$. The swap removed $L$ and added $20$, so $L = 256 + 20 - 240 = 36$.",
    trap_map: {
      "0": "Computes the drop in the total, $256 - 240 = 16$, but forgets to add back the newcomer's age.",
      "1": "Reports the new average age instead of the departing member's age.",
      "2": "Assumes the departing member was exactly the average age of the original club.",
      "4": "Adds the newcomer's age to the old mean ($32 + 20$) instead of balancing the totals.",
    },
    numeric_check: "8*32+20-8*30",
    check() {
      // brute force: try every plausible integer age for the leaver and keep
      // those for which the simulated new club has mean exactly 30
      const before = 8 * 32;
      const hits = [];
      for (let L = 0; L <= 150; L++) {
        const after = before - L + 20;
        if (after / 8 === 30) hits.push(L);
      }
      if (hits.length !== 1) throw new Error(`expected unique age, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ─────────────────────────────────────────────── 6. D5 PS real
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "A survey asked each of $50$ households how many cars it owns. Exactly $12$ households own no car, exactly $6$ own three cars, and each of the remaining households owns either one or two cars. If the median number of cars owned is $1$, what is the greatest possible number of households that own exactly two cars?",
    choices: ["$14$", "$18$", "$19$", "$25$", "$32$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nWith $50$ values, the median is the average of the $25$th and $26$th values in order. The $12$ zeros fill positions $1$ through $12$. For the median to equal $1$, both the $25$th and the $26$th values must be $1$ (no other pair averages to $1$ here, since only $12$ values are $0$). The one-car households occupy positions $13$ onward, so position $26$ is a $1$ only when there are at least $26 - 12 = 14$ one-car households. That leaves at most $50 - 12 - 6 - 14 = 18$ two-car households.\n\n**Trigger cue**\nA median over an even count with frequency groups: pin down BOTH middle positions before counting.\n\n**Takeaway**\nEven-count medians constrain two positions, not one.",
    fastest_path_md:
      "Median of $50$ values sits at positions $25$ and $26$; both must be $1$, so ones run through position $26$: at least $14$ ones, leaving $32 - 14 = 18$ twos.",
    trap_map: {
      "0": "Solves for the minimum number of one-car households and reports it instead of the maximum two-car count.",
      "2": "Covers only the $25$th position with a $1$ (using $13$ ones), forgetting the $26$th value must also be $1$; the median would be $1.5$.",
      "3": "Treats every household past the $25$th position as a two-car owner, forgetting the six three-car households.",
      "4": "Maximizes without the median condition, computing $50 - 12 - 6$.",
    },
    numeric_check: "50-12-6-14",
    check() {
      // brute force: enumerate every split of the 32 middle households into
      // one-car (a) and two-car (b) counts, build the full sorted list,
      // compute the median directly, and take the max b with median 1.
      let best = -1;
      for (let a = 0; a <= 32; a++) {
        const b = 32 - a;
        const list = [
          ...Array(12).fill(0),
          ...Array(a).fill(1),
          ...Array(b).fill(2),
          ...Array(6).fill(3),
        ].sort((x, y) => x - y);
        if (list.length !== 50) throw new Error("bad list length");
        const median = (list[24] + list[25]) / 2;
        if (median === 1) best = Math.max(best, b);
      }
      return { kind: "value", value: best };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
