# Quadratics and Factoring: Reading Structure Before You Solve

## Why this matters

The GMAT Focus Edition tests quadratics as pattern recognition, not "solve for $x$" chores. At the Q86 level the quadratic arrives disguised — a rectangle's area, a symmetric expression, a data sufficiency statement with two roots — and rewards whoever sees the factored structure in seconds. Every question here falls in under two minutes with the toolkit below.

## The core ideas

1. **Zero-product property.** If $pq = 0$, then $p = 0$ or $q = 0$. This is *why* factoring solves quadratics: it converts one hard equation into two easy ones.
2. **Factoring $x^2 + bx + c$.** Find two numbers with product $c$ and sum $b$: $x^2 - 7x + 10 = (x - 2)(x - 5)$. Sign logic: positive $c$ means same-sign factors (matching $b$); negative $c$ means opposite signs, the bigger factor taking the sign of $b$.
3. **Vieta's relations.** For $ax^2 + bx + c = 0$ with roots $r$ and $s$: $r + s = -\dfrac{b}{a}$ and $rs = \dfrac{c}{a}$, seen by expanding $a(x - r)(x - s)$. Sum-of-roots and product-of-roots questions never require the roots themselves.
4. **Difference of squares.** $x^2 - y^2 = (x + y)(x - y)$, true because the cross terms cancel. It converts one quadratic fact into two linear ones.
5. **Perfect square trinomials.** $(x \pm k)^2 = x^2 \pm 2kx + k^2$; spot them because the constant equals the square of half the middle coefficient. Set equal to zero, a perfect square has exactly **one** root — critical in data sufficiency.
6. **The squared-sum identity.** $(x \pm y)^2 = x^2 \pm 2xy + y^2$. The case $\left(x + \dfrac{1}{x}\right)^2 = x^2 + 2 + \dfrac{1}{x^2}$ appears constantly: if $x + \dfrac{1}{x} = 4$, then $x^2 + \dfrac{1}{x^2} = 4^2 - 2 = 14$, no solving needed.
7. **Counting roots with the discriminant.** $ax^2 + bx + c = 0$ has two distinct real roots when $b^2 - 4ac > 0$, one repeated root when it equals $0$, none when negative: $x^2 + 4x + 5 = 0$ has no real roots since $16 - 20 < 0$.
8. **Never divide by a variable that could be zero.** Given $x^2 = 7x$, factor: $x(x - 7) = 0$, so $x = 0$ or $x = 7$. Dividing by $x$ silently deletes the root $x = 0$.
9. **Square-root both sides carefully.** $(x - a)^2 = k$ with $k > 0$ gives $x = a \pm \sqrt{k}$ — two values, whose sum is $2a$ automatically.

## Worked examples

**Example 1**

*If $x^2 + 3x - 40 = 0$ and $x > 0$, what is the value of $x$?*

1. The constant $-40$ is negative, so the factors have opposite signs; the $+3$ says the larger factor is positive.
2. A factor pair of $40$ differing by $3$: $8$ and $5$.
3. Factor: $x^2 + 3x - 40 = (x + 8)(x - 5) = 0$, so $x = -8$ or $x = 5$.
4. The constraint $x > 0$ keeps only $x = 5$.

**Answer: $5$**

**Example 2**

*A rectangular garden plot is $5$ meters longer than it is wide. If the plot's area is $84$ square meters, what is its width, in meters?*

1. Let the width be $w$; then the length is $w + 5$ and the area gives $w(w + 5) = 84$.
2. Standard form: $w^2 + 5w - 84 = 0$.
3. Opposite-sign factors of $84$ differing by $5$: $12$ and $7$, so $(w + 12)(w - 7) = 0$.
4. The roots are $-12$ and $7$; a width must be positive, so $w = 7$. Check: $7 \times 12 = 84$.

**Answer: $7$**

**Example 3**

*If $x^2 - 6x + 2 = 0$, what is the value of $x^4 - 12x^3 + 36x^2$?*

1. Solving directly gives irrational roots $3 \pm \sqrt{7}$ — a signal the question wants structure, not roots.
2. Rewrite the given equation as $x^2 - 6x = -2$.
3. Recognize the target as a perfect square: $x^4 - 12x^3 + 36x^2 = \left(x^2 - 6x\right)^2$.
4. Substitute: $\left(x^2 - 6x\right)^2 = (-2)^2 = 4$. Both roots give the same value.

**Answer: $4$**

## Trigger cues

- "What is the **sum** (or **product**) of the possible values of $x$?" → Vieta immediately; do not find the roots.
- "$x + y = \ldots$ and $x^2 - y^2 = \ldots$" → factor and divide: $x - y = \dfrac{x^2 - y^2}{x + y}$.
- "Length is $k$ more than width, area is $A$" → set up $w(w + k) = A$, factor, discard the negative root.
- "$x + \dfrac{1}{x} = n$, find $x^2 + \dfrac{1}{x^2}$" → square the given: the answer is $n^2 - 2$ (and $n^2 + 2$ for the minus version).
- "Has two **distinct integer** roots" with a fixed constant term → list factor pairs of the constant; the possible middle coefficients are minus the pair sums.
- A quartic built from a quadratic (Example 3) → isolate $x^2 + bx$ from the given and hunt for its square in the target.
- "$x^2 = cx$" or any equation where every term has an $x$ → factor out $x$; expect two answers, one of them $0$.

## Trap gallery

- **Dividing by the variable.** Turning $x^2 = 7x$ into $x = 7$ loses $x = 0$; in data sufficiency this turns "two values" into a false "sufficient." Fix: factor, never divide.
- **Forgetting the negative square root.** $(x - 5)^2 = 36$ has solutions $11$ *and* $-1$; the sum is $10$, not $11$. Fix: write $x - 5 = \pm 6$ every time.
- **Answering the root instead of the question.** Example 2's quadratic gives $w = 7$, but a twin question could ask for the *length* ($12$) or the perimeter. Fix: reread the final sentence before committing.
- **Assuming two DS statements must agree.** Statement (1) may give $x \in \{0, 5\}$ and statement (2) $x \in \{5, -6\}$; only together do they force $x = 5$. Fix: solve each fully, then intersect.
- **Giving a perfect square trinomial two roots.** $x^2 - 10x + 25 = 0$ means $(x - 5)^2 = 0$: exactly one value, which can make a lone statement sufficient. Fix: check whether $c = \left(\dfrac{b}{2}\right)^2$.
- **Sign slips in Vieta.** For $x^2 - 9x + 14 = 0$ the root sum is $+9$, not $-9$. Fix: the sum is *minus* the middle coefficient (when $a = 1$).

## Speed moves

- **test the answer choices from the answer choices.** For $x^2 + 3x - 40 = 0$, plugging the choice $x = 5$ gives $25 + 15 - 40 = 0$ — done, no factoring required.
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
7. I can tell from $b^2 - 4ac$ or a perfect-square pattern whether a quadratic pins down one value of $x$ — the deciding fact in most DS quadratics.
