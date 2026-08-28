# Linjära ekvationssystem: lös mindre, kombinera mer

## Why this matters
Linjära system är arbetshästen i GMAT Quants algebra: de dyker upp direkt (lös ut $x$, hitta konstanten $k$) och som skelettet under textuppgifter om priser, biljetter, åldrar och prissättning av typen fast avgift plus taxa. På Q86-nivå belönar provet sällan att du maler fram $x$ och $y$ — det belönar att du ser när ett system faller ihop i ett enda drag, när en efterfrågad kombination är åtkomlig utan att systemet löses, och när en enda ekvation i hemlighet har ett unikt svar därför att de obekanta måste vara hela tal.

## The core ideas
1. **Ett system är ett snitt mellan linjer.** Systemet $a_1x + b_1y = c_1$, $a_2x + b_2y = c_2$ har en lösning, ingen, eller oändligt många — linjerna skär varandra en gång, är parallella, eller sammanfaller.
2. **Test för unik lösning:** exakt en lösning när $a_1b_2 - a_2b_1 \neq 0$, dvs. när koefficientkvoterna skiljer sig. Skäl: eliminationen lämnar då kvar en koefficient skild från noll på en variabel.
3. **Parallella mot identiska:** om $\dfrac{a_1}{a_2} = \dfrac{b_1}{b_2} \neq \dfrac{c_1}{c_2}$ finns ingen lösning; om alla tre kvoterna stämmer finns oändligt många. Skäl: proportionella vänsterled tvingar högerleden att antingen motsäga varandra eller stämma överens. Alltså har $2x + 5y = 8$ och $6x + ky = 24$ oändligt många lösningar precis när $k = 15$ (varje kvot är $3$).
4. **Elimination mot substitution:** skala så att en variabels koefficienter stämmer och addera eller subtrahera; eller isolera en variabel som redan har koefficienten $1$ och sätt in. Välj det som dödar en variabel på en rad.
5. **Sikta på kombinationen.** Om frågan gäller $px + qy$: leta efter $m \cdot E_1 + n \cdot E_2$ som matchar de koefficienterna — oftast är $m, n \in \{1, -1\}$, så pröva att addera eller subtrahera innan du löser något.
6. **Färre ekvationer än obekanta kan ändå räcka.** Två ekvationer i $x, y, z$ kan inte låsa fast varje variabel, men en kombination som $x + y + z$ kan vara helt bestämd. Pröva kombinationer innan du utropar "otillräcklig information".
7. **Symmetriska parvisa summor:** att addera $x + y$, $y + z$ och $x + z$ ger $2(x + y + z)$; subtrahera varje parsumma från totalen för att isolera den variabel den utelämnar.
8. **Dolda heltalsvillkor:** obekanta som räknar föremål måste vara icke-negativa heltal, så en enda ekvation som $8a + 5c = 47$ har den *unika* lösningen $a = 4$, $c = 3$. Pröva små multiplar av den ena koefficienten tills resten är delbar med den andra — motorn bakom många Data Sufficiency-fällor.
9. **Linjär kostnadsmodell:** "fast avgift plus konstant taxa" betyder $C = F + r \cdot n$; två datapunkter ger $r = \dfrac{\Delta C}{\Delta n}$ eftersom avgiften försvinner i differensen.

## Worked examples

**Example 1** — *A shop sells only notebooks and pens. Three notebooks and two pens cost $\$16.50$; one notebook and four pens cost $\$10.50$. What is the price of one notebook?*

1. Låt $n$ och $p$ vara priserna: $3n + 2p = 16.50$ och $n + 4p = 10.50$.
2. Multiplicera den andra ekvationen med $3$: $3n + 12p = 31.50$. Att subtrahera den första ekvationen dödar $n$: $10p = 15.00$, alltså $p = 1.50$.
3. Då är $n = 10.50 - 4(1.50) = 4.50$. Snabb kontroll: $3(4.50) + 2(1.50) = 13.50 + 3.00 = 16.50$. **Answer: $\$4.50$**

**Example 2** — *If $2p + 5q + 8r = 60$ and $5p + 8q + 11r = 90$, what is the value of $p + q + r$?*

1. Tre obekanta, två ekvationer — du kan inte hitta $p$, $q$, $r$ var för sig, så sikta direkt på kombinationen.
2. Subtrahera den första ekvationen från den andra: $(5-2)p + (8-5)q + (11-8)r = 90 - 60$, alltså $3p + 3q + 3r = 30$.
3. Dividera med $3$: $p + q + r = 10$. **Answer: $10$**

**Example 3** — *A landscaping firm installs two garden designs. Each Basic garden needs $5$ hours of digging and $3$ hours of planting; each Premium garden needs $2$ hours of digging and $6$ hours of planting. Last week the firm logged $216$ hours of digging and planting combined, and planting hours exceeded digging hours by $24$. How many Premium gardens were installed?*

1. Låt $b$ och $m$ räkna Basic- respektive Premium-trädgårdar. Grävtimmar: $D = 5b + 2m$. Planteringstimmar: $P = 3b + 6m$.
2. Översätt de två uppgifterna om timmar: $D + P = 216$ ger $8b + 8m = 216$, alltså $b + m = 27$. Och $P - D = 24$ ger $-2b + 4m = 24$, alltså $-b + 2m = 12$.
3. Addera de två förenklade ekvationerna: $3m = 39$, alltså $m = 13$ och $b = 14$.
4. Kontrollera: grävning $= 5(14) + 2(13) = 96$, plantering $= 3(14) + 6(13) = 120$; totalt $216$ och differens $24$, som krävs. **Answer: $13$**

## Trigger cues
- "Två köp av samma två varor i olika antal" → två prisekvationer; eliminera den variabel du *inte* blev tillfrågad om.
- "What is the value of $2x + 3y$?" (en kombination, inte en variabel) → pröva $E_1 + E_2$ och $E_1 - E_2$ innan du löser; skala bara om det misslyckas.
- "For which $k$ does the system have no / infinitely many solutions?" → sätt koefficientkvoterna lika; konstantkvoten skiljer "ingen" från "oändligt många".
- "The system has more than one solution" → ekvationerna är samma linje; använd vilken som helst av dem för att svara på frågan.
- "$x + y = \ldots$, $y + z = \ldots$, $x + z = \ldots$" → addera alla tre och halvera för att få $x + y + z$.
- "Fast avgift plus en taxa; två totalkostnader givna" → taxan $=$ kostnadsdifferensen genom kvantitetsdifferensen; räkna fram avgiften efteråt.
- Data Sufficiency som räknar föremål med en enda intäktsekvation → kontrollera heltalslösningar innan du kallar den otillräcklig.
- "In $10$ years, A will be twice B" → skriv åldrarna vid *den* tidpunkten: $A + 10 = 2(B + 10)$; båda personerna åldras lika mycket.

## Trap gallery
- **Att svara på fel variabel:** att lösa ut pennans pris när frågan gällde anteckningsboken. Åtgärd: ringa in målet först; eliminera den andra.
- **Reflexen "två obekanta kräver två ekvationer" i Data Sufficiency:** heltalsvillkor kan göra en enda ekvation tillräcklig (som med $8a + 5c = 47$), och två proportionella ekvationer är egentligen en. Åtgärd: pröva beroende och heltalslösningar.
- **Halvgjort kvottest:** att matcha $\frac{a_1}{a_2} = \frac{b_1}{b_2}$ och stanna där. Åtgärd: konstanterna avgör — lika konstantkvot betyder oändligt många, olika betyder ingen.
- **Teckenmiss vid elimination:** att bara subtrahera vissa termer. Åtgärd: subtrahera varje term, högerledet inkluderat, på en och samma nedskrivna rad.
- **Att åldra bara en person:** att skriva $A + 10 = 2B$ för "in ten years". Åtgärd: lägg till åren på båda åldrarna.
- **Enhetsglidning:** att blanda dollar med cent, eller timmar med ett antal trädgårdar. Åtgärd: ange enheten när du definierar varje variabel.

## Speed moves
- **Addera-först-reflexen:** i system som ser symmetriska ut, addera direkt — $5x + 2y$ och $2x + 5y$ summerar till $7(x + y)$.
- **Differensen ger taxan:** en $5$ miles lång resa kostar $\$14$ och en $9$ miles lång $\$22$, så taxan är $\frac{8}{4} = \$2$ per mile, avgiften $\$4$, och $15$ miles kostar $\$34$ — utan att något system skrivs ner.
- **Arbeta baklänges från svarsalternativen:** en automat rymmer $40$ flaskor à $\$2$ och $\$1.25$ till totalt $\$62$; testa mittenalternativet $j = 16$: $16 + 24 = 40$ och $32 + 30 = 62$ — klart.
- **Skala för att matcha, lös inte:** för att få $x + y + z$ ur två ekvationer med tre variabler, titta på *gapen* mellan koefficienterna (i Example 2 var alla gap $3$) i stället för att isolera något.
- **Blicka på determinanten:** för "exakt en lösning?", räkna ut $a_1b_2 - a_2b_1$ i huvudet; skilt från noll avgör tillräckligheten i Data Sufficiency utan att något löses.

## Before you drill
- Jag kan köra elimination och substitution rent och välja den snabbare på synhåll.
- Jag kan ange kvotvillkoren för en, ingen och oändligt många lösningar.
- Givet ett mål som $2x + 3y$ prövar jag att addera eller subtrahera ekvationerna innan jag löser.
- Jag kan få ut en bestämd kombination ur två ekvationer med tre obekanta.
- Jag kontrollerar heltalsvillkor innan jag dömer ett DS-påstående med en ekvation som otillräckligt.
- Jag översätter upplägg med avgift-plus-taxa och åldrar utan att härleda dem från grunden varje gång.
- Jag verifierar en ekvation med mina framräknade värden innan jag bekräftar ett svar.
