/**
 * Batch: 30 items across the five equal_unequal_alg subtopics that could
 * not fill their chapter-test blend twice over.
 *   algebraic_translation   D2 ×4
 *   linear_systems          D2 ×4, D3 ×2
 *   inequalities            D2 ×4, D4 ×2
 *   functions_sequences     D2 ×4, D3 ×2, D4 ×2
 *   quadratics_factoring    D2 ×2, D3 ×2, D5 ×2
 * Trap language tracks each chapter's own gallery.
 * Run: node scripts/author/batch-algebra-d2-fill.mjs   (APPEND=1 to write)
 */
import { verifyAndAppend } from "./harness.mjs";

const A = {
  format: "problem_solving",
  content_domain: "algebra",
  fundamental_skill: "equal_unequal_alg",
};

const items = [
  // ===================== algebraic_translation =====================
  {
    ...A,
    subtopic: "algebraic_translation",
    context: "real",
    difficulty: 2,
    stem_md:
      "Rosa is $4$ years older than twice Dev's age. If Rosa is $30$ years old, how old is Dev?",
    choices: ["$11$", "$13$", "$15$", "$17$", "$26$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\n\"$4$ more than twice Dev's age\" translates to $R = 2D + 4$. With $R = 30$: $2D = 26$, so $D = 13$.\n\n**Trigger cue**\n\n\"$a$ more than $b$ times\": the multiplication happens first, then the addition — $bx + a$, never $b(x+a)$.\n\n**Takeaway**\n\nTranslate \"more than\" as the last operation applied.",
    fastest_path_md: "$30 - 4 = 26$; halve it: $13$.",
    trap_map: {
      "0": "Translates the sentence as $2(D + 4) = 30$, adding before multiplying.",
      "2": "Ignores the $4$ entirely and just halves $30$.",
      "3": "Adds the $4$ instead of subtracting it before halving.",
      "4": "Subtracts $4$ and stops, forgetting to undo the doubling.",
    },
    numeric_check: "(30-4)/2",
    check() {
      for (let d = 0; d <= 200; d++) if (2 * d + 4 === 30) return { kind: "value", value: d };
      throw new Error("no age");
    },
  },
  {
    ...A,
    subtopic: "algebraic_translation",
    context: "real",
    difficulty: 2,
    stem_md:
      "A theater charges $\\$12$ per adult ticket and $\\$7$ per child ticket. If the theater sold $a$ adult tickets and $c$ child tickets for a total of $\\$860$, which of the following must be true?",
    choices: [
      "$12a + 7c = 860$",
      "$19(a + c) = 860$",
      "$12c + 7a = 860$",
      "$12a - 7c = 860$",
      "$\\dfrac{a}{12} + \\dfrac{c}{7} = 860$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nRevenue from adults is price times count, $12a$; revenue from children is $7c$. The two revenues add to the total: $12a + 7c = 860$.\n\n**Trigger cue**\n\nTwo prices and two counts summing to a total: price $\\times$ count for each stream, then add the streams.\n\n**Takeaway**\n\nAttach each price to its own count before adding.",
    fastest_path_md: "Adults $12a$, children $7c$, total $860$.",
    trap_map: {
      "1": "Adds the two prices and applies the sum to the combined count.",
      "2": "Swaps the prices onto the wrong counts.",
      "3": "Subtracts one revenue stream instead of adding it.",
      "4": "Divides the counts by the prices, inverting the rate relationship.",
    },
    numeric_check: null,
    check(q) {
      // Test every choice against many concrete (a, c) pairs; keep the one
      // that holds exactly when the revenue really is 860.
      const forms = [
        (a, c) => 12 * a + 7 * c,
        (a, c) => 19 * (a + c),
        (a, c) => 12 * c + 7 * a,
        (a, c) => 12 * a - 7 * c,
        (a, c) => a / 12 + c / 7,
      ];
      const survivors = [];
      forms.forEach((f, i) => {
        let ok = true;
        for (let a = 0; a <= 71; a++) {
          for (let c = 0; c <= 122; c++) {
            const trueRevenue = 12 * a + 7 * c === 860;
            const claimed = Math.abs(f(a, c) - 860) < 1e-9;
            if (trueRevenue !== claimed) ok = false;
          }
        }
        if (ok) survivors.push(i);
      });
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },
  {
    ...A,
    subtopic: "algebraic_translation",
    context: "real",
    difficulty: 2,
    stem_md:
      "A jar holds only nickels and dimes. There are $8$ more dimes than nickels, and there are $34$ coins in all. How many dimes are in the jar?",
    choices: ["$13$", "$17$", "$21$", "$26$", "$29$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $n$ be the number of nickels; then dimes number $n + 8$. Together, $n + (n+8) = 34$, so $2n = 26$ and $n = 13$. The dimes number $13 + 8 = 21$.\n\n**Trigger cue**\n\n\"$k$ more $A$ than $B$\" plus a total: name the smaller group, write the larger as that plus $k$, and add to the total.\n\n**Takeaway**\n\nName the smaller quantity; the phrase then writes itself.",
    fastest_path_md: "$\\frac{34 - 8}{2} = 13$ nickels, so $21$ dimes.",
    trap_map: {
      "0": "Reports the number of nickels rather than dimes.",
      "1": "Splits the total evenly and rounds, ignoring the gap of $8$.",
      "3": "Subtracts $8$ from the total and halves nothing, reporting $34 - 8$.",
      "4": "Adds $8$ to the even split instead of adding it to the smaller group.",
    },
    numeric_check: "21",
    check() {
      for (let n = 0; n <= 34; n++) {
        const d = n + 8;
        if (n + d === 34) return { kind: "value", value: d };
      }
      throw new Error("no split");
    },
  },
  {
    ...A,
    subtopic: "algebraic_translation",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $5$ less than three times a number equals $40$, what is the number?",
    choices: ["$11$", "$12$", "$15$", "$45$", "$135$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n\"$5$ less than three times a number\" is $3x - 5$, not $5 - 3x$. Setting $3x - 5 = 40$ gives $3x = 45$ and $x = 15$.\n\n**Trigger cue**\n\n\"$a$ less than $b$\": the subtraction runs $b - a$ — the phrase reverses the written order.\n\n**Takeaway**\n\n\"Less than\" reverses the order you read it in.",
    fastest_path_md: "$40 + 5 = 45$; $\\frac{45}{3} = 15$.",
    trap_map: {
      "0": "Subtracts $5$ from $40$ before dividing, applying the operations in reading order.",
      "1": "Divides $40$ by $3$ and rounds up.",
      "3": "Stops at $3x = 45$ and reports that value.",
      "4": "Multiplies by $3$ instead of dividing.",
    },
    numeric_check: "45/3",
    check() {
      for (let x = -200; x <= 200; x++) if (3 * x - 5 === 40) return { kind: "value", value: x };
      throw new Error("no solution");
    },
  },

  // ===================== linear_systems =====================
  {
    ...A,
    subtopic: "linear_systems",
    context: "pure",
    difficulty: 2,
    stem_md: "If $x + y = 14$ and $x - y = 4$, what is the value of $y$?",
    choices: ["$4$", "$5$", "$7$", "$9$", "$10$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nAdding the equations gives $2x = 18$, so $x = 9$; substituting back, $y = 14 - 9 = 5$. Subtracting them directly is faster: $2y = 14 - 4 = 10$, so $y = 5$.\n\n**Trigger cue**\n\nA sum and a difference of the same two variables: subtract to isolate the second variable, add to isolate the first.\n\n**Takeaway**\n\nEliminate the variable you were not asked for.",
    fastest_path_md: "$(x+y) - (x-y) = 2y = 10$, so $y = 5$.",
    trap_map: {
      "0": "Reports the given difference rather than solving for $y$.",
      "2": "Halves the sum, as if $x$ and $y$ were equal.",
      "3": "Reports $x$ instead of $y$.",
      "4": "Stops at $2y = 10$ and reports that value.",
    },
    numeric_check: "5",
    check() {
      for (let x = -100; x <= 100; x++)
        for (let y = -100; y <= 100; y++)
          if (x + y === 14 && x - y === 4) return { kind: "value", value: y };
      throw new Error("no solution");
    },
  },
  {
    ...A,
    subtopic: "linear_systems",
    context: "real",
    difficulty: 2,
    stem_md:
      "Three notebooks and two pens cost $\\$23$. One notebook and two pens cost $\\$13$. How many dollars does one notebook cost?",
    choices: ["$4$", "$5$", "$8$", "$10$", "$13$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nWith $n$ for a notebook and $p$ for a pen: $3n + 2p = 23$ and $n + 2p = 13$. Subtracting every term of the second from the first eliminates the pens: $2n = 10$, so $n = 5$.\n\n**Trigger cue**\n\nTwo purchases of the same two items: eliminate the item you were *not* asked about — here the pens already match.\n\n**Takeaway**\n\nSubtract the whole equation, right side included.",
    fastest_path_md: "$(3n + 2p) - (n + 2p) = 2n = 10$, so $n = 5$.",
    trap_map: {
      "0": "Solves for the pen price instead of the notebook price.",
      "2": "Reports $2p$, what the two pens cost together.",
      "3": "Stops at $2n = 10$ and reports that value.",
      "4": "Reports the second purchase's total.",
    },
    numeric_check: "5",
    check() {
      for (let n = 0; n <= 100; n++)
        for (let p = 0; p <= 100; p++)
          if (3 * n + 2 * p === 23 && n + 2 * p === 13)
            return { kind: "value", value: n };
      throw new Error("no solution");
    },
  },
  {
    ...A,
    subtopic: "linear_systems",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $2x + 3y = 17$ and $x + y = 7$, what is the value of $x$?",
    choices: ["$-4$", "$3$", "$4$", "$7$", "$10$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nScale the second equation by $3$: $3x + 3y = 21$. Subtracting the first from it eliminates $y$: $x = 21 - 17 = 4$.\n\n**Trigger cue**\n\nA system where one equation is a clean multiple away from matching: scale, then subtract every term.\n\n**Takeaway**\n\nScale to match a coefficient, then eliminate.",
    fastest_path_md: "$3(x+y) - (2x+3y) = x = 21 - 17 = 4$.",
    trap_map: {
      "0": "Reverses the subtraction, computing $17 - 21$.",
      "1": "Reports $y$ rather than $x$.",
      "3": "Reports the given sum $x + y$.",
      "4": "Subtracts the constants without first matching a coefficient.",
    },
    numeric_check: "4",
    check() {
      for (let x = -50; x <= 50; x++)
        for (let y = -50; y <= 50; y++)
          if (2 * x + 3 * y === 17 && x + y === 7) return { kind: "value", value: x };
      throw new Error("no solution");
    },
  },
  {
    ...A,
    subtopic: "linear_systems",
    context: "real",
    difficulty: 2,
    stem_md:
      "A gym charges a fixed monthly fee plus a fixed amount per class. A member who took $6$ classes in a month paid $\\$74$, and a member who took $10$ classes paid $\\$102$. How many dollars is the fixed monthly fee?",
    choices: ["$7$", "$32$", "$46$", "$67$", "$74$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe rate is the cost difference over the class difference: $\\frac{102 - 74}{10 - 6} = \\frac{28}{4} = 7$ dollars per class. Back out the fee from either month: $74 - 6(7) = 74 - 42 = 32$.\n\n**Trigger cue**\n\n\"Fixed fee plus a rate\" with two totals: rate first from the differences, fee second by substitution.\n\n**Takeaway**\n\nDifferences kill the fixed fee and expose the rate.",
    fastest_path_md: "Rate $\\frac{28}{4} = 7$; fee $= 74 - 42 = 32$.",
    trap_map: {
      "0": "Reports the per-class rate rather than the fixed fee.",
      "2": "Subtracts only four classes' worth of the rate.",
      "3": "Subtracts the rate once instead of six times.",
      "4": "Reports the first member's total payment.",
    },
    numeric_check: "74 - 6*7",
    check() {
      for (let fee = 0; fee <= 200; fee++)
        for (let rate = 0; rate <= 100; rate++)
          if (fee + 6 * rate === 74 && fee + 10 * rate === 102)
            return { kind: "value", value: fee };
      throw new Error("no solution");
    },
  },
  {
    ...A,
    subtopic: "linear_systems",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $x + y = 11$, $y + z = 15$, and $x + z = 18$, what is the value of $x + y + z$?",
    choices: ["$18$", "$22$", "$26$", "$33$", "$44$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nAdding all three equations counts each variable twice: $2(x+y+z) = 11 + 15 + 18 = 44$, so $x + y + z = 22$.\n\n**Trigger cue**\n\nThree pairwise sums of three variables: add all three equations and halve — never solve for the variables individually.\n\n**Takeaway**\n\nPairwise sums add to twice the grand total.",
    fastest_path_md: "$\\frac{11 + 15 + 18}{2} = 22$.",
    trap_map: {
      "0": "Reports the largest pairwise sum.",
      "2": "Adds all three sums and subtracts the largest instead of halving.",
      "3": "Adds all three sums and subtracts the smallest.",
      "4": "Reports the sum of all three equations without halving.",
    },
    numeric_check: "44/2",
    check() {
      for (let x = -60; x <= 60; x++)
        for (let y = -60; y <= 60; y++) {
          const z = 15 - y;
          if (x + y === 11 && x + z === 18) return { kind: "value", value: x + y + z };
        }
      throw new Error("no solution");
    },
  },
  {
    ...A,
    subtopic: "linear_systems",
    context: "real",
    difficulty: 3,
    stem_md:
      "In $6$ years, Mira will be twice as old as Nils will be then. Four years ago, Mira was four times as old as Nils was then. How old is Mira now?",
    choices: ["$9$", "$20$", "$24$", "$30$", "$36$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nBoth people age, so write each condition at its own time. In $6$ years: $M + 6 = 2(N + 6)$. Four years ago: $M - 4 = 4(N - 4)$. From the first, $M = 2N + 6$; substituting into the second, $2N + 2 = 4N - 16$, so $N = 9$ and $M = 24$. Check: in $6$ years, $30 = 2(15)$; four years ago, $20 = 4(5)$.\n\n**Trigger cue**\n\n\"In $k$ years, A will be $m$ times B\": add $k$ to *both* ages before writing the multiple.\n\n**Takeaway**\n\nEveryone ages at the same rate — shift both sides.",
    fastest_path_md: "$M = 2N + 6$ and $M - 4 = 4N - 16$ give $N = 9$, $M = 24$.",
    trap_map: {
      "0": "Reports Nils' current age.",
      "1": "Reports Mira's age four years ago.",
      "3": "Reports Mira's age six years from now.",
      "4": "Ages only Nils in the first condition, writing $M = 2(N+6)$.",
    },
    numeric_check: "24",
    check() {
      const hits = [];
      for (let m = 5; m <= 120; m++)
        for (let n = 5; n <= 120; n++)
          if (m + 6 === 2 * (n + 6) && m - 4 === 4 * (n - 4)) hits.push(m);
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ===================== inequalities =====================
  {
    ...A,
    subtopic: "inequalities",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $-3x + 5 \\ge 17$, which of the following describes all possible values of $x$?",
    choices: [
      "$x \\ge 4$",
      "$x \\le 4$",
      "$x \\ge -4$",
      "$x \\le -4$",
      "$x \\le -\\dfrac{22}{3}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSubtract $5$: $-3x \\ge 12$. Dividing by $-3$ flips the symbol: $x \\le -4$.\n\n**Trigger cue**\n\nA negative coefficient on the variable: the moment you divide by it, flip the inequality sign.\n\n**Takeaway**\n\nDividing by a negative flips the symbol, every time.",
    fastest_path_md: "$-3x \\ge 12 \\Rightarrow x \\le -4$.",
    trap_map: {
      "0": "Drops both the sign and the flip.",
      "1": "Keeps the correct direction but loses the negative sign on $4$.",
      "2": "Divides by $-3$ without flipping the symbol.",
      "4": "Divides $-22$ by $3$, having subtracted $5$ from the wrong side.",
    },
    numeric_check: null,
    check(q) {
      const tests = [
        (x) => x >= 4,
        (x) => x <= 4,
        (x) => x >= -4,
        (x) => x <= -4,
        (x) => x <= -22 / 3,
      ];
      const survivors = [];
      tests.forEach((t, i) => {
        let ok = true;
        for (let hundredths = -2000; hundredths <= 2000; hundredths++) {
          const x = hundredths / 100;
          if (-3 * x + 5 >= 17 - 1e-12 !== t(x)) ok = false;
        }
        if (ok) survivors.push(i);
      });
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },
  {
    ...A,
    subtopic: "inequalities",
    context: "real",
    difficulty: 2,
    stem_md:
      "A vending machine holds at most $200$ items. It currently holds $86$ snacks and some drinks. If the number of drinks is at least $50$, what is the greatest number of drinks the machine can hold?",
    choices: ["$50$", "$64$", "$114$", "$150$", "$200$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe capacity gives $86 + d \\le 200$, so $d \\le 114$. The floor of $50$ does not bind the maximum, so the greatest possible number of drinks is $114$.\n\n**Trigger cue**\n\nA cap plus a floor, asked for a maximum: only the cap binds — check that the floor is compatible, then ignore it.\n\n**Takeaway**\n\nA maximum is set by the cap; the floor only has to be satisfiable.",
    fastest_path_md: "$200 - 86 = 114$, and $114 \\ge 50$, so it is legal.",
    trap_map: {
      "0": "Reports the floor on drinks rather than the ceiling.",
      "1": "Subtracts the floor of $50$ from the $114$ free slots.",
      "3": "Subtracts the floor from the capacity instead of subtracting the snacks.",
      "4": "Reports the machine's total capacity.",
    },
    numeric_check: "200 - 86",
    check() {
      let best = -Infinity;
      for (let d = 0; d <= 400; d++) if (86 + d <= 200 && d >= 50) best = Math.max(best, d);
      return { kind: "value", value: best };
    },
  },
  {
    ...A,
    subtopic: "inequalities",
    context: "pure",
    difficulty: 2,
    stem_md:
      "How many integers $n$ satisfy $-7 < 2n + 1 \\le 15$?",
    choices: ["$8$", "$10$", "$11$", "$12$", "$23$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nIsolate $n$ first: subtract $1$ to get $-8 < 2n \\le 14$, then halve to get $-4 < n \\le 7$. The integers run from $-3$ through $7$, and there are $7 - (-3) + 1 = 11$ of them.\n\n**Trigger cue**\n\n\"How many integers satisfy\": isolate $n$, then count $b - a + 1$ over the integers actually included.\n\n**Takeaway**\n\nIsolate first, then count endpoints inclusively.",
    fastest_path_md: "$-4 < n \\le 7$ means $n = -3 \\ldots 7$: $11$ integers.",
    trap_map: {
      "0": "Counts only the non-negative solutions.",
      "1": "Counts $b - a$ without adding one.",
      "3": "Includes $n = -4$, which the strict inequality excludes.",
      "4": "Counts the integers between the printed bounds instead of solving for $n$.",
    },
    numeric_check: "11",
    check() {
      let count = 0;
      for (let n = -200; n <= 200; n++) if (-7 < 2 * n + 1 && 2 * n + 1 <= 15) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...A,
    subtopic: "inequalities",
    context: "real",
    difficulty: 2,
    stem_md:
      "A student has scores of $78$, $84$, and $91$ on three tests. What is the least score she can earn on a fourth test so that her average for the four tests is more than $85$?",
    choices: ["$85$", "$87$", "$88$", "$91$", "$340$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe average exceeds $85$ exactly when the total exceeds $4 \\times 85 = 340$. The first three total $253$, so the fourth score must exceed $87$. Scores are whole numbers and \"more than\" is strict, so the least is $88$.\n\n**Trigger cue**\n\n\"Least score so that the average is more than\": convert to a total, then step *past* the boundary — hitting it exactly is not more than it.\n\n**Takeaway**\n\nStrict inequality means step past the boundary integer.",
    fastest_path_md: "Total must exceed $340$; $340 - 253 = 87$, so $88$.",
    trap_map: {
      "0": "Reports the target average itself.",
      "1": "Stops at the boundary, where the average is exactly $85$ rather than more.",
      "3": "Assumes the fourth score must match the highest existing score.",
      "4": "Reports the required four-test total rather than the fourth score.",
    },
    numeric_check: "88",
    check() {
      const known = [78, 84, 91];
      for (let s = 0; s <= 200; s++) {
        const all = [...known, s];
        if (all.reduce((a, b) => a + b, 0) / all.length > 85) {
          return { kind: "value", value: s };
        }
      }
      throw new Error("no score");
    },
  },
  {
    ...A,
    subtopic: "inequalities",
    context: "pure",
    difficulty: 4,
    stem_md:
      "If $-5 \\le x \\le -3$ and $-4 \\le y \\le 2$, what is the greatest possible value of $xy$?",
    choices: ["$-6$", "$0$", "$12$", "$15$", "$20$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nRun all four endpoint products: $(-5)(-4) = 20$, $(-5)(2) = -10$, $(-3)(-4) = 12$, $(-3)(2) = -6$. The greatest is $20$ — two negatives, both at their largest magnitude.\n\n**Trigger cue**\n\nRanges for two variables and an extreme of $xy$: test all four endpoint pairs; the interior never wins for a product.\n\n**Takeaway**\n\nRun all four corners — \"least times least\" can be the maximum.",
    fastest_path_md: "$(-5)(-4) = 20$ beats every other corner.",
    trap_map: {
      "0": "Takes the two values nearest zero, $(-3)(2)$.",
      "1": "Assumes $y = 0$ maximizes because it is the only sign change.",
      "2": "Pairs the smaller magnitude of $x$ with the most negative $y$.",
      "3": "Multiplies $-5$ by $-3$, using two values of the same variable.",
    },
    numeric_check: "(-5)*(-4)",
    check() {
      let best = -Infinity;
      for (let xi = -500; xi <= -300; xi++)
        for (let yi = -400; yi <= 200; yi++) best = Math.max(best, (xi / 100) * (yi / 100));
      return { kind: "value", value: best };
    },
  },
  {
    ...A,
    subtopic: "inequalities",
    context: "pure",
    difficulty: 4,
    stem_md:
      "For how many integer values of $x$ is $\\dfrac{x-6}{x+2} < 0$?",
    choices: ["$5$", "$6$", "$7$", "$8$", "$9$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nA quotient is negative exactly between its critical points, so the solution is $-2 < x < 6$ — never clear the denominator, and note that $x = -2$ is undefined, not a solution. The integers strictly between are $-1, 0, 1, 2, 3, 4, 5$: seven of them.\n\n**Trigger cue**\n\nA rational expression compared to $0$: sign chart on the critical points, with denominator zeros marked as holes.\n\n**Takeaway**\n\nA quotient flips sign at every critical point, holes included.",
    fastest_path_md: "$-2 < x < 6$; integers $-1$ through $5$ is $7$ values.",
    trap_map: {
      "0": "Excludes both $x = 0$ and one endpoint neighbour.",
      "1": "Drops one endpoint integer when counting the open interval.",
      "3": "Includes $x = 6$, where the expression equals $0$ rather than being negative.",
      "4": "Includes both $x = -2$ and $x = 6$.",
    },
    numeric_check: "7",
    check() {
      let count = 0;
      for (let x = -500; x <= 500; x++) {
        if (x + 2 === 0) continue;
        if ((x - 6) / (x + 2) < 0) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // ===================== functions_sequences =====================
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $f(x) = 3x^{2} - 2x + 1$, what is the value of $f(-2)$?",
    choices: ["$-7$", "$5$", "$9$", "$17$", "$21$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSubstitute carefully: $f(-2) = 3(-2)^{2} - 2(-2) + 1 = 3(4) + 4 + 1 = 17$. The square makes the first term positive, and subtracting a negative adds.\n\n**Trigger cue**\n\nA negative input into a polynomial: bracket the input, square before multiplying, and watch the double negative.\n\n**Takeaway**\n\nSquare the input first; a minus times a minus adds.",
    fastest_path_md: "$3(4) + 4 + 1 = 17$.",
    trap_map: {
      "0": "Treats $3(-2)^{2}$ as $-12$, applying the sign after the coefficient rather than squaring first.",
      "1": "Squares the input inside the middle term too, computing $12 - 2(4) + 1$.",
      "2": "Drops the minus sign in the middle term, computing $12 - 2(2) + 1$.",
      "4": "Both squares the input in the middle term and flips its sign, $12 + 2(4) + 1$.",
    },
    numeric_check: "3*(-2)^2 - 2*(-2) + 1",
    check() {
      const f = (x) => 3 * x * x - 2 * x + 1;
      return { kind: "value", value: f(-2) };
    },
  },
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 2,
    stem_md:
      "In a certain sequence, the first term is $7$ and each term after the first is $5$ more than the preceding term. What is the $20$th term?",
    choices: ["$95$", "$100$", "$102$", "$107$", "$112$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nAn arithmetic sequence has $a_n = a_1 + (n-1)d$. Here $a_{20} = 7 + 19(5) = 7 + 95 = 102$ — nineteen steps, not twenty.\n\n**Trigger cue**\n\n\"Each term is $d$ more than the preceding\": arithmetic, and the $n$th term takes $n-1$ steps from the first.\n\n**Takeaway**\n\nThe $n$th term is $n-1$ steps past the first.",
    fastest_path_md: "$7 + 19(5) = 102$.",
    trap_map: {
      "0": "Reports the total increase, $19 \\times 5$, without the first term.",
      "1": "Uses $20$ steps and drops the first term.",
      "3": "Takes $20$ steps instead of $19$.",
      "4": "Takes $21$ steps.",
    },
    numeric_check: "7 + 19*5",
    check() {
      let term = 7;
      for (let n = 2; n <= 20; n++) term += 5;
      return { kind: "value", value: term };
    },
  },
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 2,
    stem_md:
      "The function $g$ is defined by $g(x) = \\dfrac{x + 4}{x - 1}$ for all $x \\neq 1$. What is the value of $g(5)$?",
    choices: ["$\\dfrac{4}{9}$", "$\\dfrac{5}{4}$", "$\\dfrac{9}{5}$", "$\\dfrac{9}{4}$", "$9$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$g(5) = \\frac{5+4}{5-1} = \\frac{9}{4}$.\n\n**Trigger cue**\n\nA rational function evaluated at a number: substitute into numerator and denominator separately, then reduce once.\n\n**Takeaway**\n\nSubstitute into both parts before simplifying anything.",
    fastest_path_md: "$\\frac{9}{4}$.",
    trap_map: {
      "0": "Inverts the fraction.",
      "1": "Forgets to add $4$ in the numerator.",
      "2": "Forgets to subtract $1$ in the denominator.",
      "4": "Divides by $1$ rather than by $x - 1$.",
    },
    numeric_check: "9/4",
    check() {
      const g = (x) => (x + 4) / (x - 1);
      return { kind: "value", value: g(5) };
    },
  },
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 2,
    stem_md:
      "A sequence is defined by $a_1 = 3$ and $a_{n+1} = 2a_n - 1$ for every positive integer $n$. What is $a_4$?",
    choices: ["$9$", "$10$", "$17$", "$24$", "$31$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nStep through the recursion: $a_2 = 2(3) - 1 = 5$, $a_3 = 2(5) - 1 = 9$, $a_4 = 2(9) - 1 = 17$.\n\n**Trigger cue**\n\nA recursive definition with a small index: just iterate — a closed form costs more time than three steps.\n\n**Takeaway**\n\nFor small indices, iterate the recursion rather than solving it.",
    fastest_path_md: "$3 \\to 5 \\to 9 \\to 17$.",
    trap_map: {
      "0": "Stops at $a_3$.",
      "1": "Applies $2(a_n - 1)$, subtracting before doubling.",
      "3": "Doubles three times and never subtracts.",
      "4": "Uses $2a_n + 1$ instead of $2a_n - 1$.",
    },
    numeric_check: "17",
    check() {
      let a = 3;
      for (let n = 1; n <= 3; n++) a = 2 * a - 1;
      return { kind: "value", value: a };
    },
  },
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $f(x) = 2x - 3$ and $g(x) = x^{2} + 1$, what is the value of $f(g(2))$?",
    choices: ["$-1$", "$1$", "$5$", "$7$", "$26$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nWork from the inside out: $g(2) = 2^{2} + 1 = 5$, then $f(5) = 2(5) - 3 = 7$.\n\n**Trigger cue**\n\nNested function notation $f(g(x))$: evaluate the inner function first — composition is not commutative.\n\n**Takeaway**\n\nInside out; $f(g(x))$ is rarely $g(f(x))$.",
    fastest_path_md: "$g(2) = 5$; $f(5) = 7$.",
    trap_map: {
      "0": "Evaluates $f$ at $2$ and stops.",
      "1": "Computes $g(f(2))$ minus a step, reversing the composition.",
      "2": "Reports the inner value $g(2)$ without applying $f$.",
      "4": "Computes $g(f(2))$, applying the functions in the wrong order.",
    },
    numeric_check: "2*(2^2+1)-3",
    check() {
      const f = (x) => 2 * x - 3;
      const g = (x) => x * x + 1;
      return { kind: "value", value: f(g(2)) };
    },
  },
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 3,
    stem_md:
      "The $n$th term of a sequence is given by $a_n = n^{2} - 4n$. How many terms of this sequence are negative?",
    choices: ["$1$", "$2$", "$3$", "$4$", "$5$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$a_n = n(n-4)$ is negative exactly when $0 < n < 4$. Over positive integers that means $n = 1, 2, 3$ — three terms. At $n = 4$ the term is $0$, which is not negative.\n\n**Trigger cue**\n\nA quadratic term formula with a sign question: factor it and read off where the sign changes, then count only the valid indices.\n\n**Takeaway**\n\nFactor the term formula; count indices, not roots.",
    fastest_path_md: "$n(n-4) < 0$ on $0 < n < 4$: $n = 1, 2, 3$.",
    trap_map: {
      "0": "Counts only the most negative term.",
      "1": "Excludes $n = 1$, where the term is $-3$.",
      "3": "Counts $n = 4$, where the term is $0$.",
      "4": "Counts $n = 0$ and $n = 4$ alongside the three genuine terms.",
    },
    numeric_check: "3",
    check() {
      let count = 0;
      for (let n = 1; n <= 1000; n++) if (n * n - 4 * n < 0) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 4,
    stem_md:
      "A sequence is defined by $a_1 = 2$ and $a_{n+1} = \\dfrac{1}{1 - a_n}$ for every positive integer $n$ for which the expression is defined. What is $a_{100}$?",
    choices: [
      "$-1$",
      "$-\\dfrac{1}{2}$",
      "$\\dfrac{1}{2}$",
      "$1$",
      "$2$",
    ],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nCompute the first few: $a_1 = 2$, $a_2 = \\frac{1}{1-2} = -1$, $a_3 = \\frac{1}{1-(-1)} = \\frac{1}{2}$, $a_4 = \\frac{1}{1-\\frac{1}{2}} = 2$. The sequence cycles with period $3$. Since $100 = 3(33) + 1$, $a_{100} = a_1 = 2$.\n\n**Trigger cue**\n\nA recursion asked at a large index: compute terms until one repeats, then reduce the index modulo the cycle length.\n\n**Takeaway**\n\nHunt for the cycle; then the index is just a remainder.",
    fastest_path_md:
      "Cycle $2, -1, \\frac{1}{2}$ of length $3$; $100 \\equiv 1 \\pmod 3$, so $a_{100} = 2$.",
    trap_map: {
      "0": "Reduces $100$ to position $2$ in the cycle.",
      "1": "Uses a cycle of length $2$.",
      "2": "Reduces $100$ to position $3$ in the cycle.",
      "3": "Assumes the sequence settles at a fixed point.",
    },
    numeric_check: "2",
    check() {
      let a = 2;
      for (let n = 1; n < 100; n++) a = 1 / (1 - a);
      return { kind: "value", value: Math.round(a * 1e9) / 1e9 };
    },
  },
  {
    ...A,
    subtopic: "functions_sequences",
    context: "pure",
    difficulty: 4,
    stem_md:
      "The function $h$ satisfies $h(x) + 2h(8 - x) = x$ for every real number $x$. What is the value of $h(5)$?",
    choices: [
      "$-\\dfrac{1}{3}$",
      "$0$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{5}{3}$",
      "$\\dfrac{7}{3}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe relation pairs $x$ with $8 - x$, so feed it both members of the pair. At $x = 5$: $h(5) + 2h(3) = 5$. At $x = 3$: $h(3) + 2h(5) = 3$. From the second, $h(3) = 3 - 2h(5)$; substituting, $h(5) + 6 - 4h(5) = 5$, so $-3h(5) = -1$ and $h(5) = \\frac{1}{3}$.\n\n**Trigger cue**\n\nA functional equation relating $f(x)$ to $f(k - x)$: substitute both $x$ and $k - x$ to get two equations in two unknowns.\n\n**Takeaway**\n\nFeed the equation both members of its own pair.",
    fastest_path_md:
      "Two substitutions, $x = 5$ and $x = 3$, then eliminate $h(3)$: $h(5) = \\frac{1}{3}$.",
    trap_map: {
      "0": "Sign slip in the elimination, solving $3h(5) = -1$.",
      "1": "Assumes the two substitutions give the same equation, leaving $h$ undetermined and guessing zero.",
      "3": "Divides the input $5$ by $3$ without eliminating anything.",
      "4": "Reports $h(3)$, the paired value, instead of $h(5)$.",
    },
    numeric_check: "1/3",
    check() {
      // Solve the 2x2 system by search: h3 is forced by the x = 3 equation,
      // and the x = 5 equation then pins h5.
      let answer = null;
      for (let thousandths = -5000; thousandths <= 5000; thousandths++) {
        const h5 = thousandths / 3000;
        const h3 = 3 - 2 * h5;
        if (Math.abs(h5 + 2 * h3 - 5) < 1e-12) answer = h5;
      }
      if (answer == null) throw new Error("no solution");
      return { kind: "value", value: answer };
    },
  },

  // ===================== quadratics_factoring =====================
  {
    ...A,
    subtopic: "quadratics_factoring",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $x^{2} - 7x + 12 = 0$, what is the sum of all possible values of $x$?",
    choices: ["$-12$", "$-7$", "$3$", "$7$", "$12$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nVieta's relation gives the sum directly: for $x^{2} + bx + c = 0$ the roots sum to $-b$, so the sum is $7$. (Factoring confirms it: $(x-3)(x-4) = 0$ and $3 + 4 = 7$.)\n\n**Trigger cue**\n\n\"Sum of the possible values of $x$\": reach for Vieta and skip the roots entirely.\n\n**Takeaway**\n\nRoots sum to minus the middle coefficient.",
    fastest_path_md: "Sum $= -(-7) = 7$.",
    trap_map: {
      "0": "Reports minus the constant term.",
      "1": "Keeps the middle coefficient's sign instead of negating it.",
      "2": "Reports a single root.",
      "4": "Reports the product of the roots rather than their sum.",
    },
    numeric_check: "7",
    check() {
      let sum = 0;
      for (let x = -100; x <= 100; x++) if (x * x - 7 * x + 12 === 0) sum += x;
      return { kind: "value", value: sum };
    },
  },
  {
    ...A,
    subtopic: "quadratics_factoring",
    context: "pure",
    difficulty: 2,
    stem_md:
      "If $x^{2} = 9x$ and $x$ can be any real number, what is the sum of all possible values of $x$?",
    choices: ["$0$", "$3$", "$9$", "$18$", "$81$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFactor rather than divide: $x^{2} - 9x = 0$ gives $x(x - 9) = 0$, so $x = 0$ or $x = 9$. Their sum is $9$. Dividing both sides by $x$ would silently discard the root $x = 0$.\n\n**Trigger cue**\n\nEvery term carries an $x$: factor the $x$ out and expect two answers, one of them $0$.\n\n**Takeaway**\n\nFactor, never divide by the variable.",
    fastest_path_md: "$x(x-9) = 0 \\Rightarrow 0 + 9 = 9$.",
    trap_map: {
      "0": "Reports only the root $x = 0$.",
      "1": "Takes a square root of both sides and reports $3$.",
      "3": "Doubles the nonzero root.",
      "4": "Squares the nonzero root.",
    },
    numeric_check: "0 + 9",
    check() {
      let sum = 0;
      for (let x = -200; x <= 200; x++) if (x * x === 9 * x) sum += x;
      return { kind: "value", value: sum };
    },
  },
  {
    ...A,
    subtopic: "quadratics_factoring",
    context: "real",
    difficulty: 3,
    stem_md:
      "A rectangular garden is $5$ meters longer than it is wide, and its area is $84$ square meters. What is the perimeter, in meters, of the garden?",
    choices: ["$14$", "$19$", "$26$", "$38$", "$46$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nWith width $w$, the length is $w + 5$ and $w(w+5) = 84$. So $w^{2} + 5w - 84 = 0$, which factors as $(w+12)(w-7) = 0$. Width must be positive, so $w = 7$ and the length is $12$. The perimeter is $2(7 + 12) = 38$.\n\n**Trigger cue**\n\n\"Length is $k$ more than width, area is $A$\": set up $w(w+k) = A$, factor, discard the negative root — then reread what was asked.\n\n**Takeaway**\n\nSolve for the dimension, then answer the question actually asked.",
    fastest_path_md: "$7 \\times 12 = 84$; perimeter $2(19) = 38$.",
    trap_map: {
      "0": "Reports twice the width.",
      "1": "Reports the semi-perimeter, $w + \\ell$.",
      "2": "Reports twice the length.",
      "4": "Uses the discarded negative root's magnitude in place of the width.",
    },
    numeric_check: "2*(7+12)",
    check() {
      const hits = [];
      for (let w = 1; w <= 500; w++) if (w * (w + 5) === 84) hits.push(2 * (w + (w + 5)));
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },
  {
    ...A,
    subtopic: "quadratics_factoring",
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $x + y = 12$ and $x^{2} - y^{2} = 60$, what is the value of $y$?",
    choices: ["$\\dfrac{5}{2}$", "$\\dfrac{7}{2}$", "$5$", "$\\dfrac{17}{2}$", "$17$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nFactor the difference of squares: $x^{2} - y^{2} = (x+y)(x-y)$, so $12(x-y) = 60$ and $x - y = 5$. With $x + y = 12$, subtracting gives $2y = 7$, so $y = \\frac{7}{2}$.\n\n**Trigger cue**\n\n\"$x + y$ given and $x^{2} - y^{2}$ given\": divide — $x - y = \\frac{x^{2}-y^{2}}{x+y}$ — and never solve the quadratic.\n\n**Takeaway**\n\nDivide the difference of squares by the sum.",
    fastest_path_md: "$x - y = \\frac{60}{12} = 5$; $y = \\frac{12-5}{2} = \\frac{7}{2}$.",
    trap_map: {
      "0": "Halves $x - y$ instead of halving $\\left(x+y\\right) - \\left(x-y\\right)$.",
      "2": "Reports $x - y$ rather than $y$.",
      "3": "Reports $x$ instead of $y$.",
      "4": "Adds the sum and the difference without halving.",
    },
    numeric_check: "7/2",
    check() {
      let answer = null;
      for (let halves = -200; halves <= 200; halves++) {
        const y = halves / 2;
        const x = 12 - y;
        if (Math.abs(x * x - y * y - 60) < 1e-9) answer = y;
      }
      if (answer == null) throw new Error("no solution");
      return { kind: "value", value: answer };
    },
  },
  // The D5 that sat here ("$x + 1/x = 5$, find $x^3 + 1/x^3$") was
  // withdrawn after a cold reread: with the identity known it is a
  // 15-second question, and the chapter teaches the squared form already.
  // Its replacement lives in batch-d5-replacements.mjs.

  {
    ...A,
    subtopic: "quadratics_factoring",
    context: "pure",
    difficulty: 5,
    stem_md:
      "The equation $x^{2} + bx + 36 = 0$ has two distinct integer roots. How many different values can $b$ take?",
    choices: ["$4$", "$6$", "$8$", "$9$", "$10$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe roots multiply to $36$ and sum to $-b$. Distinct integer pairs with product $36$ are $(1,36), (2,18), (3,12), (4,9)$ and their negatives $(-1,-36), (-2,-18), (-3,-12), (-4,-9)$; the pair $(6,6)$ is excluded because the roots must be distinct. Each pair gives a different sum, so $b$ takes $8$ values: $\\mp 37, \\mp 20, \\mp 15, \\mp 13$.\n\n**Trigger cue**\n\n\"Two distinct integer roots\" with a fixed constant term: list the factor pairs of that constant; the possible middle coefficients are minus the pair sums.\n\n**Takeaway**\n\nFactor pairs of $c$ generate every legal $b$.",
    fastest_path_md:
      "Four positive factor pairs, each mirrored negative, minus the repeated pair $(6,6)$: $8$.",
    trap_map: {
      "0": "Counts only the positive factor pairs.",
      "1": "Counts all divisors of $36$ up to its square root, including $6$.",
      "3": "Includes the repeated root pair $(6,6)$, which is not distinct.",
      "4": "Counts $(6,6)$ in both sign directions.",
    },
    numeric_check: "8",
    check() {
      const values = new Set();
      for (let b = -200; b <= 200; b++) {
        const roots = [];
        for (let x = -200; x <= 200; x++) if (x * x + b * x + 36 === 0) roots.push(x);
        if (roots.length === 2) values.add(b);
      }
      return { kind: "value", value: values.size };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
