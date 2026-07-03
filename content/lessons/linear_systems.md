# Linear Systems: Solve Less, Combine More

## Why this matters
Linear systems are the workhorse algebra of GMAT Quant: they appear directly (solve for $x$, find the constant $k$) and as the skeleton under word problems about prices, tickets, ages, and fee-plus-rate pricing. At the Q86 level the exam rarely rewards grinding out $x$ and $y$ — it rewards seeing when a system collapses in one move, when a target combination is reachable without solving, and when one equation secretly has a unique answer because the unknowns must be whole numbers.

## The core ideas
1. **A system is an intersection of lines.** The system $a_1x + b_1y = c_1$, $a_2x + b_2y = c_2$ has one solution, none, or infinitely many — the lines cross once, are parallel, or coincide.
2. **Unique-solution test:** exactly one solution when $a_1b_2 - a_2b_1 \neq 0$, i.e. the coefficient ratios differ. Reason: elimination then leaves a nonzero coefficient on one variable.
3. **Parallel vs. identical:** if $\dfrac{a_1}{a_2} = \dfrac{b_1}{b_2} \neq \dfrac{c_1}{c_2}$, no solution; if all three ratios match, infinitely many. Reason: proportional left sides force the right sides to contradict or agree. So $2x + 5y = 8$ and $6x + ky = 24$ has infinitely many solutions exactly when $k = 15$ (every ratio is $3$).
4. **Elimination vs. substitution:** scale so one variable's coefficients match, then add or subtract; or isolate a variable that already has coefficient $1$ and plug in. Pick whichever kills a variable in one line.
5. **Combination targeting:** if the question asks for $px + qy$, look for $m \cdot E_1 + n \cdot E_2$ matching those coefficients — usually $m, n \in \{1, -1\}$, so try adding or subtracting before solving anything.
6. **Fewer equations than unknowns can still be enough.** Two equations in $x, y, z$ cannot pin down each variable, but a combination like $x + y + z$ may be fully determined. Try combinations before declaring "not enough information."
7. **Symmetric pairwise sums:** adding $x + y$, $y + z$, and $x + z$ yields $2(x + y + z)$; subtract each pair-sum from the total to isolate the variable it omits.
8. **Hidden integer constraints:** unknowns that count objects must be nonnegative integers, so one equation such as $8a + 5c = 47$ has the *unique* solution $a = 4$, $c = 3$. Check small multiples of one coefficient for a remainder divisible by the other — the engine behind many Data Sufficiency traps.
9. **Linear cost model:** "fixed fee plus constant rate" means $C = F + r \cdot n$; two data points give $r = \dfrac{\Delta C}{\Delta n}$ because the fee cancels in the difference.

## Worked examples

**Example 1** — *A shop sells only notebooks and pens. Three notebooks and two pens cost $\$16.50$; one notebook and four pens cost $\$10.50$. What is the price of one notebook?*

1. Let $n$ and $p$ be the prices: $3n + 2p = 16.50$ and $n + 4p = 10.50$.
2. Multiply the second equation by $3$: $3n + 12p = 31.50$. Subtracting the first equation kills $n$: $10p = 15.00$, so $p = 1.50$.
3. Then $n = 10.50 - 4(1.50) = 4.50$. Quick check: $3(4.50) + 2(1.50) = 13.50 + 3.00 = 16.50$. **Answer: $\$4.50$**

**Example 2** — *If $2p + 5q + 8r = 60$ and $5p + 8q + 11r = 90$, what is the value of $p + q + r$?*

1. Three unknowns, two equations — you cannot find $p$, $q$, $r$ individually, so target the combination directly.
2. Subtract the first equation from the second: $(5-2)p + (8-5)q + (11-8)r = 90 - 60$, which is $3p + 3q + 3r = 30$.
3. Divide by $3$: $p + q + r = 10$. **Answer: $10$**

**Example 3** — *A landscaping firm installs two garden designs. Each Basic garden needs $5$ hours of digging and $3$ hours of planting; each Premium garden needs $2$ hours of digging and $6$ hours of planting. Last week the firm logged $216$ hours of digging and planting combined, and planting hours exceeded digging hours by $24$. How many Premium gardens were installed?*

1. Let $b$ and $m$ count Basic and Premium gardens. Digging hours: $D = 5b + 2m$. Planting hours: $P = 3b + 6m$.
2. Translate the two facts about hours: $D + P = 216$ gives $8b + 8m = 216$, so $b + m = 27$. And $P - D = 24$ gives $-2b + 4m = 24$, so $-b + 2m = 12$.
3. Add the two reduced equations: $3m = 39$, so $m = 13$ and $b = 14$.
4. Verify: digging $= 5(14) + 2(13) = 96$, planting $= 3(14) + 6(13) = 120$; total $216$ and difference $24$, as required. **Answer: $13$**

## Trigger cues
- "Two purchases of the same two items at different quantities" → two price equations; eliminate the variable you were *not* asked for.
- "What is the value of $2x + 3y$?" (a combination, not one variable) → try $E_1 + E_2$ and $E_1 - E_2$ before solving; scale only if those fail.
- "For which $k$ does the system have no / infinitely many solutions?" → set coefficient ratios equal; the constant ratio splits "none" from "infinite."
- "The system has more than one solution" → the equations are the same line; use either one to answer what is asked.
- "$x + y = \ldots$, $y + z = \ldots$, $x + z = \ldots$" → add all three and halve to get $x + y + z$.
- "Fixed fee plus a rate; two total costs given" → rate $=$ cost difference over quantity difference; back out the fee after.
- Data Sufficiency counting objects with one revenue equation → check integer solutions before calling it insufficient.
- "In $10$ years, A will be twice B" → write ages at *that* time: $A + 10 = 2(B + 10)$; both people age equally.

## Trap gallery
- **Answering the wrong variable:** solving for the pen price when the notebook was asked. Fix: circle the target first; eliminate the other one.
- **"Two unknowns need two equations" reflex in DS:** integer constraints can make one equation sufficient (as with $8a + 5c = 47$), and two proportional equations are really one. Fix: test dependence and integer solutions.
- **Ratio test half-done:** matching $\frac{a_1}{a_2} = \frac{b_1}{b_2}$ and stopping. Fix: the constants decide — equal constant ratio means infinitely many, unequal means none.
- **Sign slip in elimination:** subtracting only some terms. Fix: subtract every term, including the right side, in one written line.
- **Aging only one person:** writing $A + 10 = 2B$ for "in ten years." Fix: add the years to both ages.
- **Unit drift:** mixing dollars with cents, or hours with a count of gardens. Fix: state units when defining each variable.

## Speed moves
- **Add-first reflex:** on symmetric-looking systems, add immediately — $5x + 2y$ and $2x + 5y$ sum to $7(x + y)$.
- **Difference for the rate:** a $5$-mile ride costs $\$14$ and a $9$-mile ride $\$22$, so the rate is $\frac{8}{4} = \$2$ per mile, the fee $\$4$, and $15$ miles cost $\$34$ — no system written.
- **test the answer choices from the choices:** a machine holds $40$ bottles at $\$2$ and $\$1.25$ totaling $\$62$; test the middle choice $j = 16$: $16 + 24 = 40$ and $32 + 30 = 62$ — done.
- **Scale to match, don't solve:** to get $x + y + z$ from two 3-variable equations, look at coefficient *gaps* (Example 2's gaps were all $3$) rather than isolating anything.
- **Determinant glance:** for "exactly one solution?", compute $a_1b_2 - a_2b_1$ mentally; nonzero settles DS sufficiency without solving.

## Before you drill
- I can run elimination and substitution cleanly and choose the faster one on sight.
- I can state the ratio conditions for one, none, and infinitely many solutions.
- Given a target like $2x + 3y$, I try adding or subtracting the equations before solving.
- I can extract a determined combination from two equations in three unknowns.
- I check integer constraints before judging a one-equation DS statement insufficient.
- I translate fee-plus-rate and age setups without re-deriving them from scratch.
- I verify one equation with my solved values before confirming an answer.
