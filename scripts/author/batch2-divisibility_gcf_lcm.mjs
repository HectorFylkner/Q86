/**
 * Second authoring wave for divisibility_gcf_lcm: +5 to clear the ~25
 * floor. Each check() recomputes by direct enumeration over the stated
 * range, independent of the written solution.
 *
 * Run: node --experimental-strip-types scripts/author/batch2-divisibility_gcf_lcm.mjs [--append]
 */
import { verifyAndAppend } from "./harness.mjs";

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;

const items = [
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "How many positive integers less than $100$ are divisible by $6$ but not by $4$?",
    choices: ["6", "8", "12", "14", "16"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nMultiples of $6$ below $100$: $6, 12, \\ldots, 96$, which is $16$ numbers. Those also divisible by $4$ are the multiples of $\\mathrm{lcm}(6,4) = 12$: $12, 24, \\ldots, 96$, which is $8$ numbers. Subtract: $16 - 8 = 8$.\n\n**Trigger cue**\n\n\"Divisible by $a$ but not $b$\": count multiples of $a$, then remove multiples of $\\mathrm{lcm}(a,b)$.\n\n**Takeaway**\n\nSubtract multiples of the lcm from multiples of the first.",
    fastest_path_md:
      "$16$ multiples of $6$, minus $8$ multiples of $12$, leaves $8$.",
    trap_map: {
      "0": "Removes multiples of $24$ instead of $12$, over-subtracting.",
      "2": "Counts multiples of $6$ that are odd, mishandling the exclusion.",
      "3": "Subtracts only the multiples of $4$ that are not multiples of $6$.",
      "4": "Reports all $16$ multiples of $6$ without excluding those divisible by $4$.",
    },
    numeric_check: "8",
    check() {
      let c = 0;
      for (let n = 1; n < 100; n++) if (n % 6 === 0 && n % 4 !== 0) c++;
      return { kind: "value", value: c };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "How many ordered pairs of positive integers $(a, b)$ with $a < b$ satisfy $\\gcd(a, b) = 6$ and $\\mathrm{lcm}(a, b) = 90$?",
    choices: ["1", "2", "3", "4", "6"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nWrite $a = 6m$, $b = 6n$ with $\\gcd(m, n) = 1$. Then $\\mathrm{lcm}(a,b) = 6mn = 90$, so $mn = 15$. Coprime factorizations of $15$: $(1, 15)$ and $(3, 5)$ (and their reverses). With $a < b$, i.e. $m < n$, exactly $(1, 15)$ and $(3, 5)$ qualify — two pairs.\n\n**Trigger cue**\n\n\"$\\gcd$ and $\\mathrm{lcm}$ both fixed\": strip the gcd and count coprime factor pairs of $\\mathrm{lcm}/\\gcd$.\n\n**Takeaway**\n\nCoprime factor pairs of lcm-over-gcd count the solutions.",
    fastest_path_md:
      "$mn = 90/6 = 15$ with $\\gcd(m,n) = 1$ and $m<n$: $(1,15),(3,5)$ — two.",
    trap_map: {
      "0": "Keeps only the $(1, 15)$ split, forgetting $(3, 5)$.",
      "2": "Counts $(3, 5)$ and both orders of one pair, over-counting by one.",
      "3": "Includes both orders of each coprime pair, ignoring $a < b$.",
      "4": "Counts all factor pairs of $15$ without the coprimality or ordering filter.",
    },
    numeric_check: "2",
    check() {
      let c = 0;
      for (let a = 1; a <= 90; a++)
        for (let b = a + 1; b <= 90; b++)
          if (gcd(a, b) === 6 && lcm(a, b) === 90) c++;
      return { kind: "value", value: c };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 2,
    stem_md:
      "Three lighthouses flash at regular intervals: one every $15$ seconds, one every $20$ seconds, and one every $6$ seconds. If all three flash together at a certain instant, after how many seconds will they next all flash together?",
    choices: ["30", "60", "90", "120", "1800"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThey align again at the least common multiple of the intervals. $\\mathrm{lcm}(15, 20) = 60$, and $\\mathrm{lcm}(60, 6) = 60$. So they next flash together after $60$ seconds.\n\n**Trigger cue**\n\n\"Next time repeating events coincide\": least common multiple of the periods.\n\n**Takeaway**\n\nRepeating events realign at the lcm of their periods.",
    fastest_path_md:
      "$\\mathrm{lcm}(15,20) = 60$, and $6 \\mid 60$, so the answer is $60$.",
    trap_map: {
      "0": "Uses $\\mathrm{lcm}(15, 6) = 30$, ignoring the $20$-second interval.",
      "2": "Reports $90 = \\mathrm{lcm}(15, 6) \\cdot 3$ by a mis-computation.",
      "3": "Doubles $60$ unnecessarily.",
      "4": "Multiplies the three intervals $15 \\cdot 20 \\cdot 6$ instead of taking the lcm.",
    },
    numeric_check: "60",
    check() {
      return { kind: "value", value: lcm(lcm(15, 20), 6) };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 5,
    stem_md:
      "How many positive integers $n \\le 500$ satisfy $\\gcd(n, 15) = 5$?",
    choices: ["33", "50", "67", "100", "133"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$\\gcd(n, 15) = 5$ means $5 \\mid n$ but $3 \\nmid n$ (if $3$ also divided $n$, the gcd would be $15$). Write $n = 5k$ with $k \\le 100$. The condition $3 \\nmid n$ becomes $3 \\nmid k$. Among $k = 1, \\ldots, 100$, the multiples of $3$ number $\\lfloor 100/3 \\rfloor = 33$, leaving $100 - 33 = 67$.\n\n**Trigger cue**\n\n\"$\\gcd(n, m) = d$\": require $d \\mid n$ and exclude the extra prime factors of $m$.\n\n**Takeaway**\n\nForce the gcd's factors in and the surplus factors out.",
    fastest_path_md:
      "$n = 5k$, $k \\le 100$, with $3 \\nmid k$: $100 - 33 = 67$.",
    trap_map: {
      "0": "Counts the excluded multiples of $3$ ($33$) instead of the survivors.",
      "1": "Counts all multiples of $5$ up to $500$ but halves incorrectly.",
      "3": "Counts every multiple of $5$ ($100$), ignoring the $3 \\nmid n$ requirement.",
      "4": "Counts multiples of $5$ or of $3$ up to $500$, mixing the conditions.",
    },
    numeric_check: "67",
    check() {
      let c = 0;
      for (let n = 1; n <= 500; n++) if (gcd(n, 15) === 5) c++;
      return { kind: "value", value: c };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "divisibility_gcf_lcm",
    difficulty: 4,
    stem_md:
      "The greatest common divisor of two positive integers is $12$ and their sum is $84$. How many such unordered pairs are there?",
    choices: ["1", "2", "3", "4", "6"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite the numbers as $12x$ and $12y$ with $\\gcd(x, y) = 1$. Then $12(x + y) = 84$, so $x + y = 7$. Coprime pairs with $x \\le y$ summing to $7$: $(1, 6)$, $(2, 5)$, $(3, 4)$ — all coprime. That is three pairs.\n\n**Trigger cue**\n\n\"Fixed gcd, fixed sum\": divide out the gcd and count coprime pairs summing to the reduced total.\n\n**Takeaway**\n\nDivide by the gcd; count coprime pairs hitting the reduced sum.",
    fastest_path_md:
      "$x + y = 84/12 = 7$, coprime: $(1,6),(2,5),(3,4)$ — three.",
    trap_map: {
      "0": "Keeps only $(3, 4)$, the pair closest to equal.",
      "1": "Drops one coprime pair, perhaps discarding $(1, 6)$.",
      "3": "Counts a non-coprime pair such as a repeated split, adding a fourth.",
      "4": "Counts ordered pairs, doubling to six.",
    },
    numeric_check: "3",
    check() {
      let c = 0;
      for (let a = 1; a <= 83; a++) {
        const b = 84 - a;
        if (a <= b && gcd(a, b) === 12) c++;
      }
      return { kind: "value", value: c };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
