/**
 * Batch 2: 15 new questions for subtopic "percent_change_chains"
 * (fundamental_skill "rates_ratio_percent").
 *
 * Coverage extends the original set into: equivalent single change,
 * mixed markdown-then-markup on a dollar anchor, three-entity comparison
 * chains, reverse chains (find the original), three-step chains,
 * price-times-quantity revenue factors (forward and inverse), variable
 * expression composition, two-person salary chains, unequal successive
 * increases with a given net, integer-retention factor-pair counting,
 * opposite-direction compounding crossings, and the subtopic's first
 * three DS items (identity r-up-r-down, break-even threshold, and a
 * p-vs-q markdown-on-inflated-base yes/no).
 *
 * Difficulty mix: D2 x2, D3 x6, D4 x4 (2 PS + 2 DS), D5 x3 (2 PS + 1 DS).
 *
 * Run: node --experimental-strip-types scripts/author/batch2-percent_change_chains.mjs
 * (dry run unless --append)
 */
import { verifyAndAppend } from "./harness.mjs";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

// A/B/C/D/E from statement sufficiencies, decided by enumeration results.
const dsIndex = (s1, s2, together) =>
  s1 && s2 ? 3 : s1 ? 0 : s2 ? 1 : together ? 2 : 4;

const items = [
  // ── 1. D2 PS pure arithmetic — equivalent single decrease ─────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 2,
    stem_md:
      "A quantity is decreased by $20\\%$, and the result is then decreased by $15\\%$. The combined effect of the two decreases is equivalent to a single decrease of what percent?",
    choices: ["3", "32", "35", "65", "68"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nAfter the first decrease, $80\\%$ of the quantity remains; after the second, $85\\%$ of that remains. The overall retention factor is $0.80 \\times 0.85 = 0.68$, so the equivalent single decrease is $100\\% - 68\\% = 32\\%$.\n\n**Trigger cue**\nTwo successive percent decreases asked for as one equivalent percent: multiply the retention factors, never add the cuts.\n\n**Takeaway**\nMultiply what remains; the equivalent cut is one minus that product.",
    fastest_path_md:
      "Combined decrease $= 20 + 15 - \\dfrac{20 \\times 15}{100} = 35 - 3 = 32$.",
    trap_map: {
      "0": "Computes only the overlap correction $\\frac{20 \\times 15}{100} = 3$ and reports it as the answer.",
      "2": "Adds the two percents, ignoring that the second cut acts on a smaller base.",
      "3": "Subtracts the summed percents from $100$, reporting a leftover-value figure as the decrease.",
      "4": "Reports the percent that remains, $68$, instead of the percent decrease.",
    },
    numeric_check: "32",
    check() {
      // simulate on an integer base and read off the total decrease
      let v = 10000;
      v -= (v * 20) / 100;
      v -= (v * 15) / 100;
      return { kind: "value", value: ((10000 - v) / 10000) * 100 };
    },
  },

  // ── 2. D2 PS real arithmetic — markdown then markup on a dollar anchor ──
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 2,
    stem_md:
      "A television originally priced at $\\$400$ was marked down $25\\%$. One week later the reduced price was increased by $10\\%$. What was the final price of the television, in dollars?",
    choices: ["270", "300", "330", "340", "440"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe markdown takes the price to $400 \\times 0.75 = 300$ dollars. The increase then acts on the reduced price: $300 \\times 1.10 = 330$ dollars.\n\n**Trigger cue**\nA markdown followed by an increase \"on the reduced price\": apply each factor to the running price in sequence.\n\n**Takeaway**\nEach percent change multiplies the current price, not the original.",
    fastest_path_md:
      "A quarter off $\\$400$ is $\\$300$; a tenth of $\\$300$ added back is $\\$330$.",
    trap_map: {
      "0": "Applies the $10\\%$ change as a second markdown: $400 \\times 0.75 \\times 0.90 = 270$.",
      "1": "Stops after the markdown and never applies the increase.",
      "3": "Nets the percents into a single $15\\%$ markdown of the original: $400 \\times 0.85 = 340$.",
      "4": "Applies the $10\\%$ increase to the original price and skips the markdown entirely.",
    },
    numeric_check: "400*0.75*1.1",
    check() {
      // simulate in cents with exact integers
      let cents = 40000;
      cents = (cents * 75) / 100;
      cents = (cents * 110) / 100;
      return { kind: "value", value: cents / 100 };
    },
  },

  // ── 3. D3 PS pure arithmetic — three-entity comparison chain ──────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 3,
    stem_md:
      "If $m$ is $20\\%$ greater than $n$, and $n$ is $25\\%$ less than $k$, then $m$ is what percent of $k$?",
    choices: ["75", "90", "95", "96", "120"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nTranslate each comparison into a multiplier: $m = 1.2n$ and $n = 0.75k$. Composing, $m = 1.2 \\times 0.75k = 0.9k$, so $m$ is $90\\%$ of $k$.\n\n**Trigger cue**\nChained \"greater than / less than\" comparisons across three quantities: convert each statement to a factor and multiply through to the common reference.\n\n**Takeaway**\nChain comparisons by multiplying factors anchored to the same reference.",
    fastest_path_md:
      "Let $k = 100$: then $n = 75$ and $m = 75 \\times 1.2 = 90$, so $90\\%$.",
    trap_map: {
      "0": "Drops the first relation and compares $n$ to $k$.",
      "2": "Adds the percent changes as points: $100 + 20 - 25 = 95$.",
      "3": "Misreads \"$n$ is $25\\%$ less than $k$\" as \"$k$ is $25\\%$ greater than $n$\", making $n = k/1.25 = 0.8k$.",
      "4": "Drops the second relation and compares $m$ to $n$.",
    },
    numeric_check: "90",
    check() {
      // simulate from several bases; the percent must be invariant
      const results = new Set();
      for (const k of [400, 800, 1600, 2000]) {
        const n = k - (k * 25) / 100;
        const m = n + (n * 20) / 100;
        results.add((m / k) * 100);
      }
      if (results.size !== 1) throw new Error("percent not invariant");
      return { kind: "value", value: [...results][0] };
    },
  },

  // ── 4. D3 PS real arithmetic — reverse a two-step chain ───────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 3,
    stem_md:
      "The value of a house increased by $20\\%$ during the first year after its purchase and decreased by $25\\%$ during the second year. At the end of the second year the house was valued at $\\$270{,}000$. What was the value of the house, in dollars, at the time of purchase?",
    choices: [
      "$\\$225{,}000$",
      "$\\$243{,}000$",
      "$\\$297{,}000$",
      "$\\$300{,}000$",
      "$\\$360{,}000$",
    ],
    correct_index: 3,
    solution_md:
      "**Formal path**\nLet $V$ be the purchase value. The two years multiply it by $1.20 \\times 0.75 = 0.90$, so $0.90V = 270{,}000$ and $V = \\dfrac{270{,}000}{0.90} = 300{,}000$.\n\n**Trigger cue**\nThe final value after a chain of percent changes is given and the original is asked: divide by the product of the factors — never apply the percents backward.\n\n**Takeaway**\nReverse a percent chain by dividing by its combined factor.",
    fastest_path_md:
      "The net factor is $1.2 \\times 0.75 = 0.9$, so the purchase value is $270{,}000 \\div 0.9 = 300{,}000$.",
    trap_map: {
      "0": "Undoes only the $20\\%$ increase, dividing $270{,}000$ by $1.2$.",
      "1": "Applies the net $10\\%$ decrease forward to the final value: $270{,}000 \\times 0.9$.",
      "2": "Adds $10\\%$ of the final value instead of dividing by the net factor $0.9$.",
      "4": "Undoes only the $25\\%$ decrease, dividing $270{,}000$ by $0.75$.",
    },
    numeric_check: "270000/0.9",
    check() {
      // brute-force scan of purchase values in $500 steps
      const hits = [];
      for (let v = 500; v <= 1000000; v += 500) {
        const after = v * 1.2 * 0.75;
        if (Math.abs(after - 270000) < 1e-6) hits.push(v);
      }
      if (hits.length !== 1) throw new Error("V not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 5. D3 PS pure arithmetic — three-step chain, near-cancellation ──
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 3,
    stem_md:
      "A positive quantity is increased by $10\\%$, the result is decreased by $25\\%$, and that result is then increased by $20\\%$. The final quantity is what percent of the original quantity?",
    choices: ["82.5", "90", "99", "100", "105"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nThe three changes multiply the quantity by $1.10 \\times 0.75 \\times 1.20$. Grouping the increases first, $1.10 \\times 1.20 = 1.32$, and $1.32 \\times 0.75 = 0.99$. The final quantity is $99\\%$ of the original.\n\n**Trigger cue**\nThree or more chained percent changes: compose them as a single product of factors — the point sums ($+10 - 25 + 20 = +5$) always mislead.\n\n**Takeaway**\nCompose all changes as one product before judging the net.",
    fastest_path_md:
      "Pair the increases: $1.1 \\times 1.2 = 1.32$, then $1.32 \\times \\dfrac{3}{4} = 0.99$ — one clean multiplication.",
    trap_map: {
      "0": "Stops before the final $20\\%$ increase: $1.1 \\times 0.75 = 0.825$.",
      "1": "Skips the initial $10\\%$ increase: $0.75 \\times 1.2 = 0.9$.",
      "3": "Assumes the ups and downs cancel exactly.",
      "4": "Adds the percent changes as points: $10 - 25 + 20 = +5$.",
    },
    numeric_check: "1.1*0.75*1.2*100",
    check() {
      // simulate on an exact integer base
      let v = 100000;
      v = (v * 110) / 100;
      v = (v * 75) / 100;
      v = (v * 120) / 100;
      return { kind: "value", value: (v / 100000) * 100 };
    },
  },

  // ── 6. D3 PS real arithmetic — revenue = price x quantity, forward ──
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 3,
    stem_md:
      "A café raised the price of its latte by $20\\%$, after which the number of lattes sold per day fell by $10\\%$. Daily revenue from latte sales after these changes was what percent of daily revenue before them?",
    choices: ["88", "108", "110", "118", "132"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nRevenue is price times quantity, so its factor is the product of the two factors: $1.20 \\times 0.90 = 1.08$. The new revenue is $108\\%$ of the old.\n\n**Trigger cue**\nA price change paired with an opposite quantity change and revenue asked: multiply the two factors — the percent points do not simply net.\n\n**Takeaway**\nRevenue's factor is the product of price and quantity factors.",
    fastest_path_md:
      "Smart numbers: price $\\$10$, $10$ sold, revenue $\\$100$. New: $\\$12 \\times 9 = \\$108$.",
    trap_map: {
      "0": "Swaps the directions of the two changes: $0.80 \\times 1.10 = 0.88$.",
      "2": "Adds the percent changes as points: $+20 - 10 = +10$.",
      "3": "Shrinks the $20$-point gain by $10\\%$ of itself ($20 \\times 0.9 = 18$) instead of compounding the factors.",
      "4": "Treats the $10\\%$ drop in sales as a rise: $1.20 \\times 1.10 = 1.32$.",
    },
    numeric_check: "1.2*0.9*100",
    check() {
      // simulate with integer cents and unit counts
      const before = 500 * 200; // 500 cents x 200 lattes
      const after = ((500 * 120) / 100) * ((200 * 90) / 100);
      return { kind: "value", value: (after / before) * 100 };
    },
  },

  // ── 7. D3 PS pure algebra — compose the chain as an expression ────
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 3,
    stem_md:
      "The price of an item is $P$ dollars. The price is increased by $x$ percent, and the new price is then decreased by $y$ percent, where $x$ and $y$ are positive. Which of the following represents the final price, in dollars?",
    choices: [
      "$P\\left(1 + \\dfrac{x - y}{100}\\right)$",
      "$P\\left(1 + \\dfrac{x}{100}\\right)\\left(1 - \\dfrac{y}{100}\\right)$",
      "$P\\left(1 - \\dfrac{x}{100}\\right)\\left(1 + \\dfrac{y}{100}\\right)$",
      "$P\\left(1 + \\dfrac{x}{100} - \\dfrac{y}{100} - \\dfrac{xy}{100}\\right)$",
      "$\\dfrac{(100 + x)(100 - y)P}{100}$",
    ],
    correct_index: 1,
    solution_md:
      "**Formal path**\nAn increase of $x$ percent multiplies the price by $1 + \\tfrac{x}{100}$; the subsequent decrease of $y$ percent multiplies the *new* price by $1 - \\tfrac{y}{100}$. The final price is $P\\left(1 + \\tfrac{x}{100}\\right)\\left(1 - \\tfrac{y}{100}\\right)$.\n\n**Trigger cue**\nVariable percent changes with expression choices: compose the multipliers, or plug small numbers and eliminate.\n\n**Takeaway**\nSuccessive percent changes compose multiplicatively: $(1+\\tfrac{x}{100})(1-\\tfrac{y}{100})$.",
    fastest_path_md:
      "Test $P = 100$, $x = 20$, $y = 10$: the price goes $100 \\to 120 \\to 108$. Only choice B evaluates to $108$.",
    trap_map: {
      "0": "Adds and subtracts the percents on the original base, ignoring that the decrease acts on the raised price.",
      "2": "Swaps which change is the increase and which is the decrease.",
      "3": "Expands the product but scales the cross term by $100$ instead of $100^2$.",
      "4": "Converts the percents with a single division by $100$ where two are needed.",
    },
    numeric_check: null,
    check() {
      // candidate formulas mirror the five choices, in order
      const formulas = [
        (P, x, y) => P * (1 + (x - y) / 100),
        (P, x, y) => P * (1 + x / 100) * (1 - y / 100),
        (P, x, y) => P * (1 - x / 100) * (1 + y / 100),
        (P, x, y) => P * (1 + x / 100 - y / 100 - (x * y) / 100),
        (P, x, y) => ((100 + x) * (100 - y) * P) / 100,
      ];
      // simulate the sequential price walk for several triples
      const triples = [
        [100, 20, 10],
        [200, 5, 40],
        [50, 12, 3],
        [300, 37, 21],
        [80, 65, 65],
      ];
      const alive = new Set([0, 1, 2, 3, 4]);
      for (const [P, x, y] of triples) {
        let price = P;
        price += (price * x) / 100;
        price -= (price * y) / 100;
        for (const k of [...alive]) {
          if (Math.abs(formulas[k](P, x, y) - price) > 1e-9) alive.delete(k);
        }
      }
      if (alive.size !== 1)
        throw new Error("surviving formulas: " + [...alive].join(","));
      return { kind: "index", index: [...alive][0] };
    },
  },

  // ── 8. D3 PS real arithmetic — revenue chain, inverse direction ───
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 3,
    stem_md:
      "A grocery store raised the price of a jar of honey by $25\\%$, and its weekly revenue from the honey then rose by $10\\%$. By what percent did the number of jars sold per week decrease?",
    choices: ["10", "12", "15", "35", "88"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nLet $f$ be the quantity factor. Revenue factor equals price factor times quantity factor: $1.25f = 1.10$, so $f = \\dfrac{1.10}{1.25} = 0.88$. Quantity fell by $1 - 0.88 = 12\\%$.\n\n**Trigger cue**\nTwo of the three factors in revenue $=$ price $\\times$ quantity are known and the third is asked: divide the factors, then convert back to a percent change.\n\n**Takeaway**\nRecover the missing factor by dividing, then convert to percent change.",
    fastest_path_md:
      "$\\dfrac{1.10}{1.25} = \\dfrac{110}{125} = \\dfrac{22}{25} = 0.88$, a $12\\%$ drop. Confirm: $1.25 \\times 0.88 = 1.10$.",
    trap_map: {
      "0": "Assumes the quantity fell by the same percent the revenue rose.",
      "2": "Subtracts the percent points: $25 - 10 = 15$.",
      "3": "Adds the two percent changes: $25 + 10 = 35$.",
      "4": "Reports the new quantity as a percent of the old rather than the decrease.",
    },
    numeric_check: "12",
    check() {
      // brute force the drop in hundredths of a percent, exact integers
      const hits = [];
      for (let t = 0; t <= 10000; t++) {
        // 1.25 * (1 - t/10000) === 1.10  <=>  125*(10000 - t) === 1,100,000
        if (125 * (10000 - t) === 1100000) hits.push(t / 100);
      }
      if (hits.length !== 1) throw new Error("drop not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 9. D4 PS real arithmetic — two-person salary chain ────────────
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 4,
    stem_md:
      "This year, Ana's salary is $20\\%$ less than Boris's salary. Next year, Ana's salary will increase by $25\\%$ and Boris's salary will decrease by $20\\%$. Next year, Ana's salary will be what percent of Boris's salary?",
    choices: ["100", "105", "125", "131.25", "156.25"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nLet Boris's current salary be $B$, so Ana's is $0.8B$. Next year Ana earns $0.8B \\times 1.25 = B$ and Boris earns $0.8B$. The ratio is $\\dfrac{B}{0.8B} = 1.25$, so Ana's salary will be $125\\%$ of Boris's.\n\n**Trigger cue**\nTwo people linked by a percent gap, each then changed by a separate percent: chain all three factors on one anchor salary before comparing.\n\n**Takeaway**\nAnchor one salary at 100 and track both chains numerically.",
    fastest_path_md:
      "Set Boris $= 100$: Ana $80 \\to 100$ while Boris $100 \\to 80$; the ratio is $100/80 = 125\\%$.",
    trap_map: {
      "0": "Ignores Boris's $20\\%$ cut; Ana's raise alone exactly closes the original gap.",
      "1": "Nets Ana's $-20$ and $+25$ as percentage points and leaves Boris unchanged.",
      "3": "Adds Ana's percents as points (reaching $105$) but correctly cuts Boris to $80$: $105/80$.",
      "4": "Ignores this year's $20\\%$ gap, comparing only the raise factor to the cut factor: $1.25/0.8$.",
    },
    numeric_check: "125",
    check() {
      // simulate with two different anchors; the percent must be invariant
      const results = new Set();
      for (const B of [100, 700]) {
        const anaNow = B - (B * 20) / 100;
        const anaNext = anaNow + (anaNow * 25) / 100;
        const borisNext = B - (B * 20) / 100;
        results.add((anaNext / borisNext) * 100);
      }
      if (results.size !== 1) throw new Error("percent not invariant");
      return { kind: "value", value: [...results][0] };
    },
  },

  // ── 10. D4 PS pure algebra — unequal successive increases, given net ──
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 4,
    stem_md:
      "A positive quantity is increased by $p$ percent, and the result is then increased by $(p + 10)$ percent, where $p > 0$. If the net effect of the two changes is a single increase of $32$ percent, what is the value of $p$?",
    choices: ["10", "11", "15", "16", "22"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe factors satisfy $\\left(1 + \\tfrac{p}{100}\\right)\\left(1 + \\tfrac{p+10}{100}\\right) = 1.32$, i.e. $(100 + p)(110 + p) = 13{,}200$. Expanding: $p^2 + 210p - 2{,}200 = 0$, which factors as $(p - 10)(p + 220) = 0$. Since $p > 0$, $p = 10$.\n\n**Trigger cue**\nTwo unequal successive increases with the exact net given: set the factor product equal to the net factor and expect a factorable quadratic.\n\n**Takeaway**\nNet of two increases exceeds their sum by the cross term.",
    fastest_path_md:
      "Backsolve $p = 10$: increases of $10\\%$ then $20\\%$ give $1.10 \\times 1.20 = 1.32$ exactly.",
    trap_map: {
      "1": "Adds the rates linearly, solving $p + (p + 10) = 32$.",
      "2": "Treats the two increases as equal, taking $\\sqrt{1.32} \\approx 1.149$ and rounding to $15$.",
      "3": "Halves the net $32$, ignoring the $10$-point difference between the increases.",
      "4": "Subtracts the extra $10$ points from the net: $32 - 10 = 22$.",
    },
    numeric_check: "10",
    check() {
      // brute force p in hundredths of a percent with exact integers
      const hits = [];
      for (let u = 1; u <= 30000; u++) {
        // (1 + u/10000)(1 + (u+1000)/10000) = 1.32
        // <=> (10000 + u)(11000 + u) === 132,000,000
        if ((10000 + u) * (11000 + u) === 132000000) hits.push(u / 100);
      }
      if (hits.length !== 1) throw new Error("p not unique: " + hits.join(","));
      return { kind: "value", value: hits[0] };
    },
  },

  // ── 11. D4 DS pure algebra — r up then r down, two routes to r ────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 4,
    stem_md:
      "A positive number was increased by $r$ percent, and the result was then decreased by $r$ percent, where $0 < r < 100$. What is the value of $r$?\n\n(1) The final number was $1$ percent less than the original number.\n\n(2) The amount of the decrease was equal to $11$ percent of the original number.",
    choices: [...DS_CHOICES],
    correct_index: 3,
    solution_md:
      "**Formal path**\nWrite $a = \\tfrac{r}{100}$, so the chain multiplies the original by $(1 + a)(1 - a) = 1 - a^2$.\n\nStatement (1): $1 - a^2 = 0.99$, so $a^2 = 0.01$ and, since $a > 0$, $a = 0.1$, i.e. $r = 10$. Sufficient.\n\nStatement (2): the decrease acts on the raised value $1 + a$ of the original, removing $a(1 + a)$ of it. So $a(1 + a) = 0.11$, i.e. $a^2 + a - 0.11 = 0$, which factors as $(a - 0.1)(a + 1.1) = 0$. Since $a > 0$, $a = 0.1$ and $r = 10$. Sufficient.\n\n**Trigger cue**\nAn up-$r$-then-down-$r$ chain in DS: the net loss is exactly $a^2$, and each stated quantity gives one equation in $a$ with a single positive root.\n\n**Takeaway**\nUp $r$ then down $r$ loses exactly $(r/100)^2$ of the original.",
    fastest_path_md:
      "Each statement is one equation in $r$ with one positive root — verify $r = 10$ fits both: $1.1 \\times 0.9 = 0.99$, and the drop $1.1 \\times 0.1 = 0.11$.",
    trap_map: {
      "0": "Accepts the $1 - a^2$ identity in (1) but rejects (2) because the original number is unknown, though the $11\\%$ is stated relative to it.",
      "1": "Keeps both roots of $a^2 = 0.01$ in (1), overlooking that $r > 0$ makes the solution unique.",
      "2": "Assumes each statement leaves the original number as a second unknown, so both statements seem necessary.",
      "4": "Demands the actual value of the original number, which cancels from every percent relation.",
    },
    numeric_check: null,
    check() {
      // enumerate r in hundredths of a percent (t = 100r), exact integers
      const sols1 = [];
      const sols2 = [];
      for (let t = 1; t <= 9999; t++) {
        // (1): (1 + t/1e4)(1 - t/1e4) = 0.99  <=>  1e8 - t^2 === 99e6
        if (100000000 - t * t === 99000000) sols1.push(t);
        // (2): (t/1e4)(1 + t/1e4) = 0.11  <=>  t*(10000 + t) === 11e6
        if (t * (10000 + t) === 11000000) sols2.push(t);
      }
      const together = sols1.filter((t) => sols2.includes(t));
      if (together.length === 0) throw new Error("statements contradict");
      const s1 = sols1.length === 1;
      const s2 = sols2.length === 1;
      const st = together.length === 1;
      return { kind: "index", index: dsIndex(s1, s2, st) };
    },
  },

  // ── 12. D4 DS pure algebra — break-even threshold after a drop ────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 4,
    stem_md:
      "A positive number was decreased by $25\\%$, and the result was then increased by $p$ percent, where $p > 0$. Was the final number less than the original number?\n\n(1) $p < 33$\n\n(2) $p > 30$",
    choices: [...DS_CHOICES],
    correct_index: 0,
    solution_md:
      "**Formal path**\nThe chain multiplies the original by $0.75\\left(1 + \\tfrac{p}{100}\\right)$, which is less than $1$ exactly when $1 + \\tfrac{p}{100} < \\tfrac{4}{3}$, i.e. $p < 33\\tfrac{1}{3}$.\n\nStatement (1): every $p < 33$ is below the $33\\tfrac{1}{3}$ break-even, so the answer is a definite yes. Sufficient.\n\nStatement (2): $p = 31$ gives $0.75 \\times 1.31 = 0.9825$ (yes), while $p = 40$ gives $0.75 \\times 1.40 = 1.05$ (no). Not sufficient.\n\n**Trigger cue**\nA yes/no about whether a percent gain undoes a percent drop: compute the exact break-even percent first, then test each stated range against it.\n\n**Takeaway**\nBreak-even after a $25\\%$ drop is a $33\\tfrac{1}{3}\\%$ gain.",
    fastest_path_md:
      "Break-even gain $= \\tfrac{1}{0.75} - 1 = 33\\tfrac{1}{3}\\%$. Range (1) lies entirely below it — sufficient; range (2) straddles it — not.",
    trap_map: {
      "1": "Takes $25\\%$ as the break-even gain, making (2)'s $p > 30$ look like a guaranteed no and (1) look ambiguous.",
      "2": "Assumes only both bounds together can trap $p$, missing that (1) alone stays below $33\\tfrac{1}{3}$.",
      "3": "Treats each bound as decisive, though (2) straddles the $33\\tfrac{1}{3}$ threshold.",
      "4": "Insists a yes/no question requires the exact value of $p$.",
    },
    numeric_check: null,
    check() {
      // final < original  <=>  75*(10000 + t) < 1,000,000, t = 100p
      const isLess = (t) => 75 * (10000 + t) < 1000000;
      const ans1 = new Set();
      const ans2 = new Set();
      const ansT = new Set();
      for (let t = 1; t <= 50000; t++) {
        if (t < 3300) ans1.add(isLess(t));
        if (t > 3000) ans2.add(isLess(t));
        if (t < 3300 && t > 3000) ansT.add(isLess(t));
      }
      const s1 = ans1.size === 1;
      const s2 = ans2.size === 1;
      const st = ansT.size === 1;
      return { kind: "index", index: dsIndex(s1, s2, st) };
    },
  },

  // ── 13. D5 DS real algebra — markdown on an inflated base ─────────
  {
    format: "data_sufficiency",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "A store increased the price of a lamp by $p$ percent, and one month later decreased the new price by $q$ percent, where $p$ and $q$ are positive. Was the final price of the lamp greater than the original price?\n\n(1) $p > q$\n\n(2) $p = 25$",
    choices: [...DS_CHOICES],
    correct_index: 4,
    solution_md:
      "**Formal path**\nThe final price exceeds the original exactly when $\\left(1 + \\tfrac{p}{100}\\right)\\left(1 - \\tfrac{q}{100}\\right) > 1$.\n\nStatement (1): $p = 50, q = 10$ gives $1.5 \\times 0.9 = 1.35$ (yes), but $p = 90, q = 80$ gives $1.9 \\times 0.2 = 0.38$ (no). Not sufficient.\n\nStatement (2): with $p = 25$, $q = 4$ gives $1.25 \\times 0.96 = 1.2$ (yes), while $q = 40$ gives $1.25 \\times 0.60 = 0.75$ (no). Not sufficient.\n\nTogether: $p = 25$ and $q < 25$. $q = 4$ still gives a yes, but $q = 24$ gives $1.25 \\times 0.76 = 0.95$ (no). Not sufficient. The answer is E.\n\n**Trigger cue**\n\"Is the final price above the original\" after a rise then a markdown: the markdown acts on an inflated base, so $p > q$ proves nothing — hunt near the boundary for counterexamples.\n\n**Takeaway**\nA markdown on an inflated base can outweigh a larger rise.",
    fastest_path_md:
      "Test extremes: $(p, q) = (90, 80)$ kills (1). With $p = 25$: $q = 1$ nets a gain but $q = 24$ gives $1.25 \\times 0.76 = 0.95$ — kills (2) and the combination. E.",
    trap_map: {
      "0": "Believes a rise larger than the markdown must net a gain, missing $p = 90, q = 80$: $1.9 \\times 0.2 = 0.38$.",
      "1": "Treats the fixed $25\\%$ rise as decisive even though $q$ is unrestricted.",
      "2": "Combines to $q < 25$ and declares a gain, missing $q = 24$: $1.25 \\times 0.76 = 0.95$.",
      "3": "Checks each statement only with small, friendly percents, where every test nets a gain.",
    },
    numeric_check: null,
    check() {
      // enumerate integer percents; gain <=> (100+p)(100-q) > 10000
      const gain = (p, q) => (100 + p) * (100 - q) > 10000;
      const ans1 = new Set();
      const ans2 = new Set();
      const ansT = new Set();
      for (let p = 1; p <= 99; p++) {
        for (let q = 1; q <= 99; q++) {
          if (p > q) ans1.add(gain(p, q));
          if (p === 25) ans2.add(gain(p, q));
          if (p > q && p === 25) ansT.add(gain(p, q));
        }
      }
      const s1 = ans1.size === 1;
      const s2 = ans2.size === 1;
      const st = ansT.size === 1;
      return { kind: "index", index: dsIndex(s1, s2, st) };
    },
  },

  // ── 14. D5 PS real arithmetic — integer retentions, factor pairs ──
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "In November, the original price of a coat was reduced by $p$ percent, and in December the November price was reduced by an additional $q$ percent, where $p$ and $q$ are positive integers. The December price was exactly $60\\%$ of the original price. How many ordered pairs $(p, q)$ are possible?",
    choices: ["1", "2", "3", "4", "6"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nThe retentions multiply: $\\dfrac{100 - p}{100} \\cdot \\dfrac{100 - q}{100} = \\dfrac{60}{100}$, so $(100 - p)(100 - q) = 6{,}000$ with both factors integers from $1$ to $99$. Each factor must be at least $\\lceil 6000/99 \\rceil = 61$, and the only divisors of $6{,}000 = 2^4 \\cdot 3 \\cdot 5^3$ between $61$ and $99$ are $75$ and $80$. So $(100 - p, 100 - q)$ is $(75, 80)$ or $(80, 75)$, giving $(p, q) = (25, 20)$ or $(20, 25)$: $2$ ordered pairs.\n\n**Trigger cue**\nInteger percent cuts with an exact final fraction: clear denominators and factor the target under the $1$–$99$ range constraint.\n\n**Takeaway**\nInteger percent chains become factor-pair searches within $(0, 100)$.",
    fastest_path_md:
      "Need $(100 - p)(100 - q) = 6{,}000$ with two-digit factors: both must exceed $60$, and only $75 \\times 80$ works — count its $2$ orders.",
    trap_map: {
      "0": "Counts the markdown pair $\\{25, 20\\}$ once, ignoring that $(p, q)$ is ordered.",
      "2": "Also admits $q = 0$, counting the single-markdown case $(40, 0)$.",
      "3": "Admits $0\\%$ for either markdown, adding $(40, 0)$ and $(0, 40)$.",
      "4": "Accepts factorizations like $50 \\times 120$, which force one markdown percent to be negative.",
    },
    numeric_check: "2",
    check() {
      // exhaustive scan over all positive-integer markdown pairs
      let count = 0;
      for (let p = 1; p <= 99; p++) {
        for (let q = 1; q <= 99; q++) {
          if ((100 - p) * (100 - q) === 6000) count++;
        }
      }
      return { kind: "value", value: count };
    },
  },

  // ── 15. D5 PS real arithmetic — opposite compounding, first crossing ──
  {
    format: "problem_solving",
    content_domain: "arithmetic",
    context: "real",
    fundamental_skill: "rates_ratio_percent",
    subtopic: "percent_change_chains",
    difficulty: 5,
    stem_md:
      "Machine A currently produces $400$ units per day and Machine B currently produces $900$ units per day. Machine A's daily output increases by $10\\%$ each month, and Machine B's daily output decreases by $10\\%$ each month. After how many months will Machine A's daily output first exceed Machine B's?",
    choices: ["3", "4", "5", "6", "9"],
    correct_index: 2,
    solution_md:
      "**Formal path**\nAfter $n$ months the outputs are $400(1.1)^n$ and $900(0.9)^n$. Tabulate: $n = 4$ gives $400(1.4641) = 585.6$ against $900(0.6561) = 590.5$ — B is still ahead. $n = 5$ gives $400(1.61051) \\approx 644.2$ against $900(0.59049) \\approx 531.4$, so A first exceeds B after $5$ months.\n\n**Trigger cue**\nTwo quantities compounding in opposite directions with a crossing asked: tabulate or track the ratio — linear estimates from the first month's changes undershoot.\n\n**Takeaway**\nCompounding gaps close slower than first-month arithmetic suggests.",
    fastest_path_md:
      "Track the ratio $B/A = 2.25$, which shrinks by the factor $\\tfrac{9}{11}$ monthly: $2.25 \\to 1.84 \\to 1.51 \\to 1.23 \\to 1.01 \\to 0.83$ — it first drops below $1$ at month $5$.",
    trap_map: {
      "0": "Rounds the linear crossing estimate $500/(40 + 90) \\approx 3.8$ down to $3$.",
      "1": "Extrapolates the first month's $+40$ and $-90$ linearly; compounding leaves month $4$ at $585.6$ vs $590.5$, not yet crossed.",
      "3": "Counts the current outputs as month $1$, shifting the crossing by one.",
      "4": "Compares A's growing output with B's original $900$, ignoring B's decline: $400(1.1)^n > 900$ first at $n = 9$.",
    },
    numeric_check: "5",
    check() {
      // month-by-month simulation until the first crossing
      let a = 400;
      let b = 900;
      for (let month = 1; month <= 100; month++) {
        a *= 1.1;
        b *= 0.9;
        if (a > b) return { kind: "value", value: month };
      }
      throw new Error("no crossing within 100 months");
    },
  },
];

verifyAndAppend(items, { dryRun: !process.argv.includes("--append") });
