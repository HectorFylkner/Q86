/**
 * Local-day math, timezone-honest. Every "day" in the app — the volume
 * calendar, streaks, the timed-set cadence, days-to-test — is a calendar
 * day in the *user's* timezone, not the server's. On the recommended
 * serverless deploys the server runs UTC, so anything built on the
 * server's local clock flips at the wrong midnight. All call sites go
 * through these helpers with an explicit IANA zone (see
 * `appTimeZone()` in lib/settings.ts).
 */

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    // en-CA renders dates as YYYY-MM-DD.
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** The calendar day an instant falls on in `timeZone`, as "YYYY-MM-DD". */
export function dayKey(date: Date, timeZone: string): string {
  return formatterFor(timeZone).format(date);
}

/** Whole days since the Unix epoch for a "YYYY-MM-DD" key. */
export function dayIndexFromKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** The "YYYY-MM-DD" key for a day index (inverse of dayIndexFromKey). */
export function keyFromDayIndex(index: number): string {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

/** Whole days since the epoch for the calendar day `date` falls on in
 *  `timeZone`. Two instants share an index iff they share a local day. */
export function dayIndex(date: Date, timeZone: string): number {
  return dayIndexFromKey(dayKey(date, timeZone));
}

/** "M/D" chart label for a day key ("2026-07-05" → "7/5"). */
export function shortLabelFromKey(key: string): string {
  const [, m, d] = key.split("-").map(Number);
  return `${m}/${d}`;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}
