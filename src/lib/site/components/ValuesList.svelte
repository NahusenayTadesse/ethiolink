<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import mark from '$lib/assets/brand/mark.png';
	import { reveal } from '../motion';
	import SectionIntro from './SectionIntro.svelte';

	const values = $derived([
		{ title: m.value_integrity_title(), text: m.value_integrity_text() },
		{ title: m.value_excellence_title(), text: m.value_excellence_text() },
		{ title: m.value_customer_title(), text: m.value_customer_text() },
		{ title: m.value_innovation_title(), text: m.value_innovation_text() },
		{ title: m.value_transparency_title(), text: m.value_transparency_text() }
	]);
</script>

<section class="relative overflow-hidden bg-paper py-28 md:py-36">
	<div class="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12">
		<div class="lg:col-span-5">
			<div class="lg:sticky lg:top-32">
				<SectionIntro eyebrow={m.values_eyebrow()} title={m.values_title()} />
				<img
					src={mark}
					alt=""
					width="480"
					height="431"
					class="mt-14 hidden w-64 animate-float opacity-90 lg:block"
					data-reveal="zoom"
					{@attach reveal(200)}
				/>
			</div>
		</div>

		<ol class="lg:col-span-7">
			{#each values as value, i (value.title)}
				<li
					class="group grid grid-cols-[4.5rem_1fr] gap-6 border-t border-ink/10 py-10 last:border-b sm:grid-cols-[7rem_1fr]"
					data-reveal="up"
					{@attach reveal(i * 70)}
				>
					<span
						class="font-display text-6xl leading-none font-bold text-transparent transition-colors duration-500 [-webkit-text-stroke:1.5px_var(--color-ember)] group-hover:text-ember sm:text-7xl"
					>
						{String(i + 1).padStart(2, '0')}
					</span>
					<div>
						<h3 class="font-display text-2xl font-semibold text-ink uppercase sm:text-3xl">
							{value.title}
						</h3>
						<p class="mt-3 max-w-lg text-[16px] leading-relaxed text-stone">{value.text}</p>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>
