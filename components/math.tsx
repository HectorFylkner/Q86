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

const INLINE_TOKEN =
  /(\\\$)|(\$[^$\n]+?\$)|(\*\*[^*\n]+?\*\*)|(\*[^*\n]+?\*)|(`[^`\n]+?`)/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE_TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    const token = m[0];
    const key = `${keyBase}-${i++}`;
    if (m[1]) {
      nodes.push("$");
    } else if (m[2]) {
      nodes.push(
        <span
          key={key}
          dangerouslySetInnerHTML={{ __html: tex(token.slice(1, -1), false) }}
        />,
      );
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
    last = idx + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "math"; body: string }
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
  return blocks;
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
    <div className={cn("space-y-2.5 leading-relaxed", className)}>
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        switch (block.kind) {
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
