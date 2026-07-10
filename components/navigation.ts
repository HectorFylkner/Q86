import {
  BookOpen,
  Calculator,
  CardsThree,
  ChartBar,
  ChartLineUp,
  ClockCounterClockwise,
  Crosshair,
  Exam,
  Gauge,
  House,
  Lightning,
  Path,
  ShieldCheck,
  Target,
  Timer,
  UploadSimple,
  type Icon,
} from "@phosphor-icons/react";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  routes: readonly string[];
  keywords: readonly string[];
  icon: Icon;
};

export type NavigationGroup = {
  id: string;
  label: string;
  items: readonly NavigationItem[];
};

const today = {
  href: "/",
  label: "Today",
  description: "See the adaptive plan and the next best action.",
  routes: ["/"],
  keywords: ["home", "plan", "daily"],
  icon: House,
} satisfies NavigationItem;

const learn = {
  href: "/learn",
  label: "Learn",
  description: "Read concept chapters and prepare for chapter tests.",
  routes: ["/learn"],
  keywords: ["chapter", "lesson", "concept"],
  icon: BookOpen,
} satisfies NavigationItem;

const drill = {
  href: "/drill",
  label: "Drill",
  description: "Build a focused set by skill, subtopic, and difficulty.",
  routes: ["/drill", "/postmortem"],
  keywords: ["practice", "questions", "postmortem"],
  icon: Crosshair,
} satisfies NavigationItem;

const timed = {
  href: "/timed",
  label: "Timed",
  description: "Run a mini set or a full 21-question section.",
  routes: ["/timed"],
  keywords: ["section", "exam", "clock"],
  icon: Timer,
} satisfies NavigationItem;

const review = {
  href: "/deck",
  label: "Review",
  description: "Recall takeaways and revisit scheduled misses.",
  routes: ["/deck", "/queue"],
  keywords: ["deck", "redo", "flashcards"],
  icon: CardsThree,
} satisfies NavigationItem;

const trainers = {
  href: "/patterns",
  label: "Trainers",
  description: "Sharpen recognition speed and pacing decisions.",
  routes: ["/patterns", "/decide"],
  keywords: ["mental math", "decision", "elo"],
  icon: Lightning,
} satisfies NavigationItem;

const progress = {
  href: "/mastery",
  label: "Progress",
  description: "Inspect mastery, analytics, and score-report baselines.",
  routes: ["/mastery", "/analytics", "/quality", "/import"],
  keywords: ["stats", "mastery", "analytics", "backup"],
  icon: ChartLineUp,
} satisfies NavigationItem;

const stats = {
  ...progress,
  href: "/analytics",
  label: "Stats",
  icon: ChartBar,
} satisfies NavigationItem;

export const PRIMARY_LINKS = [
  today,
  learn,
  drill,
  timed,
  review,
  trainers,
  progress,
] as const satisfies readonly NavigationItem[];

export const BOTTOM_LINKS = [
  today,
  drill,
  timed,
  review,
  stats,
] as const satisfies readonly NavigationItem[];

export const QUICK_GROUPS = [
  {
    id: "practice",
    label: "Plan and practice",
    items: [today, learn, drill, timed],
  },
  {
    id: "review",
    label: "Review",
    items: [
      {
        ...review,
        label: "Takeaway deck",
      },
      {
        href: "/queue",
        label: "Redo queue",
        description: "Clear due redos and inspect the error log.",
        routes: ["/queue"],
        keywords: ["review", "misses", "errors", "due"],
        icon: ClockCounterClockwise,
      },
    ],
  },
  {
    id: "trainers",
    label: "Fast trainers",
    items: [
      {
        ...trainers,
        label: "Mental math",
      },
      {
        href: "/decide",
        label: "Decision triage",
        description: "Practice solve, guess, or bail decisions under pressure.",
        routes: ["/decide"],
        keywords: ["pacing", "decision", "guess", "bail"],
        icon: Gauge,
      },
    ],
  },
  {
    id: "progress",
    label: "Measure and manage",
    items: [
      {
        ...progress,
        label: "Mastery ladders",
        description: "See the next difficulty rung for every subtopic.",
        routes: ["/mastery"],
        keywords: ["progress", "difficulty", "rungs"],
        icon: Path,
      },
      {
        href: "/analytics",
        label: "Analytics",
        description: "Find timing, accuracy, and error-pattern evidence.",
        routes: ["/analytics"],
        keywords: ["stats", "charts", "report", "data"],
        icon: ChartBar,
      },
      {
        href: "/quality",
        label: "Question QA",
        description: "Human-review model-checked candidates before training.",
        routes: ["/quality"],
        keywords: ["quarantine", "approve", "generated", "twins"],
        icon: ShieldCheck,
      },
      {
        href: "/import",
        label: "Import and backup",
        description: "Import an official report or export your training data.",
        routes: ["/import"],
        keywords: ["score report", "restore", "export"],
        icon: UploadSimple,
      },
    ],
  },
  {
    id: "start",
    label: "Start now",
    items: [
      {
        href: "/drill?plan=1",
        label: "Today’s weighted drill",
        description: "Start the adaptive question mix without setup.",
        routes: [],
        keywords: ["quick start", "daily plan", "adaptive"],
        icon: Target,
      },
      {
        href: "/timed?start=full",
        label: "Full timed section",
        description: "Begin 21 questions with the official time limit.",
        routes: [],
        keywords: ["quick start", "45 minutes", "section"],
        icon: Exam,
      },
      {
        href: "/timed?start=mini",
        label: "Seven-question mini",
        description: "Begin a compact 15-minute timed set.",
        routes: [],
        keywords: ["quick start", "15 minutes", "mini"],
        icon: Timer,
      },
      {
        href: "/queue?start=1",
        label: "Redo everything due",
        description: "Start a run containing every currently due redo.",
        routes: [],
        keywords: ["quick start", "review", "queue"],
        icon: ClockCounterClockwise,
      },
      {
        href: "/patterns",
        label: "Mental-math round",
        description: "Choose a category and launch a 90-second round.",
        routes: [],
        keywords: ["quick start", "patterns", "calculator"],
        icon: Calculator,
      },
    ],
  },
] as const satisfies readonly NavigationGroup[];

export function isNavigationItemActive(
  routes: readonly string[],
  pathname: string,
): boolean {
  return routes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
}
