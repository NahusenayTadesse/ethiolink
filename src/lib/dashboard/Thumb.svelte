<script lang="ts">
	import ImageOff from '@lucide/svelte/icons/image-off';
	import { fileUrl } from '@nahu/admin-kit/files';

	/** A stored image as a small thumbnail in a table, or a muted mark when there is none. */
	let { name }: { name: string | null } = $props();
</script>

{#if name}
	<img src={fileUrl(name)} alt="" class="size-10 rounded-md border object-cover" loading="lazy" />
{:else}
	<span class="grid size-10 place-items-center rounded-md border border-dashed text-muted-foreground">
		<ImageOff class="size-4" />
	</span>
{/if}
