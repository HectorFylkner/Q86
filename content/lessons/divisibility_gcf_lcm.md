# Divisibility, GCF, and LCM: Let the Prime Exponents Do the Work

## Why this matters

The GMAT Focus Edition tests GCF and LCM two ways: quick word problems (packing identical boxes, buses arriving together) and abstract puzzles where $\gcd$ and $\mathrm{lcm}$ constraints pin down an unknown integer. At the Q86 tier the word problems are speed checks and the abstract ones are structure checks — both fall fast once you think in prime exponents instead of trial division.

This chapter assumes the blueprint from the prime factorization chapter and runs it: ideas 1–4 are the exponent machinery, 5–8 the counting tools, and 9–12 the constraint-translation moves that crack the hardest stems. The recognition skill — grouping means GCF, synchronizing means LCM — is worth as many points as the math.

## The core ideas

Ideas 1–4 are the machinery; 5–8 the counting tools; 9–12 the constraint moves.

1. **Divisibility.** $a \mid b$ means $b = ak$ for some integer $k$. Everything below is bookkeeping on this definition.

2. **Prime factorization is unique.** Every integer $n > 1$ is one product of primes, e.g. $60 = 2^2 \cdot 3 \cdot 5$, and $a \mid b$ exactly when every prime exponent in $a$ is $\le$ its exponent in $b$.
Check: Does $45$ divide $2^2 \cdot 3^4 \cdot 5$? ⇒ Yes — $45 = 3^2 \cdot 5$, and both exponents fit.

3. **GCF takes minimum exponents; LCM takes maximum exponents.** With $60 = 2^2 \cdot 3 \cdot 5$ and $72 = 2^3 \cdot 3^2$: $\gcd = 2^2 \cdot 3 = 12$ and $\mathrm{lcm} = 2^3 \cdot 3^2 \cdot 5 = 360$. Min-exponents is the largest thing dividing both; max-exponents is the smallest thing both divide.
Check: $\gcd$ and $\mathrm{lcm}$ of $84 = 2^2 \cdot 3 \cdot 7$ and $90 = 2 \cdot 3^2 \cdot 5$? ⇒ $\gcd = 6$, $\mathrm{lcm} = 2^2 \cdot 3^2 \cdot 5 \cdot 7 = 1260$.

4. **The product identity.** $\gcd(a,b) \cdot \mathrm{lcm}(a,b) = ab$ for two positive integers, because at each prime, $\min + \max$ of the two exponents equals their sum. Check it: $12 \cdot 360 = 4320 = 60 \cdot 72$.
Check: $\gcd = 12$, $\mathrm{lcm} = 360$, one number is $60$. The other? ⇒ $\frac{12 \times 360}{60} = 72$.

5. **Coprime cofactors.** If $\gcd(a,b) = g$, write $a = gm$, $b = gn$ with $\gcd(m,n) = 1$. Then $\mathrm{lcm}(a,b) = gmn$, so $mn = \mathrm{lcm}/\gcd$. When both are given, the *coprime* factor pairs of $\mathrm{lcm}/\gcd$ are the whole solution space — non-coprime pairs silently change the gcd.

6. **"Divisible by both" means divisible by the LCM,** not the product. Divisible by $6$ and $8$ means divisible by $\mathrm{lcm}(6,8) = 24$; indeed $24$ is divisible by both but not by $48$. The product works only for coprime pairs.
Check: The smallest positive integer divisible by both $6$ and $8$? ⇒ $24$.

7. **Counting multiples.** Exactly $\lfloor N/k \rfloor$ multiples of $k$ lie in $1, \dots, N$, because they are $k, 2k, \dots, \lfloor N/k \rfloor k$.
Check: How many multiples of $12$ are there up to $300$? ⇒ $\lfloor 300/12 \rfloor = 25$.

8. **Inclusion–exclusion.** Divisible by $p$ or $q$: $\lfloor N/p \rfloor + \lfloor N/q \rfloor - \lfloor N/\mathrm{lcm} \rfloor$. Divisible by *exactly one*: subtract the overlap twice — once for each pile it sits in.

9. **Common divisors are divisors of the GCF.** $d$ divides both $a$ and $b$ exactly when $d \mid \gcd(a,b)$ — so "how many common divisors" is a divisor count on the gcd.
Check: How many common divisors do $540$ and $360$ have? ⇒ $\gcd = 180 = 2^2 \cdot 3^2 \cdot 5$, so $(3)(3)(2) = 18$.

10. **The difference carries the GCF.** $\gcd(a,b) = \gcd(b, a-b)$, so $\gcd(n, n+k)$ must divide $k$. Two numbers can never share a factor bigger than their gap.
Check: $m = n + 6$. How large can $\gcd(m, n)$ be? ⇒ at most $6$ — it must divide the difference.

11. **Squaring doubles exponents.** If $48 = 2^4 \cdot 3$ divides $n^2$, then $2a \ge 4$ and $2b \ge 1$ for $n$'s exponents of $2$ and $3$, forcing $a \ge 2$, $b \ge 1$: $n$ is divisible by $12$. Smallest case: $n = 12$.

12. **Translating $\gcd(n, m) = d$.** At each prime of $m$, the min of the two exponents must equal the exponent in $d$ — one equation becomes a list of "at least" and "not divisible by" conditions on $n$. The forbidden-prime conditions are the ones test writers bet you'll drop.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*Bus route $A$ departs every $12$ minutes and bus route $B$ departs every $18$ minutes. If both routes depart at 9:00 a.m., how many minutes later do they next depart at the same time?*

1. Synchronization means LCM. Factor: $12 = 2^2 \cdot 3$, $18 = 2 \cdot 3^2$.
2. Max exponents: $\mathrm{lcm} = 2^2 \cdot 3^2 = 36$.

**Answer: $36$ minutes**

**Example 2 · 605 level · target 1:40**

*A florist has $96$ roses and $72$ tulips. She wants to assemble identical bouquets, each containing the same number of roses and the same number of tulips, using every flower. What is the greatest number of bouquets she can make?*

1. Identical groups using everything, greatest count → compute $\gcd(96, 72)$.
2. Factor: $96 = 2^5 \cdot 3$ and $72 = 2^3 \cdot 3^2$.
3. Take minimum exponents: $\gcd = 2^3 \cdot 3 = 24$.
4. Check: each bouquet gets $96/24 = 4$ roses and $72/24 = 3$ tulips.

**Wrong turn: reaching for the LCM.** $\mathrm{lcm}(96, 72) = 288$ answers a synchronization question nobody asked. Grouping and splitting stems are GCF; cycles and coincidences are LCM — misfiling the stem is this family's most expensive error, and both numbers are always among the choices.

**Answer: $24$**

**Example 3 · 655 level · target 2:05**

*How many positive integers $n \le 500$ are divisible by $6$ or by $10$, but not by both?*

1. Count each pile: $\lfloor 500/6 \rfloor = 83$ multiples of $6$ and $\lfloor 500/10 \rfloor = 50$ multiples of $10$.
2. "Both" means divisible by $\mathrm{lcm}(6,10) = 30$: $\lfloor 500/30 \rfloor = 16$.
3. Those $16$ sit inside both piles and "not both" excludes them entirely, so subtract the overlap twice: $83 + 50 - 2(16) = 101$.

**Wrong turn: subtracting the overlap once.** $83 + 50 - 16 = 117$ is the count for plain "or" — a planted choice. "But not by both" evicts the overlap from *each* pile it was counted in; the double subtraction is the whole point of the phrase.

**Answer: $101$**

**Example 4 · 705 level · target 2:30**

*Positive integers $a$ and $b$ satisfy $\gcd(a, b) = 6$ and $\mathrm{lcm}(a, b) = 72$. Which of the following could be the value of $a + b$?*

*A) $30$  B) $42$  C) $48$  D) $54$  E) $60$*

1. Write $a = 6m$, $b = 6n$ with $\gcd(m, n) = 1$ and $mn = \frac{\mathrm{lcm}}{\gcd} = \frac{72}{6} = 12$.
2. Coprime factor pairs of $12$: $(1, 12)$ and $(3, 4)$ — the pair $(2, 6)$ is out, since $\gcd(2,6) = 2$.
3. The possible pairs are $(6, 72)$ with sum $78$, and $(18, 24)$ with sum $42$.
4. Only $42$ appears among the choices.

**Wrong turn: allowing the non-coprime pair.** $(2, 6)$ gives $a = 12$, $b = 36$ with the tempting sum $48$ — choice (C). But $\gcd(12, 36) = 12$, not $6$: dropping the coprimality condition changes the gcd you were told to preserve. Verify any candidate pair's gcd before trusting its sum.

**Answer: $42$ (B)**

**Example 5 · Q86 level · target 2:50**

*If $n$ is a positive integer such that $\gcd(n, 56) = 8$ and $\gcd(n, 60) = 12$, what is the smallest possible value of $n$?*

1. Convert each condition to exponent constraints. First, $56 = 2^3 \cdot 7$ and $8 = 2^3$: the min of $n$'s $2$-exponent and $3$ must be $3$, so $2^3 \mid n$; the min at prime $7$ must be $0$, so $7 \nmid n$.
2. Next, $60 = 2^2 \cdot 3 \cdot 5$ and $12 = 2^2 \cdot 3$: the $2$-condition is already satisfied since $2^3 \mid n$; the $3$-condition forces $3 \mid n$; the $5$-condition forces $5 \nmid n$.
3. Assemble the cheapest $n$: required are $2^3$ and $3^1$, with $5$ and $7$ forbidden, so $n = 2^3 \cdot 3 = 24$.
4. Confirm: $\gcd(24, 56) = 8$ and $\gcd(24, 60) = 12$.

**Wrong turn: collecting only the "at least" conditions.** Requiring $2^3$ and $3$ but forgetting that $\gcd(n, 56) = 8$ *forbids* the prime $7$ (and the second condition forbids $5$) admits values like $n = 120$ that break the given gcds. A gcd equation states minima *and* ceilings; the forbidden primes are half the information.

**Answer: $24$**

## Trigger cues

- "Greatest number of identical boxes/groups with none left over" → compute the GCF of the quantities.
- "Events start together; when do they next coincide?" (ferries, deliveries, gears) → LCM of the cycle lengths.
- "How many integers up to $N$ are divisible by both $p$ and $q$" → count multiples of $\mathrm{lcm}(p,q)$ via $\lfloor N/\mathrm{lcm} \rfloor$.
- "Divisible by $p$ or $q$" → inclusion–exclusion; double-subtract the overlap for "but not both."
- "$\gcd(a,b)$ and $\mathrm{lcm}(a,b)$ are both given" → set $a = gm$, $b = gn$ and list coprime pairs with $mn = \mathrm{lcm}/\gcd$.
- "$\gcd(n, m) = d$ for a specific $m$" → prime-by-prime exponent conditions on $n$, forbidden primes included.
- "How many common divisors do $a$ and $b$ have?" → count the divisors of $\gcd(a,b)$.
- "$m$ and $n$ differ by a fixed amount" → their GCF divides that difference.

## Trap gallery

- **Multiplying instead of LCM-ing.** "Divisible by $6$ and $8$" is divisibility by $24$, not $48$ — multiply only coprime numbers.
- **Upgrading divisibility for free.** $6 \mid n$ does not give $12 \mid n$; $n = 6$ kills it — always test the smallest qualifying value before trusting a stronger claim.
- **Reading $\gcd(n, 60) = 12$ as $n = 12$.** $n = 36$ also satisfies it; a GCF condition constrains $n$, it rarely names it.
- **Forgetting the overlap direction.** "Or" needs one subtraction of the overlap; "exactly one" needs two.
- **LCM of a list by multiplying everything.** The smallest number divisible by $2$ through $10$ except $7$ is $2^3 \cdot 3^2 \cdot 5 = 360$, far below the raw product.
- **Applying $\gcd \cdot \mathrm{lcm} = ab$ to three numbers.** It is a two-number identity; with three or more it fails.
- **Ignoring "not a multiple of" side conditions.** In coprime-cofactor problems, the pair $(g, \mathrm{lcm})$ is always one option — a "which could be" stem exists precisely to test whether you found the others.

## Speed moves

- **Difference trick for GCF.** $\gcd(51, 68)$: the GCF divides $68 - 51 = 17$, and both are multiples of $17$ — answer $17$, no factoring.
- **Partner from the product identity.** Given $\gcd = 12$, $\mathrm{lcm} = 360$, one number $60$: the other is $12 \cdot 360 / 60 = 72$ in one line.
- **Floor division counts multiples instantly.** Multiples of $12$ up to $300$: $\lfloor 300/12 \rfloor = 25$. Never list them.
- **Prime stacking for list LCMs.** Keep the highest power of each prime: for $2$–$10$ that is $2^3$, $3^2$, $5$, $7$.
- **Smart small cases.** For "is $n$ necessarily divisible by …?", test the minimal $n$ the given facts allow; if it fails, the claim dies in seconds.

## Before you drill

- I can factor any two- or three-digit number into primes in under $15$ seconds.
- I build GCF from minimum exponents and LCM from maximum exponents without hesitation.
- I can use $\gcd(a,b) \cdot \mathrm{lcm}(a,b) = ab$ and know it holds only for two numbers.
- Given both $\gcd$ and $\mathrm{lcm}$, I write $a = gm$, $b = gn$ with coprime $m, n$ and $mn = \mathrm{lcm}/\gcd$ — and I check candidate pairs' gcds.
- I count multiples with $\lfloor N/k \rfloor$ and handle "or / not both" with inclusion–exclusion.
- I translate $\gcd(n, m) = d$ into per-prime exponent conditions, including forbidden primes.
- I recognize grouping stems as GCF and synchronization stems as LCM on the first read.
