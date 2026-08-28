# Olikheter: teckendisciplin, ändpunktstestning och begränsning

## Why this matters

Olikheter dyker upp på GMAT Focus Edition i alla förklädnader: ren algebra, tröskelvärdesuppgifter, intervallfrågor och "must be true"-logik. På Q86-nivå testar provet sällan om du kan isolera $x$ — det testar om du håller reda på tecken, vet var extremvärdena bor, och kan begränsa ett uttryck utan att lösa något exakt.

## The core ideas

1. **Addera eller subtrahera vad som helst.** Om $a > b$ gäller $a + c > b + c$ för varje reellt $c$ — att förskjuta båda leden bevarar avståndet mellan dem.
2. **Multiplicera eller dividera med ett positivt tal: ordningen består. Med ett negativt: ordningen vänder.** Om $a > b$ och $c < 0$ gäller $ac < bc$, eftersom en negativ multiplikator speglar tallinjen genom $0$.
3. **Multiplicera eller dividera aldrig med ett uttryck vars tecken är okänt.** Givet $\frac{a}{b} > 1$ kan du inte dra slutsatsen $a > b$ om inte $b > 0$; dela upp i fall eller flytta allt till ena sidan.
4. **Olikheter åt samma håll adderas; de subtraheras aldrig.** Om $a > b$ och $c > d$ gäller $a + c > b + d$. För att "subtrahera": skriv om $c > d$ som $-d > -c$ och addera.
5. **Extremvärden för $x + y$ och $x - y$ kommer från motsatta hörn.** $\max(x - y) = \max(x) - \min(y)$, eftersom ett större $y$ minskar $x - y$.
6. **Extremvärden för $xy$ och $\frac{x}{y}$ kommer från de fyra ändpunktsparen.** Med fast $x$ är $xy$ linjärt i $y$, så extremvärdena ligger i ändpunkterna; testa alla fyra paren. För $\frac{x}{y}$ måste $y$-intervallet utesluta $0$.
7. **Inverterna vänder ordningen inom ett och samma tecken.** Om $0 < a < b$ eller $a < b < 0$ gäller $\frac{1}{a} > \frac{1}{b}$. Om ett intervall grenslar $0$ blir dess invertbild *två strålar*, en från varje sida.
8. **Rationella och faktoriserade olikheter: teckenschema.** För $\frac{x-5}{x+1} < 0$: markera $x = 5$ (nollställe) och $x = -1$ (odefinierat) och läs sedan av tecknen på varje bit: negativt precis på $-1 < x < 5$. Tecknen växlar över enkla rötter.
9. **Kvadrater är aldrig negativa:** $t^2 \ge 0$, med likhet endast vid $t = 0$. Kvadratkomplettering, $x^2 + bx = \left(x + \frac{b}{2}\right)^2 - \frac{b^2}{4}$, förvandlar ett andragradsvillkor till ett begränsat område.
10. **AM–GM:** för $a, b > 0$ gäller $a + b \ge 2\sqrt{ab}$, med likhet precis när $a = b$ — det är $(\sqrt{a} - \sqrt{b})^2 \ge 0$ omskrivet. Följdsats: om $0 < a < b$ och $ab = k$ gäller $a < \sqrt{k} < b$.
11. **Att räkna heltal:** om det lösta intervallet är $a \le n \le b$ med heltalsgränser är antalet $b - a + 1$. Isolera $n$ innan du räknar.
12. **Strikta trösklar rundar uppåt förbi gränsen.** Det minsta heltalet med $n > c$ är $\lfloor c \rfloor + 1$; när $c$ är ett heltal är svaret $c + 1$, inte $c$.
13. **Maximum av $x + y$ över skivan $(x-h)^2 + (y-k)^2 \le r^2$ är $h + k + r\sqrt{2}$** — linjen $x + y = c$ rör cirkeln sist i riktningen $\left(\tfrac{1}{\sqrt{2}}, \tfrac{1}{\sqrt{2}}\right)$.

## Worked examples

**Example 1**

*A courier earns $\$14$ per delivery plus a $\$26$ stipend per shift. What is the least number of deliveries the courier must make in one shift to earn more than $\$250$ for that shift?*

1. Låt $d$ vara antalet leveranser. Villkoret är $14d + 26 > 250$.
2. Subtrahera $26$: $14d > 224$, alltså $d > 16$.
3. Olikheten är strikt, och $d = 16$ ger exakt $14(16) + 26 = 250$ — inte *mer än* $\$250$. Alltså $d = 17$.
4. Kontroll: $14(17) + 26 = 264 > 250$. **Answer: 17**

**Example 2**

*If $-5 \le a \le 2$ and $-3 \le b \le 6$, what is the least possible value of $ab$?*

1. Extremvärden för $ab$ inträffar i ändpunktspar; testa alla fyra.
2. $(-5)(-3) = 15$, $(-5)(6) = -30$, $(2)(-3) = -6$, $(2)(6) = 12$.
3. Det minsta är $-30$: den mest negativa produkten parar ihop de största beloppen med *motsatta* tecken. **Answer: $-30$**

**Example 3**

*For real numbers $x$ and $y$, $x^2 - 8x + y^2 + 2y \le -8$. What is the maximum possible value of $x + y$?*

1. Kvadratkomplettera båda: $x^2 - 8x = (x-4)^2 - 16$ och $y^2 + 2y = (y+1)^2 - 1$.
2. Villkoret blir $(x-4)^2 + (y+1)^2 - 17 \le -8$, dvs. $(x-4)^2 + (y+1)^2 \le 9$ — en skiva med centrum i $(4, -1)$ och radien $3$.
3. Utgå från centrumvärdet $4 + (-1) = 3$; att förflytta sig avståndet $3$ i riktningen $\left(\tfrac{1}{\sqrt{2}}, \tfrac{1}{\sqrt{2}}\right)$ lägger till $\tfrac{3}{\sqrt{2}} + \tfrac{3}{\sqrt{2}} = 3\sqrt{2}$.
4. Maximum, som antas i $\left(4 + \tfrac{3}{\sqrt{2}},\ -1 + \tfrac{3}{\sqrt{2}}\right)$, är $3 + 3\sqrt{2}$. **Answer: $3 + 3\sqrt{2}$**

## Trigger cues

- "Which of the following describes all possible values of $x$" efter en linjär olikhet → isolera $x$; vänd symbolen i samma ögonblick du dividerar med ett negativt tal.
- Intervall för två variabler, med fråga om största eller minsta värdet av en kombination → ändpunktstestning (fyra par för $xy$ och $\frac{x}{y}$).
- "Least number of ... so that ... is more than ..." → strikt olikhet; lös och stega sedan *förbi* gränsheltalet.
- Ett rationellt uttryck jämfört med $0$ → teckenschema över de kritiska punkterna; rensa aldrig bort nämnaren.
- "Must be true" med påståendena I, II, III → bevisa vad du kan; angrip resten med gränsvärden.
- $x^2$ och $y^2$ med linjära termer under ett $\le$ → kvadratkomplettera och läs av en skiva.
- "How many integers $n$ satisfy ..." → isolera $n$ först, räkna sedan $b - a + 1$.
- "Is $a > b$?" med en given kvot som $\frac{a}{b}$ → nämnarens tecken är hela frågan.

## Trap gallery

- **Att glömma vändningen:** $-3x \ge 12$ ger $x \le -4$, inte $x \ge -4$. Åtgärd: varje division med ett negativt tal vänder symbolen.
- **Att korsmultiplicera blint:** $\frac{a}{b} > 1$ med $a = -3$, $b = -2$ ger $\frac{a}{b} = 1{,}5$ trots att $a < b$. Åtgärd: ta reda på nämnarens tecken först.
- **"Minst gånger minst":** i Example 2 är $(-5)(-3) = 15$ *maximum*. Åtgärd: kör alla fyra ändpunktsprodukterna.
- **Att subtrahera olikheter:** $a > b$ och $c > d$ säger ingenting om $a - c$ mot $b - d$. Åtgärd: negera den ena och addera sedan.
- **Att invertera över noll:** $-\tfrac{1}{3} \le x < \tfrac{1}{2}$ (med $x \ne 0$) avbildas på $\frac{1}{x} \le -3$ eller $\frac{1}{x} > 2$, inte ett enda intervall. Åtgärd: dela vid $0$ först.
- **Att stanna vid gränsen:** $d > 16$ betyder $17$; att träffa målet exakt är inte att vara "more than" det. Åtgärd: läs om strikt mot icke-strikt.
- **Att inkludera en utesluten punkt:** i $\frac{x-5}{x+1} < 0$ är $x = -1$ odefinierat, aldrig en lösning. Åtgärd: markera nämnarens nollställen som hål.

## Speed moves

- **Ändpunktsrutnät:** för intervall av produkter eller kvoter, skriv ner de fyra hörnvärdena och ringa in extremvärdet — tjugo sekunder, ingen teori.
- **Testa alternativen vid gränsen:** för tröskeluppgifter, sätt in mittenalternativet i uttrycket; en jämförelse visar åt vilket håll du ska gå.
- **Bekväma tal vid extremvärdena:** för "must be true"-frågor, testa värden tätt intill gränsen (som $a$ strax under $\sqrt{k}$) — motexemplen bor vid kanterna.
- **Omvandla, räkna sedan:** $-7 \le 2n + 3 < 11$ blir $-5 \le n < 4$, alltså $n \in \{-5, \dots, 3\}$: det är $3 - (-5) + 1 = 9$ heltal, utan att något listas.
- **Omedelbar kvadratkomplettering:** halvera den linjära koefficienten och kvadrera: $x^2 - 8x$ behöver $+16$, $y^2 + 2y$ behöver $+1$. Gör det i huvudet innan du rör konstanten.

## Before you drill

- Jag vänder olikhetstecknet automatiskt vid multiplikation eller division med ett negativt tal.
- Jag multiplicerar aldrig med ett variabeluttryck vars tecken är okänt — jag delar upp i fall eller använder teckenschema.
- Jag hittar extremvärden för $x \pm y$, $xy$ och $\frac{x}{y}$ ur intervall genom att testa kombinationer av ändpunkter.
- Jag delar intervall vid $0$ innan jag inverterar.
- Jag vet att strikta "more than"-trösklar utesluter gränsen, och jag kontrollerar likhetsfallet.
- Jag kan kvadratkomplettera i ett steg och känna igen $(x-h)^2 + (y-k)^2 \le r^2$ som en skiva.
- Jag kan formulera AM–GM med dess likhetsvillkor och tillämpa den på positiva tal med fast produkt.
