# Överlappande mängder: att räkna utan att dubbelräkna

## Why this matters

Frågor om överlappande mängder är ett fast inslag i GMAT Focus Quant, och på Q86-nivå kommer de klädda i ord: enkätresultat, anmälningar till workshoppar, medlemslistor. Matematiken är en eller två rena identiteter — svårigheten ligger i översättningshastigheten och i att veta vilken av den lilla formelfamiljen frågan pekar på. En väldrillad provtagare löser de flesta av dem på under 90 sekunder utan någon algebraisk risk.

## The core ideas

1. **Inklusion–exklusion för två mängder:** $|A \cup B| = |A| + |B| - |A \cap B|$. Att addera $|A|$ och $|B|$ räknar varje element i överlappet två gånger, så du drar bort det en gång.
2. **Ingendera-termen:** $T = |A| + |B| - \text{båda} + \text{ingendera}$. Totalen delas i "minst en" plus "ingendera", och "minst en" är exakt $|A \cup B|$.
3. **Genvägen "minst en":** om varje element tillhör minst en mängd är $\text{ingendera} = 0$ och $|A \cup B| = T$. En enda mening i frågan dödar en hel variabel.
4. **Den ena men inte den andra:** $|A \text{ endast}| = |A| - \text{båda}$. Att ta bort överlappet ur $A$ lämnar den del av $A$ som ligger utanför $B$.
5. **Exakt en av två mängder:** $|A| + |B| - 2 \cdot \text{båda}$. Varje mängd bidrar med sin "endast"-region, och överlappet måste skalas bort från var och en av de två mängderna separat.
6. **Tvåvägstabellen:** när en grupp delas av två oberoende ja/nej-egenskaper (bil mot ingen bil, distans mot på plats) — bygg ett $2 \times 2$-rutnät där varje rad och kolumn summerar till sina totaler. Varje ruta är bestämd så snart du har tre oberoende uppgifter, eftersom varje rad och kolumn är en enstegssubtraktion.
7. **Gränser för överlappet:** $\max(0,\ |A| + |B| - T) \le |A \cap B| \le \min(|A|, |B|)$. Överlappet är störst när den ena mängden ligger inuti den andra, och minst när de två mängderna breder ut sig för att fylla totalen.
8. **Union av tre mängder:** $|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$. De parvisa överlappen dubbelräknas av de enskilda mängderna, och trippelregionen adderas tre gånger och subtraheras tre gånger, så den måste återställas en gång.
9. **Tre mängder via exakta regioner:** låt $e_1, e_2, e_3$ räkna elementen i exakt en, exakt två respektive alla tre mängder. Då gäller $|A| + |B| + |C| = e_1 + 2e_2 + 3e_3$, eftersom ett element i $k$ mängder räknas $k$ gånger i summan av de enskilda. Tillsammans med $|A \cup B \cup C| = e_1 + e_2 + e_3$ ger det arbetshästidentiteten $$|A \cup B \cup C| = |A| + |B| + |C| - e_2 - 2e_3.$$
10. **Användbara härledda antal:** $\text{minst två} = e_2 + e_3$, och summan av de tre parvisa snitten är $e_2 + 3e_3$, eftersom trippelregionen ligger inuti alla tre parvisa överlapp.
11. **Procentversioner:** alla identiteter ovan gäller med procenttal eller andelar; sätt $T = 100$ så blir varje antal ett procenttal.

## Worked examples

**Example 1**

*A book club has $72$ members. This month, $41$ members read the mystery selection and $33$ read the science-fiction selection. If $11$ members read neither book, how many members read both?*

1. Antalet som läste minst en bok är $72 - 11 = 61$.
2. Inklusion–exklusion: $41 + 33 - \text{båda} = 61$.
3. Alltså $74 - \text{båda} = 61$, vilket ger $\text{båda} = 13$.
4. Rimlighetskontroll per region: bara deckare $= 41 - 13 = 28$, bara science fiction $= 33 - 13 = 20$, och $28 + 20 + 13 + 11 = 72$. Stämmer.

**Answer: 13**

**Example 2**

*A firm has $160$ employees: $100$ engineers and $60$ designers. Exactly $70$ employees work onsite and the rest work remotely. If the number of engineers who work onsite is three times the number of designers who work remotely, how many engineers work remotely?*

1. Två binära egenskaper (roll, plats) betyder tvåvägstabell. Totaler: ingenjörer $100$, designer $60$; på plats $70$, distans $160 - 70 = 90$.
2. Låt $d$ vara antalet designer som arbetar på distans. Då är ingenjörer på plats $= 3d$, och designer på plats $= 70 - 3d$.
3. Designerraden måste summera till $60$: $(70 - 3d) + d = 60$, alltså $70 - 2d = 60$ och $d = 5$.
4. Ingenjörer på plats $= 3(5) = 15$, alltså ingenjörer på distans $= 100 - 15 = 85$.
5. Kontrollera distanskolumnen: $85 + 5 = 90$. Stämmer.

**Answer: 85**

**Example 3**

*Each of the $150$ customers at a market stall bought at least one of three blends: coffee, tea, or cocoa. If $88$ bought coffee, $74$ bought tea, $62$ bought cocoa, and exactly $46$ customers bought exactly two of the blends, how many customers bought exactly one blend?*

1. Alla köpte minst en blandning, alltså $|C \cup T \cup K| = 150$.
2. Summan av de enskilda: $88 + 74 + 62 = 224$.
3. Tillämpa $|C \cup T \cup K| = \text{summa} - e_2 - 2e_3$: $\ 150 = 224 - 46 - 2e_3$.
4. Alltså $2e_3 = 28$ och $e_3 = 14$ kunder köpte alla tre.
5. Regionerna delar upp gruppen: $e_1 = 150 - e_2 - e_3 = 150 - 46 - 14 = 90$.
6. Kontrollera räkneidentiteten: $e_1 + 2e_2 + 3e_3 = 90 + 92 + 42 = 224$. Stämmer med summan av de enskilda.

**Answer: 90**

## Trigger cues

- "How many chose neither / both?" med två grupper och en total → tvåmängdsformeln $T = |A| + |B| - \text{båda} + \text{ingendera}$.
- "Every member belongs to at least one" → sätt $\text{ingendera} = 0$ direkt.
- Två ja/nej-egenskaper per person (äger/äger inte, distans/på plats) snarare än två aktiviteter → tvåvägstabell, inte Venndiagram.
- "Exactly one of the two" → räkna $|A| + |B| - 2 \cdot \text{båda}$.
- "Least possible / greatest possible" överlapp → gränserna $\max(0, |A|+|B|-T)$ och $\min(|A|,|B|)$.
- Tre namngivna grupper med formuleringar om "exactly two" eller "all three" → regionidentiteten $\text{summan av de enskilda} = e_1 + 2e_2 + 3e_3$.
- Procenttal utan angiven total → anta $T = 100$ och arbeta i procentenheter.

## Trap gallery

- Att glömma ingendera-gruppen: att lösa $|A| + |B| - \text{båda} = T$ när vissa element ligger utanför båda mängderna. Åtgärd: dra bort ingendera från totalen först.
- Att läsa "exactly two" som ett parvist snitt: $e_2$ utesluter trippelregionen, men $|A \cap B|$ inkluderar den. Åtgärd: de parvisa summorna är $e_2 + 3e_3$, inte $e_2$.
- Att svara "båda" när frågan gäller "$A$ men inte $B$" (eller tvärtom). Åtgärd: läs om målet innan du väljer; fällalternativet finns alltid med.
- Att dra bort överlappet en gång för "exakt en" i stället för två gånger. Åtgärd: exakt en $= |A| + |B| - 2\cdot\text{båda}$.
- Att Venndiagrammera en matrisuppgift: egenskaper som distans mot på plats är ömsesidigt uteslutande, så överlappslogiken gäller inte. Åtgärd: $2 \times 2$-rutnät med rad- och kolumnsummor.
- Att anta att överlappet är ett fast tal när bara gränser är bestämda. Åtgärd: om frågan säger "least" eller "greatest" optimerar du, du löser inte.

## Speed moves

- **Rutnät före algebra:** i matrisuppgifter, fyll varje ruta du kan med ren subtraktion innan du inför en variabel — ofta behöver bara en ruta algebra, som i Example 2 där en enda ekvation i $d$ avslutade uppgiften.
- **Enradig tvåmängdslösning:** räkna $\text{båda} = |A| + |B| + \text{ingendera} - T$ i ett svep; för Example 1 blir det $41 + 33 + 11 - 72 = 13$.
- **Sätt totalen till $100$ för procenttal:** givet att $50\%$ har $P$, $35\%$ har $Q$ och $30\%$ har ingendera, ta $T = 100$: båda $= 50 + 35 - 70 = 15$, alltså har $15/50 = 3/10$ av $P$-gruppen även $Q$.
- **Minsta överlapp med aritmetik, inte diagram:** med $|A| = 70$, $|B| = 55$ i en total på $100$ är minsta möjliga överlapp $70 + 55 - 100 = 25$ — ingen bild behövs.
- **Testa alternativen för "alla tre":** svarsalternativen för $e_3$ är små heltal; sätt in ett i $T = \text{summa} - e_2 - 2e_3$ och justera med jämnhetsresonemang i ett steg.
- **Regiongranskning som kontrollpunkt:** de exakta regionerna måste summera till totalen ($e_1 + e_2 + e_3 = $ minst en, plus ingendera $= T$); en tiosekunderskontroll fångar de flesta översättningsmissar.

## Before you drill

- Jag kan formulera inklusion–exklusion för två mängder och versionen med ingendera utan att tveka.
- Jag väljer mellan Venndiagram och tvåvägstabell utifrån frågans struktur, inte av vana.
- Jag kan ta fram "endast $A$", "exakt en" och "båda" ur $|A|$, $|B|$ och ytterligare en uppgift.
- Jag kan båda överlappsgränserna och vet när en fråga efterfrågar någon av dem.
- Jag kan skriva $|A|+|B|+|C| = e_1 + 2e_2 + 3e_3$ och förklara varför varje koefficient är den den är.
- Jag skiljer "exakt två" ($e_2$) från "minst två" ($e_2 + e_3$) och från ett parvist snitt.
- Jag verifierar alltid att mina regioner delar upp totalen innan jag bekräftar ett svar.
