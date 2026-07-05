// Splits a lesson body (the platform's markdown dialect) into its seven
// canonical sections so each can get a purpose-built visual treatment.
// Every chapter is authored against this exact template; if a file ever
// deviates, parseLesson returns null and the page falls back to rendering
// the whole body through <Md>.

export type WorkedExample = {
  n: number;
  question: string; // italic wrapper stripped
  work: string; // everything between question and answer line
  answer: string; // "**Answer: …**" with marker stripped
};

export type Cue = { see: string; act: string | null };

export type Titled = { name: string | null; body: string };

export type ParsedLesson = {
  why: string;
  ideasIntro: string;
  ideas: string[];
  examples: WorkedExample[];
  cues: Cue[];
  traps: Titled[];
  speed: Titled[];
  checklist: string[];
};

const SECTIONS = [
  "Why this matters",
  "The core ideas",
  "Worked examples",
  "Trigger cues",
  "Trap gallery",
  "Speed moves",
  "Before you drill",
] as const;

function splitSections(body: string): Map<string, string> | null {
  const map = new Map<string, string>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current) map.set(current, buf.join("\n").trim());
    buf = [];
  };
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(.*?)\s*$/);
    if (h && !line.startsWith("###")) {
      flush();
      current = h[1];
    } else {
      buf.push(line);
    }
  }
  flush();
  for (const name of SECTIONS) if (!map.has(name)) return null;
  return map;
}

/** "1. …" items; lines before the first item form an intro. Continuation
 *  lines (including $$…$$ blocks) attach to the current item. */
function parseNumbered(text: string): { intro: string; items: string[] } {
  const intro: string[] = [];
  const items: string[] = [];
  for (const line of text.split("\n")) {
    if (/^\d+[.)]\s+/.test(line)) {
      items.push(line.replace(/^\d+[.)]\s+/, ""));
    } else if (items.length === 0) {
      intro.push(line);
    } else if (line.trim()) {
      items[items.length - 1] += "\n" + line;
    }
  }
  return { intro: intro.join("\n").trim(), items };
}

/** "- …" items; wrapped continuation lines attach to the current item. */
function parseBullets(text: string): string[] {
  const items: string[] = [];
  for (const line of text.split("\n")) {
    if (/^[-*]\s+/.test(line)) {
      items.push(line.replace(/^[-*]\s+/, ""));
    } else if (items.length > 0 && line.trim()) {
      items[items.length - 1] += "\n" + line;
    }
  }
  return items;
}

/** A paragraph fully wrapped in single-star italics (a question, or a
 *  listed set of answer choices that belongs with it). */
function isItalicPara(p: string): boolean {
  return (
    p.startsWith("*") &&
    !p.startsWith("**") &&
    p.endsWith("*") &&
    !p.endsWith("**")
  );
}

function stripItalicWrapper(p: string): string {
  return isItalicPara(p) ? p.slice(1, -1).trim() : p;
}

/** Authors separate listed answer choices ("A) …  B) …") and roman-numeral
 *  statements with double spaces, which HTML collapses into ordinary word
 *  spacing. Stack them one per line, GMAT-style. */
function splitChoiceRuns(p: string): string {
  const parts = p.split(/\s{2,}(?=(?:[A-E]\)|(?:I{1,3}|IV|V)\.)\s)/);
  return parts.length >= 3 ? parts.map((s) => s.trim()).join("\n") : p;
}

function parseExamples(text: string): WorkedExample[] {
  // Markers appear as "**Example 1**" alone on a line, or with the
  // question on the same line (optionally after an em-dash).
  const marker = /^\*\*Example\s+(\d+)[^\n*]*\*\*/gm;
  const hits = [...text.matchAll(marker)];
  const out: WorkedExample[] = [];
  for (let i = 0; i < hits.length; i++) {
    const start = (hits[i].index ?? 0) + hits[i][0].length;
    const end = i + 1 < hits.length ? (hits[i + 1].index ?? text.length) : text.length;
    const chunk = text
      .slice(start, end)
      .trim()
      .replace(/^[—–-]\s*/, "");
    // "**Answer: …**" may stand alone or trail the last solution step on
    // the same line, so split on its last occurrence, not by line.
    const ansAt = chunk.lastIndexOf("**Answer:");
    if (ansAt === -1) return [];
    const ansRaw = chunk.slice(ansAt);
    const ansMatch = ansRaw.match(/^\*\*Answer:\s*([\s\S]*?)\*\*/);
    const answer = (
      ansMatch ? ansMatch[1] : ansRaw.replace(/^\*\*Answer:\s*/, "")
    ).trim();
    const after = ansMatch ? ansRaw.slice(ansMatch[0].length).trim() : "";
    const before = chunk.slice(0, ansAt).trim();
    const paras = before
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paras.length < 2) return [];
    let qEnd = 1;
    while (qEnd < paras.length - 1 && isItalicPara(paras[qEnd])) qEnd++;
    const question = paras
      .slice(0, qEnd)
      .map(stripItalicWrapper)
      .map(splitChoiceRuns)
      .join("\n\n");
    const work = [paras.slice(qEnd).join("\n\n"), after]
      .filter(Boolean)
      .join("\n\n")
      .trim();
    if (!question || !work || !answer) return [];
    out.push({ n: Number(hits[i][1]), question, work, answer });
  }
  return out;
}

/** Split a cue on its first arrow (→ or $\to$) into trigger and action. */
function parseCue(item: string): Cue {
  const arrow = item.match(/\s*(?:→|\$\\to\$)\s*/);
  if (!arrow || arrow.index === undefined) return { see: item, act: null };
  const see = item.slice(0, arrow.index).trim();
  const act = item.slice(arrow.index + arrow[0].length).trim();
  if (!see || !act) return { see: item, act: null };
  return { see, act };
}

/** Split a leading "**Name.**" (or "**Name:**") off a bullet body. */
function parseTitled(item: string): Titled {
  const m = item.match(/^\*\*(.+?)\*\*[:\s]*/);
  if (!m) return { name: null, body: item };
  const name = m[1].replace(/[.:]\s*$/, "");
  const body = item.slice(m[0].length).trim();
  if (!body) return { name: null, body: item };
  return { name, body };
}

/** Checklist items may be "- " bullets or "1. " numbered lines. */
function parseChecklist(text: string): string[] {
  const items: string[] = [];
  for (const line of text.split("\n")) {
    if (/^(?:[-*]|\d+[.)])\s+/.test(line)) {
      items.push(line.replace(/^(?:[-*]|\d+[.)])\s+/, ""));
    } else if (items.length > 0 && line.trim()) {
      items[items.length - 1] += " " + line.trim();
    }
  }
  return items;
}

export function parseLesson(body: string): ParsedLesson | null {
  const sections = splitSections(body);
  if (!sections) return null;

  const { intro: ideasIntro, items: ideas } = parseNumbered(
    sections.get("The core ideas")!,
  );
  const examples = parseExamples(sections.get("Worked examples")!);
  const cues = parseBullets(sections.get("Trigger cues")!).map(parseCue);
  const traps = parseBullets(sections.get("Trap gallery")!).map(parseTitled);
  const speed = parseBullets(sections.get("Speed moves")!).map(parseTitled);
  const checklist = parseChecklist(sections.get("Before you drill")!);

  if (
    ideas.length < 3 ||
    examples.length !== 3 ||
    cues.length < 3 ||
    traps.length < 3 ||
    speed.length < 3 ||
    checklist.length < 3
  ) {
    return null;
  }

  return {
    why: sections.get("Why this matters")!,
    ideasIntro,
    ideas,
    examples,
    cues,
    traps,
    speed,
    checklist,
  };
}
