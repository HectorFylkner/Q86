# Absolutbelopp som avstånd: tallinjeresonemang med decimaltal

## Why this matters
GMAT Focus testar absolutbelopp mindre som algebra och mer som geometri: $|x - a|$ är avståndet från $x$ till $a$, och nästan varje svår fråga i den här familjen faller ihop så snart du läser den så. Räkna med toleransband med decimalgränser, avrundningsintervall, "closer to"-jämförelser och ekvationer som gömmer två fall bakom ett par streck — från medelsvår problemlösning upp till Q85+-frågor i Data Sufficiency.

## The core ideas
1. Definition: $|x| = x$ om $x \ge 0$ och $|x| = -x$ om $x < 0$. Det är aldrig negativt, eftersom att negera ett negativt tal ger ett positivt.
2. Avståndsläsning: $|a - b|$ är avståndet mellan $a$ och $b$ på tallinjen. Det är ämnets enskilt mest användbara översättning — ordningen inuti strecken spelar ingen roll.
3. Tvåpunktsekvationen: $|x - a| = d$ (med $d > 0$) betyder $x = a - d$ eller $x = a + d$. De två lösningarna ligger symmetriskt kring $a$, så deras summa blir automatiskt $2a$.
4. Begränsat band: $|x - a| \le d \iff a - d \le x \le a + d$ — ett intervall centrerat i $a$ med radien $d$ och den totala längden $2d$. Strikt $<$ ger samma intervall med öppna ändpunkter.
5. Utanför bandet: $|x - a| > d \iff x < a - d$ eller $x > a + d$ — två strålar, aldrig ett enda intervall.
6. Beloppsjämförelse: $|x| > |y| \iff x^2 > y^2$, eftersom kvadrering raderar tecknet men bevarar avståndet till $0$. Notera att $x > y$ ensamt inte säger något om beloppen.
7. Avrundningsintervall: om ett värde avrundat till närmaste tiondel blir $r$ uppfyller det sanna värdet $w$ olikheten $r - 0{,}05 \le w < r + 0{,}05$. Intervallet är halvöppet: exakt $r + 0{,}05$ avrundas uppåt till nästa visade värde.
8. Närmare-testet: $x$ ligger närmare $a$ än $b$ precis när $x$ befinner sig på $a$:s sida om mittpunkten $\frac{a+b}{2}$. Exempel: närmare $10$ än $2$ betyder $x > 6$.
9. Ekvationer med två absolutbelopp: $|A| = k|B|$ (med $k > 0$) packas upp till $A = kB$ eller $A = -kB$. Om ekvationen dessutom har $x$-termer *utanför* strecken: lös varje fall och sätt sedan tillbaka kandidaterna — fallen kan ge falska rötter.
10. Summor av avstånd: $|x - a| + |x - b|$ har minimum $|a - b|$, som antas var som helst mellan $a$ och $b$. Med ett udda antal ankarpunkter minimeras summan i medianankaret.
11. Extremvärden på intervall: ett linjärt uttryck i begränsade variabler antar sina extremvärden i kombinationer av ändpunkter, så för att maximera $|cx + dy|$ ska du pröva hörnfallen — inklusive det mest negativa.
12. Var noga med decimaler kring noll: att subtrahera ett negativt tal är att addera. En uppgång från $-4{,}6$ till $7{,}8$ är $7{,}8 - (-4{,}6) = 12{,}4$, inte $3{,}2$.

## Worked examples

**Example 1**

*On the number line, the distance between $y$ and $-3.2$ is exactly $5.6$. What is the sum of the two possible values of $y$?*

1. "Distance between $y$ and $-3.2$ is $5.6$" översätts direkt till $|y - (-3.2)| = 5.6$, dvs. $|y + 3.2| = 5.6$.
2. De två lösningarna ligger $5{,}6$ på var sin sida om centrum $-3{,}2$: $y = -3.2 + 5.6 = 2.4$ eller $y = -3.2 - 5.6 = -8.8$.
3. Summa: $2.4 + (-8.8) = -6.4$. Snabbare: lösningar som är symmetriska kring $-3{,}2$ måste summera till $2(-3.2) = -6.4$ — ingen lösning behövs.

**Answer: $-6.4$**

**Example 2**

*If $|x + 4| = 3|x - 2|$, what is the sum of all values of $x$ that satisfy the equation?*

1. Båda leden är enkla absolutbelopp, så packa upp tecknet: $x + 4 = 3(x - 2)$ eller $x + 4 = -3(x - 2)$.
2. Fall 1: $x + 4 = 3x - 6 \Rightarrow 2x = 10 \Rightarrow x = 5$. Kontroll: $|9| = 3|3| = 9$. Giltig.
3. Fall 2: $x + 4 = -3x + 6 \Rightarrow 4x = 2 \Rightarrow x = 0.5$. Kontroll: $|4.5| = 3|-1.5| = 4.5$. Giltig.
4. Summa: $5 + 0.5 = 5.5$. Geometrisk läsning: vi sökte punkterna vars avstånd till $-4$ är tre gånger avståndet till $2$, och en sådan punkt ligger mellan ankarna, en bortom $2$.

**Answer: $5.5$**

**Example 3**

*If $|x + 1| \le 2.5$ and $|y - 3| \le 1.2$, what is the greatest possible value of $|3x - 2y|$?*

1. Packa upp varje band: $-3.5 \le x \le 1.5$ och $1.8 \le y \le 4.2$.
2. Skala till de delar du behöver: $-10.5 \le 3x \le 4.5$ och $3.6 \le 2y \le 8.4$.
3. Differensen $3x - 2y$ är störst när $3x$ är maximalt och $2y$ minimalt, minst i det omvända fallet: den löper från $-10.5 - 8.4 = -18.9$ upp till $4.5 - 3.6 = 0.9$.
4. Absolutbeloppet tar det största beloppet av de två ändarna: $|-18.9| = 18.9 > 0.9$, som antas vid $x = -3.5$, $y = 4.2$.

**Answer: $18.9$**

## Trigger cues
- "the distance between $x$ and $a$ is $d$" → skriv $|x - a| = d$; lösningarna är $a \pm d$.
- "stays within $c$ of the target $t$" / "drifts by at most $c$" → $|x - t| \le c$, ett intervall med längden $2c$.
- "the display reads $r$, rounded to the nearest tenth" → sant värde i $[r - 0.05,\ r + 0.05)$.
- "closer to $a$ than to $b$" → jämför $x$ med mittpunkten $\frac{a+b}{2}$.
- "sum of all possible values of $x$" efter $|x - a| = d$ → svara $2a$ av symmetriskäl.
- "greatest (or least) possible value of $|\ldots|$" med begränsade variabler → pröva kombinationer av ändpunkter.
- "least possible value of $|x-a| + |x-b| + |x-c|$" → utvärdera i medianankaret.

## Trap gallery
- Att bara lösa $x - a = d$ och tappa den negativa grenen — skriv alltid $a \pm d$ innan du rör något annat.
- Att behålla en falsk rot när $x$ förekommer utanför strecken — sätt tillbaka varje kandidat i den ursprungliga ekvationen.
- Att använda radien $0{,}1$ vid avrundning till närmaste tiondel — radien är en halv tiondel, $0{,}05$, och den högra ändpunkten är utesluten ($3{,}65$ visas som $3{,}7$, inte $3{,}6$).
- Att räkna heltal i en strikt olikhet som om ändpunkterna ingick — $<$ utesluter gränsvärdena.
- Att dra slutsatsen $|x| > |y|$ ur $x > y$ — falskt för $x = 1$, $y = -9$; jämför kvadrater i stället.
- Att subtrahera över noll som $7{,}8 - 4{,}6$ — avstånd på var sin sida om $0$ adderas, vilket ger $12{,}4$.
- Att maximera $|E|$ genom att bara maximera $E$ — vinnaren är ofta det mest *negativa* hörnet, som i Example 3.

## Speed moves
- Symmetrisumman: lösningarna till $|x - a| = d$ summerar till $2a$; för $|x + 2.5| = 4.1$ är svaret på "sum of possible values" $-5$ utan att något löses.
- Intervallöverlapp på en rad: två toleransband överlappar på $[\max(\text{vänstergränserna}),\ \min(\text{högergränserna})]$; banden $[2{,}44,\ 2{,}56]$ och $[2{,}37,\ 2{,}47]$ delar längden $2{,}47 - 2{,}44 = 0{,}03$.
- Skissa innan du delar upp i fall: för avståndsjämförande ekvationer, markera ankarna på en snabb tallinje — bilden visar oftast hur många lösningar som finns och ungefär var.
- Viktad punkt: om $P$ ligger mellan $A$ och $B$ med $AP:PB = m:n$ gäller $P = \frac{nA + mB}{m+n}$; för $A = -1$, $B = 5$ och förhållandet $2:1$ blir $P = 3$ direkt.
- Rensa bort decimalerna: multiplicera allt med $10$, arbeta i heltal och dividera tillbaka på slutet — färre decimaltecken-tabbar under tidspress.
- Testa en punkt i Data Sufficiency: för "is $x$ closer to $10$ than to $2$?" avslöjar $x = 5{,}9$ och $x = 6{,}1$ gränsen vid $6$ på några sekunder.

## Before you drill
- Jag kan omvandla $|x - a| \le d$, $< d$ och $> d$ till rätt intervall eller strålar utan att tveka.
- Jag vet att de två lösningarna till $|x - a| = d$ har medelvärdet $a$, så deras summa är $2a$.
- Jag kan ange intervallet för det sanna värdet bakom ett avrundat decimaltal, med rätt öppna och slutna ändpunkter.
- Jag översätter "closer to $a$ than to $b$" till en mittpunktsjämförelse direkt.
- Jag kontrollerar varje kandidatrot när variabler står utanför absolutbeloppsstrecken.
- Jag jämför belopp hos tal med tecken genom att kvadrera, aldrig direkt ur olikheten.
- Jag prövar alla kombinationer av ändpunkter — särskilt den mest negativa — när jag maximerar ett absolutbelopp.
