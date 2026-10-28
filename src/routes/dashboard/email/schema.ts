import { z } from 'zod';

export const EMAIL_LANGUAGES = ['en', 'am', 'zh', 'ar'] as const;

/** Addresses typed into "To", split on commas, semicolons, spaces or new lines. */
export const recipients = (to: string) =>
	to
		.split(/[\s,;]+/)
		.map((a) => a.trim())
		.filter(Boolean);

export const MAX_RECIPIENTS = 20;

/** A new email written on /dashboard/email. */
export const composeSchema = z.object({
	to: z
		.string()
		.trim()
		.min(1, 'Enter who it goes to')
		.max(2000)
		.superRefine((value, ctx) => {
			const list = recipients(value);
			const bad = list.filter((a) => !z.email().safeParse(a).success);
			if (bad.length)
				ctx.addIssue({ code: 'custom', message: `Not an email address: ${bad.join(', ')}` });
			else if (list.length > MAX_RECIPIENTS)
				ctx.addIssue({ code: 'custom', message: `At most ${MAX_RECIPIENTS} addresses at a time` });
		}),
	locale: z.enum(EMAIL_LANGUAGES).default('en'),
	subject: z.string().trim().min(3, 'Write a subject').max(200, 'At most 200 characters'),
	body: z
		.string()
		.max(100_000, 'The message is too long')
		.refine((html) => html.replace(/<[^>]*>|&nbsp;/g, '').trim().length > 0, 'Write the message')
});

export type ComposeSchema = typeof composeSchema;
