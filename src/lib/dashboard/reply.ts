import { z } from 'zod';

/** An email written from a message, quote or application page. */
export const replySchema = z.object({
	subject: z.string().trim().min(3, 'Write a subject').max(200, 'At most 200 characters'),
	body: z.string().trim().min(5, 'Write the reply').max(10000, 'At most 10,000 characters')
});

export type ReplySchema = typeof replySchema;
