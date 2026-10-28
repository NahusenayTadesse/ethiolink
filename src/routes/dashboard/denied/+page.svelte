<script lang="ts">
	import ShieldX from '@lucide/svelte/icons/shield-x';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head><title>Not available | EthioLink</title></svelte:head>

<div class="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
	<ShieldX class="size-12 text-muted-foreground" />
	<h1 class="text-2xl font-semibold">Your role doesn't include this page</h1>
	<p class="text-muted-foreground">
		{#if data.needs}
			It needs permission to: <strong class="text-foreground">{data.needs.toLowerCase()}</strong>.
		{:else}
			This page isn't open to your role.
		{/if}
		An administrator can add it to your role in Admin › Roles.
	</p>
	<Button href={resolve('/dashboard')}>Back to the dashboard</Button>
</div>
