# Number testing doctrine

## When numbers beat algebra

Number testing is not the fallback for people who can't do algebra — at the top of the section it is often the *faster* correct route, and the exam writes questions expecting you to know which is which. Reach for numbers when: the answer choices contain variables ("which of the following must be…", "in terms of $x$"); the stem states properties instead of values ("$n$ is odd", "$0 < x < 1$", "$p$ is prime"); a percent or ratio problem never names a total; or an abstract inequality asks what *must* hold. Reach for algebra when the stem hands you equations with concrete coefficients and asks for a specific value — testing numbers there just rediscovers the equation slowly.

The route decision is part of the first thirty seconds (see *The two-minute decision*). The tell is almost always in the choices: variables or ranges in the choices → numbers; a single clean unknown → algebra; clean numeric choices → consider backsolving instead (its own note).

## Numbers that work hard

A test number earns its place by making arithmetic trivial or by attacking an assumption. The standing roster:

- **$100$** for anything percent. A price rises $20\%$ then falls $20\%$: $100 \to 120 \to 96$, and the net $-4\%$ is read off instantly.
- **The LCM of the denominators** for fractions, ratios, and work rates. Machines finishing in $4$ and $6$ hours? Test a $12$-hour job: rates $3$ and $2$ jobs-per-$12$-hours, combined $5$ — no fraction addition until the last line.
- **Small distinct primes** ($2, 3, 5, 7$) when divisibility structure matters and you need factors not to collide by accident.
- **Round, spaced values** for coordinate or sequence behavior — $x = 10$ separates growth patterns that $x = 2$ hides.

One habit protects every test: write the number down before you compute with it. Mental substitution is where careless errors breed.

## The kill list

For "must be true" questions, ordinary numbers are too polite. The six standard assassins are $0$, $1$, $-1$, $\tfrac{1}{2}$, $-\tfrac{1}{2}$, and something large like $100$ — between them they break assumptions about sign, about squaring making things bigger, about multiplication preserving order, and about integers being the only numbers alive. A statement has not survived testing until it has survived the members of this list the stem allows. If the stem says "positive integer", the list shrinks to $1$, $2$, and large — but $1$ stays, because $1$ is the great destroyer of "must be greater than" claims.

The full discipline — including how the kill list interacts with roman-numeral formats — lives in the *Testing cases & must-be-true logic* chapter; this note is the cross-chapter summary you should hold during any timed work.

## Test to eliminate, never to confirm

One number that makes a choice true proves nothing; one number that makes it false kills it forever. So the loop is: pick a legal number, evaluate every remaining choice, cross out what fails, repeat with a number *chosen to split the survivors*. The second number should be adversarial — if the survivors all worked for $x = 2$, try $x = \tfrac{1}{2}$ or $x = -3$, not $x = 4$. Two well-chosen rounds almost always leave one choice standing.

When two survivors resist two rounds, stop testing. Either find the structural difference between them and reason about it directly, or accept the algebra on just those two expressions — comparing two choices algebraically is far cheaper than solving the original problem that way.

## The time cap

Number testing has a failure mode: the pleasant, endless search for the perfect counterexample. Cap it. Two rounds of testing fit inside any pace target; a third round is only justified if it is targeted at a specific surviving pair. If three rounds haven't settled it, the question has told you its price — eliminate what you can, record a guess-level confidence, flag it for Review & Edit, and go. The doctrine is a tool for winning the section, not the argument.
