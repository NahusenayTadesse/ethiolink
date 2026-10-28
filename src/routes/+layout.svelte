<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/brand/favicon.png';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { locales, localizeHref } from '$lib/paraglide/runtime';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<!-- Lets the prerenderer and crawlers find every language version of the current page. -->
<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as '/') /* typed as in $lib/site/links */}>{locale}</a>
	{/each}
</div>
