# Absolute Value as Distance: Number-Line Reasoning with Decimals

## Why this matters

The GMAT Focus tests absolute value less as algebra and more as geometry: $|x - a|$ is the distance from $x$ to $a$, and almost every hard question in this family collapses once you read it that way. Expect tolerance bands with decimal endpoints, rounding ranges, "closer to" comparisons, and equations that hide two cases behind one pair of bars — from mid-level items up to the Q86 tier.

Ideas 1–5 install the distance dictionary — the translations that turn bars into pictures. Ideas 6–9 handle the comparison and case machinery, and 10–12 are the optimization and decimal moves the top tier is built from. The case discipline here (solve both branches, check for extraneous roots) is the same one the inequalities chapter runs on quadratics.

## The core ideas

Ideas 1–5 are the distance dictionary; 6–9 comparisons and cases; 10–12 optimization and decimals.

1. **Definition.** $|x| = x$ if $x \ge 0$ and $|x| = -x$ if $x < 0$. It is never negative, because negating a negative number produces a positive one.

2. **Distance reading.** $|a - b|$ is the distance between $a$ and $b$ on the number line. This is the single most useful translation in the topic — order inside the bars does not matter.
Check: $|-5 - 3|$? ⇒ $8$ — the distance between $-5$ and $3$.

3. **Two-point equation.** $|x - a| = d$ (with $d > 0$) means $x = a - d$ or $x = a + d$. The two solutions sit symmetrically around $a$, so their sum is $2a$ automatically.
Check: The solutions of $|x - 6| = 2$, and their sum? ⇒ $4$ and $8$; sum $12 = 2 \times 6$.

4. **Bounded band.** $|x - a| \le d \iff a - d \le x \le a + d$ — an interval centered at $a$ with radius $d$ and total length $2d$. Strict $<$ gives the same interval with open endpoints.
Check: $|x + 1| < 3$ as an interval? ⇒ $-4 < x < 2$ — centered at $-1$.

5. **Outside the band.** $|x - a| > d \iff x < a - d$ or $x > a + d$ — two rays, never one interval.

6. **Magnitude comparison.** $|x| > |y| \iff x^2 > y^2$, because squaring erases sign but preserves distance from $0$. Note that $x > y$ alone says nothing about magnitudes.
Check: $x = 1$, $y = -9$: $x > y$, but is $|x| > |y|$? ⇒ No — $1 < 81$ by squares.

7. **Rounding range.** If a value rounds to the nearest tenth as $r$, the true value $w$ satisfies $r - 0.05 \le w < r + 0.05$. The interval is half-open: exactly $r + 0.05$ rounds up to the next display.
Check: A value rounds to $2.4$. Its true range? ⇒ $2.35 \le w < 2.45$.

8. **Closer-to test.** $x$ is closer to $a$ than to $b$ exactly when $x$ lies on $a$'s side of the midpoint $\frac{a+b}{2}$.
Check: "Closer to $10$ than to $2$" means? ⇒ $x > 6$ — past the midpoint.

9. **Double-bar equations.** $|A| = k|B|$ (with $k > 0$) unpacks to $A = kB$ or $A = -kB$. If the equation also has $x$ terms *outside* the bars, solve each case and then plug candidates back — cases can produce extraneous roots.

10. **Sums of distances.** $|x - a| + |x - b|$ has minimum $|a - b|$, achieved anywhere between $a$ and $b$. With an odd number of anchor points, the sum is minimized at the median anchor.
Check: The least possible value of $|x - 3| + |x - 11|$? ⇒ $8$ — anywhere between the anchors.

11. **Extremes on intervals.** A linear expression in bounded variables hits its extreme values at endpoint combinations, so to maximize $|cx + dy|$ check the corner cases — including the most negative one.

12. **Decimal care across zero.** Subtracting a negative adds. A rise from $-4.6$ to $7.8$ is $7.8 - (-4.6) = 12.4$, not $3.2$.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*If $|x - 7| = 3$, what is the product of the two possible values of $x$?*

1. The solutions sit $3$ on either side of $7$: $x = 4$ or $x = 10$.
2. Product: $4 \times 10 = 40$.

**Wrong turn: one branch only.** Solving just $x - 7 = 3$ gives the lone value $10$ — and "the product" question then has no answer, which is the stem's built-in alarm. Bars always open into two cases; write $a \pm d$ before anything else.

**Answer: $40$**

**Example 2 · 605 level · target 1:40**

*On the number line, the distance between $y$ and $-3.2$ is exactly $5.6$. What is the sum of the two possible values of $y$?*

1. "Distance between $y$ and $-3.2$ is $5.6$" translates directly to $|y - (-3.2)| = 5.6$, i.e. $|y + 3.2| = 5.6$.
2. The two solutions sit $5.6$ on either side of the center $-3.2$: $y = -3.2 + 5.6 = 2.4$ or $y = -3.2 - 5.6 = -8.8$.
3. Sum: $2.4 + (-8.8) = -6.4$. Faster: solutions symmetric about $-3.2$ must sum to $2(-3.2) = -6.4$ — no solving needed.

**Answer: $-6.4$**

**Example 3 · 655 level · target 2:05**

*A digital scale displays weights rounded to the nearest tenth of a kilogram. If the scale displays $3.7$, which of the following could be the actual weight, in kilograms?*

*A) $3.64$  B) $3.65$  C) $3.75$  D) $3.76$  E) $3.80$*

1. Nearest-tenth rounding to $3.7$ means the true weight lies in $[3.65, 3.75)$ — radius $0.05$, right endpoint excluded.
2. Test the choices: $3.64$ rounds to $3.6$; $3.65$ rounds *up* to $3.7$ ✓; $3.75$ rounds up to $3.8$; $3.76$ and $3.80$ are farther still.

**Wrong turn: a radius of $0.1$.** Accepting anything within $0.1$ of the display admits $3.64$ and $3.76$ — both planted. The band is *half* a display step each way, and its right endpoint is open: $3.75$ belongs to $3.8$, while $3.65$ belongs to $3.7$. The two endpoints behave differently on purpose.

**Answer: $3.65$ (B)**

**Example 4 · 705 level · target 2:30**

*If $|x + 4| = 3|x - 2|$, what is the sum of all values of $x$ that satisfy the equation?*

1. Both sides are single absolute values, so unpack the sign: $x + 4 = 3(x - 2)$ or $x + 4 = -3(x - 2)$.
2. Case 1: $x + 4 = 3x - 6 \Rightarrow 2x = 10 \Rightarrow x = 5$. Check: $|9| = 3|3| = 9$. Valid.
3. Case 2: $x + 4 = -3x + 6 \Rightarrow 4x = 2 \Rightarrow x = 0.5$. Check: $|4.5| = 3|-1.5| = 4.5$. Valid.
4. Sum: $5 + 0.5 = 5.5$. Geometric read: we needed the points whose distance to $-4$ is triple their distance to $2$, and one such point lies between the anchors, one beyond $2$.

**Wrong turn: importing the symmetry shortcut.** The "solutions sum to $2a$" rule belongs to $|x - a| = d$, where both solutions share one center. Here the two cases have *different* centers, so the shortcut has nothing to grab — reach for it and you'll pick the planted $2 \times 2 = 4$ or $2 \times (-4) = -8$. Shortcuts carry their hypotheses with them.

**Answer: $5.5$**

**Example 5 · Q86 level · target 2:50**

*If $|x + 1| \le 2.5$ and $|y - 3| \le 1.2$, what is the greatest possible value of $|3x - 2y|$?*

1. Unpack each band: $-3.5 \le x \le 1.5$ and $1.8 \le y \le 4.2$.
2. Scale to the pieces you need: $-10.5 \le 3x \le 4.5$ and $3.6 \le 2y \le 8.4$.
3. The difference $3x - 2y$ is largest when $3x$ is at its max and $2y$ at its min, smallest in the reverse: it ranges from $-10.5 - 8.4 = -18.9$ up to $4.5 - 3.6 = 0.9$.
4. The absolute value takes the larger magnitude of the two ends: $|-18.9| = 18.9 > 0.9$, achieved at $x = -3.5$, $y = 4.2$.

**Wrong turn: maximizing the inside.** Pushing $3x - 2y$ as high as possible gives $0.9$ — a planted choice. The bars reward the largest *magnitude*, and the most negative corner wins here by a factor of twenty. Always price both ends of the range before taking the absolute value.

**Answer: $18.9$**

## Trigger cues

- "The distance between $x$ and $a$ is $d$" → write $|x - a| = d$; solutions are $a \pm d$.
- "Stays within $c$ of the target $t$" / "drifts by at most $c$" → $|x - t| \le c$, an interval of length $2c$.
- "The display reads $r$, rounded to the nearest tenth" → true value in $[r - 0.05,\ r + 0.05)$.
- "Closer to $a$ than to $b$" → compare $x$ with the midpoint $\frac{a+b}{2}$.
- "Sum of all possible values of $x$" after $|x - a| = d$ → answer $2a$ by symmetry — but only when both solutions share the center $a$.
- "Greatest (or least) possible value of $|\ldots|$" with bounded variables → test endpoint combinations, most negative included.
- "Least possible value of $|x-a| + |x-b| + |x-c|$" → evaluate at the median anchor.

## Trap gallery

- **Dropped branch.** Solving only $x - a = d$ and losing the negative case — always write $a \pm d$ before touching anything else.
- **Kept extraneous root.** When $x$ appears outside the bars, cases can manufacture solutions — plug every candidate back into the original equation.
- **Full-step rounding radius.** Using $0.1$ for nearest-tenth rounding — the radius is half a tenth, $0.05$, and the right endpoint is excluded ($3.75$ displays as $3.8$, not $3.7$).
- **Endpoints in strict inequalities.** Counting integers as if $<$ included the boundary — it doesn't.
- **Magnitude from order.** Concluding $|x| > |y|$ from $x > y$ — false for $x = 1$, $y = -9$; compare squares instead.
- **Subtracting across zero.** $7.8 - 4.6$ instead of $7.8 - (-4.6)$ — distances on opposite sides of $0$ add, giving $12.4$.
- **Maximizing only upward.** The winner for $|E|$ is often the most *negative* corner, as in Example 5.

## Speed moves

- **Symmetry sum.** The solutions of $|x - a| = d$ sum to $2a$; for $|x + 2.5| = 4.1$ the answer to "sum of possible values" is $-5$ with zero solving.
- **Interval overlap in one line.** Two tolerance bands overlap on $[\max(\text{lefts}),\ \min(\text{rights})]$; bands $[2.44, 2.56]$ and $[2.37, 2.47]$ share length $2.47 - 2.44 = 0.03$.
- **Sketch before casing.** For distance-comparison equations, mark the anchors on a quick number line — the picture usually shows how many solutions exist and roughly where.
- **Weighted point.** If $P$ lies between $A$ and $B$ with $AP:PB = m:n$, then $P = \frac{nA + mB}{m+n}$; for $A = -1$, $B = 5$, ratio $2:1$, $P = 3$ instantly.
- **Clear decimals.** Multiply everything by $10$, work in integers, divide back at the end — fewer decimal-point slips under time pressure.
- **Probe the boundary.** For "is $x$ closer to $10$ than to $2$?", trying $x = 5.9$ and $x = 6.1$ exposes the boundary at $6$ in seconds.

## Before you drill

- I can convert $|x - a| \le d$, $< d$, and $> d$ into the right interval or rays without hesitation.
- I know the two solutions of $|x - a| = d$ average to $a$, so their sum is $2a$ — and I know when that shortcut does *not* apply.
- I can state the true-value range behind a rounded decimal, with the correct open and closed endpoints.
- I translate "closer to $a$ than to $b$" into a midpoint comparison instantly.
- I check every candidate root when variables sit outside the absolute-value bars.
- I compare magnitudes of signed numbers by squaring, never from the raw inequality.
- I test all endpoint combinations — especially the most negative — when maximizing an absolute value.
