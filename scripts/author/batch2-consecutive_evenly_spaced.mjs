/**
 * Batch 2: 7 new consecutive_evenly_spaced questions (value_order_factors).
 * Run:    node --experimental-strip-types scripts/author/batch2-consecutive_evenly_spaced.mjs
 * Append: node --experimental-strip-types scripts/author/batch2-consecutive_evenly_spaced.mjs --append
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

// Shared DS helper: given scenario models each carrying {v, s1, s2},
// where v is the question's value and s1/s2 are booleans for whether the
// model satisfies each statement, derive the canonical DS answer index.
function dsIndex(models, minModels = 1) {
  const m1 = models.filter((m) => m.s1);
  const m2 = models.filter((m) => m.s2);
  const m12 = models.filter((m) => m.s1 && m.s2);
  if (m1.length < minModels) throw new Error(`only ${m1.length} models satisfy (1)`);
  if (m2.length < minModels) throw new Error(`only ${m2.length} models satisfy (2)`);
  if (m12.length < 1) throw new Error("statements are mutually inconsistent");
  const uniq = (arr) => new Set(arr.map((m) => JSON.stringify(m.v))).size === 1;
  const u1 = uniq(m1), u2 = uniq(m2), u12 = uniq(m12);
  if (u1 && u2) return 3;
  if (u1) return 0;
  if (u2) return 1;
  if (u12) return 2;
  return 4;
}

const items = [
  // ── 1. D5 PS pure — erased term, fractional mean ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 5,
    stem_md:
      "The integers from $1$ to $n$, inclusive, where $n > 1$, are written on a board. One of the integers is then erased, and the average (arithmetic mean) of the integers that remain is $35\\frac{7}{17}$. What integer was erased?",
    choices: ["$7$", "$8$", "$35$", "$68$", "$69$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe sum of $1$ through $n$ is $\\frac{n(n+1)}{2}$. After erasing one integer, the remaining $n - 1$ integers average $35\\frac{7}{17} = \\frac{602}{17}$, so $n - 1$ must be a multiple of $17$.\n\nBound $n$: erasing $n$ gives the smallest possible average, $\\frac{n}{2}$; erasing $1$ gives the largest, $\\frac{n+2}{2}$. So $\\frac{n}{2} \\le \\frac{602}{17} \\le \\frac{n+2}{2}$, which forces $68.8 \\le n \\le 70.8$, so $n = 69$ or $70$. Only $n = 69$ makes $n - 1$ a multiple of $17$.\n\nThen the erased integer is $\\frac{69 \\cdot 70}{2} - 68 \\cdot \\frac{602}{17} = 2415 - 4 \\cdot 602 = 2415 - 2408 = 7$.\n\n**Trigger cue**\nOne term removed from $1$ to $n$ and a mixed-number average: the fraction's denominator must divide the new count, and mean bounds pin $n$.\n\n**Takeaway**\nThe fractional part reveals the count; mean bounds pin $n$.",
    fastest_path_md:
      "The $\\frac{7}{17}$ forces $n - 1$ to be a multiple of $17$, and an average near $35.4$ forces about $70$ integers, so $n = 69$. Erased $= 2415 - 4 \\cdot 602 = 7$.",
    trap_map: {
      "1": "Computes $1 + 2 + \\dots + 69$ as $2{,}416$ — an off-by-one in the triangular sum — and erases $8$.",
      "2": "Rounds the remaining average down and assumes the erased integer must equal it.",
      "3": "Reports $68$, the number of integers remaining on the board, instead of the erased integer.",
      "4": "Reports $n = 69$, the largest integer originally written, instead of the erased integer.",
    },
    numeric_check: "7",
    check() {
      // brute force: try every n and every erased value x, exact rational test
      const solutions = [];
      for (let n = 2; n <= 400; n++) {
        const sum = (n * (n + 1)) / 2;
        for (let x = 1; x <= n; x++) {
          if (17 * (sum - x) === 602 * (n - 1)) solutions.push(x);
        }
      }
      if (solutions.length !== 1)
        throw new Error(`expected unique erased value, found ${solutions.length}`);
      return { kind: "value", value: solutions[0] };
    },
  },

  // ── 2. D5 PS pure — greatest is 3 times the least ────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 5,
    stem_md:
      "The least integer in a set of consecutive even integers is positive, and the greatest integer in the set is $3$ times the least. If the sum of the integers in the set is $220$, how many integers are in the set?",
    choices: ["$10$", "$11$", "$12$", "$20$", "$21$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet the least integer be $a$, an even positive integer; the greatest is $3a$. Stepping by $2$, the set has $\\frac{3a - a}{2} + 1 = a + 1$ integers, and its mean is $\\frac{a + 3a}{2} = 2a$. So the sum is\n$$2a(a + 1) = 220 \\quad\\Longrightarrow\\quad a(a + 1) = 110 = 10 \\cdot 11,$$\nso $a = 10$. The set is $10, 12, \\dots, 30$, and the count is $a + 1 = 11$.\n\n**Trigger cue**\nOne endpoint given as a multiple of the other: parametrize both ends with a single variable — the count and the mean then come along for free.\n\n**Takeaway**\nOne endpoint relation collapses count, mean, and sum to one variable.",
    fastest_path_md:
      "Backsolve: $11$ integers with sum $220$ average $20$, so the set is $10$ through $30$ — and $30$ is indeed $3 \\times 10$. The other counts fail this endpoint test.",
    trap_map: {
      "0": "Computes the count as $\\frac{30 - 10}{2} = 10$, forgetting to add $1$ for the first term.",
      "2": "Adds $1$ twice when counting from $10$ to $30$ in steps of $2$.",
      "3": "Reports the mean of the set, $20$, instead of the number of integers.",
      "4": "Counts every integer from $10$ to $30$, ignoring that the set contains only even integers.",
    },
    numeric_check: "11",
    check() {
      // brute force: try every positive even least value, build the set, test the sum
      const counts = new Set();
      for (let a = 2; a <= 2000; a += 2) {
        let sum = 0, count = 0;
        for (let t = a; t <= 3 * a; t += 2) { sum += t; count++; }
        if (sum === 220) counts.add(count);
      }
      if (counts.size !== 1) throw new Error(`expected unique set, found ${counts.size}`);
      return { kind: "value", value: [...counts][0] };
    },
  },

  // ── 3. D4 DS pure — consecutive multiples of unknown k ───────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md:
      "Set $S$ consists of $7$ consecutive multiples of the positive integer $k$. What is the median of $S$?\n\n(1) The least integer in $S$ is $12$.\n\n(2) $k = 4$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWrite the multiples as $mk, (m+1)k, \\dots, (m+6)k$; the median is the fourth term, $mk + 3k$.\n\nStatement (1): $mk = 12$, so the median is $12 + 3k$ — but $k$ can be any divisor of $12$. With $k = 1$ the median is $15$; with $k = 12$ it is $48$. Not sufficient.\n\nStatement (2): $k = 4$ makes the median $4m + 12$ with the start $m$ unrestricted: the set $4, 8, \\dots, 28$ has median $16$, while $12, 16, \\dots, 36$ has median $24$. Not sufficient.\n\nTogether: $k = 4$ and $mk = 12$ force $m = 3$, so $S = \\{12, 16, 20, 24, 28, 32, 36\\}$ and the median is $24$. Sufficient.\n\n**Trigger cue**\nConsecutive multiples of an unknown positive integer: an endpoint value fixes the set only after the spacing is known — and the spacing alone leaves the start free.\n\n**Takeaway**\nEndpoint plus spacing fixes consecutive multiples; either alone does not.",
    fastest_path_md:
      "Kill (1) with two divisors of $12$: $k = 1$ gives median $15$, $k = 12$ gives $48$. Kill (2) by sliding the start. Together the set is forced to $12, 16, \\dots, 36$.",
    trap_map: {
      "0": "Assumes the least value $12$ pins the whole set, overlooking that $k$ could be any divisor of $12$.",
      "1": "Thinks the spacing $k = 4$ alone locates the set, though its starting multiple is still free.",
      "3": "Credits each statement alone, missing both the divisor ambiguity in (1) and the free start in (2).",
      "4": "Misses that spacing $4$ combined with least value $12$ forces the single set $12, 16, \\dots, 36$.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let k = 1; k <= 40; k++) {
        for (let m = -40; m <= 40; m++) {
          const terms = Array.from({ length: 7 }, (_, j) => (m + j) * k);
          models.push({ v: terms[3], s1: terms[0] === 12, s2: k === 4 });
        }
      }
      return { kind: "index", index: dsIndex(models, 2) };
    },
  },

  // ── 4. D4 PS real — two cycles, LCM coincidences ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md:
      "At a convention center, shuttles on route A depart every $6$ minutes and shuttles on route B depart every $8$ minutes. A shuttle on each route departs at exactly 8:00 a.m. From 8:00 a.m. to 10:00 a.m., inclusive, how many times do shuttles on the two routes depart at the same time?",
    choices: ["$4$", "$5$", "$6$", "$16$", "$21$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nMeasure time in minutes after 8:00 a.m. Route A departs at multiples of $6$ and route B at multiples of $8$, so joint departures occur at common multiples of $6$ and $8$ — that is, at multiples of $\\text{lcm}(6, 8) = 24$. These coincidences are themselves evenly spaced. From $t = 0$ to $t = 120$ inclusive they are $0, 24, 48, 72, 96, 120$:\n$$\\frac{120}{24} + 1 = 6 \\text{ times}.$$\n\n**Trigger cue**\nTwo repeating cycles that start together: the coincidences form an evenly spaced list with spacing equal to the LCM — then count with intervals-plus-one.\n\n**Takeaway**\nCoincidences repeat every LCM; inclusive count is span over LCM plus one.",
    fastest_path_md:
      "With only a $2$-hour window, just list: 8:00, 8:24, 8:48, 9:12, 9:36, 10:00 — six times. Listing beats formulas when the LCM is large relative to the window.",
    trap_map: {
      "0": "Divides $120$ by $24$ and then excludes both the 8:00 and 10:00 coincidences.",
      "1": "Computes $120/24 = 5$ but forgets to count the 8:00 a.m. joint departure itself.",
      "3": "Counts route B's departures, $120/8 + 1 = 16$, instead of the joint departures.",
      "4": "Counts route A's departures, $120/6 + 1 = 21$, instead of the joint departures.",
    },
    numeric_check: "6",
    check() {
      // brute force: scan every minute of the window
      let count = 0;
      for (let t = 0; t <= 120; t++) if (t % 6 === 0 && t % 8 === 0) count++;
      return { kind: "value", value: count };
    },
  },

  // ── 5. D3 PS real — inverse AP sum: solve for the count ──────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 3,
    stem_md:
      "In the first week of a savings plan, Leah deposits \\$5, and in each week after the first she deposits \\$4 more than she deposited the week before. If Leah's deposits total exactly \\$152, for how many weeks does she make deposits?",
    choices: ["$7$", "$8$", "$9$", "$19$", "$33$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe deposits $5, 9, 13, \\dots$ are evenly spaced with step $4$. After $n$ weeks the last deposit is $5 + 4(n-1)$, so the total is\n$$n \\cdot \\frac{5 + [5 + 4(n-1)]}{2} = \\frac{n(4n + 6)}{2} = n(2n + 3) = 152.$$\nThen $2n^2 + 3n - 152 = 0$, which factors as $(n - 8)(2n + 19) = 0$, so $n = 8$.\n\n**Trigger cue**\nA constant weekly increase with a known total: total $=$ weeks $\\times$ average of the first and last deposits — then solve or backsolve for the count.\n\n**Takeaway**\nEvenly spaced sum equals count times average of the endpoints.",
    fastest_path_md:
      "Backsolve from the middle: $8$ weeks makes the last deposit $5 + 28 = 33$, so the total is $8 \\cdot \\frac{5 + 33}{2} = 8 \\cdot 19 = 152$. Match.",
    trap_map: {
      "0": "Counts only the weeks after the first, dropping week $1$ from the count.",
      "2": "Adds one extra week after the running total has already reached \\$152.",
      "3": "Reports the average weekly deposit, $152/8 = 19$, instead of the number of weeks.",
      "4": "Solves for the size of the final deposit, $5 + 4 \\cdot 7 = 33$, instead of the number of weeks.",
    },
    numeric_check: "8",
    check() {
      // simulate the deposits week by week
      let total = 0, deposit = 5, weeks = 0;
      while (total < 152) {
        total += deposit;
        deposit += 4;
        weeks++;
      }
      if (total !== 152) throw new Error("deposits never total exactly 152");
      return { kind: "value", value: weeks };
    },
  },

  // ── 6. D3 PS pure — sum of the multiples in a range ──────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 3,
    stem_md:
      "What is the sum of all the multiples of $7$ between $50$ and $150$?",
    choices: ["$1{,}274$", "$1{,}400$", "$1{,}421$", "$1{,}470$", "$1{,}575$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe multiples of $7$ between $50$ and $150$ run from $56$ to $147$. They form an evenly spaced list, so\n\ncount $= \\frac{147 - 56}{7} + 1 = 14$, mean $= \\frac{56 + 147}{2} = 101.5$, and\n$$\\text{sum} = 14 \\times 101.5 = 1{,}421.$$\n\n**Trigger cue**\nSum of the multiples of $m$ in a range: snap both endpoints to actual multiples first, then use count $\\times$ average of the endpoints.\n\n**Takeaway**\nSum equals count times the average of first and last.",
    fastest_path_md:
      "Factor out the $7$: the multiples are $7 \\times 8$ through $7 \\times 21$, so the sum is $7(8 + 9 + \\dots + 21) = 7 \\cdot \\frac{14 \\cdot 29}{2} = 7 \\cdot 203 = 1{,}421$.",
    trap_map: {
      "0": "Computes $\\frac{147 - 56}{7} = 13$ terms instead of $14$, summing only $56$ through $140$.",
      "1": "Multiplies the count $14$ by $100$, the midpoint of $50$ and $150$, instead of the actual mean $101.5$.",
      "3": "Anchors the run at $49$, the multiple of $7$ just below $50$, adding an extra low term.",
      "4": "Extends the run to $154$, past the upper bound of $150$.",
    },
    numeric_check: "1421",
    check() {
      // brute force: test every integer strictly between the bounds
      let sum = 0;
      for (let n = 51; n <= 149; n++) if (n % 7 === 0) sum += n;
      return { kind: "value", value: sum };
    },
  },

  // ── 7. D4 DS pure — evenly spaced triple, quadratic root pruning ─────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md:
      "$x$, $y$, and $z$ are consecutive multiples of $5$ such that $x < y < z$. What is the value of $x$?\n\n(1) $x + z = 70$\n\n(2) $yz = 1400$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nConsecutive multiples of $5$ are evenly spaced: $y = x + 5$ and $z = x + 10$, so $x + z = 2y$.\n\nStatement (1): $2y = 70$ gives $y = 35$, so $x = 30$. Sufficient.\n\nStatement (2): $yz = y(y + 5) = 1400$ gives $y^2 + 5y - 1400 = 0$, which factors as $(y - 35)(y + 40) = 0$. Both roots survive: $y = 35$ gives the triple $30, 35, 40$, and $y = -40$ gives $-45, -40, -35$ — both are consecutive multiples of $5$, so $x$ could be $30$ or $-45$. Not sufficient.\n\nStatement (1) alone is sufficient.\n\n**Trigger cue**\nAn evenly spaced triple with a sum of the outer terms: the ends average to the middle. Any quadratic from a product demands a second-root check before calling it sufficient.\n\n**Takeaway**\nIn evenly spaced triples the ends sum to twice the middle.",
    fastest_path_md:
      "Evenly spaced means $x + z = 2y$, so (1) instantly gives $y = 35$, $x = 30$. For (2), test the negative mirror: $(-40)(-35) = 1400$ also works, so two triples survive.",
    trap_map: {
      "1": "Solves the quadratic in (2) but keeps only the positive root, missing $y = -40$.",
      "2": "Reaches for both statements to resolve the quadratic, overlooking that (1) alone pins $y = 35$.",
      "3": "Treats (2) as sufficient by discarding the negative triple $-45, -40, -35$ without justification.",
      "4": "Misses that $x + z = 2y$ for an evenly spaced triple, so (1) fixes $y$ and hence $x$.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let y = -2000; y <= 2000; y += 5) {
        const x = y - 5, z = y + 5;
        models.push({ v: x, s1: x + z === 70, s2: y * z === 1400 });
      }
      return { kind: "index", index: dsIndex(models, 1) };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
