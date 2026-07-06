/**
 * Batch 2: series_patterns (counting_sets_series_prob_stats).
 * 13 items: 10 PS + 3 DS. Difficulty: D2 x2, D3 x4, D4 x4, D5 x3.
 * New angles vs. batch 1: inverse row count, term counting, backward
 * geometric, first-exceeds threshold, parity-restricted sum, S_n-to-term,
 * bounce distance, periodic-index DS, symmetric-pair DS, two-point DS,
 * reciprocal cycle product, nth non-square, cumulative race with tie.
 * Run: node --experimental-strip-types scripts/author/batch2-series_patterns.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D2 PS real — inverse question: how many rows, given first and last
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 2,
    stem_md:
      "A grocery display of cans has $20$ cans in its bottom row, and each row above contains $2$ fewer cans than the row directly below it. If the top row contains $4$ cans, how many rows are in the display?",
    choices: ["$8$", "$9$", "$10$", "$12$", "$16$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe row sizes fall from $20$ to $4$ in steps of $2$, so there are $\\frac{20 - 4}{2} = 8$ steps between the bottom row and the top row. Counting the bottom row itself adds one more: $8 + 1 = 9$ rows.\n\n**Trigger cue**\n\nFirst value, last value, constant step, \"how many\": divide the total drop by the step, then add $1$ for the starting term.\n\n**Takeaway**\n\nRows in an evenly stepped stack: difference over step, plus one.",
    fastest_path_md:
      "The row sizes are the even numbers $4$ through $20$, i.e. $2 \\cdot 2$ through $2 \\cdot 10$ — so $10 - 2 + 1 = 9$ rows.",
    trap_map: {
      "0": "Divides the $16$-can drop by the step but forgets to add $1$ for the bottom row.",
      "2": "Halves the bottom row's $20$ cans, ignoring where the stack actually stops.",
      "3": "Averages the bottom and top rows, $(20 + 4)/2$, instead of counting steps.",
      "4": "Computes the drop $20 - 4$ and never divides by the $2$-can step.",
    },
    numeric_check: "(20-4)/2+1",
    check() {
      let cans = 20;
      let rows = 1;
      while (cans > 4) {
        cans -= 2;
        rows++;
      }
      return { kind: "value", value: rows };
    },
  },

  // 2. D2 PS pure — count the terms of an arithmetic progression
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 2,
    stem_md:
      "In the sequence $52, 59, 66, \\ldots, 241$, each term after the first is $7$ more than the preceding term. How many terms are in the sequence?",
    choices: ["$26$", "$27$", "$28$", "$29$", "$34$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFrom $52$ to $241$ the sequence climbs $241 - 52 = 189$, which is $\\frac{189}{7} = 27$ steps of size $7$. A list with $27$ gaps has $27 + 1 = 28$ terms.\n\n**Trigger cue**\n\n\"How many terms\" in an evenly spaced list with both endpoints given: count gaps first, then add one.\n\n**Takeaway**\n\nTerm count equals gap count plus one.",
    fastest_path_md:
      "Write terms as $52 + 7k$: the last term has $k = \\frac{189}{7} = 27$, and $k$ runs $0$ through $27$ — counting $k = 0$ gives $28$ values.",
    trap_map: {
      "0": "Subtracts $1$ from the $27$ gaps instead of adding $1$.",
      "1": "Counts the $27$ gaps between terms but never adds the first term.",
      "3": "Adds $1$ for each endpoint on top of the $27$ gaps.",
      "4": "Divides the last term $241$ by $7$, ignoring that the list starts at $52$.",
    },
    numeric_check: "(241-52)/7+1",
    check() {
      let count = 0;
      for (let t = 52; t <= 241; t += 7) count++;
      return { kind: "value", value: count };
    },
  },

  // 3. D3 PS real — geometric sequence run backward
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 3,
    stem_md:
      "The number of bacteria in a laboratory culture triples every hour. If the culture contained $54{,}000$ bacteria at 4:00 p.m., how many bacteria did it contain at 1:00 p.m. that same day?",
    choices: ["$2{,}000$", "$6{,}000$", "$18{,}000$", "$162{,}000$", "$1{,}458{,}000$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nFrom 1:00 p.m. to 4:00 p.m. is $3$ hours, so the count at 4:00 p.m. is the 1:00 p.m. count multiplied by $3^3 = 27$. Working backward, the 1:00 p.m. count is $\\frac{54{,}000}{27} = 2{,}000$.\n\n**Trigger cue**\n\nA fixed multiplier per period with a later value given and an earlier one asked: count the periods, then divide once per period.\n\n**Takeaway**\n\nReverse geometric growth by dividing once per elapsed period.",
    fastest_path_md:
      "Backsolve: $2{,}000 \\times 3 = 6{,}000 \\to 18{,}000 \\to 54{,}000$ after exactly three hours — done.",
    trap_map: {
      "1": "Divides by $3$ only twice, stopping at the 2:00 p.m. count.",
      "2": "Divides by $3$ once, finding the 3:00 p.m. count.",
      "3": "Multiplies by $3$, moving forward to 5:00 p.m. instead of backward.",
      "4": "Multiplies by $27$, running the three hours of tripling in the wrong direction.",
    },
    numeric_check: "54000/27",
    check() {
      // scan starting populations and grow each forward 3 hours
      for (let p0 = 1; p0 <= 100000; p0++) {
        let p = p0;
        for (let h = 0; h < 3; h++) p *= 3;
        if (p === 54000) return { kind: "value", value: p0 };
      }
      throw new Error("no starting population found");
    },
  },

  // 4. D3 PS real — first term of an arithmetic sequence to exceed a threshold
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 3,
    stem_md:
      "On the first day of a training program, Marcus does $15$ push-ups. On each day after the first, he does $6$ more push-ups than he did the day before. On which day of the program will Marcus first do more than $100$ push-ups?",
    choices: ["$14$", "$15$", "$16$", "$17$", "$19$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nOn day $n$ Marcus does $15 + 6(n-1)$ push-ups. Solve $15 + 6(n-1) > 100$: $6(n-1) > 85$, so $n - 1 > 14.1\\overline{6}$, giving $n \\ge 16$. Check: day $15$ gives $15 + 84 = 99$ (not enough); day $16$ gives $105$.\n\n**Trigger cue**\n\n\"On which day does it first exceed\": solve the term inequality, round up, and verify the day before falls short.\n\n**Takeaway**\n\nSolve the term inequality, then round up to the next whole day.",
    fastest_path_md:
      "Day $15$ gives $15 + 6 \\cdot 14 = 99$ — one push-up short — so day $16$ is the first past $100$.",
    trap_map: {
      "0": "Rounds $\\frac{85}{6} \\approx 14.2$ down and reports it as the day.",
      "1": "Models day $n$ as $15 + 6n$, an off-by-one that lands on day $15$, where he does only $99$.",
      "3": "Divides $100$ by $6$ and rounds up, ignoring the $15$ push-up start.",
      "4": "Adds the first-day $15$ to $100$ before dividing: $\\frac{115}{6} \\approx 19$.",
    },
    numeric_check: "ceil((100-15)/6)+1",
    check() {
      let count = 15;
      for (let day = 1; day <= 1000; day++) {
        if (count > 100) return { kind: "value", value: day };
        count += 6;
      }
      throw new Error("threshold never exceeded");
    },
  },

  // 5. D3 PS pure — sum of the odd integers in an offset range
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 3,
    stem_md:
      "What is the sum of all the odd integers from $25$ to $75$, inclusive?",
    choices: ["$650$", "$1{,}250$", "$1{,}300$", "$1{,}350$", "$2{,}550$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe odd integers $25, 27, \\ldots, 75$ are evenly spaced with step $2$, so there are $\\frac{75 - 25}{2} + 1 = 26$ of them, with average $\\frac{25 + 75}{2} = 50$. The sum is $26 \\cdot 50 = 1{,}300$.\n\n**Trigger cue**\n\nSumming an evenly spaced list: multiply the average of the endpoints by the exact term count — and count terms with the $+1$.\n\n**Takeaway**\n\nEvenly spaced sum: endpoint average times exact term count.",
    fastest_path_md:
      "Pair from the outside in: $25 + 75$, $27 + 73$, and so on — $13$ pairs of $100$, so $1{,}300$.",
    trap_map: {
      "0": "Halves the term count as well as the endpoint sum, computing $50 \\cdot 13$.",
      "1": "Uses $\\frac{75 - 25}{2} = 25$ terms, forgetting to add $1$ for the first term.",
      "3": "Counts $27$ terms by adding an extra term to the list.",
      "4": "Sums every integer from $25$ to $75$, not just the odd ones.",
    },
    numeric_check: "(25+75)/2*26",
    check() {
      let sum = 0;
      for (let k = 25; k <= 75; k++) if (k % 2 === 1) sum += k;
      return { kind: "value", value: sum };
    },
  },

  // 6. D4 PS pure — extract a single term from a partial-sum formula
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 4,
    stem_md:
      "For every positive integer $n$, the sum of the first $n$ terms of a certain sequence equals $n^2 + 2n$. What is the $12$th term of the sequence?",
    choices: ["$23$", "$25$", "$27$", "$143$", "$168$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLet $S_n = n^2 + 2n$. The $12$th term is the difference of consecutive partial sums: $a_{12} = S_{12} - S_{11} = (144 + 24) - (121 + 22) = 168 - 143 = 25$.\n\n**Trigger cue**\n\nA formula for \"the sum of the first $n$ terms\" with a single term asked: subtract adjacent partial sums instead of hunting for the sequence rule.\n\n**Takeaway**\n\nA term equals the difference of consecutive partial sums.",
    fastest_path_md:
      "Compute small sums: $S_1 = 3$, $S_2 = 8$, $S_3 = 15$, so the terms are $3, 5, 7, \\ldots$ — the odd numbers $2n + 1$ — and the $12$th is $2 \\cdot 12 + 1 = 25$.",
    trap_map: {
      "0": "Computes $S_{11} - S_{10}$, which is the $11$th term.",
      "2": "Computes $S_{13} - S_{12}$, which is the $13$th term.",
      "3": "Reports $S_{11}$, the sum of the first $11$ terms.",
      "4": "Reports $S_{12}$ itself instead of the $12$th term alone.",
    },
    numeric_check: "(12^2+2*12)-(11^2+2*11)",
    check() {
      // rebuild every term from the sum definition, one at a time
      let running = 0;
      let term = 0;
      for (let n = 1; n <= 12; n++) {
        const s = n * n + 2 * n;
        term = s - running;
        running = s;
      }
      return { kind: "value", value: term };
    },
  },

  // 7. D4 PS real — total distance of a bouncing ball (each height counted twice except the first)
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 4,
    stem_md:
      "A ball is dropped from a height of $128$ feet. Each time it hits the ground, it rebounds to a height equal to half the height from which it just fell. What is the total distance, in feet, that the ball has traveled at the moment it hits the ground for the $5$th time?",
    choices: ["$240$", "$248$", "$368$", "$372$", "$496$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe ball falls $128$, then for each of the next four hits it rises and falls the same rebound height: $64, 32, 16, 8$. Total distance $= 128 + 2(64 + 32 + 16 + 8) = 128 + 2 \\cdot 120 = 368$ feet.\n\n**Trigger cue**\n\nA bouncing or back-and-forth process asked for total distance: every height after the initial drop is traversed twice — once up, once down.\n\n**Takeaway**\n\nAfter the first drop, every bounce height is traveled twice.",
    fastest_path_md:
      "Double everything, then remove the phantom first ascent: $2(128 + 64 + 32 + 16 + 8) - 128 = 496 - 128 = 368$.",
    trap_map: {
      "0": "Doubles the rebound heights but omits the initial $128$-foot drop.",
      "1": "Adds each height once, ignoring that every rebound is traveled up and then down.",
      "3": "Adds a $4$-foot rebound after the fifth hit, when the clock has already stopped.",
      "4": "Doubles every leg, including the initial drop, which is traveled only once.",
    },
    numeric_check: "128+2*(64+32+16+8)",
    check() {
      // simulate the flight leg by leg
      let h = 128;
      let dist = 0;
      for (let hit = 1; hit <= 5; hit++) {
        dist += h; // fall to the ground
        if (hit < 5) {
          h = h / 2; // rebound
          dist += h; // travel back up
        }
      }
      return { kind: "value", value: dist };
    },
  },

  // 8. D3 DS pure — periodic sequence: which given index is congruent to the target?
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 3,
    stem_md:
      "In an infinite sequence, $a_{n+4} = a_n$ for every positive integer $n$. What is the value of $a_{102}$?\n\n(1) $a_6 = 11$\n\n(2) $a_{40} = 7$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nThe sequence repeats every $4$ terms, so $a_m = a_k$ exactly when $m - k$ is a multiple of $4$.\n\nStatement (1): $102 - 6 = 96 = 4 \\cdot 24$, so $a_{102} = a_6 = 11$. Sufficient.\n\nStatement (2): $102 - 40 = 62$, which is not a multiple of $4$; $a_{40}$ fixes the position-$4$ value while $a_{102}$ sits at position $2$ of the cycle, which remains free. Not sufficient.\n\nStatement (1) alone is sufficient; statement (2) alone is not.\n\n**Trigger cue**\n\nA recurrence $a_{n+k} = a_n$ with a far-off term asked: check whether each given index differs from the target by a multiple of the period.\n\n**Takeaway**\n\nPeriodic sequences link only indices differing by a period multiple.",
    fastest_path_md:
      "Reduce indices mod $4$: the target $102 \\equiv 2$, statement (1)'s index $6 \\equiv 2$ (match), statement (2)'s index $40 \\equiv 0$ (no match). Answer without computing anything else.",
    trap_map: {
      "1": "Trusts statement (2) because $40$ and $102$ are both even, but $62$ is not a multiple of $4$.",
      "2": "Combines both statements needlessly; $a_6$ alone already sits $96 = 4 \\cdot 24$ terms from $a_{102}$.",
      "3": "Credits statement (2) as also sufficient, though it pins a different position of the $4$-cycle.",
      "4": "Assumes no single term can reach index $102$, missing the period-$4$ link from $a_6$.",
    },
    numeric_check: null,
    check() {
      // enumerate all period-4 sequences over a value grid; test each statement
      const vals = [3, 7, 11];
      const tuples = [];
      for (const v1 of vals)
        for (const v2 of vals)
          for (const v3 of vals)
            for (const v4 of vals) tuples.push([v1, v2, v3, v4]);
      const build = (t) => {
        const seq = [null, t[0], t[1], t[2], t[3]];
        for (let n = 5; n <= 110; n++) seq[n] = seq[n - 4];
        return seq;
      };
      const target = (t) => build(t)[102];
      const s1 = tuples.filter((t) => build(t)[6] === 11);
      const s2 = tuples.filter((t) => build(t)[40] === 7);
      const both = tuples.filter((t) => build(t)[6] === 11 && build(t)[40] === 7);
      const suff = (set) =>
        set.length > 0 && new Set(set.map(target)).size === 1;
      const a1 = suff(s1);
      const a2 = suff(s2);
      const ac = suff(both);
      let index;
      if (a1 && a2) index = 3;
      else if (a1) index = 0;
      else if (a2) index = 1;
      else if (ac) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 9. D4 DS pure — symmetric pairs of an arithmetic sequence carry the whole sum
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 4,
    stem_md:
      "In a certain arithmetic sequence, the difference between any two consecutive terms is the same. If $S$ is the sum of the first $10$ terms of the sequence, what is the value of $S$?\n\n(1) The sum of the first term and the tenth term of the sequence is $14$.\n\n(2) The sum of the fifth term and the sixth term of the sequence is $14$.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFor an arithmetic sequence, $S = \\frac{10}{2}(a_1 + a_{10}) = 5(a_1 + a_{10})$.\n\nStatement (1): $a_1 + a_{10} = 14$, so $S = 5 \\cdot 14 = 70$. Sufficient.\n\nStatement (2): symmetric pairs share the same sum — $a_5 + a_6 = (a_1 + 4d) + (a_1 + 5d) = 2a_1 + 9d = a_1 + a_{10}$. So $a_1 + a_{10} = 14$ again and $S = 70$. Sufficient.\n\nEach statement alone is sufficient.\n\n**Trigger cue**\n\nA DS ask for an arithmetic-series sum with a two-term sum given: check whether the pair is symmetric about the middle — such pairs all equal $a_1 + a_n$.\n\n**Takeaway**\n\nSymmetric pairs of an arithmetic sequence share the same sum.",
    fastest_path_md:
      "The indices $1 + 10 = 5 + 6 = 11$, so both statements assert the very same fact $2a_1 + 9d = 14$; either one gives $S = 5 \\cdot 14 = 70$.",
    trap_map: {
      "0": "Dismisses statement (2), missing that $a_5 + a_6$ equals $a_1 + a_{10}$ in any arithmetic sequence.",
      "1": "Dismisses statement (1), though $S = 5(a_1 + a_{10})$ makes it immediately sufficient.",
      "2": "Combines the statements, not realizing each already fixes $2a_1 + 9d$ on its own.",
      "4": "Insists the first term and common difference must be known separately, but only their combination $2a_1 + 9d$ matters.",
    },
    numeric_check: null,
    check() {
      // grid over (a1, d); build 10 terms by repeated addition; test statements
      const cases = [];
      for (let a1 = -20; a1 <= 20; a1 += 0.5)
        for (let d = -10; d <= 10; d += 0.5) {
          const t = [];
          let x = a1;
          for (let n = 1; n <= 10; n++) {
            t.push(x);
            x += d;
          }
          cases.push(t);
        }
      const eq = (u, v) => Math.abs(u - v) < 1e-9;
      const S = (t) => t.reduce((p, c) => p + c, 0);
      const s1 = cases.filter((t) => eq(t[0] + t[9], 14));
      const s2 = cases.filter((t) => eq(t[4] + t[5], 14));
      const both = cases.filter((t) => eq(t[0] + t[9], 14) && eq(t[4] + t[5], 14));
      const suff = (set) => {
        if (set.length === 0) return false;
        const sums = new Set(set.map((t) => Math.round(S(t) * 1e6) / 1e6));
        return sums.size === 1;
      };
      const a1s = suff(s1);
      const a2s = suff(s2);
      const acs = suff(both);
      let index;
      if (a1s && a2s) index = 3;
      else if (a1s) index = 0;
      else if (a2s) index = 1;
      else if (acs) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 10. D4 DS real — yes/no on a series total: one term leaves the slope free, two pin it
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 4,
    stem_md:
      "A charity fundraiser ran for exactly 8 hours. The amount of money collected during each hour after the first was a fixed amount more than the amount collected during the hour before. Did the fundraiser collect a total of more than \\$800?\n\n(1) \\$95 was collected during the 4th hour.\n\n(2) \\$155 was collected during the 8th hour.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet the first hour bring $a$ and each hour add $k \\ge 0$. The total is $8a + 28k$.\n\nStatement (1): $a + 3k = 95$, so the total is $8(95 - 3k) + 28k = 760 + 4k$. With $k = 5$ the total is $780$ (no); with $k = 15$ it is $820$ (yes). Not sufficient.\n\nStatement (2): $a + 7k = 155$, so the total is $1240 - 28k$. With $k = 20$ the total is $680$ (no); with $k = 10$ it is $960$ (yes). Not sufficient.\n\nTogether: $4k = 60$, so $k = 15$, $a = 50$, and the total is $8 \\cdot 50 + 28 \\cdot 15 = 820 > 800$ — a definite yes. Sufficient.\n\nBoth statements together are sufficient, but neither alone is.\n\n**Trigger cue**\n\nAn evenly increasing series with single given terms in a yes/no DS: one term leaves the growth rate free to swing the total; two distinct terms lock the whole series.\n\n**Takeaway**\n\nTwo terms fix an arithmetic sequence; one term leaves it free.\n",
    fastest_path_md:
      "Each statement alone leaves the hourly increase $k$ free, and sliding $k$ pushes the total across \\$800 in both directions. Two given hours pin $k = 15$ and the first hour at \\$50, so the total is one number — no need to test whether it clears \\$800 before choosing C, but it does: \\$820.",
    trap_map: {
      "0": "Treats the 4th-hour \\$95 as the hourly average, calling the total a definite $8 \\cdot 95$.",
      "1": "Assumes the biggest hour determines the total, but \\$155 in hour 8 allows totals of \\$680 and \\$960.",
      "3": "Believes any single hour's amount fixes the whole pattern, though the hourly increase stays free.",
      "4": "Concludes two hours still cannot fix the series, but two terms determine an arithmetic sequence completely.",
    },
    numeric_check: null,
    check() {
      // enumerate (first hour a, hourly increase k) on a grid; require
      // nonnegative hourly amounts; total computed by direct summation
      const cases = [];
      for (let a = 0; a <= 300; a += 2.5)
        for (let k = 0; k <= 60; k += 2.5) {
          const hours = [];
          let x = a;
          for (let h = 1; h <= 8; h++) {
            hours.push(x);
            x += k;
          }
          if (hours.some((v) => v < 0)) continue;
          cases.push(hours);
        }
      const eq = (u, v) => Math.abs(u - v) < 1e-9;
      const total = (hs) => hs.reduce((p, c) => p + c, 0);
      const answers = (filter) =>
        new Set(cases.filter(filter).map((hs) => total(hs) > 800));
      const s1 = answers((hs) => eq(hs[3], 95));
      const s2 = answers((hs) => eq(hs[7], 155));
      const both = answers((hs) => eq(hs[3], 95) && eq(hs[7], 155));
      const suff = (set) => set.size === 1;
      const a1 = suff(s1);
      const a2 = suff(s2);
      const ac = suff(both);
      let index;
      if (a1 && a2) index = 3;
      else if (a1) index = 0;
      else if (a2) index = 1;
      else if (ac) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 11. D5 PS pure — reciprocal recursion with a 3-cycle; product of 50 terms
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "In a sequence, $a_1 = 3$ and $a_{n+1} = \\frac{1}{1 - a_n}$ for all $n \\ge 1$. What is the product of the first $50$ terms of the sequence?",
    choices: ["$-\\frac{3}{2}$", "$-1$", "$1$", "$\\frac{3}{2}$", "$3$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nGenerate terms: $a_1 = 3$, $a_2 = \\frac{1}{1-3} = -\\frac{1}{2}$, $a_3 = \\frac{1}{1+\\frac{1}{2}} = \\frac{2}{3}$, $a_4 = \\frac{1}{1-\\frac{2}{3}} = 3$ — the sequence cycles with period $3$, and each cycle's product is $3 \\cdot \\left(-\\frac{1}{2}\\right) \\cdot \\frac{2}{3} = -1$. Since $50 = 3 \\cdot 16 + 2$, the product is $(-1)^{16} \\cdot a_{49} \\cdot a_{50} = 1 \\cdot 3 \\cdot \\left(-\\frac{1}{2}\\right) = -\\frac{3}{2}$.\n\n**Trigger cue**\n\nA fractional recursion asked about a distant term or product: iterate until the first value returns, then reduce the index modulo the cycle length.\n\n**Takeaway**\n\nFind the cycle, take whole-cycle products, then multiply the leftovers.",
    fastest_path_md:
      "Three iterations reveal the cycle $3, -\\frac{1}{2}, \\frac{2}{3}$ with product $-1$. Sixteen full cycles contribute $(-1)^{16} = 1$; the two leftover terms restart the cycle: $3 \\cdot \\left(-\\frac{1}{2}\\right) = -\\frac{3}{2}$.",
    trap_map: {
      "1": "Rounds $50$ terms up to $17$ full cycles and reports $(-1)^{17}$.",
      "2": "Uses the $16$ complete cycles but drops the two leftover terms.",
      "3": "Loses the minus sign on $a_{50} = -\\frac{1}{2}$.",
      "4": "Miscounts $50 = 3 \\cdot 16 + 2$ as leaving one leftover term, keeping only $a_{49} = 3$.",
    },
    numeric_check: "-3/2",
    check() {
      // exact rational simulation of all 50 terms and their running product
      const g = (a, b) => (b ? g(b, a % b) : a);
      let tp = 3, tq = 1; // current term = tp/tq
      let pp = 1, pq = 1; // running product = pp/pq
      for (let n = 1; n <= 50; n++) {
        pp *= tp;
        pq *= tq;
        const k1 = Math.abs(g(pp, pq)) || 1;
        pp /= k1;
        pq /= k1;
        // a_{n+1} = 1 / (1 - tp/tq) = tq / (tq - tp)
        const np = tq;
        const nq = tq - tp;
        tp = np;
        tq = nq;
        const k2 = Math.abs(g(tp, tq)) || 1;
        tp /= k2;
        tq /= k2;
      }
      return { kind: "value", value: pp / pq };
    },
  },

  // 12. D5 PS pure — the 50th positive integer that is not a perfect square
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "For every positive integer $n$, $a_n$ is the $n$th smallest positive integer that is not the square of an integer. What is $a_{50}$?",
    choices: ["$43$", "$51$", "$56$", "$57$", "$58$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nIf $a_{50} = m$, then exactly $50$ of the integers $1$ through $m$ are non-squares, so $m - (\\text{squares} \\le m) = 50$. Try $m = 57$: the squares up to $57$ are $1, 4, 9, 16, 25, 36, 49$ — seven of them — and $57 - 7 = 50$. Confirm the landing spot: $57$ is not itself a square, and no square falls between $50$ and $57$ to disturb the count. So $a_{50} = 57$.\n\n**Trigger cue**\n\n\"The $n$th integer that is not [a special type]\": add back the count of excluded values, then verify the result isn't itself excluded.\n\n**Takeaway**\n\nAdd back the skipped values, then re-verify the landing spot.",
    fastest_path_md:
      "Guess $50 + 7 = 57$ since seven squares ($1$ through $49$) sit below, then confirm $57$ isn't a square and $64$ is out of range.",
    trap_map: {
      "0": "Subtracts the $7$ skipped squares instead of adding them back.",
      "1": "Skips only the single square $49$ nearest to $50$.",
      "2": "Forgets that $1$ is a perfect square and adds back only $6$ skipped values.",
      "4": "Counts $64$ as an eighth skipped square even though it exceeds $57$.",
    },
    numeric_check: "57",
    check() {
      // walk the integers, skipping perfect squares, until the 50th survivor
      const isSquare = (m) => Number.isInteger(Math.sqrt(m));
      let count = 0;
      let m = 0;
      while (count < 50) {
        m++;
        if (!isSquare(m)) count++;
      }
      return { kind: "value", value: m };
    },
  },

  // 13. D5 PS real — race between two cumulative deposit series with an exact tie
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "Starting in January, Ana deposits \\$100 into her savings account in the first month and, in each month after the first, deposits \\$10 more than she deposited the month before. Starting the same January, Ben deposits \\$200 into his account every month. At the end of which month, counting January as month $1$, will the total amount Ana has deposited first exceed the total amount Ben has deposited?",
    choices: ["$11$", "$12$", "$21$", "$22$", "$23$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nAfter $n$ months Ana has deposited $100n + 10 \\cdot \\frac{n(n-1)}{2} = 100n + 5n(n-1)$ and Ben has deposited $200n$. Require $100n + 5n(n-1) > 200n$, i.e. $5(n-1) > 100$, so $n > 21$. At $n = 21$ the totals are exactly equal ($\\$4{,}200$ each); at $n = 22$ Ana has $\\$4{,}510$ against Ben's $\\$4{,}400$. The answer is month $22$.\n\n**Trigger cue**\n\nTwo running totals with \"first exceed\": compare cumulative sums, not single payments, and check the boundary month for an exact tie.\n\n**Takeaway**\n\nCompare cumulative totals, not single terms; watch for exact ties.",
    fastest_path_md:
      "Track Ana's monthly gap to Ben: months $1$–$10$ lose $100, 90, \\ldots, 10$ (total $550$ behind); from month $12$ she gains $10, 20, \\ldots$ — the gains reach $550$ exactly at month $21$, a tie, so month $22$.",
    trap_map: {
      "0": "Finds when Ana's monthly deposit first equals Ben's \\$200.",
      "1": "Finds when Ana's single monthly deposit first exceeds Ben's, not when the totals do.",
      "2": "Stops where the running totals are merely equal — both are \\$4{,}200 at month $21$.",
      "4": "Overshoots a month after mishandling the exact tie at month $21$.",
    },
    numeric_check: "22",
    check() {
      // simulate both accounts month by month
      let ana = 0;
      let ben = 0;
      let deposit = 100;
      for (let n = 1; n <= 1000; n++) {
        ana += deposit;
        ben += 200;
        deposit += 10;
        if (ana > ben) return { kind: "value", value: n };
      }
      throw new Error("Ana never pulls ahead");
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
