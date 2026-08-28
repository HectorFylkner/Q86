# Andragradsuttryck och faktorisering: läs strukturen innan du löser

## Why this matters

GMAT Focus Edition testar andragradsuttryck som mönsterigenkänning, inte som "lös ut $x$"-sysslor. På Q86-nivå kommer andragradaren förklädd — en rektangels area, ett symmetriskt uttryck, ett Data Sufficiency-påstående med två rötter — och belönar den som ser den faktoriserade strukturen på sekunder. Varje fråga här faller på under två minuter med verktygslådan nedan.

## The core ideas

1. **Nollproduktregeln.** Om $pq = 0$ gäller $p = 0$ eller $q = 0$. Det är *därför* faktorisering löser andragradare: den förvandlar en svår ekvation till två lätta.
2. **Att faktorisera $x^2 + bx + c$.** Hitta två tal med produkten $c$ och summan $b$: $x^2 - 7x + 10 = (x - 2)(x - 5)$. Teckenlogik: positivt $c$ betyder faktorer med samma tecken (som stämmer med $b$); negativt $c$ betyder olika tecken, där den större faktorn tar $b$:s tecken.
3. **Vietas samband.** För $ax^2 + bx + c = 0$ med rötterna $r$ och $s$: $r + s = -\dfrac{b}{a}$ och $rs = \dfrac{c}{a}$, vilket syns när man expanderar $a(x - r)(x - s)$. Frågor om rötternas summa eller produkt kräver aldrig rötterna själva.
4. **Konjugatregeln.** $x^2 - y^2 = (x + y)(x - y)$, sant eftersom korstermerna tar ut varandra. Den omvandlar ett andragradsfaktum till två linjära.
5. **Kvadreringsregeln som trinom.** $(x \pm k)^2 = x^2 \pm 2kx + k^2$; känn igen dem på att konstanten är kvadraten på halva mittkoefficienten. Satt lika med noll har en jämn kvadrat exakt **en** rot — avgörande i Data Sufficiency.
6. **Identiteten för kvadrerad summa.** $(x \pm y)^2 = x^2 \pm 2xy + y^2$. Fallet $\left(x + \dfrac{1}{x}\right)^2 = x^2 + 2 + \dfrac{1}{x^2}$ dyker upp ständigt: om $x + \dfrac{1}{x} = 4$ gäller $x^2 + \dfrac{1}{x^2} = 4^2 - 2 = 14$, utan att något löses.
7. **Att räkna rötter med diskriminanten.** $ax^2 + bx + c = 0$ har två skilda reella rötter när $b^2 - 4ac > 0$, en dubbelrot när den är $0$, och ingen när den är negativ: $x^2 + 4x + 5 = 0$ har inga reella rötter eftersom $16 - 20 < 0$.
8. **Dividera aldrig med en variabel som kan vara noll.** Givet $x^2 = 7x$: faktorisera $x(x - 7) = 0$, alltså $x = 0$ eller $x = 7$. Att dividera med $x$ raderar tyst roten $x = 0$.
9. **Dra roten ur båda leden försiktigt.** $(x - a)^2 = k$ med $k > 0$ ger $x = a \pm \sqrt{k}$ — två värden, vars summa automatiskt är $2a$.

## Worked examples

**Example 1**

*If $x^2 + 3x - 40 = 0$ and $x > 0$, what is the value of $x$?*

1. Konstanten $-40$ är negativ, så faktorerna har olika tecken; $+3$ säger att den större faktorn är positiv.
2. Ett faktorpar till $40$ som skiljer sig med $3$: $8$ och $5$.
3. Faktorisera: $x^2 + 3x - 40 = (x + 8)(x - 5) = 0$, alltså $x = -8$ eller $x = 5$.
4. Villkoret $x > 0$ behåller bara $x = 5$.

**Answer: $5$**

**Example 2**

*A rectangular garden plot is $5$ meters longer than it is wide. If the plot's area is $84$ square meters, what is its width, in meters?*

1. Låt bredden vara $w$; då är längden $w + 5$ och arean ger $w(w + 5) = 84$.
2. Standardform: $w^2 + 5w - 84 = 0$.
3. Faktorer till $84$ med olika tecken som skiljer sig med $5$: $12$ och $7$, alltså $(w + 12)(w - 7) = 0$.
4. Rötterna är $-12$ och $7$; en bredd måste vara positiv, så $w = 7$. Kontroll: $7 \times 12 = 84$.

**Answer: $7$**

**Example 3**

*If $x^2 - 6x + 2 = 0$, what is the value of $x^4 - 12x^3 + 36x^2$?*

1. Att lösa direkt ger de irrationella rötterna $3 \pm \sqrt{7}$ — en signal om att frågan vill åt strukturen, inte rötterna.
2. Skriv om den givna ekvationen som $x^2 - 6x = -2$.
3. Känn igen målet som en jämn kvadrat: $x^4 - 12x^3 + 36x^2 = \left(x^2 - 6x\right)^2$.
4. Sätt in: $\left(x^2 - 6x\right)^2 = (-2)^2 = 4$. Båda rötterna ger samma värde.

**Answer: $4$**

## Trigger cues

- "What is the **sum** (or **product**) of the possible values of $x$?" → Vieta direkt; leta inte upp rötterna.
- "$x + y = \ldots$ and $x^2 - y^2 = \ldots$" → faktorisera och dividera: $x - y = \dfrac{x^2 - y^2}{x + y}$.
- "Length is $k$ more than width, area is $A$" → ställ upp $w(w + k) = A$, faktorisera, kasta den negativa roten.
- "$x + \dfrac{1}{x} = n$, find $x^2 + \dfrac{1}{x^2}$" → kvadrera det givna: svaret är $n^2 - 2$ (och $n^2 + 2$ för minusvarianten).
- "Has two **distinct integer** roots" med en fast konstantterm → lista konstantens faktorpar; de möjliga mittkoefficienterna är minus parens summor.
- En fjärdegradare byggd av en andragradare (Example 3) → isolera $x^2 + bx$ ur det givna och leta efter dess kvadrat i målet.
- "$x^2 = cx$" eller vilken ekvation som helst där varje term innehåller $x$ → bryt ut $x$; räkna med två svar, varav ett är $0$.

## Trap gallery

- **Att dividera med variabeln.** Att göra om $x^2 = 7x$ till $x = 7$ tappar $x = 0$; i Data Sufficiency förvandlar det "två värden" till ett falskt "tillräckligt". Åtgärd: faktorisera, dividera aldrig.
- **Att glömma den negativa roten.** $(x - 5)^2 = 36$ har lösningarna $11$ *och* $-1$; summan är $10$, inte $11$. Åtgärd: skriv $x - 5 = \pm 6$ varje gång.
- **Att svara med roten i stället för på frågan.** Andragradaren i Example 2 ger $w = 7$, men en tvillingfråga kunde ha bett om *längden* ($12$) eller omkretsen. Åtgärd: läs om den sista meningen innan du binder dig.
- **Att anta att två DS-påståenden måste stämma överens.** Påstående (1) kan ge $x \in \{0, 5\}$ och påstående (2) $x \in \{5, -6\}$; bara tillsammans tvingar de fram $x = 5$. Åtgärd: lös varje påstående fullständigt och snitta sedan.
- **Att ge ett jämnt kvadrattrinom två rötter.** $x^2 - 10x + 25 = 0$ betyder $(x - 5)^2 = 0$: exakt ett värde, vilket kan göra ett ensamt påstående tillräckligt. Åtgärd: kontrollera om $c = \left(\dfrac{b}{2}\right)^2$.
- **Teckenmissar i Vieta.** För $x^2 - 9x + 14 = 0$ är rotsumman $+9$, inte $-9$. Åtgärd: summan är *minus* mittkoefficienten (när $a = 1$).

## Speed moves

- **Arbeta baklänges från svarsalternativen.** För $x^2 + 3x - 40 = 0$ ger insättning av alternativet $x = 5$ att $25 + 15 - 40 = 0$ — klart, ingen faktorisering behövs.
- **Skanna faktorpar i textuppgifter.** "Area $84$, sidorna skiljer sig med $5$" → skanna faktorparen till $84$ ($6 \times 14$, $7 \times 12$, …) och ta paret med rätt gap: $7 \times 12$.
- **Konjugatregeln med primtal.** Om $x^2 - y^2 = 13$ (primtal) med positiva heltal $x, y$ tvingas $x - y = 1$ och $x + y = 13$ fram: $x = 7$, $y = 6$ direkt.
- **Förskjut rötterna utan att lösa.** Om $x^2 - 9x + 14 = 0$ har rötterna $2$ och $7$ har ekvationen med rötter $3$ större summan $15$ och produkten $50$: $x^2 - 15x + 50 = 0$. Vieta bygger den direkt.
- **Kvadrera det givna, lös det inte.** Varje uppgift med $x \pm \dfrac{1}{x}$ eller $x + y$ och ett kvadrerat mål: kvadrera den kända ekvationen och skriv om — att lösa ut $x$ slösar en minut.

## Before you drill

1. Jag kan faktorisera $x^2 + bx + c$ på under tio sekunder med produkt-och-summa plus teckenlogik.
2. Jag kan formulera Vietas formler och använda dem utan att hitta rötterna.
3. Jag expanderar $(x \pm y)^2$ och faktoriserar $x^2 - y^2$ på synhåll, i båda riktningarna.
4. Givet $x + \dfrac{1}{x}$ tar jag fram $x^2 + \dfrac{1}{x^2}$ genom kvadrering, inte genom att lösa.
5. Jag dividerar aldrig en ekvation med en variabel — jag flyttar över termer och faktoriserar i stället.
6. Jag tar fram båda värdena ur $(x - a)^2 = k$ och kontrollerar sedan vilka villkoren tillåter.
7. Jag kan avgöra från $b^2 - 4ac$ eller ett jämnt kvadratmönster om en andragradare låser fast ett enda värde på $x$ — det avgörande faktumet i de flesta DS-andragradare.
