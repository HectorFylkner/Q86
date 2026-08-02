/**
 * Foundation batch 3 of 4 — value, order and factors.
 *
 * Same brief as batches 1 and 2. Four chapters in this skill had a
 * foundation band that reached D4 because the bank held too few easy items
 * to fill the easiest third of the chapter.
 *
 * Checks here compute by repetition rather than by rule: a power by
 * repeated multiplication, a remainder by repeated subtraction, a GCF by
 * scanning every candidate divisor. The point of a foundation item is that
 * the rule is the thing being tested, so the check must not use it.
 *
 * Run: node --experimental-strip-types scripts/author/batch-foundation-vof.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

/** b^e by repeated multiplication — no ** operator, no exponent algebra. */
function power(b, e) {
  let out = 1;
  for (let i = 0; i < e; i++) out *= b;
  return out;
}

const items = [
  // ══ exponents_roots_properties — 3 items ════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 2,
    stem_md: "What is the value of $\\dfrac{3^{7}}{3^{4}}$?",
    choices: ["$3$", "$9$", "$27$", "$81$", "$2{,}187$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nSame base, so the exponents subtract: $3^{7-4} = 3^{3} = 27$.\n\n**Trigger cue**\nA quotient of powers with the same base — subtract the exponents, then remember the result is still a *power*, not the exponent you just computed.\n\n**Takeaway**\nSubtract the exponents, then raise the base to the result.",
    fastest_path_md:
      "$3^{7-4} = 3^{3} = 27$. Never expand $2{,}187/81$.",
    trap_map: {
      "0": "Reports the exponent difference $7 - 4 = 3$ instead of $3^{3}$.",
      "1": "Subtracts one too many, giving $3^{2}$.",
      "3": "Subtracts one too few, giving $3^{4}$.",
      "4": "Computes the numerator alone and never divides.",
    },
    numeric_check: "3^3",
    check() {
      const top = power(3, 7);
      const bottom = power(3, 4);
      if (top % bottom !== 0) throw new Error("not a whole number");
      return { kind: "value", value: top / bottom };
    },
    trap_values() {
      return { "0": 7 - 4, "1": power(3, 2), "3": power(3, 4), "4": power(3, 7) };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 2,
    stem_md: "What is the value of $\\sqrt{144} + \\sqrt{25}$?",
    choices: ["$7$", "$13$", "$17$", "$60$", "$169$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$\\sqrt{144} = 12$ and $\\sqrt{25} = 5$, so the sum is $17$.\n\n**Trigger cue**\nRoots do not distribute over addition: $\\sqrt{a} + \\sqrt{b}$ is not $\\sqrt{a+b}$. They *do* distribute over multiplication, which is why the two cases get confused.\n\n**Takeaway**\nRoots split across products, never across sums.",
    fastest_path_md:
      "$12 + 5 = 17$. Both radicands are perfect squares, so there is nothing to simplify.",
    trap_map: {
      "0": "Subtracts the roots instead of adding them.",
      "1": "Adds under the radical first: $\\sqrt{144 + 25} = \\sqrt{169} = 13$. This is the error the item exists to catch.",
      "3": "Multiplies the roots instead of adding them.",
      "4": "Adds the radicands and never takes the root.",
    },
    numeric_check: "sqrt(144)+sqrt(25)",
    check() {
      // Find each root by search over the integers, not by a sqrt call.
      const root = (n) => {
        for (let r = 0; r <= n; r++) if (r * r === n) return r;
        throw new Error(`${n} is not a perfect square`);
      };
      return { kind: "value", value: root(144) + root(25) };
    },
    trap_values() {
      const root = (n) => {
        for (let r = 0; r <= n; r++) if (r * r === n) return r;
        throw new Error(`${n} is not a perfect square`);
      };
      return {
        "0": root(144) - root(25),
        "1": root(144 + 25),
        "3": root(144) * root(25),
        "4": 144 + 25,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 3,
    stem_md: "If $x = 2$, what is the value of $(3x)^{2} - 3x^{2}$?",
    choices: ["$0$", "$12$", "$24$", "$30$", "$36$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$(3x)^{2}$ squares the whole product: $(3 \\cdot 2)^{2} = 36$. In $3x^{2}$ the exponent binds only to $x$: $3(2^{2}) = 12$. So the value is $36 - 12 = 24$.\n\n**Trigger cue**\nParentheses decide what the exponent acts on. $(3x)^{2} = 9x^{2}$, which is nine times $x^{2}$, not three times — the difference is a factor of $3$ hiding in plain sight.\n\n**Takeaway**\nAn exponent binds only to what the parentheses enclose.",
    fastest_path_md:
      "Symbolically first: $(3x)^{2} - 3x^{2} = 9x^{2} - 3x^{2} = 6x^{2} = 6(4) = 24$.",
    trap_map: {
      "0": "Reads $(3x)^{2}$ as $3x^{2}$, so the two terms cancel.",
      "1": "Reports the second term alone.",
      "3": "Drops the square in the second term, computing $3x = 6$ and $36 - 6$.",
      "4": "Reports the first term alone.",
    },
    numeric_check: "(3*2)^2-3*2^2",
    check() {
      const x = 2;
      const first = power(3 * x, 2);
      const second = 3 * power(x, 2);
      return { kind: "value", value: first - second };
    },
    trap_values() {
      const x = 2;
      return {
        "0": 3 * power(x, 2) - 3 * power(x, 2),
        "1": 3 * power(x, 2),
        "3": power(3 * x, 2) - 3 * x,
        "4": power(3 * x, 2),
      };
    },
  },

  // ══ divisibility_gcf_lcm — 3 items ══════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 2,
    stem_md: "What is the greatest common factor of $48$ and $60$?",
    choices: ["$4$", "$6$", "$12$", "$240$", "$2{,}880$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$48 = 2^{4} \\cdot 3$ and $60 = 2^{2} \\cdot 3 \\cdot 5$. The greatest common factor takes each shared prime to the *lower* of its two exponents: $2^{2} \\cdot 3 = 12$.\n\n**Trigger cue**\nGCF takes the lower exponent of each shared prime; LCM takes the higher of every prime that appears. Writing both prime factorisations once answers both questions.\n\n**Takeaway**\nGCF takes the lower exponent; LCM takes the higher.",
    fastest_path_md:
      "$60 - 48 = 12$, and $12$ divides both, so the GCF is $12$ — any common factor must divide the difference.",
    trap_map: {
      "0": "Takes only the shared power of $2$ and drops the shared $3$.",
      "1": "Stops at a common factor without checking whether a larger one exists.",
      "3": "Gives the least common multiple instead of the greatest common factor.",
      "4": "Gives the product of the two numbers.",
    },
    numeric_check: "12",
    check() {
      let best = 1;
      for (let d = 1; d <= 60; d++) {
        if (48 % d === 0 && 60 % d === 0) best = d;
      }
      return { kind: "value", value: best };
    },
    trap_values() {
      let lcm = 0;
      for (let m = 1; m <= 48 * 60; m++) {
        if (m % 48 === 0 && m % 60 === 0) {
          lcm = m;
          break;
        }
      }
      // The largest power of 2 dividing both — the GCF with the shared 3
      // left out.
      let powerOfTwo = 1;
      for (let e = 1; power(2, e) <= 60; e++) {
        const p = power(2, e);
        if (48 % p === 0 && 60 % p === 0) powerOfTwo = p;
      }
      // The largest common factor strictly below the GCF.
      let secondBest = 1;
      for (let d = 1; d < 12; d++) if (48 % d === 0 && 60 % d === 0) secondBest = d;
      return { "0": powerOfTwo, "1": secondBest, "3": lcm, "4": 48 * 60 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 2,
    stem_md: "What is the least common multiple of $12$ and $18$?",
    choices: ["$6$", "$30$", "$36$", "$72$", "$216$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$12 = 2^{2} \\cdot 3$ and $18 = 2 \\cdot 3^{2}$. The least common multiple takes each prime to the *higher* exponent: $2^{2} \\cdot 3^{2} = 36$.\n\n**Trigger cue**\nThe product is always *a* common multiple; the least one divides it by the GCF. Here $12 \\cdot 18 / 6 = 36$.\n\n**Takeaway**\nLCM equals the product divided by the GCF.",
    fastest_path_md:
      "Walk up the multiples of the larger number: $18, 36$ — and $36$ is divisible by $12$. Two steps.",
    trap_map: {
      "0": "Gives the greatest common factor instead of the least common multiple.",
      "1": "Adds the two numbers.",
      "3": "Doubles the correct answer by taking $2^{3}$ rather than $2^{2}$.",
      "4": "Gives the product, a common multiple but not the least.",
    },
    numeric_check: "36",
    check() {
      for (let m = 1; m <= 12 * 18; m++) {
        if (m % 12 === 0 && m % 18 === 0) return { kind: "value", value: m };
      }
      throw new Error("no common multiple found");
    },
    trap_values() {
      let gcf = 1;
      for (let d = 1; d <= 18; d++) if (12 % d === 0 && 18 % d === 0) gcf = d;
      return { "0": gcf, "1": 12 + 18, "3": power(2, 3) * power(3, 2), "4": 12 * 18 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 3,
    stem_md:
      "If $n$ is a positive integer and $12n$ is a multiple of $90$, what is the least possible value of $n$?",
    choices: ["$7.5$", "$8$", "$15$", "$30$", "$90$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$90 = 2 \\cdot 3^{2} \\cdot 5$ and $12 = 2^{2} \\cdot 3$. The product $12n$ already supplies one $2$ and one $3$, so $n$ must supply the missing $3$ and the missing $5$: $n = 15$. Check: $12(15) = 180 = 2(90)$.\n\n**Trigger cue**\n\"Least $n$ making a product divisible by $k$\" is a prime-supply question. Factor both, cross off what the constant already gives, and $n$ is exactly what is left over.\n\n**Takeaway**\n$n$ supplies only the primes the constant is missing.",
    fastest_path_md:
      "$12n/90 = 2n/15$, so $15$ must divide $2n$; since $15$ is odd, $15$ divides $n$, and $n = 15$ works.",
    trap_map: {
      "0": "Divides $90$ by $12$ and reports a non-integer, ignoring that $n$ must be a positive integer.",
      "1": "Rounds that non-integer division up to the next whole number.",
      "3": "Takes the second-smallest solution instead of the least — $12(30) = 360$ is also a multiple of $90$.",
      "4": "Uses $90$ itself, which works but is far from least.",
    },
    numeric_check: "15",
    check() {
      for (let n = 1; n <= 1000; n++) {
        if ((12 * n) % 90 === 0) return { kind: "value", value: n };
      }
      throw new Error("no n found");
    },
    trap_values() {
      const solutions = [];
      for (let n = 1; n <= 1000; n++) if ((12 * n) % 90 === 0) solutions.push(n);
      return { "0": 90 / 12, "1": Math.ceil(90 / 12), "3": solutions[1], "4": 90 };
    },
  },

  // ══ remainders_units_digits — 2 items ═══════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 2,
    stem_md: "What is the remainder when $437$ is divided by $8$?",
    choices: ["$3$", "$5$", "$7$", "$54$", "$55$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n$8 \\times 54 = 432$, and $437 - 432 = 5$. Since $0 \\le 5 < 8$, the remainder is $5$.\n\n**Trigger cue**\nFind the largest multiple of the divisor at or below the number, then subtract. The remainder is always at least $0$ and strictly less than the divisor — a value outside that range is a signal, not an answer.\n\n**Takeaway**\nA remainder is always smaller than its divisor.",
    fastest_path_md:
      "$400$ is $8 \\cdot 50$, leaving $37$; $32$ is $8 \\cdot 4$, leaving $5$.",
    trap_map: {
      "0": "Reports divisor minus remainder, $8 - 5$.",
      "2": "Divides by $10$ instead of $8$ and reports the units digit.",
      "3": "Reports the quotient rather than the remainder.",
      "4": "Rounds the quotient up.",
    },
    numeric_check: "437-8*54",
    check() {
      // Repeated subtraction: no % operator, no division.
      let left = 437;
      while (left >= 8) left -= 8;
      return { kind: "value", value: left };
    },
    trap_values() {
      let left = 437;
      let quotient = 0;
      while (left >= 8) {
        left -= 8;
        quotient++;
      }
      let units = 437;
      while (units >= 10) units -= 10;
      return { "0": 8 - left, "2": units, "3": quotient, "4": quotient + 1 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 3,
    stem_md: "What is the units digit of $7^{23}$?",
    choices: ["$1$", "$3$", "$4$", "$7$", "$9$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe units digits of $7^{1}, 7^{2}, 7^{3}, 7^{4}$ are $7, 9, 3, 1$, then the pattern repeats every $4$. Since $23 = 4(5) + 3$, the exponent lands on the *third* place in the cycle, which is $3$.\n\n**Trigger cue**\nUnits digits of powers always cycle, and the cycle is at most $4$ long. Write out four powers, divide the exponent by the cycle length, and read the remainder as a position — with remainder $0$ meaning the last place, not the first.\n\n**Takeaway**\nThe remainder is a position in the cycle, counting from one.",
    fastest_path_md:
      "Cycle $7, 9, 3, 1$; $23 \\bmod 4 = 3$; third entry is $3$.",
    trap_map: {
      "0": "Treats $23 \\bmod 4$ as $0$ and takes the last entry of the cycle.",
      "2": "Reports the length of the cycle instead of a digit from it.",
      "3": "Assumes the units digit of every power of $7$ is $7$.",
      "4": "Slips to $23 \\bmod 4 = 2$ and takes the second entry.",
    },
    numeric_check: null,
    check() {
      // Carry only the units digit through 23 multiplications.
      let units = 1;
      for (let i = 0; i < 23; i++) units = (units * 7) % 10;
      return { kind: "value", value: units };
    },
    trap_values() {
      const cycle = [];
      let units = 1;
      for (let i = 0; i < 4; i++) {
        units = (units * 7) % 10;
        cycle.push(units);
      }
      return { "0": cycle[3], "2": cycle.length, "3": cycle[0], "4": cycle[1] };
    },
  },

  // ══ abs_value_number_line_decimals — 1 item ═════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 2,
    stem_md: "What is the value of $|3 - 11| - |{-5}|$?",
    choices: ["$-13$", "$-3$", "$3$", "$8$", "$13$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nEvaluate inside each pair of bars first: $|3 - 11| = |-8| = 8$ and $|-5| = 5$. Then $8 - 5 = 3$.\n\n**Trigger cue**\nAbsolute-value bars are grouping symbols. Finish the arithmetic inside them before the bars do anything, and apply the bars to *each* term separately — the minus sign between the two terms is untouched by either.\n\n**Takeaway**\nSimplify inside the bars first, then subtract as usual.",
    fastest_path_md:
      "$8 - 5 = 3$. Both bars close before the subtraction between them happens.",
    trap_map: {
      "0": "Drops both sets of bars: $(3 - 11) - 5$.",
      "1": "Subtracts in the wrong order, $5 - 8$.",
      "3": "Stops at $|3 - 11|$ and never subtracts the second term.",
      "4": "Turns the minus between the terms into a plus, as though the bars changed it.",
    },
    numeric_check: "abs(3-11)-abs(-5)",
    check() {
      // Absolute value from its definition, not from a library call.
      const mag = (v) => (v < 0 ? 0 - v : v);
      return { kind: "value", value: mag(3 - 11) - mag(0 - 5) };
    },
    trap_values() {
      const mag = (v) => (v < 0 ? 0 - v : v);
      return {
        "0": 3 - 11 - 5,
        "1": mag(0 - 5) - mag(3 - 11),
        "3": mag(3 - 11),
        "4": mag(3 - 11) + mag(0 - 5),
      };
    },
  },
];

verifyAndAppend(items, { requireTrapValues: true });
