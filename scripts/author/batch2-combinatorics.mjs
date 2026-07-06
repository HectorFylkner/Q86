/**
 * Batch 2: 13 new combinatorics items (counting_sets_series_prob_stats).
 * Cells: 2×D2 PS, 4×D3 PS, 2×D4 PS, 2×D5 PS, plus 3 DS (D3, D3, D4).
 * New angles vs. batch 1: pairings/round-robin, polygon diagonals, subset
 * counting, parity-constrained digit arrangements, circular adjacency,
 * forbidden pairs, no-couples selection, degenerate-triangle pruning,
 * unlabeled partitions, role-plus-group selection, and the subtopic's
 * first data-sufficiency items.
 * Run: node --experimental-strip-types scripts/author/batch2-combinatorics.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const items = [
  // 1. D2 PS real — round-robin pairings
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 2,
    stem_md:
      "In a chess tournament, each of the $9$ players plays every other player exactly once. How many games are played in the tournament?",
    choices: ["$18$", "$36$", "$45$", "$72$", "$81$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nEach game corresponds to one unordered pair of players, so the count is $\\binom{9}{2} = \\frac{9 \\cdot 8}{2} = 36$.\n\n**Trigger cue**\n\"Each plays every other exactly once\" (games, handshakes, matchups): count unordered pairs, $\\binom{n}{2}$.\n\n**Takeaway**\nEveryone-meets-everyone counts unordered pairs: $n(n-1)/2$.",
    fastest_path_md:
      "Player 1 plays $8$ games, player 2 plays $7$ new games, and so on: $8 + 7 + \\cdots + 1 = 36$.",
    trap_map: {
      "0": "Divides the $9 \\cdot 8 = 72$ ordered pairings by $2$ twice, halving one time too many.",
      "2": "Computes $\\binom{10}{2} = 45$, an off-by-one that pairs up $10$ players instead of $9$.",
      "3": "Counts ordered pairings $9 \\cdot 8 = 72$, tallying each game once per participant.",
      "4": "Computes $9^2 = 81$, letting each player face all $9$ players including himself.",
    },
    numeric_check: "9*8/2",
    check() {
      let games = 0;
      for (let i = 0; i < 9; i++)
        for (let j = i + 1; j < 9; j++) games++;
      return { kind: "value", value: games };
    },
  },

  // 2. D2 PS pure — diagonals of a convex octagon
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 2,
    stem_md:
      "How many diagonals does a convex polygon with $8$ sides have?",
    choices: ["$12$", "$20$", "$28$", "$40$", "$56$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nEvery pair of vertices determines either a side or a diagonal. There are $\\binom{8}{2} = 28$ pairs of vertices; removing the $8$ pairs that are adjacent (the sides) leaves $28 - 8 = 20$ diagonals.\n\n**Trigger cue**\n\"How many diagonals\" in a polygon: all vertex pairs minus the sides, $\\binom{n}{2} - n$.\n\n**Takeaway**\nDiagonals are vertex pairs minus the polygon's sides.",
    fastest_path_md:
      "Each vertex sends diagonals to the $5$ vertices that are neither itself nor its two neighbors; halve the double count: $\\frac{8 \\cdot 5}{2} = 20$.",
    trap_map: {
      "0": "Subtracts the $8$ sides twice: $28 - 8 - 8 = 12$.",
      "2": "Counts all $\\binom{8}{2} = 28$ vertex pairs and forgets to remove the $8$ sides.",
      "3": "Joins each vertex to its $5$ non-neighbors but never halves the double count: $8 \\cdot 5 = 40$.",
      "4": "Counts ordered vertex pairs, $8 \\cdot 7 = 56$.",
    },
    numeric_check: "20",
    check() {
      // vertices 0..7 around the cycle; a segment is a diagonal iff its
      // endpoints are distinct and not adjacent on the cycle
      let diagonals = 0;
      for (let i = 0; i < 8; i++)
        for (let j = i + 1; j < 8; j++) {
          const gap = j - i;
          if (gap !== 1 && gap !== 7) diagonals++;
        }
      return { kind: "value", value: diagonals };
    },
  },

  // 3. D3 PS real — nonempty subsets of a 6-set
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "A frozen-yogurt shop offers $6$ different toppings. A customer may choose any combination of the toppings but must choose at least one. How many different topping combinations are possible?",
    choices: ["$21$", "$32$", "$63$", "$64$", "$720$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nEach topping is independently in or out of the combination, giving $2^6 = 64$ subsets of the $6$ toppings. The \"at least one\" condition removes exactly the empty combination: $64 - 1 = 63$.\n\n**Trigger cue**\n\"Any combination of $n$ items\": each item is a yes/no switch, so count $2^n$ subsets and trim the excluded cases.\n\n**Takeaway**\nAny-combination counting is $2^n$; subtract the empty set if required.",
    fastest_path_md:
      "Two states per topping gives $2^6 = 64$; strike the all-no case to get $63$. No need to sum $\\binom{6}{1} + \\binom{6}{2} + \\cdots$ term by term.",
    trap_map: {
      "0": "Adds only the one- and two-topping counts, $6 + 15 = 21$, missing the larger combinations.",
      "1": "Computes $2^5 = 32$, an off-by-one in the exponent.",
      "3": "Counts all $2^6 = 64$ subsets, including the forbidden no-topping choice.",
      "4": "Computes $6! = 720$, treating the toppings as an ordered arrangement.",
    },
    numeric_check: "2^6 - 1",
    check() {
      // enumerate every subset of 6 toppings as a bitmask
      let count = 0;
      for (let mask = 0; mask < 64; mask++) {
        let size = 0;
        for (let b = 0; b < 6; b++) if (mask & (1 << b)) size++;
        if (size >= 1) count++;
      }
      return { kind: "value", value: count };
    },
  },

  // 4. D3 PS pure — even three-digit numbers, distinct digits
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "How many even three-digit integers can be formed using only the digits $1, 2, 3, 4, 5$ if no digit appears more than once in an integer?",
    choices: ["$24$", "$30$", "$40$", "$50$", "$60$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nHandle the restricted position first. The units digit must be even, so it is $2$ or $4$: $2$ choices. The tens and hundreds digits then come from the $4$ unused digits: $4 \\cdot 3$ ordered choices. Total: $2 \\cdot 4 \\cdot 3 = 24$.\n\n**Trigger cue**\nA parity or leading-digit condition on digit arrangements: fill the constrained slot first, then count down the remaining pool.\n\n**Takeaway**\nFill the most restricted digit slot first, then multiply down.",
    fastest_path_md:
      "Exactly $2$ of the $5$ digits are even, so $\\frac{2}{5}$ of the $5 \\cdot 4 \\cdot 3 = 60$ arrangements end in an even digit: $60 \\cdot \\frac{2}{5} = 24$.",
    trap_map: {
      "1": "Assumes half of the $60$ unrestricted arrangements are even, but only $2$ of the $5$ digits are even.",
      "2": "Fixes an even units digit but still draws the other two digits from all $5$: $2 \\cdot 5 \\cdot 4 = 40$.",
      "3": "Allows repeated digits: $5 \\cdot 5 \\cdot 2 = 50$.",
      "4": "Ignores the even requirement and counts all $5 \\cdot 4 \\cdot 3 = 60$ arrangements.",
    },
    numeric_check: "2*4*3",
    check() {
      const digits = [1, 2, 3, 4, 5];
      let count = 0;
      for (const a of digits)
        for (const b of digits)
          for (const c of digits) {
            if (a === b || a === c || b === c) continue;
            const n = 100 * a + 10 * b + c;
            if (n % 2 === 0) count++;
          }
      return { kind: "value", value: count };
    },
  },

  // 5. D4 PS real — circular seating with an adjacent pair
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 4,
    stem_md:
      "Six directors, including the chair and the treasurer, will be seated at a circular table with $6$ identical seats, and two seatings that differ only by a rotation are considered the same. If the chair and the treasurer must occupy adjacent seats, how many different seatings are possible?",
    choices: ["$24$", "$48$", "$120$", "$240$", "$720$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nGlue the chair and treasurer into one block, giving $5$ units around the circle. Circular arrangements of $5$ units number $(5-1)! = 24$. The block's two members can sit in $2$ internal orders, so the total is $24 \\cdot 2 = 48$.\n\n**Trigger cue**\nCircular table plus a \"must sit together\" pair: glue the pair into a block, use $(k-1)!$ for the circle, then multiply by internal orders.\n\n**Takeaway**\nCircle with a glued pair: $(k-1)!$ times the block's internal orders.",
    fastest_path_md:
      "Kill the rotation by seating the chair anywhere; the treasurer takes either neighboring seat ($2$ ways), and the other four directors fill the remaining seats in $4! = 24$ ways: $2 \\cdot 24 = 48$.",
    trap_map: {
      "0": "Glues the pair into a block but forgets the $2$ internal orders of chair and treasurer.",
      "2": "Drops the adjacency requirement and counts all $(6-1)! = 120$ circular seatings.",
      "3": "Treats the table as a row: $5! \\cdot 2 = 240$, never removing the rotations.",
      "4": "Counts $6! = 720$ linear arrangements, ignoring both the rotation rule and the constraint.",
    },
    numeric_check: "48",
    check() {
      // people 0..5 (0 = chair, 1 = treasurer) assigned to seats 0..5;
      // enumerate all 720 seatings, keep those with 0 and 1 in adjacent
      // seats mod 6, then divide by the 6 rotations per equivalence class
      const perms = [];
      const build = (rest, cur) => {
        if (!rest.length) return perms.push(cur);
        rest.forEach((x, i) =>
          build(rest.filter((_, j) => j !== i), [...cur, x]),
        );
      };
      build([0, 1, 2, 3, 4, 5], []);
      let adjacent = 0;
      for (const p of perms) {
        const s0 = p.indexOf(0);
        const s1 = p.indexOf(1);
        const gap = (s0 - s1 + 6) % 6;
        if (gap === 1 || gap === 5) adjacent++;
      }
      if (adjacent % 6 !== 0) throw new Error("rotation classes uneven");
      return { kind: "value", value: adjacent / 6 };
    },
  },

  // 6. D3 PS real — committee with a forbidden pair
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "A manager will choose a $3$-person project team from $8$ employees. Two of the employees, Ana and Boris, cannot both be on the team. How many different teams can the manager choose?",
    choices: ["$6$", "$20$", "$30$", "$50$", "$56$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nWithout the restriction there are $\\binom{8}{3} = 56$ teams. Teams containing both Ana and Boris need $1$ more member from the other $6$ employees: $6$ teams. Allowed teams: $56 - 6 = 50$.\n\n**Trigger cue**\nTwo members who \"cannot both\" be selected: count all selections and subtract the ones containing the whole forbidden pair.\n\n**Takeaway**\nForbidden pair: subtract selections that contain both members.",
    fastest_path_md:
      "Complement in one line: violating teams lock in Ana and Boris and pick $1$ of the remaining $6$, so $56 - 6 = 50$. Casework (Ana only, Boris only, neither) needs three computations instead.",
    trap_map: {
      "0": "Counts the forbidden teams — the $6$ containing both Ana and Boris — instead of the allowed ones.",
      "1": "Excludes Ana and Boris entirely, counting only $\\binom{6}{3} = 20$ teams.",
      "2": "Counts only teams with exactly one of Ana or Boris, $2\\binom{6}{2} = 30$, omitting teams with neither.",
      "4": "Ignores the restriction and counts all $\\binom{8}{3} = 56$ teams.",
    },
    numeric_check: "56 - 6",
    check() {
      // employees 0..7; Ana = 0, Boris = 1
      let count = 0;
      for (let a = 0; a < 8; a++)
        for (let b = a + 1; b < 8; b++)
          for (let c = b + 1; c < 8; c++) {
            const team = [a, b, c];
            if (team.includes(0) && team.includes(1)) continue;
            count++;
          }
      return { kind: "value", value: count };
    },
  },

  // 7. D5 PS real — committee from couples, no spouses together
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 5,
    stem_md:
      "A neighborhood association consists of $4$ married couples. A committee of $3$ members will be selected from the $8$ people so that no two members of the committee are married to each other. How many different committees are possible?",
    choices: ["$8$", "$24$", "$32$", "$56$", "$192$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nA valid committee uses $3$ different couples, one person from each. Choose which $3$ of the $4$ couples are represented: $\\binom{4}{3} = 4$ ways. From each chosen couple pick either spouse: $2^3 = 8$ ways. Total: $4 \\cdot 8 = 32$.\n\n**Trigger cue**\nSelecting from couples (or other pairs) with \"no two from the same pair\": choose the pairs first, then a representative from each.\n\n**Takeaway**\nChoose the couples, then one spouse from each.",
    fastest_path_md:
      "Sequential picks: $8$ choices, then $6$ (excluding the first pick's spouse), then $4$; divide by the $3!$ orders: $\\frac{8 \\cdot 6 \\cdot 4}{6} = 32$.",
    trap_map: {
      "0": "Picks one spouse from each couple, $2^3 = 8$, but forgets to choose which $3$ of the $4$ couples are represented.",
      "1": "Chooses the $3$ couples and multiplies by $3!$ orderings instead of by the $2$ spouse choices per couple.",
      "3": "Ignores the marriage restriction: $\\binom{8}{3} = 56$.",
      "4": "Selects members in order, $8 \\cdot 6 \\cdot 4 = 192$, without dividing by the $3!$ orderings of the committee.",
    },
    numeric_check: "4 * 2^3",
    check() {
      // people 0..7; couples are (0,1), (2,3), (4,5), (6,7): partners share
      // the same floor(i/2)
      let count = 0;
      for (let a = 0; a < 8; a++)
        for (let b = a + 1; b < 8; b++)
          for (let c = b + 1; c < 8; c++) {
            const couples = [a, b, c].map((x) => Math.floor(x / 2));
            if (new Set(couples).size === 3) count++;
          }
      return { kind: "value", value: count };
    },
  },

  // 8. D4 PS pure — triangles from points with a collinear subset
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 4,
    stem_md:
      "Ten distinct points are marked in a plane. Exactly $4$ of the points lie on line $\\ell$, and no other set of $3$ of the points is collinear. How many different triangles have all three vertices among the $10$ points?",
    choices: ["$4$", "$96$", "$100$", "$116$", "$120$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nAny $3$ of the $10$ points form a triangle unless all three are collinear: $\\binom{10}{3} = 120$ triples in all. The only collinear triples come from the $4$ points on $\\ell$: $\\binom{4}{3} = 4$. Triangles: $120 - 4 = 116$.\n\n**Trigger cue**\nCounting triangles (or lines) from a point set with a collinear cluster: count all triples, subtract the degenerate collinear ones.\n\n**Takeaway**\nTriangles equal all triples minus collinear triples.",
    fastest_path_md:
      "Only the $4$-point line can spoil a triple, so subtract its $\\binom{4}{3} = 4$ bad triples from $\\binom{10}{3} = 120$: answer $116$ — no casework over vertex locations needed.",
    trap_map: {
      "0": "Reports only the $\\binom{4}{3} = 4$ collinear triples instead of subtracting them.",
      "1": "Subtracts the ordered collinear triples $4 \\cdot 3 \\cdot 2 = 24$ rather than $\\binom{4}{3} = 4$.",
      "2": "Subtracts $\\binom{6}{3} = 20$, the triples of points off the line, instead of the collinear triples.",
      "4": "Counts every triple $\\binom{10}{3} = 120$, including the collinear ones that form no triangle.",
    },
    numeric_check: "120 - 4",
    check() {
      // points 0..9; points 0..3 lie on line ℓ, and per the stem no other
      // 3 points are collinear — a triple is degenerate iff all three of
      // its points come from {0,1,2,3}
      let triangles = 0;
      for (let a = 0; a < 10; a++)
        for (let b = a + 1; b < 10; b++)
          for (let c = b + 1; c < 10; c++) {
            const onLine = [a, b, c].filter((x) => x <= 3).length;
            if (onLine < 3) triangles++;
          }
      return { kind: "value", value: triangles };
    },
  },

  // 9. D5 PS real — partition into unlabeled pairs
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 5,
    stem_md:
      "A tennis coach will divide $6$ players into $3$ doubles teams of $2$ players each. The teams are not labeled and are not assigned to particular courts. In how many different ways can the coach divide the players?",
    choices: ["$15$", "$30$", "$45$", "$90$", "$720$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nPicking the teams one after another gives $\\binom{6}{2}\\binom{4}{2}\\binom{2}{2} = 15 \\cdot 6 \\cdot 1 = 90$, but that ordering labels the teams first, second, third. Since the teams are unlabeled, divide by the $3! = 6$ orders in which the same three teams can be picked: $\\frac{90}{6} = 15$.\n\n**Trigger cue**\nSplitting a group into equal-size unlabeled teams: divide the sequential-pick product by (number of teams)$!$.\n\n**Takeaway**\nUnlabeled equal groups: divide by the factorial of the group count.",
    fastest_path_md:
      "Pair the alphabetically first player: $5$ choices of partner. The first unpaired player left has $3$ choices, and the last pair is forced: $5 \\cdot 3 \\cdot 1 = 15$.",
    trap_map: {
      "1": "Divides the $90$ sequential-pick count by $3$, the number of teams, instead of by $3! = 6$.",
      "2": "Divides the $90$ by $2$, removing only one of the repeated team orderings.",
      "3": "Picks teams in sequence, $\\binom{6}{2}\\binom{4}{2}\\binom{2}{2} = 90$, leaving the teams implicitly labeled.",
      "4": "Computes $6! = 720$, arranging all the players in a row instead of pairing them.",
    },
    numeric_check: "90/6",
    check() {
      // enumerate perfect matchings of {0..5}: always pair the smallest
      // unpaired player with each possible partner
      const countMatchings = (players) => {
        if (players.length === 0) return 1;
        const [first, ...rest] = players;
        let total = 0;
        for (let i = 0; i < rest.length; i++) {
          const remaining = rest.filter((_, j) => j !== i);
          total += countMatchings(remaining);
        }
        return total;
      };
      return { kind: "value", value: countMatchings([0, 1, 2, 3, 4, 5]) };
    },
  },

  // 10. D3 PS real — distinct role plus unordered pair
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "A club with $7$ members will select $1$ member to serve as president and $2$ other members to form an advisory panel. The two panel positions are identical. How many different selections are possible?",
    choices: ["$35$", "$42$", "$105$", "$147$", "$210$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nChoose the president: $7$ ways. Then choose the unordered pair of panel members from the remaining $6$: $\\binom{6}{2} = 15$ ways. Total: $7 \\cdot 15 = 105$.\n\n**Trigger cue**\nA selection mixing a distinct role with interchangeable positions: multiply an ordered pick by a combination, shrinking the pool between steps.\n\n**Takeaway**\nOrder the distinct roles; combine the interchangeable ones.",
    fastest_path_md:
      "Ordered slots would give $7 \\cdot 6 \\cdot 5 = 210$; the two panel seats are interchangeable, so halve it: $105$.",
    trap_map: {
      "0": "Treats all three positions as interchangeable: $\\binom{7}{3} = 35$.",
      "1": "Selects a president and only one panel member: $7 \\cdot 6 = 42$.",
      "3": "Lets the president also sit on the panel: $7 \\cdot \\binom{7}{2} = 147$.",
      "4": "Orders the two identical panel seats: $7 \\cdot 6 \\cdot 5 = 210$.",
    },
    numeric_check: "7 * 15",
    check() {
      // enumerate (president, {panelist a, panelist b}) with all distinct
      let count = 0;
      for (let p = 0; p < 7; p++)
        for (let a = 0; a < 7; a++)
          for (let b = a + 1; b < 7; b++)
            if (a !== p && b !== p) count++;
      return { kind: "value", value: count };
    },
  },

  // 11. D3 DS pure — nC4 = 126 pins n; an inequality does not
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "A school will select a team of $4$ students from the $n$ students in its math club, where $n > 4$. What is the value of $n$?\n\n(1) Exactly $126$ different $4$-student teams can be selected.\n\n(2) More than $30$ different $2$-student pairs can be formed from the $n$ students.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nStatement (1): $\\binom{n}{4} = 126$. As $n$ grows, $\\binom{n}{4}$ strictly increases ($\\binom{9}{4} = 126$, $\\binom{10}{4} = 210$), so exactly one value works: $n = 9$. Sufficient.\n\nStatement (2): $\\binom{n}{2} > 30$ holds for $n = 9$ ($36$ pairs), $n = 10$ ($45$ pairs), and every larger $n$. Many values remain. Not sufficient.\n\nThe answer is that statement (1) alone is sufficient but statement (2) alone is not.\n\n**Trigger cue**\nA DS statement equating a binomial count to a constant: monotonicity in $n$ makes the equation pin down a unique $n$, while an inequality only bounds it.\n\n**Takeaway**\nBinomial counts increase with $n$: equations fix $n$, inequalities do not.",
    fastest_path_md:
      "$\\binom{n}{4}$ strictly increases in $n$, so (1) has exactly one solution — no need to find it. (2) is an inequality satisfied by every large $n$, so it cannot be sufficient. Answer: (1) alone.",
    trap_map: {
      "1": "Assumes statement (2) pins down $n$, but every $n \\geq 9$ gives more than $30$ pairs.",
      "2": "Believes (1) needs (2)'s bound to be solved, though $\\binom{n}{4}$ increases with $n$, so $126$ is hit exactly once.",
      "3": "Credits statement (2) as also sufficient, but an inequality on $\\binom{n}{2}$ admits infinitely many $n$.",
      "4": "Treats $\\binom{n}{4} = 126$ as unsolvable, missing that it forces $n = 9$.",
    },
    numeric_check: null,
    check() {
      const choose = (n, k) => {
        let r = 1;
        for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
        return Math.round(r);
      };
      const domain = [];
      for (let n = 5; n <= 400; n++) domain.push(n);
      const s1 = domain.filter((n) => choose(n, 4) === 126);
      const s2 = domain.filter((n) => choose(n, 2) > 30);
      const both = domain.filter(
        (n) => choose(n, 4) === 126 && choose(n, 2) > 30,
      );
      const suff = (set) => new Set(set).size === 1;
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

  // 12. D4 DS pure — yes/no on a permutation count needs both statements
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 4,
    stem_md:
      "A code consists of $k$ distinct letters chosen from the first $n$ letters of the alphabet and arranged in a row, where $1 \\leq k \\leq n \\leq 26$. Is the number of possible codes greater than $500$?\n\n(1) $n = 6$\n\n(2) $k = 4$",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe number of codes is $n(n-1)\\cdots(n-k+1)$, the permutations of $k$ letters from $n$.\n\nStatement (1): with $n = 6$, the count depends on $k$: $k = 4$ gives $360$ (no) but $k = 5$ gives $720$ (yes). Not sufficient.\n\nStatement (2): with $k = 4$, the count depends on $n$: $n = 6$ gives $360$ (no) but $n = 7$ gives $840$ (yes). Not sufficient.\n\nTogether: $6 \\cdot 5 \\cdot 4 \\cdot 3 = 360 \\leq 500$, a definite \"no.\" Sufficient. The answer is both together.\n\n**Trigger cue**\nA yes/no DS about whether a count clears a threshold: test values on both sides of the threshold under each statement; a definite \"no\" is just as sufficient as a definite \"yes.\"\n\n**Takeaway**\nA guaranteed \"no\" answers a yes/no question sufficiently.",
    fastest_path_md:
      "Each statement leaves one parameter free, and nudging it crosses $500$ ($360$ vs. $720$; $360$ vs. $840$), so each alone fails. Together the count is the single number $360$ — sufficient even though the answer is \"no.\"",
    trap_map: {
      "0": "Assumes $n = 6$ caps the count below $500$, but $k = 5$ or $k = 6$ gives $720$ codes.",
      "1": "Assumes $k = 4$ settles the question, but $n = 6$ gives $360$ codes while $n = 7$ gives $840$.",
      "3": "Marks each statement sufficient, overlooking that each alone allows counts on both sides of $500$.",
      "4": "Concludes the combined count of $360$ answers nothing, but a definite \"no\" is sufficient.",
    },
    numeric_check: null,
    check() {
      // permutation count by explicit product; enumerate every (n, k) in
      // the stem's domain and collect yes/no answers under each statement
      const codes = (n, k) => {
        let r = 1;
        for (let i = 0; i < k; i++) r *= n - i;
        return r;
      };
      const pairs = [];
      for (let n = 1; n <= 26; n++)
        for (let k = 1; k <= n; k++) pairs.push([n, k]);
      const answers = (filter) =>
        new Set(
          pairs.filter(filter).map(([n, k]) => codes(n, k) > 500),
        );
      const a1 = answers(([n]) => n === 6);
      const a2 = answers(([, k]) => k === 4);
      const ac = answers(([n, k]) => n === 6 && k === 4);
      const suff = (set) => set.size === 1;
      let index;
      if (suff(a1) && suff(a2)) index = 3;
      else if (suff(a1)) index = 0;
      else if (suff(a2)) index = 1;
      else if (suff(ac)) index = 2;
      else index = 4;
      return { kind: "index", index };
    },
  },

  // 13. D3 DS real — either statement fixes the gender split
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "combinatorics",
    difficulty: 3,
    stem_md:
      "A working group of $3$ people will be selected from a team of $7$ people. How many of the possible working groups include at least one woman?\n\n(1) Exactly $4$ of the $7$ team members are women.\n\n(2) Exactly $1$ of the possible working groups consists entirely of men.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\nGroups with at least one woman $= \\binom{7}{3} - (\\text{all-male groups}) = 35 - \\binom{m}{3}$, where $m$ is the number of men. Only $m$ matters.\n\nStatement (1): $4$ women means $m = 3$, so the count is $35 - \\binom{3}{3} = 34$. Sufficient.\n\nStatement (2): $\\binom{m}{3} = 1$ forces $m = 3$ ($m \\leq 2$ gives $0$ all-male groups, $m = 4$ gives $4$), so the count is again $34$. Sufficient.\n\nEach statement alone is sufficient.\n\n**Trigger cue**\nA DS count question about \"at least one\" from a mixed group: the answer depends only on the group's composition, so any statement fixing the split is sufficient.\n\n**Takeaway**\nAt-least-one counts depend only on the composition split.",
    fastest_path_md:
      "The count is determined by the number of men $m$ alone. (1) gives $m = 3$ directly; (2) gives $\\binom{m}{3} = 1$, which only $m = 3$ satisfies. Both fix $m$, so each works — no need to compute $34$.",
    trap_map: {
      "0": "Dismisses statement (2), missing that exactly one all-male group forces exactly $3$ men.",
      "1": "Dismisses statement (1), though knowing there are $4$ women fixes the count at $35 - 1 = 34$.",
      "2": "Combines the statements unnecessarily; each alone already fixes the team's composition.",
      "4": "Treats the question as unanswerable without a roster, but only the number of women matters.",
    },
    numeric_check: null,
    check() {
      // model: w women (members 0..w-1) and 7-w men; brute-force count the
      // 3-subsets for every possible w, then test each statement
      const countAtLeastOneWoman = (w) => {
        let count = 0;
        for (let a = 0; a < 7; a++)
          for (let b = a + 1; b < 7; b++)
            for (let c = b + 1; c < 7; c++)
              if (a < w || b < w || c < w) count++;
        return count;
      };
      const countAllMale = (w) => {
        let count = 0;
        for (let a = 0; a < 7; a++)
          for (let b = a + 1; b < 7; b++)
            for (let c = b + 1; c < 7; c++)
              if (a >= w && b >= w && c >= w) count++;
        return count;
      };
      const ws = [0, 1, 2, 3, 4, 5, 6, 7];
      const s1 = ws.filter((w) => w === 4);
      const s2 = ws.filter((w) => countAllMale(w) === 1);
      const both = ws.filter((w) => w === 4 && countAllMale(w) === 1);
      const answers = (set) => new Set(set.map(countAtLeastOneWoman));
      const suff = (set) => set.length > 0 && answers(set).size === 1;
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
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
