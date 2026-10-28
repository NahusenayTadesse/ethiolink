<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	/** Edit and Remove at the end of a content table's row. Remove asks first. */
	let {
		id,
		name,
		onedit,
		description,
		href
	}: {
		id: number;
		name: string;
		/** Opens the row's edit dialog. Give `href` instead for a row edited on its own page. */
		onedit?: () => void;
		href?: string;
		/** What removing it does, under the question. */
		description: string;
	} = $props();
</script>

<div class="flex justify-end gap-1">
	{#if href}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the caller -->
		<Button variant="ghost" size="sm" {href}><Pencil />Edit</Button>
	{:else}
		<Button variant="ghost" size="sm" onclick={onedit}><Pencil />Edit</Button>
	{/if}
	<ConfirmAction
		action="?/delete"
		label="Remove"
		title="Remove {name}?"
		{description}
		icon={Trash2}
		variant="ghost"
		fields={{ id }}
	/>
</div>
