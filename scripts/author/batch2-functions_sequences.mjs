/**
 * Batch 2: 11 new functions_sequences items (equal_unequal_alg, algebra).
 * Cells: D2 PS pure ×1, D3 PS pure ×2, D3 PS real ×3, D4 DS pure ×2,
 *        D4 PS real ×1, D5 PS pure ×1, D5 PS real ×1.
 * Run: node --experimental-strip-types scripts/author/batch2-functions_sequences.mjs
 * (dry run; integration append happens centrally later)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D2 PS pure — nested function evaluation f(f(4))
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 2,
    stem_md:
      "If $f(x) = 2x - 3$ for all real numbers $x$, what is the value of $f(f(4))$?",
    choices: ["$4$", "$5$", "$7$", "$10$", "$13$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nEvaluate from the inside out: $f(4) = 2(4) - 3 = 5$, then $f(5) = 2(5) - 3 = 7$.\n\n**Trigger cue**\nNested notation $f(f(a))$: evaluate the inner function first, then feed the result back in.\n\n**Takeaway**\nEvaluate nested functions from the inside out.",
    fastest_path_md:
      "Compose once in general: $f(f(x)) = 2(2x - 3) - 3 = 4x - 9$, so $f(f(4)) = 16 - 9 = 7$.",
    trap_map: {
      "0": "Solves $f(x) = 5$ for $x$, working backward instead of applying $f$ again.",
      "1": "Stops after the inner evaluation $f(4) = 5$.",
      "3": "Doubles twice and subtracts $3$ twice, computing $4x - 6$.",
      "4": "Doubles twice but subtracts $3$ only once, computing $4x - 3$.",
    },
    numeric_check: "7",
    check() {
      // brute force: apply the rule numerically, twice
      const f = (x) => 2 * x - 3;
      return { kind: "value", value: f(f(4)) };
    },
  },

  // 2. D3 PS pure — alternating signed sum with an unpaired final term
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md:
      "For every positive integer $n$, the $n$th term of a certain sequence is $a_n = (-1)^n \\cdot n$. What is the sum of the first $51$ terms of the sequence?",
    choices: ["$-51$", "$-26$", "$-25$", "$0$", "$26$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nGroup consecutive terms in pairs: $(-1 + 2) + (-3 + 4) + \\cdots + (-49 + 50)$ is $25$ pairs, each summing to $1$, for a subtotal of $25$. The unpaired $51$st term is $(-1)^{51} \\cdot 51 = -51$. Total: $25 - 51 = -26$.\n\n**Trigger cue**\nA long sum of $(-1)^n$-signed terms: pair adjacent terms, then handle any leftover term separately.\n\n**Takeaway**\nPair alternating terms, then account separately for the unpaired final term.",
    fastest_path_md:
      "List partial sums: $-1, 1, -2, 2, -3, 3, \\ldots$ — after each odd-numbered term $2k+1$ the running sum is $-(k+1)$, so after term $51$ it is $-26$.",
    trap_map: {
      "0": "Reports the $51$st term alone rather than the sum.",
      "2": "Pairs from the second term onward, $25$ pairs of $-1$, but forgets the unpaired first term.",
      "3": "Assumes the alternating positive and negative terms cancel completely.",
      "4": "Uses $(-1)^{n+1}$, making the odd-numbered terms positive.",
    },
    numeric_check: "-26",
    check() {
      // brute force: add all 51 terms directly
      let s = 0;
      for (let n = 1; n <= 51; n++) s += n % 2 === 0 ? n : -n;
      return { kind: "value", value: s };
    },
  },

  // 3. D3 PS pure — term extracted from a partial-sum formula S_n = n^2 + 3n
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md:
      "For every positive integer $n$, the sum of the first $n$ terms of a certain sequence is $n^2 + 3n$. What is the $10$th term of the sequence?",
    choices: ["$19$", "$22$", "$24$", "$108$", "$130$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe $10$th term is the sum through $10$ terms minus the sum through $9$ terms: $S_{10} - S_9 = (100 + 30) - (81 + 27) = 130 - 108 = 22$.\n\n**Trigger cue**\nA formula for the sum of the first $n$ terms: extract a single term by subtracting consecutive sums.\n\n**Takeaway**\nThe $n$th term equals $S_n - S_{n-1}$.",
    fastest_path_md:
      "Simplify once for all $n$: $a_n = (n^2 + 3n) - \\big((n-1)^2 + 3(n-1)\\big) = 2n + 2$, so $a_{10} = 22$.",
    trap_map: {
      "0": "Drops the $3n$ part of the formula, computing $10^2 - 9^2$.",
      "2": "Computes $S_{11} - S_{10}$, which is the $11$th term.",
      "3": "Reports $S_9$, the sum of the first nine terms.",
      "4": "Reports $S_{10}$, the sum itself, instead of the $10$th term.",
    },
    numeric_check: "22",
    check() {
      // brute force: reconstruct every term so that partial sums match the formula
      let sum = 0;
      let term = 0;
      for (let n = 1; n <= 10; n++) {
        term = n * n + 3 * n - sum;
        sum += term;
        if (sum !== n * n + 3 * n) throw new Error("partial sum mismatch");
      }
      return { kind: "value", value: term };
    },
  },

  // 4. D3 PS real — inverse arithmetic-series problem: total given, find first term
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md:
      "A swimmer trains for $20$ consecutive days. On each day after the first, she swims $50$ meters more than on the day before, and over the $20$ days she swims a total of $23{,}500$ meters. How many meters does she swim on the first day?",
    choices: ["$650$", "$700$", "$950$", "$1{,}175$", "$1{,}650$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet the first-day distance be $a$. The daily distances are $a, a + 50, \\ldots, a + 19 \\cdot 50$, so the total is $20a + 50(1 + 2 + \\cdots + 19) = 20a + 9{,}500$. Setting $20a + 9{,}500 = 23{,}500$ gives $20a = 14{,}000$, so $a = 700$.\n\n**Trigger cue**\nA total of evenly increasing amounts with the first amount unknown: count times first term plus the summed increases.\n\n**Takeaway**\nAn arithmetic total is the term count times the average term.",
    fastest_path_md:
      "The average day is $23{,}500 / 20 = 1{,}175$ meters, which sits $9.5$ steps of $50$ above day $1$: $1{,}175 - 475 = 700$.",
    trap_map: {
      "0": "Uses $20$ increases of $50$ meters instead of $19$.",
      "2": "Reports the total increase $19 \\cdot 50$ rather than the first-day distance.",
      "3": "Reports the average daily distance $23{,}500 / 20$ as the first day.",
      "4": "Reports the final-day distance instead of the first-day distance.",
    },
    numeric_check: "700",
    check() {
      // brute force: scan first-day distances, simulate the 20 days, match the total
      const hits = [];
      for (let a = 0; a <= 3000; a++) {
        let dist = a;
        let total = 0;
        for (let day = 1; day <= 20; day++) {
          total += dist;
          dist += 50;
        }
        if (total === 23500) hits.push(a);
      }
      if (hits.length !== 1) throw new Error(`expected unique model, got ${hits.length}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // 5. D3 PS real — cumulative geometric growth (sum of stages, not last stage)
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md:
      "In round $1$ of a phone-alert drill, a dispatcher sends an alert to $4$ residents. In each round after the first, every resident who received the alert in the previous round sends it to exactly $3$ residents who have not yet received it, and no one else sends the alert. Immediately after round $4$, how many residents in total have received the alert?",
    choices: ["$52$", "$108$", "$160$", "$480$", "$484$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nNew recipients per round form a geometric progression: $4$ in round $1$, then $4 \\cdot 3 = 12$, $12 \\cdot 3 = 36$, and $36 \\cdot 3 = 108$. The total after round $4$ is $4 + 12 + 36 + 108 = 160$.\n\n**Trigger cue**\nEach recipient forwards to a fixed number of new people: sum every stage of the growth, not just the last stage.\n\n**Takeaway**\nSum every stage of geometric growth, not just the last.",
    fastest_path_md:
      "Factor the common $4$: $4(1 + 3 + 9 + 27) = 4 \\cdot 40 = 160$.",
    trap_map: {
      "0": "Stops the count after round $3$.",
      "1": "Counts only the residents who receive the alert in round $4$.",
      "3": "Treats round $1$ as a forwarding round of $12$ recipients, tripling one round too early throughout.",
      "4": "Adds round $5$'s $324$ new recipients to the correct total.",
    },
    numeric_check: "160",
    check() {
      // brute force: simulate the four rounds
      let newRecipients = 4;
      let total = 0;
      for (let round = 1; round <= 4; round++) {
        total += newRecipients;
        newRecipients *= 3;
      }
      return { kind: "value", value: total };
    },
  },

  // 6. D3 PS real — linear value function, first year below a percent threshold
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md:
      "A printing press is purchased for $22{,}000$ dollars, and its value decreases by $1{,}800$ dollars each year, so that its value, in dollars, $t$ years after purchase is given by $V(t) = 22{,}000 - 1{,}800t$. At the end of which year after purchase is the press's value first less than $40$ percent of its purchase price?",
    choices: ["$5$", "$7$", "$8$", "$9$", "$12$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nForty percent of $22{,}000$ is $8{,}800$. Solve $22{,}000 - 1{,}800t < 8{,}800$: this gives $1{,}800t > 13{,}200$, so $t > 7\\tfrac{1}{3}$. The first whole year past this is $t = 8$.\n\n**Trigger cue**\nThe phrase \"first less than\" applied to a steadily changing quantity: set up the inequality, then round up.\n\n**Takeaway**\nTranslate \"first less than\" into an inequality and round up.",
    fastest_path_md:
      "Backsolve near the middle choice: $V(7) = 9{,}400 > 8{,}800$ but $V(8) = 7{,}600 < 8{,}800$, so year $8$.",
    trap_map: {
      "0": "Finds when the value has dropped by $40$ percent rather than to $40$ percent.",
      "1": "Solves $t > 7\\tfrac{1}{3}$ correctly but rounds down instead of up.",
      "3": "Applies only $t - 1$ years of depreciation by the end of year $t$, shifting the crossing a year late.",
      "4": "Finds approximately when the value reaches zero instead of $40$ percent.",
    },
    numeric_check: "8",
    check() {
      // brute force: walk year by year until the value crosses the threshold
      const purchase = 22000;
      for (let t = 1; t <= 1000; t++) {
        if (purchase - 1800 * t < 0.4 * purchase) return { kind: "value", value: t };
      }
      throw new Error("threshold never crossed");
    },
  },

  // 7. D4 DS pure — geometric sequence, squared ratio hides a sign (answer E)
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 4,
    stem_md:
      "In the geometric sequence $a_1, a_2, a_3, \\ldots$, every term is nonzero. What is the value of $a_2$?\n\n(1) $a_1 = 3$\n\n(2) $a_3 = 48$",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\nWith common ratio $r$, $a_2 = a_1 r$ and $a_3 = a_1 r^2$. Statement (1) alone leaves $r$ free: insufficient. Statement (2) alone leaves both $a_1$ and $r$ free: insufficient. Together, $r^2 = \\frac{48}{3} = 16$, so $r = 4$ or $r = -4$, giving $a_2 = 12$ or $a_2 = -12$. Two values survive, so the statements together are still insufficient.\n\n**Trigger cue**\nA geometric sequence pinned at two positions an even number of steps apart: the ratio enters squared, so watch for $\\pm$.\n\n**Takeaway**\nA squared ratio has two signs; check both before declaring sufficiency.",
    fastest_path_md:
      "In any geometric sequence $a_2^2 = a_1 a_3 = 144$, so $a_2 = \\pm 12$ — the sign is undecidable even with both statements. Pick E without ever solving for $r$.",
    trap_map: {
      "0": "Treats the first term as pinning down the whole sequence, forgetting the ratio is unknown.",
      "1": "Assumes a fixed common ratio, so a single later term seems to determine $a_2$.",
      "2": "Computes $a_2^2 = a_1 a_3 = 144$ but takes only the positive square root.",
      "3": "Combines the fixed-ratio assumption with the positive-root slip, making each statement alone seem to work.",
    },
    numeric_check: null,
    check() {
      // Enumerate geometric models (a1, r) on a fine grid; decide sufficiency by
      // uniqueness of a2 among models consistent with each statement.
      const models = [];
      for (let a1 = -60; a1 <= 60; a1 += 0.5) {
        if (a1 === 0) continue;
        for (let r = -6; r <= 6; r += 0.25) {
          if (r === 0) continue;
          models.push({ a1, a2: a1 * r, a3: a1 * r * r });
        }
      }
      const s1 = (m) => m.a1 === 3;
      const s2 = (m) => Math.abs(m.a3 - 48) < 1e-9;
      const sufficient = (pred) => {
        const kept = models.filter(pred);
        if (kept.length === 0) throw new Error("statement matches no model");
        return new Set(kept.map((m) => Math.round(m.a2 * 1e6))).size === 1;
      };
      const u1 = sufficient(s1);
      const u2 = sufficient(s2);
      const u12 = sufficient((m) => s1(m) && s2(m));
      let index;
      if (u1 && u2) index = 3;
      else if (u1) index = 0;
      else if (u2) index = 1;
      else if (u12) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 8. D4 DS pure — additive functional equation f(a+b) = f(a) + f(b) (answer D)
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 4,
    stem_md:
      "The function $f$ is defined for all real numbers and satisfies $f(a + b) = f(a) + f(b)$ for all real numbers $a$ and $b$. What is the value of $f(6)$?\n\n(1) $f(2) = 10$\n\n(2) $f(3) + f(9) = 60$",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\nAdditivity forces $f(4) = f(2) + f(2)$ and $f(6) = f(4) + f(2) = 3f(2)$, so statement (1) gives $f(6) = 30$: sufficient. Likewise $f(3) + f(9) = f(12)$ and $f(12) = f(6) + f(6)$, so statement (2) gives $2f(6) = 60$, i.e. $f(6) = 30$: sufficient. Each statement alone suffices.\n\n**Trigger cue**\nA rule $f(a + b) = f(a) + f(b)$: chain the given inputs up or down to the queried input.\n\n**Takeaway**\nAdditivity chains known values to any multiple-sum input.",
    fastest_path_md:
      "Additive means $f$ scales like $f(x) = cx$: statement (1) gives $2c = 10$ and statement (2) gives $3c + 9c = 60$ — each pins $c = 5$, so $f(6) = 30$ either way.",
    trap_map: {
      "0": "Chains (1) up to $f(6) = 3f(2)$ but misses that (2) collapses via $f(3) + f(9) = f(12) = 2f(6)$.",
      "1": "Sees the collapse of (2) to $2f(6) = 60$ but not the chain $f(6) = 3f(2)$ for (1).",
      "2": "Models $f$ as $mx + k$ with two unknowns, so demands both statements.",
      "4": "Treats $f$ as arbitrary because no explicit formula is given, ignoring what additivity forces.",
    },
    numeric_check: null,
    check() {
      // Enumerate additive models: f is determined on integers by c = f(1),
      // building every needed value ONLY by applications of f(x+y) = f(x) + f(y).
      const models = [];
      for (let c = -40; c <= 40; c += 0.5) {
        const f1 = c;
        const f2 = f1 + f1;
        const f3 = f2 + f1;
        const f6 = f3 + f3;
        const f9 = f6 + f3;
        models.push({ f2, f3, f6, f9 });
      }
      const s1 = (m) => m.f2 === 10;
      const s2 = (m) => m.f3 + m.f9 === 60;
      const sufficient = (pred) => {
        const kept = models.filter(pred);
        if (kept.length === 0) throw new Error("statement matches no model");
        return new Set(kept.map((m) => m.f6)).size === 1;
      };
      const u1 = sufficient(s1);
      const u2 = sufficient(s2);
      const u12 = sufficient((m) => s1(m) && s2(m));
      let index;
      if (u1 && u2) index = 3;
      else if (u1) index = 0;
      else if (u2) index = 1;
      else if (u12) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 9. D4 PS real — arithmetic series with unknown length; question asks the last term
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 4,
    stem_md:
      "In a concert hall, the first row has $12$ seats, and each row after the first has $2$ more seats than the row immediately in front of it. If the hall has exactly $570$ seats, how many seats are in the last row?",
    choices: ["$19$", "$30$", "$46$", "$48$", "$50$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nWith $n$ rows, the seat counts run $12, 14, \\ldots, 12 + 2(n - 1)$, so the total is $\\frac{n\\big(12 + 12 + 2(n-1)\\big)}{2} = n(n + 11) = 570$. Since $570 = 19 \\cdot 30$, we get $n = 19$. The last row has $12 + 2 \\cdot 18 = 48$ seats.\n\n**Trigger cue**\nA total of evenly growing rows with the number of rows unknown: solve count times average, then answer what is actually asked.\n\n**Takeaway**\nSolve for the row count first; the question asks something else.",
    fastest_path_md:
      "$n(n + 11) = 570$ wants two factors $11$ apart: $19 \\cdot 30$ jumps out, so $19$ rows and the last row has $12 + 36 = 48$ seats.",
    trap_map: {
      "0": "Solves for the number of rows and stops there.",
      "1": "Divides $570$ by the $19$ rows, giving the average row, not the last row.",
      "2": "Uses $17$ steps of $2$ seats from the first row instead of $18$.",
      "4": "Uses $19$ steps of $2$ seats, one for every row including the first.",
    },
    numeric_check: "48",
    check() {
      // brute force: stack rows until the seat total is exactly 570
      let seats = 12;
      let total = 0;
      let last = null;
      while (total < 570) {
        total += seats;
        last = seats;
        seats += 2;
      }
      if (total !== 570) throw new Error(`total overshoots to ${total}`);
      return { kind: "value", value: last };
    },
  },

  // 10. D5 PS pure — period-3 recurrence x -> 1/(1-x), product of 99 terms
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 5,
    stem_md:
      "In a certain sequence, $x_1 = 3$ and $x_{n+1} = \\frac{1}{1 - x_n}$ for every positive integer $n$. What is the value of the product $x_1 x_2 x_3 \\cdots x_{99}$?",
    choices: ["$-3$", "$-1$", "$\\frac{2}{3}$", "$1$", "$3$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nGenerate terms: $x_1 = 3$, $x_2 = \\frac{1}{1 - 3} = -\\frac{1}{2}$, $x_3 = \\frac{1}{1 + \\frac{1}{2}} = \\frac{2}{3}$, and $x_4 = \\frac{1}{1 - \\frac{2}{3}} = 3$ — the sequence cycles with period $3$. Each cycle's product is $3 \\cdot \\left(-\\frac{1}{2}\\right) \\cdot \\frac{2}{3} = -1$, and the first $99$ terms form exactly $33$ cycles, so the product is $(-1)^{33} = -1$.\n\n**Trigger cue**\nA recurrence built from $\\frac{1}{1 - x}$: generate terms until a repeat, then work cycle by cycle.\n\n**Takeaway**\nFind the cycle, take the product per cycle, then count cycles.",
    fastest_path_md:
      "Once $x_4 = x_1$ appears, never multiply $99$ terms: $99$ is a whole number of $3$-term cycles, one cycle multiplies to $-1$, and an odd cycle count keeps the minus sign.",
    trap_map: {
      "0": "Extends the product one term too far, through $x_{100} = 3$.",
      "2": "Reports the $99$th term of the sequence rather than the product.",
      "3": "Drops the negative sign of $x_2 = -\\frac{1}{2}$, making each cycle multiply to $+1$.",
      "4": "Assumes the product telescopes down to the first term.",
    },
    numeric_check: "-1",
    check() {
      // brute force with exact fractions: multiply all 99 terms
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      let xn = 3, xd = 1; // current term
      let pn = 1, pd = 1; // running product
      for (let i = 1; i <= 99; i++) {
        pn *= xn;
        pd *= xd;
        let g = Math.abs(gcd(pn, pd));
        pn /= g;
        pd /= g;
        if (pd < 0) { pn = -pn; pd = -pd; }
        // next term: 1 / (1 - xn/xd) = xd / (xd - xn)
        const nn = xd;
        const nd = xd - xn;
        xn = nn;
        xd = nd;
        g = Math.abs(gcd(xn, xd));
        xn /= g;
        xd /= g;
      }
      return { kind: "value", value: pn / pd };
    },
  },

  // 11. D5 PS real — equal partial sums S5 = S9 force the difference; first negative term
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 5,
    stem_md:
      "A company's weekly profit changes by the same amount from each week to the next, and a weekly profit may be negative. The company's profit in week $1$ is $3{,}900$ dollars, and its total profit for the first $5$ weeks equals its total profit for the first $9$ weeks. In which week is the company's weekly profit first negative?",
    choices: ["$7$", "$8$", "$9$", "$14$", "$15$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet the weekly change be $d$. Equal totals force weeks $6$ through $9$ to sum to zero: $a_6 + a_7 + a_8 + a_9 = 0$, and for an arithmetic sequence this means $a_7 + a_8 = 0$. With $a_1 = 3{,}900$: $(3{,}900 + 6d) + (3{,}900 + 7d) = 0$, so $13d = -7{,}800$ and $d = -600$. Then $a_n = 3{,}900 - 600(n - 1) < 0$ requires $n - 1 > 6.5$, so $n = 8$.\n\n**Trigger cue**\nEqual sums of the first $m$ and first $n$ terms: the block of terms between positions $m + 1$ and $n$ sums to zero.\n\n**Takeaway**\nEqual partial sums force the interior block to sum to zero.",
    fastest_path_md:
      "Weeks $6$ through $9$ cancel, so the sequence is symmetric about $7.5$: week $7$ is the last positive profit and week $8$ the first negative — no need to compute $d$ at all.",
    trap_map: {
      "0": "Applies $n$ decreases of $600$ dollars by week $n$ instead of $n - 1$.",
      "2": "Puts the zero crossing at week $8$ by miscounting the middle of the canceling block, then answers the next week.",
      "3": "Finds when the cumulative total profit falls to zero.",
      "4": "Finds when the cumulative total profit first turns negative.",
    },
    numeric_check: "8",
    check() {
      // brute force: scan weekly changes d for the one making S5 = S9 by direct
      // simulation, then walk the weeks to the first negative profit.
      const partial = (d, k) => {
        let p = 3900;
        let s = 0;
        for (let w = 1; w <= k; w++) {
          s += p;
          p += d;
        }
        return s;
      };
      const hits = [];
      for (let d = -5000; d <= 5000; d += 0.5) {
        if (partial(d, 5) === partial(d, 9)) hits.push(d);
      }
      if (hits.length !== 1) throw new Error(`expected unique d, got ${hits.length}`);
      const d = hits[0];
      let profit = 3900;
      for (let week = 1; week <= 1000; week++) {
        if (profit < 0) return { kind: "value", value: week };
        profit += d;
      }
      throw new Error("profit never negative");
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
