import type { Widen } from "./types.ts";
import type { sv } from "./sv.ts";

/**
 * English fallback catalog (ADR 0004). Typed against the Swedish
 * catalog's shape, so a missing or misspelled key is a compile error.
 *
 * English is the fallback, not the default: the buyer is Swedish and the
 * product is Swedish-first. This exists for the toggle, for readers who
 * prefer it, and so that no key can ever render blank.
 */
export const en: Widen<typeof sv> = {
  common: {
    save: "Save",
    saving: "Saving\u2026",
    saved: "Saved.",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    next: "Next",
    retry: "Retry",
    loading: "Loading\u2026",
    error: "Something went wrong.",
    of: "of",
    all: "All",
    none: "None",
    optional: "optional",
    minutes: "min",
    questions: "questions",
    question: "question",
    correct: "Correct",
    wrong: "Wrong",
    accuracy: "Accuracy",
    averageTime: "Avg time",
    attempts: "attempts",
    today: "today",
    day: "day",
    days: "days",
  },

  nav: {
    primary: "Primary",
    quickAccess: "Quick access",
    today: "Today",
    learn: "Learn",
    drill: "Drill",
    timed: "Timed",
    review: "Review",
    trainers: "Trainers",
    progress: "Progress",
    stats: "Stats",
    account: "Account",
    signOut: "Sign out",
    tagline: "the target is the name",
    sectionLabel: "Section",
  },

  theme: {
    label: "Theme",
    auto: "Auto",
    night: "Night",
    paper: "Paper",
    hint:
      "Theme: auto follows your system; Night is the dark desk; Paper is " +
      "the exam-light default",
  },

  locale: {
    label: "Language",
    switchTo: "Switch to {language}",
    note:
      "Questions, answer choices and Data Sufficiency statements are always " +
      "in English \u2014 exactly as on the exam.",
  },

  footer: {
    disclaimer:
      "Q86 is an independent service, unaffiliated with GMAC. GMAT\u2122 and " +
      "GMAT Focus Edition\u2122 are trademarks of GMAC. Calibration comes " +
      "from official GMAC material only; this platform trains, official " +
      "mocks measure.",
  },

  taxonomy: {
    skill: {
      rates_ratio_percent: "Rates/Ratio/Percent",
      value_order_factors: "Value/Order/Factors",
      equal_unequal_alg: "Equalities/Inequalities/Algebra",
      counting_sets_series_prob_stats: "Counting/Sets/Series/Prob/Stats",
    },
    skillShort: {
      rates_ratio_percent: "Rates/Percent",
      value_order_factors: "VOF",
      equal_unequal_alg: "Algebra",
      counting_sets_series_prob_stats: "Counting/Stats",
    },
    subtopic: {
      prime_factorization: "Prime factorization",
      divisibility_gcf_lcm: "Divisibility, GCF & LCM",
      remainders_units_digits: "Remainders & units digits",
      parity_signs: "Parity & signs",
      consecutive_evenly_spaced: "Consecutive & evenly spaced sets",
      exponents_roots_properties: "Exponent & root properties",
      abs_value_number_line_decimals: "Absolute value, number line & decimals",
      must_be_true_testing: "Must-be-true testing",
      linear_systems: "Linear systems",
      quadratics_factoring: "Quadratics & factoring",
      inequalities: "Inequalities",
      functions_sequences: "Functions & sequences",
      algebraic_translation: "Algebraic translation",
      min_max_optimization: "Min/max optimization",
      percent_change_chains: "Percent change chains",
      ratios_proportions: "Ratios & proportions",
      rates_speed_work: "Rates, speed & work",
      mixtures_weighted_avg: "Mixtures & weighted averages",
      interest_profit_discount: "Interest, profit & discount",
      overlapping_sets: "Overlapping sets",
      combinatorics: "Combinatorics",
      probability: "Probability",
      statistics_mean_median_sd: "Statistics: mean, median & SD",
      series_patterns: "Series & patterns",
    },
    context: { pure: "Pure", real: "Real" },
    domain: { arithmetic: "Arithmetic", algebra: "Algebra" },
    format: {
      problem_solving: "Problem Solving",
      data_sufficiency: "Data Sufficiency",
    },
    errorType: {
      content_gap: "Content gap",
      setup_error: "Setup error",
      calculation_error: "Calculation error",
      misread: "Misread",
      time_pressure: "Time pressure",
      guess: "Guess",
    },
    confidence: { guess: "Guess", lean: "Lean", lock: "Lock" },
    flagReason: {
      suspected_error: "Suspected error",
      ambiguous: "Ambiguous",
      typo: "Typo / formatting",
      other: "Other",
    },
    editReason: {
      found_calc_error: "Found a calculation error",
      misread: "Misread the question",
      new_solution_path: "Found a new solution path",
    },
    difficulty: {
      "1": "D1 \u00b7 easy (approx.)",
      "2": "D2 \u00b7 easier official (approx.)",
      "3": "D3 \u00b7 mid official (approx.)",
      "4": "D4 \u00b7 hard official (approx.)",
      "5": "D5 \u00b7 hardest official (approx.)",
    },
    patternCategory: {
      units_digit_cycles: "Units-digit cycles",
      trailing_zeros_factorials: "Trailing zeros of n!",
      factor_counts: "Factor counts",
      remainder_arithmetic: "Remainder arithmetic",
      divisibility_rules: "Divisibility rules",
      parity_sign_logic: "Parity & sign logic",
      fraction_percent_pairs: "Fraction\u2013percent pairs",
      squares_cubes_powers: "Squares, cubes & powers",
      must_be_true_snap: "Must-be-true snap",
    },
  },

  sections: {
    deck: "Takeaway deck",
    queue: "Redo queue",
    patterns: "Mental math",
    decide: "Decision triage",
    mastery: "Mastery",
    analytics: "Analytics",
    import: "Import & backup",
  },


  auth: {
    signIn: "Sign in",
    signUp: "Create account",
    signInLede: "Your training, your data, your plan.",
    signUpLede: "Swedish instruction, English questions — as on the exam.",
    email: "Email",
    password: "Password",
    newPassword: "New password",
    name: "Name ({optional})",
    passwordHint: "At least 10 characters.",
    working: "One moment\u2026",
    noAccount: "No account yet?",
    createOne: "Create one",
    haveAccount: "Already have an account?",
    forgot: "Forgotten your password?",
    forgotTitle: "Forgotten password",
    forgotLede: "Enter your email and we will send a link to choose a new one.",
    forgotSubmit: "Send reset link",
    forgotSent:
      "If that address has an account, a reset link is on its way. The link " +
      "is valid for 30 minutes.",
    backToSignIn: "Back to sign-in",
    resetTitle: "Choose a new password",
    resetLede: "Every other signed-in device is signed out when you save.",
    resetSubmit: "Save new password",
    resetMissingTitle: "The link is missing",
    resetMissingLede: "Open the link from the email, or request a new reset.",
    resetMissingBody: "The address carried no reset token.",
    requestNewLink: "Request a new link",
    orDivider: "or",
    google: "Continue with Google",
    errors: {
      email_invalid: "That does not look like a valid email address.",
      email_taken:
        "An account with that address already exists. Sign in instead.",
      password_too_short: "The password must be at least 10 characters.",
      password_too_long: "That password is too long (200 characters maximum).",
      credentials_invalid: "Wrong email address or password.",
      token_invalid:
        "That link has expired or has already been used. Request a new reset.",
      oauth_failed: "The Google sign-in could not be completed. Try again.",
      oauth_state: "The sign-in took too long. Try again.",
      oauth_unconfigured: "Google sign-in is not enabled on this server.",
      generic: "Something went wrong. Try again.",
    },
    resetEmail: {
      subject: "Reset your password \u2013 Q86",
      body:
        "Hello,\n\nYou asked to reset the password for your Q86 account.\n" +
        "Follow the link below within 30 minutes:\n\n{link}\n\n" +
        "If you did not ask for this you can ignore this email. Your\n" +
        "password does not change until the link is used.\n\nQ86",
    },
  },

  billing: {
    plansHeading: "Plans",
    plansLede:
      "All prices in Swedish kronor, VAT included. Cancel whenever you " +
      "like, straight from the billing portal.",
    perMonth: "/ month",
    forMonths: "/ {months} months",
    noPayment: "No payment, no card",
    vatIncluded: "incl. {amount} VAT",
    monthlyEquivalent: "{amount}/mo",
    yourPlan: "Your plan",
    alwaysAvailable: "Always available",
    manageBelow: "Manage below",
    active: "Active",
    choose: "Choose {plan}",
    openingCheckout: "Opening checkout\u2026",
    unconfigured:
      "Payments are not configured on this installation, so the buttons " +
      "are inactive. The free tier works as usual.",
    checkoutUnavailable:
      "Payments are not enabled on this server yet. Get in touch and we " +
      "will open an account for you manually.",
    checkoutFailed: "Checkout could not be opened. Try again in a moment.",
    checkoutUnreachable: "Could not reach the payment service. Check your network.",
    portalButton: "Manage subscription, cards and receipts",
    portalOpening: "Opening\u2026",
    portalFailed: "The billing portal could not be opened right now.",
    portalUnreachable: "Could not reach the billing portal.",
    testMode:
      "Test mode: no real payment goes through. Use Stripe's test card " +
      "4242 4242 4242 4242.",
    plans: {
      free: {
        name: "Free",
        tagline: "Read everything, train daily, see whether the method fits.",
        bullet1: "All 24 chapters",
        bullet2: "{limit} questions a day from the verified bank",
        bullet3: "Unlimited pattern training",
        bullet4: "A free diagnostic with a predicted band",
        bullet5: "",
      },
      monthly: {
        name: "Monthly",
        tagline: "The whole platform, cancellable at any time.",
        bullet1: "Unlimited questions",
        bullet2: "Timed sets and full section simulation with Review & Edit",
        bullet3: "Redo queue, takeaway deck and mastery ladders",
        bullet4: "Analytics in the shape of your real score report",
        bullet5: "Whiteboard post-mortem and score-report import",
      },
      sprint: {
        name: "GMAT sprint",
        tagline: "Three months, one fixed price, nothing that renews.",
        bullet1: "Everything in Monthly, for three months",
        bullet2: "Paid once \u2014 no renewal to remember",
        bullet3: "Works out at {monthly} a month",
        bullet4: "For anyone who already has a test date booked",
        bullet5: "",
      },
    },
  },

  account: {
    title: "Account",
    paymentDone:
      "Thank you \u2014 the payment is recorded. If the plan below has not " +
      "updated yet, Stripe takes a few seconds; reload the page.",
    paymentCancelled: "Checkout was cancelled. Nothing has been charged.",
    lockedTitle: "{feature} is not part of your plan",
    lockedBody:
      "The free tier includes the chapters, the pattern trainer and {limit} " +
      "questions a day. The rest opens with Monthly or GMAT sprint.",
    usedToday: "{used} / {limit} questions today",
    renews: "renews",
    endsOn: "ends",
    validUntil: "valid until",
    paymentProblem:
      "Stripe could not take the payment. Update the card below before the " +
      "period ends to keep your access.",
    dataTitle: "Your data",
    dataLede:
      "You can download everything Q86 holds about you, as a JSON file, at " +
      "any time.",
    dataDownload: "Download my data \u2193",
    status: {
      none: "No subscription",
      trialing: "Trial",
      active: "Active",
      past_due: "Payment failed",
      canceled: "Cancelled",
      incomplete: "Incomplete",
      unpaid: "Unpaid",
      expired: "Ended",
    },
    feature: {
      learn: "the chapters",
      drill: "drilling",
      patterns: "the pattern trainer",
      diagnostic: "the diagnostic",
      timed: "timed sets and section simulation",
      queue: "the redo queue",
      deck: "the takeaway deck",
      analytics: "the analytics",
      mastery: "the mastery ladders",
      decide: "the decision drills",
      plan: "the daily plan",
      coach: "the whiteboard post-mortem",
      import: "score-report import",
    },
  },

  lesson: {
    answerChoices: "Answer choices",
    example: "Example {n}",
    answer: "Answer",
    levelWarmup: "Warm-up",
    levelCore: "Core",
    levelExam: "Exam-level",
    hideSolution: "Hide the solution",
    revealSolution: "Try it on paper first \u2014 then reveal the solution",
    onThisPage: "On this page",
    whenYouSee: "When you see",
    reachFor: "\u2192 Reach for",
    checklistLede: "Tick each one honestly \u2014 then go prove it.",
    checklistAllDone: "All checked \u2014 prove it on the test.",
    checklistTestPassed: "Test passed \u2713",
    checklistLastScore: "last {score}",
    checklistLastTest: "Last test: {score} \u2014 the bar is 6/8.",
    checklistHonest: "The drill will tell you if the ticks were honest.",
    drillNow: "Drill this now \u2192",
    chapterTest: "Chapter test \u2192",
    retakeTest: "Retake the test",
  },

  learn: {
    title: "Learn",
    lede: "{count} concept chapters, one per drillable subtopic",
    ledeWithTests: "{count} concept chapters \u2014 {passed} tests passed",
    empty: "Chapters are being written \u2014 check back shortly.",
    chapters: "{count} chapters",
    chapterOf: "Chapter {n} of {total}",
    workedExamples: "3 worked examples",
    testPassed: "\u2713 test passed",
    testScore: "test {correct}/{total}",
    previousChapter: "\u2190 Previous chapter",
    nextChapter: "Next chapter \u2192",
    method: {
      readStep: "Read",
      readDetail: "the core ideas and cues",
      attemptStep: "Attempt",
      attemptDetail: "each example before revealing",
      tickStep: "Tick",
      tickDetail: "the pre-drill checklist honestly",
      drillStep: "Drill",
      drillDetail: "the same subtopic while it's warm",
    },
    section: {
      whyTitle: "Why this matters",
      ideasTitle: "The core ideas",
      ideasTagline: "the complete toolkit",
      examplesTitle: "Worked examples",
      examplesTagline: "easy \u2192 exam-hard, try before revealing",
      cuesTitle: "Trigger cues",
      cuesTagline: "phrase \u2192 method, memorize these",
      trapsTitle: "Trap gallery",
      trapsTagline: "the classic wrong turns",
      speedTitle: "Speed moves",
      speedTagline: "legitimate shortcuts",
      checklistTitle: "Before you drill",
    },
  },

  drill: {
    title: "Drill",
    selecting: "Selecting questions\u2026",
    couldNotStart: "Could not start.",
    couldNotStartDrill: "Could not start the drill \u2014 the server did not respond.",
    couldNotStartTest: "Could not start the test \u2014 the server did not respond.",
    fastestPath: "Fastest path",
    trapAnatomy: "Trap anatomy",
    yourHistory: "Your history on this question",
    flagPrompt: "Something wrong with this question? Flag it",
    flagged: "Flagged \u2014 it is waiting in the review list.",
    flagNote: "What looks wrong? (optional)",
    flagging: "Flagging\u2026",
    flagSubmit: "Flag question",
  },

  deck: {
    title: "Takeaway deck",
    lede:
      "Front: when to reach for the method. Back: the takeaway. Grade " +
      "honestly \u2014 cards you know stretch to longer intervals, cards you " +
      "forget come back tomorrow.",
    counts: "{due} due · {fresh} new misses · {scheduled} scheduled ahead",
    empty:
      "Nothing due \u2014 the deck builds itself from questions you miss, and " +
      "cards you have graded return when their interval comes up.",
    goDrill: "Go drill \u2192",
    done: "Deck done \u2014 {count} takeaways graded.",
    doneNote:
      "Two minutes that compound. The cards you knew are scheduled out; the " +
      "ones you forgot return tomorrow.",
    new: "new",
    takeaway: "Takeaway",
    triggerCue: "Trigger cue",
    missed: "missed {when}",
    flipHint: "Enter to flip",
    forgot: "Forgot",
    hard: "Hard",
    good: "Good",
    resolve: "Re-solve the question this came from \u2192",
  },

  decide: {
    title: "Decision drills",
    lede:
      "45 seconds per question: commit to solve, guess, or bail \u2014 without " +
      "solving. Judged against your own record on questions like it.",
    empty: "No questions available.",
    introTitle: "{count} questions · 45 seconds each",
    introBody:
      "Read the question. Do NOT solve it. Commit to a pacing call: {s} solve " +
      "now, {g} eliminate and take an educated guess, {b} bail \u2014 pick " +
      "anything and bank the time. Letting the clock run out counts as an " +
      "unforced \"solve\".",
    start: "Start · Enter",
    doneTitle: "{aligned} / {total} calls aligned with your record",
    doneBody:
      "Alignment is not obedience \u2014 a deliberate stretch is fine. The " +
      "habit that matters: decide in 45 seconds and never grind by inertia.",
    callSolve: "Solve",
    callGuess: "Educated guess",
    callBail: "Bail",
    youCalled: "You called",
    yourRecordOn: "Your record on",
    withSample: "{percent} over {sample} attempts",
    noSample: "no data yet \u2014 difficulty prior {percent}",
    whichPointsTo: "which points to",
    nextHint: "Enter for the next question",
  },

  settings: {
    testDate: "Test date",
    timedSetEvery: "Timed set every",
    daysUnit: "day",
    saveSettings: "Save settings",
    saveFailed: "Saving failed \u2014 retry.",
  },

  flags: {
    title: "Content flags",
    open: "{count} open",
    note: "Note:",
    dismiss: "Dismiss \u2014 question is fine",
    retire: "Retire question",
    retired: "retired",
  },

  drillRunner: {
    confidence: "Confidence",
    pickAnswer: "Pick an answer \u2014 keys 1\u20135 or A\u2013E.",
    setConfidence: "Set confidence first \u2014 G guess, L lean, K lock.",
    confirmAnswer: "Confirm answer",
    sendToPostmortem: "Send to post-mortem",
    nextQuestion: "Next question",
    finish: "Finish",
    tagTheMiss: "Tag the miss (keys 1\u20136):",
    notSaved: "This attempt was not saved \u2014 check that the server can reach the database.",
    chapterTestPassed: "Chapter test passed",
    notPassedYet: "Not passed yet",
    passedBody:
      "{correct}/{total} \u2014 this chapter now shows as passed on the Learn " +
      "index. Keep it warm with drills; retakes cannot demote you.",
    notPassedBody:
      "{correct}/{total}, and the bar is {bar}/{total}. Post-mortem the misses " +
      "below, revisit the trap gallery, then retake.",
    backToChapter: "Back to the chapter",
    retakeFresh: "Retake with fresh questions \u2192",
    paperTrail: "The paper trail",
    redoComplete: "Redo complete",
    drillComplete: "Drill complete",
    subtopicColumn: "Subtopic",
    resultColumn: "Result",
    timeColumn: "Time",
    postmortemLink: "Post-mortem",
    setUpAnother: "Set up another drill",
    backToToday: "Back to today",
    redoTag: "redo",
    casualTag: "casual",
  },

  runner: {
    questionOf: "Question {n} of {total}",
  },

  drillSetup: {
    skill: "Skill",
    allSkills: "All skills",
    subtopics: "Subtopics",
    subtopicsHint: "none selected = all of them",
    difficulty: "Difficulty",
    minDifficulty: "Minimum difficulty",
    maxDifficulty: "Maximum difficulty",
    to: "to",
    difficultyNote: "Approximate: D3 \u2248 mid official, D5 \u2248 hardest.",
    questionCount: "Questions",
    timing: "Timing",
    untimed: "Untimed",
    softTarget: "Soft 2:15 target",
    format: "Format",
    bothFormats: "Both",
    sessionFocus: "Session focus",
    focused: "Focused \u2014 counts in statistics",
    casual: "Casual \u2014 excluded from statistics",
    casualNote:
      "Casual attempts stay out of analytics, calibration and the daily plan. " +
      "Misses still join the redo queue.",
    startDrill: "Start drill: {count} questions",
    matching: "{count} verified questions match this filter",
    clamped: " \u2014 drill clamped to match",
    generateTitle: "Generate more questions",
    generateLede:
      "Ten fresh questions matching the filter above, each independently " +
      "verified before it can appear in a drill.",
    generateButton: "Generate 10 more",
    generating: "Generating questions\u2026",
    verifying: "Verifying questions\u2026",
    generatedVerified: "{count} verified",
    generatedFailed: "{count} failed verification",
    generateFailed:
      "Generation failed. Check ANTHROPIC_API_KEY and retry.",
  },

  pages: {
    analytics: "Analytics",
    analyticsCasual:
      "{count} casual-session attempts are excluded from every figure on this page.",
    mastery: "Mastery ladders",
    masteryLede:
      "A rung clears at \u2265{bar} over your last 10 attempts (minimum " +
      "{minimum}). {mastered} of {total} ladders fully climbed.",
    masteryClimbed: "CLIMBED",
    patterns: "Pattern trainer",
    queue: "Redo queue & error log",
    timed: "Timed sets",
    postmortem: "Whiteboard post-mortem",
    import: "Score-report import",
    importBackupTitle: "Back up your data",
    importBackupLede:
      "One JSON file with everything Q86 holds about your account: attempts, " +
      "sessions, deck scheduling, flags and settings. This is also the GDPR " +
      "data export.",
    importBackupButton: "Download backup \u2193",
    importBaselines: "Imported baselines · {count}",
    importBaselinesLede:
      "The most recent import seeds the daily plan's weakness weights.",
    importTest: "test {date}",
  },

  capture: {
    useWebcam: "Use the webcam",
    closeCamera: "Close camera",
    captureFrame: "Capture this frame",
    uploadPhoto: "Upload a photo",
    compressing: "Compressing\u2026",
    cameraDenied:
      "Camera unavailable or permission denied \u2014 upload a photo or paste " +
      "from the clipboard instead.",
  },

  timed: {
    fullSection: "Full section",
    miniSet: "Mini set",
    startFull: "Start 21-question section",
    startMini: "Start 7-question mini",
    showTimer:
      "Show the per-question timer (hidden by default, like the real exam)",
    casualSession:
      "Casual session \u2014 exclude this set from analytics and the daily plan",
    assembling: "Assembling the set\u2026",
    marking: "Marking the section\u2026",
    couldNotStart: "Could not start.",
    couldNotStartSet: "Could not start the set \u2014 the server did not respond.",
    saveFailed:
      "Saving failed. Your results are still on this screen \u2014 retry.",
    retrySave: "Retry saving the session",
    mustAnswer: "You must answer to advance \u2014 keys 1\u20135 or A\u2013E.",
    setConfidence: "Set confidence first \u2014 G guess, L lean, K lock.",
    confirmAndAdvance: "Confirm and advance",
    confirmFinal: "Confirm final answer",
    pastCheckpoint: "Past the 2:45 checkpoint",
    bookmark: "Bookmark",
    bookmarked: "Bookmarked",
    reviewAndEdit: "Review & Edit",
    submitSection: "Submit section and see the marking",
    keepOriginal: "Keep the original answer",
    commitChange: "Commit the change",
    editedThisSession: "Edited this session",
    justificationPlaceholder:
      "Name the specific error: which line, which number, which condition you misread\u2026",
  },

  review: {
    questionEdits: "Question {n} · edits used {used}/{max}",
    editsUsed: "edits used {used}/{max}",
    limitReached: "Edit limit reached ({max}). Answers are locked.",
    changingLede:
      "You are changing this answer. Name the specific error you found \u2014 " +
      "a feeling is not a reason.",
    answered: "answered",
    yourRecord:
      "Your record: quant edits have destroyed more points than they earned. " +
      "Open a question only if you can name a specific error.",
  },

  timedConfig: {
    fullLede:
      "21 questions, 45:00, weighted mix across all four skills. Faithful " +
      "mechanics: answer to advance, B bookmarks, review screen with up to " +
      "3 edits if time remains.",
    miniLede: "7 questions, 15:00. Mixed or single-skill.",
    mixed: "Mixed",
    needsQuestions: "Needs {needed} verified questions; the bank has {available}.",
    onThisQuestion: "on this question",
    keyboardHelp:
      "1\u20135 or A/C/D/E select · B bookmark · G/L/K confidence · Enter " +
      "confirm \u2014 you cannot return until the review screen",
  },

  marking: {
    sectionMarked: "Section marked",
    columnQ: "Q#",
    columnDomain: "Domain",
    columnContext: "Context",
    columnSkill: "Skill",
    notReachedCell: "not reached",
    editedFromTo: "edited {from}\u2192{to}",
    sectionAccuracy: "Section accuracy",
    timeViolations: "Time violations (>2:45)",
    sub60Wrong: "Sub-60s wrong",
    editNetSession: "Edit net (this session)",
    editNetLifetime: "Edit net (lifetime)",
    notReachedNote:
      "{count} questions were never reached \u2014 the clock beat you to them.",
    editsThisSession: "Edits this session",
    outcomeNoChange: "no change",
    outcomeFixed: "fixed a wrong answer (+1)",
    outcomeDestroyed: "destroyed a correct answer (\u22121)",
    outcomeWrongEither: "wrong either way (0)",
    setUpAnother: "Set up another timed set",
    reviewSummary: "Q{n} \u2014 you picked {picked}, correct is {correct}",
    pacingRead: "Pacing read",
    pacingLede:
      "Benchmarks by difficulty \u2014 harder questions earn more of the " +
      "128s/question budget.",
    pacingRow: "D{difficulty} · you {yours} · bench {bench} · \u00d7{n}",
    timeSinks: "Time sinks:",
    timeSinksNote:
      " \u2014 every sink past 1.5\u00d7 benchmark is a bail you did not take.",
    sinkItem: "Q{n} ({time} on D{difficulty}, bench {bench})",
    rushedWrong: "Rushed and wrong:",
    rushedWrongNote: " \u2014 seconds saved there were spent on the sinks.",
    cleanPacing: "Clean pacing \u2014 no sinks, no panic answers.",
  },

  queue: {
    couldNotStart: "Could not start the redo run.",
    couldNotStartServer: "Could not start the redo run \u2014 the server did not respond.",
    dueNow: "Due now · {count}",
    redoAll: "Redo all {count} due",
    redoThis: "Redo this one",
    nothingDue: "Nothing due. Start a drill or a timed set.",
    stageNote:
      "Stage-2 items clear only when solved unaided within 2:30 \u2014 " +
      "otherwise they re-enter at stage 1.",
    stage0: "stage 0 · +2d",
    stage1: "stage 1 · +7d",
    stage2: "stage 2 · +21d cold-solve",
    stageN: "stage {n}",
    due: "due {when}",
    scheduled: "Scheduled · {count}",
    errorLog: "Error log",
    logCount: "{shown} of {total} attempts",
    exportCsv: "Export CSV ({rows} rows)",
    filterBySkill: "Filter by skill",
    filterByErrorType: "Filter by error type",
    filterByResult: "Filter by result",
    allErrorTypes: "All error types",
    allResults: "All results",
    wrongOnly: "Wrong only",
    correctOnly: "Correct only",
    columnWhen: "When",
    columnMode: "Mode",
    columnError: "Error",
    columnNotes: "Notes",
    noMatches: "No attempts match these filters.",
  },

  patterns: {
    mixed: "Mixed",
    mixedLede: "All nine categories, shuffled",
    dayStreak: "day streak",
    bestStreak: "best {best} · streak {streak}",
    saving: "Saving the round\u2026",
    saveFailed:
      "The round could not be saved \u2014 the server did not respond. " +
      "Ratings are unchanged.",
    score: "Score",
    yourAnswer: "Your answer",
    typeNumber: "Type the number",
    typeNumberHint: "Type the number, Enter answers",
    keysAnswer: "Keys 1\u20134 answer",
    answerLabel: "Answer:",
    answer: "Answer",
    anotherRound: "Another round",
    changeCategory: "Change category",
    ratingChanges: "Rating changes",
    elo: "ELO",
  },

  patternsMore: {
    roundsLede:
      "90-second rounds · answers computed by code, instant and always correct",
    bestRound: "best round {count}",
    bestStreakAnswered: "best {best} · streak {streak} · {answered} answered",
    startRound: "Start 90-second round: {category}",
    newPersonalBest: "New personal best: {current} (previous {previous}).",
    correctOf: " / {answered} correct",
    streakShort: "streak {count}",
  },

  postmortem: {
    correct: "Correct",
    wrong: "Wrong",
    confidenceChip: "{level} confidence",
    theQuestion: "The question",
    scratchWork: "Scratch work",
    scratchLede:
      "Photograph exactly what you wrote \u2014 the coach finds the line where " +
      "the work left the rails.",
    runCoach: "Run the post-mortem",
    rerunCoach: "Re-run the post-mortem",
    stageReading: "Reading the whiteboard\u2026",
    stageClassifying: "Classifying the miss\u2026",
    stagePrescribing: "Writing the prescription\u2026",
    coachFailed: "The coach call failed. Check ANTHROPIC_API_KEY and retry.",
    savedPostmortem: "Saved post-mortem",
    divergencePoint: "Divergence point",
    diagnosis: "Diagnosis",
    fastestVsYours: "Fastest path vs. your path",
    triggerCue: "Trigger cue",
    prescription: "Prescription",
    classification: "Classification",
    classificationHint:
      "AI-suggested \u2014 confirm or override before it enters the log",
    failedSubtopic: "Failed subtopic",
    notePlaceholder: "Your own note on this miss (optional)",
    confirmClassification: "Confirm classification",
    logged: "Logged.",
    twinTitle: "Twin drills",
    twinLede:
      "Two fresh twins of this question \u2014 same math skeleton, opposite " +
      "context ({context}). Both verified before they can appear.",
    twinQueue: "Queue two verified twin drills",
    twinWorking: "Generating and verifying twins\u2026",
    twinVerified: "{count} twins verified",
    twinFailed: "{count} failed verification",
    twinDrill: "Drill the twins now",
    twinError: "Twin generation failed. Retry.",
  },

  prescriptionLine: {
    text: "{count} questions of {subtopic}.",
  },

  importer: {
    pasteTitle: "Paste the score report text",
    pasteLede:
      "Copy everything from the official report page \u2014 scores, percentile " +
      "tables, per-question timing if you have it. The parsed result is shown " +
      "for confirmation before anything is saved.",
    pastePlaceholder: "Paste the raw report text here\u2026",
    parseButton: "Parse the report",
    parsing: "Reading the report\u2026",
    parseFailed: "Parsing failed. Check ANTHROPIC_API_KEY and retry.",
    saved: "Baseline saved \u2014 the daily plan now blends it into the weights.",
    saveFailed: "Saving failed \u2014 the parsed report was not stored. Retry.",
    parsedTitle: "Parsed result \u2014 confirm before saving",
    sections: "Sections",
    total: "Total",
    quantSkills: "Quant fundamental skills",
    noneInText: "None found in the text.",
    domainsContexts: "Domains & contexts",
    noneFound: "None found.",
    percentile: "{value}th pct",
    timingRows: "{count} per-question timing rows captured.",
    testDate: "Test date: {date}",
    confirmSave: "Confirm and save as baseline",
    discard: "Discard the parse",
    sectionQuant: "Quantitative Reasoning",
    sectionVerbal: "Verbal Reasoning",
    sectionDataInsights: "Data Insights",
  },

  dashboard: {
    title: "Today",
    freeTierTitle: "Free tier.",
    freeTierBody: "All chapters, the pattern trainer and {limit} questions a day.",
    freeTierUsage: "{used} / {limit} today",
    seePlans: "see plans",
    daysToTest: "days to the test",
    setTestDate: "Set your test date so the plan can pace itself.",
    firstRunTitle: "New here? The loop is simple.",
    firstRunReadLink: "Read a chapter",
    firstRunReadRest:
      "on a topic you want to sharpen \u2014 each one ends with a checklist.",
    firstRunDrillLink: "Drill it immediately",
    firstRunDrillRest:
      "\u2014 every miss is dissected: fastest path, trap anatomy, takeaway.",
    firstRunReturn:
      "Come back tomorrow: your misses return as flashcards and spaced redos in",
    firstRunReviewLink: "Review",
    firstRunReturnEnd: ", and this page starts planning your days.",
    mockToday: "Official mock today \u2014 take it, then import the score report.",
    mockInDays: "Next official mock in {days} days.",
    patternRoundsTitle: "Pattern rounds",
    patternRoundsBody: "Two lowest-ELO categories:",
    startRound: "Start round {n}: {category} \u2192",
    weightedDrillTitle: "Weighted drill · {count} questions",
    startTodaysDrill: "Start today's drill: {count} questions \u2192",
    bankEmpty: "The bank is empty.",
    reviewTitle: "Review",
    redosDue: "{count} redos due",
    noRedosDue: "No redos due",
    deckWaiting: "{count} deck cards waiting",
    deckClear: "deck clear",
    flipDeck: "Flip the deck: {count} cards \u2192",
    redoAllDue: "Redo all {count} due \u2192",
    openQueue: "Open the queue \u2192",
    timedSetTitle: "Timed set",
    timedToday: "Scheduled today: full 21-question section.",
    timedNext: "Next scheduled in {days} days (every {cadence}).",
    startFullSection: "Start 21-question section \u2192",
    timedSetsLink: "Timed sets \u2192",
    weightsTitle: "Skill weights driving today's mix",
    weightsLede:
      "Rolling last-30-attempt accuracy blended 50/50 with the imported " +
      "baseline; a 5% floor keeps every skill in rotation.",
    recentRecord: "{correct}/{total} recent",
    noData: "no data",
  },

  phase: {
    foundations: "Foundations",
    accuracy: "Accuracy",
    speed: "Speed",
    peak: "Peak week",
    foundationsNote:
      "Build coverage: climb the mastery ladders and keep every skill in rotation.",
    accuracyNote:
      "Error discipline: clear the redo queue daily and post-mortem every miss.",
    speedNote:
      "Pacing under pressure: timed sets every other day; decisions beat perfection.",
    peakNote:
      "Taper: light mixed review, takeaway deck, sleep. No new material.",
  },

  analytics: {
    mirrorTitle: "Score-report mirror",
    mirrorSubtitle:
      "Accuracy by domain, context, and fundamental skill \u2014 same cuts as " +
      "the official report. {count} attempts.",
    contentDomain: "Content domain",
    context: "Context",
    fundamentalSkill: "Fundamental skill",
    heatmapTitle: "Miss heatmap",
    heatmapSubtitle: "Classified wrong answers: subtopic \u00d7 error type.",
    heatmapCell: "{subtopic} \u00d7 {errorType}: {count}",
    difficultyTitle: "Accuracy by difficulty",
    difficultySubtitle:
      "Where exactly each subtopic breaks: accuracy per difficulty tier, " +
      "focused attempts only.",
    noAttemptsYet: "No attempts yet \u2014 the matrix fills in as you train.",
    volumeTitle: "Training volume",
    volumeSubtitle:
      "Focused attempts per day, last 12 weeks. Consistency beats intensity.",
    volumeCell: "{date}: {count} attempts",
    scatterTitle: "Time vs. accuracy",
    scatterSubtitle:
      "Every attempt is a dot. The shaded zones are the two documented " +
      "failure modes.",
    pastCheckpoint: "Attempts past 2:45",
    sub60Wrong: "Sub-60s wrong answers",
    axisTime: "Time",
    axisDifficulty: "Difficulty",
    zonePast245: "past 2:45",
    zoneSub60: "sub-60s",
    ledgerTitle: "Edit ledger",
    ledgerSubtitle: "Every Review & Edit answer change, lifetime.",
    lifetimeNet: "Lifetime net points from edits",
    editsMade: "Edits made",
    fixedWrong: "Fixed a wrong answer",
    destroyedCorrect: "Destroyed a correct answer",
    lockChanged: "Lock-confidence correct answers changed",
    columnWhen: "When",
    columnReason: "Reason",
    columnOutcome: "Outcome",
    columnJustification: "Justification",
    outcomeFixed: "+1 fixed",
    outcomeDestroyed: "\u22121 destroyed",
    outcomeNeutral: "0 neutral",
    calibrationTitle: "Calibration",
    calibrationSubtitle:
      "Accuracy by pre-answer confidence: expected vs. actual.",
    expected: "Expected",
    actual: "Actual",
    trendTitle: "Rolling 7-day accuracy by skill",
    trendSubtitle:
      "Each point is the trailing 7-day accuracy on that day; gaps mean no " +
      "attempts in the window.",
    redoTitle: "Redo-queue compliance",
    redoSubtitle: "Spaced redos: what is open, overdue, and cleared.",
    redoOpen: "Open",
    redoOverdue: "Overdue",
    redoCleared: "Cleared (cold-solved)",
    eloTitle: "Pattern-trainer ELO",
    eloSubtitle: "Per-category rating; the line marks the 1200 start.",
  },

  fallback: {
    chapterInEnglish:
      "This chapter is not available in Swedish yet, so you are reading the " +
      "English original.",
  },
};
