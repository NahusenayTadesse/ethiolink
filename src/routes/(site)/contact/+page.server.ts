import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { takeToken } from '@nahu/admin-kit/server/rateLimit';
import { db } from '$lib/server/db';
import { contactMessage } from '$lib/server/db/schema';
import { confirmToVisitor, notifyStaff, staffNotice } from '$lib/server/mail';
import { m } from '$lib/paraglide/messages.js';
import { getLocale } from '$lib/paraglide/runtime';
import { SERVICE_SLUGS, serviceLabel, type ServiceSlug } from '$lib/site/services';
import { contactSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const form = await superValidate(zod4(contactSchema));
	// "Ask about this service" links arrive with ?service=<slug>.
	const service = url.searchParams.get('service');
	if (service && (SERVICE_SLUGS as readonly string[]).includes(service)) {
		form.data.service = service as ServiceSlug;
	}
	return { form };
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, url }) => {
		const form = await superValidate(request, zod4(contactSchema));

		// Five messages in a burst, then one every ten minutes, per address.
		if (!takeToken(`contact:${getClientAddress()}`, { capacity: 5, perMinute: 0.1 })) {
			return message(form, { type: 'error', text: m.form_err_rate() }, { status: 429 });
		}
		if (!form.valid) {
			return message(form, { type: 'error', text: m.form_err_check() }, { status: 400 });
		}

		const { website, ...data } = form.data;
		// A bot filled the hidden field: thank it and keep nothing.
		if (website) return message(form, { type: 'success', text: m.form_success_title() });

		let id: number;
		try {
			const [result] = await db.insert(contactMessage).values({
				name: data.name,
				company: data.company || null,
				email: data.email,
				phone: data.phone,
				service: data.service,
				message: data.message,
				locale: getLocale()
			});
			id = result.insertId;
		} catch (err) {
			console.error('Contact form: could not save the message', err);
			return message(form, { type: 'error', text: m.form_err_failed() }, { status: 500 });
		}

		const link = new URL(`/dashboard/messages/${id}`, url.origin).href;
		notifyStaff(
			`New website message from ${data.name}`,
			staffNotice(
				'New message from the website',
				[
					['Name', data.name],
					['Company', data.company || '—'],
					['Email', data.email],
					['Phone', data.phone],
					['Service', serviceLabel(data.service)],
					['Language', getLocale()]
				],
				data.message,
				link
			),
			data.email
		).catch((err) => console.error('Contact form: staff email failed', err));
		confirmToVisitor({
			kind: 'message',
			to: data.email,
			name: data.name,
			locale: getLocale(),
			summary: {
				rows: [[m.form_service(), serviceLabel(data.service, getLocale())]],
				text: data.message
			}
		});

		return message(form, { type: 'success', text: m.form_success_title() });
	}
};
