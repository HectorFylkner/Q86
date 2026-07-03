/**
 * Batch: 9 new consecutive_evenly_spaced questions (value_order_factors / arithmetic).
 * Run: node scripts/author/batch-consecutive_evenly_spaced.mjs
 * Append: APPEND=1 node scripts/author/batch-consecutive_evenly_spaced.mjs
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
  // ── 1. D3 DS pure ─────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 3,
    stem_md:
      "Set $S$ consists of consecutive integers. How many integers are in $S$?\n\n(1) The sum of the integers in $S$ is $120$.\n\n(2) The largest integer in $S$ is $14$ more than the smallest integer in $S$.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\nStatement (1): a sum of $120$ arises from runs of different lengths — $39+40+41$ uses $3$ integers, $22+23+24+25+26$ uses $5$, and $1+2+\\dots+15$ uses $15$. The count is not determined. Not sufficient.\n\nStatement (2): consecutive integers step by $1$, so largest $-$ smallest $= 14$ forces exactly $14 + 1 = 15$ integers, no matter where the run is located. Sufficient.\n\nStatement (2) alone is sufficient; statement (1) alone is not.\n\n**Trigger cue**\nFor consecutive integers, the range alone fixes the count: count $=$ range $+ 1$.\n\n**Takeaway**\nConsecutive integers: count equals range plus one.",
    fastest_path_md:
      "Statement (2) is instant: range $14$ means $14 + 1 = 15$ integers. To kill statement (1), produce two decompositions of $120$ with different lengths — $39+40+41$ and $1+2+\\dots+15$ — and you are done.",
    trap_map: {
      "0": "Assumes $120$ decomposes into consecutive integers in only one way, overlooking runs like $39+40+41$.",
      "2": "Thinks the range only bounds the spread and that the sum is still needed to fix the count.",
      "3": "Credits statement (1) with fixing the count, though $3$, $5$, and $15$ integers all reach a sum of $120$.",
      "4": "Misses that a range of $14$ forces exactly $15$ consecutive integers wherever the run sits.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let a = -150; a <= 150; a++) {
        for (let n = 2; n <= 60; n++) {
          const b = a + n - 1;
          const sum = ((a + b) * n) / 2;
          models.push({ v: n, s1: sum === 120, s2: b - a === 14 });
        }
      }
      return { kind: "index", index: dsIndex(models, 3) };
    },
  },

  // ── 2. D2 DS pure ─────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 2,
    stem_md:
      "What is the largest of $5$ consecutive even integers?\n\n(1) The smallest of the five integers is $18$.\n\n(2) The sum of the five integers is $110$.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\nWrite the five integers as $a, a+2, a+4, a+6, a+8$; the largest is $a + 8$.\n\nStatement (1): $a = 18$, so the largest is $18 + 8 = 26$. Sufficient.\n\nStatement (2): $5a + 20 = 110$ gives $a = 18$, so the largest is again $26$. Sufficient.\n\nEach statement alone is sufficient.\n\n**Trigger cue**\nWhen the count and spacing of an evenly spaced set are fixed, any single anchor — an endpoint, the sum, or the mean — locks in every term.\n\n**Takeaway**\nFixed count and spacing: one anchor determines the whole set.",
    fastest_path_md:
      "With $5$ terms spaced by $2$, the set has one degree of freedom. Statement (1) anchors it directly. Statement (2) anchors it through the mean: $110/5 = 22$ is the middle term, so the largest is $22 + 4 = 26$. Each alone works.",
    trap_map: {
      "0": "Misses that the sum in statement (2) yields the mean $22$, which is the middle term and fixes the set.",
      "1": "Misses that the smallest term plus four steps of $2$ pins the largest at $26$.",
      "2": "Thinks an anchor and the sum are both needed, though either one alone fixes the single unknown.",
      "4": "Treats the set as undetermined even though the count is fixed at $5$ and the spacing at $2$.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let a = -100; a <= 100; a += 2) {
        const terms = [a, a + 2, a + 4, a + 6, a + 8];
        const sum = terms.reduce((x, y) => x + y, 0);
        models.push({ v: a + 8, s1: a === 18, s2: sum === 110 });
      }
      return { kind: "index", index: dsIndex(models, 1) };
    },
  },

  // ── 3. D3 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 3,
    stem_md:
      "The sum of $6$ consecutive odd integers is $96$. What is the least of the six integers?",
    choices: ["$9$", "$11$", "$13$", "$16$", "$21$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe mean is $96/6 = 16$. With an even number of terms, $16$ is not itself a term — it sits midway between the $3$rd and $4$th. The six odd integers are therefore $16 \\pm 1$, $16 \\pm 3$, $16 \\pm 5$, that is, $11, 13, 15, 17, 19, 21$. The least is $11$.\n\n**Trigger cue**\nA sum of an evenly spaced set: divide by the count to find the center, then step out to the ends — with an even count the center falls between two terms.\n\n**Takeaway**\nDivide by the count; the mean centers the set.",
    fastest_path_md:
      "Backsolve from the middle choice sizes: try $11$ as the least — $11+13+15+17+19+21 = 96$. Done. Or compute the mean $16$ and step down $5$ (half-spacings $1, 3, 5$) to the least term.",
    trap_map: {
      "0": "Steps down $7$ from the mean, extending the set one spacing too far below the center.",
      "2": "Stops at the second-least term, $16 - 3$, miscounting the offsets from the mean.",
      "3": "Reports the mean itself, assuming it must be a member of the set.",
      "4": "Solves for the greatest of the six instead of the least.",
    },
    numeric_check: "96/6 - 5",
    check() {
      for (let a = -501; a <= 501; a += 2) {
        let s = 0;
        for (let k = 0; k < 6; k++) s += a + 2 * k;
        if (s === 96) return { kind: "value", value: a };
      }
      throw new Error("no solution found");
    },
  },

  // ── 4. D3 PS real ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 3,
    stem_md:
      "A city crew installs streetlights along one side of a straight road that is $1{,}710$ feet long. The lights are equally spaced $45$ feet apart, and there is a light at each end of the road. How many streetlights does the crew install?",
    choices: ["$37$", "$38$", "$39$", "$40$", "$41$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe distance between the first and last lights is $1{,}710$ feet, so the number of $45$-foot gaps is $1{,}710/45 = 38$. A row with a light at each end has one more light than gaps: $38 + 1 = 39$.\n\n**Trigger cue**\nEqually spaced objects occupying both endpoints of an interval: the object count is the gap count plus one.\n\n**Takeaway**\nCount posts, not gaps: intervals plus one.",
    fastest_path_md:
      "$1{,}710/45 = 38$ gaps, then add $1$ for the light that starts the row: $39$. Sanity-check with a tiny case — a $90$-foot road at $45$-foot spacing has lights at $0$, $45$, $90$: three lights, two gaps.",
    trap_map: {
      "0": "Subtracts one from the gap count instead of adding one.",
      "1": "Reports the number of $45$-foot gaps, forgetting the light at the start of the road.",
      "3": "Adds one to the correct light count, placing an extra light beyond the far end.",
      "4": "Adds a light for each end on top of a count that already includes both ends.",
    },
    numeric_check: "1710/45 + 1",
    check() {
      let count = 0;
      for (let p = 0; p <= 1710; p += 45) count++;
      return { kind: "value", value: count };
    },
  },

  // ── 5. D4 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md:
      "$S$ is the sum of the integers from $41$ to $90$, inclusive, and $T$ is the sum of the integers from $1$ to $50$, inclusive. What is the value of $S - T$?",
    choices: ["$40$", "$1{,}000$", "$2{,}000$", "$2{,}050$", "$2{,}500$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nBoth sums contain exactly $50$ terms. Pair them in order: $41$ with $1$, $42$ with $2$, $\\dots$, $90$ with $50$. Every pair differs by $40$, so\n$$S - T = 50 \\times 40 = 2{,}000.$$\n\n**Trigger cue**\nA difference of two equal-length evenly spaced sums: subtract term by term instead of computing either sum.\n\n**Takeaway**\nEqual-length sums: pair terms and multiply the shift by the count.",
    fastest_path_md:
      "Do not evaluate either sum. Each of the $50$ terms of $S$ is exactly $40$ more than the matching term of $T$, so $S - T = 50 \\times 40 = 2{,}000$.",
    trap_map: {
      "0": "Finds the per-term shift of $40$ but never multiplies by the $50$ pairs.",
      "1": "Multiplies the shift by $25$, pairing up only half of the terms.",
      "3": "Uses a shift of $41$ by comparing $41$ to $0$ instead of to $1$.",
      "4": "Multiplies the count $50$ by itself, using the count as the shift.",
    },
    numeric_check: "50 * 40",
    check() {
      let S = 0, T = 0;
      for (let k = 41; k <= 90; k++) S += k;
      for (let k = 1; k <= 50; k++) T += k;
      return { kind: "value", value: S - T };
    },
  },

  // ── 6. D4 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md: "How many multiples of $6$ lie between $-29$ and $82$?",
    choices: ["$13$", "$14$", "$17$", "$18$", "$19$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe least multiple of $6$ greater than $-29$ is $-24$; the greatest multiple of $6$ less than $82$ is $78$. These multiples form an evenly spaced list with spacing $6$, so the count is\n$$\\frac{78 - (-24)}{6} + 1 = \\frac{102}{6} + 1 = 17 + 1 = 18.$$\n\n**Trigger cue**\nCounting multiples over an interval that spans zero: anchor both ends at actual multiples, and remember that $0$ and the negative multiples count.\n\n**Takeaway**\nZero and negative multiples count too.",
    fastest_path_md:
      "Split at zero: positive multiples $6$ through $78$ give $13$; then $0$ is a multiple of $6$; then $-6, -12, -18, -24$ give $4$ more. Total $13 + 1 + 4 = 18$.",
    trap_map: {
      "0": "Counts only the positive multiples $6$ through $78$, ignoring $0$ and the negative multiples.",
      "1": "Includes $0$ but still misses the four negative multiples down to $-24$.",
      "2": "Computes $(78 - (-24))/6 = 17$ without adding $1$ for the first term.",
      "4": "Adds $1$ twice after dividing the span by $6$.",
    },
    numeric_check: "(78 + 24)/6 + 1",
    check() {
      let count = 0;
      for (let n = -29; n <= 82; n++) if (n % 6 === 0) count++;
      return { kind: "value", value: count };
    },
  },

  // ── 7. D4 PS real ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md:
      "The $21$ runners in a road race wear bibs numbered with consecutive integers, and the sum of all $21$ bib numbers is $651$. If the runner wearing the lowest-numbered bib withdraws before the start, what is the average (arithmetic mean) of the bib numbers of the runners who start the race?",
    choices: ["$30.5$", "$31$", "$31.5$", "$32$", "$32.55$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nFor $21$ consecutive integers, the mean is the median: $651/21 = 31$, so the bibs run from $21$ to $41$. Removing bib $21$ leaves the $20$ consecutive integers $22$ through $41$, whose average is the midpoint of the endpoints:\n$$\\frac{22 + 41}{2} = 31.5.$$\n\n**Trigger cue**\nA sum of a consecutive run: divide by the count to locate the median, and after removing terms the remaining run's mean is still the average of its endpoints.\n\n**Takeaway**\nA consecutive run's average is the midpoint of its endpoints.",
    fastest_path_md:
      "Structure only: dropping the lowest of a consecutive run slides the center up by half a step, so the mean moves from $651/21 = 31$ to $31.5$. No need to rebuild the list or re-add the sum.",
    trap_map: {
      "0": "Removes the highest bib instead of the lowest, computing $610/20$.",
      "1": "Assumes the average is unchanged when the lowest runner leaves.",
      "3": "Shifts the mean by a full unit instead of half a spacing.",
      "4": "Divides the original sum $651$ by $20$ without removing the withdrawn bib.",
    },
    numeric_check: "630/20",
    check() {
      for (let a = -1000; a <= 1000; a++) {
        const terms = Array.from({ length: 21 }, (_, k) => a + k);
        const sum = terms.reduce((x, y) => x + y, 0);
        if (sum === 651) {
          const rest = terms.slice(1);
          const restSum = rest.reduce((x, y) => x + y, 0);
          return { kind: "value", value: restSum / rest.length };
        }
      }
      throw new Error("no solution found");
    },
  },

  // ── 8. D4 DS pure ─────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md:
      "$T$ is a set of consecutive even integers. What is the median of $T$?\n\n(1) The sum of the integers in $T$ is $0$.\n\n(2) $T$ contains fewer than $8$ integers.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nFor any evenly spaced set, the median equals the mean.\n\nStatement (1): the mean is $\\text{sum}/\\text{count} = 0/\\text{count} = 0$, whatever the count, so the median is $0$. (For instance $\\{-2, 0, 2\\}$ and $\\{-6, -4, -2, 0, 2, 4, 6\\}$ both qualify, and both have median $0$.) Sufficient.\n\nStatement (2): $\\{2, 4\\}$ has median $3$ while $\\{6, 8\\}$ has median $7$; both contain fewer than $8$ integers. Not sufficient.\n\nStatement (1) alone is sufficient.\n\n**Trigger cue**\nA median question about an evenly spaced set: convert it to a mean question, because mean and median coincide — a zero sum then forces both to be $0$.\n\n**Takeaway**\nEvenly spaced: zero sum forces zero mean and median.",
    fastest_path_md:
      "Median $=$ mean for evenly spaced sets, and statement (1) makes the mean $0/\\text{count} = 0$ with no case analysis. Statement (2) dies to two quick examples, $\\{2,4\\}$ versus $\\{6,8\\}$.",
    trap_map: {
      "1": "Believes the size bound in statement (2) locates the set while the zero-sum condition does not.",
      "2": "Thinks the count is needed alongside the zero sum, missing that median $=$ mean $= 0$ for any qualifying size.",
      "3": "Credits statement (2) alone, though $\\{2,4\\}$ and $\\{6,8\\}$ give different medians.",
      "4": "Assumes the median cannot be found without knowing how many integers the set contains.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let a = -60; a <= 60; a += 2) {
        for (let n = 2; n <= 25; n++) {
          const terms = Array.from({ length: n }, (_, k) => a + 2 * k);
          const sum = terms.reduce((x, y) => x + y, 0);
          const median =
            n % 2 === 1 ? terms[(n - 1) / 2] : (terms[n / 2 - 1] + terms[n / 2]) / 2;
          models.push({ v: median, s1: sum === 0, s2: n < 8 });
        }
      }
      return { kind: "index", index: dsIndex(models, 3) };
    },
  },

  // ── 9. D4 PS pure ─────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 4,
    stem_md:
      "$Q$ is a set of consecutive odd integers. The sum of the three least integers in $Q$ is $75$, and the sum of the three greatest integers in $Q$ is $159$. What is the sum of all the integers in $Q$?",
    choices: ["$234$", "$585$", "$624$", "$663$", "$702$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThree consecutive odd integers sum to three times their middle term. So the three least average $75/3 = 25$, making the least integer $25 - 2 = 23$; the three greatest average $159/3 = 53$, making the greatest $53 + 2 = 55$.\n\nThe set runs from $23$ to $55$ in steps of $2$: count $= (55 - 23)/2 + 1 = 17$ and median $= (23 + 55)/2 = 39$. Therefore the sum is $17 \\times 39 = 663$.\n\n**Trigger cue**\nA sum of the extreme few terms of an evenly spaced set: divide by how many were added to get their middle term, then recover the endpoints.\n\n**Takeaway**\nTriple sums reveal endpoints; sum equals count times median.",
    fastest_path_md:
      "$75/3 = 25$ and $159/3 = 53$ are the middles of the end triples, so the set spans $23$ to $55$. Then sum $=$ count $\\times$ midpoint $= 17 \\times 39 = 663$.",
    trap_map: {
      "0": "Adds only the two given sums, $75 + 159$, ignoring every middle term.",
      "1": "Builds the count from the inner anchors $25$ and $53$, getting $15$ terms.",
      "2": "Drops the $+1$ when counting from $23$ to $55$, using $16$ terms.",
      "4": "Adds $1$ twice when counting from $23$ to $55$, using $18$ terms.",
    },
    numeric_check: "17 * 39",
    check() {
      const sums = new Set();
      for (let a = -999; a <= 999; a += 2) {
        for (let n = 3; n <= 400; n++) {
          const least3 = 3 * a + 6;
          const L = a + 2 * (n - 1);
          const greatest3 = 3 * L - 6;
          if (least3 === 75 && greatest3 === 159) {
            let s = 0;
            for (let k = 0; k < n; k++) s += a + 2 * k;
            sums.add(s);
          }
        }
      }
      if (sums.size !== 1) throw new Error(`expected unique set, found ${sums.size}`);
      return { kind: "value", value: [...sums][0] };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
