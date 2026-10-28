<script lang="ts">
	type Props = { items: string[]; tone?: 'dark' | 'light' | 'ember' };
	let { items, tone = 'dark' }: Props = $props();
</script>

<!-- Always left-to-right: the loop relies on the track's start being its left edge. -->
<div
	dir="ltr"
	class={[
		'relative flex overflow-hidden py-6 select-none',
		tone === 'dark' && 'bg-ink text-white',
		tone === 'light' && 'bg-sand text-ink',
		tone === 'ember' && 'bg-ember text-ink'
	]}
	aria-hidden="true"
>
	<div class="flex w-max shrink-0 animate-marquee items-center">
		{#each [0, 1] as copy (copy)}
			{#each items as item, i (`${copy}-${i}`)}
				<span class="flex items-center font-display text-2xl font-semibold tracking-wide uppercase md:text-3xl">
					<span class="px-8">{item}</span>
					<svg viewBox="0 0 24 24" class="size-4 text-ember" class:text-ink={tone === 'ember'}>
						<path fill="currentColor" d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
					</svg>
				</span>
			{/each}
		{/each}
	</div>
</div>
