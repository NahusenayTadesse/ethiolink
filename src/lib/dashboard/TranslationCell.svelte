<script lang="ts">
	/** A table cell: whether a row is written in all four languages, and which it lacks if not. */
	let { missing }: { missing: string[] } = $props();
</script>

{#if missing.length}
	<span class="text-xs text-muted-foreground" title="Shown in English on these sites until translated">
		<span class="me-1 inline-block size-1.5 rounded-full bg-warning align-middle"></span>Needs {missing.join(
			', '
		)}
	</span>
{:else}
	<span class="text-xs text-muted-foreground">All four</span>
{/if}
