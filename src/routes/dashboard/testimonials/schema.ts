import { z } from 'zod';
import { sortOrder, translatedField } from '$lib/dashboard/translatedSchema';

/** A client's words about EthioLink, from /dashboard/testimonials. */
export const testimonialSchema = z.object({
	author: z.string().trim().min(2, 'Write who said it').max(120),
	...translatedField('position', 'Role and company', 160, { optional: true }),
	...translatedField('quote', 'Quote', 1200),
	sortOrder,
	active: z.boolean().default(true)
});

export const testimonialEditSchema = testimonialSchema.extend({
	id: z.coerce.number().int().positive()
});
