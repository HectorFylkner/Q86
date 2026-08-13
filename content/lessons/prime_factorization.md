# Prime Factorization: The Number's Blueprint

## Why this matters

Every hard divisibility, LCM/GCD, perfect-square, and factorial question on the GMAT Focus Edition is one question in disguise: what does the prime factorization look like? At the Q86 tier the exam wraps this in packing, batching, and factorial scenarios, and the gap between a 90-second solve and a 4-minute grind is whether you translate the story into prime exponents immediately.

This chapter is the root of the whole Value/Order/Factors branch — divisibility, remainders, and exponent properties all build on the blueprint laid here. Ideas 1–5 install the exponent view of divisibility; 6–10 are the structures the exam builds on top of it: perfect powers, divisor counts, and Legendre's factorial formula.

## The core ideas

Ideas 1–5 install the exponent view; 6–10 are the structures built on it.

1. **Unique factorization.** Every integer $n > 1$ has exactly one factorization $n = p_1^{e_1} p_2^{e_2} \cdots p_k^{e_k}$ into distinct primes. The exponents are the number's complete ID card — every divisor question is an exponent question, which is why factoring is always the first move, never a last resort.
Check: Factor $360$. ⇒ $2^3 \cdot 3^2 \cdot 5$.

2. **Divisibility is exponent comparison.** $d \mid n$ exactly when each prime's exponent in $d$ is at most its exponent in $n$. One glance settles any "does it divide" question — no long division.
Check: Does $48 = 2^4 \cdot 3$ divide $360 = 2^3 \cdot 3^2 \cdot 5$? ⇒ No — $48$ needs four $2$s, $360$ has three.

3. **Divisor count.** $n = p_1^{e_1} \cdots p_k^{e_k}$ has $(e_1+1)(e_2+1)\cdots(e_k+1)$ positive divisors: each prime's exponent is chosen freely from $0$ to $e_i$, and choices multiply. Check it on $360 = 2^3 \cdot 3^2 \cdot 5$: $4 \cdot 3 \cdot 2 = 24$ divisors.
Check: How many positive divisors does $200 = 2^3 \cdot 5^2$ have? ⇒ $4 \times 3 = 12$.

4. **GCD and LCM by exponents.** $\gcd$ takes the *minimum* exponent of each prime, $\operatorname{lcm}$ the *maximum*: $\gcd(12,18) = 6$, $\operatorname{lcm}(12,18) = 2^2 \cdot 3^2 = 36$. The full machinery lives in the divisibility chapter; the exponent picture is what makes it mechanical.
Check: $72 = 2^3 \cdot 3^2$ and $120 = 2^3 \cdot 3 \cdot 5$ — gcd and lcm? ⇒ $\gcd = 2^3 \cdot 3 = 24$, $\operatorname{lcm} = 2^3 \cdot 3^2 \cdot 5 = 360$.

5. **"Divisible by $a$ and by $b$" means divisible by $\operatorname{lcm}(a,b)$** — not by $ab$. Divisible by $12$ and $18$ forces only divisibility by $36$, because the shared factor $6$ must not be double-counted.

6. **Perfect powers by exponent pattern.** $n$ is a perfect square iff every exponent is even, a perfect cube iff every exponent is a multiple of $3$. To make $Nk$ a perfect square, $k$ supplies exactly the primes that round each odd exponent up to even — nothing more.
Check: The least $k$ making $360k$ a perfect square? ⇒ $360 = 2^3 \cdot 3^2 \cdot 5$ needs one more $2$ and one more $5$: $k = 10$, giving $3600 = 60^2$.

7. **Odd divisor count $\Leftrightarrow$ perfect square.** Divisors pair as $d \leftrightarrow n/d$; only $\sqrt{n}$ pairs with itself. So counting numbers with an odd number of divisors is counting squares.
Check: How many integers from $1$ to $1000$ have an odd number of divisors? ⇒ $31$ — the squares $1^2$ through $31^2 = 961$.

8. **Exactly three divisors $\Leftrightarrow$ $n = p^2$** for a prime $p$: a divisor count of $3$ forces one prime with exponent $2$, e.g. $121 = 11^2$. More generally, a prime divisor count forces a single-prime factorization.

9. **Prime exponent in $n!$ (Legendre).** The exponent of $p$ in $n!$ is $\lfloor n/p \rfloor + \lfloor n/p^2 \rfloor + \cdots$: multiples of $p$ give one factor each, multiples of $p^2$ one more, and so on. Trailing zeros of $n!$ equal the exponent of $5$ (the $2$s are never scarcer).
Check: How many trailing zeros does $25!$ have? ⇒ $\lfloor 25/5 \rfloor + \lfloor 25/25 \rfloor = 5 + 1 = 6$.

10. **Squares transfer divisibility down.** If $p^m \mid n^2$, then $p^{\lceil m/2 \rceil} \mid n$, because $n^2$ doubles every exponent of $n$. So $n^2$ divisible by $216 = 2^3 \cdot 3^3$ forces $n$ divisible by $2^2 \cdot 3^2 = 36$ — halve each exponent, rounding up.
Check: $n^2$ is divisible by $216$. What must divide $n$? ⇒ $36$.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*How many positive divisors does $72$ have?*

1. Factor: $72 = 8 \cdot 9 = 2^3 \cdot 3^2$.
2. Divisor count: $(3+1)(2+1) = 12$.

**Answer: $12$**

**Example 2 · 605 level · target 1:40**

*A bakery packs $504$ muffins into identical trays with none left over. If each tray holds more than $25$ but fewer than $35$ muffins, how many muffins does each tray hold?*

1. The tray size must be a divisor of $504$. Factor: $504 = 8 \cdot 63 = 2^3 \cdot 3^2 \cdot 7$.
2. Test the window $26$–$34$ against the available primes: $27 = 3^3$ needs three $3$s — unavailable. $28 = 2^2 \cdot 7$ fits. $30$ needs a $5$; $32 = 2^5$ needs five $2$s; $33$ needs an $11$.
3. Only one divisor of $504$ lies strictly between $25$ and $35$.

**Answer: $28$**

**Example 3 · 655 level · target 2:05**

*A mosaic artist buys tiles only in full boxes of $600$ tiles each and must use every tile she buys to build a single square design with the same number of tiles in each row as in each column. What is the least number of boxes she must buy?*

1. With $k$ boxes, the total $600k$ must be a perfect square: every prime exponent even.
2. Factor: $600 = 2^3 \cdot 3 \cdot 5^2$. The exponents of $2$ and $3$ are odd; the $5$ is already even.
3. The cheapest fix is $k = 2 \cdot 3 = 6$: $600 \cdot 6 = 3600 = 2^4 \cdot 3^2 \cdot 5^2 = 60^2$.
4. No smaller $k$ works, since any valid $k$ must contain a $2$ and a $3$.

**Wrong turn: rounding up to the next square.** Hunting for the smallest perfect square above $600$ — say $625 = 25^2$ — answers a different question. The design uses *all* tiles from $k$ full boxes, so the target is $600k$ square, and only the exponent pattern of $600$ decides $k$.

**Answer: $6$ boxes**

**Example 4 · 705 level · target 2:30**

*How many positive divisors of $2{,}700$ are multiples of $15$?*

*A) $12$  B) $15$  C) $18$  D) $24$  E) $36$*

1. Factor: $2700 = 27 \cdot 100 = 2^2 \cdot 3^3 \cdot 5^2$.
2. A divisor that is a multiple of $15$ has the form $15m$ where $m$ divides $\frac{2700}{15} = 180$ — pulling out the required $3 \cdot 5$ leaves a free choice of $m$.
3. Factor the quotient: $180 = 2^2 \cdot 3^2 \cdot 5$, which has $(2+1)(2+1)(1+1) = 18$ divisors.
4. So $18$ divisors of $2700$ are multiples of $15$.

**Wrong turn: counting everything.** $(2+1)(3+1)(2+1) = 36$ — all divisors of $2700$, planted as choice (E). The multiple-of-$15$ condition consumes one $3$ and one $5$ *before* the free choices are counted; dividing the condition out first is what idea 2 looks like in action.

**Answer: $18$ (C)**

**Example 5 · Q86 level · target 2:50**

*A puzzle vault opens when players enter the greatest integer $k$ such that $12^k$ divides the product of all integers from $1$ to $30$, inclusive. What number opens the vault?*

1. The product is $30!$, and $12^k = (2^2 \cdot 3)^k = 2^{2k} \cdot 3^k$. So we need $2k$ factors of $2$ and $k$ factors of $3$ inside $30!$.
2. Exponent of $2$ in $30!$: $\lfloor 30/2 \rfloor + \lfloor 30/4 \rfloor + \lfloor 30/8 \rfloor + \lfloor 30/16 \rfloor = 15 + 7 + 3 + 1 = 26$.
3. Exponent of $3$ in $30!$: $\lfloor 30/3 \rfloor + \lfloor 30/9 \rfloor + \lfloor 30/27 \rfloor = 10 + 3 + 1 = 14$.
4. The constraints are $2k \le 26$ and $k \le 14$, so $k \le 13$ and $k \le 14$. The binding constraint is the $2$s.

**Wrong turn: betting on the bigger prime.** Assuming the $3$s must run out first (they're rarer in small numbers) gives $k = 14$ — planted. The base $12$ demands the $2$s *twice as fast*, so the abundant prime can still bind. Compute both sides; never guess which constraint wins.

**Answer: $13$**

## Trigger cues

- "Divides evenly into groups of $a$ and also groups of $b$" → smallest such number is $\operatorname{lcm}(a,b)$ via max exponents.
- "Identical groups, none left over, size between $x$ and $y$" → build divisors of the total from its factorization; scan the window.
- "Same number in each row as each column" or "solid cube" → force exponents even (square) or multiples of $3$ (cube).
- "Odd number of divisors" → perfect squares; there are $\lfloor \sqrt{N} \rfloor$ of them up to $N$.
- "Exactly three positive divisors" → the number is $p^2$; hunt for a prime square in the range.
- "Product of integers from $1$ to $n$" with "trailing zeros" or "$b^k$ divides it" → Legendre's formula on each prime of $b$, cheapest prime checked last.
- "How many divisors are multiples of $m$" → count divisors of $N/m$ instead.
- A given fact about $n^2$'s divisibility → halve the exponents (round up) to see what $n$ must contain.

## Trap gallery

- **Multiplying instead of taking the LCM.** Divisible by $12$ and $18$ guarantees $36$, not $216$. Max exponents prime by prime.
- **Forgetting the $+1$** and computing $e_1 e_2 \cdots$ for the divisor count. Each exponent has $e_i + 1$ choices, including zero.
- **Reading "odd number of divisors" as "prime."** Primes have two divisors; odd counts mean perfect squares.
- **Counting each multiple of $5$ once for trailing zeros.** $25$ contributes two $5$s. Run the full sum $\lfloor n/5 \rfloor + \lfloor n/25 \rfloor + \cdots$.
- **Ignoring the composite base.** $12^k \mid n!$ needs $2k$ twos, not $k$ — divide the available exponent by the base's power.
- **Assuming the bigger prime binds.** In Example 5 the constraint came from the abundant $2$s, not the scarcer $3$s; compute both sides.
- **Treating $1$ as prime or skipping $2$.** $1$ is not prime; $2$ is the only even prime. Start every factor tree at $2$.

## Speed moves

- **Factor once, reuse everywhere.** Write $6480 = 2^4 \cdot 3^4 \cdot 5$ at the top of your scratch work; divisor counts, square multipliers, and LCMs all read off that one line.
- **Divide out a divisor condition.** Divisors of $2700 = 2^2 \cdot 3^3 \cdot 5^2$ that are multiples of $15$: count divisors of $2700/15 = 180$, which is $18$ — one division replaces a case hunt.
- **Cube-root anchor for near-consecutive products.** If $c(c+2)(c+4) = 7920$, then $\sqrt[3]{7920} \approx 19.9$, so test a middle value of $20$: $18 \cdot 20 \cdot 22 = 7920$. Done.
- **Round exponents, don't search.** Greatest perfect-square divisor of $360 = 2^3 \cdot 3^2 \cdot 5$: round each exponent *down* to even, giving $2^2 \cdot 3^2 = 36$.
- **Test the choices by divisibility.** With choices on screen, test which choice divides the total ($875$ splits by $25$, since $875 = 5^3 \cdot 7$); one division beats a full factor list.

## Before you drill

1. I can factor any three-digit number to primes in under 20 seconds, starting from $2$.
2. I can apply the divisor-count formula $(e_1+1)\cdots(e_k+1)$ without hesitation.
3. I build GCD from minimum exponents and LCM from maximum exponents, never by multiplying.
4. I recognize perfect squares by all-even exponents and perfect cubes by exponents divisible by $3$.
5. I can find the exponent of any prime in $n!$ with Legendre's sum, and I know trailing zeros count the $5$s.
6. I translate "exactly three divisors" to $p^2$ and "odd number of divisors" to perfect square on sight.
7. Given a fact about $n^2$'s divisibility, I can state what it forces about $n$.
8. I count divisors satisfying a multiple-of-$m$ condition by dividing $m$ out first.
