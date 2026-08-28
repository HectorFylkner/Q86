# Delbarhet, GCF och LCM: låt primtalsexponenterna göra jobbet

## Why this matters
GMAT Focus Edition testar GCF och LCM på två sätt: snabba textuppgifter (packa identiska lådor, bussar som möts) och abstrakta pussel där villkor på $\gcd$ och $\mathrm{lcm}$ låser fast ett okänt heltal. På Q86-nivå är textuppgifterna snabbhetstester och de abstrakta strukturtester — båda faller fort så snart du tänker i primtalsexponenter i stället för att prova division.

## The core ideas
1. **Delbarhet.** $a \mid b$ betyder att $b = ak$ för något heltal $k$. Allt nedan är bokföring på den definitionen.
2. **Primtalsfaktoriseringen är entydig.** Varje heltal $n > 1$ är en enda produkt av primtal, till exempel $60 = 2^2 \cdot 3 \cdot 5$, och $a \mid b$ gäller exakt när varje primtalsexponent i $a$ är $\le$ dess exponent i $b$.
3. **GCF tar minsta exponenterna; LCM tar största.** Med $60 = 2^2 \cdot 3 \cdot 5$ och $72 = 2^3 \cdot 3^2$: $\gcd = 2^2 \cdot 3 = 12$ och $\mathrm{lcm} = 2^3 \cdot 3^2 \cdot 5 = 360$. Minsta exponenterna ger det största som delar båda; största exponenterna ger det minsta som båda delar.
4. **Produktidentiteten.** $\gcd(a,b) \cdot \mathrm{lcm}(a,b) = ab$ för två positiva heltal, eftersom $\min + \max$ av de två exponenterna vid varje primtal är lika med deras summa. Kontroll: $12 \cdot 360 = 4320 = 60 \cdot 72$.
5. **Relativt prima kofaktorer.** Om $\gcd(a,b) = g$, skriv $a = gm$, $b = gn$ med $\gcd(m,n) = 1$. Då är $\mathrm{lcm}(a,b) = gmn$, alltså $mn = \mathrm{lcm}/\gcd$. När båda är givna utgör de relativt prima faktorparen till $\mathrm{lcm}/\gcd$ hela lösningsrummet.
6. **"Divisible by both" betyder delbart med LCM,** inte med produkten. Delbart med $6$ och $8$ betyder delbart med $\mathrm{lcm}(6,8) = 24$; $24$ är mycket riktigt delbart med båda men inte med $48$. Produkten fungerar bara för relativt prima par.
7. **Räkna multiplar.** Exakt $\lfloor N/k \rfloor$ multiplar av $k$ ligger i $1, \dots, N$, eftersom de är $k, 2k, \dots, \lfloor N/k \rfloor k$.
8. **Inklusion–exklusion.** Delbart med $p$ eller $q$: $\lfloor N/p \rfloor + \lfloor N/q \rfloor - \lfloor N/\mathrm{lcm} \rfloor$. Delbart med exakt ett: dra bort överlappningen två gånger.
9. **Gemensamma delare är delare till GCF.** $d$ delar både $a$ och $b$ exakt när $d \mid \gcd(a,b)$. Alltså delar $540$ och $360$ på $\gcd = 180 = 2^2 \cdot 3^2 \cdot 5$, vilket ger $(2+1)(2+1)(1+1) = 18$ gemensamma delare.
10. **Differensen bär GCF.** $\gcd(a,b) = \gcd(b, a-b)$, så $\gcd(n, n+k)$ måste dela $k$. Att veta att $m = n + 6$ begränsar $\gcd(m,n)$ till en delare av $6$.
11. **Kvadrering fördubblar exponenterna.** Om $48 = 2^4 \cdot 3$ delar $n^2$ gäller $2a \ge 4$ och $2b \ge 1$ för $n$:s exponenter av $2$ och $3$, vilket tvingar $a \ge 2$, $b \ge 1$: $n$ är delbart med $12$. Minsta fallet: $n = 12$.
12. **Att översätta $\gcd(n, m) = d$.** Vid varje primtal i $m$ måste minimum av de två exponenterna vara lika med exponenten i $d$ — en ekvation blir en lista av villkor av typen "minst" och "inte delbart med" på $n$.

## Worked examples

**Example 1**
*A florist has $96$ roses and $72$ tulips. She wants to assemble identical bouquets, each containing the same number of roses and the same number of tulips, using every flower. What is the greatest number of bouquets she can make?*

1. Identiska grupper som använder allt, största antalet → räkna $\gcd(96, 72)$.
2. Faktorisera: $96 = 2^5 \cdot 3$ och $72 = 2^3 \cdot 3^2$.
3. Ta minsta exponenterna: $\gcd = 2^3 \cdot 3 = 24$.
4. Kontroll: varje bukett får $96/24 = 4$ rosor och $72/24 = 3$ tulpaner.

**Answer: 24**

**Example 2**
*How many positive integers $n \le 500$ are divisible by $6$ or by $10$, but not by both?*

1. Räkna varje hög: $\lfloor 500/6 \rfloor = 83$ multiplar av $6$ och $\lfloor 500/10 \rfloor = 50$ multiplar av $10$.
2. "Both" betyder delbart med $\mathrm{lcm}(6,10) = 30$: $\lfloor 500/30 \rfloor = 16$.
3. De $16$ ligger i båda högarna och "not both" utesluter dem helt, så dra bort överlappningen två gånger: $83 + 50 - 2(16) = 101$.

**Answer: 101**

**Example 3**
*If $n$ is a positive integer such that $\gcd(n, 56) = 8$ and $\gcd(n, 60) = 12$, what is the smallest possible value of $n$?*

1. Översätt varje villkor till exponentvillkor. Först: $56 = 2^3 \cdot 7$ och $8 = 2^3$: minimum av $n$:s $2$-exponent och $3$ måste vara $3$, alltså $2^3 \mid n$; minimum vid primtalet $7$ måste vara $0$, alltså $7 \nmid n$.
2. Sedan: $60 = 2^2 \cdot 3 \cdot 5$ och $12 = 2^2 \cdot 3$: $2$-villkoret är redan uppfyllt eftersom $2^3 \mid n$; $3$-villkoret tvingar $3 \mid n$; $5$-villkoret tvingar $5 \nmid n$.
3. Bygg det billigaste $n$: krävs gör $2^3$ och $3^1$, med $5$ och $7$ förbjudna, alltså $n = 2^3 \cdot 3 = 24$.
4. Bekräfta: $\gcd(24, 56) = 8$ och $\gcd(24, 60) = 12$.

**Answer: 24**

## Trigger cues
- "Greatest number of identical boxes/groups with none left over" → räkna GCF av kvantiteterna.
- "Events start together; when do they next coincide?" (färjor, leveranser, kugghjul) → LCM av cykellängderna.
- "How many integers up to $N$ are divisible by both $p$ and $q$" → räkna multiplarna av $\mathrm{lcm}(p,q)$ via $\lfloor N/\mathrm{lcm} \rfloor$.
- "Divisible by $p$ or $q$" → inklusion–exklusion; dra bort överlappningen dubbelt för "but not both".
- "$\gcd(a,b)$ and $\mathrm{lcm}(a,b)$ are both given" → sätt $a = gm$, $b = gn$ och lista relativt prima par med $mn = \mathrm{lcm}/\gcd$.
- "$\gcd(n, m) = d$ for a specific $m$" → exponentvillkor på $n$, primtal för primtal.
- "How many common divisors do $a$ and $b$ have?" → räkna delarna till $\gcd(a,b)$.
- "$m$ and $n$ differ by a fixed amount" → deras GCF delar den differensen.

## Trap gallery
- **Multiplicera i stället för att ta LCM.** "Divisible by $6$ and $8$" är delbarhet med $24$, inte $48$ — multiplicera bara relativt prima tal.
- **Uppgradera delbarhet gratis.** $6 \mid n$ ger inte $12 \mid n$; $n = 6$ knäcker det — testa det minsta kvalificerande värdet i Data Sufficiency.
- **Läsa $\gcd(n, 60) = 12$ som $n = 12$.** Också $n = 36$ uppfyller det; ett GCF-villkor begränsar $n$, det namnger sällan talet.
- **Glömma överlappningens riktning.** "Or" kräver en subtraktion av överlappningen; "exactly one" kräver två.
- **LCM av en lista genom att multiplicera allt.** Minsta talet delbart med $2$ till $10$ utom $7$ är $2^3 \cdot 3^2 \cdot 5 = 360$, långt under den råa produkten.
- **Tillämpa $\gcd \cdot \mathrm{lcm} = ab$ på tre tal.** Det är en identitet för två tal; med tre eller fler faller den.
- **Ignorera bivillkor av typen "not a multiple of".** I problem med relativt prima kofaktorer är paret $(g, \mathrm{lcm})$ alltid ett alternativ — den satsen finns just för att eliminera det.

## Speed moves
- **Differenstricket för GCF.** $\gcd(51, 68)$: GCF delar $68 - 51 = 17$, och båda är multiplar av $17$ — svar $17$, ingen faktorisering.
- **Partnern ur produktidentiteten.** Givet $\gcd = 12$, $\mathrm{lcm} = 360$ och ett tal $60$: det andra är $12 \cdot 360 / 60 = 72$ på en rad.
- **Heltalsdivision räknar multiplar direkt.** Multiplar av $12$ upp till $300$: $\lfloor 300/12 \rfloor = 25$. Lista dem aldrig.
- **Primtalsstapling för LCM av listor.** Behåll högsta potensen av varje primtal: för $2$–$10$ blir det $2^3$, $3^2$, $5$, $7$.
- **Smarta småfall i Data Sufficiency.** För "is $n$ divisible by …?": testa det minsta $n$ som påståendet tillåter; faller det är påståendet otillräckligt på sekunder.

## Before you drill
- Jag kan faktorisera vilket två- eller tresiffrigt tal som helst i primtal på under $15$ sekunder.
- Jag bygger GCF ur minsta exponenter och LCM ur största utan att tveka.
- Jag kan använda $\gcd(a,b) \cdot \mathrm{lcm}(a,b) = ab$ och vet att den bara gäller för två tal.
- Givet både $\gcd$ och $\mathrm{lcm}$ skriver jag $a = gm$, $b = gn$ med relativt prima $m, n$ och $mn = \mathrm{lcm}/\gcd$.
- Jag räknar multiplar med $\lfloor N/k \rfloor$ och hanterar "or / not both" med inklusion–exklusion.
- Jag översätter $\gcd(n, m) = d$ till exponentvillkor per primtal, förbjudna primtal inräknade.
- Jag känner igen grupperingsuppgifter som GCF och synkroniseringsuppgifter som LCM redan vid första läsningen.
