import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema';
import { blankToNull } from '$lib/dashboard/translatedSchema';
import { settingsSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
	// Nulls become empty fields, which the schema reads as "not given".
	const values = row
		? Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? '']))
		: undefined;
	return { form: await superValidate(values, zod4(settingsSchema), { errors: false }) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(settingsSchema));
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the form' }, { status: 400 });

		// Empty contact details are stored as NULL and hidden; English text stays a string (the
		// columns require it), and an empty one — Saturday hours, say — is hidden the same way.
		const values = blankToNull({ ...form.data }) as Record<string, string | null>;
		for (const key of [
			'email',
			'phone',
			'whatsapp',
			'telegram',
			'linkedin',
			'facebook',
			'instagram',
			'tiktok'
		]) {
			values[key] ||= null;
		}
		await db
			.insert(siteSettings)
			.values({ id: 1, ...(values as typeof form.data) })
			.onDuplicateKeyUpdate({ set: values });
		return message(form, { type: 'success', text: 'Company details saved — live on the site now' });
	}
};
