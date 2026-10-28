import { z } from 'zod';
import { translatedField } from '$lib/dashboard/translatedSchema';

/** A news post, written on /dashboard/news/[id]. Bodies are HTML from the rich editor. */
export const newsSchema = z.object({
	...translatedField('title', 'Title', 200),
	...translatedField('excerpt', 'Summary', 300, { optional: true }),
	...translatedField('body', 'Article', 100_000),
	slug: z
		.string()
		.trim()
		.max(120)
		.regex(/^[a-z0-9-]*$/, 'Lower-case letters, digits and dashes only')
		.default(''),
	cover: z
		.file()
		.mime(['image/jpeg', 'image/png', 'image/webp', 'image/avif'], 'A JPG, PNG or WebP image')
		.max(10 * 1024 * 1024, 'At most 10 MB')
		.optional(),
	published: z.boolean().default(false)
});
