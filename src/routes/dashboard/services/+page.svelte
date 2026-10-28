<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import RowButton from '@nahu/admin-kit/components/RowButton.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { imageColumn, shownColumn } from '$lib/dashboard/columns';
	import { serviceSettingSchema } from './schema';
	import type { PageData } from './$types';

	let { data } = $props();

	type Service = PageData['services'][number];

	let editing = $state<Service | undefined>();
	let open = $state(false);

	const columns: ColumnDef<Service>[] = [
		imageColumn('photo', 'Photo'),
		{
			accessorKey: 'title',
			header: 'Service',
			cell: ({ row }) =>
				renderComponent(RowButton, {
					label: row.original.title,
					onclick: () => {
						editing = row.original;
						open = true;
					}
				})
		},
		{ accessorKey: 'sortOrder', header: 'Position' },
		shownColumn()
	];

	const seed = $derived(
		editing && { slug: editing.slug, active: editing.active, sortOrder: editing.sortOrder }
	);
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Services"
		tabTitle="Services | EthioLink"
		description="Which of the eight services the website shows, in what order, and with what photo. Their wording is the approved copy; ask PulseData to change it so all four languages stay in step."
	>
		{#snippet actions()}
			<Button href={resolve('/services')} target="_blank" variant="outline" size="sm">
				<ExternalLink /> See the Services page
			</Button>
		{/snippet}
	</PageHeader>

	{#key data.services}
		<DataTable {columns} data={data.services} paginate={false} fileName="Services" />
	{/key}

	<FormDialog
		title={editing?.title ?? 'Service'}
		submitLabel="Save"
		action="?/save"
		data={data.form}
		schema={serviceSettingSchema}
		bind:open
		{seed}
		multipart
		hideTrigger
	>
		{#snippet fields({ form, errors })}
			<InputComp {form} {errors} name="slug" type="hidden" />
			<InputComp
				{form}
				{errors}
				name="photo"
				type="file"
				accept="image/*"
				label="Photo"
				image={editing?.photo ?? ''}
				description="Shown with the service on the Services page. A wide photo (3:2) works best."
			/>
			<InputComp
				{form}
				{errors}
				name="sortOrder"
				type="number"
				min="0"
				label="Position"
				description="Lower numbers come first, on every page that lists the services."
			/>
			<InputComp
				{form}
				{errors}
				name="active"
				type="checkboxSingle"
				placeholder="Show on the website"
				description="A hidden service also leaves the contact and quote forms' lists."
			/>
		{/snippet}
	</FormDialog>
</div>
