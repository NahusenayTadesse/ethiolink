import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
import { missingLanguages } from '$lib/translated';
import TranslationCell from './TranslationCell.svelte';
import RowActions from './RowActions.svelte';
import Thumb from './Thumb.svelte';

/** Columns every content table shares, so the pages read alike. */

export function translationColumn<T extends Record<string, unknown>>(fields: string[]): ColumnDef<T> {
	return {
		id: 'translations',
		header: 'Translations',
		enableSorting: false,
		cell: ({ row }) =>
			renderComponent(TranslationCell, { missing: missingLanguages(row.original, fields) })
	};
}

export function shownColumn<T extends { active: boolean }>(): ColumnDef<T> {
	return {
		accessorKey: 'active',
		header: 'On the site',
		cell: ({ row }) =>
			renderComponent(Statuses, {
				status: row.original.active ? 'active' : 'inactive',
				label: row.original.active ? 'Shown' : 'Hidden'
			})
	};
}

export function imageColumn<T>(key: keyof T & string, header: string): ColumnDef<T> {
	return {
		id: key,
		header,
		enableSorting: false,
		cell: ({ row }) => renderComponent(Thumb, { name: row.original[key] as string | null })
	};
}

export function actionsColumn<T extends { id: number }>(
	name: (row: T) => string,
	description: string,
	edit: { onedit: (row: T) => void } | { href: (row: T) => string }
): ColumnDef<T> {
	return {
		id: 'actions',
		header: '',
		enableSorting: false,
		cell: ({ row }) =>
			renderComponent(RowActions, {
				id: row.original.id,
				name: name(row.original),
				description,
				...('onedit' in edit
					? { onedit: () => edit.onedit(row.original) }
					: { href: edit.href(row.original) })
			})
	};
}
