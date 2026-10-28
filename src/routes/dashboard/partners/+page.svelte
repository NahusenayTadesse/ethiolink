<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import { actionsColumn, imageColumn, shownColumn } from '$lib/dashboard/columns';
	import { partnerEditSchema, partnerSchema } from './schema';
	import PartnerFields from './PartnerFields.svelte';
	import type { PageData } from './$types';

	let { data } = $props();

	type Partner = PageData['rows'][number];

	let editing = $state<Partner | undefined>();
	let editOpen = $state(false);

	const columns: ColumnDef<Partner>[] = [
		imageColumn('logo', 'Logo'),
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'url', header: 'Website', cell: ({ row }) => row.original.url ?? '—' },
		{ accessorKey: 'sortOrder', header: 'Position' },
		shownColumn(),
		actionsColumn((p) => p.name, 'Their logo leaves the home page straight away.', {
			onedit: (p) => {
				editing = p;
				editOpen = true;
			}
		})
	];

	const seed = $derived(editing && { ...editing, logo: undefined, url: editing.url ?? '' });
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Partners & clients"
		tabTitle="Partners | EthioLink"
		description="Logos in the “Trusted by” strip on the home page. The strip appears once there is at least one; add only companies that have agreed to be named."
	>
		{#snippet actions()}
			<FormDialog
				title="Add a partner"
				triggerLabel="Add partner"
				submitLabel="Add"
				action="?/add"
				data={data.addForm}
				schema={partnerSchema}
				multipart
				resetOnSuccess
			>
				{#snippet fields({ form, errors })}
					<PartnerFields {form} {errors} idPrefix="add-" />
				{/snippet}
			</FormDialog>
		{/snippet}
	</PageHeader>

	{#if data.rows.length}
		{#key data.rows}
			<DataTable {columns} data={data.rows} paginate={false} fileName="Partners" />
		{/key}
	{:else}
		<Empty
			message="No partners yet. Add a logo and the “Trusted by” strip appears on the home page."
		/>
	{/if}

	<FormDialog
		title="Edit {editing?.name ?? 'partner'}"
		submitLabel="Save"
		action="?/edit"
		data={data.editForm}
		schema={partnerEditSchema}
		bind:open={editOpen}
		{seed}
		multipart
		hideTrigger
	>
		{#snippet fields({ form, errors })}
			<PartnerFields {form} {errors} logo={editing?.logo ?? ''} idPrefix="edit-" />
		{/snippet}
	</FormDialog>
</div>
