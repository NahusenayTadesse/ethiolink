import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { emailReply, user } from '$lib/server/db/schema';
import { mailConfigured, sendEmail } from '$lib/server/mail';
import { cleanBody, composedEmail } from './compose.server';
import { EMAIL_LANGUAGES, composeSchema, recipients } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	// A link can start an email: /dashboard/email?to=…&subject=…&locale=am
	const locale = url.searchParams.get('locale');
	const form = await superValidate(
		{
			to: url.searchParams.get('to') ?? '',
			subject: url.searchParams.get('subject') ?? '',
			locale: (EMAIL_LANGUAGES as readonly string[]).includes(locale ?? '')
				? (locale as (typeof EMAIL_LANGUAGES)[number])
				: 'en',
			body: ''
		},
		zod4(composeSchema),
		{ errors: false }
	);

	const rows = await db
		.select({
			id: emailReply.id,
			toEmail: emailReply.toEmail,
			subject: emailReply.subject,
			body: emailReply.body,
			sentAt: emailReply.sentAt,
			sentBy: user.name
		})
		.from(emailReply)
		.leftJoin(user, eq(user.id, emailReply.sentBy))
		.where(eq(emailReply.kind, 'direct'))
		.orderBy(desc(emailReply.sentAt), desc(emailReply.id))
		.limit(200);

	// One send to several people is one row per address; show it once, with everyone it went to.
	const sent: (Omit<(typeof rows)[number], 'toEmail'> & { to: string[] })[] = [];
	for (const { toEmail, ...row } of rows) {
		const last = sent.at(-1);
		if (
			last &&
			last.subject === row.subject &&
			last.body === row.body &&
			last.sentBy === row.sentBy &&
			Math.abs(last.sentAt.getTime() - row.sentAt.getTime()) < 60_000
		) {
			last.to.push(toEmail);
		} else if (sent.length < 50) {
			sent.push({ ...row, to: [toEmail] });
		} else break;
	}

	return {
		form,
		sent,
		mailReady: mailConfigured(),
		from: env.SMTP_USER ?? null,
		replyTo: locals.user?.email ?? null
	};
};

export const actions: Actions = {
	send: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(composeSchema));
		if (!form.valid) return fail(400, { form });
		if (!mailConfigured()) {
			return message(
				form,
				{ type: 'error', text: 'Email is not set up on the server yet (SMTP settings).' },
				{ status: 503 }
			);
		}

		const body = cleanBody(form.data.body);
		if (!body) return setError(form, 'body', 'Write the message');

		const html = await composedEmail({
			body,
			subject: form.data.subject,
			locale: form.data.locale,
			writer: locals.user?.name ?? 'EthioLink'
		});

		// One email per address, so no one sees who else it went to.
		const sent: string[] = [];
		const failed: string[] = [];
		for (const to of recipients(form.data.to)) {
			try {
				await sendEmail({ to, subject: form.data.subject, html, replyTo: locals.user?.email });
				sent.push(to);
			} catch (err) {
				console.error(`Email to ${to} failed`, err);
				failed.push(to);
			}
		}

		if (sent.length) {
			await db.insert(emailReply).values(
				sent.map((toEmail) => ({
					kind: 'direct' as const,
					recordId: null,
					toEmail,
					subject: form.data.subject,
					body,
					sentBy: locals.user?.id ?? null
				}))
			);
		}

		if (failed.length) {
			// Keep what was written, and leave only the addresses still to send to.
			form.data.to = failed.join(', ');
			return message(
				form,
				{
					type: 'error',
					text: sent.length
						? `Sent to ${sent.length}; the mail server refused ${failed.join(', ')}. Try those again.`
						: 'The mail server refused the email. Try again shortly.'
				},
				{ status: 502 }
			);
		}

		form.data = { ...form.data, to: '', subject: '', body: '' };
		return message(form, {
			type: 'success',
			text: sent.length === 1 ? `Email sent to ${sent[0]}` : `Email sent to ${sent.length} people`
		});
	}
};
