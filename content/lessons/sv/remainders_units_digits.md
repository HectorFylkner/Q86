# Rester och entalssiffror: cykelaritmetik under press

## Why this matters
GMAT Focus älskar frågor som ser ut att kräva miniräknare — entalssiffran i en $58$:e potens, till exempel — eftersom de kollapsar till tio sekunders mönsterarbete så snart du vet att rester går i cykler. Ämnet sträcker sig från packningsproblem på medelnivå till de allra svåraste uppgifterna i Problem Solving och Data Sufficiency, och på Q86-nivå måste du kunna köra den här aritmetiken modulo vilken divisor som helst.

## The core ideas
1. **Divisionsalgoritmen.** Varje heltalsdivision har formen $n = dq + r$ med $0 \le r < d$: resten är det som blir kvar när man tagit bort den största multipeln av $d$ som får plats, och avståndet upp till *nästa* multipel är $d - r$.
2. **Kongruensspråket.** $a \equiv b \pmod{m}$ betyder att $m$ delar $a - b$, det vill säga att $a$ och $b$ lämnar samma rest — så tal som skiljer sig med en multipel av $m$ är utbytbara.
3. **Rester respekterar aritmetiken.** $(a+b) \bmod m$, $(a \cdot b) \bmod m$ och $a^k \bmod m$ följer alla av $a \bmod m$ och $b \bmod m$: multiplar av $m$ som kastas bort på vägen kan inte ändra slutresten.
4. **Entalssiffran är en rest.** Entalssiffran i $n$ är $n \bmod 10$, så entalssiffror adderas och multipliceras på egen hand — bara sista siffror påverkar sista siffror.
5. **Potenscykler mod $10$.** Entalssiffror i potenser upprepas: $2 \to 2,4,8,6$; $3 \to 3,9,7,1$; $7 \to 7,9,3,1$; $8 \to 8,4,2,6$ (period $4$); $4 \to 4,6$ och $9 \to 9,1$ (period $2$); $0,1,5,6$ rör sig aldrig. Enligt idé 4 beror varje entalssiffra bara på den föregående, så följden måste gå runt.
6. **Exponentreduktion.** För $a^n \bmod 10$ med cykellängd $L$: räkna $n \bmod L$ och läs av den positionen i cykeln; om $n \bmod L = 0$, läs position $L$, inte position $0$.
7. **Cykler finns modulo vilket $m$ som helst.** Potenser upprepas modulo varje divisor, till exempel går $2^n \bmod 7$ i cykeln $2, 4, 1$ med period $3$. Generera sådana cykler för hand — de är aldrig långa på GMAT.
8. **Genvägen $\pm 1$.** Om $a \equiv -1 \pmod m$ gäller $a^k \equiv (-1)^k \pmod m$: eftersom $17 \equiv -1 \pmod 9$ är varje udda potens av $17$ kongruent med $8 \pmod 9$. Negativa representanter är tillåtna enligt idé 2.
9. **Två moduler kombineras vid deras LCM.** Att känna $n \bmod a$ och $n \bmod b$ låser fast $n \bmod \operatorname{lcm}(a,b)$: lista kandidater ur den större modulen och behåll den som uppfyller den andra.
10. **Sifferfingeravtryck hos kvadrater och kuber.** En jämn kvadrat slutar bara på $0, 1, 4, 5, 6, 9$, och de flesta av de ändelserna uppstår ur två möjliga sista siffror i basen; kubändelser uppstår ur exakt en. Bygg upp båda fakta genom att kvadrera och kuba siffrorna $0$–$9$ en gång.

## Worked examples

**Example 1**
*A stationery supplier packs $742$ pens into boxes holding exactly $16$ pens each. After filling as many boxes as possible, how many additional pens are needed to fill one more box?*

1. Dividera: $16 \cdot 46 = 736$, alltså $742 = 16 \cdot 46 + 6$; resten är $6$.
2. Frågan gäller avståndet upp, inte överskottet: nästa fulla låda behöver $16 - 6 = 10$ pennor till.

**Answer: $10$**

**Example 2**
*What is the units digit of $3^{58} + 8^{58}$?*

1. Båda baserna har cykler med period $4$: $3 \to 3, 9, 7, 1$ och $8 \to 8, 4, 2, 6$.
2. Reducera exponenten: $58 = 4 \cdot 14 + 2$, läs alltså position $2$ i varje cykel.
3. Alltså slutar $3^{58}$ på $9$ och $8^{58}$ på $4$.
4. Entalssiffror adderas mod $10$: $9 + 4 = 13$, så summan slutar på $3$.

**Answer: $3$**

**Example 3**
*When the positive integer $n$ is divided by $9$, the remainder is $5$; when divided by $4$, the remainder is $3$. What is the remainder when $n$ is divided by $36$?*

1. Eftersom $36 = \operatorname{lcm}(9, 4)$ låser de två villkoren tillsammans fast $n \bmod 36$.
2. Ur den större modulen: kandidaterna under $36$ med rest $5$ mod $9$ är $5, 14, 23, 32$.
3. Testa var och en mot mod-$4$-villkoret: $5 \equiv 1$, $14 \equiv 2$, $23 \equiv 3$, $32 \equiv 0 \pmod 4$. Bara $23$ fungerar.
4. Varje giltigt $n$ är $23$ plus en multipel av $36$, så resten är $23$.

**Answer: $23$**

## Trigger cues
- "Units digit of $a^{\text{huge}}$" → skriv basens cykel (högst $4$ steg) och reducera exponenten mod dess längd.
- "Remainder when $a^{\text{huge}}$ is divided by $7$, $9$, or $13$" → bygg potenscykeln mod den divisorn, efter att ha kollat om $a \equiv \pm 1$.
- "Fills as many … as possible — how many left over / how many more needed" → divisionsalgoritmen; svara $r$ eller $d - r$.
- "Starts on a Monday and runs for $k$ days", eller vilket upprepande schema som helst → positionen är $(k-1) \bmod (\text{cykellängd})$ steg efter starten.
- "Remainder mod $a$ is … and remainder mod $b$ is …; find the remainder mod $ab$" → lista kandidater ur den större modulen och snitta.
- "$n$ leaves remainder $r$ when divided by $m$; find (uttryck i $n$) mod $m$" → sätt in $r$ i stället för $n$ och reducera.
- Data Sufficiency: "the units digit of $k^2$ (or $k^3$) is …" → kör alla tio siffror genom potensen och se vilka som överlever.

## Trap gallery
- Att läsa $n \bmod L = 0$ som "position $0$": exponenten landade på cykelns *slut*, så läs position $L$.
- Att anta att varje entalscykel har längd $4$: siffrorna $4$ och $9$ växlar med period $2$, och $0, 1, 5, 6$ står stilla.
- Negativa siffror i subtraktion: något som slutar på $4$ minus ett mindre tal som slutar på $9$ slutar på $14 - 9 = 5$, inte $-5$; jämför $34 - 19 = 15$.
- Att slå ihop moduler genom addition: $n \equiv 5 \pmod 9$ och $n \equiv 3 \pmod 4$ kombineras inte aritmetiskt — snitta kandidatlistor i stället.
- Att svara med överskottet $r$ när frågan gäller avståndet $d - r$, eller tvärtom.
- Ett-fel i dagräkning: dag $k$ är $k - 1$ steg efter dag $1$, så dag $8$ upprepar veckodagen för dag $1$, inte dag $2$.
- Att lova för mycket i Data Sufficiency: att $k^2$ slutar på $9$ tillåter $k$ att sluta på $3$ *eller* $7$ — kvadrater är två-till-ett på sista siffran, kuber ett-till-ett.

## Speed moves
- Lär dig de fyra cyklerna med period $4$ ($2, 3, 7, 8$) och de två växlarna ($4, 9$) utantill; allt annat står stilla. De flesta entalsfrågor tar då en enda division med $4$.
- Leta efter $\pm 1$ innan du bygger någon cykel: $26 \equiv -1 \pmod 9$, alltså $26^{15} + 4 \equiv -1 + 4 = 3 \pmod 9$ på en rad.
- Sätt in själva resten: om $n \equiv 4 \pmod 7$ gäller $3n^2 + 2n + 5 \equiv 3(16) + 8 + 5 = 61 \equiv 5 \pmod 7$ — inget faktiskt $n$ behövs.
- Låt fakulteter försvinna: så snart $k!$ innehåller divisorns faktorisering bidrar den med $0$, alltså lämnar $1! + 2! + \cdots + 50!$ resten $1 + 2 = 3$ vid division med $6$.
- Räkna siffermönster som restklasser: $8^n$ slutar på $2$ exakt när $n \equiv 3 \pmod 4$, så för $1 \le n \le 60$ finns $60/4 = 15$ sådana exponenter.
- Testa två vittnen i Data Sufficiency om rester: för "$n$ is even and $n \equiv 2 \pmod 3$" lämnar både $n = 2$ och $n = 8$ resten $2$ mod $6$ — en snabb signal att fakta tillsammans räcker.

## Before you drill
- Jag kan skriva entalscykeln för vilken siffra som helst ur minnet på sekunder.
- Jag reducerar exponenter mod cykellängden och läser position $L$ när reduktionen ger $0$.
- Jag kan bygga en potenscykel mod $7$, $9$ eller $13$ för hand utan att tveka.
- Jag kollar om basen är $\equiv \pm 1$ modulo divisorn innan jag maler fram en cykel.
- Jag svarar "left over" med $r$ och "needed to complete" med $d - r$ — och läser vilket som efterfrågas.
- Jag kombinerar två restvillkor genom att lista kandidater upp till LCM, aldrig genom att addera rester.
- Jag testar alla tio siffror, inte bara den självklara, i Data Sufficiency om entalssiffror.
