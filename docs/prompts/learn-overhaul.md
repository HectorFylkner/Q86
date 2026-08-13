# Q86 Learn overhaul — course-grade material

<context>
Q86 (this repo) is a local-first, single-user Next.js + SQLite training platform for GMAT Focus Edition Quantitative Reasoning; the name is the target scaled score, Q86. Read README.md first.

The Learn section is 24 markdown concept chapters in `content/lessons/`, one per subtopic of the four fundamental skills defined in `lib/taxonomy.ts`. That taxonomy mirrors the official GMAT Focus score report, and analytics, ELO, the daily plan, chapter tests, and the redo queue all key off its subtopic ids. Every chapter is authored against a strict seven-section template (Why this matters / The core ideas / Worked examples / Trigger cues / Trap gallery / Speed moves / Before you drill), parsed by `lib/lesson-parse.ts`, and rendered with purpose-built section treatments in `components/lesson/` and `app/learn/[subtopic]/page.tsx`; a chapter that fails to parse silently falls back to plain markdown. The learn flow is Read → Attempt (worked examples hide their solutions until tried) → Tick the checklist → Drill the same subtopic, with per-chapter pass/fail tests (`lib/chapter-tests.ts`) and a spaced-repetition deck downstream. Math is $…$ / $$…$$ KaTeX.

The chapters are accurate and well-edited but thin — roughly 90 lines each, closer to an excellent cheat sheet than to a course. The platform around them (drills, timed sets, analytics, pacing) is far ahead of the material it teaches from.
</context>

<mission>
Rebuild the Learn section — content, information architecture, and presentation — into self-study material a serious GMAT student would choose over the best commercial programs. Go far beyond the current chapters: depth and coverage are wanted everywhere they teach something real, padding nowhere.

Fold in the specific practices that made the leading programs work:

- **Granular concept→practice loops** (Target Test Prep): teach one idea, exercise it immediately with a try-first question, then build. A reader should never meet three new ideas before touching a pencil.
- **Teaching from the error** (UWorld): worked examples at realistic difficulty explain why each tempting wrong turn fails — named traps paired with the wrong answer they produce — not just the clean path.
- **Decision-first reasoning** (Manhattan Prep, GMAT Ninja): teach what to notice in a stem and what that observation forces; treat translation from words to math as a drilled skill; teach when to abandon algebra for number testing, estimation, or answer-choice leverage.
- **Mastery scaffolding** (e-GMAT, Khan Academy): explicit prerequisites between chapters, an honest difficulty ramp inside each chapter from approachable through 655-level to Q86-level, and self-diagnosis the reader can act on.
- **Time-awareness throughout** (all of them): per-example pace expectations and explicit two-minute decision points, consistent with the platform's pacing model in `lib/pacing.ts`.

You have full authority over the chapter schema, the parser, the section renderers, and the Learn IA. The current seven sections are a floor, not a ceiling: add the structures the pedagogy needs — tiered example sets, concept-check questions between ideas, prerequisite maps, a cross-chapter strategy layer for timing, guessing, and number-testing doctrine. Cross-cutting material becomes a first-class part of the Learn IA, not orphan markdown.

Done means: all 24 chapters rebuilt to the new standard (expect several-fold growth where the material earns it); any schema change carried atomically through every chapter, `lib/lesson-parse.ts`, and the renderers; the Learn index and chapter pages redesigned to carry the richer material without overwhelming it; the Read → Attempt → Tick → Drill flow and chapter tests still coherent with the new IA; and the verification below green.
</mission>

<constraints>
- Mathematical correctness is the trust foundation of this platform: recompute every worked example, concept check, and stated numeric fact — script the recomputation where practical rather than eyeballing it. One wrong answer in teaching material costs more than a missing chapter.
- Stay inside GMAT Focus Quant scope: arithmetic and algebra reasoning, problem-solving format, no geometry, calculator-free arithmetic a strong student can do on paper. Difficulty labels must be honest to the real exam.
- The 24 subtopic ids in `lib/taxonomy.ts` are load-bearing across the data model. Deepen within them and layer across them; do not rename or restructure the taxonomy.
- Preserve and extend the attempt-before-reveal mechanic — active recall is the platform's pedagogical spine, so richer material should create more attempt moments, never fewer.
- New drillable questions enter the bank only through the authoring gate (`scripts/author/harness.mjs`, brute-force `check()` per item, then `node --experimental-strip-types scripts/verify-bank.ts`). Questions living inside lesson markdown are out of that gate's reach, so apply the same rigor to them yourself.
- Local-first stands: no external services, no new runtime dependencies unless clearly earned.
- Presentation evolves the existing paper-and-ink design language (surface/graphite/ballpoint/grid tokens, display + mono type) rather than replacing it. The chapter page is a surface a student will read for dozens of hours: typographically confident, distinctive, calm.
</constraints>

<verification>
The work is done when: `pnpm lint` and `pnpm build` pass; every chapter parses under the final parser — add a check that fails loudly on a non-parsing chapter, replacing today's silent markdown fallback as the only signal; every numeric claim in the new material has been recomputed; verify-bank passes if the bank was touched. Then reread two full chapters cold, as a student: if a section wouldn't survive comparison with the programs named above, it isn't done.
</verification>

<execution>
You are running unattended. Once you have enough to act, act — pick an approach and see it through, revisiting only if new information directly contradicts it. Work skill-group by skill-group (the four fundamental skills make natural increments) and commit each coherent increment with the build green, so the platform is never left between schemas. Before ending, audit every claim in your summary against an actual result from this session; report anything unverified as unverified.
</execution>
