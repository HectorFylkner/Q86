# Rates, Speed, and Work: One Equation in Every Disguise

## Why this matters

Every rate problem on the GMAT Focus Edition — machines filling orders, pumps filling tanks, travelers catching up or meeting — is the single identity $W = R \cdot T$ dressed in a different costume. The exam tests this from warm-up difficulty to the hardest quant questions, and at the top end it layers two or three moves — a late joiner, a unit switch, a clock-time answer, an unknown solo time that breeds a quadratic — into one stem. The layers peel off one at a time for anyone holding the small toolkit below.

Ideas 1–4 build the work machinery, 5 handles staged jobs, 6–7 cover motion, and 8 is the unit discipline that protects all of it. The chapter leans on the multiplier habit from the ratios chapter; the mixtures chapter borrows the weighted thinking that first appears here in average speed.

## The core ideas

Ideas 1–4 are the work machinery; 5 stages it; 6–7 are motion; 8 protects everything.

1. **The master identity.** $W = R \cdot T$ (work equals rate times time), and for motion $d = s \cdot t$. Every formula in this chapter is this equation solved for a different letter, so if you forget a shortcut, rebuild it from here — twenty seconds of derivation beats a misremembered formula every time.
Check: A car travels at $72$ km/h for $40$ minutes. How far does it go? ⇒ $72 \times \frac{40}{60} = 48$ km.

2. **Solo time defines rate.** "Alone at a constant rate, $A$ finishes in $T$ hours" means $R_A = \frac{1}{T}$ job per hour. This is true by definition — one whole job divided by $T$ hours — and it is the translation step every work problem starts with.
Check: Alone, a printer finishes a run in $8$ hours. Its rate is? ⇒ $\frac{1}{8}$ of the run per hour.

3. **Rates add; times never do.** When workers run simultaneously, $\frac{1}{T_{\text{tog}}} = \frac{1}{T_A} + \frac{1}{T_B}$. It works because in one hour the pile of finished work is the sum of what each contributes. The sanity bound is free: together must beat the fastest solo worker.
Check: Solo times $4$ and $12$ hours. Together? ⇒ $\frac{1}{4} + \frac{1}{12} = \frac{1}{3}$ — so $3$ hours.

4. **Two-worker shortcuts.** Combined time: $T_{\text{tog}} = \frac{ab}{a+b}$ (e.g., $4$ and $12$ hours give $\frac{48}{16} = 3$ hours). Extracting a solo time from a together time: $T_B = \frac{T_A \cdot T_{\text{tog}}}{T_A - T_{\text{tog}}}$ (together $4$, alone $6$ gives $\frac{24}{2} = 12$, and indeed $\frac{1}{6} + \frac{1}{12} = \frac{1}{4}$). Both are just idea 3 rearranged.
Check: Together $4$ hours; $A$ alone $6$ hours. $B$ alone? ⇒ $\frac{6 \times 4}{6 - 4} = 12$ hours.

5. **Staged jobs: fractions sum to one.** When workers start, stop, or swap, give each worker their *own* hours and write $r_1 t_1 + r_2 t_2 + \dots = 1$. The whole job is $1$, so the pieces must account for all of it. This one template absorbs every "joined later / left early / returned" stem the exam writes.

6. **Average speed is total distance over total time** — never the average of the speeds. For equal distances at speeds $a$ and $b$: $s_{\text{avg}} = \frac{2ab}{a+b}$. Out at $30$, back at $60$ gives $\frac{3600}{90} = 40$, not $45$, because more clock time is spent at the slow speed. The average always sits closer to the slower leg.
Check: Out at $30$ km/h, back the same distance at $60$ km/h. Average speed? ⇒ $\frac{2 \times 30 \times 60}{90} = 40$ km/h.

7. **Relative speed collapses two movers into one.** Toward each other: closing speed $= a + b$. Same direction: the gap changes at $a - b$. Then $t = \frac{\text{gap}}{\text{relative speed}}$. Runners at $14$ and $9$ km/h open a $10$ km gap in $\frac{10}{5} = 2$ hours.
Check: Two cars $100$ km apart drive toward each other at $60$ and $40$ km/h. Time to meet? ⇒ $\frac{100}{100} = 1$ hour.

8. **Unit rates and unit discipline.** "Produces $360$ bottles in $3$ minutes" means $120$ bottles per minute — treat output rates exactly like job rates. Before any arithmetic, force every time into one unit; a $25$-minute head start is $\frac{25}{60}$ hour, not $25$ of anything else.
Check: A van at $36$ km/h gets a $25$-minute head start. How big is the gap? ⇒ $36 \times \frac{25}{60} = 15$ km.

## Worked examples

**Example 1 · Warm-up · target 1:15**

*A cyclist rides $36$ kilometers at a constant speed of $24$ kilometers per hour. How many minutes does the ride take?*

1. Solve the master identity for time: $t = \frac{d}{s} = \frac{36}{24} = 1.5$ hours.
2. Convert to the asked unit: $1.5$ hours $= 90$ minutes.

**Answer: $90$ minutes**

**Example 2 · 605 level · target 1:40**

*Working at its constant rate, filling line $A$ fills $360$ bottles in $3$ minutes, and working at its constant rate, filling line $B$ fills $360$ bottles in $4$ minutes. Working together at these rates, how many minutes do the two lines need to fill a total of $1{,}680$ bottles?*

1. Convert each line to a unit rate: $A$ fills $\frac{360}{3} = 120$ bottles per minute; $B$ fills $\frac{360}{4} = 90$ bottles per minute.
2. Rates add: together they fill $120 + 90 = 210$ bottles per minute.
3. Time $= \frac{W}{R} = \frac{1{,}680}{210} = 8$ minutes.

**Answer: $8$ minutes**

**Example 3 · 655 level · target 2:05**

*A courier van leaves a depot and travels along a straight highway at a constant $36$ kilometers per hour. Twenty-five minutes later, a car leaves the same depot along the same highway at a constant $54$ kilometers per hour. How many minutes after its own departure does the car catch the van?*

1. Head start: in $25$ minutes $= \frac{25}{60}$ hour, the van covers $36 \cdot \frac{25}{60} = 15$ km.
2. Closing speed (same direction, so subtract): $54 - 36 = 18$ km/h.
3. Catch-up time $= \frac{\text{gap}}{\text{closing speed}} = \frac{15}{18} = \frac{5}{6}$ hour $= 50$ minutes — measured from the car's departure, exactly what was asked.

**Wrong turn: answering from the van's clock.** $50 + 25 = 75$ minutes is how long the *van* has been driving at the catch — a planted choice. The stem asks "after its own departure"; the two clocks differ by exactly the head start, and the choices contain both.

**Answer: $50$ minutes**

**Example 4 · 705 level · target 2:30**

*Working alone at their constant rates, Priya can build a software module in $10$ hours and Sam can build it in $15$ hours. They begin working together at 9:00 a.m. At 11:00 a.m. Priya leaves for a meeting, and Sam continues alone. At 1:00 p.m. Priya returns, and they work together until the module is complete. At what time is the module finished?*

1. Rates: $R_P = \frac{1}{10}$, $R_S = \frac{1}{15}$, together $\frac{1}{10} + \frac{1}{15} = \frac{3+2}{30} = \frac{1}{6}$ module per hour.
2. Stage 1 (9:00–11:00, both): $2 \cdot \frac{1}{6} = \frac{1}{3}$ done.
3. Stage 2 (11:00–1:00, Sam alone): $2 \cdot \frac{1}{15} = \frac{2}{15}$ done. Running total: $\frac{5}{15} + \frac{2}{15} = \frac{7}{15}$.
4. Remaining work: $1 - \frac{7}{15} = \frac{8}{15}$, done together at $\frac{1}{6}$ per hour: $t = \frac{8/15}{1/6} = \frac{48}{15} = \frac{16}{5}$ hours $= 3$ hours $12$ minutes.
5. Finish time: 1:00 p.m. $+$ 3 h 12 min $=$ 4:12 p.m.

**Wrong turn: finishing with the fraction done.** Feeding $\frac{7}{15}$ instead of $\frac{8}{15}$ into step 4 gives $2$ h $48$ min and a finish of 3:48 p.m. — a planted choice. After any staged tally, say out loud which fraction is *left*.

**Answer: 4:12 p.m.**

**Example 5 · Q86 level · target 2:50**

*Working together at their constant rates, machines $A$ and $B$ complete a production run in $6$ hours. Working alone, machine $B$ would complete the run $5$ hours faster than machine $A$ working alone. How many hours does machine $A$ alone need?*

*A) $9$  B) $10$  C) $12$  D) $15$  E) $20$*

1. Let $B$'s solo time be $x$ hours, so $A$'s is $x + 5$. Rates: $\frac{1}{x} + \frac{1}{x+5} = \frac{1}{6}$.
2. Multiply through by $6x(x+5)$: $6(x+5) + 6x = x(x+5)$.
3. Expand: $12x + 30 = x^2 + 5x$, so $x^2 - 7x - 30 = 0$.
4. Factor: $(x - 10)(x + 3) = 0$, so $x = 10$ (a time can't be $-3$).
5. $A$ alone: $x + 5 = 15$ hours. Verify: $\frac{1}{10} + \frac{1}{15} = \frac{1}{6}$. ✓

**Wrong turn: answering the other machine.** $x = 10$ is $B$'s time — choice (B), sitting right there. The question asks for $A$.

**Wrong turn: pairing times that can't be right.** Any candidate pair must keep the together time below the faster solo time: a guess like $A = 9$, $B = 4$ gives a together time under $4$ hours, nowhere near $6$. Backsolving with this bound kills most choices in seconds: $A = 15$, $B = 10$ is the only pair consistent with together $= 6$.

**Answer: $15$ hours (D)**

## Trigger cues

- "Working together at their constant rates, how long…" → add the individual rates; for exactly two workers, jump to $\frac{ab}{a+b}$.
- "$X$ and $Y$ together take …; $X$ alone takes …" → subtract rates: $R_Y = R_{\text{tog}} - R_X$.
- "Starts alone at …, joined at …, finished at …" → tally each worker's own hours, then set the job fractions equal to $1$.
- "Average speed for the round trip" → total distance over total time; equal legs means $\frac{2ab}{a+b}$.
- "Leaves … later … catches up" → head-start distance divided by the *difference* of speeds.
- "Travel toward each other / how far apart" → single mover at the *sum* (opposite directions) or *difference* (same direction) of speeds.
- "Produces $N$ units in $M$ minutes" → compute the per-minute unit rate first, then treat it like any rate.
- "Alone, $B$ takes $5$ hours less than $A$; together they take …" → one variable, two expressions: $\frac{1}{x} + \frac{1}{x+5} = \frac{1}{T}$, then clear denominators into a quadratic — or backsolve the choices.

## Trap gallery

- **Averaging speeds.** Out at $30$, back at $60$ is $40$, not $45$ — divide total distance by total time, always.
- **Adding times instead of rates.** Two workers together are *faster* than either alone; if your "together" time isn't less than the fastest solo time, restart.
- **Dropping the early starter.** When a second machine joins, the first *keeps working* — count its full hours from its own start to the finish.
- **Unit mixing.** A head start given in minutes with speeds in km/h silently poisons the arithmetic; convert first, compute second.
- **Answering from the wrong clock.** "How long after *its own* departure" vs. "after the first traveler left" vs. "at what time" — the choices carry all three numbers; reread the question before circling.
- **Fraction done vs. fraction left.** After computing $\frac{7}{15}$ complete, the next stage needs $\frac{8}{15}$; solving with the wrong one is a planted answer choice.
- **Answering the partner.** Two-unknown time problems plant both solo times among the choices. Solving correctly and circling the wrong machine costs exactly as many points as never solving at all.

## Speed moves

- **Product over sum.** Two solo times $a, b$ → together time $\frac{ab}{a+b}$ instantly: $6$ and $12$ give $\frac{72}{18} = 4$.
- **Give the job a convenient size.** Set the tank to the LCM of the solo times: solo times $6$ and $12$ → tank $= 12$ units, rates $2$ and $1$ units/hour — all fractions vanish.
- **Round-trip template.** Equal distances → write $\frac{2ab}{a+b}$ without deriving it; or pick a distance like $120$ km each way and divide $240$ by total hours.
- **Relative-speed collapse.** Freeze one mover and give the other the combined (or differenced) speed; a two-body chase becomes one division.
- **Bound before you compute.** The together time for two workers always sits between half the faster solo time and the full faster solo time — often that eliminates three answer choices before any algebra.
- **Backsolve the quadratic stems.** "Takes $5$ hours longer" plus a together time: test a middle choice as $A$'s time, derive $B$'s, add the rates, compare to the target. One or two substitutions beat expanding the quadratic under time pressure.

## Before you drill

- I can convert "alone in $T$ hours" to a rate of $\frac{1}{T}$ without pausing.
- I add rates — never times — for simultaneous workers, and can recite $\frac{ab}{a+b}$.
- Given a together time and one solo time, I can extract the other solo time by subtracting rates.
- For staged jobs, I assign each worker their own hours and force the fractions to sum to $1$.
- I compute average speed as total distance over total time, and know equal legs give $\frac{2ab}{a+b}$.
- I pick the right relative speed: sum for approaching, difference for chasing.
- I standardize units and check *which* clock and *which* fraction the question is asking about.
- For "takes $h$ hours longer" stems I can set up $\frac{1}{x} + \frac{1}{x+h} = \frac{1}{T}$ and clear it to a quadratic — and I know when backsolving is faster.
