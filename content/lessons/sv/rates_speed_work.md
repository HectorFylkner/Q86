# Hastighet, tempo och arbete: en enda ekvation i alla förklädnader

## Why this matters
Varje tempouppgift på GMAT Focus Edition — maskiner som fyller order, pumpar som fyller tankar, resenärer som hinner ifatt eller möts — är den enda identiteten $W = R \cdot T$ i olika kostymer. Provet testar detta från medelsvår nivå upp till de allra svåraste quantfrågorna, och i toppen lagras två eller tre moment (en som ansluter sent, ett enhetsbyte, ett svar i klockslag) i samma fråga. Behärska den lilla verktygslådan nedan så skalas lagren av ett i taget.

## The core ideas

1. **Huvudidentiteten.** $W = R \cdot T$ (arbete är tempo gånger tid), och för rörelse $d = s \cdot t$. Varje formel i det här kapitlet är den ekvationen löst för en annan bokstav, så om du glömmer en genväg: bygg om den härifrån.
2. **Ensamtiden definierar tempot.** "Ensam i konstant tempo blir $A$ klar på $T$ timmar" betyder $R_A = \frac{1}{T}$ jobb per timme. Det är sant per definition: ett helt jobb delat med $T$ timmar.
3. **Tempon adderas; tider gör det aldrig.** När arbetare kör samtidigt gäller $\frac{1}{T_{\text{tills}}} = \frac{1}{T_A} + \frac{1}{T_B}$. Det fungerar därför att högen färdigt arbete på en timme är summan av vars och ens bidrag.
4. **Genvägar för två arbetare.** Gemensam tid: $T_{\text{tills}} = \frac{ab}{a+b}$ (t.ex. ger $4$ och $12$ timmar $\frac{48}{16} = 3$ timmar). Att få ut en ensamtid ur en gemensam tid: $T_B = \frac{T_A \cdot T_{\text{tills}}}{T_A - T_{\text{tills}}}$ (tillsammans $4$, ensam $6$ ger $\frac{24}{2} = 12$, och mycket riktigt $\frac{1}{6} + \frac{1}{12} = \frac{1}{4}$). Båda är bara idé 3 omskriven.
5. **Etappvisa jobb: andelarna summerar till ett.** När arbetare börjar, slutar eller byter av: ge varje arbetare sina *egna* timmar och skriv $r_1 t_1 + r_2 t_2 + \dots = 1$. Hela jobbet är $1$, så bitarna måste täcka allt.
6. **Medelhastighet är total sträcka genom total tid** — aldrig medelvärdet av hastigheterna. För lika sträckor i hastigheterna $a$ och $b$: $s_{\text{medel}} = \frac{2ab}{a+b}$. Ut i $30$ och tillbaka i $60$ ger $\frac{3600}{90} = 40$, inte $45$, eftersom mer klocktid tillbringas i den låga hastigheten.
7. **Relativ hastighet slår ihop två rörliga till en.** Mot varandra: närmandehastighet $= a + b$. Samma riktning: gapet ändras med $a - b$. Sedan är $t = \frac{\text{gap}}{\text{relativ hastighet}}$. Löpare i $14$ och $9$ km/h öppnar ett gap på $10$ km på $\frac{10}{5} = 2$ timmar.
8. **Enhetstempo och enhetsdisciplin.** "Produces $360$ bottles in $3$ minutes" betyder $120$ flaskor per minut — behandla produktionstempon precis som arbetstempon. Innan någon räkning: tvinga in varje tid i en och samma enhet; ett försprång på $25$ minuter är $\frac{25}{60}$ timme, inte $25$ av något annat.

## Worked examples

**Example 1** *Working at its constant rate, filling line $A$ fills $360$ bottles in $3$ minutes, and working at its constant rate, filling line $B$ fills $360$ bottles in $4$ minutes. Working together at these rates, how many minutes do the two lines need to fill a total of $1{,}680$ bottles?*

1. Gör om varje linje till ett enhetstempo: $A$ fyller $\frac{360}{3} = 120$ flaskor per minut; $B$ fyller $\frac{360}{4} = 90$ flaskor per minut.
2. Tempon adderas: tillsammans fyller de $120 + 90 = 210$ flaskor per minut.
3. Tid $= \frac{W}{R} = \frac{1{,}680}{210} = 8$ minuter.

**Answer: 8 minutes**

**Example 2** *A courier van leaves a depot and travels along a straight highway at a constant $36$ kilometers per hour. Twenty-five minutes later, a car leaves the same depot along the same highway at a constant $54$ kilometers per hour. How many minutes after its own departure does the car catch the van?*

1. Försprång: på $25$ minuter $= \frac{25}{60}$ timme kör skåpbilen $36 \cdot \frac{25}{60} = 15$ km.
2. Närmandehastighet (samma riktning, alltså subtraktion): $54 - 36 = 18$ km/h.
3. Upphinnandetid $= \frac{\text{gap}}{\text{närmandehastighet}} = \frac{15}{18} = \frac{5}{6}$ timme $= 50$ minuter — räknat från bilens avfärd, precis vad som efterfrågades.

**Answer: 50 minutes**

**Example 3** *Working alone at their constant rates, Priya can build a software module in $10$ hours and Sam can build it in $15$ hours. They begin working together at 9:00 a.m. At 11:00 a.m. Priya leaves for a meeting, and Sam continues alone. At 1:00 p.m. Priya returns, and they work together until the module is complete. At what time is the module finished?*

1. Tempon: $R_P = \frac{1}{10}$, $R_S = \frac{1}{15}$, tillsammans $\frac{1}{10} + \frac{1}{15} = \frac{3+2}{30} = \frac{1}{6}$ modul per timme.
2. Etapp 1 (9:00–11:00, båda): $2 \cdot \frac{1}{6} = \frac{1}{3}$ klart.
3. Etapp 2 (11:00–13:00, Sam ensam): $2 \cdot \frac{1}{15} = \frac{2}{15}$ klart. Löpande summa: $\frac{5}{15} + \frac{2}{15} = \frac{7}{15}$.
4. Återstående arbete: $1 - \frac{7}{15} = \frac{8}{15}$, utfört tillsammans i $\frac{1}{6}$ per timme: $t = \frac{8/15}{1/6} = \frac{48}{15} = \frac{16}{5}$ timmar $= 3$ timmar $12$ minuter.
5. Sluttid: 13:00 $+$ 3 h 12 min $=$ 16:12.

**Answer: 4:12 p.m.**

## Trigger cues

- "Working together at their constant rates, how long…" → addera de enskilda tempona; för exakt två arbetare, hoppa till $\frac{ab}{a+b}$.
- "$X$ and $Y$ together take …; $X$ alone takes …" → subtrahera tempon: $R_Y = R_{\text{tills}} - R_X$.
- "Starts alone at …, joined at …, finished at …" → summera varje arbetares egna timmar och sätt sedan jobbandelarna lika med $1$.
- "Average speed for the round trip" → total sträcka genom total tid; lika etapper betyder $\frac{2ab}{a+b}$.
- "Leaves … later … catches up" → försprångets sträcka delat med *differensen* av hastigheterna.
- "Travel toward each other / how far apart" → en enda rörlig med *summan* (motsatta riktningar) eller *differensen* (samma riktning) av hastigheterna.
- "Produces $N$ units in $M$ minutes" → räkna ut enhetstempot per minut först och behandla det sedan som vilket tempo som helst.

## Trap gallery

- **Att ta medelvärdet av hastigheter.** Ut i $30$ och tillbaka i $60$ är $40$, inte $45$ — dividera alltid total sträcka med total tid.
- **Att addera tider i stället för tempon.** Två arbetare tillsammans är *snabbare* än var och en ensam; om din "tillsammans"-tid inte är mindre än den snabbaste ensamtiden: börja om.
- **Att tappa bort den som började tidigt.** När en andra maskin ansluter *fortsätter* den första — räkna dess fulla timmar från dess egen start till slutet.
- **Enhetsblandning.** Ett försprång angivet i minuter med hastigheter i km/h förgiftar tyst räkningen; konvertera först, räkna sedan.
- **Att svara från fel klocka.** "How long after *its own* departure" mot "after the first traveler left" mot "at what time" — läs om frågan innan du markerar.
- **Andel klar mot andel kvar.** Efter att du räknat ut $\frac{7}{15}$ klart behöver nästa etapp $\frac{8}{15}$; att räkna med fel av dem är ett planterat svarsalternativ.

## Speed moves

- **Produkt genom summa.** Två ensamtider $a, b$ → gemensam tid $\frac{ab}{a+b}$ direkt: $6$ och $12$ ger $\frac{72}{18} = 4$.
- **Ge jobbet en bekväm storlek.** Sätt tanken till MGM av ensamtiderna: ensamtiderna $6$ och $12$ → tanken $= 12$ enheter, tempona $2$ och $1$ enheter/timme — alla bråk försvinner.
- **Mall för tur och retur.** Lika sträckor → skriv $\frac{2ab}{a+b}$ utan att härleda den; eller välj en sträcka som $120$ km åt vardera hållet och dividera $240$ med totala timmar.
- **Kollapsa med relativ hastighet.** Frys den ena rörliga och ge den andra den sammanslagna (eller differerade) hastigheten; en jakt mellan två kroppar blir en division.
- **Begränsa innan du räknar.** Den gemensamma tiden för två arbetare ligger alltid mellan halva den snabbaste ensamtiden och hela den snabbaste ensamtiden — det eliminerar ofta tre svarsalternativ före all algebra.

## Before you drill

- Jag kan omvandla "ensam på $T$ timmar" till tempot $\frac{1}{T}$ utan att stanna upp.
- Jag adderar tempon — aldrig tider — för samtidiga arbetare, och kan $\frac{ab}{a+b}$ utantill.
- Givet en gemensam tid och en ensamtid kan jag få ut den andra ensamtiden genom att subtrahera tempon.
- För etappvisa jobb tilldelar jag varje arbetare sina egna timmar och tvingar andelarna att summera till $1$.
- Jag räknar medelhastighet som total sträcka genom total tid, och vet att lika etapper ger $\frac{2ab}{a+b}$.
- Jag väljer rätt relativ hastighet: summa vid närmande, differens vid jakt.
- Jag standardiserar enheter och kontrollerar *vilken* klocka och *vilken* andel frågan gäller.
