import { z } from 'zod';
import { sortOrder, translatedField } from '$lib/dashboard/translatedSchema';

/** A figure on the home page, from /dashboard/stats. */
export const statSchema = z.object({
	value: z
		.string()
		.trim()
		.min(1, 'Write the figure')
		.max(16, 'At most 16 characters')
		.regex(/\d/, 'Include a number, e.g. 20+ or 500'),
	...translatedField('label', 'Description', 160),
	sortOrder,
	active: z.boolean().default(true)
});

export const statEditSchema = statSchema.extend({ id: z.coerce.number().int().positive() });
