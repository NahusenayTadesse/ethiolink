import { z } from 'zod';
import { EMPLOYMENT_TYPES } from '$lib/careers';
import { translatedField } from '$lib/dashboard/translatedSchema';

/** A job opening, written on /dashboard/careers/[id]. The description is rich-editor HTML. */
export const jobSchema = z.object({
	...translatedField('title', 'Job title', 160),
	...translatedField('description', 'Description', 100_000),
	location: z.string().trim().min(2, 'Where the job is').max(120).default('Addis Ababa'),
	employmentType: z.enum(EMPLOYMENT_TYPES).default('full_time'),
	closesOn: z.iso.date('Pick a date').or(z.literal('')).default(''),
	slug: z
		.string()
		.trim()
		.max(120)
		.regex(/^[a-z0-9-]*$/, 'Lower-case letters, digits and dashes only')
		.default(''),
	active: z.boolean().default(true)
});
