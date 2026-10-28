import { z } from 'zod';

/**
 * Zod fields for one piece of translated text (see `$lib/translated`): English required unless
 * `optional`, the other three optional — an empty translation shows the English.
 */
export function translatedField<N extends string>(
	name: N,
	label: string,
	max: number,
	{ optional = false }: { optional?: boolean } = {}
) {
	const english = z
		.string()
		.trim()
		.min(optional ? 0 : 1, `Write the ${label.toLowerCase()} in English`)
		.max(max, `At most ${max} characters`);
	const other = z.string().trim().max(max, `At most ${max} characters`).default('');
	return {
		[`${name}En`]: english,
		[`${name}Am`]: other,
		[`${name}Zh`]: other,
		[`${name}Ar`]: other
	} as { [K in `${N}En`]: typeof english } & { [K in `${N}${'Am' | 'Zh' | 'Ar'}`]: typeof other };
}

/** Empty translations are stored as NULL, so "not translated" is one state, not two. */
export function blankToNull<T extends Record<string, unknown>>(values: T): T {
	for (const key of Object.keys(values)) {
		if (/(Am|Zh|Ar)$/.test(key) && values[key] === '') (values as Record<string, unknown>)[key] = null;
	}
	return values;
}

/** A URL-safe slug from an English title: "New Customs Rules 2026" → "new-customs-rules-2026". */
export const slugify = (text: string) =>
	text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 100);

export const sortOrder = z.coerce.number().int().min(0, 'Zero or more').max(9999).default(0);

/** An optional link, typed with or without the https://. */
export const optionalUrl = z
	.string()
	.trim()
	.max(255)
	.transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
	.pipe(z.union([z.literal(''), z.url('Enter a web address')]))
	.default('');
