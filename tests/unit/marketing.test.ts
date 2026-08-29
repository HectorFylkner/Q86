import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The marketing kit, checked the way the rest of the codebase is checked.
 *
 * "Marketing is honest or it does not ship" is a constraint, not an
 * aspiration, and a constraint that only lives in a README is one that
 * erodes the first time someone is in a hurry. These rules run in CI.
 */

const ROOT = process.cwd();
const KIT = path.join(ROOT, "docs", "marketing");

function files(): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) out.push(full);
    }
  }
  walk(KIT);
  return out;
}

const read = (file: string) => fs.readFileSync(file, "utf8");
const rel = (file: string) => path.relative(ROOT, file);

/**
 * A draft is prose *to be posted*; the reference files talk *about* the
 * rules and therefore quote the forbidden phrases on purpose. Only the
 * channel drafts are scanned for forbidden claims.
 */
const DRAFTS = () =>
  files().filter((file) => file.includes(`${path.sep}channels${path.sep}`));

describe("the marketing kit", () => {
  it("exists, with a channel draft for each named audience", () => {
    const names = DRAFTS().map((file) => path.basename(file));
    expect(names.sort()).toEqual([
      "facebook-discord.md",
      "flashback.md",
      "linkedin.md",
      "reddit.md",
      "student-portals.md",
    ]);
  });

  it("makes no score guarantee in any draft", () => {
    const banned = [
      /garanter(ar|ad|as|ing)/i,
      /guarantee/i,
      /höj din poäng/i,
      /\+\s*\d+\s*(poäng|points)/i,
    ];
    const offenders: string[] = [];
    for (const file of DRAFTS()) {
      const source = read(file);
      for (const pattern of banned) {
        if (pattern.test(source)) offenders.push(`${rel(file)} ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("invents no users, testimonials or reviews", () => {
    // The shapes a fabricated proof point actually takes: a count of
    // users, a quoted student, a star rating.
    const banned = [
      /\d[\d\s.,]*\s*(studenter|användare|users|students)\s+(använder|har använt|use|trust)/i,
      /["“][^"”]{20,}["”]\s*[—–-]\s*[A-ZÅÄÖ]/,
      /\d(\.\d)?\s*(av|out of)\s*5/i,
      /betyg\s*:\s*\d/i,
    ];
    const offenders: string[] = [];
    for (const file of DRAFTS()) {
      const source = read(file);
      for (const pattern of banned) {
        if (pattern.test(source)) offenders.push(`${rel(file)} ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("never implies an association with GMAC", () => {
    const banned = [
      /officiella?\s+GMAT/i,
      /official\s+GMAT\s+question/i,
      /i samarbete med GMAC/i,
      /godkänd av GMAC/i,
      /endorsed by GMAC/i,
      /partner(skap)? (med|with) GMAC/i,
    ];
    const offenders: string[] = [];
    for (const file of DRAFTS()) {
      const source = read(file);
      for (const pattern of banned) {
        if (pattern.test(source)) offenders.push(`${rel(file)} ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("names the association claims as forbidden in the reference", () => {
    // messaging.md quotes the banned phrases on purpose, which is why the
    // rule above skips it — so this checks the quotation is still there.
    const messaging = read(path.join(KIT, "messaging.md"));
    for (const phrase of [
      "Officiella GMAT-frågor",
      "godkänd av",
      "Any score guarantee",
    ]) {
      expect(messaging).toContain(phrase);
    }
  });

  it("discloses authorship in every channel draft", () => {
    // The rule that separates a post from astroturfing, and the one a
    // hurried edit is most likely to drop. Every draft has to contain a
    // sentence in which the author says the product is theirs.
    const disclosures = [
      /jag har byggt/i,
      /mitt eget projekt/i,
      /jag är partisk/i,
      /jag bygger/i,
      /I built/i,
      /I'm the only person who works on it/i,
      /jag byggde/i,
    ];
    // A paid listing is exempt and only a paid listing: everyone
    // understands a directory entry to be advertising, so there is
    // nothing being passed off as a neutral recommendation.
    const PAID_PLACEMENT = ["student-portals.md"];
    const missing = DRAFTS()
      .filter((file) => !PAID_PLACEMENT.includes(path.basename(file)))
      .filter((file) => !disclosures.some((p) => p.test(read(file))))
      .map(rel);
    expect(missing).toEqual([]);
  });

  it("discloses in the same block as every link placeholder", () => {
    // Sharper than the file-level rule above, which a file holding
    // several drafts can satisfy from the wrong one. This asks the
    // question that actually matters: does the passage carrying a link
    // also say who wrote it? A block is the prose between two headings.
    const near = [
      /jag har byggt/i,
      /mitt eget projekt/i,
      /jag är partisk/i,
      /jag bygger/i,
      /jag byggde/i,
      /I built/i,
      /only person who works on it/i,
      // A paid listing declares itself by being a listing; the
      // trademark line is what it carries instead.
      /Oberoende (av|tjänst)/i,
      /Not affiliated/i,
    ];
    const offenders: string[] = [];
    for (const file of DRAFTS()) {
      const blocks = read(file).split(/\n(?=#{2,3} )/);
      for (const block of blocks) {
        if (!/\[(länk|link)\]/.test(block)) continue;
        if (!near.some((p) => p.test(block))) {
          offenders.push(`${rel(file)}: ${block.split("\n")[0]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("carries the trademark disclaimer where a draft is long enough to hold one", () => {
    // Short-form copy is exempt by design; anything with a link and a
    // pitch is not.
    const needsIt = DRAFTS().filter((file) => read(file).length > 2000);
    const missing = needsIt
      .filter((file) => !/GMAC/.test(read(file)))
      .map(rel);
    expect(missing).toEqual([]);
  });

  it("posts nothing: the kit says so, in the file people open first", () => {
    const readme = read(path.join(KIT, "README.md"));
    expect(readme).toMatch(/[Nn]othing in this directory has been posted/);
  });

  it("keeps the price in the drafts agreeing with the pricing module", async () => {
    // A stale price in a listing is a consumer-law problem, not a typo.
    const { PLANS } = await import("@/lib/billing/pricing");
    const monthly = PLANS.monthly.priceOre / 100;
    for (const file of DRAFTS()) {
      const source = read(file);
      const quoted = [...source.matchAll(/(\d{2,4})\s*kr\s*\/?\s*(månad)?/gi)];
      for (const match of quoted) {
        const value = Number(match[1]);
        // Only the plan prices may appear; anything else is a number
        // someone typed from memory.
        const known = [monthly, PLANS.sprint.priceOre / 100, 0];
        if (!known.includes(value)) {
          expect(
            `${rel(file)} quotes ${value} kr, which is not a plan price`,
          ).toBe("");
        }
      }
    }
  });
});
