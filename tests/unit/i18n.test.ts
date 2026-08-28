import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sv } from "@/lib/i18n/sv";
import { en } from "@/lib/i18n/en";
import { getDictionary, translator } from "@/lib/i18n";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelativeDays,
} from "@/lib/i18n/format";
import * as labels from "@/lib/i18n/labels";
import { LOCALES } from "@/lib/i18n/types";
import { ALL_SUBTOPICS, CONFIDENCES, DIFFICULTIES, CONTENT_DOMAINS, CONTEXTS, EDIT_REASONS, ERROR_TYPES, FLAG_REASONS, FORMATS, FUNDAMENTAL_SKILLS } from "@/lib/taxonomy";
import { PATTERN_CATEGORY_KEYS } from "@/lib/generators";

/**
 * The localization contract (ADR 0004). The type system already refuses a
 * catalog with a missing key; these are the parts it cannot check — the
 * label helpers that build a key from a variable, the sv-SE formatting,
 * and the exam-fidelity boundary.
 */

const ROOT = process.cwd();

type Node = string | { [key: string]: Node };

function flatten(node: Node, prefix = ""): Record<string, string> {
  if (typeof node === "string") return { [prefix]: node };
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(node)) {
    Object.assign(out, flatten(value, prefix ? `${prefix}.${key}` : key));
  }
  return out;
}

const svFlat = flatten(sv as unknown as Node);
const enFlat = flatten(en as unknown as Node);

describe("message catalogs", () => {
  it("carries the same key set in both locales", () => {
    expect(Object.keys(svFlat).sort()).toEqual(Object.keys(enFlat).sort());
  });

  it("has a non-empty string for every key", () => {
    // Two deliberate blanks: plans with fewer bullets than the widest card.
    const allowedEmpty = new Set([
      "billing.plans.free.bullet5",
      "billing.plans.sprint.bullet5",
    ]);
    for (const [locale, flat] of [
      ["sv", svFlat],
      ["en", enFlat],
    ] as const) {
      const empty = Object.entries(flat)
        .filter(([key, value]) => value.trim() === "" && !allowedEmpty.has(key))
        .map(([key]) => `${locale}:${key}`);
      expect(empty).toEqual([]);
    }
  });

  it("keeps placeholders identical between locales", () => {
    const placeholders = (value: string) =>
      [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const mismatched = Object.keys(svFlat).filter(
      (key) =>
        placeholders(svFlat[key]).join(",") !==
        placeholders(enFlat[key]).join(","),
    );
    expect(mismatched).toEqual([]);
  });

  it("is actually written in Swedish, not left as English", () => {
    // A crude but effective check: at least a third of the Swedish strings
    // should contain a character or word English does not use. Catches a
    // catalog section pasted in from `en` and never translated.
    const swedishish = Object.values(svFlat).filter((value) =>
      /[åäöÅÄÖ]|\b(och|eller|inte|dina|ditt|för|från|med|som)\b/.test(value),
    );
    expect(swedishish.length / Object.keys(svFlat).length).toBeGreaterThan(0.3);
  });
});

describe("translator", () => {
  it("interpolates named placeholders", () => {
    const t = translator("sv");
    expect(t("learn.chapterOf", { n: 3, total: 24 })).toBe("Kapitel 3 av 24");
  });

  it("leaves an unsupplied placeholder visible rather than blank", () => {
    const t = translator("sv");
    expect(t("learn.chapterOf", { n: 3 })).toContain("{total}");
  });

  it("falls back to English for a key missing from the active catalog", () => {
    // Simulate a catalog edited as data rather than as code.
    const broken = getDictionary("sv") as unknown as Record<string, unknown>;
    const saved = broken.fallback;
    delete broken.fallback;
    try {
      expect(translator("sv")("fallback.chapterInEnglish")).toBe(
        en.fallback.chapterInEnglish,
      );
    } finally {
      broken.fallback = saved;
    }
  });
});

describe("taxonomy labels", () => {
  it("has a label for every taxonomy value, in both locales", () => {
    for (const locale of LOCALES) {
      const t = translator(locale);
      const cases: Array<[string, string[]]> = [
        ["skill", FUNDAMENTAL_SKILLS.map((v) => labels.skillLabel(t, v))],
        ["skillShort", FUNDAMENTAL_SKILLS.map((v) => labels.skillShortLabel(t, v))],
        ["subtopic", ALL_SUBTOPICS.map((v) => labels.subtopicLabel(t, v))],
        ["context", CONTEXTS.map((v) => labels.contextLabel(t, v))],
        ["domain", CONTENT_DOMAINS.map((v) => labels.domainLabel(t, v))],
        ["format", FORMATS.map((v) => labels.formatLabel(t, v))],
        ["errorType", ERROR_TYPES.map((v) => labels.errorTypeLabel(t, v))],
        ["confidence", CONFIDENCES.map((v) => labels.confidenceLabel(t, v))],
        ["flagReason", FLAG_REASONS.map((v) => labels.flagReasonLabel(t, v))],
        ["editReason", EDIT_REASONS.map((v) => labels.editReasonLabel(t, v))],
        ["difficulty", DIFFICULTIES.map((v) => labels.difficultyLabel(t, v))],
        [
          "patternCategory",
          PATTERN_CATEGORY_KEYS.map((v) => labels.patternCategoryLabel(t, v)),
        ],
      ];
      for (const [group, values] of cases) {
        // A missing key renders as the key itself, which always has a dot.
        const missing = values.filter((v) => v.includes("taxonomy."));
        expect(`${locale}/${group}: ${missing.join(", ")}`).toBe(
          `${locale}/${group}: `,
        );
      }
    }
  });

  it("keeps GMAT terminology in English inside the Swedish catalog", () => {
    const t = translator("sv");
    expect(labels.formatLabel(t, "data_sufficiency")).toBe("Data Sufficiency");
    expect(labels.formatLabel(t, "problem_solving")).toBe("Problem Solving");
    expect(sv.timed.reviewAndEdit).toBe("Review & Edit");
    expect(sv.importer.sectionQuant).toBe("Quantitative Reasoning");
  });
});

describe("sv-SE formatting", () => {
  const date = new Date("2026-08-28T12:00:00Z");

  it("writes dates the Swedish way", () => {
    expect(formatDate(date, "sv")).toBe("28 augusti 2026");
    expect(formatDate(date, "en")).toBe("28 August 2026");
  });

  it("uses a comma decimal separator and a space for thousands", () => {
    // Intl emits a narrow no-break space; normalise before comparing.
    expect(formatNumber(1234.5, "sv").replace(/\s/g, " ")).toBe("1 234,5");
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
  });

  it("puts a space before the percent sign in Swedish", () => {
    expect(formatPercent(0.62, "sv").replace(/\s/g, " ")).toBe("62 %");
    expect(formatPercent(0.62, "en")).toBe("62%");
  });

  it("formats kronor without decimals when they are whole", () => {
    expect(formatCurrency(24_900, "sv").replace(/\s/g, " ")).toBe("249 kr");
    expect(formatCurrency(4_980, "sv").replace(/\s/g, " ")).toBe("49,80 kr");
  });

  it("says relative days in Swedish", () => {
    expect(formatRelativeDays(-1, "sv")).toBe("i går");
    expect(formatRelativeDays(-3, "sv")).toBe("för 3 dagar sedan");
  });
});

describe("locale negotiation", () => {
  it("never consults Accept-Language", () => {
    // A large share of Swedish users browse with an English-language
    // browser, so the header would serve English to much of the audience
    // this product is for. Swedish is unconditional until someone picks
    // otherwise, and this rule keeps the header from creeping back in.
    const code = fs
      .readFileSync(path.join(ROOT, "lib/i18n/locale.ts"), "utf8")
      // The comment above getLocale() explains the decision by name, so
      // the rule reads the code and not the prose that justifies it.
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/accept-language/i);
  });
});

describe("exam fidelity (ADR 0004)", () => {
  it("keeps every question stem in the bank in English", () => {
    const bank = JSON.parse(
      fs.readFileSync(path.join(ROOT, "scripts/seed-bank.json"), "utf8"),
    ) as { questions: Array<{ stem_md: string; choices: string[] }> };
    expect(bank.questions.length).toBeGreaterThan(300);

    const swedish = /[åäöÅÄÖ]|\b(och|eller|inte|vilket|talet|hur många)\b/;
    const translated = bank.questions.filter(
      (q) => swedish.test(q.stem_md) || q.choices.some((c) => swedish.test(c)),
    );
    expect(translated.map((q) => q.stem_md.slice(0, 60))).toEqual([]);
  });

  it("has no Swedish lesson chapter that translated the structural markers", () => {
    const dir = path.join(ROOT, "content/lessons/sv");
    const files = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.endsWith(".md"))
      : [];
    const required = [
      "## Why this matters",
      "## The core ideas",
      "## Worked examples",
      "## Trigger cues",
      "## Trap gallery",
      "## Speed moves",
      "## Before you drill",
    ];
    for (const file of files) {
      const body = fs.readFileSync(path.join(dir, file), "utf8");
      for (const heading of required) {
        expect(`${file} ${heading}: ${body.includes(heading)}`).toBe(
          `${file} ${heading}: true`,
        );
      }
      // Examples and answers are markers the parser matches on.
      expect(`${file}: ${/\*\*Example 1\*\*/.test(body)}`).toBe(`${file}: true`);
      expect(`${file}: ${/\*\*Answer:/.test(body)}`).toBe(`${file}: true`);
    }
  });
});

/**
 * The catalogs and the translator are shared by server and client code, so
 * the module boundary around them is load-bearing in two directions —
 * and neither direction is caught by `tsc`.
 */
describe("module boundaries", () => {
  const ROOT = process.cwd();

  function read(rel: string): string {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  }

  function isClientModule(rel: string): boolean {
    const head = read(rel).trimStart();
    return head.startsWith('"use client"') || head.startsWith("'use client'");
  }

  /** A `"use server"` module is an RPC boundary: a client component imports
   *  the reference, never the body, so its own imports stay on the server. */
  function isServerActionModule(rel: string): boolean {
    const head = read(rel).trimStart();
    return head.startsWith('"use server"') || head.startsWith("'use server'");
  }

  function walk(dir: string, match: RegExp, out: string[] = []): string[] {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return out;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel, match, out);
      else if (match.test(entry.name)) out.push(rel);
    }
    return out;
  }

  function resolveImport(spec: string, from: string): string | null {
    let base: string;
    if (spec.startsWith("@/")) base = spec.slice(2);
    else if (spec.startsWith(".")) base = path.join(path.dirname(from), spec);
    else return null;
    base = base.replace(/\.tsx?$/, "");
    for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
      if (fs.existsSync(path.join(ROOT, base + ext))) return base + ext;
    }
    return null;
  }

  // `next build` compiles this happily and it fails only when the route is
  // requested, so the type checker cannot stand in for this rule.
  it("never calls a function exported from a client module on the server", () => {
    const offenders: string[] = [];
    const sources = [
      ...walk("app", /\.tsx?$/),
      ...walk("lib", /\.ts$/),
    ].filter((rel) => !isClientModule(rel));

    for (const rel of sources) {
      const src = read(rel);
      const imports = src.matchAll(
        /import\s+(type\s+)?\{([^}]*)\}\s+from\s+"([^"]+)"/g,
      );
      for (const [, typeOnly, names, spec] of imports) {
        if (typeOnly) continue; // erased before it reaches a runtime
        const target = resolveImport(spec, rel);
        if (!target || !isClientModule(target)) continue;
        for (const raw of names.split(",")) {
          const name = raw.trim().split(/\s+as\s+/).pop()?.trim();
          // A component is rendered as <Name/>; only a call looks like Name(.
          if (!name || name.startsWith("type ")) continue;
          if (new RegExp(`\\b${name}\\s*\\(`).test(src)) {
            offenders.push(`${rel} calls ${name}() from ${target}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  // The reverse: a server-only import inside the shared catalog module
  // breaks the *client* build, which is how it was first found.
  it("keeps next/headers out of every module a client component imports", () => {
    const clientModules = [
      ...walk("app", /\.tsx?$/),
      ...walk("components", /\.tsx?$/),
    ].filter(isClientModule);

    const seen = new Set<string>();
    const queue = [...clientModules];
    const offenders: string[] = [];

    while (queue.length > 0) {
      const rel = queue.pop() as string;
      if (seen.has(rel)) continue;
      seen.add(rel);
      const src = read(rel);
      if (/from "next\/headers"/.test(src)) offenders.push(rel);
      for (const [, , spec] of src.matchAll(
        /import\s+(type\s+)?[^"]*from\s+"([^"]+)"/g,
      )) {
        const target = resolveImport(spec, rel);
        if (target && !isServerActionModule(target)) queue.push(target);
      }
    }
    expect(offenders).toEqual([]);
  });
});
