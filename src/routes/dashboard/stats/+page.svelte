<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { actionsColumn, shownColumn, translationColumn } from '$lib/dashboard/columns';
	import { statEditSchema, statSchema } from './schema';
	import StatFields from './StatFields.svelte';
	import type { PageData } from './$types';

	let { data } = $props();

	type Stat = PageData['rows'][number];

	let editing = $state<Stat | undefined>();
	let editOpen = $state(false);

	const columns: ColumnDef<Stat>[] = [
		{ accessorKey: 'value', header: 'Figure' },
		{ accessorKey: 'labelEn', header: 'Description' },
		{ accessorKey: 'sortOrder', header: 'Position' },
		translationColumn(['label']),
		shownColumn(),
		actionsColumn((s) => s.value, 'It leaves the home page straight away.', {
			onedit: (s) => {
				editing = s;
				editOpen = true;
			}
		})
	];
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Home page figures"
		tabTitle="Figures | EthioLink"
		description="The numbers under “Who we are” on the home page. Four fit one row on a wide screen."
	>
		{#snippet actions()}
			<Button href={resolve('/')} target="_blank" variant="outline" size="sm">
				<ExternalLink /> See the home page
			</Button>
			<FormDialog
				title="Add a figure"
				triggerLabel="Add figure"
				submitLabel="Add"
				action="?/add"
				data={data.addForm}
				schema={statSchema}
				resetOnSuccess
			>
				{#snippet fields({ form, errors, values })}
					<StatFields {form} {errors} {values} idPrefix="add-" />
				{/snippet}
			</FormDialog>
		{/snippet}
	</PageHeader>

	{#if data.rows.length}
		{#key data.rows}
			<DataTable {columns} data={data.rows} paginate={false} fileName="Figures" />
		{/key}
	{:else}
		<Empty message="No figures yet. Add one and it appears on the home page." />
	{/if}

	<FormDialog
		title="Edit {editing?.value ?? 'figure'}"
		submitLabel="Save"
		action="?/edit"
		data={data.editForm}
		schema={statEditSchema}
		bind:open={editOpen}
		seed={editing}
		hideTrigger
	>
		{#snippet fields({ form, errors, values })}
			<StatFields {form} {errors} {values} idPrefix="edit-" />
		{/snippet}
	</FormDialog>
</div>
