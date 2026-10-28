import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addRole, listRoles } from '$lib/server/admin/roles';
import { refusedForm } from '$lib/server/admin/forms';
import { roleSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [rows, addForm] = await Promise.all([listRoles(), superValidate(zod4(roleSchema))]);
	return { rows, addForm };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const form = await superValidate(request, zod4(roleSchema));
		if (!form.valid) return fail(400, { form });
		let id: number;
		try {
			id = await addRole(form.data);
		} catch (err) {
			return refusedForm(form, err);
		}
		// Straight to its page: a new role can do nothing until its permissions are ticked.
		redirect(303, `/dashboard/admin/roles/${id}`);
	}
};
