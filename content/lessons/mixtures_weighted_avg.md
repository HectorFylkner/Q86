# Mixtures and Weighted Averages: Track the Pure Amount

## Why this matters

Mixtures and weighted averages appear from mid-level right up to the hardest Quant slots, and they reward setup discipline more than algebraic firepower. Combined class averages, coffee blends, acid dilutions, drain-and-replace tanks — all are one accounting identity in different costumes. Track the conserved quantity (total value, total cost, or pure solute) and the whole family collapses into two-minute arithmetic.

Ideas 1–3 build the weighted-average engine, 4–5 translate it into concentration language, and 6–9 handle the physical operations — evaporating, draining, replacing — where the exam hides its hardest versions. The lever rule in idea 3 is the single biggest time-saver in this family; the drain-and-replace decay in idea 7 is the single biggest point-saver at the top tier.

## The core ideas

Ideas 1–3 are the engine; 4–5 translate it to concentrations; 6–9 are the physical operations.

1. **Weighted average is total over total.** For groups of sizes $w_1, w_2, \dots$ with means $x_1, x_2, \dots$, the combined mean is $\bar{x} = \dfrac{w_1 x_1 + w_2 x_2 + \cdots}{w_1 + w_2 + \cdots}$. Not a new formula — $w_i x_i$ is the sum contributed by group $i$, so this is just the definition of the mean on the pooled data.
Check: $10$ values with mean $6$ are pooled with $20$ values with mean $12$. Combined mean? ⇒ $\frac{60 + 240}{30} = 10$.

2. **The combined mean sits between the group means, nearer the heavier group.** More points pull harder. In the check above, $10$ is twice as close to $12$ as to $6$ — matching the $2:1$ size ratio exactly. This positioning logic alone eliminates answer choices before any arithmetic.

3. **The lever rule (weights from distances).** Rearranging the two-group identity gives $\dfrac{w_1}{w_2} = \dfrac{x_2 - \bar{x}}{\bar{x} - x_1}$: the weights are *inversely* proportional to the distances from the combined mean. See it fast — a heavy group barely lets the mean move away from it, so short distance means big weight.
Check: Mixing $10\%$ and $40\%$ solutions to get $34\%$ — volume ratio? ⇒ distances $24$ and $6$, so $\frac{w_{10}}{w_{40}} = \frac{6}{24} = \frac{1}{4}$.

4. **Concentration is solute over total:** $c = \dfrac{\text{pure amount}}{\text{total volume}}$. Write one equation for the pure amount; that ledger is the whole problem.
Check: $4.8$ liters of dye in $12$ liters of solution — concentration? ⇒ $40\%$.

5. **Pure ingredient and water are just extreme solutions.** Adding pure acid is mixing with a $100\%$ component; adding water is mixing with a $0\%$ component. Both slot directly into the weighted-average identity — no special cases needed.
Check: In the lever rule, plain water enters as a solution of what strength? ⇒ $0\%$.

6. **Evaporation and water removal fix the solute.** If only water leaves, the pure amount is constant, so the new total volume is $\dfrac{\text{solute}}{c_{\text{target}}}$.
Check: $2$ liters of salt in $10$ liters of brine; water evaporates until the brine is $40\%$ salt. New volume? ⇒ $\frac{2}{0.4} = 5$ liters.

7. **Draining a uniform mixture removes every component proportionally.** Removing $k$ of $V$ liters removes the fraction $\dfrac{k}{V}$ of the solute and retains $\dfrac{V-k}{V}$. Repeating a drain-and-replace-with-water cycle $n$ times gives $c_n = c_0 \left(\dfrac{V-k}{V}\right)^n$ — a geometric decay, because each round multiplies by the same retention factor.
Check: Draining $10$ of $40$ liters and refilling with water — the concentration is multiplied by? ⇒ $\frac{3}{4}$ per cycle.

8. **Replacing with pure ingredient:** draining $d$ liters of a mixture at concentration $c$ from a $V$-liter tank and topping up with pure solute gives $c_{\text{new}} = \dfrac{(V-d)c + d}{V} = c + \dfrac{d}{V}(1-c)$, since the swapped-in liters go from concentration $c$ to concentration $1$.

9. **Percentage points are additive.** "Rises by $15$ percentage points" means $c_{\text{new}} = c + 0.15$, not $1.15c$. Misreading this phrase sinks otherwise correct setups.
Check: A $35\%$ solution rises by $15$ percentage points. New concentration? ⇒ $50\%$ — not $35 \times 1.15 = 40.25\%$.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*A class of $10$ students has an average test score of $80$, and a class of $20$ students has an average test score of $86$. What is the average score of the two classes combined?*

1. Total points: $10 \times 80 + 20 \times 86 = 800 + 1720 = 2520$.
2. Total students: $30$. Combined average: $\dfrac{2520}{30} = 84$.

**Wrong turn: averaging the averages.** $\frac{80 + 86}{2} = 83$ ignores that the second class is twice as large. The combined mean must sit twice as close to $86$ as to $80$ — and $84$ does.

**Answer: $84$**

**Example 2 · 605 level · target 1:40**

*A tea merchant blends $4$ kilograms of leaves that cost $\$9$ per kilogram with $6$ kilograms of leaves that cost $\$14$ per kilogram. What is the cost per kilogram, in dollars, of the blend?*

1. Total cost: $4 \cdot 9 + 6 \cdot 14 = 36 + 84 = 120$ dollars.
2. Total weight: $4 + 6 = 10$ kilograms.
3. Cost per kilogram: $\dfrac{120}{10} = 12$.
4. Sanity check with idea 2: $12$ is between $9$ and $14$ and closer to $14$, the price of the larger share. Consistent.

**Answer: $\$12$**

**Example 3 · 655 level · target 2:05**

*When $p$ liters of a solution that is $30\%$ acid are mixed with $q$ liters of a solution that is $75\%$ acid, the result is a solution that is $55\%$ acid. What is the value of $\dfrac{p}{q}$?*

1. Write the solute ledger: acid in equals acid out, so $0.30p + 0.75q = 0.55(p + q)$.
2. Expand and collect: $0.30p + 0.75q = 0.55p + 0.55q$ gives $0.20q = 0.25p$.
3. Solve the ratio: $\dfrac{p}{q} = \dfrac{0.20}{0.25} = \dfrac{4}{5}$.
4. Lever-rule confirmation: distances from $55$ are $55 - 30 = 25$ and $75 - 55 = 20$, and weights are inversely proportional to distances, so $p : q = 20 : 25 = 4 : 5$. Same answer, no algebra.

**Wrong turn: reading the distances as the weights.** Taking $p : q = 25 : 20 = 5 : 4$ — the un-inverted lever — is the planted reciprocal. Anchor it physically: the mix at $55\%$ sits closer to $75\%$, so the $75\%$ solution is the heavier ingredient, forcing $q > p$.

**Answer: $\dfrac{4}{5}$**

**Example 4 · 705 level · target 2:30**

*A car radiator holds $12$ liters of a coolant mixture that is $25\%$ antifreeze. How many liters of the mixture must be drained and replaced with pure antifreeze so that the resulting $12$ liters is $50\%$ antifreeze?*

*A) $2$  B) $3$  C) $4$  D) $5$  E) $6$*

1. Draining $d$ liters removes antifreeze at the current $25\%$, and the replacement is $100\%$: new antifreeze $= 0.25(12 - d) + d$.
2. Target: $0.25(12 - d) + d = 0.50 \times 12 = 6$.
3. Expand: $3 - 0.25d + d = 6$, so $0.75d = 3$ and $d = 4$.
4. Ledger check: drain $4$ L of $25\%$ mixture (removes $1$ L antifreeze, leaving $2$ L in $8$ L); add $4$ L pure → $6$ L antifreeze in $12$ L $= 50\%$. ✓

**Wrong turn: pretending the drain is pure water.** "Need $6$ L, have $3$ L, so add $3$ L" (choice B) forgets that the $3$ drained liters carried away antifreeze of their own — a quarter of every drained liter. The swap's *net* gain per liter is $1 - 0.25 = 0.75$, which is exactly the $0.75d$ in step 3.

**Answer: $4$ liters (C)**

**Example 5 · Q86 level · target 2:50**

*A vat contains $40$ liters of a solution that is $48\%$ dye. In each of two successive steps, $k$ liters of the solution are drained and replaced with $k$ liters of pure water, and the mixture is stirred until uniform after each replacement. After the second replacement, the solution is $27\%$ dye. What is the value of $k$?*

1. Each cycle keeps the volume at $40$ liters and multiplies the dye amount — hence the concentration — by the retention factor $r = \dfrac{40-k}{40}$.
2. Two cycles give $48\% \cdot r^2 = 27\%$, so $r^2 = \dfrac{27}{48} = \dfrac{9}{16}$.
3. Take the positive root: $r = \dfrac{3}{4}$, so $\dfrac{40-k}{40} = \dfrac{3}{4}$ and $40 - k = 30$, giving $k = 10$.
4. Verify the ledger: dye starts at $0.48 \cdot 40 = 19.2$ liters; after one cycle, $19.2 \cdot \dfrac{3}{4} = 14.4$ liters ($36\%$); after two, $14.4 \cdot \dfrac{3}{4} = 10.8$ liters, and $\dfrac{10.8}{40} = 27\%$. Confirmed.

**Wrong turn: linear decay.** Treating the two cycles as removing equal percentage-point bites — "$48$ to $27$ is $21$ points, so $10.5$ points per cycle" — models a subtraction the physics doesn't do. Each drain removes a fraction of *whatever is currently there*: the second cycle removes less dye than the first because less dye remains. Decay is multiplicative, and the perfect-square ratio $\frac{27}{48} = \frac{9}{16}$ is the stem's gift confirming it.

**Answer: $k = 10$**

## Trigger cues

- "Average of the numbers in the two lists combined" → sum both totals, divide by combined count; never average the averages.
- "Mixing $x$ liters of $a\%$ with $y$ liters of $b\%$" and the ratio or one volume is asked → lever rule on distances from the target concentration.
- "Water evaporates" or "water is removed" → solute is fixed; new volume $=$ solute $\div$ target concentration.
- "Drawn off and replaced" done more than once → multiply by the retention factor $\left(\dfrac{V-k}{V}\right)$ per cycle.
- "Replaced with pure acid/antifreeze/juice" → treat the pure liquid as a $100\%$ solution; the net gain per swapped liter is $1 - c$.
- "Raises the concentration by $n$ percentage points" → additive shift $c + \dfrac{n}{100}$; set up two equations if two scenarios are given.
- "Cost per kilogram of the blend" → weighted average of unit prices with quantities as weights.

## Trap gallery

- **Unweighted averaging.** Mixing $8$ liters of $10\%$ with $2$ liters of $30\%$ is not $20\%$; the ledger gives $\dfrac{0.8 + 0.6}{10} = 14\%$. Always weight by quantity.
- **Inverted lever.** Assigning the larger weight to the farther ingredient. The mean sits *near* the heavy component — short distance, big weight — and the reciprocal of the right answer is always among the choices.
- **Shrinking solute during evaporation.** Only water leaves; the pure amount is untouched. Freeze the solute, recompute the total.
- **Linear thinking in repeated replacement.** Subtracting equal percentage points each cycle. Each cycle multiplies by the same retention fraction — decay is geometric.
- **Percentage points read as percent change.** Treating "$+15$ percentage points" as $\times 1.15$. Points add to $c$; percent multiplies it.
- **Draining only one component.** Removed mixture carries solute and water in the current proportion — never assume the drain took pure water.
- **Midpoint reflex.** Placing a combined mean halfway between group means despite unequal sizes. Unequal weights, unequal pull.

## Speed moves

- **Lever rule for instant ratios.** Mixing $10\%$ and $40\%$ to hit $34\%$: distances $24$ and $6$ give a $6:24 = 1:4$ volume ratio in five seconds, no equations.
- **One-line solute ledger.** Write pure-amount-before $=$ pure-amount-after and nothing else; most mixture problems are one such line.
- **Net gain per swapped liter.** Replacing $d$ liters of a $c$-strength mixture with pure solute adds $(1-c)$ per liter: Example 4 is "need $3$ more liters at $0.75$ net per liter → $d = 4$" in one breath.
- **Test the choices as replacement volumes.** Answer choices for drained liters are usually small integers; plug the middle choice into the retention factor and adjust once.
- **Smart total of $100$.** When only percents and ratios appear (no absolute volumes), set the batch to $100$ units so percents become counts.
- **Position estimation.** Note which group is heavier; the answer must land on that side of the midpoint — often enough to kill three choices.
- **Perfect-square scan.** In two-cycle replacement, the concentration ratio is a squared fraction: seeing $\dfrac{27}{48} = \dfrac{9}{16}$ hands you the retention factor $\dfrac{3}{4}$ immediately.

## Before you drill

- I can state the weighted-average identity and explain why it is just "total over total."
- I can place a combined mean on the correct side of the midpoint from group sizes alone.
- I can run the lever rule in both directions: distances to weights and weights to distances — and I know which side inverts.
- I write one solute equation before touching any other algebra.
- I treat pure liquids as $100\%$ (or $0\%$) components inside the same framework, and know the net gain per swapped liter is $1 - c$.
- I multiply by the retention factor $\dfrac{V-k}{V}$ per cycle in repeated replacement, never subtract points.
- I read "percentage points" as an additive change and "percent" as a multiplicative one.
