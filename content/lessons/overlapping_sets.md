# Overlapping Sets: Counting Without Double-Counting

## Why this matters

Overlapping-sets questions are a fixture of GMAT Focus Quant, and at the Q86 level they show up dressed in words: survey results, workshop sign-ups, membership rolls. The math is one or two clean identities — the difficulty is translation speed and knowing which of the small family of formulas the stem is pointing at. A well-drilled test taker solves most of these in under 90 seconds with zero algebraic risk.

## The core ideas

1. **Two-set inclusion–exclusion:** $|A \cup B| = |A| + |B| - |A \cap B|$. Adding $|A|$ and $|B|$ counts every element in the overlap twice, so you subtract it once.
2. **The neither term:** $T = |A| + |B| - \text{both} + \text{neither}$. The total splits into "at least one" plus "neither," and "at least one" is exactly $|A \cup B|$.
3. **"At least one" shortcut:** if every element belongs to at least one set, then $\text{neither} = 0$ and $|A \cup B| = T$. One sentence in the stem kills a whole variable.
4. **One but not the other:** $|A \text{ only}| = |A| - \text{both}$. Removing the overlap from $A$ leaves the part of $A$ outside $B$.
5. **Exactly one of two sets:** $|A| + |B| - 2 \cdot \text{both}$. Each set contributes its "only" region, and the overlap must be stripped from each of the two sets separately.
6. **The two-way table:** when a group is split by two independent yes/no attributes (car vs. no car, remote vs. onsite), build a $2 \times 2$ grid whose rows and columns each sum to their totals. Every cell is forced once you have three independent facts, because each row and column is a one-step subtraction.
7. **Overlap bounds:** $\max(0,\ |A| + |B| - T) \le |A \cap B| \le \min(|A|, |B|)$. The overlap is largest when one set sits inside the other, and smallest when the two sets spread out to fill the total.
8. **Three-set union:** $|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$. Pairwise overlaps are double-counted by the singles, and the triple region is added three times, subtracted three times, so it must be restored once.
9. **Three sets by exact regions:** let $e_1, e_2, e_3$ count elements in exactly one, exactly two, and all three sets. Then $|A| + |B| + |C| = e_1 + 2e_2 + 3e_3$, because an element in $k$ sets is counted $k$ times in the sum of the singles. Combined with $|A \cup B \cup C| = e_1 + e_2 + e_3$, this gives the workhorse identity $$|A \cup B \cup C| = |A| + |B| + |C| - e_2 - 2e_3.$$
10. **Useful derived counts:** $\text{at least two} = e_2 + e_3$, and the sum of the three pairwise intersections equals $e_2 + 3e_3$, since the triple region sits inside all three pairwise overlaps.
11. **Percent versions:** all identities above hold with percentages or fractions; set $T = 100$ and every count becomes a percent.

## Worked examples

**Example 1**

*A book club has $72$ members. This month, $41$ members read the mystery selection and $33$ read the science-fiction selection. If $11$ members read neither book, how many members read both?*

1. The number who read at least one book is $72 - 11 = 61$.
2. Inclusion–exclusion: $41 + 33 - \text{both} = 61$.
3. So $74 - \text{both} = 61$, giving $\text{both} = 13$.
4. Sanity check by regions: mystery only $= 41 - 13 = 28$, sci-fi only $= 33 - 13 = 20$, and $28 + 20 + 13 + 11 = 72$. Consistent.

**Answer: 13**

**Example 2**

*A firm has $160$ employees: $100$ engineers and $60$ designers. Exactly $70$ employees work onsite and the rest work remotely. If the number of engineers who work onsite is three times the number of designers who work remotely, how many engineers work remotely?*

1. Two binary attributes (role, location) means a two-way table. Totals: engineers $100$, designers $60$; onsite $70$, remote $160 - 70 = 90$.
2. Let $d$ be the number of designers who work remotely. Then engineers onsite $= 3d$, and designers onsite $= 70 - 3d$.
3. The designer row must sum to $60$: $(70 - 3d) + d = 60$, so $70 - 2d = 60$ and $d = 5$.
4. Engineers onsite $= 3(5) = 15$, so engineers remote $= 100 - 15 = 85$.
5. Check the remote column: $85 + 5 = 90$. Consistent.

**Answer: 85**

**Example 3**

*Each of the $150$ customers at a market stall bought at least one of three blends: coffee, tea, or cocoa. If $88$ bought coffee, $74$ bought tea, $62$ bought cocoa, and exactly $46$ customers bought exactly two of the blends, how many customers bought exactly one blend?*

1. Everyone bought at least one blend, so $|C \cup T \cup K| = 150$.
2. Sum of singles: $88 + 74 + 62 = 224$.
3. Apply $|C \cup T \cup K| = \text{sum} - e_2 - 2e_3$: $\ 150 = 224 - 46 - 2e_3$.
4. So $2e_3 = 28$ and $e_3 = 14$ customers bought all three.
5. The regions partition the group: $e_1 = 150 - e_2 - e_3 = 150 - 46 - 14 = 90$.
6. Check the counting identity: $e_1 + 2e_2 + 3e_3 = 90 + 92 + 42 = 224$. Matches the sum of singles.

**Answer: 90**

## Trigger cues

- "How many chose neither / both?" with two groups and a total → two-set formula $T = |A| + |B| - \text{both} + \text{neither}$.
- "Every member belongs to at least one" → set $\text{neither} = 0$ immediately.
- Two yes/no attributes per person (own/don't own, remote/onsite) rather than two activities → two-way table, not a Venn diagram.
- "Exactly one of the two" → compute $|A| + |B| - 2 \cdot \text{both}$.
- "Least possible / greatest possible" overlap → the bounds $\max(0, |A|+|B|-T)$ and $\min(|A|,|B|)$.
- Three named groups with "exactly two" or "all three" language → the region identity $\text{sum of singles} = e_1 + 2e_2 + 3e_3$.
- Percentages with no total given → assume $T = 100$ and work in percentage points.

## Trap gallery

- Forgetting the neither group: solving $|A| + |B| - \text{both} = T$ when some elements are outside both sets. Fix: subtract neither from the total first.
- Reading "exactly two" as a pairwise intersection: $e_2$ excludes the triple region, but $|A \cap B|$ includes it. Fix: pairwise sums equal $e_2 + 3e_3$, not $e_2$.
- Answering "both" when the question asks "$A$ but not $B$" (or vice versa). Fix: reread the target before selecting; the trap choice is always listed.
- Subtracting the overlap once for "exactly one" instead of twice. Fix: exactly one $= |A| + |B| - 2\cdot\text{both}$.
- Venn-diagramming a matrix problem: attributes like remote vs. onsite are mutually exclusive, so overlap logic does not apply. Fix: $2 \times 2$ grid with row and column totals.
- Assuming the overlap is a fixed number when only bounds are determined. Fix: if the stem says "least" or "greatest," you are optimizing, not solving.

## Speed moves

- **Grid before algebra:** in matrix problems, fill every cell you can by pure subtraction before introducing a variable — often only one cell needs algebra, as in Example 2 where a single equation in $d$ finished the problem.
- **One-line two-set solve:** compute $\text{both} = |A| + |B| + \text{neither} - T$ in a single pass; for Example 1 that is $41 + 33 + 11 - 72 = 13$.
- **convenient numbers 100 for percents:** given $50\%$ have $P$, $35\%$ have $Q$, $30\%$ have neither, take $T = 100$: both $= 50 + 35 - 70 = 15$, so $15/50 = 3/10$ of the $P$ group also has $Q$.
- **Min overlap by arithmetic, not diagrams:** with $|A| = 70$, $|B| = 55$ in a total of $100$, the least possible overlap is $70 + 55 - 100 = 25$ — no picture required.
- **test the answer choices "all three":** answer choices for $e_3$ are small integers; plug one into $T = \text{sum} - e_2 - 2e_3$ and adjust by parity in one step.
- **Region audit as a checkpoint:** the exact regions must sum to the total ($e_1 + e_2 + e_3 = $ at least one, plus neither $= T$); a ten-second audit catches most translation slips.

## Before you drill

- I can state two-set inclusion–exclusion and the neither-augmented version without hesitation.
- I choose between a Venn diagram and a two-way table from the stem's structure, not habit.
- I can produce "$A$ only," "exactly one," and "both" from $|A|$, $|B|$, and one more fact.
- I know both overlap bounds and when a question is asking for one of them.
- I can write $|A|+|B|+|C| = e_1 + 2e_2 + 3e_3$ and explain why each coefficient is what it is.
- I distinguish "exactly two" ($e_2$) from "at least two" ($e_2 + e_3$) and from a pairwise intersection.
- I always verify that my regions partition the total before confirming an answer.
