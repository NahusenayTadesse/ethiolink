<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import strategyTable from '$lib/assets/images/strategy-table.jpg?enhanced';
	import hubDawn from '$lib/assets/images/hub-dawn.jpg?enhanced';
	import { reveal } from '$lib/site/motion';
	import PageHero from '$lib/site/components/PageHero.svelte';
	import SectionIntro from '$lib/site/components/SectionIntro.svelte';
	import MissionVision from '$lib/site/components/MissionVision.svelte';
	import ValuesList from '$lib/site/components/ValuesList.svelte';
	import CtaBand from '$lib/site/components/CtaBand.svelte';
	import Marquee from '$lib/site/components/Marquee.svelte';
	import Avatar from '$lib/site/components/Avatar.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.meta_about_title()}</title>
	<meta name="description" content={m.meta_about_desc()} />
	<meta property="og:title" content={m.meta_about_title()} />
	<meta property="og:description" content={m.meta_about_desc()} />
</svelte:head>

<PageHero
	eyebrow={m.about_eyebrow()}
	title={m.about_page_title()}
	text={m.about_page_intro()}
	image={hubDawn}
	current={m.nav_about()}
/>

<section class="bg-paper py-28 md:py-36">
	<div class="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24">
		<div>
			<SectionIntro eyebrow={m.about_eyebrow()} title={m.about_title()} />
			<div class="mt-8 space-y-5 text-lg leading-relaxed text-stone">
				<p data-reveal="up" {@attach reveal(200)}>{m.about_p1()}</p>
				<p data-reveal="up" {@attach reveal(300)}>{m.about_p2()}</p>
			</div>
		</div>
		<div class="relative">
			<div class="overflow-hidden rounded-[2rem]" data-reveal="clip" {@attach reveal(100)}>
				<enhanced:img
					src={strategyTable}
					alt=""
					sizes="(min-width: 1024px) 45vw, 100vw"
					class="aspect-[5/6] w-full object-cover"
				/>
			</div>
			{#if data.highlight}
				<div
					class="absolute -start-6 -bottom-8 hidden rounded-2xl bg-ember px-7 py-6 text-ink shadow-xl sm:block"
					data-reveal="up"
					{@attach reveal(450)}
				>
					<p class="font-display text-6xl leading-none font-bold" dir="ltr">{data.highlight.value}</p>
					<p class="mt-2 max-w-[12rem] text-sm leading-snug font-medium">{data.highlight.label}</p>
				</div>
			{/if}
		</div>
	</div>
</section>

<MissionVision />

<ValuesList />

{#if data.leaders.length}
<section id="leadership" class="scroll-mt-24 bg-sand py-28 md:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<SectionIntro eyebrow={m.team_eyebrow()} title={m.team_title()} text={m.team_intro()} />

		<div class="mt-20 space-y-24">
			{#each data.leaders as leader, i (leader.slug)}
				<article id={leader.slug} class="grid scroll-mt-28 gap-10 lg:grid-cols-12 lg:gap-16">
					<div class="lg:col-span-4">
						<div class="lg:sticky lg:top-32" data-reveal="left" {@attach reveal()}>
							<div
								class="relative grid aspect-square w-full max-w-xs place-items-center overflow-hidden rounded-[2rem] bg-ink"
							>
								<div
									class={[
										'absolute size-64 rounded-full blur-3xl',
										i % 2 ? 'bg-ember/30 -bottom-20 -start-20' : 'bg-ember/30 -end-20 -top-20'
									]}
								></div>
								{#if leader.photo}
									<Avatar
										photo={leader.photo}
										initials={leader.initials}
										name={leader.name}
										class="relative h-full w-full"
									/>
								{:else}
									<span
										class="relative font-display text-8xl font-bold text-transparent [-webkit-text-stroke:2px_var(--color-ember)]"
										dir="ltr"
									>
										{leader.initials}
									</span>
								{/if}
							</div>
							<h3 class="mt-8 font-display text-4xl font-semibold text-ink uppercase">
								{leader.name}
							</h3>
							<p class="mt-2 text-sm font-semibold tracking-[0.22em] text-ember-deep uppercase">
								{leader.role}
							</p>
						</div>
					</div>
					<div class="space-y-6 text-[17px] leading-[1.8] text-stone lg:col-span-8">
						{#each leader.bio as paragraph, p (p)}
							<p
								class={p === 0 ? 'text-xl leading-relaxed text-ink' : ''}
								data-reveal="up"
								{@attach reveal(p * 60)}
							>
								{paragraph}
							</p>
						{/each}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

{/if}

<Marquee
	items={[m.hero_title_a(), m.hero_title_b(), m.about_title(), m.cta_title_a(), m.cta_title_b()]}
	tone="dark"
/>

<CtaBand />
