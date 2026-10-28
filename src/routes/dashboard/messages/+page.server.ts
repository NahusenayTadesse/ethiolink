import { count, desc, eq, like, or } from 'drizzle-orm';
import {
	buildWhere,
	currentQuery,
	facetCounts,
	orderBy,
	pagination,
	parseTableQuery,
	type WhereSpec
} from '@nahu/admin-kit/server/queryFilters';
import { db } from '$lib/server/db';
import { contactMessage } from '$lib/server/db/schema';
import { MESSAGE_LABELS, MESSAGE_STATUSES, type MessageStatus } from '$lib/messageStatus';
import { serviceLabel } from '$lib/site/services';
import type { PageServerLoad } from './$types';

const FILTERS = ['status', 'service'] as const;
const SORTS = {
	createdAt: contactMessage.createdAt,
	name: contactMessage.name,
	status: contactMessage.status
};

/** Everything sent from the website's contact form, newest first. */
export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, FILTERS, 20, Object.keys(SORTS));

	const spec: WhereSpec<(typeof FILTERS)[number]> = {
		search: (term) =>
			or(
				like(contactMessage.name, `%${term}%`),
				like(contactMessage.company, `%${term}%`),
				like(contactMessage.email, `%${term}%`),
				like(contactMessage.phone, `%${term}%`),
				like(contactMessage.message, `%${term}%`)
			),
		dateColumn: contactMessage.createdAt,
		filters: {
			status: (v) =>
				(MESSAGE_STATUSES as readonly string[]).includes(v)
					? eq(contactMessage.status, v as MessageStatus)
					: undefined,
			service: (v) => eq(contactMessage.service, v)
		}
	};
	const where = buildWhere(query, spec);

	const [rows, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: contactMessage.id,
				createdAt: contactMessage.createdAt,
				name: contactMessage.name,
				company: contactMessage.company,
				email: contactMessage.email,
				phone: contactMessage.phone,
				service: contactMessage.service,
				message: contactMessage.message,
				locale: contactMessage.locale,
				status: contactMessage.status
			})
			.from(contactMessage)
			.where(where)
			.orderBy(
				...(orderBy(query, SORTS) ?? [desc(contactMessage.createdAt)]),
				desc(contactMessage.id)
			)
			.limit(query.limit)
			.offset(query.offset),
		db.select({ total: count() }).from(contactMessage).where(where),
		facetCounts({
			status: () =>
				db
					.select({ value: contactMessage.status, count: count() })
					.from(contactMessage)
					.where(buildWhere(query, spec, { except: 'status' }))
					.groupBy(contactMessage.status)
					.then((list) =>
						list.map((f) => ({ ...f, label: MESSAGE_LABELS[f.value as MessageStatus] ?? f.value }))
					),
			service: () =>
				db
					.select({ value: contactMessage.service, count: count() })
					.from(contactMessage)
					.where(buildWhere(query, spec, { except: 'service' }))
					.groupBy(contactMessage.service)
					.then((list) => list.map((f) => ({ ...f, label: serviceLabel(f.value) })))
		})
	]);

	return {
		rows,
		server: { pagination: pagination(query, total), facets, filters: currentQuery(query) }
	};
};
