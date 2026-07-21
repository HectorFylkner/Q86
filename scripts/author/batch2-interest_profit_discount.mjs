/**
 * Batch 2: 17 new interest_profit_discount items (rates_ratio_percent).
 *
 *   1. D2 PS real  — successive discounts, final price
 *   2. D2 PS real  — sale price as a percent of regular price
 *   3. D3 PS real  — split investment at two simple rates
 *   4. D3 PS real  — required markup to survive a discount with target profit
 *   5. D3 PS real  — markup then discount, profit percent of cost
 *   6. D3 PS real  — second-year vs first-year compound interest
 *   7. D3 PS pure  — years to double at simple interest (expression choices)
 *   8. D3 PS pure  — cost in terms of selling price (expression choices)
 *   9. D3 PS real  — break-even with discarded inventory
 *  10. D3 DS real  — coat cost: percent link vs dollar link (answer D)
 *  11. D4 DS real  — 100 lamps profit/loss, bound pruning (answer B)
 *  12. D5 DS real  — profit as percent of selling price, redundant statement (answer A)
 *  13. D5 PS real  — equal selling prices, equal ± percents, net result
 *  14. D4 PS real  — coupon-vs-percent discount ordering
 *  15. D4 PS real  — consecutive-year compound values reveal the rate
 *  16. D3 PS real  — equivalent single percent reduction
 *  17. D3 PS pure  — profit percent of selling price → percent of cost
 *
 * Run: node --experimental-strip-types scripts/author/batch2-interest_profit_discount.mjs
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

// Standard DS decision: sufficiency of (1) alone, (2) alone, and combined.
const dsAnswerIndex = (s1, s2, together) =>
  s1 && s2 ? 3 : s1 ? 0 : s2 ? 1 : together ? 2 : 4;

const items = [
  // ── 1. D2 — successive discounts, final price ───────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 2,
    stem_md:
      "A jacket has a list price of $\\$120$. The price is reduced by $20\\%$, and the reduced price is then reduced by an additional $25\\%$. What is the final price of the jacket, in dollars?",
    choices: ["48", "66", "72", "90", "96"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nApply the discounts in sequence as multipliers on the price: $120 \\times (1 - 0.20) = 96$, then $96 \\times (1 - 0.25) = 72$. The final price is $\\$72$.\n\n**Trigger cue**\nTwo discounts applied one after the other — multiply the remaining fractions, never add the percents.\n\n**Takeaway**\nSuccessive discounts multiply the remaining fractions; they never add.",
    fastest_path_md:
      "Multiply the keep-fractions once: $120 \\times 0.8 \\times 0.75 = 120 \\times 0.6 = 72$.",
    trap_map: {
      "0": "Reports the total amount saved, $120 - 72 = 48$, instead of the price paid.",
      "1": "Adds the discounts to $45\\%$ and takes $55\\%$ of $\\$120$.",
      "3": "Applies only the $25\\%$ discount to the list price.",
      "4": "Applies only the $20\\%$ discount to the list price.",
    },
    numeric_check: "120*0.8*0.75",
    check() {
      // Simulate the two reductions step by step.
      let p = 120;
      for (const d of [0.20, 0.25]) p -= p * d;
      return { kind: "value", value: p };
    },
  },

  // ── 2. D2 — sale price as a percent of regular price ────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 2,
    stem_md:
      "A blender regularly priced at $\\$120$ is on sale for $\\$90$. The sale price is what percent of the regular price?",
    choices: ["$25$", "$30$", "$33\\frac{1}{3}$", "$75$", "$133\\frac{1}{3}$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe question asks for the sale price as a percent *of* the regular price, so the regular price is the base: $\\dfrac{90}{120} = \\dfrac{3}{4} = 75\\%$.\n\n**Trigger cue**\n\"Is what percent of\" — the quantity after \"of\" is the denominator.\n\n**Takeaway**\nDivide by the base that follows \"of\", then scale to percent.",
    fastest_path_md:
      "$90/120$ reduces to $3/4$ on sight, so $75\\%$ — no long division needed.",
    trap_map: {
      "0": "Computes the percent decrease, $30/120 = 25\\%$, instead of the percent of.",
      "1": "Reports the dollar discount, $\\$30$, as a percent.",
      "2": "Divides the discount by the sale price: $30/90 = 33\\frac{1}{3}\\%$.",
      "4": "Inverts the ratio, computing the regular price as a percent of the sale price.",
    },
    numeric_check: "75",
    check() {
      // Scan percents on a fine grid: which p satisfies 120 * p/100 = 90?
      const found = [];
      for (let pi = 1; pi <= 20000; pi++) {
        const p = pi / 100;
        if (Math.abs((120 * p) / 100 - 90) < 1e-9) found.push(p);
      }
      if (found.length !== 1) throw new Error(`expected unique percent, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 3. D3 — split investment at two simple rates ────────────────────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "Lena invested a total of $\\$9{,}000$ in two accounts. One account earns $3\\%$ simple annual interest and the other earns $7\\%$ simple annual interest. If the two accounts together earned $\\$490$ in interest during the first year, how many dollars did Lena invest in the account earning $7\\%$?",
    choices: ["$3{,}500$", "$4{,}500$", "$4{,}900$", "$5{,}500$", "$7{,}000$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $x$ be the amount at $7\\%$; then $9000 - x$ is at $3\\%$. First-year interest: $0.07x + 0.03(9000 - x) = 490$, so $270 + 0.04x = 490$, giving $0.04x = 220$ and $x = 5500$.\n\n**Trigger cue**\nOne total split across two interest rates with combined interest given — one variable, one linear equation.\n\n**Takeaway**\nThe rate spread on the shifted dollars explains the extra interest.",
    fastest_path_md:
      "If all $\\$9{,}000$ sat at $3\\%$ it would earn $\\$270$; the extra $\\$220$ comes from dollars moved to $7\\%$, each gaining $4$ cents: $220/0.04 = 5{,}500$.",
    trap_map: {
      "0": "Solves correctly but reports the amount in the $3\\%$ account.",
      "1": "Assumes the $\\$9{,}000$ was split equally between the two accounts.",
      "2": "Divides the interest by the sum of the rates: $490/0.10 = 4{,}900$.",
      "4": "Attributes all $\\$490$ of interest to the $7\\%$ account: $490/0.07 = 7{,}000$.",
    },
    numeric_check: "5500",
    check() {
      // Brute-force scan of the 7% amount in cents.
      const found = [];
      for (let xc = 0; xc <= 900000; xc++) {
        const x = xc / 100;
        const interest = 0.03 * (9000 - x) + 0.07 * x;
        if (Math.abs(interest - 490) < 1e-7) found.push(x);
      }
      if (found.length !== 1) throw new Error(`expected unique split, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 4. D3 — required markup to survive a discount with target profit ────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "A retailer wants to advertise a coffee maker at a discount of $30\\%$ off its list price and still earn a profit equal to $5\\%$ of its cost. To do this, the retailer must set the list price at what percent above cost?",
    choices: ["25", "30", "35", "50", "150"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $C$ be cost and $L$ the list price. Selling at $30\\%$ off means the register price is $0.70L$, and the target requires $0.70L = 1.05C$. So $\\dfrac{L}{C} = \\dfrac{1.05}{0.70} = 1.5$: the list price must be $50\\%$ above cost.\n\n**Trigger cue**\nA planned discount that must still leave a target profit — divide the multipliers; do not add or subtract the percents.\n\n**Takeaway**\nPost-discount price must cover cost plus profit; divide multipliers, never add percents.",
    fastest_path_md:
      "Smart number: cost $= \\$100$, so the register must ring $\\$105$ after the $30\\%$ cut, forcing a list price of $105/0.7 = \\$150$ — that is $50\\%$ above cost.",
    trap_map: {
      "0": "Subtracts the percents: $30 - 5 = 25$.",
      "1": "Assumes the markup need only match the $30\\%$ discount.",
      "2": "Adds the percents: $30 + 5 = 35$.",
      "4": "Reports the list price as a percent of cost ($150\\%$) instead of the percent above cost.",
    },
    numeric_check: "50",
    check() {
      // Scan markup percents on a 0.01 grid with cost fixed at 100.
      const found = [];
      for (let mi = 0; mi <= 30000; mi++) {
        const m = mi / 100;
        const cost = 100;
        const list = cost * (1 + m / 100);
        const register = list * (1 - 0.30);
        if (Math.abs(register - cost * 1.05) < 1e-6) found.push(m);
      }
      if (found.length !== 1) throw new Error(`expected unique markup, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 5. D3 — markup then discount, profit percent of cost ────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "A boutique marks each handbag at $40\\%$ above its cost. During a promotion, every handbag is sold at $15\\%$ off the marked price. The boutique's profit on a handbag sold during the promotion is what percent of the handbag's cost?",
    choices: ["16", "19", "25", "34", "40"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet the cost be $C$. The marked price is $1.40C$, and the promotional selling price is $1.40C \\times 0.85 = 1.19C$. The profit is $1.19C - C = 0.19C$, which is $19\\%$ of cost.\n\n**Trigger cue**\nMarkup on cost followed by a discount on the marked price — chain the multipliers on cost.\n\n**Takeaway**\nMultiply cost multipliers: markup times discount gives the true profit percent.",
    fastest_path_md:
      "$1.4 \\times 0.85 = 1.19$ in one step (since $1.4 \\times 85 = 119$), so the profit is $19\\%$.",
    trap_map: {
      "0": "Divides the profit by the selling price rather than the cost: $19/119 \\approx 16\\%$.",
      "2": "Subtracts the percents: $40 - 15 = 25$.",
      "3": "Takes $85\\%$ of the markup percent itself: $40 \\times 0.85 = 34$.",
      "4": "Ignores the $15\\%$ promotion discount entirely.",
    },
    numeric_check: "19",
    check() {
      // Simulate on a concrete cost, step by step.
      const cost = 100;
      const marked = cost + cost * (40 / 100);
      const sold = marked - marked * (15 / 100);
      const profitPct = ((sold - cost) / cost) * 100;
      return { kind: "value", value: profitPct };
    },
  },

  // ── 6. D3 — second-year vs first-year compound interest ─────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "Darius deposits $\\$5{,}000$ into an account that earns $8\\%$ annual interest, compounded annually, and he makes no other deposits or withdrawals. The interest the account earns during the second year is how many dollars greater than the interest it earns during the first year?",
    choices: ["0", "32", "400", "432", "832"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nFirst-year interest: $5000 \\times 0.08 = 400$. The second year starts from $\\$5{,}400$, so its interest is $5400 \\times 0.08 = 432$. The difference is $432 - 400 = 32$.\n\n**Trigger cue**\nCompounded annually with a question about a *particular* year's interest — track the balance year by year.\n\n**Takeaway**\nCompounding's extra interest each year is the rate applied to prior interest.",
    fastest_path_md:
      "The only new money earning interest in year two is year one's $\\$400$ of interest, so the excess is $8\\%$ of $400 = \\$32$.",
    trap_map: {
      "0": "Treats the account as simple interest, with equal interest every year.",
      "2": "Reports the first year's interest instead of the difference.",
      "3": "Reports the second year's interest instead of the difference.",
      "4": "Reports the total interest earned over the two years.",
    },
    numeric_check: "5400*0.08 - 5000*0.08",
    check() {
      // Simulate the account year by year.
      let bal = 5000;
      const yearly = [];
      for (let y = 0; y < 2; y++) {
        const interest = bal * 0.08;
        yearly.push(interest);
        bal += interest;
      }
      return { kind: "value", value: yearly[1] - yearly[0] };
    },
  },

  // ── 7. D3 pure — years to double at simple interest (expressions) ───────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "An investment of $P$ dollars earns simple annual interest at a rate of $r$ percent per year. In terms of $P$ and $r$, after how many years will the value of the investment equal $2P$ dollars?",
    choices: [
      "$\\dfrac{r}{100}$",
      "$\\dfrac{50}{r}$",
      "$\\dfrac{100}{r}$",
      "$\\dfrac{200}{r}$",
      "$\\dfrac{100P}{r}$",
    ],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe value doubles when total interest equals the principal: $\\dfrac{P \\cdot r \\cdot t}{100} = P$. The $P$ cancels, leaving $\\dfrac{rt}{100} = 1$, so $t = \\dfrac{100}{r}$.\n\n**Trigger cue**\n\"Double\" under simple interest — the interest must accumulate to $100\\%$ of the principal, and the principal cancels.\n\n**Takeaway**\nAt $r$ percent simple, interest reaches the principal in $100/r$ years.",
    fastest_path_md:
      "Plug $r = 10$: at $10\\%$ simple, doubling clearly takes $10$ years, and only $\\dfrac{100}{r}$ gives $10$.",
    trap_map: {
      "0": "Inverts the relationship, solving $t = r/100$ instead of $rt/100 = 1$.",
      "1": "Treats doubling as a $50\\%$ gain, so the interest need only reach $P/2$.",
      "3": "Treats doubling as a $200\\%$ gain, requiring interest of $2P$.",
      "4": "Sets $\\frac{Prt}{100} = P$ but forgets to cancel $P$ from both sides.",
    },
    numeric_check: null,
    check() {
      // Simulate interest accrual for several (P, r) pairs and find the
      // unique candidate expression matching the simulated doubling time.
      const samples = [
        [100, 5],
        [400, 8],
        [250, 10],
      ];
      const cands = [
        (P, r) => r / 100,
        (P, r) => 50 / r,
        (P, r) => 100 / r,
        (P, r) => 200 / r,
        (P, r) => (100 * P) / r,
      ];
      const ok = cands.map(() => true);
      const dt = 1 / 512;
      for (const [P, r] of samples) {
        let interest = 0;
        let t = 0;
        while (interest < P && t < 1e5) {
          interest += P * (r / 100) * dt;
          t += dt;
        }
        cands.forEach((f, i) => {
          if (Math.abs(f(P, r) - t) > 0.05) ok[i] = false;
        });
      }
      const matches = ok.flatMap((v, i) => (v ? [i] : []));
      if (matches.length !== 1) throw new Error(`expected one matching expression, got ${matches.length}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 8. D3 pure — cost in terms of selling price (expressions) ───────────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "An item is sold for $s$ dollars at a profit equal to $25\\%$ of the item's cost. In terms of $s$, what is the item's cost, in dollars?",
    choices: ["$0.25s$", "$0.75s$", "$\\dfrac{4s}{5}$", "$\\dfrac{s}{0.75}$", "$1.25s$"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $C$ be the cost. A profit of $25\\%$ of cost means $s = C + 0.25C = 1.25C$, so $C = \\dfrac{s}{1.25} = \\dfrac{4s}{5}$.\n\n**Trigger cue**\nSelling price given, cost asked, profit stated as a percent of cost — divide by $1 + \\text{rate}$; never subtract the percent from the price.\n\n**Takeaway**\nUndo a markup by dividing, never by subtracting the percent.",
    fastest_path_md:
      "Backsolve with $s = 125$: a cost of $100$ produces exactly a $25\\%$ profit, and only $\\dfrac{4s}{5}$ returns $100$.",
    trap_map: {
      "0": "Computes $25\\%$ of the selling price — a profit with the wrong base — instead of the cost.",
      "1": "Subtracts $25\\%$ of the selling price from the selling price.",
      "3": "Divides by $1 - 0.25$ instead of $1 + 0.25$.",
      "4": "Marks the selling price up by $25\\%$ instead of removing the markup.",
    },
    numeric_check: null,
    check() {
      // For sample selling prices, brute-force the cost in cents from the
      // stem's profit condition, then find the unique matching expression.
      const samples = [250, 440];
      const cands = [
        (s) => 0.25 * s,
        (s) => 0.75 * s,
        (s) => (4 * s) / 5,
        (s) => s / 0.75,
        (s) => 1.25 * s,
      ];
      const ok = cands.map(() => true);
      for (const s of samples) {
        const costs = [];
        for (let cc = 1; cc <= 100000; cc++) {
          const c = cc / 100;
          if (Math.abs(c + 0.25 * c - s) < 1e-9) costs.push(c);
        }
        if (costs.length !== 1) throw new Error(`expected unique cost for s=${s}`);
        cands.forEach((f, i) => {
          if (Math.abs(f(s) - costs[0]) > 1e-6) ok[i] = false;
        });
      }
      const matches = ok.flatMap((v, i) => (v ? [i] : []));
      if (matches.length !== 1) throw new Error(`expected one matching expression, got ${matches.length}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 9. D3 — break-even with discarded inventory ─────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "A florist bought $150$ potted plants for $\\$4$ each. She sold some of the plants for $\\$6$ each, and the rest wilted and had to be discarded. If the florist's total profit on the plants was $\\$120$, how many of the plants wilted?",
    choices: ["20", "30", "50", "90", "120"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nTotal cost: $150 \\times 4 = 600$. If $k$ plants were sold, revenue is $6k$, and profit requires $6k - 600 = 120$, so $6k = 720$ and $k = 120$. The number that wilted is $150 - 120 = 30$.\n\n**Trigger cue**\nSome units sold, the rest discarded — profit is revenue minus the cost of *every* unit purchased, sold or not.\n\n**Takeaway**\nProfit compares revenue with the cost of ALL units bought.",
    fastest_path_md:
      "Revenue must reach $600 + 120 = \\$720$, so $720/6 = 120$ plants sold and $30$ wilted.",
    trap_map: {
      "0": "Divides the $\\$120$ profit by the $\\$6$ selling price and reports that count.",
      "2": "Finds the break-even sales level of $100$ plants and reports the $50$ left over, ignoring the required profit.",
      "3": "Uses the $\\$2$ per-plant margin to get $60$ sold and $90$ wilted, ignoring the cost of discarded plants.",
      "4": "Reports the number of plants sold instead of the number that wilted.",
    },
    numeric_check: "30",
    check() {
      // Enumerate every possible sold count.
      const found = [];
      for (let k = 0; k <= 150; k++) {
        const profit = 6 * k - 4 * 150;
        if (profit === 120) found.push(150 - k);
      }
      if (found.length !== 1) throw new Error(`expected unique count, found ${found.length}`);
      return { kind: "value", value: found[0] };
    },
  },

  // ── 10. D3 DS — coat cost: percent link vs dollar link (answer D) ───────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "A retailer sold a coat for $\\$80$. How many dollars did the coat cost the retailer?\n\n(1) The retailer sold the coat for $25\\%$ more than its cost.\n\n(2) The retailer's profit on the sale of the coat was $\\$16$.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe selling price is fixed at $\\$80$, so any single equation linking price and cost determines the cost.\n\nStatement (1): $1.25C = 80$, so $C = 64$ — one value. Sufficient.\n\nStatement (2): $80 - C = 16$, so $C = 64$ — one value. Sufficient.\n\nEach statement alone is sufficient: answer (D).\n\n**Trigger cue**\nA DS stem that already fixes one quantity (here, the selling price) — each statement only needs to supply one independent link to the unknown.\n\n**Takeaway**\nWith price fixed, any percent or dollar link determines cost.",
    fastest_path_md:
      "The stem pins the price at $\\$80$; a percent-over-cost relation and a dollar profit are each a one-unknown equation. Both solve instantly, so (D) without computing $64$ at all.",
    trap_map: {
      "0": "Discounts statement (2), overlooking that a fixed selling price turns a dollar profit directly into cost.",
      "1": "Distrusts statement (1), forgetting the known $\\$80$ price lets the percent equation solve for cost.",
      "2": "Combines the statements out of habit without testing each one against the known selling price.",
      "4": "Assumes the cost cannot be recovered without more information, missing both one-equation solutions.",
    },
    numeric_check: null,
    check() {
      // Enumerate candidate costs in cents and test each statement.
      const price = 80;
      const c1 = [];
      const c2 = [];
      for (let cc = 1; cc <= 8000; cc++) {
        const c = cc / 100;
        if (Math.abs(c * 1.25 - price) < 1e-9) c1.push(c);
        if (Math.abs(price - c - 16) < 1e-9) c2.push(c);
      }
      const unique = (arr) =>
        arr.length > 0 && new Set(arr.map((v) => v.toFixed(6))).size === 1;
      const both = c1.filter((c) => c2.some((d) => Math.abs(c - d) < 1e-9));
      return {
        kind: "index",
        index: dsAnswerIndex(unique(c1), unique(c2), unique(both)),
      };
    },
  },

  // ── 11. D4 DS — 100 lamps profit/loss, bound pruning (answer B) ─────────
  {
    format: "data_sufficiency",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "A shop sold exactly $100$ lamps last month. On each lamp, the shop either earned a profit of $\\$10$ or took a loss of $\\$5$. Did the shop earn an overall profit on the $100$ lamps?\n\n(1) More than $30$ of the lamps were sold at a profit.\n\n(2) Fewer than $40$ of the lamps were sold at a loss.",
    choices: [...DS_CHOICES],
    correct_index: 1,
    solution_md:
      "**Formal path**\nWith $k$ profitable lamps, the net result is $10k - 5(100 - k) = 15k - 500$, which is positive exactly when $k \\geq 34$.\n\nStatement (1): $k \\geq 31$. At $k = 31$ the net is $-35$ (no); at $k = 50$ it is $+250$ (yes). Not sufficient.\n\nStatement (2): fewer than $40$ losses means $100 - k \\leq 39$, so $k \\geq 61$, and the net is at least $15(61) - 500 = 415 > 0$ — always yes. Sufficient.\n\nAnswer (B).\n\n**Trigger cue**\nA yes/no DS with counts and per-unit gains/losses — find the break-even count first, then see whether each statement's bound clears it.\n\n**Takeaway**\nConvert count bounds to the break-even threshold before judging sufficiency.",
    fastest_path_md:
      "Break-even sits at $15k = 500$, i.e., $k = 33\\frac{1}{3}$. Statement (1) allows $k = 31$ (loss) and $k = 100$ (profit) — dead. Statement (2) forces $k \\geq 61$, far past break-even — done, (B).",
    trap_map: {
      "0": "Tests only large values of $k$ under statement (1), missing that $k = 31, 32, 33$ still produce a loss.",
      "2": "Assumes a one-sided count bound can never settle a yes/no question, so the statements must be combined.",
      "3": "Believes statement (1)'s bound clears break-even just as statement (2)'s does, without locating the threshold at $34$.",
      "4": "Never converts the counts into a break-even threshold and concludes the exact split is required.",
    },
    numeric_check: null,
    check() {
      // Enumerate every split of the 100 lamps and collect yes/no outcomes.
      const outcomes = (allow) => {
        const set = new Set();
        for (let k = 0; k <= 100; k++) {
          if (!allow(k)) continue;
          set.add(10 * k - 5 * (100 - k) > 0);
        }
        return set;
      };
      const s1 = outcomes((k) => k > 30);
      const s2 = outcomes((k) => 100 - k < 40);
      const both = outcomes((k) => k > 30 && 100 - k < 40);
      const suff = (set) => set.size === 1;
      return {
        kind: "index",
        index: dsAnswerIndex(suff(s1), suff(s2), suff(both)),
      };
    },
  },

  // ── 12. D5 DS — profit as % of selling price, redundant statement (A) ───
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "A dealer's profit on the sale of a painting was $20\\%$ of the painting's selling price. How many dollars did the dealer pay for the painting?\n\n(1) The selling price of the painting was $\\$1{,}500$ greater than the dealer's cost.\n\n(2) The selling price of the painting was $125\\%$ of the dealer's cost.",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe stem says profit $= 0.2S$, so cost $C = S - 0.2S = 0.8S$.\n\nStatement (1): $S - C = 1500$. But $S - C$ is the profit, $0.2S$, so $0.2S = 1500$, $S = 7500$, and $C = 6000$. Sufficient.\n\nStatement (2): $S = 1.25C$ is algebraically identical to $C = 0.8S$ — it restates the stem's condition and rules nothing out; $C$ can be any positive value. Not sufficient.\n\nAnswer (A).\n\n**Trigger cue**\nA DS statement that converts the stem's percent relation into an equivalent percent relation on the other base — test whether it is new information or the same equation in disguise.\n\n**Takeaway**\nA statement that restates the stem's given adds no information.",
    fastest_path_md:
      "Profit $= 20\\%$ of price means cost $= 80\\%$ of price, i.e., price $= 125\\%$ of cost — statement (2) verbatim, so it adds nothing. Statement (1) supplies the missing dollar scale: sufficient alone.",
    trap_map: {
      "1": "Converts (2) to $C = 0.8S$ and, seeing a clean equation, calls it sufficient — but it merely restates the stem.",
      "2": "Combines because (2) looks like an independent second equation, not recognizing it as the stem's condition in disguise.",
      "3": "Counts two equations for two unknowns twice over, missing that (2) is dependent on the stem's relation.",
      "4": "Misreads the profit as a percent of cost, making the statements appear contradictory and the system unsolvable.",
    },
    numeric_check: null,
    check() {
      // Enumerate (S, C) pairs consistent with the stem (C = S - 0.2S) on a
      // fine grid and test which statements pin down a unique cost.
      const cs1 = [];
      const cs2 = [];
      for (let s10 = 1; s10 <= 200000; s10++) {
        const S = s10 / 10;
        const C = S - 0.2 * S; // stem: profit is 20% of the selling price
        if (Math.abs(S - C - 1500) < 1e-6) cs1.push(C);
        if (Math.abs(1.25 * C - S) < 1e-6) cs2.push(C);
      }
      const unique = (arr) =>
        arr.length > 0 && new Set(arr.map((v) => v.toFixed(4))).size === 1;
      const both = cs1.filter((c) => cs2.some((d) => Math.abs(c - d) < 1e-6));
      return {
        kind: "index",
        index: dsAnswerIndex(unique(cs1), unique(cs2), unique(both)),
      };
    },
  },

  // ── 13. D5 — equal selling prices, equal ± percents, net result ─────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 5,
    stem_md:
      "At an art fair, a dealer sold two paintings for $\\$1{,}200$ each. On the first painting the dealer earned a profit of $20\\%$ of its cost, and on the second painting the dealer took a loss of $20\\%$ of its cost. For the two sales combined, the dealer's result was which of the following?",
    choices: [
      "A profit of $\\$100$",
      "Neither a profit nor a loss",
      "A loss of $\\$96$",
      "A loss of $\\$100$",
      "A loss of $\\$240$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nThe percents act on the *costs*, which differ. First painting: $1.2C_1 = 1200$, so $C_1 = 1000$. Second painting: $0.8C_2 = 1200$, so $C_2 = 1500$. Total cost $= 2500$ against total revenue $= 2400$: a net loss of $\\$100$.\n\n**Trigger cue**\nTwo items sold at the *same price*, one at $x\\%$ profit and one at $x\\%$ loss — the percents have different bases, so they never cancel.\n\n**Takeaway**\nEqual prices, equal percent gain and loss: the result is always a loss.\n",
    fastest_path_md:
      "Costs are $1200/1.2 = 1000$ and $1200/0.8 = 1500$ — the dealer paid $\\$2{,}500$ and collected $\\$2{,}400$. Loss of $\\$100$, no percent formula needed.",
    trap_map: {
      "0": "Finds the $\\$100$ gap but flips its direction, thinking the percent gain outweighs the percent loss.",
      "1": "Assumes an equal percent gain and loss on equal selling prices cancel out.",
      "2": "Applies the $4\\%$ net-loss shortcut to the $\\$2{,}400$ revenue instead of the $\\$2{,}500$ total cost.",
      "4": "Computes the loss as $20\\%$ of the $\\$1{,}200$ selling price and ignores the first painting's gain.",
    },
    numeric_check: null,
    check(q) {
      // Brute-force each cost in cents from its own sale condition.
      const findCost = (mult) => {
        const found = [];
        for (let cc = 1; cc <= 300000; cc++) {
          const c = cc / 100;
          if (Math.abs(c * mult - 1200) < 1e-6) found.push(c);
        }
        if (found.length !== 1) throw new Error("cost not unique");
        return found[0];
      };
      const c1 = findCost(1.2); // sold at 20% profit
      const c2 = findCost(0.8); // sold at 20% loss
      const net = 2 * 1200 - (c1 + c2);
      // Parse each choice into a signed dollar amount and match the net.
      const parsed = q.choices.map((str) => {
        const t = str.replace(/\{,\}/g, "").replace(/\\\$/g, "");
        const m = t.match(/(\d+(?:\.\d+)?)/);
        const amt = m ? parseFloat(m[1]) : 0;
        const sign = /loss/i.test(t) ? -1 : /profit/i.test(t) ? 1 : 0;
        return sign * amt;
      });
      const matches = parsed.flatMap((v, i) => (Math.abs(v - net) < 0.5 ? [i] : []));
      if (matches.length !== 1) throw new Error(`expected one matching choice, got ${matches.length}`);
      return { kind: "index", index: matches[0] };
    },
  },

  // ── 14. D4 — coupon-vs-percent discount ordering ────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "A television is priced at $\\$180$. A customer has a coupon for $\\$25$ off any purchase, and the store is offering $20\\%$ off all merchandise. If the $20\\%$ discount is applied to the price before the coupon is deducted, the customer pays how many dollars less than if the coupon is deducted before the $20\\%$ discount is applied?",
    choices: ["0", "5", "25", "36", "119"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nPercent first: $180 \\times 0.8 - 25 = 144 - 25 = 119$. Coupon first: $(180 - 25) \\times 0.8 = 155 \\times 0.8 = 124$. The difference is $124 - 119 = 5$.\n\n**Trigger cue**\nA fixed-dollar coupon combined with a percent discount in two different orders — only the coupon's treatment changes between the orders.\n\n**Takeaway**\nOrder matters: the totals differ by the percent of the coupon.",
    fastest_path_md:
      "Only the $\\$25$ coupon is treated differently: applied first it gets shrunk by the $20\\%$ cut, applied last it survives in full. The totals differ by $20\\%$ of $\\$25$, i.e., $\\$5$ — no need to price out either order.",
    trap_map: {
      "0": "Assumes the order of a fixed coupon and a percent discount cannot affect the total.",
      "2": "Reports the coupon's face value rather than the difference between the two totals.",
      "3": "Reports the $20\\%$ discount amount, $0.2 \\times 180 = 36$.",
      "4": "Reports the cheaper total, $\\$119$, instead of how much cheaper it is.",
    },
    numeric_check: "5",
    check() {
      // Simulate both checkout orders directly.
      const price = 180;
      const coupon = 25;
      const pctFirst = price * (1 - 0.2) - coupon;
      const couponFirst = (price - coupon) * (1 - 0.2);
      return { kind: "value", value: couponFirst - pctFirst };
    },
  },

  // ── 15. D4 — consecutive-year compound values reveal the rate ───────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 4,
    stem_md:
      "An investment earns interest at a constant rate of $r$ percent per year, compounded annually. The investment was worth $\\$2{,}420$ exactly $2$ years after it was made and $\\$2{,}662$ exactly $3$ years after it was made. What is the value of $r$?",
    choices: ["5", "9", "10", "12", "20"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet $P$ be the principal and $g = 1 + \\tfrac{r}{100}$. Then $Pg^2 = 2420$ and $Pg^3 = 2662$. Dividing the equations eliminates $P$: $g = \\dfrac{2662}{2420} = 1.1$, so $r = 10$.\n\n**Trigger cue**\nTwo compound-growth values one period apart — their ratio is a single growth factor; the principal is irrelevant.\n\n**Takeaway**\nThe ratio of consecutive compound values isolates the annual rate.",
    fastest_path_md:
      "From year $2$ to year $3$ the balance grows by one factor: $\\dfrac{2662}{2420} = 1.1$, so $r = 10$ — never touch the principal.",
    trap_map: {
      "0": "Halves the year-over-year growth, treating the $\\$242$ gain as two years of interest.",
      "1": "Divides the $\\$242$ gain by the year-3 value: $242/2662 \\approx 9$.",
      "3": "Divides the $\\$242$ gain by the original principal of $\\$2{,}000$: $242/2000 \\approx 12$.",
      "4": "Doubles the rate to account for the two years that passed before the first valuation.",
    },
    numeric_check: "10",
    check() {
      // Scan candidate rates on a 0.01 grid; a rate is consistent only if the
      // principal implied by the year-2 value also reproduces the year-3
      // value under a year-by-year simulation.
      const matches = [];
      for (let ri = 1; ri <= 3000; ri++) {
        const r = ri / 100;
        const g = 1 + r / 100;
        const P = 2420 / (g * g);
        let bal = P;
        for (let y = 0; y < 3; y++) bal *= g;
        if (Math.abs(bal - 2662) < 0.01) matches.push(r);
      }
      if (matches.length !== 1) throw new Error(`expected unique rate, found ${matches.length}`);
      return { kind: "value", value: matches[0] };
    },
  },

  // ── 16. D3 — equivalent single percent reduction ────────────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "The list price of a camera is reduced by $15\\%$, and one week later the reduced price is further reduced by $20\\%$. The final price of the camera is what percent less than the list price?",
    choices: ["17", "32", "35", "65", "68"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nTake the list price as $100$. After the first reduction the price is $85$; after the second it is $85 \\times 0.80 = 68$. The total reduction is $100 - 68 = 32$, so the final price is $32\\%$ less than the list price.\n\n**Trigger cue**\nTwo successive percent reductions with the *overall* percent change requested — multiply the remaining fractions, then compare with $100\\%$.\n\n**Takeaway**\nOverall percent change comes from multiplied fractions, subtracted from 100.",
    fastest_path_md:
      "Keep-fractions: $0.85 \\times 0.80 = 0.68$, so $32\\%$ off overall — one multiplication.",
    trap_map: {
      "0": "Counts only the second reduction's share of the list price: $20\\%$ of $85\\% = 17\\%$.",
      "2": "Adds the two percent reductions: $15 + 20 = 35$.",
      "3": "Adds the percents and reports the remaining $100 - 35 = 65$ as the reduction.",
      "4": "Computes the final price as a percent of the list price ($68\\%$) rather than the percent decrease.",
    },
    numeric_check: "32",
    check() {
      // Simulate the two reductions on a base of 100.
      let p = 100;
      for (const d of [0.15, 0.20]) p -= p * d;
      return { kind: "value", value: 100 - p };
    },
  },

  // ── 17. D3 pure — profit % of selling price → % of cost ─────────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "interest_profit_discount",
    difficulty: 3,
    stem_md:
      "The profit on the sale of an item was $20\\%$ of the item's selling price. The profit was what percent of the item's cost?",
    choices: ["16", "20", "25", "80", "125"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet the selling price be $S$. The profit is $0.2S$, so the cost is $S - 0.2S = 0.8S$. As a percent of cost, the profit is $\\dfrac{0.2S}{0.8S} = \\dfrac{1}{4} = 25\\%$.\n\n**Trigger cue**\nA profit percent quoted on one base (selling price) but asked on the other (cost) — rebuild both quantities from a single anchor and re-divide.\n\n**Takeaway**\nSame profit dollars over a smaller base yields a larger percent.",
    fastest_path_md:
      "Smart number: price $= 100$, profit $= 20$, cost $= 80$, and $20/80 = 25\\%$.",
    trap_map: {
      "0": "Multiplies $20\\%$ by the cost's $80\\%$ share of the price instead of dividing by it.",
      "1": "Treats percents of the selling price and of the cost as interchangeable.",
      "3": "Reports the cost as a percent of the selling price.",
      "4": "Reports the selling price as a percent of the cost.",
    },
    numeric_check: "25",
    check() {
      // The answer must be scale-invariant: compute it across several
      // selling prices and require agreement.
      const results = new Set();
      let value = null;
      for (const S of [40, 100, 250, 1000]) {
        const profit = 0.2 * S;
        const cost = S - profit;
        const pct = (profit / cost) * 100;
        results.add(pct.toFixed(6));
        value = pct;
      }
      if (results.size !== 1) throw new Error("percent not scale-invariant");
      return { kind: "value", value };
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
