# Mean, Median, and Standard Deviation: Totals, Positions, and Spread

## Why this matters
The GMAT Focus treats these three statistics as three lenses on the same data: the mean tracks the *total*, the median tracks *positions in sorted order*, and the standard deviation tracks *spread around the center*. Hard questions — the Q85+ kind — mix the lenses: change one value and ask what happens to each statistic, or fix a mean and median and ask how extreme one value can get. Know which lens each statistic uses and the arithmetic stays short.

## The core ideas
1. Mean as a total: $\text{mean} = \dfrac{\text{sum}}{n}$, so $\text{sum} = n \cdot \text{mean}$. Convert immediately — totals add, averages don't.
2. Changing one value: raise a single value by $d$ and the mean rises by exactly $\dfrac{d}{n}$. In a replacement, $\text{new} - \text{old} = n \cdot (\text{change in mean})$.
3. Balance-point view: deviations from the mean sum to zero, $\sum (x_i - \bar{x}) = 0$ — surpluses cancel deficits, which finds missing values fast.
4. Median location: sort first. Odd $n$: position $\dfrac{n+1}{2}$. Even $n$: average of positions $\dfrac{n}{2}$ and $\dfrac{n}{2}+1$ — two positions, double the constraint.
5. Median is positional: moving a value without changing which values occupy the middle leaves it untouched. Raising the maximum never moves the median but always raises the mean.
6. Evenly spaced sets: $\text{mean} = \text{median} = \dfrac{\text{first} + \text{last}}{2}$, because terms pair off symmetrically. For $7, 11, 15, 19$, all three equal $13$.
7. Standard deviation measures spread: $\text{SD} = \sqrt{\dfrac{\sum (x_i - \bar{x})^2}{n}}$ — root-mean-square distance from the mean. The exam asks you to compare or transform it, not compute it.
8. SD transformations: adding a constant $c$ to every value leaves SD unchanged (the set slides; distances don't); multiplying every value by $k$ multiplies SD by $|k|$ (distances stretch). $\text{SD} = 0$ exactly when all values are equal.
9. Comparing SDs by eye: with equal counts, the set whose values sit farther from its own mean wins; far-out values dominate because deviations are squared. Range is not enough: $\{0, 10\}$ has $\text{SD} = 5$, but $\{0, 5, 10\}$ has $\text{SD} \approx 4.08$.
10. Optimization template: convert the mean to a total, pin the median position(s), then push every other value to its legal extreme — respecting sort order, so any value past the median must be at least the median.

## Worked examples

**Example 1**

*A cycling team has $6$ riders whose average (arithmetic mean) weekly training distance is $42$ miles. One rider is replaced by a new rider who trains $28$ miles per week, and the new average for the $6$ riders is $39$ miles. How many miles per week did the departing rider train?*

1. Convert to totals: before, $6 \times 42 = 252$; after, $6 \times 39 = 234$.
2. The swap cut the total by $252 - 234 = 18$, so the departing rider trained $18$ miles more than the newcomer.
3. Departing rider: $28 + 18 = 46$.

**Answer: $46$**

**Example 2**

*A data set consists of the four values $5$, $9$, $14$, and $x$. If the median of the set equals its mean, what is the sum of all possible values of $x$?*

1. The mean is $\dfrac{28 + x}{4}$. With four values, the median averages the two middle values — and which two are in the middle depends on where $x$ lands. Run the cases.
2. Case $x \le 5$: sorted order is $x, 5, 9, 14$, median $\dfrac{5+9}{2} = 7$. Then $\dfrac{28+x}{4} = 7$ gives $x = 0$, which satisfies $x \le 5$. Valid.
3. Case $5 \le x \le 14$: the middle values are $x$ and $9$, median $\dfrac{x+9}{2}$. Then $28 + x = 2x + 18$, so $x = 10$, in range. Valid.
4. Case $x \ge 14$: sorted order is $5, 9, 14, x$, median $\dfrac{9+14}{2} = 11.5$. Then $28 + x = 46$, so $x = 18 \ge 14$. Valid.
5. All three survive their range checks: $0 + 10 + 18 = 28$.

**Answer: $28$**

**Example 3**

*Six friends compared how many books each read last year. Every count is a positive integer, the mean is $15$, and the median is $12$. What is the greatest possible number of books read by any one friend?*

1. Total: $6 \times 15 = 90$. Sort the counts as $a_1 \le a_2 \le \cdots \le a_6$. The even count pins two positions: $\dfrac{a_3 + a_4}{2} = 12$, so $a_3 + a_4 = 24$.
2. To maximize $a_6$, minimize everything else: $a_1 = a_2 = 1$.
3. The pair $a_3 + a_4$ is locked at $24$, but the split matters because $a_5 \ge a_4$. Since $a_4 \ge a_3$ forces $a_4 \ge 12$, the split $a_3 = a_4 = 12$ allows the smallest legal $a_5 = 12$.
4. The first five values total $1 + 1 + 12 + 12 + 12 = 38$, leaving $a_6 = 90 - 38 = 52$. Check: $1, 1, 12, 12, 12, 52$ is sorted with mean $15$ and median $12$.

**Answer: $52$**

## Trigger cues
- "The average (arithmetic mean) of $n$ numbers is $m$" → write $\text{sum} = nm$ before reading further.
- "One value was recorded incorrectly / then corrected" → mean shifts by $\dfrac{\text{error}}{n}$; median shifts only if the middle changes hands.
- "A member leaves and another joins" → $\text{new} - \text{old} = n \cdot (\text{change in mean})$.
- "The mean equals the median" with an unknown → casework on where the unknown lands in sorted order, then range-check each solution.
- "Greatest / least possible value" under a fixed mean and median → totals, pin the median position(s), floor or ceiling everything else.
- "Which set has the greatest standard deviation?" → compare distances from each set's own mean; don't compute.
- "$c$ is added to each value / each value is doubled" → SD rules: a shift leaves SD alone; scaling by $k$ multiplies it by $|k|$.

## Trap gallery
- Taking the median before sorting — the middle of the list as written means nothing.
- Treating an even-count median like an odd one — it constrains two positions, and both must cooperate (in Example 3, forgetting $a_5 \ge a_4$ gives an illegal set).
- Assuming mean $=$ median by default — true for evenly spaced or symmetric sets only; skew pulls the mean toward the tail.
- Equating range with SD — $\{0, 10\}$ and $\{0, 5, 10\}$ share a range of $10$ but not an SD; clustering near the mean shrinks SD.
- Believing a shift changes SD, or that scaling doesn't — adding $c$ preserves spread; multiplying by $k$ stretches it by $|k|$.
- Skipping range checks in mean-median casework — a case can produce an $x$ outside its own assumed interval; discard that root.
- Dividing a change in total by the wrong $n$ — use the group size in force at the moment of each average.

## Speed moves
- Totals first: the instant you see a mean, multiply by $n$ — in Example 1 that turns a word problem into $252 - 234 = 18$.
- Deviation bookkeeping: to find a fifth number with mean $14$ given $9, 12, 15, 18$, tally deviations from $14$ ($-5, -2, +1, +4$ sum to $-2$), so the fifth number is $14 + 2 = 16$.
- One-value change shortcut: raising a single value by $20$ in a $5$-element set raises the mean by $\dfrac{20}{5} = 4$ and, if it was already the maximum, the median by $0$.
- Eyeball SD comparisons: mark each set's mean and judge how far the values sit from it; the set hugging its mean loses.
- test the answer choices mean-median questions: insert each answer choice, sort, and test $\text{mean} = \text{median}$ directly — often faster than casework.

## Before you drill
- I convert every stated mean into a total before doing anything else.
- I can locate the median position(s) for any $n$ — one when odd, two when even — after sorting.
- I know which statistic moves when one value changes: the mean always, the median only if the middle changes hands.
- I can state what adding a constant and scaling by $k$ each do to mean, median, and SD.
- I compare SDs by distance from the mean, never by range or by computing.
- In max/min problems I pin the median, floor or ceiling the rest, and respect sort order.
- In mean $=$ median casework I range-check every candidate before accepting it.
