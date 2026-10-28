import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { changePasswordSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	form: await superValidate(zod4(changePasswordSchema)),
	required: locals.mustChangePassword
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(changePasswordSchema));
		if (!form.valid) return fail(400, { form });
		if (!locals.user) redirect(303, '/login');

		try {
			// Other devices are signed out; this one stays signed in.
			await auth.api.changePassword({
				body: {
					currentPassword: form.data.current,
					newPassword: form.data.password,
					revokeOtherSessions: true
				},
				headers: request.headers
			});
		} catch (err) {
			if (err instanceof APIError)
				return setError(form, 'current', 'That is not your current password');
			throw err;
		}
		await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, locals.user.id));

		if (locals.mustChangePassword) redirect(303, '/dashboard');
		form.data = { current: '', password: '', confirm: '' };
		return message(form, { type: 'success', text: 'Password changed' });
	}
};
