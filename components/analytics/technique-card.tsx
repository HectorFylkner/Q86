import Link from "next/link";
import {
  STRATEGY_CHAPTER,
  STRATEGY_LABELS,
  STRATEGY_NOTES,
} from "@/lib/solution-strategy";
import {
  STRATEGY_MIN_ATTEMPTS,
  type StrategyReport,
} from "@/lib/strategy-math";

function mmss(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * The technique panel.
 *
 * Every other card on this page measures *what* the user knows. This one
 * measures *how they solve*, which is the dimension the score report has
 * no column for and which decides whether the section fits in 45 minutes.
 *
 * The reading is a comparison against the user's own structural median,
 * not against an absolute target: "you are slower on questions where a
 * shortcut existed than on questions where none did" is evidence that the
 * shortcut is not being taken. Absolute times would just re-measure
 * overall speed.
 */
export function TechniqueCard({ report }: { report: StrategyReport }) {
  const { rows, baselineSeconds, unreached } = report;
  const shortcuts = rows.filter((r) => r.strategy !== "structural");
  const shortcutItems = shortcuts.reduce((s, r) => s + r.bankItems, 0);
  const totalItems = rows.reduce((s, r) => s + r.bankItems, 0);

  return (
    <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-sm font-semibold">
          Technique: what you reach for
        </h2>
        <p className="font-mono text-[11px] text-graphite">
          {shortcutItems} of {totalItems} bank items have a shortcut on the
          fastest path
        </p>
      </div>
      <p className="mb-3 mt-0.5 text-xs text-graphite">
        Each item&rsquo;s fastest path says which technique was{" "}
        <em>available</em>. Your time on those items says whether you took it.
      </p>

      {baselineSeconds === null ? (
        <p className="text-sm text-graphite">
          Not enough attempts yet — this panel needs at least{" "}
          {STRATEGY_MIN_ATTEMPTS} timed attempts on straightforward algebraic
          items to have a baseline to compare against.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-xs">
              <caption className="sr-only">
                Accuracy and median time per solution technique, against your
                own median of {mmss(baselineSeconds)} on set-up-and-solve items
              </caption>
              <thead>
                <tr className="border-b border-grid text-left text-graphite">
                  <th scope="col" className="pb-1.5 font-medium">
                    Technique
                  </th>
                  <th scope="col" className="pb-1.5 text-right font-medium">
                    Items
                  </th>
                  <th scope="col" className="pb-1.5 text-right font-medium">
                    Attempts
                  </th>
                  <th scope="col" className="pb-1.5 text-right font-medium">
                    Accuracy
                  </th>
                  <th scope="col" className="pb-1.5 text-right font-medium">
                    Median
                  </th>
                  <th scope="col" className="pb-1.5 text-right font-medium">
                    vs. yours
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid">
                {rows.map((row) => {
                  const chapter = STRATEGY_CHAPTER[row.strategy];
                  const delta =
                    row.medianSeconds !== null && row.strategy !== "structural"
                      ? row.medianSeconds - baselineSeconds
                      : null;
                  return (
                    <tr key={row.strategy}>
                      <th
                        scope="row"
                        className="py-1.5 pr-3 text-left font-medium"
                      >
                        {chapter ? (
                          <Link
                            href={`/learn/${chapter}`}
                            className="hover:text-ballpoint hover:underline"
                          >
                            {STRATEGY_LABELS[row.strategy]}
                          </Link>
                        ) : (
                          STRATEGY_LABELS[row.strategy]
                        )}
                      </th>
                      <td className="py-1.5 text-right font-mono tabular-nums text-graphite">
                        {row.bankItems}
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-graphite">
                        {row.attempts}
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums">
                        {row.accuracy === null
                          ? "—"
                          : `${Math.round(row.accuracy * 100)}%`}
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums">
                        {row.medianSeconds === null
                          ? "—"
                          : mmss(row.medianSeconds)}
                      </td>
                      <td
                        className={`py-1.5 text-right font-mono tabular-nums ${
                          delta === null
                            ? "text-graphite"
                            : delta >= 0
                              ? "text-redpen"
                              : "text-ballpoint"
                        }`}
                      >
                        {delta === null
                          ? "—"
                          : `${delta >= 0 ? "+" : "−"}${mmss(Math.abs(delta))}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-graphite">
            &ldquo;vs. yours&rdquo; compares each technique&rsquo;s median
            against your own {mmss(baselineSeconds)} on set-up-and-solve items.
            A shortcut you take should be <em>faster</em> than the grind; a
            dash means fewer than {STRATEGY_MIN_ATTEMPTS} attempts.
          </p>
        </>
      )}

      {unreached.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-grid pt-3">
          <p className="text-xs font-medium">
            Not reaching for {unreached.length === 1 ? "this" : "these"}:
          </p>
          {unreached.map((strategy) => {
            const chapter = STRATEGY_CHAPTER[strategy];
            return (
              <div
                key={strategy}
                className="rounded-card border border-grid border-l-2 border-l-amber/70 bg-paper p-3"
              >
                <p className="text-xs font-medium">
                  {STRATEGY_LABELS[strategy]}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-graphite">
                  {STRATEGY_NOTES[strategy]}
                </p>
                {chapter && (
                  <Link
                    href={`/learn/${chapter}`}
                    className="mt-1.5 inline-flex font-mono text-[11px] text-ballpoint hover:underline"
                  >
                    Read the chapter →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
