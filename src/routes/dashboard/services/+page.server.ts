import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { postedForm, storeFileFields, UploadRefused } from '@nahu/admin-kit/server/files';
import { db } from '$lib/server/db';
import { serviceSetting } from '$lib/server/db/schema';
import { SERVICE_SLUGS, serviceLabel } from '$lib/site/services';
import { serviceSettingSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

/** All eight services, each with its settings — the defaults for one never saved. */
export const load: PageServerLoad = async () => {
	const [rows, form] = await Promise.all([
		db.select().from(serviceSetting),
		superValidate(zod4(serviceSettingSchema))
	]);
	const bySlug = new Map(rows.map((r) => [r.slug, r]));
	const services = SERVICE_SLUGS.map((slug, i) => {
		const row = bySlug.get(slug);
		return {
			id: i + 1,
			slug,
			title: serviceLabel(slug),
			active: row?.active ?? true,
			sortOrder: row?.sortOrder ?? i + 1,
			photo: row?.photo ?? null
		};
	}).sort((a, b) => a.sortOrder - b.sortOrder);
	return { services, form };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const posted = await postedForm(request);
		const form = await superValidate(posted, zod4(serviceSettingSchema));
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the form' }, { status: 400 });

		const values: Record<string, unknown> = { ...form.data };
		try {
			await storeFileFields(values, ['photo'], posted);
		} catch (err) {
			if (!(err instanceof UploadRefused)) throw err;
			setError(form, 'photo', err.message);
			return message(form, { type: 'error', text: err.message }, { status: 400 });
		}

		const { slug, ...settings } = values as typeof form.data & { photo?: string | null };
		await db
			.insert(serviceSetting)
			.values({ slug, ...settings, photo: settings.photo ?? null })
			.onDuplicateKeyUpdate({ set: settings });
		return message(form, { type: 'success', text: `${serviceLabel(slug)} saved` });
	}
};
