export function StatusPill({ ready }: { ready: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
        ready
          ? "border-ballpoint/30 bg-ballpoint/5 text-ballpoint"
          : "border-amber/35 bg-amber/5 text-amber"
      }`}
    >
      {ready ? "ready" : "closed"}
    </span>
  );
}
