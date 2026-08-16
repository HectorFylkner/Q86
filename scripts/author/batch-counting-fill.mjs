/**
 * Batch: 28 items across the five counting_sets_series_prob_stats
 * subtopics that could not fill their chapter-test blend twice over.
 *   combinatorics             D2 ×4, D3 ×2
 *   probability               D2 ×4, D3 ×2
 *   overlapping_sets          D3 ×4
 *   series_patterns           D2 ×2, D3 ×4
 *   statistics_mean_median_sd D2 ×2, D3 ×4
 * Trap language tracks each chapter's own gallery.
 * Run: node scripts/author/batch-counting-fill.mjs   (APPEND=1 to write)
 */
import { verifyAndAppend } from "./harness.mjs";

const C = {
  format: "problem_solving",
  content_domain: "arithmetic",
  fundamental_skill: "counting_sets_series_prob_stats",
};

const items = [
  // ===================== combinatorics =====================
  {
    ...C,
    subtopic: "combinatorics",
    context: "real",
    difficulty: 2,
    stem_md:
      "A committee of $3$ people is to be chosen from a group of $7$ people. How many different committees are possible?",
    choices: ["$21$", "$35$", "$105$", "$210$", "$343$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nA committee is unordered — swapping two members gives the same committee — so this is $\\binom{7}{3} = \\frac{7 \\cdot 6 \\cdot 5}{3 \\cdot 2 \\cdot 1} = 35$.\n\n**Trigger cue**\n\n\"Committee\", \"team\", \"group\" with no roles: run the swap test, and if swapping changes nothing, use $\\binom{n}{k}$.\n\n**Takeaway**\n\nNo roles means unordered — divide by $k!$.",
    fastest_path_md: "$\\frac{7 \\cdot 6 \\cdot 5}{6} = 35$.",
    trap_map: {
      "0": "Uses $\\binom{7}{2}$, choosing one member too few.",
      "2": "Divides by $2$ rather than by $3!$.",
      "3": "Uses the ordered count $P(7,3) = 210$, inflating by $3!$.",
      "4": "Computes $7^{3}$, allowing repeats and order.",
    },
    numeric_check: "35",
    check() {
      const people = [0, 1, 2, 3, 4, 5, 6];
      const seen = new Set();
      for (const a of people)
        for (const b of people)
          for (const c of people) {
            if (a === b || b === c || a === c) continue;
            seen.add([a, b, c].sort((x, y) => x - y).join(","));
          }
      return { kind: "value", value: seen.size };
    },
  },
  {
    ...C,
    subtopic: "combinatorics",
    context: "real",
    difficulty: 2,
    stem_md:
      "A restaurant offers $4$ appetizers, $6$ main courses, and $3$ desserts. How many different three-course meals consisting of one of each can be ordered?",
    choices: ["$13$", "$18$", "$24$", "$72$", "$144$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nIndependent choices multiply: $4 \\times 6 \\times 3 = 72$.\n\n**Trigger cue**\n\n\"One of each\" across independent categories: multiply the category sizes — no combinations needed.\n\n**Takeaway**\n\nIndependent slots multiply; they never add.",
    fastest_path_md: "$4 \\cdot 6 \\cdot 3 = 72$.",
    trap_map: {
      "0": "Adds the three category sizes.",
      "1": "Multiplies only two of the three categories, $6 \\times 3$.",
      "2": "Multiplies only $4 \\times 6$.",
      "4": "Doubles the product, as if the courses could also be reordered.",
    },
    numeric_check: "4*6*3",
    check() {
      let count = 0;
      for (let a = 0; a < 4; a++)
        for (let m = 0; m < 6; m++) for (let d = 0; d < 3; d++) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...C,
    subtopic: "combinatorics",
    context: "pure",
    difficulty: 2,
    stem_md:
      "In how many distinct orders can the letters of the word LEVEL be arranged?",
    choices: ["$20$", "$30$", "$60$", "$120$", "$720$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nLEVEL has $5$ letters with L repeated twice and E repeated twice. The count is $\\frac{5!}{2!\\,2!} = \\frac{120}{4} = 30$.\n\n**Trigger cue**\n\nRepeated identical items in an arrangement: divide $n!$ by the factorial of each repeat count.\n\n**Takeaway**\n\nIdentical items divide out; only distinct orders count.",
    fastest_path_md: "$\\frac{120}{2! \\cdot 2!} = 30$.",
    trap_map: {
      "0": "Divides by $3!$, treating the three consonants as interchangeable.",
      "2": "Divides by only one of the two repeated pairs.",
      "3": "Treats all five letters as distinct, $5!$.",
      "4": "Computes $6!$, counting one letter too many.",
    },
    numeric_check: "120/4",
    check() {
      const letters = ["L", "E", "V", "E", "L"];
      const seen = new Set();
      const permute = (arr, prefix) => {
        if (arr.length === 0) {
          seen.add(prefix);
          return;
        }
        for (let i = 0; i < arr.length; i++) {
          permute([...arr.slice(0, i), ...arr.slice(i + 1)], prefix + arr[i]);
        }
      };
      permute(letters, "");
      return { kind: "value", value: seen.size };
    },
  },
  {
    ...C,
    subtopic: "combinatorics",
    context: "real",
    difficulty: 2,
    stem_md:
      "Five runners finish a race with no ties. In how many different orders can they finish?",
    choices: ["$25$", "$60$", "$120$", "$125$", "$720$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFinishing order is a full arrangement of $5$ distinct runners: $5! = 120$.\n\n**Trigger cue**\n\n\"In how many orders\" with every item used exactly once: it is $n!$.\n\n**Takeaway**\n\nA full ordering of $n$ distinct items is $n!$.",
    fastest_path_md: "$5! = 120$.",
    trap_map: {
      "0": "Computes $5^{2}$, pairing runners rather than ordering them.",
      "1": "Computes $P(5,3)$, ordering only the podium.",
      "3": "Computes $5^{3}$.",
      "4": "Computes $6!$, adding a sixth runner.",
    },
    numeric_check: "120",
    check() {
      const seen = new Set();
      const permute = (arr, prefix) => {
        if (arr.length === 0) return void seen.add(prefix.join("-"));
        for (let i = 0; i < arr.length; i++)
          permute([...arr.slice(0, i), ...arr.slice(i + 1)], [...prefix, arr[i]]);
      };
      permute([1, 2, 3, 4, 5], []);
      return { kind: "value", value: seen.size };
    },
  },
  {
    ...C,
    subtopic: "combinatorics",
    context: "real",
    difficulty: 3,
    stem_md:
      "A team of $4$ is to be chosen from $5$ engineers and $4$ analysts. How many teams contain at least one analyst?",
    choices: ["$60$", "$76$", "$120$", "$121$", "$126$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nUse the complement. All teams: $\\binom{9}{4} = 126$. Teams with no analyst: $\\binom{5}{4} = 5$. So teams with at least one analyst number $126 - 5 = 121$.\n\n**Trigger cue**\n\n\"At least one\": count everything and subtract the none case — forcing one in double-counts teams with two or more.\n\n**Takeaway**\n\n\"At least one\" is total minus none.",
    fastest_path_md: "$\\binom{9}{4} - \\binom{5}{4} = 126 - 5 = 121$.",
    trap_map: {
      "0": "Forces one analyst in and chooses $3$ from the remaining $8$, $4 \\cdot \\binom{8}{3}$ divided down — double counting the multi-analyst teams.",
      "1": "Counts only teams with exactly one analyst, $\\binom{4}{1}\\binom{5}{3}$ adjusted.",
      "2": "Subtracts $\\binom{5}{4}$ from $\\binom{9}{4}$ but then also removes the all-analyst team.",
      "4": "Reports the total number of teams, forgetting to remove the analyst-free ones.",
    },
    numeric_check: "126 - 5",
    check() {
      // Members 0-4 are engineers, 5-8 are analysts.
      let count = 0;
      for (let a = 0; a < 9; a++)
        for (let b = a + 1; b < 9; b++)
          for (let c = b + 1; c < 9; c++)
            for (let d = c + 1; d < 9; d++) {
              if ([a, b, c, d].some((m) => m >= 5)) count++;
            }
      return { kind: "value", value: count };
    },
  },
  {
    ...C,
    subtopic: "combinatorics",
    context: "real",
    difficulty: 3,
    stem_md:
      "Six people, including Ana and Ben, are to be seated in a row of $6$ chairs. In how many arrangements do Ana and Ben sit next to each other?",
    choices: ["$120$", "$240$", "$360$", "$480$", "$720$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nGlue Ana and Ben into one block: five objects arrange in $5! = 120$ ways, and the pair can sit in either internal order, $\\times\\, 2! = 240$.\n\n**Trigger cue**\n\n\"Next to each other\": glue the pair into one object, then multiply by $2!$ because either order is allowed.\n\n**Takeaway**\n\nGlue the pair, arrange, then double for their order.",
    fastest_path_md: "$5! \\times 2 = 240$.",
    trap_map: {
      "0": "Glues the pair but forgets the internal $2!$.",
      "2": "Uses half of the total arrangements as a symmetry shortcut.",
      "3": "Multiplies the glued count by $4$ instead of $2$.",
      "4": "Reports the unrestricted total, $6!$.",
    },
    numeric_check: "120*2",
    check() {
      let count = 0;
      const people = [0, 1, 2, 3, 4, 5]; // 0 = Ana, 1 = Ben
      const permute = (arr, prefix) => {
        if (arr.length === 0) {
          const i = prefix.indexOf(0);
          const j = prefix.indexOf(1);
          if (Math.abs(i - j) === 1) count++;
          return;
        }
        for (let i = 0; i < arr.length; i++)
          permute([...arr.slice(0, i), ...arr.slice(i + 1)], [...prefix, arr[i]]);
      };
      permute(people, []);
      return { kind: "value", value: count };
    },
  },

  // ===================== probability =====================
  {
    ...C,
    subtopic: "probability",
    context: "real",
    difficulty: 2,
    stem_md:
      "A bag contains $5$ red marbles and $7$ blue marbles. If one marble is drawn at random, what is the probability that it is red?",
    choices: [
      "$\\dfrac{5}{12}$",
      "$\\dfrac{5}{7}$",
      "$\\dfrac{1}{2}$",
      "$\\dfrac{7}{12}$",
      "$\\dfrac{12}{5}$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nFavorable over total: there are $5$ red marbles out of $5 + 7 = 12$, so the probability is $\\frac{5}{12}$.\n\n**Trigger cue**\n\nA single draw from a known pool: the denominator is the whole pool, not the other category.\n\n**Takeaway**\n\nDenominator is everything you could have drawn.",
    fastest_path_md: "$\\frac{5}{12}$.",
    trap_map: {
      "1": "Uses the count of blue marbles as the denominator instead of the total.",
      "2": "Assumes two colors means an even split.",
      "3": "Reports the probability of drawing blue.",
      "4": "Inverts the fraction.",
    },
    numeric_check: "5/12",
    check() {
      const marbles = [];
      for (let i = 0; i < 5; i++) marbles.push("R");
      for (let i = 0; i < 7; i++) marbles.push("B");
      const red = marbles.filter((m) => m === "R").length;
      return { kind: "value", value: red / marbles.length };
    },
  },
  {
    ...C,
    subtopic: "probability",
    context: "pure",
    difficulty: 2,
    stem_md:
      "A fair six-sided die, with faces numbered $1$ through $6$, is rolled once. What is the probability that the result is a prime number?",
    choices: [
      "$\\dfrac{1}{6}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{1}{2}$",
      "$\\dfrac{2}{3}$",
      "$\\dfrac{5}{6}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe primes among $1$ through $6$ are $2$, $3$, and $5$ — three outcomes. Note that $1$ is not prime. So the probability is $\\frac{3}{6} = \\frac{1}{2}$.\n\n**Trigger cue**\n\n\"Prime\" over a small range: list them explicitly and remember that $1$ is not prime.\n\n**Takeaway**\n\nOne is not prime; list rather than assume.",
    fastest_path_md: "$\\{2,3,5\\}$ out of six faces: $\\frac{1}{2}$.",
    trap_map: {
      "0": "Counts only one prime face.",
      "1": "Counts only $2$ and $3$ as prime.",
      "3": "Counts $1$ as prime alongside $2, 3, 5$.",
      "4": "Counts every face except $1$ as prime.",
    },
    numeric_check: "3/6",
    check() {
      const isPrime = (n) => {
        if (n < 2) return false;
        for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
        return true;
      };
      let hits = 0;
      for (let face = 1; face <= 6; face++) if (isPrime(face)) hits++;
      return { kind: "value", value: hits / 6 };
    },
  },
  {
    ...C,
    subtopic: "probability",
    context: "pure",
    difficulty: 2,
    stem_md:
      "Two fair coins are flipped. What is the probability that both land heads?",
    choices: [
      "$\\dfrac{1}{4}$",
      "$\\dfrac{1}{3}$",
      "$\\dfrac{1}{2}$",
      "$\\dfrac{3}{4}$",
      "$1$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\n\"Both\" means multiply: $\\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4}$. Enumerating confirms it — HH, HT, TH, TT, and only one is favorable.\n\n**Trigger cue**\n\n\"Both events happen\": multiply the probabilities; addition is only for disjoint alternatives.\n\n**Takeaway**\n\n\"Both\" multiplies; \"either\" adds.",
    fastest_path_md: "$\\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$.",
    trap_map: {
      "1": "Counts only three outcomes, merging HT and TH into one.",
      "2": "Adds the two probabilities and halves, or assumes symmetry.",
      "3": "Reports the probability of at least one head.",
      "4": "Adds the two probabilities, $\\frac{1}{2} + \\frac{1}{2}$.",
    },
    numeric_check: "1/4",
    check() {
      let favorable = 0;
      let total = 0;
      for (const a of ["H", "T"])
        for (const b of ["H", "T"]) {
          total++;
          if (a === "H" && b === "H") favorable++;
        }
      return { kind: "value", value: favorable / total };
    },
  },
  {
    ...C,
    subtopic: "probability",
    context: "real",
    difficulty: 2,
    stem_md:
      "A box contains $4$ defective and $16$ non-defective bulbs. If one bulb is selected at random, what is the probability that it is *not* defective?",
    choices: [
      "$\\dfrac{1}{5}$",
      "$\\dfrac{1}{4}$",
      "$\\dfrac{4}{5}$",
      "$\\dfrac{16}{4}$",
      "$\\dfrac{20}{16}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe pool is $4 + 16 = 20$ bulbs, of which $16$ are good: $\\frac{16}{20} = \\frac{4}{5}$. Equivalently, $1 - \\frac{4}{20} = \\frac{4}{5}$.\n\n**Trigger cue**\n\n\"Not\" a category: either count the complement directly or subtract its probability from $1$.\n\n**Takeaway**\n\nThe complement subtracts from one, not from the count.",
    fastest_path_md: "$1 - \\frac{4}{20} = \\frac{4}{5}$.",
    trap_map: {
      "0": "Reports the probability that the bulb *is* defective.",
      "1": "Uses $\\frac{4}{16}$, comparing the two categories instead of using the total.",
      "3": "Divides the good count by the defective count.",
      "4": "Divides the total by the good count.",
    },
    numeric_check: "16/20",
    check() {
      const bulbs = [];
      for (let i = 0; i < 4; i++) bulbs.push(false);
      for (let i = 0; i < 16; i++) bulbs.push(true);
      const good = bulbs.filter(Boolean).length;
      return { kind: "value", value: good / bulbs.length };
    },
  },
  {
    ...C,
    subtopic: "probability",
    context: "real",
    difficulty: 3,
    stem_md:
      "A jar contains $4$ green and $6$ yellow candies. Two candies are drawn at random without replacement. What is the probability that both are green?",
    choices: [
      "$\\dfrac{2}{15}$",
      "$\\dfrac{4}{25}$",
      "$\\dfrac{1}{5}$",
      "$\\dfrac{2}{5}$",
      "$\\dfrac{8}{15}$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nWithout replacement the second draw sees a smaller jar: $\\frac{4}{10} \\times \\frac{3}{9} = \\frac{12}{90} = \\frac{2}{15}$.\n\n**Trigger cue**\n\n\"Without replacement\": shrink both the numerator and the denominator on every subsequent draw.\n\n**Takeaway**\n\nNo replacement means the denominator shrinks too.",
    fastest_path_md: "$\\frac{4}{10}\\cdot\\frac{3}{9} = \\frac{2}{15}$.",
    trap_map: {
      "1": "Freezes the denominator, computing $\\left(\\frac{4}{10}\\right)^{2}$.",
      "2": "Shrinks the numerator but not the denominator, $\\frac{4}{10}\\cdot\\frac{3}{... }$ rounded to a fifth.",
      "3": "Reports the probability that the first candy alone is green.",
      "4": "Adds the two draw probabilities instead of multiplying.",
    },
    numeric_check: "(4/10)*(3/9)",
    check() {
      // Enumerate ordered pairs of distinct candies; 0-3 green, 4-9 yellow.
      let favorable = 0;
      let total = 0;
      for (let a = 0; a < 10; a++)
        for (let b = 0; b < 10; b++) {
          if (a === b) continue;
          total++;
          if (a < 4 && b < 4) favorable++;
        }
      return { kind: "value", value: favorable / total };
    },
  },
  {
    ...C,
    subtopic: "probability",
    context: "pure",
    difficulty: 3,
    stem_md:
      "Two fair six-sided dice are rolled. What is the probability that the sum of the two numbers is at least $10$?",
    choices: [
      "$\\dfrac{1}{12}$",
      "$\\dfrac{1}{9}$",
      "$\\dfrac{1}{6}$",
      "$\\dfrac{5}{18}$",
      "$\\dfrac{1}{3}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nOut of $36$ ordered outcomes, the sums of at least $10$ are: $10$ in three ways, $11$ in two, $12$ in one — six outcomes. So the probability is $\\frac{6}{36} = \\frac{1}{6}$.\n\n**Trigger cue**\n\n\"At least\" a dice sum: count outcomes at each qualifying sum over the full $36$, treating the dice as ordered.\n\n**Takeaway**\n\nCount ordered pairs; \"at least\" includes every sum above the bar.",
    fastest_path_md: "$3 + 2 + 1 = 6$ of $36$, so $\\frac{1}{6}$.",
    trap_map: {
      "0": "Counts only sums of $11$ and $12$, reading \"at least $10$\" as \"more than $10$\".",
      "1": "Treats the dice as unordered, dividing by $21$ instead of $36$.",
      "3": "Includes sums of $9$ as well.",
      "4": "Counts every sum above the average of $7$.",
    },
    numeric_check: "6/36",
    check() {
      let favorable = 0;
      let total = 0;
      for (let a = 1; a <= 6; a++)
        for (let b = 1; b <= 6; b++) {
          total++;
          if (a + b >= 10) favorable++;
        }
      return { kind: "value", value: favorable / total };
    },
  },

  // ===================== overlapping_sets =====================
  {
    ...C,
    subtopic: "overlapping_sets",
    context: "real",
    difficulty: 3,
    stem_md:
      "Of the $80$ employees at a firm, $52$ speak Spanish, $34$ speak French, and $9$ speak neither language. How many employees speak both languages?",
    choices: ["$7$", "$15$", "$18$", "$25$", "$27$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nStrip the neither group first: $80 - 9 = 71$ employees speak at least one language. Then $|S| + |F| - \\text{both} = 71$, so $52 + 34 - \\text{both} = 71$ and both $= 86 - 71 = 15$.\n\n**Trigger cue**\n\nA two-set total with a \"neither\" count: subtract neither from the total *before* applying inclusion–exclusion.\n\n**Takeaway**\n\nRemove the neither group before you count overlaps.",
    fastest_path_md: "$52 + 34 - (80 - 9) = 86 - 71 = 15$.",
    trap_map: {
      "0": "Forgets the neither group, computing $86 - 80$.",
      "2": "Subtracts the neither count from the overlap as well.",
      "3": "Reports the number who speak only French.",
      "4": "Reports how many speak French but not Spanish, plus the neither group.",
    },
    numeric_check: "52 + 34 - (80 - 9)",
    check() {
      const hits = [];
      for (let both = 0; both <= 80; both++) {
        const onlyS = 52 - both;
        const onlyF = 34 - both;
        if (onlyS < 0 || onlyF < 0) continue;
        if (onlyS + onlyF + both + 9 === 80) hits.push(both);
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },
  {
    ...C,
    subtopic: "overlapping_sets",
    context: "real",
    difficulty: 3,
    stem_md:
      "In a survey of $120$ households, $70$ own a car and $45$ own a bicycle. If $22$ households own both, how many own exactly one of the two?",
    choices: ["$71$", "$93$", "$115$", "$27$", "$48$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nExactly one means subtracting the overlap *twice*: $70 + 45 - 2(22) = 115 - 44 = 71$.\n\n**Trigger cue**\n\n\"Exactly one of the two\": $|A| + |B| - 2 \\cdot \\text{both}$ — the overlap leaves both counts.\n\n**Takeaway**\n\n\"Exactly one\" subtracts the overlap twice.",
    fastest_path_md: "$(70-22) + (45-22) = 48 + 23 = 71$.",
    trap_map: {
      "1": "Subtracts the overlap once, giving \"at least one\" rather than \"exactly one\".",
      "2": "Adds the two ownership counts without removing the overlap at all.",
      "3": "Reports the households owning neither.",
      "4": "Reports only the car-but-not-bicycle group.",
    },
    numeric_check: "70 + 45 - 2*22",
    check() {
      const onlyCar = 70 - 22;
      const onlyBike = 45 - 22;
      let count = 0;
      for (let i = 0; i < onlyCar; i++) count++;
      for (let i = 0; i < onlyBike; i++) count++;
      return { kind: "value", value: count };
    },
  },
  {
    ...C,
    subtopic: "overlapping_sets",
    context: "real",
    difficulty: 3,
    stem_md:
      "At a conference, every attendee is either remote or onsite, and every attendee is either a speaker or a guest. There are $150$ attendees, of whom $90$ are onsite and $40$ are speakers. If $25$ of the speakers are onsite, how many remote attendees are guests?",
    choices: ["$15$", "$45$", "$50$", "$60$", "$75$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThese are mutually exclusive attributes, so use a $2 \\times 2$ grid rather than a Venn diagram. Remote attendees: $150 - 90 = 60$. Remote speakers: $40 - 25 = 15$. So remote guests are $60 - 15 = 45$.\n\n**Trigger cue**\n\nTwo either/or attributes crossed: build a $2 \\times 2$ grid with row and column totals — overlap logic does not apply.\n\n**Takeaway**\n\nMutually exclusive attributes call for a grid, not a Venn.",
    fastest_path_md: "Remote $60$, remote speakers $15$, so remote guests $45$.",
    trap_map: {
      "0": "Reports the number of remote speakers.",
      "2": "Subtracts the speakers from the remote count without splitting them by location.",
      "3": "Reports the total number of remote attendees.",
      "4": "Reports the number of onsite guests.",
    },
    numeric_check: "150 - 90 - (40 - 25)",
    check() {
      const total = 150;
      const onsite = 90;
      const speakers = 40;
      const onsiteSpeakers = 25;
      const remote = total - onsite;
      const remoteSpeakers = speakers - onsiteSpeakers;
      const onsiteGuests = onsite - onsiteSpeakers;
      const remoteGuests = remote - remoteSpeakers;
      if (onsiteSpeakers + onsiteGuests + remoteSpeakers + remoteGuests !== total)
        throw new Error("grid does not close");
      return { kind: "value", value: remoteGuests };
    },
  },
  {
    ...C,
    subtopic: "overlapping_sets",
    context: "real",
    difficulty: 3,
    stem_md:
      "In a class of $60$ students, $24$ study physics, $26$ study chemistry, and $20$ study biology. Exactly $10$ students study exactly two of the three subjects, and exactly $4$ study all three. How many students study none of the three subjects?",
    choices: ["$0$", "$2$", "$4$", "$8$", "$22$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nThe three subject counts sum to $24 + 26 + 20 = 70$. That sum counts a single-subject student once, an exactly-two student twice, and an all-three student three times. So the union is $70 - e_2 - 2e_3 = 70 - 10 - 8 = 52$, and the students studying none number $60 - 52 = 8$.\n\n**Trigger cue**\n\nThree sets given as \"exactly two\" and \"all three\": the raw sum over-counts the exactly-two region once and the triple region twice — subtract exactly that much.\n\n**Takeaway**\n\nSubtract the double region once and the triple region twice.",
    fastest_path_md:
      "Union $= 70 - 10 - 2(4) = 52$; none $= 60 - 52 = 8$.",
    trap_map: {
      "0": "Subtracts only the exactly-two group, ignoring the triple overlap entirely.",
      "1": "Subtracts three times the triple group and forgets the exactly-two group.",
      "2": "Subtracts each overlap group once, as if the triple region were counted only twice.",
      "4": "Subtracts the exactly-two group twice and the triple group three times, over-removing.",
    },
    numeric_check: "60 - (70 - 10 - 2*4)",
    check() {
      // Brute-force every legal Venn split; `none` must be the same for all.
      const answers = new Set();
      for (let pq = 0; pq <= 10; pq++)
        for (let pr = 0; pr <= 10 - pq; pr++) {
          const qr = 10 - pq - pr;
          const t = 4;
          const a = 24 - pq - pr - t;
          const b = 26 - pq - qr - t;
          const c = 20 - pr - qr - t;
          if (a < 0 || b < 0 || c < 0) continue;
          answers.add(60 - (a + b + c + pq + pr + qr + t));
        }
      if (answers.size !== 1) throw new Error(`none values: ${[...answers]}`);
      const only = [...answers][0];
      if (only < 0) throw new Error("infeasible");
      return { kind: "value", value: only };
    },
  },

  // ===================== series_patterns =====================
  {
    ...C,
    subtopic: "series_patterns",
    context: "pure",
    difficulty: 2,
    stem_md:
      "What is the sum of the integers from $1$ through $60$, inclusive?",
    choices: ["$1{,}770$", "$1{,}800$", "$1{,}830$", "$3{,}600$", "$3{,}660$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe sum of the first $n$ positive integers is $\\frac{n(n+1)}{2} = \\frac{60 \\cdot 61}{2} = 1{,}830$.\n\n**Trigger cue**\n\nA consecutive run: average the endpoints and multiply by the count, $\\frac{1+60}{2} \\times 60$.\n\n**Takeaway**\n\nSum equals the endpoint average times the count.",
    fastest_path_md: "$30 \\times 61 = 1{,}830$.",
    trap_map: {
      "0": "Uses $\\frac{59 \\cdot 60}{2}$, summing only through $59$.",
      "1": "Multiplies the count by the midpoint $30$ instead of by $30.5$.",
      "3": "Multiplies the count by itself.",
      "4": "Omits the division by $2$.",
    },
    numeric_check: "60*61/2",
    check() {
      let sum = 0;
      for (let n = 1; n <= 60; n++) sum += n;
      return { kind: "value", value: sum };
    },
  },
  {
    ...C,
    subtopic: "series_patterns",
    context: "real",
    difficulty: 2,
    stem_md:
      "A stack of logs has $22$ logs in the bottom row, and each row above has one fewer log than the row below it. If the top row has $8$ logs, how many rows are in the stack?",
    choices: ["$13$", "$14$", "$15$", "$22$", "$30$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe row counts run $8, 9, \\ldots, 22$, a consecutive block. The number of terms is $22 - 8 + 1 = 15$.\n\n**Trigger cue**\n\n\"How many rows/terms from $a$ to $b$\": count $b - a + 1$ — the $+1$ is the term you would otherwise drop.\n\n**Takeaway**\n\nCount terms inclusively: $b - a + 1$.",
    fastest_path_md: "$22 - 8 + 1 = 15$.",
    trap_map: {
      "0": "Counts $b - a$ and then subtracts one more.",
      "1": "Counts $b - a$ without adding one.",
      "3": "Reports the number of logs in the bottom row.",
      "4": "Reports the sum of the two endpoint rows.",
    },
    numeric_check: "22 - 8 + 1",
    check() {
      let rows = 0;
      for (let logs = 22; logs >= 8; logs--) rows++;
      return { kind: "value", value: rows };
    },
  },
  {
    ...C,
    subtopic: "series_patterns",
    context: "pure",
    difficulty: 3,
    stem_md:
      "What is the sum of the even integers from $20$ through $100$, inclusive?",
    choices: ["$1{,}230$", "$2{,}400$", "$2{,}460$", "$2{,}520$", "$4{,}860$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe terms are evenly spaced with common difference $2$, so count them as $\\frac{100-20}{2} + 1 = 41$ and average them as the endpoint average, $\\frac{20+100}{2} = 60$. The sum is $41 \\times 60 = 2{,}460$.\n\n**Trigger cue**\n\nAn evenly spaced sum: count $= \\frac{\\text{last} - \\text{first}}{d} + 1$, average $=$ endpoint average, sum $=$ their product.\n\n**Takeaway**\n\nCount the gaps, add one, multiply by the endpoint average.",
    fastest_path_md: "$41$ terms averaging $60$: $2{,}460$.",
    trap_map: {
      "0": "Halves the correct sum, as if only every other even number counted.",
      "1": "Uses $40$ terms, counting gaps instead of terms.",
      "3": "Uses $42$ terms.",
      "4": "Sums every integer from $20$ to $100$, not just the even ones.",
    },
    numeric_check: "41*60",
    check() {
      let sum = 0;
      for (let n = 20; n <= 100; n++) if (n % 2 === 0) sum += n;
      return { kind: "value", value: sum };
    },
  },

  {
    ...C,
    subtopic: "series_patterns",
    context: "real",
    difficulty: 3,
    stem_md:
      "Beads are strung in the repeating color pattern red, blue, blue, green, yellow, with the pattern starting again after every group of five beads. Among the first $103$ beads, how many are blue?",
    choices: ["$20$", "$21$", "$40$", "$41$", "$42$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nThe cycle has length $5$ and contains $2$ blue beads. $103 = 5(20) + 3$, so there are $20$ full cycles contributing $40$ blue beads. The $3$ leftover beads start at the *beginning* of the pattern — red, blue, blue — contributing $2$ more. The total is $42$.\n\n**Trigger cue**\n\nA repeating pattern with a leftover: divide out the full cycles, then map each leftover position from the start of the pattern explicitly.\n\n**Takeaway**\n\nLeftovers restart the pattern from its first position.",
    fastest_path_md: "$20$ cycles $\\times\\, 2 = 40$, plus $2$ in the leftover $R, B, B$: $42$.",
    trap_map: {
      "0": "Counts one blue per cycle and drops the leftover.",
      "1": "Counts one blue per cycle plus one leftover.",
      "2": "Counts the full cycles only, dropping the leftover beads.",
      "3": "Counts only one of the two leftover blue beads.",
    },
    numeric_check: "20*2 + 2",
    check() {
      const cycle = ["red", "blue", "blue", "green", "yellow"];
      let blue = 0;
      for (let n = 1; n <= 103; n++) {
        if (cycle[(n - 1) % cycle.length] === "blue") blue++;
      }
      return { kind: "value", value: blue };
    },
  },

  {
    ...C,
    subtopic: "series_patterns",
    context: "pure",
    difficulty: 3,
    stem_md:
      "A sequence is defined by $a_1 = 5$, $a_2 = 8$, and $a_n = a_{n-1} - a_{n-2}$ for $n \\ge 3$. What is $a_{50}$?",
    choices: ["$-8$", "$-5$", "$-3$", "$3$", "$8$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nA subtraction recursion looks Fibonacci-like but cycles. List terms: $5, 8, 3, -5, -8, -3$, and then $5, 8, \\ldots$ again — period $6$. Since $50 = 6(8) + 2$, $a_{50}$ sits at position $2$ of the cycle, which is $8$.\n\n**Trigger cue**\n\n$a_n = a_{n-1} - a_{n-2}$: test a few terms before extrapolating — it has period $6$, it does not grow.\n\n**Takeaway**\n\nSubtraction recursions cycle; find the period first.",
    fastest_path_md:
      "Cycle $5, 8, 3, -5, -8, -3$; $50 \\equiv 2 \\pmod 6$, so $a_{50} = 8$.",
    trap_map: {
      "0": "Lands on position $5$ of the cycle.",
      "1": "Lands on position $4$, reducing $50$ by the wrong multiple of $6$.",
      "2": "Lands on position $6$, treating a remainder of $2$ as counting backwards.",
      "3": "Lands on position $3$, off by one in the cycle.",
    },
    numeric_check: "8",
    check() {
      const terms = [5, 8];
      for (let n = 3; n <= 50; n++) terms.push(terms[n - 2] - terms[n - 3]);
      return { kind: "value", value: terms[49] };
    },
  },
  {
    ...C,
    subtopic: "series_patterns",
    context: "pure",
    difficulty: 3,
    stem_md:
      "What is the value of $1 - 2 + 3 - 4 + 5 - \\cdots + 99$, where the signs alternate and the last term is $+99$?",
    choices: ["$-50$", "$-49$", "$49$", "$50$", "$99$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nPair the terms from the left: $(1-2) + (3-4) + \\cdots + (97-98)$ gives $49$ pairs each equal to $-1$, for $-49$, and the odd term $99$ stands alone. The total is $-49 + 99 = 50$.\n\n**Trigger cue**\n\nAn alternating sum with an odd number of terms: pair them off, then handle the single leftover term separately.\n\n**Takeaway**\n\nWith an odd count, one term is left unpaired.",
    fastest_path_md: "$49$ pairs of $-1$, plus $99$: $50$.",
    trap_map: {
      "0": "Pairs from the right and loses the sign on the leftover term.",
      "1": "Reports the pair total and forgets the unpaired $99$.",
      "2": "Counts $49$ pairs of $+1$.",
      "4": "Reports the final term alone, as if the pairs cancelled to zero.",
    },
    numeric_check: "50",
    check() {
      let sum = 0;
      for (let n = 1; n <= 99; n++) sum += n % 2 === 1 ? n : -n;
      return { kind: "value", value: sum };
    },
  },

  // ===================== statistics_mean_median_sd =====================
  {
    ...C,
    subtopic: "statistics_mean_median_sd",
    context: "pure",
    difficulty: 2,
    stem_md:
      "What is the median of the list $14$, $3$, $9$, $21$, $7$?",
    choices: ["$7$", "$9$", "$10.8$", "$14$", "$21$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nSort first: $3, 7, 9, 14, 21$. With five values the median is the third, which is $9$.\n\n**Trigger cue**\n\nAny median question: sort before you look at the middle — the middle of the list as written means nothing.\n\n**Takeaway**\n\nSort first; only then read the middle.",
    fastest_path_md: "Sorted: $3, 7, 9, 14, 21$; the middle is $9$.",
    trap_map: {
      "0": "Reads the middle of the list as written without sorting.",
      "2": "Reports the mean rather than the median.",
      "3": "Reports the first value in the list as written.",
      "4": "Reports the largest value.",
    },
    numeric_check: "9",
    check() {
      const list = [14, 3, 9, 21, 7].sort((a, b) => a - b);
      return { kind: "value", value: list[Math.floor(list.length / 2)] };
    },
  },
  {
    ...C,
    subtopic: "statistics_mean_median_sd",
    context: "real",
    difficulty: 2,
    stem_md:
      "The average (arithmetic mean) of five numbers is $18$. If four of the numbers are $12$, $15$, $21$, and $24$, what is the fifth number?",
    choices: ["$14.4$", "$18$", "$22.5$", "$72$", "$90$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nGo to totals immediately: the five numbers sum to $5 \\times 18 = 90$. The four given sum to $12 + 15 + 21 + 24 = 72$, so the fifth is $90 - 72 = 18$.\n\n**Trigger cue**\n\nAn average with one missing entry: multiply the average by the count to get the total, then subtract what you have.\n\n**Takeaway**\n\nThe instant you see a mean, multiply by $n$.",
    fastest_path_md: "$90 - 72 = 18$.",
    trap_map: {
      "0": "Divides the four-number total by five.",
      "2": "Divides the required five-number total by four.",
      "3": "Reports the sum of the four given numbers.",
      "4": "Reports the required total for all five numbers.",
    },
    numeric_check: "5*18 - (12+15+21+24)",
    check() {
      const known = [12, 15, 21, 24];
      let answer = null;
      for (let tenths = 0; tenths <= 2000; tenths++) {
        const x = tenths / 10;
        const all = [...known, x];
        if (Math.abs(all.reduce((a, b) => a + b, 0) / all.length - 18) < 1e-9) answer = x;
      }
      if (answer == null) throw new Error("no value");
      return { kind: "value", value: answer };
    },
  },
  {
    ...C,
    subtopic: "statistics_mean_median_sd",
    context: "real",
    difficulty: 3,
    stem_md:
      "The average weight of $8$ boxes is $14$ kilograms. When one more box is added, the average weight of the $9$ boxes becomes $15$ kilograms. What is the weight, in kilograms, of the added box?",
    choices: ["$15$", "$16$", "$21$", "$23$", "$24$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nTotals: $8 \\times 14 = 112$ and $9 \\times 15 = 135$. The added box weighs $135 - 112 = 23$ kilograms — it must carry both its own share and the extra kilogram for each of the other eight boxes.\n\n**Trigger cue**\n\nAn average that moves when one item joins: convert both averages to totals and subtract; the group size differs on each side.\n\n**Takeaway**\n\nUse the group size in force at each average.",
    fastest_path_md: "$135 - 112 = 23$ — the new average plus one kilo per old box.",
    trap_map: {
      "0": "Reports the new average as the box's weight.",
      "1": "Adds one kilogram to the new average, charging the lift only once.",
      "2": "Uses $8$ boxes on both sides, computing $8(15) - 112$ adjusted.",
      "4": "Charges an extra kilogram for the new box as well as the eight old ones.",
    },
    numeric_check: "9*15 - 8*14",
    check() {
      const oldTotal = 8 * 14;
      let answer = null;
      for (let w = 0; w <= 200; w++) {
        if (Math.abs((oldTotal + w) / 9 - 15) < 1e-9) answer = w;
      }
      if (answer == null) throw new Error("no weight");
      return { kind: "value", value: answer };
    },
  },
  {
    ...C,
    subtopic: "statistics_mean_median_sd",
    context: "pure",
    difficulty: 3,
    stem_md:
      "Each number in a certain list of $10$ numbers is increased by $6$. Which of the following is true of the new list compared with the original?",
    choices: [
      "The mean and the standard deviation both increase by $6$.",
      "The mean increases by $6$ and the standard deviation is unchanged.",
      "The mean is unchanged and the standard deviation increases by $6$.",
      "The mean increases by $6$ and the standard deviation increases by $60$.",
      "Neither the mean nor the standard deviation changes.",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nAdding a constant shifts every value equally, so the mean moves by that constant while every deviation from the mean is unchanged — standard deviation measures spread, and a shift does not change spread. Multiplying by $k$ is the operation that scales the deviation, by $|k|$.\n\n**Trigger cue**\n\n\"Each number is increased by $c$\": mean $+c$, spread untouched.\n\n**Takeaway**\n\nShifts move the center; only scaling changes the spread.",
    fastest_path_md:
      "Try $\\{1,2\\}$: mean $1.5 \\to 7.5$, gaps unchanged, so SD unchanged.",
    trap_map: {
      "0": "Treats standard deviation as moving with the values rather than measuring spread.",
      "2": "Reverses the roles, holding the mean fixed.",
      "3": "Scales the standard deviation by the list length.",
      "4": "Assumes a uniform shift changes nothing at all.",
    },
    numeric_check: null,
    check(q) {
      const list = [3, 7, 7, 10, 12, 15, 15, 18, 21, 22];
      const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
      const sd = (xs) => {
        const m = mean(xs);
        return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
      };
      const shifted = list.map((x) => x + 6);
      const meanDelta = mean(shifted) - mean(list);
      const sdDelta = sd(shifted) - sd(list);
      const claims = [
        Math.abs(meanDelta - 6) < 1e-9 && Math.abs(sdDelta - 6) < 1e-9,
        Math.abs(meanDelta - 6) < 1e-9 && Math.abs(sdDelta) < 1e-9,
        Math.abs(meanDelta) < 1e-9 && Math.abs(sdDelta - 6) < 1e-9,
        Math.abs(meanDelta - 6) < 1e-9 && Math.abs(sdDelta - 60) < 1e-9,
        Math.abs(meanDelta) < 1e-9 && Math.abs(sdDelta) < 1e-9,
      ];
      const survivors = claims.flatMap((ok, i) => (ok ? [i] : []));
      if (survivors.length !== 1) throw new Error(`survivors: ${survivors}`);
      if (q.choices.length !== 5) throw new Error("bad choices");
      return { kind: "index", index: survivors[0] };
    },
  },
  {
    ...C,
    subtopic: "statistics_mean_median_sd",
    context: "pure",
    difficulty: 3,
    stem_md:
      "The list $4$, $9$, $x$, $13$, $18$ has a median of $11$. What is the value of $x$?",
    choices: ["$9$", "$10$", "$11$", "$12$", "$13$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nFive values means the median is the third after sorting. The four known values are $4, 9, 13, 18$; for the sorted third value to be $11$, $x$ itself must be $11$, landing between $9$ and $13$. Any $x \\le 9$ would make the median $9$ or $13$-adjacent, and any $x \\ge 13$ would make it $13$.\n\n**Trigger cue**\n\nA median with one unknown entry: sort what you know, then ask where the unknown must land for the middle position to hold.\n\n**Takeaway**\n\nPlace the unknown by the position the median must occupy.",
    fastest_path_md:
      "Known values sort to $4, 9, 13, 18$; only $x = 11$ puts $11$ third.",
    trap_map: {
      "0": "Picks the value that is already third in the unsorted list.",
      "1": "Averages $9$ and $11$.",
      "3": "Averages $11$ and $13$.",
      "4": "Picks the fourth known value, assuming the median comes from the given list.",
    },
    numeric_check: "11",
    check() {
      const hits = [];
      for (let x = -100; x <= 100; x++) {
        const sorted = [4, 9, x, 13, 18].sort((a, b) => a - b);
        if (sorted[2] === 11) hits.push(x);
      }
      if (hits.length !== 1) throw new Error(`solutions: ${hits}`);
      return { kind: "value", value: hits[0] };
    },
  },
  {
    ...C,
    subtopic: "statistics_mean_median_sd",
    context: "pure",
    difficulty: 3,
    stem_md:
      "Which of the following lists has the greatest standard deviation?",
    choices: [
      "$\\{10, 10, 10, 10\\}$",
      "$\\{8, 9, 11, 12\\}$",
      "$\\{7, 9, 11, 13\\}$",
      "$\\{9, 10, 10, 11\\}$",
      "$\\{4, 10, 10, 16\\}$",
    ],
    correct_index: 4,
    solution_md:
      "**Formal path**\n\nAll five lists share the mean $10$, so compare how far the values sit from it. The deviations are: all zero; $2,1,1,2$; $3,1,1,3$; $1,0,0,1$; and $6,0,0,6$. The last list's values sit farthest from the mean, so it has the greatest standard deviation.\n\n**Trigger cue**\n\n\"Greatest standard deviation\" among lists: mark each mean and judge distance from it — clustering near the mean shrinks SD, and range alone does not settle it.\n\n**Takeaway**\n\nSD measures distance from the mean, not the spread of the endpoints alone.",
    fastest_path_md:
      "Same mean everywhere; $\\{4,10,10,16\\}$ sits farthest from it.",
    trap_map: {
      "0": "Picks the list with identical values, whose standard deviation is zero.",
      "1": "Picks a moderately spread list without comparing deviations.",
      "2": "Picks the evenly spaced list, assuming even spacing maximizes spread.",
      "3": "Picks the tightest cluster.",
    },
    numeric_check: null,
    check() {
      const lists = [
        [10, 10, 10, 10],
        [8, 9, 11, 12],
        [7, 9, 11, 13],
        [9, 10, 10, 11],
        [4, 10, 10, 16],
      ];
      const sd = (xs) => {
        const m = xs.reduce((a, b) => a + b, 0) / xs.length;
        return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length);
      };
      const values = lists.map(sd);
      let best = 0;
      for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
      for (let i = 0; i < values.length; i++)
        if (i !== best && Math.abs(values[i] - values[best]) < 1e-9)
          throw new Error("tie for greatest SD");
      return { kind: "index", index: best };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
