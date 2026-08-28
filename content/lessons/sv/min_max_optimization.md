# Min/max-optimering: att pressa fram extremvärden ur villkor

## Why this matters
GMAT Focus älskar att fråga inte "vad är $x$?" utan "vad är det största (eller minsta) möjliga värdet på $x$?". På Q86-nivå dyker de upp som textuppgifter med flera villkor — budgetar, tak på medelvärden, listor med olika heltal, förhållandegränser — plus algebraiska varianter byggda på andragradare och intervallaritmetik. Alla belönar en och samma disciplin: pressa varje annan storhet till sitt tillåtna ytterläge och kontrollera sedan att scenariot är tillåtet.

## The core ideas
1. **Motsatsprincipen.** Om $x_1 + x_2 + \dots + x_n = S$ är fast: för att maximera en term, minimera alla andra: $x_{\max} = S - (\text{minsta möjliga summa av resten})$. Varje enhet som ges någon annanstans stjäls från ditt mål.
2. **Gränsprincipen.** En monoton målfunktion på ett begränsat intervall antar sitt extremvärde i en ändpunkt: om kostnaden $C(h)$ växer i $h$ och $h \ge h_0$ är minimikostnaden $C(h_0)$. Att röra sig bort från gränsen kan bara göra saken sämre.
3. **Heltalsavrundning.** Det största heltalet $n$ med $f + rn \le B$ är $n = \left\lfloor \frac{B - f}{r} \right\rfloor$; det minsta heltalet $n$ med $rn - f \ge T$ är $n = \left\lceil \frac{T + f}{r} \right\rceil$. Lös olikheten och avrunda sedan åt det enda håll den tillåter.
4. **Differenser tar motsatta extremvärden.** $\max(x - y) = (\max x) - (\min y)$ och $\min(x - y) = (\min x) - (\max y)$: en differens växer när den ledande delen växer och den subtraherade delen krymper.
5. **Produkter bor i hörnen.** För $a \in [a_1, a_2]$ och $b \in [b_1, b_2]$ finns extremvärdena av $ab$ bland de fyra ändpunktsprodukterna. Teckenbyten gör "uppenbara" svar felaktiga, så räkna ut alla fyra.
6. **Andragradarens vertex.** $y = ax^2 + bx + c$ har sitt extremvärde i $x = -\frac{b}{2a}$ med värdet $c - \frac{b^2}{4a}$: ett minimum om $a > 0$, ett maximum om $a < 0$. På kvadratkompletterad form gäller $-(x-h)^2 + k \le k$ eftersom en kvadrat aldrig är negativ.
7. **Fast summa sätter tak på produkten.** Om $x + y = S$ gäller $xy = \left(\frac{S}{2}\right)^2 - \left(\frac{x-y}{2}\right)^2 \le \left(\frac{S}{2}\right)^2$, med likhet när $x = y$.
8. **Medelvärdesgränsen (lådprincipen).** Bland $n$ tal med summan $S$ är det största minst $\frac{S}{n}$ och det minsta högst $\frac{S}{n}$ — de kan inte alla ligga på samma sida om medelvärdet.
9. **Olika heltal packas konsekutivt.** För att göra olika positiva heltal så små som möjligt, använd $1, 2, 3, \dots$; för att göra olika heltal större än $m$ så små som möjligt, använd $m+1, m+2, \dots$ Varje lucka slösar bort utrymme du ville ha någon annanstans.
10. **Förhållandetak sätter ett golv.** "Inget värde får överstiga $k$ gånger något annat" betyder $\max \le k \cdot \min$, så när maximum är $M$ måste varje värde vara minst $\frac{M}{k}$ — det dolda golvet begränsar $M$.

## Worked examples

**Example 1** *If $-7 \le m \le 4$ and $-5 \le n \le 6$, what is the greatest possible value of $mn$?*

1. Produkter över intervall antar sina extremvärden i ändpunktspar, så lista de fyra hörnprodukterna.
2. $(-7)(-5) = 35$, $(-7)(6) = -42$, $(4)(-5) = -20$, $(4)(6) = 24$.
3. Vinnaren är dubbelnegativa hörnet: $35$ slår det helpositiva $24$.

**Answer: $35$**

**Example 2** *Nine distinct positive integers have an average of $15$ and a median of $10$. What is the greatest possible value of the largest of the nine integers?*

1. Summan är fast: $9 \times 15 = 135$. Enligt motsatsprincipen maximerar du det största genom att minimera de övriga åtta.
2. Det femte värdet är medianen, $10$. De fyra under det är olika positiva heltal mindre än $10$; minsta valet: $1, 2, 3, 4$, med summan $10$.
3. Sjätte till åttonde värdet är olika heltal större än $10$; minsta valet: $11, 12, 13$, med summan $36$.
4. De åtta icke-största värdena summerar till $10 + 10 + 36 = 56$, alltså är det största $135 - 56 = 79$.
5. Tillåtlighetskontroll: $79 > 13$, alla värden olika och positiva, medianen fortfarande $10$.

**Answer: $79$**

**Example 3** *A dispatcher must assign exactly $52$ deliveries among $6$ drivers. Each driver must receive at least $5$ deliveries, and no driver may receive more than three times as many deliveries as any other driver. What is the greatest number of deliveries that any one driver can receive?*

1. Låt $M$ vara det eftersökta maximum. Förhållandetaket $M \le 3 \cdot \min$ tvingar varje annan förare att få minst $\frac{M}{3}$ leveranser (och minst $5$).
2. De fem övriga förarna delar på $52 - M$ leveranser, så tillåtligheten kräver $52 - M \ge 5 \cdot \left\lceil \frac{M}{3} \right\rceil$ så snart $\frac{M}{3} \ge 5$.
3. Testa $M = 19$: varje annan förare behöver minst $\lceil 19/3 \rceil = 7$, alltså behöver de övriga minst $35$, men bara $52 - 19 = 33$ återstår. Otillåtet — och ett större $M$ höjer golvet samtidigt som potten krymper.
4. Testa $M = 18$: varje annan förare behöver minst $6$, och $52 - 18 = 34 \ge 30$ fungerar. En tillåten fördelning är $6, 7, 7, 7, 7, 18$: summan är $52$, varje förare har minst $5$, och $18 \le 3 \times 6$.

**Answer: $18$**

## Trigger cues
- "Greatest/least possible value of one member" med fast total eller medelvärde → motsatsprincipen: pressa alla andra till ytterläget.
- "At least $k$ hours/units" med en växande kostnad → utvärdera kostnaden exakt vid gränsen $k$.
- "Greatest number within budget" eller "least number to reach a target" → lös olikheten och avrunda sedan nedåt respektive uppåt.
- "Distinct integers" plus en median eller en summa → packa de icke-eftersökta värdena konsekutivt från den snävaste gränsen.
- "$x + y$ is fixed, is $xy \le \dots$?" → produkten har taket $\left(\frac{S}{2}\right)^2$.
- "No one may have more than $k$ times any other" → $\min \ge \frac{M}{k}$; testa $M$ uppifrån.
- Intervall för två variabler, med extremvärde för $x - y$ eller $xy$ → hörnanalys; för en differens, ta motsatta ytterlägen.

## Trap gallery
- **Att maximera båda variablerna i en produkt.** För $3 \le a \le 8$ och $-5 \le b \le 2$ är minsta $ab$ lika med $8 \times (-5) = -40$, inte $3 \times (-5) = -15$; kontrollera alla fyra hörnen.
- **Att avrunda åt fel håll.** En budget som räcker till $\frac{175}{12} \approx 14{,}58$ månader köper $14$ månader, inte $15$; ett krav på ett minimum avrundas i stället uppåt.
- **Att glömma "distinct".** Att återanvända ett värde under medianen underskattar den reserverade summan och blåser upp ditt maximum.
- **Att ignorera det dolda golvet i förhållandeuppgifter.** Att sätta de övriga till det angivna minimivärdet kan bryta mot $\max \le k \cdot \min$; det verkliga golvet är $\frac{M}{k}$.
- **Att hoppa över tillåtlighetskontrollen.** Efter att du pressat till ytterläget: bekräfta att ordning, olikhet mellan värden, heltalighet och tak fortfarande gäller.
- **Teckenfel i vertexpunkten.** $-(x - h)^2 + k$ har maximum $k$, inte $h$; kvadraten kan bara dra ifrån.

## Speed moves
- **Utvärdera gränsen först.** För "at least 6 hours" med stigande kostnad, sätt in $h = 6$ direkt — inget annat fall kan vinna.
- **Dividera och avrunda med en enstegskontroll.** Minsta $n$ med $14n \ge 300$: $\frac{300}{14} \approx 21{,}4$, alltså $n = 22$; bekräfta att $14 \times 21 = 294$ inte räcker.
- **Bygg vittneslistan.** Skriv ner den ytterlägeslista du fått fram (som $1,2,3,4,10,11,12,13,79$) och summera den — snabbare och säkrare än ren algebra.
- **Hörnsvep.** Fyra snabba multiplikationer avgör varje fråga om intervallprodukter på under 30 sekunder.
- **Vertex via symmetri.** För $x^2 + bx + c$, hoppa till $x = -\frac{b}{2}$; i Data Sufficiency kräver minimivärdet både $b$ och $c$, så en konstant ensam är otillräcklig.

## Before you drill
1. Jag kan formulera motsatsprincipen och tillämpa den på en fast summa eller ett fast medelvärde på en rad.
2. Jag vet åt vilket håll jag ska avrunda: nedåt för "mest inom en gräns", uppåt för "minst för att nå ett mål".
3. Jag kontrollerar alla fyra hörnprodukterna innan jag påstår ett max eller min för $ab$.
4. Jag kan läsa av $\max$ och $\min$ för en andragradare direkt ur $x = -\frac{b}{2a}$ eller den kvadratkompletterade formen.
5. Jag översätter automatiskt "no more than $k$ times any other" till $\min \ge \frac{M}{k}$.
6. Jag packar olika heltal konsekutivt när jag minimerar resten av en lista.
7. Jag verifierar varje ytterlägesscenario mot alla villkor innan jag väljer ett svar.
