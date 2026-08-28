# Konsekutiva och jämnt fördelade mängder: summa, median och räkning

## Why this matters

Jämnt fördelade mängder gömmer sig i summor av konsekutiva heltal, husnummer, gatlyktor, startnummer och restklassräkning, och provet testar om du utnyttjar symmetrin eller maler term för term. På Q80+-nivå är dessa frågor sällan räknemässigt svåra — de bestraffar en enda missad konvention (plus-ett vid räkning, den halvtaliga medianen i en mängd med jämnt antal element). Behärska tre identiteter så blir hela delområdet en 30-sekundersövning.

## The core ideas

1. **Definition.** En jämnt fördelad (aritmetisk) mängd har ett konstant avstånd $d$ mellan grannar: konsekutiva heltal har $d = 1$, konsekutiva jämna eller udda heltal har $d = 2$, och multiplarna av $k$ har $d = k$.
2. **Den $n$:te termen.** $a_n = a_1 + (n-1)d$: att nå den $n$:te termen kräver $n - 1$ steg av storlek $d$. Ekvivalent: $\text{sista} - \text{första} = (n-1)d$.
3. **Medelvärdet är lika med medianen.** I varje jämnt fördelad mängd gäller $\text{medelvärde} = \text{median} = \dfrac{\text{första} + \text{sista}}{2}$, eftersom mängden är symmetrisk kring sitt centrum: varje term ovanför mitten balanseras av en spegelterm under den.
4. **Huvudformeln för summan.** $\text{summa} = (\text{antal}) \times (\text{median})$ — "summa är antal gånger medelvärde" kombinerat med idé 3. Följd: när antalet är känt gör *varje uppgift som låser fast medianen att summan låses fast*, och omvänt.
5. **Att räkna termer (staketstolpsregeln).** $\text{antal} = \dfrac{\text{sista} - \text{första}}{d} + 1$. Divisionen räknar *mellanrum*; plus-ett återställer den första termen. Att glömma det är delområdets vanligaste fel.
6. **Symmetrisk parning.** $a_1 + a_n = a_2 + a_{n-1} = \dots = 2 \times \text{median}$, eftersom ett steg inåt från vardera änden lägger till $d$ på ena sidan och drar bort $d$ på den andra. Alltså är "minsta plus största" alltid $2 \times \text{medelvärdet}$.
7. **Räkning per rest.** De heltal i $[A, B]$ som lämnar resten $r$ vid division med $k$ bildar en jämnt fördelad mängd med $d = k$: hitta första och sista giltiga värdet och tillämpa sedan idé 5.
8. **Summors delbarhet.** Summan av $n$ konsekutiva heltal är $n \times \text{median}$: för udda $n$ är medianen ett heltal, så summan är delbar med $n$; för jämnt $n$ är medianen ett halvtal (som $19{,}5$), så summan är *aldrig* delbar med $n$.
9. **Summa noll betyder median noll.** Om en jämnt fördelad mängd summerar till $0$ gäller $(\text{antal}) \times (\text{median}) = 0$, alltså är medianen $0$ — mängden är symmetrisk kring noll.

## Worked examples

**Example 1**

*The sum of $9$ consecutive integers is $171$. What is the smallest of the nine?*

1. Summa $=$ antal $\times$ median, så medianen är $\dfrac{171}{9} = 19$.
2. Med $9$ termer är medianen den femte termen, som ligger $4$ steg av storlek $1$ ovanför den minsta.
3. Minsta $= 19 - 4 = 15$. (Mängden löper från $15$ till $23$; $9 \times 19 = 171$.)

**Answer: $15$**

**Example 2**

*How many integers from $200$ to $600$, inclusive, leave a remainder of $5$ when divided by $8$?*

1. Dessa heltal bildar en jämnt fördelad mängd med avståndet $d = 8$: var och en har formen $8q + 5$.
2. Hitta det första som är minst $200$: eftersom $200 = 8 \times 25$ exakt är det första giltiga värdet $200 + 5 = 205$.
3. Hitta det sista som är högst $600$: eftersom $600 = 8 \times 75$ exakt är det största värdet av formen $8q + 5$ som ryms $600 - 8 + 5 = 597$.
4. Tillämpa staketstolpsregeln: $\dfrac{597 - 205}{8} + 1 = \dfrac{392}{8} + 1 = 49 + 1 = 50$.

**Answer: $50$**

**Example 3**

*$P$ is a set of consecutive odd integers. The sum of the four least integers in $P$ is $88$, and the sum of the four greatest integers in $P$ is $184$. What is the sum of all the integers in $P$?*

1. Låt det minsta heltalet vara $a$. De fyra minsta är $a, a+2, a+4, a+6$, så $4a + 12 = 88$, vilket ger $a = 19$.
2. Låt det största vara $L$. De fyra största är $L-6, L-4, L-2, L$, så $4L - 12 = 184$, vilket ger $L = 49$.
3. Räkna termerna med $d = 2$: $\dfrac{49 - 19}{2} + 1 = 16$.
4. Summa $=$ antal $\times$ medelvärde $= 16 \times \dfrac{19 + 49}{2} = 16 \times 34 = 544$.

**Answer: $544$**

## Trigger cues

- "Sum of $n$ consecutive (even/odd) integers is $S$" → dividera: median $= S/n$, stega sedan ut till vilken term du behöver.
- "What is the sum?" i Data Sufficiency → fråga om påståendet låser fast medianen (vilken enskild term som helst gör det); när antalet är känt räcker det ensamt.
- "How many multiples of $k$ / integers with remainder $r$ between $A$ and $B$" → hitta första och sista giltiga värdet och ta sedan $\frac{\text{sista} - \text{första}}{k} + 1$.
- "Lights/posts/trees equally spaced along a length, one at each end" → staketstolpar: $\frac{\text{längd}}{\text{avstånd}} + 1$.
- "Smallest plus largest" eller "in terms of the average $k$" → symmetrisk parning: första $+$ sista $= 2k$; ingen algebra behövs.
- "Largest is $m$ more than smallest" → antal $= \frac{m}{d} + 1$, inte $\frac{m}{d}$.
- "A term is removed; find the new average" → ny summa $=$ gammal summa $-$ borttagen term; dividera med det nya antalet.

## Trap gallery

- **Att tappa plus-ett.** $\frac{597 - 205}{8} = 49$ räknar mellanrum, inte termer; svaret är $50$. Åtgärd: lägg alltid till ett efter att ha dividerat spannet.
- **Förvirring om spannet.** I $5$ konsekutiva jämna heltal är största $-$ minsta $= 2(5-1) = 8$, inte $10$. Åtgärd: spann $= (n-1)d$.
- **Att anta en heltalsmedian.** Ett jämnt antal konsekutiva heltal har en halvtalig median, så summan av $4$ konsekutiva heltal är aldrig delbar med $4$. Åtgärd: kontrollera antalets jämnhet innan du dividerar.
- **"Between" mot "inclusive".** Mellan $-20$ och $50$ finns $10$ multiplar av $7$ (från $-14$ till $49$). Åtgärd: lås fast första och sista giltiga värdet innan du räknar.
- **Att glömma att noll och negativa tal är multiplar.** $0$ är en multipel av varje heltal; att hoppa över det (eller de negativa multiplarna) ger för lågt antal.
- **Att dra för långtgående slutsatser i Data Sufficiency.** "The sum of a set of consecutive integers is $120$" låser *inte* fast antalet: $120 = \text{antal} \times \text{median}$ har flera faktoriseringar. Åtgärd: tillräcklighet kräver både antal och centrum.

## Speed moves

- **Median först, alltid.** En division ger centrum; varje annan term ligger ett fast antal steg därifrån. Summan av $9$ termer $= 171$ → median $19$ direkt.
- **Para ihop och förskjut vid summaskillnader.** För att beräkna $(61 + 62 + \dots + 110) - (1 + 2 + \dots + 50)$: para ihop termerna — var och en av de $50$ termerna är exakt $60$ större, så skillnaden är $50 \times 60 = 3000$. Inga summaformler.
- **Delbarhet via struktur, inte fall.** Summan av $4$ konsekutiva jämna heltal $= 4a + 12 = 4(a + 3)$; eftersom $a$ är jämnt är $a + 3$ udda — delbart med $4$, aldrig med $8$. En rad algebra slår att testa mängder.
- **Räkna ut antalet och kontrollera sedan ett litet fall.** Stolpar var $40$:e fot längs ett $1{,}200$ fot långt staket med en i varje ände: $\frac{1200}{40} + 1 = 31$. Rimlighetskontrollera med ett litet fall ($80$ fot, var $40$:e → $3$ stolpar) om plus-ett känns tveksamt.
- **Borttagning utan omsummering.** $25$ konsekutiva heltal summerar till $1{,}050$ → median $42$, så mängden löper från $30$ till $54$; ta bort $54$ och det nya medelvärdet är $\frac{1050 - 54}{24} = 41{,}5$.

## Before you drill

1. Jag kan formulera och använda $\text{summa} = \text{antal} \times \text{median}$ utan att tveka.
2. Jag använder $\text{antal} = \frac{\text{sista} - \text{första}}{d} + 1$ och tappar aldrig plus-ett.
3. Jag vet att medelvärde $=$ median $= \frac{\text{första} + \text{sista}}{2}$, alltså första $+$ sista $= 2 \times \text{medelvärdet}$.
4. Jag kan hitta första och sista termen i en restklass inuti vilket intervall som helst, inklusive intervall som innehåller $0$ och negativa tal.
5. Jag vet att spannet för $n$ termer är $(n-1)d$ och använder det för att hoppa mellan minsta, median och största.
6. I Data Sufficiency testar jag om ett påstående låser fast centrum och antal — inget annat spelar roll för summan.
7. Jag inser att ett jämnt antal konsekutiva heltal har en halvtalig median, och jag vet vad det gör med delbarheten.
