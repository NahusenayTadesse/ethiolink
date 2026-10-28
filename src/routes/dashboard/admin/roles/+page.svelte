<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import { resolve } from '$app/paths';
	import RecordLink from '$lib/dashboard/RecordLink.svelte';
	import { roleSchema } from './schema';
	import type { PageData } from './$types';

	let { data } = $props();

	type Row = PageData['rows'][number];

	const columns: ColumnDef<Row>[] = [
		{
			accessorKey: 'name',
			header: 'Role',
			cell: ({ row }) =>
				renderComponent(RecordLink, {
					href: resolve('/dashboard/admin/roles/[id]', { id: String(row.original.id) }),
					label: row.original.name
				})
		},
		{ id: 'description', accessorFn: (r) => r.description ?? '', header: 'What it is for' },
		{
			id: 'permissions',
			header: 'May do',
			accessorFn: (r) => r.permissionCount,
			cell: ({ row }) => {
				const r = row.original;
				return r.locked || r.permissionCount >= r.permissionTotal
					? 'Everything'
					: `${r.permissionCount} of ${r.permissionTotal}`;
			}
		},
		{
			accessorKey: 'holders',
			header: 'People',
			cell: ({ row }) => String(row.original.holders)
		}
	];
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Roles"
		tabTitle="Roles | EthioLink"
		description="A role is a set of permissions. Give each person the role that matches their job; change a role and everyone who holds it changes with it."
	>
		{#snippet actions()}
			<FormDialog
				title="Add a role"
				description="Name it after a job. You choose what it may do on the next page."
				triggerLabel="Add role"
				submitLabel="Add and choose permissions"
				action="?/add"
				data={data.addForm}
				schema={roleSchema}
			>
				{#snippet fields({ form, errors })}
					<InputComp
						{form}
						{errors}
						name="name"
						label="Name"
						id="add-role-name"
						placeholder="e.g. Customs desk"
						required
					/>
					<InputComp
						{form}
						{errors}
						name="description"
						label="What it is for"
						type="textarea"
						rows={2}
						id="add-role-description"
					/>
				{/snippet}
			</FormDialog>
		{/snippet}
	</PageHeader>

	<DataTable {columns} data={data.rows} fileName="Roles" />
</div>
