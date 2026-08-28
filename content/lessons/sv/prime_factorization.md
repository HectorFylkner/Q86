# Primtalsfaktorisering: talets ritning

## Why this matters
Varenda svår uppgift om delbarhet, LCM/GCD, jämna kvadrater och fakulteter på GMAT Focus Edition är samma fråga i förklädnad: hur ser primtalsfaktoriseringen ut? På Q85+-nivå klär provet in det i packning, satsvis produktion och Data Sufficiency-scenarier, och skillnaden mellan en lösning på 90 sekunder och ett fyra minuter långt slit är om du översätter berättelsen till primtalsexponenter direkt.

## The core ideas

1. **Entydig faktorisering.** Varje heltal $n > 1$ har exakt en faktorisering $n = p_1^{e_1} p_2^{e_2} \cdots p_k^{e_k}$ i olika primtal. Exponenterna är talets fullständiga ID-kort — varje delarfråga är en exponentfråga.

2. **Delbarhet är exponentjämförelse.** $d \mid n$ exakt när varje primtals exponent i $d$ är högst dess exponent i $n$.

3. **Antal delare.** $n = p_1^{e_1} \cdots p_k^{e_k}$ har $(e_1+1)(e_2+1)\cdots(e_k+1)$ positiva delare: varje primtals exponent väljs fritt från $0$ till $e_i$. Kontroll: $360 = 2^3 \cdot 3^2 \cdot 5$ har $4 \cdot 3 \cdot 2 = 24$ delare.

4. **GCD och LCM via exponenter.** $\gcd$ tar *minsta* exponenten för varje primtal, $\operatorname{lcm}$ tar den *största*: $\gcd(12,18) = 6$, $\operatorname{lcm}(12,18) = 2^2 \cdot 3^2 = 36$.

5. **"Divisible by $a$ and by $b$" betyder delbart med $\operatorname{lcm}(a,b)$** — inte med $ab$. Delbart med $12$ och $18$ tvingar bara fram delbarhet med $36$.

6. **Jämna potenser via exponentmönster.** $n$ är en jämn kvadrat om och endast om varje exponent är jämn, och en jämn kub om och endast om varje exponent är delbar med $3$. För att göra $Nk$ till en jämn kvadrat ska $k$ bidra med exakt de primtal som rundar upp varje udda exponent till jämn.

7. **Udda antal delare $\Leftrightarrow$ jämn kvadrat.** Delare parar ihop sig som $d \leftrightarrow n/d$; bara $\sqrt{n}$ paras med sig själv. Det finns $31$ kvadrater från $1$ till $1000$ eftersom $31^2 = 961$.

8. **Exakt tre delare $\Leftrightarrow$ $n = p^2$** för ett primtal $p$: antalet $3$ tvingar fram ett enda primtal med exponent $2$, till exempel $121 = 11^2$.

9. **Primtalsexponenten i $n!$ (Legendre).** Exponenten av $p$ i $n!$ är $\lfloor n/p \rfloor + \lfloor n/p^2 \rfloor + \cdots$: multiplarna av $p$ ger en faktor var, multiplarna av $p^2$ en till, och så vidare. Antalet avslutande nollor i $n!$ är lika med exponenten av $5$ (tvåorna är aldrig knappare): $25!$ slutar på $5 + 1 = 6$ nollor.

10. **Kvadrater för delbarhet nedåt.** Om $p^m \mid n^2$ så gäller $p^{\lceil m/2 \rceil} \mid n$, eftersom $n^2$ fördubblar varje exponent i $n$. Att $n^2$ är delbart med $216 = 2^3 \cdot 3^3$ tvingar alltså $n$ att vara delbart med $2^2 \cdot 3^2 = 36$.

## Worked examples

**Example 1**

*A bakery packs $504$ muffins into identical trays with none left over. If each tray holds more than $25$ but fewer than $35$ muffins, how many muffins does each tray hold?*

1. Brickstorleken måste vara en delare till $504$. Faktorisera: $504 = 8 \cdot 63 = 2^3 \cdot 3^2 \cdot 7$.
2. Testa fönstret $26$–$34$ mot de tillgängliga primtalen: $27 = 3^3$ kräver tre treor — finns inte. $28 = 2^2 \cdot 7$ passar. $30$ kräver en femma; $32 = 2^5$ kräver fem tvåor; $33$ kräver en elva.
3. Bara en delare till $504$ ligger strikt mellan $25$ och $35$.

**Answer: $28$**

**Example 2**

*A mosaic artist buys tiles only in full boxes of $600$ tiles each and must use every tile she buys to build a single square design with the same number of tiles in each row as in each column. What is the least number of boxes she must buy?*

1. Med $k$ lådor måste totalen $600k$ vara en jämn kvadrat: alla primtalsexponenter jämna.
2. Faktorisera: $600 = 2^3 \cdot 3 \cdot 5^2$. Exponenterna för $2$ och $3$ är udda; femman är redan jämn.
3. Billigaste åtgärden är $k = 2 \cdot 3 = 6$: $600 \cdot 6 = 3600 = 2^4 \cdot 3^2 \cdot 5^2 = 60^2$.
4. Inget mindre $k$ fungerar, eftersom varje giltigt $k$ måste innehålla en tvåa och en trea.

**Answer: $6$ boxes**

**Example 3**

*A puzzle vault opens when players enter the greatest integer $k$ such that $12^k$ divides the product of all integers from $1$ to $30$, inclusive. What number opens the vault?*

1. Produkten är $30!$, och $12^k = (2^2 \cdot 3)^k = 2^{2k} \cdot 3^k$. Vi behöver alltså $2k$ faktorer $2$ och $k$ faktorer $3$ inuti $30!$.
2. Exponenten av $2$ i $30!$: $\lfloor 30/2 \rfloor + \lfloor 30/4 \rfloor + \lfloor 30/8 \rfloor + \lfloor 30/16 \rfloor = 15 + 7 + 3 + 1 = 26$.
3. Exponenten av $3$ i $30!$: $\lfloor 30/3 \rfloor + \lfloor 30/9 \rfloor + \lfloor 30/27 \rfloor = 10 + 3 + 1 = 14$.
4. Villkoren är $2k \le 26$ och $k \le 14$, alltså $k \le 13$ och $k \le 14$. Det bindande villkoret är tvåorna.

**Answer: $13$**

## Trigger cues

- "Divides evenly into groups of $a$ and also groups of $b$" → minsta sådana tal är $\operatorname{lcm}(a,b)$ via maxexponenter.
- "Identical groups, none left over, size between $x$ and $y$" → bygg delarna till totalen ur dess faktorisering och skanna fönstret.
- "Same number in each row as each column" eller "solid cube" → tvinga exponenterna jämna (kvadrat) eller delbara med $3$ (kub).
- "Odd number of divisors" → jämna kvadrater; det finns $\lfloor \sqrt{N} \rfloor$ av dem upp till $N$.
- "Exactly three positive divisors" → talet är $p^2$; leta efter en primtalskvadrat i intervallet.
- "Product of integers from $1$ to $n$" tillsammans med "trailing zeros" eller "$b^k$ divides it" → Legendres formel på varje primtal i $b$.
- "How many divisors are multiples of $m$" → räkna delarna till $N/m$ i stället.
- Ett Data Sufficiency-påstående om delbarheten hos $n^2$ → halvera exponenterna (avrunda uppåt) för att se vad $n$ måste innehålla.

## Trap gallery

- **Multiplicera i stället för att ta LCM.** Delbart med $12$ och $18$ garanterar $36$, inte $216$. Åtgärd: maxexponenter primtal för primtal.
- **Glömma $+1$** och räkna $e_1 e_2 \cdots$ för antalet delare. Åtgärd: varje exponent har $e_i + 1$ val, noll inräknat.
- **Läsa "odd number of divisors" som "primtal".** Primtal har två delare; ett udda antal betyder jämn kvadrat.
- **Räkna varje multipel av $5$ en gång för avslutande nollor.** $25$ bidrar med två femmor. Åtgärd: kör hela summan $\lfloor n/5 \rfloor + \lfloor n/25 \rfloor + \cdots$.
- **Ignorera den sammansatta basen.** $12^k \mid n!$ kräver $2k$ tvåor, inte $k$ — dividera den tillgängliga exponenten med basens potens.
- **Anta att det större primtalet binder.** I Example 3 kom villkoret från tvåorna, inte treorna; räkna båda sidor.
- **Behandla $1$ som primtal eller hoppa över $2$.** $1$ är inte primtal; $2$ är det enda jämna primtalet. Börja varje faktorträd på $2$.

## Speed moves

- **Faktorisera en gång, återanvänd överallt.** Skriv $6480 = 2^4 \cdot 3^4 \cdot 5$ högst upp på kladdpappret; antal delare, kvadratmultiplikatorer och LCM läses alla av från den raden.
- **Dividera bort ett delbarhetsvillkor.** Delare till $2700 = 2^2 \cdot 3^3 \cdot 5^2$ som är multiplar av $15$: räkna delarna till $2700/15 = 180 = 2^2 \cdot 3^2 \cdot 5$, vilket är $3 \cdot 3 \cdot 2 = 18$.
- **Kubrotsankare för nästan konsekutiva produkter.** Om $c(c+2)(c+4) = 7920$ så är $\sqrt[3]{7920} \approx 19.9$, testa alltså mittvärdet $20$: $18 \cdot 20 \cdot 22 = 7920$. Klart.
- **Runda exponenter, sök inte.** Största jämna kvadraten som delar $360 = 2^3 \cdot 3^2 \cdot 5$: runda varje exponent *nedåt* till jämn, vilket ger $2^2 \cdot 3^2 = 36$.
- **Testa alternativen med delbarhet.** Med alternativen på skärmen: testa vilket alternativ som delar totalen ($875$ delas av $25$, eftersom $875 = 5^3 \cdot 7$); en division slår en full delarlista.

## Before you drill

1. Jag kan faktorisera vilket tresiffrigt tal som helst i primtal på under 20 sekunder, med start på $2$.
2. Jag kan tillämpa delarformeln $(e_1+1)\cdots(e_k+1)$ utan att tveka.
3. Jag bygger GCD ur minsta exponenter och LCM ur största, aldrig genom att multiplicera.
4. Jag känner igen jämna kvadrater på idel jämna exponenter och jämna kuber på exponenter delbara med $3$.
5. Jag kan hitta exponenten för vilket primtal som helst i $n!$ med Legendres summa, och jag vet att avslutande nollor räknar femmorna.
6. Jag översätter "exactly three divisors" till $p^2$ och "odd number of divisors" till jämn kvadrat direkt.
7. Givet ett faktum om delbarheten hos $n^2$ kan jag säga vad det tvingar fram om $n$.
