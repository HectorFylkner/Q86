/**
 * Batch 2: 11 new linear_systems items (equal_unequal_alg / algebra).
 * Cells: D2 PS pure, D2 PS real, D3 PS real, D3 PS real, D3 PS pure,
 *        D4 PS pure, D4 PS real, D4 DS real, D4 DS pure, D5 PS pure,
 *        D5 PS pure.
 * Run from repo root:
 *   node --experimental-strip-types scripts/author/batch2-linear_systems.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ────────────────────────────────────────────────────────── 1. D2 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 2,
    stem_md: "If $y = 3x - 5$ and $2x + y = 15$, what is the value of $x$?",
    choices: ["2", "3", "4", "7", "11"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe first equation already isolates $y$. Substitute into the second: $2x + (3x - 5) = 15$, so $5x = 20$ and $x = 4$ (then $y = 7$, and $8 + 7 = 15$ checks).\n\n**Trigger cue**\nOne equation already solved for a variable: substitute it immediately instead of re-arranging both equations.\n\n**Takeaway**\nSubstitute the isolated variable once; solve the single equation that remains.",
    fastest_path_md:
      "Backsolve the middle choice: $x = 4$ gives $y = 3(4) - 5 = 7$ and $2(4) + 7 = 15$. Done.",
    trap_map: {
      "0": "Substitutes $y = 3x + 5$, flipping the sign of the constant, and solves $5x + 5 = 15$.",
      "1": "Drops the $-5$ entirely, solving $5x = 15$.",
      "3": "Solves the system correctly but reports $y$ instead of $x$.",
      "4": "Reports $x + y$ instead of $x$.",
    },
    numeric_check: "4",
    check() {
      // brute force: scan integer x, derive y from the first equation
      const hits = [];
      for (let x = -1000; x <= 1000; x++) {
        const y = 3 * x - 5;
        if (2 * x + y === 15) hits.push(x);
      }
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ────────────────────────────────────────────────────────── 2. D2 PS real
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 2,
    stem_md:
      "A pen and a notebook together cost $\\$11.50$. The notebook costs $\\$2.50$ more than the pen. What is the price of the pen?",
    choices: ["$\\$2.50$", "$\\$4.50$", "$\\$5.75$", "$\\$7.00$", "$\\$9.00$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $p$ be the pen's price and $n$ the notebook's: $p + n = 11.50$ and $n = p + 2.50$. Substituting: $p + p + 2.50 = 11.50$, so $2p = 9.00$ and $p = 4.50$ (the notebook is $\\$7.00$).\n\n**Trigger cue**\nA total and a difference for two quantities: the smaller is half of (total minus difference).\n\n**Takeaway**\nHalf the total minus half the difference gives the smaller value.",
    fastest_path_md:
      "Strip the $\\$2.50$ surcharge from the total: $(11.50 - 2.50)/2 = 4.50$ is the pen.",
    trap_map: {
      "0": "Reports the price difference itself as the pen's price.",
      "2": "Halves the $\\$11.50$ total, ignoring the $\\$2.50$ difference.",
      "3": "Solves the system correctly but reports the notebook's price.",
      "4": "Subtracts the difference from the total without halving the result.",
    },
    numeric_check: "4.50",
    check() {
      // brute force in cents over all pen prices
      const hits = [];
      for (let p = 0; p <= 1150; p++) {
        const n = 1150 - p;
        if (n === p + 250) hits.push(p);
      }
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits}`);
      return { kind: "value", value: hits[0] / 100 };
    },
  },

  // ────────────────────────────────────────────────────────── 3. D3 PS real
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 3,
    stem_md:
      "At an office-supply store, $3$ binders and $2$ markers cost $\\$16.00$, and $2$ binders and $3$ markers cost $\\$14.00$. What is the total cost of $5$ binders and $5$ markers?",
    choices: ["$\\$6.00$", "$\\$10.00$", "$\\$15.00$", "$\\$20.00$", "$\\$30.00$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\nLet $b$ and $m$ be the prices: $3b + 2m = 16$ and $2b + 3m = 14$. Subtracting gives $b - m = 2$; adding gives $5b + 5m = 30$. (Solving fully: $b = 4$, $m = 2$, and $5(4) + 5(2) = 30$ checks.)\n\n**Trigger cue**\nCoefficients that swap places across the two equations ($3,2$ and $2,3$): their sum is a balanced bundle — check whether the question asks for exactly that bundle.\n\n**Takeaway**\nSymmetric systems: add the equations to price balanced bundles instantly.",
    fastest_path_md:
      "Add the two purchases: $5$ binders and $5$ markers together cost $16 + 14 = \\$30$ — no individual prices needed.",
    trap_map: {
      "0": "Finds $b + m = 6$, the cost of one binder and one marker, and forgets to scale by 5.",
      "1": "Prices $5$ markers only, at $\\$2.00$ each.",
      "2": "Averages the two purchase totals instead of adding them.",
      "3": "Prices $5$ binders only, at $\\$4.00$ each.",
    },
    numeric_check: "30",
    check() {
      // brute force in cents: enumerate binder prices, derive marker price
      const hits = [];
      for (let b = 0; b <= 1600; b++) {
        if ((1600 - 3 * b) % 2 !== 0) continue;
        const m = (1600 - 3 * b) / 2;
        if (m < 0) continue;
        if (2 * b + 3 * m === 1400) hits.push([b, m]);
      }
      if (hits.length !== 1) throw new Error(`expected unique prices, got ${hits.length}`);
      const [b, m] = hits[0];
      return { kind: "value", value: (5 * b + 5 * m) / 100 };
    },
  },

  // ────────────────────────────────────────────────────────── 4. D3 PS real
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 3,
    stem_md:
      "Marta and Liam together have $\\$96$. If Marta gives Liam $\\$12$, the two of them will then have equal amounts. How much money does Marta have now?",
    choices: ["$\\$36$", "$\\$48$", "$\\$54$", "$\\$60$", "$\\$84$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $M$ and $L$ be the current amounts: $M + L = 96$ and $M - 12 = L + 12$. The second equation gives $M - L = 24$. Adding the equations: $2M = 120$, so $M = 60$ (and $L = 36$; after the gift both hold $48$).\n\n**Trigger cue**\nMoney changing hands between two people: the giver drops and the receiver rises, so a transfer of $d$ closes a gap of $2d$.\n\n**Takeaway**\nA transfer of $d$ closes a gap of $2d$.",
    fastest_path_md:
      "After the gift each holds half of $96$, i.e. $48$; undo the gift: Marta had $48 + 12 = 60$.",
    trap_map: {
      "0": "Solves correctly but reports Liam's current amount.",
      "1": "Assumes they already hold equal halves of the $\\$96$ now.",
      "2": "Sets the current gap to $\\$12$, forgetting that a $\\$12$ transfer closes a $\\$24$ gap.",
      "4": "Subtracts the $\\$12$ gift from the $\\$96$ total instead of tracking the individual amounts.",
    },
    numeric_check: "60",
    check() {
      // brute force over all whole-dollar splits of 96
      const hits = [];
      for (let M = 0; M <= 96; M++) {
        const L = 96 - M;
        if (M - 12 === L + 12) hits.push(M);
      }
      if (hits.length !== 1) throw new Error(`expected unique split, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ────────────────────────────────────────────────────────── 5. D3 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 3,
    stem_md:
      "If $3x + 2y = 29$ and $3x - 2y = 13$, what is the value of $xy$?",
    choices: ["3", "11", "21", "28", "42"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFrom the first equation, $2y = 29 - 3x$. Substitute into the second: $3x - (29 - 3x) = 13$, so $6x = 42$ and $x = 7$. Then $2y = 29 - 21 = 8$, so $y = 4$, and $xy = 28$.\n\n**Trigger cue**\nThe same terms with opposite signs in two equations: add to kill one variable, subtract to kill the other.\n\n**Takeaway**\nAdd and subtract symmetric equations to read off each variable.",
    fastest_path_md:
      "Add: $6x = 42$, so $x = 7$. Subtract: $4y = 16$, so $y = 4$. Then $xy = 28$.",
    trap_map: {
      "0": "Computes $x - y$ instead of $xy$.",
      "1": "Computes $x + y$ instead of $xy$.",
      "2": "Finds $3x = 21$ and reports it without finishing.",
      "4": "Adds the equations to get $6x = 42$ and reports $42$ without solving for $x$.",
    },
    numeric_check: "28",
    check() {
      // exhaustive integer search for the solution of the system
      const hits = [];
      for (let x = -200; x <= 200; x++) {
        for (let y = -200; y <= 200; y++) {
          if (3 * x + 2 * y === 29 && 3 * x - 2 * y === 13) hits.push([x, y]);
        }
      }
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits.length}`);
      const [x, y] = hits[0];
      return { kind: "value", value: x * y };
    },
  },

  // ────────────────────────────────────────────────────────── 6. D4 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 4,
    stem_md:
      "For which value of the constant $k$ does the system\n\n$$2x + 5y = 7$$\n\n$$6x + ky = 28$$\n\nhave no solution?",
    choices: ["3", "10", "15", "20", "30"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nA linear system has no solution when the left sides are proportional but the right sides are not. The $x$-coefficients force the multiplier $6/2 = 3$, so the $y$-coefficients must satisfy $k = 3 \\cdot 5 = 15$. Checking the constants: $3 \\cdot 7 = 21 \\neq 28$, so the lines are parallel and distinct — no solution.\n\n**Trigger cue**\nA parameter with the phrase \"no solution\": match the coefficient ratios and confirm the constant ratio breaks.\n\n**Takeaway**\nNo solution: equal coefficient ratios, unequal constant ratio.",
    fastest_path_md:
      "Triple the first equation: $6x + 15y = 21$. With $k = 15$ the left sides match but $21 \\neq 28$ — parallel lines, no solution.",
    trap_map: {
      "0": "Finds the correct multiplier $3$ but reports it instead of applying it to the $y$-coefficient.",
      "1": "Multiplies the $y$-coefficient $5$ by the first equation's $x$-coefficient $2$ instead of by the ratio $3$.",
      "3": "Matches the constants ratio $28/7 = 4$ instead of the $x$-coefficient ratio.",
      "4": "Cross-multiplies $2k = 6 \\cdot 5 = 30$ but forgets to divide by $2$.",
    },
    numeric_check: "15",
    check() {
      // generic 2x2 classifier, scanned over a fine grid of k values
      const classify = (a1, b1, c1, a2, b2, c2) => {
        const det = a1 * b2 - a2 * b1;
        if (Math.abs(det) > 1e-9) return "unique";
        const crossA = a1 * c2 - a2 * c1;
        const crossB = b1 * c2 - b2 * c1;
        return Math.abs(crossA) < 1e-9 && Math.abs(crossB) < 1e-9
          ? "infinite"
          : "none";
      };
      const hits = [];
      for (let i = -400; i <= 400; i++) {
        const k = i / 4;
        if (classify(2, 5, 7, 6, k, 28) === "none") hits.push(k);
      }
      if (hits.length !== 1) throw new Error(`expected unique k, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ────────────────────────────────────────────────────────── 7. D4 PS real
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 4,
    stem_md:
      "A theater sold $400$ tickets to a concert: adult tickets at $\\$15$ each, student tickets at $\\$9$ each, and child tickets at $\\$5$ each. The number of student tickets sold was twice the number of child tickets sold, and the total revenue was $\\$5{,}340$. How many adult tickets were sold?",
    choices: ["30", "60", "90", "310", "340"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $c$ count child tickets; then students $= 2c$ and adults $= 400 - 3c$. Revenue: $15(400 - 3c) + 9(2c) + 5c = 6000 - 22c = 5340$, so $22c = 660$ and $c = 30$. Adults: $400 - 90 = 310$ (revenue checks: $4650 + 540 + 150 = 5340$).\n\n**Trigger cue**\nThree quantities but one ratio link and two totals: the ratio collapses the system to a single variable.\n\n**Takeaway**\nExpress every count through one variable, then solve the revenue equation.",
    fastest_path_md:
      "All-adult revenue would be $\\$6{,}000$. Each child plus its two students replaces three adult tickets, cutting revenue by $45 - 23 = 22$ dollars; the $\\$660$ shortfall means $30$ such trios, so $400 - 90 = 310$ adults.",
    trap_map: {
      "0": "Solves correctly but reports the number of child tickets.",
      "1": "Solves correctly but reports the number of student tickets.",
      "2": "Reports the combined student and child tickets instead of the adult tickets.",
      "4": "Subtracts only the $60$ student tickets from $400$, forgetting the child tickets.",
    },
    numeric_check: "310",
    check() {
      // brute force over child counts; derive the other counts
      const hits = [];
      for (let c = 0; c <= 400; c++) {
        const s = 2 * c;
        const a = 400 - s - c;
        if (a < 0) continue;
        if (15 * a + 9 * s + 5 * c === 5340) hits.push(a);
      }
      if (hits.length !== 1) throw new Error(`expected unique count, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ────────────────────────────────────────────────────────── 8. D4 DS real
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 4,
    stem_md:
      "Last month, Tara made exactly two payments for her apartment: one rent payment and one utilities payment. What was the amount of Tara's rent payment?\n\n(1) The two payments totaled $\\$1{,}840$.\n\n(2) The average (arithmetic mean) of the two payments was $\\$920$.",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\nLet $r$ and $u$ be the payments. (1): $r + u = 1840$ — one equation, two unknowns; $r$ could be $\\$1{,}000$ or $\\$1{,}200$ — insufficient. (2): $(r + u)/2 = 920$ is exactly $r + u = 1840$ again — insufficient. Together: the statements are the same single equation, so $r$ is still free. Both together are not sufficient.\n\n**Trigger cue**\nTwo statements about the same pair of unknowns: before combining, test whether the second is just a rescaling of the first.\n\n**Takeaway**\nAn average restates a total; two statements can hide one equation.",
    fastest_path_md:
      "Statement (2) is statement (1) divided by $2$. Two copies of one equation never pin down two unknowns — (E).",
    trap_map: {
      "0": "Believes a total of two payments determines each payment individually.",
      "1": "Treats the average as fixing both payments rather than only their sum.",
      "2": "Counts two statements as two independent equations without noticing the average restates the total.",
      "3": "Grants each statement sufficiency although each is a single equation in two unknowns.",
    },
    numeric_check: null,
    check() {
      // enumerate whole-dollar models (r, u), both payments positive
      const s1 = [], s2 = [], both = [];
      for (let r = 1; r <= 2500; r++) {
        for (let u = 1; u <= 2500; u += 1) {
          const c1 = r + u === 1840;
          const c2 = (r + u) / 2 === 920;
          if (c1) s1.push(r);
          if (c2) s2.push(r);
          if (c1 && c2) both.push(r);
        }
      }
      if (s1.length < 2 || s2.length < 2) throw new Error("too few models");
      if (both.length < 1) throw new Error("statements inconsistent");
      const suff = (models) => models.length > 0 && new Set(models).size === 1;
      const a = suff(s1), b = suff(s2), c = suff(both);
      let index;
      if (a && b) index = 3;
      else if (a) index = 0;
      else if (b) index = 1;
      else if (c) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // ────────────────────────────────────────────────────────── 9. D4 DS pure
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 4,
    stem_md:
      "What is the value of $4x + 6y$?\n\n(1) $2x + 3y = 13$\n\n(2) $x - y = 2$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe target is $4x + 6y = 2(2x + 3y)$. (1): $2x + 3y = 13$ gives $4x + 6y = 26$ directly — sufficient, with no need for $x$ and $y$ individually. (2): $x - y = 2$ admits $(3, 1)$ giving $18$ and $(4, 2)$ giving $28$ — insufficient. Statement (1) alone.\n\n**Trigger cue**\nA DS question asking for a combination rather than a variable: check whether a statement is a scalar multiple of the target before solving anything.\n\n**Takeaway**\nTest statements against the target combination, not the individual variables.",
    fastest_path_md:
      "$4x + 6y$ is exactly twice statement (1), so (1) gives $26$ alone; a difference like $x - y = 2$ leaves the sum-type target free. (A).",
    trap_map: {
      "1": "Credits statement (2), under which $4x + 6y$ still varies from model to model.",
      "2": "Solves for $x$ and $y$ individually, never noticing the target is twice statement (1).",
      "3": "Assumes any single linear equation in $x$ and $y$ fixes the target combination.",
      "4": "Concludes neither statement works because neither determines $x$ and $y$ separately.",
    },
    numeric_check: null,
    check() {
      // models on a fine grid: each statement defines a line of (x, y) pairs
      const s1 = [], s2 = [];
      for (let i = -300; i <= 300; i++) {
        const x = i / 10;
        s1.push([x, (13 - 2 * x) / 3]); // all points satisfying (1)
        s2.push([x, x - 2]); // all points satisfying (2)
      }
      const both = s1.filter(([x, y]) => Math.abs(x - y - 2) < 1e-9);
      if (s1.length < 10 || s2.length < 10) throw new Error("too few models");
      if (both.length < 1) throw new Error("statements inconsistent");
      const target = ([x, y]) => Math.round((4 * x + 6 * y) * 1e6) / 1e6;
      const suff = (models) =>
        models.length > 0 && new Set(models.map(target)).size === 1;
      const a = suff(s1), b = suff(s2), c = suff(both);
      let index;
      if (a && b) index = 3;
      else if (a) index = 0;
      else if (b) index = 1;
      else if (c) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // ───────────────────────────────────────────────────────── 10. D5 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 5,
    stem_md:
      "If $x + y = 4z$, $y + z = 6x$, and $x + y + z = 35$, what is the value of $y$?",
    choices: ["5", "7", "12", "23", "28"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFrom the first equation, $y = 4z - x$. Substitute into the total: $x + (4z - x) + z = 35$, so $5z = 35$ and $z = 7$. Substitute into the second equation: $(4z - x) + z = 6x$, so $5z = 7x$ and $x = 5$. Then $y = 35 - 5 - 7 = 23$.\n\n**Trigger cue**\nA pairwise sum set equal to a multiple of the third variable: add that third variable to both sides to reach the known total.\n\n**Takeaway**\nAdding the missing variable turns pairwise sums into the total.",
    fastest_path_md:
      "Each equation completes to the total: $x + y = 4z$ means $35 = 5z$, and $y + z = 6x$ means $35 = 7x$. So $z = 7$, $x = 5$, $y = 23$.",
    trap_map: {
      "0": "Solves the system correctly but reports $x$ instead of $y$.",
      "1": "Solves the system correctly but reports $z$ instead of $y$.",
      "2": "Reports $x + z$, the complement of $y$ in the total.",
      "4": "Reports $x + y$ (the value of $4z$) rather than $y$ alone.",
    },
    numeric_check: "23",
    check() {
      // exhaustive integer search over a generous cube
      const hits = [];
      for (let x = -80; x <= 80; x++)
        for (let y = -80; y <= 80; y++)
          for (let z = -80; z <= 80; z++)
            if (x + y === 4 * z && y + z === 6 * x && x + y + z === 35)
              hits.push([x, y, z]);
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits.length}`);
      return { kind: "value", value: hits[0][1] };
    },
  },

  // ───────────────────────────────────────────────────────── 11. D5 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 5,
    stem_md:
      "If $x$, $y$, and $z$ are positive integers such that $x + y + z = 30$ and $2x + 3y + 5z = 89$, what is the greatest possible value of $z$?",
    choices: ["9", "10", "14", "16", "19"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nSubtract twice the first equation from the second: $y + 3z = 29$, so $y = 29 - 3z$ and $x = 30 - y - z = 1 + 2z$. For every $z \\ge 1$, $x = 1 + 2z$ is a positive integer automatically, so the binding constraint is $y = 29 - 3z \\ge 1$, i.e. $z \\le 28/3$, so $z \\le 9$. At $z = 9$: $(x, y, z) = (19, 2, 9)$, and $38 + 6 + 45 = 89$ checks.\n\n**Trigger cue**\nTwo equations, three positive integers, and a greatest/least question: reduce to a one-parameter family, then let positivity cap the parameter.\n\n**Takeaway**\nReduce to one parameter; positivity of every variable caps the extremes.",
    fastest_path_md:
      "Second equation minus twice the first: $y + 3z = 29$. Push $z$ up while $y$ stays positive: $z = 9$ leaves $y = 2$ (and $x = 19$).",
    trap_map: {
      "1": "Rounds $29/3$ up to $10$, which forces $y = -1$.",
      "2": "Sets $x = y = 1$ in the subtracted equation $x + 2y + 4z = 59$ and ignores the total-count equation.",
      "3": "Sets $x = y = 1$ in $2x + 3y + 5z = 89$ alone and rounds $84/5$ down.",
      "4": "Finds the optimal triple $(19, 2, 9)$ but reports $x$ instead of $z$.",
    },
    numeric_check: "9",
    check() {
      // brute force over all positive-integer triples
      let best = null;
      let count = 0;
      for (let x = 1; x <= 30; x++)
        for (let y = 1; y <= 30; y++)
          for (let z = 1; z <= 30; z++)
            if (x + y + z === 30 && 2 * x + 3 * y + 5 * z === 89) {
              count++;
              if (best === null || z > best) best = z;
            }
      if (count < 2) throw new Error(`expected a family of solutions, got ${count}`);
      if (best === null) throw new Error("no solutions found");
      return { kind: "value", value: best };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
