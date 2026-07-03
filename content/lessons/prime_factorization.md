# Prime Factorization: The Number's Blueprint

## Why this matters
Every hard divisibility, LCM/GCD, perfect-square, and factorial question on the GMAT Focus Edition is one question in disguise: what does the prime factorization look like? At the Q85+ level the exam wraps this in packing, batching, and data-sufficiency scenarios, and the gap between a 90-second solve and a 4-minute grind is whether you translate the story into prime exponents immediately.

## The core ideas

1. **Unique factorization.** Every integer $n > 1$ has exactly one factorization $n = p_1^{e_1} p_2^{e_2} \cdots p_k^{e_k}$ into distinct primes. The exponents are the number's complete ID card — every divisor question is an exponent question.

2. **Divisibility is exponent comparison.** $d \mid n$ exactly when each prime's exponent in $d$ is at most its exponent in $n$.

3. **Divisor count.** $n = p_1^{e_1} \cdots p_k^{e_k}$ has $(e_1+1)(e_2+1)\cdots(e_k+1)$ positive divisors: each prime's exponent is chosen freely from $0$ to $e_i$. Check: $360 = 2^3 \cdot 3^2 \cdot 5$ has $4 \cdot 3 \cdot 2 = 24$ divisors.

4. **GCD and LCM by exponents.** $\gcd$ takes the *minimum* exponent of each prime, $\operatorname{lcm}$ the *maximum*: $\gcd(12,18) = 6$, $\operatorname{lcm}(12,18) = 2^2 \cdot 3^2 = 36$.

5. **"Divisible by $a$ and by $b$" means divisible by $\operatorname{lcm}(a,b)$** — not by $ab$. Divisible by $12$ and $18$ forces only divisibility by $36$.

6. **Perfect powers by exponent pattern.** $n$ is a perfect square iff every exponent is even, a perfect cube iff every exponent is a multiple of $3$. To make $Nk$ a perfect square, $k$ supplies exactly the primes that round each odd exponent up to even.

7. **Odd divisor count $\Leftrightarrow$ perfect square.** Divisors pair as $d \leftrightarrow n/d$; only $\sqrt{n}$ pairs with itself. There are $31$ squares from $1$ to $1000$ since $31^2 = 961$.

8. **Exactly three divisors $\Leftrightarrow$ $n = p^2$** for a prime $p$: a count of $3$ forces one prime with exponent $2$, e.g. $121 = 11^2$.

9. **Prime exponent in $n!$ (Legendre).** The exponent of $p$ in $n!$ is $\lfloor n/p \rfloor + \lfloor n/p^2 \rfloor + \cdots$: multiples of $p$ give one factor each, multiples of $p^2$ one more, and so on. Trailing zeros of $n!$ equal the exponent of $5$ (the $2$s are never scarcer): $25!$ ends in $5 + 1 = 6$ zeros.

10. **Squares transfer divisibility down.** If $p^m \mid n^2$, then $p^{\lceil m/2 \rceil} \mid n$, because $n^2$ doubles every exponent of $n$. So $n^2$ divisible by $216 = 2^3 \cdot 3^3$ forces $n$ divisible by $2^2 \cdot 3^2 = 36$.

## Worked examples

**Example 1**

*A bakery packs $504$ muffins into identical trays with none left over. If each tray holds more than $25$ but fewer than $35$ muffins, how many muffins does each tray hold?*

1. The tray size must be a divisor of $504$. Factor: $504 = 8 \cdot 63 = 2^3 \cdot 3^2 \cdot 7$.
2. Test the window $26$–$34$ against the available primes: $27 = 3^3$ needs three $3$s — unavailable. $28 = 2^2 \cdot 7$ fits. $30$ needs a $5$; $32 = 2^5$ needs five $2$s; $33$ needs an $11$.
3. Only one divisor of $504$ lies strictly between $25$ and $35$.

**Answer: $28$**

**Example 2**

*A mosaic artist buys tiles only in full boxes of $600$ tiles each and must use every tile she buys to build a single square design with the same number of tiles in each row as in each column. What is the least number of boxes she must buy?*

1. With $k$ boxes, the total $600k$ must be a perfect square: every prime exponent even.
2. Factor: $600 = 2^3 \cdot 3 \cdot 5^2$. The exponents of $2$ and $3$ are odd; the $5$ is already even.
3. The cheapest fix is $k = 2 \cdot 3 = 6$: $600 \cdot 6 = 3600 = 2^4 \cdot 3^2 \cdot 5^2 = 60^2$.
4. No smaller $k$ works, since any valid $k$ must contain a $2$ and a $3$.

**Answer: $6$ boxes**

**Example 3**

*A puzzle vault opens when players enter the greatest integer $k$ such that $12^k$ divides the product of all integers from $1$ to $30$, inclusive. What number opens the vault?*

1. The product is $30!$, and $12^k = (2^2 \cdot 3)^k = 2^{2k} \cdot 3^k$. So we need $2k$ factors of $2$ and $k$ factors of $3$ inside $30!$.
2. Exponent of $2$ in $30!$: $\lfloor 30/2 \rfloor + \lfloor 30/4 \rfloor + \lfloor 30/8 \rfloor + \lfloor 30/16 \rfloor = 15 + 7 + 3 + 1 = 26$.
3. Exponent of $3$ in $30!$: $\lfloor 30/3 \rfloor + \lfloor 30/9 \rfloor + \lfloor 30/27 \rfloor = 10 + 3 + 1 = 14$.
4. The constraints are $2k \le 26$ and $k \le 14$, so $k \le 13$ and $k \le 14$. The binding constraint is the $2$s.

**Answer: $13$**

## Trigger cues

- "Divides evenly into groups of $a$ and also groups of $b$" → smallest such number is $\operatorname{lcm}(a,b)$ via max exponents.
- "Identical groups, none left over, size between $x$ and $y$" → build divisors of the total from its factorization; scan the window.
- "Same number in each row as each column" or "solid cube" → force exponents even (square) or multiples of $3$ (cube).
- "Odd number of divisors" → perfect squares; there are $\lfloor \sqrt{N} \rfloor$ of them up to $N$.
- "Exactly three positive divisors" → the number is $p^2$; hunt for a prime square in the range.
- "Product of integers from $1$ to $n$" with "trailing zeros" or "$b^k$ divides it" → Legendre's formula on each prime of $b$.
- "How many divisors are multiples of $m$" → count divisors of $N/m$ instead.
- DS statement about $n^2$'s divisibility → halve the exponents (round up) to see what $n$ must contain.

## Trap gallery

- **Multiplying instead of taking the LCM.** Divisible by $12$ and $18$ guarantees $36$, not $216$. Fix: max exponents prime by prime.
- **Forgetting the $+1$** and computing $e_1 e_2 \cdots$ for the divisor count. Fix: each exponent has $e_i + 1$ choices, including zero.
- **Reading "odd number of divisors" as "prime."** Primes have two divisors; odd counts mean perfect squares.
- **Counting each multiple of $5$ once for trailing zeros.** $25$ contributes two $5$s. Fix: run the full sum $\lfloor n/5 \rfloor + \lfloor n/25 \rfloor + \cdots$.
- **Ignoring the composite base.** $12^k \mid n!$ needs $2k$ twos, not $k$ — divide the available exponent by the base's power.
- **Assuming the bigger prime binds.** In Example 3 the constraint came from the $2$s, not the $3$s; compute both sides.
- **Treating $1$ as prime or skipping $2$.** $1$ is not prime; $2$ is the only even prime. Start every factor tree at $2$.

## Speed moves

- **Factor once, reuse everywhere.** Write $6480 = 2^4 \cdot 3^4 \cdot 5$ at the top of your scratch work; divisor counts, square multipliers, and LCMs all read off that one line.
- **Divide out a divisor condition.** Divisors of $2700 = 2^2 \cdot 3^3 \cdot 5^2$ that are multiples of $15$: count divisors of $2700/15 = 180 = 2^2 \cdot 3^2 \cdot 5$, which is $3 \cdot 3 \cdot 2 = 18$.
- **Cube-root anchor for near-consecutive products.** If $c(c+2)(c+4) = 7920$, then $\sqrt[3]{7920} \approx 19.9$, so test a middle value of $20$: $18 \cdot 20 \cdot 22 = 7920$. Done.
- **Round exponents, don't search.** Greatest perfect-square divisor of $360 = 2^3 \cdot 3^2 \cdot 5$: round each exponent *down* to even, giving $2^2 \cdot 3^2 = 36$.
- **test the answer choices divisor-window questions.** With choices on screen, test which choice divides the total ($875$ splits by $25$, since $875 = 5^3 \cdot 7$); one division beats a full factor list.

## Before you drill

1. I can factor any three-digit number to primes in under 20 seconds, starting from $2$.
2. I can apply the divisor-count formula $(e_1+1)\cdots(e_k+1)$ without hesitation.
3. I build GCD from minimum exponents and LCM from maximum exponents, never by multiplying.
4. I recognize perfect squares by all-even exponents and perfect cubes by exponents divisible by $3$.
5. I can find the exponent of any prime in $n!$ with Legendre's sum, and I know trailing zeros count the $5$s.
6. I translate "exactly three divisors" to $p^2$ and "odd number of divisors" to perfect square on sight.
7. Given a fact about $n^2$'s divisibility, I can state what it forces about $n$.
