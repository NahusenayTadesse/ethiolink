import { z } from 'zod';

/** A staff account as an administrator edits it. The password is never typed: it is generated. */
export const userSchema = z.object({
	name: z.string().trim().min(2, 'Write their name').max(255),
	email: z.email('Enter an email address').trim().max(255),
	roleId: z.coerce.number().int().positive('Choose a role')
});
