/** Build-time mount path. Matches `basePath` in next.config.ts. */
export const basePath = '/48hrproject';

/**
 * Prefix a root-relative public file or a hand-built absolute URL.
 * Do not use this on `next/link` hrefs or `router.push` paths. Next adds `basePath` to those itself.
 */
export function withBasePath(path: string) {
  if (!path || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path) || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('#')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === basePath || normalized.startsWith(`${basePath}/`)) return normalized;
  return `${basePath}${normalized}`;
}

/**
 * Public site origin. Production never uses the Vercel hostname.
 * `NEXT_PUBLIC_SITE_URL` is the origin only, without `/48hrproject`.
 */
export function siteOrigin() {
  if (process.env.NODE_ENV !== 'production') {
    return typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin;
  }
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || 'https://likeminds.ae';
  return configured.endsWith(basePath) ? configured.slice(0, -basePath.length) : configured;
}

/** Absolute URL for a hand-built path. Next navigation must not use this. */
export function publicUrl(path: string) {
  return siteOrigin() + withBasePath(path);
}

/** App path as `usePathname` and `router.push` see it, without `basePath`. */
export function appPath(path: string) {
  const queryAt = path.indexOf('?');
  const pathname = queryAt === -1 ? path : path.slice(0, queryAt);
  const search = queryAt === -1 ? '' : path.slice(queryAt);
  let bare = pathname || '/';
  if (bare === basePath) bare = '/';
  else if (bare.startsWith(`${basePath}/`)) bare = bare.slice(basePath.length) || '/';
  return bare + search;
}
