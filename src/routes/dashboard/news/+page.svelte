<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import Plus from '@lucide/svelte/icons/plus';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import { renderComponent } from '@nahu/admin-kit/components/ui/data-table/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { resolve } from '$app/paths';
	import RecordLink from '$lib/dashboard/RecordLink.svelte';
	import { imageColumn, translationColumn } from '$lib/dashboard/columns';
	import type { PageData } from './$types';

	let { data } = $props();

	type Post = PageData['posts'][number];

	const columns: ColumnDef<Post>[] = [
		imageColumn('cover', ''),
		{
			accessorKey: 'titleEn',
			header: 'Title',
			cell: ({ row }) =>
				renderComponent(RecordLink, {
					href: resolve('/dashboard/news/[id]', { id: String(row.original.id) }),
					label: row.original.titleEn
				})
		},
		{
			accessorKey: 'published',
			header: 'Status',
			cell: ({ row }) =>
				renderComponent(Statuses, {
					status: row.original.published ? 'published' : 'pending',
					label: row.original.published ? 'Published' : 'Draft'
				})
		},
		{
			accessorKey: 'publishedAt',
			header: 'Published',
			cell: ({ row }) =>
				row.original.publishedAt ? ethiopianDateTime(row.original.publishedAt) : '—'
		},
		{
			accessorKey: 'updatedAt',
			header: 'Last edited',
			cell: ({ row }) => ethiopianDateTime(row.original.updatedAt)
		},
		translationColumn(['title', 'excerpt'])
	];
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="News & updates"
		tabTitle="News | EthioLink"
		description="Posts on the website's News page: customs rule changes, new routes, company news. Regular posts help EthioLink show up on Google and give the social media team something to link to."
	>
		{#snippet actions()}
			<Button href={resolve('/dashboard/news/[id]', { id: 'new' })} size="sm"
				><Plus /> Write a post</Button
			>
		{/snippet}
	</PageHeader>

	{#if data.posts.length}
		{#key data.posts}
			<DataTable {columns} data={data.posts} fileName="News posts" />
		{/key}
	{:else}
		<Empty message="No posts yet. Write the first one — a recent customs change is a good start." />
	{/if}
</div>
