import { error, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { sanitizeRichHtml } from '@nahu/admin-kit/server/richText';
import { isDuplicateKey } from '@nahu/admin-kit/server/dbErrors';
import { db } from '$lib/server/db';
import { jobApplication, jobOpening } from '$lib/server/db/schema';
import { blankToNull, slugify } from '$lib/dashboard/translatedSchema';
import { LANGUAGES } from '$lib/translated';
import { jobSchema } from '../schema';
import type { Actions, PageServerLoad } from './$types';

async function findJob(param: string) {
	if (param === 'new') return null;
	const id = Number(param);
	const [job] = Number.isInteger(id)
		? await db.select().from(jobOpening).where(eq(jobOpening.id, id))
		: [];
	if (!job) error(404, 'Opening not found');
	return job;
}

export const load: PageServerLoad = async ({ params }) => {
	const job = await findJob(params.id);
	const values = job
		? Object.fromEntries(Object.entries(job).map(([k, v]) => [k, v ?? '']))
		: undefined;
	const [form, applications] = await Promise.all([
		superValidate(values, zod4(jobSchema), { errors: false }),
		job
			? db
					.select({
						id: jobApplication.id,
						name: jobApplication.name,
						email: jobApplication.email,
						phone: jobApplication.phone,
						job: jobOpening.titleEn,
						status: jobApplication.status,
						createdAt: jobApplication.createdAt
					})
					.from(jobApplication)
					.innerJoin(jobOpening, eq(jobOpening.id, jobApplication.jobId))
					.where(eq(jobApplication.jobId, job.id))
					.orderBy(desc(jobApplication.createdAt))
			: []
	]);
	return { job, form, applications };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const job = await findJob(params.id);
		const form = await superValidate(request, zod4(jobSchema));
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the opening' }, { status: 400 });

		const values: Record<string, unknown> = { ...form.data, closesOn: form.data.closesOn || null };
		for (const { suffix } of LANGUAGES) {
			values[`description${suffix}`] = sanitizeRichHtml(form.data[`description${suffix}`]);
		}
		if (!values.descriptionEn) {
			setError(form, 'descriptionEn', 'Describe the job in English');
			return message(
				form,
				{ type: 'error', text: 'The English description is empty' },
				{ status: 400 }
			);
		}
		values.slug ||= job?.slug || slugify(form.data.titleEn) || `job-${Date.now()}`;

		const row = blankToNull(values) as typeof jobOpening.$inferInsert;
		try {
			if (job) {
				await db.update(jobOpening).set(row).where(eq(jobOpening.id, job.id));
			} else {
				const [result] = await db.insert(jobOpening).values(row);
				redirect(303, `/dashboard/careers/${result.insertId}`);
			}
		} catch (err) {
			if (!isDuplicateKey(err)) throw err;
			setError(form, 'slug', 'Another opening already uses this link');
			return message(
				form,
				{ type: 'error', text: 'Another opening already uses this link' },
				{ status: 400 }
			);
		}
		return message(form, { type: 'success', text: 'Opening saved' });
	},

	delete: async ({ params }) => {
		const job = await findJob(params.id);
		// Its applications go with it (the foreign key cascades); their CVs stay in the store.
		if (job) await db.delete(jobOpening).where(eq(jobOpening.id, job.id));
		redirect(303, '/dashboard/careers');
	}
};
