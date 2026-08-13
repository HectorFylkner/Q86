# Inequalities: Sign Discipline, Endpoint Testing, and Bounding

## Why this matters

Inequalities appear on the GMAT Focus Edition in every costume: bare algebra, threshold word problems, range questions, and must-be-true logic. At the Q86 tier the exam rarely tests whether you can isolate $x$ — it tests whether you track signs, know where extremes live, and can bound an expression without solving anything exactly.

Ideas 1–4 are the manipulation laws (and the flip that powers half the traps); 5–8 locate extremes and read sign charts; 9–13 are the bounding tools — squares, AM–GM, completed squares — that the top tier is built from. The sign discipline here extends the quadratics chapter's factoring and the must-be-true chapter's case logic; all three run on the same chart.

## The core ideas

Ideas 1–4 are the laws; 5–8 extremes and sign charts; 9–13 the bounding tools.

1. **Add or subtract anything.** If $a > b$, then $a + c > b + c$ for any real $c$ — shifting both sides preserves their gap.

2. **Multiply or divide by a positive: order holds. By a negative: order flips.** If $a > b$ and $c < 0$, then $ac < bc$, because a negative multiplier reflects the number line through $0$.
Check: Solve $-3x \ge 12$. ⇒ $x \le -4$ — the divide by $-3$ flips the symbol.

3. **Never multiply or divide by an expression of unknown sign.** Given $\frac{a}{b} > 1$, you cannot conclude $a > b$ unless $b > 0$; split into cases or move everything to one side.

4. **Same-direction inequalities add; they never subtract.** If $a > b$ and $c > d$, then $a + c > b + d$. To "subtract," rewrite $c > d$ as $-d > -c$ and add.
Check: From $a > b$ and $c > d$, does $a - c > b - d$ follow? ⇒ No — only addition is safe; negate and add instead.

5. **Extremes of $x + y$ and $x - y$ come from opposite corners.** $\max(x - y) = \max(x) - \min(y)$, since increasing $y$ decreases $x - y$.
Check: $1 \le x \le 4$ and $2 \le y \le 7$. Max of $x - y$? ⇒ $4 - 2 = 2$.

6. **Extremes of $xy$ and $\frac{x}{y}$ come from the four endpoint pairs.** With $x$ fixed, $xy$ is linear in $y$, so extremes sit at endpoints; test all four pairs. For $\frac{x}{y}$, the $y$-interval must exclude $0$.

7. **Reciprocals flip order within one sign.** If $0 < a < b$ or $a < b < 0$, then $\frac{1}{a} > \frac{1}{b}$. If an interval straddles $0$, its reciprocal image is *two rays*, one from each side.
Check: $0 < a < b$ — which reciprocal is larger? ⇒ $\frac{1}{a} > \frac{1}{b}$.

8. **Rational and factored inequalities: sign chart.** For $\frac{x-5}{x+1} < 0$, mark $x = 5$ (zero) and $x = -1$ (undefined), then read signs on each piece: negative exactly on $-1 < x < 5$. Signs alternate across simple roots.

9. **Squares are never negative:** $t^2 \ge 0$, equality only at $t = 0$. Completing the square, $x^2 + bx = \left(x + \frac{b}{2}\right)^2 - \frac{b^2}{4}$, turns a quadratic condition into a bounded region.

10. **AM–GM:** for $a, b > 0$, $a + b \ge 2\sqrt{ab}$, equality iff $a = b$ — it is $(\sqrt{a} - \sqrt{b})^2 \ge 0$ rearranged. Corollary: if $0 < a < b$ and $ab = k$, then $a < \sqrt{k} < b$.
Check: $a, b > 0$ with $ab = 36$. The least possible $a + b$? ⇒ $12$, at $a = b = 6$.

11. **Counting integers:** if the solved range is $a \le n \le b$ with integer endpoints, the count is $b - a + 1$. Isolate $n$ before counting.
Check: How many integers satisfy $-5 \le n < 4$? ⇒ $-5$ through $3$: $3 - (-5) + 1 = 9$.

12. **Strict thresholds round up past the boundary.** The least integer with $n > c$ is $\lfloor c \rfloor + 1$; when $c$ is an integer, the answer is $c + 1$, not $c$.

13. **Max of $x + y$ over the disk $(x-h)^2 + (y-k)^2 \le r^2$ is $h + k + r\sqrt{2}$** — the line $x + y = c$ last touches the circle in the direction $\left(\tfrac{1}{\sqrt{2}}, \tfrac{1}{\sqrt{2}}\right)$.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*Which of the following describes all values of $x$ for which $-3x + 5 \ge 17$?*

*A) $x \ge -4$  B) $x \le -4$  C) $x \ge 4$  D) $x \le 4$  E) $x \le -\dfrac{22}{3}$*

1. Subtract $5$: $-3x \ge 12$.
2. Divide by $-3$ and flip: $x \le -4$.
3. Spot-check $x = -5$: $15 + 5 = 20 \ge 17$. ✓

**Wrong turn: the unflipped divide.** $x \ge -4$ — choice (A) — is the answer to the same arithmetic done without the reflection. Both directions always appear among the choices; a two-second spot check with one value settles it beyond argument.

**Answer: (B)**

**Example 2 · 605 level · target 1:40**

*A courier earns $\$14$ per delivery plus a $\$26$ stipend per shift. What is the least number of deliveries the courier must make in one shift to earn more than $\$250$ for that shift?*

1. Let $d$ be the number of deliveries. The condition is $14d + 26 > 250$.
2. Subtract $26$: $14d > 224$, so $d > 16$.
3. The inequality is strict, and $d = 16$ gives exactly $14(16) + 26 = 250$ — not *more than* $\$250$. So $d = 17$.
4. Check: $14(17) + 26 = 264 > 250$. ✓

**Wrong turn: stopping at the boundary.** $16$ is planted, and it is exactly wrong: it *ties* the target. "More than" excludes the boundary; "at least" includes it. The stem's comparative word is the entire difference between two adjacent answer choices.

**Answer: $17$**

**Example 3 · 655 level · target 2:05**

*If $-5 \le a \le 2$ and $-3 \le b \le 6$, what is the least possible value of $ab$?*

1. Extremes of $ab$ occur at endpoint pairs; test all four.
2. $(-5)(-3) = 15$, $(-5)(6) = -30$, $(2)(-3) = -6$, $(2)(6) = 12$.
3. The least is $-30$: the most negative product pairs the largest magnitudes with *opposite* signs.

**Wrong turn: least times least.** $(-5)(-3) = 15$ is this grid's *maximum* — multiplying the two smallest endpoints feels minimal and is exactly backwards when both are negative. The grid takes twenty seconds and is immune to the intuition.

**Answer: $-30$**

**Example 4 · 705 level · target 2:30**

*How many integers $x$ satisfy $\dfrac{x - 5}{x + 1} < 0$?*

*A) $4$  B) $5$  C) $6$  D) $7$  E) Infinitely many*

1. Critical points: the numerator vanishes at $x = 5$; the denominator at $x = -1$ (excluded — undefined).
2. Sign chart across the three pieces: for $x < -1$ both factors are negative → positive quotient; for $-1 < x < 5$ the top is negative, bottom positive → negative ✓; for $x > 5$ both positive → positive.
3. Solution: $-1 < x < 5$, both ends excluded. Integers: $0, 1, 2, 3, 4$ — five of them.

**Wrong turn: clearing the denominator.** Multiplying both sides by $x + 1$ gives $x - 5 < 0$, hence "$x < 5$, infinitely many integers" — choice (E). But $x + 1$ is negative on part of the line, and the multiplication silently flipped the inequality there. Rational inequalities are sign-chart territory; the denominator never gets cleared.

**Answer: $5$ (B)**

**Example 5 · Q86 level · target 2:50**

*For real numbers $x$ and $y$, $x^2 - 8x + y^2 + 2y \le -8$. What is the maximum possible value of $x + y$?*

1. Complete both squares: $x^2 - 8x = (x-4)^2 - 16$ and $y^2 + 2y = (y+1)^2 - 1$.
2. The condition becomes $(x-4)^2 + (y+1)^2 - 17 \le -8$, i.e. $(x-4)^2 + (y+1)^2 \le 9$ — a disk centered at $(4, -1)$ with radius $3$.
3. Start from the center value $4 + (-1) = 3$; moving distance $3$ in the direction $\left(\tfrac{1}{\sqrt{2}}, \tfrac{1}{\sqrt{2}}\right)$ adds $\tfrac{3}{\sqrt{2}} + \tfrac{3}{\sqrt{2}} = 3\sqrt{2}$.
4. The maximum, attained at $\left(4 + \tfrac{3}{\sqrt{2}},\ -1 + \tfrac{3}{\sqrt{2}}\right)$, is $3 + 3\sqrt{2}$.

**Wrong turn: axis-aligned extremes.** Pushing $x$ alone to its maximum ($x = 7$, $y = -1$) gives $x + y = 6$ — a planted choice below the truth. On a disk, the extreme of $x + y$ lies along the diagonal, not along an axis; the $r\sqrt{2}$ in idea 13 is precisely the diagonal's premium over $r$.

**Answer: $3 + 3\sqrt{2}$**

## Trigger cues

- "Which of the following describes all possible values of $x$" after a linear inequality → isolate $x$; flip the symbol the moment you divide by a negative.
- Ranges for two variables, asked for greatest or least of a combination → endpoint testing (four pairs for $xy$ and $\frac{x}{y}$).
- "Least number of ... so that ... is more than ..." → strict inequality, solve, then step *past* the boundary integer.
- A rational expression compared to $0$ → sign chart on the critical points; never clear the denominator.
- "Must be true" with statements I, II, III → prove what you can; attack the rest with boundary values.
- $x^2$ and $y^2$ with linear terms under a $\le$ → complete the square and read off a disk.
- "How many integers $n$ satisfy ..." → isolate $n$ first, then count $b - a + 1$.
- "Is $a > b$?" with a quotient like $\frac{a}{b}$ given → the sign of the denominator is the whole question.

## Trap gallery

- **Forgetting the flip.** $-3x \ge 12$ gives $x \le -4$, not $x \ge -4$. Any divide-by-negative flips the symbol — and the unflipped version is always among the choices.
- **Cross-multiplying blind.** $\frac{a}{b} > 1$ with $a = -3$, $b = -2$ gives $\frac{a}{b} = 1.5$ yet $a < b$. Know the sign of $b$ first.
- **"Least times least."** In Example 3, $(-5)(-3) = 15$ is the *maximum*. Run all four endpoint products.
- **Subtracting inequalities.** $a > b$ and $c > d$ says nothing about $a - c$ vs $b - d$. Negate one, then add.
- **Reciprocating across zero.** $-\tfrac{1}{3} \le x < \tfrac{1}{2}$ (with $x \ne 0$) maps to $\frac{1}{x} \le -3$ or $\frac{1}{x} > 2$, not one interval. Split at $0$ first.
- **Stopping at the boundary.** $d > 16$ means $17$; hitting the target exactly is not "more than" it. Reread strict vs. non-strict.
- **Including an excluded point.** In $\frac{x-5}{x+1} < 0$, $x = -1$ is undefined, never a solution. Mark denominator zeros as holes.

## Speed moves

- **Endpoint grid.** For product or quotient ranges, jot the four corner values and circle the extreme — twenty seconds, no theory.
- **Test choices at the boundary.** For threshold word problems, plug the middle answer choice into the expression; one comparison tells you which way to move.
- **Convenient numbers at extremes.** For must-be-true questions, test values hugging the boundary (like $a$ just below $\sqrt{k}$) — counterexamples live at the edges.
- **Transform, then count.** $-7 \le 2n + 3 < 11$ becomes $-5 \le n < 4$, so $n \in \{-5, \dots, 3\}$: that is $3 - (-5) + 1 = 9$ integers, no listing needed.
- **Instant square completion.** Halve the linear coefficient, square it: $x^2 - 8x$ needs $+16$, $y^2 + 2y$ needs $+1$. Do it mentally before touching the constant.
- **Spot-check with one value.** After any solve, plug one number from your claimed region back in — three seconds, and it catches every flip error ever made.

## Before you drill

- I flip the inequality symbol automatically when multiplying or dividing by a negative — and spot-check one value after solving.
- I never multiply by a variable expression of unknown sign — I case-split or use a sign chart.
- I find extremes of $x \pm y$, $xy$, and $\frac{x}{y}$ from ranges by testing endpoint combinations.
- I split intervals at $0$ before taking reciprocals.
- I know strict "more than" thresholds exclude the boundary, and I check the exact-equality case.
- I can complete the square in one step and recognize $(x-h)^2 + (y-k)^2 \le r^2$ as a disk.
- I can state AM–GM with its equality condition and apply it to positives with a fixed product.
