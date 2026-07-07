/**
 * Second authoring wave for prime_factorization: +7 to clear the ~25 floor.
 * Every check() recomputes the answer by brute-force factorization or
 * enumeration, independent of the written solution.
 *
 * Run: node --experimental-strip-types scripts/author/batch2-prime_factorization.mjs [--append]
 */
import { verifyAndAppend } from "./harness.mjs";

const isSquare = (n) => {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
};
const primeFactors = (n) => {
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      out.push(p);
      while (m % p === 0) m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
};
const numDivisors = (n) => {
  let c = 0;
  for (let d = 1; d <= n; d++) if (n % d === 0) c++;
  return c;
};

const items = [
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 3,
    stem_md: "How many positive divisors does $600$ have?",
    choices: ["12", "16", "20", "24", "30"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFactor: $600 = 2^3 \\cdot 3^1 \\cdot 5^2$. The number of divisors is the product of one-more-than-each-exponent: $(3+1)(1+1)(2+1) = 4 \\cdot 2 \\cdot 3 = 24$.\n\n**Trigger cue**\n\n\"How many divisors\" of a concrete number: factor, then multiply the exponents each raised by one.\n\n**Takeaway**\n\nDivisor count multiplies each prime exponent plus one.",
    fastest_path_md:
      "Read the exponents off $2^3 3^1 5^2$ and multiply $4 \\cdot 2 \\cdot 3 = 24$ without listing a single divisor.",
    trap_map: {
      "0": "Multiplies the exponents $3 \\cdot 1 \\cdot 5$ (mis-remembering as $2 \\cdot 3 \\cdot 5$ collapsed) instead of adding one to each.",
      "1": "Adds one to only two of the three exponents.",
      "2": "Uses $(3)(2)(3)$, forgetting to add one to the first exponent.",
      "4": "Adds the adjusted exponents $4 + 2 + 3$ and then pads, instead of multiplying.",
    },
    numeric_check: "24",
    check() {
      return { kind: "value", value: numDivisors(600) };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 3,
    stem_md: "What is the sum of the distinct prime factors of $1{,}155$?",
    choices: ["16", "21", "26", "31", "1155"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$1155 = 5 \\cdot 231 = 5 \\cdot 3 \\cdot 77 = 3 \\cdot 5 \\cdot 7 \\cdot 11$. The distinct primes are $3, 5, 7, 11$, summing to $3 + 5 + 7 + 11 = 26$.\n\n**Trigger cue**\n\n\"Sum of distinct prime factors\": peel off small primes one at a time, then add.\n\n**Takeaway**\n\nStrip primes greedily; the leftover is itself prime.",
    fastest_path_md:
      "$1155$ ends in $5$ (factor $5$) and its digits sum to $12$ (factor $3$); $1155/15 = 77 = 7 \\cdot 11$. Add $3+5+7+11 = 26$.",
    trap_map: {
      "0": "Sums $3 + 5 + 7$ but stops before extracting the factor of $11$.",
      "1": "Adds $3 + 7 + 11$, dropping the factor of $5$.",
      "3": "Includes an extra $5$ by counting $55 = 5 \\cdot 11$ as if $55$ were prime.",
      "4": "Reports the number itself, mistaking it for a prime.",
    },
    numeric_check: "26",
    check() {
      return {
        kind: "value",
        value: primeFactors(1155).reduce((s, p) => s + p, 0),
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 4,
    stem_md:
      "What is the smallest positive integer $k$ such that $756k$ is a perfect square?",
    choices: ["3", "7", "21", "42", "84"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFactor $756 = 2^2 \\cdot 3^3 \\cdot 7$. A perfect square needs every exponent even; the odd exponents sit on $3$ and $7$, so multiply by $3 \\cdot 7 = 21$. Then $756 \\cdot 21 = 2^2 \\cdot 3^4 \\cdot 7^2 = 15{,}876 = 126^2$.\n\n**Trigger cue**\n\n\"Smallest multiplier to reach a perfect square\": factor and supply the primes with odd exponents.\n\n**Takeaway**\n\nMake every prime exponent even; multiply by the odd ones.",
    fastest_path_md:
      "$756 = 2^2 3^3 7$. Odd exponents on $3$ and $7$ need one more each: multiplier $3 \\cdot 7 = 21$.",
    trap_map: {
      "0": "Supplies only the missing factor of $3$, ignoring the odd exponent on $7$.",
      "1": "Supplies only the missing factor of $7$, ignoring the odd exponent on $3$.",
      "3": "Uses $2 \\cdot 3 \\cdot 7$, wrongly treating the even exponent on $2$ as deficient.",
      "4": "Uses $2^2 \\cdot 3 \\cdot 7$, over-supplying the already-even power of $2$.",
    },
    numeric_check: "21",
    check() {
      for (let k = 1; k <= 100000; k++) {
        if (isSquare(756 * k)) return { kind: "value", value: k };
      }
      throw new Error("no square multiple found");
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 4,
    stem_md:
      "What is the greatest integer $k$ such that $2^{k}$ is a factor of $32!$ (the product of the integers from $1$ to $32$)?",
    choices: ["16", "24", "31", "32", "63"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLegendre's count: the exponent of $2$ in $32!$ is $\\left\\lfloor \\tfrac{32}{2} \\right\\rfloor + \\left\\lfloor \\tfrac{32}{4} \\right\\rfloor + \\left\\lfloor \\tfrac{32}{8} \\right\\rfloor + \\left\\lfloor \\tfrac{32}{16} \\right\\rfloor + \\left\\lfloor \\tfrac{32}{32} \\right\\rfloor = 16 + 8 + 4 + 2 + 1 = 31$.\n\n**Trigger cue**\n\n\"Highest power of a prime dividing $n!$\": sum the floors of $n$ over increasing prime powers.\n\n**Takeaway**\n\nSum $\\lfloor n/p^i \\rfloor$ over $i$ for the exponent in $n!$.",
    fastest_path_md:
      "Add $16 + 8 + 4 + 2 + 1$ — each term is the previous halved — to get $31$.",
    trap_map: {
      "0": "Counts only the $16$ even numbers, ignoring extra factors of $2$ in multiples of $4, 8, \\ldots$",
      "1": "Stops the floor sum after $16 + 8$.",
      "3": "Off-by-one: uses $32$ instead of summing the floors.",
      "4": "Doubles $32$ or sums $32 + 16 + \\ldots$ without flooring correctly.",
    },
    numeric_check: "31",
    check() {
      let k = 0;
      for (let n = 2; n <= 32; n++) {
        let m = n;
        while (m % 2 === 0) {
          k++;
          m /= 2;
        }
      }
      return { kind: "value", value: k };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 4,
    stem_md:
      "What is the smallest positive integer that has exactly four distinct prime factors?",
    choices: ["24", "60", "210", "1155", "2310"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nTo minimize a number with four distinct primes, use the four smallest primes each to the first power: $2 \\cdot 3 \\cdot 5 \\cdot 7 = 210$. Any larger prime, or a repeated prime, only increases the value.\n\n**Trigger cue**\n\n\"Smallest with exactly $k$ distinct primes\": multiply the $k$ smallest primes, each once.\n\n**Takeaway**\n\nSmallest with $k$ distinct primes is the product of the first $k$ primes.",
    fastest_path_md:
      "Multiply the first four primes: $2 \\cdot 3 = 6$, $6 \\cdot 5 = 30$, $30 \\cdot 7 = 210$.",
    trap_map: {
      "0": "Uses $2^3 \\cdot 3 = 24$, which has only two distinct primes.",
      "1": "Uses $2^2 \\cdot 3 \\cdot 5 = 60$, only three distinct primes.",
      "3": "Multiplies $3 \\cdot 5 \\cdot 7 \\cdot 11 = 1155$, skipping the smallest prime $2$.",
      "4": "Uses the first five primes $2 \\cdot 3 \\cdot 5 \\cdot 7 \\cdot 11 = 2310$.",
    },
    numeric_check: "210",
    check() {
      for (let n = 1; n <= 100000; n++) {
        if (primeFactors(n).length === 4) return { kind: "value", value: n };
      }
      throw new Error("not found");
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 4,
    stem_md: "What is the greatest prime factor of $2^{11} - 2^{8}$?",
    choices: ["2", "7", "31", "127", "1792"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nFactor out the smaller power: $2^{11} - 2^{8} = 2^{8}(2^{3} - 1) = 2^{8} \\cdot 7$. The prime factors are $2$ and $7$, so the greatest is $7$.\n\n**Trigger cue**\n\nA difference of powers of the same base: factor out the lower power first.\n\n**Takeaway**\n\nFactor out the common power; the greatest prime hides in the leftover.",
    fastest_path_md:
      "$2^{8}(2^3 - 1) = 2^8 \\cdot 7$: the only odd prime is $7$.",
    trap_map: {
      "0": "Takes the base $2$ as the largest factor, ignoring the odd cofactor.",
      "2": "Computes $2^5 - 1 = 31$ by mis-factoring the exponents.",
      "3": "Reads $2^7 - 1 = 127$, mismatching the extracted power.",
      "4": "Reports the whole value $2^8 \\cdot 7 = 1792$ without factoring.",
    },
    numeric_check: "7",
    check() {
      const val = 2 ** 11 - 2 ** 8;
      const pf = primeFactors(val);
      return { kind: "value", value: Math.max(...pf) };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 5,
    stem_md:
      "How many positive divisors of $7{,}200$ are perfect squares?",
    choices: ["6", "9", "12", "18", "27"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$7200 = 2^5 \\cdot 3^2 \\cdot 5^2$. A divisor is a perfect square exactly when every prime exponent is even. The even choices are: for $2$, $\\{0, 2, 4\\}$ ($3$ options); for $3$, $\\{0, 2\\}$ ($2$ options); for $5$, $\\{0, 2\\}$ ($2$ options). That gives $3 \\cdot 2 \\cdot 2 = 12$.\n\n**Trigger cue**\n\n\"Perfect-square divisors\": count even exponent choices, one factor per prime.\n\n**Takeaway**\n\nSquare divisors: count even exponents up to each prime's power.",
    fastest_path_md:
      "Even exponents available: $2^5 \\to \\{0,2,4\\}$, $3^2 \\to \\{0,2\\}$, $5^2 \\to \\{0,2\\}$; multiply $3 \\cdot 2 \\cdot 2 = 12$.",
    trap_map: {
      "0": "Multiplies $3 \\cdot 2$ but forgets the second prime with an even option.",
      "1": "Treats each prime as offering $3$ even exponents regardless of its power.",
      "3": "Counts all divisors with the exponent-plus-one rule instead of even-only.",
      "4": "Cubes the count $3$ as if all three primes reached exponent $4$.",
    },
    numeric_check: "12",
    check() {
      let c = 0;
      for (let d = 1; d <= 7200; d++) {
        if (7200 % d === 0 && isSquare(d)) c++;
      }
      return { kind: "value", value: c };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
