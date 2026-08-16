/**
 * Batch: 13 new interest_profit_discount items (rates_ratio_percent).
 * Cells: D2 ×5, D3 ×7, D5 ×1 — the subtopic held only D4/D5 items and had
 * no D2 or D3 at all, so its chapter test could not be built.
 * Trap language tracks the chapter: adding stacked percents, wrong profit
 * base, symmetric up-then-down, forgetting to convert months, compounding
 * at the full annual rate, reporting the amount instead of the interest.
 * Run: node scripts/author/batch-interest_profit_discount-v2.mjs
 *      (APPEND=1 to write the bank)
 */
import { choiceIndexForValue, verifyAndAppend } from "./harness.mjs";

const S = {
  format: "problem_solving",
  content_domain: "arithmetic",
  context: "real",
  fundamental_skill: "rates_ratio_percent",
  subtopic: "interest_profit_discount",
};

const items = [
  // 1 — D2: profit on cost, with the margin misread as the near miss
  {
    ...S,
    difficulty: 2,
    stem_md:
      "A retailer buys a lamp for $\\$96$ and sells it at a price that yields a profit equal to $25\\%$ of the cost. What is the selling price, in dollars?",
    choices: ["$24$", "$72$", "$120$", "$121$", "$128$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nA profit of $25\\%$ *of cost* means $S = C(1 + 0.25) = 1.25C$. With $C = 96$, the selling price is $1.25 \\times 96 = 120$.\n\n**Trigger cue**\n\n\"Profit equal to $k\\%$ of the cost\": write $S = (1+k)C$ on sight — the base is the cost.\n\n**Takeaway**\n\nProfit on cost multiplies the cost by $1 + k$.",
    fastest_path_md: "$96 + \\frac{96}{4} = 96 + 24 = 120$.",
    trap_map: {
      "0": "Reports the profit, $0.25 \\times 96$, instead of the selling price.",
      "1": "Subtracts the $25\\%$ instead of adding it.",
      "3": "Adds the percent as if it were dollars, $96 + 25$.",
      "4": "Reads the profit as $25\\%$ of the selling price, solving $96 = 0.75S$.",
    },
    numeric_check: "96*1.25",
    check() {
      const cost = 96;
      let price = null;
      for (let cents = 0; cents <= 30000; cents++) {
        const s = cents / 100;
        if (Math.abs(s - cost - 0.25 * cost) < 1e-9) price = s;
      }
      if (price == null) throw new Error("no price");
      return { kind: "value", value: price };
    },
  },

  // 2 — D2: two discounts do not add
  {
    ...S,
    difficulty: 2,
    stem_md:
      "A jacket listed at $\\$200$ is discounted by $20\\%$, and the resulting sale price is then discounted by a further $10\\%$. What is the final price, in dollars?",
    choices: ["$140$", "$144$", "$150$", "$160$", "$180$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nEach discount acts on the current price, so the factors multiply: $200 \\times 0.80 \\times 0.90 = 200 \\times 0.72 = 144$.\n\n**Trigger cue**\n\n\"Discounted $x\\%$, then a further $y\\%$ off\": multiply the factors into one net multiplier before touching any dollar amount.\n\n**Takeaway**\n\nStacked percents multiply; they never add.",
    fastest_path_md: "$0.8 \\times 0.9 = 0.72$; $200 \\times 0.72 = 144$.",
    trap_map: {
      "0": "Adds the discounts into a single $30\\%$ off.",
      "2": "Averages the two discounts into one $25\\%$ off.",
      "3": "Applies only the first discount.",
      "4": "Applies only the second discount.",
    },
    numeric_check: "200*0.8*0.9",
    check() {
      let price = 200;
      for (const off of [0.2, 0.1]) price = price - price * off;
      return { kind: "value", value: price };
    },
  },

  // 3 — D2: simple interest with a term in months
  {
    ...S,
    difficulty: 2,
    stem_md:
      "How much simple interest, in dollars, does a deposit of $\\$4{,}500$ earn in $8$ months at an annual rate of $6\\%$?",
    choices: ["$22.50$", "$180$", "$216$", "$270$", "$2{,}160$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\n$I = Prt$ with $t$ in years: $t = \\frac{8}{12} = \\frac{2}{3}$. So $I = 4500 \\times 0.06 \\times \\frac{2}{3} = 270 \\times \\frac{2}{3} = 180$.\n\n**Trigger cue**\n\nA simple-interest term stated in months: convert to $t = \\frac{\\text{months}}{12}$ before anything else.\n\n**Takeaway**\n\nSimple-interest time is always measured in years.",
    fastest_path_md:
      "A full year would earn $\\$270$; eight months is two-thirds of that, $\\$180$.",
    trap_map: {
      "0": "Divides by $12$ a second time, treating the answer as a monthly figure.",
      "2": "Reads $8$ months as $0.8$ of a year.",
      "3": "Ignores the term and charges a full year of interest.",
      "4": "Plugs $t = 8$ years instead of $\\frac{8}{12}$.",
    },
    numeric_check: "4500*0.06*(8/12)",
    check() {
      const monthly = (4500 * 0.06) / 12;
      let interest = 0;
      for (let m = 0; m < 8; m++) interest += monthly;
      return { kind: "value", value: interest };
    },
  },

  // 4 — D2: which base does "percent of" attach to
  {
    ...S,
    difficulty: 2,
    stem_md:
      "A vendor sold a bicycle for $\\$2{,}500$, which was $\\$500$ more than what she paid for it. Her profit was what percent of her cost?",
    choices: ["$20\\%$", "$25\\%$", "$80\\%$", "$125\\%$", "$500\\%$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nCost is $2500 - 500 = 2000$ and profit is $500$. As a percent of cost, that is $\\frac{500}{2000} = 0.25 = 25\\%$.\n\n**Trigger cue**\n\n\"Profit was what percent of the cost\": the word after \"of\" names the denominator — divide by cost, not by the sale price.\n\n**Takeaway**\n\nThe quantity after \"of\" is always the denominator.",
    fastest_path_md: "$\\frac{500}{2000} = \\frac{1}{4} = 25\\%$.",
    trap_map: {
      "0": "Divides the profit by the selling price, $\\frac{500}{2500}$.",
      "2": "Reports the cost as a percent of the selling price.",
      "3": "Reports the selling price as a percent of the cost.",
      "4": "Divides the selling price by the profit.",
    },
    numeric_check: null,
    check(q) {
      const sale = 2500;
      const profit = 500;
      const cost = sale - profit;
      return choiceIndexForValue(q.choices, (profit / cost) * 100);
    },
  },

  // 5 — D2: up then down by the same percent
  {
    ...S,
    difficulty: 2,
    stem_md:
      "The price of a stock rose by $20\\%$ during January and then fell by $20\\%$ during February. Its price at the end of February was what percent of its price at the start of January?",
    choices: ["$80\\%$", "$96\\%$", "$100\\%$", "$120\\%$", "$144\\%$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nThe net factor is $1.20 \\times 0.80 = 0.96$, so the ending price is $96\\%$ of the starting price. The fall is larger in dollars than the rise because it acts on the higher January price.\n\n**Trigger cue**\n\nA rise of $x\\%$ followed by a fall of $x\\%$: multiply $(1+x)(1-x) = 1 - x^{2}$ — always a net loss.\n\n**Takeaway**\n\nUp then down by the same percent always ends below par.",
    fastest_path_md: "$1.2 \\times 0.8 = 0.96$, so $96\\%$.",
    trap_map: {
      "0": "Applies only February's fall.",
      "2": "Assumes a $20\\%$ rise and a $20\\%$ fall cancel exactly.",
      "3": "Applies only January's rise.",
      "4": "Treats both months as rises, $1.2 \\times 1.2$.",
    },
    numeric_check: null,
    check(q) {
      let price = 100;
      price *= 1 + 0.2;
      price *= 1 - 0.2;
      return choiceIndexForValue(q.choices, price);
    },
  },

  // 6 — D3: margin on price converted to markup on cost
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A store's profit on a certain item is $20\\%$ of the item's selling price. The profit is what percent of the item's cost?",
    choices: ["$16\\%$", "$20\\%$", "$25\\%$", "$40\\%$", "$80\\%$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nProfit $= 0.2S$, so cost is $C = S - 0.2S = 0.8S$. Then $\\frac{\\text{profit}}{C} = \\frac{0.2S}{0.8S} = 0.25 = 25\\%$.\n\n**Trigger cue**\n\n\"Profit of $k\\%$ of the selling price\": write $C = (1-k)S$ immediately, then re-base whatever the question asks for.\n\n**Takeaway**\n\nA margin of $m$ on price is a markup of $\\frac{m}{1-m}$ on cost.",
    fastest_path_md:
      "Set $S = 100$: profit $20$, cost $80$, so $\\frac{20}{80} = 25\\%$.",
    trap_map: {
      "0": "Takes $20\\%$ of the $80\\%$ cost share instead of dividing by it.",
      "1": "Reports the given margin unchanged, as though the base did not matter.",
      "3": "Doubles the margin.",
      "4": "Reports the cost as a percent of the selling price.",
    },
    numeric_check: null,
    check(q) {
      const price = 100;
      const profit = 0.2 * price;
      const cost = price - profit;
      return choiceIndexForValue(q.choices, (profit / cost) * 100);
    },
  },

  // 7 — D3: two-scenario pivot on one cost
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A merchant would incur a loss equal to $12\\%$ of his cost if he sold a desk for $\\$462$. How many more dollars must he charge instead in order to earn a profit equal to $8\\%$ of his cost?",
    choices: ["$42$", "$92.40$", "$105$", "$126$", "$567$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nA $12\\%$ loss means $0.88C = 462$, so $C = 525$. The target price is $1.08C = 567$, and the increase is $567 - 462 = 105$. Equivalently, the gap between the two scenarios is $(12\\% + 8\\%)$ of cost: $0.20 \\times 525 = 105$.\n\n**Trigger cue**\n\n\"Sold at a loss of $a\\%$; $\\$d$ more would give a profit of $b\\%$\": the dollar gap is $(a+b)\\%$ of the cost.\n\n**Takeaway**\n\nBetween two scenarios on one cost, percent gap times cost equals the dollar gap.",
    fastest_path_md:
      "$C = \\frac{462}{0.88} = 525$; the gap is $20\\%$ of cost, $0.2 \\times 525 = 105$.",
    trap_map: {
      "0": "Computes only the $8\\%$ profit, forgetting he must first recover the $12\\%$ loss.",
      "1": "Applies the $20\\%$ gap to the $\\$462$ sale price instead of to the cost.",
      "3": "Uses $24\\%$ of cost, doubling the loss rather than adding the profit to it.",
      "4": "Reports the new selling price rather than the increase.",
    },
    numeric_check: "525*1.08 - 462",
    check() {
      let cost = null;
      for (let cents = 1; cents <= 200000; cents++) {
        const c = cents / 100;
        if (Math.abs(c * 0.88 - 462) < 1e-9) cost = c;
      }
      if (cost == null) throw new Error("no cost");
      return { kind: "value", value: cost * 1.08 - 462 };
    },
  },

  // 8 — D3: semiannual compounding, and the question asks for interest
  {
    ...S,
    difficulty: 3,
    stem_md:
      "Marcus deposits $\\$8{,}000$ into an account paying $5\\%$ annual interest, compounded semiannually. How much interest, in dollars, does the account earn in one year?",
    choices: ["$200$", "$400$", "$405$", "$820$", "$8{,}405$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nSemiannual compounding at $5\\%$ annual means two periods of $2.5\\%$ each. The balance after a year is $8000(1.025)^{2} = 8000 \\times 1.050625 = 8405$, so the interest earned is $8405 - 8000 = 405$.\n\n**Trigger cue**\n\n\"Compounded semiannually\": halve the annual rate, double the period count, and only then compute.\n\n**Takeaway**\n\nPer-period rate is $\\frac{r}{n}$; interest is the balance minus the principal.",
    fastest_path_md:
      "Two periods of $2.5\\%$: $\\$200$ then $\\$205$, so $\\$405$ — the extra $\\$5$ is interest on interest.",
    trap_map: {
      "0": "Counts only the first semiannual period.",
      "1": "Uses simple interest at $5\\%$ for the year.",
      "3": "Compounds at the full annual rate for two periods, $8000(1.05)^{2} - 8000$.",
      "4": "Reports the ending balance rather than the interest earned.",
    },
    numeric_check: "8000*1.025^2 - 8000",
    check() {
      let balance = 8000;
      for (let period = 0; period < 2; period++) balance *= 1 + 0.05 / 2;
      return { kind: "value", value: balance - 8000 };
    },
  },

  // 9 — D3: markup then discount, read against cost
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A shop lists a coat at a price $60\\%$ above its cost. During a sale, the shop sells the coat at $25\\%$ off the list price. The sale price is what percent of the cost?",
    choices: ["$75\\%$", "$120\\%$", "$135\\%$", "$160\\%$", "$200\\%$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\n\nList is $1.60C$ and the sale takes $25\\%$ off that: $1.60 \\times 0.75 = 1.20$. The sale price is $120\\%$ of cost — still a $20\\%$ profit.\n\n**Trigger cue**\n\n\"Marks up $x\\%$, then discounts $y\\%$\": compress to the single factor $(1+x)(1-y)$ before introducing any dollar amount.\n\n**Takeaway**\n\nOne net multiplier answers the whole chain.",
    fastest_path_md: "$1.6 \\times 0.75 = 1.2$, so $120\\%$.",
    trap_map: {
      "0": "Applies only the discount, forgetting the markup.",
      "2": "Subtracts the discount percent from the markup percent, $160 - 25$.",
      "3": "Applies only the markup, forgetting the sale.",
      "4": "Multiplies $1.6$ by $1.25$, treating the discount as another markup.",
    },
    numeric_check: null,
    check(q) {
      let price = 100;
      price *= 1 + 0.6;
      price *= 1 - 0.25;
      return choiceIndexForValue(q.choices, price);
    },
  },

  // 10 — D3: solve simple interest for the annual rate
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A loan of $\\$7{,}200$ was repaid after $9$ months, together with $\\$486$ in simple interest. What was the annual interest rate on the loan?",
    choices: ["$0.75\\%$", "$6.75\\%$", "$9\\%$", "$13.5\\%$", "$27\\%$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\n$I = Prt$ with $t = \\frac{9}{12} = 0.75$ years: $486 = 7200 \\cdot r \\cdot 0.75 = 5400r$, so $r = \\frac{486}{5400} = 0.09 = 9\\%$.\n\n**Trigger cue**\n\n\"Settled the loan after $m$ months\" with simple interest: divide by $P \\cdot \\frac{m}{12}$ to recover the annual rate.\n\n**Takeaway**\n\nRate is interest divided by principal times years.",
    fastest_path_md:
      "Nine months of interest is $\\$486$, so a year is $\\frac{4}{3}$ of that, $\\$648$; $\\frac{648}{7200} = 9\\%$.",
    trap_map: {
      "0": "Plugs $t = 9$ years instead of $\\frac{9}{12}$.",
      "1": "Ignores the term entirely, dividing interest by principal.",
      "3": "Reads the term as $6$ months, using $t = 0.5$.",
      "4": "Reads \"$9$ months\" as a quarter of a year, using $t = 0.25$.",
    },
    numeric_check: null,
    check(q) {
      let rate = null;
      for (let bp = 1; bp <= 10000; bp++) {
        const r = bp / 10000;
        if (Math.abs(7200 * r * (9 / 12) - 486) < 1e-9) rate = r;
      }
      if (rate == null) throw new Error("no rate");
      return choiceIndexForValue(q.choices, rate * 100);
    },
  },

  // 11 — D3: the compound-minus-simple gap over two years
  {
    ...S,
    difficulty: 3,
    stem_md:
      "Priya invests $\\$12{,}000$ for two years at an annual interest rate of $5\\%$. How many more dollars of interest does she earn with annual compounding than she would earn with simple interest?",
    choices: ["$30$", "$60$", "$600$", "$1{,}200$", "$1{,}230$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\n\nCompound gives $12000(1.05)^{2} - 12000 = 1230$; simple gives $12000 \\times 0.05 \\times 2 = 1200$. The gap is $30$ — exactly the second year's interest on the first year's interest, $Pr^{2} = 12000 \\times 0.0025$.\n\n**Trigger cue**\n\n\"How much more with compounding\" over two annual periods: reach straight for $Pr^{2}$.\n\n**Takeaway**\n\nOver two years, compounding beats simple by exactly $Pr^{2}$.",
    fastest_path_md:
      "First year's interest is $\\$600$; the gap is a year of interest on it, $600 \\times 0.05 = \\$30$.",
    trap_map: {
      "1": "Charges the gap once per year, doubling $Pr^{2}$.",
      "2": "Reports one year's interest.",
      "3": "Reports the total simple interest.",
      "4": "Reports the total compound interest rather than the difference.",
    },
    numeric_check: "12000*1.05^2 - 12000 - 12000*0.05*2",
    check() {
      let compound = 12000;
      for (let year = 0; year < 2; year++) compound *= 1.05;
      let simple = 12000;
      for (let year = 0; year < 2; year++) simple += 12000 * 0.05;
      return { kind: "value", value: compound - simple };
    },
  },

  // 12 — D3: successive markups, reported as an increase
  {
    ...S,
    difficulty: 3,
    stem_md:
      "A wholesaler marks up an item by $25\\%$ and sells it to a retailer, who marks that price up by a further $40\\%$ and sells it to consumers. The consumer price is what percent greater than the wholesaler's cost?",
    choices: ["$15\\%$", "$65\\%$", "$75\\%$", "$125\\%$", "$175\\%$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nThe net factor is $1.25 \\times 1.40 = 1.75$. A factor of $1.75$ is a $75\\%$ increase, since the percent change is the multiplier minus $1$.\n\n**Trigger cue**\n\nTwo markups in a chain, asked as \"percent greater\": multiply the factors, then subtract $1$.\n\n**Takeaway**\n\nNet percent change is the multiplier minus one.",
    fastest_path_md:
      "Set cost $100$: $100 \\to 125 \\to 175$, an increase of $75$.",
    trap_map: {
      "0": "Subtracts the two markup percents.",
      "1": "Adds the two markup percents.",
      "3": "Reports the wholesaler's multiplier as a percent.",
      "4": "Reports the net multiplier, $175\\%$, instead of the increase it represents.",
    },
    numeric_check: null,
    check(q) {
      let price = 100;
      for (const up of [0.25, 0.4]) price += price * up;
      return choiceIndexForValue(q.choices, price - 100);
    },
  },

  // 13 — D5: two batches, two prices, one cost base
  {
    ...S,
    difficulty: 5,
    stem_md:
      "A retailer paid $\\$1{,}400$ for $200$ identical mugs. She sold $60\\%$ of the mugs at a price that gave a profit equal to $50\\%$ of the cost per mug, and sold every remaining mug at a price $30\\%$ below that first selling price. What was her total profit, in dollars, on the $200$ mugs?",
    choices: ["$252$", "$420$", "$448$", "$700$", "$1{,}848$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\n\nCost per mug is $\\frac{1400}{200} = 7$. The first price is $1.5 \\times 7 = 10.50$, and $60\\%$ of $200$ is $120$ mugs, giving $120 \\times 10.50 = 1260$. The second price is $30\\%$ below the *first price*: $0.70 \\times 10.50 = 7.35$, and $80$ mugs give $80 \\times 7.35 = 588$. Revenue is $1260 + 588 = 1848$, so profit is $1848 - 1400 = 448$.\n\n**Trigger cue**\n\nA discount stated as \"below that price\": the base is the earlier selling price, not the cost — check which anchor the sentence names.\n\n**Takeaway**\n\nEach percent attaches to the base its sentence names.",
    fastest_path_md:
      "Per mug: $\\$7$ cost, $\\$10.50$ then $\\$7.35$. Profit is $120(3.50) + 80(0.35) = 420 + 28 = 448$.",
    trap_map: {
      "0": "Discounts $30\\%$ off the cost per mug rather than off the first selling price.",
      "1": "Counts profit on the first batch only, treating the rest as sold at cost.",
      "3": "Assumes every mug sold at the $50\\%$-profit price.",
      "4": "Reports total revenue rather than profit.",
    },
    numeric_check: "120*10.5 + 80*7.35 - 1400",
    check() {
      const mugs = 200;
      const totalCost = 1400;
      const unitCost = totalCost / mugs;
      const firstPrice = unitCost * 1.5;
      const secondPrice = firstPrice * 0.7;
      let revenue = 0;
      const firstBatch = Math.round(mugs * 0.6);
      for (let i = 0; i < mugs; i++) {
        revenue += i < firstBatch ? firstPrice : secondPrice;
      }
      return { kind: "value", value: revenue - totalCost };
    },
  },
];

verifyAndAppend(items, { dryRun: process.env.APPEND !== "1" });
