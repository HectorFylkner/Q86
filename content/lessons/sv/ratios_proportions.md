# Förhållanden och proportioner: en enda multiplikator bär allt

## Why this matters

Förhållandefrågor på GMAT Focus Edition spänner över hela svårighetsskalan: snabba enstegsproportioner i den låga änden, och kedjade förhållanden, förskjutna förhållanden och blandningar av två sorter på Q85+-nivå. Varenda en av dem viker sig för samma disciplin — ersätt ett förhållande med konkreta delar som drivs av en enda multiplikator $k$, och växla mellan förhållanden och andelar av helheten utan att tveka. Kan du göra det mekaniskt blir det här ämnet en pålitlig källa till snabba, säkra poäng.

## The core ideas

1. **Multiplikatorn.** $a : b = m : n$ betyder $a = mk$ och $b = nk$ för en positiv multiplikator $k$. Sant eftersom ett förhållande bara låser de *relativa* storlekarna; $k$ bär den faktiska skalan.

2. **Att dela upp en summa eller en differens.** Om två storheter förhåller sig som $m : n$ är summan $(m + n)k$ och differensen $|m - n|k$. Exempel: delar i förhållandet $7 : 4$ med differensen $27$ ger $3k = 27$, alltså $k = 9$ och delarna $63$ och $36$.

3. **Korsmultiplikation.** $\dfrac{a}{b} = \dfrac{c}{d} \iff ad = bc$ för $b, d$ skilda från noll. Det är bara multiplikation av båda leden med $bd$; det förvandlar varje proportion till en linjär ekvation. Exempel: $\dfrac{a}{6} = \dfrac{10}{15}$ ger $15a = 60$, alltså $a = 4$.

4. **Att kedja förhållanden via en gemensam term.** Givet $x : y$ och $y : z$: skala om varje förhållande så att $y$-delarna stämmer (använd MGM) och läs sedan av $x : y : z$. Exempel: $x : y = 2 : 5$ och $y : z = 3 : 4$ blir $6 : 15$ och $15 : 20$, alltså $x : y : z = 6 : 15 : 20$. Förhållanden är skalfria, så omskalning ändrar ingenting.

5. **Förhållanden överlever multiplikation, inte addition.** Att skala båda termerna med samma faktor bevarar ett förhållande ($2 : 3 = 20 : 30$), men att addera samma tal till båda termerna ändrar det: $20 : 70 = 2 : 7$, men $30 : 80 = 3 : 8$. När personer tillkommer eller mängder läggs till måste du skriva en ny ekvation — det gamla förhållandet är borta.

6. **Lika förhållanden adderas ledvis.** Om $\dfrac{a}{b} = \dfrac{c}{d} = r$ gäller $\dfrac{a + c}{b + d} = r$, eftersom $a = rb$ och $c = rd$ ger $a + c = r(b + d)$. Exempel: $\dfrac{a}{b} = \dfrac{c}{d} = \dfrac{3}{7}$ med $a + c = 24$ tvingar fram $b + d = 56$.

7. **Direkt och omvänd proportionalitet.** Direkt: $y = kx$, så $y$ skalas med samma faktor som $x$ (går $x$ från $4$ till $10$ multipliceras $y$ med $2{,}5$: $y = 14$ blir $35$). Omvänt proportionell mot $n$:te potensen: $y = \dfrac{k}{x^n}$, så att multiplicera $x$ med $t$ dividerar $y$ med $t^n$. Hitta $k$ ur det givna paret, eller hoppa över $k$ helt och använd skalfaktorn.

8. **Lika produkter gömmer ett förhållande.** Om $3x = 4y = 6z$: sätt det gemensamma värdet till ett bekvämt tal — MGM $12$ ger $x = 4$, $y = 3$, $z = 2$ — alltså $\dfrac{x}{z} = 2$. Det fungerar eftersom varje variabel är det gemensamma värdet delat med sin koefficient.

9. **Procentförändringar verkar på förhållandets termer som faktorer.** Om $x : y = 8 : 3$ ger en ökning av $x$ med $25\%$ och en minskning av $y$ med $20\%$ att $\dfrac{1.25 \times 8}{0.8 \times 3} = \dfrac{10}{2.4} = \dfrac{25}{6}$. Multiplikatorn $k$ förkortas bort, så du kan räkna direkt på förhållandetalen.

10. **Blandningar: gör om förhållanden till andelar av helheten först.** En blandning med juice mot vatten $5 : 3$ är $\dfrac{5}{8}$ juice. Bara andelar av helheten kombineras linjärt när blandningar blandas; de råa förhållandetalen gör det inte.

## Worked examples

**Example 1**

*A painter mixes blue and yellow pigment in the ratio $4 : 9$ to make $91$ liters of green paint. How many liters of blue pigment does the painter use?*

1. Skriv delarna med en multiplikator: blått $= 4k$, gult $= 9k$.
2. Totalen är $4k + 9k = 13k = 91$, alltså $k = 7$.
3. Blått $= 4k = 28$ liter. (Kontroll: gult $= 63$, och $28 + 63 = 91$.)

**Answer: $28$ liters**

**Example 2**

*In a bookstore's inventory, the ratio of fiction titles to biography titles is $2 : 5$, and the ratio of biography titles to travel titles is $3 : 4$. If the store carries $164$ titles across these three categories, how many more travel titles than fiction titles does it carry?*

1. Rikta in de två förhållandena mot biografierna. MGM av $5$ och $3$ är $15$: skala om $2 : 5$ till $6 : 15$ och $3 : 4$ till $15 : 20$.
2. Alltså skönlitteratur $= 6k$, biografier $= 15k$, reseskildringar $= 20k$.
3. Totalt: $6k + 15k + 20k = 41k = 164$, alltså $k = 4$.
4. Reseskildringar minus skönlitteratur: $(20 - 6)k = 14 \times 4 = 56$. (Kontroll: $24 + 60 + 80 = 164$, och $24 : 60 = 2 : 5$, $60 : 80 = 3 : 4$.)

**Answer: $56$**

**Example 3**

*A metalworker has two alloys. In Alloy X, the ratio of copper to tin is $7 : 5$; in Alloy Y, the ratio of copper to tin is $1 : 3$. She melts portions of the two alloys together to produce $120$ kilograms of a new alloy in which copper and tin are in the ratio $1 : 1$. How many kilograms of Alloy X does she use?*

1. Gör om varje förhållande till en andel av helheten: Alloy X är $\dfrac{7}{12}$ koppar, Alloy Y är $\dfrac{1}{4}$ koppar, och målet är $\dfrac{1}{2}$ koppar.
2. Låt $x$ vara antalet kilogram Alloy X, så bidrar Alloy Y med $120 - x$. Målblandningen innehåller $\dfrac{1}{2} \times 120 = 60$ kg koppar.
3. Följ kopparn: $\dfrac{7}{12}x + \dfrac{1}{4}(120 - x) = 60$.
4. Förenkla: $\dfrac{7}{12}x - \dfrac{3}{12}x + 30 = 60$, alltså $\dfrac{1}{3}x = 30$ och $x = 90$.
5. Kontroll: Alloy X ger $90 \times \dfrac{7}{12} = 52.5$ kg koppar; Alloy Y ger $30 \times \dfrac{1}{4} = 7.5$ kg. Koppar $= 60$ kg, tenn $= 60$ kg — exakt $1 : 1$.

**Answer: $90$ kilograms**

## Trigger cues

- "The ratio of $a$ to $b$ is $m : n$" plus en total, en differens eller ett faktiskt värde → sätt $a = mk$, $b = nk$ och lös ut $k$.
- "$x : y = \ldots$ and $y : z = \ldots$" → skala om båda förhållandena så att den gemensamma termen möter sin MGM, och använd sedan en multiplikator för alla tre.
- "If $6$ more are added, the ratio becomes …" → skriv delarna som $mk$ och $nk$, tillämpa förändringen, ställ upp det nya förhållandet och korsmultiplicera.
- "$\dfrac{a}{b} = \dfrac{c}{d}$ och $a + c$ är givet" → lika förhållanden adderas ledvis: $\dfrac{a+c}{b+d}$ är lika med det gemensamma förhållandet.
- "Inversely proportional to the square of" → $y = \dfrac{k}{x^2}$; när $x$ tredubblas, dividera $y$ med $9$.
- "$2x = 3y = 8z$" → sätt det gemensamma värdet till MGM och läs av varje variabel.
- "Two blends are combined so that the ratio becomes …" → gör om varje förhållande till en andel av helheten och följ sedan den totala mängden av en ingrediens.

## Trap gallery

- **Att behandla förhållandetal som faktiska antal.** $a : b = 4 : 7$ betyder inte $a = 4$; det betyder $a = 4k$. Åtgärd: multiplikatorn kommer alltid först.
- **Att anta att det gamla förhållandet överlever en addition.** Att lägga $10$ till varje term i $20 : 70$ ger $30 : 80 = 3 : 8$, inte $2 : 7$. Åtgärd: additioner kräver en ny ekvation.
- **Att ta medelvärdet av förhållandena i en blandning.** Lika mängder av en $1 : 1$-blandning och en $1 : 3$-blandning ger juiceandelen $\dfrac{1}{2} \cdot \dfrac{1}{2} + \dfrac{1}{2} \cdot \dfrac{1}{4} = \dfrac{3}{8}$ — ett förhållande på $3 : 5$, inte "medelvärdet" $1 : 2$. Åtgärd: gör om till andelar av helheten innan du kombinerar.
- **Att kedja utan att rikta in.** Ur $x : y = 2 : 5$ och $y : z = 3 : 4$ är det sammanslagna förhållandet $6 : 15 : 20$, aldrig $2 : 5 : 4$. Åtgärd: den gemensamma termen måste vara identisk i båda förhållandena först.
- **Att kasta om direkt och omvänd proportionalitet.** Om $y$ är omvänt proportionellt mot $x^2$ och $x$ fördubblas, divideras $y$ med $4$, det fördubblas inte. Åtgärd: skriv $y = \dfrac{k}{x^2}$ innan du rör några tal.
- **Att läsa $2x = 3y$ som $x : y = 2 : 3$.** Det ger $x : y = 3 : 2$ — koefficienterna byter sida. Åtgärd: lös $\dfrac{x}{y} = \dfrac{3}{2}$ explicit eller sätt in MGM.

## Speed moves

- **Dividera totalen med summan av delarna.** Förhållandet $4 : 9$, totalen $91$: räkna $91 \div 13 = 7$ en gång och multiplicera sedan — inga ekvationer behövs.
- **Välj bekväma tal när förhållandet är allt du har.** För "$x : y = 8 : 3$; $x$ rises $25\%$, $y$ falls $20\%$": sätt bara $x = 8$, $y = 3$ och räkna $\dfrac{10}{2.4} = \dfrac{25}{6}$; multiplikatorn förkortas bort.
- **MGM-insättning vid lika produkter.** För $3x = 4y = 6z$: sätt det gemensamma värdet till $12$ och få direkt $x = 4$, $y = 3$, $z = 2$.
- **Hoppa över konstanten i proportionalitetsuppgifter.** Omvänd kvadratisk med $x$ från $3$ till $6$: $y$ divideras med $2^2 = 4$, så $y = 32$ blir $8$ — ingen anledning att räkna ut $k = 288$.
- **Testa alternativen i frågor om förskjutna förhållanden.** "Red to black pens $7 : 3$; after $8$ black pens are added the ratio is $7 : 5$" — testa alternativet rött $= 28$: svart var $12$, blir $20$, och $28 : 20 = 7 : 5$. Klart.
- **Använd delbarhet på svarsalternativen.** Om tre storheter är $6k$, $15k$, $20k$ måste deras summa vara en multipel av $41$ — stryk varje alternativ som inte är det.

## Before you drill

- Jag skriver $a = mk$, $b = nk$ i samma stund jag ser ett förhållande, och jag behandlar aldrig förhållandetal som antal.
- Jag kan kedja $x : y$ och $y : z$ till $x : y : z$ genom att skala om den gemensamma termen till dess MGM.
- Jag vet att skalning bevarar ett förhållande men att addera till båda termerna inte gör det, och jag ställer upp en ny ekvation efter varje tillkomst eller bortfall.
- Jag kan använda $\dfrac{a}{b} = \dfrac{c}{d} \Rightarrow \dfrac{a+c}{b+d} = \dfrac{a}{b}$ på synhåll.
- Jag översätter "inversely proportional to $x^n$" till $y = \dfrac{k}{x^n}$ och kan lösa uppgiften med enbart skalfaktorn.
- Jag gör om varje blandningsförhållande till en andel av helheten innan jag blandar.
- Jag kan förvandla $2x = 3y = 8z$ till exakta värden genom att sätta in MGM som det gemensamma värdet.
