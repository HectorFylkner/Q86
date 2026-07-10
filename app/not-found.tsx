import { ArrowRight, House } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid max-w-3xl gap-8 py-10 md:grid-cols-[8rem_1fr] md:py-20">
      <p className="font-mono text-6xl font-semibold tracking-tighter text-ballpoint">
        404
      </p>
      <div className="border-t border-grid-strong pt-5">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-graphite">
          Outside the question set
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          That page is not in this edition of Q86.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-6 text-graphite">
          Return to the daily plan, or open a fresh adaptive drill from the
          verified question bank.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-control bg-ballpoint px-4 py-2 text-sm font-semibold text-white"
          >
            <House size={18} weight="bold" />
            Today
          </Link>
          <Link
            href="/drill?plan=1"
            className="inline-flex min-h-11 items-center gap-2 rounded-control border border-grid-strong bg-surface px-4 py-2 text-sm font-medium"
          >
            Start the planned drill
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
