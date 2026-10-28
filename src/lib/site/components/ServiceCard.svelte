<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { m } from '$lib/paraglide/messages.js';
	import type { Service } from '../services';
	import { reveal, spotlight } from '../motion';
	import { l } from '../links';

	type Props = { service: Service; index: number };
	let { service, index }: Props = $props();

	const Icon = $derived(service.icon);
</script>

<a
	href={resolve(l(`/services#${service.slug}`))}
	class="group relative flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white p-7 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:border-ember/40 hover:shadow-[0_40px_80px_-40px_rgba(6,12,24,0.45)]"
	data-reveal="up"
	{@attach reveal((index % 4) * 90)}
	{@attach spotlight}
>
	<span
		class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
		style="background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgb(255 122 69 / 0.14), transparent 60%)"
	></span>

	<span class="relative flex items-start justify-between">
		<span
			class="grid size-14 place-items-center rounded-2xl bg-ink text-ember transition-colors duration-500 group-hover:bg-ember group-hover:text-ink"
		>
			<Icon class="size-6" strokeWidth={1.6} />
		</span>
		<span class="font-display text-sm font-semibold tracking-widest text-ink/30">
			{String(index + 1).padStart(2, '0')}
		</span>
	</span>

	<h3
		class="relative mt-10 font-display text-[1.65rem] leading-[1.05] font-semibold text-ink uppercase"
	>
		{service.title()}
	</h3>
	<p class="relative mt-3 text-[15px] leading-relaxed text-stone">{service.short()}</p>

	<span
		class="relative mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-ink"
	>
		{m.services_ask()}
		<ArrowUpRight
			class="size-4 text-ember transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
		/>
	</span>
</a>
