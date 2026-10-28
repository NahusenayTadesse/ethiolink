import { z } from 'zod';
import { m } from '$lib/paraglide/messages.js';
import { contactSchema } from '../../contact/schema';

/** Applying for an opening: who they are, their CV, and a letter if they like. */
export const applySchema = z.object({
	name: contactSchema.shape.name,
	email: contactSchema.shape.email,
	phone: contactSchema.shape.phone,
	cv: z
		.file({ error: () => m.apply_err_cv() })
		.mime(['application/pdf'], { error: () => m.apply_err_cv() })
		.max(10 * 1024 * 1024, { error: () => m.apply_err_cv() }),
	coverLetter: z.string().trim().max(5000).default(''),
	website: contactSchema.shape.website
});
