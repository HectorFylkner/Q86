# Blandningar och viktade medelvärden: följ den rena mängden

## Why this matters

Blandningar och viktade medelvärden dyker upp från medelnivå ända upp till de svåraste quantplatserna, och de belönar disciplin i uppställningen mer än algebraisk eldkraft. Sammanslagna klassmedelvärden, kaffeblandningar, syraspädningar, tankar som töms och fylls på — allt är en enda bokföringsidentitet i olika kostymer. Följ den bevarade storheten (totalt värde, total kostnad eller ren löst substans) så faller hela familjen ihop till tvåminutersaritmetik.

## The core ideas

1. **Viktat medelvärde är total genom total.** För grupper med storlekarna $w_1, w_2, \dots$ och medelvärdena $x_1, x_2, \dots$ är det sammanslagna medelvärdet $\bar{x} = \dfrac{w_1 x_1 + w_2 x_2 + \cdots}{w_1 + w_2 + \cdots}$. Ingen ny formel — $w_i x_i$ är den summa grupp $i$ bidrar med, så detta är bara definitionen av medelvärdet på det sammanslagna materialet.
2. **Det sammanslagna medelvärdet ligger mellan gruppmedelvärdena, närmare den tyngre gruppen.** Fler värden drar hårdare. Snabbkontroll: $10$ värden med medelvärdet $6$ plus $20$ värden med medelvärdet $12$ ger $\dfrac{10 \cdot 6 + 20 \cdot 12}{30} = 10$ — dubbelt så nära $12$, vilket stämmer med storleksförhållandet $2:1$.
3. **Hävstångsregeln (vikter ur avstånd).** Omskrivning av tvågruppsidentiteten ger $\dfrac{w_1}{w_2} = \dfrac{x_2 - \bar{x}}{\bar{x} - x_1}$: vikterna är *omvänt* proportionella mot avstånden till det sammanslagna medelvärdet. Se det snabbt — en tung grupp låter knappt medelvärdet röra sig bort från sig, så kort avstånd betyder stor vikt.
4. **Koncentration är löst substans genom total:** $c = \dfrac{\text{ren mängd}}{\text{total volym}}$. Skriv en ekvation för den rena mängden; den bokföringen är hela uppgiften.
5. **Ren ingrediens och vatten är bara extrema lösningar.** Att tillsätta ren syra är att blanda med en $100\%$-komponent; att tillsätta vatten är att blanda med en $0\%$-komponent. Båda passar direkt in i identiteten för viktat medelvärde.
6. **Avdunstning och bortförd vätska låser den lösta substansen.** Om bara vatten försvinner är den rena mängden konstant, så den nya totalvolymen är $\dfrac{\text{löst substans}}{c_{\text{mål}}}$.
7. **Att tappa ur en homogen blandning tar bort varje komponent proportionellt.** Att ta bort $k$ av $V$ liter tar bort andelen $\dfrac{k}{V}$ av den lösta substansen och behåller $\dfrac{V-k}{V}$. Att upprepa en cykel av tömning och påfyllning med vatten $n$ gånger ger $c_n = c_0 \left(\dfrac{V-k}{V}\right)^n$ — ett geometriskt avtagande, eftersom varje omgång multiplicerar med samma behållningsfaktor.
8. **Påfyllning med ren ingrediens:** att tappa ur $d$ liter av en blandning med koncentrationen $c$ ur en tank på $V$ liter och fylla på med ren löst substans ger $c_{\text{ny}} = \dfrac{(V-d)c + d}{V} = c + \dfrac{d}{V}(1-c)$, eftersom de utbytta litrarna går från koncentrationen $c$ till koncentrationen $1$.
9. **Procentenheter adderas.** "Rises by $15$ percentage points" betyder $c_{\text{ny}} = c + 0.15$, inte $1.15c$. Att läsa fel på den frasen sänker annars korrekta uppställningar.

## Worked examples

**Example 1**

*A tea merchant blends $4$ kilograms of leaves that cost $\$9$ per kilogram with $6$ kilograms of leaves that cost $\$14$ per kilogram. What is the cost per kilogram, in dollars, of the blend?*

1. Total kostnad: $4 \cdot 9 + 6 \cdot 14 = 36 + 84 = 120$ dollar.
2. Total vikt: $4 + 6 = 10$ kilogram.
3. Kostnad per kilogram: $\dfrac{120}{10} = 12$.
4. Rimlighetskontroll med idé 2: $12$ ligger mellan $9$ och $14$ och närmare $14$, priset på den större andelen. Stämmer.

**Answer: $\$12$**

**Example 2**

*When $p$ liters of a solution that is $30\%$ acid are mixed with $q$ liters of a solution that is $75\%$ acid, the result is a solution that is $55\%$ acid. What is the value of $\dfrac{p}{q}$?*

1. Skriv bokföringen för den lösta substansen: syra in är lika med syra ut, alltså $0.30p + 0.75q = 0.55(p + q)$.
2. Expandera och samla ihop: $0.30p + 0.75q = 0.55p + 0.55q$ ger $0.20q = 0.25p$.
3. Lös förhållandet: $\dfrac{p}{q} = \dfrac{0.20}{0.25} = \dfrac{4}{5}$.
4. Bekräftelse med hävstångsregeln: avstånden till $55$ är $55 - 30 = 25$ och $75 - 55 = 20$, och vikterna är omvänt proportionella mot avstånden, alltså $p : q = 20 : 25 = 4 : 5$. Samma svar, ingen algebra.

**Answer: $\dfrac{4}{5}$**

**Example 3**

*A vat contains $40$ liters of a solution that is $48\%$ dye. In each of two successive steps, $k$ liters of the solution are drained and replaced with $k$ liters of pure water, and the mixture is stirred until uniform after each replacement. After the second replacement, the solution is $27\%$ dye. What is the value of $k$?*

1. Varje cykel håller volymen vid $40$ liter och multiplicerar färgmängden — och därmed koncentrationen — med behållningsfaktorn $r = \dfrac{40-k}{40}$.
2. Två cykler ger $48\% \cdot r^2 = 27\%$, alltså $r^2 = \dfrac{27}{48} = \dfrac{9}{16}$.
3. Ta den positiva roten: $r = \dfrac{3}{4}$, alltså $\dfrac{40-k}{40} = \dfrac{3}{4}$ och $40 - k = 30$, vilket ger $k = 10$.
4. Verifiera bokföringen: färgen startar på $0.48 \cdot 40 = 19.2$ liter; efter en cykel $19.2 \cdot \dfrac{3}{4} = 14.4$ liter ($36\%$); efter två $14.4 \cdot \dfrac{3}{4} = 10.8$ liter, och $\dfrac{10.8}{40} = 27\%$. Bekräftat.

**Answer: $k = 10$**

## Trigger cues

- "Average of the numbers in the two lists combined" → summera båda totalerna och dividera med det sammanlagda antalet; ta aldrig medelvärdet av medelvärdena.
- "Mixing $x$ liters of $a\%$ with $y$ liters of $b\%$" med frågan om förhållandet eller en volym → hävstångsregeln på avstånden till målkoncentrationen.
- "Water evaporates" eller "water is removed" → den lösta substansen är låst; ny volym $=$ löst substans $\div$ målkoncentration.
- "Drawn off and replaced" mer än en gång → multiplicera med behållningsfaktorn $\left(\dfrac{V-k}{V}\right)$ per cykel.
- "Replaced with pure acid/antifreeze/juice" → behandla den rena vätskan som en $100\%$-lösning i det viktade medelvärdet.
- "Raises the concentration by $n$ percentage points" → additiv förskjutning $c + \dfrac{n}{100}$; ställ upp två ekvationer om två scenarier ges.
- "Cost per kilogram of the blend" → viktat medelvärde av styckpriser med kvantiteterna som vikter.

## Trap gallery

- **Oviktat medelvärde.** Att blanda $8$ liter $10\%$ med $2$ liter $30\%$ blir inte $20\%$; bokföringen ger $\dfrac{0.8 + 0.6}{10} = 14\%$. Åtgärd: vikta alltid med kvantiteten.
- **Omvänd hävstång.** Att ge den större vikten till den ingrediens som ligger längst bort. Åtgärd: medelvärdet ligger *nära* den tunga komponenten — kort avstånd, stor vikt.
- **Att låta löst substans krympa vid avdunstning.** Bara vatten försvinner; den rena mängden är orörd. Åtgärd: frys den lösta substansen och räkna om totalen.
- **Linjärt tänkande vid upprepad påfyllning.** Att dra bort lika många procentenheter varje cykel. Åtgärd: varje cykel multiplicerar med samma behållningsandel — avtagandet är geometriskt.
- **Procentenheter lästa som procentuell förändring.** Att behandla "$+15$ percentage points" som $\times 1{,}15$. Åtgärd: enheter adderas till $c$; procent multiplicerar det.
- **Att bara tappa ur en komponent.** Den urtappade blandningen bär löst substans och vatten i den aktuella proportionen — anta aldrig att uttappningen tog rent vatten.
- **Mittpunktsreflexen.** Att placera ett sammanslaget medelvärde mitt emellan gruppmedelvärdena trots olika storlekar. Åtgärd: olika vikter, olika dragkraft.

## Speed moves

- **Hävstångsregeln för omedelbara förhållanden.** Att blanda $10\%$ och $40\%$ för att träffa $34\%$: avstånden $24$ och $6$ ger volymförhållandet $6:24 = 1:4$ på fem sekunder, utan ekvationer.
- **Enradig bokföring av löst substans.** Skriv ren mängd före $=$ ren mängd efter och inget annat; de flesta blandningsuppgifter är en sådan rad.
- **Testa alternativen som utbytesvolymer.** Svarsalternativen för urtappade liter är oftast små heltal; sätt in mittenalternativet i behållningsfaktorn och justera en gång.
- **Smart total på $100$.** När bara procenttal och förhållanden förekommer (inga absoluta volymer): sätt satsen till $100$ enheter så att procenttal blir antal.
- **Positionsuppskattning.** Notera vilken grupp som är tyngre; svaret måste landa på den sidan av mittpunkten — ofta nog för att döda tre alternativ.
- **Svep efter jämna kvadrater.** Vid tvåcyklig påfyllning är koncentrationsförhållandet ett kvadrerat bråk: att se $\dfrac{27}{48} = \dfrac{9}{16}$ ger dig behållningsfaktorn $\dfrac{3}{4}$ omedelbart.

## Before you drill

- Jag kan formulera identiteten för viktat medelvärde och förklara varför den bara är "total genom total".
- Jag kan placera ett sammanslaget medelvärde på rätt sida om mittpunkten enbart utifrån gruppstorlekarna.
- Jag kan köra hävstångsregeln i båda riktningarna: avstånd till vikter och vikter till avstånd.
- Jag skriver en ekvation för den lösta substansen innan jag rör någon annan algebra.
- Jag behandlar rena vätskor som $100\%$- (eller $0\%$-)komponenter inom samma ramverk.
- Jag multiplicerar med behållningsfaktorn $\dfrac{V-k}{V}$ per cykel vid upprepad påfyllning, och subtraherar aldrig enheter.
- Jag läser "percentage points" som en additiv förändring och "percent" som en multiplikativ.
