# Probability: Count, Multiply, or Take the Complement

## Why this matters
GMAT Focus probability questions are counting problems in disguise: nearly every one reduces to "favorable outcomes over total outcomes" plus two or three multiplication steps. At the Q86 level the exam layers in one twist — an "at least" condition, a shrinking deck, a restricted pool, or a parity condition — and the winning move is recognizing which of a small set of tools cracks that twist in under two minutes.

## The core ideas

1. **Basic definition.** When all outcomes are equally likely, $P(A) = \dfrac{\text{favorable outcomes}}{\text{total outcomes}}$. This works because equal likelihood turns probability into pure counting.

2. **Complement rule.** $P(A) = 1 - P(\text{not } A)$. Whenever the "not" side is one clean case, count that side instead — one computation beats four.

3. **"At least one."** $P(\text{at least one}) = 1 - P(\text{none})$. "None" is a single all-failures case, so it multiplies out directly.

4. **Independent events multiply.** If $A$ and $B$ are independent, $P(A \text{ and } B) = P(A)\cdot P(B)$. Independence means one outcome tells you nothing about the other, so the fractions stack.

5. **Without replacement: shrink as you go.** Drawing sequentially, multiply conditional fractions with denominators that drop by one each draw: e.g., two of a kind from a group is $\dfrac{k}{n}\cdot\dfrac{k-1}{n-1}$. Each draw removes one object from the pool.

6. **Combination form.** For an unordered selection of $r$ objects from $n$, $P = \dfrac{\text{favorable selections}}{\binom{n}{r}}$ — count favorable committees over total committees. It agrees with sequential multiplication because order cancels top and bottom.

7. **Stay consistent.** Count ordered over ordered or unordered over unordered — never mix. Mixing multiplies or divides your answer by $r!$ silently.

8. **"Or" means inclusion-exclusion.** $P(A \text{ or } B) = P(A) + P(B) - P(A \text{ and } B)$. The subtraction removes the overlap that got counted twice.

9. **Exactly one of two independent events.** $P = p(1-q) + (1-p)q$: the two disjoint ways ("first yes, second no" and "first no, second yes") add. With $p = 0.2$ and $q = 0.5$: $(0.2)(0.5) + (0.8)(0.5) = 0.5$.

10. **Restricted sample space.** Phrases like "one of the remote employees is selected" mean the denominator is the restricted group, not the whole population. The condition redefines "total outcomes."

11. **Parity rules.** A sum is even exactly when the two numbers share parity; a product is even exactly when at least one factor is even. So $P(\text{product even}) = 1 - P(\text{all factors odd})$ — for two dice, $1 - \frac{1}{2}\cdot\frac{1}{2} = \frac{3}{4}$.

12. **Symmetry: fix one object.** In a random circular seating of $n$ people, fix one person; the other named person is equally likely to be in any of the $n-1$ remaining seats, and $2$ are adjacent, so $P(\text{adjacent}) = \dfrac{2}{n-1}$ (for $n = 6$, that is $\frac{2}{5}$).

## Worked examples

**Example 1**

*A jar contains $4$ red and $6$ blue marbles. Two marbles are drawn at random without replacement. What is the probability that both are blue?*

1. First draw blue: $\dfrac{6}{10}$.
2. Second draw blue, given one blue is gone: $\dfrac{5}{9}$.
3. Multiply: $\dfrac{6}{10}\cdot\dfrac{5}{9} = \dfrac{30}{90} = \dfrac{1}{3}$.
4. Cross-check with combinations: $\dfrac{\binom{6}{2}}{\binom{10}{2}} = \dfrac{15}{45} = \dfrac{1}{3}$. Same answer, as it must be.

**Answer: $\frac{1}{3}$**

**Example 2**

*A reading club selects $3$ books at random from a shelf holding $5$ novels and $4$ biographies. What is the probability that at least $2$ of the selected books are biographies?*

1. Total selections: $\binom{9}{3} = 84$.
2. "At least $2$ biographies" splits into two disjoint cases: exactly $2$ and exactly $3$.
3. Exactly $2$ biographies: $\binom{4}{2}\cdot\binom{5}{1} = 6 \cdot 5 = 30$.
4. Exactly $3$ biographies: $\binom{4}{3} = 4$.
5. Probability: $\dfrac{30 + 4}{84} = \dfrac{34}{84} = \dfrac{17}{42}$.

**Answer: $\frac{17}{42}$**

**Example 3**

*A crate of $10$ flashlights contains exactly $2$ defective units. An inspector tests the flashlights one at a time, in random order and without replacement. What is the probability that the first defective flashlight the inspector finds is the fourth one tested?*

1. Translate the event into an exact sequence: tests $1$–$3$ are all good, and test $4$ is defective.
2. Good on test 1: $\dfrac{8}{10}$. Good on test 2: $\dfrac{7}{9}$. Good on test 3: $\dfrac{6}{8}$.
3. Defective on test 4, with $7$ flashlights left of which $2$ are defective: $\dfrac{2}{7}$.
4. Multiply: $\dfrac{8}{10}\cdot\dfrac{7}{9}\cdot\dfrac{6}{8}\cdot\dfrac{2}{7} = \dfrac{672}{5040} = \dfrac{2}{15}$.

**Answer: $\frac{2}{15}$**

## Trigger cues

- "At least one …" → compute $1 - P(\text{none})$ immediately.
- "Without replacement" or "one after another" → sequential fractions with shrinking denominators.
- "A committee/team of $r$ is chosen from …" → combination form: favorable $\binom{\cdot}{\cdot}$ counts over $\binom{n}{r}$.
- "Multiple of $a$ or multiple of $b$" → inclusion-exclusion; count multiples with $\lfloor N/a \rfloor$, subtract multiples of $\operatorname{lcm}(a,b)$.
- "Exactly one of the two events occurs" → $p(1-q) + (1-p)q$.
- "If one of the [restricted group] is selected …" → the denominator is that group's size only.
- "Sum is even/odd" or "product is even/odd" → parity rules, not brute-force listing.
- "Randomly seated around a circular table … adjacent" → fix one person, count favorable seats out of $n-1$.
- "The first [special item] found is the $k$th tested" → multiply the exact good-good-…-special sequence.

## Trap gallery

- **Frozen denominator.** Using $\frac{3}{8}\cdot\frac{3}{8}$ for two draws without replacement — the second denominator (and numerator) must shrink.
- **Adding when you should multiply.** "Both events happen" is multiplication; addition is for disjoint alternatives only.
- **Wrong complement.** The complement of "at least $2$" is "at most $1$" — not "none." Subtracting only the zero case overcounts.
- **Ordered/unordered mixing.** Counting favorable outcomes as ordered sequences but the total as $\binom{n}{r}$ inflates the answer by $r!$.
- **Forgetting the overlap.** Adding $P(\text{mult of }4) + P(\text{mult of }6)$ without subtracting multiples of $12$ double-counts.
- **False fifty-fifty.** "Tens digit greater than units digit" is not automatically $\frac{1}{2}$ by symmetry — ties break the symmetry. (Here it happens to be $\frac{45}{90} = \frac{1}{2}$, but only because there are $9$ ties and $36$ reversals; you must count.)
- **Whole-population denominator.** When the selection is from a restricted pool, dividing by the full population size answers a different question.

## Speed moves

- **Complement first, always ask.** For $3$ independent checks each passing with probability $0.9$, $P(\text{at least one fails}) = 1 - 0.9^3 = 0.271$ in one line.
- **Count integers, not probabilities.** From $1$ to $72$: multiples of $4$ or $6$ number $18 + 12 - 6 = 24$, so the probability is $\frac{24}{72} = \frac{1}{3}$ — no fractions until the last step.
- **Cancel before you multiply.** In Example 3, the $8$'s and $7$'s cancel across the chain, leaving $\frac{6\cdot 2}{10\cdot 9} = \frac{2}{15}$ with zero big arithmetic.
- **Fix a person to kill circular symmetry.** Adjacency at a round table of $n$ is $\frac{2}{n-1}$ instantly — no arrangement counting.
- **Parity beats enumeration.** "Product of two dice is even" via complement: both odd is $\frac{1}{2}\cdot\frac{1}{2} = \frac{1}{4}$, so the answer is $\frac{3}{4}$ — never list $36$ cells.
- **Sanity-band the answer.** Probabilities live in $[0,1]$, and "at least one" answers must exceed the single-event probability; eliminate choices that violate either before computing.

## Before you drill

1. I can state $P(A) = 1 - P(\text{not }A)$ and name the exact complement of "at least $k$."
2. I shrink both numerator and denominator on every without-replacement draw.
3. I can set up committee probabilities as $\binom{\cdot}{\cdot}$ counts over $\binom{n}{r}$ and never mix ordered with unordered.
4. I subtract the overlap every time I see "or."
5. I can write $p(1-q) + (1-p)q$ for "exactly one" without deriving it.
6. I check whether a stated condition restricts the sample space before choosing my denominator.
7. I reach for parity and symmetry (fix one object) before I reach for a full listing.
