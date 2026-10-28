<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { m } from '$lib/paraglide/messages.js';
	import portSunset from '$lib/assets/images/port-sunset.jpg?enhanced';
	import { publicFileUrl } from '@nahu/admin-kit/files';
	import { shownServices } from '$lib/site/services';
	import { l } from '$lib/site/links';
	import { reveal, spotlight } from '$lib/site/motion';
	import PageHero from '$lib/site/components/PageHero.svelte';
	import WhyUs from '$lib/site/components/WhyUs.svelte';
	import CtaBand from '$lib/site/components/CtaBand.svelte';

	let { data } = $props();

	const services = $derived(shownServices(data.services));
</script>

<svelte:head>
	<title>{m.meta_services_title()}</title>
	<meta name="description" content={m.meta_services_desc()} />
	<meta property="og:title" content={m.meta_services_title()} />
	<meta property="og:description" content={m.meta_services_desc()} />
</svelte:head>

<PageHero
	eyebrow={m.services_eyebrow()}
	title={m.services_page_title()}
	text={m.services_page_intro()}
	image={portSunset}
	current={m.nav_services()}
/>

<section class="bg-paper py-24 md:py-32">
	<div class="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
		<!-- An index that stays in view while the services scroll past. -->
		<nav class="hidden lg:col-span-3 lg:block" aria-label={m.services_title()}>
			<ol class="sticky top-32 space-y-1" data-reveal="left" {@attach reveal()}>
				{#each services as service, i (service.slug)}
					<li>
						<a
							href={resolve(l(`/services#${service.slug}`))}
							class="group flex items-baseline gap-3 rounded-xl px-3 py-2 text-[15px] text-stone transition hover:bg-sand hover:text-ink"
						>
							<span class="font-display text-xs font-semibold text-ember-deep"
								>{String(i + 1).padStart(2, '0')}</span
							>
							{service.title()}
						</a>
					</li>
				{/each}
			</ol>
		</nav>

		<div class="space-y-6 lg:col-span-9">
			{#each services as service, i (service.slug)}
				{@const Icon = service.icon}
				<article
					id={service.slug}
					class="group relative scroll-mt-28 overflow-hidden rounded-[2rem] border border-ink/10 bg-white p-8 transition-[border-color,box-shadow] duration-500 hover:border-ember/40 hover:shadow-[0_40px_80px_-50px_rgba(6,12,24,0.5)] sm:p-12"
					data-reveal="up"
					{@attach reveal()}
					{@attach spotlight}
				>
					<span
						class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
						style="background: radial-gradient(520px circle at var(--mx, 50%) var(--my, 0%), rgb(255 122 69 / 0.1), transparent 60%)"
					></span>
					<span
						aria-hidden="true"
						class="pointer-events-none absolute -end-4 -top-10 font-display text-[11rem] leading-none font-bold text-ink/[0.04] select-none"
						>{String(i + 1).padStart(2, '0')}</span
					>

					<div class="relative grid gap-8 md:grid-cols-[auto_1fr] md:gap-12">
						<span
							class="grid size-20 place-items-center rounded-3xl bg-ink text-ember transition-colors duration-500 group-hover:bg-ember group-hover:text-ink"
						>
							<Icon class="size-9" strokeWidth={1.4} />
						</span>
						<div>
							<h2 class="font-display text-3xl leading-tight font-semibold text-ink uppercase sm:text-4xl">
								{service.title()}
							</h2>
							<p class="mt-4 text-xl leading-relaxed text-ink/80">{service.short()}</p>
							<p class="mt-4 text-[16px] leading-[1.8] text-stone">{service.body()}</p>
							{#if service.photo}
								<img
									src={publicFileUrl(service.photo)}
									alt=""
									loading="lazy"
									class="mt-8 aspect-[3/2] w-full rounded-2xl object-cover"
								/>
							{/if}
							<div class="mt-8 flex flex-wrap gap-3">
								<a
									href={resolve(l(`/quote?service=${service.slug}`))}
									class="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ember hover:text-ink"
								>
									{m.services_quote()}
									<ArrowUpRight class="size-4 rtl:-scale-x-100" />
								</a>
								<a
									href={resolve(l(`/contact?service=${service.slug}`))}
									class="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink"
								>
									{m.services_ask()}
								</a>
							</div>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<WhyUs />

<CtaBand />
