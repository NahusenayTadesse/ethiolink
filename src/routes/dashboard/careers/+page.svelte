<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import Plus from '@lucide/svelte/icons/plus';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import PageSection from '@nahu/admin-kit/components/PageSection.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { EMPLOYMENT_LABELS } from '$lib/careers';
	import RecordLink from '$lib/dashboard/RecordLink.svelte';
	import { shownColumn, translationColumn } from '$lib/dashboard/columns';
	import { applicationColumns } from './applicationColumns';
	import type { PageData } from './$types';

	let { data } = $props();

	type Job = PageData['jobs'][number];

	const columns: ColumnDef<Job>[] = [
		{
			accessorKey: 'titleEn',
			header: 'Opening',
			cell: ({ row }) =>
				renderComponent(RecordLink, {
					href: resolve('/dashboard/careers/[id]', { id: String(row.original.id) }),
					label: row.original.titleEn
				})
		},
		{
			accessorKey: 'employmentType',
			header: 'Type',
			cell: ({ row }) =>
				`${EMPLOYMENT_LABELS[row.original.employmentType]} · ${row.original.location}`
		},
		{
			accessorKey: 'closesOn',
			header: 'Closes',
			cell: ({ row }) => row.original.closesOn ?? 'When filled'
		},
		{
			accessorKey: 'applicants',
			header: 'Applicants',
			cell: ({ row }) =>
				row.original.unread
					? `${row.original.applicants} (${row.original.unread} new)`
					: String(row.original.applicants)
		},
		translationColumn(['title']),
		shownColumn()
	];
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Careers"
		tabTitle="Careers | EthioLink"
		description="Job openings on the website's Careers page, and the people who applied. An opening leaves the site on its closing day, or when you hide it."
	>
		{#snippet actions()}
			<Button href={resolve('/careers')} target="_blank" variant="outline" size="sm">
				<ExternalLink /> See the Careers page
			</Button>
			<Button href={resolve('/dashboard/careers/[id]', { id: 'new' })} size="sm"
				><Plus /> Post an opening</Button
			>
		{/snippet}
	</PageHeader>

	<PageSection title="Openings">
		{#if data.jobs.length}
			{#key data.jobs}
				<DataTable {columns} data={data.jobs} variant="compact" fileName="Openings" />
			{/key}
		{:else}
			<Empty
				message="No openings yet. While there are none, the Careers page tells visitors to check back."
			/>
		{/if}
	</PageSection>

	<PageSection title="Applications">
		{#if data.applications.length}
			{#key data.applications}
				<DataTable columns={applicationColumns} data={data.applications} fileName="Applications" />
			{/key}
		{:else}
			<Empty message="No applications yet." />
		{/if}
	</PageSection>
</div>
