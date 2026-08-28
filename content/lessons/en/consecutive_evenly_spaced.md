# Consecutive and Evenly Spaced Sets: Sum, Median, and Counting

## Why this matters

Evenly spaced sets hide inside sums of consecutive integers, house numbers, streetlights, bib numbers, and remainder counts, and the exam tests whether you exploit the symmetry or grind term by term. At the Q80+ level these questions are rarely hard computationally — they punish a single missed convention (the $+1$ in counting, the half-integer median of an even-sized set). Master three identities and the whole subtopic becomes a 30-second exercise.

## The core ideas

1. **Definition.** An evenly spaced (arithmetic) set has a constant gap $d$ between neighbors: consecutive integers have $d = 1$, consecutive even or odd integers have $d = 2$, and multiples of $k$ have $d = k$.
2. **The $n$th term.** $a_n = a_1 + (n-1)d$: reaching the $n$th term takes $n - 1$ steps of size $d$. Equivalently, $\text{last} - \text{first} = (n-1)d$.
3. **Mean equals median.** In any evenly spaced set, $\text{mean} = \text{median} = \dfrac{\text{first} + \text{last}}{2}$, because the set is symmetric about its center: each term above the middle is balanced by a mirror term below it.
4. **The master sum formula.** $\text{sum} = (\text{count}) \times (\text{median})$ — "sum equals count times average" combined with idea 3. Consequence: once the count is known, *any fact that pins down the median pins down the sum*, and vice versa.
5. **Counting terms (the fencepost rule).** $\text{count} = \dfrac{\text{last} - \text{first}}{d} + 1$. The division counts *gaps*; the $+1$ restores the first term. Forgetting it is the subtopic's most common error.
6. **Symmetric pairing.** $a_1 + a_n = a_2 + a_{n-1} = \dots = 2 \times \text{median}$, because stepping in from both ends adds $d$ on one side and subtracts it on the other. So "smallest plus largest" is always $2 \times \text{average}$.
7. **Counting by remainder.** The integers in $[A, B]$ that leave remainder $r$ when divided by $k$ form an evenly spaced set with $d = k$: find the first and last qualifying values, then apply idea 5.
8. **Divisibility of sums.** The sum of $n$ consecutive integers is $n \times \text{median}$: for odd $n$ the median is an integer, so the sum is divisible by $n$; for even $n$ the median is a half-integer (like $19.5$), so the sum is *never* divisible by $n$.
9. **Sum zero means median zero.** If an evenly spaced set sums to $0$, then $(\text{count}) \times (\text{median}) = 0$, so the median is $0$ — the set is symmetric around zero.

## Worked examples

**Example 1**

*The sum of $9$ consecutive integers is $171$. What is the smallest of the nine?*

1. Sum $=$ count $\times$ median, so the median is $\dfrac{171}{9} = 19$.
2. With $9$ terms, the median is the 5th term, which sits $4$ steps of size $1$ above the smallest.
3. Smallest $= 19 - 4 = 15$. (The set runs $15$ through $23$; $9 \times 19 = 171$.)

**Answer: $15$**

**Example 2**

*How many integers from $200$ to $600$, inclusive, leave a remainder of $5$ when divided by $8$?*

1. These integers form an evenly spaced set with gap $d = 8$: each has the form $8q + 5$.
2. Find the first one at or above $200$: since $200 = 8 \times 25$ exactly, the first qualifying value is $200 + 5 = 205$.
3. Find the last one at or below $600$: since $600 = 8 \times 75$ exactly, the largest value of the form $8q + 5$ that fits is $600 - 8 + 5 = 597$.
4. Apply the fencepost rule: $\dfrac{597 - 205}{8} + 1 = \dfrac{392}{8} + 1 = 49 + 1 = 50$.

**Answer: $50$**

**Example 3**

*$P$ is a set of consecutive odd integers. The sum of the four least integers in $P$ is $88$, and the sum of the four greatest integers in $P$ is $184$. What is the sum of all the integers in $P$?*

1. Let the least integer be $a$. The four least are $a, a+2, a+4, a+6$, so $4a + 12 = 88$, giving $a = 19$.
2. Let the greatest be $L$. The four greatest are $L-6, L-4, L-2, L$, so $4L - 12 = 184$, giving $L = 49$.
3. Count the terms with $d = 2$: $\dfrac{49 - 19}{2} + 1 = 16$.
4. Sum $=$ count $\times$ average $= 16 \times \dfrac{19 + 49}{2} = 16 \times 34 = 544$.

**Answer: $544$**

## Trigger cues

- "Sum of $n$ consecutive (even/odd) integers is $S$" → divide: median $= S/n$, then step out to any term you need.
- "What is the sum?" in Data Sufficiency → ask whether the statement fixes the median (any single term does); with the count known, that alone is sufficient.
- "How many multiples of $k$ / integers with remainder $r$ between $A$ and $B$" → find first and last qualifying values, then $\frac{\text{last} - \text{first}}{k} + 1$.
- "Lights/posts/trees equally spaced along a length, one at each end" → fencepost: $\frac{\text{length}}{\text{spacing}} + 1$.
- "Smallest plus largest" or "in terms of the average $k$" → symmetric pairing: first $+$ last $= 2k$; no algebra needed.
- "Largest is $m$ more than smallest" → count $= \frac{m}{d} + 1$, not $\frac{m}{d}$.
- "A term is removed; find the new average" → new sum $=$ old sum $-$ removed term; divide by the new count.

## Trap gallery

- **Dropping the $+1$.** $\frac{597 - 205}{8} = 49$ counts gaps, not terms; the answer is $50$. Fix: always add one after dividing the span.
- **Span confusion.** In $5$ consecutive even integers, largest $-$ smallest $= 2(5-1) = 8$, not $10$. Fix: span $= (n-1)d$.
- **Assuming an integer median.** An even count of consecutive integers has a half-integer median, so the sum of $4$ consecutive integers is never divisible by $4$. Fix: check the parity of the count before dividing.
- **"Between" vs. "inclusive."** Between $-20$ and $50$ there are $10$ multiples of $7$ (from $-14$ to $49$). Fix: pin down the first and last qualifying values before counting.
- **Forgetting zero and negatives are multiples.** $0$ is a multiple of every integer; skipping it (or the negative multiples) undercounts.
- **DS overreach.** "The sum of a set of consecutive integers is $120$" does *not* fix the count: $120 = \text{count} \times \text{median}$ has multiple factorizations. Fix: sufficiency needs both count and center.

## Speed moves

- **Median first, always.** One division recovers the center; every other term is a fixed number of steps away. Sum of $9$ terms $= 171$ → median $19$ instantly.
- **Pair-and-shift for sum differences.** To compute $(61 + 62 + \dots + 110) - (1 + 2 + \dots + 50)$, pair terms: each of the $50$ terms is exactly $60$ larger, so the difference is $50 \times 60 = 3000$. No summation formulas.
- **Divisibility by structure, not cases.** Sum of $4$ consecutive even integers $= 4a + 12 = 4(a + 3)$; since $a$ is even, $a + 3$ is odd — divisible by $4$, never by $8$. One line of algebra beats testing sets.
- **Compute the count, then check a tiny case.** Posts every $40$ feet along a $1{,}200$-foot fence with one at each end: $\frac{1200}{40} + 1 = 31$. Sanity-check with a tiny case ($80$ feet, every $40$ → $3$ posts) if the $+1$ feels doubtful.
- **Removal without re-summing.** $25$ consecutive integers sum to $1{,}050$ → median $42$, so the set runs $30$ to $54$; drop the $54$ and the new average is $\frac{1050 - 54}{24} = 41.5$.

## Before you drill

1. I can state and use $\text{sum} = \text{count} \times \text{median}$ without hesitation.
2. I apply $\text{count} = \frac{\text{last} - \text{first}}{d} + 1$ and never drop the $+1$.
3. I know mean $=$ median $= \frac{\text{first} + \text{last}}{2}$, so first $+$ last $= 2 \times \text{average}$.
4. I can find the first and last terms of a remainder class inside any interval, including intervals containing $0$ and negatives.
5. I know the span of $n$ terms is $(n-1)d$ and use it to jump between smallest, median, and largest.
6. In Data Sufficiency, I test whether a statement fixes the center and the count — nothing else matters for the sum.
7. I recognize that an even count of consecutive integers has a half-integer median, and I know what that does to divisibility.
