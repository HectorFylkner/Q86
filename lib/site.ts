/**
 * Facts about the public site that more than one page needs: the canonical
 * origin, the contact address, and the guide index.
 *
 * The origin is read from the environment because password-reset links,
 * canonical tags, the sitemap and Open Graph URLs must all agree with
 * whatever the deployment is actually served from. The fallback is the
 * development origin, never a guessed production domain.
 */

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

/** Overridable so the owner can point support anywhere without a rebuild. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hej@q86.se";

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Public routes, in the order they should appear in a sitemap. */
export const PUBLIC_ROUTES = [
  "/",
  "/priser",
  "/diagnos",
  "/guider",
  "/integritetspolicy",
  "/kopvillkor",
  "/angerratt",
] as const;
