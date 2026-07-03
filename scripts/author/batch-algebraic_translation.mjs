/**
 * Batch: 14 new algebraic_translation items (equal_unequal_alg, algebra).
 * Run from repo root: node scripts/author/batch-algebraic_translation.mjs
 * Set APPEND=1 to actually write to the bank.
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

/**
 * DS verdict from enumerated models. m1/m2/mb are arrays of the question's
 * answer (a value or a boolean) over every model allowed by statement (1)
 * alone, statement (2) alone, and both combined, respectively.
 */
function dsVerdict(m1, m2, mb) {
  if (m1.length === 0 || m2.length === 0) throw new Error("a statement admits no models");
  if (mb.length === 0) throw new Error("statements are mutually inconsistent");
  const determined = (arr) => new Set(arr).size === 1;
  const s1 = determined(m1);
  const s2 = determined(m2);
  if (s1 && s2) return 3;
  if (s1) return 0;
  if (s2) return 1;
  if (determined(mb)) return 2;
  return 4;
}

const base = {
  content_domain: "algebra",
  fundamental_skill: "equal_unequal_alg",
  subtopic: "algebraic_translation",
};

const items = [
  // ── 1. D3 PS pure ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "pure",
    difficulty: 3,
    stem_md:
      "Four more than half of a number $n$ is equal to two less than $n$. What is the value of $n$?",
    choices: ["-4", "4", "6", "8", "12"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nTranslate literally: $\\frac{n}{2} + 4 = n - 2$. Subtract $\\frac{n}{2}$ from both sides: $4 = \\frac{n}{2} - 2$, so $\\frac{n}{2} = 6$ and $n = 12$.\n\n**Trigger cue**\n\nA single unknown wrapped in \"more than / less than\" phrases: translate each side in place, then solve the one-variable equation.\n\n**Takeaway**\n\nTranslate phrase by phrase; \"less than\" reverses the subtraction order.",
    fastest_path_md:
      "Backsolve: at $n = 12$, half of it plus four is $10$, and $12 - 2 = 10$. Match on the first clean candidate.",
    trap_map: {
      "0": "Translates \"four more than half\" as $\\frac{n}{2} - 4$, flipping the sign of the $4$.",
      "1": "Writes the right side as $n + 2$ instead of $n - 2$.",
      "2": "Reaches $\\frac{n}{2} = 6$ and reports $6$ without doubling.",
      "3": "Takes half of $n + 4$ instead, solving $\\frac{n+4}{2} = n - 2$.",
    },
    numeric_check: "2*(4+2)",
    check() {
      const hits = [];
      for (let n = -1000; n <= 1000; n++) {
        if (n / 2 + 4 === n - 2) hits.push(n);
      }
      if (hits.length !== 1) throw new Error("non-unique solution");
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 2. D3 PS pure ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "pure",
    difficulty: 3,
    stem_md:
      "The sum of two numbers is $43$, and the larger number is $7$ more than twice the smaller number. What is the larger number?",
    choices: ["12", "18", "24", "25", "31"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nLet the smaller number be $s$; the larger is $2s + 7$. The sum gives $s + (2s + 7) = 43$, so $3s = 36$ and $s = 12$. The larger number is $2(12) + 7 = 31$.\n\n**Trigger cue**\n\nA sum plus one comparative relation between two unknowns: substitute the relation into the sum so only one variable remains.\n\n**Takeaway**\n\nUse one variable for both numbers, then answer the number asked for.",
    fastest_path_md:
      "Peel off the extra $7$: $43 - 7 = 36$ splits $1:2$ into $12$ and $24$, so the larger is $24 + 7 = 31$. Or backsolve: $31$ leaves $12$, and $2(12) + 7 = 31$. ✓",
    trap_map: {
      "0": "Solves correctly but reports the smaller number.",
      "1": "Treats $7$ as a plain difference and reports the smaller half of $(43-7)$.",
      "2": "Doubles the smaller number but forgets to add the $7$.",
      "3": "Misapplies the sum-and-difference shortcut $(43+7)/2$ although the relation is not a plain difference.",
    },
    numeric_check: "2*12+7",
    check() {
      const hits = [];
      for (let s = -100; s <= 143; s++) {
        const l = 43 - s;
        if (l === 2 * s + 7 && l > s) hits.push(l);
      }
      if (hits.length !== 1) throw new Error("non-unique solution");
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 3. D4 PS pure ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "pure",
    difficulty: 4,
    stem_md:
      "Seven times a number, decreased by $4$, equals five times the result of decreasing the number by $4$. What is the number?",
    choices: ["-12", "-8", "0", "8", "12"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLet the number be $n$. The first phrase is $7n - 4$; the second is $5(n - 4)$. Set them equal: $7n - 4 = 5n - 20$, so $2n = -16$ and $n = -8$.\n\n**Trigger cue**\n\n\"Decreased by\" attached to a multiplied quantity: the whole decreased quantity goes in parentheses before the multiplier acts.\n\n**Takeaway**\n\nParenthesize the quantity being multiplied before subtracting.",
    fastest_path_md:
      "Backsolve with the negatives first: $n = -8$ gives $7(-8) - 4 = -60$ and $5(-8 - 4) = -60$. Match.",
    trap_map: {
      "0": "Translates the left side as $7n + 4$, flipping \"decreased by.\"",
      "2": "Fails to distribute the $5$, solving $7n - 4 = 5n - 4$.",
      "3": "Drops the sign in the final step, solving $2n = 16$.",
      "4": "Distributes to $5n + 20$ instead of $5n - 20$.",
    },
    numeric_check: "(-20+4)/2",
    check() {
      const hits = [];
      for (let n = -1000; n <= 1000; n++) {
        if (7 * n - 4 === 5 * (n - 4)) hits.push(n);
      }
      if (hits.length !== 1) throw new Error("non-unique solution");
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 4. D3 PS real ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "real",
    difficulty: 3,
    stem_md:
      "In a trivia contest, Mika and Jonas scored $96$ points combined, and Mika scored $14$ points more than Jonas. How many points did Jonas score?",
    choices: ["34", "41", "48", "55", "62"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLet Jonas's score be $j$; Mika's is $j + 14$. Then $j + (j + 14) = 96$, so $2j = 82$ and $j = 41$.\n\n**Trigger cue**\n\nA total together with a fixed gap between two people: one variable and one equation settle it.\n\n**Takeaway**\n\nSubtract the gap from the total, halve, then check who was asked.",
    fastest_path_md:
      "$(96 - 14) / 2 = 41$ is the smaller share — and Jonas is the lower scorer, so no further step is needed.",
    trap_map: {
      "0": "Subtracts the $14$-point gap twice before halving.",
      "2": "Halves the total and ignores the gap entirely.",
      "3": "Reports Mika's score instead of Jonas's.",
      "4": "Adds the gap to half the total, overshooting even Mika's score.",
    },
    numeric_check: "(96-14)/2",
    check() {
      const hits = [];
      for (let j = 0; j <= 96; j++) {
        if (j + (j + 14) === 96) hits.push(j);
      }
      if (hits.length !== 1) throw new Error("non-unique solution");
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 5. D3 PS pure ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "pure",
    difficulty: 3,
    stem_md:
      "What is the greatest integer $n$ such that four times $n$ decreased by $9$ is smaller than twice $n$ increased by $8$?",
    choices: ["-1", "2", "7", "8", "9"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nTranslate: $4n - 9 < 2n + 8$. Subtract $2n$ and add $9$: $2n < 17$, so $n < 8.5$. The greatest integer below $8.5$ is $8$.\n\n**Trigger cue**\n\n\"Greatest integer such that\" plus an inequality: solve the inequality exactly, then step to the nearest allowed integer.\n\n**Takeaway**\n\nSolve to the exact boundary, then round toward the allowed side.",
    fastest_path_md:
      "$2n < 17$ in one move, so $n < 8.5$ — take $8$. A quick plug confirms: $4(8) - 9 = 23 < 24 = 2(8) + 8$.",
    trap_map: {
      "0": "Adds $9$ instead of subtracting, reaching $2n < -1$.",
      "1": "Adds $2n$ to the left instead of subtracting, reaching $6n < 17$.",
      "2": "Backs off one extra integer below the true maximum of $8$.",
      "4": "Rounds $8.5$ up instead of taking the greatest integer below it.",
    },
    numeric_check: "8",
    check() {
      let best = null;
      for (let n = -1000; n <= 1000; n++) {
        if (4 * n - 9 < 2 * n + 8) best = best === null ? n : Math.max(best, n);
      }
      if (best === null) throw new Error("no solution");
      return { kind: "value", value: best };
    },
  },

  // ── 6. D4 PS real ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "real",
    difficulty: 4,
    stem_md:
      "At a fair, every ride ticket costs the same amount. If Priya buys $5$ tickets, she will have $\\$7$ left over; to buy $8$ tickets, she would need $\\$5$ more than she has. How much money does Priya have?",
    choices: ["$\\$12$", "$\\$20$", "$\\$27$", "$\\$32$", "$\\$39$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $m$ be her money and $p$ the ticket price. Then $m = 5p + 7$ and $m = 8p - 5$. Setting the expressions equal: $5p + 7 = 8p - 5$, so $3p = 12$ and $p = 4$. Hence $m = 5(4) + 7 = 27$.\n\n**Trigger cue**\n\nA surplus under one purchase and a shortfall under another: both describe the same amount of money, so equate them.\n\n**Takeaway**\n\nSurplus plus shortfall equals the cost of the extra units.",
    fastest_path_md:
      "The jump from $5$ to $8$ tickets swings her from $\\$7$ over to $\\$5$ short — a $\\$12$ swing across $3$ tickets, so each costs $\\$4$. Money: $5(4) + 7 = \\$27$.",
    trap_map: {
      "0": "Adds the leftover $\\$7$ to the shortfall $\\$5$ and stops at the cash swing.",
      "1": "Reports the cost of $5$ tickets, dropping the $\\$7$ she keeps.",
      "3": "Reports the cost of $8$ tickets, which is more money than she has.",
      "4": "Adds the $\\$7$ leftover to the $8$-ticket cost.",
    },
    numeric_check: "5*4+7",
    check() {
      const hits = [];
      for (let p = 1; p <= 500; p++) {
        const m = 5 * p + 7;
        if (8 * p === m + 5) hits.push(m);
      }
      if (hits.length !== 1) throw new Error("non-unique solution");
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 7. D4 PS pure ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "pure",
    difficulty: 4,
    stem_md:
      "For numbers $a$, $b$, and $c$, the sum of $a$ and $b$ is $9$, the sum of $a$ and $c$ is $13$, and the sum of $b$ and $c$ is $16$. What is the value of $c$?",
    choices: ["3", "6", "10", "13", "19"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nAdd all three equations: $(a+b) + (a+c) + (b+c) = 9 + 13 + 16 = 38$, so $2(a + b + c) = 38$ and $a + b + c = 19$. Subtract $a + b = 9$: $c = 19 - 9 = 10$.\n\n**Trigger cue**\n\nAll three pairwise sums given: add them — every variable appears exactly twice — instead of solving by substitution.\n\n**Takeaway**\n\nSumming pairwise sums counts each variable twice.",
    fastest_path_md:
      "$9 + 13 + 16 = 38$, halve to get the total $19$, subtract the pair that omits $c$: $19 - 9 = 10$.",
    trap_map: {
      "0": "Reports $a$ instead of $c$.",
      "1": "Reports $b$ instead of $c$.",
      "3": "Repeats the given sum $a + c$ instead of isolating $c$.",
      "4": "Stops at the total $a + b + c$.",
    },
    numeric_check: "(9+13+16)/2 - 9",
    check() {
      const hits = [];
      for (let a = -30; a <= 30; a++)
        for (let b = -30; b <= 30; b++)
          for (let c = -30; c <= 30; c++)
            if (a + b === 9 && a + c === 13 && b + c === 16) hits.push(c);
      if (hits.length !== 1) throw new Error("non-unique solution");
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 8. D4 PS real ─────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "real",
    difficulty: 4,
    stem_md:
      "A fitness studio charges a one-time enrollment fee plus the same rate for each month of membership. A membership costs $\\$205$ in total for the first $5$ months and $\\$355$ in total for the first $11$ months. What is the enrollment fee, in dollars?",
    choices: ["25", "41", "55", "80", "150"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nLet $f$ be the fee and $m$ the monthly rate: $f + 5m = 205$ and $f + 11m = 355$. Subtracting, $6m = 150$, so $m = 25$. Then $f = 205 - 5(25) = 80$.\n\n**Trigger cue**\n\nA fixed charge plus a constant rate with two different totals: subtract the totals to isolate the rate first.\n\n**Takeaway**\n\nSubtracting two totals cancels the fee and exposes the rate.",
    fastest_path_md:
      "The extra $6$ months cost $355 - 205 = \\$150$, so the rate is $\\$25$ per month; the fee is $205 - 125 = \\$80$.",
    trap_map: {
      "0": "Reports the monthly rate instead of the enrollment fee.",
      "1": "Divides $\\$205$ by $5$, assuming there is no fee at all.",
      "2": "Divides the $\\$150$ difference by $5$ months instead of $6$.",
      "4": "Stops at the raw difference between the two totals.",
    },
    numeric_check: "205 - 5*(355-205)/6",
    check() {
      const hits = [];
      for (let f = 0; f <= 400; f++)
        for (let m = 0; m <= 400; m++)
          if (f + 5 * m === 205 && f + 11 * m === 355) hits.push(f);
      if (hits.length !== 1) throw new Error("non-unique solution");
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 9. D4 DS pure ─────────────────────────────────────────────────────
  {
    ...base,
    format: "data_sufficiency",
    context: "pure",
    difficulty: 4,
    stem_md:
      "If $x$ and $y$ are positive integers, what is the value of $x$?\n\n(1) $x + 3y = 26$\n\n(2) $x > 3y$",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\n(1): $x = 26 - 3y$ gives $x \\in \\{23, 20, 17, \\dots, 2\\}$ for $y = 1, \\dots, 8$ — insufficient. (2): an inequality alone fixes nothing — insufficient. Together: $26 - 3y > 3y$ forces $y \\le 4$, leaving $x \\in \\{14, 17, 20, 23\\}$ — still four values. Insufficient even combined.\n\n**Trigger cue**\n\nAn equation plus an inequality over positive integers: list the surviving solutions explicitly before judging sufficiency.\n\n**Takeaway**\n\nAn inequality narrows a solution list; it rarely collapses it to one.",
    fastest_path_md:
      "(1) leaves $8$ pairs. Adding (2): $26 - 3y > 3y$ means $y \\le 4$, so $x$ can still be $14$, $17$, $20$, or $23$ — pick E.",
    trap_map: {
      "0": "Believes positivity makes $x + 3y = 26$ have a unique solution.",
      "1": "Treats the inequality $x > 3y$ as if it pinned $x$ by itself.",
      "2": "Assumes adding the inequality must narrow the list to a single pair; four pairs survive.",
      "3": "Judges each statement sufficient after testing only one convenient pair.",
    },
    numeric_check: null,
    check() {
      const m1 = [], m2 = [], mb = [];
      for (let x = 1; x <= 300; x++)
        for (let y = 1; y <= 300; y++) {
          const c1 = x + 3 * y === 26;
          const c2 = x > 3 * y;
          if (c1) m1.push(x);
          if (c2) m2.push(x);
          if (c1 && c2) mb.push(x);
        }
      if (m1.length < 3 || m2.length < 3 || mb.length < 2)
        throw new Error("too few models found");
      return { kind: "index", index: dsVerdict(m1, m2, mb) };
    },
  },

  // ── 10. D4 DS pure ────────────────────────────────────────────────────
  {
    ...base,
    format: "data_sufficiency",
    context: "pure",
    difficulty: 4,
    stem_md:
      "For numbers $a$ and $b$, is $a$ greater than $b$?\n\n(1) The sum of $a$ and twice $b$ is $30$.\n\n(2) The sum of $b$ and twice $a$ is $36$.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n(1): $a + 2b = 30$ allows $(a, b) = (30, 0)$, a yes, and $(0, 15)$, a no — insufficient. (2): $2a + b = 36$ allows $(18, 0)$, a yes, and $(0, 36)$, a no — insufficient. Together: subtracting (1) from (2) gives $(2a + b) - (a + 2b) = 36 - 30$, so $a - b = 6 > 0$ — a definite yes. Sufficient combined.\n\n**Trigger cue**\n\nTwo mirrored linear equations and a comparison question: subtract them to read off $a - b$ directly.\n\n**Takeaway**\n\nSubtracting mirrored equations produces the difference immediately.",
    fastest_path_md:
      "Each equation alone bends both ways. Subtract the two: $a - b = 6$, so together they answer yes without ever solving for $a$ or $b$.",
    trap_map: {
      "0": "Assumes $a + 2b = 30$ alone forces $a$ above $b$.",
      "1": "Assumes $2a + b = 36$ alone forces $a$ above $b$.",
      "3": "Grants each statement alone after testing only positive sample values.",
      "4": "Solves for the pair, gets one point $(14, 8)$, and mistrusts a unique answer from combining.",
    },
    numeric_check: null,
    check() {
      const m1 = [], m2 = [], mb = [];
      for (let a = -120; a <= 120; a++)
        for (let b = -120; b <= 120; b++) {
          const c1 = a + 2 * b === 30;
          const c2 = b + 2 * a === 36;
          const ans = a > b;
          if (c1) m1.push(ans);
          if (c2) m2.push(ans);
          if (c1 && c2) mb.push(ans);
        }
      if (m1.length < 3 || m2.length < 3 || mb.length < 1)
        throw new Error("too few models found");
      return { kind: "index", index: dsVerdict(m1, m2, mb) };
    },
  },

  // ── 11. D4 DS real ────────────────────────────────────────────────────
  {
    ...base,
    format: "data_sufficiency",
    context: "real",
    difficulty: 4,
    stem_md:
      "At a school store, pencils cost $40$ cents each and erasers cost $70$ cents each. Kavi bought at least one pencil, at least one eraser, and nothing else. Did Kavi buy more pencils than erasers?\n\n(1) Kavi spent $\\$4.10$ in total.\n\n(2) Kavi bought $8$ items in total.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\n(1): in cents, $40p + 70e = 410$, i.e. $4p + 7e = 41$. Since $4p$ is even and $41$ is odd, $e$ must be odd, so $e \\in \\{1, 3, 5\\}$; only $e = 3$ leaves $41 - 21 = 20$ divisible by $4$, giving $p = 5$. The purchase is unique and $5 > 3$ — a definite yes. Sufficient. (2): $p + e = 8$ allows $(7, 1)$, a yes, and $(1, 7)$, a no — insufficient. Answer: statement (1) alone.\n\n**Trigger cue**\n\nA money total over integer item counts: run the parity-and-divisibility sieve before dismissing one equation in two unknowns.\n\n**Takeaway**\n\nInteger constraints can make a single equation sufficient.",
    fastest_path_md:
      "For (1), $4p + 7e = 41$ needs $e$ odd; test $e = 1, 3, 5$ — only $e = 3$, $p = 5$ works, so (1) answers yes by itself. (2) obviously splits both ways.",
    trap_map: {
      "1": "Trusts the item count alone, though it says nothing about the split.",
      "2": "Assumes one equation with two unknowns always needs the second statement; the cent equation has a single positive-integer solution.",
      "3": "Grants statement (2) as well, though $(7,1)$ and $(1,7)$ answer differently.",
      "4": "Dismisses statement (1) as one equation, two unknowns without testing integer solutions.",
    },
    numeric_check: null,
    check() {
      const m1 = [], m2 = [], mb = [];
      for (let p = 1; p <= 100; p++)
        for (let e = 1; e <= 100; e++) {
          const c1 = 40 * p + 70 * e === 410;
          const c2 = p + e === 8;
          const ans = p > e;
          if (c1) m1.push(ans);
          if (c2) m2.push(ans);
          if (c1 && c2) mb.push(ans);
        }
      if (m1.length < 1 || m2.length < 3 || mb.length < 1)
        throw new Error("too few models found");
      return { kind: "index", index: dsVerdict(m1, m2, mb) };
    },
  },

  // ── 12. D4 DS pure ────────────────────────────────────────────────────
  {
    ...base,
    format: "data_sufficiency",
    context: "pure",
    difficulty: 4,
    stem_md:
      "What is the value of the integer $n$?\n\n(1) Three more than twice $n$ is greater than $15$ and less than $21$.\n\n(2) Four less than three times $n$ is greater than $19$ and less than $23$.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\n(1): $15 < 2n + 3 < 21$ gives $12 < 2n < 18$, so $6 < n < 9$ and $n \\in \\{7, 8\\}$ — insufficient. (2): $19 < 3n - 4 < 23$ gives $23 < 3n < 27$, so $\\frac{23}{3} < n < 9$; the only integer in that band is $n = 8$ — sufficient. Answer: statement (2) alone.\n\n**Trigger cue**\n\nA range statement about an integer: convert to explicit bounds and count the integers inside before judging.\n\n**Takeaway**\n\nA range is sufficient when exactly one integer fits inside.",
    fastest_path_md:
      "(1): $6 < n < 9$ holds two integers — out. (2): $23 < 3n < 27$ traps $n$ strictly between $7.67$ and $9$, so $n = 8$ — done, B.",
    trap_map: {
      "0": "Overlooks that statement (1) leaves both $n = 7$ and $n = 8$.",
      "2": "Assumes both ranges are needed when statement (2) already pins a single integer.",
      "3": "Grants statement (1) as well, though it allows two values.",
      "4": "Declares that ranges never determine a value; between $19$ and $23$, $3n - 4$ forces $n = 8$.",
    },
    numeric_check: null,
    check() {
      const m1 = [], m2 = [], mb = [];
      for (let n = -300; n <= 300; n++) {
        const v1 = 2 * n + 3;
        const v2 = 3 * n - 4;
        const c1 = v1 > 15 && v1 < 21;
        const c2 = v2 > 19 && v2 < 23;
        if (c1) m1.push(n);
        if (c2) m2.push(n);
        if (c1 && c2) mb.push(n);
      }
      if (m1.length < 2 || m2.length < 1 || mb.length < 1)
        throw new Error("too few models found");
      return { kind: "index", index: dsVerdict(m1, m2, mb) };
    },
  },

  // ── 13. D5 PS pure ────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "pure",
    difficulty: 5,
    stem_md:
      "The positive integers $x$ and $y$ satisfy $5x + 3y = 71$ and $x > y$. What is the greatest possible value of $x - y$?",
    choices: ["2", "3", "11", "13", "21"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFrom $3y = 71 - 5x$, the right side must be a positive multiple of $3$: $71 - 5x \\equiv 0 \\pmod 3$ reduces to $x \\equiv 1 \\pmod 3$. The positive solutions are $(x, y) = (1, 22), (4, 17), (7, 12), (10, 7), (13, 2)$. Only $(10, 7)$ and $(13, 2)$ satisfy $x > y$, and the differences are $3$ and $11$. The greatest is $11$.\n\n**Trigger cue**\n\nA linear equation over positive integers with an extremal question: the solution list is finite — write it out.\n\n**Takeaway**\n\nEnumerate every integer solution before optimizing anything.",
    fastest_path_md:
      "Maximize $x$: $5x < 71$ caps $x$ at $13$, and $x = 13$ gives $y = 2$ — a valid pair with $x > y$ — so the answer is $13 - 2 = 11$.",
    trap_map: {
      "0": "Reports $y$ from the maximizing pair instead of $x - y$.",
      "1": "Stops at the first pair with $x > y$, namely $(10, 7)$.",
      "3": "Reports $x$ itself rather than the difference.",
      "4": "Ignores $x > y$ and computes $y - x$ from $(1, 22)$.",
    },
    numeric_check: "13-2",
    check() {
      let best = null;
      for (let x = 1; x <= 200; x++)
        for (let y = 1; y <= 200; y++)
          if (5 * x + 3 * y === 71 && x > y)
            best = best === null ? x - y : Math.max(best, x - y);
      if (best === null) throw new Error("no solution");
      return { kind: "value", value: best };
    },
  },

  // ── 14. D4 PS pure ────────────────────────────────────────────────────
  {
    ...base,
    format: "problem_solving",
    context: "pure",
    difficulty: 4,
    stem_md:
      "How many integers $n$ satisfy all three of the following conditions: seven less than three times $n$ is positive, twice $n$ increased by $5$ is less than $39$, and $n$ differs from $10$ by more than $2$?",
    choices: ["8", "9", "10", "11", "14"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nTranslate each clause: $3n - 7 > 0$ gives $n > \\frac{7}{3}$, so $n \\ge 3$; $2n + 5 < 39$ gives $n < 17$, so $n \\le 16$; $|n - 10| > 2$ gives $n < 8$ or $n > 12$. Intersect: $n \\in \\{3, 4, 5, 6, 7\\} \\cup \\{13, 14, 15, 16\\}$, which is $5 + 4 = 9$ integers.\n\n**Trigger cue**\n\n\"How many integers satisfy\" a list of verbal conditions: convert every clause to explicit bounds, then intersect and count.\n\n**Takeaway**\n\nTranslate every clause to bounds; count endpoints with care.",
    fastest_path_md:
      "The band $3$ through $16$ holds $14$ integers; \"differs from $10$ by more than $2$\" strikes out $8$ through $12$ — five of them — leaving $14 - 5 = 9$.",
    trap_map: {
      "0": "Solves $2n + 5 < 39$ as $n < 16$, wrongly excluding $n = 16$.",
      "2": "Allows $2n + 5 = 39$, wrongly including $n = 17$.",
      "3": "Reads \"differs by more than $2$\" as \"by $2$ or more,\" keeping $n = 8$ and $n = 12$.",
      "4": "Ignores the distance-from-$10$ condition altogether.",
    },
    numeric_check: "5+4",
    check() {
      let count = 0;
      for (let n = -1000; n <= 1000; n++) {
        if (3 * n - 7 > 0 && 2 * n + 5 < 39 && Math.abs(n - 10) > 2) count++;
      }
      return { kind: "value", value: count };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
