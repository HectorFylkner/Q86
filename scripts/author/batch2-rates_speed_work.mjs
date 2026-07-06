/**
 * Batch 2: 15 new rates_speed_work items (rates_ratio_percent).
 *
 *   1. D2 PS pure  — machine-hours invariance (6 machines → 9 machines)
 *   2. D2 PS real  — cycle rate across units (12 boxes per 40 s over 6 min)
 *   3. D3 PS real  — late/early commute, distance from the time swing
 *   4. D3 PS pure  — k bottles every m minutes over h hours (expressions)
 *   5. D3 PS real  — average speed including a stop
 *   6. D3 PS real  — inlet vs open drain, net rate
 *   7. D3 DS real  — driving time > 2 h? distance + speed combine (answer C)
 *   8. D3 PS pure  — "twice as fast", split the combined rate
 *   9. D4 PS real  — return speed to hit a target round-trip average
 *  10. D4 PS real  — reinforcement mid-job, worker-day budget
 *  11. D4 DS real  — tank filled in under 3 h? threshold-rate pruning (answer B)
 *  12. D4 PS real  — one-way distance in terms of u, v, T (expressions)
 *  13. D5 PS pure  — extra-hours structure, together time = sqrt(4·9)
 *  14. D5 PS real  — alternating one-hour shifts, fractional final shift
 *  15. D5 DS real  — fixed combined speed transfers a bound (answer A)
 *
 * Run: node --experimental-strip-types scripts/author/batch2-rates_speed_work.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

/** Root-find f(x) = target on [lo, hi] by bisection (f monotone across the root). */
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

// Standard DS decision: sufficiency of (1) alone, (2) alone, and combined.
const dsAnswerIndex = (s1, s2, together) =>
  s1 && s2 ? 3 : s1 ? 0 : s2 ? 1 : together ? 2 : 4;

const items = [
  // ── 1. D2 · PS · pure — machine-hours invariance ─────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 2,
    stem_md:
      "Working at the same constant rate, $6$ identical machines can complete a production run in $12$ hours. How many hours would $9$ of these machines, each working at that same constant rate, need to complete the same production run?",
    choices: ["$4$", "$6$", "$8$", "$9$", "$18$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe run requires $6 \\times 12 = 72$ machine-hours of work. Spread over $9$ machines, it takes $\\dfrac{72}{9} = 8$ hours.\n\n**Trigger cue**\nThe same job done by a different number of identical machines — total machine-hours stay constant, so time varies inversely with the head count.\n\n**Takeaway**\nHold machine-hours fixed; time varies inversely with the number of machines.",
    fastest_path_md:
      "Nine machines are $\\frac{3}{2}$ of six, so the time shrinks by the reciprocal factor: $12 \\times \\frac{2}{3} = 8$ hours.",
    trap_map: {
      "0": "Divides the $12$ hours by the $3$ added machines.",
      "1": "Halves the time, treating $50\\%$ more machines as if they doubled the speed.",
      "3": "Averages the two given numbers $12$ and $6$.",
      "4": "Scales the time directly with the machine count, $12 \\times \\frac{9}{6} = 18$, instead of inversely.",
    },
    numeric_check: "8",
    check() {
      // Job size from the stem: 6 machines x 12 hours at 1 unit/machine/hour.
      const totalUnits = 6 * 12;
      let hours = 0;
      let done = 0;
      while (done < totalUnits) {
        hours++;
        done += 9; // 9 machines, 1 unit each per hour
      }
      if (done !== totalUnits) throw new Error("job does not end on an hour boundary");
      return { kind: "value", value: hours };
    },
  },

  // ── 2. D2 · PS · real — cycle rate across time units ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 2,
    stem_md:
      "Working at a constant rate, a packing machine seals $12$ boxes every $40$ seconds. At this rate, how many boxes does the machine seal in $6$ minutes?",
    choices: ["$18$", "$72$", "$108$", "$120$", "$144$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nSix minutes is $360$ seconds, which contains $\\dfrac{360}{40} = 9$ complete $40$-second cycles. Each cycle seals $12$ boxes, so the machine seals $9 \\times 12 = 108$ boxes.\n\n**Trigger cue**\nA rate quoted per odd time block (every $40$ seconds) with the question posed in different units — convert to a common time unit before scaling.\n\n**Takeaway**\nAlign the time units, then scale the cycle rate.",
    fastest_path_md:
      "$360$ seconds holds nine $40$-second cycles, and $9 \\times 12 = 108$ — no per-second rate needed.",
    trap_map: {
      "0": "Finds the per-minute rate of $18$ boxes and stops there.",
      "1": "Multiplies $12$ boxes by $6$ minutes, ignoring the $40$-second cycle length.",
      "3": "Rounds the pace to one box every $3$ seconds, giving $\\frac{360}{3} = 120$.",
      "4": "Treats the $40$-second cycle as half a minute, doubling the rate to $24$ boxes per minute.",
    },
    numeric_check: "12*360/40",
    check() {
      // Count whole cycles inside 6 minutes, straight from the stem's data.
      let t = 0;
      let boxes = 0;
      while (t + 40 <= 6 * 60) {
        t += 40;
        boxes += 12;
      }
      if (t !== 360) throw new Error("6 minutes is not a whole number of cycles");
      return { kind: "value", value: boxes };
    },
  },

  // ── 3. D3 · PS · real — late/early commute distance ──────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "When Marta drives from her home to her office at an average speed of $40$ kilometers per hour, she arrives $10$ minutes later than her scheduled arrival time. When she drives the same route at an average speed of $60$ kilometers per hour, she arrives $10$ minutes earlier than her scheduled arrival time. How many kilometers long is Marta's route?",
    choices: ["$20$", "$40$", "$48$", "$50$", "$60$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $d$ be the route length. The slow trip takes $\\dfrac{d}{40}$ hours and the fast trip $\\dfrac{d}{60}$ hours. Going from $10$ minutes late to $10$ minutes early is a swing of $20$ minutes $= \\dfrac{1}{3}$ hour, so $\\dfrac{d}{40} - \\dfrac{d}{60} = \\dfrac{1}{3}$. The left side is $\\dfrac{d}{120}$, giving $d = 40$.\n\n**Trigger cue**\nOne route, two speeds, one arrival late and one early — the late and early margins add up to the difference between the two travel times.\n\n**Takeaway**\nLate plus early margins give the gap between travel times.",
    fastest_path_md:
      "Backsolve $d = 40$: one hour at $40$ km/h versus $40$ minutes at $60$ km/h — a $20$-minute swing, exactly matching $10$ late and $10$ early.",
    trap_map: {
      "0": "Uses only one $10$-minute margin instead of the full $20$-minute swing between late and early.",
      "2": "Computes the round-trip average speed $\\frac{2 \\cdot 40 \\cdot 60}{100} = 48$ and reports it as the distance.",
      "3": "Solves for the scheduled travel time — $50$ minutes — and reports that number as kilometers.",
      "4": "Reports the faster driving speed.",
    },
    numeric_check: "40",
    check() {
      // Scan distances on a 0.1 km grid; the schedule implied by the slow trip
      // (10 min late) must equal the schedule implied by the fast trip (10 min early).
      const found = [];
      for (let i = 1; i <= 2000; i++) {
        const d = i / 10;
        const schedFromSlow = d / 40 - 10 / 60;
        const schedFromFast = d / 60 + 10 / 60;
        if (schedFromSlow > 0 && Math.abs(schedFromSlow - schedFromFast) < 1e-9) found.push(d);
      }
      if (found.length !== 1) throw new Error(`expected unique distance, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 4. D3 · PS · pure — rate with variables across units (expressions) ───
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "Working at a constant rate, a bottling machine fills $k$ bottles every $m$ minutes. At this rate, how many bottles does the machine fill in $h$ hours?",
    choices: [
      "$\\dfrac{hk}{m}$",
      "$\\dfrac{hk}{60m}$",
      "$\\dfrac{60hm}{k}$",
      "$\\dfrac{60hk}{m}$",
      "$\\dfrac{60k}{hm}$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe rate is $\\dfrac{k}{m}$ bottles per minute. In $h$ hours there are $60h$ minutes, so the machine fills $\\dfrac{k}{m} \\cdot 60h = \\dfrac{60hk}{m}$ bottles.\n\n**Trigger cue**\nA per-minute rate in variables with the elapsed time given in hours — insert the $60$ on the time side before multiplying.\n\n**Takeaway**\nConvert hours to minutes before applying a per-minute rate.",
    fastest_path_md:
      "Plug $k = 10$, $m = 5$, $h = 2$: $10$ bottles every $5$ minutes is $120$ per hour, so $240$ in $2$ hours — only $\\dfrac{60hk}{m}$ returns $240$.",
    trap_map: {
      "0": "Leaves $h$ in hours, never converting the duration to minutes.",
      "1": "Converts in the wrong direction, dividing by $60$ instead of multiplying.",
      "2": "Computes minutes per bottle times the duration — a time, not a bottle count.",
      "4": "Divides the rate by the duration instead of multiplying by it.",
    },
    numeric_check: null,
    check() {
      // For sample (k, m, h) triples, count whole m-minute cycles inside the
      // h hours (samples chosen so the window is a whole number of cycles),
      // then find the unique candidate expression that matches every sample.
      const samples = [
        [10, 4, 2],
        [7, 5, 3],
        [9, 6, 4],
      ];
      const cands = [
        (k, m, h) => (h * k) / m,
        (k, m, h) => (h * k) / (60 * m),
        (k, m, h) => (60 * h * m) / k,
        (k, m, h) => (60 * h * k) / m,
        (k, m, h) => (60 * k) / (h * m),
      ];
      const ok = cands.map(() => true);
      for (const [k, m, h] of samples) {
        let t = 0;
        let bottles = 0;
        while (t + m <= 60 * h) {
          t += m;
          bottles += k;
        }
        if (t !== 60 * h) throw new Error("sample window is not a whole number of cycles");
        cands.forEach((f, i) => {
          if (Math.abs(f(k, m, h) - bottles) > 1e-6) ok[i] = false;
        });
      }
      const matches = ok.flatMap((v, i) => (v ? [i] : []));
      if (matches.length !== 1) throw new Error(`expected one matching expression, got ${matches.length}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 5. D3 · PS · real — average speed including a stop ───────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "A truck driver drove $240$ miles at an average speed of $60$ miles per hour, stopped for $2$ hours to unload, and then drove another $60$ miles at an average speed of $30$ miles per hour. For the entire trip, including the stop, the driver's average speed was how many miles per hour?",
    choices: ["$30$", "$37.5$", "$40$", "$45$", "$50$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nDriving times: $\\dfrac{240}{60} = 4$ hours and $\\dfrac{60}{30} = 2$ hours. With the $2$-hour stop, the elapsed time is $4 + 2 + 2 = 8$ hours for $240 + 60 = 300$ miles, so the average speed is $\\dfrac{300}{8} = 37.5$ miles per hour.\n\n**Trigger cue**\n\"Average speed for the entire trip, including the stop\" — the denominator is total clock time, idle hours included.\n\n**Takeaway**\nInclude stopped time in the denominator of average speed.",
    fastest_path_md:
      "Idle time can only drag the average below the driving-only $\\frac{300}{6} = 50$, killing $45$ and $50$ at a glance; then one division, $\\frac{300}{8} = 37.5$, settles it.",
    trap_map: {
      "0": "Divides only the first leg's $240$ miles by the full $8$ hours.",
      "2": "Applies the equal-distance shortcut $\\frac{2 \\cdot 60 \\cdot 30}{60 + 30} = 40$, ignoring both the stop and the unequal leg lengths.",
      "3": "Averages the two driving speeds.",
      "4": "Omits the $2$-hour stop from the elapsed time: $\\frac{300}{6} = 50$.",
    },
    numeric_check: "300/8",
    check() {
      // Recover each leg's duration by bisection on distance covered, then
      // divide total miles by total elapsed time including the stop.
      const t1 = bisect((t) => 60 * t, 0, 100, 240);
      const t2 = bisect((t) => 30 * t, 0, 100, 60);
      const totalMiles = 240 + 60;
      const totalHours = t1 + 2 + t2;
      return { kind: "value", value: totalMiles / totalHours };
    },
  },

  // ── 6. D3 · PS · real — inlet vs open drain, net rate ────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "An inlet pipe, working alone at its constant rate, can fill an empty storage tank in $10$ hours, and an open drain can empty the full tank at a constant rate in $15$ hours. If the inlet pipe is turned on while the tank is empty and the drain is accidentally left open, in how many hours will the tank be completely filled?",
    choices: ["$5$", "$6$", "$12.5$", "$25$", "$30$"],
    correct_index: 4,
    solution_md:
      "**Formal path**\nThe inlet fills at $\\dfrac{1}{10}$ tank per hour while the drain removes $\\dfrac{1}{15}$ tank per hour, so the net rate is $\\dfrac{1}{10} - \\dfrac{1}{15} = \\dfrac{3 - 2}{30} = \\dfrac{1}{30}$ tank per hour. Filling the whole tank takes $30$ hours.\n\n**Trigger cue**\nOne pipe filling while another empties — the rates oppose, so subtract them before inverting.\n\n**Takeaway**\nOpposing pipes: subtract the emptying rate from the filling rate.",
    fastest_path_md:
      "Take a $30$-unit tank: the inlet adds $3$ units per hour, the drain removes $2$, so the tank gains $1$ unit per hour — $30$ hours.",
    trap_map: {
      "0": "Subtracts the given times, $15 - 10$, instead of subtracting the rates.",
      "1": "Adds the rates as though the drain also filled: $1 \\div \\left(\\frac{1}{10} + \\frac{1}{15}\\right) = 6$.",
      "2": "Averages the two given times.",
      "3": "Adds the two given times.",
    },
    numeric_check: "1/(1/10 - 1/15)",
    check() {
      // Forward model: water level after t hours with the inlet adding t/10
      // of a tank and the drain removing t/15. Bisect for a full tank.
      const level = (t) => t / 10 - t / 15;
      const t = bisect(level, 0, 500, 1);
      return { kind: "value", value: t };
    },
  },

  // ── 7. D3 · DS · real — driving time > 2 hours? (answer C) ───────────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "Yesterday Nadia drove, without stopping, from her apartment to a beach house. Was her driving time for the trip more than $2$ hours?\n\n(1) The distance from Nadia's apartment to the beach house is $130$ miles.\n\n(2) Nadia's average speed for the trip was $60$ miles per hour.",
    choices: [...DS_CHOICES],
    correct_index: 2,
    solution_md:
      "**Formal path**\nDriving time equals distance divided by average speed, so both inputs matter.\n\nStatement (1): $130$ miles at $50$ mph takes $2.6$ hours (yes), but at $65$ mph it takes exactly $2$ hours (no). Not sufficient.\n\nStatement (2): at $60$ mph, a $60$-mile trip takes $1$ hour (no) and a $150$-mile trip takes $2.5$ hours (yes). Not sufficient.\n\nTogether: the time is $\\dfrac{130}{60} = \\dfrac{13}{6}$ hours, which is more than $2$. Sufficient — answer (C).\n\n**Trigger cue**\nA yes/no question about $\\frac{d}{v}$ where each statement supplies only one of the two inputs — test extremes for each alone, then combine.\n\n**Takeaway**\nYes/no time questions need both inputs or a decisive bound.",
    fastest_path_md:
      "Neither number alone fixes $\\frac{d}{v}$; together, $2 \\times 60 = 120 < 130$ shows the trip beats $2$ hours without any division.",
    trap_map: {
      "0": "Assumes any $130$-mile drive must take more than $2$ hours, importing an unstated speed limit.",
      "1": "Treats the $60$-mph speed as determining the time without knowing the distance.",
      "3": "Believes each statement alone pins down the time because each supplies one clean number.",
      "4": "Concludes a yes/no question requires the exact driving time, missing that $\\frac{130}{60}$ settles the comparison.",
    },
    numeric_check: null,
    check() {
      // Enumerate (distance, speed) pairs on grids; a statement is sufficient
      // iff every allowed pair gives the same yes/no answer to "time > 2".
      const outcomes = (allow) => {
        const set = new Set();
        for (let d = 10; d <= 400; d += 10) {
          for (let v = 10; v <= 120; v += 5) {
            if (!allow(d, v)) continue;
            set.add(d / v > 2);
          }
        }
        return set;
      };
      const suff = (set) => set.size === 1;
      const s1 = outcomes((d) => d === 130);
      const s2 = outcomes((d, v) => v === 60);
      const both = outcomes((d, v) => d === 130 && v === 60);
      return {
        kind: "index",
        index: dsAnswerIndex(suff(s1), suff(s2), suff(both)),
      };
    },
  },

  // ── 8. D3 · PS · pure — "twice as fast", split the combined rate ─────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 3,
    stem_md:
      "Machine $A$ works twice as fast as machine $B$. Working together at their constant rates, machines $A$ and $B$ complete a job in $6$ hours. How many hours would machine $B$, working alone at its constant rate, need to complete the job?",
    choices: ["$3$", "$9$", "$12$", "$18$", "$36$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $B$'s rate be $r$; then $A$'s rate is $2r$, and together $3r = \\dfrac{1}{6}$ job per hour. So $r = \\dfrac{1}{18}$, and machine $B$ alone needs $18$ hours.\n\n**Trigger cue**\nA rate ratio (\"twice as fast\") plus a together time — split the combined rate in the stated ratio before inverting.\n\n**Takeaway**\nSplit the combined rate by the ratio, then invert.",
    fastest_path_md:
      "$B$ does $1$ of every $3$ parts of the work, so alone it needs $3 \\times 6 = 18$ hours.",
    trap_map: {
      "0": "Halves the together time, misreading \"twice as fast\" as finishing in half of the $6$ hours.",
      "1": "Solves for machine $A$, the faster machine, instead of machine $B$.",
      "2": "Doubles the together time, treating $B$ as supplying half of the combined rate rather than a third.",
      "4": "Doubles $B$'s $18$-hour answer, applying the factor of $2$ a second time.",
    },
    numeric_check: "18",
    check() {
      // Forward model: if B alone needs tB hours, A alone needs tB/2 (twice
      // as fast). Work finished in 6 shared hours decreases as tB grows;
      // bisect for the tB that completes exactly one job.
      const workIn6h = (tB) => 6 / (tB / 2) + 6 / tB;
      const tB = bisect((t) => -workIn6h(t), 0.5, 5000, -1);
      return { kind: "value", value: tB };
    },
  },

  // ── 9. D4 · PS · real — return speed for a target round-trip average ─────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 4,
    stem_md:
      "Elena cycled from her home to a lake at an average speed of $12$ miles per hour. At what average speed, in miles per hour, must she cycle back along the same route so that her average speed for the entire round trip is $16$ miles per hour?",
    choices: ["$16$", "$20$", "$24$", "$28$", "$48$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet the one-way distance be $d$ and the return speed $v$. The round trip requires $\\dfrac{2d}{d/12 + d/v} = 16$, so $\\dfrac{1}{12} + \\dfrac{1}{v} = \\dfrac{2}{16} = \\dfrac{1}{8}$. Then $\\dfrac{1}{v} = \\dfrac{1}{8} - \\dfrac{1}{12} = \\dfrac{1}{24}$, giving $v = 24$.\n\n**Trigger cue**\nA target average speed for a round trip with one leg's speed known — average speed lives in the reciprocals, never in the arithmetic mean.\n\n**Takeaway**\nAverage speed sets total time; solve the reciprocal equation.",
    fastest_path_md:
      "Take a $24$-mile route: out takes $2$ hours, and averaging $16$ mph over $48$ miles allows $3$ hours total — so the return's $24$ miles must fit in $1$ hour: $24$ mph.",
    trap_map: {
      "0": "Assumes riding the return leg at the desired $16$-mph average produces that average.",
      "1": "Picks the speed whose arithmetic mean with $12$ is $16$.",
      "3": "Adds the outbound speed and the target average.",
      "4": "Forgets the round trip doubles the distance, solving $\\frac{1}{v} = \\frac{1}{12} - \\frac{1}{16} = \\frac{1}{48}$.",
    },
    numeric_check: "24",
    check() {
      // Scan return speeds on a 0.01 grid; for each, compute the round-trip
      // average as total distance over total time at two different route
      // lengths, and demand both hit 16.
      const found = [];
      for (let i = 1; i <= 20000; i++) {
        const v = i / 100;
        let ok = true;
        for (const d of [1, 7]) {
          const avg = (2 * d) / (d / 12 + d / v);
          if (Math.abs(avg - 16) > 1e-6) ok = false;
        }
        if (ok) found.push(v);
      }
      if (found.length !== 1) throw new Error(`expected unique speed, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 10. D4 · PS · real — reinforcement mid-job, worker-day budget ────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 4,
    stem_md:
      "Working at the same constant rate, $12$ workers can complete a renovation in $20$ days. The $12$ workers work on the renovation for $8$ days, and then $4$ additional workers, each working at that same constant rate, join them until the renovation is complete. The renovation is completed how many days after work began?",
    choices: ["$9$", "$15$", "$17$", "$20$", "$24$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe job is $12 \\times 20 = 240$ worker-days. The first $8$ days spend $8 \\times 12 = 96$ worker-days, leaving $144$. The enlarged crew of $16$ finishes those in $\\dfrac{144}{16} = 9$ days, so the renovation ends $8 + 9 = 17$ days after work began.\n\n**Trigger cue**\nA crew that changes size partway through a job — fix the total worker-day budget, then spend it phase by phase.\n\n**Takeaway**\nBudget worker-days, spend them phase by phase.",
    fastest_path_md:
      "The $12$ remaining scheduled days shrink by the crew ratio: $12 \\times \\frac{12}{16} = 9$, so $8 + 9 = 17$.",
    trap_map: {
      "0": "Counts only the $9$ days worked after the extra workers arrive.",
      "1": "Staffs the entire job with $16$ workers from day one: $\\frac{240}{16} = 15$.",
      "3": "Ignores the $4$ extra workers and keeps the original $20$-day schedule.",
      "4": "Scales the remaining $12$ days up by $\\frac{16}{12}$ instead of down, getting $8 + 16 = 24$.",
    },
    numeric_check: "17",
    check() {
      // Day-by-day simulation: 1 unit per worker per day, job = 12 * 20 units.
      const totalUnits = 12 * 20;
      let day = 0;
      let done = 0;
      while (done < totalUnits) {
        day++;
        done += day <= 8 ? 12 : 12 + 4;
      }
      if (done !== totalUnits) throw new Error("job does not end on a day boundary");
      return { kind: "value", value: day };
    },
  },

  // ── 11. D4 · DS · real — filled in under 3 hours? threshold rate (B) ─────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 4,
    stem_md:
      "Working alone at its constant rate, pump $X$ can fill a certain empty tank with $6{,}000$ liters of water in $4$ hours. Pumps $X$ and $Y$, working together at their constant rates, filled the empty tank. Was the tank filled in less than $3$ hours?\n\n(1) Pump $Y$'s constant rate is less than $2{,}000$ liters per hour.\n\n(2) Pump $Y$'s constant rate is greater than $1{,}000$ liters per hour.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\nPump $X$'s rate is $\\dfrac{6000}{4} = 1500$ liters per hour. Filling in less than $3$ hours requires a combined rate above $\\dfrac{6000}{3} = 2000$, i.e., pump $Y$'s rate above $500$ liters per hour.\n\nStatement (1): $Y$ could be $1{,}900$ (fills in less than $3$ hours — yes) or $200$ (combined $1{,}700$, about $3.5$ hours — no). Not sufficient.\n\nStatement (2): $Y > 1000$ forces a combined rate above $2{,}500$, so the fill takes less than $2.4$ hours — always yes. Sufficient.\n\nAnswer (B).\n\n**Trigger cue**\nA yes/no filling-time question with inequality statements about a rate — locate the break-even rate first, then see which bound clears it.\n\n**Takeaway**\nFind the threshold rate; only bounds that clear it decide.",
    fastest_path_md:
      "Beating $3$ hours needs a combined $2{,}000$ L/h, i.e., $Y > 500$. Statement (2)'s floor of $1{,}000$ clears that threshold; statement (1)'s ceiling of $2{,}000$ decides nothing.",
    trap_map: {
      "0": "Treats statement (1)'s ceiling on pump $Y$'s rate as if it were a floor guaranteeing a fast fill.",
      "2": "Combines out of habit, not noticing statement (2) alone already pushes the combined rate past $2{,}000$ liters per hour.",
      "3": "Accepts statement (1) without testing a slow pump $Y$, such as $200$ liters per hour, which stretches the fill past $3$ hours.",
      "4": "Never converts the $3$-hour question into a threshold rate, so neither bound seems decisive.",
    },
    numeric_check: null,
    check() {
      // Enumerate pump Y rates (L/h) and collect yes/no outcomes for
      // "fill time < 3 h" under each statement's filter.
      const xRate = 6000 / 4;
      const outcomes = (allow) => {
        const set = new Set();
        for (let y = 1; y <= 10000; y++) {
          if (!allow(y)) continue;
          set.add(6000 / (xRate + y) < 3);
        }
        return set;
      };
      const suff = (set) => set.size === 1;
      const s1 = outcomes((y) => y < 2000);
      const s2 = outcomes((y) => y > 1000);
      const both = outcomes((y) => y < 2000 && y > 1000);
      return {
        kind: "index",
        index: dsAnswerIndex(suff(s1), suff(s2), suff(both)),
      };
    },
  },

  // ── 12. D4 · PS · real — one-way distance in terms of u, v, T ────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 4,
    stem_md:
      "A hiker walked from a trailhead to a summit at a constant speed of $u$ miles per hour and returned along the same trail at a constant speed of $v$ miles per hour. If the round trip took a total of $T$ hours, what is the distance, in miles, from the trailhead to the summit, in terms of $u$, $v$, and $T$?",
    choices: [
      "$\\dfrac{Tuv}{u+v}$",
      "$\\dfrac{2Tuv}{u+v}$",
      "$\\dfrac{T(u+v)}{2}$",
      "$\\dfrac{T(u+v)}{4}$",
      "$\\dfrac{T(u+v)}{uv}$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\nWith one-way distance $d$, the legs take $\\dfrac{d}{u}$ and $\\dfrac{d}{v}$ hours, so $\\dfrac{d}{u} + \\dfrac{d}{v} = T$. Factoring, $d \\cdot \\dfrac{u+v}{uv} = T$, hence $d = \\dfrac{Tuv}{u+v}$.\n\n**Trigger cue**\nA round trip at two speeds with total time in variables — write each leg's time over its own speed and add; the harmonic form appears by itself.\n\n**Takeaway**\nAdd leg times $\\frac{d}{u}+\\frac{d}{v}$ and solve for $d$.",
    fastest_path_md:
      "Plug $u = 6$, $v = 3$, $T = 1$: legs of $\\frac{1}{3}$ and $\\frac{2}{3}$ hour fit $d = 2$ miles, and only $\\dfrac{Tuv}{u+v}$ returns $2$.",
    trap_map: {
      "1": "Computes the full round-trip distance, forgetting to halve for one way.",
      "2": "Multiplies the arithmetic mean of the speeds by the whole time.",
      "3": "Halves the arithmetic-mean result, still using the wrong average speed.",
      "4": "Inverts the harmonic combination, dividing the speed sum by the product.",
    },
    numeric_check: null,
    check() {
      // For sample (u, v, T) triples, brute-force the distance on a 0.01 grid
      // from the raw condition d/u + d/v = T, then find the unique matching
      // candidate expression across all samples.
      const samples = [
        [3, 6, 3],
        [4, 12, 2],
        [5, 20, 1],
      ];
      const cands = [
        (u, v, T) => (T * u * v) / (u + v),
        (u, v, T) => (2 * T * u * v) / (u + v),
        (u, v, T) => (T * (u + v)) / 2,
        (u, v, T) => (T * (u + v)) / 4,
        (u, v, T) => (T * (u + v)) / (u * v),
      ];
      const ok = cands.map(() => true);
      for (const [u, v, T] of samples) {
        const found = [];
        for (let j = 1; j <= 100000; j++) {
          const d = j / 100;
          if (Math.abs(d / u + d / v - T) < 1e-9) found.push(d);
        }
        if (found.length !== 1) throw new Error(`expected unique distance for u=${u}, v=${v}, T=${T}`);
        cands.forEach((f, i) => {
          if (Math.abs(f(u, v, T) - found[0]) > 1e-6) ok[i] = false;
        });
      }
      const matches = ok.flatMap((v2, i) => (v2 ? [i] : []));
      if (matches.length !== 1) throw new Error(`expected one matching expression, got ${matches.length}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 13. D5 · PS · pure — extra-hours structure, t = sqrt(4*9) ────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "Working together at their constant rates from start to finish, printers $A$ and $B$ complete a print job in $t$ hours. Working alone at its constant rate, printer $A$ would need $4$ hours more than $t$ to complete the job, and printer $B$ working alone would need $9$ hours more than $t$. What is the value of $t$?",
    choices: ["$\\frac{36}{13}$", "$5$", "$6$", "$6.5$", "$13$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe solo times are $t + 4$ and $t + 9$, so $\\dfrac{1}{t+4} + \\dfrac{1}{t+9} = \\dfrac{1}{t}$. Multiplying through by $t(t+4)(t+9)$: $t(t+9) + t(t+4) = (t+4)(t+9)$, i.e., $2t^2 + 13t = t^2 + 13t + 36$, so $t^2 = 36$ and $t = 6$. Check: solo times $10$ and $15$ give $\\dfrac{1}{10} + \\dfrac{1}{15} = \\dfrac{1}{6}$.\n\n**Trigger cue**\nEach worker's solo time stated as \"so many hours more than the together time\" — set up the reciprocal equation; the linear terms cancel.\n\n**Takeaway**\nTogether time equals the geometric mean of the extra times.",
    fastest_path_md:
      "Structural shortcut: $t = \\sqrt{4 \\cdot 9} = 6$; confirm in seconds via $\\frac{1}{10} + \\frac{1}{15} = \\frac{1}{6}$.",
    trap_map: {
      "0": "Treats $4$ and $9$ as the solo times themselves and combines those rates: $\\frac{36}{13}$.",
      "1": "Subtracts the extra hours: $9 - 4 = 5$.",
      "3": "Averages the extra hours: $\\frac{4 + 9}{2} = 6.5$.",
      "4": "Adds the extra hours: $4 + 9 = 13$.",
    },
    numeric_check: "6",
    check() {
      // Forward model: in t hours, machines with solo times (t+4) and (t+9)
      // complete t/(t+4) + t/(t+9) of the job — monotone increasing in t.
      // Bisect for exactly one full job.
      const workTogether = (t) => t / (t + 4) + t / (t + 9);
      const t = bisect(workTogether, 0.001, 1000, 1);
      return { kind: "value", value: t };
    },
  },

  // ── 14. D5 · PS · real — alternating one-hour shifts ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "Pump $A$, working alone at its constant rate, can fill an empty tank in $4$ hours, and pump $B$, working alone at its constant rate, can fill the same tank in $6$ hours. The pumps are run in alternating one-hour shifts — pump $A$ runs the first hour, pump $B$ the second hour, pump $A$ the third hour, and so on — until the tank is full. How many hours after pump $A$ starts is the tank full?",
    choices: ["$2\\frac{2}{5}$", "$4\\frac{2}{5}$", "$4\\frac{2}{3}$", "$4\\frac{4}{5}$", "$5$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nPump $A$ fills $\\dfrac{1}{4}$ per hour and pump $B$ fills $\\dfrac{1}{6}$. Each two-hour cycle adds $\\dfrac{1}{4} + \\dfrac{1}{6} = \\dfrac{5}{12}$, so after $4$ hours the tank holds $\\dfrac{10}{12} = \\dfrac{5}{6}$. The fifth hour belongs to pump $A$: the remaining $\\dfrac{1}{6}$ at rate $\\dfrac{1}{4}$ takes $\\dfrac{1/6}{1/4} = \\dfrac{2}{3}$ hour. Total: $4\\frac{2}{3}$ hours.\n\n**Trigger cue**\nWorkers alternating fixed shifts rather than running simultaneously — batch complete cycles, then finish the last stretch at the on-duty worker's own rate.\n\n**Takeaway**\nBatch full cycles; the finisher's own rate ends the job.",
    fastest_path_md:
      "Use a $12$-unit tank: $A$ adds $3$ per hour, $B$ adds $2$, so the hours run $3, 2, 3, 2$ — $10$ units by hour four — and $A$ delivers the last $2$ units in $\\frac{2}{3}$ hour.",
    trap_map: {
      "0": "Runs both pumps simultaneously the whole time: $1 \\div \\left(\\frac{1}{4} + \\frac{1}{6}\\right) = 2\\frac{2}{5}$.",
      "1": "Finishes the last sixth of the tank at the combined rate instead of pump $A$'s alone.",
      "3": "Applies the two-hour-cycle average rate of $\\frac{5}{24}$ to the entire job, including the final stretch: $\\frac{24}{5}$ hours.",
      "4": "Starts the alternation with pump $B$, whose slower final shift stretches the finish to exactly $5$ hours.",
    },
    numeric_check: "14/3",
    check() {
      // Forward accumulation: water present at time T, walking hour-by-hour
      // through the shift schedule (even-indexed hours are A's). Monotone
      // increasing, so bisect for a full tank.
      const filled = (T) => {
        let w = 0;
        let h = 0;
        while (h + 1 <= T) {
          w += h % 2 === 0 ? 1 / 4 : 1 / 6;
          h++;
        }
        return w + (T - h) * (h % 2 === 0 ? 1 / 4 : 1 / 6);
      };
      const T = bisect(filled, 0, 12, 1);
      return { kind: "value", value: T };
    },
  },

  // ── 15. D5 · DS · real — fixed combined speed transfers a bound (A) ──────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "Trains $X$ and $Y$ departed at the same time from two stations $250$ miles apart and traveled toward each other along parallel straight tracks, each at its own constant speed, until they passed each other exactly $2$ hours after departing. Was train $X$'s speed greater than $70$ miles per hour?\n\n(1) Train $Y$'s speed was less than $55$ miles per hour.\n\n(2) Train $X$ traveled more than $130$ miles before the trains passed each other.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nClosing $250$ miles in $2$ hours fixes the combined speed: $x + y = 125$ miles per hour.\n\nStatement (1): $y < 55$ forces $x = 125 - y > 70$ — a definite yes. Sufficient.\n\nStatement (2): $2x > 130$ gives only $x > 65$; $x = 66$ answers no while $x = 80$ answers yes. Not sufficient.\n\nAnswer (A).\n\n**Trigger cue**\nOpposite-direction travelers with a given meeting time — the stem fixes the sum of the speeds, so any bound on one traveler converts exactly into a bound on the other.\n\n**Takeaway**\nA fixed sum turns bounds on one speed into the other.",
    fastest_path_md:
      "The stem locks $x + y = \\frac{250}{2} = 125$, so \"$y < 55$\" *is* \"$x > 70$\" restated — (1) answers the question by itself, while (2) only forces $x > 65$.",
    trap_map: {
      "1": "Reads statement (2)'s \"more than half the distance\" as fast enough, though it only forces $x > 65$.",
      "2": "Misses that the fixed combined speed of $125$ converts statement (1) into a bound on train $X$, so combines unnecessarily.",
      "3": "Assumes both statements give equivalent bounds, but statement (2)'s stops at $65$ miles per hour.",
      "4": "Never extracts the combined speed from the stem, so neither one-sided bound seems usable.",
    },
    numeric_check: null,
    check() {
      // Enumerate X's speed on an exact 0.25-mph grid; the stem pins
      // Y = 125 - X. Collect yes/no outcomes for "X > 70" under each filter.
      const outcomes = (allow) => {
        const set = new Set();
        for (let i = 1; i < 500; i++) {
          const x = i * 0.25;
          const y = 250 / 2 - x;
          if (y <= 0) continue;
          if (!allow(x, y)) continue;
          set.add(x > 70);
        }
        return set;
      };
      const suff = (set) => set.size === 1;
      const s1 = outcomes((x, y) => y < 55);
      const s2 = outcomes((x) => 2 * x > 130);
      const both = outcomes((x, y) => y < 55 && 2 * x > 130);
      return {
        kind: "index",
        index: dsAnswerIndex(suff(s1), suff(s2), suff(both)),
      };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
