import type { Component } from 'svelte';
import Stamp from '@lucide/svelte/icons/stamp';
import Warehouse from '@lucide/svelte/icons/warehouse';
import Vault from '@lucide/svelte/icons/vault';
import Boxes from '@lucide/svelte/icons/boxes';
import PackageOpen from '@lucide/svelte/icons/package-open';
import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
import Compass from '@lucide/svelte/icons/compass';
import Handshake from '@lucide/svelte/icons/handshake';
import { m } from '$lib/paraglide/messages.js';
import type { Locale } from '$lib/paraglide/runtime';

/** The eight services from Motto.docx, in its order. The slug is stored with contact messages. */
export const SERVICE_SLUGS = [
	'customs',
	'storage',
	'bonded',
	'consolidation',
	'forwarding',
	'trade',
	'consultancy',
	'contracting'
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

type Text = (
	inputs?: Record<string, never>,
	options?: { locale?: 'en' | 'am' | 'zh' | 'ar' }
) => string;

export type Service = {
	slug: ServiceSlug;
	icon: Component;
	title: Text;
	short: Text;
	body: Text;
};

export const SERVICES: Service[] = [
	{
		slug: 'customs',
		icon: Stamp,
		title: m.svc_customs_title,
		short: m.svc_customs_short,
		body: m.svc_customs_body
	},
	{
		slug: 'storage',
		icon: Warehouse,
		title: m.svc_storage_title,
		short: m.svc_storage_short,
		body: m.svc_storage_body
	},
	{
		slug: 'bonded',
		icon: Vault,
		title: m.svc_bonded_title,
		short: m.svc_bonded_short,
		body: m.svc_bonded_body
	},
	{
		slug: 'consolidation',
		icon: Boxes,
		title: m.svc_consolidation_title,
		short: m.svc_consolidation_short,
		body: m.svc_consolidation_body
	},
	{
		slug: 'forwarding',
		icon: PackageOpen,
		title: m.svc_forwarding_title,
		short: m.svc_forwarding_short,
		body: m.svc_forwarding_body
	},
	{
		slug: 'trade',
		icon: ArrowLeftRight,
		title: m.svc_trade_title,
		short: m.svc_trade_short,
		body: m.svc_trade_body
	},
	{
		slug: 'consultancy',
		icon: Compass,
		title: m.svc_consultancy_title,
		short: m.svc_consultancy_short,
		body: m.svc_consultancy_body
	},
	{
		slug: 'contracting',
		icon: Handshake,
		title: m.svc_contracting_title,
		short: m.svc_contracting_short,
		body: m.svc_contracting_body
	}
];

/** A stored service value as staff read it: always English, whatever language the visitor used. */
export function serviceLabel(slug: string, locale: Locale = 'en') {
	const service = SERVICES.find((s) => s.slug === slug);
	return service ? service.title({}, { locale }) : m.form_service_general({}, { locale });
}

/** The services staff left switched on, in their order and with their photos (`$lib/server/content`). */
export function shownServices(visible: { slug: ServiceSlug; photo: string | null }[]) {
	return visible.flatMap(({ slug, photo }) => {
		const service = SERVICES.find((s) => s.slug === slug);
		return service ? [{ ...service, photo }] : [];
	});
}

export type ShownService = ReturnType<typeof shownServices>[number];
