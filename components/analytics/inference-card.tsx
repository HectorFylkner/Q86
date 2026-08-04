import { Figure } from "@/components/charts/chart-kit";
import {
  MIN_LABELLED,
  type SuggestionAgreement,
} from "@/lib/inference-audit";
import { ERROR_TYPE_LABELS } from "@/lib/taxonomy";

/**
 * How often the platform's first guess at a miss was your guess too.
 *
 * The suggestion under every wrong answer is produced by hand-set weights.
 * They are reasoned, and they have never been checked against anything —
 * because until now the only thing that could check them was thrown away the
 * moment it was created: the tag was saved, the suggestion it replaced was
 * not, so an override looked exactly like a first-time tag.
 *
 * This is the reader's side of that repair. It answers a question they should
 * be able to ask — *should I read the evidence, or can I tap through?* — and
 * it refuses to answer it on thin data, because an agreement rate over nine
 * corrections is nine opinions rather than a measurement.
 */
export function InferenceCard({ data }: { data: SuggestionAgreement }) {
  const { labelled, accepted, overridden, agreement, worstConfusion } = data;

  if (labelled === 0) {
    return (
      <Figure
        title="Is the suggestion any good?"
        caption="Every miss you tag is compared against what the platform suggested, so the suggestion can be held to account rather than trusted."
      >
        <p className="rounded-control border border-dashed border-grid p-6 text-center text-caption text-graphite">
          Nothing to compare yet. Tag a miss — agreeing counts as much as
          overriding — and this fills in.
        </p>
      </Figure>
    );
  }

  return (
    <Figure
      title="Is the suggestion any good?"
      caption={
        agreement == null ? (
          <>
            {labelled} of your tags {labelled === 1 ? "has" : "have"} been
            compared against what was suggested. Below {MIN_LABELLED} the rate
            is noise, so no percentage is shown — the count is the honest
            number until then.
          </>
        ) : (
          <>
            You kept the suggestion on{" "}
            <span className="font-medium text-ink">
              {accepted} of {labelled}
            </span>{" "}
            tagged misses — {Math.round(agreement * 100)}%. The other{" "}
            {overridden} {overridden === 1 ? "was" : "were"} you correcting it.
          </>
        )
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Compared" value={String(labelled)} />
        <Stat label="Kept" value={String(accepted)} />
        <Stat label="Overridden" value={String(overridden)} />
        <Stat
          label="When it was sure"
          value={
            data.confidentAgreement == null
              ? "—"
              : `${Math.round(data.confidentAgreement * 100)}%`
          }
          note={`over ${data.confidentLabelled}`}
        />
      </dl>

      {worstConfusion && worstConfusion.count > 1 && (
        <p className="mt-3 text-caption text-graphite">
          The disagreement that repeats: it said{" "}
          <span className="font-medium text-ink">
            {ERROR_TYPE_LABELS[worstConfusion.suggested]}
          </span>{" "}
          and you said{" "}
          <span className="font-medium text-ink">
            {ERROR_TYPE_LABELS[worstConfusion.chosen]}
          </span>
          , {worstConfusion.count} times. A disagreement that has a shape is a
          weight to change; scattered ones are not.
        </p>
      )}

      {data.unrecorded > 0 && (
        <p className="mt-2 text-micro text-graphite">
          {data.unrecorded} earlier tag{data.unrecorded === 1 ? "" : "s"}{" "}
          predate this being recorded and are not counted.
        </p>
      )}
    </Figure>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-control border border-grid px-3 py-2">
      <dt className="text-micro uppercase tracking-wide text-graphite">
        {label}
      </dt>
      <dd className="font-display text-lede font-semibold tabular-nums">
        {value}
        {note && (
          <span className="ml-1 font-sans text-micro font-normal text-graphite">
            {note}
          </span>
        )}
      </dd>
    </div>
  );
}
