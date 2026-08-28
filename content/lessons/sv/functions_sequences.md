# Funktioner och talföljder: läs regeln och utnyttja dess struktur

## Why this matters

GMAT Focus Edition testar inte teorin om talföljder — det testar om du kan läsa en obekant regel och förvandla den till snabb aritmetik. På Q86-nivå gömmer de här frågorna ett tvåsekundersmönster (ett konstant avstånd, en cykel, en teleskoperande summa) inuti en skrämmande rekursionsformel, och hela poängen är att upptäcka det innan du börjar mala.

## The core ideas

1. **En funktion är en insättningsregel.** Om $f(x) = 3x + 2$ gäller $f(\text{vad som helst}) = 3(\text{vad som helst}) + 2$; nästlade former som $f(f(2))$ beräknas inifrån och ut.
2. **Symmetriregeln.** $f(x) = f(a - x)$ för alla $x$ betyder att indata som summerar till $a$ ger lika utdata — $x$ och $a - x$ ligger lika långt från $\frac{a}{2}$. Under $f(x) = f(6 - x)$ gäller $f(1) = f(5)$ gratis.
3. **Aritmetisk talföljd, explicit form.** $a_n = a_1 + (n-1)d$: term $n$ ligger $n - 1$ steg av storlek $d$ efter term $1$.
4. **Hoppa mellan två godtyckliga termer.** $a_m = a_k + (m - k)d$, eftersom index $k$ till index $m$ är $m - k$ mellanrum. Alltså *bestämmer två godtyckliga termer hela den aritmetiska följden* — det avgör de flesta Data Sufficiency-frågor här.
5. **Aritmetisk summa.** $S_n = \frac{n(a_1 + a_n)}{2}$: den genomsnittliga termen är medelvärdet av första och sista, och summan är medelvärde gånger antal.
6. **Geometrisk talföljd.** $a_n = a_1 \cdot r^{n-1}$, och mer användbart $a_m = a_k \cdot r^{m-k}$: $k$ indexsteg multiplicerar med $r^k$ — även med negativt $r$ och steg bakåt (division).
7. **Rekursiva regler: iterera eller invertera.** För ett litet målindex, räkna framåt. Givet en *senare* term, invertera steget: $a_{n+1} = ra_n + c$ blir $a_n = \frac{a_{n+1} - c}{r}$.
8. **Rekursioner med andradifferenser.** $a_{n+1} = 2a_n - a_{n-1} + c$ skrivs om till $a_{n+1} - a_n = (a_n - a_{n-1}) + c$: *mellanrummen* växer med exakt $c$, så mellanrummen är själva aritmetiska.
9. **Periodicitet.** Regler som $a_{n+1} = a_n - a_{n-1}$ går i cykel — den här med perioden $6$. Så snart två konsekutiva termer upprepas upprepas allt; reducera målindexet modulo perioden. Bonus: hela dess cykel summerar till $0$.
10. **Teleskopering.** $\frac{1}{n(n+1)} = \frac{1}{n} - \frac{1}{n+1}$, så $\sum_{n=1}^{N} \frac{1}{n(n+1)} = 1 - \frac{1}{N+1}$ — mittdelarna tar ut varandra. För $N = 10$: $\frac{10}{11}$.
11. **Att räkna termer med en olikhet.** Om $a_n = 4n + 3$ uppfyller termerna strikt mellan $30$ och $150$ olikheten $\frac{27}{4} < n < \frac{147}{4}$, alltså $n = 7$ till $36$: det är $36 - 7 + 1 = 30$ termer. Räkna heltal som sista minus första *plus ett*.
12. **Två sammanflätade scheman.** Händelser var $d_1$:e dag och var $d_2$:e dag sammanfaller på dagar som återkommer var $\operatorname{lcm}(d_1, d_2)$:e dag — lista för att hitta första gemensamma dagen och räkna sedan med idé 11.

## Worked examples

**Example 1**

*In an arithmetic sequence, the third term is $14$ and the eighth term is $39$. What is the twentieth term?*

1. Från index $3$ till index $8$ är $8 - 3 = 5$ mellanrum, och värdet stiger med $39 - 14 = 25$, alltså $d = \frac{25}{5} = 5$.
2. Från index $8$ till index $20$ är ytterligare $12$ mellanrum: $a_{20} = 39 + 12 \cdot 5 = 39 + 60 = 99$.

**Answer: 99**

**Example 2**

*In an online game, a player's token balance is updated at the end of each day: it is doubled, then a $14$-token fee is deducted. A player began with $T$ tokens, and after exactly $4$ updates her balance was $1{,}230$ tokens. What is $T$?*

1. Dagsregeln är $B \mapsto 2B - 14$. Eftersom vi känner *slutsaldot*, invertera den: föregående saldo är $\frac{B + 14}{2}$.
2. Stega bakåt fyra gånger: $\frac{1230 + 14}{2} = 622$, sedan $622 \to 318 \to 166 \to 90$.
3. Kontrollera framåt: $90 \to 166 \to 318 \to 622 \to 1230$. Det stämmer.

**Answer: 90**

**Example 3**

*A sequence is defined by $s_1 = 5$, $s_2 = 12$, and $s_{n+1} = s_n - s_{n-1}$ for every integer $n \ge 2$. What is the sum of the first $100$ terms?*

1. Generera termer tills mönstret upprepas: $5,\ 12,\ 7,\ -5,\ -12,\ -7$, sedan $s_7 = 5$, $s_8 = 12$ — två konsekutiva termer återkommer, alltså är perioden $6$.
2. Varje hel cykel summerar till $5 + 12 + 7 - 5 - 12 - 7 = 0$.
3. Eftersom $100 = 96 + 4$ bildar de första $96$ termerna $16$ hela cykler med totalen $0$; bara $s_{97}$ till $s_{100}$ återstår, lika med $s_1$ till $s_4$.
4. Summa $= 5 + 12 + 7 + (-5) = 19$.

**Answer: 19**

## Trigger cues

- "Each term after the first is [operation on the previous]" → skriv ner rekursionen och iterera.
- "Arithmetic sequence" plus två kända termer → hoppformeln $a_m = a_k + (m-k)d$; hoppa över $a_1$ om ingen frågar efter den.
- Data Sufficiency om en talföljd → räkna obekanta: två parametrar ($a_1$ och $d$, eller $a_1$ och $r$) kräver två oberoende uppgifter.
- "Doubled, then reduced by…" varje omgång, med *slutvärdet* givet → invertera steget och gå bakåt.
- Ett enormt index (term $75$, term $100$) med en rekursion av subtraktionstyp → leta efter en cykel; reducera indexet modulo perioden.
- $f(x) = f(a - x)$ → para ihop indata som summerar till $a$; axeln är $x = \frac{a}{2}$.
- Nämnare som $n(n+1)$ i en lång summa → dela upp i $\frac{1}{n} - \frac{1}{n+1}$ och teleskopera.
- "How many terms are between…" → olikhet på den explicita formeln, räkna sedan heltalen noggrant.
- Två återkommande händelser med olika cykellängder → sammanfallandena återkommer var $\operatorname{lcm}$ av mellanrummen.

## Trap gallery

- **Ett-fel i formeln:** att skriva $a_n = a_1 + nd$; åtgärd: term $n$ ligger $n - 1$ steg efter term $1$.
- **Staketstolpsräkning:** att kalla heltalen $7$ till $36$ för "$29$ termer"; antalet är $36 - 7 + 1 = 30$.
- **Teckenmissar med negativa kvoter:** om $r = -2$ och femte termen är $48$ är andra termen $\frac{48}{(-2)^3} = -6$, inte $6$.
- **Att iterera åt fel håll:** att tillämpa framåtregeln på en känd *senare* term i stället för att invertera den.
- **Att anta en cykel för tidigt:** ett upprepat värde är ingen period; två *konsekutiva* termer måste upprepas.
- **Symmetri som inte säger något:** under $f(x) = f(4 - x)$ är kunskap om $f(2)$ värdelös för $f(3)$, eftersom $x = 2$ är själva axeln; $f(1)$ fungerar, eftersom $f(3) = f(1)$.
- **Att svara med indexet i stället för termen** (eller tvärtom) — läs om ifall frågan gäller $n$ eller $a_n$.
- **Suddiga trösklar:** "exceeds $600$" är strikt; hitta första omgången då värdet passerar gränsen, inte bara når den.

## Speed moves

- **Hoppa, bygg inte om.** Två kända termer ger $d$ med en division: $a_3 = 14$ och $a_8 = 39$ betyder att fem mellanrum täcker $25$, alltså $d = 5$.
- **Summa = medelvärde gånger antal.** Elva termer från $9$ med $d = 4$: sista är $49$, summan är $11 \cdot \frac{9 + 49}{2} = 319$.
- **Slå ihop upprepad fördubbling.** Att fördubbla fyra gånger är en multiplikation med $2^4 = 16$; gör det ogjort med en enda division med $16$.
- **Räkna bara upp små iterationer.** "Least number of rounds": start i $25$, regeln $x \mapsto 2x - 10$, gränsen $300$ — att lista $40, 70, 130, 250, 490$ visar att omgång $5$ är den första förbi $300$.
- **Lita på nollsummecykeln.** I en summafråga över en periodisk regel: summera en cykel först — om den är $0$ reduceras en summa av $100$ termer till några få överblivna termer.
- **Kör svarsalternativen genom rekursionen.** När alternativen är startvärden, kör mittenalternativet genom regeln; åt vilket håll det missar visar var du ska leta.

## Before you drill

- Jag hoppar mellan aritmetiska termer med $a_m = a_k + (m-k)d$ och löser aldrig ut $a_1$ först.
- Jag kan båda summaformerna $S_n = \frac{n(a_1 + a_n)}{2} = \frac{n\left(2a_1 + (n-1)d\right)}{2}$ utantill.
- Givet $a_{n+1} = ra_n + c$ och en senare term inverterar jag till $\frac{a_{n+1} - c}{r}$ och går bakåt.
- Jag läser $a_{n+1} = 2a_n - a_{n-1} + c$ direkt som "mellanrummen växer med $c$".
- Ställd inför term $75$ i en märklig rekursion listar jag termer tills två konsekutiva värden upprepas och reducerar sedan indexet modulo perioden.
- Jag delar upp $\frac{1}{n(n+1)}$ i $\frac{1}{n} - \frac{1}{n+1}$ på synhåll; delsumman är $1 - \frac{1}{N+1}$.
- Jag räknar heltalen från $m$ till $n$ inklusive som $n - m + 1$, varje gång.
