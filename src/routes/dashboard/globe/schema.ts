import { z } from 'zod';

const name = (language: string) =>
	z.string().trim().min(1, `Enter the name in ${language}`).max(80, 'At most 80 characters');

/** A globe city, added or edited from /dashboard/globe. `id` is set only when editing. */
export const globeCitySchema = z.object({
	id: z.number().int().positive().optional(),
	nameEn: name('English'),
	nameAm: name('Amharic'),
	nameZh: name('Chinese'),
	nameAr: name('Arabic'),
	longitude: z
		.number({ error: 'Enter the longitude' })
		.min(-180, 'Between -180 and 180')
		.max(180, 'Between -180 and 180'),
	latitude: z
		.number({ error: 'Enter the latitude' })
		.min(-90, 'Between -90 and 90')
		.max(90, 'Between -90 and 90'),
	active: z.boolean().default(true)
});

export type GlobeCitySchema = typeof globeCitySchema;
