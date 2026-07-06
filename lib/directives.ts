/**
 * Grammar for the Md dialect's named visual directives — the handful
 * of diagrams where the picture IS the method. Pure string logic so
 * the renderer (components/directives.tsx), the Md parser
 * (components/math.tsx), and the lesson validator
 * (scripts/validate-lessons.ts) all share one definition. Named
 * components only; no general image or HTML support.
 */

export const DIRECTIVE_NAMES = [
  "set-matrix",
  "number-line",
  "rate-timeline",
] as const;
export type DirectiveName = (typeof DIRECTIVE_NAMES)[number];

export function isDirectiveName(name: string): name is DirectiveName {
  return (DIRECTIVE_NAMES as readonly string[]).includes(name);
}

export type ParsedDirective = {
  raw: string;
  name: string;
  params: Record<string, string>;
};

/** "::name key=value key="quoted value" …" — the whole line. */
export function parseDirectiveLine(line: string): ParsedDirective | null {
  const m = line.match(/^::([a-z][a-z-]*)\s*(.*)$/);
  if (!m) return null;
  const params: Record<string, string> = {};
  for (const p of m[2].matchAll(/([\w-]+)=(?:"([^"]*)"|(\S+))/g)) {
    params[p[1]] = p[2] ?? p[3];
  }
  return { raw: line, name: m[1], params };
}

export function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Structural validation, shared by the renderer (to fall back to
 *  literal text) and the lesson validator (to fail the build). Returns
 *  an error message, or null when the directive is renderable. */
export function validateDirective(d: ParsedDirective): string | null {
  if (!isDirectiveName(d.name)) return `unknown directive "::${d.name}"`;
  switch (d.name as DirectiveName) {
    case "set-matrix": {
      if (splitList(d.params.rows).length !== 2)
        return "set-matrix needs rows=\"A,B\" (exactly 2)";
      if (splitList(d.params.cols).length !== 2)
        return "set-matrix needs cols=\"A,B\" (exactly 2)";
      if (splitList(d.params.cells).length !== 4)
        return "set-matrix needs cells=\"a,b,c,d\" (exactly 4)";
      return null;
    }
    case "number-line": {
      const min = Number(d.params.min);
      const max = Number(d.params.max);
      if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max)
        return "number-line needs numeric min < max";
      return null;
    }
    case "rate-timeline": {
      const max = Number(d.params.max);
      if (!Number.isFinite(max) || max <= 0)
        return "rate-timeline needs numeric max > 0";
      if (splitList(d.params.rows).length === 0)
        return 'rate-timeline needs rows="Label:from..to,…"';
      return null;
    }
  }
  return null;
}
