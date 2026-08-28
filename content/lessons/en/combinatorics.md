# Combinatorics: Slots, Committees, and Restrictions

## Why this matters

GMAT Focus counting questions are short to state and brutal to guess: every classic mistake — ordering an unordered pick, forgetting a factor of $2$, double counting — lands exactly on a wrong answer choice. At the Q86 level you must translate a word problem into slots or a selection in under 30 seconds and handle one or two restrictions cleanly. The math is elementary; the separator is disciplined setup.

## The core ideas

1. **Multiplication principle.** Independent sequential stages with $m$, then $n$, then $p$ options give $m \cdot n \cdot p$ outcomes — each choice pairs with every choice at the next stage. An *optional* stage just adds a "skip" option: $4$ mains, $3$ sides, and an optional one of $2$ desserts gives $4 \cdot 3 \cdot 3 = 36$ orders.
1. **Addition principle.** Mutually exclusive cases add: $N = N_1 + N_2 + \cdots$. Split into cases only when they cannot overlap.
1. **Permutations of $n$ distinct objects.** $n!$ arrangements — $n$ choices for the first position, $n-1$ for the next, and so on.
1. **Arrangements of $k$ out of $n$.** $P(n,k) = \dfrac{n!}{(n-k)!} = n(n-1)\cdots(n-k+1)$ — slot logic that stops after $k$ slots.
1. **Combinations (order irrelevant).** $\dbinom{n}{k} = \dfrac{n!}{k!\,(n-k)!}$ — every unordered group of $k$ appears $k!$ times among the ordered lists, so divide that out.
1. **The order test.** Swap two chosen items: if the outcome changes (rankings, codes, displays), use $P$ or slots; if not (committees, teams), use $\binom{n}{k}$.
1. **Repeated identical objects.** Arrangements of $n$ objects with identical groups of sizes $a, b, \ldots$ number $\dfrac{n!}{a!\,b!\cdots}$ — swapping identical copies changes nothing. The digits $1,1,2,2,3$ give $\dfrac{5!}{2!\,2!} = 30$ integers, not $120$.
1. **Quota selections.** "Exactly $j$ of type X" means choosing each role separately and multiplying: $\binom{x}{j}\binom{y}{k-j}$.
1. **Glue method.** "Must be adjacent" means tape the pair into one block, arrange the blocks, then multiply by the block's internal orders ($2!$ for a pair — unless the order inside is dictated, in which case multiply by $1$).
1. **Complement counting.** $\text{valid} = \text{total} - \text{forbidden}$ — the fast lane for "at least one" (subtract the zero case) and "not adjacent" (subtract the glued count).
1. **Tightest restriction first.** Fill the most constrained slot before free ones so each slot's count stays clean. A $4$-digit code, no repeats, nonzero first digit: $9 \cdot 9 \cdot 8 \cdot 7 = 4536$.
1. **Grid paths.** Walking only east/north with $m$ east and $n$ north steps is arranging the string $EE\ldots NN\ldots$: $\dbinom{m+n}{m}$ routes. Four east, three north: $\binom{7}{3} = 35$.
1. **Stars and bars.** Positive integer solutions of $x_1 + \cdots + x_k = n$ number $\dbinom{n-1}{k-1}$ — line up $n$ units and choose $k-1$ of the $n-1$ gaps for dividers. For $x + y + z = 12$: $\binom{11}{2} = 55$. Nonnegative solutions instead: $\binom{n+k-1}{k-1}$.

## Worked examples

**Example 1** *A raffle ticket carries a $5$-digit number. The first digit cannot be $0$, no digit repeats, and the last digit must be $5$. How many ticket numbers are possible?*

1. Rank the restrictions: last slot forced, first slot doubly restricted, middle three free. Fill in that order.
1. Last slot: must be $5$, so $1$ way.
1. First slot: any digit except $0$ and except the used $5$, so $8$ ways.
1. Middle three slots: $8$ digits remain, then $7$, then $6$.
1. Multiply: $1 \cdot 8 \cdot 8 \cdot 7 \cdot 6 = 2688$.

**Answer: 2688**

**Example 2** *A startup selects a $5$-person launch team from $7$ developers and $4$ marketers. If the team must include at least one marketer, how many different teams are possible?*

1. Teams are unordered, so this is combinations. "At least one" screams complement: count all teams, subtract the marketer-free ones.
1. Total teams: $\binom{11}{5} = \dfrac{11 \cdot 10 \cdot 9 \cdot 8 \cdot 7}{120} = 462$.
1. All-developer teams: $\binom{7}{5} = \binom{7}{2} = 21$.
1. Subtract: $462 - 21 = 441$. A four-case direct sum ($140 + 210 + 84 + 7$) confirms it.

**Answer: 441**

**Example 3** *Seven singers stand in a row for a photo. Ana and Ben insist on standing next to each other, while Cara and Dev refuse to stand next to each other. How many lineups are possible?*

1. Glue the "together" pair; handle the "apart" pair by complement.
1. Glue Ana and Ben into one block: $6$ units arrange in $6! = 720$ ways, times $2!$ internal orders, so $2 \cdot 720 = 1440$ lineups keep them adjacent.
1. Remove the lineups where Cara and Dev are *also* adjacent. Glue them too: $5$ units, $5! = 120$ arrangements, times $2$ per block: $2 \cdot 2 \cdot 120 = 480$.
1. Subtract: $1440 - 480 = 960$.

**Answer: 960**

## Trigger cues

- "How many codes / ID numbers / sequences, no repeats" → slot method, tightest restriction first.
- "Committee / team / group of $k$" → combinations; the swap test confirms order is irrelevant.
- "Exactly one designer," "exactly two seniors" → per-role combinations multiplied together.
- "At least one" → complement: total minus the zero case.
- "Must sit together / consecutive / side by side" → glue the pair, arrange blocks, multiply by internal orders.
- "Refuse to be adjacent / cannot be consecutive" → total minus glued.
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

- **Compute $\binom{n}{k}$ by cancellation, never full factorials:** $\binom{9}{4} = \dfrac{9 \cdot 8 \cdot 7 \cdot 6}{24} = 126$ in one line.
- **Symmetry for a single forbidden slot:** if chemistry can't be first of four periods, $3$ of $4$ positions work, so $\frac{3}{4} \cdot 4! = 18$ — no cases.
- **Shrink $k$ with $\binom{n}{k} = \binom{n}{n-k}$:** $\binom{11}{9}$ is really $\binom{11}{2} = 55$.
- **One subtraction beats four cases:** "at least one marketer" in Example 2 is $462 - 21$, not a four-term sum.
- **Test rules on a tiny model:** unsure whether the pair needs $\times 2$? List all $6$ arrangements of $3$ people by hand in ten seconds.
- **Required member in an ordered pick:** place it first — a $4$-letter sequence of distinct letters from $6$ that must use $P$: $4$ positions for $P$ times $5 \cdot 4 \cdot 3 = 240$.

## Before you drill

- I run the swap test to choose between $P(n,k)$ and $\binom{n}{k}$ before touching numbers.
- I fill the most restricted slot first in every code or seating problem.
- I glue adjacent pairs, and I know exactly when the $2!$ factor applies.
- I convert "at least one" and "not adjacent" to complements automatically.
- I divide by factorials of repeat counts when arranging identical objects.
- I recognize grid paths and integer-sum equations as multiset arrangements: $\binom{m+n}{m}$ and $\binom{n-1}{k-1}$.
- I compute binomials by cancellation and cross-check hard counts with a second method.
