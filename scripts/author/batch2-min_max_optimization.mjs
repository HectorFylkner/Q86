/**
 * Batch 2: 11 new min_max_optimization items (equal_unequal_alg).
 * Cells: D2 PS pure, D3 PS pure, D4 PS real, D4 PS real, D3 PS pure,
 *        D5 DS real, D4 DS pure, D4 PS real, D5 PS pure, D3 PS real,
 *        D3 PS pure.
 * New angles vs. the existing set: square/absolute-value extremes on
 * intervals, count-above-threshold under a mean, integer-vertex quadratic
 * revenue, distinct-product AM-GM, pigeonhole DS on a capped distinct sum,
 * squeeze-to-a-point DS, greedy-rate-fails budget, minimize-the-maximum
 * under a median, exact-spend Diophantine count, sum-of-squares minimum.
 *
 * Run from repo root:
 *   node --experimental-strip-types scripts/author/batch2-min_max_optimization.mjs
 * (dry run unless --append)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

/** Map per-statement sufficiency booleans to the canonical DS index. */
function dsIndex(suf1, suf2, suf12) {
  if (suf1 && suf2) return 3;
  if (suf1) return 0;
  if (suf2) return 1;
  if (suf12) return 2;
  return 4;
}

const items = [
  // ── 1. D2 PS pure — square extremes on an interval ───────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 2,
    stem_md:
      "If $-5 \\le x \\le 3$, what is the greatest possible value of $x^2$?",
    choices: ["$0$", "$9$", "$15$", "$25$", "$64$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$x^2$ grows with the distance of $x$ from $0$, so on an interval its maximum occurs at the endpoint of greater absolute value. Here $|-5| = 5 > 3$, so the maximum is $(-5)^2 = 25$.\n\n**Trigger cue**\n\nExtremes of $x^2$ or $|x|$ over an interval: compare endpoint magnitudes, not just endpoints.\n\n**Takeaway**\n\nOn an interval, extremes of $x^2$ come from endpoint magnitudes.",
    fastest_path_md:
      "The endpoint farther from $0$ is $-5$, and $(-5)^2 = 25$.",
    trap_map: {
      "0": "Reports the least value of $x^2$ on the interval instead of the greatest.",
      "1": "Squares the right endpoint $3$, assuming the greatest $x$ gives the greatest square.",
      "2": "Computes $|(-5)(3)| = 15$, multiplying the endpoints instead of squaring one.",
      "4": "Squares the interval's length $3 - (-5) = 8$.",
    },
    numeric_check: "25",
    check() {
      let best = -Infinity;
      for (let i = -500; i <= 300; i++) {
        const x = i / 100;
        best = Math.max(best, x * x);
      }
      return { kind: "value", value: best };
    },
  },

  // ── 2. D3 PS pure — sum of two absolute values ───────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 3,
    stem_md:
      "What is the least possible value of $|x - 3| + |x + 5|$?",
    choices: ["$-2$", "$0$", "$2$", "$8$", "$15$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$|x - 3| + |x + 5|$ is the total distance from $x$ to the two anchors $3$ and $-5$. For any $x$ between $-5$ and $3$, that total is exactly the gap between the anchors, $3 - (-5) = 8$; for $x$ outside the interval it is larger. The minimum is $8$.\n\n**Trigger cue**\n\nA sum of two absolute-value terms in one variable: read it as distances to two anchors.\n\n**Takeaway**\n\nSum of two distances is least between the anchor points.",
    fastest_path_md:
      "Between the anchors $-5$ and $3$ the sum is just the gap: $8$. Test $x = 0$: $3 + 5 = 8$.",
    trap_map: {
      "0": "Computes $3 - 5 = -2$, treating the expression as a plain difference.",
      "1": "Assumes both absolute values can equal zero at the same time.",
      "2": "Subtracts the anchors' distances from zero, $|-5| - |3| = 2$.",
      "4": "Multiplies the anchor magnitudes $3 \\cdot 5$ instead of adding distances.",
    },
    numeric_check: "8",
    check() {
      let best = Infinity;
      for (let i = -2000; i <= 2000; i++) {
        const x = i / 100;
        best = Math.min(best, Math.abs(x - 3) + Math.abs(x + 5));
      }
      return { kind: "value", value: best };
    },
  },

  // ── 3. D4 PS real — count above a threshold under a fixed mean ───────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 4,
    stem_md:
      "Each of the $11$ students in a class received an integer score from $40$ to $100$, inclusive, on a test, and the average (arithmetic mean) of the $11$ scores was $84$. What is the greatest possible number of students who scored more than $90$?",
    choices: ["$5$", "$8$", "$9$", "$10$", "$11$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe total is $11 \\cdot 84 = 924$. If $k$ students scored more than $90$, each of them scored at least $91$, and each of the other $11 - k$ scored at least $40$. So $91k + 40(11 - k) \\le 924$, giving $51k \\le 484$ and $k \\le 9.49$, hence $k \\le 9$. And $k = 9$ works: nine scores of $91$ total $819$, and the remaining two students can score $45$ and $60$ to reach $924$.\n\n**Trigger cue**\n\n\"Greatest number of members above a threshold\" with a fixed average: floor everyone else, put the counted group at the threshold.\n\n**Takeaway**\n\nPush every other value to its floor, counted values to the threshold.",
    fastest_path_md:
      "Backsolve the big choices: $10$ high scorers need at least $91 \\cdot 10 + 40 = 950 > 924$ — impossible; $9$ need only $819 + 80 = 899 \\le 924$ — feasible. Answer $9$.",
    trap_map: {
      "0": "Divides the surplus $924 - 440 = 484$ by $91$ instead of by the $51$-point gap.",
      "1": "Forces each high scorer to $100$, solving $100k + 40(11 - k) \\le 924$.",
      "3": "Lets the other students score $0$, ignoring the $40$-point minimum.",
      "4": "Assumes all $11$ can top $90$, though that would push the average above $90$.",
    },
    numeric_check: "9",
    check() {
      // DP over achievable totals: k students in [91,100], the rest in [40,90].
      const total = 11 * 84;
      for (let k = 11; k >= 0; k--) {
        let sums = new Set([0]);
        for (let s = 0; s < 11; s++) {
          const lo = s < k ? 91 : 40;
          const hi = s < k ? 100 : 90;
          const next = new Set();
          for (const cur of sums) {
            for (let v = lo; v <= hi; v++) {
              if (cur + v <= total) next.add(cur + v);
            }
          }
          sums = next;
        }
        if (sums.has(total)) return { kind: "value", value: k };
      }
      throw new Error("no feasible k");
    },
  },

  // ── 4. D4 PS real — quadratic revenue with an integer price ──────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 4,
    stem_md:
      "When a café charges $p$ dollars for a smoothie, where $p$ is a positive integer, it sells $130 - 4p$ smoothies per day. What is the greatest daily revenue, in dollars, that the café can earn from smoothie sales?",
    choices: ["$676$", "$1{,}054$", "$1{,}056$", "$1{,}057$", "$4{,}225$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nRevenue is $R(p) = p(130 - 4p) = 130p - 4p^2$, a downward parabola with vertex at $p = \\frac{130}{8} = 16.25$. Since $p$ must be a whole number, test the flanking integers: $R(16) = 16 \\cdot 66 = 1056$ and $R(17) = 17 \\cdot 62 = 1054$. The maximum is $1056$.\n\n**Trigger cue**\n\nAn integer input maximizing a quadratic: locate the vertex, then test the flanking integers.\n\n**Takeaway**\n\nWhen the vertex is not an integer, test both neighboring integers.",
    fastest_path_md:
      "The vertex of $p(130 - 4p)$ sits at $p = 16.25$, so only $p = 16$ or $p = 17$ can win: $16 \\cdot 66 = 1056$ beats $17 \\cdot 62 = 1054$.",
    trap_map: {
      "0": "Sets the price equal to the number of smoothies sold, $p = 26$, and takes $26 \\cdot 26$.",
      "1": "Rounds the vertex $p = 16.25$ up to $17$, giving $17 \\cdot 62 = 1054$.",
      "3": "Rounds the unconstrained vertex revenue $1056.25$ up to the next whole dollar.",
      "4": "Drops the coefficient $4$ and maximizes $p(130 - p)$ at $p = 65$.",
    },
    numeric_check: "16*(130 - 4*16)",
    check() {
      let best = -Infinity;
      for (let p = 1; p <= 40; p++) {
        const cups = 130 - 4 * p;
        if (cups < 0) continue;
        best = Math.max(best, p * cups);
      }
      return { kind: "value", value: best };
    },
  },

  // ── 5. D3 PS pure — max product of distinct integers, fixed sum ──────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 3,
    stem_md:
      "What is the greatest possible value of the product of three different positive integers whose sum is $60$?",
    choices: ["$114$", "$6{,}840$", "$7{,}920$", "$7{,}980$", "$8{,}000$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nFor a fixed sum, a product increases as the factors move closer together: replacing a pair $(a, b)$ with $(a+1, b-1)$ when $b - a \\ge 2$ raises the product. So the three different integers should be as close as possible — the consecutive integers $19, 20, 21$, which sum to $60$. Their product is $19 \\cdot 20 \\cdot 21 = 7980$.\n\n**Trigger cue**\n\nMaximize a product with a fixed sum: cluster the factors as tightly as the constraints allow.\n\n**Takeaway**\n\nWith a fixed sum, make values as nearly equal as allowed.",
    fastest_path_md:
      "Three different integers as close as possible to $60/3 = 20$ are $19, 20, 21$: product $7980$.",
    trap_map: {
      "0": "Computes the least possible product, $1 \\cdot 2 \\cdot 57$, instead of the greatest.",
      "1": "Uses the consecutive integers $18, 19, 20$ ending at the mean instead of centered on it.",
      "2": "Spaces the integers two apart as $18, 20, 22$, drifting from the near-equal optimum.",
      "4": "Uses $20^3$, ignoring that the three integers must be different.",
    },
    numeric_check: "19*20*21",
    check() {
      let best = -Infinity;
      for (let a = 1; a <= 58; a++) {
        for (let b = a + 1; b <= 58; b++) {
          const c = 60 - a - b;
          if (c <= b) continue;
          best = Math.max(best, a * b * c);
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ── 6. D5 DS real — pigeonhole on a capped distinct sum ──────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 5,
    stem_md:
      "A charity distributed a total of $\\$750$ among a group of recipients, giving each recipient a whole number of dollars and giving each recipient at least $\\$50$. Did any recipient receive more than $\\$95$?\n\n(1) There were exactly $8$ recipients.\n\n(2) No two recipients received the same amount.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nStatement (1): eight payments of $95, 95, 95, 95, 95, 95, 90, 90$ total $750$ (No), while seven payments of $\\$50$ plus one of $\\$400$ also total $750$ (Yes). Not sufficient. Statement (2): $\\$50$ and $\\$700$ to two recipients gives Yes, while the nine distinct payments $79, 80, \\ldots, 86, 90$ total $750$ with none above $\\$95$ (No). Not sufficient. Together: eight distinct whole-dollar amounts each at most $\\$95$ can total at most $88 + 89 + \\cdots + 95 = 732 < 750$, so some payment must exceed $\\$95$ — a definite Yes. Sufficient. Answer: both together.\n\n**Trigger cue**\n\nA yes/no question about a largest share under a fixed total: cap every share and compare the maximum capped sum with the total.\n\n**Takeaway**\n\nCompare the capped maximum total with the required total.",
    fastest_path_md:
      "Combined: the eight largest distinct amounts not exceeding $\\$95$ are $\\$88$ through $\\$95$, totaling $732 < 750$ — forced Yes. Each statement alone has quick counterexamples (six $\\$95$s plus two $\\$90$s; or $79$–$86$ plus $90$ across nine people).",
    trap_map: {
      "0": "Assumes eight recipients averaging about $\\$94$ must include one above $\\$95$, overlooking repeats such as six $\\$95$s and two $\\$90$s.",
      "1": "Assumes distinct amounts force a payment above $\\$95$ without knowing how many recipients there are.",
      "3": "Credits each statement alone, missing the counterexamples that keep every payment at or below $\\$95$.",
      "4": "Never tests the combined cap $88 + 89 + \\cdots + 95 = 732 < 750$, which forces a Yes.",
    },
    numeric_check: null,
    check() {
      const TOTAL = 750;
      const MIN = 50;
      const CAP = 95;
      // Depth-first search for a payment tuple (nondecreasing; strictly
      // increasing when distinct) of n integers in [lo, hi] summing to
      // `sum` and satisfying pred. Prunes on remaining-sum bounds.
      function exists(n, lo, hi, sum, distinct, pred) {
        const rec = (tuple, minNext, remaining, slots) => {
          if (slots === 0) return remaining === 0 && pred(tuple);
          for (let v = minNext; v <= hi; v++) {
            const rest = remaining - v;
            const lowNext = distinct ? v + 1 : v;
            let minRest = 0;
            let maxRest = 0;
            for (let s = 0; s < slots - 1; s++) {
              minRest += distinct ? lowNext + s : lowNext;
              maxRest += distinct ? hi - s : hi;
            }
            if (rest < minRest) break;
            if (rest > maxRest) continue;
            tuple.push(v);
            if (rec(tuple, lowNext, rest, slots - 1)) {
              tuple.pop();
              return true;
            }
            tuple.pop();
          }
          return false;
        };
        return rec([], lo, sum, n);
      }
      const anyAboveCap = (t) => t[t.length - 1] > CAP;
      const always = () => true;
      const ns = [];
      for (let n = 2; n * MIN <= TOTAL; n++) ns.push(n);
      // For each statement's model family, can the answer be Yes? be No?
      const canYes = (nList, distinct) =>
        nList.some((n) => exists(n, MIN, TOTAL, TOTAL, distinct, anyAboveCap));
      const canNo = (nList, distinct) =>
        nList.some((n) => exists(n, MIN, CAP, TOTAL, distinct, always));
      const sufficient = (nList, distinct) => {
        const y = canYes(nList, distinct);
        const no = canNo(nList, distinct);
        if (!y && !no) throw new Error("no models for statement");
        return y !== no; // exactly one answer possible
      };
      const suf1 = sufficient([8], false);
      const suf2 = sufficient(ns, true);
      const suf12 = sufficient([8], true);
      return { kind: "index", index: dsIndex(suf1, suf2, suf12) };
    },
  },

  // ── 7. D4 DS pure — floors plus a total squeeze a value ──────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 4,
    stem_md:
      "The sum of four integers is $32$. What is the value of the greatest of the four integers?\n\n(1) Each of the four integers is at least $7$.\n\n(2) The greatest of the four integers is at least $11$.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nStatement (1): $8, 8, 8, 8$ and $7, 7, 7, 11$ both qualify, with greatest values $8$ and $11$. Not sufficient. Statement (2): $1, 10, 10, 11$ and $0, 0, 0, 32$ both qualify, with greatest values $11$ and $32$. Not sufficient. Together: the three integers other than the greatest are each at least $7$, so the greatest is at most $32 - 21 = 11$; statement (2) makes it at least $11$. It is exactly $11$ (and the others are forced to $7$). Sufficient. Answer: both together.\n\n**Trigger cue**\n\nA value question with floor constraints and a fixed sum: check whether the bounds squeeze to a single point.\n\n**Takeaway**\n\nFloors plus a fixed total can squeeze a value exactly.",
    fastest_path_md:
      "Combined: the other three integers absorb at least $21$, capping the greatest at $11$, while (2) floors it at $11$ — pinned. Alone, each statement allows two easy cases.",
    trap_map: {
      "0": "Assumes (1) pushes all the slack onto one integer, ignoring even splits such as $8, 8, 8, 8$.",
      "1": "Reads \"at least $11$\" in (2) as \"exactly $11$\".",
      "3": "Makes both errors at once, crediting each statement alone.",
      "4": "Misses that three floors of $7$ leave at most $32 - 21 = 11$, which (2) then pins to equality.",
    },
    numeric_check: null,
    check() {
      // Enumerate all nondecreasing integer 4-tuples with entries in
      // [-25, 60] summing to 32 and decide sufficiency by answer-uniqueness.
      const models = [];
      for (let a = -25; a <= 32; a++) {
        for (let b = a; b <= 60; b++) {
          for (let c = b; c <= 60; c++) {
            const d = 32 - a - b - c;
            if (d < c || d > 60) continue;
            models.push([a, b, c, d]);
          }
        }
      }
      const s1 = (m) => m[0] >= 7;
      const s2 = (m) => m[3] >= 11;
      const m1 = models.filter(s1);
      const m2 = models.filter(s2);
      const m12 = models.filter((m) => s1(m) && s2(m));
      if (m1.length < 2 || m2.length < 2 || m12.length < 1) {
        throw new Error("model space too thin");
      }
      const determined = (set) => new Set(set.map((m) => m[3])).size === 1;
      return {
        kind: "index",
        index: dsIndex(determined(m1), determined(m2), determined(m12)),
      };
    },
  },

  // ── 8. D4 PS real — exact spend beats the greedy per-dollar rate ─────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 4,
    stem_md:
      "A caterer has a budget of $\\$38$ for party platters. Each large platter costs $\\$7$ and serves $9$ people, and each small platter costs $\\$5$ and serves $6$ people. What is the greatest number of people the caterer can serve without exceeding the budget?",
    choices: ["$42$", "$45$", "$48$", "$49$", "$51$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nLet $L$ large and $S$ small platters satisfy $7L + 5S \\le 38$. Large platters serve more per dollar ($9/7 > 6/5$), but five large platters cost $\\$35$, serve $45$, and strand $\\$3$. Check each $L$ from $0$ to $5$ with $S$ maximal: the counts served are $42, 45, 42, 45, 48, 45$. The exact spend $L = 4$, $S = 2$ uses all $\\$38$ and serves $36 + 12 = 48$.\n\n**Trigger cue**\n\nA whole-unit budget maximization: compare the greedy per-dollar answer against combinations that spend the budget exactly.\n\n**Takeaway**\n\nExact spending can beat the best per-dollar rate.",
    fastest_path_md:
      "Look for a zero-waste spend: $4 \\cdot 7 + 2 \\cdot 5 = 38$ exactly, serving $36 + 12 = 48$ — more than five large platters ($45$) that leave $\\$3$ idle.",
    trap_map: {
      "0": "Buys only small platters: seven platters for $\\$35$ serve $42$.",
      "1": "Follows the better per-dollar rate and buys only large platters, stranding $\\$3$.",
      "3": "Converts the whole budget at the large-platter rate, $38 \\cdot 9/7 \\approx 48.9$, and rounds up.",
      "4": "Adds a small platter to five large ones, spending $\\$40$ and breaking the budget.",
    },
    numeric_check: "4*9 + 2*6",
    check() {
      let best = -Infinity;
      for (let L = 0; L <= 6; L++) {
        for (let S = 0; S <= 8; S++) {
          if (7 * L + 5 * S <= 38) best = Math.max(best, 9 * L + 6 * S);
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ── 9. D5 PS pure — minimize the maximum under a median ──────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 5,
    stem_md:
      "Nine distinct positive integers have a sum of $120$ and a median of $10$. What is the least possible value of the greatest of the nine integers?",
    choices: ["$20$", "$21$", "$22$", "$25$", "$27$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe four integers below the median are distinct and at most $9$, so they sum to at most $6 + 7 + 8 + 9 = 30$. To keep the greatest small, maximize everything beneath it: take $6, 7, 8, 9$ and the median $10$, leaving $120 - 40 = 80$ for four distinct integers greater than $10$. If the greatest were $21$, those four could total at most $18 + 19 + 20 + 21 = 78 < 80$ — impossible. With greatest $22$, the set $18, 19, 21, 22$ sums to $80$, and $6, 7, 8, 9, 10, 18, 19, 21, 22$ meets every condition. The answer is $22$.\n\n**Trigger cue**\n\n\"Least possible value of the greatest\": push every other member to its own maximum, then test the boundary.\n\n**Takeaway**\n\nTo minimize the maximum, maximize everything below it.",
    fastest_path_md:
      "Max out the bottom half at $6, 7, 8, 9$ with median $10$; the top four distinct integers must sum to $80$, and a near-equal split gives $18, 19, 21, 22$ — top $22$.",
    trap_map: {
      "0": "Splits the top-four sum $80$ into four equal $20$s, ignoring that the integers are distinct.",
      "1": "Counts the median $10$ among the four smallest values, inflating their maximum sum to $34$.",
      "3": "Minimizes the four smallest values to $1$ through $4$ and splits the resulting $100$ evenly.",
      "4": "Minimizes the four smallest values instead of maximizing them, leaving $100$ for the top four.",
    },
    numeric_check: "22",
    check() {
      // Enumerate every valid configuration: choose the four values below the
      // median from 1..9, then all distinct top-four sets above 10 with the
      // required sum; track the smallest possible maximum.
      let best = Infinity;
      for (let i = 1; i <= 9; i++) {
        for (let j = i + 1; j <= 9; j++) {
          for (let k = j + 1; k <= 9; k++) {
            for (let l = k + 1; l <= 9; l++) {
              const need = 120 - 10 - (i + j + k + l);
              for (let u1 = 11; u1 <= Math.floor(need / 4); u1++) {
                for (let u2 = u1 + 1; u2 <= Math.floor((need - u1) / 3); u2++) {
                  for (
                    let u3 = u2 + 1;
                    u3 <= Math.floor((need - u1 - u2) / 2);
                    u3++
                  ) {
                    const u4 = need - u1 - u2 - u3;
                    if (u4 > u3) best = Math.min(best, u4);
                  }
                }
              }
            }
          }
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ── 10. D3 PS real — exact spend adds a divisibility filter ──────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 3,
    stem_md:
      "A teacher spent exactly $\\$61$ on pens and folders, buying at least one of each. If each pen cost $\\$4$ and each folder cost $\\$7$, what is the greatest total number of pens and folders the teacher could have bought?",
    choices: ["$10$", "$13$", "$14$", "$15$", "$16$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nWith $p$ pens and $f$ folders, $4p + 7f = 61$ and $p, f \\ge 1$. Modulo $4$: $3f \\equiv 1 \\pmod 4$, so $f \\equiv 3 \\pmod 4$, giving $f = 3$ or $f = 7$. Pens are cheaper, so fewer folders means more items: $f = 3$ gives $p = (61 - 21)/4 = 10$ and $13$ items, versus $10$ items at $f = 7$. The answer is $13$.\n\n**Trigger cue**\n\n\"Spent exactly\" with two whole-unit prices: solve the Diophantine equation, then load the cheaper item.\n\n**Takeaway**\n\nExact totals add a divisibility filter to the cheap-heavy rule.",
    fastest_path_md:
      "$61 - 7f$ must be a positive multiple of $4$, which first happens at $f = 3$: $10$ pens $+$ $3$ folders $= 13$ items.",
    trap_map: {
      "0": "Maximizes the $\\$7$ folders instead of the $\\$4$ pens, buying $3$ pens and $7$ folders.",
      "2": "Drops the exact-total requirement and buys $13$ pens plus $1$ folder for $\\$59$.",
      "3": "Spends everything on pens, taking $\\lfloor 61/4 \\rfloor = 15$ and ignoring the folder.",
      "4": "Rounds $61/4$ up to $16$, overspending even before any folder.",
    },
    numeric_check: "13",
    check() {
      let best = -Infinity;
      for (let p = 1; p <= 15; p++) {
        for (let f = 1; f <= 9; f++) {
          if (4 * p + 7 * f === 61) best = Math.max(best, p + f);
        }
      }
      return { kind: "value", value: best };
    },
  },

  // ── 11. D3 PS pure — minimum sum of squares with a fixed sum ─────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "min_max_optimization",
    difficulty: 3,
    stem_md:
      "If $x + y = 8$, what is the least possible value of $x^2 + y^2$?",
    choices: ["$0$", "$16$", "$32$", "$34$", "$64$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWrite $x = 4 + t$ and $y = 4 - t$, which satisfies $x + y = 8$ for every $t$. Then $x^2 + y^2 = (4+t)^2 + (4-t)^2 = 32 + 2t^2 \\ge 32$, with equality at $t = 0$, that is, $x = y = 4$.\n\n**Trigger cue**\n\nMinimize a sum of squares whose variables have a fixed sum: split the sum equally.\n\n**Takeaway**\n\nWith a fixed sum, squares are minimized at the equal split.",
    fastest_path_md:
      "Symmetry says the equal split $x = y = 4$ is optimal: $16 + 16 = 32$.",
    trap_map: {
      "0": "Sets $x = y = 0$, ignoring the constraint $x + y = 8$.",
      "1": "Computes $(8/2)^2 = 16$ but forgets to add the second square.",
      "3": "Assumes $x$ and $y$ must be different integers and uses $3$ and $5$.",
      "4": "Squares the sum, computing $(x + y)^2$ instead of $x^2 + y^2$.",
    },
    numeric_check: "32",
    check() {
      let best = Infinity;
      for (let i = -3000; i <= 3800; i++) {
        const x = i / 100;
        const y = 8 - x;
        best = Math.min(best, x * x + y * y);
      }
      return { kind: "value", value: best };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
