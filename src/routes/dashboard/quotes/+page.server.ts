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
import { quoteRequest } from '$lib/server/db/schema';
import {
	MODE_LABELS,
	QUOTE_LABELS,
	QUOTE_STATUSES,
	type QuoteStatus,
	type TransportMode
} from '$lib/quoteStatus';
import { serviceLabel } from '$lib/site/services';
import type { PageServerLoad } from './$types';

const FILTERS = ['status', 'service', 'mode'] as const;
const SORTS = {
	id: quoteRequest.id,
	createdAt: quoteRequest.createdAt,
	name: quoteRequest.name,
	status: quoteRequest.status,
	amount: quoteRequest.amount
};

/** Every quote request from the website, newest first, filterable by where it stands. */
export const load: PageServerLoad = async ({ url }) => {
	const query = parseTableQuery(url, FILTERS, 20, Object.keys(SORTS));

	const spec: WhereSpec<(typeof FILTERS)[number]> = {
		search: (term) =>
			or(
				like(quoteRequest.name, `%${term}%`),
				like(quoteRequest.company, `%${term}%`),
				like(quoteRequest.email, `%${term}%`),
				like(quoteRequest.phone, `%${term}%`),
				like(quoteRequest.origin, `%${term}%`),
				like(quoteRequest.destination, `%${term}%`),
				like(quoteRequest.cargo, `%${term}%`)
			),
		dateColumn: quoteRequest.createdAt,
		filters: {
			status: (v) =>
				(QUOTE_STATUSES as readonly string[]).includes(v)
					? eq(quoteRequest.status, v as QuoteStatus)
					: undefined,
			service: (v) => eq(quoteRequest.service, v),
			mode: (v) => (v in MODE_LABELS ? eq(quoteRequest.mode, v as TransportMode) : undefined)
		}
	};
	const where = buildWhere(query, spec);

	const facet = <
		C extends typeof quoteRequest.status | typeof quoteRequest.service | typeof quoteRequest.mode
	>(
		column: C,
		except: (typeof FILTERS)[number],
		label: (value: string) => string
	) =>
		db
			.select({ value: column, count: count() })
			.from(quoteRequest)
			.where(buildWhere(query, spec, { except }))
			.groupBy(column)
			.then((list) =>
				list.map((f) => ({ ...f, value: String(f.value), label: label(String(f.value)) }))
			);

	const [rows, [{ total }], facets] = await Promise.all([
		db
			.select({
				id: quoteRequest.id,
				createdAt: quoteRequest.createdAt,
				name: quoteRequest.name,
				company: quoteRequest.company,
				service: quoteRequest.service,
				mode: quoteRequest.mode,
				origin: quoteRequest.origin,
				destination: quoteRequest.destination,
				status: quoteRequest.status,
				amount: quoteRequest.amount,
				currency: quoteRequest.currency
			})
			.from(quoteRequest)
			.where(where)
			.orderBy(...(orderBy(query, SORTS) ?? [desc(quoteRequest.createdAt)]), desc(quoteRequest.id))
			.limit(query.limit)
			.offset(query.offset),
		db.select({ total: count() }).from(quoteRequest).where(where),
		facetCounts({
			status: () =>
				facet(quoteRequest.status, 'status', (v) => QUOTE_LABELS[v as QuoteStatus] ?? v),
			service: () => facet(quoteRequest.service, 'service', serviceLabel),
			mode: () => facet(quoteRequest.mode, 'mode', (v) => MODE_LABELS[v as TransportMode] ?? v)
		})
	]);

	return {
		rows,
		server: { pagination: pagination(query, total), facets, filters: currentQuery(query) }
	};
};
