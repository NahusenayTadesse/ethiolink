import { z } from 'zod';

export const changePasswordSchema = z
	.object({
		current: z.string().min(1, 'Enter your current password'),
		password: z.string().min(10, 'At least 10 characters').max(128, 'At most 128 characters'),
		confirm: z.string()
	})
	.refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The two don’t match' })
	.refine((v) => v.password !== v.current, {
		path: ['password'],
		message: 'Choose a password different from the current one'
	});
