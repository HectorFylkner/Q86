/** `revalidatePath`/`revalidateTag` are request-scoped in Next.js and throw
 *  outside one. The tests exercise the data path, not the cache, so these
 *  are no-ops (aliased in vitest.config.ts). */
export function revalidatePath(_path: string, _type?: string): void {}
export function revalidateTag(_tag: string): void {}
export function unstable_cache<T extends (...args: never[]) => unknown>(
  fn: T,
): T {
  return fn;
}
