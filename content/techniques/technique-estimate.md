# Estimation And Bounding: Compute Only What The Choices Demand

## Why this matters

The Focus Quant section gives you no calculator and about two minutes a question. Both facts point the same way: the exam is not asking for exact values, it is asking you to *identify* one of five. When the choices are far apart, computing to three decimal places is doing work the question never set — and it is the most common way strong arithmetic turns into a weak score.

Estimation is the least-practised of the major techniques and the one with the best return. It is also the only technique that keeps working when you are behind on time, because a bound you can produce in fifteen seconds is worth more than an exact answer you never reach.

## The core ideas

1. **The choices decide the precision.** Look at the answer choices *before* computing. If they differ by a factor of ten, one significant figure is enough. If two of them differ by $2\%$, you need real arithmetic. Reading the spread first is the whole technique in one habit.

2. **Round toward each other to keep the error small.** Rounding one factor up and the other down keeps a product close to the truth; rounding both up inflates it twice. $3.9 \times 5.1$ is safest as $4 \times 5 = 20$, not as $4 \times 6$.

3. **Track the direction of your error.** Say to yourself "I rounded up, so my estimate is too big." Then a result sitting between two choices resolves itself: if the estimate is inflated and lands at $612$ with choices $600$ and $620$, the answer is $600$.

4. **Bounding beats estimating when the choices straddle a landmark.** You often do not need a value at all — you need to know which side of $\tfrac12$, $1$, or $100$ something lands on. Producing a bound is faster and more certain than producing an estimate.

5. **Benchmark fractions convert on sight.** $\tfrac18 = 12.5\%$, $\tfrac16 \approx 16.7\%$, $\tfrac15 = 20\%$, $\tfrac14 = 25\%$, $\tfrac13 \approx 33.3\%$, $\tfrac38 = 37.5\%$, $\tfrac25 = 40\%$, $\tfrac58 = 62.5\%$, $\tfrac23 \approx 66.7\%$, $\tfrac34 = 75\%$, $\tfrac56 \approx 83.3\%$, $\tfrac78 = 87.5\%$. Every one of these should arrive without arithmetic.

6. **Percent of a number, in two moves.** $1\%$ is a decimal shift; $10\%$ is a decimal shift. Any percent is a small combination: $37\%$ of $840$ is $10\% \times 3$ plus $1\% \times 7$, i.e. $252 + 58.8 = 310.8$.

7. **Compare rather than compute.** To decide which of two fractions is larger, cross-multiply or compare each to a common landmark. $\tfrac{7}{15}$ versus $\tfrac{9}{19}$: both sit just below $\tfrac12$, and $\tfrac{7}{15}$ is $\tfrac{0.5}{15}$ below while $\tfrac{9}{19}$ is $\tfrac{0.5}{19}$ below, so $\tfrac{9}{19}$ is closer to $\tfrac12$ and therefore larger.

8. **"Closest to" and "approximately" are instructions.** The stem is telling you outright that exactness is not being scored. Treat those words as permission and take it.

9. **Estimation fails on tightly-spaced choices and on questions asking for a remainder, a units digit, or an exact count.** Those want a structural or pattern method. Knowing the boundary keeps estimation from becoming guessing.

## Worked examples

**Example 1**

*Which of the following is closest to $\dfrac{4.02 \times 10^{6}}{1.98 \times 10^{3}}$?*

*A) $200$  B) $500$  C) $2{,}000$  D) $5{,}000$  E) $20{,}000$*

1. Read the spread first: the choices are a factor of $2.5$ or more apart. One significant figure will settle this.
2. Round toward each other: $4.02 \to 4$ (down a little) and $1.98 \to 2$ (up a little), so the errors partly cancel.
3. $\dfrac{4 \times 10^{6}}{2 \times 10^{3}} = 2 \times 10^{3} = 2{,}000$.
4. Sanity check the exponent separately from the digits — that is where estimation errors actually occur. $10^6 / 10^3 = 10^3$, so the answer is in the thousands, and only C is.
5. The exact value is about $2{,}030$, but computing it would have taken thirty seconds to distinguish choices that a five-second estimate already separated.

**Answer: C) $2{,}000$**

**Example 2**

*A company's annual revenue rose from $\$487{,}000$ to $\$611{,}000$. Which of the following is closest to the percent increase?*

*A) $20\%$  B) $25\%$  C) $30\%$  D) $35\%$  E) $40\%$*

1. The choices are five points apart, so about two significant figures are needed — more than one, but far less than exact.
2. The increase is $611 - 487 = 124$ (thousands). The base is $487$, which is close to $500$.
3. $\dfrac{124}{500} = 24.8\%$. Now track the direction: the true base is *smaller* than $500$, and a smaller denominator makes a *larger* fraction, so the true answer is a little above $24.8\%$.
4. A little above $24.8$ lands on $25$, not on $30$ — the next choice up would require the increase to be about $146$, which it plainly is not.
5. The exact figure is $\dfrac{124}{487} \approx 25.5\%$, comfortably closest to B.

**Answer: B) $25\%$**

**Example 3**

*If $x = \dfrac13 + \dfrac15 + \dfrac17 + \dfrac19$, which of the following is true?*

*A) $x < 0.6$  B) $0.6 < x < 0.7$  C) $0.7 < x < 0.8$  D) $0.8 < x < 0.9$  E) $x > 0.9$*

1. The common denominator here is $315$. Finding it and adding four fractions is a minute of work for a question that only asks which tenth $x$ lands in.
2. Bound instead, in two easy pairs. $\tfrac13 + \tfrac15 = \tfrac{8}{15}$, which is just above $0.53$. $\tfrac17 + \tfrac19 = \tfrac{16}{63}$, which is just above $0.25$.
3. The sum is therefore a little above $0.78$ — inside C, and not near either boundary.
4. Confirm the boundaries rather than the value: is $x < 0.8$? The four terms are each below their nearest convenient over-estimate: $\tfrac13 < 0.34$, $\tfrac15 = 0.2$, $\tfrac17 < 0.15$, $\tfrac19 < 0.12$, and $0.34 + 0.2 + 0.15 + 0.12 = 0.81$. That is not tight enough, so sharpen the two loosest: $\tfrac17 < 0.1429$ and $\tfrac19 < 0.1112$, giving $0.34 + 0.2 + 0.1429 + 0.1112 = 0.7941 < 0.8$. Bound established.
5. Is $x > 0.7$? Under-estimate each: $0.333 + 0.2 + 0.142 + 0.111 = 0.786 > 0.7$. Both bounds hold, so C — without ever computing $\tfrac{248}{315}$.

**Answer: C) $0.7 < x < 0.8$**

## Trigger cues

- "Closest to", "approximately", or "about" appears in the stem → the question has told you exactness is not scored; estimate.
- The answer choices differ by a factor of two or more → one significant figure is enough.
- The stem contains numbers with three or more digits and no obvious factorization → round before multiplying, and round toward each other.
- The choices straddle a landmark such as $\tfrac12$, $1$, $100$ or a power of ten → bound rather than estimate; you need a side, not a value.
- A percent change on an awkward base → round the base to the nearest hundred and correct the direction afterwards.
- Two answer choices are within a few percent of each other → estimation will not separate them; switch to exact arithmetic on the deciding digits.
- The question asks for a remainder, a units digit, or an exact count → estimation is the wrong tool; use a pattern or structural method.

## Trap gallery

- **Rounding both factors the same way.** $3.9 \times 5.1 \approx 4 \times 6$ overshoots by nearly a fifth. Round one up and the other down.
- **Losing the exponent while getting the digits right.** Most estimation errors on the exam are powers of ten, not arithmetic. Compute the magnitude separately and check it against the choices.
- **Estimating when two choices are close together.** If the two nearest choices differ by $3\%$, a $5\%$ estimate cannot decide between them, and picking anyway is guessing with extra steps.
- **Forgetting which direction you rounded.** Without the direction, a result between two choices is unresolvable and the whole estimate is wasted.
- **Rounding the base of a percentage up and then reading the fraction as too big.** A larger denominator makes a *smaller* fraction. The direction inverts, and it catches people every time.
- **Estimating a difference of two close large numbers.** $\$611{,}000 - \$487{,}000$ must be done exactly; rounding both to the nearest hundred thousand turns $124$ into $100$, a $19\%$ error in the thing you actually needed.
- **Treating "approximately" as license to guess.** Estimation is a controlled approximation with a known direction, not a shrug.

## Speed moves

- **Read the choices first, always.** The spread tells you how much precision to buy, and buying less is the entire saving.
- **Convert awkward percents into $10\%$ and $1\%$ pieces.** $37\%$ of $840$ = three tens plus seven ones = $252 + 58.8$.
- **Use $\tfrac{1}{7} \approx 14.3\%$ and $\tfrac{1}{9} \approx 11.1\%$ from memory.** The whole benchmark table above should be recall, not computation.
- **Bound with the nearest friendly fraction rather than a decimal.** $\tfrac{9}{19}$ is "just under $\tfrac12$" faster than it is $0.4737$.
- **For a product of many numbers, round to one significant figure each and count the powers of ten separately.** Digits and magnitude are two problems; solving them separately is faster and far less error-prone.
- **When an estimate lands between two choices, do not compute — tighten one bound.** One sharper term usually decides it in five seconds.

## Before you drill

- I read the answer choices before I compute anything, and I let their spread set my precision.
- I round toward each other and I say out loud which direction my error runs.
- I know the benchmark fraction–percent table by recall.
- I can produce $37\%$ of a three-digit number in two moves.
- I bound instead of estimating when the choices straddle a landmark.
- I never round the difference of two close large numbers.
- I recognize the questions estimation cannot answer — remainders, units digits, exact counts, tightly-spaced choices — and switch method rather than guessing.
