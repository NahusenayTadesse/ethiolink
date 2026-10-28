import { redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { takeToken } from '@nahu/admin-kit/server/rateLimit';
import { eq } from 'drizzle-orm';
import { auth, createFirstAdmin, hasUsers } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';
import { setupSchema, signInSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/dashboard');
	const setup = !(await hasUsers());
	return {
		setup,
		form: setup ? await superValidate(zod4(setupSchema)) : await superValidate(zod4(signInSchema))
	};
};

export const actions: Actions = {
	signin: async ({ request, getClientAddress }) => {
		const form = await superValidate(request, zod4(signInSchema));
		if (!takeToken(`login:${getClientAddress()}`, { capacity: 10, perMinute: 2 })) {
			return message(
				form,
				{ type: 'error', text: 'Too many attempts. Wait a minute.' },
				{ status: 429 }
			);
		}
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the fields.' }, { status: 400 });

		let signedIn;
		try {
			signedIn = await auth.api.signInEmail({
				body: { email: form.data.email, password: form.data.password }
			});
		} catch (err) {
			if (err instanceof APIError) {
				return message(form, { type: 'error', text: 'Wrong email or password.' }, { status: 400 });
			}
			throw err;
		}

		// Checked after the password, so the answer says nothing about an address to someone without it.
		const [person] = await db
			.select({ isActive: user.isActive })
			.from(user)
			.where(eq(user.id, signedIn.user.id));
		if (!person?.isActive) {
			await db.delete(session).where(eq(session.userId, signedIn.user.id));
			return message(
				form,
				{ type: 'error', text: 'This account is switched off. Ask an administrator.' },
				{ status: 403 }
			);
		}
		redirect(303, '/dashboard');
	},

	setup: async ({ request }) => {
		const form = await superValidate(request, zod4(setupSchema));
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the fields.' }, { status: 400 });

		if (!(await createFirstAdmin(form.data))) {
			return message(
				form,
				{ type: 'error', text: 'An account already exists. Sign in.' },
				{ status: 409 }
			);
		}
		await auth.api.signInEmail({ body: { email: form.data.email, password: form.data.password } });
		redirect(303, '/dashboard');
	}
};
