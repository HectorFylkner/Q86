# Jämnhet och tecken: udda/jämn-struktur och plus/minus-logik

## Why this matters

GMAT Focus Edition använder jämnhets- och teckenfrågor för att pröva om du kan resonera om talens *struktur* utan att räkna ut dem. På Q84–Q86-nivå dyker de upp som "must be true"-uppgifter om olikhetskedjor, kombinatorikuppgifter med kombinerade udda/jämn-villkor, och Data Sufficiency-frågor där exponenter döljer tecken. Alla går fort om du arbetar i tvåsymbolsalfabet — udda/jämn och plus/minus — i stället för med värden.

## The core ideas

1. **Definitioner.** Ett heltal $n$ är jämnt precis när $n = 2k$ och udda precis när $n = 2k + 1$ för något heltal $k$. Noll är jämnt ($0 = 2 \cdot 0$) och saknar tecken.
2. **Jämnhet vid addition.** $J \pm J = J$, $U \pm U = J$, $J \pm U = U$ — två överskott parar ihop sig. Allmänt: en summa av heltal är udda precis när *antalet* udda termer är udda.
3. **Jämnhet vid multiplikation.** En produkt är jämn precis när minst en faktor är jämn, udda precis när varje faktor är udda. En enda faktor $2$ räcker.
4. **Potenser bevarar jämnheten.** För $k \ge 1$ har $n^k$ samma jämnhet som $n$ — udda gånger udda förblir udda. Alltså är $3^n$ udda för varje positivt heltal $n$.
5. **Konsekutiva heltal.** $n(n + 1)$ är alltid jämnt — ett av två konsekutiva heltal är jämnt. Alltså är $n^2 + n$ jämnt och $n^2 + n + 1$ udda för varje heltal $n$.
6. **Produktens tecken.** Utan nollfaktorer är en produkt negativ precis när antalet negativa faktorer är udda — var och en vänder tecknet en gång. Kvoter följer samma regel: $\frac{u}{v} > 0 \iff uv > 0$.
7. **Jämna exponenter raderar tecknet; udda behåller det.** För $x \ne 0$ gäller $x^{2k} > 0$, medan $x^{2k+1}$ har samma tecken som $x$. Lika tecken multiplicerar till ett positivt tal.
8. **Kvadrater är icke-negativa.** $x^2 \ge 0$, med likhet endast vid $x = 0$; skriv aldrig $x^2 > 0$ utan att ha bekräftat att $x \ne 0$.
9. **Ordning plus tecken.** Om $a < b < 0$ gäller $|a| > |b|$, $ab > 0$, $a - b < 0$ och $\frac{a}{b} > 1$ — kontrollera med $a = -5$, $b = -2$. För negativa tal betyder längre till vänster större absolutbelopp.
10. **Logik för antalet negativa faktorer.** För tre tal skilda från noll: $rst > 0$ tvingar fram noll eller två negativa; $rst < 0$ tvingar fram en eller tre. Ett villkor på summan låser sedan fast fallet.
11. **Jämnhetsinvarianter.** Att addera ett jämnt tal ändrar aldrig jämnheten; att addera ett udda tal vänder den alltid. En löpande summas jämnhet beror bara på antalet udda steg.
12. **Plus-ett-identiteten.** $xy + x + y = (x + 1)(y + 1) - 1$ — den förvandlar ett blandat summa-och-produkt-villkor om jämnhet till ett rent produktvillkor.

## Worked examples

**Example 1**

*For how many integers $n$ from $1$ to $60$, inclusive, is $2n^2 + 3n + 4$ odd?*

1. Arbeta term för term: $2n^2$ och $4$ är jämna, så uttryckets jämnhet är densamma som för $3n$.
2. $3$ är udda, så $3n$ har samma jämnhet som $n$: uttrycket är udda precis när $n$ är udda.
3. De udda heltalen från $1$ till $60$ är $1, 3, \dots, 59$ — hälften av $60$, alltså $30$.

**Answer: 30**

**Example 2**

*If $x$, $y$, and $z$ are nonzero numbers with $xy^2z^3 > 0$ and $xy < 0$, which of the following must be true?*

*I. $xz > 0$*

*II. $yz < 0$*

*III. $xyz < 0$*

1. Stryk den jämna potensen: $y^2 > 0$, så det första villkoret reduceras till $xz^3 > 0$. En udda potens behåller basens tecken, alltså har $x$ och $z$ samma tecken: I måste vara sant.
2. $xy < 0$ gör att $y$ har motsatt tecken mot $x$ — och därmed motsatt mot $z$ också. Alltså $yz < 0$: II måste vara sant.
3. Testa III i båda de överlevande mönstren. Med $x > 0$, $z > 0$, $y < 0$: $xyz < 0$. Med $x < 0$, $z < 0$, $y > 0$: $xyz = (-)(+)(-) > 0$. III kan alltså vara falskt.

**Answer: I and II only**

**Example 3**

*A carnival game uses one deck numbered $1$ through $8$ and a second deck numbered $1$ through $5$. A player draws one card from each, getting values $x$ and $y$, and wins if $xy + x + y$ is odd. For how many of the $40$ possible pairs $(x, y)$ does the player win?*

1. Använd identiteten: $xy + x + y = (x + 1)(y + 1) - 1$, som är udda precis när $(x + 1)(y + 1)$ är jämnt.
2. En produkt är jämn precis när någon faktor är jämn, så spelaren vinner precis när minst ett av $x$, $y$ är udda.
3. Räkna komplementet: båda jämna betyder $x \in \{2, 4, 6, 8\}$, $y \in \{2, 4\}$ — $4 \cdot 2 = 8$ förlorande par.
4. Vinnande par: $40 - 8 = 32$.

**Answer: 32**

## Trigger cues

- "Is the integer $k$ even?" med påståenden som "$k^2 - 1$ is odd" → översätt varje påstående till en utsaga om jämnheten hos $k$; här tvingar "$k^2 - 1$ udda" fram att $k$ är jämnt.
- En olikhetskedja som $a < b < 0$ plus "which must be positive?" → avgör varje svarsalternativs tecken strukturellt och bekräfta sedan med bekväma tal som respekterar ordningen.
- Udda och jämna exponenter i "Is $x^3 y^4 z^5 > 0$?" → stryk varje faktor med jämn exponent och läs av tecknet från faktorerna med udda exponent.
- "Product is even and sum is odd" över urval → klassa varje val som $J$ eller $U$ och räkna de jämnhetsmönster som uppfyller villkoret.
- Upprepade drag med två fasta stegstorlekar ("gains $3$ or drops $5$ each turn") → skriv nettoförändringen som en kombination och håll koll på jämnhetsinvarianten.
- "None was zero, the product was positive, the sum was negative" → räkna negativa faktorer med idé 10 och låt sedan summan sålla bort fall.

## Trap gallery

- Att behandla noll som positivt eller udda — noll är jämnt, teckenlöst och dödar varje produkt det ingår i.
- Att dra slutsatsen $x^{2k} > 0$ utan att utesluta $x = 0$ — leta efter "nonzero" i frågan.
- Att läsa $u + v > 0$ som "båda positiva" — $5 + (-1) = 4$ visar att summans tecken inte låser varje terms tecken.
- Att missa att en ordning avgör vilken variabel som är negativ: $xy < 0$ med $x < y$ tvingar fram $x < 0 < y$, aldrig tvärtom.
- Att tillämpa jämnhetsregler på obegränsade variabler — udda/jämn är bara meningsfullt för heltal, och frågan utelämnar "integer" med flit.
- Att svara "must be true" efter ett enda testfall — ett fall visar *could*; "must" kräver att påståendet överlever varje tillåtet fall.
- Att likställa "negativ produkt" med "alla faktorer negativa" — både en och tre negativa faktorer ger en negativ trippelprodukt.

## Speed moves

- **Bokför bara tecken.** Byt ut faktorer mot $+$ eller $-$: i $ab^2c^3 < 0$ med $b < 0$ ersätts $b^2$ med $+$ och villkoret blir $ac^3 < 0$.
- **Bokför bara jämnhet.** Byt ut tal mot $J$/$U$: $3^n$ är alltid udda, så $3^n + n^3$ är jämnt precis när $n$ är udda — $25$ värden från $1$ till $50$, utan att räkna.
- **Välj bekväma tal som respekterar villkoren.** För $a < b < 0$, sätt $a = -3$, $b = -1$ och utvärdera alla fem alternativen på sekunder.
- **Räkning med period 2.** Jämnhetsmönster upprepas vartannat heltal, så antal från $1$ till $N$ fås genom halvering, som i Example 1.
- **Komplementräkning.** "Minst en udda" är totalen minus "alla jämna", som i Example 3 — en subtraktion slår tre additioner.
- **Plus-ett-identiteten.** När du ser $xy + x + y$, hoppa direkt till $(x+1)(y+1) - 1$ och resonera om en ren produkt.

## Before you drill

- Jag kan formulera jämnhetsreglerna för addition och multiplikation utan att tveka, inklusive "en summa är udda precis när antalet udda termer är udda".
- Jag vet att noll är jämnt, teckenlöst och en produktdödare.
- Jag kan stryka faktorer med jämna exponenter ur en teckenfråga och läsa av svaret från de udda potenserna.
- Givet tecknet på $rst$ kan jag omedelbart lista de möjliga antalen negativa faktorer.
- För $a < b < 0$ kan jag ange tecknen på $ab$, $a - b$, $\frac{a}{b}$ och jämföra $|a|$ med $|b|$.
- Jag testar varje överlevande fall innan jag markerar "must be true".
- Jag kan faktorisera $xy + x + y + 1$ direkt och använda det för att avgöra ett jämnhetsvillkor.
