<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import { publicFileUrl } from '@nahu/admin-kit/files';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { l } from '../links';
	import { reveal } from '../motion';

	type Props = {
		post: { slug: string; cover: string | null; title: string; excerpt: string; publishedAt: Date };
		index: number;
	};
	let { post, index }: Props = $props();

	const date = $derived(
		new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long', timeZone: 'Africa/Addis_Ababa' }).format(
			post.publishedAt
		)
	);
</script>

<a
	href={resolve(l(`/news/${post.slug}`))}
	class="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white transition duration-500 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_40px_80px_-40px_rgba(6,12,24,0.45)]"
	data-reveal="up"
	{@attach reveal((index % 3) * 100)}
>
	<div class="relative aspect-[16/9] overflow-hidden bg-ink">
		{#if post.cover}
			<img
				src={publicFileUrl(post.cover)}
				alt=""
				loading="lazy"
				class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
			/>
		{:else}
			<span class="absolute inset-0 grid place-items-center text-ember/60">
				<Newspaper class="size-12" strokeWidth={1.2} />
			</span>
		{/if}
	</div>
	<div class="flex flex-1 flex-col p-7">
		<time class="text-xs font-semibold tracking-[0.2em] text-ember-deep uppercase" datetime={post.publishedAt.toISOString()}>
			{date}
		</time>
		<h3 class="mt-3 font-display text-2xl leading-tight font-semibold text-ink uppercase">{post.title}</h3>
		<p class="mt-3 line-clamp-3 text-[15px] leading-relaxed text-stone">{post.excerpt}</p>
		<span class="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-ink">
			{m.news_read()}
			<ArrowUpRight
				class="size-4 text-ember transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
			/>
		</span>
	</div>
</a>
