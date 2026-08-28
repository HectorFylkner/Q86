# Divisibility, GCF, and LCM: Let the Prime Exponents Do the Work

## Why this matters
The GMAT Focus Edition tests GCF and LCM two ways: quick word problems (packing identical boxes, buses arriving together) and abstract puzzles where $\gcd$ and $\mathrm{lcm}$ constraints pin down an unknown integer. At the Q86 level the word problems are speed checks and the abstract ones are structure checks — both fall fast once you think in prime exponents instead of trial division.

## The core ideas
1. **Divisibility.** $a \mid b$ means $b = ak$ for some integer $k$. Everything below is bookkeeping on this definition.
2. **Prime factorization is unique.** Every integer $n > 1$ is one product of primes, e.g. $60 = 2^2 \cdot 3 \cdot 5$, and $a \mid b$ exactly when every prime exponent in $a$ is $\le$ its exponent in $b$.
3. **GCF takes minimum exponents; LCM takes maximum exponents.** With $60 = 2^2 \cdot 3 \cdot 5$ and $72 = 2^3 \cdot 3^2$: $\gcd = 2^2 \cdot 3 = 12$ and $\mathrm{lcm} = 2^3 \cdot 3^2 \cdot 5 = 360$. Min-exponents is the largest thing dividing both; max-exponents is the smallest thing both divide.
4. **The product identity.** $\gcd(a,b) \cdot \mathrm{lcm}(a,b) = ab$ for two positive integers, because at each prime, $\min + \max$ of the two exponents equals their sum. Check: $12 \cdot 360 = 4320 = 60 \cdot 72$.
5. **Coprime cofactors.** If $\gcd(a,b) = g$, write $a = gm$, $b = gn$ with $\gcd(m,n) = 1$. Then $\mathrm{lcm}(a,b) = gmn$, so $mn = \mathrm{lcm}/\gcd$. When both are given, the coprime factor pairs of $\mathrm{lcm}/\gcd$ are the whole solution space.
6. **"Divisible by both" means divisible by the LCM,** not the product. Divisible by $6$ and $8$ means divisible by $\mathrm{lcm}(6,8) = 24$; indeed $24$ is divisible by both but not by $48$. The product works only for coprime pairs.
7. **Counting multiples.** Exactly $\lfloor N/k \rfloor$ multiples of $k$ lie in $1, \dots, N$, because they are $k, 2k, \dots, \lfloor N/k \rfloor k$.
8. **Inclusion–exclusion.** Divisible by $p$ or $q$: $\lfloor N/p \rfloor + \lfloor N/q \rfloor - \lfloor N/\mathrm{lcm} \rfloor$. Divisible by exactly one: subtract the overlap twice.
9. **Common divisors are divisors of the GCF.** $d$ divides both $a$ and $b$ exactly when $d \mid \gcd(a,b)$. So $540$ and $360$ share $\gcd = 180 = 2^2 \cdot 3^2 \cdot 5$, giving $(2+1)(2+1)(1+1) = 18$ common divisors.
10. **The difference carries the GCF.** $\gcd(a,b) = \gcd(b, a-b)$, so $\gcd(n, n+k)$ must divide $k$. Knowing $m = n + 6$ caps $\gcd(m,n)$ at a divisor of $6$.
11. **Squaring doubles exponents.** If $48 = 2^4 \cdot 3$ divides $n^2$, then $2a \ge 4$ and $2b \ge 1$ for $n$'s exponents of $2$ and $3$, forcing $a \ge 2$, $b \ge 1$: $n$ is divisible by $12$. Smallest case: $n = 12$.
12. **Translating $\gcd(n, m) = d$.** At each prime of $m$, the min of the two exponents must equal the exponent in $d$ — one equation becomes a list of "at least" and "not divisible by" conditions on $n$.

## Worked examples

**Example 1**
*A florist has $96$ roses and $72$ tulips. She wants to assemble identical bouquets, each containing the same number of roses and the same number of tulips, using every flower. What is the greatest number of bouquets she can make?*

1. Identical groups using everything, greatest count → compute $\gcd(96, 72)$.
2. Factor: $96 = 2^5 \cdot 3$ and $72 = 2^3 \cdot 3^2$.
3. Take minimum exponents: $\gcd = 2^3 \cdot 3 = 24$.
4. Check: each bouquet gets $96/24 = 4$ roses and $72/24 = 3$ tulips.

**Answer: 24**

**Example 2**
*How many positive integers $n \le 500$ are divisible by $6$ or by $10$, but not by both?*

1. Count each pile: $\lfloor 500/6 \rfloor = 83$ multiples of $6$ and $\lfloor 500/10 \rfloor = 50$ multiples of $10$.
2. "Both" means divisible by $\mathrm{lcm}(6,10) = 30$: $\lfloor 500/30 \rfloor = 16$.
3. Those $16$ sit inside both piles and "not both" excludes them entirely, so subtract the overlap twice: $83 + 50 - 2(16) = 101$.

**Answer: 101**

**Example 3**
*If $n$ is a positive integer such that $\gcd(n, 56) = 8$ and $\gcd(n, 60) = 12$, what is the smallest possible value of $n$?*

1. Convert each condition to exponent constraints. First, $56 = 2^3 \cdot 7$ and $8 = 2^3$: the min of $n$'s $2$-exponent and $3$ must be $3$, so $2^3 \mid n$; the min at prime $7$ must be $0$, so $7 \nmid n$.
2. Next, $60 = 2^2 \cdot 3 \cdot 5$ and $12 = 2^2 \cdot 3$: the $2$-condition is already satisfied since $2^3 \mid n$; the $3$-condition forces $3 \mid n$; the $5$-condition forces $5 \nmid n$.
3. Assemble the cheapest $n$: required are $2^3$ and $3^1$, with $5$ and $7$ forbidden, so $n = 2^3 \cdot 3 = 24$.
4. Confirm: $\gcd(24, 56) = 8$ and $\gcd(24, 60) = 12$.

**Answer: 24**

## Trigger cues
- "Greatest number of identical boxes/groups with none left over" → compute the GCF of the quantities.
- "Events start together; when do they next coincide?" (ferries, deliveries, gears) → LCM of the cycle lengths.
- "How many integers up to $N$ are divisible by both $p$ and $q$" → count multiples of $\mathrm{lcm}(p,q)$ via $\lfloor N/\mathrm{lcm} \rfloor$.
- "Divisible by $p$ or $q$" → inclusion–exclusion; double-subtract the overlap for "but not both."
- "$\gcd(a,b)$ and $\mathrm{lcm}(a,b)$ are both given" → set $a = gm$, $b = gn$ and list coprime pairs with $mn = \mathrm{lcm}/\gcd$.
- "$\gcd(n, m) = d$ for a specific $m$" → prime-by-prime exponent conditions on $n$.
- "How many common divisors do $a$ and $b$ have?" → count the divisors of $\gcd(a,b)$.
- "$m$ and $n$ differ by a fixed amount" → their GCF divides that difference.

## Trap gallery
- **Multiplying instead of LCM-ing.** "Divisible by $6$ and $8$" is divisibility by $24$, not $48$ — multiply only coprime numbers.
- **Upgrading divisibility for free.** $6 \mid n$ does not give $12 \mid n$; $n = 6$ kills it — in data sufficiency, test the smallest qualifying value.
- **Reading $\gcd(n, 60) = 12$ as $n = 12$.** $n = 36$ also satisfies it; a GCF condition constrains $n$, it rarely names it.
- **Forgetting the overlap direction.** "Or" needs one subtraction of the overlap; "exactly one" needs two.
- **LCM of a list by multiplying everything.** The smallest number divisible by $2$ through $10$ except $7$ is $2^3 \cdot 3^2 \cdot 5 = 360$, far below the raw product.
- **Applying $\gcd \cdot \mathrm{lcm} = ab$ to three numbers.** It is a two-number identity; with three or more it fails.
- **Ignoring "not a multiple of" side conditions.** In coprime-cofactor problems, the pair $(g, \mathrm{lcm})$ is always one option — that clause exists precisely to eliminate it.

## Speed moves
- **Difference trick for GCF.** $\gcd(51, 68)$: the GCF divides $68 - 51 = 17$, and both are multiples of $17$ — answer $17$, no factoring.
- **Partner from the product identity.** Given $\gcd = 12$, $\mathrm{lcm} = 360$, one number $60$: the other is $12 \cdot 360 / 60 = 72$ in one line.
- **Floor division counts multiples instantly.** Multiples of $12$ up to $300$: $\lfloor 300/12 \rfloor = 25$. Never list them.
- **Prime stacking for list LCMs.** Keep the highest power of each prime: for $2$–$10$ that is $2^3$, $3^2$, $5$, $7$.
- **Smart small cases in data sufficiency.** For "is $n$ divisible by ...?", test the minimal $n$ a statement allows; if it fails, the statement is insufficient in seconds.

## Before you drill
- I can factor any two- or three-digit number into primes in under $15$ seconds.
- I build GCF from minimum exponents and LCM from maximum exponents without hesitation.
- I can use $\gcd(a,b) \cdot \mathrm{lcm}(a,b) = ab$ and know it holds only for two numbers.
- Given both $\gcd$ and $\mathrm{lcm}$, I write $a = gm$, $b = gn$ with coprime $m, n$ and $mn = \mathrm{lcm}/\gcd$.
- I count multiples with $\lfloor N/k \rfloor$ and handle "or / not both" with inclusion–exclusion.
- I translate $\gcd(n, m) = d$ into per-prime exponent conditions, including forbidden primes.
- I recognize grouping stems as GCF and synchronization stems as LCM on the first read.
