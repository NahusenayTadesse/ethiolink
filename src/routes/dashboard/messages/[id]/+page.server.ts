import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactMessage, emailReply, user } from '$lib/server/db/schema';
import { replyBox, sendReply } from '$lib/server/replies';
import { MESSAGE_STATUSES, type MessageStatus } from '$lib/messageStatus';
import type { Actions, PageServerLoad } from './$types';

function messageId(params: { id?: string }) {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Message not found');
	return id;
}

/** One message. Opening a new one marks it read. */
export const load: PageServerLoad = async ({ params }) => {
	const id = messageId(params);
	const [row] = await db
		.select({ message: contactMessage, repliedByName: user.name })
		.from(contactMessage)
		.leftJoin(user, eq(user.id, contactMessage.repliedBy))
		.where(eq(contactMessage.id, id));
	if (!row) error(404, 'Message not found');

	if (row.message.status === 'new') {
		await db.update(contactMessage).set({ status: 'read' }).where(eq(contactMessage.id, id));
		row.message.status = 'read';
	}
	return { ...row, reply: await replyBox('message', id, 'Re: your message to EthioLink') };
};

export const actions: Actions = {
	status: async ({ request, params, locals }) => {
		const id = messageId(params);
		const to = String((await request.formData()).get('to'));
		if (!(MESSAGE_STATUSES as readonly string[]).includes(to)) {
			return fail(400, { error: 'Choose a status.' });
		}
		const replied = to === 'replied';
		await db
			.update(contactMessage)
			.set({
				status: to as MessageStatus,
				repliedBy: replied ? (locals.user?.id ?? null) : null,
				repliedAt: replied ? new Date() : null
			})
			.where(eq(contactMessage.id, id));
		return { done: replied ? 'Marked replied' : `Marked ${to}` };
	},

	/** Emails the answer, keeps a copy, and marks the message replied. */
	reply: async (event) => {
		const id = messageId(event.params);
		const [note] = await db.select().from(contactMessage).where(eq(contactMessage.id, id));
		if (!note) error(404, 'Message not found');
		const { sent, result } = await sendReply(event, {
			kind: 'message',
			recordId: id,
			to: note.email,
			locale: note.locale
		});
		if (sent) {
			await db
				.update(contactMessage)
				.set({ status: 'replied', repliedBy: event.locals.user?.id ?? null, repliedAt: new Date() })
				.where(eq(contactMessage.id, id));
		}
		return result;
	},

	delete: async ({ params }) => {
		const id = messageId(params);
		await db.transaction(async (tx) => {
			await tx.delete(contactMessage).where(eq(contactMessage.id, id));
			await tx
				.delete(emailReply)
				.where(and(eq(emailReply.kind, 'message'), eq(emailReply.recordId, id)));
		});
		redirect(303, '/dashboard/messages');
	}
};
