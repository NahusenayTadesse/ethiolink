import { z } from 'zod';
import { optionalUrl, sortOrder } from '$lib/dashboard/translatedSchema';

const logo = z
	.file()
	.mime(['image/png', 'image/webp', 'image/jpeg', 'image/avif'], 'A PNG, WebP or JPG logo')
	.max(10 * 1024 * 1024, 'At most 10 MB');

/** A client or partner logo, from /dashboard/partners. */
export const partnerSchema = z.object({
	name: z.string().trim().min(2, 'Write the name').max(120),
	logo,
	url: optionalUrl,
	sortOrder,
	active: z.boolean().default(true)
});

/** On edit the stored logo stays unless a new one is chosen. */
export const partnerEditSchema = partnerSchema.extend({
	id: z.coerce.number().int().positive(),
	logo: logo.optional()
});
