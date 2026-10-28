import { z } from 'zod';

export const signInSchema = z.object({
	email: z.email('Enter your email address.').trim(),
	password: z.string().min(1, 'Enter your password.')
});

export const setupSchema = z.object({
	name: z.string().trim().min(2, 'Enter your name.').max(120),
	email: z.email('Enter a valid email address.').trim(),
	password: z.string().min(10, 'Use at least 10 characters.').max(128)
});
