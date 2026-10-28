<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import BigText from '@nahu/admin-kit/components/Table/bigText.svelte';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import { actionsColumn, shownColumn, translationColumn } from '$lib/dashboard/columns';
	import { testimonialEditSchema, testimonialSchema } from './schema';
	import TestimonialFields from './TestimonialFields.svelte';
	import type { PageData } from './$types';

	let { data } = $props();

	type Testimonial = PageData['rows'][number];

	let editing = $state<Testimonial | undefined>();
	let editOpen = $state(false);

	const columns: ColumnDef<Testimonial>[] = [
		{ accessorKey: 'author', header: 'Who' },
		{
			accessorKey: 'quoteEn',
			header: 'Quote',
			enableSorting: false,
			cell: ({ row }) => renderComponent(BigText, { text: row.original.quoteEn, max: 70 })
		},
		{ accessorKey: 'sortOrder', header: 'Position' },
		translationColumn(['quote', 'position']),
		shownColumn(),
		actionsColumn((t) => `${t.author}’s testimonial`, 'It leaves the home page straight away.', {
			onedit: (t) => {
				editing = t;
				editOpen = true;
			}
		})
	];
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Testimonials"
		tabTitle="Testimonials | EthioLink"
		description="What clients say, shown on the home page once there is at least one. Use real words from real clients, with their permission."
	>
		{#snippet actions()}
			<FormDialog
				title="Add a testimonial"
				triggerLabel="Add testimonial"
				submitLabel="Add"
				action="?/add"
				data={data.addForm}
				schema={testimonialSchema}
				resetOnSuccess
			>
				{#snippet fields({ form, errors, values })}
					<TestimonialFields {form} {errors} {values} idPrefix="add-" />
				{/snippet}
			</FormDialog>
		{/snippet}
	</PageHeader>

	{#if data.rows.length}
		{#key data.rows}
			<DataTable {columns} data={data.rows} paginate={false} fileName="Testimonials" />
		{/key}
	{:else}
		<Empty message="No testimonials yet. Add one and a quotes section appears on the home page." />
	{/if}

	<FormDialog
		title="Edit {editing?.author ?? 'testimonial'}"
		submitLabel="Save"
		action="?/edit"
		data={data.editForm}
		schema={testimonialEditSchema}
		bind:open={editOpen}
		seed={editing}
		hideTrigger
	>
		{#snippet fields({ form, errors, values })}
			<TestimonialFields {form} {errors} {values} idPrefix="edit-" />
		{/snippet}
	</FormDialog>
</div>
