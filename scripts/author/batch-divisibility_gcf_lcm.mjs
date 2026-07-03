/**
 * Batch: divisibility_gcf_lcm (fundamental_skill value_order_factors, arithmetic).
 * Roster: D2 PS real, D2 PS pure, D3 PS pure, D4 PS pure, D4 DS pure,
 *         D4 PS real, D4 DS pure, D5 PS pure, D4 PS pure, D4 PS pure.
 * Run: node scripts/author/batch-divisibility_gcf_lcm.mjs
 * Append: APPEND=1 node scripts/author/batch-divisibility_gcf_lcm.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;

const items = [
  // 1. D2 PS real — coffee-shop deliveries, lcm of cycles
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 2,
    stem_md:
      "A coffee shop receives a delivery of beans every $6$ days and a delivery of pastry boxes every $15$ days. Both deliveries arrived this morning. In how many days will the shop next receive both deliveries on the same day?",
    choices: ["$21$", "$30$", "$45$", "$60$", "$90$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe deliveries coincide again after a number of days that both cycle lengths divide — the least common multiple. $6 = 2 \\cdot 3$ and $15 = 3 \\cdot 5$, so $\\mathrm{lcm}(6, 15) = 2 \\cdot 3 \\cdot 5 = 30$.\n\n**Trigger cue**\n\nTwo repeating cycles start together and must coincide again — reach for the lcm of the periods.\n\n**Takeaway**\n\nCycles that start together realign at the lcm.",
    fastest_path_md:
      "Walk multiples of the longer cycle: $15$, $30$. The first one divisible by $6$ is $30$.",
    trap_map: {
      "0": "Adds the two cycle lengths ($6 + 15$) instead of finding a common multiple.",
      "2": "Picks a multiple of $15$ without checking that it is also a multiple of $6$.",
      "3": "Finds a common multiple of the two cycles but not the least one.",
      "4": "Multiplies the cycle lengths, ignoring their shared factor of $3$.",
    },
    numeric_check: "30",
    check() {
      for (let t = 1; t <= 10000; t++) {
        if (t % 6 === 0 && t % 15 === 0) return { kind: "value", value: t };
      }
      throw new Error("no coincidence day found");
    },
  },

  // 2. D2 PS pure — lcm of 24 and 90
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 2,
    stem_md: "What is the least common multiple of $24$ and $90$?",
    choices: ["$6$", "$114$", "$180$", "$360$", "$720$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFactor: $24 = 2^3 \\cdot 3$ and $90 = 2 \\cdot 3^2 \\cdot 5$. The lcm takes the larger power of each prime: $2^3 \\cdot 3^2 \\cdot 5 = 8 \\cdot 9 \\cdot 5 = 360$.\n\n**Trigger cue**\n\nAn lcm of two concrete numbers: factor both, take maximum exponents.\n\n**Takeaway**\n\nThe lcm takes each prime at its larger exponent.",
    fastest_path_md:
      "Scan multiples of $90$: $90$, $180$, $270$, $360$. Only $360 = 24 \\cdot 15$ is divisible by $24$.",
    trap_map: {
      "0": "Computes the greatest common factor instead of the least common multiple.",
      "1": "Adds the two numbers instead of taking the lcm.",
      "2": "Drops one factor of $2$, treating $24$ as $2^2 \\cdot 3$.",
      "4": "Divides the product $24 \\cdot 90$ by $3$ instead of by the gcd $6$.",
    },
    numeric_check: "360",
    check() {
      for (let m = 1; m <= 100000; m++) {
        if (m % 24 === 0 && m % 90 === 0) return { kind: "value", value: m };
      }
      throw new Error("no common multiple found");
    },
  },

  // 3. D3 PS pure — count n with lcm(12, n) = 60
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 3,
    stem_md:
      "How many positive integers $n$ satisfy $\\mathrm{lcm}(12, n) = 60$?",
    choices: ["$3$", "$4$", "$5$", "$6$", "$12$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSince the lcm is $60$, $n$ must divide $60 = 2^2 \\cdot 3 \\cdot 5$. Also $12 = 2^2 \\cdot 3$ already supplies $2^2$ and $3$ but no $5$, so $n$ must supply the factor $5$. Thus $n = 2^a \\cdot 3^b \\cdot 5$ with $a \\in \\{0,1,2\\}$ and $b \\in \\{0,1\\}$: the values $5, 10, 15, 20, 30, 60$ — six in all.\n\n**Trigger cue**\n\nCounting $n$ with a fixed lcm: $n$ divides the lcm and must cover the primes the partner lacks.\n\n**Takeaway**\n\n$n$ divides the lcm and supplies the missing primes.",
    fastest_path_md:
      "$n$ must divide $60$ and carry the $5$ that $12$ lacks: the multiples of $5$ among divisors of $60$ are $5, 10, 15, 20, 30, 60$ — count $6$.",
    trap_map: {
      "0": "Counts only the multiples of $15$ that divide $60$, namely $15$, $30$, $60$.",
      "1": "Assumes $n$ must be even, dropping $n = 5$ and $n = 15$.",
      "2": "Excludes $n = 60$ on the false belief that $n$ must be smaller than the lcm.",
      "4": "Counts every divisor of $60$ without enforcing $\\mathrm{lcm}(12, n) = 60$.",
    },
    numeric_check: "6",
    check() {
      let count = 0;
      for (let n = 1; n <= 600; n++) if (lcm(12, n) === 60) count++;
      return { kind: "value", value: count };
    },
  },

  // 4. D4 PS pure — smallest n with gcd(n,40)=8 and gcd(n,36)=12
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "If $n$ is a positive integer such that $\\gcd(n, 40) = 8$ and $\\gcd(n, 36) = 12$, what is the smallest possible value of $n$?",
    choices: ["$8$", "$12$", "$24$", "$48$", "$120$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$40 = 2^3 \\cdot 5$, so $\\gcd(n, 40) = 8$ forces $2^3 \\mid n$ and $5 \\nmid n$. $36 = 2^2 \\cdot 3^2$, so $\\gcd(n, 36) = 12 = 2^2 \\cdot 3$ forces $3 \\mid n$ but $9 \\nmid n$ (the $2^2$ demand is already met). The smallest positive integer with $2^3$, exactly one $3$, and no $5$ is $2^3 \\cdot 3 = 24$. Verify: $\\gcd(24, 40) = 8$ and $\\gcd(24, 36) = 12$.\n\n**Trigger cue**\n\nSeveral gcd conditions on one unknown: translate each into forced prime powers and forbidden primes.\n\n**Takeaway**\n\nEach exact gcd forces some primes and forbids others.",
    fastest_path_md:
      "Both gcds must divide $n$, so $\\mathrm{lcm}(8, 12) = 24$ divides $n$. Test $24$: $\\gcd(24, 40) = 8$ and $\\gcd(24, 36) = 12$ — it already works.",
    trap_map: {
      "0": "Reports the first gcd itself instead of building $n$ from both conditions.",
      "1": "Reports the second gcd, ignoring the requirement $2^3 \\mid n$.",
      "3": "Uses $2^4 \\cdot 3$, wrongly requiring $n$'s power of $2$ to exceed that of $40$.",
      "4": "Includes a factor of $5$ (giving $24 \\cdot 5$), though $\\gcd(n, 40) = 8$ forbids it.",
    },
    numeric_check: "24",
    check() {
      for (let n = 1; n <= 100000; n++) {
        if (gcd(n, 40) === 8 && gcd(n, 36) === 12)
          return { kind: "value", value: n };
      }
      throw new Error("no n found");
    },
  },

  // 5. D4 DS pure — is n divisible by 15? lcm/gcd statements, answer E
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "If $n$ is a positive integer, is $n$ divisible by $15$?\n\n(1) The least common multiple of $n$ and $10$ is $30$.\n\n(2) The greatest common divisor of $n$ and $9$ is $3$.",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\n(1) $\\mathrm{lcm}(n, 10) = 30$ forces $n \\mid 30$ and $n$ to supply the factor $3$ that $10$ lacks: $n \\in \\{3, 6, 15, 30\\}$. Here $n = 3$ answers no while $n = 15$ answers yes — insufficient. (2) $\\gcd(n, 9) = 3$ says $n$ is a multiple of $3$ but not of $9$: $n = 3$ gives no, $n = 15$ gives yes — insufficient. Combined: every candidate in $\\{3, 6, 15, 30\\}$ is already a multiple of $3$ and none is a multiple of $9$, so statement (2) eliminates nothing; $n = 3$ (no) and $n = 15$ (yes) both survive. Together the statements are still insufficient.\n\n**Trigger cue**\n\nBefore combining, test whether one statement's candidate list already satisfies the other statement.\n\n**Takeaway**\n\nCombining adds nothing when one statement implies the other.",
    fastest_path_md:
      "(1) gives $n \\in \\{3, 6, 15, 30\\}$ — mixed yes/no. Each of these already has $\\gcd(n, 9) = 3$, so (2) removes no candidates. Still mixed: choose (E).",
    trap_map: {
      "0": "Trusts (1) after testing only $n = 15$ and $n = 30$, missing $n = 3$ and $n = 6$.",
      "1": "Reads $\\gcd(n, 9) = 3$ as forcing $n = 3$, which would give a definite no.",
      "2": "When combining, discards $n = 3$ and $n = 6$ on the false idea that $\\gcd(n, 9) = 3$ requires $n > 9$.",
      "3": "Treats each statement as pinning $n$ to a single value.",
    },
    numeric_check: null,
    check() {
      const N = 2000;
      const s1 = [];
      const s2 = [];
      for (let n = 1; n <= N; n++) {
        if (lcm(n, 10) === 30) s1.push(n);
        if (gcd(n, 9) === 3) s2.push(n);
      }
      const both = s1.filter((n) => s2.includes(n));
      if (s1.length < 3 || s2.length < 3 || both.length < 2)
        throw new Error("too few models per statement");
      const yes = (n) => n % 15 === 0;
      const decided = (set) => set.every(yes) || set.every((n) => !yes(n));
      const d1 = decided(s1);
      const d2 = decided(s2);
      const db = decided(both);
      let index;
      if (d1 && d2) index = 3;
      else if (d1) index = 0;
      else if (d2) index = 1;
      else if (db) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 6. D4 PS real — meshed gears, painted teeth realign
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "Two gears are meshed so that their teeth interlock: the smaller gear has $42$ teeth and the larger gear has $54$ teeth. A technician paints the two teeth that are currently touching, one on each gear. How many complete revolutions will the smaller gear make before the two painted teeth first touch each other again?",
    choices: ["$6$", "$7$", "$9$", "$54$", "$378$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nEach meshing step advances both gears by one tooth, so after $T$ tooth engagements the painted teeth meet again exactly when $42 \\mid T$ and $54 \\mid T$. The first such $T$ is $\\mathrm{lcm}(42, 54)$: $42 = 2 \\cdot 3 \\cdot 7$ and $54 = 2 \\cdot 3^3$, so $T = 2 \\cdot 3^3 \\cdot 7 = 378$. The smaller gear turns $378 / 42 = 9$ complete revolutions.\n\n**Trigger cue**\n\nMeshed gears or rotating cycles returning to a starting alignment: lcm of the counts, then convert to revolutions.\n\n**Takeaway**\n\nAlign at the lcm, then divide by teeth per revolution.",
    fastest_path_md:
      "$\\mathrm{lcm}(42, 54) = 378$ engagements; the smaller gear makes $378 / 42 = 9$ turns.",
    trap_map: {
      "0": "Computes the gcd of the tooth counts instead of working from the lcm.",
      "1": "Counts revolutions of the $54$-tooth gear ($378/54$) rather than the smaller gear.",
      "3": "Reports the larger gear's tooth count, confusing teeth with turns.",
      "4": "Stops at the lcm — total tooth engagements, not revolutions.",
    },
    numeric_check: "378/42",
    check() {
      // simulate: after r full revolutions of the small gear, 42*r teeth have
      // engaged; the painted pair meets when that count is a multiple of 54 too.
      for (let r = 1; r <= 100000; r++) {
        if ((42 * r) % 54 === 0) return { kind: "value", value: r };
      }
      throw new Error("gears never realign");
    },
  },

  // 7. D4 DS pure — gcd(m, n) from difference + common multiple, answer C
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "If $m$ and $n$ are positive integers, what is the value of $\\gcd(m, n)$?\n\n(1) $m = n + 6$\n\n(2) Both $m$ and $n$ are multiples of $6$.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n(1) $\\gcd(m, n) = \\gcd(n + 6, n) = \\gcd(6, n)$, which can be $1$, $2$, $3$, or $6$ depending on $n$ — insufficient. (2) A common divisor of two multiples of $6$ is at least $6$, but $m = 6, n = 12$ gives $\\gcd = 6$ while $m = 12, n = 24$ gives $\\gcd = 12$ — insufficient. Combined: by (1) the gcd divides $m - n = 6$, and by (2) it is a multiple of $6$; the only positive integer that both divides $6$ and is a multiple of $6$ is $6$ itself — sufficient.\n\n**Trigger cue**\n\nA fixed difference between two integers caps their gcd: any common divisor must divide the difference.\n\n**Takeaway**\n\nThe gcd of two integers divides their difference.",
    fastest_path_md:
      "From (1) the gcd divides $6$; from (2) it is a multiple of $6$; together it must equal $6$. Alone, (1) allows $1, 2, 3, 6$ and (2) allows $6, 12, \\dots$",
    trap_map: {
      "0": "Jumps from $m - n = 6$ straight to $\\gcd = 6$, though $\\gcd(6, n)$ can be $1$, $2$, or $3$.",
      "1": "Assumes two multiples of $6$ must have gcd exactly $6$, missing $m = 12$, $n = 24$.",
      "3": "Makes both errors above and grants each statement alone.",
      "4": "Never intersects \"the gcd divides $6$\" with \"$6$ divides the gcd\".",
    },
    numeric_check: null,
    check() {
      const N = 150;
      const s1 = [];
      const s2 = [];
      const both = [];
      for (let n = 1; n <= N; n++) {
        for (let m = 1; m <= N; m++) {
          const st1 = m === n + 6;
          const st2 = m % 6 === 0 && n % 6 === 0;
          if (st1) s1.push([m, n]);
          if (st2) s2.push([m, n]);
          if (st1 && st2) both.push([m, n]);
        }
      }
      if (s1.length < 5 || s2.length < 5 || both.length < 3)
        throw new Error("too few models per statement");
      const distinct = (set) => new Set(set.map(([m, n]) => gcd(m, n))).size;
      const d1 = distinct(s1) === 1;
      const d2 = distinct(s2) === 1;
      const db = distinct(both) === 1;
      let index;
      if (d1 && d2) index = 3;
      else if (d1) index = 0;
      else if (d2) index = 1;
      else if (db) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 8. D5 PS pure — count n ≤ 1000 with gcd(n, 60) = 12
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 5,
    stem_md:
      "How many positive integers $n \\le 1000$ satisfy $\\gcd(n, 60) = 12$?",
    choices: ["$16$", "$63$", "$66$", "$67$", "$83$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$\\gcd(n, 60) = 12$ requires $12 \\mid n$, so write $n = 12k$ with $1 \\le k \\le 83$ (since $12 \\cdot 83 = 996$). Because $60 = 12 \\cdot 5$, $\\gcd(12k, 60) = 12 \\cdot \\gcd(k, 5)$, so the condition is exactly $5 \\nmid k$. Among $k = 1, \\dots, 83$ there are $\\lfloor 83/5 \\rfloor = 16$ multiples of $5$, leaving $83 - 16 = 67$.\n\n**Trigger cue**\n\n\"$\\gcd(n, m)$ equals exactly $d$\": substitute $n = dk$ and demand $k$ coprime to $m/d$.\n\n**Takeaway**\n\nFactor out the gcd; the cofactor must be coprime.",
    fastest_path_md:
      "Multiples of $12$ up to $1000$: $83$. The gcd jumps to $60$ exactly for multiples of $60$: $16$ of them. $83 - 16 = 67$.",
    trap_map: {
      "0": "Counts the $n$ with $\\gcd(n, 60) = 60$ — the multiples of $60$ — instead.",
      "1": "Removes the $20$ multiples of $5$ up to $100$ instead of the multiples of $60$ up to $1000$.",
      "2": "Rounds $1000/60$ up to $17$ when subtracting.",
      "4": "Counts every multiple of $12$, forgetting the gcd must equal exactly $12$.",
    },
    numeric_check: "floor(1000/12) - floor(1000/60)",
    check() {
      let count = 0;
      for (let n = 1; n <= 1000; n++) if (gcd(n, 60) === 12) count++;
      return { kind: "value", value: count };
    },
  },

  // 9. D4 PS pure — common divisors of 540 and 360
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "How many positive integers are divisors of both $540$ and $360$?",
    choices: ["$6$", "$9$", "$12$", "$18$", "$24$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe common divisors of two integers are exactly the divisors of their gcd. $540 = 2^2 \\cdot 3^3 \\cdot 5$ and $360 = 2^3 \\cdot 3^2 \\cdot 5$, so $\\gcd = 2^2 \\cdot 3^2 \\cdot 5 = 180$. The number of divisors of $180$ is $(2+1)(2+1)(1+1) = 18$.\n\n**Trigger cue**\n\n\"Divisors of both\" — never list; count the divisors of the gcd.\n\n**Takeaway**\n\nCommon divisors are precisely the divisors of the gcd.",
    fastest_path_md:
      "$\\gcd(540, 360) = 180 = 2^2 \\cdot 3^2 \\cdot 5$, so the count is $3 \\cdot 3 \\cdot 2 = 18$.",
    trap_map: {
      "0": "Miscomputes the gcd as $12$ and counts its $6$ divisors.",
      "1": "Drops the shared prime $5$ and counts only the $9$ divisors of $36$.",
      "2": "Carries only one factor of $3$ into the gcd, counting the $12$ divisors of $60$.",
      "4": "Counts the divisors of $540$ (or of $360$) itself rather than of the gcd.",
    },
    numeric_check: "(2+1)*(2+1)*(1+1)",
    check() {
      let count = 0;
      for (let k = 1; k <= 540; k++) {
        if (540 % k === 0 && 360 % k === 0) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // 10. D4 PS pure — smallest integer divisible by 2..10 except 7
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "What is the smallest positive integer that is divisible by every integer from $2$ through $10$ except $7$?",
    choices: ["$120$", "$180$", "$360$", "$720$", "$2520$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe answer is $\\mathrm{lcm}(2, 3, 4, 5, 6, 8, 9, 10)$. Collect the highest prime power in the list: $2^3$ (from $8$), $3^2$ (from $9$), and $5$ (from $5$ or $10$). So the lcm is $8 \\cdot 9 \\cdot 5 = 360$; divisibility by $2, 3, 4, 6, 10$ then follows automatically.\n\n**Trigger cue**\n\n\"Divisible by each number in a list\": build the lcm from the highest power of each prime present.\n\n**Takeaway**\n\nOnly the highest power of each prime matters.",
    fastest_path_md:
      "Only $8$, $9$, and $5$ constrain anything: $8 \\cdot 9 \\cdot 5 = 360$, and every other listed number divides it.",
    trap_map: {
      "0": "Omits $9$, capping the power of $3$ at $3^1$.",
      "1": "Omits $8$, capping the power of $2$ at $2^2$.",
      "3": "Multiplies $8 \\cdot 9 \\cdot 10$, producing a common multiple that is not least.",
      "4": "Includes $7$, computing the lcm of all integers from $2$ through $10$.",
    },
    numeric_check: "360",
    check() {
      const divisors = [2, 3, 4, 5, 6, 8, 9, 10];
      for (let n = 1; n <= 100000; n++) {
        if (divisors.every((d) => n % d === 0))
          return { kind: "value", value: n };
      }
      throw new Error("no common multiple found");
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
