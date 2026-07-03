/**
 * Batch: 9 new questions for subtopic "remainders_units_digits"
 * (fundamental_skill "value_order_factors", content_domain "arithmetic").
 * Cells: D4 PS pure, D2 PS real, D3 PS pure, D3 DS pure, D4 PS pure,
 *        D4 PS pure, D4 PS real, D4 DS pure, D5 PS pure.
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D4 PS pure — polynomial remainder from a known residue
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "The positive integer $n$ leaves a remainder of $5$ when divided by $9$. What is the remainder when $4n^2 + 7n + 6$ is divided by $9$?",
    choices: ["$0$", "$2$", "$6$", "$7$", "$8$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSince $n \\equiv 5 \\pmod 9$, we have $n^2 \\equiv 25 \\equiv 7 \\pmod 9$. Then $4n^2 + 7n + 6 \\equiv 4 \\cdot 7 + 7 \\cdot 5 + 6 = 28 + 35 + 6 = 69 \\pmod 9$, and $69 = 9 \\cdot 7 + 6$, so the remainder is $6$.\n\n**Trigger cue**\n\nA polynomial in $n$ with $n$'s remainder given: substitute the residue and reduce term by term.\n\n**Takeaway**\n\nSubstitute the remainder for $n$; reduce modulo $9$ at every step.",
    fastest_path_md:
      "Use the smallest qualifying value $n = 5$: $4(25) + 35 + 6 = 141 = 9 \\cdot 15 + 6$, so the remainder is $6$.",
    trap_map: {
      "0": "Drops the constant term $6$, computing $141 - 6 = 135 \\equiv 0 \\pmod 9$.",
      "1": "Mis-reduces $25$ to $6$ modulo $9$, giving $24 + 35 + 6 = 65 \\equiv 2$.",
      "3": "Replaces $n^2$ by $n$'s residue $5$ instead of squaring: $20 + 35 + 6 = 61 \\equiv 7$.",
      "4": "Sets $n \\equiv 1$ and sums the coefficients: $4 + 7 + 6 = 17 \\equiv 8$.",
    },
    numeric_check: "mod(4*25 + 7*5 + 6, 9)",
    check() {
      const rems = new Set();
      for (let n = 5; n <= 5 + 9 * 60; n += 9) {
        rems.add((4 * n * n + 7 * n + 6) % 9);
      }
      if (rems.size !== 1) throw new Error("remainder not unique across n ≡ 5 (mod 9)");
      return { kind: "value", value: [...rems][0] };
    },
  },

  // 2. D2 PS real — shortfall to the next full group
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 2,
    stem_md:
      "A community kitchen has $530$ bread rolls and packs them into bags that hold exactly $12$ rolls each. After filling as many complete bags as possible, how many additional rolls would the kitchen need in order to fill one more complete bag?",
    choices: ["$2$", "$10$", "$12$", "$44$", "$45$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nDivide: $530 = 12 \\cdot 44 + 2$, so $44$ complete bags are filled and $2$ rolls remain. One more complete bag needs $12$ rolls, so the kitchen needs $12 - 2 = 10$ additional rolls.\n\n**Trigger cue**\n\nWhen a question asks how many more items reach the next full group, find the remainder first, then subtract it from the group size.\n\n**Takeaway**\n\nShortfall to the next multiple equals divisor minus remainder.",
    fastest_path_md:
      "$12 \\cdot 44 = 528$, so $2$ rolls are left over; the gap to a full bag is $12 - 2 = 10$.",
    trap_map: {
      "0": "Reports the leftover rolls ($530 - 528 = 2$) instead of the shortfall to the next full bag.",
      "2": "Ignores the $2$ leftover rolls and assumes an entire new bag of $12$ must be supplied from scratch.",
      "3": "Reports the number of complete bags filled, $44$, answering the wrong question.",
      "4": "Reports the number of bags needed to hold every roll, $45$, instead of the missing rolls.",
    },
    numeric_check: "12 - mod(530, 12)",
    check() {
      let rolls = 530;
      while (rolls >= 12) rolls -= 12; // pack complete bags one at a time
      return { kind: "value", value: 12 - rolls };
    },
  },

  // 3. D3 PS pure — units digit of a two-digit base power
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 3,
    stem_md: "What is the units digit of $57^{34}$?",
    choices: ["$1$", "$3$", "$5$", "$7$", "$9$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nOnly the units digit $7$ of the base matters. Powers of $7$ end in $7, 9, 3, 1$ with period $4$. Since $34 = 4 \\cdot 8 + 2$, the units digit of $57^{34}$ matches the second entry of the cycle, which is $9$.\n\n**Trigger cue**\n\nA huge power of a multi-digit base: strip the base to its units digit, then reduce the exponent by the cycle length.\n\n**Takeaway**\n\nOnly the base's units digit and the exponent's position in the cycle matter.",
    fastest_path_md:
      "$7^2 = 49$ ends in $9$; because $34 \\equiv 2 \\pmod 4$, the answer is the same as for $7^2$: $9$.",
    trap_map: {
      "0": "Miscomputes $34 \\bmod 4$ as $0$ and reads the last cycle entry, $1$.",
      "1": "Reads the third entry of the cycle $7, 9, 3, 1$ after an off-by-one in the exponent reduction.",
      "2": "Works with the tens digit $5$ of the base, whose powers all end in $5$.",
      "3": "Assumes every power of a number ending in $7$ still ends in $7$.",
    },
    numeric_check: "mod(49, 10)",
    check() {
      let u = 1;
      for (let i = 0; i < 34; i++) u = (u * 57) % 10;
      return { kind: "value", value: u };
    },
  },

  // 4. D3 DS pure — recovering a units digit from product facts
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 3,
    stem_md:
      "What is the units digit of the positive integer $n$?\n\n(1) The units digit of $7n$ is $1$.\n\n(2) The units digit of $4n$ is $2$.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nOnly the units digit $d$ of $n$ matters. From (1): scan $7d$ for $d = 0$ through $9$; the units digits are $0, 7, 4, 1, 8, 5, 2, 9, 6, 3$, and only $d = 3$ gives $1$. Statement (1) pins $d = 3$ — sufficient. From (2): the units digits of $4d$ are $0, 4, 8, 2, 6, 0, 4, 8, 2, 6$; both $d = 3$ and $d = 8$ give $2$, so statement (2) leaves two possibilities — not sufficient.\n\n**Trigger cue**\n\nA units digit described through a multiple: test all ten digits and count the preimages.\n\n**Takeaway**\n\nMultiplying by $7$ permutes units digits; multiplying by $4$ collapses them.",
    fastest_path_md:
      "For (1), $7 \\cdot 3 = 21$ is the only way to end in $1$ — sufficient. For (2), $4 \\cdot 3 = 12$ and $4 \\cdot 8 = 32$ both end in $2$ — not sufficient. Answer: statement (1) alone.",
    trap_map: {
      "1": "Believes a units digit of $2$ for $4n$ pins $n$'s digit, missing that both $3$ and $8$ work.",
      "2": "Assumes a single fact about a product can never determine a digit, so both statements seem necessary.",
      "3": "Checks only $n$ ending in $3$ against statement (2) and never tests $n$ ending in $8$.",
      "4": "Doubts that any digit can be recovered from a product's units digit at all.",
    },
    numeric_check: null,
    check() {
      const digitsAllowed = (pred) => {
        const s = new Set();
        let models = 0;
        for (let n = 1; n <= 5000; n++) {
          if (pred(n)) {
            s.add(n % 10);
            models++;
          }
        }
        if (models < 3) throw new Error("too few models for a statement");
        return s;
      };
      const s1 = (n) => (7 * n) % 10 === 1;
      const s2 = (n) => (4 * n) % 10 === 2;
      const d1 = digitsAllowed(s1);
      const d2 = digitsAllowed(s2);
      const d12 = digitsAllowed((n) => s1(n) && s2(n));
      const suf1 = d1.size === 1;
      const suf2 = d2.size === 1;
      const suf12 = d12.size === 1;
      const index = suf1 && suf2 ? 3 : suf1 ? 0 : suf2 ? 1 : suf12 ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 5. D4 PS pure — combining two remainder conditions (mod 35)
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "When the positive integer $n$ is divided by $5$, the remainder is $3$, and when $n$ is divided by $7$, the remainder is $2$. What is the remainder when $n$ is divided by $35$?",
    choices: ["$5$", "$6$", "$8$", "$17$", "$23$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nWrite $n = 7k + 2$. The mod-$5$ condition gives $7k + 2 \\equiv 3 \\pmod 5$, so $2k \\equiv 1 \\pmod 5$, which forces $k \\equiv 3 \\pmod 5$. Then $k = 5m + 3$ and $n = 7(5m + 3) + 2 = 35m + 23$, so the remainder upon division by $35$ is $23$.\n\n**Trigger cue**\n\nTwo remainder conditions with coprime divisors and a question about their product: merge into a single residue mod the product.\n\n**Takeaway**\n\nList one congruence's values; keep the first that satisfies the other.",
    fastest_path_md:
      "List numbers that leave remainder $2$ upon division by $7$: $2, 9, 16, 23$. The first that leaves remainder $3$ upon division by $5$ is $23$; all solutions repeat every $35$.",
    trap_map: {
      "0": "Adds the two remainders: $3 + 2 = 5$.",
      "1": "Multiplies the two remainders: $3 \\cdot 2 = 6$.",
      "2": "Takes the smallest number with remainder $3$ upon division by $5$ that is not $3$ itself, $8$, ignoring the mod-$7$ condition.",
      "3": "Swaps the conditions, solving $n \\equiv 2 \\pmod 5$ and $n \\equiv 3 \\pmod 7$, whose solution is $17$.",
    },
    numeric_check: "mod(58, 35)",
    check() {
      const rems = new Set();
      let models = 0;
      for (let n = 1; n <= 3000; n++) {
        if (n % 5 === 3 && n % 7 === 2) {
          rems.add(n % 35);
          models++;
        }
      }
      if (models < 5) throw new Error("too few solutions found");
      if (rems.size !== 1) throw new Error("remainder mod 35 not unique");
      return { kind: "value", value: [...rems][0] };
    },
  },

  // 6. D4 PS pure — counting exponents that hit a given units digit
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "For how many integers $n$ from $1$ to $100$ inclusive does $7^n$ have units digit $3$?",
    choices: ["$24$", "$25$", "$26$", "$33$", "$50$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nUnits digits of $7^n$ cycle as $7, 9, 3, 1$ with period $4$, so $7^n$ ends in $3$ exactly when $n \\equiv 3 \\pmod 4$. The qualifying $n$ in $[1, 100]$ are $3, 7, 11, \\ldots, 99$, an arithmetic sequence with $\\frac{99 - 3}{4} + 1 = 25$ terms.\n\n**Trigger cue**\n\nCounting exponents that produce a target units digit: find the cycle, locate the target's position, count that residue class in the range.\n\n**Takeaway**\n\nOne hit per full cycle: divide the range length by the period.",
    fastest_path_md:
      "The cycle $7, 9, 3, 1$ has length $4$ and contains $3$ once, and $1$ to $100$ holds exactly $25$ complete cycles, so the count is $\\frac{100}{4} = 25$.",
    trap_map: {
      "0": "Divides the last qualifying exponent $99$ by the cycle length $4$ and truncates, instead of counting the arithmetic sequence.",
      "2": "Adds an extra term by also counting $n = 100$, even though $7^{100}$ ends in $1$.",
      "3": "Uses a cycle of length $3$ for powers of $7$, estimating $\\frac{100}{3} \\approx 33$.",
      "4": "Assumes the units digit alternates between two values, so half of all exponents qualify.",
    },
    numeric_check: "(99 - 3)/4 + 1",
    check() {
      let count = 0;
      let u = 1;
      for (let n = 1; n <= 100; n++) {
        u = (u * 7) % 10;
        if (u === 3) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // 7. D4 PS real — cyclic schedule, minutes in one phase
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "A fountain show runs a repeating $9$-minute program: water jets for the first $4$ minutes, colored lights for the next $3$ minutes, and mist for the final $2$ minutes, after which the program immediately restarts. The show begins at time zero and runs without interruption. During the first $200$ minutes of the show, for how many complete minutes is the mist active?",
    choices: ["$22$", "$40$", "$44$", "$45$", "$50$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nDivide the elapsed time by the cycle length: $200 = 9 \\cdot 22 + 2$, so $22$ complete programs run, contributing $22 \\cdot 2 = 44$ mist minutes. The leftover $2$ minutes are the start of a new program, which is the jets phase, so they add no mist time. Total: $44$ minutes.\n\n**Trigger cue**\n\nA repeating schedule cut off mid-cycle: count full cycles with division, then walk the remainder through the phases in order.\n\n**Takeaway**\n\nCount full cycles, then trace the leftover minutes phase by phase.",
    fastest_path_md:
      "$200 \\div 9 = 22$ remainder $2$: each full cycle gives $2$ mist minutes ($44$ total), and the extra $2$ minutes are jets, adding nothing.",
    trap_map: {
      "0": "Reports the number of complete cycles, $22$, instead of the mist minutes they contain.",
      "1": "Treats the program as $10$ minutes long, getting $20$ cycles and $20 \\cdot 2 = 40$ mist minutes.",
      "3": "Credits a mist minute inside the leftover $2$ minutes, which actually fall in the jets phase.",
      "4": "Adds the phases to an $8$-minute cycle, getting $25$ cycles and $25 \\cdot 2 = 50$ mist minutes.",
    },
    numeric_check: "22*2",
    check() {
      // simulate minute by minute: cycle position 0-3 jets, 4-6 lights, 7-8 mist
      let mist = 0;
      for (let m = 0; m < 200; m++) {
        const t = m % 9;
        if (t >= 7) mist++;
      }
      return { kind: "value", value: mist };
    },
  },

  // 8. D4 DS pure — units digit of a fourth power
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "If $n$ is a positive integer, what is the units digit of $n^4$?\n\n(1) $n$ is even.\n\n(2) $n$ is not a multiple of $5$.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe units digit of $n^4$ depends only on the units digit of $n$: digits $1, 3, 7, 9$ give $1$; digits $2, 4, 6, 8$ give $6$; digit $5$ gives $5$; digit $0$ gives $0$. From (1), $n$ can end in $0, 2, 4, 6, 8$, so $n^4$ ends in $0$ or $6$ — not sufficient. From (2), $n$ can end in any digit except $0$ and $5$, so $n^4$ ends in $1$ or $6$ — not sufficient. Together, $n$ ends in $2, 4, 6,$ or $8$, and every such digit gives $n^4$ ending in $6$ — sufficient.\n\n**Trigger cue**\n\nA question about the units digit of a fixed power under digit restrictions: tabulate the ten possible outcomes first.\n\n**Takeaway**\n\nFourth powers end only in $0$, $1$, $5$, or $6$.\n",
    fastest_path_md:
      "Tabulate fourth-power endings: $\\{0 \\to 0,\\ 5 \\to 5,\\ \\text{odd} \\to 1,\\ \\text{even} \\to 6\\}$. (1) leaves $\\{0, 6\\}$; (2) leaves $\\{1, 6\\}$; the overlap of the digit restrictions leaves only $6$.",
    trap_map: {
      "0": "Assumes every even $n$ gives $n^4$ ending in $6$, forgetting $n$ ending in $0$.",
      "1": "Assumes every non-multiple of $5$ gives $n^4$ ending in $6$, forgetting odd digits give $1$.",
      "3": "Knows fourth powers end only in $0, 1, 5, 6$ and concludes each statement alone narrows to one digit.",
      "4": "Misses that combining even with not-a-multiple-of-$5$ leaves only $2, 4, 6, 8$, all with fourth powers ending in $6$.",
    },
    numeric_check: null,
    check() {
      const endings = (pred) => {
        const s = new Set();
        let models = 0;
        for (let n = 1; n <= 2000; n++) {
          if (pred(n)) {
            s.add(Math.pow(n, 4) % 10);
            models++;
          }
        }
        if (models < 3) throw new Error("too few models for a statement");
        return s;
      };
      const s1 = (n) => n % 2 === 0;
      const s2 = (n) => n % 5 !== 0;
      const e1 = endings(s1);
      const e2 = endings(s2);
      const e12 = endings((n) => s1(n) && s2(n));
      const suf1 = e1.size === 1;
      const suf2 = e2.size === 1;
      const suf12 = e12.size === 1;
      const index = suf1 && suf2 ? 3 : suf1 ? 0 : suf2 ? 1 : suf12 ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 9. D5 PS pure — factorial sum modulo 8
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 5,
    stem_md:
      "What is the remainder when $1! + 2! + 3! + \\cdots + 40!$ is divided by $8$?",
    choices: ["$0$", "$1$", "$2$", "$3$", "$6$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nFor every $k \\geq 4$, the product $k!$ contains the factors $2$ and $4$, so $8 \\mid k!$ and those terms contribute $0$ modulo $8$. The sum therefore reduces to its first three terms: $1! + 2! + 3! = 1 + 2 + 6 = 9 \\equiv 1 \\pmod 8$.\n\n**Trigger cue**\n\nA long sum of factorials against a small modulus: find where the factorials become multiples of the modulus and discard everything after.\n\n**Takeaway**\n\nFactorials eventually absorb any modulus; only the early terms matter.",
    fastest_path_md:
      "$4! = 24$ is already a multiple of $8$, and every later factorial contains $4!$, so only $1 + 2 + 6 = 9$ survives: remainder $1$.",
    trap_map: {
      "0": "Notes that $4!$ and beyond are multiples of $8$ and forgets the three surviving terms entirely.",
      "2": "Reduces the surviving sum $9$ by $7$ instead of $8$, using the wrong modulus.",
      "3": "Assumes divisibility by $8$ starts at $3!$, keeping only $1! + 2! = 3$.",
      "4": "Reports the last surviving term $3! = 6$ as the remainder.",
    },
    numeric_check: "mod(1 + 2 + 6, 8)",
    check() {
      let sum = 0n;
      let fact = 1n;
      for (let i = 1n; i <= 40n; i++) {
        fact *= i;
        sum += fact;
      }
      return { kind: "value", value: Number(sum % 8n) };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
