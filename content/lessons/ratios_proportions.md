# Ratios and Proportions: One Multiplier Carries Everything

## Why this matters

Ratio questions on the GMAT Focus Edition run the full difficulty range: quick one-step proportions at the low end, and chained ratios, shifted ratios, and two-blend mixtures at the Q86 tier. Every one of them yields to the same discipline — replace a ratio with concrete parts driven by a single multiplier $k$, and convert between ratios and fractions of a whole without hesitation. This chapter is also load-bearing for three others: rates, mixtures, and percent chains all lean on the multiplier habit built here.

Ideas 1–4 install the machinery; 5–10 cover the moves the exam layers on top — shifted ratios, blended ratios, proportionality in both directions. If you can run those mechanically, this topic becomes a reliable source of fast, sure points at every tier.

## The core ideas

Ideas 1–4 are the machinery; 5–10 are how the exam bends it.

1. **The multiplier.** $a : b = m : n$ means $a = mk$ and $b = nk$ for one positive multiplier $k$. True because a ratio fixes only the *relative* sizes; $k$ carries the actual scale. Writing $k$ down is the single habit that separates clean ratio work from guessing — ratio numbers are never counts until $k$ says so.
Check: $a : b = 5 : 9$ and $a = 35$. What is $b$? ⇒ $k = 7$, so $b = 63$.

2. **Splitting a total or a difference.** If two quantities are in ratio $m : n$, the total is $(m + n)k$ and the difference is $|m - n|k$. Example: parts in ratio $7 : 4$ with difference $27$ give $3k = 27$, so $k = 9$ and the parts are $63$ and $36$. One division recovers $k$ from any total or gap.
Check: Two quantities are in ratio $7 : 4$ and their total is $44$. The larger is? ⇒ $11k = 44$, $k = 4$ — the larger is $28$.

3. **Cross-multiplication.** $\dfrac{a}{b} = \dfrac{c}{d} \iff ad = bc$ for nonzero $b, d$. This is just multiplying both sides by $bd$; it turns any proportion into one linear equation — but simplify the known fraction first, and cross-multiply only when the numbers are already small.
Check: $\dfrac{a}{6} = \dfrac{10}{15}$. What is $a$? ⇒ $\frac{10}{15} = \frac{2}{3}$, so $a = 4$.

4. **Chaining ratios through a shared term.** Given $x : y$ and $y : z$, rescale each ratio so the $y$-parts match (use the LCM), then read off $x : y : z$. Example: $x : y = 2 : 5$ and $y : z = 3 : 4$ become $6 : 15$ and $15 : 20$, so $x : y : z = 6 : 15 : 20$. Ratios are scale-free, so rescaling changes nothing.
Check: $x : y = 1 : 2$ and $y : z = 6 : 5$. Then $x : y : z$ is? ⇒ rescale to $3 : 6$ and $6 : 5$ — so $3 : 6 : 5$.

5. **Ratios survive multiplication, not addition.** Scaling both terms by the same factor preserves a ratio ($2 : 3 = 20 : 30$), but adding the same number to both terms changes it: $20 : 70 = 2 : 7$, yet $30 : 80 = 3 : 8$. When people join or amounts are added, you must write a new equation — the old ratio is gone.

6. **Equal ratios add across.** If $\dfrac{a}{b} = \dfrac{c}{d} = r$, then $\dfrac{a + c}{b + d} = r$, because $a = rb$ and $c = rd$ give $a + c = r(b + d)$. This converts "the sum of the numerators is given" into one step.
Check: $\dfrac{a}{b} = \dfrac{c}{d} = \dfrac{3}{7}$ and $a + c = 24$. What is $b + d$? ⇒ $56$ — the combined fraction is still $\frac{3}{7}$.

7. **Direct and inverse proportion.** Direct: $y = kx$, so $y$ scales by the same factor as $x$ (if $x$ goes from $4$ to $10$, $y$ is multiplied by $2.5$: $y = 14$ becomes $35$). Inverse to the $n$th power: $y = \dfrac{k}{x^n}$, so multiplying $x$ by $t$ divides $y$ by $t^n$. Find $k$ from the given pair, or skip $k$ entirely and ride the scale factor.
Check: $y$ is inversely proportional to $x^2$ and $x$ doubles. What happens to $y$? ⇒ divided by $4$.

8. **Equal products hide a ratio.** If $3x = 4y = 6z$, set the common value to a convenient number — the LCM $12$ gives $x = 4$, $y = 3$, $z = 2$ — so $\dfrac{x}{z} = 2$. Works because each variable is the common value divided by its coefficient; note the coefficients end up *inverted* in the ratio.
Check: $3x = 4y = 6z$. Then $x : y : z$ is? ⇒ $4 : 3 : 2$ — plug the LCM $12$.

9. **Percent changes act on ratio terms as factors.** If $x : y = 8 : 3$, then increasing $x$ by $25\%$ and decreasing $y$ by $20\%$ gives $\dfrac{1.25 \times 8}{0.8 \times 3} = \dfrac{10}{2.4} = \dfrac{25}{6}$. The multiplier $k$ cancels, so you can compute directly on the ratio numbers — no totals needed.

10. **Mixtures: convert ratios to fractions of the whole first.** A blend with juice to water $5 : 3$ is $\dfrac{5}{8}$ juice. Only fractions of the whole combine linearly when blends are mixed; the raw ratio numbers do not. This idea is the doorway to the mixtures chapter — cross into it fluent.
Check: Juice to water is $5 : 3$. What fraction of the blend is juice? ⇒ $\dfrac{5}{8}$ — five parts of eight total.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*A recipe calls for flour and sugar in the ratio $5 : 2$. If a baker uses $12$ cups of sugar, how many cups of flour does the recipe require?*

1. Set up the proportion with matching order: $\dfrac{\text{flour}}{\text{sugar}} = \dfrac{5}{2} = \dfrac{f}{12}$.
2. The sugar side scaled by $6$ (from $2$ to $12$), so the flour side does too: $f = 5 \times 6 = 30$.

**Wrong turn: flipping the ratio.** Writing $\frac{f}{12} = \frac{2}{5}$ gives $f = 4.8$ — a fractional cup count that should itself raise an alarm. Anchor each number to its word: "flour to sugar, $5 : 2$" puts flour on top.

**Answer: $30$ cups**

**Example 2 · 605 level · target 1:40**

*A painter mixes blue and yellow pigment in the ratio $4 : 9$ to make $91$ liters of green paint. How many liters of blue pigment does the painter use?*

1. Write the parts with one multiplier: blue $= 4k$, yellow $= 9k$.
2. The total is $4k + 9k = 13k = 91$, so $k = 7$.
3. Blue $= 4k = 28$ liters. (Check: yellow $= 63$, and $28 + 63 = 91$.)

**Wrong turn: answering with the other part.** $63$ — the yellow amount — sits among the choices every time. The question asked for blue; label the parts before solving, not after.

**Answer: $28$ liters**

**Example 3 · 655 level · target 2:05**

*In a bookstore's inventory, the ratio of fiction titles to biography titles is $2 : 5$, and the ratio of biography titles to travel titles is $3 : 4$. If the store carries $164$ titles across these three categories, how many more travel titles than fiction titles does it carry?*

1. Align the two ratios on biographies. The LCM of $5$ and $3$ is $15$: rescale $2 : 5$ to $6 : 15$ and $3 : 4$ to $15 : 20$.
2. So fiction $= 6k$, biography $= 15k$, travel $= 20k$.
3. Total: $6k + 15k + 20k = 41k = 164$, so $k = 4$.
4. Travel minus fiction: $(20 - 6)k = 14 \times 4 = 56$. (Check: $24 + 60 + 80 = 164$, and $24 : 60 = 2 : 5$, $60 : 80 = 3 : 4$.)

**Wrong turn: gluing the ratios unaligned.** $2 : 5$ and $3 : 4$ do not concatenate into $2 : 5 : 4$ — that assigns biographies the value $5$ in one breath and $3$ in the next. The shared term must be made identical before the chain means anything.

**Answer: $56$**

**Example 4 · 705 level · target 2:30**

*A drawer contains red and black pens in the ratio $7 : 3$. After $8$ black pens are added to the drawer, the ratio of red to black pens becomes $7 : 5$. How many red pens are in the drawer?*

*A) $14$  B) $21$  C) $28$  D) $35$  E) $42$*

1. Before the change: red $= 7k$, black $= 3k$ for some positive integer multiplier $k$.
2. After adding $8$ black pens: $\dfrac{7k}{3k + 8} = \dfrac{7}{5}$.
3. Cross-multiply: $35k = 21k + 56$, so $14k = 56$ and $k = 4$.
4. Red $= 7k = 28$. (Check: black goes $12 \to 20$, and $28 : 20 = 7 : 5$.)

**Wrong turn: adding inside the ratio.** Turning $7 : 3$ into $7 : (3 + 8) = 7 : 11$ treats ratio numbers as counts. The $8$ pens join $3k$ actual pens, not the number $3$ — and a direction read confirms the setup: black's share grew, so its ratio term rose from $3$ toward $5$ against a fixed $7$.

**Answer: $28$ (C)**

**Example 5 · Q86 level · target 2:50**

*A metalworker has two alloys. In Alloy X, the ratio of copper to tin is $7 : 5$; in Alloy Y, the ratio of copper to tin is $1 : 3$. She melts portions of the two alloys together to produce $120$ kilograms of a new alloy in which copper and tin are in the ratio $1 : 1$. How many kilograms of Alloy X does she use?*

1. Convert every ratio to a fraction of the whole: Alloy X is $\dfrac{7}{12}$ copper, Alloy Y is $\dfrac{1}{4}$ copper, and the target is $\dfrac{1}{2}$ copper.
2. Let $x$ be the kilograms of Alloy X, so Alloy Y contributes $120 - x$. The target blend contains $\dfrac{1}{2} \times 120 = 60$ kg of copper.
3. Track copper: $\dfrac{7}{12}x + \dfrac{1}{4}(120 - x) = 60$.
4. Simplify: $\dfrac{7}{12}x - \dfrac{3}{12}x + 30 = 60$, so $\dfrac{1}{3}x = 30$ and $x = 90$.
5. Check: Alloy X gives $90 \times \dfrac{7}{12} = 52.5$ kg of copper; Alloy Y gives $30 \times \dfrac{1}{4} = 7.5$ kg. Copper $= 60$ kg, tin $= 60$ kg — exactly $1 : 1$.

**Wrong turn: blending the raw ratio numbers.** Averaging $7 : 5$ and $1 : 3$ term-by-term, or setting the mix so the ratio *numbers* average to $1 : 1$, ignores that the two ratios live on different wholes ($12$ parts versus $4$). Fractions of the whole are the only currency that mixes linearly — convert first, always.

**Answer: $90$ kilograms**

## Trigger cues

- "The ratio of $a$ to $b$ is $m : n$" plus any total, difference, or actual value → set $a = mk$, $b = nk$ and solve for $k$.
- "$x : y = \ldots$ and $y : z = \ldots$" → rescale both ratios so the shared term matches its LCM, then use one multiplier for all three.
- "If $6$ more are added, the ratio becomes …" → write parts as $mk$ and $nk$, apply the change to the *parts*, set up the new ratio, cross-multiply.
- "$\dfrac{a}{b} = \dfrac{c}{d}$ and $a + c$ is given" → equal ratios add across: $\dfrac{a+c}{b+d}$ equals the common ratio.
- "Inversely proportional to the square of" → $y = \dfrac{k}{x^2}$; when $x$ triples, divide $y$ by $9$.
- "$2x = 3y = 8z$" → set the common value to the LCM and read off each variable; the coefficients invert.
- "Two blends are combined so that the ratio becomes …" → convert each ratio to a fraction of the whole, then track one ingredient's total amount.
- "How many of the larger/smaller part …" → find $k$ first; the answer is a ratio term times $k$, and the *other* part is always among the choices.

## Trap gallery

- **Treating ratio numbers as actual counts.** $a : b = 4 : 7$ does not mean $a = 4$; it means $a = 4k$. The multiplier always comes first.
- **Assuming the old ratio survives an addition.** Adding $10$ to each term of $20 : 70$ gives $30 : 80 = 3 : 8$, not $2 : 7$. Additions demand a fresh equation.
- **Averaging the ratios in a mixture.** Equal amounts of a $1 : 1$ blend and a $1 : 3$ blend give juice fraction $\dfrac{1}{2} \cdot \dfrac{1}{2} + \dfrac{1}{2} \cdot \dfrac{1}{4} = \dfrac{3}{8}$ — a $3 : 5$ ratio, not the "average" $1 : 2$. Convert to fractions of the whole before combining.
- **Chaining without aligning.** From $x : y = 2 : 5$ and $y : z = 3 : 4$, the combined ratio is $6 : 15 : 20$, never $2 : 5 : 4$. The shared term must be identical in both ratios first.
- **Flipping direct and inverse.** If $y$ is inversely proportional to $x^2$ and $x$ doubles, $y$ is divided by $4$, not doubled. Write $y = \dfrac{k}{x^2}$ before touching numbers.
- **Reading $2x = 3y$ as $x : y = 2 : 3$.** It gives $x : y = 3 : 2$ — the coefficients swap sides. Solve $\dfrac{x}{y} = \dfrac{3}{2}$ explicitly or plug the LCM.
- **Answering the wrong part.** Every part-and-total stem seeds the choices with the other part, the total, and $k$ itself. Label what the question asks before computing.

## Speed moves

- **Divide the total by the sum of parts.** Ratio $4 : 9$, total $91$: compute $91 \div 13 = 7$ once, then multiply — no equations needed.
- **Pick convenient numbers when the ratio is all you have.** For "$x : y = 8 : 3$; $x$ rises $25\%$, $y$ falls $20\%$," just set $x = 8$, $y = 3$ and compute $\dfrac{10}{2.4} = \dfrac{25}{6}$; the multiplier cancels.
- **LCM plug for equal products.** For $3x = 4y = 6z$, set the common value to $12$ and instantly get $x = 4$, $y = 3$, $z = 2$.
- **Skip the constant in proportion problems.** Inverse-square with $x$ going from $3$ to $6$: $y$ is divided by $2^2 = 4$, so $y = 32$ becomes $8$ — no need to compute $k = 288$.
- **Backsolve shifted-ratio questions.** "Red to black $7 : 3$; after $8$ black pens the ratio is $7 : 5$" — test red $= 28$: black was $12$, becomes $20$, and $28 : 20 = 7 : 5$. One substitution.
- **Use divisibility on the answer choices.** If three quantities are $6k$, $15k$, $20k$, their total must be a multiple of $41$ — eliminate any total-type choice that is not, and any part-type choice not divisible by its ratio term.
- **Read the direction of a shift first.** A ratio moving from $7 : 3$ toward $7 : 5$ says the second quantity grew; any setup or choice implying otherwise is dead before arithmetic starts.

## Before you drill

- I write $a = mk$, $b = nk$ the moment I see a ratio, and I never treat ratio numbers as counts.
- I can chain $x : y$ and $y : z$ into $x : y : z$ by rescaling the shared term to its LCM.
- I know scaling preserves a ratio but adding to both terms does not, and I set up a new equation after any join/leave event.
- I can use $\dfrac{a}{b} = \dfrac{c}{d} \Rightarrow \dfrac{a+c}{b+d} = \dfrac{a}{b}$ on sight.
- I translate "inversely proportional to $x^n$" into $y = \dfrac{k}{x^n}$ and can solve via the scale factor alone.
- I convert every mixture ratio into a fraction of the whole before blending.
- I can turn $2x = 3y = 8z$ into exact values by plugging the LCM as the common value.
- I check which part the question asks for before I answer, because the other part is always among the choices.
