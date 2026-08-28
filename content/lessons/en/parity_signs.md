# Parity and Signs: Even/Odd Structure and Positive/Negative Logic

## Why this matters

The GMAT Focus Edition uses parity and sign questions to test whether you can reason about the *structure* of numbers without computing them. At the Q84–Q86 level they appear as "must be true" problems on inequality chains, counting problems with joint even/odd conditions, and sufficiency stems where exponents hide signs. All are fast if you work in two-symbol alphabets — even/odd and plus/minus — instead of values.

## The core ideas

1. **Definitions.** An integer $n$ is even iff $n = 2k$ and odd iff $n = 2k + 1$ for some integer $k$. Zero is even ($0 = 2 \cdot 0$) and has no sign.
2. **Addition parity.** $E \pm E = E$, $O \pm O = E$, $E \pm O = O$ — two leftovers pair up. In general, a sum of integers is odd iff the *count* of odd terms is odd.
3. **Multiplication parity.** A product is even iff at least one factor is even, odd iff every factor is odd. One factor of $2$ suffices.
4. **Powers preserve parity.** For $k \ge 1$, $n^k$ has the parity of $n$ — odd times odd stays odd. So $3^n$ is odd for every positive integer $n$.
5. **Consecutive integers.** $n(n + 1)$ is always even — one of two consecutive integers is even. So $n^2 + n$ is even and $n^2 + n + 1$ is odd for every integer $n$.
6. **Sign of a product.** With no zero factors, a product is negative iff the count of negative factors is odd — each one flips the sign once. Quotients follow the same rule: $\frac{u}{v} > 0 \iff uv > 0$.
7. **Even exponents erase sign; odd keep it.** For $x \ne 0$, $x^{2k} > 0$ while $x^{2k+1}$ has the sign of $x$. Matching signs multiply to a positive.
8. **Squares are nonnegative.** $x^2 \ge 0$, with equality only at $x = 0$; never write $x^2 > 0$ without confirming $x \ne 0$.
9. **Order plus signs.** If $a < b < 0$, then $|a| > |b|$, $ab > 0$, $a - b < 0$, and $\frac{a}{b} > 1$ — check $a = -5$, $b = -2$. For negatives, farther left means larger absolute value.
10. **Negative-count logic.** For three nonzero numbers: $rst > 0$ forces zero or two negatives; $rst < 0$ forces one or three. A sum condition then pins the case.
11. **Parity invariants.** Adding an even number never changes parity; adding an odd number always flips it. A running total's parity depends only on the count of odd steps.
12. **The plus-one identity.** $xy + x + y = (x + 1)(y + 1) - 1$ — it turns a mixed sum-product parity condition into a pure product one.

## Worked examples

**Example 1**

*For how many integers $n$ from $1$ to $60$, inclusive, is $2n^2 + 3n + 4$ odd?*

1. Work term by term: $2n^2$ and $4$ are even, so the expression's parity is that of $3n$.
2. $3$ is odd, so $3n$ has the parity of $n$: the expression is odd exactly when $n$ is odd.
3. The odd integers from $1$ to $60$ are $1, 3, \dots, 59$ — half of $60$, which is $30$.

**Answer: 30**

**Example 2**

*If $x$, $y$, and $z$ are nonzero numbers with $xy^2z^3 > 0$ and $xy < 0$, which of the following must be true?*

*I. $xz > 0$*

*II. $yz < 0$*

*III. $xyz < 0$*

1. Strip the even power: $y^2 > 0$, so the first condition reduces to $xz^3 > 0$. An odd power keeps its base's sign, so $x$ and $z$ match: I must be true.
2. $xy < 0$ makes $y$ opposite to $x$ — hence opposite to $z$ too. So $yz < 0$: II must be true.
3. Test III in both surviving patterns. With $x > 0$, $z > 0$, $y < 0$: $xyz < 0$. With $x < 0$, $z < 0$, $y > 0$: $xyz = (-)(+)(-) > 0$. III can fail.

**Answer: I and II only**

**Example 3**

*A carnival game uses one deck numbered $1$ through $8$ and a second deck numbered $1$ through $5$. A player draws one card from each, getting values $x$ and $y$, and wins if $xy + x + y$ is odd. For how many of the $40$ possible pairs $(x, y)$ does the player win?*

1. Apply the identity: $xy + x + y = (x + 1)(y + 1) - 1$, which is odd exactly when $(x + 1)(y + 1)$ is even.
2. A product is even iff some factor is even, so the player wins iff at least one of $x$, $y$ is odd.
3. Count the complement: both even means $x \in \{2, 4, 6, 8\}$, $y \in \{2, 4\}$ — $4 \cdot 2 = 8$ losing pairs.
4. Winning pairs: $40 - 8 = 32$.

**Answer: 32**

## Trigger cues

- "Is the integer $k$ even?" with statements like "$k^2 - 1$ is odd" → translate each statement into the parity of $k$; here $k^2 - 1$ odd forces $k$ even.
- An inequality chain such as $a < b < 0$ plus "which must be positive?" → check each choice's sign structurally, then confirm with convenient numbers respecting the order.
- Odd and even exponents in "Is $x^3 y^4 z^5 > 0$?" → delete every even-power factor and read the sign off the odd-power factors.
- "Product is even and sum is odd" over selections → classify each pick as $E$ or $O$ and count the qualifying parity patterns.
- Repeated moves of two fixed step sizes ("gains $3$ or drops $5$ each turn") → write the net change as a combination and track the parity invariant.
- "None was zero, the product was positive, the sum was negative" → count negatives with rule 10, then let the sum eliminate cases.

## Trap gallery

- Treating zero as positive or odd — zero is even, signless, and kills any product it touches.
- Concluding $x^{2k} > 0$ without ruling out $x = 0$ — check the stem for "nonzero."
- Reading $u + v > 0$ as "both positive" — $5 + (-1) = 4$ shows a sum's sign does not fix each term's.
- Missing that an ordering pins down which variable is negative: $xy < 0$ with $x < y$ forces $x < 0 < y$, never the reverse.
- Applying parity rules to unrestricted variables — even/odd only makes sense for integers, and stems omit "integer" on purpose.
- Declaring "must be true" after one test case — one case proves *could*; "must" requires surviving every allowed case.
- Equating "negative product" with "all factors negative" — one negative or three negatives both give a negative triple product.

## Speed moves

- **Sign-only bookkeeping.** Replace factors with $+$ or $-$: in $ab^2c^3 < 0$ with $b < 0$, replace $b^2$ with $+$ and the condition becomes $ac^3 < 0$.
- **Parity-only bookkeeping.** Replace numbers with $E$/$O$: $3^n$ is always odd, so $3^n + n^3$ is even iff $n$ is odd — $25$ values from $1$ to $50$, no computation.
- **Pick convenient numbers that respect the constraints.** For $a < b < 0$, set $a = -3$, $b = -1$ and evaluate all five choices in seconds.
- **Period-2 counting.** Parity patterns repeat every $2$ integers, so counts over $1$ to $N$ come from halving, as in Example 1.
- **Complement counting.** "At least one odd" is total minus "all even," as in Example 3 — one subtraction beats three additions.
- **The plus-one identity.** On seeing $xy + x + y$, jump to $(x+1)(y+1) - 1$ and reason about a plain product.

## Before you drill

- I can state the addition and multiplication parity rules without pausing, including "a sum is odd iff the count of odd terms is odd."
- I know zero is even, signless, and a product-killer.
- I can strip even-power factors from a sign question and read the answer off the odd powers.
- Given the sign of $rst$, I can list the possible counts of negative factors instantly.
- For $a < b < 0$, I can give the signs of $ab$, $a - b$, $\frac{a}{b}$ and compare $|a|$ with $|b|$.
- I test every surviving case before marking "must be true."
- I can factor $xy + x + y + 1$ on sight and use it to settle a parity condition.
