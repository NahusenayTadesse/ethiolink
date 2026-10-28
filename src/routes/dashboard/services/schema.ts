import { z } from 'zod';
import { SERVICE_SLUGS } from '$lib/site/services';
import { sortOrder } from '$lib/dashboard/translatedSchema';

/**
 * How one service shows: on or off, where, and its photo. Its words are the client's approved
 * copy in the translation files, so they are not edited here.
 */
export const serviceSettingSchema = z.object({
	slug: z.enum(SERVICE_SLUGS),
	active: z.boolean().default(true),
	sortOrder,
	photo: z
		.file()
		.mime(['image/jpeg', 'image/png', 'image/webp', 'image/avif'], 'A JPG, PNG or WebP photo')
		.max(10 * 1024 * 1024, 'At most 10 MB')
		.optional()
});
