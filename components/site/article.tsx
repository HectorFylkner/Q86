import type { ReactNode } from "react";

/**
 * The prose renderer for guides and legal pages.
 *
 * Separate from `components/math.tsx` on purpose. That component renders
 * question stems and lesson chapters — the exam-critical path — and this
 * milestone has no business changing it to gain tables and links. This one
 * handles what long-form prose needs (headings, lists, tables, rules,
 * links) and nothing that questions rely on: no math, and no HTML
 * passthrough, so a content file can never inject markup.
 */

type Block =
  | { kind: "h2" | "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "hr" }
  | { kind: "quote"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] };

const INLINE =
  /(\*\*[^*]+?\*\*)|(\*[^*\n]+?\*)|(`[^`\n]+?`)|(\[[^\]]+?\]\([^)\s]+?\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) nodes.push(text.slice(last, at));
    const token = m[0];
    const key = `${keyBase}-${i++}`;
    if (m[1]) {
      nodes.push(<strong key={key}>{inline(token.slice(2, -2), key)}</strong>);
    } else if (m[2]) {
      nodes.push(<em key={key}>{inline(token.slice(1, -1), key)}</em>);
    } else if (m[3]) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        // Only same-origin paths and https links; anything else renders as
        // its own text, so a content file cannot smuggle a javascript: URL.
        const href = link[2];
        const safe = href.startsWith("/") || href.startsWith("https://");
        nodes.push(
          safe ? (
            <a key={key} href={href}>
              {inline(link[1], key)}
            </a>
          ) : (
            <span key={key}>{link[1]}</span>
          ),
        );
      } else {
        nodes.push(token);
      }
    }
    last = at + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      blocks.push({
        kind: heading[1] === "##" ? "h2" : "h3",
        text: heading[2],
      });
      i++;
      continue;
    }

    // A table is a header row, a delimiter row, then body rows.
    if (
      trimmed.startsWith("|") &&
      /^\|[\s:|-]+\|$/.test(lines[i + 1]?.trim() ?? "")
    ) {
      const head = splitRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()));
        i++;
      }
      blocks.push({ kind: "table", head, rows });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        parts.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ kind: "quote", text: parts.join(" ") });
      continue;
    }

    const bullet = /^[-*]\s+/;
    const numbered = /^\d+[.)]\s+/;
    if (bullet.test(trimmed) || numbered.test(trimmed)) {
      const ordered = numbered.test(trimmed);
      const pattern = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(pattern, ""));
        i++;
      }
      blocks.push({ kind: ordered ? "ol" : "ul", items });
      continue;
    }

    // A paragraph runs until a blank line or a block that starts one.
    const parts: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (
        t === "" ||
        /^(#{2,3}\s|---+$|>\s|[-*]\s|\d+[.)]\s|\|)/.test(t)
      ) {
        break;
      }
      parts.push(t);
      i++;
    }
    blocks.push({ kind: "p", text: parts.join(" ") });
  }

  return blocks;
}

export function Article({ source }: { source: string }) {
  const blocks = parse(source);
  return (
    <div className="article">
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        switch (block.kind) {
          case "h2":
            return <h2 key={key}>{inline(block.text, key)}</h2>;
          case "h3":
            return <h3 key={key}>{inline(block.text, key)}</h3>;
          case "hr":
            return <hr key={key} className="!mt-10 border-grid" />;
          case "quote":
            return (
              <blockquote key={key}>{inline(block.text, key)}</blockquote>
            );
          case "ul":
            return (
              <ul key={key}>
                {block.items.map((item, ii) => (
                  <li key={ii}>{inline(item, `${key}-${ii}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key}>
                {block.items.map((item, ii) => (
                  <li key={ii}>{inline(item, `${key}-${ii}`)}</li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={key} className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {block.head.map((cell, ci) => (
                        <th key={ci}>{inline(cell, `${key}-h${ci}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{inline(cell, `${key}-${ri}-${ci}`)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return <p key={key}>{inline(block.text, key)}</p>;
        }
      })}
    </div>
  );
}
