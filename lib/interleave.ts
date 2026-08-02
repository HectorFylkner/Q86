/**
 * Interleaving.
 *
 * The daily drill block used to be assembled one skill at a time: every
 * rates question, then every value/order question, and so on. That is
 * *blocked* practice, and it is the single best-evidenced structural
 * mistake a practice tool can make. Under blocked practice the method
 * stays live in working memory between questions, so the reader answers
 * correctly without ever retrieving the decision "which method is this?"
 * — which is the decision the exam actually tests, because on the exam
 * the questions arrive in no order at all.
 *
 * The effect size is not marginal. In the most-cited classroom
 * comparison, students taught in blocked order scored 42% on a delayed
 * test thirty days later; students taught the identical material in
 * interleaved order scored 74%. Interleaving depresses performance
 * *during* practice and raises it at test — a "desirable difficulty".
 *
 * So the block is round-robined instead. This module is pure and knows
 * nothing about questions: it takes groups and returns one sequence.
 */

/**
 * Spread every group evenly across one sequence.
 *
 * Plain round-robin is the obvious implementation and it is wrong at the
 * tail: once the small groups are exhausted the largest one supplies
 * every remaining slot, so a block of 8 rates questions and one each of
 * two other skills comes out as `a b c a a a a a a a` — seven blocked
 * questions, which is most of the session.
 *
 * Instead each item is given a position in [0,1) at the centre of its
 * share of the sequence: item j of a group of n sits at (j + ½)/n.
 * A group of 2 lands at ¼ and ¾; a group of 10 lands every tenth. Sorting
 * by that position spreads each group across the *whole* block no matter
 * how the sizes compare. Ties go to the larger group, which keeps two
 * small groups from clumping in the middle.
 *
 * The result is stable and deterministic — the same input always gives
 * the same order, so a resumed session is not reshuffled underneath the
 * reader.
 */
export function interleave<T>(groups: T[][]): T[] {
  const marked = groups.flatMap((group, groupIndex) =>
    group.map((item, j) => ({
      item,
      groupIndex,
      size: group.length,
      pos: (j + 0.5) / group.length,
    })),
  );
  marked.sort(
    (a, b) =>
      a.pos - b.pos || b.size - a.size || a.groupIndex - b.groupIndex,
  );
  return marked.map((m) => m.item);
}

/**
 * The longest run of consecutive items sharing a key. Used by the tests
 * and by the acceptance check: an interleaved block should never show a
 * long run of one skill, and this is the number that says so.
 */
export function longestRun<T>(items: T[], key: (item: T) => string): number {
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const item of items) {
    const k = key(item);
    run = k === prev ? run + 1 : 1;
    prev = k;
    if (run > best) best = run;
  }
  return best;
}

/**
 * The theoretical floor for the longest run, given group sizes.
 *
 * A group holding more than its share of the block *must* repeat: with
 * sizes [8, 1, 1] there is no arrangement without two consecutive from
 * the big group. Reporting the floor keeps the acceptance check honest —
 * it compares the achieved run against what was actually achievable,
 * not against a 1 that the input may forbid.
 */
export function minPossibleRun(sizes: number[]): number {
  const nonEmpty = sizes.filter((n) => n > 0);
  if (nonEmpty.length === 0) return 0;
  const total = nonEmpty.reduce((s, n) => s + n, 0);
  const max = Math.max(...nonEmpty);
  const others = total - max;
  // `others` items create at most `others + 1` gaps to spread `max` into.
  return Math.max(1, Math.ceil(max / (others + 1)));
}
