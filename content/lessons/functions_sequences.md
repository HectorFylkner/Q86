# Functions and Sequences: Read the Rule, Then Exploit Its Structure

## Why this matters

The GMAT Focus Edition does not test sequence theory — it tests whether you can read an unfamiliar rule and turn it into fast arithmetic. At the Q86 tier these questions hide a two-second pattern (a constant gap, a cycle, a collapsing sum) inside a scary-looking recurrence, and the whole game is spotting it before you start grinding.

Ideas 1–2 cover function notation and symmetry; 3–6 the two classic sequence families and the jump moves that make them fast; 7–10 the recurrence toolkit — iterate, invert, difference, cycle, telescope — where the top-tier stems live; 11–12 the counting conventions imported from the evenly-spaced chapter.

## The core ideas

Ideas 1–2 are notation and symmetry; 3–6 the classic families; 7–10 the recurrence toolkit; 11–12 counting.

1. **A function is a substitution rule.** If $f(x) = 3x + 2$, then $f(\text{anything}) = 3(\text{anything}) + 2$; nested forms like $f(f(2))$ evaluate inside-out.
Check: $f(x) = 3x + 2$. What is $f(a + 1)$? ⇒ $3(a+1) + 2 = 3a + 5$.

2. **Symmetry rule.** $f(x) = f(a - x)$ for all $x$ means inputs summing to $a$ give equal outputs — $x$ and $a - x$ are equidistant from $\frac{a}{2}$.
Check: $f(x) = f(6 - x)$ for all $x$, and $f(1) = 7$. What is $f(5)$? ⇒ $7$ — inputs $1$ and $5$ sum to $6$.

3. **Arithmetic sequence, explicit form.** $a_n = a_1 + (n-1)d$: term $n$ is $n - 1$ steps of size $d$ past term $1$.

4. **Jump between any two terms.** $a_m = a_k + (m - k)d$, since index $k$ to index $m$ is $m - k$ gaps. So *any two terms pin down the whole arithmetic sequence* — count parameters, not equations, when judging what a sequence fact determines.
Check: $a_2 = 5$ and $a_5 = 17$. The common difference? ⇒ three gaps cover $12$: $d = 4$.

5. **Arithmetic sum.** $S_n = \frac{n(a_1 + a_n)}{2}$: the average term is the average of first and last, and sum is average times count.
Check: $11$ terms, first $9$, last $49$. Their sum? ⇒ $11 \times 29 = 319$.

6. **Geometric sequence.** $a_n = a_1 \cdot r^{n-1}$, and more usefully $a_m = a_k \cdot r^{m-k}$: $k$ index steps multiply by $r^k$ — including negative $r$ and backward steps (divide).
Check: $r = -2$ and $a_5 = 48$. What is $a_2$? ⇒ $\frac{48}{(-2)^3} = -6$ — sign included.

7. **Recursive rules: iterate or invert.** For a small target index, compute forward. Given a *later* term, invert the step: $a_{n+1} = ra_n + c$ becomes $a_n = \frac{a_{n+1} - c}{r}$.

8. **Second-difference recurrences.** $a_{n+1} = 2a_n - a_{n-1} + c$ rearranges to $a_{n+1} - a_n = (a_n - a_{n-1}) + c$: the *gaps* grow by exactly $c$, so the gaps are themselves arithmetic.

9. **Periodicity.** Rules like $a_{n+1} = a_n - a_{n-1}$ cycle — this one with period $6$. Once two consecutive terms repeat, everything repeats; reduce the target index mod the period. Bonus: its full cycle sums to $0$.

10. **Telescoping.** $\frac{1}{n(n+1)} = \frac{1}{n} - \frac{1}{n+1}$, so consecutive terms cancel in the middle and only the ends survive.
Check: $\sum_{n=1}^{10} \frac{1}{n(n+1)}$? ⇒ $1 - \frac{1}{11} = \frac{10}{11}$.

11. **Counting terms with an inequality.** If $a_n = 4n + 3$, terms strictly between $30$ and $150$ satisfy $\frac{27}{4} < n < \frac{147}{4}$, so $n = 7$ through $36$: that is $36 - 7 + 1 = 30$ terms. Count integers as last minus first *plus one*.
Check: How many terms of $a_n = 4n + 3$ lie strictly between $30$ and $150$? ⇒ $30$.

12. **Two interleaved schedules.** Events every $d_1$ days and every $d_2$ days coincide on days recurring every $\operatorname{lcm}(d_1, d_2)$ — list to find the first shared day, then count with idea 11.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*If $f(x) = 3x + 2$, what is the value of $f(f(2))$?*

1. Inside first: $f(2) = 3 \cdot 2 + 2 = 8$.
2. Then outside: $f(8) = 3 \cdot 8 + 2 = 26$.

**Answer: $26$**

**Example 2 · 605 level · target 1:40**

*In an arithmetic sequence, the third term is $14$ and the eighth term is $39$. What is the twentieth term?*

1. From index $3$ to index $8$ is $8 - 3 = 5$ gaps, and the value rises by $39 - 14 = 25$, so $d = \frac{25}{5} = 5$.
2. From index $8$ to index $20$ is $12$ more gaps: $a_{20} = 39 + 12 \cdot 5 = 39 + 60 = 99$.

**Wrong turn: rebuilding from $a_1$.** Solving for $a_1 = 4$ first, then computing $a_{20} = 4 + 19 \times 5$, lands in the same place a step slower — and the off-by-one ($4 + 20 \times 5 = 104$) is planted. The jump formula never touches $a_1$ and has no fencepost to trip on.

**Answer: $99$**

**Example 3 · 655 level · target 2:05**

*In an online game, a player's token balance is updated at the end of each day: it is doubled, then a $14$-token fee is deducted. A player began with $T$ tokens, and after exactly $4$ updates her balance was $1{,}230$ tokens. What is $T$?*

1. The daily rule is $B \mapsto 2B - 14$. Since we know the *ending* balance, invert it: the previous balance is $\frac{B + 14}{2}$.
2. Step backward four times: $\frac{1230 + 14}{2} = 622$, then $622 \to 318 \to 166 \to 90$.
3. Check forward: $90 \to 166 \to 318 \to 622 \to 1230$. It holds.

**Wrong turn: running the rule forward from the end.** Applying $2B - 14$ to $1{,}230$ marches the balance the wrong way through time. The known value is *after* the updates, so each recovery step must undo the rule — add the fee back, then halve. Backsolving from the answer choices sidesteps the inversion entirely if it feels risky.

**Answer: $90$**

**Example 4 · 705 level · target 2:30**

*What is the value of $\displaystyle\sum_{n=4}^{48} \frac{1}{n(n+1)}$?*

*A) $\dfrac{9}{49}$  B) $\dfrac{45}{196}$  C) $\dfrac{1}{4}$  D) $\dfrac{11}{49}$  E) $\dfrac{48}{49}$*

1. Split each term: $\frac{1}{n(n+1)} = \frac{1}{n} - \frac{1}{n+1}$.
2. The sum telescopes — every middle piece cancels: $\left(\frac{1}{4} - \frac{1}{5}\right) + \left(\frac{1}{5} - \frac{1}{6}\right) + \cdots + \left(\frac{1}{48} - \frac{1}{49}\right) = \frac{1}{4} - \frac{1}{49}$.
3. Compute the ends: $\frac{49 - 4}{4 \cdot 49} = \frac{45}{196}$.

**Wrong turn: the memorized full sum.** $1 - \frac{1}{49} = \frac{48}{49}$ — choice (E) — is the telescoped sum *from $n = 1$*. The formula isn't the fact; the cancellation is. Rebuild the surviving ends from the actual limits, and the lower limit $4$ replaces the $1$.

**Answer: $\dfrac{45}{196}$ (B)**

**Example 5 · Q86 level · target 2:50**

*A sequence is defined by $s_1 = 5$, $s_2 = 12$, and $s_{n+1} = s_n - s_{n-1}$ for every integer $n \ge 2$. What is the sum of the first $100$ terms?*

1. Generate terms until the pattern repeats: $5,\ 12,\ 7,\ -5,\ -12,\ -7$, then $s_7 = 5$, $s_8 = 12$ — two consecutive terms recur, so the period is $6$.
2. Each full cycle sums to $5 + 12 + 7 - 5 - 12 - 7 = 0$.
3. Since $100 = 96 + 4$, the first $96$ terms form $16$ complete cycles totaling $0$; only $s_{97}$ through $s_{100}$ remain, equal to $s_1$ through $s_4$.
4. Sum $= 5 + 12 + 7 + (-5) = 19$.

**Wrong turn: a cycle declared from one repeat.** Seeing a single value recur (the $5$ at $s_7$) and declaring a period of $6$ happens to work here — but only because $s_8$ also matches $s_2$. A first-order-looking coincidence is not a cycle: this recurrence needs *two consecutive* terms to repeat before everything after is locked. Check both before reducing the index.

**Answer: $19$**

## Trigger cues

- "Each term after the first is [operation on the previous]" → write the recurrence and iterate.
- "Arithmetic sequence" plus any two known terms → jump formula $a_m = a_k + (m-k)d$; skip $a_1$ unless asked.
- A sequence fact and "what is term $n$" → count parameters: arithmetic and geometric each need two independent facts.
- "Doubled, then reduced by…" each round, *final* value given → invert the step and walk backward.
- A huge index (term $75$, term $100$) with a subtraction-flavored recurrence → hunt for a cycle; reduce the index mod the period.
- $f(x) = f(a - x)$ → pair inputs summing to $a$; the axis is $x = \frac{a}{2}$.
- Denominators like $n(n+1)$ in a long sum → split into $\frac{1}{n} - \frac{1}{n+1}$ and telescope from the actual limits.
- "How many terms are between…" → inequality on the explicit formula, then count integers carefully.
- Two repeating events with different cycle lengths → coincidences recur every $\operatorname{lcm}$ of the gaps.

## Trap gallery

- **Off-by-one in the formula.** Writing $a_n = a_1 + nd$ — term $n$ is $n - 1$ steps past term $1$.
- **Fencepost counting.** Calling integers $7$ through $36$ "$29$ terms"; the count is $36 - 7 + 1 = 30$.
- **Sign slips with negative ratios.** If $r = -2$ and the fifth term is $48$, the second term is $\frac{48}{(-2)^3} = -6$, not $6$.
- **Iterating the wrong direction.** Applying the forward rule to a known *later* term instead of inverting it.
- **Assuming a cycle too early.** One repeated value is not a period; two *consecutive* terms must repeat.
- **Symmetry that says nothing.** Under $f(x) = f(4 - x)$, knowing $f(2)$ is useless for $f(3)$ because $x = 2$ is the axis itself; $f(1)$ works, since $f(3) = f(1)$.
- **Answering the index instead of the term** (or vice versa) — reread whether the question wants $n$ or $a_n$.
- **Threshold blur.** "Exceeds $600$" is strict; find the first round the value passes the bound, not merely reaches it.

## Speed moves

- **Jump, don't rebuild.** Two known terms give $d$ in one division: $a_3 = 14$ and $a_8 = 39$ means five gaps cover $25$, so $d = 5$.
- **Sum = average times count.** Eleven terms from $9$ with $d = 4$: last is $49$, sum is $11 \cdot \frac{9 + 49}{2} = 319$.
- **Collapse repeated doubling.** Doubling four times is one multiplication by $2^4 = 16$; undo it with a single division by $16$.
- **Just count small iterations.** "Least number of rounds": start at $25$, rule $x \mapsto 2x - 10$, bound $300$ — listing $40, 70, 130, 250, 490$ shows round $5$ is first past $300$.
- **Trust the zero-sum cycle.** In a sum question over a periodic rule, total one cycle first — if it is $0$, a $100$-term sum reduces to a few leftover terms.
- **Push the choices through the recurrence.** When the choices are starting values, push the middle choice through the rule; the direction of the miss tells you where to move.

## Before you drill

- I jump between arithmetic terms with $a_m = a_k + (m-k)d$, never solving for $a_1$ first.
- I can state both sum forms $S_n = \frac{n(a_1 + a_n)}{2} = \frac{n\left(2a_1 + (n-1)d\right)}{2}$ from memory.
- Given $a_{n+1} = ra_n + c$ and a later term, I invert to $\frac{a_{n+1} - c}{r}$ and walk backward.
- I read $a_{n+1} = 2a_n - a_{n-1} + c$ instantly as "gaps grow by $c$."
- Facing term $75$ of a strange recurrence, I list terms until two consecutive values repeat, then reduce the index mod the period.
- I split $\frac{1}{n(n+1)}$ into $\frac{1}{n} - \frac{1}{n+1}$ on sight and telescope from the actual limits, not from $1$.
- I count integers from $m$ to $n$ inclusive as $n - m + 1$, every time.
