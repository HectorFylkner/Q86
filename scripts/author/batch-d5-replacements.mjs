/**
 * Batch: 3 replacement D5 items.
 *
 * A cold reread of this session's new D5 stems found three that a strong
 * student clears in well under a minute — a required back-leg speed, a
 * memorized $x + \frac{1}{x}$ identity, and a symmetry-spotting count.
 * They were honest questions at D3/D4 and dishonest at D5, so they left
 * the bank and these took their place: three phases of changing rates, a
 * perfect square hidden inside a quartic, and a two-count exclusion whose
 * overlap is an lcm rather than a product.
 *
 * Run: node scripts/author/batch-d5-replacements.mjs   (APPEND=1 to write)
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // rates_speed_work — three phases, three different rates, a clock answer
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "Pipe A alone fills a tank in $10$ hours and pipe B alone fills it in $15$ hours. Pipe A is opened alone at 6:00 a.m. Pipe B is opened at 9:00 a.m., and pipe A is closed at 11:00 a.m., leaving B to finish. At what time is the tank full?",
    choices: [
      "1:12 p.m.",
      "4:00 p.m.",
      "4:30 p.m.",
      "5:00 p.m.",
      "8:30 p.m.",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThree phases, each with its own rate. From 6:00 to 9:00, A alone does $3 \\cdot \\frac{1}{10} = \\frac{3}{10}$. From 9:00 to 11:00, both run at $\\frac{1}{10} + \\frac{1}{15} = \\frac{1}{6}$, adding $\\frac{2}{6} = \\frac{1}{3}$. Banked so far: $\\frac{3}{10} + \\frac{1}{3} = \\frac{19}{30}$. B alone must cover the remaining $\\frac{11}{30}$ at $\\frac{1}{15}$ per hour, taking $\\frac{11}{30} \\cdot 15 = 5.5$ hours. From 11:00 that is 4:30 p.m.\n\n**Trigger cue**\n\nWorkers joining and leaving at stated times: split the clock into phases, bank the fraction each phase completes, and recompute the rate at every change.\n\n**Takeaway**\n\nRecompute the rate at every join and every exit.",
    fastest_path_md:
      "$\\frac{3}{10} + \\frac{1}{3} = \\frac{19}{30}$ banked by 11:00; $\\frac{11}{30} \\div \\frac{1}{15} = 5.5$ h.",
    trap_map: {
      "0": "Leaves pipe A open to the end, finishing the remainder at the combined rate.",
      "1": "Forgets that B ever joins, running A alone for its full $10$ hours.",
      "3": "Rounds the final $5.5$ hours up to $6$.",
      "4": "Uses the fraction already filled, $\\frac{19}{30}$, as the fraction remaining.",
    },
    numeric_check: null,
    check(q) {
      // Simulate minute by minute from 6:00 a.m.
      const perMinA = 1 / (10 * 60);
      const perMinB = 1 / (15 * 60);
      let filled = 0;
      let minute = 0; // minutes after 6:00
      while (filled < 1 - 1e-12) {
        const aOpen = minute < 5 * 60; // 6:00 -> 11:00
        const bOpen = minute >= 3 * 60; // from 9:00
        filled += (aOpen ? perMinA : 0) + (bOpen ? perMinB : 0);
        minute++;
      }
      const clock = 6 * 60 + minute;
      const h24 = Math.floor(clock / 60);
      const mins = clock % 60;
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      const label = `${h12}:${String(mins).padStart(2, "0")} ${h24 < 12 ? "a.m." : "p.m."}`;
      const hits = q.choices.flatMap((c, i) => (c === label ? [i] : []));
      if (hits.length !== 1) throw new Error(`"${label}" matched ${hits.length}`);
      return { kind: "index", index: hits[0] };
    },
  },

  // quadratics_factoring — a perfect square hiding inside a quartic
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "quadratics_factoring",
    difficulty: 5,
    stem_md:
      "If $x^{2} - 5x + 3 = 0$, what is the value of $x^{4} - 10x^{3} + 25x^{2} - 12$?",
    choices: ["$-21$", "$-12$", "$-3$", "$6$", "$9$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nDo not solve for $x$. The first three terms are a perfect square: $x^{4} - 10x^{3} + 25x^{2} = \\left(x^{2} - 5x\\right)^{2}$. The given equation says $x^{2} - 5x = -3$, so that square is $(-3)^{2} = 9$, and the whole expression is $9 - 12 = -3$. Both roots give the same value, as they must.\n\n**Trigger cue**\n\nA quartic whose coefficients look like a squared quadratic: isolate $x^{2} + bx$ from the given equation and hunt for its square in the target.\n\n**Takeaway**\n\nFind the given expression inside the target; never solve for $x$.",
    fastest_path_md:
      "$\\left(x^{2}-5x\\right)^{2} - 12 = (-3)^{2} - 12 = -3$.",
    trap_map: {
      "0": "Carries the sign through the squaring, using $(-3)^{2} = -9$.",
      "1": "Takes the square to be $0$, as if $x^{2} - 5x$ vanished.",
      "3": "Subtracts $3$ instead of $12$.",
      "4": "Stops at the square and forgets the trailing $-12$.",
    },
    numeric_check: "9 - 12",
    check() {
      // Solve the quadratic numerically, then evaluate the quartic at both
      // roots — independent of the algebraic identity in the solution.
      const disc = Math.sqrt(25 - 12);
      const roots = [(5 + disc) / 2, (5 - disc) / 2];
      const values = roots.map(
        (x) => x ** 4 - 10 * x ** 3 + 25 * x ** 2 - 12,
      );
      for (const x of roots) {
        if (Math.abs(x * x - 5 * x + 3) > 1e-9) throw new Error("bad root");
      }
      if (Math.abs(values[0] - values[1]) > 1e-6) {
        throw new Error(`roots disagree: ${values}`);
      }
      return { kind: "value", value: Math.round(values[0] * 1e6) / 1e6 };
    },
  },

  // consecutive_evenly_spaced — two inclusive counts and an lcm overlap
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "value_order_factors",
    subtopic: "consecutive_evenly_spaced",
    difficulty: 5,
    stem_md:
      "How many integers from $100$ through $999$, inclusive, are multiples of $6$ but not multiples of $8$?",
    choices: ["$37$", "$112$", "$113$", "$132$", "$150$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nCount the multiples of $6$: they run $102$ to $996$, so $\\frac{996-102}{6} + 1 = 150$. Now remove those that are also multiples of $8$ — that means multiples of $\\mathrm{lcm}(6,8) = 24$, not of $48$. They run $120$ to $984$, so $\\frac{984-120}{24} + 1 = 37$. The answer is $150 - 37 = 113$.\n\n**Trigger cue**\n\n\"Multiples of $a$ but not of $b$\": count the multiples of $a$, then subtract the multiples of $\\mathrm{lcm}(a,b)$ — pin the first and last qualifying value at each step.\n\n**Takeaway**\n\nThe overlap of two divisibility conditions is their lcm.",
    fastest_path_md:
      "$150$ multiples of $6$, minus $37$ multiples of $24$, is $113$.",
    trap_map: {
      "0": "Reports the multiples of $24$ that were removed rather than what survives.",
      "1": "Drops a term from one of the inclusive counts.",
      "3": "Uses $48$, the product, as the overlap instead of $\\mathrm{lcm}(6,8) = 24$.",
      "4": "Counts the multiples of $6$ and ignores the second condition.",
    },
    numeric_check: "150 - 37",
    check() {
      let count = 0;
      for (let n = 100; n <= 999; n++) if (n % 6 === 0 && n % 8 !== 0) count++;
      return { kind: "value", value: count };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
