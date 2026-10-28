<script lang="ts">
	import Route from '@lucide/svelte/icons/route';
	import Globe from '@lucide/svelte/icons/globe';
	import Scale from '@lucide/svelte/icons/scale';
	import Radar from '@lucide/svelte/icons/radar';
	import { m } from '$lib/paraglide/messages.js';
	import controlRoom from '$lib/assets/images/control-room.jpg?enhanced';
	import { reveal } from '../motion';
	import SectionIntro from './SectionIntro.svelte';

	const reasons = $derived([
		{ icon: Route, title: m.why_endtoend_title(), text: m.why_endtoend_text() },
		{ icon: Globe, title: m.why_network_title(), text: m.why_network_text() },
		{ icon: Scale, title: m.why_regulatory_title(), text: m.why_regulatory_text() },
		{ icon: Radar, title: m.why_tracking_title(), text: m.why_tracking_text() }
	]);
</script>

<section class="relative overflow-hidden bg-ink-2 py-28 text-white md:py-36">
	<div class="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
		<div>
			<SectionIntro eyebrow={m.why_eyebrow()} title={m.why_title()} tone="dark" />

			<div class="mt-14 grid gap-5 sm:grid-cols-2">
				{#each reasons as reason, i (reason.title)}
					{@const Icon = reason.icon}
					<article
						class="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-500 hover:border-ember/50 hover:bg-white/[0.06]"
						data-reveal="up"
						{@attach reveal(i * 90)}
					>
						<Icon
							class="size-8 text-ember transition-transform duration-500 group-hover:scale-110"
							strokeWidth={1.4}
						/>
						<h3 class="mt-6 font-display text-xl font-semibold tracking-wide uppercase">
							{reason.title}
						</h3>
						<p class="mt-2 text-[15px] leading-relaxed text-mist">{reason.text}</p>
					</article>
				{/each}
			</div>
		</div>

		<div class="relative">
			<div
				class="relative overflow-hidden rounded-[2rem]"
				data-reveal="clip"
				{@attach reveal(150)}
			>
				<enhanced:img
					src={controlRoom}
					alt=""
					sizes="(min-width: 1024px) 50vw, 100vw"
					class="aspect-[4/5] w-full object-cover object-[70%_center] lg:aspect-[4/5]"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"></div>
			</div>
			<div
				class="absolute -bottom-6 start-6 end-6 rounded-2xl border border-white/10 bg-ink/80 p-6 backdrop-blur-xl sm:start-auto sm:-end-6 sm:w-72"
				data-reveal="up"
				{@attach reveal(500)}
			>
				<div class="flex items-center gap-3">
					<span class="relative flex size-3">
						<span class="absolute inline-flex size-full animate-ping-slow rounded-full bg-ember"></span>
						<span class="relative inline-flex size-3 rounded-full bg-ember"></span>
					</span>
					<p class="font-display text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">
						{m.why_tracking_title()}
					</p>
				</div>
				<div class="mt-5 flex items-center gap-2" dir="ltr">
					{#each [0, 1, 2, 3, 4] as step (step)}
						<span
							class={[
								'h-1.5 flex-1 rounded-full',
								step < 3 ? 'bg-ember' : step === 3 ? 'bg-ember/40' : 'bg-white/10'
							]}
						></span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
