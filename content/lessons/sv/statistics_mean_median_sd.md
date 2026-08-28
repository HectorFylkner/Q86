# Medelvärde, median och standardavvikelse: summor, positioner och spridning

## Why this matters
GMAT Focus behandlar de här tre måtten som tre linser på samma data: medelvärdet följer *summan*, medianen följer *positionerna i sorterad ordning*, och standardavvikelsen följer *spridningen kring centrum*. Svåra frågor — av Q85+-slaget — blandar linserna: ändra ett värde och fråga vad som händer med varje mått, eller lås ett medelvärde och en median och fråga hur extremt ett värde kan bli. Vet du vilken lins varje mått använder förblir aritmetiken kort.

## The core ideas
1. Medelvärde som summa: $\text{medelvärde} = \dfrac{\text{summa}}{n}$, alltså $\text{summa} = n \cdot \text{medelvärde}$. Räkna om direkt — summor adderas, medelvärden gör det inte.
2. Att ändra ett värde: höj ett enda värde med $d$ så stiger medelvärdet med exakt $\dfrac{d}{n}$. Vid ett byte gäller $\text{nytt} - \text{gammalt} = n \cdot (\text{förändringen i medelvärde})$.
3. Balanspunktsvyn: avvikelserna från medelvärdet summerar till noll, $\sum (x_i - \bar{x}) = 0$ — överskott tar ut underskott, vilket snabbt hittar saknade värden.
4. Medianens läge: sortera först. Udda $n$: position $\dfrac{n+1}{2}$. Jämnt $n$: medelvärdet av positionerna $\dfrac{n}{2}$ och $\dfrac{n}{2}+1$ — två positioner, dubbelt villkor.
5. Medianen är positionsbunden: att flytta ett värde utan att ändra vilka värden som upptar mitten lämnar den orörd. I en lista med tre eller fler värden flyttar en höjning av maximum aldrig medianen men höjer alltid medelvärdet.
6. Jämnt fördelade mängder: $\text{medelvärde} = \text{median} = \dfrac{\text{första} + \text{sista}}{2}$, eftersom termerna paras ihop symmetriskt. För $7, 11, 15, 19$ är alla tre lika med $13$.
7. Standardavvikelsen mäter spridning: $\text{SD} = \sqrt{\dfrac{\sum (x_i - \bar{x})^2}{n}}$ — kvadratiskt medelavstånd från medelvärdet. Provet ber dig jämföra eller transformera den, inte räkna ut den.
8. SD-transformationer: att addera en konstant $c$ till varje värde lämnar SD oförändrad (mängden glider; avstånden gör det inte); att multiplicera varje värde med $k$ multiplicerar SD med $|k|$ (avstånden tänjs). $\text{SD} = 0$ precis när alla värden är lika.
9. Att jämföra SD på ögonmått: med lika antal vinner den mängd vars värden ligger längre från sitt eget medelvärde; värden långt ut dominerar eftersom avvikelserna kvadreras. Variationsbredden räcker inte: $\{0, 10\}$ har $\text{SD} = 5$, men $\{0, 5, 10\}$ har $\text{SD} \approx 4{,}08$.
10. Optimeringsmall: räkna om medelvärdet till en summa, lås medianpositionen (eller -positionerna) och pressa sedan varje annat värde till sitt tillåtna ytterläge — med respekt för sorteringsordningen, så att varje värde efter medianen måste vara minst lika stort som medianen.

## Worked examples

**Example 1**

*A cycling team has $6$ riders whose average (arithmetic mean) weekly training distance is $42$ miles. One rider is replaced by a new rider who trains $28$ miles per week, and the new average for the $6$ riders is $39$ miles. How many miles per week did the departing rider train?*

1. Räkna om till summor: före, $6 \times 42 = 252$; efter, $6 \times 39 = 234$.
2. Bytet sänkte summan med $252 - 234 = 18$, alltså tränade den avgående cyklisten $18$ miles mer än nykomlingen.
3. Avgående cyklist: $28 + 18 = 46$.

**Answer: $46$**

**Example 2**

*A data set consists of the four values $5$, $9$, $14$, and $x$. If the median of the set equals its mean, what is the sum of all possible values of $x$?*

1. Medelvärdet är $\dfrac{28 + x}{4}$. Med fyra värden är medianen medelvärdet av de två mittersta — och vilka två som ligger i mitten beror på var $x$ landar. Kör fallen.
2. Fall $x \le 5$: sorterad ordning är $x, 5, 9, 14$, medianen $\dfrac{5+9}{2} = 7$. Då ger $\dfrac{28+x}{4} = 7$ att $x = 0$, vilket uppfyller $x \le 5$. Giltigt.
3. Fall $5 \le x \le 14$: mittvärdena är $x$ och $9$, medianen $\dfrac{x+9}{2}$. Då är $28 + x = 2x + 18$, alltså $x = 10$, inom intervallet. Giltigt.
4. Fall $x \ge 14$: sorterad ordning är $5, 9, 14, x$, medianen $\dfrac{9+14}{2} = 11.5$. Då är $28 + x = 46$, alltså $x = 18 \ge 14$. Giltigt.
5. Alla tre överlever sina intervallkontroller: $0 + 10 + 18 = 28$.

**Answer: $28$**

**Example 3**

*Six friends compared how many books each read last year. Every count is a positive integer, the mean is $15$, and the median is $12$. What is the greatest possible number of books read by any one friend?*

1. Summa: $6 \times 15 = 90$. Sortera antalen som $a_1 \le a_2 \le \cdots \le a_6$. Det jämna antalet låser två positioner: $\dfrac{a_3 + a_4}{2} = 12$, alltså $a_3 + a_4 = 24$.
2. För att maximera $a_6$: minimera allt annat: $a_1 = a_2 = 1$.
3. Paret $a_3 + a_4$ är låst vid $24$, men uppdelningen spelar roll eftersom $a_5 \ge a_4$. Eftersom $a_4 \ge a_3$ tvingar fram $a_4 \ge 12$ tillåter uppdelningen $a_3 = a_4 = 12$ det minsta tillåtna $a_5 = 12$.
4. De fem första värdena summerar till $1 + 1 + 12 + 12 + 12 = 38$, vilket lämnar $a_6 = 90 - 38 = 52$. Kontroll: $1, 1, 12, 12, 12, 52$ är sorterad med medelvärdet $15$ och medianen $12$.

**Answer: $52$**

## Trigger cues
- "The average (arithmetic mean) of $n$ numbers is $m$" → skriv $\text{summa} = nm$ innan du läser vidare.
- "One value was recorded incorrectly / then corrected" → medelvärdet förskjuts med $\dfrac{\text{felet}}{n}$; medianen förskjuts bara om mitten byter innehavare.
- "A member leaves and another joins" → $\text{nytt} - \text{gammalt} = n \cdot (\text{förändringen i medelvärde})$.
- "The mean equals the median" med en obekant → falluppdelning efter var den obekanta hamnar i sorterad ordning, med intervallkontroll av varje lösning.
- "Greatest / least possible value" under fast medelvärde och median → summor, lås medianpositionen (-erna), och sätt allt annat på sitt golv eller tak.
- "Which set has the greatest standard deviation?" → jämför avstånden till varje mängds eget medelvärde; räkna inte ut.
- "$c$ is added to each value / each value is doubled" → SD-reglerna: en förskjutning lämnar SD i fred; skalning med $k$ multiplicerar den med $|k|$.

## Trap gallery
- Att ta medianen innan du sorterar — mitten av listan som den står skriven betyder ingenting.
- Att behandla en median med jämnt antal som en med udda — den binder två positioner, och båda måste samarbeta (i Example 3 ger ett glömt $a_5 \ge a_4$ en otillåten mängd).
- Att anta medelvärde $=$ median som standard — det gäller bara för jämnt fördelade eller symmetriska mängder; skevhet drar medelvärdet mot svansen.
- Att likställa variationsbredd med SD — $\{0, 10\}$ och $\{0, 5, 10\}$ delar bredden $10$ men inte SD; klustring nära medelvärdet krymper SD.
- Att tro att en förskjutning ändrar SD, eller att skalning inte gör det — att addera $c$ bevarar spridningen; att multiplicera med $k$ tänjer den med $|k|$.
- Att hoppa över intervallkontroller i falluppdelning kring medelvärde och median — ett fall kan ge ett $x$ utanför sitt eget antagna intervall; kasta den roten.
- Att dividera en förändring i summan med fel $n$ — använd den gruppstorlek som gäller vid varje medelvärde.

## Speed moves
- Summor först: i samma stund du ser ett medelvärde, multiplicera med $n$ — i Example 1 förvandlar det en textuppgift till $252 - 234 = 18$.
- Bokför avvikelser: för att hitta ett femte tal med medelvärdet $14$ givet $9, 12, 15, 18$, summera avvikelserna från $14$ ($-5, -2, +1, +4$ ger $-2$), alltså är det femte talet $14 + 2 = 16$.
- Genvägen för en enskild ändring: att höja ett enda värde med $20$ i en mängd med $5$ element höjer medelvärdet med $\dfrac{20}{5} = 4$ och, om värdet redan var maximum, medianen med $0$.
- Jämför SD på ögonmått: markera varje mängds medelvärde och bedöm hur långt värdena ligger från det; den mängd som kramar sitt medelvärde förlorar.
- **Testa alternativen i frågor om medelvärde och median.** Sätt in varje svarsalternativ, sortera och testa $\text{medelvärde} = \text{median}$ direkt — ofta snabbare än falluppdelning.

## Before you drill
- Jag räknar om varje angivet medelvärde till en summa innan jag gör något annat.
- Jag kan lokalisera medianpositionen (-erna) för varje $n$ — en vid udda, två vid jämnt — efter sortering.
- Jag vet vilket mått som rör sig när ett värde ändras: medelvärdet alltid, medianen bara om mitten byter innehavare.
- Jag kan ange vad addition av en konstant respektive skalning med $k$ gör med medelvärde, median och SD.
- Jag jämför SD utifrån avstånd till medelvärdet, aldrig utifrån variationsbredd eller genom att räkna.
- I max/min-uppgifter låser jag medianen, sätter resten på golv eller tak, och respekterar sorteringsordningen.
- I falluppdelning kring medelvärde $=$ median intervallkontrollerar jag varje kandidat innan jag accepterar den.
