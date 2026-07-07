/**
 * Second authoring wave for parity_signs: +5 to clear the ~25 floor.
 * Each check() recomputes the count by direct enumeration, independent
 * of the written solution. BigInt is used where powers would exceed
 * safe-integer range.
 *
 * Run: node --experimental-strip-types scripts/author/batch2-parity_signs.mjs [--append]
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "For how many ordered pairs of integers $(a, b)$ with $1 \\le a \\le 4$ and $1 \\le b \\le 4$ is $a^{2} + b^{2}$ odd?",
    choices: ["4", "6", "8", "10", "12"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$a^{2}$ has the same parity as $a$, so $a^{2} + b^{2}$ is odd exactly when one of $a, b$ is odd and the other even. Odd values in $\\{1,2,3,4\\}$: $\\{1, 3\\}$ ($2$ of them); even: $\\{2, 4\\}$ ($2$). Odd-then-even gives $2 \\cdot 2 = 4$; even-then-odd gives another $4$. Total $8$.\n\n**Trigger cue**\n\n\"Sum of squares odd\": the two bases must have opposite parity.\n\n**Takeaway**\n\nA sum is odd exactly when its two parts differ in parity.",
    fastest_path_md:
      "Opposite parity needed: $2 \\cdot 2 + 2 \\cdot 2 = 8$.",
    trap_map: {
      "0": "Counts only one of the two opposite-parity orderings.",
      "1": "Miscounts the odd or even values available in the range.",
      "3": "Adds the two same-parity cases by mistake, inflating the count.",
      "4": "Counts all $12$ mixed pairs without checking parity of the sum.",
    },
    numeric_check: "8",
    check() {
      let c = 0;
      for (let a = 1; a <= 4; a++)
        for (let b = 1; b <= 4; b++) if ((a * a + b * b) % 2 === 1) c++;
      return { kind: "value", value: c };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "For how many integers $n$ with $1 \\le n \\le 30$ is $2^{n} + n$ even?",
    choices: ["10", "14", "15", "16", "20"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFor $n \\ge 1$, $2^{n}$ is even. An even number plus $n$ is even exactly when $n$ is even. The even integers in $1 \\le n \\le 30$ are $2, 4, \\ldots, 30$: fifteen of them.\n\n**Trigger cue**\n\n\"$2^{n} + n$ parity\": $2^{n}$ is always even for $n \\ge 1$, so the sum follows $n$.\n\n**Takeaway**\n\nEven plus $n$ is even exactly when $n$ is even.",
    fastest_path_md:
      "$2^n$ is even, so need $n$ even: $15$ values.",
    trap_map: {
      "0": "Counts multiples of $3$ or another wrong residue class.",
      "1": "Miscounts the even numbers in the range by dropping an endpoint or two.",
      "3": "Includes $n = 0$ or otherwise miscounts by one.",
      "4": "Counts $n$ where $2^{n} + n$ is odd (the odd $n$) yet reports the even total wrong.",
    },
    numeric_check: "15",
    check() {
      let c = 0;
      for (let n = 1n; n <= 30n; n++) if ((2n ** n + n) % 2n === 0n) c++;
      return { kind: "value", value: c };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "Each of $a$ and $b$ is chosen from $\\{-3, -2, -1, 1, 2, 3\\}$, with the two choices made independently. For how many of the $36$ ordered pairs $(a, b)$ is $ab > 0$?",
    choices: ["12", "15", "18", "21", "24"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$ab > 0$ exactly when $a$ and $b$ share a sign. The set has $3$ negative and $3$ positive values. Both positive: $3 \\cdot 3 = 9$; both negative: $3 \\cdot 3 = 9$. Total $18$.\n\n**Trigger cue**\n\n\"Product positive\": the two factors must have the same sign.\n\n**Takeaway**\n\nA product is positive exactly when the factors share a sign.",
    fastest_path_md:
      "Same-sign pairs: $3^2 + 3^2 = 18$.",
    trap_map: {
      "0": "Counts only the both-positive block.",
      "1": "Miscounts one sign block as having a different size.",
      "3": "Adds a diagonal or includes some opposite-sign pairs.",
      "4": "Counts every pair with $a \\ne b$ or similar over-broad condition.",
    },
    numeric_check: "18",
    check() {
      const S = [-3, -2, -1, 1, 2, 3];
      let c = 0;
      for (const a of S) for (const b of S) if (a * b > 0) c++;
      return { kind: "value", value: c };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 4,
    stem_md:
      "For how many integers $n$ with $1 \\le n \\le 40$ is $n^{2} + 3^{n}$ even?",
    choices: ["10", "13", "20", "27", "40"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$3^{n}$ is always odd, and $n^{2}$ has the parity of $n$. The sum $n^{2} + 3^{n}$ is (parity of $n$) $+$ odd, which is even exactly when $n$ is odd. The odd integers in $1 \\le n \\le 40$ are $1, 3, \\ldots, 39$: twenty of them.\n\n**Trigger cue**\n\nAn odd power of an odd base is odd; pair it against $n^{2}$ by parity.\n\n**Takeaway**\n\nOdd base to any power stays odd; only $n^2$ shifts the parity.",
    fastest_path_md:
      "$3^n$ odd, so need $n^2$ odd, i.e. $n$ odd: $20$ values.",
    trap_map: {
      "0": "Counts a wrong residue class rather than the odd integers.",
      "1": "Miscounts the odd integers in the range.",
      "3": "Counts the even $n$ (where the sum is odd) instead of the odd $n$.",
      "4": "Calls the sum even for every $n$, ignoring the parity of $n^2$.",
    },
    numeric_check: "20",
    check() {
      let c = 0;
      for (let n = 1n; n <= 40n; n++) if ((n * n + 3n ** n) % 2n === 0n) c++;
      return { kind: "value", value: c };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 4,
    stem_md:
      "For how many integers $n$ with $1 \\le n \\le 100$ is $\\dfrac{n(n + 1)}{2}$ odd?",
    choices: ["25", "40", "48", "50", "60"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe triangular number $T_n = \\tfrac{n(n+1)}{2}$ is odd exactly when $n \\equiv 1$ or $2 \\pmod 4$ (checking one full period: $T_1 = 1$ odd, $T_2 = 3$ odd, $T_3 = 6$ even, $T_4 = 10$ even, then the pattern repeats). In $1 \\le n \\le 100$ each residue class has $25$ members, so the odd ones number $25 + 25 = 50$.\n\n**Trigger cue**\n\n\"Parity of $\\tfrac{n(n+1)}{2}$\": it cycles odd, odd, even, even with period $4$.\n\n**Takeaway**\n\nTriangular numbers run odd, odd, even, even in a four-cycle.",
    fastest_path_md:
      "$T_n$ is odd for $n \\equiv 1, 2 \\pmod 4$: $25 + 25 = 50$.",
    trap_map: {
      "0": "Counts only one residue class, $n \\equiv 1 \\pmod 4$.",
      "1": "Applies a period-$5$ or otherwise wrong cycle length.",
      "2": "Counts $n \\equiv 0, 2, 3 \\pmod 4$ or another off-by-a-class error.",
      "4": "Overcounts by treating three of four residues as giving odd values.",
    },
    numeric_check: "50",
    check() {
      let c = 0;
      for (let n = 1; n <= 100; n++)
        if (((n * (n + 1)) / 2) % 2 === 1) c++;
      return { kind: "value", value: c };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
