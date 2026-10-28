import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
import { resolve } from '$app/paths';
import {
	MODE_LABELS,
	QUOTE_LABELS,
	quoteNumber,
	type QuoteStatus,
	type TransportMode
} from '$lib/quoteStatus';
import { serviceLabel } from '$lib/site/services';
import RecordLink from '$lib/dashboard/RecordLink.svelte';

export type QuoteRow = {
	id: number;
	createdAt: Date;
	name: string;
	company: string | null;
	service: string;
	mode: TransportMode;
	origin: string;
	destination: string;
	status: QuoteStatus;
	amount: string | null;
	currency: string;
};

export const columns: ColumnDef<QuoteRow>[] = [
	{
		accessorKey: 'id',
		header: 'Quote',
		cell: ({ row }) =>
			renderComponent(RecordLink, {
				href: resolve('/dashboard/quotes/[id]', { id: String(row.original.id) }),
				label: quoteNumber(row.original.id),
				unread: row.original.status === 'new'
			})
	},
	{
		accessorKey: 'createdAt',
		header: 'Received',
		cell: ({ row }) => ethiopianDateTime(row.original.createdAt)
	},
	{
		accessorKey: 'name',
		header: 'From',
		cell: ({ row }) =>
			row.original.company ? `${row.original.name} · ${row.original.company}` : row.original.name
	},
	{
		id: 'route',
		header: 'Route',
		enableSorting: false,
		cell: ({ row }) =>
			`${row.original.origin} → ${row.original.destination} · ${MODE_LABELS[row.original.mode]}`
	},
	{
		accessorKey: 'service',
		header: 'Service',
		cell: ({ row }) => serviceLabel(row.original.service)
	},
	{
		accessorKey: 'amount',
		header: 'Quoted',
		cell: ({ row }) =>
			row.original.amount
				? `${row.original.currency} ${Number(row.original.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
				: '—'
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) =>
			renderComponent(Statuses, {
				status: row.original.status,
				label: QUOTE_LABELS[row.original.status]
			})
	}
];
