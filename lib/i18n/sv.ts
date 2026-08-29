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
    textInOtherLanguage:
      "Den här texten finns ännu inte på svenska, så du läser originalet.",
    chapterInEnglish:
      "Det här kapitlet finns ännu inte på svenska, så du läser den " +
      "engelska originaltexten.",
  },

  site: {
    nav: {
      product: "Plattformen",
      pricing: "Priser",
      diagnostic: "Gratis diagnos",
      guides: "Guider",
      signIn: "Logga in",
      start: "Kom igång",
      menu: "Meny",
    },
    hero: {
      eyebrow: "GMAT Focus · Quantitative Reasoning",
      title: "Kvantdelen är inte ett minne. Den är ett mönster.",
      lede:
        "Q86 är en svensk träningsplattform för GMAT Focus kvantdel. " +
        "Undervisningen är på svenska; frågorna är på engelska, precis som " +
        "på provet. Varje fråga i banken är verifierad innan den släpps in.",
      primary: "Gör diagnosen — 12 frågor, inget konto",
      secondary: "Se vad som ingår",
      note: "Ingen betalning, ingen e-postadress, inga cookies för att börja.",
    },
    proof: {
      questions: "verifierade frågor i banken",
      chapters: "konceptkapitel på svenska",
      skills: "fundamental skills som provet mäter",
      subtopics: "delmoment att träna var för sig",
    },
    problem: {
      title: "Varför svenska sökande fastnar på kvantdelen",
      body:
        "De flesta som pluggar inför GMAT gör fler frågor och hoppas att " +
        "något ska lossna. Problemet är sällan mängden. Det är att felen " +
        "aldrig blir namngivna: du vet att du missade, men inte om det var " +
        "en lucka i innehållet, en felaktig uppställning, ett räknefel, en " +
        "felläsning, tidspress eller en ren gissning. Sex olika fel, sex " +
        "olika åtgärder — och utan namn på felet blir åtgärden alltid " +
        "\"öva mer\".",
      answer:
        "Q86 tvingar fram namnet. Varje missat försök klassificeras innan " +
        "det lämnar skärmen, och dagsplanen viktas om efter det du faktiskt " +
        "gör fel.",
    },
    pillars: {
      title: "Tre saker plattformen gör som ett frågehäfte inte kan",
      verifiedTitle: "En bank som inte får bli sämre",
      verifiedBody:
        "Varje fråga passerar en författargrind innan den blir sökbar: " +
        "svaret räknas om numeriskt, distraktorerna måste motsvara ett " +
        "namngivet misstag, och en fråga som inte klarar kontrollen släpps " +
        "aldrig in. Banken växer bara med det som håller.",
      taxonomyTitle: "Fel med namn, inte magkänsla",
      taxonomyBody:
        "Sex feltyper, nio mönsterkategorier, 24 delmoment. Varje försök " +
        "loggas med säkerhetsnivå och tidsåtgång, så skillnaden mellan " +
        "\"kunde inte\" och \"hann inte\" syns i statistiken i stället " +
        "för att gissas fram.",
      planTitle: "En plan som räknas fram, inte känns fram",
      planBody:
        "Dagsplanen är deterministisk: samma indata ger samma plan. Den " +
        "väger in din träffsäkerhet per skill, det du importerat från en " +
        "score report och hur långt det är kvar till provdagen.",
    },
    method: {
      title: "Slingan",
      lede: "Fyra steg som upprepas tills mönstret sitter.",
      readTitle: "Läs kapitlet",
      readBody:
        "24 kapitel på svenska, ett per delmoment: kärnidéer, lösta " +
        "exempel, igenkänningssignaler, fällgalleri och snabbgrepp.",
      drillTitle: "Träna viktat",
      drillBody:
        "Frågorna väljs efter var du är svagast just nu, inte efter " +
        "kapitelordningen.",
      markTitle: "Märk missen",
      markBody:
        "Varje fel får en feltyp innan du går vidare. Det tar fem sekunder " +
        "och är hela poängen.",
      returnTitle: "Möt frågan igen",
      returnBody:
        "Missar hamnar i repetitionskön och i minneskorten, med " +
        "intervallrepetition tills de sitter.",
    },
    bank: {
      title: "Om frågebanken",
      body:
        "Frågorna är skrivna för att likna det officiella materialet i " +
        "form och svårighet, och de är på engelska eftersom provet är på " +
        "engelska. De är inte officiella GMAT-frågor och påstår inte att " +
        "vara det. Kalibreringen sker mot officiellt GMAC-material; " +
        "träningen sker här.",
    },
    honesty: {
      title: "Vad Q86 inte lovar",
      noGuarantee:
        "Ingen poänggaranti. Ingen plattform kan lova en siffra på ett " +
        "prov den inte skriver åt dig.",
      noOfficial:
        "Ingen koppling till GMAC. Q86 är oberoende, och GMAT™ och GMAT " +
        "Focus Edition™ tillhör GMAC.",
      noTestimonials:
        "Inga omdömen och inga användarsiffror på den här sidan. " +
        "Plattformen är ny, och påhittade siffror hade varit enkla att " +
        "skriva och omöjliga att försvara.",
      noVerbal:
        "Ingen verbal- eller Data Insights-träning. Q86 gör kvantdelen, " +
        "och bara den.",
    },
    cta: {
      title: "Börja med diagnosen",
      body:
        "Tolv frågor över de fyra fundamental skills. Du får en uppskattad " +
        "kvantnivå, det delmoment som ser svagast ut och första veckan av " +
        "planen — utan att skapa ett konto.",
      button: "Starta diagnosen",
      alt: "eller läs guiderna först",
    },
    footer: {
      product: "Plattformen",
      resources: "Läsning",
      legal: "Villkor",
      privacy: "Integritetspolicy",
      terms: "Köpvillkor",
      withdrawal: "Ångerrätt",
      contact: "Kontakt",
      contactBody: "Frågor om kontot eller betalningen: {email}",
      rights: "Q86",
    },
  },

  pricing: {
    title: "Priser",
    lede:
      "Ett gratisläge som är användbart i sig, och två betalda som öppnar " +
      "resten. Alla priser i kronor, inklusive moms.",
    vatNote: "Alla priser inklusive {rate} moms.",
    perMonth: "per månad",
    once: "engångsbetalning",
    forMonths: "för {months} månader",
    monthlyEquivalent: "motsvarar {amount} per månad",
    free: "0 kr",
    choose: "Välj {plan}",
    current: "Din plan",
    startFree: "Börja gratis",
    faqTitle: "Vanliga frågor om betalningen",
    faq: {
      cancelQ: "Kan jag avsluta när jag vill?",
      cancelA:
        "Ja. Månadsplanen avslutas i Stripes kundportal och gäller ut den " +
        "period du redan betalat för. Ingen bindningstid.",
      sprintQ: "Vad händer när GMAT-sprinten tar slut?",
      sprintA:
        "Den är en engångsbetalning för tre månader och förnyas inte " +
        "automatiskt. När perioden är slut faller kontot tillbaka till " +
        "gratisläget med all din historik kvar.",
      vatQ: "Ingår moms?",
      vatA:
        "Ja. Priserna som visas är slutpriser för privatpersoner i " +
        "Sverige, inklusive {rate} moms. Kvitto kommer från Stripe.",
      refundQ: "Får jag ångra köpet?",
      refundA:
        "Digitalt innehåll som levereras direkt omfattas av ångerrätt " +
        "enligt distansavtalslagen, men du samtycker vid köpet till att " +
        "leveransen påbörjas genast och att ångerrätten därmed upphör. " +
        "Villkoren står i klartext i kassan och på sidan om ångerrätt.",
      dataQ: "Vad händer med mina uppgifter om jag slutar?",
      dataA:
        "Du kan ladda ner allt kontot innehåller som en JSON-fil, och du " +
        "kan radera kontot permanent. Båda finns under Konto.",
    },
  },

  diagnostic: {
    title: "Gratis diagnos",
    lede:
      "Tolv frågor, tre per fundamental skill. Ingen inloggning, ingen " +
      "e-postadress, inget sparas. Räkna med 20–25 minuter.",
    startButton: "Starta diagnosen",
    progress: "Fråga {n} av {total}",
    skillLabel: "Fundamental skill",
    next: "Nästa",
    finish: "Se resultatet",
    back: "Föregående",
    unanswered: "Obesvarad",
    skip: "Hoppa över",
    resultTitle: "Din diagnos",
    estimateLabel: "Uppskattad kvantnivå",
    estimateRange: "Q{low}–Q{high}",
    estimateCaveat:
      "En uppskattning från tolv frågor, inte en prognos. Intervallet är " +
      "brett med flit: ett smalare tal hade låtit säkrare än underlaget " +
      "tillåter.",
    correctOf: "{correct} rätt av {total}",
    perSkillTitle: "Per fundamental skill",
    weakestTitle: "Svagast just nu",
    weakestSubtopic: "Inom {skill} ser {subtopic} svagast ut.",
    weakestSkillOnly:
      "{skill} är den svagaste av de fyra, men inget enskilt delmoment " +
      "sticker ut i underlaget.",
    perfect:
      "Alla tolv rätt. Diagnosen kan inte skilja på nivåer här uppe — " +
      "tidsatta set och de svåraste delmomenten gör det.",
    planTitle: "Första veckan, om du började i dag",
    planLede:
      "Det här är den riktiga dagsplanen, räknad på diagnosen som enda " +
      "underlag. Den ritas om varje dag när du tränar.",
    planDay: "Dag {n}",
    planRead: "Läs {subtopic}",
    planDrill: "{count} viktade frågor",
    planPatterns: "Mönsterrundor: {categories}",
    planTimed: "Tidsatt set",
    planReview: "Repetition av gårdagens missar",
    ctaTitle: "Ta med resultatet in i en plan",
    ctaBody:
      "Ett konto sparar diagnosen som utgångsläge, låser upp alla 24 " +
      "kapitel och tio frågor om dagen — utan betalning.",
    ctaButton: "Skapa konto",
    ctaSecondary: "Se vad ett betalt konto lägger till",
    retake: "Gör om diagnosen",
    bankNote:
      "Frågorna kommer ur samma verifierade bank som träningen använder.",
  },

  guides: {
    title: "Guider",
    lede:
      "Fyra texter om GMAT Focus kvantdel som är värda att läsa även om du " +
      "aldrig skapar ett konto här.",
    readingTime: "{minutes} min läsning",
    updated: "Uppdaterad {date}",
    backToGuides: "← Alla guider",
    ctaTitle: "Vill du veta var du står?",
    ctaBody: "Diagnosen tar 20 minuter och kräver inget konto.",
    ctaButton: "Gör diagnosen",
  },

  legal: {
    updated: "Senast uppdaterad {date}",
    privacyTitle: "Integritetspolicy",
    termsTitle: "Köpvillkor",
    withdrawalTitle: "Ångerrätt",
    ownerPlaceholder:
      "Uppgifter om företaget bakom Q86 fylls i innan lansering.",
  },

  cookies: {
    title: "Cookies",
    body:
      "Q86 använder nödvändiga cookies för inloggning och språkval. " +
      "Analys är anonym och sätter inga cookies förrän du säger ja.",
    accept: "Godkänn analys",
    reject: "Bara nödvändiga",
    more: "Läs mer",
    settings: "Cookie-inställningar",
  },

  email: {
    signOff: "Q86",
    footer:
      "Du får det här mejlet för att du har ett Q86-konto. Ändra vad du " +
      "får under Konto: {settingsUrl}",
    footerNoOptOut:
      "Det här är ett transaktionsmejl om ditt konto och går inte att " +
      "avregistrera sig från.",
    welcome: {
      subject: "Välkommen till Q86 — börja med att sätta ett provdatum",
      body:
        "Hej{name},\n\n" +
        "Kontot är klart. Ett råd innan du börjar: sätt ett provdatum, " +
        "även ett preliminärt. Dagsplanen räknas fram ur hur långt det är " +
        "kvar, och utan datum blir den en generell rekommendation i " +
        "stället för ett schema.\n\n" +
        "Sätt datum och se första veckan: {onboardingUrl}\n\n" +
        "Tre saker som är värda att veta:\n\n" +
        "1. Frågorna är på engelska. Undervisningen är på svenska. Så ser " +
        "provet ut, och att träna på översatta frågor tränar fel sak.\n" +
        "2. Märk varje miss med en feltyp innan du går vidare. Det tar " +
        "fem sekunder och är det som gör att planen kan ändra sig.\n" +
        "3. Gratisnivån räcker längre än du tror: alla 24 kapitel, " +
        "mönsterträningen och tio frågor om dagen.\n\n" +
        "Lycka till.",
    },
    endingSoon: {
      subject: "Din tillgång till Q86 tar slut om {days} dagar",
      body:
        "Hej{name},\n\n" +
        "Din {planName} löper ut {date}. Efter det går kontot tillbaka " +
        "till gratisnivån — all din historik, dina kort och din " +
        "repetitionskö finns kvar, men tidsatta set, analysen och " +
        "dagsplanen låses.\n\n" +
        "Förlänga eller ändra: {accountUrl}\n\n" +
        "Vill du inte förlänga behöver du inte göra någonting. Inget " +
        "förnyas automatiskt utan att du valt det.",
    },
    streakRecovery: {
      subject: "Din svit på {streak} dagar bröts i går",
      body:
        "Hej{name},\n\n" +
        "Du tränade {streak} dagar i rad och missade i går. Det är " +
        "ingenting att skämmas för; det är därför repetitionskön finns.\n\n" +
        "Om du bara har tio minuter: gör gårdagens missar. De ligger " +
        "först i kön och är det som ger mest tillbaka.\n\n" +
        "{queueUrl}\n\n" +
        "Kommer du inte igång i dag heller: sänk ambitionen till fem " +
        "frågor. En svit som börjar om är fortfarande en svit.",
    },
    weekly: {
      subject: "Veckan i Q86: {attempts} frågor, {accuracy} rätt",
      body:
        "Hej{name},\n\n" +
        "Så här såg veckan ut:\n\n" +
        "· {attempts} besvarade frågor\n" +
        "· {accuracy} rätt\n" +
        "· {days} träningsdagar av 7\n" +
        "· {reviewed} repetitioner\n\n" +
        "{weakestLine}\n\n" +
        "{testDateLine}\n\n" +
        "Nästa vecka: {todayUrl}",
      weakest: "Svagast just nu: {skill}. Planen viktar dit redan.",
      weakestNone:
        "Inget område sticker ut den här veckan, vilket brukar betyda att " +
        "det är dags för ett tidsatt set.",
      testDate: "Det är {days} dagar kvar till provdatumet.",
      testDateNone:
        "Du har inget provdatum satt. Även ett preliminärt gör planen " +
        "skarpare: {settingsUrl}",
    },
    referral: {
      subject: "{name} började träna med din kod",
      body:
        "Hej,\n\n" +
        "Någon skapade ett konto med din inbjudningskod. Ni får båda " +
        "{days} dagars full tillgång, och dina dagar är redan tillagda.\n\n" +
        "{accountUrl}",
    },
  },

  onboarding: {
    title: "Innan du börjar",
    lede:
      "Två frågor. Svaren avgör hur dagsplanen ser ut, och du kan ändra " +
      "båda när som helst under Konto.",
    dateLabel: "När skriver du provet?",
    dateHint:
      "Ett preliminärt datum duger. Planen räknar bakåt från det, och en " +
      "gissning ger en skarpare plan än inget datum alls.",
    noDateLabel: "Jag vet inte än",
    noDateHint:
      "Då körs planen i sitt jämna läge: ingen upptrappning, inga " +
      "provlika veckor. Sätt ett datum senare så ritas den om.",
    cadenceLabel: "Hur ofta vill du göra ett tidsatt set?",
    cadenceEvery: "Var {days}:e dag",
    submit: "Visa min första vecka",
    skip: "Hoppa över",
    weekTitle: "Din första vecka",
    weekLede:
      "Räknad ur dina svar. Den ritas om varje dag när du tränar — det " +
      "här är utgångsläget, inte ett schema i sten.",
    start: "Börja med dag 1",
    daysToTest: "{days} dagar kvar",
    noTestDate: "Inget provdatum satt",
  },

  progressCard: {
    title: "Framstegskort",
    lede:
      "En delbar bild med dina siffror. Ingen e-postadress, inget namn " +
      "och inga enskilda frågor — bara sammanräkningen.",
    create: "Skapa länk",
    revoke: "Återkalla länken",
    revoked: "Länken är återkallad. Gamla länkar fungerar inte längre.",
    copy: "Kopiera länk",
    copied: "Kopierad",
    shareNote:
      "Vem som helst med länken kan se kortet. Återkalla den när du vill.",
    streakDays: "dagars svit",
    questions: "frågor",
    accuracy: "rätt",
    chapters: "kapitel lästa",
    daysToTest: "dagar till provet",
    heading: "{days} dagars svit",
    subheading: "Q86 · GMAT Focus Quant",
    notFound: "Kortet finns inte, eller så har länken återkallats.",
    ownCta: "Så här ser ditt kort ut för andra.",
    visitorCta: "Träna kvantdelen med samma verktyg",
  },

  referral: {
    title: "Bjud in någon",
    lede:
      "Ge bort {days} dagars full tillgång. Du får lika många när någon " +
      "skapar ett konto med din kod.",
    yourCode: "Din kod",
    yourLink: "Din länk",
    copy: "Kopiera",
    copied: "Kopierad",
    count: "{count} personer har använt din kod",
    countNone: "Ingen har använt din kod än",
    grantedUntil: "Du har full tillgång till {date} tack vare inbjudningar",
    fieldLabel: "Inbjudningskod ({optional})",
    fieldHint: "Har du fått en kod? Ni får båda {days} dagar.",
    invalid: "Koden känns inte igen. Kontot skapas ändå.",
    honesty:
      "Ingen betalning byter händer. Det här ger tid i produkten, inte " +
      "pengar, och det finns ingen gräns på hur många du kan bjuda in.",
  },

  admin: {
    title: "Drift",
    lede:
      "Vad den här installationen är konfigurerad att göra, vad den har " +
      "kostat den här månaden, vilka konton som finns, och vad som väntar " +
      "på granskning.",
    configTitle: "Konfiguration",
    countsTitle: "Läget",
    accounts: "konton",
    paid: "betalande",
    granted: "med tilldelad tid",
    openFlags: "öppna flaggor",
    bankVerified: "verifierade frågor",
    bankRetired: "pensionerade frågor",
    emailsWeek: "mejl senaste veckan",
    spendTitle: "AI-kostnad {month}",
    spendOf: "{spent} av taket {cap}",
    route: "Slutpunkt",
    calls: "Anrop",
    failed: "Fel",
    cost: "Kostnad",
    accountsTitle: "Konton",
    account: "Konto",
    created: "Skapat",
    plan: "Plan",
    until: "Till",
    attempts: "Försök",
    viaGrant: "tilldelad tid",
    viewsTitle: "Sidvisningar, 30 dagar",
    viewsNote:
      "Aggregerad räkning utan cookies: ingen identifierare sparas, " +
      "ingenting läses från besökarens enhet, och siffran påverkas därför " +
      "inte av cookie-samtycket.",
    viewsEmpty: "Inga visningar registrerade än.",
  },

  limits: {
    rate_hour:
      "Du har använt den här funktionen många gånger den senaste timmen. " +
      "Försök igen om en stund.",
    rate_day:
      "Dagens gräns för den här funktionen är nådd. Den återställs i " +
      "morgon.",
    user_cap:
      "Månadens tak för AI-funktioner är nått på det här kontot. Det " +
      "återställs vid månadsskiftet.",
    global_cap:
      "AI-funktionerna är tillfälligt pausade för hela tjänsten. Det är " +
      "ett kostnadstak, inte ett fel — resten av plattformen fungerar som " +
      "vanligt.",
  },
} as const;
