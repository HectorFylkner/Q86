/**
 * Second authoring wave for exponents_roots_properties: +7 to clear the
 * ~25 floor. Each check() recomputes the answer by brute force or
 * substitution over the raw stem data, independent of the solution.
 *
 * Run: node --experimental-strip-types scripts/author/batch2-exponents_roots_properties.mjs [--append]
 */
import { verifyAndAppend } from "./harness.mjs";

const isSquare = (n) => {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
};

const items = [
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 3,
    stem_md: "If $4^{x} = 8^{x - 1}$, what is the value of $x$?",
    choices: ["1", "2", "3", "4", "6"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite both sides as powers of $2$: $4^{x} = 2^{2x}$ and $8^{x-1} = 2^{3(x-1)} = 2^{3x - 3}$. Equal bases force equal exponents: $2x = 3x - 3$, so $x = 3$.\n\n**Trigger cue**\n\nDifferent bases that are powers of one number: rewrite everything on that common base.\n\n**Takeaway**\n\nCommon base first; then equate exponents.",
    fastest_path_md:
      "Both sides are powers of $2$: $2x = 3(x-1)$ gives $x = 3$.",
    trap_map: {
      "0": "Sets $2x = 3x + 1$ or otherwise mishandles the $-1$ in the exponent.",
      "1": "Equates the bases $4$ and $8$ directly instead of rewriting on base $2$.",
      "3": "Solves $2x = 3x - 3$ but adds one to the result.",
      "4": "Uses $2x = 3(x - 1)$ then doubles the answer.",
    },
    numeric_check: "3",
    check() {
      for (let x = -20; x <= 20; x++) {
        if (4 ** x === 8 ** (x - 1)) return { kind: "value", value: x };
      }
      throw new Error("no solution");
    },
  },
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 4,
    stem_md: "If $3^{x} = 5$, what is the value of $3^{2x + 1}$?",
    choices: ["11", "15", "25", "75", "125"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSplit the exponent using the laws: $3^{2x + 1} = 3^{2x} \\cdot 3^{1} = (3^{x})^{2} \\cdot 3 = 5^{2} \\cdot 3 = 25 \\cdot 3 = 75$.\n\n**Trigger cue**\n\nA target exponent built from a known one: break it into $(3^x)^k \\cdot 3^m$.\n\n**Takeaway**\n\nRewrite the target as powers of the known quantity, then substitute.",
    fastest_path_md:
      "$3^{2x+1} = 3 \\cdot (3^x)^2 = 3 \\cdot 25 = 75$.",
    trap_map: {
      "0": "Adds instead of using exponent laws: $5 + 3^{1} + 3$ style slip.",
      "1": "Computes $3 \\cdot 5 = 15$, treating $2x + 1$ as $x + 1$.",
      "2": "Reports $(3^x)^2 = 25$ but drops the extra factor of $3$.",
      "4": "Uses $5^{3} / 3$ or otherwise cubes the base instead of squaring.",
    },
    numeric_check: "75",
    check() {
      const threeX = 5; // given
      return { kind: "value", value: 3 * threeX ** 2 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 3,
    stem_md: "What is the value of $\\dfrac{6^{6}}{2^{6} \\cdot 3^{4}}$?",
    choices: ["1", "3", "6", "9", "27"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$6^{6} = (2 \\cdot 3)^{6} = 2^{6} \\cdot 3^{6}$. Dividing, $\\dfrac{2^{6} \\cdot 3^{6}}{2^{6} \\cdot 3^{4}} = 3^{6 - 4} = 3^{2} = 9$.\n\n**Trigger cue**\n\nA power of a product over its prime pieces: split the base and cancel.\n\n**Takeaway**\n\nSplit $(ab)^n$ into $a^n b^n$, then subtract exponents.",
    fastest_path_md:
      "$6^6 = 2^6 3^6$; cancel $2^6$ and $3^4$ to leave $3^2 = 9$.",
    trap_map: {
      "0": "Cancels all exponents to $1$, forgetting $3^{6-4}$ remains.",
      "1": "Computes $3^{6-4}$ as $3^{1}$.",
      "2": "Leaves a stray factor of $6$ by cancelling only the $3$s.",
      "4": "Uses $3^{6 - 3} = 27$, mis-subtracting the exponent of $3$.",
    },
    numeric_check: "9",
    check() {
      return { kind: "value", value: (6 ** 6) / (2 ** 6 * 3 ** 4) };
    },
  },
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 3,
    stem_md: "If $\\sqrt{x} = 2\\sqrt{3}$, what is the value of $x^{2}$?",
    choices: ["12", "24", "36", "72", "144"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nSquare both sides: $x = (2\\sqrt{3})^{2} = 4 \\cdot 3 = 12$. Then $x^{2} = 12^{2} = 144$.\n\n**Trigger cue**\n\nA root equals a simplified surd: square to clear the radical, then finish.\n\n**Takeaway**\n\nSquare a coefficient-times-root as $a^2$ times the radicand.",
    fastest_path_md:
      "$x = 4 \\cdot 3 = 12$, so $x^2 = 144$.",
    trap_map: {
      "0": "Stops at $x = 12$, answering the intermediate value.",
      "1": "Doubles $12$ instead of squaring it.",
      "2": "Squares only the coefficient: $(2\\sqrt 3)^2$ read as $6^2/1$ mishandled to $36$.",
      "3": "Computes $(2 \\cdot 3)^2 = 36$ then mislabels, or uses $x = 6$ giving $72$ via a further slip.",
    },
    numeric_check: "144",
    check() {
      const x = (2 * Math.sqrt(3)) ** 2;
      return { kind: "value", value: x ** 2 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 2,
    stem_md: "What is the value of $\\left(\\dfrac{2}{3}\\right)^{-2}$?",
    choices: [
      "$-\\dfrac{4}{9}$",
      "$\\dfrac{4}{9}$",
      "$\\dfrac{3}{2}$",
      "$\\dfrac{9}{4}$",
      "$\\dfrac{4}{3}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nA negative exponent inverts the base: $\\left(\\tfrac{2}{3}\\right)^{-2} = \\left(\\tfrac{3}{2}\\right)^{2} = \\tfrac{9}{4}$.\n\n**Trigger cue**\n\nNegative exponent on a fraction: flip the fraction, drop the sign, then apply the power.\n\n**Takeaway**\n\nNegative exponent flips the base; the sign never leaks to the value.",
    fastest_path_md:
      "Flip to $\\tfrac{3}{2}$ and square: $\\tfrac{9}{4}$.",
    trap_map: {
      "0": "Treats the negative exponent as negating the value.",
      "1": "Squares without flipping the fraction.",
      "2": "Flips but forgets to apply the exponent $2$.",
      "4": "Flips and applies exponent $1$ instead of $2$.",
    },
    numeric_check: "9/4",
    check() {
      return { kind: "value", value: (2 / 3) ** -2 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 5,
    stem_md:
      "If $9^{x} - 4 \\cdot 3^{x} + 3 = 0$, what is the sum of all possible values of $x$?",
    choices: ["0", "1", "3", "4", "9"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLet $y = 3^{x}$, so $9^{x} = (3^{x})^{2} = y^{2}$. The equation becomes $y^{2} - 4y + 3 = 0 = (y - 1)(y - 3)$, giving $y = 1$ or $y = 3$. Then $3^{x} = 1 \\Rightarrow x = 0$ and $3^{x} = 3 \\Rightarrow x = 1$. The sum is $0 + 1 = 1$.\n\n**Trigger cue**\n\nA quadratic in $a^{2x}$ and $a^{x}$: substitute $y = a^{x}$ and factor.\n\n**Takeaway**\n\nSubstitute $y = a^x$; solve the quadratic, then recover each $x$.",
    fastest_path_md:
      "$y = 3^x$ gives $(y-1)(y-3) = 0$; $x = 0$ and $x = 1$ sum to $1$.",
    trap_map: {
      "0": "Keeps only the root $x = 0$ from $3^x = 1$.",
      "2": "Sums the $y$-roots $1 + 3$ instead of the $x$-values, or takes $y = 3$'s exponent wrongly.",
      "3": "Adds the $y$-values $1 + 3$ and reads it as the $x$-sum.",
      "4": "Reports $9$ from $9^x$ without substituting.",
    },
    numeric_check: "1",
    check() {
      const roots = [];
      for (let x = -10; x <= 10; x++) {
        if (Math.abs(9 ** x - 4 * 3 ** x + 3) < 1e-9) roots.push(x);
      }
      return { kind: "value", value: roots.reduce((s, r) => s + r, 0) };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "exponents_roots_properties",
    difficulty: 4,
    stem_md:
      "For how many integers $n$ with $1 \\le n \\le 10$ is $2^{n} \\cdot 9$ a perfect square?",
    choices: ["3", "4", "5", "6", "10"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$2^{n} \\cdot 9 = 2^{n} \\cdot 3^{2}$. The factor $3^{2}$ is already a square, so the product is a perfect square exactly when $2^{n}$ is — that is, when $n$ is even. In $1 \\le n \\le 10$ the even values are $2, 4, 6, 8, 10$: five of them.\n\n**Trigger cue**\n\n\"$k \\cdot 2^{n}$ a perfect square\": every prime exponent must be even.\n\n**Takeaway**\n\nA product is square exactly when every prime exponent is even.",
    fastest_path_md:
      "$9$ is already square, so need $2^n$ square: $n$ even, five values.",
    trap_map: {
      "0": "Counts only $n \\in \\{2,4,6\\}$ within a mis-set range.",
      "1": "Counts even $n$ but drops one endpoint.",
      "3": "Includes an odd $n$ by treating $2^n \\cdot 9$ as square whenever $n$ is a multiple of a small number.",
      "4": "Calls every $n$ valid because $9$ is a perfect square.",
    },
    numeric_check: "5",
    check() {
      let c = 0;
      for (let n = 1; n <= 10; n++) if (isSquare(2 ** n * 9)) c++;
      return { kind: "value", value: c };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
