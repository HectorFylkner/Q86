# Combinatorics: Slots, Committees, and Restrictions

## Why this matters

GMAT Focus counting questions are short to state and brutal to guess: every classic mistake — ordering an unordered pick, forgetting a factor of $2$, double counting — lands exactly on a wrong answer choice. At the Q86 tier you must translate a word problem into slots or a selection in under 30 seconds and handle one or two restrictions cleanly. The math is elementary; the separator is disciplined setup.

Ideas 1–6 build the core machinery and the one decision that governs everything — the order test. Ideas 7–11 are the restriction toolkit (repeats, quotas, glue, complements, tightest-first), and 12–13 the two named structures (grid paths, stars and bars) that reduce scary stems to a single binomial. The probability chapter runs entirely on the counts built here.

## The core ideas

Ideas 1–6 are the machinery and the order test; 7–11 restrictions; 12–13 named structures.

1. **Multiplication principle.** Independent sequential stages with $m$, then $n$, then $p$ options give $m \cdot n \cdot p$ outcomes — each choice pairs with every choice at the next stage. An *optional* stage just adds a "skip" option.
Check: $4$ mains, $3$ sides, and optionally one of $2$ desserts — how many orders? ⇒ $4 \cdot 3 \cdot 3 = 36$.

2. **Addition principle.** Mutually exclusive cases add: $N = N_1 + N_2 + \cdots$. Split into cases only when they cannot overlap.

3. **Permutations of $n$ distinct objects.** $n!$ arrangements — $n$ choices for the first position, $n-1$ for the next, and so on.

4. **Arrangements of $k$ out of $n$.** $P(n,k) = \dfrac{n!}{(n-k)!} = n(n-1)\cdots(n-k+1)$ — slot logic that stops after $k$ slots.
Check: $P(7, 2)$? ⇒ $7 \cdot 6 = 42$.

5. **Combinations (order irrelevant).** $\dbinom{n}{k} = \dfrac{n!}{k!\,(n-k)!}$ — every unordered group of $k$ appears $k!$ times among the ordered lists, so divide that out.
Check: $\dbinom{9}{4}$? ⇒ $\dfrac{9 \cdot 8 \cdot 7 \cdot 6}{24} = 126$.

6. **The order test.** Swap two chosen items: if the outcome changes (rankings, codes, displays), use $P$ or slots; if not (committees, teams), use $\binom{n}{k}$.
Check: A $3$-person committee from $8$ people — $P$ or $\binom{n}{k}$, and how many? ⇒ Combinations: $\binom{8}{3} = 56$.

7. **Repeated identical objects.** Arrangements of $n$ objects with identical groups of sizes $a, b, \ldots$ number $\dfrac{n!}{a!\,b!\cdots}$ — swapping identical copies changes nothing.
Check: How many distinct arrangements of the digits $1,1,2,2,3$? ⇒ $\dfrac{5!}{2!\,2!} = 30$.

8. **Quota selections.** "Exactly $j$ of type X" means choosing each role separately and multiplying: $\binom{x}{j}\binom{y}{k-j}$.

9. **Glue method.** "Must be adjacent" means tape the pair into one block, arrange the blocks, then multiply by the block's internal orders ($2!$ for a pair — unless the order inside is dictated, in which case multiply by $1$).

10. **Complement counting.** $\text{valid} = \text{total} - \text{forbidden}$ — the fast lane for "at least one" (subtract the zero case) and "not adjacent" (subtract the glued count).

11. **Tightest restriction first.** Fill the most constrained slot before free ones so each slot's count stays clean. A $4$-digit code, no repeats, nonzero first digit: $9 \cdot 9 \cdot 8 \cdot 7 = 4536$.

12. **Grid paths.** Walking only east/north with $m$ east and $n$ north steps is arranging the string $EE\ldots NN\ldots$: $\dbinom{m+n}{m}$ routes.
Check: Four east steps and three north steps — how many routes? ⇒ $\binom{7}{3} = 35$.

13. **Stars and bars.** Positive integer solutions of $x_1 + \cdots + x_k = n$ number $\dbinom{n-1}{k-1}$ — line up $n$ units and choose $k-1$ of the $n-1$ gaps for dividers. Nonnegative solutions instead: $\binom{n+k-1}{k-1}$.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*How many distinct arrangements are there of the letters of the word LEVEL?*

1. Five letters with repeats: two L's and two E's (and one V).
2. Divide the repeats out of $5!$: $\dfrac{5!}{2!\,2!} = \dfrac{120}{4} = 30$.

**Wrong turn: $5! = 120$.** Treating the two L's as distinguishable counts every arrangement four times over ($2!$ for the L's times $2!$ for the E's). The planted $120$ is the give-away that a repeat divisor was skipped.

**Answer: $30$**

**Example 2 · 605 level · target 1:40**

*A raffle ticket carries a $5$-digit number. The first digit cannot be $0$, no digit repeats, and the last digit must be $5$. How many ticket numbers are possible?*

1. Rank the restrictions: last slot forced, first slot doubly restricted, middle three free. Fill in that order.
2. Last slot: must be $5$, so $1$ way.
3. First slot: any digit except $0$ and except the used $5$, so $8$ ways.
4. Middle three slots: $8$ digits remain, then $7$, then $6$.
5. Multiply: $1 \cdot 8 \cdot 8 \cdot 7 \cdot 6 = 2688$.

**Answer: $2688$**

**Example 3 · 655 level · target 2:05**

*A startup selects a $5$-person launch team from $7$ developers and $4$ marketers. If the team must include at least one marketer, how many different teams are possible?*

1. Teams are unordered, so this is combinations. "At least one" screams complement: count all teams, subtract the marketer-free ones.
2. Total teams: $\binom{11}{5} = \dfrac{11 \cdot 10 \cdot 9 \cdot 8 \cdot 7}{120} = 462$.
3. All-developer teams: $\binom{7}{5} = \binom{7}{2} = 21$.
4. Subtract: $462 - 21 = 441$. A four-case direct sum ($140 + 210 + 84 + 7$) confirms it.

**Wrong turn: forcing one marketer in.** "Pick a required marketer ($4$ ways), then any $4$ of the remaining $10$" gives $4 \cdot 210 = 840$ — nearly double the truth, because every team with two marketers is counted twice, with three marketers three times. Reserved-seat counting always overcounts "at least" conditions; the complement never does.

**Answer: $441$**

**Example 4 · 705 level · target 2:30**

*Seven singers stand in a row for a photo. Ana and Ben insist on standing next to each other, while Cara and Dev refuse to stand next to each other. How many lineups are possible?*

1. Glue the "together" pair; handle the "apart" pair by complement.
2. Glue Ana and Ben into one block: $6$ units arrange in $6! = 720$ ways, times $2!$ internal orders, so $2 \cdot 720 = 1440$ lineups keep them adjacent.
3. Remove the lineups where Cara and Dev are *also* adjacent. Glue them too: $5$ units, $5! = 120$ arrangements, times $2$ per block: $2 \cdot 2 \cdot 120 = 480$.
4. Subtract: $1440 - 480 = 960$.

**Wrong turn: complementing against the wrong total.** Subtracting the double-glued $480$ from the unrestricted $7! = 5040$ answers a question that forgot Ana and Ben. The complement must run *inside* the universe where the first restriction already holds ($1440$), not the raw universe — layered restrictions peel from the inside out.

**Answer: $960$**

**Example 5 · Q86 level · target 2:50**

*How many ordered triples of positive integers $(x, y, z)$ satisfy $x + y + z = 12$?*

*A) $55$  B) $66$  C) $91$  D) $110$  E) $220$*

1. Model the $12$ as a row of stars; a solution chops the row into three nonempty runs.
2. The chops happen at $2$ of the $11$ gaps between adjacent stars: $\binom{11}{2}$.
3. Compute: $\binom{11}{2} = 55$.

**Wrong turn: the nonnegative formula.** $\binom{12 + 3 - 1}{2} = \binom{14}{2} = 91$ — choice (C) — counts triples that allow zeros, which "positive integers" forbids. The two variants differ exactly by whether a divider may sit at the ends or beside another divider; check the zero-allowed question before picking a formula, or re-derive from the gaps picture, which never lies.

**Answer: $55$ (A)**

## Trigger cues

- "How many codes / ID numbers / sequences, no repeats" → slot method, tightest restriction first.
- "Committee / team / group of $k$" → combinations; the swap test confirms order is irrelevant.
- "Exactly one designer," "exactly two seniors" → per-role combinations multiplied together.
- "At least one" → complement: total minus the zero case.
- "Must sit together / consecutive / side by side" → glue the pair, arrange blocks, multiply by internal orders.
- "Refuse to be adjacent / cannot be consecutive" → total minus glued — with "total" meaning the universe where any other restrictions already hold.
- "$A$ immediately to the left of $B$" → glue with fixed internal order: $5!$ for six letters, no factor of $2$.
- "Arrange all the digits/letters of ..." with repeats → $n!$ over the factorials of the repeat counts.
- "Walking only east or north on a grid" → arrange a word of $E$s and $N$s: $\binom{m+n}{m}$.
- "Ordered triples of positive integers with $x+y+z = n$" → stars and bars, $\binom{n-1}{k-1}$.

## Trap gallery

- **Ordering a committee.** Using $P(n,k)$ for an unordered team inflates the count by $k!$; run the swap test first.
- **The missing (or extra) $2$.** A glued pair needs $\times\,2!$ when either order is allowed — and *no* factor when the problem fixes the order ("immediately to the left of").
- **"At least one" by forcing one in.** Picking one required nurse, then any $3$ of the remaining $8$, gives $3 \cdot 56 = 168$ — teams with two or more nurses are double counted. The true count is $\binom{9}{4} - \binom{6}{4} = 111$; use the complement.
- **Identical treated as distinct.** Arranging $1,1,2,2,3$ as $5! = 120$ instead of $30$; divide by the repeats.
- **Wrong stars-and-bars variant.** Positive solutions of $x+y+z=12$ number $\binom{11}{2} = 55$, not the nonnegative count $\binom{14}{2} = 91$; check whether zero is allowed.
- **Restrictions handled last.** Filling free slots first forces messy case splits; the tightest slot goes first.
- **Grid paths by multiplying dimensions.** A walk of $4$ east and $3$ north steps has $\binom{7}{3} = 35$ routes, not $4 \cdot 3 = 12$.

## Speed moves

- **Compute $\binom{n}{k}$ by cancellation, never full factorials.** $\binom{9}{4} = \dfrac{9 \cdot 8 \cdot 7 \cdot 6}{24} = 126$ in one line.
- **Symmetry for a single forbidden slot.** If chemistry can't be first of four periods, $3$ of $4$ positions work, so $\frac{3}{4} \cdot 4! = 18$ — no cases.
- **Shrink $k$ with $\binom{n}{k} = \binom{n}{n-k}$.** $\binom{11}{9}$ is really $\binom{11}{2} = 55$.
- **One subtraction beats four cases.** "At least one marketer" in Example 3 is $462 - 21$, not a four-term sum.
- **Test rules on a tiny model.** Unsure whether the pair needs $\times 2$? List all $6$ arrangements of $3$ people by hand in ten seconds.
- **Required member in an ordered pick.** Place it first — a $4$-letter sequence of distinct letters from $6$ that must use $P$: $4$ positions for $P$ times $5 \cdot 4 \cdot 3 = 240$.

## Before you drill

- I run the swap test to choose between $P(n,k)$ and $\binom{n}{k}$ before touching numbers.
- I fill the most restricted slot first in every code or seating problem.
- I glue adjacent pairs, and I know exactly when the $2!$ factor applies.
- I convert "at least one" and "not adjacent" to complements automatically — against the right universe.
- I divide by factorials of repeat counts when arranging identical objects.
- I recognize grid paths and integer-sum equations as multiset arrangements: $\binom{m+n}{m}$ and $\binom{n-1}{k-1}$.
- I compute binomials by cancellation and cross-check hard counts with a second method.
