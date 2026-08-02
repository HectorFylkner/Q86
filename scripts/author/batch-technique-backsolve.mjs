/**
 * Technique batch 2 — backsolving.
 *
 * The bank had 18 of 438 items (4.1%) whose fastest path works backwards
 * from the answer choices. Backsolving has the shortest distance between
 * "I recognize this" and "I have the answer", and it is the technique most
 * often lost to the reflex of reaching for algebra — so a bank that barely
 * practises it teaches that reflex by omission.
 *
 * Twelve items chosen so the check is cheap and the algebra is not: word
 * problems with one unknown, the over/under template with a shared hidden
 * quantity, and integer constraints that make the five choices the
 * complete candidate list. In nine of the twelve the answer is the middle
 * choice, so the chapter's "start in the middle" rule finishes the
 * question in a single substitution.
 *
 * Every item is verified twice over: `check()` brute-forces the answer
 * from the stem's raw data without reference to the written solution, and
 * `trap_values()` recomputes each distractor by committing the specific
 * error named in its trap_map entry.
 *
 * Run: node --experimental-strip-types scripts/author/batch-technique-backsolve.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

/** Smallest n > lower satisfying every predicate. Used by the traps that
 *  are themselves searches under a misread condition. */
function leastAbove(lower, ...conditions) {
  for (let n = lower + 1; n <= lower + 100000; n++) {
    if (conditions.every((c) => c(n))) return n;
  }
  throw new Error("no candidate found");
}

const items = [
  // ══ 1. two prices, one total ════════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 3,
    stem_md:
      "A theatre charges $\\$13$ for an adult ticket and $\\$8$ for a child ticket. On Friday it sold $74$ tickets and collected $\\$797$. How many adult tickets did it sell?",
    choices: ["$33$", "$38$", "$41$", "$61$", "$99$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $a$ be the adult tickets, so $74 - a$ are child tickets: $13a + 8(74 - a) = 797$. Expanding, $13a + 592 - 8a = 797$, so $5a = 205$ and $a = 41$. Check: $41(13) = 533$, $33(8) = 264$, and $533 + 264 = 797$.\n\n**Trigger cue**\nTwo prices, a total count and a total value, with one count requested — one equation in one unknown, or one substitution from the choices.\n\n**Takeaway**\nOne unknown and two totals is a single equation.",
    fastest_path_md:
      "Backsolve: start at the middle choice, $41$ adults and therefore $33$ children. $41(13) + 33(8) = 533 + 264 = 797$, the stated total, so it is the answer on the first test.",
    trap_map: {
      "0": "Solves correctly and answers with the child count instead of the adult count.",
      "1": "Divides the takings by the sum of the two prices, as though every sale were one adult and one child.",
      "3": "Assumes every ticket was an adult ticket and divides the takings by $\\$13$.",
      "4": "Assumes every ticket was a child ticket and divides the takings by $\\$8$.",
    },
    numeric_check: "(797 - 8*74)/(13 - 8)",
    check() {
      const found = [];
      for (let a = 0; a <= 74; a++) {
        if (13 * a + 8 * (74 - a) === 797) found.push(a);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 74 - 41,
        "1": Math.round(797 / (13 + 8)),
        "3": Math.floor(797 / 13),
        "4": Math.floor(797 / 8),
      };
    },
  },

  // ══ 2. the over/under template ══════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "algebraic_translation",
    difficulty: 4,
    stem_md:
      "Identical crates are loaded onto a truck. If each crate weighs $34$ kilograms, the load is $88$ kilograms over the truck's limit. If each crate weighs $27$ kilograms instead, the load is $24$ kilograms under the limit. How many crates are there?",
    choices: ["$9$", "$13$", "$16$", "$19$", "$24$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe limit is the same in both sentences, so write it twice and set the expressions equal: $34n - 88 = 27n + 24$, giving $7n = 112$ and $n = 16$. The limit is then $34(16) - 88 = 456$, and $27(16) + 24 = 456$ confirms it.\n\n**Trigger cue**\nTwo scenarios pinned to the same unstated quantity, one over and one under — set the two expressions for that quantity equal.\n\n**Takeaway**\nThe shared hidden quantity is the equation.",
    fastest_path_md:
      "Backsolve: test the middle choice, $n = 16$. The heavy load implies a limit of $34(16) - 88 = 456$ and the light load implies $27(16) + 24 = 456$. They agree, so $16$ satisfies both sentences at once.",
    trap_map: {
      "0": "Subtracts the two deviations instead of adding them, dividing $88 - 24$ by the $7$-kilogram gap.",
      "1": "Uses only the over-limit figure, dividing $88$ by the $7$-kilogram gap.",
      "3": "Reads the per-crate weight gap as $6$ rather than $7$ kilograms.",
      "4": "Answers with the $24$ kilograms of slack rather than with the crate count.",
    },
    numeric_check: "(88 + 24)/(34 - 27)",
    check() {
      const found = [];
      for (let n = 1; n <= 500; n++) {
        if (34 * n - 88 === 27 * n + 24) found.push(n);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": Math.round((88 - 24) / (34 - 27)),
        "1": Math.round(88 / (34 - 27)),
        "3": Math.round((88 + 24) / 6),
        "4": 24,
      };
    },
  },

  // ══ 3. ages, with a future total ════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "algebraic_translation",
    difficulty: 3,
    stem_md:
      "Marta is $3$ years older than twice her son's age. In $7$ years, the sum of their two ages will be $62$. How old is Marta now?",
    choices: ["$15$", "$27$", "$33$", "$40$", "$45$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nEach of the two people gains $7$ years, so the pair gains $14$: today their ages sum to $62 - 14 = 48$. With the son at $s$ and Marta at $2s + 3$, $s + 2s + 3 = 48$ gives $3s = 45$, so $s = 15$ and Marta is $33$. Check: in seven years they are $22$ and $40$, which sum to $62$.\n\n**Trigger cue**\nOne age given in terms of another plus a future total — subtract the years gained by *everyone* before solving.\n\n**Takeaway**\nA future total for two people gains twice the years.",
    fastest_path_md:
      "Backsolve from the middle: if Marta is $33$ now, her son is $15$ (since $2(15) + 3 = 33$). In seven years they are $40$ and $22$, summing to $62$ — the stated total, on the first test.",
    trap_map: {
      "0": "Answers with the son's age rather than Marta's.",
      "1": "Reads \"$3$ years older than twice\" as twice the son's age less $3$.",
      "3": "Answers with Marta's age seven years from now.",
      "4": "Stops at $3s = 45$ and answers with $45$ instead of with $2s + 3$.",
    },
    numeric_check: "2*((62 - 14 - 3)/3) + 3",
    check() {
      const found = [];
      for (let s = 0; s <= 120; s++) {
        const marta = 2 * s + 3;
        if (s + 7 + (marta + 7) === 62) found.push(marta);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      const s = 15;
      return { "0": s, "1": 2 * s - 3, "3": 2 * s + 3 + 7, "4": 3 * s };
    },
  },

  // ══ 4. combined work with one machine unknown ═══════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "Working alone, machine A fills an order in $15$ hours. Working together, machines A and B fill the same order in $6$ hours. How many hours would machine B take working alone?",
    choices: ["$6$", "$9$", "$10$", "$21$", "$90$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nRates add, times do not. Machine A does $\\tfrac{1}{15}$ of the order per hour and the pair does $\\tfrac16$, so B does $\\tfrac16 - \\tfrac{1}{15} = \\tfrac{5}{30} - \\tfrac{2}{30} = \\tfrac{3}{30} = \\tfrac{1}{10}$ per hour. B alone takes $10$ hours.\n\n**Trigger cue**\nOne solo time and a joint time, with the other solo time requested — subtract rates, never times.\n\n**Takeaway**\nAdd rates; times add to nothing.",
    fastest_path_md:
      "Backsolve from the middle: at $10$ hours B contributes $\\tfrac{1}{10}$ per hour, and $\\tfrac{1}{15} + \\tfrac{1}{10} = \\tfrac{2}{30} + \\tfrac{3}{30} = \\tfrac16$ — exactly the stated joint rate, so it works on the first test.",
    trap_map: {
      "0": "Answers with the joint time rather than machine B's solo time.",
      "1": "Subtracts the times, $15 - 6$, instead of subtracting the rates.",
      "3": "Adds the times, $15 + 6$.",
      "4": "Multiplies the times, $15 \\times 6$, borrowing the product formula without its denominator.",
    },
    numeric_check: "1/(1/6 - 1/15)",
    check() {
      // Brute force over candidate whole-hour times for B.
      const found = [];
      for (let b = 1; b <= 500; b++) {
        if (Math.abs(1 / 15 + 1 / b - 1 / 6) < 1e-12) found.push(b);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 6, "1": 15 - 6, "3": 15 + 6, "4": 15 * 6 };
    },
  },

  // ══ 5. two remainder conditions at once ═════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "What is the least integer greater than $100$ that leaves a remainder of $4$ when divided by $9$ and a remainder of $2$ when divided by $7$?",
    choices: ["$103$", "$112$", "$121$", "$130$", "$137$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe integers above $100$ leaving remainder $4$ on division by $9$ are $103, 112, 121, 130, \\ldots$, each nine more than the last. Test each against the second condition: $103 = 14(7) + 5$, $112 = 16(7) + 0$, and $121 = 17(7) + 2$. So $121$ is the least that satisfies both.\n\n**Trigger cue**\nTwo remainder conditions on one integer — list the candidates from the *coarser* condition and filter them with the other.\n\n**Takeaway**\nList from one condition, filter with the other.",
    fastest_path_md:
      "Backsolve: every choice already clears the first condition, so test each against the second. $103$ leaves $5$, $112$ leaves $0$, and $121$ leaves $2$ — the third choice settles it.",
    trap_map: {
      "0": "Satisfies only the first condition and stops at the first candidate above $100$.",
      "1": "Reads the second condition as \"divisible by $7$\" rather than as a remainder of $2$.",
      "3": "Carries the remainder $4$ across to the second condition as well.",
      "4": "Swaps the two remainders, seeking $2$ on division by $9$ and $4$ on division by $7$.",
    },
    numeric_check: null,
    check() {
      for (let n = 101; n <= 10000; n++) {
        if (n % 9 === 4 && n % 7 === 2) return { kind: "value", value: n };
      }
      throw new Error("no candidate found");
    },
    trap_values() {
      return {
        "0": leastAbove(100, (n) => n % 9 === 4),
        "1": leastAbove(100, (n) => n % 9 === 4, (n) => n % 7 === 0),
        "3": leastAbove(100, (n) => n % 9 === 4, (n) => n % 7 === 4),
        "4": leastAbove(100, (n) => n % 9 === 2, (n) => n % 7 === 4),
      };
    },
  },

  // ══ 6. a percent move undone by a flat reduction ════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 4,
    stem_md:
      "A price was raised by $20\\%$ and then reduced by $\\$27$, leaving it $\\$9$ higher than the original price. What was the original price?",
    choices: ["$\\$90$", "$\\$135$", "$\\$180$", "$\\$189$", "$\\$216$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWith $p$ the original price, $1.2p - 27 = p + 9$, so $0.2p = 36$ and $p = 180$. Check: $180$ rises to $216$, and $216 - 27 = 189$, which is $\\$9$ above $180$.\n\n**Trigger cue**\nA percent change and a flat dollar change in the same chain — keep the percent as a factor and the dollars as a term; never merge them.\n\n**Takeaway**\nPercents multiply, dollars add — never mix them.",
    fastest_path_md:
      "Backsolve from the middle choice: $\\$180$ rises by $20\\%$ to $\\$216$, and $216 - 27 = 189$, which is exactly $\\$9$ above $\\$180$. One test, no algebra.",
    trap_map: {
      "0": "Subtracts the two dollar figures instead of adding them, solving $0.2p = 27 - 9$.",
      "1": "Uses only the $\\$27$ reduction, solving $0.2p = 27$.",
      "3": "Answers with the final price rather than the original.",
      "4": "Answers with the marked-up price rather than the original.",
    },
    numeric_check: "(27 + 9)/0.2",
    check() {
      // Brute force in cents, scaled by 10 so 1.2p stays an integer and no
      // rounding can manufacture a solution.
      const found = [];
      for (let cents = 1; cents <= 100000; cents++) {
        if (12 * cents - 10 * 2700 === 10 * cents + 10 * 900) found.push(cents / 100);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": (27 - 9) / 0.2,
        "1": 27 / 0.2,
        "3": 180 + 9,
        "4": 180 * 1.2,
      };
    },
  },

  // ══ 7. how much of the strong solution to add ═══════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 4,
    stem_md:
      "How many litres of a $40\\%$ alcohol solution must be added to $30$ litres of a $15\\%$ alcohol solution to produce a $25\\%$ solution?",
    choices: ["$12$", "$15$", "$20$", "$30$", "$50$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nAlcohol in equals alcohol out: $0.40x + 0.15(30) = 0.25(x + 30)$. Expanding, $0.40x + 4.5 = 0.25x + 7.5$, so $0.15x = 3$ and $x = 20$. Check: $0.40(20) + 4.5 = 12.5$ litres of alcohol in $50$ litres of solution, which is $25\\%$.\n\n**Trigger cue**\nA target concentration between the two given ones — conserve the solute, not the solution.\n\n**Takeaway**\nCount the alcohol, not the litres.",
    fastest_path_md:
      "Backsolve from the middle: adding $20$ litres gives $0.40(20) + 0.15(30) = 8 + 4.5 = 12.5$ litres of alcohol in $50$ litres — exactly $25\\%$ on the first test.",
    trap_map: {
      "0": "Divides the $3$-litre alcohol shortfall by the target $25\\%$ rather than by the $15$-point gap.",
      "1": "Answers with the $15$ from the stem, reading a percentage as a volume.",
      "3": "Answers with the $30$ litres already in the vessel.",
      "4": "Answers with the total volume of the finished mixture.",
    },
    numeric_check: "(0.25 - 0.15)*30/(0.40 - 0.25)",
    check() {
      const found = [];
      for (let tenths = 1; tenths <= 2000; tenths++) {
        const x = tenths / 10;
        const alcohol = 0.4 * x + 0.15 * 30;
        if (Math.abs(alcohol - 0.25 * (x + 30)) < 1e-9) found.push(x);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 3 / 0.25, "1": 15, "3": 30, "4": 20 + 30 };
    },
  },

  // ══ 8. an integer constraint that names the candidate list ══════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "A group of more than $10$ people shares $91$ sweets, each person receiving the same whole number of sweets, and $7$ sweets are left over. What is the least possible number of people in the group?",
    choices: ["$11$", "$12$", "$13$", "$14$", "$21$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nIf $7$ are left over then $91 - 7 = 84$ sweets were distributed evenly, so the group size divides $84$. It must also exceed $7$, since a remainder is always smaller than the divisor, and the stem requires more than $10$. The divisors of $84 = 2^2 \\times 3 \\times 7$ are $1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84$, and the least above $10$ is $12$. Check: $84/12 = 7$ each, with $7$ left over.\n\n**Trigger cue**\n\"Left over\" with a group size requested — subtract the remainder first, then factor what is left.\n\n**Takeaway**\nSubtract the remainder, then factor.",
    fastest_path_md:
      "Backsolve from the smallest choice upward, since the question asks for the least: $11$ does not divide $84$, and $12$ does. Two tests and the question is closed.",
    trap_map: {
      "0": "Takes the least integer above $10$ without checking that it divides evenly.",
      "2": "Factors $91$ itself instead of $91 - 7$, taking its least divisor above $10$.",
      "3": "Divides $84$ correctly but skips past $12$ to the next divisor.",
      "4": "Picks a divisor of $84$ above $10$ without checking that it is the least one.",
    },
    numeric_check: null,
    check() {
      for (let n = 11; n <= 91; n++) {
        if (91 % n === 7) return { kind: "value", value: n };
      }
      throw new Error("no candidate found");
    },
    trap_values() {
      return {
        "0": leastAbove(10, () => true),
        "2": leastAbove(10, (n) => 91 % n === 0),
        "3": leastAbove(12, (n) => 84 % n === 0),
        "4": leastAbove(14, (n) => 84 % n === 0),
      };
    },
  },

  // ══ 9. a rational inequality with an integer floor ══════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "inequalities",
    difficulty: 4,
    stem_md:
      "If $x$ is an integer greater than $3$ and $\\dfrac{2x + 5}{x - 3} \\le 3$, what is the least possible value of $x$?",
    choices: ["$4$", "$8$", "$14$", "$15$", "$17$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nBecause $x > 3$, the denominator $x - 3$ is positive, so multiplying through preserves the inequality: $2x + 5 \\le 3(x - 3) = 3x - 9$, giving $14 \\le x$. The least integer is $14$. Check: at $x = 14$ the fraction is $\\tfrac{33}{11} = 3$, which satisfies $\\le 3$; at $x = 13$ it is $\\tfrac{31}{10} = 3.1$, which does not.\n\n**Trigger cue**\nA variable in the denominator of an inequality — establish the denominator's sign before multiplying, or the direction is a coin flip.\n\n**Takeaway**\nKnow the denominator's sign before you multiply.",
    fastest_path_md:
      "Backsolve from the middle: at $x = 14$ the fraction is $\\tfrac{33}{11} = 3$, which satisfies the condition; at the smaller choices $x = 8$ gives $\\tfrac{21}{5} = 4.2$ and $x = 4$ gives $13$, both too large. Two tests fix the floor at $14$.",
    trap_map: {
      "0": "Takes the least integer above $3$, assuming the inequality holds throughout the domain.",
      "1": "Expands $3(x - 3)$ as $3x - 3$, solving $2x + 5 \\le 3x - 3$.",
      "3": "Reads $\\le$ as a strict $<$ and steps one past the boundary.",
      "4": "Solves the equality correctly and then adds back the $3$ from the denominator.",
    },
    numeric_check: null,
    check() {
      for (let x = 4; x <= 1000; x++) {
        if ((2 * x + 5) / (x - 3) <= 3) return { kind: "value", value: x };
      }
      throw new Error("no candidate found");
    },
    trap_values() {
      return {
        "0": leastAbove(3, () => true),
        "1": leastAbove(3, (x) => 2 * x + 5 <= 3 * x - 3),
        "3": leastAbove(3, (x) => (2 * x + 5) / (x - 3) < 3),
        "4": leastAbove(3, (x) => (2 * x + 5) / (x - 3) <= 3) + 3,
      };
    },
  },

  // ══ 10. two sets and a "neither" ════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 3,
    stem_md:
      "Of $120$ people surveyed, $68$ speak French, $55$ speak German, and $19$ speak neither language. How many speak both languages?",
    choices: ["$3$", "$22$", "$33$", "$46$", "$101$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe people who speak at least one language number $120 - 19 = 101$. Inclusion–exclusion gives $|F \\cup G| = |F| + |G| - |F \\cap G|$, so $101 = 68 + 55 - b$ and $b = 22$. Check: $46$ French-only, $33$ German-only, $22$ both and $19$ neither sum to $120$.\n\n**Trigger cue**\nA total, two group counts and a \"neither\" — subtract the neither first, then apply inclusion–exclusion to what remains.\n\n**Takeaway**\nRemove the \"neither\" before inclusion–exclusion.",
    fastest_path_md:
      "Backsolve from the middle: if $33$ spoke both, the union would be $68 + 55 - 33 = 90$, but $19$ neither requires a union of $101$ — too small, so try the next choice down. $22$ gives $101$ exactly.",
    trap_map: {
      "0": "Forgets the $19$ who speak neither and computes $68 + 55 - 120$.",
      "2": "Answers with the German-only count.",
      "3": "Answers with the French-only count.",
      "4": "Answers with the number who speak at least one language.",
    },
    numeric_check: "68 + 55 - (120 - 19)",
    check() {
      const found = [];
      for (let b = 0; b <= 55; b++) {
        const frenchOnly = 68 - b;
        const germanOnly = 55 - b;
        if (frenchOnly >= 0 && germanOnly >= 0) {
          if (frenchOnly + germanOnly + b + 19 === 120) found.push(b);
        }
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 68 + 55 - 120,
        "2": 55 - 22,
        "3": 68 - 22,
        "4": 120 - 19,
      };
    },
  },

  // ══ 11. unwinding a markup on cost ══════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "A merchant sells an item for $\\$252$, making a profit of $40\\%$ of the item's cost. What was the cost?",
    choices: [
      "$\\$72$",
      "$\\$100.80$",
      "$\\$151.20$",
      "$\\$180$",
      "$\\$352.80$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe profit is a percentage of *cost*, so the selling price is $1.40$ times the cost: $252 = 1.4c$ and $c = 180$. Check: $40\\%$ of $180$ is $72$, and $180 + 72 = 252$.\n\n**Trigger cue**\nA profit or markup quoted as a percent of cost with the selling price given — divide by $1 + r$; never take the percent off the selling price.\n\n**Takeaway**\nA markup on cost is undone by division, not subtraction.",
    fastest_path_md:
      "Backsolve: test $\\$180$ — a $40\\%$ profit on it is $\\$72$, and $180 + 72 = 252$, the stated price. One multiplication settles it.",
    trap_map: {
      "0": "Answers with the profit rather than the cost.",
      "1": "Answers with $40\\%$ of the selling price.",
      "2": "Takes $40\\%$ off the selling price, as though the profit were a percent of the sale.",
      "4": "Marks the selling price up by a further $40\\%$ instead of unwinding the markup.",
    },
    numeric_check: "252/1.4",
    check() {
      const found = [];
      for (let cents = 1; cents <= 100000; cents++) {
        if (Math.abs(cents * 1.4 - 25200) < 1e-6) found.push(cents / 100);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 252 - 180,
        "1": 252 * 0.4,
        "2": 252 * (1 - 0.4),
        "4": 252 * 1.4,
      };
    },
  },

  // ══ 12. an average that moves when one value leaves ═════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 3,
    stem_md:
      "The average (arithmetic mean) of five numbers is $63$. When one of the numbers is removed, the average of the remaining four is $58$. What was the number removed?",
    choices: ["$5$", "$58$", "$63$", "$83$", "$121$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nAverages are only useful here as totals. The five numbers sum to $5(63) = 315$ and the remaining four sum to $4(58) = 232$, so the number removed is $315 - 232 = 83$. Check: removing $83$ from a total of $315$ leaves $232$, which over four numbers averages $58$.\n\n**Trigger cue**\nAn average before and after a value is added or removed — convert both averages to sums and subtract.\n\n**Takeaway**\nConvert every average to a sum first.",
    fastest_path_md:
      "Backsolve: test $83$. Removing it from $5(63) = 315$ leaves $232$, and $232/4 = 58$ — the stated new average, on the first test.",
    trap_map: {
      "0": "Answers with the difference between the two averages.",
      "1": "Answers with the new average.",
      "2": "Answers with the original average.",
      "4": "Adds the two averages instead of differencing the two sums.",
    },
    numeric_check: "5*63 - 4*58",
    check() {
      // Brute force over an explicit set: four numbers averaging 58 plus one
      // more, constrained to average 63 across all five.
      const found = [];
      for (let removed = 0; removed <= 400; removed++) {
        const rest = 4 * 58;
        if ((rest + removed) / 5 === 63) found.push(removed);
      }
      if (found.length !== 1) throw new Error(`found ${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 63 - 58, "1": 58, "2": 63, "4": 63 + 58 };
    },
  },
];

verifyAndAppend(items, { requireTrapValues: true });
