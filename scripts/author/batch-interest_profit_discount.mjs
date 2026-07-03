/**
 * Batch: 4 new interest_profit_discount items (rates_ratio_percent, arithmetic).
 *   1. D5 PS real — profit stated as a percent of SELLING price, plus a markdown
 *   2. D4 PS real — simple interest with an 8-month term (time-in-years conversion)
 *   3. D4 PS real — loss-to-profit dollar swing spanning a percent gap on cost
 *   4. D4 PS real — semiannual compounding (per-period rate conversion)
 *
 * Run: node scripts/author/batch-interest_profit_discount.mjs
 * Append for real: APPEND=1 node scripts/author/batch-interest_profit_discount.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  // ── 1. D5 — profit as a percent of the selling price ────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "An antiques dealer prices a rug so that her profit is $25\\%$ of the selling price. During a weekend sale she reduces the selling price by $10\\%$ and sells the rug, earning a profit of $\\$66$. How many dollars did the dealer pay for the rug?",
    choices: ["198", "330", "396", "440", "528"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $S$ be the original selling price. The profit is $25\\%$ of the selling price, so the cost is $C = S - 0.25S = 0.75S$. The sale price is $0.9S$, so the realized profit is $0.9S - 0.75S = 0.15S$. Setting $0.15S = 66$ gives $S = 440$, and $C = 0.75 \\times 440 = 330$.\n\n**Trigger cue**\nProfit quoted as a percent of the *selling price*, not of cost — make the selling price the variable and write every quantity as a fraction of it.\n\n**Takeaway**\nWhen profit is a percent of price, cost is the derived fraction.",
    fastest_path_md:
      "Anchor everything to the original price $S$: cost $= 0.75S$, sale price $= 0.9S$, so profit $= 0.15S = \\$66$. Then $S = 440$ and cost $= 0.75 \\times 440 = 330$.",
    trap_map: {
      "0": "Ignores the $10\\%$ markdown and sets $0.25S = 66$, giving $S = 264$ and cost $0.75 \\times 264 = 198$.",
      "2": "Reports the discounted selling price $0.9 \\times 440 = 396$ instead of the cost.",
      "3": "Reports the original selling price $S = 440$ instead of the cost.",
      "4": "Treats the $25\\%$ as profit on cost, solving $1.25C \\times 0.9 - C = 0.125C = 66$ for $C = 528$.",
    },
    numeric_check: "0.75*(66/0.15)",
    check() {
      // Brute-force scan of original selling prices in cents.
      const found = [];
      for (let sc = 1; sc <= 200000; sc++) {
        const S = sc / 100;
        const cost = S - 0.25 * S; // profit is 25% of the selling price
        const profit = 0.9 * S - cost; // sold at 10% off the price
        if (Math.abs(profit - 66) < 1e-7) found.push(cost);
      }
      if (found.length !== 1) throw new Error(`expected unique cost, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 2. D4 — simple interest, 8-month term, solve for annual rate ────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "Marisol lent $\\$5{,}000$ to a colleague at simple annual interest. Exactly $8$ months later, the colleague settled the loan with a single payment of $\\$5{,}240$. What was the annual interest rate on the loan?",
    choices: ["$3.2\\%$", "$4.8\\%$", "$6\\%$", "$7.2\\%$", "$9.6\\%$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe interest paid is $5240 - 5000 = 240$ dollars. Simple interest satisfies $I = P \\cdot r \\cdot t$ with $t$ in years, and $8$ months is $\\tfrac{8}{12} = \\tfrac{2}{3}$ year. So $240 = 5000 \\cdot r \\cdot \\tfrac{2}{3}$, which gives $r = \\dfrac{240 \\cdot 3}{5000 \\cdot 2} = 0.072 = 7.2\\%$.\n\n**Trigger cue**\nA simple-interest term stated in months with an annual rate requested — convert the time to years before solving.\n\n**Takeaway**\nSimple interest measures time in years; annualize a partial-year rate upward.",
    fastest_path_md:
      "The $\\$240$ interest is $4.8\\%$ of $\\$5{,}000$, but it was earned in only $\\tfrac{2}{3}$ of a year, so the annual rate is $4.8\\% \\times \\tfrac{3}{2} = 7.2\\%$.",
    trap_map: {
      "0": "Multiplies by the time fraction instead of dividing: $4.8\\% \\times \\tfrac{2}{3} = 3.2\\%$.",
      "1": "Computes $240/5000 = 4.8\\%$ and stops, ignoring that the term is only $8$ months.",
      "2": "Converts $8$ months to $0.8$ year (dividing by $10$ instead of $12$): $240/(5000 \\times 0.8) = 6\\%$.",
      "4": "Treats the $8$-month term as half a year: $240/(5000 \\times 0.5) = 9.6\\%$.",
    },
    numeric_check: null,
    check(q) {
      // Simulate the loan payoff for each candidate rate; exactly one must fit.
      const P = 5000;
      const payment = 5240;
      const tYears = 8 / 12;
      const matches = [];
      q.choices.forEach((c, i) => {
        const r = parseFloat(c.replace(/[^0-9.]/g, ""));
        const paid = P * (1 + (r / 100) * tYears);
        if (Math.abs(paid - payment) < 1e-6) matches.push(i);
      });
      if (matches.length !== 1) throw new Error(`expected exactly one fitting rate, got ${matches.length}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 3. D4 — dollar swing from a 12% loss to an 8% profit ────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "A collector bought a vintage movie poster and later sold it at a $12\\%$ loss. If she had sold the poster for $\\$90$ more, she would instead have earned an $8\\%$ profit. How many dollars did the collector pay for the poster?",
    choices: ["396", "450", "750", "1125", "2250"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $C$ be the cost. The actual selling price was $0.88C$, and the hypothetical price was $1.08C$. The gap between them is $1.08C - 0.88C = 0.20C$, and this gap is the extra $\\$90$. So $0.20C = 90$, giving $C = 450$.\n\n**Trigger cue**\nOne sale described at two outcomes — a loss percent and a profit percent — with the dollar difference given: the difference spans the *sum* of the two percents of cost.\n\n**Takeaway**\nA loss-to-profit swing covers the sum of both percents of cost.",
    fastest_path_md:
      "The $\\$90$ carries the price from $12\\%$ below cost to $8\\%$ above cost, a span of $20\\%$ of cost: $90/0.20 = 450$.",
    trap_map: {
      "0": "Reports the actual selling price $0.88 \\times 450 = 396$ instead of the cost.",
      "2": "Divides the $\\$90$ by the loss percent alone: $90/0.12 = 750$.",
      "3": "Divides the $\\$90$ by the profit percent alone: $90/0.08 = 1125$.",
      "4": "Uses the difference of the percents, $12\\% - 8\\% = 4\\%$, instead of their sum: $90/0.04 = 2250$.",
    },
    numeric_check: "90/0.20",
    check() {
      // Brute-force scan of costs in cents.
      const found = [];
      for (let cc = 1; cc <= 1000000; cc++) {
        const C = cc / 100;
        const lossPrice = 0.88 * C; // sold at a 12% loss
        const profitPrice = 1.08 * C; // would have been an 8% profit
        if (Math.abs(profitPrice - lossPrice - 90) < 1e-7) found.push(C);
      }
      if (found.length !== 1) throw new Error(`expected unique cost, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 4. D4 — semiannual compounding, interest earned in one year ─────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "Priya deposits $\\$12{,}500$ into a savings account that pays $4\\%$ annual interest, compounded semiannually. If she makes no other deposits or withdrawals, how many dollars of interest does the account earn during the first year?",
    choices: ["250", "500", "505", "510", "1020"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nCompounded semiannually, the account credits $\\tfrac{4\\%}{2} = 2\\%$ per six-month period, twice. After one year the balance is $12500 \\times 1.02^2 = 12500 \\times 1.0404 = 13005$, so the interest earned is $13005 - 12500 = 505$.\n\n**Trigger cue**\nA rate \"compounded semiannually\" (or quarterly): halve (or quarter) the annual rate, then apply it once per period.\n\n**Takeaway**\nHalve the rate, double the periods; the excess over simple is interest-on-interest.",
    fastest_path_md:
      "Two periods of $2\\%$ on $\\$12{,}500$ give $250 + 250 = 500$ of base interest, plus $2\\%$ of the first period's $\\$250$, which is $\\$5$: total $\\$505$.",
    trap_map: {
      "0": "Applies only one six-month period of $2\\%$: $12500 \\times 0.02 = 250$.",
      "1": "Uses $4\\%$ for the year with no compounding, missing the interest-on-interest: $12500 \\times 0.04 = 500$.",
      "3": "Computes the second period's interest, $2\\%$ of $12750 = 255$, and doubles it to $510$.",
      "4": "Treats $4\\%$ as the rate per six-month period: $12500 \\times (1.04^2 - 1) = 1020$.",
    },
    numeric_check: "12500*(1.02^2 - 1)",
    check() {
      // Simulate the account period by period from the raw data.
      const principal = 12500;
      const annualRate = 0.04;
      const periodsPerYear = 2;
      let balance = principal;
      for (let p = 0; p < periodsPerYear; p++) {
        balance += balance * (annualRate / periodsPerYear);
      }
      return { kind: "value", value: balance - principal };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
