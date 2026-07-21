/**
 * Batch 2: 11 new overlapping_sets items (counting_sets_series_prob_stats).
 * Cells: D2 PS real, D2 PS pure, D3 PS pure, D3 PS real, D3 PS real (algebra,
 * expression choices), D3 DS real, D3 DS pure, D4 PS pure, D4 DS pure,
 * D5 PS pure, D5 PS pure.
 * Run: node --experimental-strip-types scripts/author/batch2-overlapping_sets.mjs
 * (--append to write to the bank — integration is done centrally, not here.)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // ── 1. D2 PS real (union = total, solve for a set size) ────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 2,
    stem_md:
      "Each of the $70$ members of a fitness club uses the treadmill, the swimming pool, or both. If $42$ members use the treadmill and $18$ members use both the treadmill and the pool, how many members use the swimming pool?",
    choices: ["$24$", "$28$", "$46$", "$52$", "$60$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nEvery member uses at least one machine, so the union is all $70$ members. Inclusion–exclusion: $42 + |P| - 18 = 70$, so $|P| = 46$.\n\n**Trigger cue**\n\n\"Uses the treadmill, the pool, or both\" means there is no neither region — the union equals the whole group.\n\n**Takeaway**\n\nWhen union equals total, one-step inclusion–exclusion finds the missing size.",
    fastest_path_md:
      "Pool-only is $70 - 42 = 28$; add the $18$ who use both: $28 + 18 = 46$.",
    trap_map: {
      "0": "Reports the treadmill-only count, $42 - 18$.",
      "1": "Computes $70 - 42$, the pool-only count, forgetting the both-users also swim.",
      "3": "Subtracts the both count from the total, $70 - 18$.",
      "4": "Adds the both count to the treadmill count, $42 + 18$.",
    },
    numeric_check: "70-42+18",
    check() {
      // Enumerate the pool size and test the full region breakdown directly.
      const feasible = [];
      for (let p = 0; p <= 70; p++) {
        const both = 18;
        const tOnly = 42 - both;
        const pOnly = p - both;
        if (pOnly < 0 || tOnly < 0) continue;
        if (tOnly + pOnly + both !== 70) continue; // no neither region
        feasible.push(p);
      }
      if (feasible.length !== 1)
        throw new Error("pool size not unique: " + feasible.join(","));
      return { kind: "value", value: feasible[0] };
    },
  },

  // ── 2. D2 PS pure (given both and neither, solve for the other set) ────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 2,
    stem_md:
      "A certain set contains $75$ elements. Of these, $40$ have property $X$, $12$ have both property $X$ and property $Y$, and $18$ have neither property. How many elements have property $Y$?",
    choices: ["$17$", "$23$", "$29$", "$35$", "$45$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nElements with at least one property: $75 - 18 = 57$. Inclusion–exclusion: $40 + |Y| - 12 = 57$, so $|Y| = 29$.\n\n**Trigger cue**\n\nGiven the both and neither counts and one set size, solve inclusion–exclusion for the remaining size.\n\n**Takeaway**\n\nReverse inclusion–exclusion: union minus known set plus overlap.",
    fastest_path_md:
      "The union is $57$; $Y$ must supply the $57 - 40 = 17$ elements outside $X$ plus the $12$ shared: $29$.",
    trap_map: {
      "0": "Finds the $Y$-only count, $57 - 40$, and forgets to add back the $12$ in both.",
      "1": "Subtracts both the $X$ count and the both count from the total, $75 - 40 - 12$.",
      "3": "Computes $75 - 40$, ignoring the neither and both counts.",
      "4": "Reports the exactly-one count, union minus both.",
    },
    numeric_check: "75-18-40+12",
    check() {
      // Enumerate the unknown |Y| and test the full region breakdown.
      const feasible = [];
      for (let y = 0; y <= 75; y++) {
        const both = 12;
        const xOnly = 40 - both;
        const yOnly = y - both;
        const neither = 18;
        if (yOnly < 0) continue;
        if (xOnly + yOnly + both + neither !== 75) continue;
        feasible.push(y);
      }
      if (feasible.length !== 1)
        throw new Error("Y not unique: " + feasible.join(","));
      return { kind: "value", value: feasible[0] };
    },
  },

  // ── 3. D3 PS pure (fractions with unlike denominators) ─────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 3,
    stem_md:
      "Of the elements in a certain set, $\\frac{3}{4}$ belong to subset $A$, $\\frac{2}{3}$ belong to subset $B$, and $\\frac{1}{6}$ belong to neither subset. What fraction of the elements belong to both $A$ and $B$?",
    choices: [
      "$\\frac{1}{12}$",
      "$\\frac{1}{6}$",
      "$\\frac{5}{12}$",
      "$\\frac{7}{12}$",
      "$\\frac{5}{6}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nOver denominator $12$: $\\frac{9}{12}$ are in $A$, $\\frac{8}{12}$ in $B$, and $\\frac{2}{12}$ in neither, so the union is $\\frac{10}{12}$. Then both $= \\frac{9}{12} + \\frac{8}{12} - \\frac{10}{12} = \\frac{7}{12}$.\n\n**Trigger cue**\n\nSet fractions with unlike denominators: rewrite everything over the LCD before applying inclusion–exclusion.\n\n**Takeaway**\n\nPut set fractions over the LCD, then apply inclusion–exclusion.",
    fastest_path_md:
      "Take $12$ elements: $9$ in $A$, $8$ in $B$, $2$ in neither, so the union is $10$ and both $= 17 - 10 = 7$ of the $12$.",
    trap_map: {
      "0": "Reports the fraction in $B$ only, $\\frac{2}{3} - \\frac{7}{12}$.",
      "1": "Reports the fraction in $A$ only, $\\frac{3}{4} - \\frac{7}{12}$.",
      "2": "Computes $\\frac{3}{4} + \\frac{2}{3} - 1$, ignoring the sixth of the elements in neither subset.",
      "4": "Reports the union — the fraction in at least one subset.",
    },
    numeric_check: "7/12",
    check() {
      // Model with N concrete elements for several N divisible by 12.
      const fracs = new Set();
      for (const N of [12, 24, 36, 60, 120]) {
        const inA = (3 * N) / 4;
        const inB = (2 * N) / 3;
        const neither = N / 6;
        const candidates = [];
        for (let both = 0; both <= Math.min(inA, inB); both++) {
          const aOnly = inA - both;
          const bOnly = inB - both;
          if (aOnly < 0 || bOnly < 0) continue;
          if (aOnly + bOnly + both + neither !== N) continue;
          candidates.push(both);
        }
        if (candidates.length !== 1)
          throw new Error("overlap not unique for N=" + N);
        fracs.add(candidates[0] / N);
      }
      if (fracs.size !== 1) throw new Error("fraction not invariant across N");
      return { kind: "value", value: [...fracs][0] };
    },
  },

  // ── 4. D3 PS real (two-way matrix with complement categories) ──────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 3,
    stem_md:
      "At a conference attended by $150$ people, $90$ of the attendees are engineers and the rest are managers. Exactly $110$ of the attendees registered early, including $72$ of the engineers. How many of the managers did NOT register early?",
    choices: ["$18$", "$22$", "$38$", "$40$", "$78$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nManagers: $150 - 90 = 60$. Managers who registered early: $110 - 72 = 38$. Managers who did not register early: $60 - 38 = 22$.\n\n**Trigger cue**\n\nTwo binary attributes (role, registration timing): set up the two-way matrix and close each row and column.\n\n**Takeaway**\n\nIn a two-way matrix, every row and column must total.",
    fastest_path_md:
      "Not-early column: $150 - 110 = 40$ people; engineers claim $90 - 72 = 18$ of them, leaving $22$ managers.",
    trap_map: {
      "0": "Reports the engineers who did not register early, $90 - 72$.",
      "2": "Stops at the managers who DID register early, $110 - 72$.",
      "3": "Reports all attendees who did not register early, forgetting to restrict to managers.",
      "4": "Subtracts only the early engineers from the total, $150 - 72$.",
    },
    numeric_check: "150-110-(90-72)",
    check() {
      // Enumerate the target cell and require the whole 2x2 matrix to close.
      const answers = new Set();
      for (let mNot = 0; mNot <= 60; mNot++) {
        const managers = 150 - 90;
        const mEarly = managers - mNot;
        const eEarly = 72;
        const eNot = 90 - eEarly;
        if (mEarly < 0) continue;
        if (eEarly + mEarly !== 110) continue; // early column
        if (eNot + mNot !== 150 - 110) continue; // not-early column
        answers.add(mNot);
      }
      if (answers.size !== 1)
        throw new Error("matrix not unique: " + [...answers].join(","));
      return { kind: "value", value: [...answers][0] };
    },
  },

  // ── 5. D3 PS real, algebra (variable expression choices) ───────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 3,
    stem_md:
      "Of the $n$ customers surveyed at a store, $x$ said they use brand P, $y$ said they use brand Q, and $z$ said they use neither brand. In terms of $n$, $x$, $y$, and $z$, how many of the customers surveyed use both brands?",
    choices: [
      "$x + y - n$",
      "$x + y - z - n$",
      "$n - x - y - z$",
      "$x + y + z - n$",
      "$n - x - y + z$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe customers who use at least one brand number $n - z$. Inclusion–exclusion gives $x + y - \\text{both} = n - z$, so $\\text{both} = x + y + z - n$.\n\n**Trigger cue**\n\nVariable answer choices for an overlap: convert the total to the union with the neither count, then rearrange inclusion–exclusion.\n\n**Takeaway**\n\nUnion is total minus neither; overlap is sizes' sum minus union.",
    fastest_path_md:
      "Smart numbers: $n = 100$, $x = 60$, $y = 50$, $z = 10$ force both $= 20$; only $x + y + z - n$ yields $20$.",
    trap_map: {
      "0": "Treats all $n$ customers as being in the union, ignoring the $z$ who use neither.",
      "1": "Subtracts the neither count instead of adding it back when converting the total to the union.",
      "2": "Subtracts $x$, $y$, and $z$ from the total, producing the negative of the overlap.",
      "4": "Sets up inclusion–exclusion with the sign of $z$ reversed, solving $n = x + y - z + \\text{both}$.",
    },
    numeric_check: null,
    check() {
      // Simulate random surveys by direct membership assignment; the true
      // "both" count comes from counting people, never from a formula. Keep
      // the choices whose expression matches in every trial.
      const exprs = [
        (n, x, y, z) => x + y - n,
        (n, x, y, z) => x + y - z - n,
        (n, x, y, z) => n - x - y - z,
        (n, x, y, z) => x + y + z - n,
        (n, x, y, z) => n - x - y + z,
      ];
      let seed = 987654321;
      const rand = (m) => {
        seed = (seed * 48271) % 2147483647; // exact in doubles
        return seed % m;
      };
      const alive = new Set([0, 1, 2, 3, 4]);
      for (let trial = 0; trial < 300; trial++) {
        const n = 20 + rand(60);
        let x = 0,
          y = 0,
          z = 0,
          both = 0;
        for (let p = 0; p < n; p++) {
          const inP = rand(2) === 1;
          const inQ = rand(2) === 1;
          if (inP) x++;
          if (inQ) y++;
          if (inP && inQ) both++;
          if (!inP && !inQ) z++;
        }
        for (const c of [...alive])
          if (exprs[c](n, x, y, z) !== both) alive.delete(c);
      }
      if (alive.size !== 1)
        throw new Error("surviving expressions: " + [...alive].join(","));
      return { kind: "index", index: [...alive][0] };
    },
  },

  // ── 6. D3 DS real (value question; answer C) ───────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 3,
    stem_md:
      "Each of the $200$ members of a professional association serves on the finance committee, the outreach committee, both committees, or neither committee. How many members serve on both committees?\n\n(1) $120$ members serve on the finance committee, and $90$ members serve on the outreach committee.\n\n(2) $30$ members serve on neither committee.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe overlap satisfies $\\text{both} = |F| + |O| - |\\text{union}|$ with $|\\text{union}| = 200 - \\text{neither}$. Statement (1) gives the two sizes but not the neither count, so the overlap can be anything from $10$ to $90$: not sufficient. Statement (2) gives $|\\text{union}| = 170$ but no sizes: not sufficient. Together: $\\text{both} = 120 + 90 - 170 = 40$: sufficient.\n\n**Trigger cue**\n\nA DS overlap question: inclusion–exclusion has three inputs — two sizes and a union — and sufficiency requires pinning all three.\n\n**Takeaway**\n\nOverlap needs both set sizes and the union; count unknowns first.",
    fastest_path_md:
      "Each statement leaves one input of $\\text{both} = |F| + |O| - |\\text{union}|$ free; together all three inputs are fixed, so combine.",
    trap_map: {
      "0": "Assumes every member serves on some committee, making (1) alone give $120 + 90 - 200 = 10$.",
      "1": "Thinks the neither count alone pins the overlap without the committee sizes.",
      "3": "Combines both errors: full coverage assumed for (1) and sizes deemed unnecessary for (2).",
      "4": "Notes each statement fails alone and never combines them through inclusion–exclusion.",
    },
    numeric_check: null,
    check() {
      // Enumerate every (|F|, |O|, both) configuration in a 200-element
      // universe; collect the answer set consistent with each statement.
      const T = 200;
      const s1 = new Set();
      const s2 = new Set();
      const s12 = new Set();
      for (let f = 0; f <= T; f++) {
        for (let o = 0; o <= T; o++) {
          for (let b = Math.max(0, f + o - T); b <= Math.min(f, o); b++) {
            const neither = T - (f + o - b);
            if (neither < 0) continue;
            const m1 = f === 120 && o === 90;
            const m2 = neither === 30;
            if (m1) s1.add(b);
            if (m2) s2.add(b);
            if (m1 && m2) s12.add(b);
          }
        }
      }
      if (!s1.size || !s2.size || !s12.size)
        throw new Error("statements inconsistent with stem");
      const suff1 = s1.size === 1;
      const suff2 = s2.size === 1;
      const index =
        suff1 && suff2 ? 3 : suff1 ? 0 : suff2 ? 1 : s12.size === 1 ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // ── 7. D3 DS pure (exactly-one decomposition; answer B) ────────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 3,
    stem_md:
      "Each of the $100$ elements of a set $U$ belongs to subset $A$ only, subset $B$ only, both subsets, or neither subset. How many elements belong to both $A$ and $B$?\n\n(1) Subset $A$ and subset $B$ each contain exactly $70$ elements.\n\n(2) Exactly $40$ elements belong to exactly one of the subsets, and exactly $10$ elements belong to neither subset.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nStatement (1): $\\text{both} = 70 + 70 - |\\text{union}|$ with $|\\text{union}|$ anywhere from $70$ to $100$, so the overlap ranges from $40$ to $70$: not sufficient. Statement (2): the union is $100 - 10 = 90$ and decomposes as exactly-one plus both, so $\\text{both} = 90 - 40 = 50$: sufficient.\n\n**Trigger cue**\n\nWhen a statement gives the exactly-one and neither counts, the union decomposes with no set sizes needed.\n\n**Takeaway**\n\nUnion minus the exactly-one count equals the overlap.",
    fastest_path_md:
      "Statement (2) alone: union $90$ minus exactly-one $40$ gives both $= 50$; statement (1) leaves the union floating.",
    trap_map: {
      "0": "Assumes the union is all $100$ elements, making (1) give $140 - 100 = 40$.",
      "2": "Misses that (2) alone yields both $=$ union $-$ exactly-one and insists on the sizes from (1).",
      "3": "Treats (1) as sufficient by assuming no element lies outside the union.",
      "4": "Never decomposes the union into exactly-one plus both, so neither statement seems to help.",
    },
    numeric_check: null,
    check() {
      // Enumerate every (|A|, |B|, both) configuration in a 100-element
      // universe; collect the answer set consistent with each statement.
      const T = 100;
      const s1 = new Set();
      const s2 = new Set();
      const s12 = new Set();
      for (let a = 0; a <= T; a++) {
        for (let b = 0; b <= T; b++) {
          for (let k = Math.max(0, a + b - T); k <= Math.min(a, b); k++) {
            const neither = T - (a + b - k);
            if (neither < 0) continue;
            const exactlyOne = a - k + (b - k);
            const m1 = a === 70 && b === 70;
            const m2 = exactlyOne === 40 && neither === 10;
            if (m1) s1.add(k);
            if (m2) s2.add(k);
            if (m1 && m2) s12.add(k);
          }
        }
      }
      if (!s1.size || !s2.size || !s12.size)
        throw new Error("statements inconsistent with stem");
      const suff1 = s1.size === 1;
      const suff2 = s2.size === 1;
      const index =
        suff1 && suff2 ? 3 : suff1 ? 0 : suff2 ? 1 : s12.size === 1 ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // ── 8. D4 PS pure (greatest possible exactly-one) ──────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 4,
    stem_md:
      "A set $U$ contains exactly $40$ elements. Subsets $A$ and $B$ of $U$ contain $22$ and $30$ elements, respectively. What is the greatest possible number of elements of $U$ that belong to exactly one of $A$ and $B$?",
    choices: ["$8$", "$12$", "$28$", "$40$", "$52$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSince $|A \\cup B| \\le 40$, the overlap satisfies $\\text{both} \\ge 22 + 30 - 40 = 12$. The exactly-one count is $|A| + |B| - 2\\,\\text{both} = 52 - 2\\,\\text{both}$, which is largest when the overlap is smallest: $52 - 2(12) = 28$.\n\n**Trigger cue**\n\n\"Greatest possible\" for an exactly-one count: express it in terms of the overlap and push the overlap to its feasible extreme.\n\n**Takeaway**\n\nExactly-one is maximized when the forced overlap is minimized.",
    fastest_path_md:
      "$22 + 30$ memberships overflow $40$ slots by $12$; those $12$ must double up, leaving $52 - 24 = 28$ singles.",
    trap_map: {
      "0": "Maximizes the overlap instead, producing the least possible exactly-one count.",
      "1": "Reports the minimum overlap itself rather than the exactly-one count.",
      "3": "Assumes exactly-one elements can fill the entire $40$-element universe.",
      "4": "Adds the set sizes without removing the double-counted overlap.",
    },
    numeric_check: "22+30-2*(22+30-40)",
    check() {
      // Enumerate every feasible overlap and track the exactly-one maximum.
      const total = 40;
      const a = 22;
      const b = 30;
      let best = -1;
      for (let both = 0; both <= Math.min(a, b); both++) {
        const aOnly = a - both;
        const bOnly = b - both;
        const neither = total - (aOnly + bOnly + both);
        if (aOnly < 0 || bOnly < 0 || neither < 0) continue;
        best = Math.max(best, aOnly + bOnly);
      }
      if (best < 0) throw new Error("no feasible configuration");
      return { kind: "value", value: best };
    },
  },

  // ── 9. D4 DS pure (yes/no minimum-overlap; answer A) ───────────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 4,
    stem_md:
      "Sets $M$ and $N$ are subsets of a set $S$ that contains exactly $80$ elements. Is the number of elements in $M \\cap N$ at least $15$?\n\n(1) $M$ contains $50$ elements and $N$ contains $45$ elements.\n\n(2) Exactly $5$ elements of $S$ belong to neither $M$ nor $N$.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nStatement (1): $50 + 45 = 95$ memberships among only $80$ elements force at least $95 - 80 = 15$ elements into $M \\cap N$, so the answer is a definite yes: sufficient. Statement (2): the union is $75$, but the sizes are free — sizes $40$ and $35$ give an empty intersection (no) while sizes $75$ and $75$ give an overlap of $75$ (yes): not sufficient.\n\n**Trigger cue**\n\nA yes/no threshold on an overlap: test whether the forced minimum $|M| + |N| - |S|$ already clears the bar.\n\n**Takeaway**\n\nA guaranteed minimum overlap can settle yes/no without exact values.",
    fastest_path_md:
      "$50 + 45 = 95$ memberships in $80$ slots force at least $15$ doubles — (1) answers yes by itself; (2) fixes only the union.",
    trap_map: {
      "1": "Thinks the small neither count forces a large overlap, though the set sizes are unconstrained.",
      "2": "Misses that (1) alone already forces at least $15$ into the overlap and reflexively combines.",
      "3": "Assumes (2) also forces the overlap, though sizes $40$ and $35$ give an empty intersection.",
      "4": "Treats a yes/no question as unanswerable without the exact overlap, missing the forced minimum.",
    },
    numeric_check: null,
    check() {
      // Enumerate every (|M|, |N|, overlap) configuration; for each statement
      // collect the set of yes/no answers — sufficient iff only one answer.
      const T = 80;
      const s1 = new Set();
      const s2 = new Set();
      const s12 = new Set();
      for (let m = 0; m <= T; m++) {
        for (let n = 0; n <= T; n++) {
          for (let k = Math.max(0, m + n - T); k <= Math.min(m, n); k++) {
            const neither = T - (m + n - k);
            if (neither < 0) continue;
            const ans = k >= 15;
            const m1 = m === 50 && n === 45;
            const m2 = neither === 5;
            if (m1) s1.add(ans);
            if (m2) s2.add(ans);
            if (m1 && m2) s12.add(ans);
          }
        }
      }
      if (!s1.size || !s2.size || !s12.size)
        throw new Error("statements inconsistent with stem");
      const suff1 = s1.size === 1;
      const suff2 = s2.size === 1;
      const index =
        suff1 && suff2 ? 3 : suff1 ? 0 : suff2 ? 1 : s12.size === 1 ? 2 : 4;
      return { kind: "index", index };
    },
  },

  // ── 10. D5 PS pure (least possible triple overlap) ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 5,
    stem_md:
      "Sets $P$, $Q$, and $R$ are subsets of a set $S$ that contains exactly $100$ elements. If $P$, $Q$, and $R$ contain $70$, $75$, and $80$ elements, respectively, what is the least possible number of elements in $P \\cap Q \\cap R$?",
    choices: ["$0$", "$25$", "$45$", "$50$", "$55$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe three sets contribute $70 + 75 + 80 = 225$ memberships. An element outside the triple overlap absorbs at most $2$ memberships, so without triple-counted elements at most $2(100) = 200$ memberships fit. The excess $225 - 200 = 25$ forces at least $25$ elements into all three sets, and exactly $25$ is achievable: pairwise-only regions of $20$, $25$, and $30$ plus the triple region of $25$ cover all $100$ elements.\n\n**Trigger cue**\n\n\"Least possible\" for an all-three count: compare total memberships with twice the universe.\n\n**Takeaway**\n\nMinimum triple overlap is total memberships minus twice the universe.",
    fastest_path_md:
      "Memberships $225$ minus double coverage of all $100$ elements leaves $25$ that must be covered a third time.",
    trap_map: {
      "0": "Assumes the triple overlap can be emptied, ignoring that $225$ memberships exceed $2 \\cdot 100$.",
      "2": "Applies the two-set minimum to $P$ and $Q$ only: $70 + 75 - 100$.",
      "3": "Applies the two-set minimum to $P$ and $R$ only: $70 + 80 - 100$.",
      "4": "Applies the two-set minimum to $Q$ and $R$ only: $75 + 80 - 100$.",
    },
    numeric_check: "70+75+80-2*100",
    check() {
      // Exhaustive search: smallest triple-region size t for which some
      // assignment of the seven Venn regions fits in 100 elements.
      const total = 100;
      const sP = 70;
      const sQ = 75;
      const sR = 80;
      const feasible = (t) => {
        for (let pq = 0; pq + t <= Math.min(sP, sQ); pq++) {
          for (let pr = 0; t + pq + pr <= sP; pr++) {
            for (
              let qr = 0;
              t + pq + qr <= sQ && t + pr + qr <= sR;
              qr++
            ) {
              const oP = sP - t - pq - pr;
              const oQ = sQ - t - pq - qr;
              const oR = sR - t - pr - qr;
              if (oP < 0 || oQ < 0 || oR < 0) continue;
              if (oP + oQ + oR + pq + pr + qr + t <= total) return true;
            }
          }
        }
        return false;
      };
      for (let t = 0; t <= Math.min(sP, sQ, sR); t++) {
        if (feasible(t)) return { kind: "value", value: t };
      }
      throw new Error("no feasible triple overlap found");
    },
  },

  // ── 11. D5 PS pure (three sets with a neither region; exactly two) ─────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 5,
    stem_md:
      "Each of the $120$ elements of a certain set was tested for three properties, $X$, $Y$, and $Z$. Exactly $65$ of the elements have property $X$, exactly $50$ have property $Y$, and exactly $35$ have property $Z$. If exactly $10$ elements have all three properties and exactly $15$ elements have none of the properties, how many elements have exactly two of the properties?",
    choices: ["$10$", "$25$", "$35$", "$45$", "$70$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe union holds $120 - 15 = 105$ elements. Summing the set sizes counts exactly-two elements twice and all-three elements three times: $65 + 50 + 35 = 105 + d + 2(10)$, where $d$ is the exactly-two count. So $150 = 125 + d$, giving $d = 25$.\n\n**Trigger cue**\n\nThree set sizes with a none-count: convert the total to the union first, then read the surplus as pairs once, triples twice.\n\n**Takeaway**\n\nSurplus over the union counts pairs once and triples twice.",
    fastest_path_md:
      "Union $105$; surplus $150 - 105 = 45$ counts the $10$ triples twice: $45 - 2(10) = 25$.",
    trap_map: {
      "0": "Uses the total $120$ instead of the union $105$, forgetting to remove the $15$ with none.",
      "2": "Subtracts the all-three count only once from the surplus, $45 - 10$.",
      "3": "Reports the raw surplus $150 - 105$ as the exactly-two count.",
      "4": "Solves for the exactly-one count instead of exactly two.",
    },
    numeric_check: "65+50+35-(120-15)-2*10",
    check() {
      // Exhaustive search over the pairwise-only regions with the triple and
      // neither counts fixed; the exactly-two total must be invariant.
      const total = 120;
      const sX = 65;
      const sY = 50;
      const sZ = 35;
      const triple = 10;
      const none = 15;
      const answers = new Set();
      let models = 0;
      for (let xy = 0; xy + triple <= Math.min(sX, sY); xy++) {
        for (let xz = 0; xy + xz + triple <= sX; xz++) {
          for (
            let yz = 0;
            xy + yz + triple <= sY && xz + yz + triple <= sZ;
            yz++
          ) {
            const oX = sX - xy - xz - triple;
            const oY = sY - xy - yz - triple;
            const oZ = sZ - xz - yz - triple;
            if (oX < 0 || oY < 0 || oZ < 0) continue;
            const covered = oX + oY + oZ + xy + xz + yz + triple;
            if (covered + none !== total) continue;
            models++;
            answers.add(xy + xz + yz);
          }
        }
      }
      if (models < 3) throw new Error("too few models found: " + models);
      if (answers.size !== 1)
        throw new Error("exactly-two not invariant: " + [...answers].join(","));
      return { kind: "value", value: [...answers][0] };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
