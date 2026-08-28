/**
 * A cookie jar standing in for `next/headers` (aliased in
 * `vitest.config.ts`). Tests drive it with `asUser()` / `signOut()` so the
 * real `requireScoped()` path runs unmodified — the code under test does
 * not know it is being tested.
 */
type CookieRecord = { name: string; value: string };

const jar = new Map<string, string>();

export function __setCookie(name: string, value: string): void {
  jar.set(name, value);
}

export function __clearCookies(): void {
  jar.clear();
}

export async function cookies() {
  return {
    get(name: string): CookieRecord | undefined {
      const value = jar.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set(name: string, value: string, _options?: unknown): void {
      if (value === "") jar.delete(name);
      else jar.set(name, value);
    },
    delete(name: string): void {
      jar.delete(name);
    },
  };
}

export async function headers() {
  return new Headers();
}
