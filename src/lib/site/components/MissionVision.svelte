<script lang="ts">
	import Target from '@lucide/svelte/icons/target';
	import Eye from '@lucide/svelte/icons/eye';
	import { m } from '$lib/paraglide/messages.js';
	import network from '$lib/assets/images/port-network.jpg?enhanced';
	import { parallax, reveal } from '../motion';
</script>

<section class="grain relative isolate overflow-hidden bg-ink py-28 text-white md:py-40">
	<div class="absolute inset-x-0 -top-[15%] -bottom-[15%] -z-10" {@attach parallax(0.08)}>
		<enhanced:img src={network} alt="" sizes="100vw" class="h-full w-full object-cover opacity-30" />
	</div>
	<div class="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/80 to-ink"></div>

	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<p class="eyebrow text-ember" data-reveal="up" {@attach reveal()}>{m.purpose_eyebrow()}</p>

		<div class="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-2">
			{#each [{ icon: Target, title: m.mission_title(), text: m.mission_text() }, { icon: Eye, title: m.vision_title(), text: m.vision_text() }] as item, i (item.title)}
				{@const Icon = item.icon}
				<article
					class="group relative bg-ink-2/80 p-8 backdrop-blur-sm transition-colors duration-700 hover:bg-ink-3/80 sm:p-12 lg:p-16"
					data-reveal="up"
					{@attach reveal(i * 150)}
				>
					<div class="flex items-center gap-4">
						<span class="grid size-12 place-items-center rounded-full border border-ember/40 text-ember">
							<Icon class="size-5" strokeWidth={1.6} />
						</span>
						<h2 class="font-display text-2xl font-semibold tracking-[0.16em] uppercase">
							{item.title}
						</h2>
					</div>
					<p class="mt-10 font-display text-3xl leading-[1.15] font-medium text-white/90 sm:text-4xl">
						<span class="accent text-5xl leading-none text-ember">“</span>{item.text}
					</p>
					<span
						class="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-ember to-transparent transition-transform duration-700 group-hover:scale-x-100 rtl:origin-right"
					></span>
				</article>
			{/each}
		</div>
	</div>
</section>
