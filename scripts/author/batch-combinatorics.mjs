/**
 * Batch: 6 new combinatorics items (counting_sets_series_prob_stats / arithmetic).
 * Cells: D4 PS pure, D3 PS real, D3 PS real, D4 PS real, D4 PS real, D5 PS pure.
 * Run: node scripts/author/batch-combinatorics.mjs   (dry run unless APPEND=1)
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // 1. D4 PS pure — complement counting with permutations
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 4,
    stem_md:
      "How many four-letter sequences of distinct letters can be formed from the six letters $P, Q, R, S, T, U$ if each sequence must contain the letter $P$?",
    choices: ["$120$", "$240$", "$300$", "$360$", "$480$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nCount all four-letter sequences of distinct letters, then remove those with no $P$. Total: $6 \\cdot 5 \\cdot 4 \\cdot 3 = 360$. Sequences avoiding $P$ draw all four letters from the remaining five: $5 \\cdot 4 \\cdot 3 \\cdot 2 = 120$. Sequences containing $P$: $360 - 120 = 240$.\n\n**Trigger cue**\nA \"must contain $X$\" condition on arrangements: count everything, subtract the arrangements that avoid $X$.\n\n**Takeaway**\n\"Must contain\" equals total minus the arrangements that omit it.",
    fastest_path_md:
      "Direct build: place $P$ in one of $4$ positions, then fill the other three slots from the remaining five letters in order: $4 \\cdot (5 \\cdot 4 \\cdot 3) = 240$.",
    trap_map: {
      "0": "Computes only the complement $5 \\cdot 4 \\cdot 3 \\cdot 2 = 120$ (sequences with no $P$) and stops.",
      "2": "Subtracts three-letter arrangements $5 \\cdot 4 \\cdot 3 = 60$ from $360$ instead of the four-letter complement.",
      "3": "Ignores the restriction and reports all $6 \\cdot 5 \\cdot 4 \\cdot 3 = 360$ sequences.",
      "4": "Adds the complement to the total, $360 + 120$, instead of subtracting it.",
    },
    numeric_check: "6*5*4*3 - 5*4*3*2",
    check() {
      const letters = ["P", "Q", "R", "S", "T", "U"];
      let count = 0;
      for (let a = 0; a < 6; a++)
        for (let b = 0; b < 6; b++)
          for (let c = 0; c < 6; c++)
            for (let d = 0; d < 6; d++) {
              if (new Set([a, b, c, d]).size !== 4) continue;
              if ([a, b, c, d].some((x) => letters[x] === "P")) count++;
            }
      return { kind: "value", value: count };
    },
  },

  // 2. D3 PS real — ordered selection (permutation of 3 from 8)
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "A bookstore clerk is setting up a window display of $3$ different novels chosen from $8$ available novels. The chosen novels are placed side by side in a row, and displays that use the same novels in a different left-to-right order count as different displays. How many displays are possible?",
    choices: ["$24$", "$56$", "$112$", "$336$", "$512$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe display is an ordered selection of $3$ novels from $8$ distinct novels: $8$ choices for the left slot, $7$ for the middle, $6$ for the right, so $8 \\cdot 7 \\cdot 6 = 336$.\n\n**Trigger cue**\nSelecting a few items from many when the arrangement (left-to-right, ranked, labeled slots) matters: multiply falling factors, do not divide.\n\n**Takeaway**\nWhen order counts, multiply slot by slot without dividing.",
    fastest_path_md:
      "Fill the three slots left to right: $8 \\cdot 7 \\cdot 6 = 336$.",
    trap_map: {
      "0": "Multiplies $8$ novels by $3$ slots instead of filling the slots one at a time.",
      "1": "Uses the combination $\\binom{8}{3} = 56$, ignoring that left-to-right order matters.",
      "2": "Multiplies $\\binom{8}{3}$ by $2$ instead of by the $3! = 6$ orderings of the chosen novels.",
      "4": "Computes $8^3 = 512$, allowing the same novel to fill more than one slot.",
    },
    numeric_check: "8*7*6",
    check() {
      let count = 0;
      for (let a = 0; a < 8; a++)
        for (let b = 0; b < 8; b++)
          for (let c = 0; c < 8; c++)
            if (a !== b && a !== c && b !== c) count++;
      return { kind: "value", value: count };
    },
  },

  // 3. D3 PS real — permutation with a forbidden position
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "Ms. Rivera must assign her four classes — algebra, biology, chemistry, and drama — to four consecutive periods, one class per period. If chemistry cannot be assigned to the first period, how many different schedules are possible?",
    choices: ["$6$", "$12$", "$18$", "$21$", "$24$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWithout restriction there are $4! = 24$ schedules. Schedules that put chemistry first leave $3! = 6$ orders for the other classes. Valid schedules: $24 - 6 = 18$.\n\n**Trigger cue**\nOne item barred from one slot in a full arrangement: subtract the bad arrangements from the total, or seat the restricted slot first.\n\n**Takeaway**\nHandle the restricted position first, or subtract the violating arrangements.",
    fastest_path_md:
      "Fill the restricted slot first: $3$ classes may go first, then the remaining three classes fill the rest in $3! = 6$ ways: $3 \\cdot 6 = 18$.",
    trap_map: {
      "0": "Counts the forbidden schedules ($3! = 6$ with chemistry first) instead of the allowed ones.",
      "1": "Multiplies chemistry's $3$ allowed periods by the $4$ classes rather than arranging the remaining classes.",
      "3": "Subtracts $3$ instead of $3! = 6$ from the $24$ total.",
      "4": "Ignores the restriction and reports all $4! = 24$ schedules.",
    },
    numeric_check: "24 - 6",
    check() {
      // classes 0..3, chemistry = 2; periods are positions 0..3
      const perms = [];
      const build = (rest, cur) => {
        if (!rest.length) return perms.push(cur);
        rest.forEach((x, i) =>
          build(rest.filter((_, j) => j !== i), [...cur, x]),
        );
      };
      build([0, 1, 2, 3], []);
      const count = perms.filter((p) => p[0] !== 2).length;
      return { kind: "value", value: count };
    },
  },

  // 4. D4 PS real — "at least one" committee selection
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 4,
    stem_md:
      "A hospital is forming a rapid-response team of $4$ members chosen from $6$ doctors and $3$ nurses. If the team must include at least one nurse, how many different teams are possible?",
    choices: ["$15$", "$60$", "$111$", "$126$", "$168$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nAll teams of $4$ from the $9$ staff: $\\binom{9}{4} = 126$. Teams with no nurse use only doctors: $\\binom{6}{4} = 15$. Teams with at least one nurse: $126 - 15 = 111$.\n\n**Trigger cue**\nAn \"at least one\" membership condition on a committee: count all committees and subtract the ones with none.\n\n**Takeaway**\nAt least one equals total minus none.",
    fastest_path_md:
      "Complement in one line: $\\binom{9}{4} - \\binom{6}{4} = 126 - 15 = 111$. Casework by nurse count ($1$, $2$, or $3$ nurses) takes three computations instead of two.",
    trap_map: {
      "0": "Reports the all-doctor teams $\\binom{6}{4} = 15$ — the complement — instead of subtracting them.",
      "1": "Counts only teams with exactly one nurse, $3 \\cdot \\binom{6}{3} = 60$, missing the two- and three-nurse teams.",
      "3": "Ignores the restriction and reports all $\\binom{9}{4} = 126$ teams.",
      "4": "Reserves one nurse ($3$ ways) and then picks any $3$ of the remaining $8$, double-counting teams with multiple nurses: $3 \\cdot \\binom{8}{3} = 168$.",
    },
    numeric_check: "126 - 15",
    check() {
      // staff 0..8; nurses are 6, 7, 8
      let count = 0;
      for (let a = 0; a < 9; a++)
        for (let b = a + 1; b < 9; b++)
          for (let c = b + 1; c < 9; c++)
            for (let d = c + 1; d < 9; d++)
              if ([a, b, c, d].some((x) => x >= 6)) count++;
      return { kind: "value", value: count };
    },
  },

  // 5. D4 PS real — lattice paths (multiset arrangement of moves)
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 4,
    stem_md:
      "A courier's office sits $4$ blocks west and $3$ blocks south of a client's building, and the streets form a rectangular grid. Walking only east or north along the streets, how many different routes can the courier take from the office to the client's building?",
    choices: ["$12$", "$35$", "$56$", "$210$", "$5040$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nEvery route is a string of $7$ moves: $4$ east ($E$) and $3$ north ($N$) in some order. Choosing which $3$ of the $7$ positions hold the $N$ moves determines the route: $\\binom{7}{3} = \\frac{7!}{3!\\,4!} = 35$.\n\n**Trigger cue**\nShortest routes on a grid moving in only two directions: count arrangements of the move letters, $\\binom{m+n}{n}$.\n\n**Takeaway**\nGrid routes are arrangements of repeated move letters.",
    fastest_path_md:
      "Total moves $4 + 3 = 7$; choose the slots for the smaller direction: $\\binom{7}{3} = 35$.",
    trap_map: {
      "0": "Multiplies the two dimensions, $4 \\cdot 3 = 12$, instead of arranging the moves.",
      "2": "Miscounts the trip as $8$ moves and computes $\\binom{8}{3} = 56$.",
      "3": "Orders the three north moves as distinct picks, $7 \\cdot 6 \\cdot 5 = 210$, without dividing by $3!$.",
      "4": "Treats all seven moves as distinguishable and computes $7! = 5040$.",
    },
    numeric_check: "5040/(6*24)",
    check() {
      // brute-force walk on the grid from (0,0) to (4,3), steps E or N
      const walk = (x, y) => {
        if (x === 4 && y === 3) return 1;
        let total = 0;
        if (x < 4) total += walk(x + 1, y);
        if (y < 3) total += walk(x, y + 1);
        return total;
      };
      return { kind: "value", value: walk(0, 0) };
    },
  },

  // 6. D5 PS pure — compositions (stars and bars)
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 5,
    stem_md:
      "How many ordered triples of positive integers $(x, y, z)$ satisfy $x + y + z = 12$?",
    choices: ["$55$", "$66$", "$91$", "$165$", "$220$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nWrite $12$ as a row of $12$ units; the $11$ gaps between adjacent units can each hold a divider. Choosing $2$ of the $11$ gaps splits the row into three positive parts $x$, $y$, $z$ in order, so the count is $\\binom{11}{2} = 55$.\n\n**Trigger cue**\nCounting ordered ways to split a whole number into a fixed number of positive parts: place dividers in the gaps, $\\binom{n-1}{k-1}$.\n\n**Takeaway**\nPositive ordered parts: choose dividers among the $n-1$ gaps.",
    fastest_path_md:
      "Fix $x = 1, 2, \\ldots, 10$; for each $x$ the pair $(y, z)$ has $12 - x - 1 = 11 - x$ options. Sum: $10 + 9 + \\cdots + 1 = 55$.",
    trap_map: {
      "1": "Uses $\\binom{12}{2} = 66$, placing dividers among $12$ gaps instead of the $11$ gaps between units.",
      "2": "Counts nonnegative solutions, $\\binom{14}{2} = 91$, allowing a variable to be $0$.",
      "3": "Places $3$ dividers instead of $2$: $\\binom{11}{3} = 165$.",
      "4": "Computes $\\binom{12}{3} = 220$, choosing $3$ of the $12$ units rather than $2$ of the $11$ gaps.",
    },
    numeric_check: "(11*10)/2",
    check() {
      let count = 0;
      for (let x = 1; x <= 12; x++)
        for (let y = 1; y <= 12; y++)
          for (let z = 1; z <= 12; z++)
            if (x + y + z === 12) count++;
      return { kind: "value", value: count };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
