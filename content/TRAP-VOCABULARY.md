# The trap vocabulary

Every wrong choice in the bank carries a sentence in `trap_map` naming the
mistake that produces it, and the authoring gate proves that mistake really
computes that choice. `classifyTrap()` maps that sentence onto one of the six
error types, and that label is the strongest single signal in
`lib/error-inference.ts`: everything else the inference has — time on task,
declared confidence, the subtopic's recent record — is circumstantial, but the
distractor chosen is a direct observation of which mistake was made.

That only holds if the label is right. A wrong error-type label routes the
reader to the wrong chapter section through `lib/miss-bridge.ts` and trains
the wrong repair, which is worse than leaving the trap unlabelled. So this
file is the rubric: it fixes what each type means, how the hard cases break,
and what an authored trap sentence has to say to be classifiable.

`pnpm check:traps` measures both halves — coverage over the whole bank, and
precision against `content/trap-gold.json`, a hand-labelled sample drawn by
`scripts/sample-traps.ts` and labelled against this rubric.

## The question that assigns the type

> **What would have to change for this mistake to stop happening?**

Not "what part of the maths is wrong" — two mistakes can break the same
equation and need opposite repairs. The repair is the classification.

| Type | The mistake is | The repair is |
| --- | --- | --- |
| `misread` | The solver answered a *different question* — took the wrong quantity out of the stem, or reported the wrong one back. | Re-read the stem; name the quantity asked for before solving. |
| `setup_error` | The solver understood the question and built the *wrong model* for it — wrong relation, wrong base, wrong direction. | The translation step: what relates to what. |
| `content_gap` | The solver holds a *false general belief* — a rule, property or identity that is not true, or one they never had. | Learn the rule. |
| `calculation_error` | The model was right and the *execution slipped*. | Slow the arithmetic down; check the step. |
| `time_pressure` | The method was abandoned for the clock. | Pacing and abandon rules. |
| `guess` | The choice has no derivation at all — a round number, a midpoint, an arbitrary pick. | Commit to a method, or bail deliberately. |

## How the hard boundaries break

These four pairs are where nearly every disagreement lives. Each rule below
is applied in order; the first that decides, decides.

**`misread` vs `setup_error`.** Label `misread` only when the solver's work
would have been *correct for a different well-posed question* — they solved
for `60 - x` when `x` was asked, reported the sum when the seventh term was
asked, used the wrong one of two named quantities. If the work is not correct
for any question — adding two times where rates should be added — it is a
`setup_error`.

**`setup_error` vs `content_gap`.** A sentence that names a *general* false
belief ("believes squares of fractions shrink", "thinks the median moves with
the mean") is a `content_gap`. A sentence that names a *this-problem*
mis-arrangement of facts the solver does hold ("puts the weight 18 on the
average 8", "applies the discount to the cost rather than the list price") is
a `setup_error`. When a sentence carries both, follow its main verb.

**`calculation_error` vs `setup_error`.** If the operation was the right one
and the number came out wrong — a dropped sign while distributing, a rounding
in the wrong direction, an off-by-one in a division — it is a
`calculation_error`. If the operation itself was the wrong one to reach for,
it is a `setup_error`.

**`misread` vs `calculation_error` on an off-by-one.** If the thing that is
off by one is something the *stem states* — which term, which month, how many
hours — it is a `misread`. If it is an index inside a derivation the stem
never mentions — a units-digit cycle position, a loop count — it is a
`calculation_error`.

**Universal-claim and sufficiency items** ("must be true", the two-statement
format) get one extra rule, because the mistake is about a claim rather than
a number. Follow the *object* of the error: a false belief about a
mathematical fact (parity, signs, squares, divisibility) is a `content_gap`;
a false belief about the *sufficiency procedure* — needing both statements
when one settles it, calling the pair inconclusive without intersecting them,
granting sufficiency by symmetry with the other statement — is a
`setup_error`, because the repair is how you test a statement, not a fact you
are missing.

## Writing a classifiable trap sentence

The classifier is keyword-driven and deliberately declines rather than
guesses, so an unusual phrasing costs a label. Two habits keep a trap
sentence classifiable, and the authoring gate now enforces the second.

1. **Lead with the verb that names the mistake**, not with the arithmetic.
   "Adds the two times instead of adding the rates" classifies; "$6 + 3 = 9$
   is used as the combined time" does not.
2. **Every trap sentence must classify.** `verifyAndAppend()` runs
   `classifyTrap()` over each `trap_map` entry and fails the batch on any
   sentence that gets no label, in exactly the way it already fails a
   distractor no stated error reaches. An unclassifiable trap is a distractor
   the diagnosis cannot use, which is most of the value of having written it.

If a genuinely new kind of mistake needs a phrasing the classifier does not
know, widen `lib/trap-classify.ts` *and* add the sentence to the gold set —
the coverage gate and the precision gate are meant to move together.
