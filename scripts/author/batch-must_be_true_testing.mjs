/**
 * Batch: 12 new must_be_true_testing items (value_order_factors / algebra).
 * Run: node scripts/author/batch-must_be_true_testing.mjs
 * Appends only when APPEND=1; otherwise dry run.
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

// Shared helper for DS checks: given the model list and predicates, decide
// which canonical DS index the enumeration supports.
function dsIndex(models, s1, s2, yes, minModels = { s1: 3, s2: 3, both: 1 }) {
  const suff = (list, min, label) => {
    if (list.length < min) throw new Error(`too few models for ${label}: ${list.length}`);
    const answers = list.map(yes);
    return answers.every((v) => v) || answers.every((v) => !v);
  };
  const m1 = models.filter(s1);
  const m2 = models.filter(s2);
  const m12 = models.filter((v) => s1(v) && s2(v));
  const S1 = suff(m1, minModels.s1, "statement (1)");
  const S2 = suff(m2, minModels.s2, "statement (2)");
  const S12 = suff(m12, minModels.both, "both statements");
  if (S1 && S2) return 3;
  if (S1) return 0;
  if (S2) return 1;
  if (S12) return 2;
  return 4;
}

// Shared helper for PS expression-choice checks: enumerate models, keep the
// predicates that hold on every model, assert exactly one survives.
function onlyAlwaysTrue(models, preds, minModels = 50) {
  if (models.length < minModels) throw new Error(`too few models: ${models.length}`);
  const always = preds.map((p) => models.every((m) => p(...m)));
  const idx = always.flatMap((v, k) => (v ? [k] : []));
  if (idx.length !== 1) throw new Error(`expected exactly one always-true predicate, got [${idx}]`);
  return idx[0];
}

// Shared helper for roman-numeral items: map the must-be-true set to the
// matching choice text and return its index.
function romanIndex(choices, mustFlags) {
  const names = ["I", "II", "III"].filter((_, k) => mustFlags[k]);
  const label = names.length === 3 ? "I, II, and III" : `${names.join(" and ")} only`;
  const index = choices.indexOf(label);
  if (index < 0) throw new Error(`no choice matches "${label}"`);
  return index;
}

const items = [
  // ── 1. D3 PS pure ────────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 3,
    stem_md: "If $a$ and $b$ are numbers such that $\\dfrac{a}{b} > 1$, which of the following must be true?",
    choices: ["$a > b$", "$a > 0$", "$b > 0$", "$a + b > 0$", "$|a| > |b|$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nIf $b > 0$, multiplying $\\frac{a}{b} > 1$ by $b$ gives $a > b > 0$, so $|a| > |b|$. If $b < 0$, multiplying flips the inequality: $a < b < 0$, so again $|a| > |b|$. The pair $a = -3$, $b = -2$ satisfies $\\frac{a}{b} = \\frac{3}{2} > 1$ and defeats every other choice.\n\n**Trigger cue**\n\nA ratio compared with $1$: split on the sign of the denominator, or read $\\left|\\frac{a}{b}\\right| > 1$ directly as a magnitude fact.\n\n**Takeaway**\n\nA ratio exceeding $1$ compares magnitudes, not signed values.",
    fastest_path_md: "Test one negative pair: $a = -3$, $b = -2$ satisfies $\\frac{a}{b} > 1$ and kills every choice except $|a| > |b|$.",
    trap_map: {
      "0": "Multiplies both sides by $b$ without checking that $b$ could be negative.",
      "1": "Assumes a ratio greater than $1$ requires a positive numerator.",
      "2": "Assumes a ratio greater than $1$ requires a positive denominator.",
      "3": "Upgrades the same-sign fact to a positive sum, forgetting the both-negative case.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -24; i <= 24; i++) {
        for (let j = -24; j <= 24; j++) {
          const a = i / 4, b = j / 4;
          if (b === 0) continue;
          if (a / b > 1) models.push([a, b]);
        }
      }
      const preds = [
        (a, b) => a > b,
        (a, b) => a > 0,
        (a, b) => b > 0,
        (a, b) => a + b > 0,
        (a, b) => Math.abs(a) > Math.abs(b),
      ];
      return { kind: "index", index: onlyAlwaysTrue(models, preds) };
    },
  },

  // ── 2. D2 PS pure ────────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 2,
    stem_md: "If $ab = 0$ and $a \\ne 0$, which of the following must be true?",
    choices: ["$a = 0$", "$b = 0$", "$a + b = 0$", "$a > 0$", "$a + b < 0$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nA product equals zero only when at least one factor equals zero. The stem rules out $a = 0$, so $b = 0$ is forced. With $b = 0$ the sum $a + b = a$ is nonzero, and $a$ itself may be positive or negative, so every other choice can fail.\n\n**Trigger cue**\n\n$ab = 0$ together with a nonzero fact: apply the zero-product property to the factor that is not excluded.\n\n**Takeaway**\n\nZero product means some factor is zero — the one not excluded.",
    fastest_path_md: "Zero product with $a \\ne 0$: the zero must be $b$. Testing $a = 1$ and $a = -1$ eliminates the sign choices instantly.",
    trap_map: {
      "0": "Applies the zero-product property to $a$, the factor the stem already rules out.",
      "2": "Believes the two factors must be opposites for the product to vanish.",
      "3": "Assumes the nonzero factor $a$ must be positive.",
      "4": "Assumes the nonzero factor $a$ must be negative, making the sum negative.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -20; i <= 20; i++) {
        for (let j = -20; j <= 20; j++) {
          const a = i / 2, b = j / 2;
          if (a === 0) continue;
          if (a * b === 0) models.push([a, b]);
        }
      }
      const preds = [
        (a, b) => a === 0,
        (a, b) => b === 0,
        (a, b) => a + b === 0,
        (a, b) => a > 0,
        (a, b) => a + b < 0,
      ];
      return { kind: "index", index: onlyAlwaysTrue(models, preds, 10) };
    },
  },

  // ── 3. D3 PS pure ────────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 3,
    stem_md: "If $0 < x < 1$, which of the following must be true?\n\nI. $x^2 < x$\n\nII. $2x > 1$\n\nIII. $\\dfrac{1}{x} > 1$",
    choices: ["I only", "II only", "I and III only", "II and III only", "I, II, and III"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nMultiplying $x < 1$ by the positive number $x$ gives $x^2 < x$, so I holds. Dividing $1 > x$ by the positive number $x$ gives $\\frac{1}{x} > 1$, so III holds. II fails at $x = 0.3$, where $2x = 0.6 < 1$. The answer is I and III only.\n\n**Trigger cue**\n\nA variable confined to $(0,1)$: test one small fraction and one large fraction before trusting any statement.\n\n**Takeaway**\n\nProper fractions shrink when squared and exceed one when reciprocated.",
    fastest_path_md: "Try $x = 0.3$: I and III hold, II fails ($0.6 < 1$). Try $x = 0.9$: I and III still hold. Answer: I and III only.",
    trap_map: {
      "0": "Rejects III by confusing $\\frac{1}{x} > 1$ with $x > 1$.",
      "1": "Tests only a value above $\\frac{1}{2}$, where II happens to hold, and distrusts I and III.",
      "3": "Believes squaring always increases a number, discarding I.",
      "4": "Accepts II after testing a single value greater than $\\frac{1}{2}$.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = 1; i <= 99; i++) models.push([i / 100]);
      const flags = [
        models.every(([x]) => x * x < x),
        models.every(([x]) => 2 * x > 1),
        models.every(([x]) => 1 / x > 1),
      ];
      return { kind: "index", index: romanIndex(q.choices, flags) };
    },
  },

  // ── 4. D3 PS pure ────────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 3,
    stem_md: "If $x < y < 0$, which of the following must be true?",
    choices: [
      "$x^2 < y^2$",
      "$\\dfrac{1}{x} < \\dfrac{1}{y}$",
      "$\\dfrac{1}{x} > \\dfrac{1}{y}$",
      "$xy > 1$",
      "$\\dfrac{x}{y} < 1$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nBoth numbers are negative, so $xy > 0$. Dividing $x < y$ by the positive quantity $xy$ preserves the order: $\\frac{x}{xy} < \\frac{y}{xy}$, that is, $\\frac{1}{y} < \\frac{1}{x}$. So $\\frac{1}{x} > \\frac{1}{y}$ always. The pair $(-2, -1)$ defeats choices A, B, and E, and the pair $\\left(-\\frac{1}{2}, -\\frac{1}{4}\\right)$ defeats $xy > 1$.\n\n**Trigger cue**\n\nAn ordered pair of same-sign numbers and reciprocal choices: reciprocation reverses order within a sign class.\n\n**Takeaway**\n\nFor same-sign numbers, taking reciprocals reverses the inequality.",
    fastest_path_md: "Plug $x = -2$, $y = -1$: only $\\frac{1}{x} > \\frac{1}{y}$ (that is, $-\\frac{1}{2} > -1$) survives among A, B, E; then $x = -\\frac{1}{2}$, $y = -\\frac{1}{4}$ kills $xy > 1$.",
    trap_map: {
      "0": "Squares the inequality as though squaring preserves order for negatives.",
      "1": "Takes reciprocals of both sides without reversing the inequality.",
      "3": "Upgrades “negative times negative is positive” to “greater than $1$.”",
      "4": "Divides $x < y$ by the negative number $y$ without flipping the sign.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -24; i <= -1; i++) {
        for (let j = -24; j <= -1; j++) {
          const x = i / 4, y = j / 4;
          if (x < y && y < 0) models.push([x, y]);
        }
      }
      const preds = [
        (x, y) => x * x < y * y,
        (x, y) => 1 / x < 1 / y,
        (x, y) => 1 / x > 1 / y,
        (x, y) => x * y > 1,
        (x, y) => x / y < 1,
      ];
      return { kind: "index", index: onlyAlwaysTrue(models, preds) };
    },
  },

  // ── 5. D3 PS real ────────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 3,
    stem_md: "In a trivia match, Jae scored $j$ points and Kim scored $k$ points, where $j$ and $k$ are integers whose sum is odd. Which of the following must be true?",
    choices: [
      "$jk$ is odd",
      "$jk$ is even",
      "$j - k$ is even",
      "$j$ is odd",
      "$j^2 + k^2$ is even",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nAn odd sum forces one of $j, k$ to be even and the other odd. An even factor makes the product $jk$ even. Which player holds the odd score is not fixed, so a choice naming $j$ can fail. The difference $j - k$ shares the parity of $j + k$, so it is odd, and $j^2 + k^2$ keeps exactly one odd square, so it is odd as well.\n\n**Trigger cue**\n\nA parity fact about a sum: translate it to “one even, one odd” and push that through products and squares.\n\n**Takeaway**\n\nAn odd sum means mixed parity, so the product is even.",
    fastest_path_md: "Odd sum = one even score, one odd score. Any even factor makes the product even — pick $jk$ even and move on.",
    trap_map: {
      "0": "Matches an odd sum with an odd product.",
      "2": "Expects the odd parts to cancel, though sum and difference always share parity.",
      "3": "Pins the odd score on Jae when it could be Kim's.",
      "4": "Believes squaring evens numbers out, though squares preserve parity.",
    },
    numeric_check: null,
    check(q) {
      const mod2 = (n) => ((n % 2) + 2) % 2;
      const models = [];
      for (let j = -9; j <= 9; j++) {
        for (let k = -9; k <= 9; k++) {
          if (mod2(j + k) === 1) models.push([j, k]);
        }
      }
      const preds = [
        (j, k) => mod2(j * k) === 1,
        (j, k) => mod2(j * k) === 0,
        (j, k) => mod2(j - k) === 0,
        (j, k) => mod2(j) === 1,
        (j, k) => mod2(j * j + k * k) === 0,
      ];
      return { kind: "index", index: onlyAlwaysTrue(models, preds) };
    },
  },

  // ── 6. D3 DS pure ────────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 3,
    stem_md: "Is $x + y > 0$?\n\n(1) $x > |y|$\n\n(2) $x > 0$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\n(1) gives $x > |y| \\ge -y$, so $x + y > 0$ for every allowed pair — sufficient. (2) allows $(x, y) = (1, 1)$ with a positive sum and $(1, -5)$ with a negative sum — not sufficient. Statement (1) alone answers the question.\n\n**Trigger cue**\n\nA variable dominating an absolute value: $x > |y|$ means $x$ outweighs $y$ whichever sign $y$ takes.\n\n**Takeaway**\n\n$x > |y|$ makes $x$ outweigh $y$ in any sum.",
    fastest_path_md: "(1): $x$ beats $|y|$, so the sum must be positive — sufficient. (2): compare $(1, 1)$ with $(1, -5)$ — insufficient. Answer: (1) alone.",
    trap_map: {
      "1": "Credits $x > 0$ alone, forgetting a large negative $y$ can sink the sum.",
      "2": "Combines out of caution, missing that $x > |y| \\ge -y$ already settles the question.",
      "3": "Grants (2) sufficiency after testing only nonnegative values of $y$.",
      "4": "Doubts (1) because $y$'s sign is unknown, though $|y|$ absorbs both signs.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -24; i <= 24; i++) {
        for (let j = -24; j <= 24; j++) models.push([i / 2, j / 2]);
      }
      const index = dsIndex(
        models,
        ([x, y]) => x > Math.abs(y),
        ([x, y]) => x > 0,
        ([x, y]) => x + y > 0,
        { s1: 10, s2: 10, both: 10 },
      );
      return { kind: "index", index };
    },
  },

  // ── 7. D3 DS pure ────────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 3,
    stem_md: "Is $a > 0$?\n\n(1) $a^2 = 4a$\n\n(2) $a \\ne 0$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n(1) rearranges to $a^2 - 4a = 0$, so $a(a - 4) = 0$ and $a = 0$ or $a = 4$. The question “is $a > 0$?” gets a no at $a = 0$ and a yes at $a = 4$ — not sufficient. (2) allows $a = 1$ and $a = -1$ — not sufficient. Together, $a \\ne 0$ removes the root $a = 0$, leaving $a = 4 > 0$ — sufficient.\n\n**Trigger cue**\n\nAn equation with the variable on both sides: factor it; never divide by the variable.\n\n**Takeaway**\n\nDividing by a variable silently discards its zero root.",
    fastest_path_md: "(1): $a \\in \\{0, 4\\}$ — one no, one yes. (2): clearly not alone. Together only $a = 4$ survives — both statements needed.",
    trap_map: {
      "0": "Divides $a^2 = 4a$ by $a$, silently discarding the root $a = 0$.",
      "1": "Reads $a \\ne 0$ as $a > 0$.",
      "3": "Cancels $a$ in (1) and equates nonzero with positive in (2).",
      "4": "Keeps both roots of (1) even after (2) eliminates $a = 0$.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -20; i <= 20; i++) models.push([i / 2]);
      const index = dsIndex(
        models,
        ([a]) => a * a === 4 * a,
        ([a]) => a !== 0,
        ([a]) => a > 0,
        { s1: 2, s2: 10, both: 1 },
      );
      return { kind: "index", index };
    },
  },

  // ── 8. D4 PS pure ────────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 4,
    stem_md: "If $x$, $y$, and $z$ are nonzero numbers such that $x y^2 z^3 > 0$, which of the following must be true?\n\nI. $xz > 0$\n\nII. $x z^2 > 0$\n\nIII. $\\dfrac{x}{z} > 0$",
    choices: ["I only", "II only", "I and II only", "I and III only", "I, II, and III"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSince $y^2 > 0$, the condition reduces to $x z^3 > 0$, and because $z^3$ carries the sign of $z$, this says exactly that $x$ and $z$ share a sign. Hence $xz > 0$ (I) and $\\frac{x}{z} > 0$ (III) both hold. II asserts $x z^2 > 0$, which is just $x > 0$; the model $x = -1$, $y = 1$, $z = -1$ satisfies the condition and breaks II.\n\n**Trigger cue**\n\nThe sign of a monomial: even powers are invisible, odd powers carry the sign of their base.\n\n**Takeaway**\n\nStrip even powers; odd powers keep the base's sign.",
    fastest_path_md: "Drop the even powers $y^2$ and $z^2$: the condition is just $xz > 0$. I and III restate it; II claims $x > 0$, broken by $x = z = -1$, $y = 1$.",
    trap_map: {
      "0": "Distrusts III though a quotient obeys the same sign rule as a product.",
      "1": "Reads the positive product as forcing $x > 0$, ignoring that $z^3$ can be negative.",
      "2": "Tests only positive $z$, which makes II look forced, while doubting the quotient in III.",
      "4": "Accepts II after testing only positive values of $z$.",
    },
    numeric_check: null,
    check(q) {
      const vals = [-3, -2, -1, 1, 2, 3];
      const models = [];
      for (const x of vals) for (const y of vals) for (const z of vals) {
        if (x * y * y * z * z * z > 0) models.push([x, y, z]);
      }
      const flags = [
        models.every(([x, , z]) => x * z > 0),
        models.every(([x, , z]) => x * z * z > 0),
        models.every(([x, , z]) => x / z > 0),
      ];
      return { kind: "index", index: romanIndex(q.choices, flags) };
    },
  },

  // ── 9. D4 DS pure ────────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 4,
    stem_md: "Is $z < 0$?\n\n(1) $z^3 < z$\n\n(2) $z^5 < z^3$",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\n(1) $z^3 < z \\iff z(z - 1)(z + 1) < 0 \\iff z < -1$ or $0 < z < 1$. (2) $z^5 < z^3 \\iff z^3(z^2 - 1) < 0$, which yields the identical set $z < -1$ or $0 < z < 1$. Each statement, and therefore the combination, still contains $z = -2$ (answer yes) and $z = \\frac{1}{2}$ (answer no) — not sufficient even together.\n\n**Trigger cue**\n\nPower inequalities: move everything to one side and sign-chart; different exponents can hide identical statements.\n\n**Takeaway**\n\nTwo statements with the same solution set add nothing together.",
    fastest_path_md: "Sign-chart both: each says exactly $z < -1$ or $0 < z < 1$ — identical information. Test $z = -2$ and $z = \\frac{1}{2}$: still both answers, so together insufficient.",
    trap_map: {
      "0": "Solves (1) as only $z < -1$, dropping the $0 < z < 1$ branch.",
      "1": "Solves (2) as only $z < -1$, dropping the $0 < z < 1$ branch.",
      "2": "Assumes two different-looking inequalities must intersect to a set with a single sign.",
      "3": "Cancels powers of $z$ in each statement, reducing both to $z < -1$.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -30; i <= 30; i++) models.push([i / 10]);
      const index = dsIndex(
        models,
        ([z]) => z ** 3 < z,
        ([z]) => z ** 5 < z ** 3,
        ([z]) => z < 0,
        { s1: 10, s2: 10, both: 10 },
      );
      return { kind: "index", index };
    },
  },

  // ── 10. D4 PS real ───────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 4,
    stem_md: "Over three consecutive days, a food truck recorded daily profits of $p$, $q$, and $r$ dollars, where a negative value represents a loss. If $pqr < 0$ and $p + q + r > 0$, which of the following must be true?",
    choices: [
      "$p < 0$",
      "Exactly one of $p$, $q$, and $r$ is negative",
      "Exactly two of $p$, $q$, and $r$ are negative",
      "$p + q > 0$",
      "$r > 0$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\n$pqr < 0$ requires an odd number of negative factors: one or three (and no zeros). Three negatives would force $p + q + r < 0$, contradicting the positive total, so exactly one of the three values is negative. Which day it is stays free: $(-10, 2, 9)$ defeats $p + q > 0$, $(2, 9, -10)$ defeats $r > 0$, and $(2, -10, 9)$ shows the loss need not fall on day one, defeating $p < 0$.\n\n**Trigger cue**\n\nA sign condition on a product plus a sum condition: count negative factors by parity, then let the sum prune the count.\n\n**Takeaway**\n\nA negative product means an odd count of negative factors.",
    fastest_path_md: "Odd number of negatives (product $< 0$), but three negatives cannot sum to a positive — so exactly one negative. Shuffle $(-10, 2, 9)$ to kill every position-specific choice.",
    trap_map: {
      "0": "Pins the loss on day one when the negative value could be any of the three.",
      "2": "Pairs a negative product with two negative factors — an even count, which gives a positive product.",
      "3": "Assumes any two days must net positive because the three-day total is positive.",
      "4": "Pins the profit on day three; $(2, 9, -10)$ satisfies everything with $r < 0$.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let p = -10; p <= 10; p++) {
        for (let qq = -10; qq <= 10; qq++) {
          for (let r = -10; r <= 10; r++) {
            if (p * qq * r < 0 && p + qq + r > 0) models.push([p, qq, r]);
          }
        }
      }
      const negCount = (a, b, c) => [a, b, c].filter((v) => v < 0).length;
      const preds = [
        (a, b, c) => a < 0,
        (a, b, c) => negCount(a, b, c) === 1,
        (a, b, c) => negCount(a, b, c) === 2,
        (a, b, c) => a + b > 0,
        (a, b, c) => c > 0,
      ];
      return { kind: "index", index: onlyAlwaysTrue(models, preds) };
    },
  },

  // ── 11. D5 PS pure ───────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 5,
    stem_md: "If $|a| - a = |b| - b$ and $a \\ne b$, which of the following must be true?",
    choices: ["$a > 0$", "$ab > 0$", "$|a| = |b|$", "$a + b > 0$", "$a - b > 0$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nLet $f(t) = |t| - t$. For $t \\ge 0$, $f(t) = 0$; for $t < 0$, $f(t) = -2t > 0$, and there $f$ is one-to-one. Two different inputs $a \\ne b$ can share an output only where $f$ is flat, so $f(a) = f(b) = 0$, forcing $a \\ge 0$ and $b \\ge 0$. Since $a \\ne b$, they are not both zero, hence $a + b > 0$. The pair $(a, b) = (0, 3)$ satisfies the condition and defeats each of the other four choices.\n\n**Trigger cue**\n\nExpressions of the form $|t| \\pm t$: they collapse to $0$ or $\\pm 2t$ depending on sign — split there.\n\n**Takeaway**\n\n$|t| - t$ vanishes on all nonnegatives; equal outputs need not mean equal inputs.",
    fastest_path_md: "$|t| - t$ is $0$ for $t \\ge 0$ and strictly positive (and one-to-one) for $t < 0$. Distinct inputs with equal outputs must sit on the flat part: $a, b \\ge 0$ and not both zero, so $a + b > 0$.",
    trap_map: {
      "0": "Forgets that $a = 0$ satisfies $|a| - a = 0$ and is allowed.",
      "1": "Misses the $a = 0$ case, which makes the product zero rather than positive.",
      "2": "Treats $|t| - t$ as one-to-one, though it is $0$ for every nonnegative input.",
      "4": "Reads $a \\ne b$ as $a > b$.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -20; i <= 20; i++) {
        for (let j = -20; j <= 20; j++) {
          const a = i / 4, b = j / 4;
          if (a === b) continue;
          if (Math.abs(a) - a === Math.abs(b) - b) models.push([a, b]);
        }
      }
      const preds = [
        (a, b) => a > 0,
        (a, b) => a * b > 0,
        (a, b) => Math.abs(a) === Math.abs(b),
        (a, b) => a + b > 0,
        (a, b) => a - b > 0,
      ];
      return { kind: "index", index: onlyAlwaysTrue(models, preds) };
    },
  },

  // ── 12. D4 PS pure ───────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "must_be_true_testing",
    difficulty: 4,
    stem_md: "If $x^2 < x + 6$, which of the following must be true?",
    choices: ["$x > 0$", "$x < 2$", "$0 < x < 3$", "$x^2 < 4$", "$|x| < 3$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\n$x^2 - x - 6 < 0$ factors as $(x - 3)(x + 2) < 0$, so $-2 < x < 3$. A must-be-true choice has to contain this entire interval. $|x| < 3$ describes $(-3, 3)$, which contains $(-2, 3)$. Each other choice omits part of the interval: $x = -1$ breaks $x > 0$ and $0 < x < 3$, while $x = 2.5$ breaks $x < 2$ and $x^2 < 4$.\n\n**Trigger cue**\n\n“Must be true” after a solvable inequality: solve it first, then pick the choice that is a superset of the solution set, never a subset.\n\n**Takeaway**\n\nMust-be-true answers contain the solution set; they never trim it.",
    fastest_path_md: "Solve: $(x - 3)(x + 2) < 0$ gives $-2 < x < 3$. The only choice containing that whole interval is $|x| < 3$.",
    trap_map: {
      "0": "Drops the negative part $-2 < x < 0$ of the solution set.",
      "1": "Mis-factors $x^2 - x - 6$ as $(x - 2)(x + 3)$, moving the boundary to $2$.",
      "2": "Keeps only the positive portion of the interval $-2 < x < 3$.",
      "3": "Builds a symmetric bound from the nearer endpoint $-2$, trimming the set.",
    },
    numeric_check: null,
    check(q) {
      const models = [];
      for (let i = -80; i <= 80; i++) {
        const x = i / 20;
        if (x * x < x + 6) models.push([x]);
      }
      const preds = [
        (x) => x > 0,
        (x) => x < 2,
        (x) => x > 0 && x < 3,
        (x) => x * x < 4,
        (x) => Math.abs(x) < 3,
      ];
      return { kind: "index", index: onlyAlwaysTrue(models, preds) };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
