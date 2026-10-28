<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '../motion';

	type Props = {
		eyebrow: string;
		title: string;
		/** Rendered after the title, in the italic serif accent. */
		accent?: string;
		text?: string;
		tone?: 'dark' | 'light';
		align?: 'start' | 'center';
		level?: 'h1' | 'h2';
		children?: Snippet;
	};
	let {
		eyebrow,
		title,
		accent,
		text,
		tone = 'light',
		align = 'start',
		level = 'h2',
		children
	}: Props = $props();
</script>

<div
	class={['max-w-3xl', align === 'center' && 'mx-auto text-center']}
	{@attach reveal()}
>
	<p
		class={['eyebrow', tone === 'dark' ? 'text-ember' : 'text-ember-deep']}
		data-reveal="up"
		{@attach reveal()}
	>
		{eyebrow}
	</p>
	<svelte:element
		this={level}
		class={[
			'mt-5 font-display text-4xl leading-[0.98] font-semibold tracking-tight text-balance uppercase sm:text-5xl lg:text-6xl',
			tone === 'dark' ? 'text-white' : 'text-ink'
		]}
	>
		<span class="rise" style:--reveal-delay="120ms"><span>{title}</span></span>
		{#if accent}
			<span class="rise" style:--reveal-delay="240ms"
				><span class="accent text-ember normal-case">{accent}</span></span
			>
		{/if}
	</svelte:element>
	{#if text}
		<p
			class={[
				'mt-6 text-lg leading-relaxed',
				tone === 'dark' ? 'text-mist' : 'text-stone',
				align === 'center' && 'mx-auto max-w-2xl'
			]}
			data-reveal="up"
			{@attach reveal(260)}
		>
			{text}
		</p>
	{/if}
	{@render children?.()}
</div>
