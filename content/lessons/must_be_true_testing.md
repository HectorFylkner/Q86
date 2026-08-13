# Must-Be-True Testing: Forcing Facts from Signs, Sizes, and Zones

## Why this matters

"Which of the following must be true?" tests whether you know number properties as *laws*, not habits. At the Q86 tier these problems hide behind inequalities like $x^2 > x$, sign conditions like $pqr < 0$, and equations that tempt you to cancel a factor that might be zero — and all are decided the same way: an answer must survive *every* legal value, and one counterexample kills it.

This chapter is the capstone of the Value/Order/Factors branch: it runs the parity chapter's case discipline and the exponents chapter's zone logic at full scale, and it is where the number-testing doctrine from the playbook becomes a scored skill. Ideas 1–3 define the game and the test kit; 4–9 are the property laws the exam draws from; the examples are the game played at speed.

## The core ideas

Ideas 1–3 define the game; 4–9 are the laws it draws from.

1. **The must-be-true standard.** A statement *must* be true only if it holds for **every** value satisfying the condition; it *could* be true if it holds for at least one. One counterexample eliminates — so the fastest work is destructive, not constructive.

2. **Translate the condition into a zone first.** Rewrite the given as a solution set before touching the choices: $x^2 > x \iff x(x-1) > 0 \iff x < 0 \text{ or } x > 1$. Move everything to one side and read factor signs.
Check: Solve $x^2 < x$ into a zone. ⇒ $x(x-1) < 0$, so $0 < x < 1$.

3. **The standard test kit.** Behavior flips at $-1$, $0$, and $1$, so test one value per zone: $-2,\ -1,\ -\tfrac12,\ 0,\ \tfrac12,\ 1,\ 2$. The fractions and negatives are the assassins; friendly integers rarely kill anything.
Check: Does $x = -\tfrac12$ satisfy $x^2 > x$? ⇒ Yes — $\tfrac14 > -\tfrac12$, which wrecks any claim that $x$ must be positive.

4. **Even powers erase sign; odd powers keep it.** $(-2)^2 = 2^2$, while $x^3$ has the sign of $x$. So $x y^2 z^3 > 0$ says only $xz > 0$ plus "$y \ne 0$."

5. **Absolute value detects sign.** $|x| \ge x$ always; $|x| > x \iff x < 0$; $|x| = x \iff x \ge 0$: $|x|$ flips only negatives.
Check: What does $|x| > x$ certify about $x$? ⇒ $x < 0$ — nothing else produces strict inequality.

6. **Products, quotients, sums.** $xy > 0 \iff$ same sign; $xy < 0 \iff$ opposite signs; $\frac{x}{y}$ has the sign of $xy$ since $\frac{x}{y} = \frac{xy}{y^2}$.
Check: $xy > 0$ and $x + y < 0$ together force? ⇒ Both negative — same sign, negative sum.

7. **Squares compare distances, not positions.** $x^2 > y^2 \iff |x| > |y|$. Against "so $x > y$": $x = -3$, $y = 2$ gives $9 > 4$ with $x < y$.
Check: $x^2 > y^2$ is equivalent to what? ⇒ $|x| > |y|$ — magnitudes, never order.

8. **Factor — never divide by something that could be zero.** From $m^2 - n^2 = m + n$, do not cancel $m + n$; write $(m+n)(m-n-1) = 0$. Cancelling silently assumes $m + n \ne 0$ and loses half the solution set.

9. **Parity is a must-be-true machine.** $n^2 + n = n(n+1)$ is always even (consecutive integers); parity laws hold for *every* integer, which is exactly the "must" standard.
Check: If $j + k$ is odd, the parity of $jk$? ⇒ Even — exactly one of them is odd, so the other supplies a factor of $2$.

10. **Yes/no claims are must-be-true in disguise.** Any "is $x > y$?" style claim follows from given facts only if it is forced for every legal value; finding one yes-case and one no-case proves the facts don't decide it. The counterexample hunt is the same skill pointed at a different stem.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*If $x$ is an integer and $x^2$ is odd, which of the following must be true?*

*A) $x$ is odd  B) $x$ is even  C) $x > 0$  D) $x$ is prime  E) $x^2 > x$*

1. Powers preserve parity: $x^2$ odd forces $x$ odd — (A) is a law.
2. Kill the rest with $x = 1$: positive but not prime kills (D)… and $x^2 = x$ kills (E). Then $x = -3$ kills (C). (B) contradicts (A).

**Answer: (A)**

**Example 2 · 605 level · target 1:40**

*If $pq < 0$, which of the following must be true?*

*A) $p < 0$  B) $p + q < 0$  C) $\dfrac{p}{q} < 0$  D) $p^2 < q^2$  E) $pq^2 < 0$*

1. Translate: $pq < 0$ means opposite signs — nothing about which is negative or bigger.
2. Test one cheap pair, $p = 3$, $q = -1$ (valid: $pq = -3 < 0$). It kills A ($p > 0$), B ($p + q = 2 > 0$), D ($9 < 1$ is false), and E ($pq^2 = 3 > 0$).
3. Confirm C as a law: $\frac{p}{q} = \frac{pq}{q^2}$ with $q^2 > 0$, so the quotient is negative for every legal pair.

**Answer: (C)**

**Example 3 · 655 level · target 2:05**

*If $m^2 < 9m$, which of the following must be true?*

*I. $m > 0$   II. $m < 10$   III. $m > 1$*

*A) I only  B) I and II only  C) I and III only  D) II and III only  E) I, II, and III*

1. Do not divide by $m$ — it could be negative. Rearrange: $m^2 - 9m < 0$, so $m(m - 9) < 0$.
2. The product is negative when the factors disagree in sign: exactly $0 < m < 9$. That interval is the whole universe.
3. I: every value in $(0, 9)$ is positive — must be true. II: every value is below $9$, hence below $10$ — must be true.
4. III: $m = \tfrac12$ is legal since $\tfrac14 < \tfrac92$, yet $\tfrac12 > 1$ fails. Killed.

**Wrong turn: dividing by $m$.** Cancelling $m$ from $m^2 < 9m$ gives $m < 9$ — which quietly *assumed* $m > 0$ instead of deriving it, and would leave you unable to judge statement I. The zone $(0, 9)$ contains both facts; the division threw one away.

**Answer: (B)**

**Example 4 · 705 level · target 2:30**

*If $t^3 > t$, which of the following must be true?*

*I. $t > 1$   II. $t > -1$   III. $t^2 > t$*

*A) I only  B) II only  C) III only  D) II and III only  E) I, II, and III*

1. Zone first: $t^3 - t > 0$, so $t(t-1)(t+1) > 0$. Sign-chart across $-1, 0, 1$: the product is positive on $-1 < t < 0$ and on $t > 1$.
2. I: $t = -\tfrac12$ is legal ($-\tfrac18 > -\tfrac12$) and fails $t > 1$. Killed.
3. II: both zones sit strictly right of $-1$ — must be true.
4. III: on $(-1, 0)$, $t$ is negative so $t^2 > 0 > t$; on $t > 1$, $t^2 > t$ directly. Holds across the whole universe — must be true.

**Wrong turn: dividing by $t$.** $t^3 > t \Rightarrow t^2 > 1$ requires knowing $t > 0$; without it the division flips for negative $t$ and manufactures the zone "$t > 1$ or $t < -1$" — which endorses statement I and misses the entire $(-1, 0)$ branch. The cubic factors in five seconds; let it.

**Answer: (D)**

**Example 5 · Q86 level · target 2:50**

*If $m$ and $n$ are integers such that $m^2 - n^2 = m + n$, which of the following must be true?*

*A) $m = n + 1$  B) $m + n = 0$  C) $(m + n)(m - n - 1) = 0$  D) $m > n$  E) $m^2 \ge n^2$*

1. Factor without cancelling: $m^2 - n^2 = (m+n)(m-n)$, so the equation says $(m+n)(m-n) = m+n$, i.e. $(m+n)(m - n - 1) = 0$. That identity is (C) — true for every legal pair by construction.
2. Kill (A) with the other branch: $m = 3$, $n = -3$ satisfies ($0 = 0$) but $3 \ne -2$.
3. Kill (B) with the first branch: $m = 2$, $n = 1$ satisfies ($3 = 3$) but $m + n = 3$.
4. Kill (D): $m = -3$, $n = 3$ is legal ($m + n = 0$) with $m < n$.
5. Kill (E): $m = 0$, $n = -1$ is legal ($m = n + 1$: $-1 = -1$) with $0 < 1$.

**Wrong turn: cancelling $m + n$.** Dividing both sides of $(m+n)(m-n) = m+n$ by $m + n$ yields $m - n = 1$ — choice (A) — and silently discards every pair with $m + n = 0$. The condition is an *or*, and only the factored form (C) captures both branches. Cancelling a factor that can be zero is this family's signature Q86 trap.

**Answer: (C)**

## Trigger cues

- "Which of the following **must be true**?" → solve the condition into a zone, then hunt one counterexample per choice.
- "$x^2 > x$" or any power-vs-itself inequality → move everything to one side, factor, sign-chart; never divide by the variable.
- Roman-numeral format → run one test value against all three statements at once; prove survivors from the zone.
- "$ab < 0$," "$xyz > 0$," "$x + y < 0$" → count negatives; even powers are invisible to sign.
- "Does it follow that …?" on an inequality → find a yes-case and a no-case; if both exist, it doesn't follow.
- Integer sums or products described as odd/even → parity rules, starting with $n(n+1)$ is always even.
- An equation with a cancellable common factor → factor it out and keep *both* branches of the resulting product-equals-zero.

## Trap gallery

- **Proving instead of disproving.** One value where a choice works shows "could," not "must." Demolish wrong answers with counterexamples.
- **Dividing by a variable.** Cancelling $m$ in $m^2 < 9m$ or $m + n$ in $m^2 - n^2 = m + n$ assumes it is positive or nonzero. Subtract and factor.
- **Testing only friendly numbers.** Checking $x = 2$ and $x = 3$ misses failures living at $\pm\tfrac12$. Pull from all zones, including $-1$ and $1$.
- **Un-squaring carelessly.** $x^2 > y^2$ means $|x| > |y|$, not $x > y$: see $x = -3$, $y = 2$.
- **Reading $\frac{a}{b} > 1$ as $a > b$.** With $a = -3$, $b = -2$ the ratio is $\tfrac32 > 1$ yet $a < b$; multiplying by a negative $b$ flips the inequality.
- **Dismissing a strange choice.** In a $d^2 > 4d$ problem, "$d \ne 2$" looks weak but is exactly what the zone $d < 0$ or $d > 4$ guarantees. Judge choices against the zone, not intuition.

## Speed moves

- **Zone first, choices second.** Thirty seconds turning $x^2 > x$ into "$x < 0$ or $x > 1$" settles all five choices at once.
- **One killer value, many victims.** The single pair $p = 3$, $q = -1$ in Example 2 eliminated four choices in one pass.
- **Reuse counterexamples.** A value that survives the condition kills every claim it violates — check it against all remaining statements before picking a new one.
- **Sign-count, don't compute.** For $x y^2 z^3 > 0$, delete even powers and reduce odd ones to the base: it reads $xz > 0$ immediately.
- **Boundary sanity check.** Plug an endpoint into the zone — $m = 9$ gives $81 < 81$, false — to settle strict vs. non-strict.

## Before you drill

- I can state the difference between "must be true" and "could be true" in one sentence.
- I can turn $x^2 > x$, $x^2 < x$, and $t^3 > t$ into solution zones in under 20 seconds each.
- My test kit is $-2, -1, -\tfrac12, 0, \tfrac12, 1, 2$, one value per behavior zone.
- I never divide by an expression that could be zero or negative — I factor and keep both branches.
- I read any product or quotient sign by counting negative factors and ignoring even powers.
- I treat every "does it follow" question as a hunt for one yes-case and one no-case.
- I know $|x| > x$ certifies $x < 0$, and $x^2 > y^2$ certifies only $|x| > |y|$.
