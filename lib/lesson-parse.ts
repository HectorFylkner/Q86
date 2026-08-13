// Splits a lesson body (the platform's markdown dialect) into its seven
// canonical sections so each can get a purpose-built visual treatment.
// Every chapter is authored against this exact template; if a file ever
// deviates, parseLesson returns null and the page falls back to rendering
// the whole body through <Md>. `pnpm verify:lessons` is the loud gate:
// it runs lessonProblems() in strict mode over every chapter so a
// deviation fails CI-style instead of silently degrading the page.
// The authoring contract lives in content/lessons/AUTHORING.md.

export type WorkedExample = {
  n: number;
  tier: string | null; // "Warm-up" … "Q86 level", from the marker line
  targetSeconds: number | null; // from "target m:ss" on the marker line
  question: string; // italic wrapper stripped
  work: string; // solution paragraphs between question and answer line
  wrongTurns: Titled[]; // "**Wrong turn: …**" paragraphs pulled from work
  answer: string; // "**Answer: …**" with marker stripped
};

export type Cue = { see: string; act: string | null };

export type Titled = { name: string | null; body: string };

export type Check = { q: string; a: string };

export type Idea = { body: string; check: Check | null };

export type ParsedLesson = {
  why: string;
  ideasIntro: string;
  ideas: Idea[];
  examples: WorkedExample[];
  cues: Cue[];
  traps: Titled[];
  speed: Titled[];
  checklist: string[];
};

/** Difficulty tiers an example marker may carry, in ramp order. */
export const EXAMPLE_TIERS = [
  "Warm-up",
  "555 level",
  "605 level",
  "655 level",
  "705 level",
  "Q86 level",
] as const;

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

/** An idea item may end in a one-line concept check:
 *  "Check: <question> ⇒ <answer>". Lines before it form the body. */
function parseIdea(item: string): Idea {
  const lines = item.split("\n");
  const at = lines.findIndex((l) => /^Check:\s+/.test(l.trim()));
  if (at === -1) return { body: item, check: null };
  const raw = lines
    .slice(at)
    .map((l) => l.trim())
    .join(" ")
    .replace(/^Check:\s+/, "");
  const arrow = raw.indexOf("⇒");
  if (arrow === -1) return { body: item, check: null };
  const q = raw.slice(0, arrow).trim();
  const a = raw.slice(arrow + 1).trim();
  if (!q || !a) return { body: item, check: null };
  return { body: lines.slice(0, at).join("\n").trim(), check: { q, a } };
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

/** "· <tier> · target m:ss" on an example marker line. */
function parseExampleMeta(tail: string): {
  tier: string | null;
  targetSeconds: number | null;
} {
  const m = tail.match(/·\s*([^·]+?)\s*·\s*target\s+(\d+):(\d{2})/);
  if (!m) return { tier: null, targetSeconds: null };
  return {
    tier: m[1].trim(),
    targetSeconds: Number(m[2]) * 60 + Number(m[3]),
  };
}

/** Split a work paragraph's leading "**Wrong turn: …**" label into a
 *  Titled whose name is the specific wrong turn (label word stripped). */
function parseWrongTurn(p: string): Titled {
  const t = parseTitled(p);
  const name = t.name
    ? t.name.replace(/^Wrong turn\s*[:—–-]?\s*/i, "").trim()
    : null;
  return { name: name || null, body: t.body };
}

function parseExamples(text: string): WorkedExample[] {
  // Markers appear as "**Example 1**" alone on a line — optionally with
  // "· <tier> · target m:ss" inside the bold — or with the question on
  // the same line (optionally after an em-dash).
  const marker = /^\*\*Example\s+(\d+)([^\n*]*)\*\*/gm;
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
    const workParas: string[] = [];
    const wrongTurns: Titled[] = [];
    for (const p of [...paras.slice(qEnd), ...(after ? [after] : [])]) {
      if (/^\*\*Wrong turn/i.test(p)) wrongTurns.push(parseWrongTurn(p));
      else workParas.push(p);
    }
    const work = workParas.join("\n\n").trim();
    if (!question || !work || !answer) return [];
    const meta = parseExampleMeta(hits[i][2] ?? "");
    out.push({
      n: Number(hits[i][1]),
      tier: meta.tier,
      targetSeconds: meta.targetSeconds,
      question,
      work,
      wrongTurns,
      answer,
    });
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

  const { intro: ideasIntro, items } = parseNumbered(
    sections.get("The core ideas")!,
  );
  const ideas = items.map(parseIdea);
  const examples = parseExamples(sections.get("Worked examples")!);
  const cues = parseBullets(sections.get("Trigger cues")!).map(parseCue);
  const traps = parseBullets(sections.get("Trap gallery")!).map(parseTitled);
  const speed = parseBullets(sections.get("Speed moves")!).map(parseTitled);
  const checklist = parseChecklist(sections.get("Before you drill")!);

  if (
    ideas.length < 3 ||
    examples.length < 3 ||
    examples.length > 6 ||
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

/**
 * Diagnoses a chapter body against the template and (strict) against the
 * course-grade authoring bar. Returns human-readable problems; empty
 * means the chapter passes. parseLesson() answers "can the page render
 * the structured layout"; this answers "is the chapter actually done".
 */
export function lessonProblems(body: string, strict = true): string[] {
  const problems: string[] = [];
  const sections = splitSections(body);
  if (!sections) {
    const map = new Map<string, string>();
    for (const line of body.split("\n")) {
      const h = line.match(/^##\s+(.*?)\s*$/);
      if (h) map.set(h[1], "");
    }
    for (const name of SECTIONS) {
      if (!map.has(name)) problems.push(`missing section "## ${name}"`);
    }
    return problems;
  }

  const { items } = parseNumbered(sections.get("The core ideas")!);
  const ideas = items.map(parseIdea);
  const examples = parseExamples(sections.get("Worked examples")!);
  const cues = parseBullets(sections.get("Trigger cues")!).map(parseCue);
  const traps = parseBullets(sections.get("Trap gallery")!).map(parseTitled);
  const speed = parseBullets(sections.get("Speed moves")!).map(parseTitled);
  const checklist = parseChecklist(sections.get("Before you drill")!);

  if (examples.length === 0) {
    problems.push(
      "worked examples failed to parse (marker/answer contract broken)",
    );
  }
  for (const idea of ideas) {
    if (/^Check:/m.test(idea.body)) {
      problems.push(
        `core idea has a malformed check (needs "Check: … ⇒ …"): "${idea.body.slice(0, 60)}…"`,
      );
    }
  }

  const floor = (name: string, n: number, min: number) => {
    if (n < min) problems.push(`${name}: ${n} (needs ≥ ${min})`);
  };

  if (!strict) {
    floor("core ideas", ideas.length, 3);
    floor("worked examples", examples.length, 3);
    floor("trigger cues", cues.length, 3);
    floor("traps", traps.length, 3);
    floor("speed moves", speed.length, 3);
    floor("checklist items", checklist.length, 3);
    return problems;
  }

  floor("core ideas", ideas.length, 5);
  floor(
    "concept checks",
    ideas.filter((i) => i.check).length,
    3,
  );
  floor("worked examples", examples.length, 4);
  if (examples.length > 6) {
    problems.push(`worked examples: ${examples.length} (max 6)`);
  }
  floor("trigger cues", cues.length, 5);
  floor("traps", traps.length, 4);
  floor("speed moves", speed.length, 4);
  floor("checklist items", checklist.length, 5);
  floor(
    "wrong-turn notes across examples",
    examples.reduce((n, e) => n + e.wrongTurns.length, 0),
    2,
  );

  const tiers = new Set<string>(EXAMPLE_TIERS);
  for (const ex of examples) {
    if (!ex.tier || !ex.targetSeconds) {
      problems.push(
        `example ${ex.n}: marker needs "· <tier> · target m:ss"`,
      );
    } else {
      if (!tiers.has(ex.tier)) {
        problems.push(`example ${ex.n}: unknown tier "${ex.tier}"`);
      }
      if (ex.targetSeconds < 45 || ex.targetSeconds > 200) {
        problems.push(
          `example ${ex.n}: target ${ex.targetSeconds}s outside 0:45–3:20`,
        );
      }
    }
  }

  return problems;
}
