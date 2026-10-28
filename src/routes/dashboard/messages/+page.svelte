<script lang="ts">
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import { columns } from './columns';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Messages"
		tabTitle="Messages | EthioLink"
		description="Everything sent from the website's contact form. Open one to read it, answer by email or phone, then mark it replied."
	/>

	{#key data.rows}
		<DataTable
			{columns}
			data={data.rows}
			server={data.server}
			facetKeys={['status', 'service']}
			facetLabels={{ status: 'Status', service: 'Service' }}
			dateFilter="Received"
			fileName="Messages"
		/>
	{/key}
</div>
