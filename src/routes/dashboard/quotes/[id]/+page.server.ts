import fs from 'node:fs/promises';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { resolveStoredFile } from '@nahu/admin-kit/server/files';
import { db } from '$lib/server/db';
import { emailReply, quoteRequest, user } from '$lib/server/db/schema';
import { replyBox, sendReply } from '$lib/server/replies';
import { quoteNumber } from '$lib/quoteStatus';
import { CURRENCIES, quoteUpdateSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

function quoteId(params: { id?: string }) {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Quote request not found');
	return id;
}

async function findQuote(id: number) {
	const [row] = await db
		.select({ quote: quoteRequest, updatedByName: user.name })
		.from(quoteRequest)
		.leftJoin(user, eq(user.id, quoteRequest.updatedBy))
		.where(eq(quoteRequest.id, id));
	if (!row) error(404, 'Quote request not found');
	return row;
}

/** One request. Opening a new one moves it to "Reviewing", so colleagues see it is taken. */
export const load: PageServerLoad = async ({ params, locals }) => {
	const id = quoteId(params);
	const row = await findQuote(id);

	if (row.quote.status === 'new') {
		await db
			.update(quoteRequest)
			.set({ status: 'review', updatedBy: locals.user?.id ?? null })
			.where(eq(quoteRequest.id, id));
		row.quote.status = 'review';
		row.updatedByName = locals.user?.name ?? null;
	}

	const q = row.quote;
	const [updateForm, reply] = await Promise.all([
		superValidate(
			{
				status: q.status,
				amount: q.amount === null ? undefined : Number(q.amount),
				currency: q.currency as (typeof CURRENCIES)[number],
				notes: q.notes ?? ''
			},
			zod4(quoteUpdateSchema),
			{ errors: false, id: 'update' }
		),
		replyBox('quote', id, `Your quote request ${quoteNumber(id)} — EthioLink`)
	]);
	return { ...row, updateForm, reply };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const id = quoteId(params);
		const form = await superValidate(request, zod4(quoteUpdateSchema), { id: 'update' });
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the form' }, { status: 400 });

		const { amount, notes, ...rest } = form.data;
		const [result] = await db
			.update(quoteRequest)
			.set({
				...rest,
				amount: amount === undefined ? null : amount.toFixed(2),
				notes: notes || null,
				updatedBy: locals.user?.id ?? null
			})
			.where(eq(quoteRequest.id, id));
		if (!result.affectedRows) error(404, 'Quote request not found');
		return message(form, { type: 'success', text: 'Saved' });
	},

	reply: async (event) => {
		const id = quoteId(event.params);
		const { quote } = await findQuote(id);
		const { result } = await sendReply(event, {
			kind: 'quote',
			recordId: id,
			to: quote.email,
			locale: quote.locale
		});
		return result;
	},

	delete: async ({ params }) => {
		const id = quoteId(params);
		const { quote } = await findQuote(id);
		await db.transaction(async (tx) => {
			await tx.delete(quoteRequest).where(eq(quoteRequest.id, id));
			await tx
				.delete(emailReply)
				.where(and(eq(emailReply.kind, 'quote'), eq(emailReply.recordId, id)));
		});
		// Their shipping documents go with it: nothing else points at them.
		for (const name of quote.documents) {
			const path = resolveStoredFile(name);
			if (path) await fs.unlink(path).catch(() => {});
		}
		redirect(303, '/dashboard/quotes');
	}
};
