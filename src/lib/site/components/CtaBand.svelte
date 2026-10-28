<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { m } from '$lib/paraglide/messages.js';
	import { l } from '../links';
	import { reveal } from '../motion';
</script>

<section class="relative overflow-hidden bg-ember text-ink">
	<svg
		class="pointer-events-none absolute inset-0 h-full w-full opacity-30"
		viewBox="0 0 1200 500"
		preserveAspectRatio="none"
		fill="none"
		aria-hidden="true"
	>
		<path d="M-50 420 C 250 120, 520 520, 820 200 S 1150 60, 1260 140" stroke="#060c18" stroke-width="1.2" stroke-dasharray="4 10" />
		<path d="M-50 300 C 300 40, 600 420, 900 120 S 1180 260, 1260 40" stroke="#060c18" stroke-width="1" stroke-opacity="0.5" />
	</svg>

	<div class="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32" {@attach reveal()}>
		<p class="eyebrow text-ink/70" data-reveal="up" {@attach reveal()}>{m.cta_eyebrow()}</p>
		<h2
			class="mt-6 font-display text-5xl leading-[0.92] font-bold tracking-tight uppercase sm:text-7xl lg:text-8xl"
		>
			<span class="rise" style:--reveal-delay="100ms"><span>{m.cta_title_a()}</span></span><br />
			<span class="rise" style:--reveal-delay="220ms"
				><span class="accent font-normal text-white normal-case">{m.cta_title_b()}</span></span
			>
		</h2>
		<div
			class="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
			data-reveal="up"
			{@attach reveal(300)}
		>
			<p class="max-w-xl text-lg leading-relaxed text-ink/80">{m.cta_text()}</p>
			<a
				href={resolve(l('/contact'))}
				class="group inline-flex shrink-0 items-center gap-4 rounded-full bg-ink py-3 ps-7 pe-3 text-base font-semibold text-white transition hover:bg-ink-3"
			>
				{m.cta_button()}
				<span
					class="grid size-11 place-items-center rounded-full bg-ember text-ink transition-transform duration-500 group-hover:rotate-45 rtl:group-hover:-rotate-45"
				>
					<ArrowUpRight class="size-5 rtl:-scale-x-100" />
				</span>
			</a>
		</div>
	</div>
</section>
