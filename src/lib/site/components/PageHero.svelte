<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Picture } from '@sveltejs/enhanced-img';
	import { m } from '$lib/paraglide/messages.js';
	import { l } from '../links';
	import { reveal } from '../motion';

	type Props = { eyebrow: string; title: string; text: string; image: Picture; current: string };
	let { eyebrow, title, text, image, current }: Props = $props();
</script>

<section class="grain relative isolate overflow-hidden bg-ink pt-44 pb-24 text-white md:pt-52 md:pb-32">
	<div class="absolute inset-0 -z-10 overflow-hidden">
		<enhanced:img
			src={image}
			alt=""
			sizes="100vw"
			fetchpriority="high"
			class="h-full w-full animate-kenburns object-cover opacity-45"
		/>
	</div>
	<div
		class="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/30 rtl:bg-gradient-to-l"
	></div>
	<div class="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent"></div>

	<div class="mx-auto max-w-7xl px-5 sm:px-8" {@attach reveal()}>
		<nav aria-label="Breadcrumb" class="enter text-sm text-white/50" style:--enter-delay="0.2s">
			<a href={resolve(l('/'))} class="transition hover:text-white">{m.nav_home()}</a>
			<span class="mx-2 text-ember">/</span>
			<span class="text-white/80">{current}</span>
		</nav>
		<p class="eyebrow enter mt-8 text-ember" style:--enter-delay="0.3s">{eyebrow}</p>
		<h1
			class="mt-6 max-w-4xl font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance uppercase sm:text-6xl lg:text-7xl"
		>
			<span class="rise" style:--reveal-delay="350ms"><span>{title}</span></span>
		</h1>
		<p class="enter mt-8 max-w-2xl text-lg leading-relaxed text-mist" style:--enter-delay="0.7s">
			{text}
		</p>
	</div>
</section>
