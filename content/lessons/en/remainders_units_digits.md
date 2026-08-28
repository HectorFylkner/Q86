# Remainders and Units Digits: Cycle Arithmetic Under Pressure

## Why this matters
The GMAT Focus loves questions that look like they demand a calculator — the units digit of a $58$th power, say — because they collapse into ten seconds of pattern work once you know that remainders cycle. The topic spans mid-level packing problems through the hardest Problem Solving and Data Sufficiency items, and at the Q86 level you must run this arithmetic modulo any divisor.

## The core ideas
1. **Division algorithm.** Every integer division has the form $n = dq + r$ with $0 \le r < d$: the remainder is what remains after removing the largest multiple of $d$ that fits, and the shortfall to the *next* multiple is $d - r$.
2. **Congruence language.** $a \equiv b \pmod{m}$ means $m$ divides $a - b$, i.e., $a$ and $b$ leave the same remainder — so numbers differing by a multiple of $m$ are interchangeable.
3. **Remainders respect arithmetic.** $(a+b) \bmod m$, $(a \cdot b) \bmod m$, and $a^k \bmod m$ all follow from $a \bmod m$ and $b \bmod m$: multiples of $m$ dropped along the way cannot change the final remainder.
4. **Units digit is a remainder.** The units digit of $n$ is $n \bmod 10$, so units digits add and multiply on their own — only last digits affect last digits.
5. **Power cycles mod $10$.** Units digits of powers repeat: $2 \to 2,4,8,6$; $3 \to 3,9,7,1$; $7 \to 7,9,3,1$; $8 \to 8,4,2,6$ (period $4$); $4 \to 4,6$ and $9 \to 9,1$ (period $2$); $0,1,5,6$ never move. By idea 4, each units digit depends only on the previous one, so the sequence must loop.
6. **Exponent reduction.** For $a^n \bmod 10$ with cycle length $L$, compute $n \bmod L$ and read that position of the cycle; if $n \bmod L = 0$, read position $L$, not position $0$.
7. **Cycles exist mod any $m$.** Powers repeat modulo every divisor, e.g., $2^n \bmod 7$ cycles $2, 4, 1$ with period $3$. Generate such cycles by hand — they are never long on the GMAT.
8. **The $\pm 1$ shortcut.** If $a \equiv -1 \pmod m$, then $a^k \equiv (-1)^k \pmod m$: since $17 \equiv -1 \pmod 9$, any odd power of $17$ is $\equiv 8 \pmod 9$. Negative representatives are legal by idea 2.
9. **Two moduli combine at the lcm.** Knowing $n \bmod a$ and $n \bmod b$ pins down $n \bmod \operatorname{lcm}(a,b)$: list candidates from the larger modulus, keep the one satisfying the other.
10. **Digit fingerprints of squares and cubes.** A perfect square ends only in $0, 1, 4, 5, 6, 9$, and most of those endings arise from two possible last digits of the base; cube endings arise from exactly one. Rebuild both facts by squaring and cubing the digits $0$–$9$ once.

## Worked examples

**Example 1**
*A stationery supplier packs $742$ pens into boxes holding exactly $16$ pens each. After filling as many boxes as possible, how many additional pens are needed to fill one more box?*

1. Divide: $16 \cdot 46 = 736$, so $742 = 16 \cdot 46 + 6$; the remainder is $6$.
2. The question asks the shortfall, not the leftover: the next full box needs $16 - 6 = 10$ more pens.

**Answer: $10$**

**Example 2**
*What is the units digit of $3^{58} + 8^{58}$?*

1. Both bases have period-$4$ cycles: $3 \to 3, 9, 7, 1$ and $8 \to 8, 4, 2, 6$.
2. Reduce the exponent: $58 = 4 \cdot 14 + 2$, so read position $2$ of each cycle.
3. So $3^{58}$ ends in $9$ and $8^{58}$ ends in $4$.
4. Units digits add mod $10$: $9 + 4 = 13$, so the sum ends in $3$.

**Answer: $3$**

**Example 3**
*When the positive integer $n$ is divided by $9$, the remainder is $5$; when divided by $4$, the remainder is $3$. What is the remainder when $n$ is divided by $36$?*

1. Since $36 = \operatorname{lcm}(9, 4)$, the two conditions together fix $n \bmod 36$.
2. From the larger modulus, the candidates below $36$ with remainder $5$ mod $9$ are $5, 14, 23, 32$.
3. Test each against the mod-$4$ condition: $5 \equiv 1$, $14 \equiv 2$, $23 \equiv 3$, $32 \equiv 0 \pmod 4$. Only $23$ works.
4. Every valid $n$ is $23$ plus a multiple of $36$, so the remainder is $23$.

**Answer: $23$**

## Trigger cues
- "Units digit of $a^{\text{huge}}$" → write the base's cycle (at most $4$ steps), reduce the exponent mod its length.
- "Remainder when $a^{\text{huge}}$ is divided by $7$, $9$, or $13$" → build the power cycle mod that divisor, after checking whether $a \equiv \pm 1$.
- "Fills as many ... as possible — how many left over / how many more needed" → division algorithm; answer $r$ or $d - r$.
- "Starts on a Monday and runs for $k$ days," or any repeating program → the position is $(k-1) \bmod (\text{cycle length})$ steps past the start.
- "Remainder mod $a$ is ... and remainder mod $b$ is ...; find the remainder mod $ab$" → list candidates from the larger modulus, intersect.
- "$n$ leaves remainder $r$ when divided by $m$; find (expression in $n$) mod $m$" → substitute $r$ for $n$ and reduce.
- Data Sufficiency: "the units digit of $k^2$ (or $k^3$) is ..." → run all ten digits through the power and see which survive.

## Trap gallery
- Reading $n \bmod L = 0$ as "position $0$": the exponent landed on the *end* of the cycle, so read position $L$.
- Assuming every units cycle has length $4$: digits $4$ and $9$ flip with period $2$, and $0, 1, 5, 6$ are frozen.
- Negative digits in subtraction: something ending in $4$ minus a smaller number ending in $9$ ends in $14 - 9 = 5$, not $-5$; compare $34 - 19 = 15$.
- Merging moduli by addition: $n \equiv 5 \pmod 9$ and $n \equiv 3 \pmod 4$ do not combine arithmetically — intersect candidate lists instead.
- Reporting the leftover $r$ when the question asks the shortfall $d - r$, or the reverse.
- Day-count off-by-one: day $k$ is $k - 1$ steps after day $1$, so day $8$ repeats day $1$'s weekday, not day $2$'s.
- Overcommitting in Data Sufficiency: $k^2$ ending in $9$ lets $k$ end in $3$ *or* $7$ — squares are two-to-one on last digits, cubes one-to-one.

## Speed moves
- Memorize the four period-$4$ cycles ($2, 3, 7, 8$) and the two flip-flops ($4, 9$); everything else is fixed. Most units-digit questions then take one division by $4$.
- Hunt for $\pm 1$ before building any cycle: $26 \equiv -1 \pmod 9$, so $26^{15} + 4 \equiv -1 + 4 = 3 \pmod 9$ in one line.
- Substitute the remainder itself: if $n \equiv 4 \pmod 7$, then $3n^2 + 2n + 5 \equiv 3(16) + 8 + 5 = 61 \equiv 5 \pmod 7$ — no actual $n$ needed.
- Let factorials vanish: once $k!$ contains the divisor's factorization it contributes $0$, so $1! + 2! + \cdots + 50!$ leaves remainder $1 + 2 = 3$ when divided by $6$.
- Count digit patterns as residue classes: $8^n$ ends in $2$ exactly when $n \equiv 3 \pmod 4$, so for $1 \le n \le 60$ there are $60/4 = 15$ such exponents.
- Test two witnesses in remainder Data Sufficiency: for "$n$ is even and $n \equiv 2 \pmod 3$," both $n = 2$ and $n = 8$ leave remainder $2$ mod $6$ — a fast signal that the facts together are sufficient.

## Before you drill
- I can write the units-digit cycle of any digit from memory in seconds.
- I reduce exponents mod the cycle length and read position $L$ when the reduction gives $0$.
- I can build a power cycle mod $7$, $9$, or $13$ by hand without hesitation.
- I check for a base $\equiv \pm 1$ modulo the divisor before grinding out a cycle.
- I answer "left over" with $r$ and "needed to complete" with $d - r$ — and read which one is asked.
- I combine two remainder conditions by listing candidates up to the lcm, never by adding remainders.
- I test all ten digits, not just the obvious one, in units-digit Data Sufficiency.
