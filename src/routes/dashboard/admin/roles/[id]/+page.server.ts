import { error, fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { deleteRole, findRole, updateRole } from '$lib/server/admin/roles';
import { refusedForm, refusedPlain } from '$lib/server/admin/forms';
import { roleEditSchema } from '../schema';
import type { Actions, PageServerLoad } from './$types';

const roleId = (raw: string) => {
	const id = Number(raw);
	if (!Number.isInteger(id) || id < 1) error(404, 'No such role');
	return id;
};

export const load: PageServerLoad = async ({ params }) => {
	const found = await findRole(roleId(params.id));
	if (!found) error(404, 'No such role');
	const form = await superValidate(
		{
			name: found.role.name,
			description: found.role.description ?? '',
			permissionIds: found.permissionIds
		},
		zod4(roleEditSchema),
		{ errors: false }
	);
	return { ...found, form };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const form = await superValidate(request, zod4(roleEditSchema));
		if (!form.valid) return fail(400, { form });
		try {
			await updateRole(roleId(params.id), form.data);
		} catch (err) {
			return refusedForm(form, err);
		}
		return message(form, {
			type: 'success',
			text: 'Saved. It applies to everyone with this role from their next page.'
		});
	},

	delete: async ({ params }) => {
		try {
			await deleteRole(roleId(params.id));
		} catch (err) {
			return refusedPlain(err);
		}
		redirect(303, '/dashboard/admin/roles');
	}
};
