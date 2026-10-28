import fs from 'node:fs/promises';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { resolveStoredFile } from '@nahu/admin-kit/server/files';
import { db } from '$lib/server/db';
import { emailReply, jobApplication, jobOpening } from '$lib/server/db/schema';
import { replyBox, sendReply } from '$lib/server/replies';
import { applicationUpdateSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

async function findApplication(param: string | undefined) {
	const id = Number(param);
	const [row] = Number.isInteger(id)
		? await db
				.select({
					application: jobApplication,
					job: { id: jobOpening.id, title: jobOpening.titleEn }
				})
				.from(jobApplication)
				.innerJoin(jobOpening, eq(jobOpening.id, jobApplication.jobId))
				.where(eq(jobApplication.id, id))
		: [];
	if (!row) error(404, 'Application not found');
	return row;
}

/** One application. Opening a new one moves it to "Reviewing". */
export const load: PageServerLoad = async ({ params }) => {
	const row = await findApplication(params.id);
	const a = row.application;
	if (a.status === 'new') {
		await db.update(jobApplication).set({ status: 'review' }).where(eq(jobApplication.id, a.id));
		a.status = 'review';
	}
	const [form, reply] = await Promise.all([
		superValidate({ status: a.status, notes: a.notes ?? '' }, zod4(applicationUpdateSchema), {
			errors: false,
			id: 'update'
		}),
		replyBox('application', a.id, `Your application for ${row.job.title} — EthioLink`)
	]);
	return { ...row, form, reply };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { application } = await findApplication(params.id);
		const form = await superValidate(request, zod4(applicationUpdateSchema), { id: 'update' });
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the form' }, { status: 400 });
		await db
			.update(jobApplication)
			.set({ status: form.data.status, notes: form.data.notes || null })
			.where(eq(jobApplication.id, application.id));
		return message(form, { type: 'success', text: 'Saved' });
	},

	reply: async (event) => {
		const { application } = await findApplication(event.params.id);
		const { result } = await sendReply(event, {
			kind: 'application',
			recordId: application.id,
			to: application.email,
			locale: application.locale
		});
		return result;
	},

	delete: async ({ params }) => {
		const { application, job } = await findApplication(params.id);
		await db.transaction(async (tx) => {
			await tx.delete(jobApplication).where(eq(jobApplication.id, application.id));
			await tx
				.delete(emailReply)
				.where(and(eq(emailReply.kind, 'application'), eq(emailReply.recordId, application.id)));
		});
		const path = resolveStoredFile(application.cv);
		if (path) await fs.unlink(path).catch(() => {});
		redirect(303, `/dashboard/careers/${job.id}`);
	}
};
