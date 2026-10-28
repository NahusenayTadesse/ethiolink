<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import logo from '$lib/assets/brand/logo-on-dark.png';
	import { l } from '$lib/site/links';
	import HeroRoutes from '$lib/site/components/HeroRoutes.svelte';
</script>

<svelte:head>
	<title>{page.status} | EthioLink</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	data-site-type
	class="grain relative isolate flex min-h-screen items-center overflow-hidden bg-ink px-6 text-white"
>
	<div class="pointer-events-none absolute inset-0 -z-10 opacity-60"><HeroRoutes /></div>
	<div class="mx-auto w-full max-w-3xl text-center">
		<a href={resolve(l('/'))} class="enter inline-block"
			><img src={logo} alt="EthioLink" width="640" height="508" class="mx-auto h-20 w-auto" /></a
		>
		<p
			class="enter mt-10 font-display text-[9rem] leading-none font-bold text-transparent [-webkit-text-stroke:2px_var(--color-ember)]"
			style:--enter-delay="0.1s"
		>
			{page.status}
		</p>
		<h1 class="enter mt-4 font-display text-4xl font-semibold uppercase" style:--enter-delay="0.2s">
			{page.status === 404 ? m.error_title() : (page.error?.message ?? m.error_title())}
		</h1>
		<p class="enter mt-4 text-lg text-mist" style:--enter-delay="0.3s">{m.error_text()}</p>
		<a
			href={resolve(l('/'))}
			class="enter mt-10 inline-flex rounded-full bg-ember px-7 py-3.5 font-semibold text-ink transition hover:bg-white"
			style:--enter-delay="0.4s">{m.error_home()}</a
		>
	</div>
</div>
