/**
 * Batch: 7 new linear_systems items (equal_unequal_alg / algebra).
 * Cells: D3 PS real, D4 PS pure, D4 DS real, D5 PS pure, D5 PS pure,
 *        D3 PS real, D4 PS real.
 * Run from repo root: node scripts/author/batch-linear_systems.mjs
 * Append with: APPEND=1 node scripts/author/batch-linear_systems.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ────────────────────────────────────────────────────────── 1. D3 PS real
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 3,
    stem_md:
      "A vending machine is stocked with only bottles of juice and bottles of water — $60$ bottles in all. Each bottle of juice sells for $\\$2.25$ and each bottle of water sells for $\\$1.50$. If selling the entire stock would bring in exactly $\\$105.00$, how many bottles of juice are in the machine?",
    choices: ["15", "20", "28", "30", "40"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $j$ and $w$ count juice and water bottles: $j + w = 60$ and $2.25j + 1.50w = 105$. Multiply the first equation by $1.50$: $1.50j + 1.50w = 90$. Subtract from the revenue equation: $0.75j = 15$, so $j = 20$ (and $w = 40$ checks: $45 + 60 = 105$).\n\n**Trigger cue**\nA total count paired with a total value at two unit prices: price the all-cheap baseline, then let the price gap absorb the surplus.\n\n**Takeaway**\nPrice the all-cheap baseline; the surplus counts the expensive items.",
    fastest_path_md:
      "All water would bring $1.50 \\times 60 = \\$90$. Each swap to juice adds $\\$0.75$, so the extra $\\$15$ means $15/0.75 = 20$ juice bottles.",
    trap_map: {
      "0": "Reports the $\\$15$ revenue surplus over an all-water stock as the number of juice bottles.",
      "2": "Divides the $\\$105$ total by $\\$3.75$, the combined price of one juice and one water.",
      "3": "Assumes the $60$ bottles split evenly between juice and water.",
      "4": "Solves the system correctly but reports the number of water bottles.",
    },
    numeric_check: "15/0.75",
    check() {
      // brute force over all possible juice counts, in cents
      const hits = [];
      for (let j = 0; j <= 60; j++) {
        const w = 60 - j;
        if (225 * j + 150 * w === 10500) hits.push(j);
      }
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },

  // ────────────────────────────────────────────────────────── 2. D4 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 4,
    stem_md:
      "If $x + 4y = 18$ and $3x + 2y = 14$, what is the value of $2x + 3y$?",
    choices: ["6", "14", "16", "18", "32"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nFrom the first equation, $x = 18 - 4y$. Substitute into the second: $3(18 - 4y) + 2y = 14$, so $54 - 10y = 14$ and $y = 4$, giving $x = 2$. Then $2x + 3y = 4 + 12 = 16$.\n\n**Trigger cue**\nWhen a question asks for a combination of $x$ and $y$ rather than either variable, test whether adding or subtracting the given equations produces the target coefficients directly.\n\n**Takeaway**\nTarget combinations often come straight from adding or subtracting the equations.",
    fastest_path_md:
      "Add the equations: $4x + 6y = 32$. Halve it: $2x + 3y = 16$ — no need to find $x$ or $y$.",
    trap_map: {
      "0": "Solves the system but reports $x + y$ instead of $2x + 3y$.",
      "1": "Swaps the solved values, computing $2x + 3y$ with $x = 4$ and $y = 2$.",
      "3": "Reads off the right side of the first equation as the target value.",
      "4": "Adds the two equations but forgets to divide the result by $2$.",
    },
    numeric_check: "2*2+3*4",
    check() {
      // exhaustive integer search for the solution of the system
      const hits = [];
      for (let x = -100; x <= 100; x++) {
        for (let y = -100; y <= 100; y++) {
          if (x + 4 * y === 18 && 3 * x + 2 * y === 14) hits.push([x, y]);
        }
      }
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits.length}`);
      const [x, y] = hits[0];
      return { kind: "value", value: 2 * x + 3 * y };
    },
  },

  // ────────────────────────────────────────────────────────── 3. D4 DS real
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 4,
    stem_md:
      "A shipping crate contains only $3$-kilogram boxes and $8$-kilogram boxes, with at least one box of each kind. How many $8$-kilogram boxes does the crate contain?\n\n(1) The boxes in the crate weigh $69$ kilograms in total.\n\n(2) The crate contains exactly $13$ boxes.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $s$ and $e$ count the $3$-kg and $8$-kg boxes, with $s \\ge 1$, $e \\ge 1$ integers. (1): $3s + 8e = 69$ admits $(s, e) = (15, 3)$ and $(7, 6)$, so $e$ is not pinned down — insufficient. (2): $s + e = 13$ allows $e$ from $1$ to $12$ — insufficient. Together: $3(13 - e) + 8e = 69$ gives $5e = 30$, so $e = 6$ uniquely — sufficient. Both statements together, neither alone.\n\n**Trigger cue**\nOne equation with two positive-integer unknowns: list its integer solutions before judging — the integer constraint sometimes rescues a lone equation and sometimes does not.\n\n**Takeaway**\nCheck integer solutions explicitly; the constraint does not always force uniqueness.",
    fastest_path_md:
      "(1): $3s + 8e = 69$ needs $e \\equiv 0 \\pmod 3$, so $(15, 3)$ and $(7, 6)$ both work — not sufficient. (2): a bare count — not sufficient. Together the linear system solves to $e = 6$.",
    trap_map: {
      "0": "Assumes the integer constraint pins down statement (1), missing that both $(15, 3)$ and $(7, 6)$ satisfy it.",
      "1": "Treats the box count alone as determining the split between the two weights.",
      "3": "Grants each statement sufficiency after finding one convenient combination for each.",
      "4": "Dismisses the combined statements because statement (1) alone had multiple solutions.",
    },
    numeric_check: null,
    check() {
      // enumerate all (s, e) with s,e >= 1 over a generous range
      const all = [];
      for (let s = 1; s <= 200; s++)
        for (let e = 1; e <= 200; e++) all.push([s, e]);
      const s1 = all.filter(([s, e]) => 3 * s + 8 * e === 69);
      const s2 = all.filter(([s, e]) => s + e === 13);
      const both = all.filter(
        ([s, e]) => 3 * s + 8 * e === 69 && s + e === 13,
      );
      if (s1.length < 2) throw new Error(`too few models for (1): ${s1.length}`);
      if (s2.length < 3) throw new Error(`too few models for (2): ${s2.length}`);
      if (both.length < 1) throw new Error("statements are inconsistent");
      const suff = (models) =>
        models.length > 0 && new Set(models.map(([, e]) => e)).size === 1;
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

  // ────────────────────────────────────────────────────────── 4. D5 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 5,
    stem_md:
      "If $2x + 3y + 4z = 20$ and $3x + 5y + 7z = 31$, what is the value of $x + y + z$?",
    choices: ["-9", "9", "11", "20", "51"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nSeek constants $p$ and $q$ with $p(2x + 3y + 4z) + q(3x + 5y + 7z) = x + y + z$. Matching the $x$ and $y$ coefficients: $2p + 3q = 1$ and $3p + 5q = 1$, which give $p = 2$, $q = -1$; the $z$ coefficient confirms: $4(2) + 7(-1) = 1$. Therefore $x + y + z = 2(20) - 31 = 9$.\n\n**Trigger cue**\nTwo equations, three unknowns, and a specific combination requested: match coefficients of a linear combination instead of solving for the variables.\n\n**Takeaway**\nAn underdetermined system can still determine the requested combination.",
    fastest_path_md:
      "Twice the first equation minus the second: $(4-3)x + (6-5)y + (8-7)z = 40 - 31 = 9$.",
    trap_map: {
      "0": "Forms the right combination with reversed signs, computing $31 - 2 \\cdot 20$.",
      "2": "Subtracts the equations and mistakes $x + 2y + 3z = 11$ for the target sum.",
      "3": "Assumes the first equation's total already equals $x + y + z$.",
      "4": "Adds the two equations and reports the combined total.",
    },
    numeric_check: "2*20-31",
    check() {
      // For each z, the remaining 2x2 system (det = 2*5 - 3*3 = 1) has a
      // unique (x, y); Cramer's rule. Verify x + y + z is the same constant
      // across many particular solutions.
      const sums = new Set();
      let value = null;
      for (let z = -12; z <= 12; z++) {
        const r1 = 20 - 4 * z;
        const r2 = 31 - 7 * z;
        const x = (r1 * 5 - r2 * 3) / (2 * 5 - 3 * 3);
        const y = (2 * r2 - 3 * r1) / (2 * 5 - 3 * 3);
        // sanity: the pair really satisfies both original equations
        if (Math.abs(2 * x + 3 * y + 4 * z - 20) > 1e-9) throw new Error("eq1 violated");
        if (Math.abs(3 * x + 5 * y + 7 * z - 31) > 1e-9) throw new Error("eq2 violated");
        const s = x + y + z;
        sums.add(Math.round(s * 1e9) / 1e9);
        value = s;
      }
      if (sums.size !== 1) throw new Error(`x+y+z not constant: ${[...sums]}`);
      return { kind: "value", value };
    },
  },

  // ────────────────────────────────────────────────────────── 5. D5 PS pure
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 5,
    stem_md:
      "If $x - y = y - z = 5$ and $x + y + z = 21$, what is the value of $xz$?",
    choices: ["14", "24", "49", "84", "144"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe chained equality splits into $x - y = 5$ and $y - z = 5$, so $x = y + 5$ and $z = y - 5$. Substituting into the sum: $(y + 5) + y + (y - 5) = 21$, so $3y = 21$ and $y = 7$. Then $x = 12$, $z = 2$, and $xz = 24$.\n\n**Trigger cue**\nA chained equality such as $a - b = b - c$: the three values are equally spaced, so express the outer two around the middle one.\n\n**Takeaway**\nEqual chained differences make the middle variable the average.",
    fastest_path_md:
      "Equal gaps of $5$ mean $x$, $y$, $z$ are evenly spaced, so $y$ is their average: $21/3 = 7$. Then $x = 12$, $z = 2$, and $xz = 24$.",
    trap_map: {
      "0": "Computes $yz = 7 \\cdot 2$ instead of $xz$.",
      "2": "Assumes all three variables equal $7$ and squares it.",
      "3": "Computes $xy = 12 \\cdot 7$ instead of $xz$.",
      "4": "Adds $5$ on both sides of $y$, making $x = z = 12$.",
    },
    numeric_check: "12*2",
    check() {
      // exhaustive integer search over a generous cube
      const hits = [];
      for (let x = -40; x <= 40; x++)
        for (let y = -40; y <= 40; y++)
          for (let z = -40; z <= 40; z++)
            if (x - y === 5 && y - z === 5 && x + y + z === 21)
              hits.push([x, y, z]);
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits.length}`);
      const [x, , z] = hits[0];
      return { kind: "value", value: x * z };
    },
  },

  // ────────────────────────────────────────────────────────── 6. D3 PS real
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 3,
    stem_md:
      "Priya is now $3$ times as old as her brother Dev. In $10$ years, Priya will be exactly twice as old as Dev will be then. How old is Dev now?",
    choices: ["5", "10", "20", "30", "40"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $d$ be Dev's age and $p$ Priya's: $p = 3d$ now, and $p + 10 = 2(d + 10)$ in ten years. Substituting: $3d + 10 = 2d + 20$, so $d = 10$. Check: Priya is $30$; in ten years, $40 = 2 \\cdot 20$.\n\n**Trigger cue**\nAges compared at two points in time: write one equation per time point, and add the elapsed years to every person's age.\n\n**Takeaway**\nEveryone ages by the same amount; the ratio still changes.",
    fastest_path_md:
      "Backsolve from the middle: $d = 10$ makes Priya $30$; in $10$ years they are $40$ and $20$ — exactly double. Done.",
    trap_map: {
      "0": "Divides the $10$-year horizon by the future ratio $2$ instead of solving the system.",
      "2": "Reports Dev's age in $10$ years rather than his age now.",
      "3": "Reports Priya's current age instead of Dev's.",
      "4": "Reports Priya's age in $10$ years.",
    },
    numeric_check: "10",
    check() {
      // enumerate all integer age pairs satisfying both conditions
      const hits = [];
      for (let d = 1; d <= 300; d++) {
        for (let p = 1; p <= 900; p++) {
          if (p === 3 * d && p + 10 === 2 * (d + 10)) hits.push(d);
        }
      }
      if (hits.length !== 1) throw new Error(`expected unique solution, got ${hits}`);
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
      "A ride service charges a fixed booking fee plus a constant rate per mile. An $8$-mile ride costs $\\$19.50$, and a $14$-mile ride costs $\\$30.00$. At these rates, what is the cost of a $20$-mile ride?",
    choices: ["$\\$35.00$", "$\\$39.00$", "$\\$40.50$", "$\\$46.00$", "$\\$48.75$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWith booking fee $b$ and rate $r$ per mile: $b + 8r = 19.50$ and $b + 14r = 30.00$. Subtracting: $6r = 10.50$, so $r = 1.75$ and $b = 19.50 - 14.00 = 5.50$. A $20$-mile ride costs $5.50 + 20(1.75) = \\$40.50$.\n\n**Trigger cue**\nFixed fee plus constant rate with two data points: subtract the equations to isolate the rate — equal mileage steps add equal cost.\n\n**Takeaway**\nIn linear pricing, equal input increments add equal cost.",
    fastest_path_md:
      "Going from $8$ to $14$ miles added $\\$10.50$; $20$ miles is one more $6$-mile step, so the fare is $30.00 + 10.50 = \\$40.50$.",
    trap_map: {
      "0": "Drops the booking fee and charges only $20$ miles at $\\$1.75$ per mile.",
      "1": "Doubles the $\\$19.50$ fare as if a $20$-mile ride were two $8$-mile rides.",
      "3": "Counts the booking fee twice when extending the fare to $20$ miles.",
      "4": "Scales the $8$-mile fare proportionally to $20$ miles, ignoring the fixed fee.",
    },
    numeric_check: "5.5+1.75*20",
    check() {
      // brute force in cents: rate 0..2000 cents/mile, fee derived
      const hits = [];
      for (let r = 0; r <= 2000; r++) {
        const b = 1950 - 8 * r;
        if (b < 0) continue;
        if (b + 14 * r === 3000) hits.push([b, r]);
      }
      if (hits.length !== 1) throw new Error(`expected unique (fee, rate), got ${hits.length}`);
      const [b, r] = hits[0];
      return { kind: "value", value: (b + 20 * r) / 100 };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
