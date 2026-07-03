/**
 * Batch: 5 new rates_speed_work questions (rates_ratio_percent / arithmetic).
 * Cells: D2 PS pure, D3 PS real, D4 PS real, D3 PS real, D3 PS real.
 *
 * Run: node scripts/author/batch-rates_speed_work.mjs           (dry run)
 *      APPEND=1 node scripts/author/batch-rates_speed_work.mjs  (append to bank)
 */
import { verifyAndAppend } from "./harness.mjs";

/** Root-find f(x) = target on [lo, hi] by bisection (f monotone increasing across the root). */
function bisect(f, lo, hi, target = 0) {
  let flo = f(lo) - target;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid) - target;
    if ((fm >= 0) === (flo >= 0)) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

const items = [
  // ── 1. D2 · PS · pure ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 2,
    stem_md:
      "Working alone at its constant rate, machine $X$ can complete a task in $8$ hours. Working together at their constant rates, machines $X$ and $Y$ can complete the same task in $3$ hours. How many hours would machine $Y$, working alone at its constant rate, need to complete the task?",
    choices: ["$\\frac{24}{11}$", "$4.8$", "$5$", "$5.5$", "$11$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe combined rate is $\\dfrac{1}{3}$ task per hour and machine $X$'s rate is $\\dfrac{1}{8}$. So machine $Y$'s rate is $\\dfrac{1}{3} - \\dfrac{1}{8} = \\dfrac{8 - 3}{24} = \\dfrac{5}{24}$ task per hour, and $Y$ alone needs $\\dfrac{24}{5} = 4.8$ hours.\n\n**Trigger cue**\nGiven one solo time and a together time, subtract the rates — never the times.\n\n**Takeaway**\nRates add and subtract; times do not.",
    fastest_path_md:
      "In the $3$ shared hours, $X$ does $\\frac{3}{8}$ of the task, so $Y$ does the other $\\frac{5}{8}$ in $3$ hours. Alone: $3 \\div \\frac{5}{8} = \\frac{24}{5} = 4.8$ hours.",
    trap_map: {
      "0": "Adds the rates $\\frac{1}{8} + \\frac{1}{3}$ as if $3$ hours were $Y$'s solo time, producing a together time of $\\frac{24}{11}$.",
      "2": "Subtracts the given times, $8 - 3 = 5$, instead of subtracting the rates.",
      "3": "Averages the two given times: $(8 + 3)/2 = 5.5$.",
      "4": "Adds the two given times: $8 + 3 = 11$.",
    },
    numeric_check: "1/(1/3 - 1/8)",
    check() {
      // Forward model from raw data: fraction of the task finished when X
      // (solo time 8 h) and Y (unknown solo time tb) run together for 3 hours,
      // accumulated over 3000 equal time slices. Search for the tb that
      // makes exactly one full task.
      const doneIn3h = (tb) => {
        let w = 0;
        const steps = 3000;
        for (let k = 0; k < steps; k++) w += (3 / steps) * (1 / 8 + 1 / tb);
        return w;
      };
      // doneIn3h decreases as tb grows, so bisect on -doneIn3h.
      const tb = bisect((t) => -doneIn3h(t), 3.01, 200, -1);
      return { kind: "value", value: tb };
    },
  },

  // ── 2. D3 · PS · real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "A delivery scooter leaves a warehouse and travels along a straight road at a constant speed of $24$ kilometers per hour. Twenty minutes later, a motorcycle leaves the same warehouse and travels along the same road at a constant speed of $40$ kilometers per hour. How many minutes after its own departure does the motorcycle catch up with the scooter?",
    choices: ["$7.5$", "$12$", "$20$", "$30$", "$50$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nIn its $20$-minute head start ($\\frac{1}{3}$ hour), the scooter travels $24 \\cdot \\frac{1}{3} = 8$ kilometers. The motorcycle closes that gap at $40 - 24 = 16$ kilometers per hour, so it needs $\\dfrac{8}{16} = \\dfrac{1}{2}$ hour, that is, $30$ minutes.\n\n**Trigger cue**\nA chase along the same route: head-start distance divided by the difference of the speeds.\n\n**Takeaway**\nCatch-up time is head start divided by the speed difference.",
    fastest_path_md:
      "Head start $= 24 \\cdot \\frac{1}{3} = 8$ km. The gap shrinks $16$ km every hour, so $8$ km takes half an hour: $30$ minutes.",
    trap_map: {
      "0": "Divides the $8$-kilometer head start by the sum of the speeds, $64$ km/h, giving $\\frac{1}{8}$ hour $= 7.5$ minutes.",
      "1": "Divides the head start by the motorcycle's speed alone, $\\frac{8}{40}$ hour $= 12$ minutes, ignoring that the scooter keeps moving.",
      "2": "Repeats the $20$-minute head start as the answer.",
      "4": "Measures the time from the scooter's departure instead of the motorcycle's: $30 + 20 = 50$ minutes.",
    },
    numeric_check: "(24*(20/60)/(40 - 24))*60",
    check() {
      // Positions in km as functions of minutes after the motorcycle leaves.
      const scooterPos = (m) => 24 * ((m + 20) / 60);
      const motoPos = (m) => 40 * (m / 60);
      const m = bisect((t) => motoPos(t) - scooterPos(t), 0, 10000, 0);
      return { kind: "value", value: m };
    },
  },

  // ── 3. D4 · PS · real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 4,
    stem_md:
      "Working alone at their constant rates, Ana can edit a manuscript in $6$ hours, Ben in $8$ hours, and Carla in $12$ hours. Ana and Ben begin editing the manuscript together. After $2$ hours, Ana leaves and Carla immediately takes her place, and Ben and Carla work together until the manuscript is finished. How many hours after Ana and Ben began is the manuscript finished?",
    choices: ["$2$", "$\\frac{24}{7}$", "$4$", "$\\frac{22}{5}$", "$\\frac{16}{3}$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe rates are $\\frac{1}{6}$, $\\frac{1}{8}$, and $\\frac{1}{12}$ manuscript per hour. In the first $2$ hours, Ana and Ben complete $2\\left(\\frac{1}{6} + \\frac{1}{8}\\right) = 2 \\cdot \\frac{7}{24} = \\frac{7}{12}$. The remaining $\\frac{5}{12}$ is done by Ben and Carla at $\\frac{1}{8} + \\frac{1}{12} = \\frac{5}{24}$ per hour, taking $\\frac{5}{12} \\div \\frac{5}{24} = 2$ hours. Total: $2 + 2 = 4$ hours.\n\n**Trigger cue**\nWorkers swap partway through a job: split the timeline into phases and track the fraction finished in each.\n\n**Takeaway**\nPhase the timeline; the job fractions must sum to one.",
    fastest_path_md:
      "Let the job be $24$ units: Ana $4$, Ben $3$, Carla $2$ units per hour. Phase 1: $(4+3)\\cdot 2 = 14$ units. The last $10$ units at $3 + 2 = 5$ per hour take $2$ hours. Total $4$.",
    trap_map: {
      "0": "Counts only the second phase, forgetting the $2$ hours Ana and Ben already worked.",
      "1": "Applies Ana and Ben's combined rate to the whole job: $1 \\div \\frac{7}{24} = \\frac{24}{7}$.",
      "3": "Assumes exactly half the job was done in the first $2$ hours: $2 + \\frac{1}{2} \\div \\frac{5}{24} = \\frac{22}{5}$.",
      "4": "Has Ben finish the remaining $\\frac{5}{12}$ alone: $2 + \\frac{5}{12} \\div \\frac{1}{8} = \\frac{16}{3}$.",
    },
    numeric_check: "2 + (1 - 2*(1/6 + 1/8))/(1/8 + 1/12)",
    check() {
      // Forward model from the stem's timeline: fraction of the manuscript
      // done T hours after the start, with the crew swap at T = 2.
      const rAna = 1 / 6, rBen = 1 / 8, rCarla = 1 / 12;
      const workAt = (T) =>
        Math.min(T, 2) * (rAna + rBen) + Math.max(T - 2, 0) * (rBen + rCarla);
      const T = bisect(workAt, 0, 100, 1);
      return { kind: "value", value: T };
    },
  },

  // ── 4. D3 · PS · real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "Towns $P$ and $Q$ are $24$ miles apart along a straight road. At 1:00 p.m., Raj leaves town $P$ and walks toward town $Q$ at a constant speed of $4$ miles per hour. At 2:30 p.m., Lena leaves town $Q$ and walks toward town $P$ along the same road at a constant speed of $5$ miles per hour. How many miles from town $P$ are they when they meet?",
    choices: ["$8$", "$10$", "$12$", "$14$", "$16$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nBy 2:30 p.m., Raj has walked $4 \\cdot 1.5 = 6$ miles, so $24 - 6 = 18$ miles separate the two walkers. They close that gap at $4 + 5 = 9$ miles per hour, meeting $\\dfrac{18}{9} = 2$ hours later. Raj walks $1.5 + 2 = 3.5$ hours in all, so the meeting point is $4 \\cdot 3.5 = 14$ miles from town $P$.\n\n**Trigger cue**\nOpposite-direction travelers with staggered starts: remove the head start first, then divide by the combined speed.\n\n**Takeaway**\nShrink the gap by the head start; then use combined speed.",
    fastest_path_md:
      "Head start eats $6$ of the $24$ miles; the remaining $18$ close at $9$ mph in $2$ hours. Raj: $6 + 4\\cdot 2 = 14$ miles from $P$.",
    trap_map: {
      "0": "Counts only the $4 \\cdot 2 = 8$ miles Raj walks after Lena starts, dropping his head start.",
      "1": "Finds Lena's distance, $5 \\cdot 2 = 10$ — the distance from town $Q$, not town $P$.",
      "2": "Assumes they meet at the midpoint of the $24$ miles.",
      "4": "Subtracts Raj's post-2:30 distance from $24$: $24 - 8 = 16$, mixing up the reference town.",
    },
    numeric_check: "4*3.5",
    check() {
      // Positions in miles from P, t hours after 1:00 p.m.
      const rajPos = (t) => 4 * t;
      const lenaPos = (t) => 24 - 5 * Math.max(t - 1.5, 0);
      const tMeet = bisect((t) => rajPos(t) - lenaPos(t), 0, 50, 0);
      return { kind: "value", value: rajPos(tMeet) };
    },
  },

  // ── 5. D3 · PS · real ────────────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "Working at its constant rate, copier $A$ produces $240$ copies in $4$ minutes, and working at its constant rate, copier $B$ produces $240$ copies in $6$ minutes. Working together at their respective rates, how many minutes will the two copiers need to produce a total of $1{,}500$ copies?",
    choices: ["$15$", "$25$", "$30$", "$37.5$", "$62.5$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nCopier $A$'s rate is $\\dfrac{240}{4} = 60$ copies per minute and copier $B$'s rate is $\\dfrac{240}{6} = 40$ copies per minute. Together they produce $60 + 40 = 100$ copies per minute, so $1{,}500$ copies take $\\dfrac{1500}{100} = 15$ minutes.\n\n**Trigger cue**\nRates stated as an amount per batch time: convert each to a per-minute rate, then add the rates.\n\n**Takeaway**\nConvert to a common unit rate before adding rates.",
    fastest_path_md:
      "$60 + 40 = 100$ copies every minute, so $1{,}500$ copies take $15$ minutes.",
    trap_map: {
      "1": "Uses copier $A$'s rate alone: $1500 \\div 60 = 25$.",
      "2": "Averages the two rates to $50$ per minute and treats that average as the combined rate: $1500 \\div 50 = 30$.",
      "3": "Uses copier $B$'s rate alone: $1500 \\div 40 = 37.5$.",
      "4": "Treats the pair as producing $240$ copies every $4 + 6 = 10$ minutes: $\\frac{1500}{240} \\cdot 10 = 62.5$.",
    },
    numeric_check: "1500/(240/4 + 240/6)",
    check() {
      // Copies produced after m minutes, straight from the stem's batch data.
      const copiesAt = (m) => (240 / 4) * m + (240 / 6) * m;
      const m = bisect(copiesAt, 0, 1000, 1500);
      return { kind: "value", value: m };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
