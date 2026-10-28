import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
import { resolve } from '$app/paths';
import { APPLICATION_LABELS, type ApplicationStatus } from '$lib/careers';
import RecordLink from '$lib/dashboard/RecordLink.svelte';

export type ApplicationRow = {
	id: number;
	name: string;
	email: string;
	phone: string;
	job: string | null;
	status: ApplicationStatus;
	createdAt: Date;
};

export const applicationColumns: ColumnDef<ApplicationRow>[] = [
	{
		accessorKey: 'name',
		header: 'Applicant',
		cell: ({ row }) =>
			renderComponent(RecordLink, {
				href: resolve('/dashboard/careers/applications/[id]', { id: String(row.original.id) }),
				label: row.original.name,
				unread: row.original.status === 'new'
			})
	},
	{ accessorKey: 'job', header: 'For', cell: ({ row }) => row.original.job ?? '—' },
	{
		accessorKey: 'email',
		header: 'Contact',
		cell: ({ row }) => `${row.original.email}, ${row.original.phone}`
	},
	{
		accessorKey: 'createdAt',
		header: 'Applied',
		cell: ({ row }) => ethiopianDateTime(row.original.createdAt)
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) =>
			renderComponent(Statuses, {
				status: row.original.status,
				label: APPLICATION_LABELS[row.original.status]
			})
	}
];
