/**
 * Quality pass, batch 1 — 8 new D5 interest_profit_discount items
 * (rates_ratio_percent, arithmetic). Takes the bank's thinnest subtopic
 * from 8 items to 16 and adds eight top-band items.
 *
 * Every item carries BOTH gates: check() recomputes the answer from the
 * stem's raw numbers by a path independent of the written solution, and
 * trap_values() computes each distractor by committing the specific named
 * error in trap_map — so no wrong choice is merely asserted to be
 * tempting, it is proved reachable.
 *
 * Run: node --experimental-strip-types scripts/author/batch-q5-interest_profit_discount.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ── 1. markup then a chain of two markdowns, solved back to cost ────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "A boutique marks a coat at $60\\%$ above its cost. The coat does not sell, so the boutique takes $25\\%$ off the marked price, and at checkout applies a further $10\\%$ off the reduced price. The coat still sells for $\\$18$ more than it cost the boutique. What did the coat cost the boutique?",
    choices: ["$\\$72$", "$\\$225$", "$\\$243$", "$\\$360$", "$\\$450$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nWrite every step as a factor on the cost $C$. The marked price is $1.6C$; a $25\\%$ markdown multiplies by $0.75$; a further $10\\%$ off multiplies by $0.9$. The final price is therefore $1.6 \\times 0.75 \\times 0.9 \\times C = 1.08C$. The profit is $1.08C - C = 0.08C$, so $0.08C = 18$ and $C = 225$.\n\n**Trigger cue**\nA markup followed by two markdowns and a stated dollar profit — chain the factors, subtract $1$, and divide the dollar figure by what is left.\n\n**Takeaway**\nChain every percent as a factor; profit is the net factor minus one.",
    fastest_path_md:
      "$1.6 \\times 0.75 = 1.2$, and $1.2 \\times 0.9 = 1.08$. The coat sold for $8\\%$ above cost, so $C = 18 / 0.08 = 225$.",
    trap_map: {
      "0": "Adds and subtracts the percents instead of multiplying factors: $+60\\% - 25\\% - 10\\% = +25\\%$, giving $18/0.25 = 72$.",
      "2": "Solves for the cost correctly, then answers with the final selling price $1.08 \\times 225 = 243$.",
      "3": "Solves for the cost correctly, then answers with the marked price $1.6 \\times 225 = 360$.",
      "4": "Collapses the two markdowns into a single $35\\%$ off the marked price: $1.6 \\times 0.65 = 1.04$, giving $18/0.04 = 450$.",
    },
    numeric_check: "18/(1.6*0.75*0.9 - 1)",
    check() {
      // Scan costs in whole cents and keep every one that reproduces the
      // stem's $18 profit under the stated sequence of price moves.
      const found = [];
      for (let cents = 1; cents <= 100_000; cents++) {
        const C = cents / 100;
        const marked = C * 1.6;
        const reduced = marked * 0.75;
        const checkout = reduced * 0.9;
        if (Math.abs(checkout - C - 18) < 1e-9) found.push(C);
      }
      if (found.length !== 1) throw new Error(`expected one cost, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      const C = 225;
      return {
        "0": 18 / (0.6 - 0.25 - 0.1), // percents added rather than chained
        "2": C * 1.6 * 0.75 * 0.9, // the final selling price
        "3": C * 1.6, // the marked price
        "4": 18 / (1.6 * (1 - 0.35) - 1), // the two markdowns merged into 35%
      };
    },
  },

  // ── 2. two growth years split by a fee, solved back to the principal ────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "A fund grows by $20\\%$ during its first year and by $25\\%$ during its second. A flat administration fee of $\\$600$ is deducted at the end of the first year, after that year's growth is credited. At the end of the second year the account holds exactly $20\\%$ more than the amount originally invested. How much was originally invested?",
    choices: ["$\\$1{,}500$", "$\\$2{,}000$", "$\\$2{,}500$", "$\\$3{,}000$", "$\\$3{,}750$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $P$ be the amount invested. After year one the balance is $1.2P$, and the fee leaves $1.2P - 600$. Year two multiplies that by $1.25$, giving $1.5P - 750$. Setting this equal to $1.2P$: $1.5P - 750 = 1.2P$, so $0.3P = 750$ and $P = 2500$.\n\n**Trigger cue**\nA fixed fee deducted partway through a growth chain — the fee is multiplied by every factor that comes after it, so carry it through rather than subtracting it at the end.\n\n**Takeaway**\nA mid-chain fee compounds too; multiply it by the later factors.",
    fastest_path_md:
      "The $\\$600$ fee is charged before the second year, so it costs $600 \\times 1.25 = \\$750$ by the end. Growth alone would give $1.5P$; the target is $1.2P$; the $0.3P$ gap is the $\\$750$, so $P = 2500$.",
    trap_map: {
      "0": "Divides the compounded fee by the total growth $1.5 - 1 = 0.5$ instead of by the $0.3$ gap to the target: $750/0.5 = 1500$.",
      "1": "Deducts the fee after the second year's growth rather than before it, solving $1.5P - 600 = 1.2P$ for $P = 2000$.",
      "3": "Solves correctly, then answers with the ending balance $1.2 \\times 2500 = 3000$.",
      "4": "Divides the compounded fee by the target's $20\\%$ rather than by the $30\\%$ gap: $750/0.2 = 3750$.",
    },
    numeric_check: "600*1.25/(1.2*1.25 - 1.2)",
    check() {
      // Simulate the account year by year for each candidate principal.
      const found = [];
      for (let p = 1; p <= 20_000; p++) {
        const afterYear1 = p * 1.2 - 600;
        const afterYear2 = afterYear1 * 1.25;
        if (Math.abs(afterYear2 - 1.2 * p) < 1e-9) found.push(p);
      }
      if (found.length !== 1) throw new Error(`expected one principal, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": (600 * 1.25) / (1.2 * 1.25 - 1),
        "1": 600 / (1.2 * 1.25 - 1.2),
        "3": 1.2 * 2500,
        "4": (600 * 1.25) / 0.2,
      };
    },
  },

  // ── 3. margin restated against a changed cost base ──────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "A dealer sells a bicycle at a profit of $25\\%$ of what the bicycle cost her. Had she bought the same bicycle for $20\\%$ less and sold it for $\\$12$ more than she actually did, her profit would have been $60\\%$ of that lower cost. What did the bicycle actually cost her?",
    choices: ["$\\$80$", "$\\$320$", "$\\$400$", "$\\$500$", "$\\$512$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $C$ be the actual cost. The actual selling price is $1.25C$. In the hypothetical, the cost is $0.8C$ and the price is $1.25C + 12$, so the profit is $1.25C + 12 - 0.8C = 0.45C + 12$. That profit is $60\\%$ of the *new* cost: $0.45C + 12 = 0.6(0.8C) = 0.48C$. Hence $12 = 0.03C$ and $C = 400$.\n\n**Trigger cue**\nA restated margin whose base also moved — write both the new price and the new cost in terms of the original cost before setting the percent condition.\n\n**Takeaway**\nWhen the margin changes, check which cost the percent is taken of.",
    fastest_path_md:
      "New profit $= 0.45C + 12$, and it must equal $0.6 \\times 0.8C = 0.48C$. The $0.03C$ gap is the $\\$12$, so $C = 400$.",
    trap_map: {
      "0": "Takes the $60\\%$ of the original cost instead of the reduced cost: $0.45C + 12 = 0.6C$ gives $C = 80$.",
      "1": "Solves correctly, then answers with the hypothetical cost $0.8 \\times 400 = 320$.",
      "3": "Solves correctly, then answers with the actual selling price $1.25 \\times 400 = 500$.",
      "4": "Solves correctly, then answers with the hypothetical selling price $1.25 \\times 400 + 12 = 512$.",
    },
    numeric_check: "12/(0.6*0.8 - 0.45)",
    check() {
      const found = [];
      for (let cents = 1; cents <= 200_000; cents++) {
        const C = cents / 100;
        const price = 1.25 * C;
        const newCost = 0.8 * C;
        const newProfit = price + 12 - newCost;
        if (Math.abs(newProfit - 0.6 * newCost) < 1e-9) found.push(C);
      }
      if (found.length !== 1) throw new Error(`expected one cost, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      const C = 400;
      return {
        "0": 12 / (0.6 - 0.45),
        "1": 0.8 * C,
        "3": 1.25 * C,
        "4": 1.25 * C + 12,
      };
    },
  },

  // ── 4. the compound-minus-simple gap over two years ─────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "On a certain sum invested for two years at $15\\%$ per year, the interest earned under annual compounding exceeds the interest earned under simple interest by $\\$67.50$. What is the sum?",
    choices: ["$\\$450$", "$\\$900$", "$\\$1{,}500$", "$\\$3{,}000$", "$\\$30{,}000$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nWith principal $P$ and rate $r$, two years of compounding gives $P(1+r)^2 = P(1 + 2r + r^2)$, so the compound interest is $P(2r + r^2)$. Simple interest over the same period is $2Pr$. The gap is exactly $Pr^2$ — it is the interest earned in year two on year one's interest. So $P(0.15)^2 = 67.50$, i.e. $0.0225P = 67.50$ and $P = 3000$.\n\n**Trigger cue**\n\"Compound exceeds simple over two years by …\" — the gap is $Pr^2$, one year's interest on the first year's interest, nothing more.\n\n**Takeaway**\nTwo-year compound minus simple equals $Pr^2$ — interest on interest.",
    fastest_path_md:
      "The two-year gap is $Pr^2$. Here $r^2 = 0.0225$, so $P = 67.50/0.0225 = 3000$.",
    trap_map: {
      "0": "Divides by the rate once instead of by its square: $67.50/0.15 = 450$.",
      "1": "Halves the rate rather than squaring it: $67.50/0.075 = 900$.",
      "2": "Doubles the squared rate, as if the two-year gap were $2Pr^2$ (one gap per year): $67.50/0.045 = 1500$.",
      "4": "Misplaces a decimal in $r^2$, using $0.00225$ for $0.15^2$: $67.50/0.00225 = 30{,}000$.",
    },
    numeric_check: "67.5/0.15^2",
    check() {
      // Recompute both interest totals from scratch, no formula reused.
      const found = [];
      for (let p = 1; p <= 60_000; p++) {
        let balance = p;
        for (let year = 0; year < 2; year++) balance += balance * 0.15;
        const compound = balance - p;
        const simple = p * 0.15 * 2;
        if (Math.abs(compound - simple - 67.5) < 1e-7) found.push(p);
      }
      if (found.length !== 1) throw new Error(`expected one sum, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 67.5 / 0.15,
        "1": 67.5 / (0.15 / 2),
        "2": 67.5 / (2 * 0.15 ** 2),
        "4": 67.5 / 0.00225,
      };
    },
  },

  // ── 5. a marked price set so a partly-discounted lot clears a margin ────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "A retailer buys $40$ identical lamps for $\\$1{,}440$ in total and marks every lamp at the same price. She expects to sell $32$ of them at the marked price and the remaining $8$ at half the marked price, and she wants the $40$ lamps together to return a profit of $25\\%$ on what she paid for them. At what price should she mark each lamp?",
    choices: ["$\\$40$", "$\\$45$", "$\\$50$", "$\\$52.50$", "$\\$56.25$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nTotal cost is $\\$1{,}440$, so the target revenue is $1.25 \\times 1440 = \\$1{,}800$. With marked price $M$, revenue is $32M + 8(0.5M) = 32M + 4M = 36M$. The $8$ half-price lamps contribute the revenue of $4$ full-price lamps, so the lot behaves like $36$ lamps sold at $M$. Setting $36M = 1800$ gives $M = 50$.\n\n**Trigger cue**\nA mixed-price lot with an overall margin target — convert the discounted units into their full-price equivalent, then divide the target revenue by that count.\n\n**Takeaway**\nHalf-price units count as half a unit of full-price revenue.",
    fastest_path_md:
      "Target revenue $1.25 \\times 1440 = 1800$. Eight half-price lamps equal four full-price ones, so the revenue divides over $36$ effective lamps: $M = 1800/36 = 50$.",
    trap_map: {
      "0": "Forgets the profit target and prices for break-even: $1440/36 = 40$.",
      "1": "Ignores the markdown and divides the target revenue over all $40$ lamps: $1800/40 = 45$.",
      "3": "Reads the $25\\%$ as a share of the target revenue rather than of cost, aiming at $1440 + 0.25(1800) = 1890$: $1890/36 = 52.50$.",
      "4": "Counts only the $32$ full-price lamps as producing revenue: $1800/32 = 56.25$.",
    },
    numeric_check: "1.25*1440/36",
    check() {
      // Scan marked prices in cents; keep those that hit the margin exactly.
      const cost = 1440;
      const found = [];
      for (let cents = 1; cents <= 20_000; cents++) {
        const M = cents / 100;
        const revenue = 32 * M + 8 * (M / 2);
        if (Math.abs(revenue - cost - 0.25 * cost) < 1e-9) found.push(M);
      }
      if (found.length !== 1) throw new Error(`expected one price, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 1440 / 36,
        "1": 1800 / 40,
        "3": (1440 + 0.25 * 1800) / 36,
        "4": 1800 / 32,
      };
    },
  },

  // ── 6. successive discounts against a single equivalent discount ────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "Two shops list the same appliance at $\\$600$. The first shop offers successive discounts of $20\\%$ and then $15\\%$ off the reduced price. The second shop offers a single discount of $d\\%$ off the list price, and its final price is $\\$12$ less than the first shop's. What is $d$?",
    choices: ["$32$", "$33$", "$34$", "$37$", "$66$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe first shop charges $600 \\times 0.80 \\times 0.85 = \\$408$. The second charges $408 - 12 = \\$396$. A price of $\\$396$ on a $\\$600$ list means the customer pays $396/600 = 0.66$ of list, so the discount is $1 - 0.66 = 0.34$, i.e. $d = 34$.\n\n**Trigger cue**\nSuccessive discounts compared with a single one — multiply the factors, never add the percents, then convert the surviving fraction back into a discount.\n\n**Takeaway**\nTwenty then fifteen off is thirty-two off, not thirty-five.",
    fastest_path_md:
      "$0.8 \\times 0.85 = 0.68$, so shop one charges $\\$408$; shop two charges $\\$396$, which is $0.66$ of list, a $34\\%$ discount.",
    trap_map: {
      "0": "Reports the first shop's equivalent single discount, $1 - 0.8 \\times 0.85 = 32\\%$, rather than the second shop's.",
      "1": "Adds the first shop's discounts to $35\\%$, then subtracts the $\\$12$ as a share of list ($2\\%$): $35 - 2 = 33$.",
      "3": "Adds the first shop's discounts to $35\\%$, making its price $\\$390$ and the second shop's $\\$378$, a $37\\%$ discount.",
      "4": "Reports the fraction of list the customer still pays, $396/600 = 66\\%$, instead of the discount.",
    },
    numeric_check: "100*(1 - (600*0.8*0.85 - 12)/600)",
    check() {
      // Search integer discounts and keep those matching the $12 gap.
      const list = 600;
      const first = list * 0.8 * 0.85;
      const found = [];
      for (let d = 1; d <= 99; d++) {
        const second = list * (1 - d / 100);
        if (Math.abs(first - second - 12) < 1e-9) found.push(d);
      }
      if (found.length !== 1) throw new Error(`expected one discount, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      const list = 600;
      return {
        "0": 100 * (1 - 0.8 * 0.85),
        "1": 35 - (12 / list) * 100,
        "3": 100 * (1 - (list * 0.65 - 12) / list),
        "4": 100 * ((list * 0.8 * 0.85 - 12) / list),
      };
    },
  },

  // ── 7. compound vs simple over an 18-month semiannual schedule ──────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "An account pays $20\\%$ annual interest compounded semiannually. Nadia deposits $\\$8{,}000$ and makes no further transactions. After $18$ months, how much more interest has the account earned than it would have earned at $20\\%$ simple annual interest over the same period?",
    choices: ["$\\$248$", "$\\$2{,}400$", "$\\$2{,}648$", "$\\$5{,}824$", "$\\$10{,}648$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nSemiannual compounding at a $20\\%$ annual rate means $10\\%$ per half-year, and $18$ months is three half-years: the balance is $8000(1.1)^3 = \\$10{,}648$, so compound interest is $\\$2{,}648$. Simple interest is $8000 \\times 0.20 \\times 1.5 = \\$2{,}400$. The difference is $2648 - 2400 = \\$248$.\n\n**Trigger cue**\nA stated annual rate with a compounding frequency — divide the rate by the number of periods per year and multiply the term by it, before touching anything else.\n\n**Takeaway**\nHalve the rate, double the periods; never compound at the annual rate.",
    fastest_path_md:
      "Three periods at $10\\%$: $8000 \\to 8800 \\to 9680 \\to 10648$, so compound interest is $\\$2{,}648$. Simple is $\\$2{,}400$. The gap is $\\$248$.",
    trap_map: {
      "1": "Answers with the simple interest $8000 \\times 0.2 \\times 1.5 = \\$2{,}400$ instead of the difference.",
      "2": "Answers with the compound interest $\\$2{,}648$ instead of the difference.",
      "3": "Compounds three periods at the full annual $20\\%$ instead of the semiannual $10\\%$: $8000(1.2)^3 - 8000 = \\$5{,}824$.",
      "4": "Answers with the ending balance $\\$10{,}648$ instead of any interest figure.",
    },
    numeric_check: "8000*1.1^3 - 8000 - 8000*0.2*1.5",
    check() {
      // Step the balance one half-year at a time; no closed form reused.
      let balance = 8000;
      for (let period = 0; period < 3; period++) balance += balance * 0.1;
      const compound = balance - 8000;
      const simple = 8000 * 0.2 * 1.5;
      return { kind: "value", value: compound - simple };
    },
    trap_values() {
      let annualCompounded = 8000;
      for (let period = 0; period < 3; period++) annualCompounded *= 1.2;
      let semi = 8000;
      for (let period = 0; period < 3; period++) semi *= 1.1;
      return {
        "1": 8000 * 0.2 * 1.5,
        "2": semi - 8000,
        "3": annualCompounded - 8000,
        "4": semi,
      };
    },
  },

  // ── 8. break-even where the unit price steps down past a threshold ──────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "A print shop pays $\\$3{,}600$ per month in fixed costs and $\\$4$ in materials for each poster it prints. Posters sell for $\\$10$ each, except that every poster sold beyond the first $300$ in a month is sold at $30\\%$ off. How many posters must the shop sell in a month to exactly cover its costs?",
    choices: ["$300$", "$600$", "$750$", "$900$", "$1{,}200$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nBelow the threshold each poster contributes $10 - 4 = \\$6$ of margin; $300$ of them cover $\\$1{,}800$, short of the $\\$3{,}600$ fixed cost, so break-even lies past $300$. Beyond $300$ the price is $0.7 \\times 10 = \\$7$ and the margin is $7 - 4 = \\$3$. The remaining $3600 - 1800 = \\$1{,}800$ of fixed cost needs $1800/3 = 600$ discounted posters, so the shop must sell $300 + 600 = 900$.\n\n**Trigger cue**\nA price that steps at a stated volume — check whether break-even falls before or after the step, then work in per-unit margin on each side separately.\n\n**Takeaway**\nPast a price step, recompute the margin, not just the price.",
    fastest_path_md:
      "First $300$ posters clear $\\$6$ each $= \\$1{,}800$. The rest clear $\\$3$ each, so the remaining $\\$1{,}800$ needs $600$ more. Total $900$.",
    trap_map: {
      "0": "Answers with the threshold $300$, the point where the price steps, rather than break-even.",
      "1": "Ignores the discount and applies the full $\\$6$ margin throughout: $3600/6 = 600$.",
      "2": "Discounts the first $300$ posters instead of those beyond it, leaving a $\\$3$ margin on the first $300$ and $\\$6$ after: $300 + (3600-900)/6 = 750$.",
      "4": "Applies the discounted $\\$3$ margin to every poster, including the first $300$: $3600/3 = 1200$.",
    },
    numeric_check: "300 + (3600 - 300*6)/3",
    check() {
      // Walk the poster count upward, accumulating real revenue and cost.
      let profit = -3600;
      for (let n = 1; n <= 5000; n++) {
        const price = n <= 300 ? 10 : 7;
        profit += price - 4;
        if (Math.abs(profit) < 1e-9) return { kind: "value", value: n };
      }
      throw new Error("no break-even point found");
    },
    trap_values() {
      return {
        "0": 300,
        "1": 3600 / 6,
        "2": 300 + (3600 - 300 * 3) / 6,
        "4": 3600 / 3,
      };
    },
  },
];

verifyAndAppend(items, {
  dryRun: !process.env.APPEND,
  requireTrapValues: true,
});
