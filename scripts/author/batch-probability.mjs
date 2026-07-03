/**
 * Batch: 6 new probability items (counting_sets_series_prob_stats / arithmetic).
 * Cells: D3 PS pure, D3 PS real, D4 PS real, D4 PS pure, D5 PS real, D5 PS real.
 * Run: node scripts/author/batch-probability.mjs   (APPEND=1 to write the bank)
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // 1 — D3 PS pure: inclusion-exclusion on multiples
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "An integer is selected at random from the integers $1$ through $60$, inclusive. What is the probability that the selected integer is a multiple of $4$ or a multiple of $6$?",
    choices: [
      "$\\dfrac{1}{6}$",
      "$\\dfrac{1}{4}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{5}{12}$",
      "$\\dfrac{1}{2}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFrom $1$ to $60$ there are $15$ multiples of $4$, $10$ multiples of $6$, and $5$ multiples of $\\mathrm{lcm}(4,6) = 12$. By inclusion–exclusion the favorable count is $15 + 10 - 5 = 20$, so the probability is $\\tfrac{20}{60} = \\tfrac{1}{3}$.\n\n**Trigger cue**\n\n\"Multiple of $a$ or $b$\" over a consecutive range: count each set, then subtract the multiples of the lcm.\n\n**Takeaway**\n\nFor \"or\" over multiples, subtract the lcm's multiples once.",
    fastest_path_md:
      "Counts up to $60$: multiples of $4$: $15$; of $6$: $10$; of $12$: $5$. Favorable $= 15 + 10 - 5 = 20$, so $\\tfrac{20}{60} = \\tfrac{1}{3}$.",
    trap_map: {
      "0": "Counts only the $10$ multiples of $6$, ignoring multiples of $4$.",
      "1": "Counts only the $15$ multiples of $4$, ignoring multiples of $6$.",
      "3": "Adds $15 + 10$ without subtracting the $5$ multiples of $12$ that were counted twice.",
      "4": "Adds the overlap instead of subtracting it: $(15 + 10 + 5)/60$.",
    },
    numeric_check: "20/60",
    check() {
      let hit = 0;
      let total = 0;
      for (let n = 1; n <= 60; n++) {
        total++;
        if (n % 4 === 0 || n % 6 === 0) hit++;
      }
      return { kind: "value", value: hit / total };
    },
  },

  // 2 — D3 PS real: exactly one of two independent events
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 3,
    stem_md:
      "On any given workday, Lena's morning bus is late with probability $0.3$ and, independently, her evening bus is late with probability $0.4$. What is the probability that, on a given workday, exactly one of the two buses is late?",
    choices: ["$0.12$", "$0.42$", "$0.46$", "$0.58$", "$0.70$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nExactly one late splits into two disjoint cases: morning late and evening on time, or morning on time and evening late. By independence, $0.3 \\cdot 0.6 + 0.7 \\cdot 0.4 = 0.18 + 0.28 = 0.46$.\n\n**Trigger cue**\n\nTwo independent events with \"exactly one\": add the two only-this-one products.\n\n**Takeaway**\n\n\"Exactly one\" happens two disjoint ways; add both products.",
    fastest_path_md:
      "Late–on time both ways: $0.3 \\cdot 0.6 + 0.7 \\cdot 0.4 = 0.18 + 0.28 = 0.46$.",
    trap_map: {
      "0": "Computes both buses late: $0.3 \\cdot 0.4$.",
      "1": "Computes neither bus late: $0.7 \\cdot 0.6$.",
      "3": "Computes at least one bus late, $1 - 0.42$, instead of exactly one.",
      "4": "Adds $0.3 + 0.4$, double-counting the day when both buses are late.",
    },
    numeric_check: "0.3*0.6 + 0.7*0.4",
    check() {
      const pM = 0.3;
      const pE = 0.4;
      let p = 0;
      for (const m of [0, 1]) {
        for (const e of [0, 1]) {
          const prob = (m ? pM : 1 - pM) * (e ? pE : 1 - pE);
          if (m + e === 1) p += prob;
        }
      }
      return { kind: "value", value: p };
    },
  },

  // 3 — D4 PS real: conditional probability on a subgroup
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 4,
    stem_md:
      "A design firm has $80$ employees: $50$ engineers and $30$ analysts. Exactly $30$ of the engineers and $10$ of the analysts work remotely. If one of the firm's remote employees is selected at random, what is the probability that the selected employee is an analyst?",
    choices: [
      "$\\dfrac{1}{8}$",
      "$\\dfrac{1}{4}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{1}{2}$",
      "$\\dfrac{3}{4}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe selection is made from the remote employees only: $30 + 10 = 40$ people. Of these, $10$ are analysts, so the probability is $\\tfrac{10}{40} = \\tfrac{1}{4}$.\n\n**Trigger cue**\n\n\"If a [subgroup] member is selected at random\": shrink the sample space to that subgroup before counting.\n\n**Takeaway**\n\nCondition first — the denominator is the remote group, not everyone.",
    fastest_path_md:
      "Restrict to the $40$ remote workers; $10$ of them are analysts: $\\tfrac{10}{40} = \\tfrac{1}{4}$.",
    trap_map: {
      "0": "Divides the $10$ remote analysts by all $80$ employees, ignoring the remote condition.",
      "2": "Reverses the condition, computing remote given analyst: $10/30$.",
      "3": "Reports the fraction of all employees who work remotely: $40/80$.",
      "4": "Computes the probability the remote employee is an engineer, the complement.",
    },
    numeric_check: "10/40",
    check() {
      const employees = [];
      for (let i = 0; i < 50; i++) employees.push({ role: "engineer", remote: i < 30 });
      for (let i = 0; i < 30; i++) employees.push({ role: "analyst", remote: i < 10 });
      const remote = employees.filter((e) => e.remote);
      const analysts = remote.filter((e) => e.role === "analyst").length;
      return { kind: "value", value: analysts / remote.length };
    },
  },

  // 4 — D4 PS pure: digit comparison over the two-digit integers
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 4,
    stem_md:
      "A two-digit positive integer is selected at random. What is the probability that its tens digit is greater than its units digit?",
    choices: [
      "$\\dfrac{1}{10}$",
      "$\\dfrac{2}{5}$",
      "$\\dfrac{9}{20}$",
      "$\\dfrac{1}{2}$",
      "$\\dfrac{3}{5}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThere are $90$ two-digit integers. For tens digit $t$ (from $1$ to $9$), the units digit can be any of $0, 1, \\ldots, t-1$: exactly $t$ options. The favorable count is $1 + 2 + \\cdots + 9 = 45$, so the probability is $\\tfrac{45}{90} = \\tfrac{1}{2}$.\n\n**Trigger cue**\n\nDigit-comparison probability: fix one digit, count the other digit's options, and sum the series.\n\n**Takeaway**\n\nSum per-digit counts; the units digit $0$ breaks naive symmetry.",
    fastest_path_md:
      "For tens digit $t$ there are $t$ smaller units digits, so $1 + 2 + \\cdots + 9 = 45$ of the $90$ numbers qualify: $\\tfrac{1}{2}$.",
    trap_map: {
      "0": "Counts the $9$ numbers with equal digits instead of tens greater than units.",
      "1": "Counts the $36$ numbers whose tens digit is less than the units digit.",
      "2": "Divides the $45$ favorable numbers by $100$ instead of the $90$ two-digit integers.",
      "4": "Includes the $9$ equal-digit numbers with the $45$ favorable ones: $54/90$.",
    },
    numeric_check: "45/90",
    check() {
      let hit = 0;
      let total = 0;
      for (let n = 10; n <= 99; n++) {
        total++;
        const tens = Math.floor(n / 10);
        const units = n % 10;
        if (tens > units) hit++;
      }
      return { kind: "value", value: hit / total };
    },
  },

  // 5 — D5 PS real: adjacency at a circular table
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "Six panelists, including Ito and Weber, are randomly assigned to six chairs spaced evenly around a circular table, one panelist per chair. What is the probability that Ito and Weber occupy adjacent chairs?",
    choices: [
      "$\\dfrac{1}{6}$",
      "$\\dfrac{1}{5}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{2}{5}$",
      "$\\dfrac{1}{2}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nSeat Ito first; by symmetry his chair does not matter. Weber is then equally likely to occupy any of the remaining $5$ chairs, and exactly $2$ of those are adjacent to Ito. The probability is $\\tfrac{2}{5}$.\n\n**Trigger cue**\n\nAdjacency in a random circular seating: fix one person and count the neighboring seats among what remains.\n\n**Takeaway**\n\nFix one seat; circular adjacency becomes $2$ out of $n-1$.",
    fastest_path_md:
      "Place Ito anywhere. Of the $5$ chairs left for Weber, $2$ neighbor Ito: $\\tfrac{2}{5}$.",
    trap_map: {
      "0": "Blocks the pair without its two internal orders and uses a straight-line count: $5!/6!$.",
      "1": "Counts the pair as one circular unit but forgets its two internal orders: $4!/5!$.",
      "2": "Treats the chairs as a straight row of six: $2 \\cdot 5!/6!$.",
      "4": "Assumes adjacent and non-adjacent seatings are equally likely.",
    },
    numeric_check: "48/120",
    check() {
      // brute force: all 6! assignments of people 0..5 to labeled chairs 0..5
      const perms = [];
      const permute = (a, k = 0) => {
        if (k === a.length) {
          perms.push([...a]);
          return;
        }
        for (let i = k; i < a.length; i++) {
          [a[k], a[i]] = [a[i], a[k]];
          permute(a, k + 1);
          [a[k], a[i]] = [a[i], a[k]];
        }
      };
      permute([0, 1, 2, 3, 4, 5]);
      let hit = 0;
      for (const p of perms) {
        const chairA = p.indexOf(0); // Ito
        const chairB = p.indexOf(1); // Weber
        const d = Math.abs(chairA - chairB);
        if (d === 1 || d === 5) hit++; // adjacent around the circle of 6
      }
      return { kind: "value", value: hit / perms.length };
    },
  },

  // 6 — D5 PS real: first defective found on the third test, without replacement
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "counting_sets_series_prob_stats",
    subtopic: "probability",
    difficulty: 5,
    stem_md:
      "A pack of $12$ batteries contains exactly $3$ dead batteries. A technician tests the batteries one at a time, in random order and without replacement. What is the probability that the first dead battery the technician finds is the third battery tested?",
    choices: [
      "$\\dfrac{9}{64}$",
      "$\\dfrac{9}{55}$",
      "$\\dfrac{1}{4}$",
      "$\\dfrac{21}{55}$",
      "$\\dfrac{34}{55}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe first dead battery appears third exactly when the tests run good, good, dead in that order: $\\tfrac{9}{12} \\cdot \\tfrac{8}{11} \\cdot \\tfrac{3}{10} = \\tfrac{216}{1320} = \\tfrac{9}{55}$.\n\n**Trigger cue**\n\n\"First [type] on trial $k$\" without replacement: chain the one exact ordered sequence with shrinking counts.\n\n**Takeaway**\n\nMultiply the ordered draws with shrinking denominators.",
    fastest_path_md:
      "Good, good, dead in order: $\\tfrac{9}{12} \\cdot \\tfrac{8}{11} \\cdot \\tfrac{3}{10} = \\tfrac{9}{55}$.",
    trap_map: {
      "0": "Treats the tests as with-replacement: $\\left(\\tfrac{3}{4}\\right)^2 \\cdot \\tfrac{1}{4}$.",
      "2": "Uses the overall dead rate $3/12$, ignoring that the first two tests must be good.",
      "3": "Computes the probability that the first three batteries tested are all good.",
      "4": "Computes the probability of at least one dead battery among the first three tests.",
    },
    numeric_check: "(9/12)*(8/11)*(3/10)",
    check() {
      // brute force: all C(12,3) equally likely position sets for the dead batteries;
      // the first dead battery is third iff the earliest dead position is 3.
      let hit = 0;
      let total = 0;
      for (let a = 1; a <= 12; a++) {
        for (let b = a + 1; b <= 12; b++) {
          for (let c = b + 1; c <= 12; c++) {
            total++;
            if (a === 3) hit++;
          }
        }
      }
      return { kind: "value", value: hit / total };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
