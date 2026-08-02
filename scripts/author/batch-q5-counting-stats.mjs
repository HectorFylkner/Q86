/**
 * Quality pass, batch 4 — 18 new D5 items across the
 * counting_sets_series_prob_stats skill: 4 combinatorics (12 → 16),
 * 4 probability (12 → 16), 4 series_patterns (12 → 16),
 * 4 statistics_mean_median_sd (12 → 16), 2 overlapping_sets (14 → 16).
 *
 * Run: node --experimental-strip-types scripts/author/batch-q5-counting-stats.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

/** All distinct permutations of a multiset of characters. */
function distinctPermutations(letters) {
  const out = new Set();
  const walk = (used, acc) => {
    if (acc.length === letters.length) {
      out.add(acc);
      return;
    }
    for (let i = 0; i < letters.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      walk(used, acc + letters[i]);
      used[i] = false;
    }
  };
  walk(new Array(letters.length).fill(false), "");
  return [...out];
}

/** Every k-subset of [0, n). */
function subsets(n, k) {
  const out = [];
  const walk = (start, acc) => {
    if (acc.length === k) {
      out.push([...acc]);
      return;
    }
    for (let i = start; i < n; i++) {
      acc.push(i);
      walk(i + 1, acc);
      acc.pop();
    }
  };
  walk(0, []);
  return out;
}

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

const items = [
  // ══ combinatorics ═══════════════════════════════════════════════════════

  // ── 1. arrangements with a non-adjacency restriction ───────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 5,
    stem_md:
      "In how many distinguishable ways can the seven letters of the word $\\text{MISSILE}$ be arranged so that the two $\\text{S}$'s are not next to each other?",
    choices: ["$360$", "$900$", "$1{,}260$", "$1{,}800$", "$2{,}520$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nPlace the non-$\\text{S}$ letters first. They are $\\text{M}, \\text{I}, \\text{I}, \\text{L}, \\text{E}$ — five letters with the $\\text{I}$ repeated — giving $\\dfrac{5!}{2!} = 60$ distinguishable orders. Those five letters create six gaps (including the ends), and the two identical $\\text{S}$'s must occupy two different gaps: $\\binom{6}{2} = 15$ ways. Total: $60 \\times 15 = 900$.\n\nAs a check, the complement agrees: all arrangements number $\\dfrac{7!}{2!\\,2!} = 1260$, and gluing the $\\text{S}$'s into one block gives $\\dfrac{6!}{2!} = 360$, so $1260 - 360 = 900$.\n\n**Trigger cue**\n\"No two identical items adjacent\" — arrange everything else first, then choose gaps; with only one restricted pair the complement works too.\n\n**Takeaway**\nArrange the rest, then drop restricted letters into the gaps.",
    fastest_path_md:
      "$1260$ total minus $360$ with the $\\text{S}$'s glued together $= 900$.",
    trap_map: {
      "0": "Counts the arrangements the question excludes — the $\\dfrac{6!}{2!} = 360$ in which the two $\\text{S}$'s are adjacent.",
      "2": "Answers with the unrestricted total $\\dfrac{7!}{2!\\,2!} = 1{,}260$.",
      "3": "Forgets the two $\\text{I}$'s are identical, using $5! \\times \\binom{6}{2} = 1{,}800$.",
      "4": "Divides by only one of the two repeated pairs: $\\dfrac{7!}{2!} = 2{,}520$.",
    },
    numeric_check: "(5!/2!)*combinations(6,2)",
    check() {
      // Enumerate every distinguishable arrangement and test adjacency.
      const all = distinctPermutations("MISSILE".split(""));
      const ok = all.filter((w) => !w.includes("SS"));
      return { kind: "value", value: ok.length };
    },
    trap_values() {
      const all = distinctPermutations("MISSILE".split(""));
      return {
        "0": all.filter((w) => w.includes("SS")).length,
        "2": all.length,
        "3": 120 * choose(6, 2),
        "4": 5040 / 2,
      };
    },
  },

  // ── 2. committee selection under two-sided constraints ─────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 5,
    stem_md:
      "A committee of $5$ people is to be formed from $6$ men and $5$ women. The committee must include at least $2$ women and no more than $3$ men. How many different committees are possible?",
    choices: ["$200$", "$380$", "$381$", "$456$", "$462$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWith $5$ seats, \"at most $3$ men\" allows $0$, $1$, $2$, or $3$ men, and each of those leaves $5$, $4$, $3$, or $2$ women — all of which already satisfy \"at least $2$ women\", so the two constraints collapse into one. Summing:\n$\\binom{6}{0}\\binom{5}{5} + \\binom{6}{1}\\binom{5}{4} + \\binom{6}{2}\\binom{5}{3} + \\binom{6}{3}\\binom{5}{2} = 1 + 30 + 150 + 200 = 381$.\n\n**Trigger cue**\nTwo constraints on a fixed committee size — translate both into bounds on the *same* variable first; they often turn out to be the same constraint stated twice.\n\n**Takeaway**\nWith a fixed total, one side's bound restates the other's.",
    fastest_path_md:
      "At most $3$ men means $0$–$3$ men, which automatically gives $2$–$5$ women. Sum $\\binom{6}{m}\\binom{5}{5-m}$ for $m = 0,1,2,3$: $1 + 30 + 150 + 200 = 381$.",
    trap_map: {
      "0": "Counts only the $3$-men, $2$-women case, $\\binom{6}{3}\\binom{5}{2} = 200$, taking the constraints as exact rather than as bounds.",
      "1": "Drops the all-women committee, treating \"no more than $3$ men\" as requiring at least one: $381 - 1 = 380$.",
      "3": "Reads \"at least $2$ women\" as \"at least $1$ woman\", counting everything except the all-male committees: $\\binom{11}{5} - \\binom{6}{5} = 456$.",
      "4": "Ignores both constraints: $\\binom{11}{5} = 462$.",
    },
    numeric_check:
      "combinations(6,0)*combinations(5,5) + combinations(6,1)*combinations(5,4) + combinations(6,2)*combinations(5,3) + combinations(6,3)*combinations(5,2)",
    check() {
      // Enumerate every 5-subset of the 11 named people.
      const isMan = (i) => i < 6;
      let count = 0;
      for (const s of subsets(11, 5)) {
        const men = s.filter(isMan).length;
        const women = 5 - men;
        if (men <= 3 && women >= 2) count++;
      }
      return { kind: "value", value: count };
    },
    trap_values() {
      const isMan = (i) => i < 6;
      const all = subsets(11, 5);
      return {
        "0": all.filter((s) => s.filter(isMan).length === 3).length,
        "1": all.filter((s) => {
          const m = s.filter(isMan).length;
          return m >= 1 && m <= 3 && 5 - m >= 2;
        }).length,
        "3": all.filter((s) => 5 - s.filter(isMan).length >= 1).length,
        "4": all.length,
      };
    },
  },

  // ── 3. lattice paths avoiding one intersection ─────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 5,
    stem_md:
      "A courier travels on a street grid from the corner $(0,0)$ to the corner $(6,4)$, moving only one block east or one block north at a time. Roadworks have closed the intersection at $(3,2)$ entirely. How many routes are still available?",
    choices: ["$100$", "$110$", "$120$", "$190$", "$210$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nEvery route is a sequence of $6$ easts and $4$ norths, so there are $\\binom{10}{4} = 210$ routes in all. A route through $(3,2)$ splits into an independent first leg and second leg: $\\binom{5}{2} = 10$ ways to reach $(3,2)$ and $\\binom{5}{2} = 10$ ways onward, so $10 \\times 10 = 100$ routes use the closed corner. The rest number $210 - 100 = 110$.\n\n**Trigger cue**\nA blocked point on a lattice grid — count all routes, then count those through the block as a *product* of two independent legs, and subtract.\n\n**Takeaway**\nRoutes through a point multiply; routes avoiding it subtract.",
    fastest_path_md:
      "$\\binom{10}{4} = 210$ total; $\\binom{5}{2}^2 = 100$ pass through $(3,2)$; $210 - 100 = 110$.",
    trap_map: {
      "0": "Counts the routes the question excludes — the $100$ that pass through $(3,2)$.",
      "2": "Miscounts the north moves as three rather than four, using $\\binom{10}{3} = 120$.",
      "3": "Adds the two legs instead of multiplying them, subtracting $10 + 10 = 20$ from $210$.",
      "4": "Ignores the closure and answers with the unrestricted total $\\binom{10}{4} = 210$.",
    },
    numeric_check: "combinations(10,4) - combinations(5,2)^2",
    check() {
      // Dynamic programming over the actual grid with the corner removed.
      const w = 6;
      const h = 4;
      const grid = Array.from({ length: w + 1 }, () => new Array(h + 1).fill(0));
      for (let x = 0; x <= w; x++) {
        for (let y = 0; y <= h; y++) {
          if (x === 3 && y === 2) continue; // closed
          if (x === 0 && y === 0) {
            grid[x][y] = 1;
            continue;
          }
          grid[x][y] = (x > 0 ? grid[x - 1][y] : 0) + (y > 0 ? grid[x][y - 1] : 0);
        }
      }
      return { kind: "value", value: grid[w][h] };
    },
    trap_values() {
      return {
        "0": choose(5, 2) ** 2,
        "2": choose(10, 3),
        "3": choose(10, 4) - (choose(5, 2) + choose(5, 2)),
        "4": choose(10, 4),
      };
    },
  },

  // ── 4. a round table with a block and an exclusion ──────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 5,
    stem_md:
      "Eight people are to be seated around a circular table; seatings that differ only by a rotation are considered the same. Two of the eight, Ana and Bruno, insist on sitting next to each other, and a third, Carla, refuses to sit next to Ana. How many seatings satisfy both conditions?",
    choices: ["$240$", "$600$", "$720$", "$1{,}200$", "$1{,}440$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nGlue Ana and Bruno into one block. That leaves $7$ units around a circle, which can be arranged in $(7-1)! = 720$ ways, and the block has $2$ internal orders, giving $1440$ seatings that satisfy Ana–Bruno.\n\nNow remove those where Carla sits beside Ana. Inside the block Ana has exactly one free side, so Carla adjacent to Ana means Carla occupies the unit on that side. Gluing Carla to the block leaves $6$ units, arranged in $(6-1)! = 120$ ways, and this happens for each of the $2$ internal block orders: $240$ seatings. The answer is $1440 - 240 = 1200$.\n\n**Trigger cue**\nCircular seating with a \"must sit together\" pair — glue the pair into a block, use $(n-1)!$ on the resulting units, and multiply by the block's internal orders.\n\n**Takeaway**\nGlue the pair, use $(n-1)!$, then multiply by internal orders.",
    fastest_path_md:
      "Block Ana–Bruno: $6! \\times 2 = 1440$. Carla beside Ana glues a second time: $5! \\times 2 = 240$. Answer $1440 - 240 = 1200$.",
    trap_map: {
      "0": "Counts the seatings being excluded — the $240$ in which Carla sits beside Ana.",
      "1": "Forgets that Ana and Bruno can swap inside their block, computing $720 - 120 = 600$.",
      "2": "Answers with the bare circular count $(7-1)! = 720$, applying neither the internal order nor Carla's restriction.",
      "4": "Applies the Ana–Bruno condition but ignores Carla entirely: $6! \\times 2 = 1{,}440$.",
    },
    numeric_check: "720*2 - 120*2",
    check() {
      // Fix person 0's seat to kill rotations, permute the other seven.
      const people = [1, 2, 3, 4, 5, 6, 7];
      const ANA = 0;
      const BRUNO = 1;
      const CARLA = 2;
      let count = 0;
      const perm = (rest, acc) => {
        if (rest.length === 0) {
          const table = [0, ...acc];
          const nextTo = (a, b) => {
            const i = table.indexOf(a);
            const j = table.indexOf(b);
            const d = Math.abs(i - j);
            return d === 1 || d === 7;
          };
          if (nextTo(ANA, BRUNO) && !nextTo(CARLA, ANA)) count++;
          return;
        }
        for (let i = 0; i < rest.length; i++) {
          perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, rest[i]]);
        }
      };
      perm(people, []);
      return { kind: "value", value: count };
    },
    trap_values() {
      return { "0": 120 * 2, "1": 720 - 120, "2": 720, "4": 720 * 2 };
    },
  },

  // ══ probability ═════════════════════════════════════════════════════════

  // ── 5. a conditional probability with a computed base ──────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "A box contains $4$ red chips and $6$ blue chips. Two chips are drawn at random without replacement. Given that at least one of the two chips is red, what is the probability that both are red?",
    choices: [
      "$\\frac{1}{5}$",
      "$\\frac{2}{15}$",
      "$\\frac{1}{3}$",
      "$\\frac{2}{5}$",
      "$\\frac{2}{3}$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThere are $\\binom{10}{2} = 45$ equally likely pairs. Both red: $\\binom{4}{2} = 6$. At least one red is the complement of both blue: $45 - \\binom{6}{2} = 45 - 15 = 30$. The conditional probability restricts the sample space to those $30$: $\\dfrac{6}{30} = \\dfrac{1}{5}$.\n\n**Trigger cue**\n\"Given that …\" — the conditioning event becomes the new denominator, so count outcomes inside it rather than out of the original total.\n\n**Takeaway**\nConditioning shrinks the denominator to the given event.",
    fastest_path_md:
      "Of the $45$ pairs, $30$ contain at least one red and $6$ are all red: $6/30 = 1/5$.",
    trap_map: {
      "1": "Answers with the unconditional probability that both are red, $6/45 = \\tfrac{2}{15}$, ignoring the conditioning.",
      "2": "Answers with $P(\\text{second red} \\mid \\text{first red}) = \\tfrac{3}{9} = \\tfrac13$, conditioning on the wrong event.",
      "3": "Answers with the probability a single chip is red, $\\tfrac{4}{10} = \\tfrac25$.",
      "4": "Answers with the probability of the conditioning event itself, $30/45 = \\tfrac23$.",
    },
    numeric_check: "combinations(4,2)/(combinations(10,2) - combinations(6,2))",
    check() {
      // Enumerate labelled pairs: chips 0-3 red, 4-9 blue.
      const pairs = subsets(10, 2);
      const isRed = (i) => i < 4;
      const atLeastOne = pairs.filter((p) => p.some(isRed));
      const bothRed = atLeastOne.filter((p) => p.every(isRed));
      return { kind: "value", value: bothRed.length / atLeastOne.length };
    },
    trap_values() {
      const pairs = subsets(10, 2);
      const isRed = (i) => i < 4;
      return {
        "1": pairs.filter((p) => p.every(isRed)).length / pairs.length,
        "2": 3 / 9,
        "3": 4 / 10,
        "4": pairs.filter((p) => p.some(isRed)).length / pairs.length,
      };
    },
  },

  // ── 6. "at least two" without replacement ──────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "A bag holds $5$ white balls and $3$ black balls. Three balls are drawn at random without replacement. What is the probability that at least two of them are white?",
    choices: [
      "$\\frac{5}{28}$",
      "$\\frac{15}{28}$",
      "$\\frac{5}{7}$",
      "$\\frac{175}{256}$",
      "$\\frac{55}{56}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThere are $\\binom{8}{3} = 56$ equally likely triples. Exactly two white: $\\binom{5}{2}\\binom{3}{1} = 10 \\times 3 = 30$. All three white: $\\binom{5}{3} = 10$. So at least two white is $\\dfrac{30 + 10}{56} = \\dfrac{40}{56} = \\dfrac57$.\n\n**Trigger cue**\n\"At least $k$\" on a small draw without replacement — enumerate the two or three cases with combinations; the complement only helps when it has fewer cases.\n\n**Takeaway**\nWithout replacement, count combinations — binomial powers do not apply.",
    fastest_path_md:
      "$\\binom52\\binom31 + \\binom53 = 30 + 10 = 40$ out of $\\binom83 = 56$, which is $\\tfrac57$.",
    trap_map: {
      "0": "Counts only the all-white case, $\\binom53/\\binom83 = \\tfrac{10}{56} = \\tfrac{5}{28}$.",
      "1": "Counts only the exactly-two case, $\\tfrac{30}{56} = \\tfrac{15}{28}$, reading \"at least two\" as \"exactly two\".",
      "3": "Treats the draws as independent with replacement, $\\binom32 \\left(\\tfrac58\\right)^2\\tfrac38 + \\left(\\tfrac58\\right)^3 = \\tfrac{175}{256}$.",
      "4": "Answers with \"at least *one* white\", $1 - \\binom33/\\binom83 = \\tfrac{55}{56}$.",
    },
    numeric_check:
      "(combinations(5,2)*combinations(3,1) + combinations(5,3))/combinations(8,3)",
    check() {
      // Enumerate labelled triples: balls 0-4 white, 5-7 black.
      const triples = subsets(8, 3);
      const white = (i) => i < 5;
      const good = triples.filter((t) => t.filter(white).length >= 2);
      return { kind: "value", value: good.length / triples.length };
    },
    trap_values() {
      const triples = subsets(8, 3);
      const white = (i) => i < 5;
      const p = 5 / 8;
      return {
        "0": triples.filter((t) => t.filter(white).length === 3).length / triples.length,
        "1": triples.filter((t) => t.filter(white).length === 2).length / triples.length,
        "3": 3 * p * p * (1 - p) + p ** 3,
        "4": triples.filter((t) => t.filter(white).length >= 1).length / triples.length,
      };
    },
  },

  // ── 7. the union of two overlapping events ─────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "Two integers $x$ and $y$ are chosen independently and at random, each equally likely to be any of $1, 2, 3, 4, 5, 6$. What is the probability that $x + y$ is a multiple of $4$ or that $xy$ is odd?",
    choices: [
      "$\\frac{1}{9}$",
      "$\\frac{1}{4}$",
      "$\\frac{5}{18}$",
      "$\\frac{7}{18}$",
      "$\\frac{1}{2}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThere are $36$ ordered pairs. $x + y$ is a multiple of $4$ for sums $4$, $8$, and $12$: $3 + 5 + 1 = 9$ pairs. $xy$ is odd exactly when both are odd: $3 \\times 3 = 9$ pairs. The two events overlap where both are odd *and* the sum is a multiple of $4$: $(1,3), (3,1), (3,5), (5,3)$ — $4$ pairs. Inclusion–exclusion gives $9 + 9 - 4 = 14$, so the probability is $\\dfrac{14}{36} = \\dfrac{7}{18}$.\n\n**Trigger cue**\n\"$A$ or $B$\" where both can happen at once — add the counts and subtract the overlap; on a $6 \\times 6$ grid the overlap is small enough to list.\n\n**Takeaway**\nFor \"or\", add the two counts and subtract the overlap once.",
    fastest_path_md:
      "$9$ pairs give a sum divisible by $4$; $9$ pairs give an odd product; $4$ pairs do both. $\\dfrac{9 + 9 - 4}{36} = \\dfrac{7}{18}$.",
    trap_map: {
      "0": "Answers with the overlap alone, $\\tfrac{4}{36} = \\tfrac19$.",
      "1": "Counts only one of the two events, $\\tfrac{9}{36} = \\tfrac14$.",
      "2": "Subtracts the overlap twice: $\\tfrac{9 + 9 - 8}{36} = \\tfrac{10}{36} = \\tfrac{5}{18}$.",
      "4": "Adds the two events without removing the overlap: $\\tfrac{9 + 9}{36} = \\tfrac12$.",
    },
    numeric_check: "14/36",
    check() {
      // Enumerate all 36 ordered pairs.
      let hits = 0;
      for (let x = 1; x <= 6; x++) {
        for (let y = 1; y <= 6; y++) {
          if ((x + y) % 4 === 0 || (x * y) % 2 === 1) hits++;
        }
      }
      return { kind: "value", value: hits / 36 };
    },
    trap_values() {
      let a = 0;
      let b = 0;
      let both = 0;
      for (let x = 1; x <= 6; x++) {
        for (let y = 1; y <= 6; y++) {
          const inA = (x + y) % 4 === 0;
          const inB = (x * y) % 2 === 1;
          if (inA) a++;
          if (inB) b++;
          if (inA && inB) both++;
        }
      }
      return {
        "0": both / 36,
        "1": a / 36,
        "2": (a + b - 2 * both) / 36,
        "4": (a + b) / 36,
      };
    },
  },

  // ── 8. a stopping rule over a bounded number of flips ──────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "A fair coin is flipped repeatedly and stops as soon as either two heads appear in a row or four flips have been made, whichever comes first. What is the probability that the flipping stops because two heads appeared in a row?",
    choices: [
      "$\\frac{1}{4}$",
      "$\\frac{3}{8}$",
      "$\\frac{1}{2}$",
      "$\\frac{5}{8}$",
      "$\\frac{3}{4}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nStopping early never changes *whether* two consecutive heads occur within four flips, so count length-four sequences: $16$ in all. Those with no two adjacent heads are the Fibonacci count $F_6 = 8$ — namely $\\text{TTTT}$, $\\text{TTTH}$, $\\text{TTHT}$, $\\text{THTT}$, $\\text{HTTT}$, $\\text{THTH}$, $\\text{HTHT}$, $\\text{HTTH}$. So $16 - 8 = 8$ sequences contain $\\text{HH}$, and the probability is $\\dfrac{8}{16} = \\dfrac12$.\n\n**Trigger cue**\nA stopping rule with a hard cap — extend every path to the cap; the stopping rule changes when you stop looking, not which paths qualify.\n\n**Takeaway**\nA capped stopping rule: enumerate to the cap and count.",
    fastest_path_md:
      "Count length-$4$ strings with no $\\text{HH}$: $8$ of $16$. So $\\text{HH}$ appears in the other $8$, a probability of $\\tfrac12$.",
    trap_map: {
      "0": "Considers only the first two flips, $P(\\text{HH}) = \\tfrac14$.",
      "1": "Stops counting after three flips: $\\tfrac14 + \\tfrac18 = \\tfrac38$.",
      "3": "Takes the complement of that three-flip figure: $1 - \\tfrac38 = \\tfrac58$.",
      "4": "Adds $\\tfrac14$ for each of the three adjacent positions, double-counting the overlaps: $\\tfrac34$.",
    },
    numeric_check: "8/16",
    check() {
      // Enumerate all 16 flip sequences and apply the stopping rule.
      let stopped = 0;
      for (let mask = 0; mask < 16; mask++) {
        const flips = [0, 1, 2, 3].map((i) => (mask >> i) & 1); // 1 = heads
        let heads = 0;
        for (let i = 0; i < 4; i++) {
          heads = flips[i] === 1 ? heads + 1 : 0;
          if (heads === 2) {
            stopped++;
            break;
          }
        }
      }
      return { kind: "value", value: stopped / 16 };
    },
    trap_values() {
      return { "0": 1 / 4, "1": 1 / 4 + 1 / 8, "3": 1 - 3 / 8, "4": 3 * (1 / 4) };
    },
  },

  // ══ series_patterns ═════════════════════════════════════════════════════

  // ── 9. a term recovered from a sum formula ─────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "The sum of the first $n$ terms of a sequence is $3n^2 + 5n$ for every positive integer $n$. What is the twelfth term of the sequence?",
    choices: ["$68$", "$72$", "$74$", "$80$", "$492$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nA single term is the difference of consecutive partial sums: $a_{12} = S_{12} - S_{11}$. Here $S_{12} = 3(144) + 5(12) = 492$ and $S_{11} = 3(121) + 5(11) = 418$, so $a_{12} = 74$.\n\nIn general $a_n = S_n - S_{n-1} = 3n^2 + 5n - 3(n-1)^2 - 5(n-1) = 6n + 2$, confirming $a_{12} = 74$ and showing the sequence is arithmetic with common difference $6$.\n\n**Trigger cue**\nA formula for the *sum* with a single term requested — subtract consecutive partial sums; never read the sum formula as a term formula.\n\n**Takeaway**\nOne term is the difference of consecutive partial sums.",
    fastest_path_md:
      "$a_n = S_n - S_{n-1} = 6n + 2$, so $a_{12} = 74$.",
    trap_map: {
      "0": "Slips one index back, computing $a_{11} = 6(11) + 2 = 68$.",
      "1": "Drops the constant from $a_n = 6n + 2$, using $6 \\times 12 = 72$.",
      "3": "Slips one index forward, computing $a_{13} = 6(13) + 2 = 80$.",
      "4": "Answers with the partial sum $S_{12} = 492$ rather than the twelfth term.",
    },
    numeric_check: "(3*12^2 + 5*12) - (3*11^2 + 5*11)",
    check() {
      // Build the terms from the sum formula and read the twelfth.
      const S = (n) => 3 * n * n + 5 * n;
      const terms = [];
      for (let n = 1; n <= 12; n++) terms.push(S(n) - (n === 1 ? 0 : S(n - 1)));
      const diffs = terms.slice(1).map((t, i) => t - terms[i]);
      if (new Set(diffs).size !== 1) throw new Error("terms are not arithmetic");
      return { kind: "value", value: terms[11] };
    },
    trap_values() {
      const a = (n) => 6 * n + 2;
      return { "0": a(11), "1": 6 * 12, "3": a(13), "4": 3 * 144 + 5 * 12 };
    },
  },

  // ── 10. a linear recursion iterated ────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "A sequence is defined by $a_1 = 2$ and $a_{n+1} = 3a_n - 2$ for every $n \\ge 1$. What is $a_6$?",
    choices: ["$82$", "$243$", "$244$", "$486$", "$730$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nIterate: $a_1 = 2$, $a_2 = 4$, $a_3 = 10$, $a_4 = 28$, $a_5 = 82$, $a_6 = 244$.\n\nThe structure is visible if you shift by the fixed point: the recursion's fixed point solves $x = 3x - 2$, giving $x = 1$, and $a_{n+1} - 1 = 3(a_n - 1)$. Since $a_1 - 1 = 1$, we get $a_n - 1 = 3^{n-1}$, so $a_n = 3^{n-1} + 1$ and $a_6 = 243 + 1 = 244$.\n\n**Trigger cue**\n$a_{n+1} = ra_n + c$ — subtract the fixed point $\\dfrac{c}{1-r}$ and what remains is purely geometric.\n\n**Takeaway**\nShift a linear recursion by its fixed point to make it geometric.",
    fastest_path_md:
      "$2, 4, 10, 28, 82, 244$ — six terms of doubling-and-a-bit, or $3^{n-1} + 1$ directly.",
    trap_map: {
      "0": "Stops one step early at $a_5 = 82$.",
      "1": "Drops the $+1$ from the closed form, answering $3^5 = 243$.",
      "3": "Treats the recursion as pure tripling, $a_n = 2 \\cdot 3^{n-1} = 486$, ignoring the $-2$.",
      "4": "Runs one step too far to $a_7 = 730$.",
    },
    numeric_check: "3^5 + 1",
    check() {
      let a = 2;
      for (let n = 1; n < 6; n++) a = 3 * a - 2;
      return { kind: "value", value: a };
    },
    trap_values() {
      let a = 2;
      const seq = [2];
      for (let n = 1; n < 7; n++) {
        a = 3 * a - 2;
        seq.push(a);
      }
      return { "0": seq[4], "1": 3 ** 5, "3": 2 * 3 ** 5, "4": seq[6] };
    },
  },

  // ── 11. an alternating sum of squares ──────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "What is the value of $1^2 - 2^2 + 3^2 - 4^2 + \\cdots + 99^2 - 100^2$?",
    choices: [
      "$-338{,}350$",
      "$-5{,}050$",
      "$-50$",
      "$50$",
      "$5{,}050$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nPair the terms and factor each pair as a difference of squares: $(2k-1)^2 - (2k)^2 = \\left[(2k-1) - 2k\\right]\\left[(2k-1) + 2k\\right] = -(4k - 1)$. Summing over $k = 1$ to $50$ gives $-\\sum_{k=1}^{50}(4k - 1) = -(3 + 7 + \\cdots + 199)$. That is an arithmetic series of $50$ terms averaging $\\dfrac{3 + 199}{2} = 101$, so the total is $-50 \\times 101 = -5{,}050$.\n\n**Trigger cue**\nAlternating signs on consecutive squares — pair adjacent terms and factor the difference of squares; each pair collapses to a linear term.\n\n**Takeaway**\nPair alternating squares; each pair collapses to a sum.",
    fastest_path_md:
      "Each pair $(2k-1)^2 - (2k)^2 = -(4k-1)$, so the total is $-(3 + 7 + \\cdots + 199) = -50 \\times 101 = -5{,}050$.",
    trap_map: {
      "0": "Subtracts every square instead of alternating: $-\\sum_{n=1}^{100} n^2 = -338{,}350$.",
      "2": "Forgets the squares and evaluates $1 - 2 + 3 - \\cdots - 100 = -50$.",
      "3": "Evaluates that same unsquared sum and reports it with the wrong sign.",
      "4": "Computes $3 + 7 + \\cdots + 199 = 5{,}050$ and reports it positive, losing the sign that every pair carries.",
    },
    numeric_check: "-50*101",
    check() {
      let total = 0;
      for (let n = 1; n <= 100; n++) total += (n % 2 === 1 ? 1 : -1) * n * n;
      return { kind: "value", value: total };
    },
    trap_values() {
      let squares = 0;
      let plain = 0;
      for (let n = 1; n <= 100; n++) {
        squares += n * n;
        plain += (n % 2 === 1 ? 1 : -1) * n;
      }
      return { "0": -squares, "2": plain, "3": -plain, "4": 50 * 101 };
    },
  },

  // ── 12. a periodic recursion read at a far index ───────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "series_patterns",
    difficulty: 5,
    stem_md:
      "A sequence satisfies $a_1 = 5$, $a_2 = 8$, and $a_n = a_{n-1} - a_{n-2}$ for every $n \\ge 3$. What is $a_{100}$?",
    choices: ["$-8$", "$-5$", "$-3$", "$5$", "$8$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nWrite out terms: $5, 8, 3, -5, -8, -3, 5, 8, \\ldots$ — the sequence repeats with period $6$, which is forced by the recursion for any starting pair. Since $100 = 6(16) + 4$, $a_{100} = a_4 = -5$.\n\n**Trigger cue**\n$a_n = a_{n-1} - a_{n-2}$ — this recursion is always periodic with period $6$; find the remainder of the index mod $6$ and read off that term.\n\n**Takeaway**\nSubtract-the-previous-two recursions cycle with period six.",
    fastest_path_md:
      "The cycle is $5, 8, 3, -5, -8, -3$. $100 \\bmod 6 = 4$, so $a_{100} = a_4 = -5$.",
    trap_map: {
      "0": "Slips one place forward in the cycle, reading $a_5 = -8$.",
      "2": "Treats $100$ as a multiple of the period and reads the cycle's last term, $a_6 = -3$.",
      "3": "Mis-reads the period as $3$: $100 \\bmod 3 = 1$, giving $a_1 = 5$.",
      "4": "Mis-reads the period as $2$: $100 \\bmod 2 = 0$, giving $a_2 = 8$.",
    },
    numeric_check: null,
    check(q) {
      const a = [null, 5, 8];
      for (let n = 3; n <= 100; n++) a[n] = a[n - 1] - a[n - 2];
      const label = `$${a[100]}$`;
      const index = q.choices.indexOf(label);
      if (index < 0) throw new Error(`computed ${label}, not among the choices`);
      return { kind: "index", index };
    },
    trap_values() {
      const a = [null, 5, 8];
      for (let n = 3; n <= 10; n++) a[n] = a[n - 1] - a[n - 2];
      return {
        "0": `$${a[5]}$`,
        "2": `$${a[6]}$`,
        "3": `$${a[1]}$`,
        "4": `$${a[2]}$`,
      };
    },
  },

  // ══ statistics_mean_median_sd ═══════════════════════════════════════════

  // ── 13. maximizing one value under a mean and a median ─────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "A list of $7$ distinct positive integers has a median of $10$ and a mean of $12$. What is the greatest possible value of the largest integer in the list?",
    choices: ["$45$", "$47$", "$48$", "$59$", "$74$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe seven values sum to $7 \\times 12 = 84$, and sorted, the fourth is $10$. To push the largest as high as possible, make the other six as small as the constraints allow. The three below the median must be distinct positive integers under $10$: at least $1, 2, 3$. The two between the median and the largest must be distinct and greater than $10$: at least $11, 12$. Those six plus the median total $1 + 2 + 3 + 10 + 11 + 12 = 39$, leaving $84 - 39 = 45$, which is indeed larger than $12$.\n\n**Trigger cue**\n\"Greatest possible value\" with a fixed mean — the sum is locked, so maximizing one entry means minimizing every other, subject to the ordering and distinctness the stem imposes.\n\n**Takeaway**\nA fixed mean locks the sum; maximize one by minimizing the rest.",
    fastest_path_md:
      "Sum is $84$. Minimum for the other six under the constraints: $1 + 2 + 3 + 10 + 11 + 12 = 39$. So the largest is $45$.",
    trap_map: {
      "1": "Lets one of the two values above the median equal $10$, ignoring distinctness: $84 - (1+2+3+10+10+11) = 47$.",
      "2": "Lets both values above the median equal $10$: $84 - (1+2+3+10+10+10) = 48$.",
      "3": "Minimizes the other six as $1,2,3,4,5$ and the median, forgetting two of them must exceed the median: $84 - 25 = 59$.",
      "4": "Subtracts only the median from the total: $84 - 10 = 74$.",
    },
    numeric_check: "7*12 - (1+2+3+10+11+12)",
    check() {
      // Search the extremal list directly over the admissible ranges.
      let best = 0;
      for (let a = 1; a <= 9; a++) {
        for (let b = a + 1; b <= 9; b++) {
          for (let c = b + 1; c <= 9; c++) {
            for (let e = 11; e <= 80; e++) {
              for (let f = e + 1; f <= 80; f++) {
                const g = 84 - (a + b + c + 10 + e + f);
                if (g > f) best = Math.max(best, g);
              }
            }
          }
        }
      }
      if (best === 0) throw new Error("no admissible list found");
      return { kind: "value", value: best };
    },
    trap_values() {
      return {
        "1": 84 - (1 + 2 + 3 + 10 + 10 + 11),
        "2": 84 - (1 + 2 + 3 + 10 + 10 + 10),
        "3": 84 - (1 + 2 + 3 + 4 + 5 + 10),
        "4": 84 - 10,
      };
    },
  },

  // ── 14. how a linear transform moves the spread ────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "The set $S = \\{1, 3, 5, 7, 9\\}$ has standard deviation $2\\sqrt{2}$. Every element of $S$ is multiplied by $3$ and then reduced by $4$, producing a new set. What is the standard deviation of the new set?",
    choices: [
      "$2\\sqrt{2}$",
      "$6\\sqrt{2} - 4$",
      "$6\\sqrt{2}$",
      "$18\\sqrt{2}$",
      "$72$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nStandard deviation measures spread about the mean, so adding a constant to every element moves the mean by the same amount and leaves every deviation unchanged: the $-4$ does nothing. Multiplying every element by $3$ multiplies every deviation by $3$, hence the standard deviation by $|3| = 3$. The new value is $3 \\times 2\\sqrt2 = 6\\sqrt2$.\n\n**Trigger cue**\nA set transformed by $ax + b$ — the standard deviation scales by $|a|$ and ignores $b$ entirely; the *variance* scales by $a^2$.\n\n**Takeaway**\nShifts leave spread alone; scaling multiplies it by the factor.",
    fastest_path_md:
      "Adding $-4$ shifts, changing nothing; multiplying by $3$ triples the spread: $6\\sqrt2$.",
    trap_map: {
      "0": "Treats both operations as shifts, leaving the standard deviation at $2\\sqrt2$.",
      "1": "Applies the $-4$ to the standard deviation as well as the scaling: $3(2\\sqrt2) - 4$.",
      "3": "Applies the factor of $3$ twice — once to each deviation and again to the result: $9 \\times 2\\sqrt2$.",
      "4": "Answers with the new *variance* $9 \\times 8 = 72$ instead of the standard deviation.",
    },
    numeric_check: "6*sqrt(2)",
    check() {
      // Recompute the population standard deviation from the raw numbers.
      const transformed = [1, 3, 5, 7, 9].map((x) => 3 * x - 4);
      const mean = transformed.reduce((s, v) => s + v, 0) / transformed.length;
      const variance =
        transformed.reduce((s, v) => s + (v - mean) ** 2, 0) / transformed.length;
      return { kind: "value", value: Math.sqrt(variance) };
    },
    trap_values() {
      const base = 2 * Math.SQRT2;
      return { "0": base, "1": 3 * base - 4, "3": 9 * base, "4": 9 * 8 };
    },
  },

  // ── 15. a count recovered from two averages ────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "A list of $n$ numbers has an average of $32$. When the two numbers $20$ and $26$ are removed from the list, the average of the numbers that remain is $35$. What is $n$?",
    choices: ["$3$", "$6$", "$8$", "$10$", "$24$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nWork with totals. The original total is $32n$; removing $20$ and $26$ leaves $32n - 46$ spread over $n - 2$ numbers, so $32n - 46 = 35(n - 2) = 35n - 70$. Hence $24 = 3n$ and $n = 8$.\n\nThe lever view: the two removed numbers sit $12$ and $6$ below the original mean, a deficit of $18$; removing them lifts the mean by $3$ across the $6$ remaining numbers, which is $18$ — consistent.\n\n**Trigger cue**\nAn average before and after removing known values — convert both averages to totals, since only totals can be added and subtracted.\n\n**Takeaway**\nAverages do not subtract; totals do.",
    fastest_path_md:
      "$32n - 46 = 35(n-2)$ gives $3n = 24$, so $n = 8$.",
    trap_map: {
      "0": "Answers with the $35 - 32 = 3$ gap between the two averages.",
      "1": "Answers with the count *after* the removal, $n - 2 = 6$.",
      "3": "Adds $2$ instead of subtracting when converting back from the reduced count: $6 + 4 = 10$.",
      "4": "Answers with the numerator $70 - 46 = 24$ without dividing by $3$.",
    },
    numeric_check: "(35*2 - (20+26))/(35-32)",
    check() {
      const found = [];
      for (let n = 3; n <= 500; n++) {
        if (Math.abs(32 * n - 46 - 35 * (n - 2)) < 1e-9) found.push(n);
      }
      if (found.length !== 1) throw new Error(`expected one n, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 35 - 32, "1": 8 - 2, "3": 6 + 4, "4": 70 - 46 };
    },
  },

  // ── 16. mean, median and range together ────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "statistics_mean_median_sd",
    difficulty: 5,
    stem_md:
      "Five distinct positive integers have a mean of $15$, a median of $18$, and a range of $20$. What is the greatest possible value of the smallest of the five integers?",
    choices: ["$5$", "$6$", "$15$", "$18$", "$25$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nSorted, call them $a < b < c < d < e$ with $c = 18$, $e = a + 20$, and $a + b + c + d + e = 75$. Substituting: $2a + b + d = 37$. Pushing $a$ up forces $b$ and $d$ down, and they are bounded below by $b \\ge a + 1$ and $d \\ge 19$. So $37 - 2a = b + d \\ge a + 20$, giving $3a \\le 17$ and $a \\le 5$. At $a = 5$: $b + d = 27$ with $d = 19$ and $b = 8$, i.e. $\\{5, 8, 18, 19, 25\\}$ — mean $15$, median $18$, range $20$, all distinct.\n\n**Trigger cue**\nMean, median and range at once — the mean fixes the sum, the median pins the middle entry, and the range ties the two ends together, collapsing five unknowns to three.\n\n**Takeaway**\nThe range ties the ends; the median pins the middle.",
    fastest_path_md:
      "Sum $75$, middle $18$, $e = a + 20$, so $2a + b + d = 37$ with $b > a$ and $d > 18$: $3a \\le 17$, so $a = 5$ via $\\{5, 8, 18, 19, 25\\}$.",
    trap_map: {
      "1": "Drops the distinctness requirement, allowing $d = 18$ to tie the median and reaching $a = 6$.",
      "2": "Answers with the mean $15$.",
      "3": "Answers with the median $18$.",
      "4": "Answers with the largest value of the extremal list, $25$, rather than the smallest.",
    },
    numeric_check: "5",
    check() {
      // Enumerate every admissible five-element set.
      let best = 0;
      for (let a = 1; a <= 40; a++) {
        const e = a + 20;
        for (let b = a + 1; b < 18; b++) {
          for (let d = 19; d < e; d++) {
            if (a + b + 18 + d + e === 75) best = Math.max(best, a);
          }
        }
      }
      if (best === 0) throw new Error("no admissible set found");
      return { kind: "value", value: best };
    },
    trap_values() {
      // Same search with distinctness relaxed at the median.
      let loose = 0;
      for (let a = 1; a <= 40; a++) {
        const e = a + 20;
        for (let b = a; b <= 18; b++) {
          for (let d = 18; d <= e; d++) {
            if (a + b + 18 + d + e === 75) loose = Math.max(loose, a);
          }
        }
      }
      return { "1": loose, "2": 15, "3": 18, "4": 5 + 20 };
    },
  },

  // ══ overlapping_sets ════════════════════════════════════════════════════

  // ── 17. three-set inclusion–exclusion ──────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 5,
    stem_md:
      "Among $100$ students, $45$ study French, $52$ study German, and $38$ study Spanish. Of these, $18$ study both French and German, $15$ study both German and Spanish, and $12$ study both French and Spanish, while $6$ study all three languages. How many of the $100$ students study none of the three?",
    choices: ["$4$", "$6$", "$10$", "$16$", "$96$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nInclusion–exclusion for three sets: $|F \\cup G \\cup S| = 45 + 52 + 38 - 18 - 15 - 12 + 6 = 96$. The triple overlap is *added back* because subtracting all three pairwise overlaps removes it three times after it was counted three times, leaving it at zero. So $100 - 96 = 4$ students study none.\n\n**Trigger cue**\nThree sets with all three pairwise overlaps *and* the triple given — apply the alternating formula; the pairwise figures already include the triple unless the stem says \"only\".\n\n**Takeaway**\nAdd the triple overlap back; the pairwise counts already contain it.",
    fastest_path_md:
      "$135 - 45 + 6 = 96$ study at least one, so $4$ study none.",
    trap_map: {
      "1": "Answers with the number studying all three, $6$.",
      "2": "Omits adding the triple overlap back, getting $90$ in the union and $10$ outside.",
      "3": "Subtracts the triple overlap instead of adding it, getting $84$ in the union and $16$ outside.",
      "4": "Answers with the number studying at least one language, $96$.",
    },
    numeric_check: "100 - (45 + 52 + 38 - 18 - 15 - 12 + 6)",
    check() {
      // Build the seven Venn regions and confirm they reproduce every
      // stated figure before reading off the outside.
      const all3 = 6;
      const fgOnly = 18 - all3;
      const gsOnly = 15 - all3;
      const fsOnly = 12 - all3;
      const fOnly = 45 - fgOnly - fsOnly - all3;
      const gOnly = 52 - fgOnly - gsOnly - all3;
      const sOnly = 38 - fsOnly - gsOnly - all3;
      const regions = [fOnly, gOnly, sOnly, fgOnly, gsOnly, fsOnly, all3];
      if (regions.some((r) => r < 0)) throw new Error("negative Venn region");
      if (fOnly + fgOnly + fsOnly + all3 !== 45) throw new Error("French mismatch");
      if (gOnly + fgOnly + gsOnly + all3 !== 52) throw new Error("German mismatch");
      if (sOnly + fsOnly + gsOnly + all3 !== 38) throw new Error("Spanish mismatch");
      const union = regions.reduce((s, r) => s + r, 0);
      return { kind: "value", value: 100 - union };
    },
    trap_values() {
      const union = 45 + 52 + 38 - 18 - 15 - 12 + 6;
      return {
        "1": 6,
        "2": 100 - (union - 6),
        "3": 100 - (union - 12),
        "4": union,
      };
    },
  },

  // ── 18. exactly-one from two sets with a neither count ─────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "overlapping_sets",
    difficulty: 5,
    stem_md:
      "Of $200$ households surveyed, $140$ own a car, $95$ own a bicycle, and $30$ own neither. How many households own exactly one of the two?",
    choices: ["$35$", "$65$", "$105$", "$135$", "$170$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nSince $30$ own neither, $200 - 30 = 170$ own at least one. Then $|C \\cup B| = |C| + |B| - |C \\cap B|$ gives $170 = 140 + 95 - |C \\cap B|$, so the overlap is $65$. \"Exactly one\" excludes the overlap from the union: $170 - 65 = 105$. Equivalently, $(140 - 65) + (95 - 65) = 75 + 30 = 105$.\n\n**Trigger cue**\n\"Exactly one\" with a \"neither\" count given — the neither count fixes the union first; the overlap then falls out, and exactly-one is the union minus the overlap.\n\n**Takeaway**\nExactly one is the union minus the overlap, counted once.",
    fastest_path_md:
      "$170$ own something, so the overlap is $140 + 95 - 170 = 65$, and exactly one is $170 - 65 = 105$.",
    trap_map: {
      "0": "Computes the overlap against all $200$ households instead of the $170$ who own something: $140 + 95 - 200 = 35$.",
      "1": "Answers with the overlap $65$ rather than the exactly-one count.",
      "3": "Subtracts the overlap from all $200$ rather than from the $170$: $200 - 65 = 135$.",
      "4": "Answers with the number owning at least one, $170$.",
    },
    numeric_check: "(200 - 30) - (140 + 95 - (200 - 30))",
    check() {
      // Solve for the four regions and verify each stated figure.
      const neither = 30;
      const union = 200 - neither;
      const both = 140 + 95 - union;
      const carOnly = 140 - both;
      const bikeOnly = 95 - both;
      if (carOnly < 0 || bikeOnly < 0 || both < 0)
        throw new Error("negative region");
      if (carOnly + bikeOnly + both + neither !== 200)
        throw new Error("regions do not total 200");
      return { kind: "value", value: carOnly + bikeOnly };
    },
    trap_values() {
      return { "0": 140 + 95 - 200, "1": 65, "3": 200 - 65, "4": 200 - 30 };
    },
  },
];

verifyAndAppend(items, {
  dryRun: !process.env.APPEND,
  requireTrapValues: true,
});
