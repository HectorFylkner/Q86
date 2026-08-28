# Exponenter och rötter: potenslagar, teckenfällor och dolda andragradare

## Why this matters
Frågor om exponenter och rötter på GMAT Focus Edition handlar sällan om ren räkning — de prövar om du kan tvinga in varje kvantitet i en gemensam bas och om du respekterar de fall (noll, ett, negativa tal, bråk mellan 0 och 1) som spräcker det "uppenbara" algebraiska draget. På Q86-nivå dyker ämnet upp på två sätt: snabba Problem Solving-omskrivningar som borde ta under 90 sekunder, och Data Sufficiency-uppgifter helt byggda kring ett tappat tecken eller en tappad lösning. Reglerna är få; disciplinen i att tillämpa dem är hela poängen.

## The core ideas
1. **Produktregeln:** $a^{m} \cdot a^{n} = a^{m+n}$ — att multiplicera högar av samma faktor slår bara ihop antalen.
2. **Kvotregeln:** $\dfrac{a^{m}}{a^{n}} = a^{m-n}$ — förkortning tar bort $n$ kopior av faktorn från täljaren.
3. **Potensregeln:** $(a^{m})^{n} = a^{mn}$ — $n$ grupper om $m$ faktorer är $mn$ faktorer. Jämför med $a^{m^{n}}$, som i stället tornar upp sig: $(2^{3})^{2} = 2^{6} = 64$ men $2^{3^{2}} = 2^{9} = 512$.
4. **Exponenten noll och negativa exponenter:** $a^{0} = 1$ för $a \ne 0$, och $a^{-n} = \dfrac{1}{a^{n}}$; en negativ exponent på ett bråk vänder det, så $\left(\dfrac{1}{2}\right)^{-3} = 2^{3} = 8$ och $\left(\dfrac{2}{3}\right)^{-2} = \dfrac{9}{4}$.
5. **Rationella exponenter:** $a^{1/n} = \sqrt[n]{a}$ och $a^{m/n} = \left(\sqrt[n]{a}\right)^{m}$, t.ex. $64^{2/3} = 4^{2} = 16$ — ta roten först för att hålla talen små.
6. **Omskrivning till gemensam bas:** skriv om sammansatta baser som primtalspotenser innan du gör något annat: $4 = 2^{2}$, $8 = 2^{3}$, $9 = 3^{2}$, $27 = 3^{3}$, $125 = 5^{3}$. När baserna stämmer och basen är positiv och inte $1$ kan exponenterna sättas lika: $b^{p} = b^{q} \Rightarrow p = q$.
7. **Upprepad addition av samma potens:** $n$ identiska kopior bryts ut på en gång, så $a^{x} + a^{x} + \cdots + a^{x} = n \cdot a^{x}$; när $n$ är lika med basen faller det ihop vackert, t.ex. $3^{x} + 3^{x} + 3^{x} = 3^{x+1}$.
8. **Jämna potenser raderar tecknet:** $\sqrt{x^{2}} = |x|$, inte $x$ — kvadrering skickar $4$ och $-4$ till samma ställe, så kvadratroten kan bara återskapa beloppet.
9. **Dividera aldrig med en variabel som kan vara noll:** $x^{2} = 2x$ har lösningarna $x = 0$ och $x = 2$; att dividera båda leden med $x$ raderar tyst den första. Flytta i stället allt till ena sidan och faktorisera.
10. **Rotaritmetik:** $\sqrt{ab} = \sqrt{a}\sqrt{b}$ för icke-negativa $a, b$, så förenkla genom att bryta ut den största kvadraten: $\sqrt{75} = 5\sqrt{3}$. Men rötter fördelar sig inte över addition: $\sqrt{9} + \sqrt{16} = 7 \ne \sqrt{25} = 5$.
11. **En potens tecken:** en positiv bas ger ett positivt resultat för varje exponent; en negativ bas ger positivt för jämna heltalsexponenter och negativt för udda. Alltså är $(-5)^{n} > 0$ precis när $n$ är jämnt.
12. **Ordningen vänder mellan 0 och 1:** om $0 < x < 1$ gäller $x^{2} < x < \sqrt{x}$ (kontrollera med $x = \dfrac{1}{4}$: $0{,}0625 < 0{,}25 < 0{,}5$); om $x > 1$ vänds kedjan. Potenser knuffar tal bort från $1$ eller mot det — anta aldrig att "kvadrering gör större".
13. **När är $w^{k} = 1$?** Tre vägar: $w = 1$ (vilket $k$ som helst), $k = 0$ (vilket $w \ne 0$ som helst), eller $w = -1$ med jämnt $k$. Varje ekvation av formen $x^{f(x)} = 1$ måste prövas mot alla tre.
14. **Dolda andragradare:** eftersom $a^{2x} = (a^{x})^{2}$ är varje ekvation som blandar $a^{2x}$ och $a^{x}$ en förklädd andragradsekvation — substituera $y = a^{x}$ och kom ihåg att $y > 0$.
15. **Den memorerade stegen:** kunna $2^{1}$ till $2^{12} = 4096$, $3^{1}$ till $3^{6} = 729$, kvadrater upp till $25^{2}$ och kuber upp till $10^{3}$. Att på synhåll känna igen $4096 = 2^{12} = 4^{6} = 8^{4} = 16^{3} = 64^{2}$ förvandlar en svår fråga till bokföring.

## Worked examples

**Example 1**

*If $\dfrac{25^{4} \cdot 125^{3}}{5^{6}} = 5^{k}$, what is the value of $k$?*

1. Skriv om varje bas till det gemensamma primtalet: $25 = 5^{2}$ och $125 = 5^{3}$.
2. Tillämpa potensregeln på täljaren: $(5^{2})^{4} \cdot (5^{3})^{3} = 5^{8} \cdot 5^{9} = 5^{17}$.
3. Tillämpa kvotregeln: $\dfrac{5^{17}}{5^{6}} = 5^{11}$.

**Answer: $k = 11$**

**Example 2**

*If $3^{x} + 3^{x} + 3^{x} = \dfrac{81^{5}}{9^{2}}$, what is the value of $x$?*

1. Vänsterledet är tre identiska kopior av $3^{x}$, alltså lika med $3 \cdot 3^{x} = 3^{x+1}$.
2. Skriv om högerledet med basen $3$: $81 = 3^{4}$ och $9 = 3^{2}$, så $\dfrac{(3^{4})^{5}}{(3^{2})^{2}} = \dfrac{3^{20}}{3^{4}} = 3^{16}$.
3. Baserna stämmer och $3$ är varken $0$ eller $\pm 1$, så sätt exponenterna lika: $x + 1 = 16$.

**Answer: $x = 15$**

**Example 3**

*If $4^{x} - 10 \cdot 2^{x} + 16 = 0$, what is the sum of all possible values of $x$?*

1. Se förklädnaden: $4^{x} = (2^{2})^{x} = (2^{x})^{2}$, så ekvationen är en andragradsekvation i $2^{x}$.
2. Substituera $y = 2^{x}$ och notera att $y > 0$: ekvationen blir $y^{2} - 10y + 16 = 0$.
3. Faktorisera: $(y - 2)(y - 8) = 0$, alltså $y = 2$ eller $y = 8$. Båda är positiva, så båda är giltiga värden på $2^{x}$.
4. Gå tillbaka från substitutionen: $2^{x} = 2$ ger $x = 1$; $2^{x} = 8 = 2^{3}$ ger $x = 3$.
5. Summan av alla möjliga värden är $1 + 3 = 4$.

**Answer: $4$**

## Trigger cues
- "Simplify $\dfrac{9^{a} \cdot 27^{b}}{3^{c}}$" eller vilken blandning som helst av besläktade baser → skriv först om allt i den minsta primtalsbasen, addera och subtrahera sedan exponenter.
- Samma potens adderad till sig själv flera gånger → räkna kopiorna och bryt ut: $n$ kopior av $a^{x}$ är $n \cdot a^{x}$.
- Ett påstående innehåller $\sqrt{x^{2}}$, $x^{2}$ eller $x^{4}$ → lös ut $|x|$ och testa sedan de positiva och negativa kandidaterna var för sig innan du kallar något tillräckligt.
- Både $a^{2x}$ och $a^{x}$ (eller $4^{x}$ och $2^{x}$) i samma ekvation → substituera $y = a^{x}$ och lös andragradaren.
- "Doubles every $h$ hours" eller "cut in half every $h$ hours" → modellera som $P \cdot 2^{t/h}$ eller $P \cdot 2^{-t/h}$ och jämför exponenter, aldrig råa mängder.
- "Is $\sqrt{x} > x$?" eller vilken ordningsfråga om potenser som helst → dela tallinjen vid $0$ och $1$ och testa ett värde i varje område.
- $x^{y} = 4096$ (eller en annan potensrik konstant) med heltalsvillkor → skriv primtalsfaktoriseringen och lista varje giltigt par $(x, y)$ innan du bedömer tillräcklighet.

## Trap gallery
- **Att dividera med variabeln:** att förkorta bort $x$ ur $x^{2} = 2x$ dödar lösningen $x = 0$; faktorisera $x(x - 2) = 0$ i stället.
- **$\sqrt{x^{2}} = x$:** det är $|x|$; ett Data Sufficiency-påstående som låser fast $|x| = 4$ lämnar fortfarande två värden på $x^{3}$.
- **Att sätta exponenter lika för tidigt:** $b^{x} = b^{2x - 6}$ tvingar fram $x = 6$ bara om $b \ne 1$ (och $b \ne 0, -1$); om $b = 1$ fungerar varje $x$.
- **Att addera exponenter över ett plustecken:** $2^{x} + 2^{x}$ är $2^{x+1}$, inte $2^{2x}$ — kontrollera med $8 + 8 = 16$.
- **Tornförvirring:** $(a^{m})^{n}$ multiplicerar exponenter, $a^{m^{n}}$ gör det inte; $(2^{3})^{2} = 64$ medan $2^{3^{2}} = 512$.
- **Att anta en enda representation:** $x^{y} = 4096$ ensamt tillåter $2^{12}$, $4^{6}$, $8^{4}$, $16^{3}$ och $64^{2}$.
- **Att behålla omöjliga rötter:** efter substitutionen $y = 2^{x}$ måste en rot som $y = -2$ förkastas, eftersom $2^{x} > 0$ för alla reella $x$.
- **"Kvadrering gör större":** falskt på $(0,1)$, där $x^{2} < x$; dessutom gäller $x^{2} > x$ för varje negativt $x$, inte bara för $x > 1$.

## Speed moves
- **Primtalsskriv direkt:** i samma sekund du ser blandade baser, skriv om i primtal; Example 1 blir ren exponentaritmetik $8 + 9 - 6 = 11$ utan att något stort tal någonsin beräknas.
- **Arbeta i exponenter, inte mängder:** på en skala där varje enhet multiplicerar energin med $9$ betyder ett avläsningsavstånd på $1{,}5$ ett förhållande på $9^{1.5} = 9 \cdot 3 = 27$ — tre sekunder, ingen miniräknare.
- **Riktvärden för ordningsfrågor:** testa $x = \dfrac{1}{4}$ och $x = 4$; tillsammans avslöjar de hur $x$, $x^{2}$ och $\sqrt{x}$ rangordnas i varje område.
- **Testa små exponenter från svarsalternativen:** GMAT:s exponentsvar är nästan alltid små heltal, så att sätta in $x = 1, 2, 3$ i något som $4^{x} - 10 \cdot 2^{x} + 16 = 0$ kan slå formell faktorisering.
- **Använd den memorerade stegen som avkodare:** när du ser $729$, hoppa direkt till $3^{6}$ och läs av representationer som $9^{3}$ och $27^{2}$ ur faktorparen till $6$.

## Before you drill
1. Jag kan skriva om $4, 8, 9, 16, 25, 27, 32, 64, 81, 125$ till primtalspotenser utan att tveka.
2. Jag kan förklara varför $\sqrt{x^{2}} = |x|$ och vad det gör med ett Data Sufficiency-svar.
3. Jag kan slå ihop $n$ identiska kopior av $a^{x}$ till en enda potens på en rad.
4. Jag kan substituera $y = a^{x}$ i en dold andragradare och automatiskt förkasta varje icke-positiv rot.
5. Jag kan rangordna $x$, $x^{2}$ och $\sqrt{x}$ på $0 < x < 1$ och på $x > 1$ utan att sätta in tal.
6. Jag kan lista varje fall som gör $w^{k} = 1$ och varje basvärde som blockerar att exponenter sätts lika.
7. Jag kan förenkla vilket $\sqrt{N}$ som helst genom att bryta ut den största kvadratfaktorn.
