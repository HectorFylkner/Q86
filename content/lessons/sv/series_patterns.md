# Talföljder, serier och upprepade mönster

## Why this matters

GMAT Focus Edition använder talföljder som ett stresstest av strukturigenkänning: ser du att en lista med tal är aritmetisk, geometrisk, periodisk eller teleskoperande, och hoppar du direkt till rätt formel i stället för att addera term för term? På Q86-nivå lagrar provet två idéer samtidigt — en rekursion som i hemlighet går i cykel, eller en aritmetisk summa med borttagna termer — så vinsten ligger i att klassificera talföljden inom de första tio sekunderna.

## The core ideas

1. **Aritmetisk talföljd, $n$:te termen.** Om varje term växer med en konstant $d$ gäller $a_n = a_1 + (n-1)d$. Du tar $n-1$ steg av storlek $d$ för att gå från term $1$ till term $n$ — räkna *mellanrummen*, inte termerna.
2. **Summan av en aritmetisk serie.** $S_n = \dfrac{n}{2}(a_1 + a_n) = n \cdot (\text{genomsnittlig term})$. I en jämnt fördelad lista är medelvärdet lika med mittpunkten mellan första och sista termen, så summan är helt enkelt antal gånger medelvärde.
3. **Summan av de $n$ första positiva heltalen.** $1 + 2 + \cdots + n = \dfrac{n(n+1)}{2}$. Det är idé 2 med $a_1 = 1$ och $a_n = n$; till exempel $1 + \cdots + 40 = \dfrac{40 \cdot 41}{2} = 820$.
4. **Geometrisk talföljd, $n$:te termen.** Om varje term multipliceras med en konstant kvot $r$ gäller $a_n = a_1 r^{\,n-1}$ — återigen $n-1$ multiplikationer, inte $n$.
5. **Summan av en geometrisk serie.** $S_n = a_1 \cdot \dfrac{r^n - 1}{r - 1}$ för $r \neq 1$. Snabbkontroll vid fördubbling ($r=2$): summan av alla termer är *nästa term minus den första termen*, t.ex. $3 + 6 + 12 + 24 + 48 = 96 - 3 = 93$.
6. **Rekursiva definitioner: veva bara.** Om $a_{n+1} = 2a_n - 1$ med $a_1 = 3$: räkna framåt: $3, 5, 9, 17, 33$, alltså $a_5 = 33$. För ett litet index slår fem snabba uträkningar all påhittighet.
7. **Periodicitet.** Många rekursioner upprepar sig: $a_n = a_{n-1} - a_{n-2}$ går alltid i cykel med perioden $6$, och de sex termerna i varje cykel summerar till $0$. För att se det, skriv ut termer tills det *par* av konsekutiva värden du började med dyker upp igen — från och med då är talföljden låst i en slinga.
8. **Räkning med cykel och rest.** Om ett mönster upprepas var $p$:e post: dela upp $N = qp + s$ med $0 \le s < p$: räkna $q$ hela cykler och hantera sedan de $s$ överblivna positionerna för hand. Resten talar om exakt var i cykeln du stannar.
9. **Alternerande summor paras ihop.** För $\sum_{n=1}^{N} (-1)^n n$: gruppera $(-1+2) + (-3+4) + \cdots$; varje par bidrar med $+1$. Med $N = 75$ får du $37$ par plus den oparade termen $-75$, alltså $37 - 75 = -38$.
10. **Teleskopering.** Om $t_n = \dfrac{1}{n} - \dfrac{1}{n+1}$ gäller $\sum_{n=1}^{N} t_n = 1 - \dfrac{1}{N+1}$, eftersom varje mellanliggande bråk tar ut sin granne; de första $12$ termerna summerar till $\dfrac{12}{13}$.
11. **Summor med borttagna termer.** Total $=$ (summan som om inget hoppats över) $-$ (summan av de överhoppade termerna). Båda delarna är oftast aritmetiska serier, så idé 2 klarar var och en.

## Worked examples

**Example 1**

*A trainer assigns 20 push-ups on day 1 of a program and increases the assignment by 6 push-ups each day. How many push-ups does the program assign in total over the first 15 days?*

1. Detta är aritmetiskt med $a_1 = 20$, $d = 6$, $n = 15$.
2. Sista termen: $a_{15} = 20 + 14 \cdot 6 = 104$.
3. Summa $=$ antal $\times$ medelvärde $= 15 \cdot \dfrac{20 + 104}{2} = 15 \cdot 62 = 930$.

**Answer: 930**

**Example 2**

*Aisha deposits \$4 into a fund in week 1, and each week thereafter she deposits triple the previous week's amount. At the end of which week does the total amount deposited first exceed \$400?*

1. Geometriskt med $a_1 = 4$, $r = 3$. Totalt till och med vecka $n$: $S_n = 4 \cdot \dfrac{3^n - 1}{3 - 1} = 2(3^n - 1)$.
2. Kräver $2(3^n - 1) > 400$, dvs. $3^n > 201$.
3. Potenser av $3$: $3^4 = 81$ (för litet), $3^5 = 243$ (fungerar).
4. Bekräfta totalerna: till och med vecka 4, $2(81 - 1) = 160$; till och med vecka 5, $2(243 - 1) = 484 > 400$.

**Answer: week 5**

**Example 3**

*In a sequence, $a_1 = 6$, $a_2 = 10$, and $a_n = a_{n-1} - a_{n-2}$ for all $n \ge 3$. What is the sum of the first 50 terms?*

1. Veva fram termer tills talföljden upprepar sig: $6, 10, 4, -6, -10, -4, 6, 10, \ldots$ Startparet $(6, 10)$ återkommer vid term 7 och 8, alltså är perioden $6$.
2. Summan av en hel cykel: $6 + 10 + 4 - 6 - 10 - 4 = 0$.
3. Dela upp $50 = 8 \cdot 6 + 2$: åtta hela cykler bidrar med $8 \cdot 0 = 0$.
4. De två överblivna termerna är de två första i en ny cykel: $a_{49} + a_{50} = 6 + 10 = 16$.

**Answer: 16**

## Trigger cues

- "Each row/day/month has $k$ more than the one before" → aritmetiskt; använd $a_n = a_1 + (n-1)d$ och $S_n = n \cdot \text{medelvärde}$.
- "Sum of the integers from 1 to $n$" → $\dfrac{n(n+1)}{2}$ direkt.
- "Doubles (or triples) each period" plus "total first exceeds…" → geometrisk summa $a_1\dfrac{r^n-1}{r-1}$, testa sedan potenser.
- "$a_n = a_{n-1} \pm a_{n-2}$" med ett stort index eller en summa av många termer → leta efter en cykel; skriv termer tills startparet upprepas.
- "Repeating pattern: $x$ of this, $y$ of that…" med $N$ poster → cykel och rest: $N = qp + s$.
- "$(-1)^n$" i termformeln → para ihop konsekutiva termer; se upp med en oparad term när antalet är udda.
- En term skriven som en differens av typen $\dfrac{1}{n} - \dfrac{1}{n+1}$ → teleskopering; bara första och sista delarna överlever.
- "Produces nothing every 5th minute" eller liknande bortfall → hela summan minus summan av de överhoppade termerna.

## Trap gallery

- **Att använda $n$ steg i stället för $n-1$:** term 12 i en aritmetisk talföljd är $a_1 + 11d$, inte $a_1 + 12d$ — räkna mellanrum.
- **Att svara med $n$:te termen när frågan gäller totalen** (eller tvärtom): "how many in the last row" och "how many in all" är olika formler — läs om frågans sista rad.
- **Att anta att en rekursion exploderar när den går i cykel:** $a_n = a_{n-1} - a_{n-2}$ ser Fibonacci-liknande ut men har perioden 6; testa några termer innan du extrapolerar.
- **Slarvig hantering av resten:** efter att hela cykler tagits bort startar de överblivna posterna i mönstrets *början* — mappa varje överbliven position till sin färg eller sitt värde explicit.
- **Att glömma den oparade termen i alternerande summor:** med ett udda antal termer står en term ensam kvar efter parningen.
- **Tröskelfrågor besvarade en period för tidigt eller sent:** verifiera den ackumulerade totalen på båda sidor om gränsen, som i Example 2 ($160$ mot $484$).
- **Uppgifter med överhoppade termer: att subtrahera fel belopp.** Den *schemalagda* produktionen fortsätter stiga under pauserna, så subtrahera de schemalagda värdena vid de tidpunkterna, inte en tidigare frusen nivå.

## Speed moves

- **Antal gånger medelvärde.** Varje jämnt fördelad summa är $n \cdot \dfrac{a_1 + a_n}{2}$; i Example 1 blir det $15 \cdot 62 = 930$ utan någon term-för-term-addition.
- **Fördubblingssummor faller ihop.** När $r = 2$ är summan (nästa term) $-$ (första termen): $3 + 6 + 12 + 24 + 48 = 96 - 3 = 93$.
- **Veva små index för hand.** För $a_5$ eller $a_7$ ur en rekursion är fyra till sex aritmetiska steg snabbare och säkrare än att härleda en formel.
- **Cykel och rest på en rad.** Ett mönster med perioden 5 som innehåller 3 silverföremål, $78$ totalt: $78 = 15 \cdot 5 + 3$, alltså $15 \cdot 3 = 45$ silver från hela cykler plus så många silver som ligger på de tre första positionerna.
- **Testa alternativen mot tröskeln.** Om alternativen för "vilken vecka" löper från 4 till 8: sätt in mittenalternativet i den ackumulerade formeln och justera en gång.
- **Teleskopera innan du räknar.** Skriv de två första och den sista termen i en teleskoperande summa, förkorta visuellt och läs av $1 - \dfrac{1}{N+1}$.

## Before you drill

1. Jag kan formulera $a_n = a_1 + (n-1)d$ och förklara varför multiplikatorn är $n-1$.
2. Jag kan räkna ut varje jämnt fördelad summa som antal gånger medelvärde på en rad.
3. Jag kan $S_n = a_1\dfrac{r^n - 1}{r - 1}$ och genvägen "nästa term minus första termen" vid fördubbling.
4. Givet vilken rekursion som helst skriver jag ut termer tills jag antingen når målindexet eller upptäcker ett upprepat par.
5. För ett mönster med perioden $p$ och $N$ poster delar jag upp $N = qp + s$ och hanterar de $s$ överblivna explicit.
6. Jag parar ihop alternerande summor och tar hänsyn till den ensamma oparade termen när antalet är udda.
7. Jag känner igen termer av typen $\dfrac{1}{n} - \dfrac{1}{n+1}$ som teleskoperande och behåller bara ändarna.
