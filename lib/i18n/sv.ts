/**
 * Swedish message catalog — the source of truth for the key set (ADR 0004).
 *
 * The exam-fidelity boundary runs through this file. Question stems,
 * answer choices and Data Sufficiency statements are never here: they live
 * in the verified bank and stay in English, because the exam is in
 * English. GMAT terminology stays English inside Swedish sentences —
 * "Data Sufficiency", "Problem Solving", "Quantitative Reasoning",
 * "Review & Edit" — because that is what the candidate will meet on test
 * day and in every official document.
 */
export const sv = {
  common: {
    save: "Spara",
    saving: "Sparar…",
    saved: "Sparat.",
    cancel: "Avbryt",
    close: "Stäng",
    back: "Tillbaka",
    next: "Nästa",
    retry: "Försök igen",
    loading: "Laddar…",
    error: "Något gick fel.",
    of: "av",
    all: "Alla",
    none: "Inga",
    optional: "valfritt",
    minutes: "min",
    questions: "frågor",
    question: "fråga",
    correct: "Rätt",
    wrong: "Fel",
    accuracy: "Träffsäkerhet",
    averageTime: "Snittid",
    attempts: "försök",
    today: "i dag",
    day: "dag",
    days: "dagar",
  },

  nav: {
    primary: "Huvudmeny",
    quickAccess: "Snabbmeny",
    today: "I dag",
    learn: "Lär",
    drill: "Träna",
    timed: "På tid",
    review: "Repetera",
    trainers: "Verktyg",
    progress: "Utveckling",
    stats: "Statistik",
    account: "Konto",
    signOut: "Logga ut",
    tagline: "målet är namnet",
    sectionLabel: "Avsnitt",
  },

  theme: {
    label: "Tema",
    auto: "Auto",
    night: "Natt",
    paper: "Papper",
    hint:
      "Tema: Auto följer systemet, Natt är det mörka skrivbordet, Papper är " +
      "provets ljusa standard",
  },

  locale: {
    label: "Språk",
    switchTo: "Byt till {language}",
    note:
      "Frågor, svarsalternativ och Data Sufficiency-påståenden är alltid på " +
      "engelska — precis som på provet.",
  },

  footer: {
    disclaimer:
      "Q86 är en oberoende tjänst utan koppling till GMAC. GMAT™ och GMAT " +
      "Focus Edition™ är varumärken som tillhör GMAC. Kalibrering sker mot " +
      "officiellt GMAC-material; plattformen tränar, officiella " +
      "provsimuleringar mäter.",
  },

  taxonomy: {
    skill: {
      rates_ratio_percent: "Hastighet, kvot och procent",
      value_order_factors: "Värde, ordning och faktorer",
      equal_unequal_alg: "Ekvationer, olikheter och algebra",
      counting_sets_series_prob_stats:
        "Kombinatorik, mängder, serier, sannolikhet och statistik",
    },
    skillShort: {
      rates_ratio_percent: "Kvot/procent",
      value_order_factors: "Värde/faktorer",
      equal_unequal_alg: "Algebra",
      counting_sets_series_prob_stats: "Kombinatorik/statistik",
    },
    subtopic: {
      prime_factorization: "Primtalsfaktorisering",
      divisibility_gcf_lcm: "Delbarhet, SGD och MGM",
      remainders_units_digits: "Rester och entalssiffror",
      parity_signs: "Jämnhet och tecken",
      consecutive_evenly_spaced: "Följder med jämna steg",
      exponents_roots_properties: "Potens- och rotregler",
      abs_value_number_line_decimals: "Absolutbelopp, tallinje och decimaler",
      must_be_true_testing: "Testa must-be-true",
      linear_systems: "Linjära ekvationssystem",
      quadratics_factoring: "Andragradare och faktorisering",
      inequalities: "Olikheter",
      functions_sequences: "Funktioner och talföljder",
      algebraic_translation: "Översättning till algebra",
      min_max_optimization: "Min och max",
      percent_change_chains: "Kedjor av procentförändringar",
      ratios_proportions: "Förhållanden och proportioner",
      rates_speed_work: "Hastighet, fart och arbete",
      mixtures_weighted_avg: "Blandningar och viktade medelvärden",
      interest_profit_discount: "Ränta, vinst och rabatt",
      overlapping_sets: "Överlappande mängder",
      combinatorics: "Kombinatorik",
      probability: "Sannolikhet",
      statistics_mean_median_sd: "Statistik: medel, median och standardavvikelse",
      series_patterns: "Serier och mönster",
    },
    context: { pure: "Ren", real: "Tillämpad" },
    domain: { arithmetic: "Aritmetik", algebra: "Algebra" },
    // GMAT terminology: kept in English on purpose.
    format: {
      problem_solving: "Problem Solving",
      data_sufficiency: "Data Sufficiency",
    },
    errorType: {
      content_gap: "Kunskapslucka",
      setup_error: "Fel uppställning",
      calculation_error: "Räknefel",
      misread: "Läste fel",
      time_pressure: "Tidspress",
      guess: "Gissning",
    },
    confidence: { guess: "Gissning", lean: "Lutar åt", lock: "Säker" },
    flagReason: {
      suspected_error: "Misstänkt fel",
      ambiguous: "Tvetydig",
      typo: "Stavfel eller formatering",
      other: "Annat",
    },
    editReason: {
      found_calc_error: "Hittade ett räknefel",
      misread: "Läste frågan fel",
      new_solution_path: "Hittade en ny lösningsväg",
    },
    difficulty: {
      "1": "D1 · lätt (ungefärlig)",
      "2": "D2 · lättare officiell (ungefärlig)",
      "3": "D3 · medel officiell (ungefärlig)",
      "4": "D4 · svår officiell (ungefärlig)",
      "5": "D5 · svåraste officiella (ungefärlig)",
    },
    patternCategory: {
      units_digit_cycles: "Entalssiffrans cykler",
      trailing_zeros_factorials: "Avslutande nollor i n!",
      factor_counts: "Antal faktorer",
      remainder_arithmetic: "Restaritmetik",
      divisibility_rules: "Delbarhetsregler",
      parity_sign_logic: "Jämnhet och teckenlogik",
      fraction_percent_pairs: "Bråk och procent",
      squares_cubes_powers: "Kvadrater, kuber och potenser",
      must_be_true_snap: "Must-be-true på tid",
    },
  },

  sections: {
    deck: "Minneskort",
    queue: "Repetitionskö",
    patterns: "Huvudräkning",
    decide: "Beslutsträning",
    mastery: "Mästerskap",
    analytics: "Analys",
    import: "Import och säkerhetskopia",
  },


  auth: {
    signIn: "Logga in",
    signUp: "Skapa konto",
    signInLede: "Din träning, din data, din plan.",
    signUpLede: "Svensk undervisning, engelska frågor — som på provet.",
    email: "E-post",
    password: "Lösenord",
    newPassword: "Nytt lösenord",
    name: "Namn ({optional})",
    passwordHint: "Minst 10 tecken.",
    working: "Ett ögonblick…",
    noAccount: "Har du inget konto?",
    createOne: "Skapa ett",
    haveAccount: "Har du redan ett konto?",
    forgot: "Glömt lösenordet?",
    forgotTitle: "Glömt lösenordet",
    forgotLede:
      "Ange din e-postadress så skickar vi en länk för att välja ett nytt.",
    forgotSubmit: "Skicka återställningslänk",
    forgotSent:
      "Om adressen har ett konto är ett mejl med en återställningslänk på " +
      "väg. Länken gäller i 30 minuter.",
    backToSignIn: "Tillbaka till inloggningen",
    resetTitle: "Välj ett nytt lösenord",
    resetLede: "Alla andra inloggade enheter loggas ut när du sparar.",
    resetSubmit: "Spara nytt lösenord",
    resetMissingTitle: "Länken saknas",
    resetMissingLede:
      "Öppna länken från mejlet, eller begär en ny återställning.",
    resetMissingBody: "Adressen innehöll ingen återställningstoken.",
    requestNewLink: "Begär en ny länk",
    orDivider: "eller",
    google: "Fortsätt med Google",
    errors: {
      email_invalid: "Det där ser inte ut som en giltig e-postadress.",
      email_taken:
        "Det finns redan ett konto med den adressen. Logga in i stället.",
      password_too_short: "Lösenordet måste vara minst 10 tecken.",
      password_too_long: "Lösenordet är för långt (max 200 tecken).",
      credentials_invalid: "Fel e-postadress eller lösenord.",
      token_invalid:
        "Länken har gått ut eller är redan använd. Begär en ny återställning.",
      oauth_failed: "Google-inloggningen gick inte att slutföra. Försök igen.",
      oauth_state: "Inloggningen tog för lång tid. Försök igen.",
      oauth_unconfigured:
        "Google-inloggning är inte aktiverad på den här servern.",
      generic: "Något gick fel. Försök igen.",
    },
    resetEmail: {
      subject: "Återställ ditt lösenord – Q86",
      body:
        "Hej,\n\nDu har begärt att återställa lösenordet till ditt " +
        "Q86-konto.\nKlicka på länken nedan inom 30 minuter:\n\n{link}\n\n" +
        "Om du inte begärde detta kan du ignorera mejlet. Ditt lösenord\n" +
        "ändras inte förrän länken används.\n\nQ86",
    },
  },

  billing: {
    plansHeading: "Planer",
    plansLede:
      "Alla priser i svenska kronor, inklusive moms. Uppsägning när som " +
      "helst, direkt i betalportalen.",
    perMonth: "/ månad",
    forMonths: "/ {months} månader",
    noPayment: "Ingen betalning, inget kort",
    vatIncluded: "inkl. {amount} moms",
    monthlyEquivalent: "{amount}/mån",
    yourPlan: "Din plan",
    alwaysAvailable: "Alltid tillgänglig",
    manageBelow: "Hantera nedan",
    active: "Aktiv",
    choose: "Välj {plan}",
    openingCheckout: "Öppnar kassan…",
    unconfigured:
      "Betalningar är inte konfigurerade på den här installationen, så " +
      "knapparna är inaktiva. Gratisnivån fungerar som vanligt.",
    checkoutUnavailable:
      "Betalningar är inte aktiverade på den här servern ännu. Hör av dig " +
      "så öppnar vi ett konto åt dig manuellt.",
    checkoutFailed: "Det gick inte att öppna kassan. Försök igen om en stund.",
    checkoutUnreachable:
      "Det gick inte att nå betalningstjänsten. Kontrollera nätet.",
    portalButton: "Hantera prenumeration, kort och kvitton",
    portalOpening: "Öppnar…",
    portalFailed: "Det gick inte att öppna betalportalen just nu.",
    portalUnreachable: "Det gick inte att nå betalportalen.",
    testMode:
      "Testläge: inga riktiga betalningar går igenom. Använd Stripes " +
      "testkort 4242 4242 4242 4242.",
    plans: {
      free: {
        name: "Gratis",
        tagline: "Läs allt, träna varje dag, se om metoden passar dig.",
        bullet1: "Alla 24 kapitel på svenska",
        bullet2: "{limit} frågor per dag ur den verifierade banken",
        bullet3: "Mönsterträning utan begränsning",
        bullet4: "Gratis diagnostiskt test med prognos",
        bullet5: "",
      },
      monthly: {
        name: "Månad",
        tagline: "Hela plattformen, uppsägningsbar när som helst.",
        bullet1: "Obegränsat antal frågor",
        bullet2: "Tidsatta set och full sektionssimulering med Review & Edit",
        bullet3: "Repetitionskö, minneskort och mästerskapsstegar",
        bullet4: "Analys i samma form som ditt riktiga score report",
        bullet5: "Whiteboard-genomgång och import av score report",
      },
      sprint: {
        name: "GMAT-sprint",
        tagline: "Tre månader, ett fast pris, inget som förnyas.",
        bullet1: "Allt i Månad, i tre månader",
        bullet2: "Betalas en gång — ingen förnyelse att komma ihåg",
        bullet3: "Motsvarar {monthly} per månad",
        bullet4: "Passar dig som redan har ett bokat provdatum",
        bullet5: "",
      },
    },
  },

  account: {
    title: "Konto",
    paymentDone:
      "Tack — betalningen är registrerad. Om planen nedan inte har " +
      "uppdaterats ännu tar Stripe några sekunder på sig; ladda om sidan.",
    paymentCancelled: "Kassan avbröts. Inget har debiterats.",
    lockedTitle: "{feature} ingår inte i din plan",
    lockedBody:
      "Gratisnivån innehåller kapitlen, mönsterträningen och {limit} frågor " +
      "per dag. Resten öppnas med Månad eller GMAT-sprint.",
    usedToday: "{used} / {limit} frågor i dag",
    renews: "förnyas",
    endsOn: "avslutas",
    validUntil: "gäller till",
    paymentProblem:
      "Stripe kunde inte dra betalningen. Uppdatera kortet nedan innan " +
      "perioden går ut, så behåller du tillgången.",
    dataTitle: "Dina uppgifter",
    dataLede:
      "Du kan när som helst ladda ner allt Q86 sparar om dig, som en " +
      "JSON-fil.",
    dataDownload: "Ladda ner mina uppgifter ↓",
    status: {
      none: "Ingen prenumeration",
      trialing: "Provperiod",
      active: "Aktiv",
      past_due: "Betalning misslyckades",
      canceled: "Uppsagd",
      incomplete: "Ofullständig",
      unpaid: "Obetald",
      expired: "Avslutad",
    },
    feature: {
      learn: "kapitlen",
      drill: "träningen",
      patterns: "mönsterträningen",
      diagnostic: "diagnosen",
      timed: "tidsatta set och sektionssimulering",
      queue: "repetitionskön",
      deck: "minneskorten",
      analytics: "analysen",
      mastery: "mästerskapsstegarna",
      decide: "beslutsövningarna",
      plan: "dagsplanen",
      coach: "whiteboard-genomgången",
      import: "import av score report",
    },
  },

  lesson: {
    answerChoices: "Svarsalternativ",
    example: "Exempel {n}",
    answer: "Svar",
    levelWarmup: "Uppvärmning",
    levelCore: "Kärna",
    levelExam: "Provnivå",
    hideSolution: "Dölj lösningen",
    revealSolution: "Räkna själv först — visa sedan lösningen",
    onThisPage: "På den här sidan",
    whenYouSee: "När du ser",
    reachFor: "→ Ta till",
    checklistLede: "Bocka av ärligt — gå sedan och bevisa det.",
    checklistAllDone: "Allt avbockat — bevisa det på testet.",
    checklistTestPassed: "Testet klarat ✓",
    checklistLastScore: "senast {score}",
    checklistLastTest: "Senaste testet: {score} — gränsen är 6/8.",
    checklistHonest: "Träningen visar om bockarna var ärliga.",
    drillNow: "Träna på detta nu →",
    chapterTest: "Kapiteltest →",
    retakeTest: "Gör om testet",
  },

  learn: {
    title: "Lär",
    lede: "{count} konceptkapitel, ett per träningsbart delmoment",
    ledeWithTests: "{count} konceptkapitel — {passed} test klarade",
    empty: "Kapitlen skrivs just nu — kom tillbaka snart.",
    chapters: "{count} kapitel",
    chapterOf: "Kapitel {n} av {total}",
    workedExamples: "3 lösta exempel",
    testPassed: "✓ test klarat",
    testScore: "test {correct}/{total}",
    previousChapter: "← Föregående kapitel",
    nextChapter: "Nästa kapitel →",
    method: {
      readStep: "Läs",
      readDetail: "kärnidéerna och signalerna",
      attemptStep: "Räkna",
      attemptDetail: "varje exempel innan du visar lösningen",
      tickStep: "Bocka",
      tickDetail: "checklistan ärligt",
      drillStep: "Träna",
      drillDetail: "samma delmoment medan det sitter",
    },
    section: {
      whyTitle: "Varför detta spelar roll",
      ideasTitle: "Kärnidéerna",
      ideasTagline: "hela verktygslådan",
      examplesTitle: "Lösta exempel",
      examplesTagline: "lätt → provsvårt, räkna innan du visar",
      cuesTitle: "Igenkänningssignaler",
      cuesTagline: "formulering → metod, lär dig dessa",
      trapsTitle: "Fällgalleriet",
      trapsTagline: "de klassiska felstegen",
      speedTitle: "Snabbgrepp",
      speedTagline: "genvägar som håller",
      checklistTitle: "Innan du tränar",
    },
  },

  drill: {
    title: "Träna",
    selecting: "Väljer frågor…",
    couldNotStart: "Kunde inte starta.",
    couldNotStartDrill: "Kunde inte starta träningen — servern svarade inte.",
    couldNotStartTest: "Kunde inte starta testet — servern svarade inte.",
    fastestPath: "Snabbaste vägen",
    trapAnatomy: "Fällornas anatomi",
    yourHistory: "Din historik på den här frågan",
    flagPrompt: "Något som ser fel ut i frågan? Flagga den",
    flagged: "Flaggad — den ligger i granskningslistan.",
    flagNote: "Vad ser fel ut? (valfritt)",
    flagging: "Flaggar…",
    flagSubmit: "Flagga frågan",
  },

  deck: {
    title: "Minneskort",
    lede:
      "Framsidan: när du ska ta till metoden. Baksidan: lärdomen. Betygsätt " +
      "ärligt — kort du kan skjuts längre fram, kort du glömmer kommer " +
      "tillbaka i morgon.",
    counts:
      "{due} att repetera · {fresh} nya missar · {scheduled} inplanerade framåt",
    empty:
      "Inget att repetera — kortleken byggs av frågor du missar, och kort du " +
      "betygsatt kommer tillbaka när intervallet löper ut.",
    goDrill: "Gå och träna →",
    done: "Kortleken klar — {count} lärdomar betygsatta.",
    doneNote:
      "Två minuter som växer med ränta. Korten du kunde är utskjutna; de du " +
      "glömde kommer tillbaka i morgon.",
    new: "ny",
    takeaway: "Lärdom",
    triggerCue: "Igenkänningssignal",
    missed: "missad {when}",
    flipHint: "Enter för att vända",
    forgot: "Glömde",
    hard: "Svårt",
    good: "Kunde",
    resolve: "Lös om frågan den kom från →",
  },

  decide: {
    title: "Beslutsövningar",
    lede:
      "45 sekunder per fråga: bestäm dig för att lösa, gissa eller hoppa — " +
      "utan att lösa. Domen jämförs med din egen historik på liknande frågor.",
    empty: "Inga frågor tillgängliga.",
    introTitle: "{count} frågor · 45 sekunder var",
    introBody:
      "Läs frågan. Lös den INTE. Bestäm ett tempoval: {s} lös nu, {g} " +
      "eliminera och ta en kvalificerad gissning, {b} hoppa av — välj något " +
      "och spara tiden. Att låta klockan gå ut räknas som ett påtvingat " +
      "\"lös\".",
    start: "Starta · Enter",
    doneTitle: "{aligned} / {total} val stämde med din historik",
    doneBody:
      "Att stämma är inte samma sak som att lyda — ett medvetet försök är " +
      "helt i sin ordning. Vanan som räknas: bestäm dig på 45 sekunder och " +
      "mal aldrig vidare av ren tröghet.",
    callSolve: "Lös",
    callGuess: "Kvalificerad gissning",
    callBail: "Hoppa av",
    youCalled: "Du valde",
    yourRecordOn: "Din historik på",
    withSample: "{percent} över {sample} försök",
    noSample: "ingen data ännu — svårighetsprior {percent}",
    whichPointsTo: "vilket pekar mot",
    nextHint: "Enter för nästa fråga",
  },

  settings: {
    testDate: "Provdatum",
    timedSetEvery: "Tidsatt set var",
    daysUnit: "dag",
    saveSettings: "Spara inställningar",
    saveFailed: "Det gick inte att spara — försök igen.",
  },

  flags: {
    title: "Innehållsflaggor",
    open: "{count} öppna",
    note: "Notering:",
    dismiss: "Avfärda — frågan är korrekt",
    retire: "Pensionera frågan",
    retired: "pensionerad",
  },

  drillRunner: {
    confidence: "Säkerhet",
    pickAnswer: "Välj ett svar — tangent 1–5 eller A–E.",
    setConfidence: "Ange säkerhet först — G gissning, L lutar åt, K säker.",
    confirmAnswer: "Bekräfta svar",
    sendToPostmortem: "Skicka till genomgång",
    nextQuestion: "Nästa fråga",
    finish: "Avsluta",
    tagTheMiss: "Märk missen (tangent 1–6):",
    notSaved:
      "Försöket sparades inte — kontrollera att servern når databasen.",
    chapterTestPassed: "Kapiteltestet klarat",
    notPassedYet: "Inte klarat ännu",
    passedBody:
      "{correct}/{total} — kapitlet visas nu som klarat i Lär-listan. Håll " +
      "det varmt med träning; omtag kan inte sänka dig.",
    notPassedBody:
      "{correct}/{total}, och gränsen är {bar}/{total}. Gör en genomgång av " +
      "missarna nedan, läs fällgalleriet igen och gör om testet.",
    backToChapter: "Tillbaka till kapitlet",
    retakeFresh: "Gör om med nya frågor →",
    paperTrail: "Pappersspåret",
    redoComplete: "Repetitionen klar",
    drillComplete: "Träningen klar",
    subtopicColumn: "Delmoment",
    resultColumn: "Resultat",
    timeColumn: "Tid",
    postmortemLink: "Genomgång",
    setUpAnother: "Ställ in en ny träning",
    backToToday: "Tillbaka till I dag",
    redoTag: "repetition",
    casualTag: "avslappnat",
  },

  runner: {
    questionOf: "Fråga {n} av {total}",
  },

  drillSetup: {
    skill: "Färdighet",
    allSkills: "Alla färdigheter",
    subtopics: "Delmoment",
    subtopicsHint: "inget valt = alla",
    difficulty: "Svårighet",
    minDifficulty: "Lägsta svårighet",
    maxDifficulty: "Högsta svårighet",
    to: "till",
    difficultyNote: "Ungefärligt: D3 ≈ medel officiell, D5 ≈ svåraste.",
    questionCount: "Frågor",
    timing: "Tempo",
    untimed: "Utan tid",
    softTarget: "Mjukt mål 2:15",
    format: "Format",
    bothFormats: "Båda",
    sessionFocus: "Passets karaktär",
    focused: "Fokuserat — räknas i statistiken",
    casual: "Avslappnat — utanför statistiken",
    casualNote:
      "Avslappnade försök hamnar utanför analys, kalibrering och dagsplanen. " +
      "Missar hamnar ändå i repetitionskön.",
    startDrill: "Starta träning: {count} frågor",
    matching: "{count} verifierade frågor matchar filtret",
    clamped: " — träningen begränsas till dem",
    generateTitle: "Generera fler frågor",
    generateLede:
      "Tio nya frågor som matchar filtret ovan, var och en oberoende " +
      "verifierad innan den kan dyka upp i en träning.",
    generateButton: "Generera 10 till",
    generating: "Genererar frågor…",
    verifying: "Verifierar frågor…",
    generatedVerified: "{count} verifierade",
    generatedFailed: "{count} underkända i verifieringen",
    generateFailed:
      "Genereringen misslyckades. Kontrollera ANTHROPIC_API_KEY och försök igen.",
  },

  pages: {
    analytics: "Analys",
    analyticsCasual:
      "{count} avslappnade försök är uteslutna från varje siffra på sidan.",
    mastery: "Mästerskapsstegar",
    masteryLede:
      "Ett steg klaras vid ≥{bar} över dina senaste 10 försök (minst " +
      "{minimum}). {mastered} av {total} stegar helt bestigna.",
    masteryClimbed: "BESTIGEN",
    patterns: "Mönsterträning",
    queue: "Repetitionskö och fellogg",
    timed: "Tidsatta set",
    postmortem: "Whiteboard-genomgång",
    import: "Import av score report",
    importBackupTitle: "Säkerhetskopiera dina uppgifter",
    importBackupLede:
      "En JSON-fil med allt Q86 sparar om ditt konto: försök, pass, " +
      "kortplanering, flaggor och inställningar. Det här är också " +
      "GDPR-exporten.",
    importBackupButton: "Ladda ner säkerhetskopia ↓",
    importBaselines: "Importerade utgångslägen · {count}",
    importBaselinesLede:
      "Den senaste importen matar dagsplanens svaghetsvikter.",
    importTest: "prov {date}",
  },

  capture: {
    useWebcam: "Använd webbkameran",
    closeCamera: "Stäng kameran",
    captureFrame: "Ta den här bilden",
    uploadPhoto: "Ladda upp ett foto",
    compressing: "Komprimerar…",
    cameraDenied:
      "Kameran är inte tillgänglig eller nekades — ladda upp ett foto eller " +
      "klistra in från urklipp i stället.",
  },

  timed: {
    fullSection: "Full sektion",
    miniSet: "Litet set",
    startFull: "Starta 21-frågorssektion",
    startMini: "Starta 7-frågors mini",
    showTimer:
      "Visa timern per fråga (dold som standard, precis som på riktiga provet)",
    casualSession:
      "Avslappnat pass — uteslut det här setet från analys och dagsplan",
    assembling: "Sätter ihop setet…",
    marking: "Rättar sektionen…",
    couldNotStart: "Kunde inte starta.",
    couldNotStartSet: "Kunde inte starta setet — servern svarade inte.",
    saveFailed:
      "Det gick inte att spara. Dina resultat finns kvar på skärmen — försök igen.",
    retrySave: "Försök spara passet igen",
    mustAnswer: "Du måste svara för att gå vidare — tangent 1–5 eller A–E.",
    setConfidence: "Ange säkerhet först — G gissning, L lutar åt, K säker.",
    confirmAndAdvance: "Bekräfta och gå vidare",
    confirmFinal: "Bekräfta sista svaret",
    pastCheckpoint: "Förbi 2:45-kontrollen",
    bookmark: "Bokmärk",
    bookmarked: "Bokmärkt",
    reviewAndEdit: "Review & Edit",
    submitSection: "Lämna in sektionen och se rättningen",
    keepOriginal: "Behåll det ursprungliga svaret",
    commitChange: "Genomför ändringen",
    editedThisSession: "Ändrad i det här passet",
    justificationPlaceholder:
      "Namnge det exakta felet: vilken rad, vilket tal, vilket villkor du läste fel…",
  },

  review: {
    questionEdits: "Fråga {n} · ändringar använda {used}/{max}",
    editsUsed: "ändringar använda {used}/{max}",
    limitReached: "Ändringsgränsen är nådd ({max}). Svaren är låsta.",
    changingLede:
      "Du ändrar det här svaret. Namnge det specifika fel du hittade — en " +
      "känsla är inte ett skäl.",
    answered: "svarad",
    yourRecord:
      "Din historik: ändringar i quant har förstört fler poäng än de gett. " +
      "Öppna en fråga bara om du kan namnge ett konkret fel.",
  },

  timedConfig: {
    fullLede:
      "21 frågor, 45:00, viktad blandning över alla fyra färdigheter. " +
      "Trogen mekanik: svara för att gå vidare, B bokmärker, " +
      "granskningsskärm med upp till 3 ändringar om tiden räcker.",
    miniLede: "7 frågor, 15:00. Blandat eller en färdighet.",
    mixed: "Blandat",
    needsQuestions:
      "Kräver {needed} verifierade frågor; banken har {available}.",
    onThisQuestion: "på den här frågan",
    keyboardHelp:
      "1–5 eller A/C/D/E väljer · B bokmärker · G/L/K säkerhet · Enter " +
      "bekräftar — du kan inte gå tillbaka förrän granskningsskärmen",
  },

  marking: {
    sectionMarked: "Sektionen rättad",
    columnQ: "Fr#",
    columnDomain: "Domän",
    columnContext: "Sammanhang",
    columnSkill: "Färdighet",
    notReachedCell: "hann inte",
    editedFromTo: "ändrad {from}→{to}",
    sectionAccuracy: "Träffsäkerhet i sektionen",
    timeViolations: "Överdrag (>2:45)",
    sub60Wrong: "Fel under 60 s",
    editNetSession: "Ändringsnetto (passet)",
    editNetLifetime: "Ändringsnetto (totalt)",
    notReachedNote:
      "{count} frågor hanns aldrig med — klockan hann före dig.",
    editsThisSession: "Ändringar i det här passet",
    outcomeNoChange: "ingen skillnad",
    outcomeFixed: "rättade ett fel svar (+1)",
    outcomeDestroyed: "förstörde ett rätt svar (−1)",
    outcomeWrongEither: "fel hur som helst (0)",
    setUpAnother: "Ställ in ett nytt tidsatt set",
    reviewSummary: "Fr{n} — du valde {picked}, rätt är {correct}",
    pacingRead: "Tempoavläsning",
    pacingLede:
      "Riktvärden per svårighet — svårare frågor får mer av budgeten på " +
      "128 s per fråga.",
    pacingRow: "D{difficulty} · du {yours} · riktvärde {bench} · ×{n}",
    timeSinks: "Tidstjuvar:",
    timeSinksNote:
      " — varje tidstjuv över 1,5× riktvärdet är ett avhopp du inte gjorde.",
    sinkItem: "Fr{n} ({time} på D{difficulty}, riktvärde {bench})",
    rushedWrong: "Snabbt och fel:",
    rushedWrongNote: " — sekunderna du sparade där gick åt till tidstjuvarna.",
    cleanPacing: "Rent tempo — inga tidstjuvar, inga paniksvar.",
  },

  queue: {
    couldNotStart: "Kunde inte starta repetitionen.",
    couldNotStartServer: "Kunde inte starta repetitionen — servern svarade inte.",
    dueNow: "Att repetera nu · {count}",
    redoAll: "Repetera alla {count}",
    redoThis: "Repetera den här",
    nothingDue: "Inget att repetera. Starta en träning eller ett tidsatt set.",
    stageNote:
      "Steg 2 rensas bara om frågan löses utan hjälp inom 2:30 — annars går " +
      "den tillbaka till steg 1.",
    stage0: "steg 0 · +2d",
    stage1: "steg 1 · +7d",
    stage2: "steg 2 · +21d kall lösning",
    stageN: "steg {n}",
    due: "{when}",
    scheduled: "Inplanerade · {count}",
    errorLog: "Fellogg",
    logCount: "{shown} av {total} försök",
    exportCsv: "Exportera CSV ({rows} rader)",
    filterBySkill: "Filtrera på färdighet",
    filterByErrorType: "Filtrera på feltyp",
    filterByResult: "Filtrera på resultat",
    allErrorTypes: "Alla feltyper",
    allResults: "Alla resultat",
    wrongOnly: "Bara fel",
    correctOnly: "Bara rätt",
    columnWhen: "När",
    columnMode: "Läge",
    columnError: "Fel",
    columnNotes: "Anteckningar",
    noMatches: "Inga försök matchar filtren.",
  },

  patterns: {
    mixed: "Blandat",
    mixedLede: "Alla nio kategorier, blandade",
    dayStreak: "dagars svit",
    bestStreak: "bäst {best} · svit {streak}",
    saving: "Sparar rundan…",
    saveFailed:
      "Rundan kunde inte sparas — servern svarade inte. Betygen är oförändrade.",
    score: "Poäng",
    yourAnswer: "Ditt svar",
    typeNumber: "Skriv talet",
    typeNumberHint: "Skriv talet, Enter svarar",
    keysAnswer: "Tangent 1–4 svarar",
    answerLabel: "Svar:",
    answer: "Svar",
    anotherRound: "En runda till",
    changeCategory: "Byt kategori",
    ratingChanges: "Betygsförändringar",
    elo: "ELO",
  },

  patternsMore: {
    roundsLede:
      "90-sekundersrundor · svaren räknas ut av kod, direkt och alltid rätt",
    bestRound: "bästa runda {count}",
    bestStreakAnswered: "bäst {best} · svit {streak} · {answered} besvarade",
    startRound: "Starta 90-sekundersrunda: {category}",
    newPersonalBest: "Nytt personbästa: {current} (tidigare {previous}).",
    correctOf: " / {answered} rätt",
    streakShort: "svit {count}",
  },

  postmortem: {
    correct: "Rätt",
    wrong: "Fel",
    confidenceChip: "{level} säkerhet",
    theQuestion: "Frågan",
    scratchWork: "Kladdpapper",
    scratchLede:
      "Fotografera exakt vad du skrev — coachen hittar raden där uträkningen " +
      "spårade ur.",
    runCoach: "Kör genomgången",
    rerunCoach: "Kör genomgången igen",
    stageReading: "Läser whiteboarden…",
    stageClassifying: "Klassificerar missen…",
    stagePrescribing: "Skriver receptet…",
    coachFailed: "Coachanropet misslyckades. Kontrollera ANTHROPIC_API_KEY och försök igen.",
    savedPostmortem: "Sparad genomgång",
    divergencePoint: "Avvikelsepunkt",
    diagnosis: "Diagnos",
    fastestVsYours: "Snabbaste vägen mot din väg",
    triggerCue: "Igenkänningssignal",
    prescription: "Recept",
    classification: "Klassificering",
    classificationHint:
      "AI-förslag — bekräfta eller ändra innan det går in i loggen",
    failedSubtopic: "Delmoment som brast",
    notePlaceholder: "Din egen anteckning om missen (valfritt)",
    confirmClassification: "Bekräfta klassificeringen",
    logged: "Loggat.",
    twinTitle: "Tvillingträning",
    twinLede:
      "Två nya tvillingar till den här frågan — samma matematiska skelett, " +
      "motsatt sammanhang ({context}). Båda verifieras innan de får dyka upp.",
    twinQueue: "Köa två verifierade tvillingar",
    twinWorking: "Genererar och verifierar tvillingar…",
    twinVerified: "{count} tvillingar verifierade",
    twinFailed: "{count} underkända i verifieringen",
    twinDrill: "Träna tvillingarna nu",
    twinError: "Tvillinggenereringen misslyckades. Försök igen.",
  },

  prescriptionLine: {
    text: "{count} frågor i {subtopic}.",
  },

  importer: {
    pasteTitle: "Klistra in texten från ditt score report",
    pasteLede:
      "Kopiera allt från den officiella rapportsidan — poäng, " +
      "percentiltabeller, tider per fråga om du har dem. Det tolkade " +
      "resultatet visas för bekräftelse innan något sparas.",
    pastePlaceholder: "Klistra in rapporttexten här…",
    parseButton: "Tolka rapporten",
    parsing: "Läser rapporten…",
    parseFailed: "Tolkningen misslyckades. Kontrollera ANTHROPIC_API_KEY och försök igen.",
    saved: "Utgångsläget sparat — dagsplanen väger nu in det.",
    saveFailed: "Sparandet misslyckades — rapporten lagrades inte. Försök igen.",
    parsedTitle: "Tolkat resultat — bekräfta innan du sparar",
    sections: "Delprov",
    total: "Totalt",
    quantSkills: "Fundamental skills i Quant",
    noneInText: "Inget hittades i texten.",
    domainsContexts: "Domäner och sammanhang",
    noneFound: "Inget hittat.",
    percentile: "{value}:e percentilen",
    timingRows: "{count} rader med tid per fråga inlästa.",
    testDate: "Provdatum: {date}",
    confirmSave: "Bekräfta och spara som utgångsläge",
    discard: "Kasta tolkningen",
    sectionQuant: "Quantitative Reasoning",
    sectionVerbal: "Verbal Reasoning",
    sectionDataInsights: "Data Insights",
  },

  dashboard: {
    title: "I dag",
    freeTierTitle: "Gratisnivån.",
    freeTierBody: "Alla kapitel, mönsterträningen och {limit} frågor per dag.",
    freeTierUsage: "{used} / {limit} i dag",
    seePlans: "se planer",
    daysToTest: "dagar till provet",
    setTestDate: "Ange ditt provdatum så kan planen hitta rätt takt.",
    firstRunTitle: "Ny här? Slingan är enkel.",
    firstRunReadLink: "Läs ett kapitel",
    firstRunReadRest:
      "om ett moment du vill skärpa — varje kapitel slutar med en checklista.",
    firstRunDrillLink: "Träna direkt på det",
    firstRunDrillRest:
      "— varje miss dissekeras: snabbaste vägen, fällans anatomi, lärdomen.",
    firstRunReturn:
      "Kom tillbaka i morgon: dina missar återkommer som minneskort och " +
      "utspridda repetitioner i",
    firstRunReviewLink: "Repetera",
    firstRunReturnEnd: ", och den här sidan börjar planera dina dagar.",
    mockToday: "Officiell provsimulering i dag — gör den och importera sedan rapporten.",
    mockInDays: "Nästa officiella provsimulering om {days} dagar.",
    patternRoundsTitle: "Mönsterrundor",
    patternRoundsBody: "De två kategorierna med lägst ELO:",
    startRound: "Starta runda {n}: {category} →",
    weightedDrillTitle: "Viktad träning · {count} frågor",
    startTodaysDrill: "Starta dagens träning: {count} frågor →",
    bankEmpty: "Banken är tom.",
    reviewTitle: "Repetera",
    redosDue: "{count} repetitioner att göra",
    noRedosDue: "Inga repetitioner att göra",
    deckWaiting: "{count} minneskort väntar",
    deckClear: "kortleken är tom",
    flipDeck: "Vänd korten: {count} stycken →",
    redoAllDue: "Repetera alla {count} →",
    openQueue: "Öppna kön →",
    timedSetTitle: "Tidsatt set",
    timedToday: "Inplanerat i dag: full sektion med 21 frågor.",
    timedNext: "Nästa inplanerad om {days} dagar (var {cadence}:e).",
    startFullSection: "Starta 21-frågorssektion →",
    timedSetsLink: "Tidsatta set →",
    weightsTitle: "Färdighetsvikter som styr dagens mix",
    weightsLede:
      "Rullande träffsäkerhet över de senaste 30 försöken, blandad 50/50 med " +
      "det importerade utgångsläget; ett golv på 5 % håller varje färdighet " +
      "i rotation.",
    recentRecord: "{correct}/{total} senaste",
    noData: "ingen data",
  },

  phase: {
    foundations: "Grund",
    accuracy: "Precision",
    speed: "Tempo",
    peak: "Toppvecka",
    foundationsNote:
      "Bygg täckning: klättra på mästerskapsstegarna och håll varje " +
      "färdighet i rotation.",
    accuracyNote:
      "Feldisciplin: töm repetitionskön varje dag och gå igenom varje miss.",
    speedNote:
      "Tempo under press: tidsatta set varannan dag; beslut slår perfektion.",
    peakNote:
      "Nedtrappning: lätt blandad repetition, minneskort, sömn. Inget nytt " +
      "material.",
  },

  analytics: {
    mirrorTitle: "Spegling av score report",
    mirrorSubtitle:
      "Träffsäkerhet per domän, sammanhang och fundamental skill — samma " +
      "snitt som den officiella rapporten. {count} försök.",
    contentDomain: "Innehållsdomän",
    context: "Sammanhang",
    fundamentalSkill: "Fundamental skill",
    heatmapTitle: "Missvärmekarta",
    heatmapSubtitle: "Klassificerade felsvar: delmoment × feltyp.",
    heatmapCell: "{subtopic} × {errorType}: {count}",
    difficultyTitle: "Träffsäkerhet per svårighet",
    difficultySubtitle:
      "Var exakt varje delmoment brister: träffsäkerhet per svårighetsnivå, " +
      "bara fokuserade försök.",
    noAttemptsYet: "Inga försök ännu — matrisen fylls i medan du tränar.",
    volumeTitle: "Träningsvolym",
    volumeSubtitle:
      "Fokuserade försök per dag, senaste 12 veckorna. Uthållighet slår " +
      "intensitet.",
    volumeCell: "{date}: {count} försök",
    scatterTitle: "Tid mot träffsäkerhet",
    scatterSubtitle:
      "Varje försök är en punkt. De skuggade zonerna är de två dokumenterade " +
      "misslyckandelägena.",
    pastCheckpoint: "Försök över 2:45",
    sub60Wrong: "Fel under 60 sekunder",
    axisTime: "Tid",
    axisDifficulty: "Svårighet",
    zonePast245: "över 2:45",
    zoneSub60: "under 60 s",
    ledgerTitle: "Ändringslogg",
    ledgerSubtitle: "Varje svarsändring i Review & Edit, hela historiken.",
    lifetimeNet: "Nettopoäng från ändringar totalt",
    editsMade: "Ändringar gjorda",
    fixedWrong: "Rättade ett fel svar",
    destroyedCorrect: "Förstörde ett rätt svar",
    lockChanged: "Ändrade svar du var säker på och hade rätt i",
    columnWhen: "När",
    columnReason: "Skäl",
    columnOutcome: "Utfall",
    columnJustification: "Motivering",
    outcomeFixed: "+1 rättat",
    outcomeDestroyed: "−1 förstört",
    outcomeNeutral: "0 oförändrat",
    calibrationTitle: "Kalibrering",
    calibrationSubtitle:
      "Träffsäkerhet per säkerhetsnivå före svaret: förväntat mot faktiskt.",
    expected: "Förväntat",
    actual: "Faktiskt",
    trendTitle: "Rullande 7-dagars träffsäkerhet per färdighet",
    trendSubtitle:
      "Varje punkt är den bakåtblickande 7-dagarsträffsäkerheten den dagen; " +
      "luckor betyder inga försök i fönstret.",
    redoTitle: "Efterlevnad i repetitionskön",
    redoSubtitle: "Utspridda repetitioner: öppna, försenade och avklarade.",
    redoOpen: "Öppna",
    redoOverdue: "Försenade",
    redoCleared: "Avklarade (kall lösning)",
    eloTitle: "ELO i mönsterträningen",
    eloSubtitle: "Betyg per kategori; linjen markerar starten på 1200.",
  },

  fallback: {
    chapterInEnglish:
      "Det här kapitlet finns ännu inte på svenska, så du läser den " +
      "engelska originaltexten.",
  },
} as const;
