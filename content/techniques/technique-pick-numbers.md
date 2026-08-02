# Picking Numbers: Turn Algebra Into Arithmetic

## Why this matters

A large share of Focus Quant questions never require you to manipulate a variable at all. When the answer choices are expressions rather than values, or when the stem asserts something for *every* number of a kind, you are allowed to stop doing algebra and start doing arithmetic — and arithmetic is where you are fast and reliable.

The technique is simple to state and easy to get wrong. Pick concrete values that satisfy every stated constraint, run the question with them, and read off which choice matches. What separates a student who gains two minutes from one who loses three is the discipline around *which* numbers, *how many*, and *when a survivor still needs proving*.

## The core ideas

1. **The condition for picking numbers.** The answer choices contain variables, or the stem makes a universal claim ("which must be true", "for all positive $n$"). If the choices are five specific numbers, you want backsolving instead.

2. **Satisfy every constraint, and only the constraints.** "$x$ is an even integer greater than $2$" means your value must be even, an integer, and greater than $2$. It must not accidentally be special in ways the stem did not require — avoid $x = 1$, $x = 0$, and $x = -1$ unless the stem permits them, because each of those is a fixed point of some operation and will make wrong choices look right.

3. **Small, distinct, and easy.** Prefer values under $10$, and make different variables different numbers. Using $x = 2$ and $y = 2$ makes $x + y$, $2x$, $xy$ and $x^2$ all equal $4$, and four choices will tie.

4. **Percentages start at $100$.** When a question is about percent change with no stated amount, take the original as $100$. Every subsequent step is a two-digit multiplication and the answer reads off directly as a percent.

5. **Fractions of a whole start at the least common multiple.** If a stem takes $\tfrac13$ then $\tfrac25$ of something, start at $15$ — the denominators' lowest common multiple — and every intermediate value is a whole number.

6. **One value eliminates; it never proves.** A choice that survives your test is a *candidate*. Choices that fail are dead for good, because a universal claim is destroyed by one counterexample. That asymmetry is the engine of the method.

7. **Test again when more than one survives.** If two choices agree on your first value, pick a second value with a different character — swap parity, cross zero, cross one, go from proper fraction to improper — and run only the survivors.

8. **Confirm the last survivor structurally when you can.** Two values agreeing is strong evidence, not proof. If a one-line reason is available ("$x(x+1)$ is a product of consecutive integers, so it is even"), take it: it converts a probable answer into a certain one at almost no cost.

9. **The danger values are $0$, $1$, $-1$, and fractions between $0$ and $1$.** They are traps when you pick them carelessly and weapons when the stem allows them: squaring makes fractions smaller, negatives flip inequalities, and $1$ is invisible under multiplication. On "must be true" questions, these are exactly where wrong choices die.

## Worked examples

**Example 1**

*If $x$ is an even integer and $y$ is an odd integer, which of the following must be odd?*

*A) $x + y + 1$  B) $xy$  C) $x + 2y$  D) $2x + y$  E) $x(y + 1)$*

1. Choices are expressions and the claim is universal, so pick numbers. Constraints: $x$ even, $y$ odd. Take $x = 2$, $y = 3$ — small, distinct, and neither is a special value.
2. A: $2 + 3 + 1 = 6$, even — dead. B: $2 \times 3 = 6$, even — dead. C: $2 + 6 = 8$, even — dead. D: $4 + 3 = 7$, odd — survives. E: $2 \times 4 = 8$, even — dead.
3. Only one survivor after a single test, which is the ideal outcome. Confirm it in words: $2x$ is even for any integer $x$, and even plus odd is odd, so $2x + y$ is odd for every admissible pair.
4. Notice that the structural confirmation took four seconds. Picking numbers found the answer; the reason made it certain.

**Answer: D) $2x + y$**

**Example 2**

*The price of a book is increased by $p$ percent and then decreased by $p$ percent. The final price is what percent of the original price?*

*A) $100$  B) $100 - \dfrac{p^2}{100}$  C) $100 - \dfrac{p^2}{50}$  D) $100 + \dfrac{p^2}{100}$  E) $100 - 2p$*

1. Percent question with no stated amount and expression choices: take the original price as $100$ and pick a convenient $p$. Use $p = 10$ — small, and it keeps the arithmetic exact.
2. Run it: $100 \to 110 \to 110 \times 0.9 = 99$. The final price is $99\%$ of the original.
3. Evaluate the choices at $p = 10$: A gives $100$; B gives $100 - \tfrac{100}{100} = 99$; C gives $100 - 2 = 98$; D gives $101$; E gives $80$. Only B matches.
4. The structural confirmation, if you want it: with $t = \tfrac{p}{100}$, the chain is $(1+t)(1-t) = 1 - t^2$, which as a percent is $100 - \tfrac{p^2}{100}$.
5. This is also the fastest cure for the classic error of thinking up-then-down by the same percent returns you to the start. One concrete run makes the loss visible.

**Answer: B) $100 - \dfrac{p^2}{100}$**

**Example 3**

*If $n$ is an integer, which of the following must be even?*

*A) $n^2 + n$  B) $n^2 + 1$  C) $2n + 1$  D) $n(n + 2)$  E) $3n$*

1. Start with $n = 1$: A gives $2$ (even, survives); B gives $2$ (even, survives); C gives $3$ (odd, dead); D gives $3$ (odd, dead); E gives $3$ (odd, dead).
2. Two survivors, so one value was not enough — this is the situation the method is designed for, not a failure of it. Pick a second value of different character: $n = 2$.
3. A gives $4 + 2 = 6$, still even. B gives $5$, odd — dead. Only A remains.
4. Confirm structurally: $n^2 + n = n(n+1)$ is the product of two consecutive integers, and exactly one of any two consecutive integers is even, so the product is always even.
5. The lesson to carry: had you tested only $n = 1$, you would have been choosing between A and B by feel. The second value costs ten seconds and removes the guess.

**Answer: A) $n^2 + n$**

## Trigger cues

- Answer choices contain variables → pick numbers; there is nothing to backsolve.
- "Which of the following must be true / must be even / is always …" → pick numbers to eliminate, then confirm the survivor structurally.
- A percent question with no dollar or unit amount anywhere → set the original to $100$.
- Fractions of a whole with no total given → set the total to the least common multiple of the denominators.
- A ratio question with no absolute quantity → set one part to the ratio's own number so the parts are whole.
- Two or more survivors after the first test → pick a second value that differs in parity, sign, or size relative to $1$.
- The stem permits zero, one, negatives, or fractions → test one of those deliberately; that is where the wrong choices are hiding.
- Choices are five specific numbers → this is not a picking-numbers question; backsolve.

## Trap gallery

- **Picking $1$ or $0$ when the stem allows anything.** They collapse distinctions: $x^2 = x$, $2x = x + x$, and half the choices tie. Reserve them for "must be true" questions where you *want* the collapse to expose a false choice.
- **Using the same value for two variables.** $x = y = 2$ makes $x+y$, $xy$, $2x$ and $x^2$ all equal $4$. Distinct variables get distinct numbers.
- **Declaring victory on one survivor without checking the constraints.** A value that violates a stated condition proves nothing about anything. Re-read the constraints before trusting the run.
- **Treating a single survivor as proof on a "must be true" question.** One value is a filter, not a proof. When the survivor has no quick structural reason, test a second value of different character.
- **Picking large or awkward numbers.** $x = 37$ turns a ten-second check into a minute of long multiplication and a new chance to slip. Small numbers exist to keep the arithmetic invisible.
- **Forgetting that squaring reverses order below one.** For $0 < x < 1$, $x^2 < x$. Any inequality choice that assumes otherwise dies on $x = \tfrac12$ — and only on $x = \tfrac12$.
- **Not re-reading which quantity the question wants.** Picking numbers gets you a number; the stem may want a percent, a ratio, or the *other* variable.

## Speed moves

- **Default set: $2$ for the first variable, $3$ for the second, $100$ for percents, the LCM for fractions.** Having a default removes the choosing time entirely.
- **Evaluate choices in the order most likely to die.** Choices with a lone constant or a lone coefficient usually fail first; killing three early often leaves a single survivor before you have evaluated the rest.
- **Keep a running parity check instead of full arithmetic.** On odd/even questions you do not need the value, only its parity, and parity arithmetic is instantaneous.
- **When two survive, choose the second value to break the tie you actually have.** If both survivors agreed on an even value, go odd. If both agreed above $1$, go below it.
- **On percent chains, keep the running total, not the percents.** $100 \to 110 \to 99$ is three numbers; tracking "up $10$, down $10$" is where the error lives.
- **Write the picked values down.** Two minutes later, when you check whether a choice matched, you need to know what $y$ was.

## Before you drill

- I can tell in one look whether a question wants picked numbers or backsolving.
- I pick values that satisfy every constraint and are otherwise unremarkable.
- I use different numbers for different variables.
- I start percent questions at $100$ and fraction questions at the least common multiple.
- I know that a failed choice is dead permanently and a surviving choice is only a candidate.
- I test a second, differently-charactered value whenever more than one choice survives.
- I reach for $0$, $1$, $-1$ and proper fractions deliberately on "must be true" questions.
- I confirm a lone survivor with a one-line structural reason when one is available.
