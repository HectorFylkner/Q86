# Interest, Profit, and Discount: One Multiplier at a Time

## Why this matters

Every question in this family — markups, markdowns, profit targets, simple and compound interest — is a percent-change problem wearing a costume. The GMAT tests it from easy one-step conversions up through hard multi-layer setups where two or three percent changes stack, and the trap answers are built from predictable misreads: profit measured off the wrong base, discounts added instead of multiplied, or interest compounded on the wrong schedule. At the Q86 tier you are expected to translate the story into a single clean equation in under 30 seconds and spend your time on arithmetic, not on setup.

Ideas 1–4 pin down the profit vocabulary (where the traps live), 5–6 import the factor discipline from the percent-chains chapter, 7–9 cover both interest schedules, and 10 is the two-scenario pivot that turns the hardest stems into one line.

## The core ideas

Ideas 1–4 are the profit vocabulary; 5–6 the factor discipline; 7–9 interest; 10 the pivot.

1. **Profit definition.** $\text{Profit} = S - C$, where $S$ is selling price and $C$ is cost. Every problem in this family reduces to tracking these two numbers — and to knowing which one a given percent is measured against.

2. **Profit as a percent of cost.** A profit of $p$ (as a decimal) *on cost* means $S = C(1+p)$. This is the default meaning of "a 30% profit" — the base is cost unless the problem says otherwise.
Check: Cost is $\$50$ and profit is $30\%$ of cost. Selling price? ⇒ $50 \times 1.3 = \$65$.

3. **Profit as a percent of selling price (margin).** If profit is $m$ of the *selling price*, then $\text{Profit} = mS$ and therefore $C = (1-m)S$. Read the "of" clause carefully; this one phrase changes the entire equation.
Check: Profit is $25\%$ of the selling price, and $S = \$80$. Cost? ⇒ $C = 0.75 \times 80 = \$60$.

4. **Margin–markup conversion.** A margin of $m$ on selling price equals a markup of $\frac{m}{1-m}$ on cost, because $S - C = mS$ rearranges to $S = \frac{C}{1-m}$. The two numbers describe the same sale and are *never* equal (except at zero).
Check: A $20\%$ margin on selling price is what markup on cost? ⇒ $\frac{0.2}{0.8} = 25\%$.

5. **Percent changes compose multiplicatively.** Marking up by $x$ then discounting by $y$ gives a net factor $(1+x)(1-y)$, never $1 + x - y$. Each change acts on the *current* price, so factors multiply — the full doctrine lives in the percent-chains chapter and applies here verbatim.
Check: Marked up $50\%$, then discounted $30\%$. Net change? ⇒ $1.5 \times 0.7 = 1.05$ — a $5\%$ gain.

6. **Net multiplier reads off the net change.** If the chained factor is $k$, the overall percent change is $k - 1$. A markup of $60\%$ followed by discounts of $25\%$ and $10\%$ gives $1.6 \times 0.75 \times 0.9 = 1.08$, i.e., a net $8\%$ gain — so the profit is $0.08C$ regardless of the dollar amounts.

7. **Simple interest.** $I = Prt$ and $A = P(1 + rt)$, with $t$ in years — convert months by $t = \frac{\text{months}}{12}$. Interest accrues only on the original principal, so it is linear in time.
Check: $\$1{,}200$ at $5\%$ simple annual interest for $8$ months earns? ⇒ $1200 \times 0.05 \times \frac{8}{12} = \$40$.

8. **Compound interest.** $A = P\left(1 + \frac{r}{n}\right)^{nt}$ for annual rate $r$ compounded $n$ times per year. "Compounded semiannually at $4\%$" means two periods of $2\%$ each per year: each period multiplies the balance by the period factor.
Check: $8\%$ compounded quarterly — the per-period rate and periods per year? ⇒ $2\%$ per period, $4$ periods.

9. **Compound beats simple by the interest-on-interest.** Over $2$ years at annual rate $r$, the gap is exactly $Pr^2$, because $P(1+r)^2 - P(1+2r) = Pr^2$. Check it once and own it forever: $\$1{,}000$ at $5\%$ gives $\$1{,}102.50$ versus $\$1{,}100$, a gap of $\$2.50 = 1000(0.05)^2$.
Check: $\$2{,}000$ at $10\%$ for two years — compound minus simple? ⇒ $2000 \times (0.1)^2 = \$20$.

10. **Two-scenario pivot.** If selling at prices $S_1$ and $S_2$ produces profits of $p_1$ and $p_2$ percent of the *same cost*, then $S_2 - S_1 = (p_2 - p_1)C$. The dollar gap between scenarios is the percent gap applied to cost — one equation, one unknown, no individual prices ever computed.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*A retailer buys a lamp for $\$60$ and sells it at a profit equal to $35\%$ of the cost. What is the selling price?*

1. Profit on cost means $S = C(1 + p) = 60 \times 1.35$.
2. Compute: $60 \times 1.35 = 60 + 21 = 81$.

**Answer: $\$81$**

**Example 2 · 605 level · target 1:40**

*A vendor sold a set of headphones for $\$84$, earning a profit equal to $20\%$ of her cost. At what price, in dollars, should she have sold the headphones to earn a profit equal to $40\%$ of her cost?*

1. "Profit of $20\%$ of cost" means $S = 1.2C$, so $84 = 1.2C$ and $C = 70$.
2. The target price for a $40\%$ profit on the same cost is $1.4C = 1.4 \times 70 = 98$.

**Wrong turn: treating the sale price as the base.** $84 \times 1.4 = 117.60$ (or "$20$ more percent" as $84 \times 1.2 = 100.80$) skips the recovery of cost. Both percents are anchored to $C$, and $C$ must be dug out first by dividing — the percent-chains rule that undoing a markup means dividing by its factor.

**Answer: $\$98$**

**Example 3 · 655 level · target 2:05**

*Dana deposits $\$9{,}000$ into an account earning $6\%$ annual interest, compounded semiannually. How many dollars more interest does the account earn in the first year than it would have earned at $6\%$ simple annual interest?*

1. Semiannual compounding at $6\%$ annual means two periods at $3\%$ each: the year-end balance is $9000(1.03)^2 = 9000 \times 1.0609 = 9548.10$, so compound interest is $\$548.10$.
2. Simple interest for one year is $9000 \times 0.06 = 540$.
3. The difference is $548.10 - 540 = 8.10$. (Structural check: the gap is interest on the first period's interest, $P\left(\frac{r}{2}\right)^2 = 9000 \times 0.0009 = 8.10$.)

**Wrong turn: one period per year.** Computing $9000 \times 1.06$ makes compound and simple identical and the difference $\$0$ — a planted choice. "Compounded semiannually" cuts the year into two $3\%$ periods, and the extra $\$8.10$ is precisely the second half-year's interest on the first half-year's $\$270$.

**Answer: $\$8.10$**

**Example 4 · 705 level · target 2:30**

*A gallery prices a framed print so that its profit is $30\%$ of the selling price. At an art fair, the gallery reduces the selling price by $20\%$ and sells the print, earning a profit of $\$52$. How many dollars did the gallery pay for the print?*

1. Let $S$ be the original selling price. Profit is $30\%$ *of the selling price*, so cost is $C = 0.7S$.
2. The fair price is $0.8S$, and the realized profit is $0.8S - C = 0.8S - 0.7S = 0.1S$.
3. Set $0.1S = 52$, so $S = 520$.
4. Then $C = 0.7 \times 520 = 364$.

**Wrong turn: margin read as markup.** Writing $S = 1.3C$ makes the fair profit $0.8 \times 1.3C - C = 0.04C$, so $C = 1300$ — a wildly different planted answer. The phrase "of the selling price" moves the base: margin lives on $S$, and $C = (1 - m)S$ is the only correct translation.

**Answer: $\$364$**

**Example 5 · Q86 level · target 2:50**

*A boutique marks up a jacket to $60\%$ above cost. When it fails to sell, the boutique applies successive discounts of $25\%$ and then $10\%$ to the marked price, sells the jacket, and still earns a profit of $\$16$. What was the boutique's cost, in dollars?*

*A) $64$  B) $200$  C) $250$  D) $320$  E) $400$*

1. Compress the chain into one factor before any dollars: $1.6 \times 0.75 \times 0.9$.
2. Friendly order: $1.6 \times 0.75 = 1.2$, then $1.2 \times 0.9 = 1.08$.
3. The sale price is $1.08C$, so the profit is $0.08C = 16$ and $C = 200$.
4. Verify forward: cost $200 \to$ marked $320 \to$ after $25\%$: $240 \to$ after $10\%$: $216$, and $216 - 200 = 16$. ✓

**Wrong turn: adding the discounts.** Treating $25\%$ then $10\%$ as $35\%$ off gives $1.6 \times 0.65 = 1.04$, so $0.04C = 16$ and $C = 400$ — planted as choice (E). The second discount acts on an already-reduced price; stacked discounts always come to less than their sum.

**Wrong turn: netting everything.** $60 - 25 - 10 = 25$ suggests profit is $25\%$ of cost, giving $C = 64$ — choice (A). Markups and discounts on shifting bases never combine by addition.

**Answer: $\$200$ (B)**

## Trigger cues

- "Marked up by $x\%$, then discounted $y\%$, then a further $z\%$ off" → multiply all factors into one net multiplier before introducing any dollar amounts.
- "Profit of $k\%$ of the selling price" → write $C = (1-k)S$ immediately; the base is $S$, not $C$.
- "Sold at a loss of $a\%$; $\$d$ more would have given a profit of $b\%$" → two-scenario pivot: $(a + b)\% \times C = d$.
- "Settled the loan after $m$ months" with simple interest → $I = Pr \cdot \frac{m}{12}$; solve for the annual rate.
- "Compounded semiannually / quarterly" → convert to per-period rate $\frac{r}{n}$ and count periods $nt$ before computing anything.
- "Discounts the list price by $x\%$ and still earns a profit of $y\%$ of cost" → one equation: $(1-x)L = (1+y)C$.
- "How much more than simple interest" over two periods → the gap is $P r_{\text{period}}^2$; no exponentiation needed.

## Trap gallery

- **Adding stacked percents.** Treating $20\%$ off then $10\%$ off as $30\%$ off. Multiply — $0.8 \times 0.9 = 0.72$, a $28\%$ discount — and expect the "added" version among the choices.
- **Wrong profit base.** Reading "profit is $25\%$ of the selling price" as $S = 1.25C$. Margin on $S$ means $C = 0.75S$; markup on $C$ means $S = 1.25C$ — different equations, different planted answers.
- **Symmetric up-then-down.** Assuming $+25\%$ then $-25\%$ breaks even. $1.25 \times 0.75 = 0.9375$, a $6.25\%$ loss — the discount acts on a larger base.
- **Forgetting to convert months.** Plugging $t = 8$ instead of $t = \frac{8}{12}$ into $I = Prt$. Simple-interest time is always in years.
- **Compounding at the full annual rate.** Using $(1+r)^2$ for one year of semiannual compounding — or one period of $r$ for the whole year, which makes the compound-simple gap $0$. The period rate is $\frac{r}{2}$; the year is $\left(1+\frac{r}{2}\right)^2$.
- **Reporting the amount, not the interest.** Solving for $A$ and stopping. Interest earned is $A - P$; profit is $S - C$ — and both "full" values sit among the choices.

## Speed moves

- **Compress the chain first.** Multiply all markup and discount factors into one number before touching dollars: $1.6 \times 0.75 \times 0.9 = 1.08$ turns a three-step story into "profit is $8\%$ of cost."
- **Pick a convenient cost.** For percent-only questions, set cost to $\$100$: a $40\%$ markup then $30\%$ discount gives $140 \times 0.7 = 98$, so a $2\%$ loss — read the answer straight off.
- **Divide straight from the profit relation.** Given $S$ and a profit percent on cost, divide: $C = \frac{84}{1.2} = 70$ is faster than setting up an equation.
- **Two-year compound gap by formula.** Difference between compound and simple over two periods is $P r_{\text{period}}^2$ — no exponentiation needed.
- **Pivot without prices.** For "loss of $12\%$ versus profit of $8\%$, a $\$90$ swing," jump to $0.20C = 90$, so $C = 450$ — never compute either selling price.
- **Backsolve with the forward story.** Cost choices like Example 5's invite testing: run $C = 200$ forward through markup and discounts in three quick multiplications and check the profit. Often faster than building the equation — and it doubles as the verification.

## Before you drill

1. I can state whether a given profit percent is based on cost or on selling price, and write the matching equation on sight.
2. I convert any chain of markups and discounts into a single multiplier before using dollar amounts.
3. I know the net percent change is the multiplier minus $1$, and I never add stacked percents.
4. I can apply $I = Prt$ with months converted to a fraction of a year.
5. I can set up $P\left(1+\frac{r}{n}\right)^{nt}$ for semiannual or quarterly compounding without hesitation.
6. I know the compound-versus-simple gap over two years is $Pr^2$ and why.
7. Given two sale scenarios on one cost, I can equate the dollar gap to the percent gap times cost in one line.
8. I can convert between margin and markup with $\frac{m}{1-m}$ and never treat them as the same number.
