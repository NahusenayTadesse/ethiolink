import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
import BigText from '@nahu/admin-kit/components/Table/bigText.svelte';
import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
import { MESSAGE_LABELS, type MessageStatus } from '$lib/messageStatus';
import { serviceLabel } from '$lib/site/services';
import { LOCALE_NAMES } from '$lib/site/links';
import MessageLink from './MessageLink.svelte';

export type MessageRow = {
	id: number;
	createdAt: Date;
	name: string;
	company: string | null;
	email: string;
	phone: string;
	service: string;
	message: string;
	locale: string;
	status: MessageStatus;
};

export const columns: ColumnDef<MessageRow>[] = [
	{
		accessorKey: 'createdAt',
		header: 'Received',
		cell: ({ row }) =>
			renderComponent(MessageLink, {
				id: row.original.id,
				label: ethiopianDateTime(row.original.createdAt),
				unread: row.original.status === 'new'
			})
	},
	{
		accessorKey: 'name',
		header: 'From',
		cell: ({ row }) =>
			row.original.company ? `${row.original.name} · ${row.original.company}` : row.original.name
	},
	{
		accessorKey: 'email',
		header: 'Contact',
		cell: ({ row }) => `${row.original.email}, ${row.original.phone}`
	},
	{
		accessorKey: 'service',
		header: 'Service',
		cell: ({ row }) => serviceLabel(row.original.service)
	},
	{
		accessorKey: 'message',
		header: 'Message',
		enableSorting: false,
		cell: ({ row }) => renderComponent(BigText, { text: row.original.message, max: 60 })
	},
	{
		accessorKey: 'locale',
		header: 'Language',
		cell: ({ row }) =>
			LOCALE_NAMES[row.original.locale as keyof typeof LOCALE_NAMES] ?? row.original.locale
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) =>
			renderComponent(Statuses, {
				status: row.original.status,
				label: MESSAGE_LABELS[row.original.status]
			})
	}
];
