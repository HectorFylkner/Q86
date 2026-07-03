# Algebraic Translation: Turning Sentences into Equations You Can Trust

## Why this matters
Nearly every word problem on the GMAT Focus Edition lives or dies at the translation step: if the equation is right, the algebra is routine; if it is wrong, no amount of careful solving saves you. At the Q86 level the exam tests translation with word-order traps ("difference of $y$ and $x$"), inequality phrasing ("at least as large as"), hidden integer constraints that make one equation act like two, and sufficiency questions where you must decide whether a setup *forces* a unique answer. This chapter builds a dictionary you apply mechanically, so your working memory stays free for the real decisions.

## The core ideas
1. **The dictionary.** "Sum of $a$ and $b$" $\to a+b$; "difference of $a$ and $b$" $\to a-b$ in that order; "product" $\to ab$; "quotient of $a$ and $b$" $\to \frac{a}{b}$; "is / equals / the result is" $\to =$. Translate phrase by phrase, in the order written, because each noun phrase is one algebraic object.
2. **"Less than" reverses.** "$k$ less than $m$" $\to m-k$, not $k-m$; "$k$ more than $m$" $\to m+k$. The phrase names an amount removed *from* $m$, so $m$ comes first.
3. **Inequality words.** "At least" $\to \ge$; "at most" $\to \le$; "more than" $\to >$; "fewer than" $\to <$; "$n$ differs from $10$ by more than $2$" $\to |n-10|>2$. Each phrase maps to exactly one symbol — never soften $\ge$ to $>$.
4. **Integer endpoints.** If $x \ge \frac{8}{3}$, the smallest integer is $3$ (round up); if $n < 8.5$, the greatest integer is $8$ (step down). Strict versus non-strict decides whether the boundary itself counts.
5. **One variable when quantities are linked.** "Twice as many paperbacks as hardcovers" $\to p = 2h$; write everything in $h$ so one condition yields one solvable equation. Fewer variables means fewer places to slip.
6. **Same quantity, two expressions.** Money problems with "has $\$7$ left" or "needs $\$5$ more" translate as the same total written twice: $M = np + \text{leftover}$ and $M = mp - \text{shortfall}$. Set the expressions equal because both describe one fixed number.
7. **Fixed pool split.** A total $T$ shared by $n$ people gives each $\frac{T}{n}$; "each of $4$ gets $d$ more than each of $10$ would" $\to \frac{T}{4} = \frac{T}{10} + d$. The pool doesn't change, only the divisor does.
8. **Age shift.** "In $t$ years" adds $t$ to *every* person's age: if $M = 3s$ now and $M + 12 = 2(s+12)$ later, both ages moved. Time passes for everyone at once.
9. **Sum and difference.** If $x+y=S$ and $x-y=D$, then $x = \frac{S+D}{2}$ and $y = \frac{S-D}{2}$. Adding the equations kills $y$; subtracting kills $x$.
10. **Pairwise sums.** Given $a+b$, $a+c$, $b+c$, add all three to get $2(a+b+c)$; halve, then subtract the pair sum missing the variable you want. Each variable appears in exactly two of the three sums.
11. **Consistency of a third equation.** Two independent linear equations in $x, y$ fix a unique point; a third equation "holds automatically" exactly when that point satisfies it — solve the $2\times 2$ system and substitute.
12. **Digits are coefficients.** A three-digit number is $100a + 10b + c$; reversing gives $100c + 10b + a$, so the change is $99(c-a)$. An increase of $297$ means $c - a = \frac{297}{99} = 3$.
13. **Integer constraints collapse equations.** One equation like $3a + 8p = 37$ with $a, p$ positive integers may have a *unique* solution — enumerate using divisibility or a mod check. On sufficiency questions, "one equation, two unknowns" is only insufficient by default; positivity and integrality can rescue it, so always test before declaring insufficient.

## Worked examples

**Example 1**
*When $5$ is subtracted from four times a number $n$, the result equals the number increased by $13$. What is $n$?*

1. Translate the left phrase: "four times $n$" is $4n$; subtracting $5$ gives $4n - 5$.
2. Translate the right phrase: "the number increased by $13$" is $n + 13$.
3. "The result equals" joins them: $4n - 5 = n + 13$.
4. Subtract $n$ and add $5$: $3n = 18$, so $n = 6$. Check in words: four times $6$ is $24$, minus $5$ is $19$, and $6 + 13 = 19$.

**Answer: $n = 6$**

**Example 2**
*Every poster at a shop costs the same whole-dollar price. If Deshi buys $6$ posters, he will have $\$9$ left over; to buy $9$ posters, he would need $\$12$ more than he has. How much money does Deshi have?*

1. Let $M$ be Deshi's money and $p$ the price per poster. His money is one fixed number, so write it two ways.
2. "Buys $6$ posters with $\$9$ left" means $M = 6p + 9$.
3. "Needs $\$12$ more for $9$ posters" means $M + 12 = 9p$, i.e. $M = 9p - 12$.
4. Set the expressions equal: $6p + 9 = 9p - 12$, so $3p = 21$ and $p = 7$.
5. Then $M = 6(7) + 9 = 51$. Check: $9$ posters cost $\$63$, which is exactly $\$12$ more than $\$51$.

**Answer: $\$51$**

**Example 3**
*A snack stand sells apples for $30$ cents each and pears for $80$ cents each. Jo bought at least one apple, at least one pear, and nothing else. Did Jo buy more apples than pears?*

*(1) Jo spent $\$3.70$ in total.*

*(2) Jo bought $6$ items in total.*

1. Let $a$ and $p$ be the numbers of apples and pears, with $a \ge 1$ and $p \ge 1$, both integers. The question asks whether $a > p$.
2. Statement (1): $30a + 80p = 370$, which simplifies to $3a + 8p = 37$. Since $8p < 37$, only $p \in \{1, 2, 3, 4\}$ is possible. Test divisibility: $37 - 8p$ must be a positive multiple of $3$. Only $p = 2$ works, giving $3a = 21$, so $a = 7$. The unique solution $(a, p) = (7, 2)$ answers the question: yes, $7 > 2$. Sufficient.
3. Statement (2): $a + p = 6$ allows $(1,5)$, $(2,4)$, $(3,3)$, $(4,2)$, $(5,1)$. Some give $a > p$, some do not. Not sufficient.
4. Statement (1) alone suffices; statement (2) alone does not.

**Answer: (1) alone is sufficient; (2) alone is not.**

## Trigger cues
- "Three less than twice $x$ is at least ..." $\to$ build the inequality symbol by symbol using the dictionary, then solve for the integer endpoint.
- "Has $\$k$ left over / would need $\$k$ more" $\to$ write the person's money two ways and equate.
- "Sum is $S$ and difference is $D$" $\to$ jump straight to $\frac{S+D}{2}$ and $\frac{S-D}{2}$.
- "In $t$ years, she will be ..." $\to$ two-column age setup; add $t$ to every age in the future equation.
- "How many coins/tickets/items ..." with per-item values and integer counts $\to$ set up the value equation and enumerate with a divisibility check before judging sufficiency.
- "For what value of $k$ does the third equation hold automatically" $\to$ solve the first two equations, substitute the point into the third.
- "Reversing its digits increases the number by ..." $\to$ the change is $99(c-a)$; divide immediately.
- "Each of $m$ workers earns $d$ more than each of $n$ would" $\to$ fixed pool: $\frac{T}{m} = \frac{T}{n} + d$.

## Trap gallery
- **Reversed subtraction.** Writing "$7$ less than $3n$" as $7 - 3n$; the fix is $3n - 7$ — "less than" flips the order.
- **Difference order.** "Difference of $y$ and $x$" is $y - x$; translating it as $x - y$ flips every sign downstream.
- **Answering the wrong quantity.** Solving for hardcovers when the question asks for paperbacks; re-read the final question before bubbling.
- **Aging one person.** Writing $M + 12 = 2s$ instead of $M + 12 = 2(s + 12)$; everyone ages together.
- **Strictness slip.** Reading "at least" as $>$; the boundary value is included, and it is often the answer.
- **Wrong-direction rounding.** From $x \ge \frac{8}{3}$ concluding $x = 2$; the smallest *integer* satisfying it is $3$.
- **Auto-insufficient.** Declaring one equation in two unknowns insufficient without checking; positive-integer constraints made $3a + 8p = 37$ fully determined.
- **Trusting your equation over the words.** Verifying a solution against your own (possibly mistranslated) equation; plug it back into the original sentence instead.

## Speed moves
- **test the answer choices linked quantities.** "Sum is $40$; the larger is $8$ more than three times the smaller": test a candidate larger value — $32$ gives smaller $8$, and $3(8) + 8 = 32$ works. Done without setup.
- **Half-sum, half-difference.** Sum $50$, difference $8$: the numbers are $29$ and $21$ instantly — no system needed.
- **Add-all for pairwise sums.** $a+b = 11$, $a+c = 14$, $b+c = 17$: total is $\frac{42}{2} = 21$, so $c = 21 - 11 = 10$ in one subtraction.
- **Mod scan for Diophantine.** In $3a + 8p = 37$, work mod $3$: $8p \equiv 1 \pmod 3$ forces $p \equiv 2 \pmod 3$, so only $p = 2$ needs checking under the bound $8p < 37$.
- **Bound before you enumerate.** Cap the search first ($p \le 4$ since $8p < 37$); four checks beat blind trial.
- **Verbal check beats re-solving.** After finding $n = 6$, read the sentence with $6$ in it — three seconds, and it catches translation errors algebra cannot.

## Before you drill
1. I can translate "$k$ less than $m$" and "difference of $a$ and $b$" without flipping the order.
2. I map "at least / at most / more than / fewer than" to the right one of $\ge, \le, >, <$ every time.
3. Given a fraction bound like $x \ge \frac{8}{3}$, I round in the correct direction for smallest or greatest integer.
4. I write leftover/shortfall money problems as one total expressed two ways.
5. I add $t$ to every age when a problem jumps $t$ years forward.
6. I test integer and positivity constraints before calling one equation in two unknowns insufficient.
7. I plug my answer back into the original sentence, not into my own equation.
