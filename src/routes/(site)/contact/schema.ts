import { z } from 'zod';
import { m } from '$lib/paraglide/messages.js';
import { SERVICE_SLUGS } from '$lib/site/services';

/**
 * The public contact form. Messages are functions so they are read in the visitor's language
 * when the form is checked — in the browser and again on the server.
 */
export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, { error: () => m.form_err_name() })
		.max(120),
	company: z.string().trim().max(160).default(''),
	email: z
		.email({ error: () => m.form_err_email() })
		.trim()
		.max(255),
	phone: z
		.string()
		.trim()
		.regex(/^\+?[\d\s().-]{7,20}$/, { error: () => m.form_err_phone() }),
	service: z.enum(['general', ...SERVICE_SLUGS]).default('general'),
	message: z
		.string()
		.trim()
		.min(10, { error: () => m.form_err_message() })
		.max(5000),
	/** A honeypot: hidden from people, filled in by bots. */
	website: z.string().max(200).default('')
});

export type ContactSchema = typeof contactSchema;
