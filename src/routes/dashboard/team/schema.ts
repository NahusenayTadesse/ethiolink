import { z } from 'zod';
import { sortOrder, translatedField } from '$lib/dashboard/translatedSchema';

const image = z
	.file()
	.mime(['image/jpeg', 'image/png', 'image/webp', 'image/avif'], 'A JPG, PNG or WebP photo')
	.max(10 * 1024 * 1024, 'At most 10 MB');

/** A leadership team member, added or edited from /dashboard/team. */
export const teamSchema = z.object({
	...translatedField('name', 'Name', 120),
	...translatedField('role', 'Role', 120),
	...translatedField('summary', 'Short summary', 600),
	...translatedField('bio', 'Full profile', 8000),
	slug: z
		.string()
		.trim()
		.max(60)
		.regex(/^[a-z0-9-]*$/, 'Lower-case letters, digits and dashes only')
		.default(''),
	photo: image.optional(),
	sortOrder,
	active: z.boolean().default(true)
});

export const teamEditSchema = teamSchema.extend({ id: z.coerce.number().int().positive() });
