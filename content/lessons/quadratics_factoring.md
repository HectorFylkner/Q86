# Quadratics and Factoring: Reading Structure Before You Solve

## Why this matters

The GMAT Focus Edition tests quadratics as pattern recognition, not "solve for $x$" chores. At the Q86 tier the quadratic arrives disguised — a rectangle's area, a symmetric expression, a quartic that is secretly a square — and rewards whoever sees the factored structure in seconds. Every question here falls in under two minutes with the toolkit below.

Ideas 1–4 are the factoring engine; 5–7 the named patterns (perfect squares, symmetric identities, the discriminant) that the exam disguises hardest; 8–9 the two case-discipline rules shared with the must-be-true chapter. Linear systems are assumed; the inequalities chapter builds directly on the sign-chart thinking practiced here.

## The core ideas

Ideas 1–4 are the engine; 5–7 the named patterns; 8–9 the case discipline.

1. **Zero-product property.** If $pq = 0$, then $p = 0$ or $q = 0$. This is *why* factoring solves quadratics: it converts one hard equation into two easy ones.

2. **Factoring $x^2 + bx + c$.** Find two numbers with product $c$ and sum $b$. Sign logic: positive $c$ means same-sign factors (matching $b$); negative $c$ means opposite signs, the bigger factor taking the sign of $b$.
Check: Factor $x^2 - 7x + 10$. ⇒ $(x - 2)(x - 5)$ — product $10$, sum $-7$.

3. **Vieta's relations.** For $ax^2 + bx + c = 0$ with roots $r$ and $s$: $r + s = -\dfrac{b}{a}$ and $rs = \dfrac{c}{a}$, seen by expanding $a(x - r)(x - s)$. Sum-of-roots and product-of-roots questions never require the roots themselves.
Check: For $x^2 - 9x + 14 = 0$, the sum and product of the roots? ⇒ $9$ and $14$ — no solving.

4. **Difference of squares.** $x^2 - y^2 = (x + y)(x - y)$, true because the cross terms cancel. It converts one quadratic fact into two linear ones — and it computes.
Check: $41^2 - 39^2$? ⇒ $(41+39)(41-39) = 80 \times 2 = 160$.

5. **Perfect square trinomials.** $(x \pm k)^2 = x^2 \pm 2kx + k^2$; spot them because the constant equals the square of half the middle coefficient. Set equal to zero, a perfect square has exactly **one** root — the fact that decides "how many values of $x$" stems.
Check: The solutions of $x^2 - 10x + 25 = 0$? ⇒ exactly one: $x = 5$, since it is $(x-5)^2 = 0$.

6. **The squared-sum identity.** $(x \pm y)^2 = x^2 \pm 2xy + y^2$. The case $\left(x + \dfrac{1}{x}\right)^2 = x^2 + 2 + \dfrac{1}{x^2}$ appears constantly — the given equation is meant to be squared, not solved.

7. **Counting roots with the discriminant.** $ax^2 + bx + c = 0$ has two distinct real roots when $b^2 - 4ac > 0$, one repeated root when it equals $0$, none when negative.
Check: How many real roots does $x^2 + 4x + 5 = 0$ have? ⇒ None — $16 - 20 < 0$.

8. **Never divide by a variable that could be zero.** Given $x^2 = 7x$, factor: $x(x - 7) = 0$. Dividing by $x$ silently deletes the root $x = 0$.
Check: All solutions of $x^2 = 7x$? ⇒ $0$ and $7$.

9. **Square-root both sides carefully.** $(x - a)^2 = k$ with $k > 0$ gives $x = a \pm \sqrt{k}$ — two values, whose sum is $2a$ automatically.
Check: The solutions of $(x - 5)^2 = 36$, and their sum? ⇒ $11$ and $-1$; sum $10$.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*If $r$ and $s$ are the roots of $x^2 - 7x + 10 = 0$, what is the value of $r + s$?*

1. Vieta: the sum of the roots is minus the middle coefficient (with $a = 1$): $r + s = 7$.
2. Confirmation, if wanted: the roots are $2$ and $5$ — but the question never needed them.

**Answer: $7$**

**Example 2 · 605 level · target 1:40**

*If $x^2 + 3x - 40 = 0$ and $x > 0$, what is the value of $x$?*

1. The constant $-40$ is negative, so the factors have opposite signs; the $+3$ says the larger factor is positive.
2. A factor pair of $40$ differing by $3$: $8$ and $5$.
3. Factor: $x^2 + 3x - 40 = (x + 8)(x - 5) = 0$, so $x = -8$ or $x = 5$.
4. The constraint $x > 0$ keeps only $x = 5$.

**Answer: $5$**

**Example 3 · 655 level · target 2:05**

*A rectangular garden plot is $5$ meters longer than it is wide. If the plot's area is $84$ square meters, what is its width, in meters?*

1. Let the width be $w$; then the length is $w + 5$ and the area gives $w(w + 5) = 84$.
2. Standard form: $w^2 + 5w - 84 = 0$.
3. Opposite-sign factors of $84$ differing by $5$: $12$ and $7$, so $(w + 12)(w - 7) = 0$.
4. The roots are $-12$ and $7$; a width must be positive, so $w = 7$. Check: $7 \times 12 = 84$.

**Wrong turn: answering the other side.** The length, $12$, is planted beside the width in every version of this stem — and so is the perimeter, $38$. The quadratic hands you a number; the final sentence of the stem decides whether that number is the answer or one step from it.

**Answer: $7$**

**Example 4 · 705 level · target 2:30**

*If $x + \dfrac{1}{x} = 4$, what is the value of $x^2 + \dfrac{1}{x^2}$?*

*A) $12$  B) $14$  C) $16$  D) $18$  E) $20$*

1. Square the given, don't solve it: $\left(x + \dfrac{1}{x}\right)^2 = x^2 + 2 + \dfrac{1}{x^2} = 16$.
2. Subtract the cross term: $x^2 + \dfrac{1}{x^2} = 16 - 2 = 14$.

**Wrong turn: solving for $x$.** The quadratic $x^2 - 4x + 1 = 0$ gives $x = 2 \pm \sqrt{3}$, and squaring *that* is a minute of radical arithmetic with two chances to slip — landing, if done perfectly, on the same $14$. The identity route is three seconds. (And $16$, the unsubtracted square, plus $18$, the $n^2 + 2$ of the *minus* version, are both planted.)

**Answer: $14$ (B)**

**Example 5 · Q86 level · target 2:50**

*If $x^2 - 6x + 2 = 0$, what is the value of $x^4 - 12x^3 + 36x^2$?*

1. Solving directly gives irrational roots $3 \pm \sqrt{7}$ — a signal the question wants structure, not roots.
2. Rewrite the given equation as $x^2 - 6x = -2$.
3. Recognize the target as a perfect square: $x^4 - 12x^3 + 36x^2 = \left(x^2 - 6x\right)^2$.
4. Substitute: $\left(x^2 - 6x\right)^2 = (-2)^2 = 4$. Both roots give the same value.

**Wrong turn: grinding the quartic.** Computing $(3 + \sqrt{7})^4$ term by term is the intended punishment path — long, error-prone, and unnecessary. Irrational roots on a GMAT quadratic are almost always a message: the target expression is built from the *left side* of the given equation. Hunt for the disguise before you reach for the formula.

**Answer: $4$**

## Trigger cues

- "What is the **sum** (or **product**) of the possible values of $x$?" → Vieta immediately; do not find the roots.
- "$x + y = \ldots$ and $x^2 - y^2 = \ldots$" → factor and divide: $x - y = \dfrac{x^2 - y^2}{x + y}$.
- "Length is $k$ more than width, area is $A$" → set up $w(w + k) = A$, factor, discard the negative root.
- "$x + \dfrac{1}{x} = n$, find $x^2 + \dfrac{1}{x^2}$" → square the given: the answer is $n^2 - 2$ (and $n^2 + 2$ for the minus version).
- "Has two **distinct integer** roots" with a fixed constant term → list factor pairs of the constant; the possible middle coefficients are minus the pair sums.
- A quartic built from a quadratic (Example 5) → isolate $x^2 + bx$ from the given and hunt for its square in the target.
- "$x^2 = cx$" or any equation where every term has an $x$ → factor out $x$; expect two answers, one of them $0$.
- Irrational roots on a "find the value" stem → stop solving; the target is a function of the given equation's left side.

## Trap gallery

- **Dividing by the variable.** Turning $x^2 = 7x$ into $x = 7$ loses $x = 0$ — and turns "how many solutions" answers wrong by one. Factor, never divide.
- **Forgetting the negative square root.** $(x - 5)^2 = 36$ has solutions $11$ *and* $-1$; the sum is $10$, not $11$. Write $x - 5 = \pm 6$ every time.
- **Answering the root instead of the question.** Example 3's quadratic gives $w = 7$, but the stem could ask for the *length* ($12$) or the perimeter. Reread the final sentence before committing.
- **Merging solution sets carelessly.** One fact may give $x \in \{0, 5\}$ and another $x \in \{5, -6\}$; together they force $x = 5$ — solve each fully, then intersect, rather than assuming they agree.
- **Giving a perfect square trinomial two roots.** $x^2 - 10x + 25 = 0$ means $(x - 5)^2 = 0$: exactly one value. Check whether $c = \left(\dfrac{b}{2}\right)^2$ before counting solutions.
- **Sign slips in Vieta.** For $x^2 - 9x + 14 = 0$ the root sum is $+9$, not $-9$. The sum is *minus* the middle coefficient (when $a = 1$).

## Speed moves

- **Work backward from the answer choices.** For $x^2 + 3x - 40 = 0$, plugging the choice $x = 5$ gives $25 + 15 - 40 = 0$ — done, no factoring required.
- **Factor-pair scan for word problems.** "Area $84$, sides differ by $5$" → scan factor pairs of $84$ ($6 \times 14$, $7 \times 12$, …) and grab the pair with the right gap: $7 \times 12$.
- **Prime difference of squares.** If $x^2 - y^2 = 13$ (prime) with $x, y$ positive integers, then $x - y = 1$ and $x + y = 13$ are forced: $x = 7$, $y = 6$ instantly.
- **Shift roots without solving.** If $x^2 - 9x + 14 = 0$ has roots $2$ and $7$, the equation with roots $3$ larger has sum $15$ and product $50$: $x^2 - 15x + 50 = 0$. Vieta builds it directly.
- **Square the given, don't solve it.** Any $x \pm \dfrac{1}{x}$ or $x + y$ prompt with a squared target: square the known equation and rearrange — solving for $x$ wastes a minute.

## Before you drill

1. I can factor $x^2 + bx + c$ in under ten seconds using product-and-sum with sign logic.
2. I can state Vieta's formulas and use them without finding roots.
3. I expand $(x \pm y)^2$ and factor $x^2 - y^2$ on sight, in both directions.
4. Given $x + \dfrac{1}{x}$, I produce $x^2 + \dfrac{1}{x^2}$ by squaring, not solving.
5. I never divide an equation by a variable — I move terms over and factor instead.
6. I generate both values from $(x - a)^2 = k$, then check which ones the constraints allow.
7. I can tell from $b^2 - 4ac$ or a perfect-square pattern whether a quadratic pins down one value of $x$ or two.
8. When roots come out irrational, I stop solving and look for the target hidden in the given equation's structure.
