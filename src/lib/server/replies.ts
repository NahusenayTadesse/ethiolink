import { asc, and, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { emailReply, user, type REPLY_SUBJECTS } from '$lib/server/db/schema';
import { mailConfigured, replyEmail, sendEmail } from '$lib/server/mail';
import { replySchema } from '$lib/dashboard/reply';

type Kind = (typeof REPLY_SUBJECTS)[number];

/** The reply box for a record: an empty form, whether email works, and what was sent before. */
export async function replyBox(kind: Kind, recordId: number, subject: string) {
	const [form, history] = await Promise.all([
		superValidate({ subject, body: '' }, zod4(replySchema), { errors: false, id: 'reply' }),
		db
			.select({
				id: emailReply.id,
				subject: emailReply.subject,
				body: emailReply.body,
				toEmail: emailReply.toEmail,
				sentAt: emailReply.sentAt,
				sentBy: user.name
			})
			.from(emailReply)
			.leftJoin(user, eq(user.id, emailReply.sentBy))
			.where(and(eq(emailReply.kind, kind), eq(emailReply.recordId, recordId)))
			.orderBy(asc(emailReply.sentAt), asc(emailReply.id))
	]);
	return { form, history, mailReady: mailConfigured() };
}

/**
 * Sends the reply posted from a record's page and keeps a copy. `sent` tells the caller whether
 * to move the record on (a message becomes "replied"); a failure leaves the record as it was.
 */
export async function sendReply(
	event: RequestEvent,
	target: { kind: Kind; recordId: number; to: string; locale: string }
) {
	const form = await superValidate(event.request, zod4(replySchema), { id: 'reply' });
	if (!form.valid) {
		return {
			sent: false,
			result: message(form, { type: 'error', text: 'Check the reply' }, { status: 400 })
		};
	}
	if (!mailConfigured()) {
		return {
			sent: false,
			result: message(
				form,
				{ type: 'error', text: 'Email is not set up on the server yet (SMTP settings).' },
				{ status: 503 }
			)
		};
	}

	const writer = event.locals.user?.name ?? 'EthioLink';
	try {
		await sendEmail({
			to: target.to,
			subject: form.data.subject,
			html: await replyEmail(form.data.body, writer, target.locale, form.data.subject),
			replyTo: event.locals.user?.email
		});
	} catch (err) {
		console.error(`Reply to ${target.kind} ${target.recordId} failed`, err);
		return {
			sent: false,
			result: message(
				form,
				{ type: 'error', text: 'The mail server refused the email. Try again shortly.' },
				{ status: 502 }
			)
		};
	}

	await db.insert(emailReply).values({
		kind: target.kind,
		recordId: target.recordId,
		toEmail: target.to,
		subject: form.data.subject,
		body: form.data.body,
		sentBy: event.locals.user?.id ?? null
	});
	form.data.body = '';
	return {
		sent: true,
		result: message(form, { type: 'success', text: `Reply sent to ${target.to}` })
	};
}
