# Overlapping Sets: Counting Without Double-Counting

## Why this matters

Overlapping-sets questions are a fixture of GMAT Focus Quant, and at the Q86 tier they show up dressed in words: survey results, workshop sign-ups, membership rolls. The math is one or two clean identities — the difficulty is translation speed and knowing which of the small family of formulas the stem is pointing at. A well-drilled test taker solves most of these in under 90 seconds with zero algebraic risk.

Ideas 1–5 are the two-set family; 6 is the two-way table (the structure most often misdiagnosed as a Venn problem); 7 the bounds that power min/max stems; 8–11 the three-set machinery whose region identity cracks the hardest versions. The inclusion–exclusion instinct built here feeds directly into the probability chapter.

## The core ideas

Ideas 1–5 are the two-set family; 6 the table; 7 the bounds; 8–11 three sets.

1. **Two-set inclusion–exclusion:** $|A \cup B| = |A| + |B| - |A \cap B|$. Adding $|A|$ and $|B|$ counts every element in the overlap twice, so you subtract it once.
Check: $|A| = 41$, $|B| = 33$, both $= 13$. The union? ⇒ $41 + 33 - 13 = 61$.

2. **The neither term:** $T = |A| + |B| - \text{both} + \text{neither}$. The total splits into "at least one" plus "neither," and "at least one" is exactly $|A \cup B|$.

3. **"At least one" shortcut:** if every element belongs to at least one set, then $\text{neither} = 0$ and $|A \cup B| = T$. One sentence in the stem kills a whole variable.

4. **One but not the other:** $|A \text{ only}| = |A| - \text{both}$. Removing the overlap from $A$ leaves the part of $A$ outside $B$.
Check: $|A| = 41$ and both $= 13$. "$A$ only"? ⇒ $28$.

5. **Exactly one of two sets:** $|A| + |B| - 2 \cdot \text{both}$. Each set contributes its "only" region, and the overlap must be stripped from each of the two sets separately.
Check: $|A| = 20$, $|B| = 15$, both $= 6$. Exactly one? ⇒ $20 + 15 - 12 = 23$.

6. **The two-way table:** when a group is split by two independent yes/no attributes (car vs. no car, remote vs. onsite), build a $2 \times 2$ grid whose rows and columns each sum to their totals. Every cell is forced once you have three independent facts, because each row and column is a one-step subtraction.

7. **Overlap bounds:** $\max(0,\ |A| + |B| - T) \le |A \cap B| \le \min(|A|, |B|)$. The overlap is largest when one set sits inside the other, and smallest when the two sets spread out to fill the total.
Check: $|A| = 70$, $|B| = 55$, $T = 100$. Least possible both? ⇒ $70 + 55 - 100 = 25$.

8. **Three-set union:** $|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$. Pairwise overlaps are double-counted by the singles, and the triple region is added three times, subtracted three times, so it must be restored once.

9. **Three sets by exact regions:** let $e_1, e_2, e_3$ count elements in exactly one, exactly two, and all three sets. Then $|A| + |B| + |C| = e_1 + 2e_2 + 3e_3$, because an element in $k$ sets is counted $k$ times in the sum of the singles. Combined with $|A \cup B \cup C| = e_1 + e_2 + e_3$, this gives the workhorse identity $$|A \cup B \cup C| = |A| + |B| + |C| - e_2 - 2e_3.$$
Check: An element sitting in exactly two of the sets is counted how many times in $|A|+|B|+|C|$? ⇒ Twice — once per set it belongs to.

10. **Useful derived counts:** $\text{at least two} = e_2 + e_3$, and the sum of the three pairwise intersections equals $e_2 + 3e_3$, since the triple region sits inside all three pairwise overlaps.
Check: $e_2 = 46$ and $e_3 = 14$. How many belong to at least two sets? ⇒ $60$.

11. **Percent versions:** all identities above hold with percentages or fractions; set $T = 100$ and every count becomes a percent.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*Each of the $30$ students in a class plays soccer, basketball, or both. If $18$ play soccer and $15$ play basketball, how many play both sports?*

1. "Each … plays" means neither $= 0$, so the union is the whole class: $30$.
2. Inclusion–exclusion: $18 + 15 - \text{both} = 30$, so both $= 3$.

**Answer: $3$**

**Example 2 · 605 level · target 1:40**

*A book club has $72$ members. This month, $41$ members read the mystery selection and $33$ read the science-fiction selection. If $11$ members read neither book, how many members read both?*

1. The number who read at least one book is $72 - 11 = 61$.
2. Inclusion–exclusion: $41 + 33 - \text{both} = 61$.
3. So $74 - \text{both} = 61$, giving $\text{both} = 13$.
4. Sanity check by regions: mystery only $= 41 - 13 = 28$, sci-fi only $= 33 - 13 = 20$, and $28 + 20 + 13 + 11 = 72$. Consistent.

**Wrong turn: dropping the neither group.** $41 + 33 - 72 = 2$ solves a different classroom — one where every member read something. The $11$ outsiders shrink the union to $61$ *before* inclusion–exclusion runs, and the planted $2$ waits for whoever skips that step.

**Answer: $13$**

**Example 3 · 655 level · target 2:05**

*A firm has $160$ employees: $100$ engineers and $60$ designers. Exactly $70$ employees work onsite and the rest work remotely. If the number of engineers who work onsite is three times the number of designers who work remotely, how many engineers work remotely?*

1. Two binary attributes (role, location) means a two-way table. Totals: engineers $100$, designers $60$; onsite $70$, remote $160 - 70 = 90$.
2. Let $d$ be the number of designers who work remotely. Then engineers onsite $= 3d$, and designers onsite $= 70 - 3d$.
3. The designer row must sum to $60$: $(70 - 3d) + d = 60$, so $70 - 2d = 60$ and $d = 5$.
4. Engineers onsite $= 3(5) = 15$, so engineers remote $= 100 - 15 = 85$.
5. Check the remote column: $85 + 5 = 90$. Consistent.

**Wrong turn: drawing a Venn diagram.** "Engineer" and "designer" don't overlap — nobody is both — and neither do onsite and remote. Circles model *overlapping* memberships; mutually exclusive attributes need the grid, where every unknown falls to row-and-column subtraction. Misdiagnosing the structure costs more time here than any computation.

**Answer: $85$**

**Example 4 · 705 level · target 2:30**

*In a survey of $100$ households, $70$ own a car and $55$ own a bicycle. What is the difference between the greatest and least possible numbers of households that own both?*

*A) $15$  B) $25$  C) $30$  D) $45$  E) $55$*

1. Greatest overlap: one set nests inside the other, so both $= \min(70, 55) = 55$.
2. Least overlap: the sets spread to fill the total, so both $= 70 + 55 - 100 = 25$ — the surplus that *must* overlap.
3. Difference: $55 - 25 = 30$.

**Wrong turn: solving for "the" overlap.** No neither-count is given, so the overlap is not a single number — it is a range, and the stem's "greatest and least possible" says so. Both endpoints ($55$ and $25$) are planted as choices for solvers who compute only one bound.

**Answer: $30$ (C)**

**Example 5 · Q86 level · target 2:50**

*Each of the $150$ customers at a market stall bought at least one of three blends: coffee, tea, or cocoa. If $88$ bought coffee, $74$ bought tea, $62$ bought cocoa, and exactly $46$ customers bought exactly two of the blends, how many customers bought exactly one blend?*

1. Everyone bought at least one blend, so $|C \cup T \cup K| = 150$.
2. Sum of singles: $88 + 74 + 62 = 224$.
3. Apply $|C \cup T \cup K| = \text{sum} - e_2 - 2e_3$: $\ 150 = 224 - 46 - 2e_3$.
4. So $2e_3 = 28$ and $e_3 = 14$ customers bought all three.
5. The regions partition the group: $e_1 = 150 - e_2 - e_3 = 150 - 46 - 14 = 90$.
6. Check the counting identity: $e_1 + 2e_2 + 3e_3 = 90 + 92 + 42 = 224$. Matches the sum of singles.

**Wrong turn: feeding $e_2$ into the pairwise formula.** The classic union formula subtracts *pairwise intersections*, and $46$ is not one — "exactly two" excludes the triple region, while every $|A \cap B|$ includes it. Mixing the two vocabularies produces answers a few multiples of $e_3$ off, all planted. Match the identity to the language: "exactly" stems run on the region identity, "intersection" stems on classic inclusion–exclusion.

**Answer: $90$**

## Trigger cues

- "How many chose neither / both?" with two groups and a total → two-set formula $T = |A| + |B| - \text{both} + \text{neither}$.
- "Every member belongs to at least one" → set $\text{neither} = 0$ immediately.
- Two yes/no attributes per person (own/don't own, remote/onsite) rather than two activities → two-way table, not a Venn diagram.
- "Exactly one of the two" → compute $|A| + |B| - 2 \cdot \text{both}$.
- "Least possible / greatest possible" overlap → the bounds $\max(0, |A|+|B|-T)$ and $\min(|A|,|B|)$.
- Three named groups with "exactly two" or "all three" language → the region identity $\text{sum of singles} = e_1 + 2e_2 + 3e_3$.
- Percentages with no total given → assume $T = 100$ and work in percentage points.

## Trap gallery

- **Forgetting the neither group.** Solving $|A| + |B| - \text{both} = T$ when some elements are outside both sets. Subtract neither from the total first.
- **Reading "exactly two" as a pairwise intersection.** $e_2$ excludes the triple region, but $|A \cap B|$ includes it. Pairwise sums equal $e_2 + 3e_3$, not $e_2$.
- **Answering "both" when the question asks "$A$ but not $B$"** (or vice versa). Reread the target before selecting; the trap choice is always listed.
- **Subtracting the overlap once for "exactly one"** instead of twice. Exactly one $= |A| + |B| - 2\cdot\text{both}$.
- **Venn-diagramming a matrix problem.** Attributes like remote vs. onsite are mutually exclusive, so overlap logic does not apply. Use a $2 \times 2$ grid with row and column totals.
- **Assuming the overlap is a fixed number when only bounds are determined.** If the stem says "least" or "greatest," you are optimizing, not solving.

## Speed moves

- **Grid before algebra.** In matrix problems, fill every cell you can by pure subtraction before introducing a variable — often only one cell needs algebra, as in Example 3 where a single equation in $d$ finished the problem.
- **One-line two-set solve.** Compute $\text{both} = |A| + |B| + \text{neither} - T$ in a single pass; for Example 2 that is $41 + 33 + 11 - 72 = 13$.
- **Set the total to $100$ for percents.** Given $50\%$ have $P$, $35\%$ have $Q$, $30\%$ have neither, take $T = 100$: both $= 50 + 35 - 70 = 15$, so $15/50 = 3/10$ of the $P$ group also has $Q$.
- **Min overlap by arithmetic, not diagrams.** With $|A| = 70$, $|B| = 55$ in a total of $100$, the least possible overlap is $70 + 55 - 100 = 25$ — no picture required.
- **Test the choices for "all three".** Answer choices for $e_3$ are small integers; plug one into $T = \text{sum} - e_2 - 2e_3$ and adjust by parity in one step.
- **Region audit as a checkpoint.** The exact regions must sum to the total ($e_1 + e_2 + e_3 = $ at least one, plus neither $= T$); a ten-second audit catches most translation slips.

## Before you drill

- I can state two-set inclusion–exclusion and the neither-augmented version without hesitation.
- I choose between a Venn diagram and a two-way table from the stem's structure, not habit.
- I can produce "$A$ only," "exactly one," and "both" from $|A|$, $|B|$, and one more fact.
- I know both overlap bounds and when a question is asking for one of them.
- I can write $|A|+|B|+|C| = e_1 + 2e_2 + 3e_3$ and explain why each coefficient is what it is.
- I distinguish "exactly two" ($e_2$) from "at least two" ($e_2 + e_3$) and from a pairwise intersection.
- I always verify that my regions partition the total before confirming an answer.
