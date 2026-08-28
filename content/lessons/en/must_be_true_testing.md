# Must-Be-True Testing: Forcing Facts from Signs, Sizes, and Zones

## Why this matters

"Which of the following must be true?" tests whether you know number properties as *laws*, not habits. At the Q86 level these problems hide behind inequalities like $x^2 > x$, sign conditions like $pqr < 0$, and Data Sufficiency stems asking "Is $x > y$?" — and all are decided the same way: an answer must survive *every* legal value, and one counterexample kills it.

## The core ideas

1. **The must-be-true standard.** A statement *must* be true only if it holds for **every** value satisfying the condition; it *could* be true if it holds for at least one. One counterexample eliminates.
2. **Translate the condition into a zone first.** Rewrite the given as a solution set before touching the choices: $x^2 > x \iff x(x-1) > 0 \iff x < 0 \text{ or } x > 1$, and $x^2 < x \iff 0 < x < 1$. Move everything to one side and read factor signs.
3. **The standard test kit.** Behavior flips at $-1$, $0$, and $1$, so test one value per zone: $-2,\ -1,\ -\tfrac12,\ 0,\ \tfrac12,\ 1,\ 2$. Example: $x = -\tfrac12$ satisfies $x^2 > x$ since $\tfrac14 > -\tfrac12$, wrecking any choice that claims $x$ is positive.
4. **Even powers erase sign; odd powers keep it.** $(-2)^2 = 2^2$, while $x^3$ has the sign of $x$. So $x y^2 z^3 > 0$ says only $xz > 0$ plus "$y \ne 0$."
5. **Absolute value detects sign.** $|x| \ge x$ always; $|x| > x \iff x < 0$; $|x| = x \iff x \ge 0$: $|x|$ flips only negatives.
6. **Products, quotients, sums.** $xy > 0 \iff$ same sign; $xy < 0 \iff$ opposite signs; $\frac{x}{y}$ has the sign of $xy$ since $\frac{x}{y} = \frac{xy}{y^2}$. Same sign plus $x + y < 0$ forces both negative.
7. **Squares compare distances, not positions.** $x^2 > y^2 \iff |x| > |y|$. Against "so $x > y$": $x = -3$, $y = 2$ gives $9 > 4$ with $x < y$.
8. **Factor — never divide by something that could be zero.** From $m^2 - n^2 = m + n$, do not cancel $m + n$; write $(m+n)(m-n-1) = 0$. The pair $m = 2$, $n = -2$ satisfies it with $m - n = 4 \ne 1$: cancelling loses solutions.
9. **Parity is a must-be-true machine.** $n^2 + n = n(n+1)$ is always even (consecutive integers); if $j + k$ is odd, exactly one of $j, k$ is odd, so $jk$ is even.
10. **Data Sufficiency is must-be-true in disguise.** A statement is sufficient exactly when it *forces* one answer for every allowed value; one yes-case plus one no-case proves insufficiency.

## Worked examples

**Example 1** *If $pq < 0$, which of the following must be true?*

*A) $p < 0$  B) $p + q < 0$  C) $\dfrac{p}{q} < 0$  D) $p^2 < q^2$  E) $pq^2 < 0$*

1. Translate: $pq < 0$ means opposite signs — nothing about which is negative or bigger.
2. Test one cheap pair, $p = 3$, $q = -1$ (valid: $pq = -3 < 0$). It kills A ($p > 0$), B ($p + q = 2 > 0$), D ($9 < 1$ is false), and E ($pq^2 = 3 > 0$).
3. Confirm C as a law: $\frac{p}{q} = \frac{pq}{q^2}$ with $q^2 > 0$, so the quotient is negative for every legal pair.

**Answer: C**

**Example 2** *If $m^2 < 9m$, which of the following must be true?*

*I. $m > 0$   II. $m < 10$   III. $m > 1$*

*A) I only  B) I and II only  C) I and III only  D) II and III only  E) I, II, and III*

1. Do not divide by $m$ — it could be negative. Rearrange: $m^2 - 9m < 0$, so $m(m - 9) < 0$.
2. The product is negative when the factors disagree in sign: exactly $0 < m < 9$. That interval is the whole universe.
3. I: every value in $(0, 9)$ is positive — must be true. II: every value is below $9$, hence below $10$ — must be true.
4. III: $m = \tfrac12$ is legal since $\tfrac14 < \tfrac92$, yet $\tfrac12 > 1$ fails. Killed.

**Answer: B**

**Example 3** *Is $t > 1$?*

*(1) $t^3 > t$*

*(2) $t^2 > t$*

1. Statement (1): $t^3 - t > 0$, i.e. $t(t-1)(t+1) > 0$. A sign chart over the zones cut by $-1, 0, 1$ gives $-1 < t < 0$ or $t > 1$. Test $t = -\tfrac12$: legal since $-\tfrac18 > -\tfrac12$, answering "no"; $t = 2$ is legal ($8 > 2$), answering "yes." Not sufficient.
2. Statement (2): $t(t-1) > 0$ gives $t < 0$ or $t > 1$. The same two values are legal — $\tfrac14 > -\tfrac12$ and $4 > 2$ — so both answers appear again. Not sufficient.
3. Together: reuse the pair. Both $t = -\tfrac12$ and $t = 2$ satisfy *both* statements at once, so the answer is still not forced.

**Answer: E**

## Trigger cues

- "Which of the following **must be true**?" → solve the condition into a zone, then hunt one counterexample per choice.
- "$x^2 > x$" or any power-vs-itself inequality → move everything to one side, factor, sign-chart; never divide by the variable.
- Roman-numeral format → run one test value against all three statements at once; prove survivors from the zone.
- "$ab < 0$," "$xyz > 0$," "$x + y < 0$" → count negatives; even powers are invisible to sign.
- Data Sufficiency "Is …?" with inequalities → find a yes-case and a no-case to prove insufficiency.
- Integer sums or products described as odd/even → parity rules, starting with $n(n+1)$ is always even.

## Trap gallery

- **Proving instead of disproving.** One value where a choice works shows "could," not "must." Fix: demolish wrong answers with counterexamples.
- **Dividing by a variable.** Cancelling $m$ in $m^2 < 9m$ or $m + n$ in $m^2 - n^2 = m + n$ assumes it is positive or nonzero. Fix: subtract and factor.
- **Testing only friendly numbers.** Checking $x = 2$ and $x = 3$ misses failures living at $\pm\tfrac12$. Fix: pull from all zones, including $-1$ and $1$.
- **Un-squaring carelessly.** $x^2 > y^2$ means $|x| > |y|$, not $x > y$: see $x = -3$, $y = 2$.
- **Reading $\frac{a}{b} > 1$ as $a > b$.** With $a = -3$, $b = -2$ the ratio is $\tfrac32 > 1$ yet $a < b$; multiplying by a negative $b$ flips the inequality.
- **Dismissing a strange choice.** In a $d^2 > 4d$ problem, "$d \ne 2$" looks weak but is exactly what the zone $d < 0$ or $d > 4$ guarantees. Fix: judge choices against the zone, not intuition.

## Speed moves

- **Zone first, choices second.** Thirty seconds turning $x^2 > x$ into "$x < 0$ or $x > 1$" settles all five choices at once.
- **One killer value, many victims.** The single pair $p = 3$, $q = -1$ in Example 1 eliminated four choices in one pass.
- **Reuse counterexamples across DS statements.** The same yes/no pair satisfying both statements proves (E) with zero extra work, as in Example 3.
- **Sign-count, don't compute.** For $x y^2 z^3 > 0$, delete even powers and reduce odd ones to the base: it reads $xz > 0$ immediately.
- **Boundary sanity check.** Plug an endpoint into the zone — $m = 9$ gives $81 < 81$, false — to settle strict vs. non-strict.

## Before you drill

- I can state the difference between "must be true" and "could be true" in one sentence.
- I can turn $x^2 > x$, $x^2 < x$, and $t^3 > t$ into solution zones in under 20 seconds each.
- My test kit is $-2, -1, -\tfrac12, 0, \tfrac12, 1, 2$, one value per behavior zone.
- I never divide by an expression that could be zero or negative — I factor.
- I read any product or quotient sign by counting negative factors and ignoring even powers.
- I treat every DS "Is…?" question as a hunt for one yes-case and one no-case.
- I know $|x| > x$ certifies $x < 0$, and $x^2 > y^2$ certifies only $|x| > |y|$.
