# Exponents and Roots: Power Rules, Sign Traps, and Hidden Quadratics

## Why this matters

Exponent and root questions on the GMAT Focus Edition are rarely about raw computation — they test whether you can force every quantity into one common base and whether you respect the cases (zero, one, negatives, fractions between 0 and 1) that break the "obvious" algebraic move. At the Q86 tier this topic appears two ways: fast conversions that should take under 90 seconds, and structural items built entirely around a lost sign or a lost solution. The rules are few; the discipline in applying them is the whole game.

Ideas 1–7 are the mechanical rules — they should run without thought. Ideas 8–14 are where the points actually live: the case discipline around signs, ranges, and hidden quadratics. Idea 15 is the memorized ladder that turns hard stems into bookkeeping. This chapter leans on prime factorization for its common-base habit and feeds the inequalities chapter its range-splitting logic.

## The core ideas

Ideas 1–7 are the mechanics; 8–14 the case discipline; 15 the memory work.

1. **Product rule:** $a^{m} \cdot a^{n} = a^{m+n}$ — multiplying stacks of the same factor just combines the counts.

2. **Quotient rule:** $\dfrac{a^{m}}{a^{n}} = a^{m-n}$ — cancellation removes $n$ copies of the factor from the top.

3. **Power rule:** $(a^{m})^{n} = a^{mn}$ — $n$ groups of $m$ factors is $mn$ factors. Contrast with $a^{m^{n}}$, which towers instead.
Check: $(2^{3})^{2}$ versus $2^{3^{2}}$? ⇒ $2^{6} = 64$ versus $2^{9} = 512$.

4. **Zero and negative exponents:** $a^{0} = 1$ for $a \ne 0$, and $a^{-n} = \dfrac{1}{a^{n}}$; a negative exponent on a fraction flips it, so $\left(\dfrac{1}{2}\right)^{-3} = 2^{3} = 8$.
Check: $\left(\dfrac{2}{3}\right)^{-2}$? ⇒ flip and square: $\dfrac{9}{4}$.

5. **Fractional exponents:** $a^{1/n} = \sqrt[n]{a}$ and $a^{m/n} = \left(\sqrt[n]{a}\right)^{m}$ — take the root first to keep numbers small.
Check: $8^{5/3}$? ⇒ $\left(\sqrt[3]{8}\right)^{5} = 2^{5} = 32$.

6. **Common-base conversion:** rewrite composite bases as prime powers before doing anything else: $4 = 2^{2}$, $8 = 2^{3}$, $9 = 3^{2}$, $27 = 3^{3}$, $125 = 5^{3}$. Once bases match and the base is positive and not $1$, exponents can be equated: $b^{p} = b^{q} \Rightarrow p = q$.
Check: Solve $4^{x} = 8^{3}$. ⇒ $2^{2x} = 2^{9}$, so $x = \dfrac{9}{2}$.

7. **Repeated addition of the same power:** $n$ identical copies factor once, so $a^{x} + a^{x} + \cdots + a^{x} = n \cdot a^{x}$; when $n$ equals the base this collapses beautifully.
Check: $2^{x} + 2^{x}$? ⇒ $2 \cdot 2^{x} = 2^{x+1}$ — never $2^{2x}$.

8. **Even powers erase sign:** $\sqrt{x^{2}} = |x|$, not $x$ — squaring maps $4$ and $-4$ to the same place, so the square root can only recover the magnitude.
Check: $\sqrt{(-6)^{2}}$? ⇒ $6$ — the magnitude, not the original $-6$.

9. **Never divide by a variable that might be zero:** $x^{2} = 2x$ has solutions $x = 0$ and $x = 2$; dividing both sides by $x$ silently deletes the first. Move everything to one side and factor instead.

10. **Radical arithmetic:** $\sqrt{ab} = \sqrt{a}\sqrt{b}$ for nonnegative $a, b$, so simplify by extracting the largest perfect square: $\sqrt{75} = 5\sqrt{3}$. But roots do not split over addition: $\sqrt{9} + \sqrt{16} = 7 \ne \sqrt{25} = 5$.

11. **Sign of a power:** a positive base gives a positive result for every exponent; a negative base gives positive for even integer exponents and negative for odd ones. So $(-5)^{n} > 0$ exactly when $n$ is even.

12. **Ordering flips between 0 and 1:** if $0 < x < 1$, then $x^{2} < x < \sqrt{x}$; if $x > 1$ the chain reverses. Powers push numbers toward $0$ or away from $1$ — never assume "squaring makes bigger."
Check: For $x = \dfrac{1}{4}$, rank $x^{2}$, $x$, $\sqrt{x}$. ⇒ $\dfrac{1}{16} < \dfrac{1}{4} < \dfrac{1}{2}$.

13. **When does $w^{k} = 1$?** Three routes: $w = 1$ (any $k$), $k = 0$ (any $w \ne 0$), or $w = -1$ with $k$ even. Any equation of the form $x^{f(x)} = 1$ must be checked against all three.

14. **Hidden quadratics:** since $a^{2x} = (a^{x})^{2}$, any equation mixing $a^{2x}$ and $a^{x}$ is a quadratic in disguise — substitute $y = a^{x}$, remembering $y > 0$.

15. **Memorized ladder:** know $2^{1}$ through $2^{12} = 4096$, $3^{1}$ through $3^{6} = 729$, squares to $25^{2}$, cubes to $10^{3}$. Recognizing $4096 = 2^{12} = 4^{6} = 8^{4} = 16^{3} = 64^{2}$ on sight converts a hard question into bookkeeping.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*What is the value of $64^{2/3}$?*

1. Root first: $\sqrt[3]{64} = 4$.
2. Then the power: $4^{2} = 16$.

**Wrong turn: power first.** $64^{2} = 4096$, then a cube root of $4096$ — the same answer reached the long way, with real error risk. $a^{m/n}$ always allows root-first; take the gift.

**Answer: $16$**

**Example 2 · 605 level · target 1:40**

*If $\dfrac{25^{4} \cdot 125^{3}}{5^{6}} = 5^{k}$, what is the value of $k$?*

1. Convert every base to the common prime: $25 = 5^{2}$ and $125 = 5^{3}$.
2. Apply the power rule to the numerator: $(5^{2})^{4} \cdot (5^{3})^{3} = 5^{8} \cdot 5^{9} = 5^{17}$.
3. Apply the quotient rule: $\dfrac{5^{17}}{5^{6}} = 5^{11}$.

**Answer: $k = 11$**

**Example 3 · 655 level · target 2:05**

*If $3^{x} + 3^{x} + 3^{x} = \dfrac{81^{5}}{9^{2}}$, what is the value of $x$?*

1. The left side is three identical copies of $3^{x}$, so it equals $3 \cdot 3^{x} = 3^{x+1}$.
2. Rewrite the right side over base $3$: $81 = 3^{4}$ and $9 = 3^{2}$, so $\dfrac{(3^{4})^{5}}{(3^{2})^{2}} = \dfrac{3^{20}}{3^{4}} = 3^{16}$.
3. The bases match and $3$ is neither $0$ nor $\pm 1$, so equate exponents: $x + 1 = 16$.

**Wrong turn: adding exponents across the plus signs.** $3^{x} + 3^{x} + 3^{x}$ is not $3^{3x}$ — the product rule lives on multiplication only. Check with numbers: $8 + 8 = 16 = 2^{4}$, not $2^{6}$. Identical *added* copies factor to $n \cdot a^{x}$.

**Answer: $x = 15$**

**Example 4 · 705 level · target 2:30**

*If $0 < x < 1$, which of the following lists $x^{2}$, $x$, $\sqrt{x}$, and $\dfrac{1}{x}$ in increasing order?*

*A) $x^2, x, \sqrt{x}, \frac{1}{x}$  B) $x, x^2, \sqrt{x}, \frac{1}{x}$  C) $\frac{1}{x}, \sqrt{x}, x, x^2$  D) $x^2, \sqrt{x}, x, \frac{1}{x}$  E) $\sqrt{x}, x, x^2, \frac{1}{x}$*

1. On $(0, 1)$, powers shrink and roots grow: $x^{2} < x < \sqrt{x}$, all of them below $1$.
2. The reciprocal of a number in $(0,1)$ exceeds $1$: $\dfrac{1}{x} > 1$ tops the list.
3. Confirm with $x = \dfrac{1}{4}$: $\dfrac{1}{16} < \dfrac{1}{4} < \dfrac{1}{2} < 4$. Order: $x^{2}, x, \sqrt{x}, \dfrac{1}{x}$.

**Wrong turn: importing the $x > 1$ ordering.** For $x > 1$ squaring grows and rooting shrinks, and choice (E) is that ordering pasted here. The number line splits at $0$ and $1$ for every power question; one benchmark value inside the active region settles the direction in seconds.

**Answer: (A)**

**Example 5 · Q86 level · target 2:50**

*If $4^{x} - 10 \cdot 2^{x} + 16 = 0$, what is the sum of all possible values of $x$?*

1. Spot the disguise: $4^{x} = (2^{2})^{x} = (2^{x})^{2}$, so the equation is quadratic in $2^{x}$.
2. Substitute $y = 2^{x}$, noting $y > 0$: the equation becomes $y^{2} - 10y + 16 = 0$.
3. Factor: $(y - 2)(y - 8) = 0$, so $y = 2$ or $y = 8$. Both are positive, so both are legitimate values of $2^{x}$.
4. Undo the substitution: $2^{x} = 2$ gives $x = 1$; $2^{x} = 8 = 2^{3}$ gives $x = 3$.
5. The sum of all possible values is $1 + 3 = 4$.

**Wrong turn: answering in the wrong variable.** Summing $y$'s roots — $2 + 8 = 10$ — is the planted choice. The substitution was scaffolding; the question asks about $x$, and every hidden-quadratic stem plants the $y$-level answer for solvers who forget to climb back down.

**Answer: $4$**

## Trigger cues

- "Simplify $\dfrac{9^{a} \cdot 27^{b}}{3^{c}}$" or any mix of related bases → convert everything to the smallest prime base first, then add and subtract exponents.
- The same power added to itself several times → count the copies and factor: $n$ copies of $a^{x}$ is $n \cdot a^{x}$.
- A fact involving $\sqrt{x^{2}}$, $x^{2}$, or $x^{4}$ → solve for $|x|$, then test the positive and negative candidates separately before concluding anything about $x$.
- Both $a^{2x}$ and $a^{x}$ (or $4^{x}$ and $2^{x}$) in one equation → substitute $y = a^{x}$ and solve the quadratic; answer in $x$, not $y$.
- "Doubles every $h$ hours" or "cut in half every $h$ hours" → model as $P \cdot 2^{t/h}$ or $P \cdot 2^{-t/h}$ and compare exponents, never raw amounts.
- "Is $\sqrt{x} > x$?" or any power-ordering question → split the number line at $0$ and $1$ and test one value in each region.
- $x^{y} = 4096$ (or another power-rich constant) with integer constraints → write the prime factorization and list every valid $(x, y)$ pair before concluding uniqueness.

## Trap gallery

- **Dividing by the variable.** Cancelling $x$ from $x^{2} = 2x$ kills the solution $x = 0$; factor $x(x - 2) = 0$ instead.
- **$\sqrt{x^{2}} = x$.** It is $|x|$; a fact that pins down $|x| = 4$ still leaves two values of $x^{3}$.
- **Equating exponents too early.** $b^{x} = b^{2x - 6}$ forces $x = 6$ only if $b \ne 1$ (and $b \ne 0, -1$); if $b = 1$, every $x$ works.
- **Adding exponents across a plus sign.** $2^{x} + 2^{x}$ is $2^{x+1}$, not $2^{2x}$ — check with $8 + 8 = 16$.
- **Tower confusion.** $(a^{m})^{n}$ multiplies exponents, $a^{m^{n}}$ does not; $(2^{3})^{2} = 64$ while $2^{3^{2}} = 512$.
- **Assuming one representation.** $x^{y} = 4096$ alone allows $2^{12}$, $4^{6}$, $8^{4}$, $16^{3}$, and $64^{2}$.
- **Keeping impossible roots.** After substituting $y = 2^{x}$, a root like $y = -2$ must be discarded, since $2^{x} > 0$ for all real $x$.
- **"Squaring makes bigger."** False on $(0,1)$, where $x^{2} < x$; also, $x^{2} > x$ holds for every negative $x$, not just $x > 1$.

## Speed moves

- **Prime-ize on sight.** The instant you see mixed bases, rewrite in primes; Example 2 becomes pure exponent arithmetic $8 + 9 - 6 = 11$ with no large numbers ever computed.
- **Work in exponents, not amounts.** On a scale where each unit multiplies energy by $9$, a reading gap of $1.5$ means a ratio of $9^{1.5} = 9 \cdot 3 = 27$ — three seconds, no calculator.
- **Benchmark values for orderings.** Test $x = \dfrac{1}{4}$ and $x = 4$; between them they expose how $x$, $x^{2}$, and $\sqrt{x}$ rank in each region.
- **Test small exponents from the choices.** GMAT exponent answers are almost always small integers, so plugging $x = 1, 2, 3$ into something like $4^{x} - 10 \cdot 2^{x} + 16 = 0$ can beat formal factoring.
- **Use the memorized ladder as a decoder.** Seeing $729$, jump straight to $3^{6}$ and read off representations like $9^{3}$ and $27^{2}$ from the factor pairs of $6$.

## Before you drill

1. I can convert $4, 8, 9, 16, 25, 27, 32, 64, 81, 125$ to prime powers without hesitation.
2. I can state why $\sqrt{x^{2}} = |x|$ and what that does to any conclusion about $x$ itself.
3. I can collapse $n$ identical copies of $a^{x}$ into a single power in one line.
4. I can substitute $y = a^{x}$ in a hidden quadratic, reject any nonpositive root automatically, and answer in $x$.
5. I can rank $x$, $x^{2}$, $\sqrt{x}$, and $\frac{1}{x}$ on $0 < x < 1$ and on $x > 1$ without plugging in.
6. I can list every case that makes $w^{k} = 1$ and every base value that blocks equating exponents.
7. I can simplify any $\sqrt{N}$ by pulling out the largest perfect square factor.
