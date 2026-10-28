import { z } from 'zod';
import { APPLICATION_STATUSES } from '$lib/careers';

export const applicationUpdateSchema = z.object({
	status: z.enum(APPLICATION_STATUSES),
	notes: z.string().trim().max(5000).default('')
});
