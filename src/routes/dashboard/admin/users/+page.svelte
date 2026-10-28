<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import RecordLink from '$lib/dashboard/RecordLink.svelte';
	import Credentials from './Credentials.svelte';
	import { userSchema } from './schema';
	import type { PageData } from './$types';

	let { data } = $props();

	type Row = PageData['rows'][number];

	const columns: ColumnDef<Row>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) =>
				renderComponent(RecordLink, {
					href: resolve('/dashboard/admin/users/[id]', { id: row.original.id }),
					label: row.original.name
				})
		},
		{ accessorKey: 'email', header: 'Email' },
		{ id: 'role', accessorFn: (r) => r.role ?? 'No role', header: 'Role' },
		{
			id: 'status',
			header: 'Status',
			accessorFn: (r) => (r.isActive ? (r.mustChangePassword ? 'New password' : 'Active') : 'Off'),
			cell: ({ row }) => {
				const u = row.original;
				return renderComponent(Statuses, {
					status: !u.isActive ? 'inactive' : u.mustChangePassword ? 'pending' : 'active',
					label: !u.isActive
						? 'Switched off'
						: u.mustChangePassword
							? 'Must set password'
							: 'Active'
				});
			}
		},
		{
			id: 'lastSignIn',
			header: 'Last signed in',
			accessorFn: (r) => r.lastSignIn?.getTime() ?? 0,
			cell: ({ row }) =>
				row.original.lastSignIn ? ethiopianDateTime(row.original.lastSignIn) : 'Never'
		}
	];
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Users"
		tabTitle="Users | EthioLink"
		description="Everyone who can sign in to the dashboard. What each person may open comes from their role."
	>
		{#snippet actions()}
			<FormDialog
				title="Add a user"
				description="They get a temporary password, shown once after you add them. They choose their own at their first sign-in."
				triggerLabel="Add user"
				submitLabel="Add"
				action="?/add"
				data={data.addForm}
				schema={userSchema}
				resetOnSuccess
			>
				{#snippet fields({ form, errors })}
					<InputComp {form} {errors} name="name" label="Name" id="add-name" required />
					<InputComp
						{form}
						{errors}
						name="email"
						label="Email"
						id="add-email"
						description="What they sign in with."
						required
					/>
					<InputComp
						{form}
						{errors}
						name="roleId"
						type="select"
						label="Role"
						id="add-role"
						items={data.roles}
						required
					/>
				{/snippet}
			</FormDialog>
		{/snippet}
	</PageHeader>

	<Credentials credentials={page.form?.credentials} loginUrl="{page.url.origin}/login" />

	<DataTable {columns} data={data.rows} fileName="Users" />
</div>
