# Sannolikhet: räkna, multiplicera eller ta komplementet

## Why this matters
Sannolikhetsuppgifter på GMAT Focus är kombinatorik i förklädnad: nästan varenda en går att koka ner till "gynnsamma utfall genom totala utfall" plus två eller tre multiplikationssteg. På Q86-nivå lägger provet på en vridning — ett "at least"-villkor, en krympande kortlek, en begränsad urvalsgrupp eller ett jämnhetsvillkor — och det vinnande draget är att känna igen vilket av ett fåtal verktyg som knäcker just den vridningen på under två minuter.

## The core ideas

1. **Grunddefinitionen.** När alla utfall är lika sannolika gäller $P(A) = \dfrac{\text{gynnsamma utfall}}{\text{totala utfall}}$. Det fungerar därför att lika sannolikhet förvandlar sannolikhet till ren räkning.

2. **Komplementregeln.** $P(A) = 1 - P(\text{inte } A)$. Så fort "inte"-sidan är ett enda rent fall: räkna den sidan i stället — en uträkning slår fyra.

3. **"At least one".** $P(\text{minst en}) = 1 - P(\text{ingen})$. "Ingen" är ett enda fall där allt misslyckas, så det multiplicerar rakt igenom.

4. **Oberoende händelser multipliceras.** Om $A$ och $B$ är oberoende gäller $P(A \text{ och } B) = P(A)\cdot P(B)$. Oberoende betyder att det ena utfallet inte säger något om det andra, så bråken staplas.

5. **Utan återläggning: krymp allteftersom.** När du drar i följd multiplicerar du betingade bråk vars nämnare sjunker med ett per dragning: två av samma sort ur en grupp blir $\dfrac{k}{n}\cdot\dfrac{k-1}{n-1}$. Varje dragning tar bort ett föremål ur poolen.

6. **Kombinationsformen.** För ett oordnat urval av $r$ föremål ur $n$ gäller $P = \dfrac{\text{gynnsamma urval}}{\binom{n}{r}}$ — räkna gynnsamma kommittéer över totala kommittéer. Den stämmer med sekventiell multiplikation eftersom ordningen förkortas bort i täljare och nämnare.

7. **Var konsekvent.** Räkna ordnat över ordnat eller oordnat över oordnat — blanda aldrig. En blandning multiplicerar eller dividerar ditt svar med $r!$ helt tyst.

8. **"Or" betyder inklusion–exklusion.** $P(A \text{ eller } B) = P(A) + P(B) - P(A \text{ och } B)$. Subtraktionen tar bort den överlappning som räknats två gånger.

9. **Exakt en av två oberoende händelser.** $P = p(1-q) + (1-p)q$: de två disjunkta vägarna ("första ja, andra nej" och "första nej, andra ja") adderas. Med $p = 0{,}2$ och $q = 0{,}5$: $(0.2)(0.5) + (0.8)(0.5) = 0.5$.

10. **Begränsat utfallsrum.** Formuleringar som "one of the remote employees is selected" betyder att nämnaren är den begränsade gruppen, inte hela populationen. Villkoret definierar om vad "totala utfall" betyder.

11. **Jämnhetsregler.** En summa är jämn exakt när de två talen har samma jämnhet; en produkt är jämn exakt när minst en faktor är jämn. Alltså $P(\text{produkten jämn}) = 1 - P(\text{alla faktorer udda})$ — för två tärningar $1 - \frac{1}{2}\cdot\frac{1}{2} = \frac{3}{4}$.

12. **Symmetri: lås fast ett föremål.** Vid slumpmässig placering av $n$ personer runt ett runt bord: lås en person; den andra utpekade personen är lika sannolikt på vilken som helst av de $n-1$ återstående platserna, och $2$ av dem ligger intill, så $P(\text{intill}) = \dfrac{2}{n-1}$ (för $n = 6$ blir det $\frac{2}{5}$).

## Worked examples

**Example 1**

*A jar contains $4$ red and $6$ blue marbles. Two marbles are drawn at random without replacement. What is the probability that both are blue?*

1. Första dragningen blå: $\dfrac{6}{10}$.
2. Andra dragningen blå, givet att en blå är borta: $\dfrac{5}{9}$.
3. Multiplicera: $\dfrac{6}{10}\cdot\dfrac{5}{9} = \dfrac{30}{90} = \dfrac{1}{3}$.
4. Kontrollera med kombinationer: $\dfrac{\binom{6}{2}}{\binom{10}{2}} = \dfrac{15}{45} = \dfrac{1}{3}$. Samma svar, som sig bör.

**Answer: $\frac{1}{3}$**

**Example 2**

*A reading club selects $3$ books at random from a shelf holding $5$ novels and $4$ biographies. What is the probability that at least $2$ of the selected books are biographies?*

1. Totalt antal urval: $\binom{9}{3} = 84$.
2. "Minst $2$ biografier" delas i två disjunkta fall: exakt $2$ och exakt $3$.
3. Exakt $2$ biografier: $\binom{4}{2}\cdot\binom{5}{1} = 6 \cdot 5 = 30$.
4. Exakt $3$ biografier: $\binom{4}{3} = 4$.
5. Sannolikhet: $\dfrac{30 + 4}{84} = \dfrac{34}{84} = \dfrac{17}{42}$.

**Answer: $\frac{17}{42}$**

**Example 3**

*A crate of $10$ flashlights contains exactly $2$ defective units. An inspector tests the flashlights one at a time, in random order and without replacement. What is the probability that the first defective flashlight the inspector finds is the fourth one tested?*

1. Översätt händelsen till en exakt sekvens: test $1$–$3$ är alla hela, och test $4$ är defekt.
2. Hel på test 1: $\dfrac{8}{10}$. Hel på test 2: $\dfrac{7}{9}$. Hel på test 3: $\dfrac{6}{8}$.
3. Defekt på test 4, med $7$ lampor kvar varav $2$ är defekta: $\dfrac{2}{7}$.
4. Multiplicera: $\dfrac{8}{10}\cdot\dfrac{7}{9}\cdot\dfrac{6}{8}\cdot\dfrac{2}{7} = \dfrac{672}{5040} = \dfrac{2}{15}$.

**Answer: $\frac{2}{15}$**

## Trigger cues

- "At least one …" → räkna ut $1 - P(\text{ingen})$ direkt.
- "Without replacement" eller "one after another" → sekventiella bråk med krympande nämnare.
- "A committee/team of $r$ is chosen from …" → kombinationsformen: gynnsamma $\binom{\cdot}{\cdot}$ över $\binom{n}{r}$.
- "Multiple of $a$ or multiple of $b$" → inklusion–exklusion; räkna multiplar med $\lfloor N/a \rfloor$ och dra bort multiplarna av $\operatorname{lcm}(a,b)$.
- "Exactly one of the two events occurs" → $p(1-q) + (1-p)q$.
- "If one of the [begränsade gruppen] is selected …" → nämnaren är bara den gruppens storlek.
- "Sum is even/odd" eller "product is even/odd" → jämnhetsregler, inte listning för hand.
- "Randomly seated around a circular table … adjacent" → lås en person, räkna gynnsamma platser av $n-1$.
- "The first [special item] found is the $k$th tested" → multiplicera den exakta sekvensen hel-hel-…-speciell.

## Trap gallery

- **Fastfrusen nämnare.** Att använda $\frac{3}{8}\cdot\frac{3}{8}$ för två dragningar utan återläggning — den andra nämnaren (och täljaren) måste krympa.
- **Addera när du ska multiplicera.** "Båda händelserna inträffar" är multiplikation; addition gäller bara disjunkta alternativ.
- **Fel komplement.** Komplementet till "at least $2$" är "högst $1$" — inte "ingen". Att bara dra bort nollfallet räknar för mycket.
- **Blanda ordnat och oordnat.** Att räkna gynnsamma utfall som ordnade sekvenser men totalen som $\binom{n}{r}$ blåser upp svaret med $r!$.
- **Glömma överlappningen.** Att addera $P(\text{multipel av }4) + P(\text{multipel av }6)$ utan att dra bort multiplarna av $12$ dubbelräknar.
- **Falsk femtio-femtio.** "Tiotalssiffran större än entalssiffran" är inte automatiskt $\frac{1}{2}$ av symmetriskäl — likheterna bryter symmetrin. (Här råkar det bli $\frac{45}{90} = \frac{1}{2}$, men bara därför att det finns $9$ likheter och $36$ omkastningar; du måste räkna.)
- **Nämnare från hela populationen.** När urvalet sker ur en begränsad pool svarar en division med hela populationen på en annan fråga.

## Speed moves

- **Fråga alltid efter komplementet först.** För $3$ oberoende kontroller som var för sig går igenom med sannolikhet $0.9$ blir $P(\text{minst en faller}) = 1 - 0.9^3 = 0.271$ på en rad.
- **Räkna heltal, inte sannolikheter.** Från $1$ till $72$: multiplarna av $4$ eller $6$ är $18 + 12 - 6 = 24$, så sannolikheten är $\frac{24}{72} = \frac{1}{3}$ — inga bråk förrän i sista steget.
- **Förkorta innan du multiplicerar.** I Example 3 förkortas $8$:orna och $7$:orna genom hela kedjan och kvar blir $\frac{6\cdot 2}{10\cdot 9} = \frac{2}{15}$ utan tung aritmetik.
- **Lås en person och döda cirkelsymmetrin.** Att sitta intill vid ett runt bord med $n$ personer är $\frac{2}{n-1}$ direkt — ingen arrangemangsräkning.
- **Jämnhet slår uppräkning.** "Produkten av två tärningar är jämn" via komplementet: båda udda är $\frac{1}{2}\cdot\frac{1}{2} = \frac{1}{4}$, alltså är svaret $\frac{3}{4}$ — lista aldrig $36$ rutor.
- **Rimlighetsbanda svaret.** Sannolikheter bor i $[0,1]$, och ett "at least one"-svar måste överstiga sannolikheten för den enskilda händelsen; stryk alternativ som bryter mot något av detta innan du räknar.

## Before you drill

1. Jag kan formulera $P(A) = 1 - P(\text{inte }A)$ och namnge det exakta komplementet till "at least $k$".
2. Jag krymper både täljare och nämnare vid varje dragning utan återläggning.
3. Jag kan ställa upp kommittésannolikheter som $\binom{\cdot}{\cdot}$ över $\binom{n}{r}$ och blandar aldrig ordnat med oordnat.
4. Jag drar bort överlappningen varje gång jag ser "or".
5. Jag kan skriva $p(1-q) + (1-p)q$ för "exactly one" utan att härleda det.
6. Jag kontrollerar om ett angivet villkor begränsar utfallsrummet innan jag väljer nämnare.
7. Jag griper efter jämnhet och symmetri (lås ett föremål) innan jag griper efter en full uppräkning.
