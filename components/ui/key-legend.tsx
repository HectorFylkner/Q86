/** Inline keyboard legend: mono, quiet, matching the hint chips that
 *  appear inside buttons ("↵", "N", "G/L/K"). */
export function KeyLegend({ keys }: { keys: string }) {
  return (
    <span className="ml-2 font-mono text-[10px] text-graphite">{keys}</span>
  );
}
