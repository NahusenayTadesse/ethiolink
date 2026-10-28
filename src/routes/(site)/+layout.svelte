<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { deLocalizeHref, getLocale, locales, localizeHref } from '$lib/paraglide/runtime';
	import SiteHeader from '$lib/site/components/SiteHeader.svelte';
	import SiteFooter from '$lib/site/components/SiteFooter.svelte';

	let { data, children } = $props();

	const path = $derived(deLocalizeHref(page.url.pathname));
	const absolute = (locale: (typeof locales)[number]) =>
		new URL(localizeHref(path, { locale }), page.url.origin).href;
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
	/>
	<link rel="canonical" href={absolute(getLocale())} />
	{#each locales as locale (locale)}
		<link rel="alternate" hreflang={locale} href={absolute(locale)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={absolute('en')} />
	<meta property="og:site_name" content="EthioLink" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.url.href} />
	<meta name="theme-color" content="#060c18" />
</svelte:head>

<div data-site-type id="top" class="min-h-screen bg-paper text-ink antialiased">
	<a
		href="#content"
		class="fixed start-4 top-4 z-[60] -translate-y-24 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-ink transition focus:translate-y-0"
	>
		{m.skip_to_content()}
	</a>
	<SiteHeader />
	<main id="content">
		{@render children()}
	</main>
	<SiteFooter contact={data.contact} services={data.services} />
	<Toaster richColors position="top-center" />
</div>
