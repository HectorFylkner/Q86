/**
 * Batch: abs_value_number_line_decimals (fundamental_skill value_order_factors,
 * content_domain algebra). Eight items, one per requested difficulty/format/
 * context cell. Every check() recomputes the answer by brute force over a
 * discretized number line (integer tenths/hundredths so the arithmetic is
 * exact), never by transcribing the solution algebra.
 *
 * Run: node scripts/author/batch-abs_value_number_line_decimals.mjs
 * (dry run unless APPEND=1)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D3 PS pure — symmetry of the two solutions of a distance equation
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 3,
    stem_md:
      "On the number line, the distance between $x$ and $-2.5$ is exactly $4.1$. What is the sum of the two possible values of $x$?",
    choices: ["$-8.2$", "$-6.6$", "$-5$", "$1.6$", "$5$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe condition is $|x - (-2.5)| = 4.1$, so $x = -2.5 + 4.1 = 1.6$ or $x = -2.5 - 4.1 = -6.6$. The sum is $1.6 + (-6.6) = -5$.\n\n**Trigger cue**\n\nWhen a distance equation has two solutions and the question asks for their sum, use symmetry about the center.\n\n**Takeaway**\n\nSolutions of $|x - c| = r$ sum to $2c$.",
    fastest_path_md:
      "The two solutions sit symmetrically about the center $-2.5$, so they sum to $2(-2.5) = -5$ — no need to find either one.",
    trap_map: {
      "0": "Adds the two signed deviations $-4.1 - 4.1$ instead of the two solutions.",
      "1": "Keeps only the left solution $-2.5 - 4.1 = -6.6$.",
      "3": "Keeps only the right solution $-2.5 + 4.1 = 1.6$.",
      "4": "Misreads the center as $+2.5$ and sums that pair of solutions.",
    },
    numeric_check: "(-2.5)*2",
    check() {
      // brute force in integer tenths: x = t/10, center -25, radius 41
      const sols = [];
      for (let t = -2000; t <= 2000; t++) {
        if (Math.abs(t - -25) === 41) sols.push(t);
      }
      if (sols.length !== 2) throw new Error(`expected 2 solutions, got ${sols.length}`);
      return { kind: "value", value: (sols[0] + sols[1]) / 10 };
    },
  },

  // 2. D3 PS real — width of a tolerance band (currency decimals)
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 3,
    stem_md:
      "Throughout one trading day, the price $p$ of a stock, in dollars, satisfied $|p - 42.60| \\le 1.85$. In dollars, what is the greatest possible difference between two prices at which the stock traded that day?",
    choices: ["$\\$1.85$", "$\\$3.70$", "$\\$40.75$", "$\\$44.45$", "$\\$46.30$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe condition confines $p$ to the interval from $42.60 - 1.85 = 40.75$ to $42.60 + 1.85 = 44.45$. The greatest possible difference between two prices is the full width of that interval: $44.45 - 40.75 = 3.70$.\n\n**Trigger cue**\n\nWhen $|x - c| \\le r$ bounds a quantity and the question asks for a maximum spread, compare the interval's endpoints.\n\n**Takeaway**\n\nA tolerance of radius $r$ spans a width of $2r$.",
    fastest_path_md:
      "An interval $|p - c| \\le r$ has width $2r$: the answer is $2(1.85) = \\$3.70$, with no need to compute either endpoint.",
    trap_map: {
      "0": "Uses the radius alone, forgetting the price can deviate in both directions.",
      "2": "Reports the least possible price $40.75$ instead of the difference.",
      "3": "Reports the greatest possible price $44.45$ instead of the difference.",
      "4": "Adds the full width $3.70$ to the center $42.60$.",
    },
    numeric_check: "2*1.85",
    check() {
      // brute force in cents: prices c with |c - 4260| <= 185
      let min = Infinity;
      let max = -Infinity;
      for (let c = 0; c <= 10000; c++) {
        if (Math.abs(c - 4260) <= 185) {
          if (c < min) min = c;
          if (c > max) max = c;
        }
      }
      if (!Number.isFinite(min)) throw new Error("no admissible prices found");
      return { kind: "value", value: (max - min) / 100 };
    },
  },

  // 3. D4 PS pure — minimizing a sum of three distances (median principle)
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "For real numbers $x$, what is the least possible value of $|x - 3.5| + |x + 1.5| + |x - 7|$?",
    choices: ["$5$", "$8.5$", "$9$", "$12$", "$13.5$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe expression is the total distance from $x$ to the three anchors $-1.5$, $3.5$, and $7$. A sum of distances to an odd number of points is minimized at the median anchor, $x = 3.5$. There the value is $0 + 5 + 3.5 = 8.5$ — the two outer anchors contribute exactly their spread $7 - (-1.5)$.\n\n**Trigger cue**\n\nWhen a sum of absolute values of $x$ minus constants must be minimized, place $x$ at the median constant.\n\n**Takeaway**\n\nSums of distances are minimized at the median anchor.",
    fastest_path_md:
      "Set $x$ at the median anchor $3.5$: the outer pair contributes its spread $7 - (-1.5) = 8.5$ and the middle term contributes $0$.",
    trap_map: {
      "0": "Uses only the spread between $-1.5$ and $3.5$, ignoring the anchor at $7$.",
      "2": "Minimizes at the mean of the anchors, $x = 3$, which gives $9$.",
      "3": "Evaluates at the anchor $x = 7$ (equivalently, adds the three anchors' magnitudes).",
      "4": "Evaluates at the anchor $x = -1.5$.",
    },
    numeric_check: "7-(-1.5)",
    check() {
      // brute force in integer tenths over a wide window
      let best = Infinity;
      for (let t = -1000; t <= 1000; t++) {
        const f = Math.abs(t - 35) + Math.abs(t + 15) + Math.abs(t - 70);
        if (f < best) best = f;
      }
      return { kind: "value", value: best / 10 };
    },
  },

  // 4. D4 DS pure — magnitude comparison: squares vs. order
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "On the number line, is the point $x$ farther from $0$ than the point $y$ is?\n\n(1) $x^2 > y^2$\n\n(2) $x > y$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nThe question asks: is $|x| > |y|$? For any reals, $x^2 > y^2$ holds exactly when $|x| > |y|$, since squaring erases sign and preserves the order of magnitudes. Statement (1) is therefore a restatement of the question — sufficient, answer yes. Statement (2) orders positions, not magnitudes: $x = 5, y = 1$ gives yes, while $x = 1, y = -5$ gives no — insufficient.\n\n**Trigger cue**\n\nWhen a question compares distances from zero, translate every statement into magnitudes before judging it.\n\n**Takeaway**\n\nComparing squares compares magnitudes; comparing positions does not.",
    fastest_path_md:
      "$x^2 > y^2 \\iff |x| > |y|$, so (1) answers the question outright. (2) dies on the pair $x = 1$, $y = -5$.",
    trap_map: {
      "1": "Trusts $x > y$ to order magnitudes — it fails when $y$ is a large negative like $-5$.",
      "2": "Combines out of caution, believing (1) still needs sign information from (2).",
      "3": "Accepts (2) after testing only pairs on the positive side of zero.",
      "4": "Rejects (1) for not fixing the signs of $x$ and $y$, which magnitudes never need.",
    },
    numeric_check: null,
    check() {
      // enumerate models on a tenths grid; question: is |x| > |y|?
      const models = [];
      for (let tx = -30; tx <= 30; tx++) {
        for (let ty = -30; ty <= 30; ty++) {
          models.push({
            s1: tx * tx > ty * ty,
            s2: tx > ty,
            ans: Math.abs(tx) > Math.abs(ty),
          });
        }
      }
      const sufficient = (pred) => {
        const pool = models.filter(pred);
        if (pool.length < 5) throw new Error("too few models for a statement");
        return pool.every((m) => m.ans) || pool.every((m) => !m.ans);
      };
      if (!models.some((m) => m.s1 && m.s2)) throw new Error("statements inconsistent");
      const s1 = sufficient((m) => m.s1);
      const s2 = sufficient((m) => m.s2);
      const both = sufficient((m) => m.s1 && m.s2);
      let index;
      if (s1 && s2) index = 3;
      else if (s1) index = 0;
      else if (s2) index = 1;
      else if (both) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 5. D4 PS real — intersection of two tolerance intervals
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "A machine shop turns steel pins of diameter $d$ centimeters. Vendor P accepts a pin only if $|d - 2.50| \\le 0.06$, and vendor Q accepts a pin only if $|d - 2.42| \\le 0.05$. The diameters acceptable to both vendors form an interval of what total length, in centimeters?",
    choices: ["$0.03$", "$0.05$", "$0.08$", "$0.11$", "$0.19$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nVendor P accepts the interval $[2.44,\\ 2.56]$ and vendor Q accepts $[2.37,\\ 2.47]$. Their intersection runs from the larger left endpoint $2.44$ to the smaller right endpoint $2.47$, an interval of length $2.47 - 2.44 = 0.03$.\n\n**Trigger cue**\n\nWhen two tolerance conditions must hold at once, unpack each into an interval and intersect the endpoints.\n\n**Takeaway**\n\nIntersect intervals: larger left endpoint to smaller right endpoint.",
    fastest_path_md:
      "Unpack both: $[2.44, 2.56]$ and $[2.37, 2.47]$. Overlap is $[2.44, 2.47]$ — length $0.03$.",
    trap_map: {
      "1": "Uses vendor Q's radius $0.05$ as the overlap length.",
      "2": "Uses the distance between the two centers, $2.50 - 2.42$.",
      "3": "Adds the two radii $0.06 + 0.05$ instead of intersecting the intervals.",
      "4": "Measures the union $[2.37,\\ 2.56]$ instead of the intersection.",
    },
    numeric_check: "2.47-2.44",
    check() {
      // brute force in integer hundredths of a centimeter
      let min = Infinity;
      let max = -Infinity;
      for (let h = 0; h <= 600; h++) {
        if (Math.abs(h - 250) <= 6 && Math.abs(h - 242) <= 5) {
          if (h < min) min = h;
          if (h > max) max = h;
        }
      }
      if (!Number.isFinite(min)) throw new Error("empty intersection");
      return { kind: "value", value: (max - min) / 100 };
    },
  },

  // 6. D5 PS pure — extremizing |2x - y| over two decimal tolerance bands
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 5,
    stem_md:
      "If $|x| \\le 3.5$ and $|y - 2| \\le 1.5$, what is the greatest possible value of $|2x - y|$?",
    choices: ["$6.5$", "$7$", "$9$", "$10.5$", "$12$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nHere $2x$ ranges over $[-7,\\ 7]$ and $y$ over $[0.5,\\ 3.5]$, so $2x - y$ ranges over $[-7 - 3.5,\\ 7 - 0.5] = [-10.5,\\ 6.5]$. The absolute value is maximized at whichever endpoint lies farther from $0$: $|-10.5| = 10.5 > 6.5$. The maximum is $10.5$, at $x = -3.5$, $y = 3.5$.\n\n**Trigger cue**\n\nWhen an absolute value of a linear combination must be maximized over intervals, test both extreme ends — the negative end can win.\n\n**Takeaway**\n\nMaximize $|E|$ by checking both the largest and smallest values of $E$.",
    fastest_path_md:
      "Push $2x - y$ to both extremes: high end $7 - 0.5 = 6.5$, low end $-7 - 3.5 = -10.5$. The magnitude winner is $10.5$.",
    trap_map: {
      "0": "Maximizes $2x - y$ itself ($7 - 0.5$) and never checks the negative extreme.",
      "1": "Maximizes $|2x|$ alone and ignores $y$ entirely.",
      "2": "Pins $y$ at its center $2$ instead of its extreme $3.5$.",
      "4": "Adds every bound in sight: $7 + 3.5 + 1.5$.",
    },
    numeric_check: "2*3.5+3.5",
    check() {
      // brute force over integer tenths: x = tx/10, y = ty/10
      let best = -Infinity;
      for (let tx = -35; tx <= 35; tx++) {
        for (let ty = 5; ty <= 35; ty++) {
          const v = Math.abs(2 * tx - ty);
          if (v > best) best = v;
        }
      }
      return { kind: "value", value: best / 10 };
    },
  },

  // 7. D4 PS pure — internal division point with a 3:1 distance ratio
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 4,
    stem_md:
      "On the number line, point $A$ has coordinate $-1.4$ and point $B$ has coordinate $3.2$. Point $P$ lies between $A$ and $B$, and the distance from $P$ to $A$ is $3$ times the distance from $P$ to $B$. What is the coordinate of $P$?",
    choices: ["$-0.25$", "$0.9$", "$1.15$", "$2.05$", "$5.5$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nWith $P$ between $A$ and $B$, the distances are $P - (-1.4)$ and $3.2 - P$, so $P + 1.4 = 3(3.2 - P)$. Then $4P = 9.6 - 1.4 = 8.2$, giving $P = 2.05$. Check: $|P - A| = 3.45 = 3(1.15) = 3|P - B|$.\n\n**Trigger cue**\n\nWhen a point splits a segment in a given distance ratio, drop the absolute values using the between condition and solve linearly.\n\n**Takeaway**\n\nA $3{:}1$ split sits three-quarters of the way across.",
    fastest_path_md:
      "$P$ is $\\tfrac{3}{4}$ of the way from $A$ to $B$: $-1.4 + \\tfrac{3}{4}(4.6) = -1.4 + 3.45 = 2.05$.",
    trap_map: {
      "0": "Flips the ratio and solves $3|P - A| = |P - B|$.",
      "1": "Takes the midpoint of $A$ and $B$, ignoring the ratio.",
      "2": "Reports the distance from $P$ to $B$ instead of the coordinate of $P$.",
      "4": "Drops the between condition and lands on the external division point.",
    },
    numeric_check: "(-1.4+3*3.2)/4",
    check() {
      // brute force in integer hundredths: A = -140, B = 320, strict between
      const hits = [];
      for (let k = -139; k <= 319; k++) {
        if (Math.abs(k - -140) === 3 * Math.abs(k - 320)) hits.push(k);
      }
      if (hits.length !== 1) throw new Error(`expected 1 point, got ${hits.length}`);
      return { kind: "value", value: hits[0] / 100 };
    },
  },

  // 8. D2 PS real — signed decimals: distance across zero
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "abs_value_number_line_decimals",
    difficulty: 2,
    stem_md:
      "At dawn, the temperature at a weather station was $-4.6°$C. By mid-afternoon, the temperature had risen steadily to $7.8°$C. By how many degrees Celsius did the temperature rise?",
    choices: ["$-12.4$", "$3.2$", "$11.4$", "$12.4$", "$13.4$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe rise is the distance on the number line from $-4.6$ to $7.8$: $7.8 - (-4.6) = 7.8 + 4.6 = 12.4$ degrees.\n\n**Trigger cue**\n\nWhen a change crosses zero, subtract the signed values — the two magnitudes add.\n\n**Takeaway**\n\nDistance across zero is the sum of the two magnitudes.",
    fastest_path_md:
      "Both readings' distances to $0$ add: $4.6 + 7.8 = 12.4$.",
    trap_map: {
      "0": "Subtracts in the wrong order, $-4.6 - 7.8$, and reports the signed result.",
      "1": "Subtracts the magnitudes, $7.8 - 4.6$, ignoring that $-4.6$ is below zero.",
      "2": "Misreads $-4.6$ as $-3.6$ before adding.",
      "4": "Makes a carry slip when adding $7.8 + 4.6$.",
    },
    numeric_check: "7.8+4.6",
    check() {
      // in integer tenths: distance on the number line from -46 to 78
      const dawn = -46;
      const afternoon = 78;
      return { kind: "value", value: Math.abs(afternoon - dawn) / 10 };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
