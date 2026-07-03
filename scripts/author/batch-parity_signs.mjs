/**
 * Batch: 10 new questions for subtopic "parity_signs"
 * (fundamental_skill "value_order_factors", content_domain "algebra").
 * Cells: D3 PS pure, D3 PS real, D3 DS pure, D4 PS pure, D5 DS pure,
 *        D5 PS pure, D5 PS real, D4 PS pure, D3 PS pure, D3 PS real.
 * Run from repo root: node scripts/author/batch-parity_signs.mjs
 * (dry run unless APPEND=1)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

/** Shared DS evaluator: enumerate models, classify sufficiency, map to index. */
function dsVerdict(models, s1, s2, ans) {
  const m1 = models.filter(s1);
  const m2 = models.filter(s2);
  const m12 = models.filter((m) => s1(m) && s2(m));
  if (m1.length < 3) throw new Error(`statement (1) has only ${m1.length} models`);
  if (m2.length < 3) throw new Error(`statement (2) has only ${m2.length} models`);
  if (m12.length < 1) throw new Error("statements are mutually inconsistent");
  const decided = (ms) => ms.every((m) => ans(m)) || ms.every((m) => !ans(m));
  const a = decided(m1);
  const b = decided(m2);
  const c = decided(m12);
  return a && b ? 3 : a ? 0 : b ? 1 : c ? 2 : 4;
}

const items = [
  // ── 1. D3 PS pure ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "If $x$ and $y$ are integers such that $x^2 y$ is odd, which of the following must be even?",
    choices: ["$x + y$", "$x + 2y$", "$2x + y$", "$xy$", "$xy + 2$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nAn odd product has only odd factors, so $x^2$ is odd — hence $x$ is odd — and $y$ is odd. Then $x + y$ is odd $+$ odd $=$ even, always. The rest stay odd: $x + 2y$ and $2x + y$ are odd $+$ even; $xy$ is odd $\\cdot$ odd; $xy + 2$ adds an even to an odd.\n\n**Trigger cue**\n\nWhen a product or power is declared odd, reach for \"every factor is odd.\"\n\n**Takeaway**\n\nAn odd product forces every factor odd; two odds sum to even.",
    fastest_path_md:
      "$x^2 y$ odd pins both $x$ and $y$ odd, so every choice has a fixed parity — one test $x = y = 1$ settles it: the values are $2, 3, 3, 1, 3$. Only $x + y$ is even.",
    trap_map: {
      "1": "Treats the $2y$ term as making the whole sum even, though the lone $x$ stays odd.",
      "2": "Assumes doubling $x$ hands its evenness to the sum, but the lone $y$ remains odd.",
      "3": "Multiplies parities like signs, reading odd $\\cdot$ odd as even.",
      "4": "Expects adding $2$ to flip the parity of the odd product $xy$.",
    },
    numeric_check: null,
    check(q) {
      // enumerate all integer pairs with x^2*y odd; test which choice is ALWAYS even
      const models = [];
      for (let x = -9; x <= 9; x++)
        for (let y = -9; y <= 9; y++)
          if (Math.abs(x * x * y) % 2 === 1) models.push([x, y]);
      if (models.length < 10) throw new Error("too few models");
      const exprs = [
        ([x, y]) => x + y,
        ([x, y]) => x + 2 * y,
        ([x, y]) => 2 * x + y,
        ([x, y]) => x * y,
        ([x, y]) => x * y + 2,
      ];
      const alwaysEven = exprs.map((f) => models.every((m) => Math.abs(f(m)) % 2 === 0));
      if (alwaysEven.filter(Boolean).length !== 1) throw new Error("not exactly one always-even choice");
      return { kind: "index", index: alwaysEven.indexOf(true) };
    },
  },

  // ── 2. D3 PS real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "In a board game, a marker starts on square $50$ of a track whose squares are numbered $0$ through $100$. On each turn the marker moves either $3$ squares toward $100$ or $5$ squares toward $0$. After exactly $10$ turns the marker is on square $s$. Which of the following could be the value of $s$?",
    choices: ["$36$", "$45$", "$52$", "$56$", "$60$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nLet $u$ be the number of forward turns, so $10 - u$ are backward: $s = 50 + 3u - 5(10 - u) = 8u$ with $0 \\le u \\le 10$. So $s$ must be a multiple of $8$ between $0$ and $80$. Only $56 = 8 \\cdot 7$ qualifies. A parity check alone kills $45$: both step sizes are odd, so each turn flips parity, and ten flips return the marker to an even square.\n\n**Trigger cue**\n\nWhen a fixed number of turns mixes two step sizes, reach for one variable counting one step type.\n\n**Takeaway**\n\nFix total moves, express the endpoint in one variable, then test choices.",
    fastest_path_md:
      "$s = 50 + 3u - 5(10 - u) = 8u$. Scan the choices for a multiple of $8$: only $56$.",
    trap_map: {
      "0": "Reachable via $u = 2$, $d = 4$ — a six-turn path that ignores the requirement to use all ten turns.",
      "1": "Forgets that two odd step sizes flip parity every turn, so ten turns must land on an even square.",
      "2": "Solves $3u - 5d = 2$ with $u = 4$, $d = 2$, again using only six turns.",
      "4": "Balances $+15 - 5$ over six turns ($u = 5$, $d = 1$) instead of all ten.",
    },
    numeric_check: "8*7",
    check(q) {
      // brute-force all 2^10 move sequences
      const finals = new Set();
      for (let mask = 0; mask < 1 << 10; mask++) {
        let pos = 50;
        for (let t = 0; t < 10; t++) pos += mask & (1 << t) ? 3 : -5;
        finals.add(pos);
      }
      const vals = q.choices.map((c) => Number(c.replace(/\$/g, "")));
      const reachable = vals.filter((v) => finals.has(v));
      if (reachable.length !== 1) throw new Error(`expected exactly one reachable choice, got ${reachable}`);
      return { kind: "value", value: reachable[0] };
    },
  },

  // ── 3. D3 DS pure ────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md: "Is $uv > 0$?\n\n(1) $\\dfrac{u}{v} > 0$\n\n(2) $u + v > 0$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\n(1): a positive quotient requires $u$ and $v$ to be nonzero with the same sign, and same-sign nonzero numbers have a positive product — sufficient, answer yes. (2): $(u, v) = (1, 2)$ gives $uv = 2 > 0$, while $(3, -1)$ gives $uv = -3 < 0$ — not sufficient. Answer: statement (1) alone.\n\n**Trigger cue**\n\nWhen a quotient's sign is given, reach for \"quotient and product of the same pair share a sign.\"\n\n**Takeaway**\n\nA quotient and product of the same two numbers share their sign.",
    fastest_path_md:
      "$\\tfrac{u}{v}$ and $uv$ always have the same sign (both are \"same signs vs. opposite signs\" detectors), so (1) is a yes immediately. For (2), test $(1, 2)$ and $(3, -1)$: yes then no.",
    trap_map: {
      "1": "Trusts the concrete-looking sum while missing that a positive quotient pins matching signs.",
      "2": "Combines out of caution when (1) already forces $u$ and $v$ to share a sign.",
      "3": "Grants (2) sufficiency after testing only pairs of positive numbers.",
      "4": "Sees two unknowns with no values and assumes no sign can be pinned down.",
    },
    numeric_check: null,
    check() {
      const vals = [-3, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 3];
      const models = [];
      for (const u of vals) for (const v of vals) models.push([u, v]);
      const s1 = ([u, v]) => v !== 0 && u / v > 0;
      const s2 = ([u, v]) => u + v > 0;
      const ans = ([u, v]) => u * v > 0;
      return { kind: "index", index: dsVerdict(models, s1, s2, ans) };
    },
  },

  // ── 4. D4 PS pure ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 4,
    stem_md:
      "For how many integers $n$ from $1$ to $50$, inclusive, is $3^n + n^3$ even?",
    choices: ["$0$", "$24$", "$25$", "$26$", "$50$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$3^n$ is a product of odd factors, so it is odd for every $n \\ge 1$. $n^3$ has the parity of $n$. The sum is even exactly when both terms are odd, i.e., when $n^3$ is odd, i.e., when $n$ is odd. The odd integers from $1$ to $50$ number $25$.\n\n**Trigger cue**\n\nWhen an exponential meets a polynomial in a parity question, reach for term-by-term parity.\n\n**Takeaway**\n\nPowers keep the base's parity; cubes keep $n$'s.\n",
    fastest_path_md:
      "Test $n = 1$: $3 + 1 = 4$, even. Test $n = 2$: $9 + 8 = 17$, odd. Pattern: odd $n$ works, even $n$ fails — $25$ odds in range.",
    trap_map: {
      "0": "Adds parities as odd $+$ odd $=$ odd, concluding the sum can never be even.",
      "1": "Counts the odd integers strictly between $1$ and $50$, dropping the endpoint $n = 1$.",
      "3": "Decides even $n$ works, then appends $n = 1$ after testing it directly.",
      "4": "Gives $3^n$ the parity of $n$, making both terms match so every sum looks even.",
    },
    numeric_check: "50/2",
    check() {
      let count = 0;
      for (let n = 1n; n <= 50n; n++) {
        if ((3n ** n + n ** 3n) % 2n === 0n) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // ── 5. D5 DS pure ────────────────────────────────────────────────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 5,
    stem_md:
      "If $p$ and $q$ are nonzero integers, is $p^q < 0$?\n\n(1) $p^5 q^2 < 0$\n\n(2) $q$ is odd and $pq > 0$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFor nonzero integers, $p^q < 0$ exactly when $p < 0$ and $q$ is odd. (1): $q^2 > 0$, so the inequality reduces to $p^5 < 0$, i.e., $p < 0$; but $(p, q) = (-2, 3)$ gives $-8$ (yes) while $(-2, 2)$ gives $4$ (no) — not sufficient. (2): $(3, 1)$ gives $3$ (no) while $(-3, -1)$ gives $-\\tfrac{1}{3}$ (yes) — not sufficient. Together: $p < 0$ and $pq > 0$ force $q < 0$, and $q$ is odd, so $p^q < 0$ — always yes. Answer: both together.\n\n**Trigger cue**\n\nWhen a power's sign is asked, reach for splitting into base sign and exponent parity.\n\n**Takeaway**\n\nOnly a negative base with an odd exponent yields a negative power.",
    fastest_path_md:
      "The yes-set is \"$p < 0$ and $q$ odd.\" (1) delivers only $p < 0$ (the $q^2$ is dead weight); (2) delivers only \"$q$ odd\" plus a sign link. Neither half decides alone; the two halves combined do.",
    trap_map: {
      "0": "Reads (1)'s $p < 0$ as settling the sign, forgetting the exponent's parity decides.",
      "1": "Assumes (2)'s odd exponent forces a negative result without pinning the sign of $p$.",
      "3": "Grants each statement the half of the argument that only the other one supplies.",
      "4": "Misses that combined, $q$ is a negative odd and $p$ is negative — the power's sign is fixed.",
    },
    numeric_check: null,
    check() {
      const models = [];
      for (let p = -5; p <= 5; p++)
        for (let q = -5; q <= 5; q++) if (p !== 0 && q !== 0) models.push([p, q]);
      const s1 = ([p, q]) => Math.pow(p, 5) * q * q < 0;
      const s2 = ([p, q]) => Math.abs(q) % 2 === 1 && p * q > 0;
      const ans = ([p, q]) => Math.pow(p, q) < 0;
      return { kind: "index", index: dsVerdict(models, s1, s2, ans) };
    },
  },

  // ── 6. D5 PS pure ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 5,
    stem_md:
      "Each of $a$, $b$, and $c$ is chosen from the set $\\{-2, -1, 1, 2\\}$, with repetition allowed. How many of the $64$ possible ordered triples $(a, b, c)$ have a positive product and an odd sum?",
    choices: ["$4$", "$6$", "$16$", "$32$", "$48$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$abc > 0$ means the triple has an even number of negative entries; $a + b + c$ odd means it has an odd number of odd entries ($\\pm 1$). The set $\\{-2, -1, 1, 2\\}$ contains exactly one element for each (sign, parity) combination, so each entry's sign bit and parity bit are independent and uniform. Half the $64$ triples have an even count of negatives, and — independently — half of those have an odd count of odd entries: $64 \\cdot \\tfrac{1}{2} \\cdot \\tfrac{1}{2} = 16$.\n\n**Trigger cue**\n\nWhen sign and parity conditions hit a set covering all sign–parity combinations, reach for independence.\n\n**Takeaway**\n\nIndependent sign and parity conditions each halve the count.",
    fastest_path_md:
      "Negating one slot ($a \\leftrightarrow -a$) toggles the product condition but not the sum's parity, so exactly half of all triples pass the sign test; swapping $\\pm 1 \\leftrightarrow \\pm 2$ in one slot then toggles the sum condition, halving again: $64 / 4 = 16$.",
    trap_map: {
      "0": "Misreads $abc > 0$ as requiring all three entries positive, leaving only $1$s and $2$s.",
      "1": "Adds an unstated requirement that $a$, $b$, and $c$ be distinct.",
      "3": "Applies only one of the two conditions; each alone passes half the triples.",
      "4": "Counts triples meeting at least one of the conditions instead of both.",
    },
    numeric_check: "64/4",
    check() {
      const S = [-2, -1, 1, 2];
      let count = 0;
      for (const a of S)
        for (const b of S)
          for (const c of S)
            if (a * b * c > 0 && Math.abs(a + b + c) % 2 === 1) count++;
      return { kind: "value", value: count };
    },
  },

  // ── 7. D5 PS real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 5,
    stem_md:
      "At a school fair, a player spins two wheels. The first wheel stops on an integer $x$ from $1$ to $6$, and the second stops on an integer $y$ from $1$ to $9$. The player wins a prize when $xy + x + y$ is even. For how many of the $54$ possible pairs of results does the player win?",
    choices: ["$12$", "$15$", "$27$", "$39$", "$42$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\n$xy + x + y = (x+1)(y+1) - 1$, so the total is even exactly when $(x+1)(y+1)$ is odd — that is, when $x + 1$ and $y + 1$ are both odd, i.e., $x$ and $y$ are both even. The first wheel has $3$ even values ($2, 4, 6$) and the second has $4$ ($2, 4, 6, 8$): $3 \\cdot 4 = 12$ winning pairs.\n\n**Trigger cue**\n\nWhen $xy + x + y$ appears in a parity or divisibility question, reach for adding $1$ and factoring.\n\n**Takeaway**\n\nAdding $1$ factors $xy + x + y$; parity reads off instantly.",
    fastest_path_md:
      "Parity table on $(x, y)$: odd–odd gives odd $+$ odd $+$ odd $=$ odd; odd–even and even–odd give even $+$ odd $+$ even $=$ odd. Only even–even wins: $3 \\cdot 4 = 12$.",
    trap_map: {
      "1": "Flips the factoring conclusion and requires both numbers to be odd ($3 \\cdot 5 = 15$).",
      "2": "Assumes an even result occurs on half of all $54$ spins.",
      "3": "Solves the wrong condition \"$xy$ even\" — at least one even number — giving $54 - 15$.",
      "4": "Counts the losing pairs of the correct condition, $54 - 12$.",
    },
    numeric_check: "3*4",
    check() {
      let wins = 0;
      for (let x = 1; x <= 6; x++)
        for (let y = 1; y <= 9; y++) if ((x * y + x + y) % 2 === 0) wins++;
      return { kind: "value", value: wins };
    },
  },

  // ── 8. D4 PS pure ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 4,
    stem_md:
      "If $x < y$ and $xy < 0$, which of the following must be positive?",
    choices: [
      "$x + y$",
      "$x^2 - y^2$",
      "$\\dfrac{y}{x}$",
      "$x^2 y - x y^2$",
      "$x^3 y^3$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\n$xy < 0$ with $x < y$ forces $x < 0 < y$. Factor the target: $x^2 y - x y^2 = xy(x - y)$. Both factors are negative — $xy < 0$ by hypothesis and $x - y < 0$ from the ordering — so the product is positive, always. The others fail: $x + y$ and $x^2 - y^2 = (x+y)(x-y)$ depend on magnitudes; $\\tfrac{y}{x}$ is positive over negative — always negative; $x^3 y^3 = (xy)^3 < 0$.\n\n**Trigger cue**\n\nWhen a polynomial's sign is asked under sign constraints, reach for factoring into pieces with known signs.\n\n**Takeaway**\n\nFactor first; two guaranteed negatives multiply to a guaranteed positive.",
    fastest_path_md:
      "Test $(x, y) = (-1, 2)$ and $(-3, 1)$: the choices give $(1, -2)$, $(-3, 8)$, $(-2, -\\tfrac13)$, $(6, 12)$, $(-8, -27)$. Only $x^2 y - xy^2$ is positive both times — and $xy(x-y)$ confirms it always is.",
    trap_map: {
      "0": "Assumes the positive number dominates the sum because $y$ is the larger value.",
      "1": "Treats squaring as erasing signs and then orders the squares from $x < y$ backwards.",
      "2": "Calls positive-over-negative positive, garbling the quotient sign rule.",
      "4": "Treats the odd cubes like even powers that wipe out the negative sign of $xy$.",
    },
    numeric_check: null,
    check() {
      // enumerate half-integer pairs with xy<0 and x<y; find the unique always-positive choice
      const vals = [];
      for (let k = -8; k <= 8; k++) if (k !== 0) vals.push(k / 2);
      const models = [];
      for (const x of vals)
        for (const y of vals) if (x * y < 0 && x < y) models.push([x, y]);
      if (models.length < 20) throw new Error("too few models");
      const exprs = [
        ([x, y]) => x + y,
        ([x, y]) => x * x - y * y,
        ([x, y]) => y / x,
        ([x, y]) => x * x * y - x * y * y,
        ([x, y]) => Math.pow(x, 3) * Math.pow(y, 3),
      ];
      const alwaysPos = exprs.map((f) => models.every((m) => f(m) > 0));
      if (alwaysPos.filter(Boolean).length !== 1) throw new Error("not exactly one always-positive choice");
      return { kind: "index", index: alwaysPos.indexOf(true) };
    },
  },

  // ── 9. D3 PS pure ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "If $r$, $s$, and $t$ are nonzero numbers such that $rs < 0$ and $st > 0$, which of the following must be negative?",
    choices: ["$r + t$", "$rt$", "$rst$", "$r^2 t$", "$s t^2$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nMultiply the two facts: $(rs)(st) = r s^2 t < 0$, and since $s^2 > 0$, this forces $rt < 0$ — always. The others vary: $rst = (rs) \\cdot t$ takes the sign opposite to $t$, which is not fixed; $r + t$ mixes opposite signs, so magnitudes decide; $r^2 t$ has the sign of $t$; $s t^2$ has the sign of $s$ — and $s$ can be either sign.\n\n**Trigger cue**\n\nWhen two sign facts share a variable, reach for multiplying them so the shared variable squares away.\n\n**Takeaway**\n\nMultiply sign facts; even powers vanish, exposing the target pair.",
    fastest_path_md:
      "Multiply the facts: negative $\\times$ positive gives $(rs)(st) = r s^2 t < 0$; dropping the positive $s^2$ leaves $rt < 0$. One line.",
    trap_map: {
      "0": "Assumes opposite-signed numbers must have a negative sum, though magnitudes decide.",
      "2": "Tacks $t$ onto the negative $rs$ and expects the product to stay negative.",
      "3": "Assumes $t$ is negative because it is tied to $s$, whose sign is actually free.",
      "4": "Assumes $s$ is negative because it sits inside the negative product $rs$.",
    },
    numeric_check: null,
    check() {
      const vals = [-3, -2, -1, 1, 2, 3];
      const models = [];
      for (const r of vals)
        for (const s of vals)
          for (const t of vals) if (r * s < 0 && s * t > 0) models.push([r, s, t]);
      if (models.length < 20) throw new Error("too few models");
      const exprs = [
        ([r, , t]) => r + t,
        ([r, , t]) => r * t,
        ([r, s, t]) => r * s * t,
        ([r, , t]) => r * r * t,
        ([, s, t]) => s * t * t,
      ];
      const alwaysNeg = exprs.map((f) => models.every((m) => f(m) < 0));
      if (alwaysNeg.filter(Boolean).length !== 1) throw new Error("not exactly one always-negative choice");
      return { kind: "index", index: alwaysNeg.indexOf(true) };
    },
  },

  // ── 10. D3 PS real ───────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "value_order_factors",
    subtopic: "parity_signs",
    difficulty: 3,
    stem_md:
      "A golfer's score for each round is recorded relative to par: a negative number for a round under par and a positive number for a round over par. Over three rounds, none of her recorded scores was zero, the product of the three scores was positive, and their sum was negative. Which of the following must be true?",
    choices: [
      "None of the three rounds was under par.",
      "Exactly one of the three rounds was under par.",
      "Exactly two of the three rounds were under par.",
      "The score with the greatest absolute value was over par.",
      "The sum of every pair of the three scores was negative.",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nA positive product of three nonzero numbers requires an even number of negative factors: zero or two. Zero negatives would make all three scores positive, giving a positive sum — contradicting the negative sum. So exactly two scores are negative: exactly two rounds under par. The last two choices fail on examples: $(-5, -1, 2)$ has its largest-magnitude score under par, and $(-1, -2, 2)$ has the pair sum $-1 + 2 = 1 > 0$.\n\n**Trigger cue**\n\nWhen a product's sign and a sum's sign are both given, reach for counting negative factors case by case.\n\n**Takeaway**\n\nPositive product means evenly many negatives; the sum eliminates cases.",
    fastest_path_md:
      "Product positive $\\Rightarrow$ $0$ or $2$ rounds under par. All-positive scores would sum positive, so the sum rules out $0$. Exactly two — done.",
    trap_map: {
      "0": "Reads a positive product as meaning no negative factors at all.",
      "1": "Pairs the negative sum with a single negative score, but then the product would be negative.",
      "3": "Generalizes from one example such as $(-2, -2, 3)$, where the over-par round happens to dominate.",
      "4": "Extends the negative total to every pair, but an under-par score plus the over-par score can be positive.",
    },
    numeric_check: null,
    check() {
      // enumerate all valid score triples; test which statement holds in every model
      const models = [];
      for (let a = -6; a <= 6; a++)
        for (let b = -6; b <= 6; b++)
          for (let c = -6; c <= 6; c++)
            if (a && b && c && a * b * c > 0 && a + b + c < 0) models.push([a, b, c]);
      if (models.length < 20) throw new Error("too few models");
      const negCount = (m) => m.filter((v) => v < 0).length;
      const stmts = [
        (m) => negCount(m) === 0,
        (m) => negCount(m) === 1,
        (m) => negCount(m) === 2,
        (m) => {
          const mx = Math.max(...m.map(Math.abs));
          return m.filter((v) => Math.abs(v) === mx).every((v) => v > 0);
        },
        (m) => m[0] + m[1] < 0 && m[0] + m[2] < 0 && m[1] + m[2] < 0,
      ];
      const mustTrue = stmts.map((f) => models.every(f));
      if (mustTrue.filter(Boolean).length !== 1) throw new Error("not exactly one must-be-true statement");
      return { kind: "index", index: mustTrue.indexOf(true) };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
