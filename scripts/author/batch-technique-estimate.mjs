/**
 * Technique batch 1 — estimation and bounding.
 *
 * Classifying the shipped bank's fastest paths found 2 of 438 items whose
 * fastest route was estimation (0.5%). On a section with no calculator
 * and 2:08 a question, that is the single largest content gap against the
 * way TTP and GMAT Ninja teach: both spend real time on deciding how much
 * precision the answer choices actually demand, and Q86 had almost
 * nothing to practise it on.
 *
 * Twelve items, each one where computing exactly is a minute of work and
 * reading the spread of the choices settles it in fifteen seconds.
 *
 * WHAT "REACHABLE" MEANS FOR A "CLOSEST TO" ITEM. Elsewhere in the bank a
 * distractor is reachable when a named error computes it exactly. Here
 * the correct choice is itself a rounded value, so the standard is: the
 * named error produces a raw value that is *strictly nearest* to that
 * choice and to no other. `landsOn()` below enforces the strictness, so
 * rounding can never rescue a distractor the stated error does not reach.
 *
 * Run: node --experimental-strip-types scripts/author/batch-technique-estimate.mjs
 */
import {
  evaluateExpression,
  latexChoiceToExpression,
} from "../../lib/ai/verify.ts";
import { verifyAndAppend } from "./harness.mjs";

/** The five choices as numbers, in order. */
function values(q) {
  return q.choices.map((c) => {
    const expr = latexChoiceToExpression(c);
    const v = expr == null ? null : evaluateExpression(expr);
    if (v == null) throw new Error(`unparseable choice: ${c}`);
    return v;
  });
}

/** Index of the choice a value is strictly nearest to. Throws on a tie,
 *  so "closest to" is never ambiguous in a shipped item. */
function nearestIndex(value, vs) {
  let best = -1;
  let bestD = Infinity;
  let ties = 0;
  vs.forEach((c, i) => {
    const d = Math.abs(c - value);
    if (d < bestD - 1e-12) {
      best = i;
      bestD = d;
      ties = 1;
    } else if (Math.abs(d - bestD) <= 1e-12) {
      ties++;
    }
  });
  if (ties !== 1) throw new Error(`${value} is not strictly nearest one choice`);
  return best;
}

/** The choice value a raw erroneous result lands on. Asserts the error
 *  actually reaches the distractor it is claimed to explain. */
function landsOn(raw, vs, expectIndex) {
  const i = nearestIndex(raw, vs);
  if (i !== expectIndex) {
    throw new Error(
      `error value ${raw} lands on choice ${i} (${vs[i]}), not ${expectIndex} (${vs[expectIndex]})`,
    );
  }
  return vs[i];
}

/** Which interval choice a value satisfies, as the choice's own text.
 *  For bounding items whose choices are inequalities rather than numbers. */
function intervalChoice(q, value, tests) {
  const hits = tests.flatMap((t, i) => (t(value) ? [i] : []));
  if (hits.length !== 1) {
    throw new Error(`${value} satisfies ${hits.length} intervals, expected 1`);
  }
  return q.choices[hits[0]];
}

const items = [
  // ══ 1. magnitude first, digits second ═══════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 3,
    stem_md:
      "Which of the following is closest to $\\dfrac{6.03 \\times 10^{7}}{2.97 \\times 10^{4}}$?",
    choices: ["$20$", "$200$", "$2{,}000$", "$20{,}000$", "$200{,}000$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nSeparate the digits from the magnitude. The digits give $6.03/2.97 \\approx 2$, rounding one factor down and the other up so the errors partly cancel. The magnitude gives $10^{7}/10^{4} = 10^{3}$. So the value is about $2 \\times 10^{3} = 2{,}000$. The exact quotient is $2{,}030.3$, and every choice is a factor of ten from its neighbours, so one significant figure is more than enough.\n\n**Trigger cue**\n\"Closest to\" with choices a factor of ten apart — compute the power of ten separately from the leading digits, then match.\n\n**Takeaway**\nDigits and magnitude are two problems; solve them apart.",
    fastest_path_md:
      "Estimate: round to $\\dfrac{6 \\times 10^{7}}{3 \\times 10^{4}} = 2 \\times 10^{3}$. Only one choice is in the thousands, so no further arithmetic is needed.",
    trap_map: {
      "0": "Loses two powers of ten in the exponent subtraction, landing two orders of magnitude low.",
      "1": "Loses one power of ten — the most common estimation error on the exam is the exponent, not the digits.",
      "3": "Gains one power of ten by subtracting the exponents in the wrong direction on one factor.",
      "4": "Gains two powers of ten, the mirror image of the first trap.",
    },
    numeric_check: null,
    check(q) {
      const exact = (6.03 * 10 ** 7) / (2.97 * 10 ** 4);
      return { kind: "index", index: nearestIndex(exact, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      const exact = (6.03 * 10 ** 7) / (2.97 * 10 ** 4);
      return {
        "0": landsOn(exact / 100, vs, 0),
        "1": landsOn(exact / 10, vs, 1),
        "3": landsOn(exact * 10, vs, 3),
        "4": landsOn(exact * 100, vs, 4),
      };
    },
  },

  // ══ 2. percent of an awkward base ═══════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 3,
    stem_md:
      "A factory produced $8{,}412$ units last month, and $37\\%$ of them were shipped overseas. Which of the following is closest to the number of units shipped overseas?",
    choices: ["$2{,}100$", "$2{,}500$", "$3{,}100$", "$3{,}700$", "$5{,}300$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nBuild $37\\%$ out of pieces you can do in your head: $10\\%$ of $8{,}412$ is $841.2$, so $30\\%$ is $2{,}523.6$; $1\\%$ is $84.12$, so $7\\%$ is $588.8$. The total is $3{,}112.4$. The exact product $0.37 \\times 8{,}412 = 3{,}112.44$ confirms it, but the choices are $600$ apart, so the two-piece estimate already decides it.\n\n**Trigger cue**\nA percent that is not a benchmark fraction, applied to a four-digit base — decompose into $10\\%$ and $1\\%$ pieces rather than multiplying.\n\n**Takeaway**\nAny percent is a few tens plus a few ones.",
    fastest_path_md:
      "Estimate: $37\\%$ is a little more than a third, and a third of $8{,}400$ is $2{,}800$, so the answer is somewhat above $2{,}800$ — approximately $3{,}100$.",
    trap_map: {
      "0": "Rounds $37\\%$ down to the benchmark $\\tfrac14$, a $32\\%$ understatement of the rate.",
      "1": "Rounds $37\\%$ to one significant figure as $30\\%$ — too coarse for choices this close together.",
      "3": "Rounds the base up to $10{,}000$, so $37\\%$ reads straight off as $3{,}700$.",
      "4": "Answers with the $63\\%$ that stayed home rather than the $37\\%$ that shipped.",
    },
    numeric_check: null,
    check(q) {
      return { kind: "index", index: nearestIndex(0.37 * 8412, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      return {
        "0": landsOn(0.25 * 8412, vs, 0),
        "1": landsOn(0.3 * 8412, vs, 1),
        "3": landsOn(0.37 * 10000, vs, 3),
        "4": landsOn(0.63 * 8412, vs, 4),
      };
    },
  },

  // ══ 3. bounding a sum of unfriendly fractions ═══════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "If $x = \\dfrac{2}{7} + \\dfrac{3}{11} + \\dfrac{4}{13}$, which of the following must be true?",
    choices: [
      "$x < 0.5$",
      "$0.5 < x < 0.8$",
      "$0.8 < x < 0.95$",
      "$0.95 < x < 1.1$",
      "$x > 1.1$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe common denominator is $1{,}001$, and the question does not want a value — it wants an interval. Bound each term instead. Each of $\\tfrac27, \\tfrac{3}{11}, \\tfrac{4}{13}$ sits between $\\tfrac14$ and $\\tfrac13$: $\\tfrac27 = 0.2857$, $\\tfrac{3}{11} = 0.2727$, $\\tfrac{4}{13} = 0.3077$. So $3 \\times 0.25 < x < 3 \\times 0.3333$, giving $0.75 < x < 1$. That is not tight enough on its own, so sharpen the lower end: all three exceed $0.27$, and $3 \\times 0.27 = 0.81 > 0.8$. With $x < 1$ from the upper bound and $x > 0.81$ from the lower, only the third interval survives. The exact value is $0.8661$.\n\n**Trigger cue**\nA sum of fractions with an interval as the answer — bound each term between two friendly fractions instead of finding a common denominator.\n\n**Takeaway**\nAn interval answer wants bounds, never a value.",
    fastest_path_md:
      "Bound above and below: each term is between $\\tfrac14$ and $\\tfrac13$, so $x$ is roughly $0.75$ to $1$; a sharper lower bound of $3 \\times 0.27$ settles it at approximately $0.87$.",
    trap_map: {
      "0": "Adds the numerators and the denominators, giving $\\tfrac{9}{31} \\approx 0.29$ — the classic false rule for adding fractions.",
      "1": "Rounds all three terms down to $\\tfrac14$ and stops, taking a loose lower bound for the value itself.",
      "3": "Rounds all three terms up to $\\tfrac13$ and stops, taking a loose upper bound for the value itself.",
      "4": "Inverts each fraction, summing $\\tfrac72 + \\tfrac{11}{3} + \\tfrac{13}{4}$ instead.",
    },
    numeric_check: null,
    check(q) {
      const exact = 2 / 7 + 3 / 11 + 4 / 13;
      const tests = [
        (v) => v < 0.5,
        (v) => v > 0.5 && v < 0.8,
        (v) => v > 0.8 && v < 0.95,
        (v) => v > 0.95 && v < 1.1,
        (v) => v > 1.1,
      ];
      const text = intervalChoice(q, exact, tests);
      return { kind: "index", index: q.choices.indexOf(text) };
    },
    trap_values(q) {
      const tests = [
        (v) => v < 0.5,
        (v) => v > 0.5 && v < 0.8,
        (v) => v > 0.8 && v < 0.95,
        (v) => v > 0.95 && v < 1.1,
        (v) => v > 1.1,
      ];
      return {
        "0": intervalChoice(q, (2 + 3 + 4) / (7 + 11 + 13), tests),
        "1": intervalChoice(q, 3 * (1 / 4), tests),
        "3": intervalChoice(q, 3 * (1 / 3), tests),
        "4": intervalChoice(q, 7 / 2 + 11 / 3 + 13 / 4, tests),
      };
    },
  },

  // ══ 4. scaling a rate across an awkward interval ════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "A printer produces $2{,}340$ pages in $47$ minutes. Working at the same rate, which of the following is closest to the number of pages it produces in one hour?",
    choices: ["$1{,}800$", "$2{,}300$", "$3{,}000$", "$3{,}600$", "$4{,}700$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nOne hour is $60/47$ of the given interval, so the output is $2{,}340 \\times \\tfrac{60}{47} = 2{,}987.2$ pages. The choices are more than $600$ apart, so the shape of the scaling decides it before the arithmetic does: $60/47$ is a little under $1.3$, and $1.3 \\times 2{,}340 = 3{,}042$.\n\n**Trigger cue**\nA rate given over an interval that is not a round unit — scale by the ratio of the intervals and check the direction before computing.\n\n**Takeaway**\nMore time means more pages; check the direction first.",
    fastest_path_md:
      "Estimate: $47$ minutes is roughly $\\tfrac{3}{4}$ of an hour, so an hour is roughly $\\tfrac{4}{3}$ of $2{,}340 \\approx 3{,}100$ — close enough to pick the only choice near $3{,}000$.",
    trap_map: {
      "0": "Scales by $\\tfrac{47}{60}$ instead of $\\tfrac{60}{47}$, shrinking the output when more time should grow it.",
      "1": "Answers with the $47$-minute output, never scaling to the hour at all.",
      "3": "Rounds $47$ down to $40$ before dividing, and a $15\\%$ error in the denominator is a $15\\%$ error in the answer.",
      "4": "Treats the given interval as half an hour and simply doubles.",
    },
    numeric_check: null,
    check(q) {
      // Brute force: pages per minute, then a full hour of minutes.
      const perMinute = 2340 / 47;
      let total = 0;
      for (let m = 0; m < 60; m++) total += perMinute;
      return { kind: "index", index: nearestIndex(total, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      return {
        "0": landsOn((2340 * 47) / 60, vs, 0),
        "1": landsOn(2340, vs, 1),
        "3": landsOn((2340 * 60) / 40, vs, 3),
        "4": landsOn(2340 * 2, vs, 4),
      };
    },
  },

  // ══ 5. a markup and a discount that nearly cancel ═══════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "A retailer buys an item for $\\$68$, marks it up by $45\\%$, and later discounts the marked price by $30\\%$. Which of the following is closest to the final price?",
    choices: ["$\\$48$", "$\\$69$", "$\\$78$", "$\\$83$", "$\\$99$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nChained percents multiply: the net factor is $1.45 \\times 0.70 = 1.015$, so the final price is $68 \\times 1.015 = \\$69.02$. The useful observation is that a $45\\%$ rise followed by a $30\\%$ fall is almost exactly a wash — $1.45 \\times 0.7$ is just above $1$ — which places the answer within a couple of dollars of the original $\\$68$ without any multiplication at all.\n\n**Trigger cue**\nTwo chained percent moves in opposite directions — multiply the factors and read how far the product sits from $1$.\n\n**Takeaway**\nChained percents multiply; they never add.",
    fastest_path_md:
      "Estimate the net factor: $1.45 \\times 0.7 \\approx 1.02$, so the price barely moves from $\\$68$. Only one choice is anywhere near it.",
    trap_map: {
      "0": "Applies the $30\\%$ discount to the cost and forgets the markup entirely.",
      "2": "Adds the percents for a net $+15\\%$ instead of multiplying the factors.",
      "3": "Treats the percentages as dollar amounts: $68 + 45 - 30$.",
      "4": "Stops after the markup and never applies the discount.",
    },
    numeric_check: null,
    check(q) {
      const exact = 68 * (1 + 45 / 100) * (1 - 30 / 100);
      return { kind: "index", index: nearestIndex(exact, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      return {
        "0": landsOn(68 * 0.7, vs, 0),
        "2": landsOn(68 * 1.15, vs, 2),
        "3": landsOn(68 + 45 - 30, vs, 3),
        "4": landsOn(68 * 1.45, vs, 4),
      };
    },
  },

  // ══ 6. a ratio applied to an awkward part ═══════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "A dough recipe calls for flour and sugar in the ratio $11:4$ by weight. A baker uses $863$ grams of flour. Which of the following is closest to the weight of sugar required, in grams?",
    choices: ["$240$", "$315$", "$630$", "$1{,}190$", "$2{,}375$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe ratio is part-to-part, so sugar $= 863 \\times \\tfrac{4}{11} = 313.8$ grams. The check that costs nothing: sugar must be well under half the flour, since $4$ is well under half of $11$, and only one choice is between a quarter and a half of $863$.\n\n**Trigger cue**\nA two-part ratio with one part's actual amount given — multiply by the other part over *this* part, never over the total.\n\n**Takeaway**\nPart-to-part ratios never divide by the total.",
    fastest_path_md:
      "Estimate: $\\tfrac{4}{11}$ is roughly $0.36$, and $0.36 \\times 863$ is approximately $310$. The choices are far enough apart that no exact division is needed.",
    trap_map: {
      "0": "Divides by the $15$-part total instead of by the $11$ flour parts.",
      "2": "Treats $863$ as the whole mixture and answers with its flour share.",
      "3": "Scales $863$ up to the whole mixture, $\\tfrac{15}{11}$ of the flour, instead of down to the sugar.",
      "4": "Inverts the ratio, multiplying by $\\tfrac{11}{4}$ rather than $\\tfrac{4}{11}$.",
    },
    numeric_check: null,
    check(q) {
      // Brute force from the ratio definition: find the unit weight k such
      // that 11k is the flour, then read 4k.
      const k = 863 / 11;
      const sugar = 4 * k;
      return { kind: "index", index: nearestIndex(sugar, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      return {
        "0": landsOn((863 * 4) / 15, vs, 0),
        "2": landsOn((863 * 11) / 15, vs, 2),
        "3": landsOn((863 * 15) / 11, vs, 3),
        "4": landsOn((863 * 11) / 4, vs, 4),
      };
    },
  },

  // ══ 7. a weighted average that must sit on the heavy side ═══════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 4,
    stem_md:
      "A chemist mixes $340$ millilitres of a $12\\%$ acid solution with $610$ millilitres of a $27\\%$ acid solution. Which of the following is closest to the acid concentration of the mixture, as a percent?",
    choices: ["$12$", "$17.5$", "$19.5$", "$21.5$", "$27$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nTotal acid is $340(0.12) + 610(0.27) = 40.8 + 164.7 = 205.5$ millilitres in $950$ millilitres of solution, so the concentration is $205.5/950 = 21.63\\%$. Two bounds do most of the work: the answer must lie strictly between $12\\%$ and $27\\%$, and because there is more of the stronger solution it must lie above their midpoint of $19.5\\%$. That leaves one choice.\n\n**Trigger cue**\nTwo solutions of different strengths mixed in unequal amounts — bound the answer between the two strengths, then push it toward the larger volume.\n\n**Takeaway**\nA weighted average leans toward the heavier weight.",
    fastest_path_md:
      "Bound it: the answer is between $12$ and $27$, and roughly two-thirds of the volume is the strong solution, so it sits about two-thirds of the way up — approximately $22\\%$.",
    trap_map: {
      "0": "Answers with the weaker solution's concentration.",
      "1": "Weights each concentration by the *other* solution's volume.",
      "2": "Takes the plain average of $12$ and $27$, ignoring the unequal volumes.",
      "4": "Answers with the stronger solution's concentration.",
    },
    numeric_check: null,
    check(q) {
      const acid = 340 * 0.12 + 610 * 0.27;
      const pct = (acid / (340 + 610)) * 100;
      return { kind: "index", index: nearestIndex(pct, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      const swapped = ((610 * 0.12 + 340 * 0.27) / 950) * 100;
      return {
        "0": landsOn(12, vs, 0),
        "1": landsOn(swapped, vs, 1),
        "2": landsOn((12 + 27) / 2, vs, 2),
        "4": landsOn(27, vs, 4),
      };
    },
  },

  // ══ 8. the root of a number below one ═══════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 3,
    stem_md: "Which of the following is closest to $\\sqrt{0.0396}$?",
    choices: ["$0.002$", "$0.0199$", "$0.0396$", "$0.199$", "$1.99$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nWrite the radicand so the exponent is even: $0.0396 = 3.96 \\times 10^{-2}$, so $\\sqrt{0.0396} = \\sqrt{3.96} \\times 10^{-1} \\approx 1.99 \\times 0.1 = 0.199$. The structural check is the one worth carrying: for $0 < a < 1$, $\\sqrt{a} > a$, so the answer must be *larger* than $0.0396$, which kills three choices at a glance.\n\n**Trigger cue**\nA square root of a decimal below $1$ — the root is larger than the number, and the exponent must be made even before splitting it off.\n\n**Takeaway**\nBelow one, the square root grows the number.",
    fastest_path_md:
      "Estimate: $0.2^2 = 0.04$, which is just above $0.0396$, so the root is just below $0.2$. Approximately $0.199$.",
    trap_map: {
      "0": "Puts the decimal point two places wrong in the root, landing far below the radicand.",
      "1": "Halves the number instead of taking its square root.",
      "2": "Never takes the root at all, answering with the radicand.",
      "4": "Gets the digits right and the decimal point one place wrong.",
    },
    numeric_check: null,
    check(q) {
      // Brute force: bisect for the positive root rather than calling sqrt.
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        if (mid * mid < 0.0396) lo = mid;
        else hi = mid;
      }
      return { kind: "index", index: nearestIndex((lo + hi) / 2, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      const root = Math.sqrt(0.0396);
      return {
        "0": landsOn(root / 100, vs, 0),
        "1": landsOn(0.0396 / 2, vs, 1),
        "2": landsOn(0.0396, vs, 2),
        "4": landsOn(root * 10, vs, 4),
      };
    },
  },

  // ══ 9. a geometric sum that closes on a bound ═══════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 4,
    stem_md:
      "Which of the following is closest to $\\dfrac{1}{2} + \\dfrac{1}{4} + \\dfrac{1}{8} + \\cdots + \\dfrac{1}{512}$?",
    choices: ["$0.5$", "$0.75$", "$0.9$", "$1$", "$2$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nEach term is half the one before, and the running total after $\\tfrac{1}{2^n}$ is exactly $1 - \\tfrac{1}{2^n}$: $0.5$, then $0.75$, then $0.875$, and so on. The last term here is $\\tfrac{1}{512}$, so the sum is $1 - \\tfrac{1}{512} = 0.998$. No summation is needed once you see that the total is always one term short of $1$.\n\n**Trigger cue**\nEach term half the last, with a stated final term — the sum is $1$ minus that final term, and it never reaches $1$.\n\n**Takeaway**\nHalving sums close on one without arriving.",
    fastest_path_md:
      "Bound it on sight: the running total is always exactly one term short of $1$, so with a last term of $\\tfrac{1}{512}$ the sum is approximately $0.998$ — just under $1$.",
    trap_map: {
      "0": "Answers with the first term alone.",
      "1": "Stops after two terms.",
      "2": "Stops after four terms, at $0.9375$.",
      "4": "Starts the sum at $1$ rather than at $\\tfrac12$, doubling the total.",
    },
    numeric_check: null,
    check(q) {
      let sum = 0;
      for (let d = 2; d <= 512; d *= 2) sum += 1 / d;
      return { kind: "index", index: nearestIndex(sum, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      const partial = (terms) => {
        let s = 0;
        let d = 2;
        for (let i = 0; i < terms; i++) {
          s += 1 / d;
          d *= 2;
        }
        return s;
      };
      let full = 0;
      for (let d = 2; d <= 512; d *= 2) full += 1 / d;
      return {
        "0": landsOn(partial(1), vs, 0),
        "1": landsOn(partial(2), vs, 1),
        "2": landsOn(partial(4), vs, 2),
        "4": landsOn(1 + full, vs, 4),
      };
    },
  },

  // ══ 10. a combined average that bounding settles ════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 4,
    stem_md:
      "One class of $28$ students has an average score of $74.5$, and a second class of $17$ students has an average score of $61.2$. Which of the following is closest to the average score of all $45$ students?",
    choices: ["$61$", "$66$", "$67.9$", "$69.5$", "$74.5$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nTotal points are $28(74.5) + 17(61.2) = 2{,}086 + 1{,}040.4 = 3{,}126.4$ over $45$ students, so the combined average is $69.48$. Bounding gets there faster: the answer must lie strictly between $61.2$ and $74.5$, and because the larger class is the higher-scoring one it must sit *above* their midpoint of $67.85$. Only one choice does.\n\n**Trigger cue**\nTwo group averages with unequal group sizes — bound between the two averages, then lean toward the larger group.\n\n**Takeaway**\nThe combined average leans toward the bigger group.",
    fastest_path_md:
      "Bound rather than compute: the answer is between $61.2$ and $74.5$ and above their midpoint $67.85$, because the bigger class scored higher. Approximately $69.5$.",
    trap_map: {
      "0": "Answers with the smaller class's average.",
      "1": "Weights each average by the *other* class's size.",
      "2": "Takes the plain average of the two class averages, ignoring the sizes.",
      "4": "Answers with the larger class's average.",
    },
    numeric_check: null,
    check(q) {
      // Brute force over an explicit roster.
      const scores = [];
      for (let i = 0; i < 28; i++) scores.push(74.5);
      for (let i = 0; i < 17; i++) scores.push(61.2);
      const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
      return { kind: "index", index: nearestIndex(mean, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      return {
        "0": landsOn(61.2, vs, 0),
        "1": landsOn((17 * 74.5 + 28 * 61.2) / 45, vs, 1),
        "2": landsOn((74.5 + 61.2) / 2, vs, 2),
        "4": landsOn(74.5, vs, 4),
      };
    },
  },

  // ══ 11. a combination whose magnitude is the whole question ═════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "Which of the following is closest to the number of different groups of $3$ that can be chosen from $40$ distinct objects?",
    choices: ["$120$", "$1{,}600$", "$9{,}900$", "$59{,}300$", "$64{,}000$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nOrder does not matter, so the count is $\\binom{40}{3} = \\tfrac{40 \\times 39 \\times 38}{3 \\times 2 \\times 1} = \\tfrac{59{,}280}{6} = 9{,}880$. The choices span three orders of magnitude, so an estimate settles it: $\\tfrac{40^3}{6} \\approx 10{,}700$, and only one choice is anywhere near ten thousand.\n\n**Trigger cue**\n\"Groups\" or \"committees\" with no roles named — divide the ordered count by the factorial of the group size.\n\n**Takeaway**\nUnordered groups divide the ordered count by $k!$.",
    fastest_path_md:
      "Estimate: $\\tfrac{40 \\times 39 \\times 38}{6}$ is approximately $\\tfrac{64{,}000}{6} \\approx 10{,}000$. The choices are factors of six apart, so no exact multiplication is needed.",
    trap_map: {
      "0": "Multiplies the pool by the group size instead of counting selections.",
      "1": "Counts as though only two objects were being chosen with order irrelevant, using $40^2$.",
      "3": "Counts ordered arrangements and forgets to divide by $3! = 6$.",
      "4": "Counts ordered selections with repetition allowed, $40^3$.",
    },
    numeric_check: null,
    check(q) {
      // Brute force: enumerate every unordered triple from 40 labels.
      let n = 0;
      for (let a = 0; a < 40; a++)
        for (let b = a + 1; b < 40; b++) for (let c = b + 1; c < 40; c++) n++;
      return { kind: "index", index: nearestIndex(n, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      return {
        "0": landsOn(40 * 3, vs, 0),
        "1": landsOn(40 ** 2, vs, 1),
        "3": landsOn(40 * 39 * 38, vs, 3),
        "4": landsOn(40 ** 3, vs, 4),
      };
    },
  },

  // ══ 12. a probability the choices separate coarsely ═════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "A fair coin is flipped $10$ times. Which of the following is closest to the probability that exactly $5$ of the flips come up heads?",
    choices: ["$0.03$", "$0.1$", "$0.25$", "$0.5$", "$0.62$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThere are $2^{10} = 1{,}024$ equally likely sequences, and $\\binom{10}{5} = 252$ of them have exactly five heads, so the probability is $252/1{,}024 = 0.246$. The estimate that gets there without the division: $252$ is a little under a quarter of $1{,}024$, because a quarter of $1{,}024$ is $256$.\n\n**Trigger cue**\n\"Exactly $k$\" out of $n$ fair flips — count the favourable sequences with a combination over $2^n$ total.\n\n**Takeaway**\nExactly half is the likeliest count, not a likely one.",
    fastest_path_md:
      "Estimate: $\\binom{10}{5} = 252$ against $2^{10} = 1{,}024$, and $252$ is just under a quarter of $1{,}024$ — approximately $0.25$.",
    trap_map: {
      "0": "Answers with the probability of one particular sequence of five heads then five tails, $\\tfrac{1}{2^5} \\times \\tfrac{1}{2^5} \\times 32$.",
      "1": "Treats the eleven possible head-counts as equally likely, giving $\\tfrac{1}{11}$.",
      "3": "Reasons that half the flips are heads, so the answer is a half.",
      "4": "Answers \"at least $5$\" rather than \"exactly $5$\".",
    },
    numeric_check: null,
    check(q) {
      // Brute force: enumerate all 1024 sequences.
      let favourable = 0;
      for (let mask = 0; mask < 1024; mask++) {
        let heads = 0;
        for (let b = 0; b < 10; b++) if (mask & (1 << b)) heads++;
        if (heads === 5) favourable++;
      }
      return { kind: "index", index: nearestIndex(favourable / 1024, values(q)) };
    },
    trap_values(q) {
      const vs = values(q);
      let atLeast = 0;
      for (let mask = 0; mask < 1024; mask++) {
        let heads = 0;
        for (let b = 0; b < 10; b++) if (mask & (1 << b)) heads++;
        if (heads >= 5) atLeast++;
      }
      return {
        "0": landsOn(32 / 1024, vs, 0),
        "1": landsOn(1 / 11, vs, 1),
        "3": landsOn(0.5, vs, 3),
        "4": landsOn(atLeast / 1024, vs, 4),
      };
    },
  },
];

verifyAndAppend(items, { requireTrapValues: true });
