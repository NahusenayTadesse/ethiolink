<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import PageSection from '@nahu/admin-kit/components/PageSection.svelte';
	import StatCard from '@nahu/admin-kit/components/reports/StatCard.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import type { Stat } from '@nahu/admin-kit/components/reports/types';
	import { resolve } from '$app/paths';
	import { columns } from './messages/columns';
	import { columns as quoteColumns } from './quotes/columns';

	let { data } = $props();

	const allStats: (Stat & { show: boolean })[] = $derived([
		{
			key: 'newQuotes',
			label: 'New quote requests',
			value: data.counts.newQuotes,
			format: 'count',
			group: 'quotes',
			show: data.can.quotes,
			tone: data.counts.newQuotes > 0 ? 'warning' : 'neutral',
			hint: `${data.counts.openQuotes} open in all`
		},
		{
			key: 'won',
			label: 'Quotes won',
			value: data.counts.won,
			format: 'count',
			group: 'quotes',
			show: data.can.quotes,
			tone: 'positive',
			hint: 'Last 30 days'
		},
		{
			key: 'unread',
			label: 'New messages',
			value: data.counts.unread,
			format: 'count',
			group: 'messages',
			show: data.can.messages,
			tone: data.counts.unread > 0 ? 'warning' : 'neutral',
			hint: `${data.counts.month} in the last 30 days`
		},
		{
			key: 'applicants',
			label: 'New job applications',
			value: data.counts.applicants,
			format: 'count',
			group: 'careers',
			show: data.can.careers,
			tone: data.counts.applicants > 0 ? 'warning' : 'neutral',
			hint: 'Not opened yet'
		}
	]);
	const stats = $derived(allStats.filter((s) => s.show));
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Dashboard"
		tabTitle="Dashboard | EthioLink"
		description="What has come in from the website: quote requests, messages and job applications."
	/>

	{#if stats.length}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each stats as stat (stat.key)}
				<StatCard {stat} />
			{/each}
		</div>
	{:else}
		<Empty
			message="Welcome. Use the menu on the left: it lists the parts of the dashboard your role covers."
		/>
	{/if}

	{#if data.can.quotes}
		<PageSection title="Latest quote requests">
			{#snippet actions()}
				<Button href={resolve('/dashboard/quotes')} variant="outline" size="sm">
					All quotes <ArrowRight />
				</Button>
			{/snippet}
			{#if data.quotes.length}
				<DataTable columns={quoteColumns} data={data.quotes} variant="compact" />
			{:else}
				<Empty
					message="No quote requests yet. They appear here as soon as someone uses the website's quote form."
				/>
			{/if}
		</PageSection>
	{/if}

	{#if data.can.messages}
		<PageSection title="Latest messages">
			{#snippet actions()}
				<Button href={resolve('/dashboard/messages')} variant="outline" size="sm">
					All messages <ArrowRight />
				</Button>
			{/snippet}
			{#if data.latest.length}
				<DataTable {columns} data={data.latest} variant="compact" />
			{:else}
				<Empty
					message="No messages yet. They appear here as soon as someone uses the website's contact form."
				/>
			{/if}
		</PageSection>
	{/if}
</div>
