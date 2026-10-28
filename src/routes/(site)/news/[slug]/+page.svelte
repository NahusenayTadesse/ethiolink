<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { publicFileUrl } from '@nahu/admin-kit/files';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { l } from '$lib/site/links';
	import CtaBand from '$lib/site/components/CtaBand.svelte';

	let { data } = $props();

	const post = $derived(data.post);
	const date = $derived(
		new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long', timeZone: 'Africa/Addis_Ababa' }).format(
			post.publishedAt
		)
	);
	const cover = $derived(post.cover ? new URL(publicFileUrl(post.cover), page.url.origin).href : null);
</script>

<svelte:head>
	<title>{post.title} — EthioLink</title>
	<meta name="description" content={post.excerpt} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt} />
	<meta property="og:type" content="article" />
	<meta property="article:published_time" content={post.publishedAt.toISOString()} />
	{#if cover}<meta property="og:image" content={cover} />{/if}
</svelte:head>

<article>
	<header class="grain relative isolate overflow-hidden bg-ink pt-44 pb-20 text-white md:pt-52">
		<div class="mx-auto max-w-3xl px-5 sm:px-8">
			<a
				href={resolve(l('/news'))}
				class="enter inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
			>
				<ArrowLeft class="size-4 rtl:-scale-x-100" />
				{m.news_back()}
			</a>
			<time
				class="enter mt-10 block text-xs font-semibold tracking-[0.24em] text-ember uppercase"
				style:--enter-delay="0.1s"
				datetime={post.publishedAt.toISOString()}>{date}</time
			>
			<h1
				class="enter mt-4 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] font-bold uppercase"
				style:--enter-delay="0.2s"
			>
				{post.title}
			</h1>
			<p class="enter mt-6 text-lg leading-relaxed text-white/70" style:--enter-delay="0.3s">{post.excerpt}</p>
		</div>
	</header>

	{#if post.cover}
		<div class="bg-ink">
			<div class="mx-auto max-w-5xl px-5 sm:px-8">
				<img
					src={publicFileUrl(post.cover)}
					alt=""
					class="relative top-12 -mt-4 aspect-[16/9] w-full rounded-[2rem] object-cover shadow-2xl"
				/>
			</div>
		</div>
	{/if}

	<div class="bg-paper pt-24 pb-28 md:pb-36">
		<!-- Sanitised on save (allowlisted tags, links and /media images only). -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="rich-text mx-auto max-w-3xl px-5 sm:px-8">{@html post.body}</div>
	</div>
</article>

<CtaBand />
