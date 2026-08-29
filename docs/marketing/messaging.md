# Messaging

The claims, the words, and the lines that may never be written. This file
is the reference every draft in `channels/` is checked against.

---

## The claims, and what backs each one

A claim may be used only if the "basis" column is still true. Check before
posting, not after.

| Claim | Basis | Safe to say |
|---|---|---|
| "Varje fråga är verifierad innan den släpps in" | `scripts/verify-bank.ts` runs in CI; the pipeline recomputes the answer and requires a named mistake per distractor | Yes |
| "360 verifierade frågor" | The bank, read from the database on the landing page | Yes, but never hard-code the number in copy — say "över 350" or read it |
| "24 kapitel, ett per delmoment" | `content/lessons/sv/`, 24 files | Yes |
| "Undervisning på svenska, frågor på engelska" | Enforced by a test, not a convention | Yes |
| "Sex feltyper, märkta innan du går vidare" | The error taxonomy, applied to every attempt | Yes |
| "Dagsplanen räknas fram, samma indata ger samma plan" | `computeDailyPlan` is deterministic | Yes |
| "Diagnosen kräver inget konto och sparar ingenting" | No row, no cookie, no localStorage; asserted by a test | Yes |
| "Ingen bindningstid" | Monthly cancels in Stripe's portal to period end | Yes |
| "Du kan ladda ner allt och radera kontot" | Both are in the product | Yes |

## Claims that need a source every time

Anything about the exam itself. These are true as of writing and GMAC can
change them; link GMAC's own page rather than asserting from memory.

- 21 questions in 45 minutes, Problem Solving only.
- Data Sufficiency is in Data Insights, not in the quant section.
- No geometry in the quant section.
- Sections scored 60–90; total 205–805.
- Up to three answers may be changed per section.

## Never write these

Not "avoid". Never.

| Forbidden | Why |
|---|---|
| Any score guarantee, in any wording | Unsubstantiable; MFL § 10 |
| "Höj din poäng med X" | Same, and there is no data |
| "N studenter använder Q86" | There is no N; inventing one is unlawful |
| Any testimonial or quote from a "user" | There are no users to quote |
| "Officiella GMAT-frågor" | They are not; GMAC's are GMAC's |
| Any use of GMAC's or GMAT's logo | Trademark |
| "I samarbete med…" / "godkänd av…" | Implies an endorsement that does not exist |
| "Bäst i Sverige" / "marknadsledande" | Superlatives need proof; there is none |
| "[Competitor] är dåligt/dyrt/fuskar" | Comparative claims need a checked basis |
| Anything that reads as a neutral recommendation without saying who wrote it | Astroturfing; MFL § 9 |

## The disclaimer

Required on the site, and on any post long enough to carry it:

> Q86 är en oberoende tjänst utan koppling till GMAC. GMAT™ och GMAT Focus
> Edition™ är varumärken som tillhör GMAC.

Short form for a comment or a bio:

> Q86 är oberoende och har ingen koppling till GMAC.

## Words

**Use.** Kvantdel, delmoment, feltyp, verifierad, dagsplan, tidsatt set,
repetitionskö, mönsterträning, diagnos. In English contexts: quant
section, subtopic, error type, verified, daily plan, timed set.

**Keep in English even in Swedish text.** GMAT Focus, Data Sufficiency,
Problem Solving, Quantitative Reasoning, fundamental skills, score report.
These are the exam's own names; translating them makes a candidate search
for the wrong thing.

**Avoid.** Plattform*lösning*, *revolutionerande*, *AI-driven* as a
headline (it is a tool inside the product, not the product), *hacka
provet*, *knäck koden*, *enkelt* (it is not), *garanterat* in any form.

## Headlines that work

Tested against the one rule that matters — would a candidate under time
pressure read the next sentence?

- Kvantdelen är inte ett minne. Den är ett mönster.
- Du vet att du fick fel. Vet du varför?
- Sex sätt att ha fel. Sex olika åtgärder.
- Svensk undervisning. Engelska frågor. Som på provet.
- Geometrin är borta. Vet du vad som kom i stället?
- Ett HP-resultat säger mindre om GMAT än du tror.

## Openers that do not work

- "Är du trött på att plugga fel?" — insults the reader.
- "Vi har byggt något speciellt" — nobody cares yet.
- "Som student vet du hur svårt det är" — assumes and flatters.
- Anything beginning "I en värld där…".

## The elevator answer

When someone asks what it is, in one breath:

> Det är en svensk plattform för GMAT:s kvantdel. Man tränar på engelska
> frågor, men allt runtomkring — kapitlen, förklaringarna, felanalysen —
> är på svenska. Poängen är att varje fel får ett namn, så att man vet om
> det var en kunskapslucka eller bara tidsbrist. Jag byggde den för att
> jag själv saknade den.

Note the last sentence. It is the only one that makes the rest credible,
and it is only usable because it is true.
