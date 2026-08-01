/**
 * Quality pass, batch 2 — 12 new D5 items across two rates_ratio_percent
 * subtopics: 6 mixtures_weighted_avg (10 → 16) and 6 rates_speed_work
 * (10 → 16).
 *
 * Both gates on every item: an independent check() and a trap_values()
 * that computes each distractor from its named error.
 *
 * Run: node --experimental-strip-types scripts/author/batch-q5-mixtures-rates.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ══ mixtures_weighted_avg ═══════════════════════════════════════════════

  // ── 1. drain-and-replace with a stronger solution ───────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A $40$-liter tank holds a solution that is $25\\%$ acid. Some of the solution is drained off and replaced with an equal volume of a $75\\%$ acid solution, and the tank — again full at $40$ liters — is now $40\\%$ acid. How many liters were drained off?",
    choices: ["$8$", "$10$", "$12$", "$16$", "$28$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $x$ be the liters drained. The tank starts with $0.25(40) = 10$ liters of acid; draining $x$ liters removes $0.25x$ of it, and the replacement adds $0.75x$. The final acid is $10 - 0.25x + 0.75x = 10 + 0.5x$, and it must equal $0.40(40) = 16$. So $0.5x = 6$ and $x = 12$.\n\n**Trigger cue**\n\"Drained off and replaced\" — the drained liquid carries away its own concentration, so the net change per liter swapped is the *difference* of the two concentrations, not the incoming one.\n\n**Takeaway**\nSwapping liquid changes acid by the concentration gap per liter.",
    fastest_path_md:
      "Each liter swapped raises the acid by $0.75 - 0.25 = 0.5$ liters. The tank needs $16 - 10 = 6$ more liters of acid, so $6/0.5 = 12$ liters were swapped.",
    trap_map: {
      "0": "Forgets that the drained liquid carries acid out, adding only the incoming acid: $10 + 0.75x = 16$ gives $x = 8$.",
      "1": "Answers with the tank's starting acid content, $0.25 \\times 40 = 10$ liters.",
      "3": "Answers with the tank's final acid content, $0.40 \\times 40 = 16$ liters.",
      "4": "Runs the alligation lever backwards — the distances $40-25=15$ and $75-40=35$ give a new-to-old ratio of $15:35$, so the swapped share is $\\tfrac{15}{50}$ of the tank, but taking $\\tfrac{35}{50}$ gives $28$.",
    },
    numeric_check: "(0.40*40 - 0.25*40)/(0.75 - 0.25)",
    check() {
      // Scan swap volumes in centiliters and rebuild the acid balance.
      const found = [];
      for (let cl = 1; cl <= 4000; cl++) {
        const x = cl / 100;
        const acid = 0.25 * 40 - 0.25 * x + 0.75 * x;
        if (Math.abs(acid - 0.4 * 40) < 1e-9) found.push(x);
      }
      if (found.length !== 1) throw new Error(`expected one volume, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": (0.4 * 40 - 0.25 * 40) / 0.75,
        "1": 0.25 * 40,
        "3": 0.4 * 40,
        "4": 40 * (35 / 50),
      };
    },
  },

  // ── 2. add a stronger solution, then boil off water ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A chemist has $12$ liters of a $30\\%$ alcohol solution. She adds enough of a $60\\%$ alcohol solution to bring the mixture to exactly $45\\%$ alcohol. She then boils the mixture, evaporating water only, until it is $60\\%$ alcohol. How many liters of water did she evaporate?",
    choices: ["$3.6$", "$6$", "$10.8$", "$12$", "$18$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nStage one: adding $x$ liters of the $60\\%$ solution gives $0.30(12) + 0.60x = 0.45(12 + x)$, so $3.6 + 0.6x = 5.4 + 0.45x$, hence $0.15x = 1.8$ and $x = 12$. The mixture is now $24$ liters holding $0.45(24) = 10.8$ liters of alcohol.\n\nStage two: evaporation removes water only, so the $10.8$ liters of alcohol is fixed. If the final volume is $V$, then $10.8/V = 0.60$, so $V = 18$ and the water lost is $24 - 18 = 6$ liters.\n\n**Trigger cue**\nEvaporation or boiling in a mixture problem — the solute is conserved, so hold its amount fixed and solve for the new total volume.\n\n**Takeaway**\nEvaporating water fixes the solute; solve for the new volume.",
    fastest_path_md:
      "Alligation on stage one: $45$ sits $15$ from $30$ and $15$ from $60$, so equal parts — add $12$ liters, giving $24$ liters with $10.8$ of alcohol. At $60\\%$ that alcohol needs $18$ liters, so $6$ liters boiled away.",
    trap_map: {
      "0": "Answers with the starting alcohol content, $0.30 \\times 12 = 3.6$ liters.",
      "2": "Answers with the alcohol in the mixture, $0.45 \\times 24 = 10.8$ liters, rather than the water removed.",
      "3": "Answers with the liters of $60\\%$ solution added — the stage-one result — instead of the water evaporated.",
      "4": "Answers with the final volume $18$ liters instead of the $24 - 18 = 6$ liters removed.",
    },
    numeric_check: "24 - 10.8/0.60",
    check() {
      // Stage one by scan, stage two by scan — neither reuses the algebra.
      let added = null;
      for (let cl = 1; cl <= 10000; cl++) {
        const x = cl / 100;
        if (Math.abs(0.3 * 12 + 0.6 * x - 0.45 * (12 + x)) < 1e-9) {
          if (added != null) throw new Error("stage one not unique");
          added = x;
        }
      }
      if (added == null) throw new Error("stage one has no solution");
      const volume = 12 + added;
      const alcohol = 0.45 * volume;
      for (let cl = 1; cl <= volume * 100; cl++) {
        const water = cl / 100;
        if (Math.abs(alcohol / (volume - water) - 0.6) < 1e-9) {
          return { kind: "value", value: water };
        }
      }
      throw new Error("stage two has no solution");
    },
    trap_values() {
      return { "0": 0.3 * 12, "2": 0.45 * 24, "3": 12, "4": 10.8 / 0.6 };
    },
  },

  // ── 3. weighted average solved back to a group size ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A firm employs $30$ engineers whose salaries average $\\$96{,}000$, and some number of technicians whose salaries average $\\$60{,}000$. Across all employees, the average salary is $\\$84{,}000$. How many technicians does the firm employ?",
    choices: ["$15$", "$30$", "$45$", "$60$", "$90$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nEvery engineer sits $96 - 84 = 12$ (thousand) above the overall average, contributing $30 \\times 12 = 360$ of surplus. Every technician sits $84 - 60 = 24$ below it. The two must cancel exactly, so $24t = 360$ and $t = 15$.\n\n**Trigger cue**\nTwo groups, three averages, one unknown count — use the lever: distance from the overall average times group size must balance on both sides.\n\n**Takeaway**\nGroup size times distance from the mean balances on both sides.",
    fastest_path_md:
      "The gaps are $12$ above and $24$ below, a $1:2$ lever, so the group sitting twice as far away is half the size: $30/2 = 15$ technicians.",
    trap_map: {
      "1": "Divides the engineers' surplus by the engineers' own gap instead of the technicians': $360/12 = 30$.",
      "2": "Answers with the total headcount $30 + 15 = 45$ rather than the technician count.",
      "3": "Runs the lever upside down, multiplying by the ratio of gaps instead of dividing: $30 \\times 24/12 = 60$.",
      "4": "Runs the lever upside down and then reports the resulting total headcount, $30 + 60 = 90$.",
    },
    numeric_check: "30*(96-84)/(84-60)",
    check() {
      // Test every plausible technician count against the real average.
      const found = [];
      for (let t = 1; t <= 500; t++) {
        const total = (30 * 96000 + t * 60000) / (30 + t);
        if (Math.abs(total - 84000) < 1e-9) found.push(t);
      }
      if (found.length !== 1) throw new Error(`expected one count, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "1": (30 * (96 - 84)) / (96 - 84),
        "2": 30 + 15,
        "3": (30 * (84 - 60)) / (96 - 84),
        "4": 30 + 60,
      };
    },
  },

  // ── 4. successive dilution ──────────────────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A $60$-liter vat is full of pure syrup. Fifteen liters are drawn off and replaced with water, and the vat is stirred thoroughly. Fifteen liters of the resulting mixture are then drawn off and again replaced with water. How many liters of syrup are in the vat at the end?",
    choices: ["$26.25$", "$30$", "$33.75$", "$45$", "$48.75$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nEach round removes a quarter of whatever is in the vat and replaces it with water, so the syrup is multiplied by $1 - \\tfrac{15}{60} = \\tfrac{3}{4}$ each time. After two rounds the syrup is $60 \\left(\\tfrac{3}{4}\\right)^2 = 60 \\times \\tfrac{9}{16} = 33.75$ liters.\n\n**Trigger cue**\nRepeated draw-and-replace on a fixed volume — the retained fraction multiplies, so the answer is $V(1 - k/V)^n$, never a repeated subtraction.\n\n**Takeaway**\nRepeated dilution multiplies the retained fraction; it never subtracts twice.",
    fastest_path_md:
      "Each round keeps $\\tfrac{3}{4}$ of the syrup: $60 \\to 45 \\to 33.75$.",
    trap_map: {
      "0": "Answers with the water in the vat, $60 - 33.75 = 26.25$ liters, instead of the syrup.",
      "1": "Subtracts $15$ liters of syrup twice, as if the second draw were also pure syrup: $60 - 15 - 15 = 30$.",
      "3": "Stops after one round: $60 \\times \\tfrac{3}{4} = 45$.",
      "4": "Counts only the syrup lost in the second draw ($\\tfrac{3}{4} \\times 15 = 11.25$) and subtracts it from the full vat: $60 - 11.25 = 48.75$.",
    },
    numeric_check: "60*(1 - 15/60)^2",
    check() {
      // Simulate the two rounds on the actual syrup volume.
      let syrup = 60;
      for (let round = 0; round < 2; round++) {
        syrup -= (syrup / 60) * 15; // the draw carries syrup in proportion
      }
      return { kind: "value", value: syrup };
    },
    trap_values() {
      return {
        "0": 60 - 60 * (3 / 4) ** 2,
        "1": 60 - 15 - 15,
        "3": 60 * (3 / 4),
        "4": 60 - (3 / 4) * 15,
      };
    },
  },

  // ── 5. a correction that moves a mean ───────────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A class of $25$ students has a mean test score of $68$. The $10$ students who attended the review session had a mean of $82$. The teacher then finds that one student who did not attend the review session was recorded as $40$ when the correct score was $70$. What is the corrected mean for the whole class?",
    choices: ["$66.8$", "$68$", "$69.2$", "$70$", "$71$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe class total was $25 \\times 68 = 1700$. Correcting one score from $40$ to $70$ adds $30$ to that total, giving $1730$, so the corrected mean is $1730/25 = 69.2$. The review-session figure is irrelevant: the correction lands in the class total whichever subgroup the student belongs to, and the class size does not change.\n\n**Trigger cue**\nA single score corrected inside a known mean — work with totals: change the sum by the difference and divide by the unchanged count.\n\n**Takeaway**\nCorrect the sum, not the mean; divide by the whole count.",
    fastest_path_md:
      "The total rises by $70 - 40 = 30$ across $25$ students, so the mean rises by $30/25 = 1.2$: $68 + 1.2 = 69.2$.",
    trap_map: {
      "0": "Flips the sign of the correction, treating $40$ as the true score and $70$ as the error: $68 - 30/25 = 66.8$.",
      "1": "Assumes a single $30$-point correction cannot move a $25$-student mean and leaves it at $68$.",
      "3": "Spreads the correction over only the $15$ students who missed the review: $68 + 30/15 = 70$.",
      "4": "Spreads the correction over the $10$ review-session students: $68 + 30/10 = 71$.",
    },
    numeric_check: "(25*68 + (70 - 40))/25",
    check() {
      // Build a concrete roster that matches every stated statistic, then
      // recompute the mean after fixing the one score.
      const attendees = Array.from({ length: 10 }, () => 82);
      const othersTotal = 25 * 68 - 10 * 82; // 1700 - 820 = 880 over 15
      const others = Array.from({ length: 15 }, () => 0);
      others[0] = 40; // the misrecorded score
      const rest = othersTotal - 40;
      for (let i = 1; i < 15; i++) others[i] = rest / 14;
      const roster = [...attendees, ...others];
      if (Math.abs(roster.reduce((s, v) => s + v, 0) / 25 - 68) > 1e-9)
        throw new Error("roster does not reproduce the stated mean");
      roster[10] = 70;
      return { kind: "value", value: roster.reduce((s, v) => s + v, 0) / 25 };
    },
    trap_values() {
      return { "0": 68 - 30 / 25, "1": 68, "3": 68 + 30 / 15, "4": 68 + 30 / 10 };
    },
  },

  // ── 6. three-component blend under a ratio constraint ───────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 5,
    stem_md:
      "A roaster blends three coffees costing $\\$8$, $\\$11$, and $\\$20$ per pound. The blend contains twice as many pounds of the $\\$8$ coffee as of the $\\$11$ coffee, and the finished blend costs $\\$12$ per pound. What fraction of the blend, by weight, is the $\\$20$ coffee?",
    choices: [
      "$\\frac{3}{11}$",
      "$\\frac{5}{21}$",
      "$\\frac{8}{33}$",
      "$\\frac{16}{33}$",
      "$\\frac{9}{8}$",
    ],
    correct_index: 0,
    solution_md:
      "**Formal path**\nLet the $\\$11$ coffee weigh $a$ pounds; then the $\\$8$ coffee weighs $2a$ and the $\\$20$ coffee weighs $c$. Total cost: $8(2a) + 11a + 20c = 27a + 20c$, over a total weight of $3a + c$. Setting the blend price to $\\$12$: $27a + 20c = 12(3a + c) = 36a + 12c$, so $8c = 9a$ and $c = \\tfrac{9}{8}a$. The $\\$20$ share is $\\dfrac{c}{3a + c} = \\dfrac{9/8}{3 + 9/8} = \\dfrac{9}{33} = \\dfrac{3}{11}$.\n\n**Trigger cue**\nThree components with one internal ratio — name the tied pair with a single letter, leave the free component as its own, and the blend price gives one equation in two unknowns whose *ratio* is all you need.\n\n**Takeaway**\nA blend fraction needs the ratio, never the actual weights.",
    fastest_path_md:
      "The tied pair averages $\\dfrac{2(8) + 11}{3} = \\$9$ per pound. Now it is a two-way blend of $\\$9$ and $\\$20$ landing at $\\$12$: distances $3$ and $8$, so the $\\$20$ share is $\\tfrac{3}{11}$.",
    trap_map: {
      "1": "Reads the ratio as equal parts of the two cheap coffees rather than $2:1$, blending $\\$8$ and $\\$11$ to $\\$9.50$ and landing on $\\tfrac{5}{21}$.",
      "2": "Answers with the $\\$11$ coffee's share of the blend, $\\tfrac{8}{33}$.",
      "3": "Answers with the $\\$8$ coffee's share of the blend, $\\tfrac{16}{33}$.",
      "4": "Answers with the ratio of $\\$20$ coffee to $\\$11$ coffee, $\\tfrac{9}{8}$, instead of its share of the whole blend.",
    },
    numeric_check: "(9/8)/(3 + 9/8)",
    check() {
      // Search integer pound counts satisfying every stated condition.
      const hits = new Set();
      for (let a = 1; a <= 200; a++) {
        for (let c8 = 1; c8 <= 400; c8++) {
          if (c8 !== 2 * a) continue;
          for (let twenty = 1; twenty <= 400; twenty++) {
            const weight = c8 + a + twenty;
            const cost = 8 * c8 + 11 * a + 20 * twenty;
            if (Math.abs(cost - 12 * weight) < 1e-9) hits.add(twenty / weight);
          }
        }
      }
      if (hits.size !== 1) throw new Error(`expected one fraction, found ${hits.size}`);
      return { kind: "value", value: [...hits][0] };
    },
    trap_values() {
      // Equal parts of the two cheap coffees: blend 9.5 with 20 to hit 12.
      const equalParts = (12 - 9.5) / (20 - 9.5);
      return { "1": equalParts, "2": 8 / 33, "3": 16 / 33, "4": 9 / 8 };
    },
  },

  // ══ rates_speed_work ════════════════════════════════════════════════════

  // ── 7. out-and-back with a stated time gap ──────────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "A cyclist rides from town A to town B at a steady $15$ kilometers per hour and returns along the same road at a steady $10$ kilometers per hour. The return ride takes $30$ minutes longer than the outbound ride. How many kilometers apart are the two towns?",
    choices: ["$3$", "$6$", "$15$", "$30$", "$900$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $d$ be the one-way distance in kilometers. The times are $d/15$ and $d/10$ hours, and $30$ minutes is $\\tfrac12$ hour, so $\\dfrac{d}{10} - \\dfrac{d}{15} = \\dfrac12$. Over the common denominator $30$: $\\dfrac{3d - 2d}{30} = \\dfrac{d}{30} = \\dfrac12$, so $d = 15$.\n\n**Trigger cue**\nSame distance, two speeds, a stated *difference* in time — subtract the two time expressions; the distance factors straight out.\n\n**Takeaway**\nEqual distances, different speeds: subtract times, not speeds.",
    fastest_path_md:
      "The time gap for a distance $d$ is $d\\left(\\tfrac{1}{10} - \\tfrac{1}{15}\\right) = \\tfrac{d}{30}$ hours. Set $\\tfrac{d}{30} = \\tfrac12$: $d = 15$.",
    trap_map: {
      "0": "Adds the speeds where the setup subtracts, using $\\dfrac{(0.5)(15)(10)}{15+10} = 3$.",
      "1": "Multiplies the round-trip harmonic-mean speed $12$ by the half hour: $12 \\times 0.5 = 6$.",
      "3": "Answers with the round-trip distance $2 \\times 15 = 30$ instead of the separation.",
      "4": "Leaves the $30$ minutes in minutes, solving $d/30 = 30$ for $d = 900$.",
    },
    numeric_check: "0.5*15*10/(15-10)",
    check() {
      // Scan distances in 10-meter steps; keep those with a half-hour gap.
      const found = [];
      for (let dm = 1; dm <= 100_000; dm++) {
        const d = dm / 100;
        if (Math.abs(d / 10 - d / 15 - 0.5) < 1e-9) found.push(d);
      }
      if (found.length !== 1) throw new Error(`expected one distance, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": (0.5 * 15 * 10) / (15 + 10),
        "1": ((2 * 15 * 10) / (15 + 10)) * 0.5,
        "3": 2 * 15,
        "4": 30 * 30,
      };
    },
  },

  // ── 8. two fills and a drain, with the drain closed partway ─────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "Pipe A alone fills an empty tank in $12$ hours and pipe B alone fills it in $18$ hours, while an open drain C alone empties a full tank in $24$ hours. Starting with the tank empty, all three are opened together. Exactly $4$ hours later the drain is closed and the two pipes continue. How many additional hours are needed to fill the tank?",
    choices: [
      "$3.2$",
      "$4.4$",
      "$\\frac{44}{7}$",
      "$\\frac{22}{3}$",
      "$8.4$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nWork in $72$ths of a tank per hour: A contributes $6$, B contributes $4$, C removes $3$. With all three open the net rate is $7/72$ per hour, so after $4$ hours the tank holds $28/72$. That leaves $44/72$. With the drain closed the rate is $10/72$ per hour, so the remaining time is $\\dfrac{44/72}{10/72} = \\dfrac{44}{10} = 4.4$ hours.\n\n**Trigger cue**\nA rate that changes partway through — split the job at the change, compute what is done in the first stretch, and divide the remainder by the new rate.\n\n**Takeaway**\nWhen a rate changes, split the job, never the average.",
    fastest_path_md:
      "In $72$ths per hour: $6 + 4 - 3 = 7$ for four hours fills $28$; $72 - 28 = 44$ remains at $6 + 4 = 10$ per hour, so $4.4$ hours.",
    trap_map: {
      "0": "Leaves the drain out of the first four hours too, filling $40/72$ and needing only $\\dfrac{32/72}{10/72} = 3.2$ hours.",
      "2": "Leaves the drain open for the rest of the fill: $\\dfrac{44/72}{7/72} = \\dfrac{44}{7}$ hours.",
      "3": "Finishes with pipe A alone after the drain closes: $\\dfrac{44/72}{6/72} = \\dfrac{22}{3}$ hours.",
      "4": "Answers with the total elapsed time $4 + 4.4 = 8.4$ hours rather than the additional hours.",
    },
    numeric_check: "(1 - 4*(1/12 + 1/18 - 1/24))/(1/12 + 1/18)",
    check() {
      // Integrate the fill in one-second steps; no rate algebra reused.
      const step = 1 / 3600;
      let filled = 0;
      let hours = 0;
      while (filled < 1 && hours < 100) {
        const rate =
          hours < 4 - 1e-12
            ? 1 / 12 + 1 / 18 - 1 / 24
            : 1 / 12 + 1 / 18;
        filled += rate * step;
        hours += step;
      }
      // Round to the nearest second to shed accumulated float drift.
      return { kind: "value", value: Math.round((hours - 4) * 3600) / 3600 };
    },
    trap_values() {
      const bothOnly = 1 / 12 + 1 / 18;
      const allThree = 1 / 12 + 1 / 18 - 1 / 24;
      return {
        "0": (1 - 4 * bothOnly) / bothOnly,
        "2": (1 - 4 * allThree) / allThree,
        "3": (1 - 4 * allThree) / (1 / 12),
        "4": 4 + (1 - 4 * allThree) / bothOnly,
      };
    },
  },

  // ── 9. a head start closed at the difference of speeds ──────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "At $8{:}00$ a freight train leaves a station travelling east at a constant $45$ kilometers per hour. At $10{:}30$ an express leaves the same station on a parallel track, also travelling east, at a constant $75$ kilometers per hour. At what time does the express draw level with the freight?",
    choices: ["$11{:}45$", "$12{:}00$", "$13{:}00$", "$14{:}15$", "$16{:}45$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nBy $10{:}30$ the freight has been running $2.5$ hours at $45$ km/h, so it is $112.5$ km ahead. From then on the gap closes at $75 - 45 = 30$ km/h, so it takes $112.5/30 = 3.75$ hours — three hours and forty-five minutes. Adding that to $10{:}30$ gives $14{:}15$.\n\n**Trigger cue**\nSame direction, later start — the head start is closed at the *difference* of the speeds, and the clock starts at the later departure.\n\n**Takeaway**\nSame direction closes at the speed difference, from the later start.",
    fastest_path_md:
      "Head start $2.5 \\times 45 = 112.5$ km; closing speed $30$ km/h; $112.5/30 = 3.75$ h after $10{:}30$, so $14{:}15$.",
    trap_map: {
      "0": "Computes the $3.75$-hour catch-up correctly but adds it to the freight's $8{:}00$ departure instead of the express's $10{:}30$, giving $11{:}45$.",
      "1": "Divides the head start by the express's own speed rather than the closing speed: $112.5/75 = 1.5$ hours after $10{:}30$.",
      "2": "Divides the head start by the freight's speed: $112.5/45 = 2.5$ hours after $10{:}30$.",
      "4": "Computes the head start at the express's speed instead of the freight's ($2.5 \\times 75 = 187.5$ km), giving $187.5/30 = 6.25$ hours after $10{:}30$.",
    },
    numeric_check: null,
    check(q) {
      // Advance both trains minute by minute and read the clock at parity.
      const start = 8 * 60;
      const expressStart = 10 * 60 + 30;
      for (let t = expressStart; t <= 24 * 60; t++) {
        const freight = ((t - start) / 60) * 45;
        const express = ((t - expressStart) / 60) * 75;
        if (Math.abs(freight - express) < 1e-9) {
          const label = `$${String(Math.floor(t / 60)).padStart(2, "0")}{:}${String(t % 60).padStart(2, "0")}$`;
          const index = q.choices.indexOf(label);
          if (index < 0) throw new Error(`computed ${label}, not among the choices`);
          return { kind: "index", index };
        }
      }
      throw new Error("the express never draws level");
    },
    trap_values() {
      const clock = (minutesAfterMidnight) =>
        `$${String(Math.floor(minutesAfterMidnight / 60)).padStart(2, "0")}{:}${String(
          Math.round(minutesAfterMidnight) % 60,
        ).padStart(2, "0")}$`;
      const head = 2.5 * 45;
      return {
        "0": clock(8 * 60 + (head / 30) * 60),
        "1": clock(10 * 60 + 30 + (head / 75) * 60),
        "2": clock(10 * 60 + 30 + (head / 45) * 60),
        "4": clock(10 * 60 + 30 + ((2.5 * 75) / 30) * 60),
      };
    },
  },

  // ── 10. machine-days with a mid-job breakdown ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "Twelve identical machines working together at a constant rate can complete an order in $8$ days. Three days into the job, four of the machines break down and are not replaced; the remaining machines finish the order. By how many days does the order finish later than the original $8$-day schedule?",
    choices: ["$2.5$", "$4$", "$7.5$", "$10$", "$10.5$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nMeasure the job in machine-days: $12 \\times 8 = 96$. The first three days consume $3 \\times 12 = 36$, leaving $60$ machine-days. Eight machines remain, so they need $60/8 = 7.5$ days. The order finishes on day $3 + 7.5 = 10.5$, which is $10.5 - 8 = 2.5$ days late.\n\n**Trigger cue**\nA changing crew size on a fixed job — convert the whole job into worker-days once, then spend it at whatever headcount applies.\n\n**Takeaway**\nMachine-days are conserved; spend them at the current headcount.",
    fastest_path_md:
      "The job is $96$ machine-days; $36$ are spent, $60$ remain at $8$ machines $= 7.5$ days, finishing on day $10.5$ — $2.5$ days late.",
    trap_map: {
      "1": "Restarts the whole job with the reduced crew, taking $96/8 = 12$ days and calling the delay $12 - 8 = 4$.",
      "2": "Answers with the $7.5$ days still needed after the breakdown rather than the delay.",
      "3": "Reads \"four break down\" as \"four remain\", giving $60/4 = 15$ days and a finish on day $18$ — a delay of $10$.",
      "4": "Answers with the order's total length $10.5$ days rather than the delay.",
    },
    numeric_check: "3 + (12*8 - 3*12)/8 - 8",
    check() {
      // Burn the job down a tenth of a day at a time.
      const total = 12 * 8;
      let done = 0;
      let day = 0;
      while (done < total - 1e-9 && day < 100) {
        const machines = day < 3 - 1e-12 ? 12 : 8;
        done += machines * 0.001;
        day += 0.001;
      }
      return { kind: "value", value: Math.round((day - 8) * 1000) / 1000 };
    },
    trap_values() {
      return {
        "1": (12 * 8) / 8 - 8,
        "2": (12 * 8 - 3 * 12) / 8,
        "3": 3 + (12 * 8 - 3 * 12) / 4 - 8,
        "4": 3 + (12 * 8 - 3 * 12) / 8,
      };
    },
  },

  // ── 11. downstream and back against a known current ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "A boat travels $45$ kilometers downstream and then the same $45$ kilometers back upstream, taking $8$ hours in total. The current runs at a constant $3$ kilometers per hour and the boat's engine holds a constant speed in still water. What is the boat's speed in still water, in kilometers per hour?",
    choices: ["$8.25$", "$11.25$", "$12$", "$14.25$", "$15$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $b$ be the still-water speed. Downstream the boat makes $b + 3$ and upstream $b - 3$, so $\\dfrac{45}{b+3} + \\dfrac{45}{b-3} = 8$. Clearing denominators: $45(b-3) + 45(b+3) = 8(b^2 - 9)$, i.e. $90b = 8b^2 - 72$, so $8b^2 - 90b - 72 = 0$, or $4b^2 - 45b - 36 = 0$. The discriminant is $2025 + 576 = 2601 = 51^2$, giving $b = \\dfrac{45 + 51}{8} = 12$ (the other root is negative).\n\n**Trigger cue**\nEqual distances up and down a current with a total time — add the two time fractions, clear to a quadratic, and discard the root that makes a speed non-positive.\n\n**Takeaway**\nUp-and-down current problems add times and clear to a quadratic.",
    fastest_path_md:
      "Test the choices: $b = 12$ gives $15$ and $9$ km/h, so $45/15 + 45/9 = 3 + 5 = 8$ hours. Done.",
    trap_map: {
      "0": "Splits the $8$ hours evenly, reads $45/4 = 11.25$ as the *downstream* speed, and backs out $11.25 - 3 = 8.25$.",
      "1": "Answers with the round-trip average speed $90/8 = 11.25$, which is not the still-water speed.",
      "3": "Splits the $8$ hours evenly, reads $45/4 = 11.25$ as the *upstream* speed, and backs out $11.25 + 3 = 14.25$.",
      "4": "Answers with the downstream speed $12 + 3 = 15$ instead of the still-water speed.",
    },
    numeric_check: "(90 + sqrt(90^2 + 4*8*72))/(2*8)",
    check() {
      // Scan still-water speeds in hundredths and keep exact 8-hour trips.
      const found = [];
      for (let cs = 301; cs <= 5000; cs++) {
        const b = cs / 100;
        const t = 45 / (b + 3) + 45 / (b - 3);
        if (Math.abs(t - 8) < 1e-10) found.push(b);
      }
      if (found.length !== 1) throw new Error(`expected one speed, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 45 / 4 - 3, "1": 90 / 8, "3": 45 / 4 + 3, "4": 12 + 3 };
    },
  },

  // ── 12. one worker starts alone, the faster one joins ───────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "rates_speed_work",
    difficulty: 5,
    stem_md:
      "Anya works exactly $1.5$ times as fast as Ben. Working together from the start, they would finish a job in $12$ days. Instead Ben works alone for the first $10$ days, after which Anya joins him and they work together until the job is done. How many days does the job take in total?",
    choices: ["$16$", "$18$", "$20$", "$22$", "$30$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet Ben's rate be $r$ jobs per day; Anya's is $1.5r$, so together they do $2.5r$ and $2.5r = \\tfrac{1}{12}$, giving $r = \\tfrac{1}{30}$. In $10$ days Ben alone completes $\\tfrac{10}{30} = \\tfrac13$ of the job. The remaining $\\tfrac23$ goes at the joint rate $\\tfrac{1}{12}$, taking $\\tfrac23 \\times 12 = 8$ days. Total: $10 + 8 = 18$ days.\n\n**Trigger cue**\nA speed *ratio* plus a joint completion time — the ratio splits the joint rate into its parts, so solve for the slower worker's rate first.\n\n**Takeaway**\nA speed ratio splits a joint rate; solve for one rate first.",
    fastest_path_md:
      "The pair does $\\tfrac{1}{12}$ per day and Ben is $\\tfrac{1}{2.5} = 40\\%$ of that, so Ben alone is $\\tfrac{1}{30}$: ten days is a third. Two thirds left at $\\tfrac{1}{12}$ is $8$ days. Total $18$.",
    trap_map: {
      "0": "Uses Anya's rate $\\tfrac{1}{20}$ for Ben's first ten days, so half the job is done and $6$ more days finish it: $10 + 6 = 16$.",
      "2": "Answers with the $20$ days Ben would still need alone after his first ten, ignoring that Anya joins.",
      "3": "Adds the full $12$-day joint schedule to the $10$ days Ben already worked: $10 + 12 = 22$.",
      "4": "Answers with Ben's solo time for the whole job, $30$ days.",
    },
    numeric_check: "10 + (1 - 10/30)/(1/12)",
    check() {
      // March day by day at the applicable rate.
      const ben = 1 / 30;
      const anya = 1.5 * ben;
      if (Math.abs(ben + anya - 1 / 12) > 1e-12)
        throw new Error("rates do not reproduce the stated joint time");
      let done = 0;
      let day = 0;
      const step = 1e-4;
      while (done < 1 - 1e-12 && day < 100) {
        done += (day < 10 - 1e-12 ? ben : ben + anya) * step;
        day += step;
      }
      // Round off the marching loop's accumulated float drift; the answer
      // choices are whole days, two or more apart.
      return { kind: "value", value: Math.round(day * 100) / 100 };
    },
    trap_values() {
      return {
        "0": 10 + (1 - 10 / 20) / (1 / 12),
        "2": (1 - 10 / 30) / (1 / 30),
        "3": 10 + 12,
        "4": 30,
      };
    },
  },
];

verifyAndAppend(items, {
  dryRun: !process.env.APPEND,
  requireTrapValues: true,
});
