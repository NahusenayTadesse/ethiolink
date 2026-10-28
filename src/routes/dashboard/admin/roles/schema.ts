import { z } from 'zod';

export const roleSchema = z.object({
	name: z.string().trim().min(2, 'Name the role').max(80),
	description: z.string().trim().max(255).default('')
});

/** The role page's form: posted as JSON, because the permissions are a list of ids. */
export const roleEditSchema = roleSchema.extend({
	permissionIds: z.array(z.number().int()).default([])
});
