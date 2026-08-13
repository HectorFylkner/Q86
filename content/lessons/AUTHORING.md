# The chapter authoring contract

Every file in this directory (except this one) is a concept chapter named
`<subtopic>.md` for a subtopic id in `lib/taxonomy.ts`. Chapters are
parsed by `lib/lesson-parse.ts` into a structured layout; a file that
drifts from this contract falls back to plain markdown rendering, and
`pnpm verify:lessons` fails loudly naming the file and the violation.
Run it after any edit here.

## Dialect

The platform's markdown-with-math dialect (see `components/math.tsx`):
`$…$` inline and `$$…$$` display KaTeX, `\$` for a literal dollar sign,
`**bold**`, `*italic*`, `` `code` ``, `- ` bullets, `1. ` numbered lists,
paragraphs split by blank lines. No HTML, no headings below `##`, no
tables, no links. Every TeX span must compile — verify:lessons renders
each one with `throwOnError`.

## Template

Line 1 is `# <Chapter title>`. Then exactly these seven `##` sections, in
this order, all present:

```
## Why this matters
## The core ideas
## Worked examples
## Trigger cues
## Trap gallery
## Speed moves
## Before you drill
```

**Why this matters** — a short lede: the subtopic's role on the exam,
what the Q86 tier actually tests, how the chapter is organized.

**The core ideas** — optional intro line, then `1.`-numbered ideas
(strict bar: ≥ 5). Each idea opens `**Name.**`, states the rule, says
why it works, and shows it on a tiny concrete case. An idea may end with
a one-line concept check that renders as an attempt-first reveal:

```
Check: If $P(A) = 0.3$, what is $P(\text{not } A)$? ⇒ $0.7$ — subtract from $1$.
```

The `⇒` separates question from answer; at least 3 ideas per chapter
carry a check.

**Worked examples** — 4 to 6, in ramp order. The marker line is bold and
carries a tier and a pace target:

```
**Example 3 · 655 level · target 2:05**
```

Tiers and canonical targets (aligned with `TIME_BENCH` in
`lib/pacing.ts`): Warm-up → 1:00–1:25, 555 level → 1:25, 605 level →
1:40, 655 level → 2:05, 705 level → 2:30, Q86 level → 2:50.

After the marker: the question as one or more paragraphs each fully
wrapped in single-star italics (answer choices `A) … B) …` separated by
double spaces stack automatically), then the solution as numbered steps,
then optionally one or more wrong-turn paragraphs, then the answer line:

```
**Wrong turn: adding the times.** Averaging $4$ and $6$ to get $5$ hours
feeds the trap choice (C); rates add, times never do.

**Answer: $\frac{12}{5}$ hours**
```

Wrong-turn paragraphs teach from the error — name the tempting move and,
where possible, the wrong choice it produces. The chapter needs ≥ 2
across its examples.

**Trigger cues** — `- ` bullets, `<phrase> → <method>` (strict bar: ≥ 5).

**Trap gallery** — `- ` bullets opening `**Name.**` (≥ 4).

**Speed moves** — `- ` bullets opening `**Name.**` (≥ 4).

**Before you drill** — `- ` or `1.` checklist of behavioral,
self-verifiable claims (≥ 5).

## Correctness

Every number in a chapter — example answers, check answers, micro-cases
inside ideas — is recomputed mechanically before it ships. Chapters are
teaching material: a single wrong answer costs more trust than a missing
chapter. Playbook notes in `content/strategy/` follow the free-form
contract described in `app/learn/strategy/[slug]/page.tsx` and are
KaTeX-checked by the same script.
