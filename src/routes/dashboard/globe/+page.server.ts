import { error, fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { globeCity } from '$lib/server/db/schema';
import { globeCitySchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

/** The cities on the home page globe, with one form to add a city and one to edit any of them. */
export const load: PageServerLoad = async () => {
	const [cities, addForm, editForm] = await Promise.all([
		db.select().from(globeCity).orderBy(asc(globeCity.id)),
		superValidate(zod4(globeCitySchema), { id: 'add-city' }),
		superValidate(zod4(globeCitySchema), { id: 'edit-city' })
	]);
	return { cities, addForm, editForm };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, zod4(globeCitySchema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Check the form' }, { status: 400 });
		}
		const { id, ...values } = form.data;
		if (id) {
			const [result] = await db.update(globeCity).set(values).where(eq(globeCity.id, id));
			if (!result.affectedRows) error(404, 'City not found');
			return message(form, { type: 'success', text: `${values.nameEn} saved` });
		}
		await db.insert(globeCity).values(values);
		return message(form, { type: 'success', text: `${values.nameEn} added to the globe` });
	},

	delete: async ({ request }) => {
		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'Choose a city.' });
		await db.delete(globeCity).where(eq(globeCity.id, id));
		return { done: 'City removed' };
	}
};
