import { z } from 'zod';
import { optionalUrl, translatedField } from '$lib/dashboard/translatedSchema';

const phone = z
	.string()
	.trim()
	.regex(/^(\+?[\d\s().-]{7,20})?$/, 'A phone number, e.g. +251 11 123 4567')
	.default('');

/** The office's contact details, edited from /dashboard/settings. Empty fields are hidden on the site. */
export const settingsSchema = z.object({
	email: z.union([z.literal(''), z.email('Enter an email address').trim().max(255)]).default(''),
	phone,
	whatsapp: phone,
	telegram: z
		.string()
		.trim()
		.max(80)
		.transform((v) => v.replace(/^@|^https?:\/\/t\.me\//i, ''))
		.pipe(z.string().regex(/^[A-Za-z0-9_]*$/, 'The username only, e.g. ethiolink'))
		.default(''),
	linkedin: optionalUrl,
	facebook: optionalUrl,
	instagram: optionalUrl,
	tiktok: optionalUrl,
	mapQuery: z.string().trim().min(3, 'What the map should search for').max(255),
	...translatedField('address', 'Address', 255),
	...translatedField('hoursWeekdays', 'Weekday hours', 120, { optional: true }),
	...translatedField('hoursSaturday', 'Saturday hours', 120, { optional: true })
});
