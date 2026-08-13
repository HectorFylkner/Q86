# Sequences, Series, and Repeating Patterns

## Why this matters

The GMAT Focus Edition uses sequences as a stress test of structure recognition: can you see that a list of numbers is arithmetic, geometric, periodic, or telescoping, and jump straight to the right formula instead of adding term by term? At the Q86 tier the exam layers two ideas at once — a recursion that secretly cycles, or an arithmetic sum with terms deleted — so the payoff comes from classifying the sequence in the first ten seconds.

Ideas 1–5 are the two classical families and their sums; 6–8 the recursion toolkit (crank, cycle, remainder); 9–11 the three structural sums — alternating, telescoping, deleted — that the hardest stems are assembled from. This chapter shares its spine with the functions chapter and the evenly-spaced chapter; here the emphasis is classification speed.

## The core ideas

Ideas 1–5 are the classical families; 6–8 the recursion toolkit; 9–11 the structural sums.

1. **Arithmetic sequence, nth term.** If each term grows by a constant $d$, then $a_n = a_1 + (n-1)d$. You take $n-1$ steps of size $d$ to get from term $1$ to term $n$ — count the *gaps*, not the terms.
Check: $a_1 = 20$, $d = 6$. What is $a_{15}$? ⇒ $20 + 14 \cdot 6 = 104$.

2. **Arithmetic series sum.** $S_n = \dfrac{n}{2}(a_1 + a_n) = n \cdot (\text{average term})$. In an evenly spaced list the average equals the midpoint of the first and last terms, so the sum is just count times average.

3. **Sum of the first $n$ positive integers.** $1 + 2 + \cdots + n = \dfrac{n(n+1)}{2}$. This is idea 2 with $a_1 = 1$ and $a_n = n$.
Check: $1 + 2 + \cdots + 100$? ⇒ $\frac{100 \cdot 101}{2} = 5050$.

4. **Geometric sequence, nth term.** If each term is multiplied by a constant ratio $r$, then $a_n = a_1 r^{\,n-1}$ — again $n-1$ multiplications, not $n$.

5. **Geometric series sum.** $S_n = a_1 \cdot \dfrac{r^n - 1}{r - 1}$ for $r \neq 1$. Fast check for doubling ($r=2$): the sum of all terms is the *next term minus the first term*.
Check: $3 + 6 + 12 + 24 + 48$? ⇒ next term minus first: $96 - 3 = 93$.

6. **Recursive definitions: just crank.** For a small target index, compute forward — five quick computations beat any cleverness.
Check: $a_1 = 3$ and $a_{n+1} = 2a_n - 1$. What is $a_5$? ⇒ $3, 5, 9, 17, 33$.

7. **Periodicity.** Many recursions repeat: $a_n = a_{n-1} - a_{n-2}$ always cycles with period $6$, and the six terms of each cycle sum to $0$. To see it, write out terms until the *pair* of consecutive values you started with reappears — from then on the sequence is locked in a loop.

8. **Cycle-and-remainder counting.** If a pattern repeats every $p$ items, split $N = qp + s$ with $0 \le s < p$: count $q$ full cycles, then handle the leftover $s$ positions by hand. The remainder tells you exactly where in the cycle you stop.
Check: A pattern of period $5$ runs for $78$ items — full cycles and leftovers? ⇒ $15$ cycles, $3$ leftover positions.

9. **Alternating sums pair up.** For $\sum_{n=1}^{N} (-1)^n n$, group $(-1+2) + (-3+4) + \cdots$; each pair contributes $+1$. With an odd count, one term stands alone after pairing — the term the trap answers forget.

10. **Telescoping.** If $t_n = \dfrac{1}{n} - \dfrac{1}{n+1}$, then $\sum_{n=1}^{N} t_n = 1 - \dfrac{1}{N+1}$ because every intermediate fraction cancels with its neighbor.
Check: The first $12$ terms of $\frac{1}{n} - \frac{1}{n+1}$ sum to? ⇒ $1 - \frac{1}{13} = \frac{12}{13}$.

11. **Sums with deleted terms.** Total $=$ (sum as if nothing were skipped) $-$ (sum of the skipped terms). Both pieces are usually arithmetic series, so idea 2 handles each.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*What is the sum of the integers from $1$ to $40$, inclusive?*

1. Apply the closed form: $\dfrac{n(n+1)}{2} = \dfrac{40 \cdot 41}{2}$.
2. Compute: $20 \cdot 41 = 820$.

**Answer: $820$**

**Example 2 · 605 level · target 1:40**

*A trainer assigns $20$ push-ups on day 1 of a program and increases the assignment by $6$ push-ups each day. How many push-ups does the program assign in total over the first $15$ days?*

1. This is arithmetic with $a_1 = 20$, $d = 6$, $n = 15$.
2. Last term: $a_{15} = 20 + 14 \cdot 6 = 104$.
3. Sum $=$ count $\times$ average $= 15 \cdot \dfrac{20 + 104}{2} = 15 \cdot 62 = 930$.

**Wrong turn: answering the last day.** $104$ — the day-15 assignment — is planted beside the total. "How many in the last row" and "how many in all" are different formulas off the same setup; the stem's final line picks one.

**Answer: $930$**

**Example 3 · 655 level · target 2:05**

*Aisha deposits $\$4$ into a fund in week 1, and each week thereafter she deposits triple the previous week's amount. At the end of which week does the total amount deposited first exceed $\$400$?*

1. Geometric with $a_1 = 4$, $r = 3$. Total through week $n$: $S_n = 4 \cdot \dfrac{3^n - 1}{3 - 1} = 2(3^n - 1)$.
2. Need $2(3^n - 1) > 400$, i.e. $3^n > 201$.
3. Powers of $3$: $3^4 = 81$ (too small), $3^5 = 243$ (works).
4. Confirm the totals: through week 4, $2(81 - 1) = 160$; through week 5, $2(243 - 1) = 484 > 400$.

**Wrong turn: thresholding the deposit, not the total.** Week 5's *single* deposit is $4 \cdot 3^4 = 324$, and week 6's is $972$ — solving "$4 \cdot 3^{n-1} > 400$" answers when one week's deposit crosses the line, planting week 6. "Total amount deposited" is the running sum; verify the cumulative value on both sides of the boundary, as in step 4.

**Answer: week 5**

**Example 4 · 705 level · target 2:30**

*In a sequence, $a_1 = 6$, $a_2 = 10$, and $a_n = a_{n-1} - a_{n-2}$ for all $n \ge 3$. What is the sum of the first $50$ terms?*

1. Crank terms until the sequence repeats: $6, 10, 4, -6, -10, -4, 6, 10, \ldots$ The starting pair $(6, 10)$ returns at terms 7 and 8, so the period is $6$.
2. Sum of one full cycle: $6 + 10 + 4 - 6 - 10 - 4 = 0$.
3. Split $50 = 8 \cdot 6 + 2$: eight full cycles contribute $8 \cdot 0 = 0$.
4. The two leftover terms are the first two of a new cycle: $a_{49} + a_{50} = 6 + 10 = 16$.

**Wrong turn: extrapolating a Fibonacci explosion.** The rule *looks* like it should grow forever, and solvers who compute four terms and reach for a formula never see the loop. Subtraction-flavored recursions cycle overwhelmingly often; six cheap terms settle it, and the zero-sum cycle then deletes $48$ of the $50$ terms.

**Answer: $16$**

**Example 5 · Q86 level · target 2:50**

*What is the value of $\displaystyle\sum_{n=1}^{75} (-1)^n \, n$, that is, $-1 + 2 - 3 + 4 - \cdots - 75$?*

*A) $-38$  B) $-37$  C) $0$  D) $37$  E) $38$*

1. Pair consecutive terms: $(-1 + 2) + (-3 + 4) + \cdots + (-73 + 74)$ — each pair contributes $+1$.
2. Terms $1$ through $74$ form $37$ pairs: subtotal $+37$.
3. The count is odd, so term $75$ stands alone: $(-1)^{75} \cdot 75 = -75$.
4. Total: $37 - 75 = -38$.

**Wrong turn: the vanished last term.** $+37$ — choice (D) — is the sum of the pairs with the lone $-75$ forgotten, and $-37$ is a sign slip on the same error. With an odd count, pairing always strands exactly one term; write it down before totaling. A tiny model confirms the shape: $-1 + 2 - 3 = -2 = 1 - 3$, matching pairs-plus-straggler.

**Answer: $-38$ (A)**

## Trigger cues

- "Each row/day/month has $k$ more than the one before" → arithmetic; use $a_n = a_1 + (n-1)d$ and $S_n = n \cdot \text{average}$.
- "Sum of the integers from 1 to $n$" → $\dfrac{n(n+1)}{2}$ instantly.
- "Doubles (or triples) each period" plus "total first exceeds…" → geometric sum $a_1\dfrac{r^n-1}{r-1}$, then test powers — and check whether the threshold applies to the total or one term.
- "$a_n = a_{n-1} \pm a_{n-2}$" with a big index or a sum of many terms → hunt for a cycle; write terms until the starting pair repeats.
- "Repeating pattern: $x$ of this, $y$ of that…" with $N$ items → cycle-and-remainder: $N = qp + s$.
- "$(-1)^n$" in the term formula → pair consecutive terms; watch for one unpaired term when the count is odd.
- Term written as a difference like $\dfrac{1}{n} - \dfrac{1}{n+1}$ → telescoping; only the first and last pieces survive.
- "Produces nothing every 5th minute" or similar deletions → full sum minus the sum of skipped terms.

## Trap gallery

- **Using $n$ steps instead of $n-1$.** Term 12 of an arithmetic sequence is $a_1 + 11d$, not $a_1 + 12d$ — count gaps.
- **Answering the nth term when the question asks the total** (or vice versa): "how many in the last row" vs. "how many in all" are different formulas — reread the question stem's last line.
- **Assuming a recursion explodes when it cycles.** $a_n = a_{n-1} - a_{n-2}$ looks Fibonacci-like but has period 6; test a few terms before extrapolating.
- **Sloppy remainder handling.** After removing full cycles, the leftover items start at the *beginning* of the pattern — map each leftover position to its color/value explicitly.
- **Forgetting the unpaired term in alternating sums.** With an odd number of terms, one term stands alone after pairing — and its absence is a planted choice.
- **Threshold questions answered one period early or late.** Verify the cumulative total on both sides of the boundary, as in Example 3 ($160$ vs. $484$).
- **Skipped-term problems: subtracting the wrong amounts.** The *scheduled* output keeps rising during pauses, so subtract the scheduled values at those times, not an earlier frozen level.

## Speed moves

- **Count times average.** Any evenly spaced sum is $n \cdot \dfrac{a_1 + a_n}{2}$; in Example 2 that is $15 \cdot 62 = 930$ with no term-by-term addition.
- **Doubling sums collapse.** When $r = 2$, the sum equals (next term) $-$ (first term): $3 + 6 + 12 + 24 + 48 = 96 - 3 = 93$.
- **Crank small indexes by hand.** For $a_5$ or $a_7$ from a recursion, four to six arithmetic steps are faster and safer than deriving a formula.
- **Cycle-and-remainder in one line.** Pattern of period 5 containing 3 silver items, $78$ total: $78 = 15 \cdot 5 + 3$, so $15 \cdot 3 = 45$ silver from full cycles plus however many silvers sit in the first 3 positions.
- **Test the choices against the threshold.** If the choices for "which week" run 4 through 8, plug the middle choice into the cumulative formula and adjust once.
- **Telescope before you compute.** Write the first two and last one terms of a telescoping sum, cancel visually, and read off $1 - \dfrac{1}{N+1}$.
- **Model on a tiny case.** Unsure of a pairing or remainder rule? Run it on $N = 3$ or $N = 5$ by hand — ten seconds, and the structure shows itself.

## Before you drill

1. I can state $a_n = a_1 + (n-1)d$ and explain why the multiplier is $n-1$.
2. I can compute any evenly spaced sum as count times average in one line.
3. I know $S_n = a_1\dfrac{r^n - 1}{r - 1}$ and the "next term minus first term" shortcut for doubling.
4. Given any recursion, I write out terms until I either reach the target index or spot a repeating pair.
5. For a pattern of period $p$ and $N$ items, I split $N = qp + s$ and handle the $s$ leftovers explicitly.
6. I pair alternating sums and account for the lone unpaired term when the count is odd.
7. I recognize $\dfrac{1}{n} - \dfrac{1}{n+1}$ style terms as telescoping and keep only the ends.
8. On "first exceeds" stems I check whether the threshold applies to one term or the running total, and verify both sides of the boundary.
