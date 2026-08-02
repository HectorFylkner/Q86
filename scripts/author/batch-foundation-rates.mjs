/**
 * Foundation batch 1 of 4 — rates, ratio and percent.
 *
 * WHY THESE EXIST. The chapter test's foundation tier draws the easiest
 * band of a chapter and carries the *highest* pass bar (5 of 6), because a
 * miss on the mechanics is a defect to repair rather than a normal exam
 * outcome. Measured after the W8 band fix, 14 of 24 chapters had a
 * foundation band that still reached D4 — the bank is 66% D4+D5 and simply
 * had no easy items to put there. `interest_profit_discount` was the worst
 * in the bank: one item below D4 out of nineteen.
 *
 * These items are deliberately plain. A foundation item's job is to make a
 * single mechanic fail loudly when it is not there — one markup, one
 * simple-interest formula, one weighted average — not to be a small
 * version of a hard question.
 *
 * CHECKS ARE INDEPENDENT. Percent items are recomputed in integer cents by
 * repeated addition of one percent, never by the composed multiplier the
 * written solution uses; ratio items are recomputed by search over the
 * integers. A check that restates the solution proves the solution was
 * copied correctly and nothing else.
 *
 * Run: node --experimental-strip-types scripts/author/batch-foundation-rates.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

/** Add `pct` percent to an amount in cents, one percent at a time. This is
 *  the long way on purpose: it composes nothing, so it cannot inherit a
 *  multiplier error from the solution it is checking. */
function addPercent(cents, pct) {
  const onePercent = cents / 100;
  let out = cents;
  for (let i = 0; i < pct; i++) out += onePercent;
  return out;
}

function subPercent(cents, pct) {
  const onePercent = cents / 100;
  let out = cents;
  for (let i = 0; i < pct; i++) out -= onePercent;
  return out;
}

/** The index of the choice whose leading number equals `pct`. Derives the
 *  index from the choice text rather than being told it. */
function percentIndex(q, pct) {
  const hits = q.choices.flatMap((c, i) => {
    const m = c.match(/-?\d+(?:\.\d+)?/);
    return m && Math.abs(Number(m[0]) - pct) < 1e-9 ? [i] : [];
  });
  if (hits.length !== 1) {
    throw new Error(`${pct}% matches ${hits.length} choices, expected exactly 1`);
  }
  return hits[0];
}

/** Render a percent the way the choices are written, so a trap value is
 *  compared against the raw choice text it claims to reach. */
function pctText(pct) {
  const n = Math.round(pct * 1e6) / 1e6;
  return `$${n}\\%$`;
}

const items = [
  // ══ interest_profit_discount — 8 items ═══════════════════════════════════
  // The thinnest foundation in the bank: 1 item below D4 out of 19.
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 2,
    stem_md:
      "A shop buys a chair for $\\$60$ and marks its price up by $40\\%$. In a sale, the marked price is reduced by $25\\%$. What is the sale price of the chair, in dollars?",
    choices: ["$21$", "$45$", "$63$", "$69$", "$84$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe markup acts on the cost: $60 \\times 1.4 = 84$. The discount acts on the marked price, not on the cost: $84 \\times 0.75 = 63$.\n\n**Trigger cue**\nA markup followed by a discount — each percent applies to whatever the previous step produced, so work left to right and never add the percents.\n\n**Takeaway**\nEach percent acts on the number in front of it, not on the original.",
    fastest_path_md:
      "Chain the multipliers: $60 \\cdot 1.4 \\cdot 0.75 = 60 \\cdot 1.05 = 63$.",
    trap_map: {
      "0": "Reports the size of the discount ($25\\%$ of $84 = 21$) instead of the price left after it.",
      "1": "Applies the discount to the cost and drops the markup entirely: $60 \\times 0.75$.",
      "3": "Nets the two percents additively as $+40 - 25 = +15$, giving $60 \\times 1.15$. The discount is not a discount off the cost.",
      "4": "Stops at the marked price and never takes the sale off.",
    },
    numeric_check: "60*1.4*0.75",
    check() {
      const marked = addPercent(6000, 40);
      const sale = subPercent(marked, 25);
      return { kind: "value", value: sale / 100 };
    },
    trap_values() {
      const marked = addPercent(6000, 40);
      return {
        "0": (marked - subPercent(marked, 25)) / 100,
        "1": subPercent(6000, 25) / 100,
        "3": addPercent(6000, 15) / 100,
        "4": marked / 100,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 2,
    stem_md:
      "A deposit of $\\$2{,}400$ earns simple annual interest at a rate of $5\\%$ per year. How much interest, in dollars, does the deposit earn in $3$ years?",
    choices: ["$120$", "$360$", "$378.30$", "$2{,}760$", "$3{,}600$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nSimple interest is paid on the original principal every year, so each year adds $5\\%$ of $\\$2{,}400 = \\$120$. Over $3$ years that is $3 \\times 120 = 360$.\n\n**Trigger cue**\nThe word *simple* means the interest never earns interest — the base stays at the original principal, so the total is just rate $\\times$ principal $\\times$ time.\n\n**Takeaway**\nSimple interest keeps the same base every year.",
    fastest_path_md:
      "$5\\%$ of $2{,}400$ is $120$ a year, so three years is $360$. No compounding to track.",
    trap_map: {
      "0": "Computes one year's interest and forgets the three-year term.",
      "2": "Compounds instead of keeping the base fixed: $2{,}400(1.05^{3} - 1)$. The gap between this and the right answer is exactly what \"simple\" rules out.",
      "3": "Reports the ending balance, principal included, when the question asked only for the interest.",
      "4": "Reads $5\\%$ as the factor $0.5$ rather than $0.05$.",
    },
    numeric_check: "2400*0.05*3",
    check() {
      // Simple interest: the base never moves off the original principal.
      const principal = 240000;
      let interest = 0;
      for (let year = 0; year < 3; year++) {
        interest += (principal * 5) / 100;
      }
      return { kind: "value", value: interest / 100 };
    },
    trap_values() {
      const principal = 240000;
      let compounded = principal;
      for (let year = 0; year < 3; year++) compounded = addPercent(compounded, 5);
      return {
        "0": (principal * 5) / 100 / 100,
        "2": Math.round(compounded - principal) / 100,
        "3": (principal + ((principal * 5) / 100) * 3) / 100,
        "4": (principal * 0.5 * 3) / 100,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "An investment of $\\$5{,}000$ earns $8\\%$ annual interest, compounded annually. What is the value of the investment, in dollars, after $2$ years?",
    choices: ["$832$", "$5{,}400$", "$5{,}800$", "$5{,}832$", "$6{,}298.56$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nYear one: $5{,}000 + 8\\%$ of $5{,}000 = 5{,}400$. Year two takes $8\\%$ of the *new* balance: $5{,}400 + 432 = 5{,}832$.\n\n**Trigger cue**\n*Compounded annually* means the base moves every year. Two years is short enough to step through; reach for $P(1+r)^{n}$ only when the term is long.\n\n**Takeaway**\nCompounding moves the base; stepping two years beats a formula.",
    fastest_path_md:
      "Two steps: $5{,}000 \\to 5{,}400 \\to 5{,}832$. The second year's interest is $432$, not $400$, and that $32$ is the whole question.",
    trap_map: {
      "0": "Reports the interest earned rather than the value of the investment.",
      "1": "Stops after one year.",
      "2": "Uses simple interest — two years of $\\$400$ — which misses the $\\$32$ of interest-on-interest that makes this compound.",
      "4": "Compounds a third year the question never asked for.",
    },
    numeric_check: "5000*1.08^2",
    check() {
      let cents = 500000;
      for (let year = 0; year < 2; year++) cents = addPercent(cents, 8);
      return { kind: "value", value: cents / 100 };
    },
    trap_values() {
      let two = 500000;
      for (let year = 0; year < 2; year++) two = addPercent(two, 8);
      let three = 500000;
      for (let year = 0; year < 3; year++) three = addPercent(three, 8);
      return {
        "0": (two - 500000) / 100,
        "1": addPercent(500000, 8) / 100,
        "2": (500000 + ((500000 * 8) / 100) * 2) / 100,
        "4": Math.round(three) / 100,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "A merchant sells an item for $\\$96$ and earns a profit equal to $20\\%$ of what the item cost. What was the cost of the item, in dollars?",
    choices: ["$16$", "$76.80$", "$80$", "$115.20$", "$120$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nProfit is measured against cost, so selling price $= $ cost $ + 20\\%$ of cost $= 1.2C$. Then $1.2C = 96$ and $C = 80$.\n\n**Trigger cue**\n\"Profit of $x\\%$\" on the GMAT means $x\\%$ *of cost* unless the stem says otherwise. Name the base before dividing.\n\n**Takeaway**\nProfit percent is measured against cost, not against price.",
    fastest_path_md:
      "$96$ is $120\\%$ of cost, so cost $= 96/1.2 = 80$. Sanity check: $20\\%$ of $80$ is $16$, and $80 + 16 = 96$.",
    trap_map: {
      "0": "Reports the profit ($\\$16$) rather than the cost.",
      "1": "Takes $20\\%$ off the selling price: $96 \\times 0.8$. That would be right only if the profit were a percent of price.",
      "3": "Adds $20\\%$ to the selling price instead of stripping it out.",
      "4": "Divides by $0.8$ — treats the profit as $20\\%$ of the selling price rather than of cost.",
    },
    numeric_check: "96/1.2",
    check() {
      // Search, rather than divide: the cost is whatever integer number of
      // cents grows to 9600 when a fifth of itself is added.
      const found = [];
      for (let cost = 1; cost <= 200000; cost++) {
        if (cost + (cost * 20) / 100 === 9600) found.push(cost);
      }
      if (found.length !== 1) throw new Error(`${found.length} costs work`);
      return { kind: "value", value: found[0] / 100 };
    },
    trap_values() {
      return {
        "0": (9600 - 8000) / 100,
        "1": subPercent(9600, 20) / 100,
        "3": addPercent(9600, 20) / 100,
        "4": 9600 / 0.8 / 100,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "A coat listed at $\\$250$ is marked down by $20\\%$, and the marked-down price is then reduced by a further $10\\%$ at the register. What does a customer pay for the coat, in dollars?",
    choices: ["$70$", "$175$", "$180$", "$200$", "$225$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nFirst markdown: $250 \\times 0.8 = 200$. The second discount applies to $\\$200$, not to $\\$250$: $200 \\times 0.9 = 180$.\n\n**Trigger cue**\nSuccessive discounts multiply. $20\\%$ then $10\\%$ is a net $28\\%$ off ($0.8 \\times 0.9 = 0.72$), never $30\\%$.\n\n**Takeaway**\nSuccessive discounts multiply; they never add.",
    fastest_path_md:
      "$0.8 \\times 0.9 = 0.72$, so the customer pays $72\\%$ of $250 = 180$.",
    trap_map: {
      "0": "Reports the total discount ($\\$70$) rather than the price paid.",
      "1": "Adds the discounts into a single $30\\%$: $250 \\times 0.7$. This is the error the item is built to catch.",
      "3": "Stops after the first markdown.",
      "4": "Applies only the register discount and misses the markdown.",
    },
    numeric_check: "250*0.8*0.9",
    check() {
      let cents = 25000;
      cents = subPercent(cents, 20);
      cents = subPercent(cents, 10);
      return { kind: "value", value: cents / 100 };
    },
    trap_values() {
      const final = subPercent(subPercent(25000, 20), 10);
      return {
        "0": (25000 - final) / 100,
        "1": subPercent(25000, 30) / 100,
        "3": subPercent(25000, 20) / 100,
        "4": subPercent(25000, 10) / 100,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 2,
    stem_md:
      "A bicycle originally priced at $\\$250$ is on sale for $\\$200$. By what percent was the original price reduced?",
    choices: ["$20\\%$", "$25\\%$", "$50\\%$", "$80\\%$", "$125\\%$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe reduction is $250 - 200 = 50$. A percent reduction is measured against the *original* price: $50/250 = 0.2$, so $20\\%$.\n\n**Trigger cue**\nPercent change always divides by where the change started. \"Reduced from\" names the base out loud.\n\n**Takeaway**\nPercent change divides by the starting value, always.",
    fastest_path_md:
      "$50$ off $250$. Since $250/5 = 50$, the reduction is one fifth, or $20\\%$.",
    trap_map: {
      "1": "Divides the reduction by the new price ($50/200$) instead of the original.",
      "2": "Reports the dollar reduction as though it were the percent.",
      "3": "Gives the sale price as a percent of the original — what the customer pays, not what was taken off.",
      "4": "Gives the original as a percent of the sale price, inverting the comparison.",
    },
    numeric_check: null,
    check(q) {
      // Count down in whole dollars: how many hundredths of the original
      // does the drop cover?
      const original = 250;
      const sale = 200;
      let drop = 0;
      for (let p = original; p > sale; p--) drop++;
      const pct = (drop / original) * 100;
      return { kind: "index", index: percentIndex(q, pct) };
    },
    trap_values() {
      return {
        "1": pctText((50 / 200) * 100),
        "2": pctText(50),
        "3": pctText((200 / 250) * 100),
        "4": pctText((250 / 200) * 100),
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 2,
    stem_md:
      "A wholesaler buys $40$ identical pens for $\\$3$ each and sells all $40$ of them for $\\$5$ each. What is the wholesaler's total profit, in dollars?",
    choices: ["$2$", "$80$", "$120$", "$200$", "$320$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nProfit per pen is $5 - 3 = 2$, and there are $40$ pens, so the total profit is $40 \\times 2 = 80$. Equivalently, revenue $200$ minus cost $120$.\n\n**Trigger cue**\nSame quantity bought and sold — take the per-unit margin once and scale it, rather than computing two totals and subtracting.\n\n**Takeaway**\nWith the quantity unchanged, margin per unit times units is the profit.",
    fastest_path_md:
      "$\\$2$ a pen $\\times\\, 40$ pens $= \\$80$.",
    trap_map: {
      "0": "Reports the profit on a single pen and never scales to $40$.",
      "2": "Reports total cost.",
      "3": "Reports total revenue — the most common misread when the stem gives two prices.",
      "4": "Adds cost and revenue instead of subtracting.",
    },
    numeric_check: "40*(5-3)",
    check() {
      let profit = 0;
      for (let pen = 0; pen < 40; pen++) profit += 5 - 3;
      return { kind: "value", value: profit };
    },
    trap_values() {
      let cost = 0;
      let revenue = 0;
      for (let pen = 0; pen < 40; pen++) {
        cost += 3;
        revenue += 5;
      }
      return { "0": 5 - 3, "2": cost, "3": revenue, "4": cost + revenue };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "After a $15\\%$ increase, the price of a concert ticket is $\\$46$. What was the price of the ticket, in dollars, before the increase?",
    choices: ["$6$", "$31$", "$39.10$", "$40$", "$52.90$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe new price is $115\\%$ of the old: $1.15P = 46$, so $P = 46/1.15 = 40$. Check: $15\\%$ of $40$ is $6$, and $40 + 6 = 46$.\n\n**Trigger cue**\n\"After an increase, the price *is* $X$\" — $X$ is the result, so divide by the multiplier. Subtracting the percent from $X$ uses the wrong base.\n\n**Takeaway**\nTo undo a percent increase, divide by the multiplier.",
    fastest_path_md:
      "Backsolve from the choices: $15\\%$ of $40$ is $6$ and $40 + 6 = 46$. One line, no division.",
    trap_map: {
      "0": "Reports the size of the increase rather than the original price.",
      "1": "Subtracts $15$ dollars, treating the percent as an amount.",
      "2": "Takes $15\\%$ off the *new* price ($46 \\times 0.85$) — the right operation on the wrong base, which is why it is close enough to look right.",
      "4": "Increases again instead of undoing the increase.",
    },
    numeric_check: "46/1.15",
    check() {
      const found = [];
      for (let p = 1; p <= 100000; p++) {
        if (Math.abs(addPercent(p, 15) - 4600) < 1e-9) found.push(p);
      }
      if (found.length !== 1) throw new Error(`${found.length} prices work`);
      return { kind: "value", value: found[0] / 100 };
    },
    trap_values() {
      return {
        "0": (4600 - 4000) / 100,
        "1": (4600 - 1500) / 100,
        "2": subPercent(4600, 15) / 100,
        "4": addPercent(4600, 15) / 100,
      };
    },
  },

  // ══ ratios_proportions — 4 items ════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 2,
    stem_md:
      "A jar holds only red and blue marbles, in the ratio $3$ to $5$. If the jar holds $72$ marbles in all, how many of them are red?",
    choices: ["$9$", "$24$", "$27$", "$45$", "$120$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe ratio splits the jar into $3 + 5 = 8$ equal parts. One part is $72/8 = 9$ marbles, and red is $3$ parts: $3 \\times 9 = 27$.\n\n**Trigger cue**\nA ratio plus a total means part-to-whole. Add the ratio terms first; that sum, not either term, is what divides the total.\n\n**Takeaway**\nAdd the ratio terms — the sum is what divides the total.",
    fastest_path_md:
      "$72 \\div 8 = 9$ per part; red is $3$ parts $= 27$.",
    trap_map: {
      "0": "Reports the size of one part instead of the three parts red actually holds.",
      "1": "Divides the total by the red term ($72/3$) rather than by the sum of the terms.",
      "3": "Answers for blue — the right arithmetic on the wrong colour.",
      "4": "Scales the total by $5/3$, treating the ratio as a multiplier on the whole jar.",
    },
    numeric_check: "72*3/8",
    check() {
      // Search the integers rather than reason about parts.
      const found = [];
      for (let red = 0; red <= 72; red++) {
        const blue = 72 - red;
        if (red * 5 === blue * 3) found.push(red);
      }
      if (found.length !== 1) throw new Error(`${found.length} splits work`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 72 / 8, "1": 72 / 3, "3": (72 * 5) / 8, "4": (72 * 5) / 3 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 2,
    stem_md:
      "Six identical printers, working together, print $1{,}500$ pages in one hour. At the same rate, how many pages would eight such printers print in one hour?",
    choices: ["$250$", "$1{,}125$", "$2{,}000$", "$4{,}500$", "$12{,}000$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nOne printer prints $1{,}500/6 = 250$ pages an hour. Eight of them print $8 \\times 250 = 2{,}000$.\n\n**Trigger cue**\n\"Identical machines at the same rate\" is direct proportion: find the one-unit rate, then scale. It also lets you sanity-check — eight printers is a third more than six, so the answer must be a third more than $1{,}500$.\n\n**Takeaway**\nGet the one-unit rate first, then scale it.",
    fastest_path_md:
      "$8/6 = 4/3$ of the printers, so $4/3$ of the pages: $1{,}500 \\times 4/3 = 2{,}000$.",
    trap_map: {
      "0": "Stops at the per-printer rate.",
      "1": "Inverts the proportion, scaling by $6/8$ as though more printers meant fewer pages.",
      "3": "Treats each of the two extra printers as printing a full $1{,}500$: $1{,}500 + 2(1{,}500)$.",
      "4": "Multiplies by $8$ without first dividing by $6$.",
    },
    numeric_check: "1500/6*8",
    check() {
      const found = [];
      for (let pages = 0; pages <= 20000; pages++) {
        if (pages * 6 === 1500 * 8) found.push(pages);
      }
      if (found.length !== 1) throw new Error(`${found.length} totals work`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return {
        "0": 1500 / 6,
        "1": (1500 * 6) / 8,
        "3": 1500 + 2 * 1500,
        "4": 1500 * 8,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "Three partners divide $\\$180$ in the ratio $2 : 3 : 4$. How many dollars does the partner with the largest share receive?",
    choices: ["$20$", "$40$", "$60$", "$80$", "$120$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe ratio has $2 + 3 + 4 = 9$ parts, so one part is $180/9 = 20$. The largest share is $4$ parts: $4 \\times 20 = 80$.\n\n**Trigger cue**\nA three-term ratio works exactly like a two-term one — sum every term, divide once, then scale to the term you were asked about.\n\n**Takeaway**\nSum all the terms, even when you need only one of them.",
    fastest_path_md:
      "One part $= 180/9 = 20$; largest $= 4 \\times 20 = 80$.",
    trap_map: {
      "0": "Reports one part rather than the four parts the largest share holds.",
      "1": "Answers for the smallest partner.",
      "2": "Answers for the middle partner.",
      "4": "Divides by $2 + 4 = 6$, dropping the middle term from the sum.",
    },
    numeric_check: "180*4/9",
    check() {
      const found = [];
      for (let part = 1; part <= 180; part++) {
        if (2 * part + 3 * part + 4 * part === 180) found.push(4 * part);
      }
      if (found.length !== 1) throw new Error(`${found.length} parts work`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 180 / 9, "1": (180 * 2) / 9, "2": (180 * 3) / 9, "4": (180 * 4) / 6 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "ratios_proportions",
    difficulty: 3,
    stem_md:
      "A recipe calls for flour and sugar in the ratio $5 : 2$ by weight. A baker uses $3$ kilograms of sugar and keeps the ratio exact. How many kilograms of flour does the baker use?",
    choices: ["$1.2$", "$5$", "$6$", "$7.5$", "$10.5$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nSet up flour$/$sugar $= 5/2$. With sugar $= 3$, flour $= 3 \\times 5/2 = 7.5$.\n\n**Trigger cue**\nOnly one part is given, so this is part-to-part, not part-to-whole. Write the ratio as a fraction with the *known* quantity on the bottom and the answer follows by one multiplication.\n\n**Takeaway**\nPut the known quantity in the denominator; the ratio does the rest.",
    fastest_path_md:
      "$2$ parts of sugar is $3$ kg, so one part is $1.5$ kg and $5$ parts is $7.5$ kg.",
    trap_map: {
      "0": "Inverts the ratio: $3 \\times 2/5$. Flour is the larger term, so any answer below $3$ is wrong on sight.",
      "1": "Reads the ratio term itself as the weight.",
      "2": "Doubles the sugar, using the $2$ rather than the $5$.",
      "4": "Uses total $:$ sugar $= 7 : 2$ and reports the combined weight instead of the flour.",
    },
    numeric_check: "3*5/2",
    check() {
      // Search in tenths of a kilogram for the weight that keeps 5:2 exact.
      const found = [];
      for (let tenths = 1; tenths <= 1000; tenths++) {
        if (tenths * 2 === 30 * 5) found.push(tenths / 10);
      }
      if (found.length !== 1) throw new Error(`${found.length} weights work`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": (3 * 2) / 5, "1": 5, "2": 3 * 2, "4": (3 * 7) / 2 };
    },
  },

  // ══ mixtures_weighted_avg — 3 items ═════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 2,
    stem_md:
      "A student's average score on her first $3$ tests is $78$. She scores $90$ on her fourth test. What is her average score on all $4$ tests?",
    choices: ["$78$", "$81$", "$84$", "$90$", "$324$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nAn average of $78$ over $3$ tests means a total of $3 \\times 78 = 234$. Adding $90$ gives $324$ over $4$ tests, so the average is $324/4 = 81$.\n\n**Trigger cue**\nAn average is never averaged with a new value — convert it back into a sum, add, then divide by the new count.\n\n**Takeaway**\nTurn an average into a sum before combining it with anything.",
    fastest_path_md:
      "The new score is $12$ above the old average, spread over $4$ tests: $78 + 12/4 = 81$.",
    trap_map: {
      "0": "Ignores the fourth test.",
      "2": "Averages the old average with the new score, $(78 + 90)/2$, which silently gives the fourth test the weight of three.",
      "3": "Reports the new score.",
      "4": "Reports the total of the four scores rather than their average.",
    },
    numeric_check: "(3*78+90)/4",
    check() {
      const scores = [78, 78, 78, 90];
      let sum = 0;
      for (const s of scores) sum += s;
      return { kind: "value", value: sum / scores.length };
    },
    trap_values() {
      return { "0": 78, "2": (78 + 90) / 2, "3": 90, "4": 3 * 78 + 90 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "A chemist mixes $12$ liters of a $25\\%$ salt solution with $8$ liters of a $50\\%$ salt solution. What percent of the resulting mixture is salt?",
    choices: ["$7\\%$", "$35\\%$", "$37.5\\%$", "$40\\%$", "$75\\%$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nTrack the salt, not the percentages: $25\\%$ of $12 = 3$ liters and $50\\%$ of $8 = 4$ liters, so $7$ liters of salt in $20$ liters of mixture, which is $7/20 = 35\\%$.\n\n**Trigger cue**\nTwo solutions poured together — convert each percentage into an amount of the thing being measured, add the amounts, add the volumes, divide once at the end.\n\n**Takeaway**\nMix amounts, not percentages.\n",
    fastest_path_md:
      "Salt $= 3 + 4 = 7$ liters in $20$ liters total, so $7/20 = 35\\%$. The answer must sit between $25$ and $50$ and nearer $25$, since more of the weaker solution went in.",
    trap_map: {
      "0": "Reports the liters of salt as though the number were a percent.",
      "2": "Averages $25$ and $50$ with no weighting, which would be right only for equal volumes.",
      "3": "Weights each concentration by the *other* solution's volume.",
      "4": "Adds the two percentages.",
    },
    numeric_check: null,
    check(q) {
      // Work in deciliters so every quantity is an integer.
      const saltA = (120 * 25) / 100;
      const saltB = (80 * 50) / 100;
      const pct = ((saltA + saltB) / (120 + 80)) * 100;
      return { kind: "index", index: percentIndex(q, pct) };
    },
    trap_values() {
      return {
        "0": pctText((120 * 25) / 100 / 10 + (80 * 50) / 100 / 10),
        "2": pctText((25 + 50) / 2),
        "3": pctText((8 * 25 + 12 * 50) / 20),
        "4": pctText(25 + 50),
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "mixtures_weighted_avg",
    difficulty: 3,
    stem_md:
      "In a class, the $10$ boys have an average height of $150$ centimeters and the $15$ girls have an average height of $160$ centimeters. What is the average height, in centimeters, of all $25$ students?",
    choices: ["$154$", "$155$", "$156$", "$310$", "$3{,}900$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nTotal height $= 10(150) + 15(160) = 1{,}500 + 2{,}400 = 3{,}900$ centimeters over $25$ students, so the average is $3{,}900/25 = 156$.\n\n**Trigger cue**\nTwo groups of different sizes: the combined average always leans toward the *larger* group. There are more girls, so the answer must sit above the midpoint of $155$.\n\n**Takeaway**\nA weighted average leans toward the bigger group.",
    fastest_path_md:
      "Girls outnumber boys $15$ to $10$, so the average sits $3/5$ of the way from $150$ to $160$: $150 + 6 = 156$.",
    trap_map: {
      "0": "Swaps the group sizes, pulling the average toward the boys instead.",
      "1": "Averages $150$ and $160$ without weighting — correct only if the groups were the same size.",
      "3": "Adds the two averages.",
      "4": "Reports the total height rather than the average.",
    },
    numeric_check: "(10*150+15*160)/25",
    check() {
      const heights = [];
      for (let i = 0; i < 10; i++) heights.push(150);
      for (let i = 0; i < 15; i++) heights.push(160);
      let sum = 0;
      for (const h of heights) sum += h;
      return { kind: "value", value: sum / heights.length };
    },
    trap_values() {
      return {
        "0": (15 * 150 + 10 * 160) / 25,
        "1": (150 + 160) / 2,
        "3": 150 + 160,
        "4": 10 * 150 + 15 * 160,
      };
    },
  },
];

verifyAndAppend(items, { requireTrapValues: true });
