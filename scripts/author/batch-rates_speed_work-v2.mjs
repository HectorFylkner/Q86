/**
 * Batch: 10 new rates_speed_work items (rates_ratio_percent).
 * Cells: D2 ×3, D3 ×1, D4 ×3, D5 ×3 — the subtopic had no D5 items and
 * only two at D4.
 * Trap language tracks the chapter: averaging speeds, adding times instead
 * of rates, dropping the early starter, unit mixing, answering from the
 * wrong clock, fraction done vs. fraction left.
 * Run: node scripts/author/batch-rates_speed_work-v2.mjs
 *      (APPEND=1 to write the bank)
 */
import { verifyAndAppend } from "./harness.mjs";

const S = {
  format: "problem_solving",
  content_domain: "arithmetic",
  context: "real",
  fundamental_skill: "rates_ratio_percent",
  subtopic: "rates_speed_work",
};

const items = [
  // 1 — D2: add rates, never times
  {
    ...S,
    difficulty: 2,
    stem_md:
      "Pump A can fill a tank in $6$ hours and pump B can fill the same tank in $12$ hours. Working together at their constant rates, how many hours do the two pumps take to fill the tank?",
    choices: ["$2$", "$4$", "$6$", "$9$", "$18$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nRates add: $\\frac{1}{6} + \\frac{1}{12} = \\frac{3}{12} = \\frac{1}{4}$ of the tank per hour, so the job takes $4$ hours. Sanity check: together must beat the faster pump's $6$ hours, and $4 < 6$.\n\n**Trigger cue**\n\n\"Working together at their constant rates\": add the rates; for exactly two workers jump to $\\frac{ab}{a+b}$.\n\n**Takeaway**\n\nAdd rates, then invert — never add the times.",
    fastest_path_md: "$\\frac{6 \\times 12}{6 + 12} = \\frac{72}{18} = 4$.",
    trap_map: {
      "0": "Divides the faster time by three, guessing rather than adding rates.",
      "2": "Reports the faster pump's solo time unchanged.",
      "3": "Averages the two solo times.",
      "4": "Adds the two times, giving a result slower than either pump alone.",
    },
    numeric_check: "6*12/(6+12)",
    check() {
      // Fill the tank minute by minute at the combined rate.
      const perMinute = 1 / (6 * 60) + 1 / (12 * 60);
      let filled = 0;
      let minutes = 0;
      while (filled < 1 - 1e-12) {
        filled += perMinute;
        minutes++;
      }
      return { kind: "value", value: minutes / 60 };
    },
  },

  // 2 — D2: average speed is total distance over total time
  {
    ...S,
    difficulty: 2,
    stem_md:
      "A cyclist rides $30$ kilometers at $15$ kilometers per hour and then rides another $30$ kilometers at $10$ kilometers per hour. What was her average speed, in kilometers per hour, for the entire $60$ kilometers?",
    choices: ["$11$", "$12$", "$12.5$", "$13$", "$25$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nTimes: $\\frac{30}{15} = 2$ hours and $\\frac{30}{10} = 3$ hours, for $5$ hours total. Average speed is $\\frac{60}{5} = 12$ kilometers per hour — below the arithmetic mean, because more time is spent at the slower speed.\n\n**Trigger cue**\n\n\"Average speed\" over equal distances: total distance over total time, or jump to $\\frac{2ab}{a+b}$.\n\n**Takeaway**\n\nAverage speed weights by time, so the slow leg dominates.",
    fastest_path_md: "$\\frac{2(15)(10)}{15+10} = \\frac{300}{25} = 12$.",
    trap_map: {
      "0": "Undershoots by weighting the slow leg even more heavily than the times warrant.",
      "2": "Averages the two speeds, $\\frac{15+10}{2}$.",
      "3": "Weights toward the faster speed instead of the slower.",
      "4": "Adds the two speeds.",
    },
    numeric_check: "60/5",
    check() {
      const legs = [
        [30, 15],
        [30, 10],
      ];
      let distance = 0;
      let time = 0;
      for (const [d, s] of legs) {
        distance += d;
        time += d / s;
      }
      return { kind: "value", value: distance / time };
    },
  },

  // 3 — D2: unit rate first
  {
    ...S,
    difficulty: 2,
    stem_md:
      "A machine produces $420$ bolts in $35$ minutes. At this constant rate, how many bolts does the machine produce in $2$ hours?",
    choices: ["$840$", "$1{,}200$", "$1{,}440$", "$1{,}470$", "$1{,}680$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe unit rate is $\\frac{420}{35} = 12$ bolts per minute. Two hours is $120$ minutes, so the output is $12 \\times 120 = 1{,}440$ bolts.\n\n**Trigger cue**\n\n\"Produces $N$ units in $M$ minutes\": compute the per-minute rate first, then treat it like any other rate.\n\n**Takeaway**\n\nGet to a unit rate before scaling anything.",
    fastest_path_md: "$12$ bolts per minute $\\times\\, 120$ minutes $= 1{,}440$.",
    trap_map: {
      "0": "Doubles the given output, treating $2$ hours as twice $35$ minutes.",
      "1": "Uses a rate of $10$ bolts per minute.",
      "3": "Treats $2$ hours as $3.5$ times the given window.",
      "4": "Uses $140$ minutes for two hours.",
    },
    numeric_check: "420/35*120",
    check() {
      const perMinute = 420 / 35;
      let bolts = 0;
      for (let m = 0; m < 2 * 60; m++) bolts += perMinute;
      return { kind: "value", value: bolts };
    },
  },

  // 4 — D3: subtract rates to isolate one worker
  {
    ...S,
    difficulty: 3,
    stem_md:
      "Working together at their constant rates, Ana and Ben paint a room in $4$ hours. Working alone, Ana paints the room in $10$ hours. How many hours does Ben take to paint the room working alone?",
    choices: ["$5\\dfrac{1}{3}$", "$6$", "$6\\dfrac{2}{3}$", "$7$", "$14$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSubtract rates: $R_B = \\frac{1}{4} - \\frac{1}{10} = \\frac{5-2}{20} = \\frac{3}{20}$ of the room per hour. Ben alone takes $\\frac{20}{3} = 6\\frac{2}{3}$ hours.\n\n**Trigger cue**\n\n\"Together they take …; one of them alone takes …\": subtract the known rate from the combined rate.\n\n**Takeaway**\n\nRates subtract as cleanly as they add.",
    fastest_path_md: "$\\frac{1}{4} - \\frac{1}{10} = \\frac{3}{20}$, so $\\frac{20}{3}$ hours.",
    trap_map: {
      "0": "Inverts a slip in the common denominator, using $\\frac{1}{4}-\\frac{1}{12}$.",
      "1": "Subtracts the times, $10 - 4$, instead of the rates.",
      "3": "Rounds the exact $\\frac{20}{3}$ to a whole number of hours.",
      "4": "Adds the times, $10 + 4$.",
    },
    numeric_check: "20/3",
    check() {
      const combined = 1 / 4;
      const ana = 1 / 10;
      const ben = combined - ana;
      return { kind: "value", value: 1 / ben };
    },
  },

  // 5 — D4: a late starter, and the first worker keeps going
  {
    ...S,
    difficulty: 4,
    stem_md:
      "Machine X, working alone, completes a job in $9$ hours; machine Y, working alone, completes the same job in $6$ hours. Machine X starts the job alone at 8:00 a.m., and machine Y joins it at 11:00 a.m. At what time is the job completed?",
    choices: [
      "12:00 noon",
      "12:24 p.m.",
      "1:00 p.m.",
      "1:24 p.m.",
      "2:00 p.m.",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nIn its first $3$ hours alone, X does $\\frac{3}{9} = \\frac{1}{3}$ of the job, leaving $\\frac{2}{3}$. From 11:00 both run, at a combined rate of $\\frac{1}{9} + \\frac{1}{6} = \\frac{5}{18}$ per hour. The remaining time is $\\frac{2/3}{5/18} = \\frac{2}{3} \\cdot \\frac{18}{5} = 2.4$ hours, i.e. $2$ hours $24$ minutes after 11:00, so 1:24 p.m.\n\n**Trigger cue**\n\n\"Starts alone at …, joined at …\": tally the head start as a fraction of the job, then run the combined rate against what is left.\n\n**Takeaway**\n\nThe early starter keeps working — count its hours to the finish.",
    fastest_path_md:
      "X banks $\\frac{1}{3}$ by 11:00; $\\frac{2}{3} \\div \\frac{5}{18} = 2.4$ h; 11:00 $+$ 2:24 $=$ 1:24 p.m.",
    trap_map: {
      "0": "Uses the fraction already done, $\\frac{1}{3}$, as the remaining work.",
      "1": "Stops machine X when Y joins, running only Y against the remainder.",
      "2": "Rounds $2.4$ hours to $2$ hours.",
      "4": "Ignores the head start and runs the combined rate over the whole job from 11:00.",
    },
    numeric_check: null,
    check(q) {
      // Simulate minute by minute from 8:00; find the completion minute.
      const perMinuteX = 1 / (9 * 60);
      const perMinuteY = 1 / (6 * 60);
      let done = 0;
      let minute = 0; // minutes after 8:00
      while (done < 1 - 1e-12) {
        done += perMinuteX;
        if (minute >= 3 * 60) done += perMinuteY;
        minute++;
      }
      const clock = 8 * 60 + minute;
      const hour24 = Math.floor(clock / 60);
      const mins = clock % 60;
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const suffix = hour24 < 12 ? "a.m." : "p.m.";
      const label =
        mins === 0 && hour24 === 12
          ? "12:00 noon"
          : `${hour12}:${String(mins).padStart(2, "0")} ${suffix}`;
      const hits = [];
      q.choices.forEach((c, i) => {
        if (c === label) hits.push(i);
      });
      if (hits.length !== 1) throw new Error(`"${label}" matched ${hits.length}`);
      return { kind: "index", index: hits[0] };
    },
  },

  // 6 — D4: catch-up on the difference of speeds, answered from the right clock
  {
    ...S,
    difficulty: 4,
    stem_md:
      "A freight train leaves a station travelling at $45$ kilometers per hour. Ninety minutes later, an express train leaves the same station on the same track travelling at $75$ kilometers per hour. How many kilometers from the station does the express train overtake the freight train?",
    choices: ["$67.5$", "$112.5$", "$135$", "$168.75$", "$202.5$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\n\nIn $1.5$ hours the freight train covers $45 \\times 1.5 = 67.5$ kilometers of head start. The express closes that gap at $75 - 45 = 30$ kilometers per hour, taking $\\frac{67.5}{30} = 2.25$ hours. In that time the express travels $75 \\times 2.25 = 168.75$ kilometers.\n\n**Trigger cue**\n\n\"Leaves later, catches up\": head-start distance divided by the *difference* of speeds — then reread which distance or clock the question wants.\n\n**Takeaway**\n\nCatch-up time is head start over speed difference.",
    fastest_path_md:
      "Head start $67.5$ km $\\div$ gap $30$ km/h $= 2.25$ h; $75 \\times 2.25 = 168.75$ km.",
    trap_map: {
      "0": "Reports the head-start distance rather than the meeting point.",
      "1": "Reports the distance the express covers in the $1.5$-hour head-start window.",
      "2": "Uses the sum of the speeds instead of the difference when closing the gap.",
      "4": "Adds the head start to the meeting distance, double-counting the freight train's start.",
    },
    numeric_check: "75*(45*1.5/(75-45))",
    check() {
      // Step in seconds until the express's distance reaches the freight's.
      const head = 1.5 * 3600;
      for (let t = head; t <= 20 * 3600; t++) {
        const freight = (45 / 3600) * t;
        const express = (75 / 3600) * (t - head);
        if (express >= freight - 1e-9) {
          return { kind: "value", value: Math.round(express * 1e6) / 1e6 };
        }
      }
      throw new Error("no overtake");
    },
  },

  // 7 — D4: units must be reconciled before any arithmetic
  {
    ...S,
    difficulty: 4,
    stem_md:
      "Two runners start from the same point on a circular track $400$ meters around and run in opposite directions, one at $4$ meters per second and the other at $6$ meters per second. How many seconds after they start do they meet for the third time?",
    choices: ["$40$", "$80$", "$120$", "$200$", "$240$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nRunning in opposite directions, the gap between them closes at the sum of the speeds, $10$ meters per second. They meet each time their combined distance covers another full lap, so meetings occur every $\\frac{400}{10} = 40$ seconds. The third meeting is at $3 \\times 40 = 120$ seconds.\n\n**Trigger cue**\n\n\"Toward each other\" or opposite directions on a loop: one mover at the *sum* of the speeds, one lap per meeting.\n\n**Takeaway**\n\nOpposite directions add speeds; each meeting costs one full lap.",
    fastest_path_md: "$\\frac{400}{4+6} = 40$ s per meeting; the third is at $120$ s.",
    trap_map: {
      "0": "Reports the time of the first meeting.",
      "1": "Reports the time of the second meeting.",
      "3": "Uses the difference of the speeds instead of the sum.",
      "4": "Charges one lap of the slower runner, $\\frac{400}{4}$, per meeting.",
    },
    numeric_check: "3*400/(4+6)",
    check() {
      let meetings = 0;
      let last = 0;
      for (let t = 1; t <= 10000; t++) {
        const combined = (4 + 6) * t;
        const laps = Math.floor(combined / 400);
        if (laps > meetings) {
          meetings = laps;
          last = t;
          if (meetings === 3) return { kind: "value", value: last };
        }
      }
      throw new Error("no third meeting");
    },
  },

  // 8 — D5: three workers, one leaves partway
  {
    ...S,
    difficulty: 5,
    stem_md:
      "Three crews can pave a road in $10$, $15$, and $30$ days respectively, each working at its own constant rate. All three begin together, but the fastest crew leaves after $2$ days and the other two finish the road. How many days in total does the paving take?",
    choices: ["$5$", "$6$", "$8$", "$10$", "$12$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nCombined, all three pave $\\frac{1}{10} + \\frac{1}{15} + \\frac{1}{30} = \\frac{3+2+1}{30} = \\frac{1}{5}$ of the road per day, so the first two days complete $\\frac{2}{5}$. The remaining $\\frac{3}{5}$ falls to the other two crews at $\\frac{1}{15} + \\frac{1}{30} = \\frac{1}{10}$ per day, taking $\\frac{3/5}{1/10} = 6$ days. Total: $2 + 6 = 8$ days.\n\n**Trigger cue**\n\nA worker leaving partway: bank the multi-worker fraction first, then run the reduced rate against the remainder.\n\n**Takeaway**\n\nBank what is done, then divide the remainder by the new rate.",
    fastest_path_md:
      "All three: $\\frac{1}{5}$/day for $2$ days $= \\frac{2}{5}$. Remaining $\\frac{3}{5} \\div \\frac{1}{10} = 6$ days. Total $8$.",
    trap_map: {
      "0": "Reports the time all three together would need for the whole road.",
      "1": "Counts only the days after the fastest crew leaves, dropping the first two.",
      "3": "Reports the time the two slower crews would need for the whole road alone.",
      "4": "Adds the two shared days to that whole-road figure, double-counting the head start.",
    },
    numeric_check: "2 + 6",
    check() {
      // Simulate in hundredths of a day, counted as integers so the
      // crew-departure boundary lands exactly on day 2.
      const perDay = 100;
      let done = 0;
      let ticks = 0;
      while (done < 1 - 1e-9) {
        const rate = ticks < 2 * perDay ? 1 / 10 + 1 / 15 + 1 / 30 : 1 / 15 + 1 / 30;
        done += rate / perDay;
        ticks++;
      }
      return { kind: "value", value: ticks / perDay };
    },
  },

  // The D5 that sat here ("required back-leg speed to hit a target
  // average") was withdrawn after a cold reread: two divisions and a
  // subtraction is a D4 at most. Its replacement lives in
  // batch-d5-replacements.mjs.

  // 10 — D5: fraction done versus fraction left, with a joiner
  {
    ...S,
    difficulty: 5,
    stem_md:
      "A tank is filled by inlet pipe A alone in $12$ hours and by inlet pipe B alone in $18$ hours, while a drain pipe C empties the full tank in $36$ hours. All three are opened together on an empty tank. After $6$ hours the drain is closed. How many more hours are needed to fill the tank?",
    choices: ["$1.2$", "$2$", "$2.4$", "$3$", "$4.8$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nWith all three open the net rate is $\\frac{1}{12} + \\frac{1}{18} - \\frac{1}{36} = \\frac{3 + 2 - 1}{36} = \\frac{4}{36} = \\frac{1}{9}$ per hour, so six hours fill $\\frac{6}{9} = \\frac{2}{3}$. With the drain closed the rate becomes $\\frac{1}{12} + \\frac{1}{18} = \\frac{5}{36}$ per hour, and the remaining $\\frac{1}{3}$ takes $\\frac{1/3}{5/36} = \\frac{36}{15} = 2.4$ hours.\n\n**Trigger cue**\n\nAn outflow among the inflows: subtract the drain's rate, and recompute the rate the moment any pipe changes state.\n\n**Takeaway**\n\nA drain is a negative rate; the remainder is one minus what is done.",
    fastest_path_md:
      "Net $\\frac{1}{9}$/h for $6$ h $= \\frac{2}{3}$; remaining $\\frac{1}{3} \\div \\frac{5}{36} = 2.4$ h.",
    trap_map: {
      "0": "Ignores the drain during the first six hours.",
      "1": "Rounds the exact $2.4$ hours down to a whole number.",
      "3": "Leaves the drain open for the final stretch as well.",
      "4": "Uses the fraction already filled, $\\frac{2}{3}$, as the fraction remaining.",
    },
    numeric_check: "(1/3)/(1/12 + 1/18)",
    check() {
      const step = 1 / 3600;
      let filled = 0;
      let hours = 0;
      while (hours < 6) {
        filled += (1 / 12 + 1 / 18 - 1 / 36) * step;
        hours += step;
      }
      let extra = 0;
      while (filled < 1 - 1e-9) {
        filled += (1 / 12 + 1 / 18) * step;
        extra += step;
      }
      return { kind: "value", value: Math.round(extra * 100) / 100 };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
