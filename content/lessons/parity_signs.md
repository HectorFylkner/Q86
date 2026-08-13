# Parity and Signs: Even/Odd Structure and Positive/Negative Logic

## Why this matters

The GMAT Focus Edition uses parity and sign questions to test whether you can reason about the *structure* of numbers without computing them. At the Q86 tier they appear as "must be true" problems on inequality chains, counting problems with joint even/odd conditions, and stems where even exponents quietly erase the sign information you need. All are fast if you work in two-symbol alphabets — even/odd and plus/minus — instead of values.

Ideas 1–5 are the parity rules, 6–10 the sign rules, and 11–12 the two structural moves (invariants and the plus-one identity) that mark the top tier. This chapter is also the engine room for the must-be-true chapter: the case discipline practiced here is the same one that chapter runs at full scale.

## The core ideas

Ideas 1–5 are parity; 6–10 are signs; 11–12 are the structural moves.

1. **Definitions.** An integer $n$ is even iff $n = 2k$ and odd iff $n = 2k + 1$ for some integer $k$. Zero is even ($0 = 2 \cdot 0$) and has no sign.

2. **Addition parity.** $E \pm E = E$, $O \pm O = E$, $E \pm O = O$ — two leftovers pair up. In general, a sum of integers is odd iff the *count* of odd terms is odd.
Check: Is the sum of seven odd integers even or odd? ⇒ Odd — the count of odd terms is $7$, an odd number.

3. **Multiplication parity.** A product is even iff at least one factor is even, odd iff every factor is odd. One factor of $2$ suffices.
Check: Three odd integers and one even integer are multiplied. Parity of the product? ⇒ Even — one even factor is enough.

4. **Powers preserve parity.** For $k \ge 1$, $n^k$ has the parity of $n$ — odd times odd stays odd. So $3^n$ is odd for every positive integer $n$.

5. **Consecutive integers.** $n(n + 1)$ is always even — one of two consecutive integers is even. So $n^2 + n$ is even and $n^2 + n + 1$ is odd for every integer $n$.
Check: The parity of $n^2 + n + 1$? ⇒ Odd for every integer $n$ — $n^2 + n = n(n+1)$ is always even.

6. **Sign of a product.** With no zero factors, a product is negative iff the count of negative factors is odd — each one flips the sign once. Quotients follow the same rule: $\frac{u}{v} > 0 \iff uv > 0$.
Check: Five nonzero numbers, exactly three negative. Sign of the product? ⇒ Negative — an odd count of sign flips.

7. **Even exponents erase sign; odd keep it.** For $x \ne 0$, $x^{2k} > 0$ while $x^{2k+1}$ has the sign of $x$. Matching signs multiply to a positive.
Check: The sign of $(-2)^7$? ⇒ Negative — an odd exponent keeps the base's sign.

8. **Squares are nonnegative.** $x^2 \ge 0$, with equality only at $x = 0$; never write $x^2 > 0$ without confirming $x \ne 0$.

9. **Order plus signs.** If $a < b < 0$, then $|a| > |b|$, $ab > 0$, $a - b < 0$, and $\frac{a}{b} > 1$ — check $a = -5$, $b = -2$. For negatives, farther left means larger absolute value.
Check: $a = -5$, $b = -2$ — the value of $\frac{a}{b}$, and is it greater than $1$? ⇒ $2.5$, yes — both facts follow for any $a < b < 0$.

10. **Negative-count logic.** For three nonzero numbers: $rst > 0$ forces zero or two negatives; $rst < 0$ forces one or three. A sum condition then pins the case.

11. **Parity invariants.** Adding an even number never changes parity; adding an odd number always flips it. A running total's parity depends only on the count of odd steps — which is what makes "could the total be…" questions decidable without simulation.
Check: A total starts even and an odd number is added $10$ times. Final parity? ⇒ Even — ten flips return to the start.

12. **The plus-one identity.** $xy + x + y = (x + 1)(y + 1) - 1$ — it turns a mixed sum-product parity condition into a pure product one.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*If $n$ is an odd integer, which of the following must be even?*

*A) $n + 2$  B) $2n + 1$  C) $n^2$  D) $3n$  E) $n^2 + n$*

1. Run the parity alphabet: $n + 2$ keeps $n$'s parity (odd); $2n + 1$ is even $+$ odd $=$ odd; $n^2$ and $3n$ preserve $n$'s oddness.
2. $n^2 + n = n(n + 1)$ multiplies consecutive integers — always even, for odd *or* even $n$.

**Answer: $n^2 + n$ (E)**

**Example 2 · 605 level · target 1:40**

*For how many integers $n$ from $1$ to $60$, inclusive, is $2n^2 + 3n + 4$ odd?*

1. Work term by term: $2n^2$ and $4$ are even, so the expression's parity is that of $3n$.
2. $3$ is odd, so $3n$ has the parity of $n$: the expression is odd exactly when $n$ is odd.
3. The odd integers from $1$ to $60$ are $1, 3, \dots, 59$ — half of $60$, which is $30$.

**Answer: $30$**

**Example 3 · 655 level · target 2:05**

*If $x$, $y$, and $z$ are nonzero numbers with $xy^2z^3 > 0$ and $xy < 0$, which of the following must be true?*

*I. $xz > 0$  II. $yz < 0$  III. $xyz < 0$*

1. Strip the even power: $y^2 > 0$, so the first condition reduces to $xz^3 > 0$. An odd power keeps its base's sign, so $x$ and $z$ match: I must be true.
2. $xy < 0$ makes $y$ opposite to $x$ — hence opposite to $z$ too. So $yz < 0$: II must be true.
3. Test III in both surviving patterns. With $x > 0$, $z > 0$, $y < 0$: $xyz < 0$. With $x < 0$, $z < 0$, $y > 0$: $xyz = (-)(+)(-) > 0$. III can fail.

**Wrong turn: stopping after one pattern.** The first pattern ($x, z$ positive, $y$ negative) makes all three statements true, and marking "I, II and III" from it alone is the classic must-be-true failure: one case proves *could*, never *must*. The second surviving pattern exists precisely to break III.

**Answer: I and II only**

**Example 4 · 705 level · target 2:30**

*A carnival game uses one deck numbered $1$ through $8$ and a second deck numbered $1$ through $5$. A player draws one card from each, getting values $x$ and $y$, and wins if $xy + x + y$ is odd. For how many of the $40$ possible pairs $(x, y)$ does the player win?*

1. Apply the identity: $xy + x + y = (x + 1)(y + 1) - 1$, which is odd exactly when $(x + 1)(y + 1)$ is even.
2. A product is even iff some factor is even, so the player wins iff at least one of $x$, $y$ is odd.
3. Count the complement: both even means $x \in \{2, 4, 6, 8\}$, $y \in \{2, 4\}$ — $4 \cdot 2 = 8$ losing pairs.
4. Winning pairs: $40 - 8 = 32$.

**Wrong turn: casework on the raw expression.** Splitting $xy + x + y$ into four parity cases for $(x, y)$ works but burns two minutes and invites slips; the planted wrong answers ($20$, $24$) come from miscounting those cases. The plus-one identity plus complement counting is the intended two-line route.

**Answer: $32$**

**Example 5 · Q86 level · target 2:50**

*A counter starts at $0$. On each of $45$ moves, the counter increases by either $3$ or $5$. Which of the following could be the counter's value after the $45$th move?*

*A) $128$  B) $178$  C) $189$  D) $226$  E) $240$*

1. Parity invariant: every move adds an odd number, so each move flips parity. After $45$ moves — an odd count of flips — the total is odd. That kills $128$, $178$, $226$, and $240$… almost: check the range too.
2. Range: all $3$s give $135$; all $5$s give $225$. So the value lies in $[135, 225]$ — confirming $128$ was doubly dead.
3. Reachability: swapping one $3$ for a $5$ adds $2$, so every odd value from $135$ to $225$ is reachable.
4. $189$ is odd and $135 \le 189 \le 225$: reachable (e.g., $135 + 2 \times 27$ — twenty-seven swaps).

**Wrong turn: averaging toward plausibility.** $45$ moves averaging $4$ suggests values "near $180$," making $178$ (choice B) feel right. Plausible magnitude is not reachability — the parity invariant rules out every even total no matter how central it looks. Structure first, magnitude second.

**Answer: $189$ (C)**

## Trigger cues

- "Is the integer $k$ even?" given a fact like "$k^2 - 1$ is odd" → translate each fact into the parity of $k$; here $k^2 - 1$ odd forces $k$ even.
- An inequality chain such as $a < b < 0$ plus "which must be positive?" → check each choice's sign structurally, then confirm with convenient numbers respecting the order.
- Odd and even exponents in "Is $x^3 y^4 z^5 > 0$?" → delete every even-power factor and read the sign off the odd-power factors.
- "Product is even and sum is odd" over selections → classify each pick as $E$ or $O$ and count the qualifying parity patterns.
- Repeated moves of two fixed step sizes ("gains $3$ or drops $5$ each turn") → write the net change as a combination and track the parity invariant.
- "None was zero, the product was positive, the sum was negative" → count negatives with idea 10, then let the sum eliminate cases.
- "Could the final value be…" after many repeated steps → invariant plus range plus step-size reachability, in that order.

## Trap gallery

- **Zero misfiled.** Zero is even, signless, and kills any product it touches — treating it as positive or odd breaks case counts silently.
- **$x^{2k} > 0$ without $x \ne 0$.** The even power of zero is zero; check the stem for "nonzero" before strict inequalities.
- **Sum sign read as term signs.** $u + v > 0$ does not make both positive — $5 + (-1) = 4$. A sum's sign never fixes each term's.
- **Ordering ignored.** $xy < 0$ with $x < y$ forces $x < 0 < y$, never the reverse — the inequality chain is information, use it.
- **Parity on non-integers.** Even/odd only makes sense for integers, and stems omit "integer" on purpose; $x = \frac{1}{2}$ wrecks parity arguments.
- **"Must" from one case.** One test case proves *could*; "must" requires surviving every allowed case — hunt for the breaking pattern.
- **Negative product means all negative.** One negative or three negatives both give a negative triple product; count, don't assume.

## Speed moves

- **Sign-only bookkeeping.** Replace factors with $+$ or $-$: in $ab^2c^3 < 0$ with $b < 0$, replace $b^2$ with $+$ and the condition becomes $ac^3 < 0$.
- **Parity-only bookkeeping.** Replace numbers with $E$/$O$: $3^n$ is always odd, so $3^n + n^3$ is even iff $n$ is odd — $25$ values from $1$ to $50$, no computation.
- **Pick convenient numbers that respect the constraints.** For $a < b < 0$, set $a = -3$, $b = -1$ and evaluate all five choices in seconds.
- **Period-2 counting.** Parity patterns repeat every $2$ integers, so counts over $1$ to $N$ come from halving, as in Example 2.
- **Complement counting.** "At least one odd" is total minus "all even," as in Example 4 — one subtraction beats three additions.
- **The plus-one identity.** On seeing $xy + x + y$, jump to $(x+1)(y+1) - 1$ and reason about a plain product.
- **Invariant before enumeration.** For repeated-step stems, check what never changes (parity, remainder mod the step gcd) before trying to build the target value.

## Before you drill

- I can state the addition and multiplication parity rules without pausing, including "a sum is odd iff the count of odd terms is odd."
- I know zero is even, signless, and a product-killer.
- I can strip even-power factors from a sign question and read the answer off the odd powers.
- Given the sign of $rst$, I can list the possible counts of negative factors instantly.
- For $a < b < 0$, I can give the signs of $ab$, $a - b$, $\frac{a}{b}$ and compare $|a|$ with $|b|$.
- I test every surviving case before marking "must be true."
- I can factor $xy + x + y + 1$ on sight and use it to settle a parity condition.
- For repeated-step processes I check the invariant and the range before hunting for a construction.
