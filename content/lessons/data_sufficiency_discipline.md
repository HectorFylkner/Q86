# Data Sufficiency: Decision Discipline Over Computation

## Why this matters

Data Sufficiency questions do not ask you to solve anything. They ask a stranger question: *would* this information pin down an answer, yes or no? Every DS miss in the error log traces to process, not mathematics — combining statements that should stay separate, computing a value nobody asked for, or reading "the answer is definitely no" as "insufficient." The format rewards a fixed decision procedure executed identically every time, which is exactly why it can be trained to near-zero error. This chapter installs that procedure: the AD/BCE tree, the value versus yes/no distinction, and statement isolation. The mathematics inside any DS question is ordinary; the discipline around it is the entire game.

## The core ideas

1. **The question is "could I," never "what is."** Sufficiency means the information would determine a unique answer. The moment you know it would, stop — finishing the arithmetic is time donated to no one.

2. **The five choices are a fixed tree, not five sentences.** A: (1) alone works, (2) alone does not. B: (2) alone works, (1) alone does not. C: only together. D: each alone. E: even together, not enough. These never change; know them as positions, not paragraphs.

3. **The AD/BCE split halves the problem with one decision.** Evaluate statement (1) alone first. If it is sufficient, the answer lives in $\{A, D\}$; if not, in $\{B, C, E\}$. Then statement (2) alone picks the branch: sufficient after (1) worked → D; sufficient after (1) failed → B. Only when both alone fail do you consider them together: sufficient → C, still not → E.

4. **Value questions demand exactly one value.** For "What is $x$?", a statement is sufficient only if it forces a single number. Producing two legal values — any two — kills sufficiency instantly, so the fastest work is a hunt for a second value, not a solution.

5. **Yes/no questions demand one consistent answer — and "always no" counts.** "Is $x > 0$?" is answered sufficiently by information that forces yes every time *or* forces no every time. A statement proving $x$ is negative answers the question. Definitely-no is sufficient; sometimes-yes is not.

6. **Statement isolation is physical, not mental.** Facts learned from (1) must not touch your evaluation of (2) alone. When you move to (2), rebuild from the stem only. If you solved $y = 3$ in statement (1), that $y$ does not exist while you read statement (2).

7. **The stem's constraints bind everything.** "Positive integer," "distinct," "nonzero" — conditions in the stem apply inside both statements. Half of all trap cases die because the tester forgot the stem said *integer*.

8. **Kill sufficiency with two cases; prove it with structure.** Insufficiency needs only one pair of examples with different answers — pick them adversarially: $0$, $1$, negatives, fractions, extremes. Sufficiency needs an argument that no such pair can exist, which usually falls out of algebra or a counting fact.

9. **Equation counting is a heuristic with famous failures.** Two independent linear equations pin two unknowns — but dependent equations ($2x + 2y = 10$ after $x + y = 5$) add nothing, and nonlinear equations can pin a value with one equation ($x^2 = 0$) or leave two values with two. Verify independence; never just count.

10. **The C trap and the D discipline.** If combining feels natural, first re-ask whether each statement alone already worked (that is D, not C). C is correct only when both alone genuinely fail. Test-writers build statements that *look* like they need each other.

11. **Rephrase the question before touching a statement.** "Is $\frac{x}{y} > 1$?" is not "is $x > y$?" unless $y > 0$. Thirty seconds spent turning the stem into its cleanest equivalent form pays back on both statements.

## Worked examples

**Example 1**

*What is the value of $x$?*

*(1) $x + 2y = 11$*

*(2) $y = 3$*

1. Value question: sufficiency means exactly one value of $x$.
2. Statement (1) alone: one equation, two unknowns, both free — $x = 1, y = 5$ and $x = 3, y = 4$ both work. Two values of $x$; insufficient. The tree prunes to $\{B, C, E\}$.
3. Statement (2) alone, rebuilt from the stem only: $y = 3$ says nothing about $x$. Insufficient. Prune to $\{C, E\}$.
4. Together: $x + 2(3) = 11$, so $x = 5$ — one value, and no need to admire it. Sufficient.

**Answer: C**

**Example 2**

*Is $x > 0$?*

*(1) $x^2 = 9$*

*(2) $x^3 < 0$*

1. Yes/no question: a statement is sufficient if it forces one consistent answer — including a consistent *no*.
2. Statement (1) alone: $x = 3$ gives yes, $x = -3$ gives no. Two different answers; insufficient. Prune to $\{B, C, E\}$.
3. Statement (2) alone: an odd power keeps its base's sign, so $x^3 < 0$ forces $x < 0$. The answer to "is $x > 0$?" is *no* — every time. A guaranteed no is a complete answer; sufficient.
4. The branch is decided: statement (2) alone works after statement (1) failed.

**Answer: B**

**Example 3**

*If $x$ and $y$ are positive integers, is $x + y$ even?*

*(1) $xy$ is odd.*

*(2) $x - y$ is even.*

1. Rephrase first: $x + y$ is even exactly when $x$ and $y$ share a parity (both odd or both even).
2. Statement (1) alone: a product is odd only when *both* factors are odd. Same parity, so $x + y$ is even — always yes. Sufficient. Prune to $\{A, D\}$.
3. Statement (2) alone, from the stem only: a difference is even exactly when the two numbers share a parity — the same fact in different clothes. Always yes; sufficient.
4. Each statement alone answers the question. The pull to say "together they obviously work" is the C trap; C requires that each alone *failed*.

**Answer: D**

## Trigger cues

- "What is the value of …" → sufficient means exactly one value; hunt for a second value to kill the statement.
- "Is …" (yes/no stem) → sufficient means always yes or always no; a forced no is sufficient.
- Finished judging statement (1) → prune to $\{A,D\}$ or $\{B,C,E\}$ before reading statement (2).
- Moving to statement (2) → rebuild from the stem alone; anything derived in (1) is contaminated.
- Two linear equations dangled across the statements → check independence before believing "two equations, two unknowns."
- The statements feel made for each other → re-test each alone; the C trap lives exactly here.
- Picking test numbers → reach for the stem-legal extremes: $0$, $1$, negatives, fractions, equal values.

## Trap gallery

- **Solving to the bitter end.** Computing $x = 5$ when "one value exists" was already visible — the format pays for the decision, not the number. Stop at sufficiency.
- **The C trap.** Choosing C because the statements *work well* together, when one (or each) alone already sufficed. C asserts that both alone fail; verify that failure explicitly.
- **Carryover contamination.** Using statement (1)'s conclusion while judging statement (2) alone. Isolation is the whole skill: re-derive from the stem, every time.
- **"No" misread as "insufficient."** A statement forcing the answer *no* has answered the yes/no question. Only a mix of yes-cases and no-cases is insufficient.
- **Forgetting the stem's fine print.** Testing $x = \frac{1}{2}$ when the stem said integer, or $n = 0$ when it said positive — conclusions drawn from illegal cases are noise.
- **Equation counting on autopilot.** Declaring C because "two equations, two unknowns" when the equations are dependent, or missing that one quadratic already pins the value.
- **Friendly-number myopia.** Testing $2$ and $4$, getting yes twice, and declaring sufficiency. Two agreeing cases prove nothing; adversarial cases ($1$, odd/even mixes, negatives) are the test that counts.

## Speed moves

- **Start with the easier statement.** The AD/BCE tree works in either order — judging the simpler statement first prunes the space at a discount. If (2) is one line, take it first and prune $\{A,D\}$ versus $\{B,C,E\}$ from the other side: sufficient → $\{B,D\}$, not → $\{A,C,E\}$.
- **Rephrase once, use twice.** Ten seconds converting "is $\frac{m}{15}$ an integer?" into "is $m$ divisible by 3 and 5?" makes both statements one-glance decisions.
- **Two cases or a reason.** The fastest insufficiency proof is a yes-case plus a no-case; the fastest sufficiency proof is a one-line structural fact ("product odd → both odd"). If you are doing more work than that, you are computing, not deciding.
- **Memorize the two parity facts.** "Product odd ⟺ both odd" and "difference even ⟺ same parity" settle a startling fraction of integer DS statements on sight.
- **Bank the D-check.** Whenever either statement proves sufficient, spend five deliberate seconds re-verifying the other one alone — the A-versus-D and B-versus-D errors are one cheap check away from extinct.

## Before you drill

- I can recite the five DS choices as tree positions without reading them.
- I judge statement (1) alone and prune to $\{A,D\}$ or $\{B,C,E\}$ before reading statement (2).
- I rebuild from the stem when evaluating statement (2) — nothing from (1) leaks across.
- On value questions I hunt for a second value instead of solving for the first.
- On yes/no questions I treat a forced no as sufficient, every time.
- I re-verify that both statements alone failed before I allow myself to choose C.
- I test stem-legal adversarial cases — $0$, $1$, negatives, fractions — not friendly ones.
