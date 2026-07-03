# Interest, Profit, and Discount: One Multiplier at a Time

## Why this matters
Every question in this family — markups, markdowns, profit targets, simple and compound interest — is a percent-change problem wearing a costume. The GMAT tests it from easy one-step conversions up through hard multi-layer setups where two or three percent changes stack, and the trap answers are built from predictable misreads: profit measured off the wrong base, discounts added instead of multiplied, or interest compounded on the wrong schedule. At the Q86 level you are expected to translate the story into a single clean equation in under 30 seconds and spend your time on arithmetic, not on setup.

## The core ideas
1. **Profit definition.** $\text{Profit} = S - C$, where $S$ is selling price and $C$ is cost. Every problem in this family reduces to tracking these two numbers.
2. **Profit as a percent of cost.** A profit of $p$ (as a decimal) *on cost* means $S = C(1+p)$. This is the default meaning of "a 30% profit" — the base is cost unless the problem says otherwise.
3. **Profit as a percent of selling price (margin).** If profit is $m$ of the *selling price*, then $\text{Profit} = mS$ and therefore $C = (1-m)S$. Read the "of" clause carefully; this one phrase changes the entire equation.
4. **Margin–markup conversion.** A margin of $m$ on selling price equals a markup of $\frac{m}{1-m}$ on cost, because $S - C = mS$ rearranges to $S = \frac{C}{1-m}$. Example: a $20\%$ margin is a $25\%$ markup, since $\frac{0.2}{0.8} = 0.25$.
5. **Percent changes compose multiplicatively.** Marking up by $x$ then discounting by $y$ gives a net factor $(1+x)(1-y)$, never $1 + x - y$. Each change acts on the *current* price, so factors multiply.
6. **Net multiplier reads off the net change.** If the chained factor is $k$, the overall percent change is $k - 1$. A markup of $60\%$ followed by discounts of $25\%$ and $10\%$ gives $1.6 \times 0.75 \times 0.9 = 1.08$, i.e., a net $8\%$ gain — so the profit is $0.08C$ regardless of the dollar amounts.
7. **Simple interest.** $I = Prt$ and $A = P(1 + rt)$, with $t$ in years — convert months by $t = \frac{\text{months}}{12}$. Interest accrues only on the original principal, so it is linear in time.
8. **Compound interest.** $A = P\left(1 + \frac{r}{n}\right)^{nt}$ for annual rate $r$ compounded $n$ times per year. "Compounded semiannually at $4\%$" means two periods of $2\%$ each per year: each period multiplies the balance by the period factor.
9. **Compound beats simple by the interest-on-interest.** Over $2$ years at annual rate $r$, the gap is exactly $Pr^2$, because $P(1+r)^2 - P(1+2r) = Pr^2$. Check: $\$1{,}000$ at $5\%$ gives $\$1{,}102.50$ versus $\$1{,}100$, a gap of $\$2.50 = 1000(0.05)^2$.
10. **Two-scenario pivot.** If selling at prices $S_1$ and $S_2$ produces profits of $p_1$ and $p_2$ percent of the *same cost*, then $S_2 - S_1 = (p_2 - p_1)C$. The dollar gap between scenarios is the percent gap applied to cost — one equation, one unknown.

## Worked examples

**Example 1**
*A vendor sold a set of headphones for $\$84$, earning a profit equal to $20\%$ of her cost. At what price, in dollars, should she have sold the headphones to earn a profit equal to $40\%$ of her cost?*

1. "Profit of $20\%$ of cost" means $S = 1.2C$, so $84 = 1.2C$ and $C = 70$.
2. The target price for a $40\%$ profit on the same cost is $1.4C = 1.4 \times 70 = 98$.

**Answer: $\$98$**

**Example 2**
*Dana deposits $\$9{,}000$ into an account earning $6\%$ annual interest, compounded semiannually. How many dollars more interest does the account earn in the first year than it would have earned at $6\%$ simple annual interest?*

1. Semiannual compounding at $6\%$ annual means two periods at $3\%$ each: the year-end balance is $9000(1.03)^2 = 9000 \times 1.0609 = 9548.10$, so compound interest is $\$548.10$.
2. Simple interest for one year is $9000 \times 0.06 = 540$.
3. The difference is $548.10 - 540 = 8.10$. (Structural check: the gap is interest on the first period's interest, $P\left(\frac{r}{2}\right)^2 = 9000 \times 0.0009 = 8.10$.)

**Answer: $\$8.10$**

**Example 3**
*A gallery prices a framed print so that its profit is $30\%$ of the selling price. At an art fair, the gallery reduces the selling price by $20\%$ and sells the print, earning a profit of $\$52$. How many dollars did the gallery pay for the print?*

1. Let $S$ be the original selling price. Profit is $30\%$ *of the selling price*, so cost is $C = 0.7S$.
2. The fair price is $0.8S$, and the realized profit is $0.8S - C = 0.8S - 0.7S = 0.1S$.
3. Set $0.1S = 52$, so $S = 520$.
4. Then $C = 0.7 \times 520 = 364$.

**Answer: $\$364$**

## Trigger cues
- "Marked up by $x\%$, then discounted $y\%$, then a further $z\%$ off" → multiply all factors into one net multiplier before introducing any dollar amounts.
- "Profit of $k\%$ of the selling price" → write $C = (1-k)S$ immediately; the base is $S$, not $C$.
- "Sold at a loss of $a\%$; $\$d$ more would have given a profit of $b\%$" → two-scenario pivot: $(a + b)\% \times C = d$.
- "Settled the loan after $m$ months" with simple interest → $I = Pr \cdot \frac{m}{12}$; solve for the annual rate.
- "Compounded semiannually / quarterly" → convert to per-period rate $\frac{r}{n}$ and count periods $nt$ before computing anything.
- "Discounts the list price by $x\%$ and still earns a profit of $y\%$ of cost" → one equation: $(1-x)L = (1+y)C$.

## Trap gallery
- **Adding stacked percents.** Treating $20\%$ off then $10\%$ off as $30\%$ off. Fix: multiply — $0.8 \times 0.9 = 0.72$, a $28\%$ discount.
- **Wrong profit base.** Reading "profit is $25\%$ of the selling price" as $S = 1.25C$. Fix: margin on $S$ means $C = 0.75S$; markup on $C$ means $S = 1.25C$ — different equations, different answers.
- **Symmetric up-then-down.** Assuming $+25\%$ then $-25\%$ breaks even. Fix: $1.25 \times 0.75 = 0.9375$, a $6.25\%$ loss — the discount acts on a larger base.
- **Forgetting to convert months.** Plugging $t = 8$ instead of $t = \frac{8}{12}$ into $I = Prt$. Fix: simple-interest time is always in years.
- **Compounding at the full annual rate.** Using $(1+r)^2$ for one year of semiannual compounding. Fix: the period rate is $\frac{r}{2}$; the year is $\left(1+\frac{r}{2}\right)^2$.
- **Reporting the amount, not the interest.** Solving for $A$ and stopping. Fix: reread the question — interest earned is $A - P$; profit is $S - C$.

## Speed moves
- **Compress the chain first.** Multiply all markup and discount factors into one number before touching dollars: $1.6 \times 0.75 \times 0.9 = 1.08$ turns a three-step story into "profit is $8\%$ of cost."
- **Pick a convenient cost.** For percent-only questions, set cost to $\$100$: a $40\%$ markup then $30\%$ discount gives $140 \times 0.7 = 98$, so a $2\%$ loss — read the answer straight off.
- **Divide straight from the profit relation.** Given $S$ and a profit percent on cost, divide: $C = \frac{84}{1.2} = 70$ is faster than setting up an equation.
- **Two-year compound gap by formula.** Difference between compound and simple over two annual periods is $Pr^2$ — no exponentiation needed.
- **Pivot without prices.** For "loss of $12\%$ versus profit of $8\%$, a $\$90$ swing," jump to $0.20C = 90$, so $C = 450$ — never compute either selling price.

## Before you drill
1. I can state whether a given profit percent is based on cost or on selling price, and write the matching equation on sight.
2. I convert any chain of markups and discounts into a single multiplier before using dollar amounts.
3. I know the net percent change is the multiplier minus $1$, and I never add stacked percents.
4. I can apply $I = Prt$ with months converted to a fraction of a year.
5. I can set up $P\left(1+\frac{r}{n}\right)^{nt}$ for semiannual or quarterly compounding without hesitation.
6. I know the compound-versus-simple gap over two years is $Pr^2$ and why.
7. Given two sale scenarios on one cost, I can equate the dollar gap to the percent gap times cost in one line.
