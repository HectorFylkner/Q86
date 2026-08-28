# Ränta, vinst och rabatt: en multiplikator i taget

## Why this matters
Varje fråga i den här familjen — påslag, prisnedsättningar, vinstmål, enkel och sammansatt ränta — är en procentförändringsuppgift i kostym. GMAT testar det från lätta enstegsomräkningar upp till svåra flerlagersuppställningar där två eller tre procentförändringar staplas, och fällalternativen är byggda på förutsägbara felläsningar: vinst mätt mot fel bas, rabatter adderade i stället för multiplicerade, eller ränta som kapitaliseras enligt fel schema. På Q86-nivå förväntas du översätta berättelsen till en enda ren ekvation på under 30 sekunder och lägga din tid på aritmetiken, inte på uppställningen.

## The core ideas
1. **Definition av vinst.** $\text{Vinst} = S - C$, där $S$ är försäljningspris och $C$ är kostnad. Varje uppgift i den här familjen reduceras till att hålla reda på de två talen.
2. **Vinst som procent av kostnaden.** En vinst på $p$ (som decimaltal) *på kostnaden* betyder $S = C(1+p)$. Det är standardbetydelsen av "a 30% profit" — basen är kostnaden om inte uppgiften säger något annat.
3. **Vinst som procent av försäljningspriset (marginal).** Om vinsten är $m$ av *försäljningspriset* gäller $\text{Vinst} = mS$ och därmed $C = (1-m)S$. Läs "of"-satsen noga; just den frasen ändrar hela ekvationen.
4. **Omräkning mellan marginal och påslag.** En marginal på $m$ av försäljningspriset motsvarar ett påslag på $\frac{m}{1-m}$ av kostnaden, eftersom $S - C = mS$ skrivs om till $S = \frac{C}{1-m}$. Exempel: en marginal på $20\%$ är ett påslag på $25\%$, eftersom $\frac{0.2}{0.8} = 0.25$.
5. **Procentförändringar sätts samman multiplikativt.** Ett påslag med $x$ följt av en rabatt på $y$ ger nettofaktorn $(1+x)(1-y)$, aldrig $1 + x - y$. Varje förändring verkar på det *aktuella* priset, så faktorerna multipliceras.
6. **Nettomultiplikatorn ger nettoförändringen.** Om den kedjade faktorn är $k$ är den totala procentförändringen $k - 1$. Ett påslag på $60\%$ följt av rabatter på $25\%$ och $10\%$ ger $1.6 \times 0.75 \times 0.9 = 1.08$, dvs. en nettovinst på $8\%$ — så vinsten är $0.08C$ oavsett beloppen.
7. **Enkel ränta.** $I = Prt$ och $A = P(1 + rt)$, med $t$ i år — räkna om månader med $t = \frac{\text{månader}}{12}$. Räntan löper bara på det ursprungliga kapitalet, så den är linjär i tiden.
8. **Sammansatt ränta.** $A = P\left(1 + \frac{r}{n}\right)^{nt}$ för årsräntan $r$ kapitaliserad $n$ gånger per år. "Compounded semiannually at $4\%$" betyder två perioder om $2\%$ vardera per år: varje period multiplicerar saldot med periodfaktorn.
9. **Sammansatt slår enkel med räntan på räntan.** Över $2$ år med årsräntan $r$ är gapet exakt $Pr^2$, eftersom $P(1+r)^2 - P(1+2r) = Pr^2$. Kontroll: $\$1{,}000$ till $5\%$ ger $\$1{,}102.50$ mot $\$1{,}100$, ett gap på $\$2.50 = 1000(0.05)^2$.
10. **Tvåscenariopivoten.** Om försäljning till priserna $S_1$ och $S_2$ ger vinster på $p_1$ respektive $p_2$ procent av *samma* kostnad gäller $S_2 - S_1 = (p_2 - p_1)C$. Beloppsgapet mellan scenarierna är procentgapet tillämpat på kostnaden — en ekvation, en obekant.

## Worked examples

**Example 1**
*A vendor sold a set of headphones for $\$84$, earning a profit equal to $20\%$ of her cost. At what price, in dollars, should she have sold the headphones to earn a profit equal to $40\%$ of her cost?*

1. "Profit of $20\%$ of cost" betyder $S = 1.2C$, alltså $84 = 1.2C$ och $C = 70$.
2. Målpriset för en vinst på $40\%$ av samma kostnad är $1.4C = 1.4 \times 70 = 98$.

**Answer: $\$98$**

**Example 2**
*Dana deposits $\$9{,}000$ into an account earning $6\%$ annual interest, compounded semiannually. How many dollars more interest does the account earn in the first year than it would have earned at $6\%$ simple annual interest?*

1. Halvårsvis kapitalisering till $6\%$ per år betyder två perioder om $3\%$ vardera: saldot vid årets slut är $9000(1.03)^2 = 9000 \times 1.0609 = 9548.10$, alltså är den sammansatta räntan $\$548.10$.
2. Enkel ränta för ett år är $9000 \times 0.06 = 540$.
3. Skillnaden är $548.10 - 540 = 8.10$. (Strukturell kontroll: gapet är ränta på den första periodens ränta, $P\left(\frac{r}{2}\right)^2 = 9000 \times 0.0009 = 8.10$.)

**Answer: $\$8.10$**

**Example 3**
*A gallery prices a framed print so that its profit is $30\%$ of the selling price. At an art fair, the gallery reduces the selling price by $20\%$ and sells the print, earning a profit of $\$52$. How many dollars did the gallery pay for the print?*

1. Låt $S$ vara det ursprungliga försäljningspriset. Vinsten är $30\%$ *av försäljningspriset*, alltså är kostnaden $C = 0.7S$.
2. Mässpriset är $0.8S$, och den realiserade vinsten är $0.8S - C = 0.8S - 0.7S = 0.1S$.
3. Sätt $0.1S = 52$, alltså $S = 520$.
4. Då är $C = 0.7 \times 520 = 364$.

**Answer: $\$364$**

## Trigger cues
- "Marked up by $x\%$, then discounted $y\%$, then a further $z\%$ off" → multiplicera ihop alla faktorer till en nettomultiplikator innan du inför några belopp.
- "Profit of $k\%$ of the selling price" → skriv $C = (1-k)S$ direkt; basen är $S$, inte $C$.
- "Sold at a loss of $a\%$; $\$d$ more would have given a profit of $b\%$" → tvåscenariopivoten: $(a + b)\% \times C = d$.
- "Settled the loan after $m$ months" med enkel ränta → $I = Pr \cdot \frac{m}{12}$; lös ut årsräntan.
- "Compounded semiannually / quarterly" → räkna om till periodräntan $\frac{r}{n}$ och räkna perioderna $nt$ innan du räknar något annat.
- "Discounts the list price by $x\%$ and still earns a profit of $y\%$ of cost" → en ekvation: $(1-x)L = (1+y)C$.

## Trap gallery
- **Att addera staplade procenttal.** Att behandla $20\%$ rabatt följt av $10\%$ rabatt som $30\%$ rabatt. Åtgärd: multiplicera — $0.8 \times 0.9 = 0.72$, en rabatt på $28\%$.
- **Fel vinstbas.** Att läsa "profit is $25\%$ of the selling price" som $S = 1.25C$. Åtgärd: marginal på $S$ betyder $C = 0.75S$; påslag på $C$ betyder $S = 1.25C$ — olika ekvationer, olika svar.
- **Symmetriskt upp och ner.** Att anta att $+25\%$ följt av $-25\%$ går jämnt ut. Åtgärd: $1.25 \times 0.75 = 0.9375$, en förlust på $6{,}25\%$ — rabatten verkar på en större bas.
- **Att glömma räkna om månader.** Att sätta in $t = 8$ i stället för $t = \frac{8}{12}$ i $I = Prt$. Åtgärd: tiden i enkel ränta är alltid i år.
- **Att kapitalisera med hela årsräntan.** Att använda $(1+r)^2$ för ett år med halvårsvis kapitalisering. Åtgärd: periodräntan är $\frac{r}{2}$; året är $\left(1+\frac{r}{2}\right)^2$.
- **Att ange beloppet i stället för räntan.** Att lösa ut $A$ och stanna där. Åtgärd: läs om frågan — intjänad ränta är $A - P$; vinst är $S - C$.

## Speed moves
- **Komprimera kedjan först.** Multiplicera ihop alla påslags- och rabattfaktorer till ett tal innan du rör beloppen: $1.6 \times 0.75 \times 0.9 = 1.08$ förvandlar en tresteshistoria till "vinsten är $8\%$ av kostnaden".
- **Välj en bekväm kostnad.** För rena procentfrågor, sätt kostnaden till $\$100$: ett påslag på $40\%$ följt av $30\%$ rabatt ger $140 \times 0.7 = 98$, alltså en förlust på $2\%$ — läs av svaret direkt.
- **Dividera direkt ur vinstsambandet.** Givet $S$ och en vinstprocent på kostnaden, dividera: $C = \frac{84}{1.2} = 70$ är snabbare än att ställa upp en ekvation.
- **Tvåårsgapet för sammansatt ränta ur formeln.** Skillnaden mellan sammansatt och enkel ränta över två årsperioder är $Pr^2$ — ingen potensräkning behövs.
- **Pivotera utan priser.** För "loss of $12\%$ versus profit of $8\%$, a $\$90$ swing": hoppa till $0.20C = 90$, alltså $C = 450$ — räkna aldrig ut något av försäljningspriserna.

## Before you drill
1. Jag kan avgöra om en given vinstprocent baseras på kostnaden eller på försäljningspriset, och skriva den matchande ekvationen på synhåll.
2. Jag gör om varje kedja av påslag och rabatter till en enda multiplikator innan jag använder belopp.
3. Jag vet att nettoförändringen i procent är multiplikatorn minus $1$, och jag adderar aldrig staplade procenttal.
4. Jag kan tillämpa $I = Prt$ med månader omräknade till en del av ett år.
5. Jag kan ställa upp $P\left(1+\frac{r}{n}\right)^{nt}$ för halvårsvis eller kvartalsvis kapitalisering utan att tveka.
6. Jag vet att gapet mellan sammansatt och enkel ränta över två år är $Pr^2$, och varför.
7. Givet två försäljningsscenarier på en och samma kostnad kan jag på en rad sätta beloppsgapet lika med procentgapet gånger kostnaden.
