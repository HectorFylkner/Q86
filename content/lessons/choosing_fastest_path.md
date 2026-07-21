# Choosing the Fastest Path: Method Selection as a Habit

## Why this matters

At the level this platform targets, the questions you can solve and the questions you can solve *in budget* are different sets, and the gap between them is almost never knowledge — it is method choice. Nearly every quant problem yields to two or three of the four standard attacks (algebra, backsolving, smart numbers, testing cases), but their costs differ by a factor of two or three on the same question. The exam gives about $2\!:\!08$ per question; a wrong first path costs a minute you never get back, and switching mid-solve costs double. This chapter trains the choice itself: read the stem *and the answer choices*, commit to a path within fifteen seconds, and know the checkpoint at which a struggling path gets abandoned. Every worked example below is solved more than one way, with the clock running on each — the comparison, not the answer, is the lesson.

## The core ideas

1. **Four tools, one decision.** Algebra translates the story into equations and solves. Backsolving runs answer choices through the story until one fits. Smart numbers replace abstract quantities with concrete ones you choose. Testing cases probes a claimed property with adversarial examples. Every path reaches the answer; the skill is knowing which reaches it *first*.

2. **The answer choices are instructions.** Variables in the choices → smart numbers. Clean, sorted numbers in the choices and a "what was the original / how many" stem → backsolving is live. "Must be true / could be true" → test cases. Choices in weird exact forms ($\frac{17}{42}$, $3 + 3\sqrt{2}$) → they came from algebra, so do the algebra.

3. **Percent or fraction of an unspecified whole → the whole is $100$ (or the LCM).** If no dollar amount or population is given, you are free to choose one; $100$ turns percent chains into two-digit arithmetic, and the LCM of the denominators does the same for fraction stories.

4. **Backsolve from the middle.** Numeric choices come sorted. When the story responds monotonically ("too big → go smaller"), testing B or D first either settles the question outright or eliminates at least two choices in one computation. Starting at A throws that leverage away.

5. **Smart numbers must be innocent.** Avoid $0$ and $1$ (they collapse multiplication), avoid numbers already in the stem (they create accidental coincidences), and pick values that keep every division whole. If two different smart-number runs disagree with a choice, the choice is dead — that is the point.

6. **Commit in fifteen seconds, checkpoint at ninety.** Read stem and choices, name the path, start. If at roughly ninety seconds the algebra is sprawling — three unknowns, fractions breeding — downgrade to the concrete path (backsolve or smart numbers) *once*, deliberately. One planned downgrade is strategy; repeated switching is panic.

7. **Algebra keeps two structural edges.** It is the only path that proves uniqueness, and it is fastest exactly when the translation is one clean equation. "Three consecutive integers sum to 87" deserves algebra, not choice-testing.

8. **Know the pre-solved forms.** Two workers with alone-times $a$ and $b$ finish together in $\frac{ab}{a+b}$. Equal up-down percent moves net $-\frac{p^2}{100}\%$. Average speed over equal distances is the harmonic mean. Each formula replaces ninety seconds of setup on sight.

9. **Time is banked, not saved.** A forty-second question is not a victory lap — it is a deposit spent on the D5 grinder four questions later. The fastest path matters *because* the section is a single shared budget.

## Worked examples

**Example 1**

*A jacket's price was marked up $40\%$ and the new price was then discounted $25\%$. If the final price was $\$315$, what was the original price?*

*A) $\$280$  B) $\$290$  C) $\$300$  D) $\$310$  E) $\$325$*

1. Path A — algebra with factors (about $35$ seconds): the chain is $P \times 1.4 \times 0.75 = 315$. Since $1.4 \times 0.75 = 1.05$, we get $P = \frac{315}{1.05} = 300$.
2. Path B — backsolve from the middle (about $50$ seconds): test C, $P = 300$: markup gives $300 \times 1.4 = 420$; discount gives $420 \times 0.75 = 315$. Fits on the first try — but only because the truth happened to sit at C; budget for two runs when you choose this path.
3. The comparison: both work, but the factor habit turns this into one division. Backsolving is the *insurance* path here, not the primary — choose it when the algebraic chain is murky, not when it is two factors.

**Answer: C**

**Example 2**

*A machine produces $w$ widgets every $m$ minutes at a constant rate. At this rate, how many widgets does it produce in $h$ hours?*

*A) $\frac{60wh}{m}$  B) $\frac{wm}{60h}$  C) $\frac{wh}{60m}$  D) $\frac{60wm}{h}$  E) $\frac{mh}{60w}$*

1. Variables in the answer choices — the strongest smart-numbers cue there is.
2. Path A — smart numbers (about $40$ seconds): let $w = 10$, $m = 5$, $h = 2$. Rate is $10$ widgets per $5$ minutes, so $2$ per minute; $2$ hours is $120$ minutes; target $= 240$. Now evaluate choices: A gives $\frac{60 \cdot 10 \cdot 2}{5} = 240$ — a hit; a quick scan shows no other choice comes close ($B: \frac{50}{120}$, $D: 1500$), so no tiebreak run is needed.
3. Path B — pure algebra (about $55$ seconds, and easier to fumble): rate $= \frac{w}{m}$ widgets per minute; $h$ hours $= 60h$ minutes; total $= \frac{w}{m} \cdot 60h = \frac{60wh}{m}$. Same place — but every unit conversion is a chance to put the $60$ on the wrong floor, which is exactly what choices B and C are selling.
4. The comparison: with concrete numbers, the units cannot betray you; the arithmetic checks itself against the story. When choices carry variables, concreteness is not the slow path — it is the *safe* path at the same speed.

**Answer: A**

**Example 3**

*Working alone at constant rates, pump $A$ fills a tank in $6$ hours and pump $B$ fills the same tank in $3$ hours. Working together, how many hours do the two pumps need to fill the tank?*

*A) $1.5$  B) $2$  C) $2.5$  D) $4$  E) $4.5$*

1. Path A — the pre-solved form (about $15$ seconds): $\frac{ab}{a+b} = \frac{6 \cdot 3}{6 + 3} = \frac{18}{9} = 2$.
2. Path B — rates from scratch (about $45$ seconds): $\frac{1}{6} + \frac{1}{3} = \frac{1}{6} + \frac{2}{6} = \frac{1}{2}$ tank per hour, so $2$ hours. Correct, and three times the cost of the formula.
3. Path C — backsolve (about $60$ seconds): test B, $2$ hours: $A$ fills $\frac{2}{6} = \frac{1}{3}$, $B$ fills $\frac{2}{3}$; total one tank. Fits — but you rebuilt the rate addition anyway, so this path did algebra's work at retail price.
4. The comparison: a memorized form is the fastest path in disguise — it *is* the algebra, done once at home. Sanity check the answer against the structure: together must beat the faster pump alone ($2 < 3$ ✓), which also executes choices D and E without arithmetic.

**Answer: B**

## Trigger cues

- Variables in the answer choices → smart numbers; pick innocent values and evaluate every choice once.
- Sorted numeric choices under a "find the original / how many" stem → backsolve, starting from B or D.
- Percent or fraction of an unspecified whole → set the whole to $100$ or the LCM of the denominators.
- "Must be true" / "could be true" → test adversarial cases against each choice; one counterexample deletes a choice.
- Exact surd or ugly-fraction answer choices → the writers did algebra; join them.
- Two alone-times and a "together how long" → $\frac{ab}{a+b}$ on sight.
- Ninety seconds in and the equation is still growing → one deliberate downgrade to a concrete path.

## Trap gallery

- **Autopilot algebra.** Translating every stem into equations because that is the trained reflex — the choice of path was never made, so the expensive path wins by default. Read the choices first.
- **Backsolving from A.** Testing choices in order wastes the sortedness; a middle-out start narrows five choices to at most three with one computation, while a top-down start guarantees only one elimination.
- **Smart numbers that collapse.** Choosing $1$ (multiplication disappears), $0$ (everything disappears), or a stem number (accidental matches) — several wrong choices then agree with the target, and the run must be redone with cleaner values.
- **One confirming case on must-be-true.** A case where the claim holds proves nothing; only the failed hunt for a counterexample earns "must." The confirming case is the trap's bait.
- **Mid-solve churn.** Ninety seconds of algebra, thirty of backsolving, back to algebra — each switch repays the setup cost from zero. Downgrade once at the checkpoint or ride the chosen path home.
- **Formula-shaped guessing.** Reaching for $\frac{ab}{a+b}$ when one pipe *drains* — the pre-solved form covers the pattern it covers; check the story matches before spending the shortcut.

## Speed moves

- **Choices before stem, on purpose.** Five seconds scanning the answers (variables? sorted numbers? weird forms? spreads?) usually decides the path before the stem is finished.
- **Middle-out testing.** From B or D, "too big / too small" resolves the remaining direction — average $1.6$ tests to a verdict across a five-choice set.
- **The $100$ reflex.** Any percent story without a stated total starts at $100$ before the second sentence is read.
- **Precompute the innocents.** Keep a private stable of smart numbers — $2, 3, 5, 7$ for independent quantities, LCM-based picks for divisibility stories — so choosing values costs zero seconds.
- **Say the path out loud (to yourself).** "Backsolve from D" as a spoken commitment measurably reduces mid-solve churn; the platform's example cards train exactly this tap.
- **Bank the structure check.** Before any arithmetic, ask what the answer must beat ("together beats the faster pump alone") — it deletes choices for free and catches wrong paths early.

## Before you drill

- I read the answer choices before choosing a method, every question.
- I can name the cue for each tool: variable choices, sorted numerics, unspecified wholes, must-be-true stems.
- I commit to a path within fifteen seconds and say the commitment to myself.
- I backsolve from B or D, never from A.
- My smart numbers avoid $0$, $1$, and every number already in the stem.
- I hold one deliberate downgrade for the ninety-second checkpoint — and I do not switch twice.
- I check each answer against the story's structure before trusting the arithmetic.
