<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { globeCitySchema } from './schema';
	import CityFields from './CityFields.svelte';
	import CityActions from './CityActions.svelte';
	import type { PageData } from './$types';

	let { data, form } = $props();

	type City = PageData['cities'][number];

	let editing = $state<City | undefined>();
	let editOpen = $state(false);

	function edit(city: City) {
		editing = city;
		editOpen = true;
	}

	const columns: ColumnDef<City>[] = [
		{ accessorKey: 'nameEn', header: 'English' },
		{ accessorKey: 'nameAm', header: 'Amharic' },
		{ accessorKey: 'nameZh', header: 'Chinese' },
		{ accessorKey: 'nameAr', header: 'Arabic' },
		{
			id: 'position',
			header: 'Latitude, longitude',
			enableSorting: false,
			cell: ({ row }) => `${row.original.latitude}, ${row.original.longitude}`
		},
		{
			accessorKey: 'active',
			header: 'On the globe',
			cell: ({ row }) =>
				renderComponent(Statuses, {
					status: row.original.active ? 'active' : 'inactive',
					label: row.original.active ? 'Shown' : 'Hidden'
				})
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: ({ row }) =>
				renderComponent(CityActions, {
					id: row.original.id,
					name: row.original.nameEn,
					onedit: () => edit(row.original)
				})
		}
	];
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Globe cities"
		tabTitle="Globe cities | EthioLink"
		description="The cities the home page globe draws trade lanes to from Addis Ababa. Each is named in all four site languages, which visitors see when they hover it. Changes show on the next page load."
	>
		{#snippet actions()}
			<Button href={resolve('/')} target="_blank" variant="outline" size="sm">
				<ExternalLink /> See the globe
			</Button>
			<FormDialog
				title="Add a city"
				triggerLabel="Add city"
				submitLabel="Add city"
				description="Look the city up on a map for its latitude and longitude."
				action="?/save"
				data={data.addForm}
				schema={globeCitySchema}
				resetOnSuccess
			>
				{#snippet fields({ form, errors })}
					<CityFields {form} {errors} />
				{/snippet}
			</FormDialog>
		{/snippet}
	</PageHeader>

	{#if form?.error}<p class="text-sm text-destructive" role="alert">{form.error}</p>{/if}

	{#if data.cities.length}
		{#key data.cities}
			<DataTable {columns} data={data.cities} paginate={false} fileName="Globe cities" />
		{/key}
	{:else}
		<Empty message="No cities yet. Add one and its lane appears on the home page globe." />
	{/if}

	<FormDialog
		title="Edit {editing?.nameEn ?? 'city'}"
		submitLabel="Save"
		action="?/save"
		data={data.editForm}
		schema={globeCitySchema}
		bind:open={editOpen}
		seed={editing}
		hideTrigger
	>
		{#snippet fields({ form, errors })}
			<CityFields {form} {errors} />
		{/snippet}
	</FormDialog>
</div>
