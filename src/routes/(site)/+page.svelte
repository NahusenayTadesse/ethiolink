<script lang="ts">
	import { resolve } from '$app/paths';
	import Ship from '@lucide/svelte/icons/ship';
	import Plane from '@lucide/svelte/icons/plane';
	import Truck from '@lucide/svelte/icons/truck';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Quote from '@lucide/svelte/icons/quote';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { m } from '$lib/paraglide/messages.js';
	import hubDawn from '$lib/assets/images/hub-dawn.jpg?enhanced';
	import strategyTable from '$lib/assets/images/strategy-table.jpg?enhanced';
	import portSunset from '$lib/assets/images/port-sunset.jpg?enhanced';
	import mark from '$lib/assets/brand/mark.png';
	import { publicFileUrl } from '@nahu/admin-kit/files';
	import { shownServices } from '$lib/site/services';
	import { l } from '$lib/site/links';
	import { countUp, parallax, reveal } from '$lib/site/motion';
	import HeroGlobe from '$lib/site/components/HeroGlobe.svelte';
	import Marquee from '$lib/site/components/Marquee.svelte';
	import SectionIntro from '$lib/site/components/SectionIntro.svelte';
	import ServiceCard from '$lib/site/components/ServiceCard.svelte';
	import MissionVision from '$lib/site/components/MissionVision.svelte';
	import ValuesList from '$lib/site/components/ValuesList.svelte';
	import WhyUs from '$lib/site/components/WhyUs.svelte';
	import CtaBand from '$lib/site/components/CtaBand.svelte';
	import Avatar from '$lib/site/components/Avatar.svelte';
	import NewsCard from '$lib/site/components/NewsCard.svelte';

	let { data } = $props();

	const modes = $derived([
		{ icon: Ship, label: m.hero_route_sea() },
		{ icon: Plane, label: m.hero_route_air() },
		{ icon: Truck, label: m.hero_route_land() }
	]);

	const services = $derived(shownServices(data.services));
</script>

<svelte:head>
	<title>{m.meta_home_title()}</title>
	<meta name="description" content={m.meta_home_desc()} />
	<meta property="og:title" content={m.meta_home_title()} />
	<meta property="og:description" content={m.meta_home_desc()} />
</svelte:head>

<!-- ───────────────────────────── Hero ───────────────────────────── -->
<section class="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white">
	<div class="absolute inset-0 -z-20 overflow-hidden">
		<enhanced:img
			src={hubDawn}
			alt=""
			sizes="100vw"
			fetchpriority="high"
			class="h-full w-full animate-kenburns object-cover opacity-50"
		/>
	</div>
	<div
		class="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/20 rtl:bg-gradient-to-l"
	></div>
	<div class="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-ink to-transparent"></div>

	<div
		class="absolute top-1/2 z-10 hidden aspect-square w-(--globe) -translate-y-1/2 [--globe:min(50%,82vh,36rem)] lg:block xl:[--globe:min(46%,86vh,36rem)]"
		style:inset-inline-end="calc(max(1.25rem, (100% - 80rem) / 2 + 2rem) - var(--globe) * 0.1)"
	>
		<HeroGlobe cities={data.cities} />
	</div>

	<div
		class="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-32 pb-12 sm:px-8"
		{@attach reveal()}
	>
		<p class="eyebrow enter text-ember" style:--enter-delay="0.25s">{m.hero_eyebrow()}</p>

		<h1
			class="mt-8 max-w-4xl font-display text-[clamp(3rem,min(8.5vw,13vh),8rem)] leading-[0.88] font-bold tracking-tight uppercase"
		>
			<span class="rise" style:--reveal-delay="350ms"><span>{m.hero_title_a()}</span></span>
			<br />
			<span class="rise" style:--reveal-delay="520ms">
				<span
					class="accent bg-gradient-to-r from-ember via-ember-soft to-ember bg-clip-text pe-2 font-normal text-transparent normal-case"
					>{m.hero_title_b()}</span
				>
			</span>
		</h1>

		<p
			class="enter mt-8 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl"
			style:--enter-delay="0.9s"
		>
			{m.hero_text()}
		</p>

		<div class="enter mt-10 flex flex-wrap items-center gap-4" style:--enter-delay="1.05s">
			<a
				href={resolve(l('/contact'))}
				class="group inline-flex items-center gap-4 rounded-full bg-ember py-2.5 ps-7 pe-2.5 font-semibold text-ink shadow-[0_20px_50px_-20px_rgba(255,122,69,0.8)] transition hover:bg-white"
			>
				{m.hero_cta_primary()}
				<span
					class="grid size-10 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:rotate-45 rtl:group-hover:-rotate-45"
				>
					<ArrowUpRight class="size-4 rtl:-scale-x-100" />
				</span>
			</a>
			<a
				href={resolve(l('/services'))}
				class="group inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 font-semibold text-white transition hover:border-white/60"
			>
				{m.hero_cta_secondary()}
				<ArrowRight class="size-4 transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
			</a>
		</div>
	</div>

	<div class="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8">
		<div
			class="enter flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6"
			style:--enter-delay="1.3s"
		>
			<ul class="flex flex-wrap items-center gap-3">
				{#each modes as mode (mode.label)}
					{@const Icon = mode.icon}
					<li
						class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur"
					>
						<Icon class="size-4 text-ember" strokeWidth={1.6} />
						{mode.label}
					</li>
				{/each}
			</ul>
			<p class="flex items-center gap-2 text-sm text-white/60">
				<MapPin class="size-4 text-ember" />
				{m.hero_location()}
			</p>
			<div class="hidden items-center gap-3 text-xs tracking-[0.3em] text-white/50 uppercase md:flex">
				{m.hero_scroll()}
				<span class="relative h-10 w-px overflow-hidden bg-white/15">
					<span class="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-ember"
					></span>
				</span>
			</div>
		</div>
	</div>
</section>

<Marquee items={services.map((s) => s.title())} tone="dark" />

<!-- ───────────────────────────── Who we are ───────────────────────────── -->
<section class="relative overflow-hidden bg-paper py-28 md:py-40">
	<div class="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:gap-20">
		<div class="relative lg:col-span-5">
			<div class="relative overflow-hidden rounded-[2rem]" data-reveal="clip" {@attach reveal()}>
				<div class="absolute -inset-y-[12%] inset-x-0" {@attach parallax(0.08)}>
					<enhanced:img
						src={strategyTable}
						alt=""
						sizes="(min-width: 1024px) 40vw, 100vw"
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="aspect-[4/5]"></div>
			</div>
			<div
				class="absolute -end-4 -bottom-10 w-40 rounded-3xl bg-white p-5 shadow-[0_30px_60px_-25px_rgba(6,12,24,0.35)] sm:-end-10 sm:w-48"
				data-reveal="zoom"
				{@attach reveal(400)}
			>
				<img src={mark} alt="" width="480" height="431" class="w-full animate-float" />
			</div>
		</div>

		<div class="lg:col-span-7">
			<SectionIntro
				eyebrow={m.about_eyebrow()}
				title={m.about_title()}
			/>
			<div class="mt-8 space-y-5 text-lg leading-relaxed text-stone">
				<p data-reveal="up" {@attach reveal(200)}>{m.about_p1()}</p>
				<p data-reveal="up" {@attach reveal(300)}>{m.about_p2()}</p>
			</div>
			<a
				href={resolve(l('/about'))}
				class="group mt-10 inline-flex items-center gap-3 font-semibold text-ink"
				data-reveal="up"
				{@attach reveal(380)}
			>
				<span class="border-b-2 border-ember pb-1">{m.about_more()}</span>
				<ArrowRight class="size-4 text-ember transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
			</a>
		</div>
	</div>

	<dl class="mx-auto mt-28 grid max-w-7xl gap-px overflow-hidden px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
		{#each data.figures as stat, i (stat.id)}
			<div
				class="flex flex-col-reverse gap-3 border-t border-ink/10 py-8 pe-6"
				data-reveal="up"
				{@attach reveal(i * 100)}
			>
				<dt class="max-w-[16rem] text-[15px] leading-snug text-stone">{stat.label}</dt>
				<dd class="font-display text-7xl leading-none font-bold text-ink" dir="ltr">
					<span {@attach countUp()}>{stat.value}</span>
				</dd>
			</div>
		{/each}
	</dl>
</section>

<!-- ───────────────────────────── Services ───────────────────────────── -->
<section class="relative bg-sand py-28 md:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
			<SectionIntro
				eyebrow={m.services_eyebrow()}
				title={m.services_title()}
				text={m.services_intro()}
			/>
			<a
				href={resolve(l('/services'))}
				class="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-ink/15 px-6 py-3.5 font-semibold transition hover:border-ink hover:bg-ink hover:text-white lg:self-auto"
				data-reveal="up"
				{@attach reveal(200)}
			>
				{m.services_all()}
				<ArrowRight class="size-4 transition group-hover:translate-x-1 rtl:-scale-x-100" />
			</a>
		</div>

		<div class="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each services as service, i (service.slug)}
				<ServiceCard {service} index={i} />
			{/each}
		</div>
	</div>
</section>

<MissionVision />

<ValuesList />

<WhyUs />

<!-- ───────────────────────────── Leadership ───────────────────────────── -->
{#if data.leaders.length}
<section class="relative overflow-hidden bg-paper py-28 md:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<SectionIntro eyebrow={m.team_eyebrow()} title={m.team_title()} text={m.team_intro()} />

		<div class="mt-16 grid gap-6 lg:grid-cols-2">
			{#each data.leaders as leader, i (leader.slug)}
				<a
					href={resolve(l(`/about#${leader.slug}`))}
					class="group relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white sm:p-10"
					data-reveal="up"
					{@attach reveal(i * 140)}
				>
					<div
						class="absolute -end-20 -top-20 size-72 rounded-full bg-ember/20 blur-3xl transition-transform duration-700 group-hover:scale-125"
					></div>
					<div class="relative flex items-center gap-6">
						<Avatar
							photo={leader.photo}
							initials={leader.initials}
							name={leader.name}
							class="size-24 shrink-0 rounded-full bg-gradient-to-br from-ember to-ember-deep text-ink ring-4 ring-white/10 ring-offset-4 ring-offset-ink"
						/>
						<div>
							<h3 class="font-display text-3xl font-semibold uppercase">{leader.name}</h3>
							<p class="mt-1 text-sm font-medium tracking-[0.2em] text-ember uppercase">
								{leader.role}
							</p>
						</div>
					</div>
					<p class="relative mt-8 text-[16px] leading-relaxed text-mist">{leader.summary}</p>
					<span class="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold">
						{m.team_read()}
						<ArrowUpRight
							class="size-4 text-ember transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
						/>
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

{/if}

<!-- ───────────────────────────── Testimonials ───────────────────────────── -->
{#if data.quotes.length}
	<section class="relative overflow-hidden bg-ink py-28 text-white md:py-36">
		<div class="mx-auto max-w-7xl px-5 sm:px-8">
			<SectionIntro eyebrow={m.testimonials_eyebrow()} title={m.testimonials_title()} tone="dark" />
			<div class="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.quotes as quote, i (quote.id)}
					<figure
						class="flex flex-col rounded-[2rem] border border-white/10 bg-white/[0.03] p-8"
						data-reveal="up"
						{@attach reveal((i % 3) * 120)}
					>
						<Quote class="size-8 text-ember rtl:-scale-x-100" strokeWidth={1.4} />
						<blockquote class="mt-6 flex-1 text-lg leading-relaxed text-white/85">{quote.quote}</blockquote>
						<figcaption class="mt-8 border-t border-white/10 pt-5">
							<p class="font-display text-xl font-semibold uppercase">{quote.author}</p>
							{#if quote.position}<p class="mt-1 text-sm text-mist">{quote.position}</p>{/if}
						</figcaption>
					</figure>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- ───────────────────────────── Partners ───────────────────────────── -->
{#if data.logos.length}
	<section class="bg-paper py-20" aria-labelledby="partners-title">
		<div class="mx-auto max-w-7xl px-5 sm:px-8">
			<p id="partners-title" class="eyebrow justify-center text-center text-ember-deep">{m.partners_eyebrow()}</p>
			<ul class="mt-10 flex flex-wrap items-center justify-center gap-x-14 gap-y-10">
				{#each data.logos as logo, i (logo.id)}
					<li data-reveal="up" {@attach reveal((i % 6) * 60)}>
						{#if logo.url}
							<!-- eslint-disable svelte/no-navigation-without-resolve -- an outside site -->
							<a href={logo.url} target="_blank" rel="noopener noreferrer" title={logo.name}>
								<img
									src={publicFileUrl(logo.logo)}
									alt={logo.name}
									loading="lazy"
									class="h-12 w-auto max-w-40 object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
								/>
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{:else}
							<img
								src={publicFileUrl(logo.logo)}
								alt={logo.name}
								title={logo.name}
								loading="lazy"
								class="h-12 w-auto max-w-40 object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
							/>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<!-- ───────────────────────────── News ───────────────────────────── -->
{#if data.news.length}
	<section class="bg-sand py-28 md:py-36">
		<div class="mx-auto max-w-7xl px-5 sm:px-8">
			<div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
				<SectionIntro eyebrow={m.news_eyebrow()} title={m.news_title()} />
				<a
					href={resolve(l('/news'))}
					class="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-ink/15 px-6 py-3.5 font-semibold transition hover:border-ink hover:bg-ink hover:text-white lg:self-auto"
				>
					{m.news_all()}
					<ArrowRight class="size-4 transition group-hover:translate-x-1 rtl:-scale-x-100" />
				</a>
			</div>
			<div class="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.news as post, i (post.slug)}
					<NewsCard {post} index={i} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- A last image band before the call to action. -->
<section class="relative h-[55vh] min-h-80 overflow-hidden bg-ink" aria-hidden="true">
	<div class="absolute inset-x-0 -top-[25%] -bottom-[25%]" {@attach parallax(0.1)}>
		<enhanced:img src={portSunset} alt="" sizes="100vw" class="h-full w-full object-cover" />
	</div>
	<div class="absolute inset-0 bg-gradient-to-b from-paper via-transparent to-ember/50"></div>
</section>

<CtaBand />

<style>
	@keyframes -global-scrollcue {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(200%);
		}
	}
</style>
