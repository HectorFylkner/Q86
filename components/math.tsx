import katex from "katex";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Md — renders the platform's markdown-with-math dialect.
 *
 * Supported: $...$ inline math, $$...$$ block math (KaTeX,
 * throwOnError: false), \$ as a literal dollar sign, **bold**, *italic*,
 * `code`, paragraphs (blank line), unordered (- ) and ordered (1. ) lists.
 * Anything else renders as plain text — there is deliberately no HTML
 * passthrough; the only injected HTML is KaTeX's own sanitized output.
 */

function tex(source: string, displayMode: boolean): string {
  return katex.renderToString(source, {
    throwOnError: false,
    displayMode,
    strict: false,
  });
}

// Math spans may contain backslash escapes (\$, \frac, …): consume
// backslash-pairs atomically so "$\$1{,}200$" stays one math token.
const INLINE_TOKEN =
  /(\\\$)|(\$(?:\\.|[^\\$\n])+?\$)|(\*\*(?:[^*\n]|\*(?!\*))+?\*\*)|(\*[^*\n]+?\*)|(`[^`\n]+?`)/g;

/** KaTeX's thousands separator, harmless if it leaks into plain prose. */
function plain(text: string): string {
  return text.replaceAll("{,}", ",");
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE_TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(plain(text.slice(last, idx)));
    const token = m[0];
    let consumed = token.length;
    const key = `${keyBase}-${i++}`;
    if (m[1]) {
      nodes.push("$");
    } else if (m[2]) {
      const html = { __html: tex(token.slice(1, -1), false) };
      // KaTeX's inline-block spans allow a line break between a formula
      // and punctuation glued to it in the source ("$k$?"); keep them on
      // one line by wrapping the pair as an unbreakable unit.
      const punct = text.slice(idx + token.length).match(/^[.,;:?!)%]+/)?.[0];
      if (punct) {
        consumed += punct.length;
        nodes.push(
          <span key={key} className="whitespace-nowrap">
            <span dangerouslySetInnerHTML={html} />
            {punct}
          </span>,
        );
      } else {
        nodes.push(<span key={key} dangerouslySetInnerHTML={html} />);
      }
    } else if (m[3]) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {renderInline(token.slice(2, -2), key)}
        </strong>,
      );
    } else if (m[4]) {
      nodes.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>);
    } else {
      nodes.push(
        <code
          key={key}
          className="rounded-[4px] bg-highlight px-1 py-0.5 font-mono text-[0.9em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = idx + consumed;
  }
  if (last < text.length) nodes.push(plain(text.slice(last)));
  return nodes;
}

type Block =
  | { kind: "math"; body: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; lines: string[] };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  // Split out $$...$$ display math first.
  const parts = source.split(/\$\$([\s\S]+?)\$\$/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      blocks.push({ kind: "math", body: parts[i].trim() });
      continue;
    }
    for (const para of parts[i].split(/\n\s*\n/)) {
      const lines = para
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) continue;
      // Headings (## / ###) may share a paragraph block with body lines.
      if (lines.some((l) => /^#{2,3}\s+/.test(l))) {
        for (const line of lines) {
          const h = line.match(/^(#{2,3})\s+(.*)$/);
          if (h) {
            blocks.push({ kind: h[1] === "##" ? "h2" : "h3", text: h[2] });
          } else {
            blocks.push({ kind: "p", lines: [line] });
          }
        }
        continue;
      }
      if (lines.every((l) => /^[-*]\s+/.test(l))) {
        blocks.push({
          kind: "ul",
          items: lines.map((l) => l.replace(/^[-*]\s+/, "")),
        });
      } else if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
        blocks.push({
          kind: "ol",
          items: lines.map((l) => l.replace(/^\d+[.)]\s+/, "")),
        });
      } else {
        blocks.push({ kind: "p", lines });
      }
    }
  }
  // Blank-line-separated "1." items arrive as single-item lists; merge
  // adjacent ordered lists so numbering continues instead of restarting.
  const merged: Block[] = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (b.kind === "ol" && prev?.kind === "ol") prev.items.push(...b.items);
    else merged.push(b);
  }
  return merged;
}

export function Md({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const blocks = parseBlocks(source);
  return (
    <div
      className={cn("space-y-2.5 leading-relaxed", className)}
    >
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        switch (block.kind) {
          case "h2":
            return (
              <h2
                key={key}
                className="!mt-6 font-display text-base font-semibold first:!mt-0"
              >
                {renderInline(block.text, key)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={key} className="!mt-4 font-display text-sm font-semibold">
                {renderInline(block.text, key)}
              </h3>
            );
          case "math":
            return (
              <div
                key={key}
                dangerouslySetInnerHTML={{ __html: tex(block.body, true) }}
              />
            );
          case "ul":
            return (
              <ul key={key} className="list-disc space-y-1 pl-5">
                {block.items.map((item, ii) => (
                  <li key={ii}>{renderInline(item, `${key}-${ii}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="list-decimal space-y-1 pl-5">
                {block.items.map((item, ii) => (
                  <li key={ii}>{renderInline(item, `${key}-${ii}`)}</li>
                ))}
              </ol>
            );
          case "p":
            return (
              <p key={key}>
                {block.lines.map((line, li) => (
                  <span key={li}>
                    {li > 0 && <br />}
                    {renderInline(line, `${key}-${li}`)}
                  </span>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
