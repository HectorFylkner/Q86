# Percent Change Chains: Multiply Factors, Never Add Percents

## Why this matters

Chained percent changes — a markup then a discount, two years of growth, a loss and a recovery — appear constantly on the GMAT Focus Edition, from warm-ups to Q86-tier items that hide a quadratic inside the chain. The exam tests one discipline: convert every percent change into a multiplication factor, and never add percents applied to different bases. Every trap in this family is a different disguise for the same sin of adding.

The chapter builds the factor habit in ideas 1–4, then covers the exam's favorite twists — asymmetric recovery, base flips, unknown-percent chains — in ideas 5–9. Master the habit and the first three example tiers become 30–60 second questions, leaving your clock for the algebraic top end.

## The core ideas

Ideas 1–4 build the factor habit; 5–9 are the twists the exam layers on top of it.

1. **Percent change as a factor.** A $p\%$ increase multiplies a quantity by $\left(1 + \frac{p}{100}\right)$; a $p\%$ decrease multiplies it by $\left(1 - \frac{p}{100}\right)$. True because $x \pm \frac{p}{100}x = x\left(1 \pm \frac{p}{100}\right)$. The translation is mechanical: $+35\%$ is $1.35$, $-8\%$ is $0.92$, "$140\%$ of" is $1.4$. Do it on sight, before any other thought about the problem.
Check: What single factor represents "decreased by $15\%$"? ⇒ $0.85$ — one minus $\frac{15}{100}$.

2. **Chains multiply.** Successive changes compose by multiplying their factors, because each change acts on the *current* value, not the original: $+20\%$ then $-20\%$ gives $(1.2)(0.8) = 0.96$, i.e. $4\%$ below the start — never $0\%$. This one habit converts every "then… then…" stem into a single product.
Check: A value rises $50\%$, then falls $50\%$. Net factor? ⇒ $(1.5)(0.5) = 0.75$ — a $25\%$ loss, not zero.

3. **Order never matters.** Multiplication is commutative, so a $30\%$ discount then a $10\%$ coupon lands at the same price as the reverse order. Use this freely to pick the easier arithmetic path — pair the factors that produce round intermediate numbers first.

4. **Net percent change from the net factor.** If the product of factors is $F$, the overall change is $(F - 1)\times 100\%$. Example: $+10\%$ then $+30\%$ gives $F = (1.1)(1.3) = 1.43$, a net $43\%$ increase — more than $40$, because the second change acts on a larger base. Watch the wording: $F = 1.43$ is "$43\%$ greater than" but "$143\%$ of."
Check: A chain's net factor is $F = 1.32$. The net change is? ⇒ $+32\%$ — subtract $1$, then scale by $100$.

5. **Equal up-and-down always loses.** $\left(1 + \frac{p}{100}\right)\left(1 - \frac{p}{100}\right) = 1 - \frac{p^2}{10000}$, a net loss of $\frac{p^2}{100}\%$. Difference of squares makes this instant, in either order: $p = 20$ means a $\frac{400}{100} = 4\%$ net loss. The exam offers "no change" as a choice every time; it is never right.
Check: Up $30\%$ then down $30\%$ — net change? ⇒ a loss of $\frac{30^2}{100}\% = 9\%$.

6. **Reversing a change means dividing.** If a quantity became $y$ after a $p\%$ increase, the original was $\frac{y}{1 + p/100}$ — you undo a multiplication by dividing, never by applying the opposite percent. Undoing $+60\%$ that produced $208$ gives $\frac{208}{1.6} = 130$; computing $208 \times 0.4$ instead answers a different question about a different base.
Check: After a $25\%$ increase a price is $\$150$. The original price? ⇒ $\frac{150}{1.25} = \$120$.

7. **Recovery percentages are asymmetric.** After a $p\%$ drop, returning to the original requires a gain of $\frac{p}{100 - p}\times 100\%$, since $\left(1 - \frac{p}{100}\right)F = 1$ forces $F = \frac{1}{1 - p/100}$. A $40\%$ loss needs $\frac{1}{0.6} \approx 1.667$ — a gain of about $67\%$. The smaller the surviving base, the larger the percent that must be built on it.
Check: A stock falls $20\%$. What gain restores it? ⇒ $\frac{20}{80} = 25\%$ — the factor $\frac{1}{0.8} = 1.25$.

8. **"Greater than" flips to a different "less than."** If $x = 1.25y$, then $y = \frac{x}{1.25} = 0.8x$: $y$ is $20\%$ less than $x$. The percent is anchored to whichever quantity follows "than," and flipping the direction changes the base, so the number changes too.
Check: $x$ is $50\%$ greater than $y$. Then $y$ is what percent less than $x$? ⇒ $33\tfrac{1}{3}\%$ — since $y = \frac{x}{1.5} = \frac{2}{3}x$.

9. **Unknown-percent chains become polynomials.** With $t = \frac{k}{100}$, a chain like "down $k\%$, then up $2k\%$" is $(1 - t)(1 + 2t)$; setting it equal to the target net factor gives a quadratic. Clear to integers early — write $(100 - k)(100 + 2k)$ against $10000 \times F$ — expand, solve, and keep only roots that keep every factor positive. With numeric answer choices, testing a middle choice on a start of $100$ is often faster than the algebra.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*A jacket is priced at $\$80$. The price is marked up by $25\%$, and the jacket is later sold at $10\%$ off the marked-up price. What was the sale price?*

1. Factors on sight: $+25\%$ is $1.25$; "$10\%$ off" is $0.9$.
2. Chain: $80 \times 1.25 \times 0.9$.
3. Friendly order: $80 \times 1.25 = 100$, then $100 \times 0.9 = 90$.

**Wrong turn: adding the percents.** $+25 - 10 = +15$ suggests $80 \times 1.15 = 92$. The $10\%$ came off the *marked-up* price of $\$100$, not off $\$80$ — factors multiply, and the correct net factor is $1.125$, not $1.15$.

**Answer: $\$90$**

**Example 2 · 605 level · target 1:40**

*A tablet is listed at $\$250$. The store raises the list price by $20\%$, and during a clearance event sells it at $35\%$ off the raised price. What is the clearance price?*

1. Convert each change to a factor: $+20\%$ is $1.2$; $35\%$ off is $0.65$.
2. Multiply through the chain: $250 \times 1.2 \times 0.65$.
3. Compute in the friendliest order: $250 \times 1.2 = 300$, and $300 \times 0.65 = 195$.
4. Sanity check the net factor: $1.2 \times 0.65 = 0.78$, so the final price should be $22\%$ below the original list — and $195$ is indeed $78\%$ of $250$.

**Wrong turn: taking the discount on the original base.** $300 - 0.35 \times 250 = 300 - 87.50 = 212.50$ is the number the trap choice is built from. "Off the raised price" anchors the $35\%$ to $\$300$.

**Answer: $\$195$**

**Example 3 · 655 level · target 2:05**

*A website's monthly traffic rose $40\%$ from January to February. From February to March it fell, and March traffic was exactly $5\%$ above January traffic. By what percent did traffic fall from February to March?*

1. Let January traffic be $1$. Then February is $1.40$ and March is $1.05$.
2. The February-to-March factor is the unknown leg: $\frac{1.05}{1.40} = \frac{3}{4} = 0.75$.
3. A factor of $0.75$ is a decrease of $25\%$.
4. Confirm: $1.40 \times 0.75 = 1.05$.

**Wrong turn: subtracting the endpoint percents.** $40\% - 5\% = 35\%$ treats both numbers as if they lived on the same base. The drop is measured against the larger February base, so it must come out *smaller* than $35$ — a direction check that kills the trap even before you divide.

**Answer: $25\%$**

**Example 4 · 705 level · target 2:30**

*An investment lost $20\%$ of its value in its first year. In its second year its value rose by $x\%$, and at the end of the second year the investment was worth $8\%$ more than its initial value. What is $x$?*

*A) $28$  B) $30$  C) $32$  D) $35$  E) $40$*

1. Chain as factors: $0.8 \times \left(1 + \frac{x}{100}\right) = 1.08$.
2. Isolate the unknown leg by dividing: $1 + \frac{x}{100} = \frac{1.08}{0.8} = 1.35$.
3. So $x = 35$.
4. Verify forward: $0.8 \times 1.35 = 1.08$ — an $8\%$ net gain.

**Wrong turn: adding the legs.** $-20 + x = 8$ gives $x = 28$, choice (A) — the percents live on different bases. Recovery is asymmetric (idea 7): climbing out of a $20\%$ hole *and* another $8\%$ above it must cost more than $28\%$, because every percent of the climb is built on the shrunken base of $0.8$.

**Answer: $x = 35$ (D)**

**Example 5 · Q86 level · target 2:50**

*A positive number is increased by $k\%$, and the result is then decreased by $2k\%$. The final value is $28\%$ less than the original number. If $k$ is a positive integer, what is $k$?*

*A) $10$  B) $14$  C) $20$  D) $25$  E) $28$*

1. Write the chain as factors with $t = \frac{k}{100}$: the final value is $(1 + t)(1 - 2t)$ times the original.
2. "$28\%$ less" means the net factor is $0.72$: $(1 + t)(1 - 2t) = 0.72$.
3. Clear denominators by writing it in $k$: $(100 + k)(100 - 2k) = 7200$.
4. Expand: $10000 - 100k - 2k^2 = 7200$, so $2k^2 + 100k - 2800 = 0$, i.e. $k^2 + 50k - 1400 = 0$.
5. Factor: $(k + 70)(k - 20) = 0$, so $k = 20$ (rejecting $k = -70$).
6. Verify: $+20\%$ then $-40\%$ gives $1.20 \times 0.60 = 0.72$. Correct.

**Wrong turn: reading "28% less" as the factor.** Setting $(1+t)(1-2t) = 0.28$ solves for a final value that is $28\%$ *of* the original, not $28\%$ *less than* it — the single most common misread in this family.

**Wrong turn: netting the percents.** $k - 2k = -k$ suggests the chain loses "$k\%$", giving $k = 28$, choice (E). The backsolve exposes it instantly: $100 \to 128 \to 128 \times 0.44 = 56.32$, nowhere near $72$.

**Answer: $k = 20$ (C)**

## Trigger cues

- "Increased by $a\%$, then decreased by $b\%$" → multiply factors $\left(1 + \frac{a}{100}\right)\left(1 - \frac{b}{100}\right)$; never combine $a$ and $b$ by addition.
- "The final value is what percent of / greater than the original?" → compute the net factor $F$, then report $100F$ or $100(F - 1)$ — read which one the stem asks.
- "After a $p\%$ increase, the value is $y$; find the original" → divide: original $= \frac{y}{1 + p/100}$.
- "What percent gain restores the original value?" → reciprocal factor: $\frac{1}{1 - p/100}$, then subtract $1$.
- "$x$ is $p\%$ greater than $y$; $y$ is what percent less than $x$?" → flip the base: compute $1 - \frac{1}{1 + p/100}$.
- "Fell in the second period and ended $q\%$ above the start" → divide the net factor by the known factor to isolate the unknown leg.
- "$30\%$ off, then an additional $10\%$ off" → multiply the "off" factors: $0.7 \times 0.9 = 0.63$, a $37\%$ total discount.
- "By $k\%$ … then by $2k\%$ … $k$ is a positive integer" → set the factor product equal to the target; solve the quadratic or backsolve the choices on a start of $100$.

## Trap gallery

- **Adding the percents.** $+20\%$ then $-20\%$ is not $0\%$; it is $(1.2)(0.8) = 0.96$, a $4\%$ loss. Factors multiply — and the "no change" answer choice is the printed form of this trap.
- **Reusing the original base for the second change.** A $10\%$ coupon off a sale price applies to the *sale* price, not the original. Each factor acts on the running value.
- **Undoing an increase by subtracting the same percent.** Reversing $+60\%$ means dividing by $1.6$, not multiplying by $0.4$ — the trap choice is built from the wrong multiplication.
- **Symmetric recovery.** After $-40\%$, a $+40\%$ gain gives $0.6 \times 1.4 = 0.84$, still $16\%$ short; true recovery is about $67\%$. Any choice equal to the original drop percent is bait.
- **Wrong base in "greater/less" flips.** $25\%$ greater one way is $20\%$ less the other way; the percent is anchored to whichever quantity follows "of" or "than."
- **Reporting the factor instead of the change.** $F = 1.43$ means $43\%$ greater but $143\%$ *of* the original. Both numbers appear among the choices; the stem's wording picks one.
- **"Less than" read as "of."** "$28\%$ less than the original" is a factor of $0.72$; "$28\%$ of the original" is a factor of $0.28$. Confusing them produces a clean-looking equation with a wrong constant.
- **Keeping an invalid root.** In unknown-$k$ chains, discard roots that make a factor negative or violate "positive integer" — the rejected root often appears among the choices.

## Speed moves

- **Start at $100$.** For "what percent" questions with no dollar amount, set the start to $100$: every intermediate value *is* its percent of the original, and $+40\%$ then to $105$ makes the unknown leg $\frac{105}{140} = 0.75$ on sight.
- **Multiply factors in the friendliest order.** Order is irrelevant, so compute $250 \times 1.2$ first (clean $300$) before touching the $0.65$.
- **Memorize the up-down identity.** Same $p\%$ up and down nets $-\frac{p^2}{100}\%$: $p = 10$ loses $1\%$, $p = 20$ loses $4\%$, $p = 50$ loses $25\%$ — no arithmetic at all.
- **Backsolve integer-$k$ chains.** Test a middle choice on a start of $100$: for Example 5, $k = 20$ gives $100 \to 120 \to 72$, which is $28\%$ down. Done in one substitution.
- **Know the guaranteed direction.** A decrease of $p\%$ paired with a smaller increase always nets a decrease: $(1 - p/100)(1 + q/100) < 1$ whenever $q \le p$. The reverse is NOT symmetric — a bigger increase can still lose, as in $+50\%$ then $-40\%$ giving $1.5 \times 0.6 = 0.90$. When the increase is the big one, multiply before trusting the sign.
- **Convert "off" language instantly.** "$30\%$ off, then another $10\%$ off" is $0.7 \times 0.9 = 0.63$ — a $37\%$ total discount, never $40\%$.
- **Direction-check before computing.** An unknown leg measured against a larger base must be a smaller percent (Example 3); a recovery must exceed the drop (Example 4). One second of direction logic often eliminates two or three choices.

## Before you drill

- I convert any $p\%$ change to its factor $1 \pm \frac{p}{100}$ without pausing.
- I multiply factors for chained changes and never add percents taken on different bases.
- I know equal up-and-down nets $-\frac{p^2}{100}\%$ and can quote it for $p = 10, 20, 50$.
- I reverse a percent change by dividing by its factor, not by applying the opposite percent.
- I can state why recovery percents exceed the drop that caused them, and compute $\frac{p}{100-p}$ for $p = 20, 25, 40, 50$.
- I flip "$x$ is $p\%$ greater than $y$" into the correct "less than" percent without mixing up the base.
- I isolate one unknown leg of a chain by dividing the net factor by the known factors.
- For unknown-$k$ chains I set up the factor equation, clear to integers, then solve the quadratic — or backsolve the choices on a start of $100$ when that is faster.
