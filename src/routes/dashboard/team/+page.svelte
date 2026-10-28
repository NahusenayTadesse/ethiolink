<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import FormDialog from '@nahu/admin-kit/formComponents/FormDialog.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import {
		actionsColumn,
		imageColumn,
		shownColumn,
		translationColumn
	} from '$lib/dashboard/columns';
	import { teamEditSchema, teamSchema } from './schema';
	import TeamFields from './TeamFields.svelte';
	import type { PageData } from './$types';

	let { data } = $props();

	type Member = PageData['rows'][number];

	let editing = $state<Member | undefined>();
	let editOpen = $state(false);

	const columns: ColumnDef<Member>[] = [
		imageColumn('photo', ''),
		{ accessorKey: 'nameEn', header: 'Name' },
		{ accessorKey: 'roleEn', header: 'Role' },
		{ accessorKey: 'sortOrder', header: 'Position' },
		translationColumn(['name', 'role', 'summary', 'bio']),
		shownColumn(),
		actionsColumn(
			(m) => m.nameEn,
			'Their card and profile leave the website straight away. To keep them for later, untick “Show on the website” instead.',
			{
				onedit: (m) => {
					editing = m;
					editOpen = true;
				}
			}
		)
	];

	/** The row as form values: the stored photo is shown beside the field, not posted back. */
	const seed = $derived(editing && { ...editing, photo: undefined });
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Leadership team"
		tabTitle="Team | EthioLink"
		description="The people on the home page and the About page, in order. Each is written in the four site languages; an empty translation shows the English."
	>
		{#snippet actions()}
			<Button href={resolve('/about')} target="_blank" variant="outline" size="sm">
				<ExternalLink /> See the About page
			</Button>
			<FormDialog
				title="Add a team member"
				triggerLabel="Add person"
				submitLabel="Add"
				action="?/add"
				data={data.addForm}
				schema={teamSchema}
				multipart
				resetOnSuccess
			>
				{#snippet fields({ form, errors, values })}
					<TeamFields {form} {errors} {values} idPrefix="add-" />
				{/snippet}
			</FormDialog>
		{/snippet}
	</PageHeader>

	{#if data.rows.length}
		{#key data.rows}
			<DataTable {columns} data={data.rows} paginate={false} fileName="Team" />
		{/key}
	{:else}
		<Empty message="No one yet. Add the managers and they appear on the home and About pages." />
	{/if}

	<FormDialog
		title="Edit {editing?.nameEn ?? 'team member'}"
		submitLabel="Save"
		action="?/edit"
		data={data.editForm}
		schema={teamEditSchema}
		bind:open={editOpen}
		{seed}
		multipart
		hideTrigger
	>
		{#snippet fields({ form, errors, values })}
			<TeamFields {form} {errors} {values} photo={editing?.photo ?? ''} idPrefix="edit-" />
		{/snippet}
	</FormDialog>
</div>
