# Min/Max Optimization: Squeezing Extremes Out of Constraints

## Why this matters
GMAT Focus loves asking not "what is $x$?" but "what is the greatest (or least) possible value of $x$?" At the Q86 level these appear as multi-constraint word problems — budgets, capped averages, distinct-integer lists, ratio limits — plus algebraic versions built on quadratics and interval arithmetic. All of them reward one discipline: push every other quantity to its allowed extreme, then check the scenario is legal.

## The core ideas
1. **Opposition principle.** If $x_1 + x_2 + \dots + x_n = S$ is fixed, to maximize one term minimize all the others: $x_{\max} = S - (\text{least possible sum of the rest})$. Every unit given elsewhere is stolen from your target.
2. **Boundary principle.** A monotone objective on a constrained interval hits its extreme at an endpoint: if cost $C(h)$ increases in $h$ and $h \ge h_0$, the minimum cost is $C(h_0)$. Moving off the boundary can only make things worse.
3. **Integer rounding.** The greatest integer $n$ with $f + rn \le B$ is $n = \left\lfloor \frac{B - f}{r} \right\rfloor$; the least integer $n$ with $rn - f \ge T$ is $n = \left\lceil \frac{T + f}{r} \right\rceil$. Solve the inequality, then round in the only direction it permits.
4. **Differences take opposite extremes.** $\max(x - y) = (\max x) - (\min y)$ and $\min(x - y) = (\min x) - (\max y)$: a difference grows when the leading part grows and the subtracted part shrinks.
5. **Products live at corners.** For $a \in [a_1, a_2]$ and $b \in [b_1, b_2]$, the extreme values of $ab$ are among the four endpoint products. Sign flips make "obvious" answers wrong, so compute all four.
6. **Quadratic vertex.** $y = ax^2 + bx + c$ has its extreme at $x = -\frac{b}{2a}$ with value $c - \frac{b^2}{4a}$: a minimum if $a > 0$, a maximum if $a < 0$. In completed-square form, $-(x-h)^2 + k \le k$ because a square is never negative.
7. **Fixed sum caps the product.** If $x + y = S$, then $xy = \left(\frac{S}{2}\right)^2 - \left(\frac{x-y}{2}\right)^2 \le \left(\frac{S}{2}\right)^2$, with equality when $x = y$.
8. **Average bound (pigeonhole).** Among $n$ numbers summing to $S$, the largest is at least $\frac{S}{n}$ and the smallest is at most $\frac{S}{n}$ — they cannot all sit on one side of the mean.
9. **Distinct integers pack consecutively.** To make distinct positive integers as small as possible, use $1, 2, 3, \dots$; to make distinct integers greater than $m$ as small as possible, use $m+1, m+2, \dots$ Any gap wastes room you wanted elsewhere.
10. **Ratio caps set a floor.** "No value may exceed $k$ times any other" means $\max \le k \cdot \min$, so once the maximum is $M$, every value must be at least $\frac{M}{k}$ — this hidden floor limits $M$.

## Worked examples

**Example 1** *If $-7 \le m \le 4$ and $-5 \le n \le 6$, what is the greatest possible value of $mn$?*

1. Products over intervals are extremized at endpoint pairs, so list the four corner products.
2. $(-7)(-5) = 35$, $(-7)(6) = -42$, $(4)(-5) = -20$, $(4)(6) = 24$.
3. The winner is the double-negative corner: $35$ beats the all-positive $24$.

**Answer: $35$**

**Example 2** *Nine distinct positive integers have an average of $15$ and a median of $10$. What is the greatest possible value of the largest of the nine integers?*

1. The sum is fixed: $9 \times 15 = 135$. By the opposition principle, maximize the largest by minimizing the other eight.
2. The 5th value is the median, $10$. The four below it are distinct positive integers under $10$; smallest choice: $1, 2, 3, 4$, summing to $10$.
3. The 6th through 8th values are distinct integers above $10$; smallest choice: $11, 12, 13$, summing to $36$.
4. The eight non-largest values total $10 + 10 + 36 = 56$, so the largest is $135 - 56 = 79$.
5. Legality check: $79 > 13$, all values distinct and positive, median still $10$.

**Answer: $79$**

**Example 3** *A dispatcher must assign exactly $52$ deliveries among $6$ drivers. Each driver must receive at least $5$ deliveries, and no driver may receive more than three times as many deliveries as any other driver. What is the greatest number of deliveries that any one driver can receive?*

1. Let $M$ be the target maximum. The ratio cap $M \le 3 \cdot \min$ forces every other driver to receive at least $\frac{M}{3}$ deliveries (and at least $5$).
2. The five other drivers share $52 - M$ deliveries, so feasibility requires $52 - M \ge 5 \cdot \left\lceil \frac{M}{3} \right\rceil$ once $\frac{M}{3} \ge 5$.
3. Test $M = 19$: each other driver needs at least $\lceil 19/3 \rceil = 7$, so the others need at least $35$, but only $52 - 19 = 33$ remain. Infeasible — and larger $M$ raises the floor while shrinking the pool.
4. Test $M = 18$: each other driver needs at least $6$, and $52 - 18 = 34 \ge 30$ works. A legal assignment is $6, 7, 7, 7, 7, 18$: the sum is $52$, every driver has at least $5$, and $18 \le 3 \times 6$.

**Answer: $18$**

## Trigger cues
- "Greatest/least possible value of one member" with a fixed total or average → opposition principle: extremize everyone else.
- "At least $k$ hours/units" with an increasing cost → evaluate the cost exactly at the boundary $k$.
- "Greatest number within budget" or "least number to reach a target" → solve the inequality, then floor or ceiling.
- "Distinct integers" plus a median or sum → pack the non-target values consecutively from the tightest bound.
- "$x + y$ is fixed, is $xy \le \dots$?" → the product is capped at $\left(\frac{S}{2}\right)^2$.
- "No one may have more than $k$ times any other" → $\min \ge \frac{M}{k}$; test $M$ from the top.
- Ranges for two variables, extreme of $x - y$ or $xy$ → corner analysis; for a difference, take opposite extremes.

## Trap gallery
- **Maxing both variables in a product.** For $3 \le a \le 8$ and $-5 \le b \le 2$, the least $ab$ is $8 \times (-5) = -40$, not $3 \times (-5) = -15$; check all four corners.
- **Rounding the wrong way.** A budget allowing $\frac{175}{12} \approx 14.58$ months buys $14$ months, not $15$; a required minimum rounds up instead.
- **Forgetting "distinct."** Reusing a value below the median understates the reserved sum and inflates your maximum.
- **Ignoring the hidden floor in ratio problems.** Setting the others to the stated minimum can break $\max \le k \cdot \min$; the real floor is $\frac{M}{k}$.
- **Skipping the legality check.** After extremizing, confirm order, distinctness, integrality, and caps all still hold.
- **Sign error at the vertex.** $-(x - h)^2 + k$ has a maximum of $k$, not $h$; the square only ever subtracts.

## Speed moves
- **Boundary-first evaluation.** For "at least 6 hours" with rising cost, plug $h = 6$ immediately — no other case can win.
- **Divide, then round with a one-step check.** Least $n$ with $14n \ge 300$: $\frac{300}{14} \approx 21.4$, so $n = 22$; confirm $14 \times 21 = 294$ falls short.
- **Build the witness list.** Write the extremized list (like $1,2,3,4,10,11,12,13,79$) and add it up — faster and safer than pure algebra.
- **Corner scan.** Four quick multiplications settle any interval-product question in under 30 seconds.
- **Vertex by symmetry.** For $x^2 + bx + c$, jump to $x = -\frac{b}{2}$; in Data Sufficiency, the minimum value needs both $b$ and $c$, so one constant alone is insufficient.

## Before you drill
1. I can state the opposition principle and apply it to a fixed sum or average in one line.
2. I know which way to round: floor for "most within a limit," ceiling for "least to reach a target."
3. I check all four corner products before claiming a max or min of $ab$.
4. I can read $\max$ and $\min$ of a quadratic straight from $x = -\frac{b}{2a}$ or the completed square.
5. I automatically translate "no more than $k$ times any other" into $\min \ge \frac{M}{k}$.
6. I pack distinct integers consecutively when minimizing the rest of a list.
7. I verify every extremized scenario against all constraints before selecting an answer.
