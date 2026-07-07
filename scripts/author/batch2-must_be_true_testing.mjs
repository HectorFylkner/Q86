/**
 * Second authoring wave for must_be_true_testing: +1 to clear the ~25
 * floor. The check() enumerates a fine grid of test values, keeps those
 * satisfying the hypothesis, and confirms exactly one choice holds for
 * every surviving value — deriving the correct index independently.
 *
 * Run: node --experimental-strip-types scripts/author/batch2-must_be_true_testing.mjs [--append]
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 4,
    stem_md:
      "If $x^{3} < x$, which of the following must be true?",
    choices: [
      "$x < 1$",
      "$x < 0$",
      "$|x| < 1$",
      "$x^{2} < 1$",
      "$\\dfrac{1}{x} > 1$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\n$x^{3} < x \\iff x^{3} - x < 0 \\iff x(x - 1)(x + 1) < 0$. A sign chart gives the solution $x < -1$ or $0 < x < 1$. Test the choices against both regions. $x < 1$ holds throughout (every value is below $1$). Each other choice fails somewhere: $x < 0$ fails at $x = 0.5$; $|x| < 1$ and $x^{2} < 1$ fail at $x = -2$; $\\tfrac{1}{x} > 1$ fails at $x = -2$ (it is negative there).\n\n**Trigger cue**\n\n\"Must be true\" under a cubic inequality: solve the sign chart, then test each option in every region.\n\n**Takeaway**\n\nA must-be-true claim has to survive every region of the solution set.",
    fastest_path_md:
      "The solution set is $x < -1$ or $0 < x < 1$; only $x < 1$ covers both. A single value from each region ($-2$ and $0.5$) kills the rest.",
    trap_map: {
      "1": "Tests only the negative region and misses $0 < x < 1$.",
      "2": "Tests only the fractional region $0 < x < 1$ and misses $x < -1$.",
      "3": "Same one-region blind spot: $x^{2} < 1$ fails for $x < -1$.",
      "4": "Assumes $\\tfrac{1}{x} > 1$ from the $(0,1)$ region, ignoring the negative branch.",
    },
    numeric_check: null,
    check() {
      // Fine grid across the relevant range; keep values satisfying the
      // hypothesis, then find the choice-index true for all of them.
      const grid = [];
      for (let t = -300; t <= 300; t++) grid.push(t / 100);
      const valid = grid.filter((x) => x ** 3 < x);
      const preds = [
        (x) => x < 1,
        (x) => x < 0,
        (x) => Math.abs(x) < 1,
        (x) => x ** 2 < 1,
        (x) => x !== 0 && 1 / x > 1,
      ];
      const universal = preds
        .map((p, i) => [i, valid.every(p)])
        .filter(([, ok]) => ok)
        .map(([i]) => i);
      if (universal.length !== 1) {
        throw new Error(`expected one universal choice, got ${universal}`);
      }
      return { kind: "index", index: universal[0] };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
