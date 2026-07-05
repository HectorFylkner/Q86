/** Chapter-test contract, importable from client and server code alike
 *  (no database dependencies — the selection logic lives in
 *  lib/chapter-tests.ts). */
export const CHAPTER_TEST_SIZE = 8;
export const CHAPTER_TEST_BAR = 0.75; // 6 of 8

/** Easy → exam-hard blend: [difficulty, count]. */
export const CHAPTER_TEST_BLEND: Array<[difficulty: number, n: number]> = [
  [2, 2],
  [3, 3],
  [4, 2],
  [5, 1],
];
