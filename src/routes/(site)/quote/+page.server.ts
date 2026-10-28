import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { takeToken } from '@nahu/admin-kit/server/rateLimit';
import { saveUploadedFile, UploadRefused } from '@nahu/admin-kit/server/files';
import { db } from '$lib/server/db';
import { quoteRequest } from '$lib/server/db/schema';
import { confirmToVisitor, notifyStaff, staffNotice } from '$lib/server/mail';
import { m } from '$lib/paraglide/messages.js';
import { getLocale } from '$lib/paraglide/runtime';
import { SERVICE_SLUGS, serviceLabel, type ServiceSlug } from '$lib/site/services';
import { MODE_LABELS, quoteNumber } from '$lib/quoteStatus';
import { quoteSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const form = await superValidate(zod4(quoteSchema));
	// "Get a quote" on a service arrives with ?service=<slug>.
	const service = url.searchParams.get('service');
	if (service && (SERVICE_SLUGS as readonly string[]).includes(service)) {
		form.data.service = service as ServiceSlug;
	}
	return { form };
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, url }) => {
		const form = await superValidate(request, zod4(quoteSchema));

		// The same allowance as the contact form, counted separately.
		if (!takeToken(`quote:${getClientAddress()}`, { capacity: 5, perMinute: 0.1 })) {
			return message(form, { type: 'error', text: m.form_err_rate() }, { status: 429 });
		}
		if (!form.valid) {
			return message(form, { type: 'error', text: m.form_err_check() }, { status: 400 });
		}

		const { website, documents, ...data } = form.data;
		// A bot filled the hidden field: thank it and keep nothing.
		if (website) return message(form, { type: 'success', text: quoteNumber(0) });

		const stored: string[] = [];
		try {
			for (const file of documents) stored.push(await saveUploadedFile(file));
		} catch (err) {
			if (!(err instanceof UploadRefused)) throw err;
			setError(form, 'documents._errors', m.quote_err_files());
			return message(form, { type: 'error', text: m.quote_err_files() }, { status: 400 });
		}

		let id: number;
		try {
			const [result] = await db.insert(quoteRequest).values({
				...data,
				company: data.company || null,
				weightKg: data.weightKg?.toFixed(2) ?? null,
				volumeCbm: data.volumeCbm?.toFixed(3) ?? null,
				incoterm: data.incoterm || null,
				readyDate: data.readyDate || null,
				documents: stored,
				locale: getLocale()
			});
			id = result.insertId;
		} catch (err) {
			console.error('Quote form: could not save the request', err);
			return message(form, { type: 'error', text: m.form_err_failed() }, { status: 500 });
		}

		const reference = quoteNumber(id);
		notifyStaff(
			`Quote request ${reference}: ${data.origin} → ${data.destination}`,
			staffNotice(
				`New quote request ${reference}`,
				[
					['Name', data.name],
					['Company', data.company || '—'],
					['Email', data.email],
					['Phone', data.phone],
					['Service', serviceLabel(data.service)],
					['Route', `${data.origin} → ${data.destination}`],
					['Mode', MODE_LABELS[data.mode]],
					['Weight', data.weightKg ? `${data.weightKg} kg` : '—'],
					['Volume', data.volumeCbm ? `${data.volumeCbm} m³` : '—'],
					['Incoterm', data.incoterm || 'Not sure'],
					['Ready by', data.readyDate || '—'],
					['Documents', stored.length],
					['Language', getLocale()]
				],
				data.cargo,
				new URL(`/dashboard/quotes/${id}`, url.origin).href
			),
			data.email
		).catch((err) => console.error('Quote form: staff email failed', err));
		const modeLabel = {
			sea: m.hero_route_sea,
			air: m.hero_route_air,
			land: m.hero_route_land,
			any: m.quote_mode_any
		}[data.mode]();
		confirmToVisitor({
			kind: 'quote',
			to: data.email,
			name: data.name,
			locale: getLocale(),
			reference,
			summary: {
				rows: [
					[m.form_service(), serviceLabel(data.service, getLocale())],
					[m.quote_origin(), data.origin],
					[m.quote_destination(), data.destination],
					[m.quote_mode(), modeLabel]
				],
				text: data.cargo
			}
		});

		return message(form, { type: 'success', text: reference });
	}
};
