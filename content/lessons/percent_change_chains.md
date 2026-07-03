# Percent Change Chains: Multiply Factors, Never Add Percents

## Why this matters

Chained percent changes — a markup then a discount, two years of growth, a loss and a recovery — appear constantly on the GMAT Focus Edition, from warm-ups to Q85+ items that hide a quadratic inside the chain. The exam tests one discipline: convert every percent change into a multiplication factor, and never add percents applied to different bases. Master the factor habit and these become 30–60 second questions.

## The core ideas

1. **Percent change as a factor.** A $p\%$ increase multiplies a quantity by $\left(1 + \frac{p}{100}\right)$; a $p\%$ decrease multiplies it by $\left(1 - \frac{p}{100}\right)$. True because $x \pm \frac{p}{100}x = x\left(1 \pm \frac{p}{100}\right)$.

2. **Chains multiply.** Successive changes compose by multiplying their factors: $+20\%$ then $-20\%$ gives $(1.2)(0.8) = 0.96$, i.e. $4\%$ below the start — never $0\%$. Each change acts on the *current* value.

3. **Order never matters.** Multiplication is commutative, so a $30\%$ discount then a $10\%$ coupon lands at the same price as the reverse order. Use this to pick the easier arithmetic path.

4. **Net percent change from the net factor.** If the product of factors is $F$, the overall change is $(F - 1)\times 100\%$. Example: $+10\%$ then $+30\%$ gives $F = (1.1)(1.3) = 1.43$, a net $43\%$ increase — the second change acts on a larger base.

5. **Equal up-and-down always loses.** $\left(1 + \frac{p}{100}\right)\left(1 - \frac{p}{100}\right) = 1 - \frac{p^2}{10000}$, a net loss of $\frac{p^2}{100}\%$. Difference of squares makes this instant: $p = 20$ means a $\frac{400}{100} = 4\%$ net loss.

6. **Reversing a change means dividing.** If a quantity became $y$ after a $p\%$ increase, the original was $\frac{y}{1 + p/100}$. Undoing $+60\%$ that produced $208$ gives $\frac{208}{1.6} = 130$; applying $-60\%$ instead is wrong because the base changed.

7. **Recovery percentages are asymmetric.** After a $p\%$ drop, returning to the original requires a gain of $\frac{p}{100 - p}\times 100\%$, since $\left(1 - \frac{p}{100}\right)F = 1$ forces $F = \frac{1}{1 - p/100}$. A $40\%$ loss needs $\frac{1}{0.6} \approx 1.667$, a gain of about $67\%$.

8. **"Greater than" flips to a different "less than."** If $x = 1.25y$, then $y = \frac{x}{1.25} = 0.8x$: $y$ is $20\%$ less than $x$, because the reference base flipped.

9. **Unknown-percent chains become polynomials.** With $t = \frac{k}{100}$, a chain like "down $k\%$, then up $2k\%$" is $(1 - t)(1 + 2t)$; setting it equal to the target factor gives a quadratic. Expand, solve, keep the root that keeps every factor positive.

## Worked examples

**Example 1**

*A tablet is listed at $\$250$. The store raises the list price by $20\%$, and during a clearance event sells it at $35\%$ off the raised price. What is the clearance price?*

1. Convert each change to a factor: $+20\%$ is $1.2$; $35\%$ off is $0.65$.
2. Multiply through the chain: $250 \times 1.2 \times 0.65$.
3. Compute in the friendliest order: $250 \times 1.2 = 300$, and $300 \times 0.65 = 195$.
4. Sanity check the net factor: $1.2 \times 0.65 = 0.78$, so the final price should be $22\%$ below the original list — and $195$ is indeed $78\%$ of $250$.

**Answer: $\$195$**

**Example 2**

*A website's monthly traffic rose $40\%$ from January to February. From February to March it fell, and March traffic was exactly $5\%$ above January traffic. By what percent did traffic fall from February to March?*

1. Let January traffic be $1$. Then February is $1.40$ and March is $1.05$.
2. The February-to-March factor is $\frac{1.05}{1.40} = 0.75$.
3. A factor of $0.75$ is a decrease of $25\%$.
4. Confirm: $1.40 \times 0.75 = 1.05$. The answer is not $40\% - 5\% = 35\%$; the drop is measured against the larger February base.

**Answer: $25\%$**

**Example 3**

*A positive number is increased by $k\%$, and the result is then decreased by $2k\%$. The final value is $28\%$ less than the original number. If $k$ is a positive integer, what is $k$?*

1. Write the chain as factors with $t = \frac{k}{100}$: the final value is $(1 + t)(1 - 2t)$ times the original.
2. "$28\%$ less" means the net factor is $0.72$: $(1 + t)(1 - 2t) = 0.72$.
3. Clear denominators by writing it in $k$: $(100 + k)(100 - 2k) = 7200$.
4. Expand: $10000 - 100k - 2k^2 = 7200$, so $2k^2 + 100k - 2800 = 0$, i.e. $k^2 + 50k - 1400 = 0$.
5. Factor: $(k + 70)(k - 20) = 0$, so $k = 20$ (rejecting $k = -70$).
6. Verify: $+20\%$ then $-40\%$ gives $1.20 \times 0.60 = 0.72$. Correct.

**Answer: $k = 20$**

## Trigger cues

- "Increased by $a\%$, then decreased by $b\%$" → multiply factors $\left(1 + \frac{a}{100}\right)\left(1 - \frac{b}{100}\right)$; never combine $a$ and $b$ by addition.
- "The final value is what percent of / greater than the original?" → compute the net factor $F$, then report $100F$ or $100(F - 1)$.
- "After a $p\%$ increase, the value is $y$; find the original" → divide: original $= \frac{y}{1 + p/100}$.
- "What percent gain restores the original value?" → reciprocal factor: $\frac{1}{1 - p/100}$, then subtract $1$.
- "$x$ is $p\%$ greater than $y$; $y$ is what percent less than $x$?" → flip the base: compute $1 - \frac{1}{1 + p/100}$.
- "Fell in the second period and ended $q\%$ above the start" → divide the net factor by the first factor to isolate the unknown leg.
- "By $k\%$ … then by $2k\%$ … $k$ is a positive integer" → set the factor product equal to the target; solve the quadratic or test the answer choices the choices.

## Trap gallery

- **Adding the percents.** $+20\%$ then $-20\%$ is not $0\%$; it is $(1.2)(0.8) = 0.96$, a $4\%$ loss. Factors multiply.
- **Reusing the original base for the second change.** A $10\%$ coupon off a sale price applies to the *sale* price, not the original. Fix: each factor acts on the running value.
- **Undoing an increase by subtracting the same percent.** Reversing $+60\%$ means dividing by $1.6$, not multiplying by $0.4$.
- **Symmetric recovery.** After $-40\%$, a $+40\%$ gain gives $0.6 \times 1.4 = 0.84$, still short; true recovery is about $67\%$.
- **Wrong base in "greater/less" flips.** $25\%$ greater one way is $20\%$ less the other way; the percent is anchored to whichever quantity follows "of" or "than."
- **Reporting the factor instead of the change.** $F = 1.43$ means $43\%$ greater but $143\%$ *of* the original. Read which one the stem asks.
- **Keeping an invalid root.** In unknown-$k$ chains, discard roots that make a factor negative or violate "positive integer."

## Speed moves

- **Use 100 (or another convenient numbers) as the start.** For "what percent" questions with no dollar amount, start at $100$: $+40\%$ then to $105$ makes the second leg $\frac{105}{140} = 0.75$ on sight.
- **Multiply factors in the friendliest order.** Since order is irrelevant, compute $250 \times 1.2$ first (clean $300$) before hitting the $0.65$.
- **Memorize the up-down identity.** Same $p\%$ up and down nets $-\frac{p^2}{100}\%$: $p = 10$ loses $1\%$, $p = 20$ loses $4\%$ — no arithmetic needed.
- **test the answer choices integer-$k$ chains.** Test a choice on a start of $100$: for Example 3, $k = 20$ gives $100 \to 120 \to 72$, which is $28\%$ down. Done.
- **Estimate direction first.** A big change followed by a small opposite one keeps the big one's sign; kill half the choices before computing.
- **Convert "off" language instantly.** "$30\%$ off, then another $10\%$ off" is $0.7 \times 0.9 = 0.63$ — a $37\%$ total discount, never $40\%$.

## Before you drill

- I convert any $p\%$ change to its factor $1 \pm \frac{p}{100}$ without pausing.
- I multiply factors for chained changes and never add percents taken on different bases.
- I know equal up-and-down nets $-\frac{p^2}{100}\%$ and can quote it for $p = 10, 20, 50$.
- I reverse a percent change by dividing by its factor, not by applying the opposite percent.
- I flip "$x$ is $p\%$ greater than $y$" into "$y$ is $1 - \frac{1}{1 + p/100}$ less than $x$" without mixing up the base.
- I isolate one unknown leg of a chain by dividing the net factor by the known factors.
- For unknown-$k$ chains I set up the factor equation, clear to integers, and solve or test the answer choices the quadratic.
