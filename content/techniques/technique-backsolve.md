# Backsolving: The Answer Is Already On The Screen

## Why this matters

Five of the questions in a Focus Quant section hand you the answer before you start. Not the right one — but the right one is in there, and four wrong ones are keeping it company. Whenever the choices are specific numbers and the algebra to produce one is longer than the arithmetic to check one, working backwards is not a fallback for when you are stuck. It is the faster method, and choosing it deliberately is a skill you can drill.

The habit that costs points is reaching for algebra by reflex. A stem that says "how many pencils did she buy" with choices $12$, $15$, $18$, $21$, $24$ is not asking you to build a system of equations; it is asking you which of five numbers survives the story. Backsolving turns an unknown into a check, and checks are cheap.

## The core ideas

1. **The condition for backsolving.** The choices are specific numeric values *and* substituting a value into the stem is mechanically simpler than solving for it. Both halves matter: if the choices are expressions like $2x+1$, you want to pick numbers instead; if the check is as much work as the algebra, backsolving buys nothing.

2. **Start in the middle, not at A.** Order the choices and test the middle one. GMAT answer choices are conventionally ordered by size, so a middle test that fails still tells you *which direction* to go — and one more test finds the answer. Starting at A gives you no direction and can cost five tests instead of two.

3. **Two tests is the target, three is the ceiling.** Middle first: if it works, you are done in one. If it is too large, one of the two smaller choices is right; if it is too small, one of the two larger. A second test on the middle of the surviving pair resolves it. Any question needing four tests was the wrong question to backsolve.

4. **Test against the *condition*, not against the answer.** Substitute the choice back into the sentence the stem actually asserts — "the total was $\$96$", "the remainder is $3$" — and check whether the sentence becomes true. Students who instead re-derive the answer have simply done the algebra with extra steps.

5. **Backsolving proves, it does not merely suggest.** A choice that satisfies every stated condition *is* the answer, because the question has exactly one. You do not need to check the rest. This is the source of the speed: verification is a shorter logical task than derivation.

6. **Integer constraints make it stronger.** When the stem forces a whole number of people, coins or days, the choices are the only candidates that exist. Algebra that lands between two choices means you made an error; backsolving cannot land between them.

7. **Word problems with one unknown are the sweet spot.** "Marta is three years older than twice her son's age; in seven years their ages sum to $45$." Solving that takes two equations and a substitution. Testing "Marta is $23$" takes ten seconds and one subtraction.

8. **Know when it collapses.** Backsolving is weak when the stem has *two* unknowns to satisfy simultaneously, when the choices are far apart in kind rather than in size, or when the check itself requires the very algebra you were avoiding. Recognizing those in five seconds is as valuable as the technique.

## Worked examples

**Example 1**

*A cinema charges $\$11$ for an adult ticket and $\$7$ for a child ticket. On Saturday it sold $58$ tickets for a total of $\$530$. How many adult tickets did it sell?*

*A) 24  B) 28  C) 31  D) 34  E) 37*

1. The condition to check: adults at $\$11$ plus children at $\$7$, $58$ tickets in all, $\$530$ collected.
2. Start in the middle with C, $31$ adults. Then $27$ children: $31(11) + 27(7) = 341 + 189 = 530$.
3. That is the stated total exactly, so C is the answer — first test, no algebra, no second test.
4. Note what the algebraic path would have been: $11a + 7(58 - a) = 530$, expand, collect, divide. Three lines and two chances to slip a sign, against one multiplication pair.

**Answer: C) 31**

**Example 2**

*A number of identical crates are loaded onto a truck. If each crate weighs $34$ kilograms, the load is $88$ kilograms over the truck's limit. If each crate weighs $27$ kilograms instead, the load is $24$ kilograms under the limit. How many crates are there?*

*A) 12  B) 14  C) 16  D) 18  E) 20*

1. Two conditions, one unknown — still a backsolve, because each check is one multiplication.
2. The limit is not given, but it is the same in both sentences: $34n - 88 = 27n + 24$ is the algebra, and the check is easier. Test C, $n = 16$: heavy load $34(16) = 544$, so the limit would be $544 - 88 = 456$; light load $27(16) = 432$, so the limit would be $432 + 24 = 456$.
3. The two implied limits agree, so $16$ satisfies both sentences at once.
4. Had they disagreed, the direction is readable: if the heavy-implied limit exceeded the light-implied one, $n$ is too large.

**Answer: C) 16**

**Example 3**

*If $x$ is a positive integer, which of the following must be an integer?*

*A) $\dfrac{x^2 + x}{4}$  B) $\dfrac{x^2 + x}{3}$  C) $\dfrac{x^2 + x}{2}$  D) $\dfrac{x^3 + x}{3}$  E) $\dfrac{x^3 + x}{6}$*

1. First, recognize what this is *not*. The choices are expressions, not numbers, so there is nothing to substitute back into the stem — backsolving has no purchase here. Spotting that in three seconds is the skill; grinding at it is the error.
2. The technique this stem wants is picking numbers, in its "must be true" form: try small values and let each failure kill a choice.
3. $x = 1$ gives $x^2 + x = 2$ and $x^3 + x = 2$. Then A is $\tfrac24$, B is $\tfrac23$, D is $\tfrac23$, E is $\tfrac26$ — none an integer. All four die on the very first value tested.
4. Only C survives, and one value surviving is not a proof, so confirm it structurally: $x^2 + x = x(x+1)$ is a product of two consecutive integers, one of which is always even. So $\tfrac{x(x+1)}{2}$ is an integer for every positive $x$.
5. That last step is the difference between a lucky guess and knowing: picking numbers eliminates, and a structural reason confirms.

**Answer: C) $\dfrac{x^2 + x}{2}$**

## Trigger cues

- Choices are five specific numbers, and the question asks "how many" or "what was" → test the middle choice against the stem's condition before writing any algebra.
- A word problem with one unknown and one or two stated totals → backsolve; the algebra is a system, the check is arithmetic.
- The stem forces a whole number of indivisible things (people, coins, crates, days) → the choices are the complete candidate list; nothing else can be the answer.
- Two scenarios pinned to the same hidden quantity ("$88$ over", "$24$ under") → test a choice and check whether both scenarios agree on the hidden quantity.
- "Least possible value" or "greatest possible value" with numeric choices → work inward from the end the question asks about, not from the middle.
- Choices are algebraic expressions, not numbers → this is not a backsolve at all; pick numbers, and confirm the survivor structurally.
- The check requires solving the same equation you were avoiding → abandon backsolving immediately; it saves nothing here.

## Trap gallery

- **Starting at A out of habit.** A failed test at A leaves four candidates; a failed test at the middle leaves two. The middle-first rule is worth roughly two tests per question you backsolve.
- **Re-deriving instead of checking.** Substituting the choice and then *solving forward* to see what you get is the algebraic path with an extra step. Put the choice into the stem's sentence and ask only whether the sentence is now true.
- **Continuing after a hit.** One choice satisfying every condition is the answer; the question has exactly one. Testing the remaining choices to be safe costs a minute you will want later.
- **Backsolving a two-unknown stem.** With two genuinely independent unknowns, a single choice does not determine the check, and you end up solving anyway. Read for how many quantities are floating before committing.
- **Ignoring the direction a failed test gives.** "Too big" is information. Discarding it and testing an arbitrary remaining choice throws away the main advantage of starting in the middle.
- **Missing that the choices are unordered.** Occasionally choices are not listed by size; sort them mentally first or the middle-first rule points at the wrong one.
- **Grinding past three failed tests.** Four misses means you have misread the condition. Re-read the stem instead of testing the fifth.

## Speed moves

- **Sort and take the median in one glance.** The choices are almost always ordered; C is your first test without thinking about it.
- **Check the cheapest condition first.** If a stem states both a count and a total, test the count — it is usually one addition — and only compute the total for choices that survive.
- **Use parity and units digits before arithmetic.** If the total must be even and a choice forces an odd total, it dies without any multiplication. This costs a second and often removes two choices.
- **Keep the substitution in your head where you can.** $31 \times 11$ is $341$ by shifting and adding; writing out long multiplication for a check defeats the purpose.
- **Bail to elimination if two tests both fail.** You now have three candidates and a direction; a property check often finishes it faster than a third substitution.
- **Recognize the "over/under" template instantly.** Two scenarios with a shared hidden limit is the single most backsolvable stem shape on the exam.

## Before you drill

- I can state the two conditions that make a question backsolvable, and check them in five seconds.
- I start at the middle choice, always, and I sort the choices first if they are not in order.
- I test against the stem's stated condition rather than re-deriving the answer.
- I stop the moment a choice satisfies every condition.
- I use the direction a failed middle test gives me instead of picking arbitrarily.
- I abandon backsolving when the stem has two independent unknowns, or when three tests have failed.
- I know that a "least/greatest possible value" question is worked inward from the end the question names, not from the middle.
