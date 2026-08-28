# Kombinatorik: platser, kommittéer och restriktioner

## Why this matters

GMAT Focus räknefrågor är korta att formulera och brutala att gissa på: varje klassiskt misstag — att ordna ett oordnat urval, att glömma en faktor $2$, att dubbelräkna — landar exakt på ett felaktigt svarsalternativ. På Q86-nivå måste du översätta en textuppgift till platser eller ett urval på under 30 sekunder och hantera en eller två restriktioner rent. Matematiken är elementär; det som skiljer är disciplinen i uppställningen.

## The core ideas

1. **Multiplikationsprincipen.** Oberoende steg i följd med $m$, sedan $n$, sedan $p$ alternativ ger $m \cdot n \cdot p$ utfall — varje val paras med varje val i nästa steg. Ett *valfritt* steg lägger helt enkelt till ett "hoppa över"-alternativ: $4$ varmrätter, $3$ tillbehör och en valfri av $2$ desserter ger $4 \cdot 3 \cdot 3 = 36$ beställningar.
1. **Additionsprincipen.** Ömsesidigt uteslutande fall adderas: $N = N_1 + N_2 + \cdots$. Dela upp i fall endast när de inte kan överlappa.
1. **Permutationer av $n$ olika föremål.** $n!$ arrangemang — $n$ val till första platsen, $n-1$ till nästa, och så vidare.
1. **Arrangemang av $k$ ur $n$.** $P(n,k) = \dfrac{n!}{(n-k)!} = n(n-1)\cdots(n-k+1)$ — platslogik som stannar efter $k$ platser.
1. **Kombinationer (ordningen spelar ingen roll).** $\dbinom{n}{k} = \dfrac{n!}{k!\,(n-k)!}$ — varje oordnad grupp om $k$ dyker upp $k!$ gånger bland de ordnade listorna, så dividera bort det.
1. **Ordningstestet.** Byt plats på två valda föremål: om utfallet ändras (rangordningar, koder, skyltningar) — använd $P$ eller platslogik; om inte (kommittéer, lag) — använd $\binom{n}{k}$.
1. **Upprepade identiska föremål.** Antalet arrangemang av $n$ föremål med identiska grupper av storlekarna $a, b, \ldots$ är $\dfrac{n!}{a!\,b!\cdots}$ — att byta plats på identiska kopior ändrar ingenting. Siffrorna $1,1,2,2,3$ ger $\dfrac{5!}{2!\,2!} = 30$ heltal, inte $120$.
1. **Urval med kvoter.** "Exakt $j$ av typ X" betyder att du väljer varje roll för sig och multiplicerar: $\binom{x}{j}\binom{y}{k-j}$.
1. **Limmetoden.** "Måste stå intill varandra" betyder att du tejpar ihop paret till ett block, arrangerar blocken och sedan multiplicerar med blockets inre ordningar ($2!$ för ett par — om inte den inre ordningen är bestämd, då multiplicerar du med $1$).
1. **Komplementräkning.** $\text{giltiga} = \text{totalt} - \text{förbjudna}$ — snabbfilen för "minst en" (dra bort nollfallet) och "inte intill varandra" (dra bort det limmade antalet).
1. **Hårdaste restriktionen först.** Fyll den mest begränsade platsen före de fria så att varje plats antal förblir rent. En $4$-siffrig kod utan upprepningar och med en första siffra skild från noll: $9 \cdot 9 \cdot 8 \cdot 7 = 4536$.
1. **Vägar i rutnät.** Att gå enbart öster/norr med $m$ öster- och $n$ norrsteg är att arrangera strängen $EE\ldots NN\ldots$: $\dbinom{m+n}{m}$ vägar. Fyra öster, tre norr: $\binom{7}{3} = 35$.
1. **Stjärnor och streck.** Antalet positiva heltalslösningar till $x_1 + \cdots + x_k = n$ är $\dbinom{n-1}{k-1}$ — ställ upp $n$ enheter och välj $k-1$ av de $n-1$ mellanrummen för avdelare. För $x + y + z = 12$: $\binom{11}{2} = 55$. Icke-negativa lösningar i stället: $\binom{n+k-1}{k-1}$.

## Worked examples

**Example 1** *A raffle ticket carries a $5$-digit number. The first digit cannot be $0$, no digit repeats, and the last digit must be $5$. How many ticket numbers are possible?*

1. Rangordna restriktionerna: sista platsen är bestämd, första platsen är dubbelt begränsad, de mellersta tre är fria. Fyll i den ordningen.
1. Sista platsen: måste vara $5$, alltså $1$ sätt.
1. Första platsen: vilken siffra som helst utom $0$ och utom den använda $5$:an, alltså $8$ sätt.
1. De tre mellersta platserna: $8$ siffror återstår, sedan $7$, sedan $6$.
1. Multiplicera: $1 \cdot 8 \cdot 8 \cdot 7 \cdot 6 = 2688$.

**Answer: 2688**

**Example 2** *A startup selects a $5$-person launch team from $7$ developers and $4$ marketers. If the team must include at least one marketer, how many different teams are possible?*

1. Lagen är oordnade, alltså kombinationer. "At least one" skriker komplement: räkna alla lag och dra bort de marknadsförarfria.
1. Totalt antal lag: $\binom{11}{5} = \dfrac{11 \cdot 10 \cdot 9 \cdot 8 \cdot 7}{120} = 462$.
1. Lag med enbart utvecklare: $\binom{7}{5} = \binom{7}{2} = 21$.
1. Subtrahera: $462 - 21 = 441$. En direkt summa över fyra fall ($140 + 210 + 84 + 7$) bekräftar det.

**Answer: 441**

**Example 3** *Seven singers stand in a row for a photo. Ana and Ben insist on standing next to each other, while Cara and Dev refuse to stand next to each other. How many lineups are possible?*

1. Limma ihop "tillsammans"-paret; hantera "isär"-paret med komplement.
1. Limma ihop Ana och Ben till ett block: $6$ enheter arrangeras på $6! = 720$ sätt, gånger $2!$ inre ordningar, alltså $2 \cdot 720 = 1440$ uppställningar där de står intill varandra.
1. Ta bort de uppställningar där Cara och Dev *också* står intill varandra. Limma ihop dem också: $5$ enheter, $5! = 120$ arrangemang, gånger $2$ per block: $2 \cdot 2 \cdot 120 = 480$.
1. Subtrahera: $1440 - 480 = 960$.

**Answer: 960**

## Trigger cues

- "How many codes / ID numbers / sequences, no repeats" → platsmetoden, hårdaste restriktionen först.
- "Committee / team / group of $k$" → kombinationer; ordningstestet bekräftar att ordningen är irrelevant.
- "Exactly one designer", "exactly two seniors" → kombinationer per roll multiplicerade med varandra.
- "At least one" → komplement: totalt minus nollfallet.
- "Must sit together / consecutive / side by side" → limma ihop paret, arrangera blocken, multiplicera med de inre ordningarna.
- "Refuse to be adjacent / cannot be consecutive" → totalt minus limmat.
- "$A$ immediately to the left of $B$" → limma med fast inre ordning: $5!$ för sex bokstäver, ingen faktor $2$.
- "Arrange all the digits/letters of ..." med upprepningar → $n!$ genom fakulteterna av upprepningsantalen.
- "Walking only east or north on a grid" → arrangera ett ord av $E$:n och $N$:n: $\binom{m+n}{m}$.
- "Ordered triples of positive integers with $x+y+z = n$" → stjärnor och streck, $\binom{n-1}{k-1}$.

## Trap gallery

- **Att ordna en kommitté.** Att använda $P(n,k)$ för ett oordnat lag blåser upp antalet med $k!$; kör ordningstestet först.
- **Den saknade (eller överflödiga) $2$:an.** Ett limmat par behöver $\times\,2!$ när båda ordningarna är tillåtna — och *ingen* faktor när uppgiften låser ordningen ("immediately to the left of").
- **"At least one" genom att tvinga in en.** Att välja en obligatorisk sjuksköterska och sedan valfria $3$ av de återstående $8$ ger $3 \cdot 56 = 168$ — lag med två eller fler sjuksköterskor dubbelräknas. Det korrekta antalet är $\binom{9}{4} - \binom{6}{4} = 111$; använd komplementet.
- **Identiska behandlade som olika.** Att arrangera $1,1,2,2,3$ som $5! = 120$ i stället för $30$; dividera med upprepningarna.
- **Fel variant av stjärnor och streck.** Antalet positiva lösningar till $x+y+z=12$ är $\binom{11}{2} = 55$, inte det icke-negativa antalet $\binom{14}{2} = 91$; kontrollera om noll är tillåtet.
- **Restriktioner hanterade sist.** Att fylla fria platser först tvingar fram röriga falluppdelningar; den hårdast begränsade platsen går först.
- **Rutnätsvägar genom att multiplicera dimensionerna.** En vandring med $4$ öster- och $3$ norrsteg har $\binom{7}{3} = 35$ vägar, inte $4 \cdot 3 = 12$.

## Speed moves

- **Räkna $\binom{n}{k}$ genom förkortning, aldrig med hela fakulteter:** $\binom{9}{4} = \dfrac{9 \cdot 8 \cdot 7 \cdot 6}{24} = 126$ på en rad.
- **Symmetri vid en enda förbjuden plats:** om kemin inte får ligga först av fyra pass fungerar $3$ av $4$ positioner, alltså $\frac{3}{4} \cdot 4! = 18$ — inga fall.
- **Krymp $k$ med $\binom{n}{k} = \binom{n}{n-k}$:** $\binom{11}{9}$ är egentligen $\binom{11}{2} = 55$.
- **En subtraktion slår fyra fall:** "at least one marketer" i Example 2 är $462 - 21$, inte en summa med fyra termer.
- **Testa reglerna på en pyttemodell:** osäker på om paret behöver $\times 2$? Lista alla $6$ arrangemang av $3$ personer för hand på tio sekunder.
- **Obligatorisk medlem i ett ordnat urval:** placera den först — en sekvens om $4$ olika bokstäver ur $6$ som måste innehålla $P$: $4$ positioner för $P$ gånger $5 \cdot 4 \cdot 3 = 240$.

## Before you drill

- Jag kör ordningstestet för att välja mellan $P(n,k)$ och $\binom{n}{k}$ innan jag rör några tal.
- Jag fyller den hårdast begränsade platsen först i varje kod- eller placeringsuppgift.
- Jag limmar ihop intilliggande par, och jag vet exakt när faktorn $2!$ gäller.
- Jag omvandlar automatiskt "at least one" och "not adjacent" till komplement.
- Jag dividerar med fakulteterna av upprepningsantalen när jag arrangerar identiska föremål.
- Jag känner igen rutnätsvägar och heltalssummor som arrangemang av multimängder: $\binom{m+n}{m}$ och $\binom{n-1}{k-1}$.
- Jag räknar binomialkoefficienter genom förkortning och dubbelkollar svåra antal med en andra metod.
