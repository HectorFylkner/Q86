# Rates, Speed, and Work: One Equation in Every Disguise

## Why this matters
Every rate problem on the GMAT Focus Edition — machines filling orders, pumps filling tanks, travelers catching up or meeting — is the single identity $W = R \cdot T$ dressed in a different costume. The exam tests this from mid-range difficulty up to the hardest quant questions, and at the top end it layers two or three moves (a late joiner, a unit switch, a clock-time answer) into one stem. Master the small toolkit below and the layers peel off one at a time.

## The core ideas

1. **The master identity.** $W = R \cdot T$ (work equals rate times time), and for motion $d = s \cdot t$. Every formula in this chapter is this equation solved for a different letter, so if you forget a shortcut, rebuild it from here.
2. **Solo time defines rate.** "Alone at a constant rate, $A$ finishes in $T$ hours" means $R_A = \frac{1}{T}$ job per hour. This is true by definition: one whole job divided by $T$ hours.
3. **Rates add; times never do.** When workers run simultaneously, $\frac{1}{T_{\text{tog}}} = \frac{1}{T_A} + \frac{1}{T_B}$. It works because in one hour the pile of finished work is the sum of what each contributes.
4. **Two-worker shortcuts.** Combined time: $T_{\text{tog}} = \frac{ab}{a+b}$ (e.g., $4$ and $12$ hours give $\frac{48}{16} = 3$ hours). Extracting a solo time from a together time: $T_B = \frac{T_A \cdot T_{\text{tog}}}{T_A - T_{\text{tog}}}$ (together $4$, alone $6$ gives $\frac{24}{2} = 12$, and indeed $\frac{1}{6} + \frac{1}{12} = \frac{1}{4}$). Both are just idea 3 rearranged.
5. **Staged jobs: fractions sum to one.** When workers start, stop, or swap, give each worker their *own* hours and write $r_1 t_1 + r_2 t_2 + \dots = 1$. The whole job is $1$, so the pieces must account for all of it.
6. **Average speed is total distance over total time** — never the average of the speeds. For equal distances at speeds $a$ and $b$: $s_{\text{avg}} = \frac{2ab}{a+b}$. Out at $30$, back at $60$ gives $\frac{3600}{90} = 40$, not $45$, because more clock time is spent at the slow speed.
7. **Relative speed collapses two movers into one.** Toward each other: closing speed $= a + b$. Same direction: gap changes at $a - b$. Then $t = \frac{\text{gap}}{\text{relative speed}}$. Runners at $14$ and $9$ km/h open a $10$ km gap in $\frac{10}{5} = 2$ hours.
8. **Unit rates and unit discipline.** "Produces $360$ bottles in $3$ minutes" means $120$ bottles per minute — treat output rates exactly like job rates. Before any arithmetic, force every time into one unit; a $25$-minute head start is $\frac{25}{60}$ hour, not $25$ of anything else.

## Worked examples

**Example 1** *Working at its constant rate, filling line $A$ fills $360$ bottles in $3$ minutes, and working at its constant rate, filling line $B$ fills $360$ bottles in $4$ minutes. Working together at these rates, how many minutes do the two lines need to fill a total of $1{,}680$ bottles?*

1. Convert each line to a unit rate: $A$ fills $\frac{360}{3} = 120$ bottles per minute; $B$ fills $\frac{360}{4} = 90$ bottles per minute.
2. Rates add: together they fill $120 + 90 = 210$ bottles per minute.
3. Time $= \frac{W}{R} = \frac{1{,}680}{210} = 8$ minutes.

**Answer: 8 minutes**

**Example 2** *A courier van leaves a depot and travels along a straight highway at a constant $36$ kilometers per hour. Twenty-five minutes later, a car leaves the same depot along the same highway at a constant $54$ kilometers per hour. How many minutes after its own departure does the car catch the van?*

1. Head start: in $25$ minutes $= \frac{25}{60}$ hour, the van covers $36 \cdot \frac{25}{60} = 15$ km.
2. Closing speed (same direction, so subtract): $54 - 36 = 18$ km/h.
3. Catch-up time $= \frac{\text{gap}}{\text{closing speed}} = \frac{15}{18} = \frac{5}{6}$ hour $= 50$ minutes — measured from the car's departure, exactly what was asked.

**Answer: 50 minutes**

**Example 3** *Working alone at their constant rates, Priya can build a software module in $10$ hours and Sam can build it in $15$ hours. They begin working together at 9:00 a.m. At 11:00 a.m. Priya leaves for a meeting, and Sam continues alone. At 1:00 p.m. Priya returns, and they work together until the module is complete. At what time is the module finished?*

1. Rates: $R_P = \frac{1}{10}$, $R_S = \frac{1}{15}$, together $\frac{1}{10} + \frac{1}{15} = \frac{3+2}{30} = \frac{1}{6}$ module per hour.
2. Stage 1 (9:00–11:00, both): $2 \cdot \frac{1}{6} = \frac{1}{3}$ done.
3. Stage 2 (11:00–1:00, Sam alone): $2 \cdot \frac{1}{15} = \frac{2}{15}$ done. Running total: $\frac{5}{15} + \frac{2}{15} = \frac{7}{15}$.
4. Remaining work: $1 - \frac{7}{15} = \frac{8}{15}$, done together at $\frac{1}{6}$ per hour: $t = \frac{8/15}{1/6} = \frac{48}{15} = \frac{16}{5}$ hours $= 3$ hours $12$ minutes.
5. Finish time: 1:00 p.m. $+$ 3 h 12 min $=$ 4:12 p.m.

**Answer: 4:12 p.m.**

## Trigger cues

- "Working together at their constant rates, how long…" → add the individual rates; for exactly two workers, jump to $\frac{ab}{a+b}$.
- "$X$ and $Y$ together take …; $X$ alone takes …" → subtract rates: $R_Y = R_{\text{tog}} - R_X$.
- "Starts alone at …, joined at …, finished at …" → tally each worker's own hours, then set the job fractions equal to $1$.
- "Average speed for the round trip" → total distance over total time; equal legs means $\frac{2ab}{a+b}$.
- "Leaves … later … catches up" → head-start distance divided by the *difference* of speeds.
- "Travel toward each other / how far apart" → single mover at the *sum* (opposite directions) or *difference* (same direction) of speeds.
- "Produces $N$ units in $M$ minutes" → compute the per-minute unit rate first, then treat it like any rate.

## Trap gallery

- **Averaging speeds.** Out at $30$, back at $60$ is $40$, not $45$ — divide total distance by total time, always.
- **Adding times instead of rates.** Two workers together are *faster* than either alone; if your "together" time isn't less than the fastest solo time, restart.
- **Dropping the early starter.** When a second machine joins, the first *keeps working* — count its full hours from its own start to the finish.
- **Unit mixing.** A head start given in minutes with speeds in km/h silently poisons the arithmetic; convert first, compute second.
- **Answering from the wrong clock.** "How long after *its own* departure" vs. "after the first traveler left" vs. "at what time" — reread the question before circling.
- **Fraction done vs. fraction left.** After computing $\frac{7}{15}$ complete, the next stage needs $\frac{8}{15}$; solving with the wrong one is a planted answer choice.

## Speed moves

- **Product over sum.** Two solo times $a, b$ → together time $\frac{ab}{a+b}$ instantly: $6$ and $12$ give $\frac{72}{18} = 4$.
- **convenient numbers the job.** Set the tank to the LCM of the solo times: solo times $6$ and $12$ → tank $= 12$ units, rates $2$ and $1$ units/hour — all fractions vanish.
- **Round-trip template.** Equal distances → write $\frac{2ab}{a+b}$ without deriving it; or pick a distance like $120$ km each way and divide $240$ by total hours.
- **Relative-speed collapse.** Freeze one mover and give the other the combined (or differenced) speed; a two-body chase becomes one division.
- **Bound before you compute.** The together time for two workers always sits between half the faster solo time and the full faster solo time — often that eliminates three answer choices before any algebra.

## Before you drill

- I can convert "alone in $T$ hours" to a rate of $\frac{1}{T}$ without pausing.
- I add rates — never times — for simultaneous workers, and can recite $\frac{ab}{a+b}$.
- Given a together time and one solo time, I can extract the other solo time by subtracting rates.
- For staged jobs, I assign each worker their own hours and force the fractions to sum to $1$.
- I compute average speed as total distance over total time, and know equal legs give $\frac{2ab}{a+b}$.
- I pick the right relative speed: sum for approaching, difference for chasing.
- I standardize units and check *which* clock and *which* fraction the question is asking about.
