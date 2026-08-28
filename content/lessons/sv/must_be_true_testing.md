# "Must be true"-testning: att tvinga fram fakta ur tecken, storlekar och zoner

## Why this matters

"Which of the following must be true?" prövar om du kan talegenskaper som *lagar*, inte som vanor. På Q86-nivå gömmer sig de här uppgifterna bakom olikheter som $x^2 > x$, teckenvillkor som $pqr < 0$ och Data Sufficiency-frågor av typen "Is $x > y$?" — och alla avgörs på samma sätt: ett svar måste överleva *varje* tillåtet värde, och ett enda motexempel dödar det.

## The core ideas

1. **Kravet för "must be true".** Ett påstående *måste* vara sant bara om det gäller för **varje** värde som uppfyller villkoret; det *kan* vara sant om det gäller för minst ett. Ett motexempel eliminerar.
2. **Översätt villkoret till en zon först.** Skriv om det givna som en lösningsmängd innan du rör svarsalternativen: $x^2 > x \iff x(x-1) > 0 \iff x < 0 \text{ eller } x > 1$, och $x^2 < x \iff 0 < x < 1$. Flytta allt till ena sidan och läs av faktorernas tecken.
3. **Standarduppsättningen testvärden.** Beteendet vänder vid $-1$, $0$ och $1$, så testa ett värde per zon: $-2,\ -1,\ -\tfrac12,\ 0,\ \tfrac12,\ 1,\ 2$. Exempel: $x = -\tfrac12$ uppfyller $x^2 > x$ eftersom $\tfrac14 > -\tfrac12$, vilket sänker varje alternativ som påstår att $x$ är positivt.
4. **Jämna potenser raderar tecknet; udda potenser behåller det.** $(-2)^2 = 2^2$, medan $x^3$ har samma tecken som $x$. Alltså säger $x y^2 z^3 > 0$ bara att $xz > 0$ plus "$y \ne 0$".
5. **Absolutbelopp avslöjar tecken.** $|x| \ge x$ alltid; $|x| > x \iff x < 0$; $|x| = x \iff x \ge 0$: $|x|$ vänder bara negativa tal.
6. **Produkter, kvoter, summor.** $xy > 0 \iff$ samma tecken; $xy < 0 \iff$ olika tecken; $\frac{x}{y}$ har samma tecken som $xy$ eftersom $\frac{x}{y} = \frac{xy}{y^2}$. Samma tecken plus $x + y < 0$ tvingar fram att båda är negativa.
7. **Kvadrater jämför avstånd, inte lägen.** $x^2 > y^2 \iff |x| > |y|$. Mot "alltså $x > y$": $x = -3$, $y = 2$ ger $9 > 4$ med $x < y$.
8. **Faktorisera — dividera aldrig med något som kan vara noll.** Ur $m^2 - n^2 = m + n$: förkorta inte bort $m + n$; skriv $(m+n)(m-n-1) = 0$. Paret $m = 2$, $n = -2$ uppfyller det med $m - n = 4 \ne 1$: förkortning tappar lösningar.
9. **Jämnhet är en "must be true"-maskin.** $n^2 + n = n(n+1)$ är alltid jämnt (konsekutiva heltal); om $j + k$ är udda är exakt ett av $j, k$ udda, så $jk$ är jämnt.
10. **Data Sufficiency är "must be true" i förklädnad.** Ett påstående är tillräckligt precis när det *tvingar fram* ett och samma svar för varje tillåtet värde; ett ja-fall plus ett nej-fall bevisar otillräcklighet.

## Worked examples

**Example 1** *If $pq < 0$, which of the following must be true?*

*A) $p < 0$  B) $p + q < 0$  C) $\dfrac{p}{q} < 0$  D) $p^2 < q^2$  E) $pq^2 < 0$*

1. Översätt: $pq < 0$ betyder motsatta tecken — inget om vilket som är negativt eller större.
2. Testa ett billigt par, $p = 3$, $q = -1$ (giltigt: $pq = -3 < 0$). Det dödar A ($p > 0$), B ($p + q = 2 > 0$), D ($9 < 1$ är falskt) och E ($pq^2 = 3 > 0$).
3. Bekräfta C som en lag: $\frac{p}{q} = \frac{pq}{q^2}$ med $q^2 > 0$, så kvoten är negativ för varje tillåtet par.

**Answer: C**

**Example 2** *If $m^2 < 9m$, which of the following must be true?*

*I. $m > 0$   II. $m < 10$   III. $m > 1$*

*A) I only  B) I and II only  C) I and III only  D) II and III only  E) I, II, and III*

1. Dividera inte med $m$ — det kan vara negativt. Skriv om: $m^2 - 9m < 0$, alltså $m(m - 9) < 0$.
2. Produkten är negativ när faktorerna har olika tecken: exakt $0 < m < 9$. Det intervallet är hela universum.
3. I: varje värde i $(0, 9)$ är positivt — måste vara sant. II: varje värde är mindre än $9$, alltså mindre än $10$ — måste vara sant.
4. III: $m = \tfrac12$ är tillåtet eftersom $\tfrac14 < \tfrac92$, men $\tfrac12 > 1$ är falskt. Dödat.

**Answer: B**

**Example 3** *Is $t > 1$?*

*(1) $t^3 > t$*

*(2) $t^2 > t$*

1. Påstående (1): $t^3 - t > 0$, dvs. $t(t-1)(t+1) > 0$. Ett teckenschema över zonerna som skärs av $-1, 0, 1$ ger $-1 < t < 0$ eller $t > 1$. Testa $t = -\tfrac12$: tillåtet eftersom $-\tfrac18 > -\tfrac12$, vilket svarar "nej"; $t = 2$ är tillåtet ($8 > 2$) och svarar "ja". Inte tillräckligt.
2. Påstående (2): $t(t-1) > 0$ ger $t < 0$ eller $t > 1$. Samma två värden är tillåtna — $\tfrac14 > -\tfrac12$ och $4 > 2$ — så båda svaren dyker upp igen. Inte tillräckligt.
3. Tillsammans: återanvänd paret. Både $t = -\tfrac12$ och $t = 2$ uppfyller *båda* påståendena samtidigt, så svaret är fortfarande inte bestämt.

**Answer: E**

## Trigger cues

- "Which of the following **must be true**?" → lös upp villkoret till en zon och jaga sedan ett motexempel per alternativ.
- "$x^2 > x$" eller vilken olikhet som helst mellan en potens och sig själv → flytta allt till ena sidan, faktorisera, gör teckenschema; dividera aldrig med variabeln.
- Romersk-siffer-format → kör ett testvärde mot alla tre påståendena samtidigt; bevisa de överlevande ur zonen.
- "$ab < 0$", "$xyz > 0$", "$x + y < 0$" → räkna negativa faktorer; jämna potenser är osynliga för tecknet.
- Data Sufficiency-frågor av typen "Is …?" med olikheter → hitta ett ja-fall och ett nej-fall för att bevisa otillräcklighet.
- Heltalssummor eller -produkter som beskrivs som udda/jämna → jämnhetsregler, med start i att $n(n+1)$ alltid är jämnt.

## Trap gallery

- **Att bevisa i stället för att motbevisa.** Ett värde där ett alternativ stämmer visar "could", inte "must". Åtgärd: riv ner fel svar med motexempel.
- **Att dividera med en variabel.** Att förkorta bort $m$ i $m^2 < 9m$ eller $m + n$ i $m^2 - n^2 = m + n$ förutsätter att uttrycket är positivt eller skilt från noll. Åtgärd: subtrahera och faktorisera.
- **Att bara testa vänliga tal.** Att pröva $x = 2$ och $x = 3$ missar de haverier som bor vid $\pm\tfrac12$. Åtgärd: hämta värden ur alla zoner, inklusive $-1$ och $1$.
- **Att slarva med att "ta bort kvadraten".** $x^2 > y^2$ betyder $|x| > |y|$, inte $x > y$: se $x = -3$, $y = 2$.
- **Att läsa $\frac{a}{b} > 1$ som $a > b$.** Med $a = -3$, $b = -2$ är kvoten $\tfrac32 > 1$ trots att $a < b$; multiplikation med ett negativt $b$ vänder olikheten.
- **Att avfärda ett underligt alternativ.** I en uppgift om $d^2 > 4d$ ser "$d \ne 2$" svagt ut men är precis vad zonen $d < 0$ eller $d > 4$ garanterar. Åtgärd: bedöm alternativen mot zonen, inte mot intuitionen.

## Speed moves

- **Zon först, alternativ sedan.** Trettio sekunder på att göra om $x^2 > x$ till "$x < 0$ eller $x > 1$" avgör alla fem alternativen på en gång.
- **Ett dödande värde, många offer.** Det enda paret $p = 3$, $q = -1$ i Example 1 eliminerade fyra alternativ i ett svep.
- **Återanvänd motexempel mellan DS-påståenden.** Samma ja/nej-par som uppfyller båda påståendena bevisar (E) utan extra arbete, som i Example 3.
- **Räkna tecken, räkna inte ut.** För $x y^2 z^3 > 0$: stryk jämna potenser och reducera udda till basen — det läses direkt som $xz > 0$.
- **Rimlighetskontroll vid gränsen.** Sätt in en ändpunkt i zonen — $m = 9$ ger $81 < 81$, falskt — för att avgöra strikt mot icke-strikt.

## Before you drill

- Jag kan förklara skillnaden mellan "must be true" och "could be true" i en mening.
- Jag kan förvandla $x^2 > x$, $x^2 < x$ och $t^3 > t$ till lösningszoner på under 20 sekunder var.
- Min testuppsättning är $-2, -1, -\tfrac12, 0, \tfrac12, 1, 2$, ett värde per beteendezon.
- Jag dividerar aldrig med ett uttryck som kan vara noll eller negativt — jag faktoriserar.
- Jag läser av varje produkts eller kvots tecken genom att räkna negativa faktorer och ignorera jämna potenser.
- Jag behandlar varje DS-fråga av typen "Is …?" som en jakt på ett ja-fall och ett nej-fall.
- Jag vet att $|x| > x$ intygar att $x < 0$, och att $x^2 > y^2$ bara intygar att $|x| > |y|$.
