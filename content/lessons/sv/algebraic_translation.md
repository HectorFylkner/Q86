# Algebraisk översättning: att göra meningar till ekvationer du kan lita på

## Why this matters
Nästan varje textuppgift på GMAT Focus Edition står och faller med översättningssteget: är ekvationen rätt är algebran rutin; är den fel räddar ingen omsorgsfull uträkning dig. På Q86-nivå testar provet översättning med ordningsfällor ("difference of $y$ and $x$"), olikhetsformuleringar ("at least as large as"), dolda heltalsvillkor som får en ekvation att bete sig som två, och Data Sufficiency-frågor där du måste avgöra om uppställningen *tvingar fram* ett unikt svar. Det här kapitlet bygger en ordlista du tillämpar mekaniskt, så att ditt arbetsminne hålls fritt för de riktiga besluten.

## The core ideas
1. **Ordlistan.** "Sum of $a$ and $b$" $\to a+b$; "difference of $a$ and $b$" $\to a-b$ i den ordningen; "product" $\to ab$; "quotient of $a$ and $b$" $\to \frac{a}{b}$; "is / equals / the result is" $\to =$. Översätt fras för fras, i den ordning de står, eftersom varje nominalfras är ett algebraiskt objekt.
2. **"Less than" vänder ordningen.** "$k$ less than $m$" $\to m-k$, inte $k-m$; "$k$ more than $m$" $\to m+k$. Frasen anger en mängd som tas bort *från* $m$, så $m$ kommer först.
3. **Olikhetsord.** "At least" $\to \ge$; "at most" $\to \le$; "more than" $\to >$; "fewer than" $\to <$; "$n$ differs from $10$ by more than $2$" $\to |n-10|>2$. Varje fras motsvarar exakt en symbol — mjuka aldrig upp $\ge$ till $>$.
4. **Heltalsgränser.** Om $x \ge \frac{8}{3}$ är det minsta heltalet $3$ (avrunda uppåt); om $n < 8{,}5$ är det största heltalet $8$ (stega ner). Strikt mot icke-strikt avgör om gränsvärdet självt räknas.
5. **En variabel när storheterna hänger ihop.** "Twice as many paperbacks as hardcovers" $\to p = 2h$; skriv allt i $h$ så att ett villkor ger en lösbar ekvation. Färre variabler betyder färre ställen att halka på.
6. **Samma storhet, två uttryck.** Penninguppgifter med "has $\$7$ left" eller "needs $\$5$ more" översätts som samma totalsumma skriven två gånger: $M = np + \text{överskott}$ och $M = mp - \text{underskott}$. Sätt uttrycken lika eftersom båda beskriver ett och samma fasta tal.
7. **Uppdelning av en fast pott.** En total $T$ som delas av $n$ personer ger var och en $\frac{T}{n}$; "each of $4$ gets $d$ more than each of $10$ would" $\to \frac{T}{4} = \frac{T}{10} + d$. Potten ändras inte, bara nämnaren.
8. **Åldersförskjutning.** "In $t$ years" lägger $t$ till *varje* persons ålder: om $M = 3s$ nu och $M + 12 = 2(s+12)$ senare har båda åldrarna flyttats. Tiden går för alla samtidigt.
9. **Summa och differens.** Om $x+y=S$ och $x-y=D$ gäller $x = \frac{S+D}{2}$ och $y = \frac{S-D}{2}$. Att addera ekvationerna dödar $y$; att subtrahera dödar $x$.
10. **Parvisa summor.** Givet $a+b$, $a+c$, $b+c$: addera alla tre för att få $2(a+b+c)$; halvera och subtrahera sedan den parsumma som saknar den variabel du vill ha. Varje variabel förekommer i exakt två av de tre summorna.
11. **En tredje ekvations förenlighet.** Två oberoende linjära ekvationer i $x, y$ låser fast en unik punkt; en tredje ekvation "gäller automatiskt" precis när den punkten uppfyller den — lös $2\times 2$-systemet och sätt in.
12. **Siffror är koefficienter.** Ett tresiffrigt tal är $100a + 10b + c$; omvänt ger det $100c + 10b + a$, så förändringen är $99(c-a)$. En ökning med $297$ betyder $c - a = \frac{297}{99} = 3$.
13. **Heltalsvillkor får ekvationer att falla ihop.** En enda ekvation som $3a + 8p = 37$ med positiva heltal $a, p$ kan ha en *unik* lösning — räkna upp med hjälp av delbarhet eller en modulokontroll. I Data Sufficiency är "en ekvation, två obekanta" bara otillräcklig som utgångspunkt; positivitet och heltalighet kan rädda den, så testa alltid innan du dömer den otillräcklig.

## Worked examples

**Example 1**
*When $5$ is subtracted from four times a number $n$, the result equals the number increased by $13$. What is $n$?*

1. Översätt den vänstra frasen: "four times $n$" är $4n$; att subtrahera $5$ ger $4n - 5$.
2. Översätt den högra frasen: "the number increased by $13$" är $n + 13$.
3. "The result equals" binder ihop dem: $4n - 5 = n + 13$.
4. Subtrahera $n$ och addera $5$: $3n = 18$, alltså $n = 6$. Kontrollera i ord: fyra gånger $6$ är $24$, minus $5$ är $19$, och $6 + 13 = 19$.

**Answer: $n = 6$**

**Example 2**
*Every poster at a shop costs the same whole-dollar price. If Deshi buys $6$ posters, he will have $\$9$ left over; to buy $9$ posters, he would need $\$12$ more than he has. How much money does Deshi have?*

1. Låt $M$ vara Deshis pengar och $p$ priset per affisch. Hans pengar är ett fast tal, så skriv det på två sätt.
2. "Buys $6$ posters with $\$9$ left" betyder $M = 6p + 9$.
3. "Needs $\$12$ more for $9$ posters" betyder $M + 12 = 9p$, dvs. $M = 9p - 12$.
4. Sätt uttrycken lika: $6p + 9 = 9p - 12$, alltså $3p = 21$ och $p = 7$.
5. Då är $M = 6(7) + 9 = 51$. Kontroll: $9$ affischer kostar $\$63$, vilket är exakt $\$12$ mer än $\$51$.

**Answer: $\$51$**

**Example 3**
*A snack stand sells apples for $30$ cents each and pears for $80$ cents each. Jo bought at least one apple, at least one pear, and nothing else. Did Jo buy more apples than pears?*

*(1) Jo spent $\$3.70$ in total.*

*(2) Jo bought $6$ items in total.*

1. Låt $a$ och $p$ vara antalet äpplen och päron, med $a \ge 1$ och $p \ge 1$, båda heltal. Frågan är om $a > p$.
2. Påstående (1): $30a + 80p = 370$, som förenklas till $3a + 8p = 37$. Eftersom $8p < 37$ är bara $p \in \{1, 2, 3, 4\}$ möjligt. Testa delbarhet: $37 - 8p$ måste vara en positiv multipel av $3$. Bara $p = 2$ fungerar, vilket ger $3a = 21$, alltså $a = 7$. Den unika lösningen $(a, p) = (7, 2)$ besvarar frågan: ja, $7 > 2$. Tillräckligt.
3. Påstående (2): $a + p = 6$ tillåter $(1,5)$, $(2,4)$, $(3,3)$, $(4,2)$, $(5,1)$. Vissa ger $a > p$, andra inte. Inte tillräckligt.
4. Påstående (1) ensamt räcker; påstående (2) ensamt gör det inte.

**Answer: (1) alone is sufficient; (2) alone is not.**

## Trigger cues
- "Three less than twice $x$ is at least ..." $\to$ bygg olikheten symbol för symbol med ordlistan och lös sedan ut heltalsgränsen.
- "Has $\$k$ left over / would need $\$k$ more" $\to$ skriv personens pengar på två sätt och sätt lika.
- "Sum is $S$ and difference is $D$" $\to$ hoppa direkt till $\frac{S+D}{2}$ och $\frac{S-D}{2}$.
- "In $t$ years, she will be ..." $\to$ uppställning med två ålderskolumner; lägg till $t$ på varje ålder i framtidsekvationen.
- "How many coins/tickets/items ..." med värden per styck och heltalsantal $\to$ ställ upp värdeekvationen och räkna upp med en delbarhetskontroll innan du bedömer tillräckligheten.
- "For what value of $k$ does the third equation hold automatically" $\to$ lös de två första ekvationerna och sätt in punkten i den tredje.
- "Reversing its digits increases the number by ..." $\to$ förändringen är $99(c-a)$; dividera direkt.
- "Each of $m$ workers earns $d$ more than each of $n$ would" $\to$ fast pott: $\frac{T}{m} = \frac{T}{n} + d$.

## Trap gallery
- **Omvänd subtraktion.** Att skriva "$7$ less than $3n$" som $7 - 3n$; rätt är $3n - 7$ — "less than" vänder ordningen.
- **Ordningen i "difference".** "Difference of $y$ and $x$" är $y - x$; att översätta det som $x - y$ vänder varje tecken längre fram.
- **Att svara på fel storhet.** Att lösa ut inbundna böcker när frågan gäller pocketböcker; läs om slutfrågan innan du markerar.
- **Att åldra en person.** Att skriva $M + 12 = 2s$ i stället för $M + 12 = 2(s + 12)$; alla åldras tillsammans.
- **Strikthetsmiss.** Att läsa "at least" som $>$; gränsvärdet ingår, och det är ofta svaret.
- **Avrundning åt fel håll.** Att ur $x \ge \frac{8}{3}$ dra slutsatsen $x = 2$; det minsta *heltalet* som uppfyller det är $3$.
- **Automatiskt otillräcklig.** Att döma en ekvation med två obekanta otillräcklig utan att kontrollera; villkoret positiva heltal gjorde $3a + 8p = 37$ helt bestämd.
- **Att lita på din ekvation framför orden.** Att verifiera en lösning mot din egen (möjligen felöversatta) ekvation; sätt in den i originalmeningen i stället.

## Speed moves
- **Testa alternativen på sammanlänkade storheter.** "Sum is $40$; the larger is $8$ more than three times the smaller": testa ett kandidatvärde för det större — $32$ ger det mindre $8$, och $3(8) + 8 = 32$ stämmer. Klart utan uppställning.
- **Halva summan, halva differensen.** Summa $50$, differens $8$: talen är $29$ och $21$ direkt — inget system behövs.
- **Addera allt vid parvisa summor.** $a+b = 11$, $a+c = 14$, $b+c = 17$: totalen är $\frac{42}{2} = 21$, alltså $c = 21 - 11 = 10$ med en subtraktion.
- **Modulosvep för diofantiska ekvationer.** I $3a + 8p = 37$: arbeta modulo $3$: $8p \equiv 1 \pmod 3$ tvingar fram $p \equiv 2 \pmod 3$, så bara $p = 2$ behöver kontrolleras under gränsen $8p < 37$.
- **Begränsa innan du räknar upp.** Sätt ett tak för sökningen först ($p \le 4$ eftersom $8p < 37$); fyra kontroller slår blint prövande.
- **Verbal kontroll slår omräkning.** När du hittat $n = 6$, läs meningen med $6$ insatt — tre sekunder, och den fångar översättningsfel som algebran inte kan.

## Before you drill
1. Jag kan översätta "$k$ less than $m$" och "difference of $a$ and $b$" utan att kasta om ordningen.
2. Jag avbildar "at least / at most / more than / fewer than" på rätt symbol av $\ge, \le, >, <$ varje gång.
3. Givet en bråkgräns som $x \ge \frac{8}{3}$ avrundar jag åt rätt håll för minsta eller största heltal.
4. Jag skriver penninguppgifter med överskott/underskott som en total uttryckt på två sätt.
5. Jag lägger till $t$ på varje ålder när en uppgift hoppar $t$ år framåt.
6. Jag prövar heltals- och positivitetsvillkor innan jag kallar en ekvation med två obekanta otillräcklig.
7. Jag sätter in mitt svar i originalmeningen, inte i min egen ekvation.
