/**
 * Batch: 9 new prime_factorization items (fundamental_skill value_order_factors,
 * content_domain arithmetic). Cells: D3 PS real ×4, D4 PS real ×2, D4 DS real,
 * D5 PS real, D5 DS real. Run from repo root:
 *   node scripts/author/batch-prime_factorization.mjs          (dry run)
 *   APPEND=1 node scripts/author/batch-prime_factorization.mjs (append)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D3 PS real — least multiplier making a perfect square
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 3,
    stem_md:
      "A jewelry maker buys beads only in identical packs of $540$ beads each. She wants to use every bead she buys to fill a single square mosaic that has the same number of beads in each row as in each column. What is the least number of packs she must buy?",
    choices: ["$3$", "$5$", "$15$", "$30$", "$45$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$540 = 2^2 \\cdot 3^3 \\cdot 5$. With $k$ packs the mosaic holds $540k$ beads, which must be a perfect square, so every prime exponent of $540k$ must be even. The exponent of $2$ is already even; the exponents of $3$ and $5$ are odd, so $k$ must supply at least one more $3$ and one more $5$. The least such $k$ is $3 \\cdot 5 = 15$, giving $540 \\cdot 15 = 8100 = 90^2$.\n\n**Trigger cue**\nWhen a total built from repeated equal groups must be a perfect square, audit the prime exponents for parity.\n\n**Takeaway**\nA perfect square needs every prime exponent even.",
    fastest_path_md:
      "The odd exponents in $540 = 2^2 \\cdot 3^3 \\cdot 5$ sit on $3$ and $5$, so the least multiplier is $3 \\cdot 5 = 15$. Spot-check: $540 \\cdot 15 = 8100 = 90^2$.",
    trap_map: {
      "0": "Fixes only the odd exponent of $3$, leaving the lone factor of $5$ unpaired.",
      "1": "Fixes only the lone $5$, leaving the exponent of $3$ odd.",
      "3": "Multiplies in one of every prime ($2 \\cdot 3 \\cdot 5$), adding an unneeded $2$ that breaks the even power of $2$.",
      "4": "Uses $3^2 \\cdot 5$, which pairs the $5$ but pushes the exponent of $3$ to an odd $5$.",
    },
    numeric_check: "15",
    check() {
      const isSquare = (m) => {
        const r = Math.round(Math.sqrt(m));
        return r * r === m;
      };
      for (let k = 1; k <= 100000; k++) {
        if (isSquare(540 * k)) return { kind: "value", value: k };
      }
      throw new Error("no square multiple found");
    },
  },

  // 2. D4 PS real — greatest k with 6^k dividing 15!
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 4,
    stem_md:
      "At a school fair, the total number of raffle tickets printed is equal to the product of all the integers from $1$ to $15$, inclusive. The organizers want to pack the tickets into envelopes that each hold exactly $6^k$ tickets, using every ticket with none left over. What is the greatest possible value of $k$?",
    choices: ["$2$", "$5$", "$6$", "$11$", "$17$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$6^k = 2^k \\cdot 3^k$, so $k$ is limited by the scarcer prime in $15!$. Threes: $\\lfloor 15/3 \\rfloor + \\lfloor 15/9 \\rfloor = 5 + 1 = 6$. Twos: $\\lfloor 15/2 \\rfloor + \\lfloor 15/4 \\rfloor + \\lfloor 15/8 \\rfloor = 7 + 3 + 1 = 11$. Thus $15!$ contains $2^{11} \\cdot 3^{6}$ times other primes, and the greatest $k$ with $6^k \\mid 15!$ is $\\min(11, 6) = 6$.\n\n**Trigger cue**\nA composite power dividing a factorial: split the base into primes and count each prime with floor-division sums.\n\n**Takeaway**\nThe scarcer prime caps the power of a composite divisor.",
    fastest_path_md:
      "Threes are the bottleneck: $\\lfloor 15/3 \\rfloor + \\lfloor 15/9 \\rfloor = 6$, while twos number $11$. So $k = 6$.",
    trap_map: {
      "0": "Counts only the visible multiples of $6$ (namely $6$ and $12$) inside the product.",
      "1": "Counts threes as $\\lfloor 15/3 \\rfloor = 5$, missing the second factor of $3$ inside $9$.",
      "3": "Limits $k$ by the exponent of $2$ (eleven twos) instead of the scarcer threes.",
      "4": "Adds the exponents of $2$ and $3$ ($11 + 6$) instead of taking the smaller one.",
    },
    numeric_check: "6",
    check() {
      let f = 1n;
      for (let i = 2n; i <= 15n; i++) f *= i;
      let k = 0;
      while (f % 6n === 0n) {
        f /= 6n;
        k++;
      }
      return { kind: "value", value: k };
    },
  },

  // 3. D3 PS real — unordered factor-pair (rectangle) count with constraints
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 3,
    stem_md:
      "For a banquet, an event planner must arrange all $196$ chairs into one rectangular grid with the same number of chairs in every row. The grid must have at least $2$ rows and at least $2$ chairs per row, and a grid of $r$ rows with $c$ chairs each is considered the same arrangement as a grid of $c$ rows with $r$ chairs each. How many different arrangements are possible?",
    choices: ["$3$", "$4$", "$5$", "$7$", "$9$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n$196 = 2^2 \\cdot 7^2$, so it has $(2+1)(2+1) = 9$ divisors: $1, 2, 4, 7, 14, 28, 49, 98, 196$. Each arrangement is an unordered factor pair $r \\times c = 196$ with $r, c \\ge 2$: $(2, 98), (4, 49), (7, 28), (14, 14)$. The pair $(1, 196)$ is excluded by the two-row minimum, and the square $14 \\times 14$ counts once. Four arrangements.\n\n**Trigger cue**\nCounting rectangular layouts of a fixed total: list divisors, pair them, and police the boundary cases.\n\n**Takeaway**\nRectangle counts are divisor pairs; treat squares and edge pairs deliberately.",
    fastest_path_md:
      "Walk factor pairs of $196$ from the outside in: $(1,196)$ is banned, then $(2, 98), (4, 49), (7, 28), (14, 14)$ — four.",
    trap_map: {
      "0": "Also drops the $14 \\times 14$ layout, treating a square grid as not rectangular.",
      "2": "Includes the banned $1 \\times 196$ single-row layout despite the two-row minimum.",
      "3": "Counts ordered row-column pairs with both sides at least $2$, so each non-square layout is counted twice.",
      "4": "Counts every divisor of $196$ as its own arrangement.",
    },
    numeric_check: "4",
    check() {
      let count = 0;
      for (let r = 2; r <= 196; r++) {
        if (196 % r !== 0) continue;
        const c = 196 / r;
        if (c >= 2 && r <= c) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // 4. D3 PS real — trailing zeros of 25!
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 3,
    stem_md:
      "For a hallway banner, a math club prints the exact value of the product of all the integers from $1$ to $25$, inclusive. How many zeros appear at the end of the printed number?",
    choices: ["$4$", "$5$", "$6$", "$7$", "$10$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nEach trailing zero is a factor of $10 = 2 \\cdot 5$, and the product has far more twos than fives, so the fives decide. Count them: $\\lfloor 25/5 \\rfloor + \\lfloor 25/25 \\rfloor = 5 + 1 = 6$ — one five from each of $5, 10, 15, 20, 25$, plus a second five from $25 = 5^2$. The product therefore ends in exactly $6$ zeros.\n\n**Trigger cue**\nWhen asked how many zeros end a large product, count factors of $5$, not actual digits.\n\n**Takeaway**\nTrailing zeros equal the exponent of five in the product.",
    fastest_path_md:
      "Zeros come from fives: $\\lfloor 25/5 \\rfloor + \\lfloor 25/25 \\rfloor = 5 + 1 = 6$.",
    trap_map: {
      "0": "Counts only $5, 10, 15, 20$, overlooking $25$ entirely.",
      "1": "Gives each multiple of $5$ a single five, missing the second five inside $25$.",
      "3": "Awards $25$ three fives instead of two.",
      "4": "Awards every multiple of $5$ two fives, doubling the correct count minus nothing.",
    },
    numeric_check: "6",
    check() {
      let f = 1n;
      for (let i = 2n; i <= 25n; i++) f *= i;
      const s = f.toString();
      let z = 0;
      for (let i = s.length - 1; i >= 0 && s[i] === "0"; i--) z++;
      return { kind: "value", value: z };
    },
  },

  // 5. D4 DS real — is n divisible by 18, merging exponents across statements
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 4,
    stem_md:
      "A community theater sold a total of $n$ tickets to its weekend festival, where $n$ is a positive integer. Is $n$ divisible by $18$?\n\n(1) $n$ is divisible by $12$.\n\n(2) $n$ is divisible by $27$.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$18 = 2 \\cdot 3^2$. (1) guarantees $2^2 \\cdot 3$ but only one $3$: $n = 12$ gives no, $n = 36$ gives yes — insufficient. (2) guarantees $3^3$ but no factor of $2$: $n = 27$ gives no, $n = 54$ gives yes — insufficient. Together $n$ is a multiple of $\\text{lcm}(12, 27) = 2^2 \\cdot 3^3 = 108$, and $18 \\mid 108$, so the answer is always yes — sufficient combined.\n\n**Trigger cue**\nDivisibility DS: convert each statement into guaranteed prime exponents, then merge with the LCM.\n\n**Takeaway**\nMerge divisibility facts by taking each prime's larger exponent.",
    fastest_path_md:
      "$18 = 2 \\cdot 3^2$. (1) supplies the $2$ but only one $3$; (2) supplies $3^3$ but no $2$. Alone each fails ($12$, $27$ are counterexamples); together $n$ is a multiple of $\\text{lcm}(12, 27) = 108$, hence of $18$.",
    trap_map: {
      "0": "Assumes divisibility by $12$ already carries the $3^2$ that $18$ requires.",
      "1": "Assumes divisibility by $27$ settles it, forgetting $18$ also needs a factor of $2$.",
      "3": "Tests only friendly values like $36$ and $54$ and declares each statement sufficient.",
      "4": "Never merges the prime exponents from the two statements into $2^2 \\cdot 3^3$.",
    },
    numeric_check: null,
    check() {
      const LIMIT = 20000;
      const s1 = [];
      const s2 = [];
      for (let n = 1; n <= LIMIT; n++) {
        if (n % 12 === 0) s1.push(n);
        if (n % 27 === 0) s2.push(n);
      }
      const both = s1.filter((n) => n % 27 === 0);
      if (s1.length < 5 || s2.length < 5 || both.length < 5)
        throw new Error("too few models");
      const sufficient = (set) =>
        new Set(set.map((n) => n % 18 === 0)).size === 1;
      const a = sufficient(s1);
      const b = sufficient(s2);
      const c = sufficient(both);
      const index = a && b ? 3 : a ? 0 : b ? 1 : c ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 6. D4 PS real — least multiplier making a perfect cube
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 4,
    stem_md:
      "A candy company molds fruit chews shaped as small identical cubes and produces them in batches of exactly $1{,}080$ chews. For a store display, the company will use every chew from $k$ full batches to build one large solid cube. What is the least value of $k$ for which this is possible?",
    choices: ["$5$", "$25$", "$30$", "$75$", "$200$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n$1080 = 2^3 \\cdot 3^3 \\cdot 5$. A solid cube of unit cubes uses $n^3$ pieces, so $1080k$ must be a perfect cube: every prime exponent must be a multiple of $3$. The exponents of $2$ and $3$ already are; the lone $5$ must rise to $5^3$, so the least $k$ is $5^2 = 25$. Check: $1080 \\cdot 25 = 27{,}000 = 30^3$.\n\n**Trigger cue**\nA least multiplier that completes a perfect cube: raise each prime exponent to the next multiple of three.\n\n**Takeaway**\nCubes need every prime exponent divisible by three.",
    fastest_path_md:
      "$1080 = 2^3 \\cdot 3^3 \\cdot 5$ is exactly a factor of $5^2$ short of a cube, so $k = 25$ and the display holds $27{,}000 = 30^3$ chews.",
    trap_map: {
      "0": "Adds only one more $5$, reaching $5^2$, which is still not a multiple of three.",
      "2": "Completes a perfect square ($2 \\cdot 3 \\cdot 5 = 30$) instead of a perfect cube.",
      "3": "Tacks an unneeded factor of $3$ onto the required $5^2$.",
      "4": "Picks $200 = 2^3 \\cdot 5^2$, which does make a cube ($60^3$) but is not the least such $k$.",
    },
    numeric_check: "25",
    check() {
      const isCube = (m) => {
        const r = Math.round(Math.cbrt(m));
        return r * r * r === m;
      };
      for (let k = 1; k <= 100000; k++) {
        if (isCube(1080 * k)) return { kind: "value", value: k };
      }
      throw new Error("no cube multiple found");
    },
  },

  // 7. D5 PS real — divisors of 6480 that are multiples of 12
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 5,
    stem_md:
      "A tourism board has $6{,}480$ commemorative pins and will divide all of them into identical souvenir sets, with every pin used and none left over. The number of pins in each set must be a multiple of $12$. How many different possible values are there for the number of pins per set?",
    choices: ["$12$", "$16$", "$24$", "$40$", "$50$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n$6480 = 2^4 \\cdot 3^4 \\cdot 5$. A valid set size is a divisor of $6480$ that is a multiple of $12 = 2^2 \\cdot 3$, i.e. $2^a 3^b 5^c$ with $2 \\le a \\le 4$, $1 \\le b \\le 4$, $0 \\le c \\le 1$: that is $3 \\cdot 4 \\cdot 2 = 24$ values. Equivalently, valid sizes are $12m$ where $m$ divides $6480/12 = 540 = 2^2 \\cdot 3^3 \\cdot 5$, which has $(2+1)(3+1)(1+1) = 24$ divisors.\n\n**Trigger cue**\nCounting divisors that must contain a given factor: divide that factor out and count divisors of the quotient.\n\n**Takeaway**\nDivisors that are multiples of $d$ match divisors of $n/d$.",
    fastest_path_md:
      "Set sizes are $12m$ with $m \\mid 6480/12 = 540$. Since $540 = 2^2 \\cdot 3^3 \\cdot 5$, there are $3 \\cdot 4 \\cdot 2 = 24$ choices of $m$.",
    trap_map: {
      "0": "Forgets the exponent of $5$ can be $0$ or $1$, halving the count to $3 \\cdot 4$.",
      "1": "Off-by-one on the exponent of $2$, allowing only $2^2$ and $2^3$ instead of three options.",
      "3": "Counts all even divisors of $6480$ (multiples of $2$) rather than multiples of $12$.",
      "4": "Counts every divisor of $6480$, ignoring the multiple-of-$12$ requirement.",
    },
    numeric_check: "24",
    check() {
      let count = 0;
      for (let d = 1; d <= 6480; d++) {
        if (6480 % d === 0 && d % 12 === 0) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // 8. D5 DS real — divisor count determined without determining n
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 5,
    stem_md:
      "A ceramicist fires a batch of $n$ mugs in her kiln, where $n$ is an integer greater than $1$. How many positive divisors does $n$ have?\n\n(1) $n$ is the product of two distinct prime numbers.\n\n(2) $n$ is even and $4 < n < 12$.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe target is the divisor count, not $n$ itself. (1): if $n = pq$ with $p, q$ distinct primes, its divisors are exactly $1, p, q, pq$ — four, whatever the primes are. Sufficient. (2): the even integers strictly between $4$ and $12$ are $6, 8, 10$, with divisor counts $4$ ($1,2,3,6$), $4$ ($1,2,4,8$), and $4$ ($1,2,5,10$). One common value — sufficient. Each statement alone determines the count.\n\n**Trigger cue**\nWhen a DS question asks for a derived quantity, test whether that quantity — not the variable — is pinned down.\n\n**Takeaway**\nSufficiency needs a unique answer, not a unique $n$.",
    fastest_path_md:
      "Answer the asked question, not \"what is $n$.\" (1): $pq$ always has $4$ divisors. (2): $n \\in \\{6, 8, 10\\}$ and $d(6) = d(8) = d(10) = 4$. Each alone suffices.",
    trap_map: {
      "0": "Rejects (2) because $n$ could be $6$, $8$, or $10$ — but all three share one divisor count.",
      "1": "Rejects (1) because the primes $p$ and $q$ are unknown, though the count is $4$ regardless.",
      "2": "Combines out of caution when each statement alone already fixes the count at four.",
      "4": "Declares both useless because neither statement determines $n$ itself.",
    },
    numeric_check: null,
    check() {
      const isPrime = (m) => {
        if (m < 2) return false;
        for (let p = 2; p * p <= m; p++) if (m % p === 0) return false;
        return true;
      };
      const divCount = (m) => {
        let c = 0;
        for (let d = 1; d <= m; d++) if (m % d === 0) c++;
        return c;
      };
      const isDistinctSemiprime = (m) => {
        for (let p = 2; p * p < m; p++) {
          if (m % p === 0 && isPrime(p) && isPrime(m / p) && m / p !== p)
            return true;
        }
        return false;
      };
      const LIMIT = 2000;
      const s1 = [];
      const s2 = [];
      for (let n = 2; n <= LIMIT; n++) {
        if (isDistinctSemiprime(n)) s1.push(n);
        if (n % 2 === 0 && n > 4 && n < 12) s2.push(n);
      }
      const both = s1.filter((n) => s2.includes(n));
      if (s1.length < 5 || s2.length < 3 || both.length < 2)
        throw new Error("too few models");
      const sufficient = (set) => new Set(set.map(divCount)).size === 1;
      const a = sufficient(s1);
      const b = sufficient(s2);
      const c = sufficient(both);
      const index = a && b ? 3 : a ? 0 : b ? 1 : c ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // 9. D3 PS real — count of distinct prime factors
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "prime_factorization",
    difficulty: 3,
    stem_md:
      "In an escape room, the final lock opens when players enter the number of distinct prime numbers that divide $8{,}415$. What number opens the lock?",
    choices: ["$3$", "$4$", "$5$", "$6$", "$24$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nStrip small primes: the digit sum of $8415$ is $18$, so $8415 = 3 \\cdot 2805 = 3 \\cdot 3 \\cdot 935$; then $935 = 5 \\cdot 187$, and $187 = 11 \\cdot 17$. Hence $8{,}415 = 3^2 \\cdot 5 \\cdot 11 \\cdot 17$, whose distinct prime divisors are $3, 5, 11, 17$ — four of them.\n\n**Trigger cue**\nA distinct-prime-factor count: run trial division and stay suspicious of a stubborn remainder like $187$.\n\n**Takeaway**\nFactor completely; a leftover like $187$ may still split.",
    fastest_path_md:
      "Peel the easy primes: $8415 = 5 \\cdot 1683 = 5 \\cdot 3 \\cdot 561 = 5 \\cdot 3 \\cdot 3 \\cdot 187$, and $187 = 11 \\cdot 17$. Distinct primes: $\\{3, 5, 11, 17\\}$ — four.",
    trap_map: {
      "0": "Stops early by assuming $187$ is prime, so counts only $3$, $5$, and one leftover.",
      "2": "Counts prime factors with multiplicity, tallying the repeated $3$ twice.",
      "3": "Counts with multiplicity and also includes $1$ as a prime.",
      "4": "Counts all $24$ positive divisors of $8{,}415$ instead of its distinct primes.",
    },
    numeric_check: "4",
    check() {
      let n = 8415;
      let count = 0;
      for (let p = 2; p <= n; p++) {
        if (n % p === 0) {
          count++;
          while (n % p === 0) n /= p;
        }
      }
      return { kind: "value", value: count };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
