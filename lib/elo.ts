/** Per-category ELO vs. item ratings (§F6). Start 1200, K = 24. */
export const ELO_K = 24;
export const ELO_START = 1200;

export function expectedScore(
  playerRating: number,
  itemRating: number,
): number {
  return 1 / (1 + Math.pow(10, (itemRating - playerRating) / 400));
}

export function nextRating(
  playerRating: number,
  itemRating: number,
  correct: boolean,
): number {
  return (
    playerRating +
    ELO_K * ((correct ? 1 : 0) - expectedScore(playerRating, itemRating))
  );
}
