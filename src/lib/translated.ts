import type { Locale } from '$lib/paraglide/runtime';

/**
 * Text staff write in the dashboard is stored once per site language, in columns that end in the
 * language: `titleEn`, `titleAm`, `titleZh`, `titleAr` — the pattern `globe_city` started.
 * English is required; a missing translation falls back to it, so a post written only in English
 * still appears on the Amharic site rather than as a blank.
 */

export const LANGUAGES = [
	{ locale: 'en', suffix: 'En', name: 'English' },
	{ locale: 'am', suffix: 'Am', name: 'Amharic' },
	{ locale: 'zh', suffix: 'Zh', name: 'Chinese' },
	{ locale: 'ar', suffix: 'Ar', name: 'Arabic' }
] as const satisfies { locale: Locale; suffix: string; name: string }[];

export type Suffix = (typeof LANGUAGES)[number]['suffix'];

const SUFFIX = Object.fromEntries(LANGUAGES.map((l) => [l.locale, l.suffix])) as Record<
	Locale,
	Suffix
>;

/** The field in `locale`, or the English one when that translation is empty. */
export function pick<F extends string>(
	row: { [K in `${F}En`]: string } & { [K in `${F}${Suffix}`]?: string | null },
	field: F,
	locale: Locale
): string {
	const value = (row as Record<string, string | null | undefined>)[`${field}${SUFFIX[locale]}`];
	return value?.trim() ? value : (row as Record<string, string>)[`${field}En`];
}

/** The languages, other than English, in which any of `fields` is still empty. */
export function missingLanguages(row: Record<string, unknown>, fields: readonly string[]): string[] {
	return LANGUAGES.filter(
		(l) =>
			l.locale !== 'en' &&
			fields.some((f) => {
				const english = row[`${f}En`];
				const value = row[`${f}${l.suffix}`];
				// A field left empty in English is optional; it needs no translation either.
				return typeof english === 'string' && english.trim() && !String(value ?? '').trim();
			})
	).map((l) => l.name);
}

/** Paragraphs typed in a textarea, split on blank lines. */
export const paragraphs = (text: string | null | undefined) =>
	(text ?? '')
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
