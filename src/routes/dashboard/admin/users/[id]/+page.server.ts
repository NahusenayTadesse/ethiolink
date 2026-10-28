import { error, fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import {
	findUser,
	resetPassword,
	roleOptions,
	setUserActive,
	updateUser
} from '$lib/server/admin/users';
import { refusedForm, refusedPlain } from '$lib/server/admin/forms';
import { userSchema } from '../schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const person = await findUser(params.id);
	if (!person) error(404, 'No such user');
	const [roles, form] = await Promise.all([
		roleOptions(),
		superValidate(
			{ name: person.name, email: person.email, roleId: person.roleId ?? undefined },
			zod4(userSchema),
			{ errors: false }
		)
	]);
	return { person, roles, form, isSelf: locals.user?.id === person.id };
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(userSchema));
		if (!form.valid) return fail(400, { form });
		try {
			await updateUser(locals.user?.id, params.id, form.data);
		} catch (err) {
			return refusedForm(form, err);
		}
		return message(form, { type: 'success', text: 'Saved' });
	},

	reset: async ({ params }) => {
		try {
			const credentials = await resetPassword(params.id);
			return { credentials, message: { type: 'success', text: 'New temporary password set' } };
		} catch (err) {
			return refusedPlain(err);
		}
	},

	deactivate: async ({ params, locals }) => {
		try {
			await setUserActive(locals.user?.id, params.id, false);
		} catch (err) {
			return refusedPlain(err);
		}
		return { message: { type: 'success', text: 'Switched off and signed out everywhere' } };
	},

	activate: async ({ params, locals }) => {
		try {
			await setUserActive(locals.user?.id, params.id, true);
		} catch (err) {
			return refusedPlain(err);
		}
		return { message: { type: 'success', text: 'Switched back on' } };
	}
};
