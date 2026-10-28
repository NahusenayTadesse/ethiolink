import { error } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { takeToken } from '@nahu/admin-kit/server/rateLimit';
import { saveUploadedFile, UploadRefused } from '@nahu/admin-kit/server/files';
import { db } from '$lib/server/db';
import { jobApplication } from '$lib/server/db/schema';
import { openJob } from '$lib/server/content';
import { confirmToVisitor, notifyStaff, staffNotice } from '$lib/server/mail';
import { m } from '$lib/paraglide/messages.js';
import { getLocale } from '$lib/paraglide/runtime';
import { applySchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

async function findJob(slug: string) {
	const job = await openJob(slug, getLocale());
	if (!job) error(404, 'Not found');
	return job;
}

export const load: PageServerLoad = async ({ params }) => ({
	job: await findJob(params.slug),
	form: await superValidate(zod4(applySchema))
});

export const actions: Actions = {
	default: async ({ request, params, getClientAddress, url }) => {
		const job = await findJob(params.slug);
		const form = await superValidate(request, zod4(applySchema));

		if (!takeToken(`apply:${getClientAddress()}`, { capacity: 5, perMinute: 0.1 })) {
			return message(form, { type: 'error', text: m.form_err_rate() }, { status: 429 });
		}
		if (!form.valid) {
			return message(form, { type: 'error', text: m.form_err_check() }, { status: 400 });
		}
		const { website, cv, ...data } = form.data;
		if (website) return message(form, { type: 'success', text: m.apply_success_title() });

		let stored: string;
		try {
			stored = await saveUploadedFile(cv);
		} catch (err) {
			if (!(err instanceof UploadRefused)) throw err;
			setError(form, 'cv', m.apply_err_cv());
			return message(form, { type: 'error', text: m.apply_err_cv() }, { status: 400 });
		}

		let id: number;
		try {
			const [result] = await db.insert(jobApplication).values({
				jobId: job.id,
				...data,
				coverLetter: data.coverLetter || null,
				cv: stored,
				locale: getLocale()
			});
			id = result.insertId;
		} catch (err) {
			console.error('Job application: could not save it', err);
			return message(form, { type: 'error', text: m.form_err_failed() }, { status: 500 });
		}

		// Staff read the English title, whatever language the applicant used.
		const english = (await openJob(params.slug, 'en'))?.title ?? job.title;
		notifyStaff(
			`Application for ${english} from ${data.name}`,
			staffNotice(
				`New application: ${english}`,
				[
					['Name', data.name],
					['Email', data.email],
					['Phone', data.phone],
					['Language', getLocale()]
				],
				data.coverLetter || null,
				new URL(`/dashboard/careers/applications/${id}`, url.origin).href
			),
			data.email
		).catch((err) => console.error('Job application: staff email failed', err));
		confirmToVisitor({
			kind: 'application',
			to: data.email,
			name: data.name,
			locale: getLocale(),
			reference: job.title
		});

		return message(form, { type: 'success', text: m.apply_success_title() });
	}
};
