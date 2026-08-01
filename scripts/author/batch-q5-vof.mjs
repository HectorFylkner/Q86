/**
 * Quality pass, batch 6 — 16 new D5 items across the value_order_factors
 * skill: 2 each for abs_value_number_line_decimals,
 * remainders_units_digits, consecutive_evenly_spaced, prime_factorization,
 * exponents_roots_properties, divisibility_gcf_lcm, parity_signs and
 * must_be_true_testing.
 *
 * Run: node --experimental-strip-types scripts/author/batch-q5-vof.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ══ abs_value_number_line_decimals ══════════════════════════════════════

  // ── 1. a sum of distances equal to the gap ─────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 5,
    stem_md:
      "How many integers $x$ satisfy $|x - 3| + |x + 5| = 8$?",
    choices: ["$0$", "$2$", "$8$", "$9$", "$10$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nRead the expression as distance: $|x-3|$ is the distance from $x$ to $3$ and $|x+5|$ the distance from $x$ to $-5$. Those two points are $8$ apart, so the sum of the distances is *exactly* $8$ for every $x$ between them (inclusive) and strictly greater outside. The solution set is the whole closed interval $[-5, 3]$, which contains $3 - (-5) + 1 = 9$ integers.\n\n**Trigger cue**\n$|x - a| + |x - b|$ compared with $|a - b|$ — read it on the number line as distances; equality holds on the entire segment, never at isolated points.\n\n**Takeaway**\nA sum of two distances equalling their gap holds on the whole segment.",
    fastest_path_md:
      "The two anchors are $8$ apart, and $8$ is the stated sum, so every $x$ in $[-5,3]$ works: $9$ integers.",
    trap_map: {
      "0": "Concludes there are no solutions because the two absolute values cannot both be zero at once.",
      "1": "Solves the two boundary equations only, counting just $x = -5$ and $x = 3$.",
      "2": "Answers with the length of the interval, $8$, instead of the number of integers on it.",
      "4": "Counts the $8$ units of length and then adds both endpoints as extras: $8 + 2 = 10$.",
    },
    numeric_check: "3 - (-5) + 1",
    check() {
      let count = 0;
      for (let x = -500; x <= 500; x++) {
        if (Math.abs(x - 3) + Math.abs(x + 5) === 8) count++;
      }
      return { kind: "value", value: count };
    },
    trap_values() {
      return { "0": 0, "1": 2, "2": 8, "4": 8 + 2 };
    },
  },

  // ── 2. counting half-integers inside an absolute-value band ────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 5,
    stem_md:
      "How many numbers $x$ satisfy both $|2x - 7| < 3$ and the condition that $x$ is an integer multiple of $0.5$?",
    choices: ["$2$", "$3$", "$5$", "$6$", "$7$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$|2x - 7| < 3$ unfolds to $-3 < 2x - 7 < 3$, so $4 < 2x < 10$ and $2 < x < 5$ — an *open* interval. The multiples of $0.5$ strictly inside it are $2.5$, $3$, $3.5$, $4$, $4.5$: five values. The endpoints $2$ and $5$ are multiples of $0.5$ but are excluded by the strict inequality.\n\n**Trigger cue**\nAn absolute-value inequality with a counting question — solve to an interval first, then check strictness at each endpoint; a strict bound that lands exactly on a countable value is the whole point of the question.\n\n**Takeaway**\nStrict inequalities exclude endpoints — check whether they were countable.",
    fastest_path_md:
      "$2 < x < 5$, open at both ends. Half-steps inside: $2.5, 3, 3.5, 4, 4.5$ — five of them.",
    trap_map: {
      "0": "Counts only the integers strictly inside, $3$ and $4$.",
      "1": "Counts the integers with the left endpoint included: $2$, $3$, $4$.",
      "3": "Includes one endpoint, reading only one side of the inequality as strict: six values.",
      "4": "Reads $<$ as $\\le$ and includes both endpoints: $2, 2.5, \\ldots, 5$ — seven values.",
    },
    numeric_check: "5",
    check() {
      let count = 0;
      for (let half = -100; half <= 100; half++) {
        const x = half / 2;
        if (Math.abs(2 * x - 7) < 3) count++;
      }
      return { kind: "value", value: count };
    },
    trap_values() {
      let integersStrict = 0;
      let integersLeftClosed = 0;
      let halvesOneEndpoint = 0;
      let halvesClosed = 0;
      for (let half = -100; half <= 100; half++) {
        const x = half / 2;
        if (Number.isInteger(x) && x > 2 && x < 5) integersStrict++;
        if (Number.isInteger(x) && x >= 2 && x < 5) integersLeftClosed++;
        if (x >= 2 && x < 5) halvesOneEndpoint++;
        if (x >= 2 && x <= 5) halvesClosed++;
      }
      return {
        "0": integersStrict,
        "1": integersLeftClosed,
        "3": halvesOneEndpoint,
        "4": halvesClosed,
      };
    },
  },

  // ══ remainders_units_digits ═════════════════════════════════════════════

  // ── 3. a modular cycle read at a far exponent ──────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 5,
    stem_md:
      "What is the remainder when $7^{100}$ is divided by $100$?",
    choices: ["$0$", "$1$", "$7$", "$43$", "$49$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nCompute powers of $7$ modulo $100$: $7^1 = 7$, $7^2 = 49$, $7^3 = 343 \\equiv 43$, $7^4 = 7 \\times 43 = 301 \\equiv 1$. Hitting $1$ closes the cycle, so the powers repeat with period $4$. Since $100 = 4 \\times 25$ leaves remainder $0$, $7^{100} = (7^4)^{25} \\equiv 1^{25} = 1$.\n\n**Trigger cue**\nA large power modulo a small number — compute powers until the residue $1$ reappears; that closes the cycle and the exponent's remainder mod the cycle length picks the answer.\n\n**Takeaway**\nA remainder of one closes the cycle; index the exponent by it.",
    fastest_path_md:
      "$7^4 = 2401 \\equiv 1 \\pmod{100}$, and $4 \\mid 100$, so $7^{100} \\equiv 1$.",
    trap_map: {
      "0": "Confuses the exponent with the modulus and concludes $100$ divides the power evenly.",
      "2": "Indexes the four-term cycle from zero rather than one, landing on $7^1 = 7$.",
      "3": "Slips one place in the cycle and answers with $7^3 \\equiv 43$.",
      "4": "Slips two places in the cycle and answers with $7^2 = 49$.",
    },
    numeric_check: "1",
    check() {
      let r = 1;
      for (let i = 0; i < 100; i++) r = (r * 7) % 100;
      return { kind: "value", value: r };
    },
    trap_values() {
      const pow = (e) => {
        let r = 1;
        for (let i = 0; i < e; i++) r = (r * 7) % 100;
        return r;
      };
      return { "0": 0, "2": pow(1), "3": pow(3), "4": pow(2) };
    },
  },

  // ── 4. the units digit of a sum of two powers ──────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 5,
    stem_md:
      "What is the units digit of $3^{47} + 7^{23}$?",
    choices: ["$0$", "$2$", "$4$", "$6$", "$10$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nUnits digits of powers of $3$ cycle $3, 9, 7, 1$ with period $4$. Since $47 = 4(11) + 3$, the third entry applies: $3^{47}$ ends in $7$. Powers of $7$ cycle $7, 9, 3, 1$, also period $4$, and $23 = 4(5) + 3$, so $7^{23}$ ends in $3$. The sum ends in $7 + 3 = 10$, whose units digit is $0$.\n\n**Trigger cue**\nUnits digit of a *sum* of powers — take each units digit from its own cycle, add, then take the units digit again; a carry is easy to leave on the table.\n\n**Takeaway**\nAdd the units digits, then take the units digit again.",
    fastest_path_md:
      "$47 \\bmod 4 = 3 \\Rightarrow 3^{47}$ ends in $7$; $23 \\bmod 4 = 3 \\Rightarrow 7^{23}$ ends in $3$; $7 + 3 = 10$, so the units digit is $0$.",
    trap_map: {
      "1": "Treats both exponents as multiples of $4$, taking units digits $1$ and $1$.",
      "2": "Takes $3^{47}$ as ending in $1$ and $7^{23}$ as ending in $3$, slipping one place in the first cycle only.",
      "3": "Slips one place in both cycles, using $9$ and $7$ to get $16$.",
      "4": "Adds the two units digits and reports the sum $10$ rather than its units digit.",
    },
    numeric_check: "0",
    check() {
      const unitsOf = (base, exp) => {
        let r = 1;
        for (let i = 0; i < exp; i++) r = (r * base) % 10;
        return r;
      };
      return { kind: "value", value: (unitsOf(3, 47) + unitsOf(7, 23)) % 10 };
    },
    trap_values() {
      return { "1": 1 + 1, "2": (1 + 3) % 10, "3": (9 + 7) % 10, "4": 7 + 3 };
    },
  },

  // ══ consecutive_evenly_spaced ═══════════════════════════════════════════

  // ── 5. an evenly spaced run pinned by its sum ──────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 5,
    stem_md:
      "The sum of seven consecutive even integers is $224$. What is the largest of the seven?",
    choices: ["$26$", "$32$", "$35$", "$36$", "$38$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\nIn any evenly spaced set with an odd number of terms, the mean equals the middle term. Here the mean is $224/7 = 32$, so the fourth term is $32$. Consecutive *even* integers step by $2$, so the largest is three steps up: $32 + 3(2) = 38$. The run is $26, 28, 30, 32, 34, 36, 38$.\n\n**Trigger cue**\nAn evenly spaced set with an odd count and a stated sum — divide to get the mean, which *is* the middle term, then step outward by the spacing.\n\n**Takeaway**\nOdd-count evenly spaced sets: the mean is the middle term.",
    fastest_path_md:
      "Mean $= 224/7 = 32$ is the middle term; the largest is $32 + 6 = 38$.",
    trap_map: {
      "0": "Answers with the smallest term, $32 - 6 = 26$.",
      "1": "Answers with the mean $32$, which is the middle term rather than the largest.",
      "2": "Treats them as consecutive integers with spacing $1$, giving $32 + 3 = 35$.",
      "3": "Stops one term short of the largest, at $36$.",
    },
    numeric_check: "224/7 + 3*2",
    check() {
      // Search the smallest term directly.
      const found = [];
      for (let start = -1000; start <= 1000; start += 2) {
        let sum = 0;
        for (let i = 0; i < 7; i++) sum += start + 2 * i;
        if (sum === 224) found.push(start + 12);
      }
      if (found.length !== 1) throw new Error(`expected one run, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 32 - 6, "1": 32, "2": 32 + 3, "3": 32 + 4 };
    },
  },

  // ── 6. counting multiples inside an open range ─────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 5,
    stem_md:
      "How many multiples of $6$ lie strictly between $100$ and $500$?",
    choices: ["$33$", "$65$", "$66$", "$67$", "$68$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe first multiple of $6$ above $100$ is $102$ and the last below $500$ is $498$. Those endpoints and everything between form an evenly spaced set with spacing $6$, so the count is $\\dfrac{498 - 102}{6} + 1 = \\dfrac{396}{6} + 1 = 66 + 1 = 67$.\n\n**Trigger cue**\n\"How many multiples between\" — find the first and last multiple actually inside the range, then use (last − first)/spacing + 1; the $+1$ counts the first term itself.\n\n**Takeaway**\nCount evenly spaced terms as gaps plus one, not gaps.",
    fastest_path_md:
      "First $102$, last $498$: $(498 - 102)/6 + 1 = 67$.",
    trap_map: {
      "0": "Counts multiples of $12$ instead of $6$: $(492 - 108)/12 + 1 = 33$.",
      "1": "Skips one multiple at each end, using $108$ and $492$: $(492 - 108)/6 + 1 = 65$.",
      "2": "Drops the $+1$, counting the gaps between multiples rather than the multiples.",
      "4": "Adds one at each end, treating $100$ and $500$ as though they were multiples of $6$.",
    },
    numeric_check: "(498 - 102)/6 + 1",
    check() {
      let count = 0;
      for (let n = 101; n < 500; n++) if (n % 6 === 0) count++;
      return { kind: "value", value: count };
    },
    trap_values() {
      let twelves = 0;
      for (let n = 101; n < 500; n++) if (n % 12 === 0) twelves++;
      return { "0": twelves, "1": (492 - 108) / 6 + 1, "2": (498 - 102) / 6, "4": 67 + 1 };
    },
  },

  // ══ prime_factorization ═════════════════════════════════════════════════

  // ── 7. counting the square divisors ────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 5,
    stem_md:
      "If $n = 2^5 \\cdot 3^4 \\cdot 5^2$, how many positive divisors of $n$ are perfect squares?",
    choices: ["$4$", "$9$", "$18$", "$30$", "$90$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nA divisor $2^a 3^b 5^c$ is a perfect square exactly when $a$, $b$ and $c$ are all even. The admissible exponents are $a \\in \\{0, 2, 4\\}$ (three choices, capped by $5$), $b \\in \\{0, 2, 4\\}$ (three), and $c \\in \\{0, 2\\}$ (two). Multiplying: $3 \\times 3 \\times 2 = 18$.\n\n**Trigger cue**\n\"Divisors that are perfect squares\" — count the *even* exponents available for each prime, which is $\\lfloor e/2 \\rfloor + 1$; the $+1$ is the exponent zero.\n\n**Takeaway**\nSquare divisors: count even exponents, and zero is one of them.",
    fastest_path_md:
      "Even exponents available: $3$ for $2^5$, $3$ for $3^4$, $2$ for $5^2$. Product $18$.",
    trap_map: {
      "0": "Forgets that exponent zero is available, using $\\lfloor e/2 \\rfloor$ instead of $\\lfloor e/2 \\rfloor + 1$: $2 \\times 2 \\times 1 = 4$.",
      "1": "Drops the prime $5$ entirely, computing $3 \\times 3 = 9$.",
      "3": "Computes the *total* divisor count but drops the prime $5$: $6 \\times 5 = 30$.",
      "4": "Answers with the total number of divisors, $6 \\times 5 \\times 3 = 90$.",
    },
    numeric_check: "3*3*2",
    check() {
      // Enumerate every divisor and test squareness outright.
      const n = 2 ** 5 * 3 ** 4 * 5 ** 2;
      let count = 0;
      for (let d = 1; d <= n; d++) {
        if (n % d !== 0) continue;
        const r = Math.round(Math.sqrt(d));
        if (r * r === d) count++;
      }
      return { kind: "value", value: count };
    },
    trap_values() {
      return { "0": 2 * 2 * 1, "1": 3 * 3, "3": 6 * 5, "4": 6 * 5 * 3 };
    },
  },

  // ── 8. the smallest multiplier that completes a cube ───────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 5,
    stem_md:
      "What is the least positive integer $k$ such that $1176k$ is the cube of an integer?",
    choices: ["$7$", "$9$", "$21$", "$63$", "$441$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFactor: $1176 = 2^3 \\cdot 3 \\cdot 7^2$. A perfect cube needs every exponent to be a multiple of $3$. The $2^3$ is already fine; $3^1$ needs two more threes; $7^2$ needs one more seven. So $k = 3^2 \\cdot 7 = 63$, and $1176 \\times 63 = 74088 = 42^3$.\n\n**Trigger cue**\n\"Least $k$ making a cube\" — factor, then supply each prime with exactly what its exponent needs to reach the next multiple of three; anything extra is not least.\n\n**Takeaway**\nSupply each prime only what it needs to reach a multiple of three.",
    fastest_path_md:
      "$1176 = 2^3 \\cdot 3 \\cdot 7^2$, so $k = 3^2 \\cdot 7 = 63$ and the cube is $42^3$.",
    trap_map: {
      "0": "Fixes only the exponent on $7$, leaving $3^1$ short: $k = 7$.",
      "1": "Fixes only the exponent on $3$, leaving $7^2$ short: $k = 9$.",
      "2": "Multiplies each deficient prime just once rather than by the power it needs: $3 \\times 7 = 21$.",
      "4": "Squares both corrections, using $3^2 \\cdot 7^2$ instead of $3^2 \\cdot 7$.",
    },
    numeric_check: "9*7",
    check() {
      for (let k = 1; k <= 100_000; k++) {
        const n = 1176 * k;
        const root = Math.round(Math.cbrt(n));
        if (root * root * root === n) return { kind: "value", value: k };
      }
      throw new Error("no k found");
    },
    trap_values() {
      return { "0": 7, "1": 9, "2": 3 * 7, "4": 9 * 49 };
    },
  },

  // ══ exponents_roots_properties ══════════════════════════════════════════

  // ── 9. one base, three towers ──────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 5,
    stem_md:
      "If $4^{x} \\cdot 8^{x-1} = 16^{x+1}$, what is the value of $x$?",
    choices: ["$1$", "$2$", "$4$", "$5$", "$7$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\nRewrite everything on base $2$: $4^x = 2^{2x}$, $8^{x-1} = 2^{3(x-1)} = 2^{3x-3}$, and $16^{x+1} = 2^{4(x+1)} = 2^{4x+4}$. Multiplying on the left *adds* exponents: $2x + 3x - 3 = 4x + 4$, so $5x - 3 = 4x + 4$ and $x = 7$.\n\nCheck: $4^7 \\cdot 8^6 = 2^{14} \\cdot 2^{18} = 2^{32}$, and $16^8 = 2^{32}$.\n\n**Trigger cue**\nDifferent bases that are all powers of one number — convert to that common base first, and distribute the outer exponent over the whole bracket.\n\n**Takeaway**\nOne common base, then add exponents across a product.",
    fastest_path_md:
      "On base $2$: $2x + (3x - 3) = 4x + 4$, so $x = 7$.",
    trap_map: {
      "0": "Flips the sign moving the $-3$ across, solving $5x + 3 = 4x + 4$ for $x = 1$.",
      "1": "Multiplies the exponents instead of adding them across the product, solving $2x(3x-3) = 4x+4$ and taking the positive root $x = 2$.",
      "2": "Mis-converts $8$ as $2^4$, giving $2x + 4x - 4 = 4x + 4$ and $x = 4$.",
      "3": "Fails to distribute, expanding $8^{x-1}$ as $2^{3x-1}$: $2x + 3x - 1 = 4x + 4$ gives $x = 5$.",
    },
    numeric_check: "7",
    check() {
      // Test candidate exponents against the actual powers.
      const found = [];
      for (let x = -50; x <= 50; x++) {
        const left = Math.pow(4, x) * Math.pow(8, x - 1);
        const right = Math.pow(16, x + 1);
        // Compare as a ratio: an absolute tolerance would call every
        // sufficiently negative x a solution, since both sides vanish.
        if (Math.abs(left / right - 1) < 1e-9) found.push(x);
      }
      if (found.length !== 1) throw new Error(`expected one x, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 1, "1": 2, "2": 8 / 2, "3": 5 };
    },
  },

  // ── 10. a radical equation with an inviting shortcut ───────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 5,
    stem_md:
      "If $\\sqrt{x + 7} - \\sqrt{x} = 1$, what is the value of $x$?",
    choices: ["$1$", "$3$", "$9$", "$16$", "$49$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nIsolate one radical before squaring: $\\sqrt{x+7} = 1 + \\sqrt{x}$. Squaring gives $x + 7 = 1 + 2\\sqrt{x} + x$, so $6 = 2\\sqrt{x}$ and $\\sqrt{x} = 3$, hence $x = 9$. Verify in the original: $\\sqrt{16} - \\sqrt{9} = 4 - 3 = 1$.\n\n**Trigger cue**\nA difference of two radicals set equal to a constant — move one radical across *before* squaring, so exactly one cross term survives.\n\n**Takeaway**\nIsolate one radical before squaring; squaring a difference leaves a cross term.",
    fastest_path_md:
      "$\\sqrt{x+7} = 1 + \\sqrt x$, square: $6 = 2\\sqrt x$, so $x = 9$.",
    trap_map: {
      "0": "Squares term by term to $x + 7 - x = 1$, gets the false statement $7 = 1$, and answers with the right-hand side.",
      "1": "Solves correctly but answers with $\\sqrt{x} = 3$ rather than $x$.",
      "3": "Answers with $x + 7 = 16$, the quantity under the first radical.",
      "4": "Squares term by term to $7 = 1$, then squares the leftover $7$ to get $49$.",
    },
    numeric_check: "9",
    check() {
      const found = [];
      for (let cents = 0; cents <= 100_000; cents++) {
        const x = cents / 100;
        if (Math.abs(Math.sqrt(x + 7) - Math.sqrt(x) - 1) < 1e-12) found.push(x);
      }
      if (found.length !== 1) throw new Error(`expected one x, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 1, "1": Math.sqrt(9), "3": 9 + 7, "4": 49 };
    },
  },

  // ══ divisibility_gcf_lcm ════════════════════════════════════════════════

  // ── 11. the product identity for GCF and LCM ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 5,
    stem_md:
      "Two positive integers have a least common multiple of $180$ and a greatest common factor of $6$. If one of the integers is $36$, what is the other?",
    choices: ["$5$", "$6$", "$30$", "$216$", "$1{,}080$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nFor any two positive integers, $\\gcd(a,b) \\times \\operatorname{lcm}(a,b) = ab$ — each prime's smaller and larger exponent, multiplied, give back both exponents. So $ab = 6 \\times 180 = 1080$, and the other integer is $1080/36 = 30$.\n\nVerify: $\\gcd(36, 30) = 6$ and $\\operatorname{lcm}(36, 30) = 180$.\n\n**Trigger cue**\nGCF and LCM both given with one number known — the product identity gives the other in one division; no factoring needed.\n\n**Takeaway**\nGCF times LCM equals the product of the two numbers.",
    fastest_path_md:
      "$ab = 6 \\times 180 = 1080$, so $b = 1080/36 = 30$.",
    trap_map: {
      "0": "Divides the LCM by the known number, $180/36 = 5$, forgetting the GCF factor.",
      "1": "Answers with the GCF itself, $6$.",
      "3": "Multiplies the known number by the GCF instead of dividing the product: $36 \\times 6 = 216$.",
      "4": "Answers with the product $\\gcd \\times \\operatorname{lcm} = 1{,}080$ rather than the second integer.",
    },
    numeric_check: "6*180/36",
    check() {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const found = [];
      for (let b = 1; b <= 5000; b++) {
        if (gcd(36, b) === 6 && (36 * b) / gcd(36, b) === 180) found.push(b);
      }
      if (found.length !== 1) throw new Error(`expected one integer, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 180 / 36, "1": 6, "3": 36 * 6, "4": 6 * 180 };
    },
  },

  // ── 12. the largest power of a composite dividing a factorial ──────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 5,
    stem_md:
      "What is the greatest integer $n$ for which $12^{n}$ is a factor of $20!$?",
    choices: ["$6$", "$8$", "$9$", "$10$", "$18$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n$12 = 2^2 \\cdot 3$, so $12^n$ needs $2^{2n}$ and $3^{n}$. Count each prime in $20!$ by Legendre's method — add the number of multiples of the prime, then of its square, and so on.\n\nTwos: $\\lfloor 20/2 \\rfloor + \\lfloor 20/4 \\rfloor + \\lfloor 20/8 \\rfloor + \\lfloor 20/16 \\rfloor = 10 + 5 + 2 + 1 = 18$.\nThrees: $\\lfloor 20/3 \\rfloor + \\lfloor 20/9 \\rfloor = 6 + 2 = 8$.\n\nThe twos allow $\\lfloor 18/2 \\rfloor = 9$ copies; the threes allow $8$. The binding constraint is the smaller: $n = 8$.\n\n**Trigger cue**\nA composite power dividing a factorial — count each prime in the factorial separately, divide by its exponent in the composite, and take the minimum.\n\n**Takeaway**\nCount each prime, divide by its exponent, take the minimum.",
    fastest_path_md:
      "$20!$ holds $18$ twos and $8$ threes. $12^n$ needs $2n$ twos ($n \\le 9$) and $n$ threes ($n \\le 8$). So $n = 8$.",
    trap_map: {
      "0": "Counts only the multiples of $3$ up to $20$, missing that $9$ and $18$ each contribute a second three: $n = 6$.",
      "2": "Uses only the power of $2$, taking $\\lfloor 18/2 \\rfloor = 9$ and never checking the threes.",
      "3": "Counts the twos as just the ten even numbers up to $20$, giving $\\lfloor 10/2 \\rfloor = 5$ — then, taking the larger of the two bounds instead of the smaller, reports the ten even numbers themselves.",
      "4": "Answers with the exponent of $2$ in $20!$ without dividing by the $2$ in $2^2$.",
    },
    numeric_check: "8",
    check() {
      // Build 20! exactly with BigInt and divide it down.
      let fact = 1n;
      for (let i = 2n; i <= 20n; i++) fact *= i;
      let n = 0;
      let power = 12n;
      while (fact % power === 0n) {
        n++;
        power *= 12n;
      }
      return { kind: "value", value: n };
    },
    trap_values() {
      return { "0": 6, "2": Math.floor(18 / 2), "3": 10, "4": 18 };
    },
  },

  // ══ parity_signs ════════════════════════════════════════════════════════

  // ── 13. a quadratic residue forced by parity ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 5,
    stem_md:
      "If $n$ is an odd integer, what is the remainder when $n^2 + 4n + 7$ is divided by $8$?",
    choices: ["$0$", "$1$", "$3$", "$4$", "$7$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nWrite $n = 2k + 1$. Then $n^2 = 4k^2 + 4k + 1 = 4k(k+1) + 1$, and $k(k+1)$ is a product of consecutive integers, hence even — so $4k(k+1)$ is a multiple of $8$ and $n^2 \\equiv 1 \\pmod 8$. Also $4n = 4(2k+1) = 8k + 4 \\equiv 4$. Adding: $n^2 + 4n + 7 \\equiv 1 + 4 + 7 = 12 \\equiv 4 \\pmod 8$.\n\n**Trigger cue**\nA parity condition with a modulus of $8$ — substitute $2k+1$ and look for the consecutive-integer product; the square of any odd number is $1$ more than a multiple of $8$.\n\n**Takeaway**\nAn odd square is always one more than a multiple of eight.",
    fastest_path_md:
      "Odd squares are $\\equiv 1 \\pmod 8$ and $4n \\equiv 4$ for odd $n$, so the total is $1 + 4 + 7 = 12 \\equiv 4$.",
    trap_map: {
      "0": "Assumes $8$ divides the whole expression because $n^2 + 4n$ looks like a multiple of $4$.",
      "1": "Uses $n^2 \\equiv 1 \\pmod 8$ and stops there, dropping the $4n + 7$.",
      "2": "Tests an even $n$ such as $2$, getting $19 \\equiv 3$, in violation of the stated parity.",
      "4": "Treats $n^2 + 4n$ as divisible by $8$ and reads off the constant term $7$.",
    },
    numeric_check: "4",
    check() {
      const seen = new Set();
      for (let n = -199; n <= 199; n += 2) {
        seen.add((((n * n + 4 * n + 7) % 8) + 8) % 8);
      }
      if (seen.size !== 1) throw new Error(`remainder is not constant: ${[...seen]}`);
      return { kind: "value", value: [...seen][0] };
    },
    trap_values() {
      const at = (n) => (((n * n + 4 * n + 7) % 8) + 8) % 8;
      return { "0": 0, "1": 1, "2": at(2), "4": 7 };
    },
  },

  // ── 14. counting sign-and-magnitude conditions together ────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 5,
    stem_md:
      "Each of $x$ and $y$ is chosen from the set $\\{-3, -2, -1, 1, 2, 3\\}$, and the pair $(x, y)$ is ordered. For how many such ordered pairs is $xy < 0$ and $x + y > 0$?",
    choices: ["$3$", "$6$", "$9$", "$12$", "$18$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n$xy < 0$ forces opposite signs. Given opposite signs, $x + y > 0$ requires the positive one to have the larger magnitude. The magnitude pairs (positive, negative) satisfying that are $(2,1)$, $(3,1)$ and $(3,2)$ — three combinations. Each can be written with the positive value first or second, so there are $3 \\times 2 = 6$ ordered pairs: $(2,-1), (-1,2), (3,-1), (-1,3), (3,-2), (-2,3)$.\n\n**Trigger cue**\nA sign condition plus a sum condition — the sign condition sets opposite signs, and the sum condition then becomes a comparison of magnitudes.\n\n**Takeaway**\nOpposite signs: the sum's sign follows the larger magnitude.",
    fastest_path_md:
      "Opposite signs with the positive one bigger: magnitudes $(2,1), (3,1), (3,2)$, each in two orders — $6$ pairs.",
    trap_map: {
      "0": "Counts unordered pairs, missing that $(2,-1)$ and $(-1,2)$ are different ordered pairs.",
      "2": "Fixes $x$ positive and $y$ negative and drops the sum condition entirely: $3 \\times 3 = 9$.",
      "3": "Reads $x + y > 0$ as $x + y \\ne 0$, admitting the six pairs whose sum is negative as well.",
      "4": "Counts every opposite-sign ordered pair, ignoring the sum condition: $18$.",
    },
    numeric_check: "6",
    check() {
      const values = [-3, -2, -1, 1, 2, 3];
      let count = 0;
      for (const x of values) {
        for (const y of values) {
          if (x * y < 0 && x + y > 0) count++;
        }
      }
      return { kind: "value", value: count };
    },
    trap_values() {
      const values = [-3, -2, -1, 1, 2, 3];
      let unordered = 0;
      let xPositive = 0;
      let nonzeroSum = 0;
      let oppositeSigns = 0;
      for (const x of values) {
        for (const y of values) {
          if (x * y < 0 && x + y > 0 && x > 0) unordered++;
          if (x > 0 && y < 0) xPositive++;
          if (x * y < 0 && x + y !== 0) nonzeroSum++;
          if (x * y < 0) oppositeSigns++;
        }
      }
      return { "0": unordered, "2": xPositive, "3": nonzeroSum, "4": oppositeSigns };
    },
  },

  // ══ must_be_true_testing ════════════════════════════════════════════════

  // ── 15. a residue condition counted over a range ───────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 5,
    stem_md:
      "For how many integers $n$ with $1 \\le n \\le 100$ is $n^2 + n + 1$ divisible by $3$?",
    choices: ["$33$", "$34$", "$50$", "$66$", "$67$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nOnly $n$'s residue mod $3$ matters, so test all three cases: $n \\equiv 0 \\Rightarrow 0 + 0 + 1 = 1$; $n \\equiv 1 \\Rightarrow 1 + 1 + 1 = 3 \\equiv 0$; $n \\equiv 2 \\Rightarrow 4 + 2 + 1 = 7 \\equiv 1$. So the expression is divisible by $3$ exactly when $n \\equiv 1 \\pmod 3$.\n\nThose $n$ in range are $1, 4, 7, \\ldots, 100$, an evenly spaced run: $\\dfrac{100 - 1}{3} + 1 = 34$.\n\n**Trigger cue**\nDivisibility of a polynomial over a range — test the handful of residues mod the divisor rather than any actual values; three cases settle every integer.\n\n**Takeaway**\nTest residues, not numbers; three cases decide all integers.",
    fastest_path_md:
      "Only $n \\equiv 1 \\pmod 3$ works. From $1$ to $100$ that is $(100-1)/3 + 1 = 34$ values.",
    trap_map: {
      "0": "Drops the $+1$ in the evenly spaced count, reporting the $33$ gaps instead of the $34$ terms.",
      "2": "Assumes half the integers in the range satisfy the condition.",
      "3": "Counts the complement — the $n$ for which the expression is *not* divisible by $3$.",
      "4": "Counts the complement using the off-by-one figure, $100 - 33 = 67$.",
    },
    numeric_check: "(100 - 1)/3 + 1",
    check() {
      let count = 0;
      for (let n = 1; n <= 100; n++) if ((n * n + n + 1) % 3 === 0) count++;
      return { kind: "value", value: count };
    },
    trap_values() {
      let count = 0;
      for (let n = 1; n <= 100; n++) if ((n * n + n + 1) % 3 === 0) count++;
      return { "0": count - 1, "2": 50, "3": 100 - count, "4": 100 - (count - 1) };
    },
  },

  // ── 16. divisibility of three consecutive integers by 24 ───────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 5,
    stem_md:
      "For how many integers $n$ with $1 \\le n \\le 60$ is $n^3 - n$ divisible by $24$?",
    choices: ["$7$", "$20$", "$30$", "$37$", "$45$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFactor: $n^3 - n = (n-1)n(n+1)$, a product of three consecutive integers. One of any three consecutive integers is a multiple of $3$, so divisibility by $3$ is automatic and only the factor $8$ needs checking.\n\n- If $n$ is odd, $n-1$ and $n+1$ are *consecutive even numbers*, so one of them is a multiple of $4$ and the other of $2$: the product carries at least $8$. Every odd $n$ works — $30$ of them in range.\n- If $n$ is even, $n-1$ and $n+1$ are both odd, so all the twos come from $n$ alone: we need $8 \\mid n$. In range that is $8, 16, 24, 32, 40, 48, 56$ — $7$ values.\n\nTotal: $30 + 7 = 37$.\n\n**Trigger cue**\nA product of consecutive integers tested against a composite — split the divisor into prime powers; the consecutive structure usually settles the odd primes for free, leaving only the power of two to check.\n\n**Takeaway**\nThree consecutive integers give the three free; only the twos need work.",
    fastest_path_md:
      "$(n-1)n(n+1)$ is always divisible by $3$. Odd $n$ straddles two consecutive evens and clears $8$ automatically ($30$ values); even $n$ needs $8 \\mid n$ ($7$ values). Total $37$.",
    trap_map: {
      "0": "Counts only the multiples of $8$, missing that every odd $n$ also works.",
      "1": "Assumes divisibility by $24$ requires $3 \\mid n$ and counts the $20$ multiples of $3$.",
      "2": "Counts only the odd $n$, missing the multiples of $8$.",
      "4": "Counts the odd $n$ plus every multiple of $4$ rather than of $8$: $30 + 15 = 45$.",
    },
    numeric_check: "30 + 7",
    check() {
      let count = 0;
      for (let n = 1; n <= 60; n++) if ((n * n * n - n) % 24 === 0) count++;
      return { kind: "value", value: count };
    },
    trap_values() {
      let eights = 0;
      let threes = 0;
      let odds = 0;
      let fours = 0;
      for (let n = 1; n <= 60; n++) {
        if (n % 8 === 0) eights++;
        if (n % 3 === 0) threes++;
        if (n % 2 === 1) odds++;
        if (n % 4 === 0) fours++;
      }
      return { "0": eights, "1": threes, "2": odds, "4": odds + fours };
    },
  },
];

verifyAndAppend(items, {
  dryRun: !process.env.APPEND,
  requireTrapValues: true,
});
