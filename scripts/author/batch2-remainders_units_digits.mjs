/**
 * Batch 2: 7 new questions for subtopic "remainders_units_digits"
 * (fundamental_skill "value_order_factors").
 * Cells: D5 PS pure, D4 PS pure (algebra), D4 PS real, D4 DS pure,
 *        D3 DS pure, D3 PS pure, D2 PS real.
 * New angles vs the existing bank: sum of remainders over a range,
 * linked-quotient division algorithm, common-shortfall CRT with a range
 * window, divisor-chain DS sufficiency, exponent-cycle DS, counting a
 * residue class in a range, rebuilding a dividend from quotient+remainder.
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D5 PS pure — sum of remainders across a run of consecutive integers
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 5,
    stem_md:
      "When each of the integers from $1$ to $60$, inclusive, is divided by $7$, what is the sum of the $60$ remainders?",
    choices: ["$168$", "$174$", "$178$", "$180$", "$189$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nAs $n$ runs through consecutive integers, the remainders upon division by $7$ cycle through $1, 2, 3, 4, 5, 6, 0$ with period $7$, and each complete cycle contributes $1 + 2 + 3 + 4 + 5 + 6 + 0 = 21$. Since $60 = 7 \\cdot 8 + 4$, the integers $1$ through $56$ form $8$ complete cycles contributing $8 \\cdot 21 = 168$. The remaining integers $57, 58, 59, 60$ leave remainders $1, 2, 3, 4$, adding $10$. Total: $168 + 10 = 178$.\n\n**Trigger cue**\n\nA sum of remainders over consecutive integers: the remainders repeat with the divisor's period, so sum one cycle, multiply, then handle the partial cycle.\n\n**Takeaway**\n\nRemainders cycle; sum one full cycle, multiply, then add the leftover run.",
    fastest_path_md:
      "Spot that $56 = 7 \\cdot 8$ closes a cycle, so no listing is needed: $8 \\cdot 21 + (1 + 2 + 3 + 4) = 168 + 10 = 178$.",
    trap_map: {
      "0": "Counts only the $8$ complete cycles, $8 \\cdot 21 = 168$, and drops the integers $57$ through $60$.",
      "1": "Starts the leftover run at remainder $0$, adding $0 + 1 + 2 + 3 = 6$ instead of $1 + 2 + 3 + 4$.",
      "3": "Replaces every remainder with the cycle average $3$, computing $60 \\cdot 3 = 180$.",
      "4": "Rounds $60 \\div 7$ up to $9$ complete cycles and computes $9 \\cdot 21 = 189$.",
    },
    numeric_check: "178",
    check() {
      let sum = 0;
      for (let n = 1; n <= 60; n++) sum += n % 7;
      return { kind: "value", value: sum };
    },
  },

  // 2. D4 PS pure (algebra) — two divisions of n with linked quotients
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "When the positive integer $n$ is divided by $12$, the quotient is $q$ and the remainder is $5$. When $n$ is divided by $9$, the quotient is $q + 2$ and the remainder is $2$. What is the value of $n$?",
    choices: ["$29$", "$60$", "$63$", "$65$", "$89$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe division algorithm gives two expressions for the same number: $n = 12q + 5$ and $n = 9(q + 2) + 2 = 9q + 20$. Equating them, $12q + 5 = 9q + 20$, so $3q = 15$ and $q = 5$. Then $n = 12 \\cdot 5 + 5 = 65$, and indeed $65 = 9 \\cdot 7 + 2$ with quotient $7 = q + 2$.\n\n**Trigger cue**\n\nTwo divisions of the same number whose quotients are linked: write each as divisor times quotient plus remainder and equate.\n\n**Takeaway**\n\nTurn each division statement into $n = dq + r$, then equate.",
    fastest_path_md:
      "Backsolve: only $65$ works — $65 \\div 12$ gives quotient $5$, remainder $5$, and $65 \\div 9$ gives quotient $7 = 5 + 2$, remainder $2$.",
    trap_map: {
      "0": "Expands $9(q + 2)$ as $9q + 9$, so $3q = 6$, $q = 2$, and $n = 12 \\cdot 2 + 5 = 29$.",
      "1": "Finds $q = 5$ but reports $12q = 60$, forgetting to add the remainder $5$.",
      "2": "Computes $n$ from the second division as $9 \\cdot 7 = 63$, dropping the remainder $2$.",
      "4": "Substitutes the second quotient $7$ into the first division: $12 \\cdot 7 + 5 = 89$.",
    },
    numeric_check: "65",
    check() {
      const hits = [];
      for (let n = 1; n <= 5000; n++) {
        const q1 = Math.floor(n / 12);
        const q2 = Math.floor(n / 9);
        if (n % 12 === 5 && n % 9 === 2 && q2 === q1 + 2) hits.push(n);
      }
      if (hits.length !== 1) throw new Error(`expected unique n, found ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 3. D4 PS real — common shortfall, lcm, and a range window
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "A flower shop has between $150$ and $200$ roses in stock. If the roses are arranged in bouquets of $12$, then $7$ roses are left over; if they are arranged in bouquets of $15$, then $10$ roses are left over. How many roses does the shop have in stock?",
    choices: ["$151$", "$160$", "$175$", "$187$", "$190$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nBoth conditions have the same shortfall: $12 - 7 = 5$ and $15 - 10 = 5$, so adding $5$ roses would complete a bouquet in either arrangement. Hence $n + 5$ is divisible by both $12$ and $15$, and therefore by $\\operatorname{lcm}(12, 15) = 60$. So $n = 60k - 5$, giving $n \\in \\{55, 115, 175, 235, \\ldots\\}$; the only value between $150$ and $200$ is $175$.\n\n**Trigger cue**\n\nTwo leftover conditions whose remainders sit the same distance below their divisors: add that shortfall and switch to the lcm.\n\n**Takeaway**\n\nEqual shortfalls mean $n$ plus the shortfall is a common multiple.",
    fastest_path_md:
      "Test the choices against both conditions: only $175$ leaves $7$ when divided by $12$ and $10$ when divided by $15$.",
    trap_map: {
      "0": "Satisfies only the bouquets-of-$12$ condition, taking the smallest in-range value $12 \\cdot 12 + 7 = 151$.",
      "1": "Satisfies only the bouquets-of-$15$ condition, taking the smallest in-range value $15 \\cdot 10 + 10 = 160$.",
      "3": "Attaches the remainder $7$ to a multiple of $15$: $15 \\cdot 12 + 7 = 187$.",
      "4": "Attaches the remainder $10$ to a multiple of $12$: $12 \\cdot 15 + 10 = 190$.",
    },
    numeric_check: "175",
    check() {
      const hits = [];
      for (let n = 150; n <= 200; n++) {
        if (n % 12 === 7 && n % 15 === 10) hits.push(n);
      }
      if (hits.length !== 1) throw new Error(`expected unique n, found ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 4. D4 DS pure — divisor-chain sufficiency for a remainder
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 4,
    stem_md:
      "What is the remainder when the positive integer $n$ is divided by $8$?\n\n(1) When $n$ is divided by $4$, the remainder is $1$.\n\n(2) When $n$ is divided by $24$, the remainder is $17$.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nStatement (1): $n = 4k + 1$, so modulo $8$ the value is $1$ when $k$ is even and $5$ when $k$ is odd — for example $n = 1$ gives remainder $1$ while $n = 5$ gives remainder $5$. Not sufficient. Statement (2): $n = 24m + 17$; since $8$ divides $24$, every such $n$ satisfies $n \\equiv 17 \\equiv 1 \\pmod 8$. Sufficient. Answer: statement (2) alone.\n\n**Trigger cue**\n\nA remainder is asked for one modulus while a statement gives a remainder for another: sufficiency requires the question's modulus to divide the statement's.\n\n**Takeaway**\n\nA remainder modulo $24$ fixes the remainder modulo any divisor of $24$.",
    fastest_path_md:
      "$8$ divides $24$, so the mod-$24$ remainder collapses to one mod-$8$ value ($17 \\to 1$); a mod-$4$ remainder splits into two mod-$8$ possibilities ($1$ or $5$).",
    trap_map: {
      "0": "Tests statement (1) only with $n = 1$ and $n = 9$, missing $n = 5$, and distrusts statement (2) because $17$ exceeds $8$.",
      "2": "Misses that $8$ divides $24$, so statement (2) alone already fixes the remainder at $1$.",
      "3": "Believes a remainder mod $4$ pins the remainder mod $8$, overlooking that $n = 1$ and $n = 5$ both satisfy (1).",
      "4": "Assumes a remainder mod $8$ can only come from information about division by $8$ itself, rejecting both statements.",
    },
    numeric_check: null,
    check() {
      const remainders = (pred) => {
        const s = new Set();
        let models = 0;
        for (let n = 1; n <= 5000; n++) {
          if (pred(n)) {
            s.add(n % 8);
            models++;
          }
        }
        if (models < 3) throw new Error("too few models for a statement");
        return s;
      };
      const s1 = (n) => n % 4 === 1;
      const s2 = (n) => n % 24 === 17;
      const r1 = remainders(s1);
      const r2 = remainders(s2);
      const r12 = remainders((n) => s1(n) && s2(n));
      const suf1 = r1.size === 1;
      const suf2 = r2.size === 1;
      const suf12 = r12.size === 1;
      const index = suf1 && suf2 ? 3 : suf1 ? 0 : suf2 ? 1 : suf12 ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 5. D3 DS pure — exponent cycle vs parity
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 3,
    stem_md:
      "If $n$ is a positive integer, what is the units digit of $3^n$?\n\n(1) When $n$ is divided by $4$, the remainder is $2$.\n\n(2) $n$ is even.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nUnits digits of $3^n$ cycle $3, 9, 7, 1$ with period $4$. Statement (1): $n \\equiv 2 \\pmod 4$ lands on the second cycle entry for every such $n$, so the units digit is always $9$ — sufficient. Statement (2): an even $n$ can satisfy $n \\equiv 2 \\pmod 4$ (digit $9$, e.g. $3^2 = 9$) or $n \\equiv 0 \\pmod 4$ (digit $1$, e.g. $3^4 = 81$) — not sufficient. Answer: statement (1) alone.\n\n**Trigger cue**\n\nA units digit of a power with the exponent described by remainder conditions: compare each condition against the length of the units-digit cycle.\n\n**Takeaway**\n\nThe exponent's remainder mod the cycle length fixes the units digit.",
    fastest_path_md:
      "The cycle has length $4$, so $n$'s remainder mod $4$ — exactly what statement (1) supplies — settles the digit; parity alone straddles $9$ and $1$.",
    trap_map: {
      "1": "Assumes every even power of $3$ ends in $9$, overlooking $3^4 = 81$.",
      "2": "Misses that the units-digit cycle has length exactly $4$, so statement (1) alone seems too weak without statement (2).",
      "3": "Credits statement (2) as well as (1), never comparing $3^2 = 9$ against $3^4 = 81$.",
      "4": "Insists the exact value of $n$ is required, so no remainder condition seems sufficient.",
    },
    numeric_check: null,
    check() {
      const unitsOf3Pow = [];
      let u = 1;
      for (let n = 0; n <= 3000; n++) {
        unitsOf3Pow.push(u);
        u = (u * 3) % 10;
      }
      const digits = (pred) => {
        const s = new Set();
        let models = 0;
        for (let n = 1; n <= 3000; n++) {
          if (pred(n)) {
            s.add(unitsOf3Pow[n]);
            models++;
          }
        }
        if (models < 3) throw new Error("too few models for a statement");
        return s;
      };
      const s1 = (n) => n % 4 === 2;
      const s2 = (n) => n % 2 === 0;
      const d1 = digits(s1);
      const d2 = digits(s2);
      const d12 = digits((n) => s1(n) && s2(n));
      const suf1 = d1.size === 1;
      const suf2 = d2.size === 1;
      const suf12 = d12.size === 1;
      const index = suf1 && suf2 ? 3 : suf1 ? 0 : suf2 ? 1 : suf12 ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 6. D3 PS pure — counting a residue class among three-digit integers
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 3,
    stem_md:
      "How many three-digit positive integers leave a remainder of $5$ when divided by $9$?",
    choices: ["$90$", "$99$", "$100$", "$101$", "$111$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe qualifying integers form an arithmetic sequence with common difference $9$. The smallest three-digit member is $104 = 9 \\cdot 11 + 5$ and the largest is $995 = 9 \\cdot 110 + 5$. The count is $\\frac{995 - 104}{9} + 1 = 99 + 1 = 100$.\n\n**Trigger cue**\n\nCounting integers in a range with a fixed remainder: find both endpoint members, then apply $\\frac{\\text{last} - \\text{first}}{\\text{step}} + 1$.\n\n**Takeaway**\n\nEvery $9$ consecutive integers contain exactly one of each remainder class.",
    fastest_path_md:
      "The three-digit range $100$–$999$ holds $900$ consecutive integers, and $900$ is a multiple of $9$, so each remainder class appears exactly $900 / 9 = 100$ times.",
    trap_map: {
      "0": "Confuses division by $9$ with division by $10$, counting the three-digit integers that end in $5$.",
      "1": "Computes $\\frac{995 - 104}{9} = 99$ and forgets to add $1$ for the first term.",
      "3": "Starts the sequence at the two-digit value $95$, counting one extra term.",
      "4": "Divides $999$ by $9$, counting all multiples of $9$ up to $999$ with no lower bound.",
    },
    numeric_check: "100",
    check() {
      let count = 0;
      for (let n = 100; n <= 999; n++) if (n % 9 === 5) count++;
      return { kind: "value", value: count };
    },
  },

  // 7. D2 PS real — rebuilding the dividend from quotient and remainder
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "remainders_units_digits",
    difficulty: 2,
    stem_md:
      "A tailor cuts a ribbon into pieces that are each exactly $9$ centimeters long. He obtains $14$ complete pieces, with $6$ centimeters of ribbon left over. What was the length, in centimeters, of the original ribbon?",
    choices: ["$120$", "$126$", "$132$", "$138$", "$180$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nBy the division algorithm, the original length is divisor times quotient plus remainder: $9 \\cdot 14 + 6 = 126 + 6 = 132$ centimeters. The leftover $6$ is a valid remainder because it is less than the piece length $9$.\n\n**Trigger cue**\n\nA count of complete pieces plus a leftover amount: rebuild the total as divisor times quotient plus remainder.\n\n**Takeaway**\n\nDividend equals divisor times quotient plus remainder.",
    fastest_path_md:
      "The $14$ pieces use $9 \\cdot 14 = 126$ cm; add the $6$ leftover centimeters: $132$.",
    trap_map: {
      "0": "Subtracts the leftover instead of adding it: $9 \\cdot 14 - 6 = 120$.",
      "1": "Computes $9 \\cdot 14 = 126$ and forgets the $6$ leftover centimeters.",
      "3": "Adds the leftover twice: $126 + 6 + 6 = 138$.",
      "4": "Adds the leftover to the piece count before multiplying: $9 \\cdot (14 + 6) = 180$.",
    },
    numeric_check: "132",
    check() {
      const hits = [];
      for (let L = 1; L <= 2000; L++) {
        if (Math.floor(L / 9) === 14 && L % 9 === 6) hits.push(L);
      }
      if (hits.length !== 1) throw new Error(`expected unique length, found ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
