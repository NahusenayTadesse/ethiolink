<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import controlRoom from '$lib/assets/images/control-room.jpg?enhanced';
	import PageHero from '$lib/site/components/PageHero.svelte';
	import NewsCard from '$lib/site/components/NewsCard.svelte';
	import CtaBand from '$lib/site/components/CtaBand.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.meta_news_title()}</title>
	<meta name="description" content={m.meta_news_desc()} />
	<meta property="og:title" content={m.meta_news_title()} />
	<meta property="og:description" content={m.meta_news_desc()} />
</svelte:head>

<PageHero
	eyebrow={m.news_eyebrow()}
	title={m.news_page_title()}
	text={m.news_page_intro()}
	image={controlRoom}
	current={m.nav_news()}
/>

<section class="bg-paper py-24 md:py-32">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		{#if data.posts.length}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.posts as post, i (post.slug)}
					<NewsCard {post} index={i} />
				{/each}
			</div>
		{:else}
			<p class="py-20 text-center text-lg text-stone">{m.news_empty()}</p>
		{/if}
	</div>
</section>

<CtaBand />
