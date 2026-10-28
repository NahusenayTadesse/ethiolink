<script lang="ts">
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import { columns } from './columns';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4">
	<PageHeader
		title="Quote requests"
		tabTitle="Quotes | EthioLink"
		description="Requests for a price from the website's quote form. Open one to see the cargo and documents, reply with a price, and move it along: New → Reviewing → Quoted → Won or Lost."
	/>

	{#key data.rows}
		<DataTable
			{columns}
			data={data.rows}
			server={data.server}
			facetKeys={['status', 'service', 'mode']}
			facetLabels={{ status: 'Status', service: 'Service', mode: 'Mode' }}
			dateFilter="Received"
			fileName="Quote requests"
		/>
	{/key}
</div>
