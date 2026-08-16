/**
 * Batch: 13 new exponents_roots_properties items (value_order_factors).
 * Cells: D2 ×3, D3 ×5, D4 ×5 — the subtopic had 2/2/0/4 across D2–D5 and
 * could not fill even one chapter-test blend.
 * Trap language tracks the chapter's trap gallery: tower confusion, adding
 * exponents across a plus sign, "squaring makes bigger", keeping
 * impossible roots, assuming one representation.
 * Run: node scripts/author/batch-exponents_roots_properties-v2.mjs
 *      (APPEND=1 to write the bank)
 */
import { verifyAndAppend } from "./harness.mjs";

const S = {
  format: "problem_solving",
  content_domain: "arithmetic",
  fundamental_skill: "value_order_factors",
  subtopic: "exponents_roots_properties",
};

const items = [
  // 1 — D2 pure: collapse related bases to the smallest prime
  {
    ...S,
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $\\dfrac{9^{5} \\cdot 27^{2}}{3^{11}} = 3^{k}$, what is the value of $k$?",
    choices: ["$-5$", "$1$", "$4$", "$5$", "$16$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nRewrite every base as a power of $3$: $9^{5} = (3^{2})^{5} = 3^{10}$ and $27^{2} = (3^{3})^{2} = 3^{6}$. The numerator is $3^{10+6} = 3^{16}$, so the quotient is $3^{16-11} = 3^{5}$ and $k = 5$.\n\n**Trigger cue**\n\nA mix of related bases ($9$, $27$, $3$) in one expression: convert everything to the smallest prime base first, then add and subtract exponents.\n\n**Takeaway**\n\nOne base first, then exponent arithmetic — never the reverse.",
    fastest_path_md:
      "$9^{5}\\cdot 27^{2} = 3^{10}\\cdot 3^{6} = 3^{16}$; $16 - 11 = 5$.",
    trap_map: {
      "0": "Divides backwards, computing $11 - 16$ instead of $16 - 11$.",
      "1": "Adds inside each conversion — $9^{5}$ as $3^{2+5}$ and $27^{2}$ as $3^{3+2}$ — instead of multiplying the exponents.",
      "2": "Converts $27^{2}$ as $3^{3+2} = 3^{5}$: a power of a power multiplies exponents, it does not add them.",
      "4": "Combines the numerator correctly but forgets to subtract the denominator's exponent.",
    },
    numeric_check: "5",
    check() {
      const num = 9n ** 5n * 27n ** 2n;
      const den = 3n ** 11n;
      if (num % den !== 0n) throw new Error("not an integer power");
      const ratio = num / den;
      for (let k = -30; k <= 30; k++) {
        if (k >= 0 && 3n ** BigInt(k) === ratio) return { kind: "value", value: k };
      }
      throw new Error("no integer k");
    },
  },

  // 2 — D2 pure: copies of a power, not a bigger exponent
  {
    ...S,
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $2^{15} + 2^{15} + 2^{15} + 2^{15} = 2^{k}$, what is the value of $k$?",
    choices: ["$15$", "$16$", "$17$", "$30$", "$60$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFour identical copies of $2^{15}$ sum to $4 \\cdot 2^{15}$. Since $4 = 2^{2}$, the sum is $2^{2} \\cdot 2^{15} = 2^{17}$, so $k = 17$.\n\n**Trigger cue**\n\nThe same power added to itself several times: count the copies and factor — $n$ copies of $a^{x}$ is $n \\cdot a^{x}$, and if $n$ is itself a power of $a$ the exponents add.\n\n**Takeaway**\n\nAdding copies multiplies by the count; only then do exponents add.",
    fastest_path_md:
      "Four copies means $\\times 4 = \\times 2^{2}$, so $2^{15} \\to 2^{17}$.",
    trap_map: {
      "0": "Treats repeated addition of a power as leaving it unchanged.",
      "1": "Counts only one doubling, as if there were two copies rather than four.",
      "3": "Adds the exponents across the plus signs, $15 + 15$, instead of factoring out the common power.",
      "4": "Multiplies the exponent by the number of copies, $15 \\times 4$.",
    },
    numeric_check: "17",
    check() {
      const total = 2n ** 15n + 2n ** 15n + 2n ** 15n + 2n ** 15n;
      for (let k = 0; k <= 64; k++) {
        if (2n ** BigInt(k) === total) return { kind: "value", value: k };
      }
      throw new Error("no integer k");
    },
  },

  // 3 — D2 real: doubling model
  {
    ...S,
    content_domain: "arithmetic",
    context: "real",
    difficulty: 2,
    stem_md:
      "A bacterial culture doubles in number every $3$ hours. If the culture contains $400$ cells at 9:00 a.m., how many cells does it contain at 9:00 p.m. the same day?",
    choices: ["$1{,}600$", "$3{,}200$", "$4{,}800$", "$6{,}400$", "$1{,}638{,}400$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFrom 9:00 a.m. to 9:00 p.m. is $12$ hours, which is $\\frac{12}{3} = 4$ doubling periods. The count is $400 \\cdot 2^{4} = 400 \\cdot 16 = 6{,}400$.\n\n**Trigger cue**\n\n\"Doubles every $h$ hours\": model as $P \\cdot 2^{t/h}$ and count periods before touching the amounts.\n\n**Takeaway**\n\nCount doubling periods first; growth is a power, not a product.",
    fastest_path_md:
      "$12 \\div 3 = 4$ doublings; $400 \\to 800 \\to 1{,}600 \\to 3{,}200 \\to 6{,}400$.",
    trap_map: {
      "0": "Multiplies by the number of periods, $400 \\times 4$, instead of by $2^{4}$.",
      "1": "Stops one doubling short, at three periods.",
      "2": "Multiplies by the number of hours, $400 \\times 12$.",
      "4": "Doubles once per hour, computing $400 \\cdot 2^{12}$.",
    },
    numeric_check: "6400",
    check() {
      let cells = 400;
      for (let hour = 3; hour <= 12; hour += 3) cells *= 2;
      return { kind: "value", value: cells };
    },
  },

  // 4 — D3 pure: fractional exponents are root-then-power
  {
    ...S,
    context: "pure",
    difficulty: 3,
    stem_md: "What is the value of $16^{3/4} \\cdot 27^{2/3}$?",
    choices: ["$6$", "$18$", "$24$", "$72$", "$108$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nA fractional exponent is a root and a power: $16^{3/4} = \\left(16^{1/4}\\right)^{3} = 2^{3} = 8$, and $27^{2/3} = \\left(27^{1/3}\\right)^{2} = 3^{2} = 9$. The product is $8 \\cdot 9 = 72$.\n\n**Trigger cue**\n\nA fractional exponent $\\frac{p}{q}$: take the $q$th root first (small numbers), then raise to the $p$th power.\n\n**Takeaway**\n\nRoot first, power second — the numbers stay small.",
    fastest_path_md: "$16^{3/4} = 2^{3} = 8$; $27^{2/3} = 3^{2} = 9$; $8 \\cdot 9 = 72$.",
    trap_map: {
      "0": "Takes only the roots, $2 \\cdot 3$, dropping both numerators.",
      "1": "Drops the cube on the $16$ term, using $2 \\cdot 9$.",
      "2": "Drops the square on the $27$ term, using $8 \\cdot 3$.",
      "4": "Multiplies base by exponent on the first factor, reading $16^{3/4}$ as $16 \\cdot \\frac{3}{4} = 12$.",
    },
    numeric_check: "72",
    check() {
      let root16 = null;
      for (let a = 1; a <= 50; a++) if (a ** 4 === 16) root16 = a;
      let root27 = null;
      for (let b = 1; b <= 50; b++) if (b ** 3 === 27) root27 = b;
      if (root16 == null || root27 == null) throw new Error("no integer root");
      return { kind: "value", value: root16 ** 3 * root27 ** 2 };
    },
  },

  // 5 — D3 pure: one base, then equate exponents
  {
    ...S,
    context: "pure",
    difficulty: 3,
    stem_md: "If $2^{x+3} = 8^{x-1}$, what is the value of $x$?",
    choices: ["$\\dfrac{3}{2}$", "$2$", "$3$", "$6$", "$8$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite the right side in base $2$: $8^{x-1} = \\left(2^{3}\\right)^{x-1} = 2^{3(x-1)} = 2^{3x-3}$. With equal bases (and base $2 \\ne 1$) the exponents must match: $x + 3 = 3x - 3$, so $2x = 6$ and $x = 3$.\n\n**Trigger cue**\n\nTwo different but related bases across an equals sign: rewrite both in the common prime base, then set the exponents equal.\n\n**Takeaway**\n\nMatch the bases before you ever match exponents.",
    fastest_path_md: "$8^{x-1} = 2^{3x-3}$; $x + 3 = 3x - 3 \\Rightarrow x = 3$.",
    trap_map: {
      "0": "Drops the $-1$ inside the exponent, solving $x + 3 = 3x$.",
      "1": "Distributes the $3$ to $x$ only, solving $x + 3 = 3x - 1$.",
      "3": "Stops at $2x = 6$ and reports that value instead of $x$.",
      "4": "Answers $2^{x}$, the quantity in the exponent tower, rather than $x$ itself.",
    },
    numeric_check: "3",
    check() {
      const hits = [];
      for (let twice = -40; twice <= 40; twice++) {
        const x = twice / 2;
        if (Math.abs(2 ** (x + 3) - 8 ** (x - 1)) < 1e-9) hits.push(x);
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 6 — D3 pure: a square has two roots
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $(x - 2)^{2} = 25$, what is the sum of all possible values of $x$?",
    choices: ["$-3$", "$4$", "$7$", "$10$", "$14$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nTaking the square root gives $|x - 2| = 5$, so $x - 2 = 5$ or $x - 2 = -5$, i.e. $x = 7$ or $x = -3$. Their sum is $7 + (-3) = 4$.\n\n**Trigger cue**\n\nA squared expression set equal to a number: write $\\pm$ immediately and carry both branches to the end.\n\n**Takeaway**\n\nSquares hide two roots; the sum of them is twice the anchor.",
    fastest_path_md:
      "Roots sit symmetrically about $x = 2$, so they sum to $2 \\cdot 2 = 4$ without solving.",
    trap_map: {
      "0": "Keeps only the negative branch, $x = -3$.",
      "2": "Keeps only the positive branch, $x = 7$.",
      "3": "Finds both roots but adds their absolute values, $7 + 3$.",
      "4": "Doubles the positive root, treating $\\pm$ as \"twice the answer\".",
    },
    numeric_check: "4",
    check() {
      let sum = 0;
      for (let x = -100; x <= 100; x++) if ((x - 2) ** 2 === 25) sum += x;
      return { kind: "value", value: sum };
    },
  },

  // 7 — D3 real: half-life
  {
    ...S,
    context: "real",
    difficulty: 3,
    stem_md:
      "A sample of an isotope loses half of its mass every $8$ years. If the sample has a mass of $160$ grams today, what will its mass be, in grams, $40$ years from now?",
    choices: ["$4$", "$5$", "$10$", "$20$", "$32$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\n$40$ years is $\\frac{40}{8} = 5$ half-life periods, so the mass is $160 \\cdot 2^{-5} = \\frac{160}{32} = 5$ grams.\n\n**Trigger cue**\n\n\"Cut in half every $h$ years\": model as $P \\cdot 2^{-t/h}$ and count periods before dividing anything.\n\n**Takeaway**\n\nHalving $n$ times divides by $2^{n}$, never by $n$.",
    fastest_path_md: "$5$ halvings: $160 \\to 80 \\to 40 \\to 20 \\to 10 \\to 5$.",
    trap_map: {
      "0": "Halves six times, an off-by-one on the period count.",
      "2": "Halves only four times.",
      "3": "Halves only three times, miscounting $40 \\div 8$.",
      "4": "Divides $160$ by the $5$ periods instead of halving five times.",
    },
    numeric_check: "160/32",
    check() {
      let mass = 160;
      for (let year = 8; year <= 40; year += 8) mass /= 2;
      return { kind: "value", value: mass };
    },
  },

  // 8 — D3 pure: exponent system, then evaluate the powers
  {
    ...S,
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $a$ and $b$ are integers such that $3^{a} \\cdot 3^{b} = 81$ and $a - b = 2$, what is the value of $3^{a} - 3^{b}$?",
    choices: ["$2$", "$9$", "$24$", "$26$", "$78$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$3^{a} \\cdot 3^{b} = 3^{a+b} = 81 = 3^{4}$, so $a + b = 4$. With $a - b = 2$, adding gives $2a = 6$, so $a = 3$ and $b = 1$. Then $3^{a} - 3^{b} = 27 - 3 = 24$.\n\n**Trigger cue**\n\nA product of same-base powers equal to a constant: collapse to one exponent, and read the constant as a power of that base.\n\n**Takeaway**\n\nMultiplying powers adds exponents; solve for the exponents first.",
    fastest_path_md: "$a+b=4$, $a-b=2 \\Rightarrow a=3, b=1$; $27 - 3 = 24$.",
    trap_map: {
      "0": "Reports $a - b$, the quantity already given, instead of the difference of the powers.",
      "1": "Computes $3^{a-b} = 3^{2}$, treating a difference of powers as a power of the difference.",
      "3": "Uses $b = 0$, ignoring that the exponents must sum to $4$.",
      "4": "Reads $3^{a} = 81$, taking the whole product as the first power, and computes $81 - 3$.",
    },
    numeric_check: "27 - 3",
    check() {
      const hits = [];
      for (let a = -10; a <= 10; a++) {
        for (let b = -10; b <= 10; b++) {
          if (3 ** a * 3 ** b === 81 && a - b === 2) hits.push(3 ** a - 3 ** b);
        }
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 9 — D4 pure: ordering powers with unrelated bases
  {
    ...S,
    context: "pure",
    difficulty: 4,
    stem_md: "Which of the following is greatest?",
    choices: ["$2^{30}$", "$3^{20}$", "$5^{13}$", "$6^{12}$", "$10^{9}$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nMatch exponents to compare bases. $2^{30} = \\left(2^{3}\\right)^{10} = 8^{10}$ and $3^{20} = \\left(3^{2}\\right)^{10} = 9^{10}$, so $3^{20} > 2^{30}$. Against $6^{12}$: $3^{20} = \\left(3^{5}\\right)^{4} = 243^{4}$ while $6^{12} = \\left(6^{3}\\right)^{4} = 216^{4}$, so $3^{20}$ wins again. And $5^{13} < 5^{13}\\cdot 2 < 3^{20}$ since $5^{13} \\approx 1.2 \\times 10^{9}$ against $3^{20} \\approx 3.5 \\times 10^{9}$, with $10^{9}$ smaller still.\n\n**Trigger cue**\n\nPowers with unrelated bases and unequal exponents: rewrite them over a common exponent, then compare bases directly.\n\n**Takeaway**\n\nEqualize the exponents; the bigger base then wins outright.",
    fastest_path_md:
      "Common exponent $10$: $2^{30} = 8^{10}$, $3^{20} = 9^{10}$. Common exponent $4$: $3^{20} = 243^{4}$, $6^{12} = 216^{4}$. $3^{20}$ tops both.",
    trap_map: {
      "0": "Picks the largest exponent, treating $30$ as decisive regardless of base.",
      "2": "Compares base $\\times$ exponent products ($5 \\cdot 13 = 65$) instead of the powers themselves.",
      "3": "Picks the largest base-and-exponent combination by eye without equalizing exponents.",
      "4": "Picks the largest base, assuming powers of $10$ dominate.",
    },
    numeric_check: "3^20",
    check() {
      const values = [2n ** 30n, 3n ** 20n, 5n ** 13n, 6n ** 12n, 10n ** 9n];
      let best = 0;
      for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
      for (let i = 0; i < values.length; i++)
        if (i !== best && values[i] === values[best]) throw new Error("tie");
      return { kind: "index", index: best };
    },
  },

  // 10 — D4 pure: substitute y = 2^x, discard the impossible root
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 4,
    stem_md:
      "If $4^{x} - 9 \\cdot 2^{x} + 8 = 0$, what is the sum of all values of $x$ that satisfy the equation?",
    choices: ["$0$", "$3$", "$8$", "$9$", "$11$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\n$4^{x} = \\left(2^{x}\\right)^{2}$, so with $y = 2^{x}$ the equation is $y^{2} - 9y + 8 = 0$, i.e. $(y-1)(y-8) = 0$ and $y = 1$ or $y = 8$. Both are positive, so both survive: $2^{x} = 1$ gives $x = 0$ and $2^{x} = 8$ gives $x = 3$. The sum is $0 + 3 = 3$.\n\n**Trigger cue**\n\nBoth $a^{2x}$ and $a^{x}$ (here $4^{x}$ and $2^{x}$) in one equation: substitute $y = a^{x}$ and solve the quadratic.\n\n**Takeaway**\n\nSubstitute, solve, then convert every positive root back to $x$.",
    fastest_path_md:
      "$y = 2^{x}$: $y^{2} - 9y + 8 = 0 \\Rightarrow y = 1, 8 \\Rightarrow x = 0, 3$; sum $3$.",
    trap_map: {
      "0": "Reports only the root $x = 0$, discarding $y = 8$ as though it were impossible.",
      "2": "Reports $y = 8$ instead of converting back to $x = 3$.",
      "3": "Sums the substituted values $1 + 8$ rather than the exponents.",
      "4": "Mixes the two worlds, adding the exponent $3$ to the substituted value $8$.",
    },
    numeric_check: "0 + 3",
    check() {
      const roots = [];
      for (let twice = -40; twice <= 40; twice++) {
        const x = twice / 2;
        if (Math.abs(4 ** x - 9 * 2 ** x + 8) < 1e-9) roots.push(x);
      }
      if (roots.length !== 2) throw new Error(`roots: ${roots}`);
      return { kind: "value", value: roots[0] + roots[1] };
    },
  },

  // 11 — D4 real: run the doubling backwards
  {
    ...S,
    context: "real",
    difficulty: 4,
    stem_md:
      "The area of a pond covered by algae doubles every $4$ days. The pond is completely covered on day $24$. On which day was the pond exactly one-eighth covered?",
    choices: ["$3$", "$8$", "$12$", "$16$", "$21$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nOne-eighth is $2^{-3}$ of full, so the pond was one-eighth covered three doublings before it was full. Three doublings take $3 \\times 4 = 12$ days, so the day is $24 - 12 = 12$.\n\n**Trigger cue**\n\nA doubling process given at its endpoint and asked about a fraction of it: count backwards in doublings, not in days or fractions.\n\n**Takeaway**\n\nEach halving backwards costs one full doubling period.",
    fastest_path_md:
      "Full on $24$, half on $20$, quarter on $16$, eighth on $12$.",
    trap_map: {
      "0": "Divides the final day by $8$, treating the fraction as a divisor of time.",
      "1": "Takes one-third of $24$, confusing \"one-eighth covered\" with a share of the elapsed days.",
      "3": "Steps back only two doublings, reaching one-quarter rather than one-eighth.",
      "4": "Subtracts one day per halving, $24 - 3$.",
    },
    numeric_check: "24 - 12",
    check() {
      const hits = [];
      for (let day = 0; day <= 24; day += 4) {
        const share = 2 ** ((day - 24) / 4);
        if (Math.abs(share - 1 / 8) < 1e-12) hits.push(day);
      }
      if (hits.length !== 1) throw new Error(`days: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 12 — D4 pure: factor the common power out of a difference
  {
    ...S,
    content_domain: "algebra",
    context: "pure",
    difficulty: 4,
    stem_md:
      "If $n$ is an integer, what is the value of $\\dfrac{2^{n+3} - 2^{n}}{2^{n-1}}$?",
    choices: ["$7$", "$14$", "$15$", "$16$", "$28$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nFactor the common power out of the numerator: $2^{n+3} - 2^{n} = 2^{n}\\left(2^{3} - 1\\right) = 7 \\cdot 2^{n}$. Dividing by $2^{n-1}$ leaves $7 \\cdot 2^{n - (n-1)} = 7 \\cdot 2 = 14$, independent of $n$.\n\n**Trigger cue**\n\nA sum or difference of powers of one base over another power of that base: factor out the smallest power, then subtract exponents once.\n\n**Takeaway**\n\nFactor across a minus sign; you can never subtract exponents through it.",
    fastest_path_md:
      "Numerator $= 2^{n}(8-1) = 7\\cdot 2^{n}$; over $2^{n-1}$ that is $7 \\cdot 2 = 14$.",
    trap_map: {
      "0": "Divides by $2^{n}$ rather than $2^{n-1}$, losing the final factor of $2$.",
      "2": "Subtracts exponents term by term as $2^{4} - 2^{0} = 16 - 1$.",
      "3": "Keeps only the leading term, $2^{(n+3)-(n-1)} = 2^{4}$.",
      "4": "Applies the $-1$ in the denominator twice, doubling the result.",
    },
    numeric_check: "14",
    check() {
      const values = new Set();
      for (const n of [1, 2, 5, 9, 12, 20]) {
        values.add((2 ** (n + 3) - 2 ** n) / 2 ** (n - 1));
      }
      if (values.size !== 1) throw new Error(`n-dependent: ${[...values]}`);
      return { kind: "value", value: [...values][0] };
    },
  },

  // 13 — D4 pure: one number, many representations as x^y
  {
    ...S,
    context: "pure",
    difficulty: 4,
    stem_md:
      "If $x$ and $y$ are positive integers and $x^{y} = 1{,}296$, how many ordered pairs $(x, y)$ satisfy the equation?",
    choices: ["$2$", "$3$", "$4$", "$5$", "$6$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\n$1{,}296 = 2^{4} \\cdot 3^{4} = 6^{4}$. A pair works exactly when $y$ divides the common exponent $4$, since $x = 6^{4/y}$ must be an integer: $y = 1$ gives $x = 1{,}296$, $y = 2$ gives $x = 36$, $y = 4$ gives $x = 6$. $y = 3$ fails because $1{,}296$ is not a perfect cube. That is $3$ pairs.\n\n**Trigger cue**\n\n$x^{y} = N$ with integer constraints: prime-factorize $N$, write it as a single base to a power, and list the divisors of that exponent.\n\n**Takeaway**\n\nEvery representation of $N$ as $x^{y}$ comes from a divisor of its exponent.",
    fastest_path_md:
      "$1{,}296 = 6^{4}$; divisors of $4$ are $1, 2, 4$, so three pairs: $(1296,1), (36,2), (6,4)$.",
    trap_map: {
      "0": "Counts only the compressed forms $36^{2}$ and $6^{4}$, forgetting the trivial $y = 1$.",
      "2": "Adds $y = 3$, treating $1{,}296$ as a perfect cube as well as a perfect square.",
      "3": "Counts every $y$ from $1$ to $5$ without testing whether $1{,}296^{1/y}$ is an integer.",
      "4": "Counts one pair for each divisor of $1{,}296$ that is itself a perfect power.",
    },
    numeric_check: "3",
    check() {
      let count = 0;
      for (let x = 1; x <= 1296; x++) {
        let power = 1;
        for (let y = 1; y <= 20; y++) {
          power *= x;
          if (power === 1296) count++;
          if (power > 1296) break;
        }
      }
      return { kind: "value", value: count };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
