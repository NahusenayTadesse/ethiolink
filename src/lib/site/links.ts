import type { Pathname } from '$app/types';
import { localizeHref } from '$lib/paraglide/runtime';

/**
 * A site path in the viewer's language — `/about` → `/am/about` for an Amharic reader. Wrap it
 * in `resolve()` where it becomes an `href`: `href={resolve(l('/about'))}`.
 *
 * Generic so `resolve` sees one path, not the union of every route: past 25 routes TypeScript
 * stops matching a union argument against `resolve`'s overloads. A path with a query string
 * (`/quote?service=customs`) is not a `Pathname`, so it is typed as `/`; `resolve` only prefixes
 * the base path, which is the same for both.
 */
export const l = <P extends string>(path: P) =>
	localizeHref(path) as P extends Pathname ? P : '/';

export const LOCALE_NAMES = {
	en: 'English',
	am: 'አማርኛ',
	zh: '中文',
	ar: 'العربية'
} as const;
