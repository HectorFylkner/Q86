import fs from "node:fs";
import path from "node:path";
import { STRATEGY_NOTE_TITLES, type StrategyNoteId } from "./strategy.ts";

/** Server-only reader for the playbook markdown. Kept apart from
 *  lib/strategy.ts so the note ids and titles stay importable from client
 *  components. */

const STRATEGY_DIR = path.join(process.cwd(), "content", "strategy");

export function readStrategyNote(
  id: StrategyNoteId,
): { title: string; body: string } | null {
  const file = path.join(STRATEGY_DIR, `${id}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw.split("\n");
  const title =
    lines[0]?.replace(/^#\s+/, "").trim() || STRATEGY_NOTE_TITLES[id];
  return { title, body: lines.slice(1).join("\n").trim() };
}
