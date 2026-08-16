/**
 * Batch: 11 new min_max_optimization items (equal_unequal_alg).
 * Cells: D3 ×5, D4 ×5, D5 ×1 — the subtopic had no D4 items at all.
 * Trap language tracks the chapter: maxing both variables in a product,
 * rounding the wrong way, forgetting "distinct", the hidden floor in
 * ratio caps, skipping the legality check.
 * Run: node scripts/author/batch-min_max_optimization-v2.mjs
 *      (APPEND=1 to write the bank)
 */
import { verifyAndAppend } from "./harness.mjs";

const S = {
  format: "problem_solving",
  content_domain: "algebra",
  fundamental_skill: "equal_unequal_alg",
  subtopic: "min_max_optimization",
};

const items = [
  // 1 — D3: opposition principle against a stated floor
  {
    ...S,
    context: "pure",
    difficulty: 3,
    stem_md:
      "The sum of five positive integers is $60$, and each of them is at least $4$. What is the greatest possible value of one of these integers?",
    choices: ["$12$", "$40$", "$44$", "$48$", "$56$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nTo push one value as high as possible, push every other value as low as it is allowed to go. The other four each sit at the floor of $4$, using $16$, so the target takes $60 - 16 = 44$.\n\n**Trigger cue**\n\n\"Greatest possible value of one member\" with a fixed total: extremize everyone else in the opposite direction.\n\n**Takeaway**\n\nTo maximize one, minimize all the others at their floor.",
    fastest_path_md: "$60 - 4 \\times 4 = 60 - 16 = 44$.",
    trap_map: {
      "0": "Reports the average, $\\frac{60}{5}$.",
      "1": "Reserves the floor for all five values, subtracting $20$.",
      "3": "Reserves the floor for only three of the other integers.",
      "4": "Uses $1$ as the floor for the others, ignoring the stated minimum of $4$.",
    },
    numeric_check: "60 - 16",
    check() {
      let best = -Infinity;
      for (let a = 4; a <= 60; a++)
        for (let b = 4; b <= 60; b++)
          for (let c = 4; c <= 60; c++)
            for (let d = 4; d <= 60; d++) {
              const e = 60 - a - b - c - d;
              if (e >= 4) best = Math.max(best, a, b, c, d, e);
            }
      return { kind: "value", value: best };
    },
  },

  // 2 — D3: a budget floors, it never rounds up
  {
    ...S,
    content_domain: "arithmetic",
    context: "real",
    difficulty: 3,
    stem_md:
      "A print shop charges a flat setup fee of $\\$45$ plus $\\$0.13$ for each page printed. What is the greatest number of whole pages that can be printed for a total cost of at most $\\$100$?",
    choices: ["$55$", "$423$", "$424$", "$769$", "$770$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nAfter the setup fee, $100 - 45 = 55$ dollars remain for pages, buying $\\frac{55}{0.13} = 423.07\\ldots$ pages. Pages are whole, and $424$ pages would cost $45 + 55.12 = 100.12 > 100$, so the answer is $423$.\n\n**Trigger cue**\n\n\"Greatest number within a budget\": solve the inequality, then floor — a budget can never be rounded up into.\n\n**Takeaway**\n\nA cap floors; a required minimum ceilings.",
    fastest_path_md:
      "$\\frac{55}{0.13} \\approx 423.1$; take the floor, $423$.",
    trap_map: {
      "0": "Reports the dollars left for pages rather than the page count.",
      "2": "Rounds the quotient up, breaking the budget by $12$ cents.",
      "3": "Ignores the setup fee, dividing the full $\\$100$ by $\\$0.13$.",
      "4": "Ignores the setup fee and rounds up as well.",
    },
    numeric_check: "423",
    check() {
      let best = 0;
      for (let pages = 0; pages <= 2000; pages++) {
        // Work in cents so the budget comparison is exact.
        if (4500 + 13 * pages <= 10000) best = pages;
      }
      return { kind: "value", value: best };
    },
  },

  // 3 — D3: distinctness caps how tightly you can pack
  {
    ...S,
    content_domain: "arithmetic",
    context: "pure",
    difficulty: 3,
    stem_md:
      "Five distinct positive integers have a median of $9$. What is the greatest possible value of the smallest of the five integers?",
    choices: ["$1$", "$5$", "$6$", "$7$", "$8$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe median is the third value, so exactly two integers lie below $9$. Being distinct integers below $9$, the largest they can be is $8$ and $7$. The smallest of the five is therefore at most $7$, achieved by $7, 8, 9, 10, 11$.\n\n**Trigger cue**\n\n\"Distinct integers\" plus a median: pack the values on the target's side consecutively against the tightest bound.\n\n**Takeaway**\n\nDistinct integers pack one apart, never on top of each other.",
    fastest_path_md:
      "Two values sit below $9$; packed tight they are $8$ and $7$, so the smallest is $7$.",
    trap_map: {
      "0": "Assumes the smallest must be $1$, as if only the median were constrained.",
      "1": "Leaves a gap below the median instead of packing tightly.",
      "2": "Packs from $6$, using one more value below the median than the median allows.",
      "4": "Uses $8$ for both values below the median, ignoring distinctness.",
    },
    numeric_check: "7",
    check() {
      let best = -Infinity;
      for (let a = 1; a <= 20; a++)
        for (let b = a + 1; b <= 20; b++)
          for (let d = 10; d <= 30; d++)
            for (let e = d + 1; e <= 31; e++) {
              const set = [a, b, 9, d, e];
              const sorted = [...set].sort((x, y) => x - y);
              if (new Set(set).size !== 5) continue;
              if (sorted[2] !== 9) continue;
              best = Math.max(best, sorted[0]);
            }
      return { kind: "value", value: best };
    },
  },

  // 4 — D3: fixed sum caps the product at the midpoint
  {
    ...S,
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $x$ and $y$ are positive numbers such that $x + y = 30$, what is the greatest possible value of $xy$?",
    choices: ["$15$", "$221$", "$225$", "$450$", "$900$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWith the sum fixed, the product is largest when the two numbers are equal: $x = y = 15$ gives $xy = 225$. Formally, $xy = x(30-x) = -(x-15)^{2} + 225$, a downward parabola peaking at $x = 15$.\n\n**Trigger cue**\n\n\"$x + y$ is fixed, maximize $xy$\": the cap is $\\left(\\frac{S}{2}\\right)^{2}$, hit at the midpoint.\n\n**Takeaway**\n\nA fixed sum makes the product peak when the parts are equal.",
    fastest_path_md: "$\\left(\\frac{30}{2}\\right)^{2} = 225$.",
    trap_map: {
      "0": "Reports the value of $x$ at the maximum rather than the product.",
      "1": "Assumes the numbers must be distinct integers, settling for $13 \\times 17$.",
      "3": "Multiplies the sum by the midpoint, $30 \\times 15$.",
      "4": "Squares the sum instead of the half-sum.",
    },
    numeric_check: "15*15",
    check() {
      let best = -Infinity;
      for (let hundredths = 1; hundredths < 3000; hundredths++) {
        const x = hundredths / 100;
        best = Math.max(best, x * (30 - x));
      }
      return { kind: "value", value: Math.round(best * 1e6) / 1e6 };
    },
  },

  // 5 — D3: check all four corners of a product
  {
    ...S,
    context: "pure",
    difficulty: 3,
    stem_md:
      "If $3 \\le a \\le 8$ and $-5 \\le b \\le 2$, what is the least possible value of $ab$?",
    choices: ["$-40$", "$-16$", "$-15$", "$6$", "$16$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nThe extreme of a product over two intervals occurs at a corner. The four corners are $3(-5) = -15$, $3(2) = 6$, $8(-5) = -40$, and $8(2) = 16$. The least is $-40$.\n\n**Trigger cue**\n\nRanges for two variables and an extreme of $ab$: evaluate all four corners — the biggest $|a|$ paired with the most negative $b$ usually wins.\n\n**Takeaway**\n\nFor a product's extreme, test every corner, not the obvious one.",
    fastest_path_md:
      "Most negative needs the largest $a$ against the most negative $b$: $8(-5) = -40$.",
    trap_map: {
      "1": "Misreads $b$'s lower bound as $-2$.",
      "2": "Pairs the smallest $a$ with the most negative $b$, $3(-5)$.",
      "3": "Reports the least *positive* corner, $3(2)$.",
      "4": "Reports the greatest corner rather than the least.",
    },
    numeric_check: "8*(-5)",
    check() {
      let best = Infinity;
      for (let ax = 300; ax <= 800; ax++)
        for (let bx = -500; bx <= 200; bx++) {
          best = Math.min(best, (ax / 100) * (bx / 100));
        }
      return { kind: "value", value: best };
    },
  },

  // 6 — D4: the hidden floor behind a ratio cap
  {
    ...S,
    context: "real",
    difficulty: 4,
    stem_md:
      "Four people share $\\$960$ so that each person receives a positive amount and no person receives more than three times what any other person receives. What is the greatest amount, in dollars, that any one of them can receive?",
    choices: ["$240$", "$320$", "$360$", "$480$", "$720$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nIf the largest share is $M$, the cap forces every other share to be at least $\\frac{M}{3}$. The three others therefore total at least $M$, so $960 \\ge M + M = 2M$ and $M \\le 480$. That bound is reachable: $480$ with three shares of $160$ each, and $480 = 3 \\times 160$ satisfies the cap exactly.\n\n**Trigger cue**\n\n\"No one may have more than $k$ times any other\": the real floor on the others is $\\frac{M}{k}$, not the smallest number you can imagine.\n\n**Takeaway**\n\nA ratio cap sets a floor on the others that scales with the maximum.",
    fastest_path_md:
      "Others are each $\\ge \\frac{M}{3}$, so $960 \\ge 2M$ and $M = 480$.",
    trap_map: {
      "0": "Splits the money evenly, ignoring that a maximum is being sought.",
      "1": "Uses a cap of $2$ rather than $3$, giving $960 \\ge \\frac{5M}{2}$.",
      "2": "Sets the other three to a fixed small share without checking the cap holds against $M$.",
      "4": "Drives the other three toward zero, ignoring the floor the cap imposes.",
    },
    numeric_check: "480",
    check() {
      let best = 0;
      // Search in whole dollars; the cap is checked against every share.
      for (let m = 1; m <= 960; m++) {
        for (let a = 1; a <= m; a++) {
          for (let b = a; b <= m; b++) {
            const c = 960 - m - a - b;
            if (c < b || c > m) continue;
            const shares = [m, a, b, c];
            const lo = Math.min(...shares);
            const hi = Math.max(...shares);
            if (hi <= 3 * lo) best = Math.max(best, hi);
          }
        }
      }
      return { kind: "value", value: best };
    },
  },

  // 7 — D4: distinctness sets the packing limit under an average
  {
    ...S,
    content_domain: "arithmetic",
    context: "pure",
    difficulty: 4,
    stem_md:
      "Five distinct positive integers have an average (arithmetic mean) of $20$, and the largest of them is $40$. What is the greatest possible value of the smallest of them?",
    choices: ["$12$", "$13$", "$14$", "$15$", "$20$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe five sum to $100$, so the four other than $40$ sum to $60$. To raise the smallest as high as possible, keep those four as close together as distinctness allows: $s, s+1, s+2$ and one more, needing $4s + 6 \\le 60$, so $s \\le 13.5$ and $s = 13$. It works: $13, 14, 15, 18, 40$ sums to $100$.\n\n**Trigger cue**\n\n\"Greatest possible value of the smallest\" with distinct integers: bunch the others as tightly as distinctness permits, then floor.\n\n**Takeaway**\n\nTo lift the minimum, crowd the rest together — one apart, no closer.",
    fastest_path_md:
      "Four values summing to $60$, distinct: $4s + 6 \\le 60 \\Rightarrow s = 13$.",
    trap_map: {
      "0": "Stops one short of the achievable packing.",
      "2": "Rounds $13.5$ up, which overshoots the available sum.",
      "3": "Divides $60$ by $4$ and ignores distinctness entirely.",
      "4": "Reports the average rather than the smallest value.",
    },
    numeric_check: "13",
    check() {
      let best = -Infinity;
      for (let a = 1; a <= 40; a++)
        for (let b = a + 1; b <= 40; b++)
          for (let c = b + 1; c <= 40; c++) {
            const d = 100 - 40 - a - b - c;
            if (d <= c || d >= 40) continue;
            const set = new Set([a, b, c, d, 40]);
            if (set.size !== 5) continue;
            best = Math.max(best, Math.min(a, b, c, d, 40));
          }
      return { kind: "value", value: best };
    },
  },

  // 8 — D4: maximize a count under a budget with a required minimum
  {
    ...S,
    content_domain: "arithmetic",
    context: "real",
    difficulty: 4,
    stem_md:
      "A caterer has $\\$500$ to spend on serving trays. A small tray costs $\\$18$ and a large tray costs $\\$31$. If she must buy at least $6$ large trays, what is the greatest total number of trays she can buy?",
    choices: ["$21$", "$22$", "$23$", "$24$", "$27$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLarge trays cost more per tray, so buy exactly the required $6$: that is $186$, leaving $314$. Small trays then number $\\left\\lfloor \\frac{314}{18} \\right\\rfloor = 17$, for $6 + 17 = 23$ trays. Any seventh large tray leaves $283$, buying only $15$ small, for $22$ — worse.\n\n**Trigger cue**\n\nA count to maximize with a required minimum of the expensive item: buy exactly the minimum of the expensive one, then floor the remainder.\n\n**Takeaway**\n\nMeet the requirement exactly, then spend the rest on the cheapest unit.",
    fastest_path_md:
      "$500 - 6(31) = 314$; $\\left\\lfloor \\frac{314}{18} \\right\\rfloor = 17$; total $23$.",
    trap_map: {
      "0": "Buys eight large trays, over-satisfying the requirement.",
      "1": "Buys seven large trays rather than the required six.",
      "3": "Rounds the small-tray count up, exceeding the budget.",
      "4": "Ignores the large-tray requirement and buys only small trays.",
    },
    numeric_check: "6 + 17",
    check() {
      let best = 0;
      for (let large = 6; large <= 20; large++) {
        for (let small = 0; small <= 40; small++) {
          if (31 * large + 18 * small <= 500) best = Math.max(best, large + small);
        }
      }
      return { kind: "value", value: best };
    },
  },

  // 9 — D4: a square changes which corner wins
  {
    ...S,
    context: "pure",
    difficulty: 4,
    stem_md:
      "If $-4 \\le x \\le 6$ and $2 \\le y \\le 9$, what is the greatest possible value of $x^{2} - y$?",
    choices: ["$4$", "$14$", "$27$", "$34$", "$38$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe two terms are independent: maximize $x^{2}$ and minimize $y$. Over $[-4, 6]$ the square is largest at $x = 6$, giving $36$ — larger than the $16$ at $x = -4$. The smallest $y$ is $2$. So the maximum is $36 - 2 = 34$.\n\n**Trigger cue**\n\nAn extreme of a difference over two ranges: take opposite extremes, but square first — a squared variable's extreme need not sit at the negative end.\n\n**Takeaway**\n\nSquare before choosing the corner; then take opposite extremes.",
    fastest_path_md: "$x^{2}$ peaks at $36$, $y$ bottoms at $2$: $34$.",
    trap_map: {
      "0": "Forgets to square, computing $6 - 2$.",
      "1": "Takes $x = -4$ without comparing its square to $6^{2}$.",
      "2": "Uses the largest $y$ instead of the smallest.",
      "4": "Adds the smallest $y$ instead of subtracting it.",
    },
    numeric_check: "36 - 2",
    check() {
      let best = -Infinity;
      for (let xi = -400; xi <= 600; xi++)
        for (let yi = 200; yi <= 900; yi += 5) {
          const x = xi / 100;
          const y = yi / 100;
          best = Math.max(best, x * x - y);
        }
      return { kind: "value", value: best };
    },
  },

  // 10 — D4: legality check on a median problem
  {
    ...S,
    content_domain: "arithmetic",
    context: "pure",
    difficulty: 4,
    stem_md:
      "Three distinct positive integers have a sum of $30$ and a median of $8$. What is the greatest possible value of the largest of the three?",
    choices: ["$10$", "$20$", "$21$", "$22$", "$29$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWith three values the median is the middle one, so the set is $\\{s, 8, L\\}$ with $s < 8 < L$. Maximizing $L$ means minimizing $s$, and the smallest positive integer below $8$ is $1$. Then $L = 30 - 8 - 1 = 21$, and $1 < 8 < 21$ is legal.\n\n**Trigger cue**\n\nA sum plus a median, maximize the top: drop the bottom to its legal floor and check the ordering survives.\n\n**Takeaway**\n\nAfter extremizing, verify order, distinctness, and positivity.",
    fastest_path_md: "$30 - 8 - 1 = 21$.",
    trap_map: {
      "0": "Reports the average of the three values.",
      "1": "Uses $s = 2$, leaving the floor unreached.",
      "3": "Uses $s = 0$, which is not a positive integer.",
      "4": "Forgets the median term, computing $30 - 1$.",
    },
    numeric_check: "30 - 8 - 1",
    check() {
      let best = -Infinity;
      for (let s = 1; s <= 30; s++)
        for (let L = 1; L <= 30; L++) {
          const set = [s, 8, L];
          if (new Set(set).size !== 3) continue;
          if (s + 8 + L !== 30) continue;
          const sorted = [...set].sort((a, b) => a - b);
          if (sorted[1] !== 8) continue;
          best = Math.max(best, sorted[2]);
        }
      return { kind: "value", value: best };
    },
  },

  // 11 — D5: three constraints at once, on both sides of a median
  {
    ...S,
    content_domain: "arithmetic",
    context: "pure",
    difficulty: 5,
    stem_md:
      "Seven distinct positive integers have a sum of $100$ and a median of $12$. What is the greatest possible value of the largest of the seven integers?",
    choices: ["$55$", "$57$", "$58$", "$61$", "$82$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nSorted, the fourth value is $12$. Three values sit strictly below it and three strictly above. Minimize everything except the target: the three below are $1, 2, 3$ (sum $6$), and of the three above, the two that are not the target must be at least $13$ and $14$ (sum $27$). So the largest is $100 - 6 - 12 - 27 = 55$, realized by $1, 2, 3, 12, 13, 14, 55$.\n\n**Trigger cue**\n\nA median with distinct integers on both sides: reserve the minimum legal sum on *both* sides before spending the remainder on the target.\n\n**Takeaway**\n\nEvery value on both sides of the median must be reserved first.",
    fastest_path_md:
      "Reserve $1+2+3 = 6$ below, $12$ at the median, $13+14 = 27$ above: $100 - 45 = 55$.",
    trap_map: {
      "1": "Lets a value above the median equal $12$, reserving $12 + 13$ instead of $13 + 14$.",
      "2": "Reuses $1$ for all three values below the median, ignoring distinctness.",
      "3": "Forgets to reserve anything below the median.",
      "4": "Reserves only the median, ignoring the two other above-median values.",
    },
    numeric_check: "100 - 6 - 12 - 27",
    check() {
      let best = -Infinity;
      for (let a = 1; a <= 11; a++)
        for (let b = a + 1; b <= 11; b++)
          for (let c = b + 1; c <= 11; c++)
            for (let d = 13; d <= 90; d++)
              for (let e = d + 1; e <= 91; e++) {
                const L = 100 - (a + b + c + 12 + d + e);
                if (L <= e) continue;
                best = Math.max(best, L);
              }
      return { kind: "value", value: best };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
