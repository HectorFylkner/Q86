---
title: "Integritetspolicy"
updated: "2026-08-28"
---

Den här policyn beskriver vilka personuppgifter Q86 behandlar, varför, hur länge, och vilka rättigheter du har enligt dataskyddsförordningen (GDPR).

## Personuppgiftsansvarig

Personuppgiftsansvarig för behandlingen är företaget bakom Q86. Företagsnamn, organisationsnummer och postadress fylls i innan tjänsten lanseras publikt. Kontakt i dataskyddsfrågor sker till adressen längst ned på den här sidan.

## Vilka uppgifter behandlas

**Kontouppgifter.** E-postadress, ett lösenord som bara sparas som en kryptografisk hash (scrypt, aldrig i klartext), valfritt namn, valt språk och när kontot skapades. Om du loggar in med Google sparas dessutom Googles interna användaridentifierare, så att inloggningen kan kopplas till rätt konto. Vi hämtar inte din Google-profilbild eller dina kontakter.

**Träningsdata.** Dina försök på frågor, hur lång tid varje försök tog, vilken säkerhetsnivå du angav, den feltyp du markerade, dina anteckningar i genomgångar, din repetitionskö, dina minneskort, dina inställningar och ditt provdatum om du anger ett. Detta är kärnan i tjänsten: utan den kan ingen plan räknas fram.

**Importerade score reports.** Om du importerar ett resultat sparas de siffror du matar in eller klistrar in. Ladda inte upp filer med uppgifter du inte vill spara.

**Betalningsuppgifter.** Q86 tar aldrig emot och sparar aldrig kortnummer. Betalning sker hos Stripe, som är eget personuppgiftsansvarig för korttransaktionen. Vi sparar Stripes kund-id, prenumerationens status och när den löper ut.

**Teknisk data.** Serverloggar med IP-adress och tidpunkt, i den utsträckning värdplattformen skapar dem. Analys, om du samtycker till den, är anonym och kopplas inte till ditt konto.

## Rättslig grund

- **Avtal (art. 6.1 b).** Konto, inloggning, träningsdata och betalningshantering — utan dem kan tjänsten inte levereras.
- **Rättslig förpliktelse (art. 6.1 c).** Bokföring av köp, enligt bokföringslagen.
- **Berättigat intresse (art. 6.1 f).** Säkerhetsloggar och skydd mot missbruk.
- **Samtycke (art. 6.1 a).** Analys utöver det nödvändiga. Du kan när som helst ta tillbaka samtycket via cookie-inställningarna i sidfoten.

## Cookies

Q86 sätter två nödvändiga cookies: en sessionscookie som håller dig inloggad, och en cookie som minns ditt språkval. Nödvändiga cookies kräver inte samtycke enligt lagen om elektronisk kommunikation.

Analys aktiveras först om du klickar "Godkänn analys". Innan dess laddas inget analysskript alls — banderollen blockerar det, den döljer det inte.

## Hur länge uppgifterna sparas

Kontouppgifter och träningsdata sparas så länge kontot finns. Raderar du kontot tas de bort permanent, utan väntetid. Bokföringsunderlag för genomförda köp sparas i sju år enligt bokföringslagen och kan därför inte raderas på begäran — det gäller själva transaktionen, inte din träningsdata.

## Vem uppgifterna delas med

Uppgifterna säljs aldrig och används aldrig för annonsering. De behandlas av följande underbiträden, i den utsträckning tjänsten kräver det:

- **Stripe** (betalning) — eget ansvar för korttransaktionen.
- **Turso / libSQL** (databasdrift).
- **Värdplattform för applikationen** (drift och serverloggar).
- **E-postleverantör** för transaktionsmejl, till exempel återställning av lösenord.

Överföringar utanför EU/EES sker bara med giltig överföringsmekanism, i praktiken EU-kommissionens standardavtalsklausuler.

## Dina rättigheter

Du har rätt till **tillgång**, **rättelse**, **radering**, **begränsning**, **dataportabilitet** och **invändning**. Två av dem finns direkt i produkten och kräver inget mejl:

- **Ladda ner dina uppgifter.** Under Konto finns en export i JSON-format med allt kontot innehåller.
- **Radera kontot.** Under Konto, och raderingen är omedelbar och permanent.

Övriga rättigheter utövas genom kontakt på adressen nedan. Du har också rätt att klaga till Integritetsskyddsmyndigheten (IMY).

## Säkerhet

Lösenord lagras som scrypt-hashar med slumpat salt. Sessioner lagras som SHA-256-summor, aldrig som den token som ligger i din webbläsare. Varje databasfråga är knuten till ditt konto genom en central spärr, inte genom att varje enskild kodrad kommer ihåg att filtrera.

## Ändringar

Ändras policyn uppdateras datumet överst. Väsentliga ändringar meddelas via e-post till registrerade konton.
