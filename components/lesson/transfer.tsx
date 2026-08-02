import Link from "next/link";
import { Md } from "@/components/math";
import { ExampleCard } from "@/components/lesson/example-card";
import type {
  NamedTrap,
  RecognitionRow,
  TopBandExample,
} from "@/lib/chapter-transfer";

/**
 * The three transfer sections of a chapter, all sourced from the installed
 * bank so the chapter and the post-mortem cannot drift apart in wording.
 */

/** "Recognition table" — the stem cue, and the method it selects. */
export function RecognitionTable({ rows }: { rows: RecognitionRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-grid p-4 text-sm text-graphite">
        No bank items for this chapter carry a trigger cue yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-card border border-grid bg-surface shadow-ambient">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">
          Stem cues that appear in the question bank and the method each one
          selects, hardest items first.
        </caption>
        <thead>
          <tr className="border-b border-grid">
            <th
              scope="col"
              className="w-[44%] px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-graphite"
            >
              When the stem says
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-graphite"
            >
              Reach for
            </th>
            <th
              scope="col"
              className="w-[74px] px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-graphite"
            >
              Band
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.questionId}
              className="border-b border-grid/70 last:border-0 align-top"
            >
              <th
                scope="row"
                className="px-4 py-3 text-[14px] font-medium text-ink"
              >
                <Md source={row.see} className="[&_p]:m-0" />
              </th>
              <td className="px-4 py-3 text-[14px] text-graphite">
                {row.method ? (
                  <Md source={row.method} className="[&_p]:m-0" />
                ) : (
                  <span className="text-graphite">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-block rounded-control bg-highlight px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums">
                  D{row.difficulty}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "At the top band" — the hardest item in the chapter, worked through. */
export function TopBandCard({ example }: { example: TopBandExample }) {
  const letters = ["A", "B", "C", "D", "E"];
  const question = [
    example.stemMd,
    "",
    example.choices
      .map((c, i) => `${letters[i]}) ${c}`)
      .join("\n"),
  ].join("\n");
  const work = [
    example.formalPathMd,
    example.fastestPathMd
      ? `**Fastest path.** ${example.fastestPathMd}`
      : null,
    example.takeaway ? `**Takeaway.** ${example.takeaway}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="space-y-2">
      <p className="text-sm text-graphite">
        The three examples above climb toward the exam. This one is the
        hardest item the bank holds for this chapter — difficulty{" "}
        <span className="font-mono font-medium text-ink">
          {example.difficulty}
        </span>{" "}
        — shown whole, because a chapter that stops at the middle of the
        curve leaves the top of it unrehearsed.
      </p>
      <ExampleCard
        n={4}
        level={2}
        question={question}
        work={work}
        answer={`${letters[example.correctIndex]}) ${example.choices[example.correctIndex]}`}
      />
      <p className="text-xs text-graphite">
        Question #{example.questionId} ·{" "}
        <Link
          href={`/drill?qids=${example.questionId}`}
          className="text-ballpoint hover:underline"
        >
          drill this one cold →
        </Link>
      </p>
    </div>
  );
}

/** "Named traps" — the same sentences a post-mortem quotes, by error type. */
export function NamedTraps({ traps }: { traps: NamedTrap[] }) {
  if (traps.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-grid p-4 text-sm text-graphite">
        No trap vocabulary for this chapter yet.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-sm text-graphite">
        Every wrong answer in this chapter&apos;s bank items is reachable by a
        specific mistake. These are the exact sentences a post-mortem will
        quote back at you, tagged with the error type they belong to — so
        reading here and reviewing a miss use one vocabulary.
      </p>
      <ul className="space-y-2">
        {traps.map((trap, i) => (
          <li
            key={`${trap.questionId}-${i}`}
            className="rounded-card border border-grid bg-surface p-4 shadow-ambient sm:px-5"
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-control bg-redpen/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-redpen">
                {trap.errorLabel}
              </span>
              <span className="font-mono text-[10px] text-graphite">
                D{trap.difficulty} · #{trap.questionId}
              </span>
            </div>
            <Md
              source={trap.text}
              className="max-w-[70ch] text-[14.5px] [&_p]:m-0"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
