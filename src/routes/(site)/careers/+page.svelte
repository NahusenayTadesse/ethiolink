<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import { m } from '$lib/paraglide/messages.js';
	import strategyTable from '$lib/assets/images/strategy-table.jpg?enhanced';
	import { l } from '$lib/site/links';
	import { reveal } from '$lib/site/motion';
	import PageHero from '$lib/site/components/PageHero.svelte';
	import SectionIntro from '$lib/site/components/SectionIntro.svelte';
	import ValuesList from '$lib/site/components/ValuesList.svelte';
	import { closing, jobType } from './jobText';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.meta_careers_title()}</title>
	<meta name="description" content={m.meta_careers_desc()} />
	<meta property="og:title" content={m.meta_careers_title()} />
	<meta property="og:description" content={m.meta_careers_desc()} />
</svelte:head>

<PageHero
	eyebrow={m.careers_eyebrow()}
	title={m.careers_title()}
	text={m.careers_intro()}
	image={strategyTable}
	current={m.nav_careers()}
/>

<section class="bg-paper py-24 md:py-32">
	<div class="mx-auto max-w-5xl px-5 sm:px-8">
		<SectionIntro eyebrow={m.careers_eyebrow()} title={m.careers_openings()} />
		{#if data.jobs.length}
			<ul class="mt-14 space-y-4">
				{#each data.jobs as job, i (job.id)}
					<li data-reveal="up" {@attach reveal(i * 80)}>
						<a
							href={resolve(l(`/careers/${job.slug}`))}
							class="group flex flex-col gap-4 rounded-3xl border border-ink/10 bg-white p-7 transition hover:border-ember/40 hover:shadow-[0_40px_80px_-50px_rgba(6,12,24,0.5)] sm:flex-row sm:items-center sm:justify-between sm:p-9"
						>
							<div>
								<h3 class="font-display text-3xl leading-tight font-semibold text-ink uppercase">{job.title}</h3>
								<p class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone">
									<span class="inline-flex items-center gap-1.5"><MapPin class="size-4 text-ember-deep" />{job.location}</span>
									<span>{jobType(job.employmentType)}</span>
									<span class="inline-flex items-center gap-1.5"><Clock class="size-4 text-ember-deep" />{closing(job.closesOn)}</span>
								</p>
							</div>
							<span
								class="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-ember group-hover:text-ink sm:self-auto"
							>
								{m.careers_view()}
								<ArrowUpRight class="size-4 rtl:-scale-x-100" />
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-14 rounded-3xl border border-dashed border-ink/15 p-10 text-center text-lg text-stone">
				{m.careers_empty()}
			</p>
		{/if}
	</div>
</section>

<ValuesList />
