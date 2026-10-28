import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addUser, listUsers, roleOptions } from '$lib/server/admin/users';
import { refusedForm } from '$lib/server/admin/forms';
import { userSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [rows, roles, addForm] = await Promise.all([
		listUsers(),
		roleOptions(),
		superValidate(zod4(userSchema))
	]);
	return { rows, roles, addForm };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const form = await superValidate(request, zod4(userSchema));
		if (!form.valid) return fail(400, { form });
		let created;
		try {
			created = await addUser(form.data);
		} catch (err) {
			return refusedForm(form, err);
		}
		// The password goes back once, in this answer only, to be handed over.
		const credentials = { name: form.data.name, email: created.email, password: created.password };
		return {
			...message(form, { type: 'success', text: `${form.data.name} can now sign in` }),
			credentials
		};
	}
};
