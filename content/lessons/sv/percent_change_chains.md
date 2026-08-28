# Kedjor av procentförändringar: multiplicera faktorer, addera aldrig procent

## Why this matters

Kedjade procentförändringar — ett påslag följt av en rabatt, två års tillväxt, en förlust och en återhämtning — dyker upp hela tiden på GMAT Focus Edition, från uppvärmningsuppgifter till Q85+-uppgifter som gömmer en andragradsekvation inuti kedjan. Provet testar en enda disciplin: gör om varje procentförändring till en multiplikationsfaktor och addera aldrig procenttal som räknats på olika baser. Behärska faktorvanan så blir det här 30–60-sekundersfrågor.

## The core ideas

1. **Procentförändring som faktor.** En ökning med $p\%$ multiplicerar en storhet med $\left(1 + \frac{p}{100}\right)$; en minskning med $p\%$ multiplicerar den med $\left(1 - \frac{p}{100}\right)$. Sant eftersom $x \pm \frac{p}{100}x = x\left(1 \pm \frac{p}{100}\right)$.

2. **Kedjor multipliceras.** Följande förändringar sätts samman genom att faktorerna multipliceras: $+20\%$ och sedan $-20\%$ ger $(1.2)(0.8) = 0.96$, dvs. $4\%$ under utgångsläget — aldrig $0\%$. Varje förändring verkar på det *aktuella* värdet.

3. **Ordningen spelar aldrig roll.** Multiplikation är kommutativ, så $30\%$ rabatt följt av en kupong på $10\%$ landar på samma pris som omvänd ordning. Använd det för att välja den enklaste räkningen.

4. **Nettoförändring i procent ur nettofaktorn.** Om produkten av faktorerna är $F$ är den totala förändringen $(F - 1)\times 100\%$. Exempel: $+10\%$ och sedan $+30\%$ ger $F = (1.1)(1.3) = 1.43$, alltså en nettoökning på $43\%$ — den andra förändringen verkar på en större bas.

5. **Lika upp och ner förlorar alltid.** $\left(1 + \frac{p}{100}\right)\left(1 - \frac{p}{100}\right) = 1 - \frac{p^2}{10000}$, en nettoförlust på $\frac{p^2}{100}\%$. Konjugatregeln gör det ögonblickligt: $p = 20$ betyder en nettoförlust på $\frac{400}{100} = 4\%$.

6. **Att vända en förändring är att dividera.** Om en storhet blev $y$ efter en ökning med $p\%$ var ursprunget $\frac{y}{1 + p/100}$. Att göra ogjort ett $+60\%$ som gav $208$ ger $\frac{208}{1.6} = 130$; att i stället tillämpa $-60\%$ är fel eftersom basen har ändrats.

7. **Återhämtningsprocent är asymmetrisk.** Efter ett fall på $p\%$ kräver en återgång till ursprunget en uppgång på $\frac{p}{100 - p}\times 100\%$, eftersom $\left(1 - \frac{p}{100}\right)F = 1$ tvingar fram $F = \frac{1}{1 - p/100}$. En förlust på $40\%$ behöver $\frac{1}{0.6} \approx 1{,}667$, alltså en uppgång på ungefär $67\%$.

8. **"Greater than" vänds till ett annat "less than".** Om $x = 1.25y$ gäller $y = \frac{x}{1.25} = 0.8x$: $y$ är $20\%$ mindre än $x$, eftersom referensbasen har bytts.

9. **Kedjor med okänd procent blir polynom.** Med $t = \frac{k}{100}$ är en kedja som "ner $k\%$, sedan upp $2k\%$" lika med $(1 - t)(1 + 2t)$; att sätta det lika med målfaktorn ger en andragradsekvation. Expandera, lös, och behåll den rot som håller varje faktor positiv.

## Worked examples

**Example 1**

*A tablet is listed at $\$250$. The store raises the list price by $20\%$, and during a clearance event sells it at $35\%$ off the raised price. What is the clearance price?*

1. Gör om varje förändring till en faktor: $+20\%$ är $1{,}2$; $35\%$ rabatt är $0{,}65$.
2. Multiplicera genom kedjan: $250 \times 1.2 \times 0.65$.
3. Räkna i den vänligaste ordningen: $250 \times 1.2 = 300$, och $300 \times 0.65 = 195$.
4. Rimlighetskontrollera nettofaktorn: $1.2 \times 0.65 = 0.78$, så slutpriset bör ligga $22\%$ under det ursprungliga listpriset — och $195$ är mycket riktigt $78\%$ av $250$.

**Answer: $\$195$**

**Example 2**

*A website's monthly traffic rose $40\%$ from January to February. From February to March it fell, and March traffic was exactly $5\%$ above January traffic. By what percent did traffic fall from February to March?*

1. Låt januaritrafiken vara $1$. Då är februari $1{,}40$ och mars $1{,}05$.
2. Faktorn från februari till mars är $\frac{1.05}{1.40} = 0.75$.
3. En faktor på $0{,}75$ är en minskning med $25\%$.
4. Bekräfta: $1.40 \times 0.75 = 1.05$. Svaret är inte $40\% - 5\% = 35\%$; fallet mäts mot den större februaribasen.

**Answer: $25\%$**

**Example 3**

*A positive number is increased by $k\%$, and the result is then decreased by $2k\%$. The final value is $28\%$ less than the original number. If $k$ is a positive integer, what is $k$?*

1. Skriv kedjan som faktorer med $t = \frac{k}{100}$: slutvärdet är $(1 + t)(1 - 2t)$ gånger ursprunget.
2. "$28\%$ less" betyder att nettofaktorn är $0{,}72$: $(1 + t)(1 - 2t) = 0.72$.
3. Rensa bort nämnarna genom att skriva det i $k$: $(100 + k)(100 - 2k) = 7200$.
4. Expandera: $10000 - 100k - 2k^2 = 7200$, alltså $2k^2 + 100k - 2800 = 0$, dvs. $k^2 + 50k - 1400 = 0$.
5. Faktorisera: $(k + 70)(k - 20) = 0$, alltså $k = 20$ (roten $k = -70$ förkastas).
6. Verifiera: $+20\%$ och sedan $-40\%$ ger $1.20 \times 0.60 = 0.72$. Rätt.

**Answer: $k = 20$**

## Trigger cues

- "Increased by $a\%$, then decreased by $b\%$" → multiplicera faktorerna $\left(1 + \frac{a}{100}\right)\left(1 - \frac{b}{100}\right)$; slå aldrig ihop $a$ och $b$ genom addition.
- "The final value is what percent of / greater than the original?" → räkna ut nettofaktorn $F$ och ange sedan $100F$ eller $100(F - 1)$.
- "After a $p\%$ increase, the value is $y$; find the original" → dividera: ursprunget $= \frac{y}{1 + p/100}$.
- "What percent gain restores the original value?" → invers faktor: $\frac{1}{1 - p/100}$, minus $1$.
- "$x$ is $p\%$ greater than $y$; $y$ is what percent less than $x$?" → byt bas: räkna $1 - \frac{1}{1 + p/100}$.
- "Fell in the second period and ended $q\%$ above the start" → dividera nettofaktorn med den första faktorn för att isolera det okända ledet.
- "By $k\%$ … then by $2k\%$ … $k$ is a positive integer" → sätt faktorprodukten lika med målet; lös andragradaren eller testa svarsalternativen.

## Trap gallery

- **Att addera procenttalen.** $+20\%$ och sedan $-20\%$ är inte $0\%$; det är $(1.2)(0.8) = 0.96$, en förlust på $4\%$. Faktorer multipliceras.
- **Att återanvända ursprungsbasen för den andra förändringen.** En kupong på $10\%$ av ett reapris gäller *reapriset*, inte originalpriset. Åtgärd: varje faktor verkar på det löpande värdet.
- **Att göra ogjort en ökning genom att subtrahera samma procent.** Att vända $+60\%$ betyder att dividera med $1{,}6$, inte att multiplicera med $0{,}4$.
- **Symmetrisk återhämtning.** Efter $-40\%$ ger en uppgång på $+40\%$ resultatet $0.6 \times 1.4 = 0.84$, alltjämt för lite; verklig återhämtning kräver ungefär $67\%$.
- **Fel bas när "greater/less" vänds.** $25\%$ större åt ena hållet är $20\%$ mindre åt det andra; procenttalet är förankrat i den storhet som följer efter "of" eller "than".
- **Att ange faktorn i stället för förändringen.** $F = 1.43$ betyder $43\%$ större men $143\%$ *av* ursprunget. Läs vilket frågan gäller.
- **Att behålla en ogiltig rot.** I kedjor med okänt $k$: kasta rötter som gör en faktor negativ eller bryter mot "positive integer".

## Speed moves

- **Använd 100 (eller ett annat bekvämt tal) som utgångspunkt.** För "what percent"-frågor utan något belopp, börja i $100$: $+40\%$ och sedan till $105$ gör det andra ledet till $\frac{105}{140} = 0.75$ på synhåll.
- **Multiplicera faktorerna i den vänligaste ordningen.** Eftersom ordningen är likgiltig, räkna $250 \times 1.2$ först (rena $300$) innan du tar $0{,}65$.
- **Memorera upp-ner-identiteten.** Samma $p\%$ upp och ner ger netto $-\frac{p^2}{100}\%$: $p = 10$ förlorar $1\%$, $p = 20$ förlorar $4\%$ — ingen räkning behövs.
- **Testa alternativen i kedjor med heltals-$k$.** Testa ett alternativ med starten $100$: för Example 3 ger $k = 20$ att $100 \to 120 \to 72$, vilket är $28\%$ ner. Klart.
- **Känn den garanterade riktningen.** En minskning med $p\%$ ihop med en mindre ökning ger alltid netto en minskning: $(1 - p/100)(1 + q/100) < 1$ närhelst $q \le p$. Det omvända är INTE symmetriskt — en större ökning kan ändå förlora, som $+50\%$ följt av $-40\%$ som ger $1.5 \cdot 0.6 = 0.90$. När ökningen är den stora: multiplicera faktorerna innan du litar på tecknet.
- **Översätt "off"-språket direkt.** "$30\%$ off, then another $10\%$ off" är $0.7 \times 0.9 = 0.63$ — en total rabatt på $37\%$, aldrig $40\%$.

## Before you drill

- Jag gör om varje $p\%$-förändring till dess faktor $1 \pm \frac{p}{100}$ utan att stanna upp.
- Jag multiplicerar faktorer för kedjade förändringar och adderar aldrig procenttal räknade på olika baser.
- Jag vet att lika upp och ner ger netto $-\frac{p^2}{100}\%$ och kan ange det för $p = 10, 20, 50$.
- Jag vänder en procentförändring genom att dividera med dess faktor, inte genom att tillämpa den motsatta procenten.
- Jag vänder "$x$ is $p\%$ greater than $y$" till "$y$ är $1 - \frac{1}{1 + p/100}$ mindre än $x$" utan att blanda ihop baserna.
- Jag isolerar ett okänt led i en kedja genom att dividera nettofaktorn med de kända faktorerna.
- För kedjor med okänt $k$ ställer jag upp faktorekvationen, rensar till heltal och löser sedan andragradaren eller testar svarsalternativen.
