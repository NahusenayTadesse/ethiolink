<script lang="ts">
	import { resolve } from '$app/paths';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
	import { deLocalizeHref } from '$lib/paraglide/runtime';
	import logo from '$lib/assets/brand/logo-on-dark.png';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import { l } from '../links';

	let scrollY = $state(0);
	let open = $state(false);

	const scrolled = $derived(scrollY > 40);
	const current = $derived(deLocalizeHref(page.url.pathname));
	const links = $derived([
		{ path: '/', label: m.nav_home() },
		{ path: '/about', label: m.nav_about() },
		{ path: '/services', label: m.nav_services() },
		{ path: '/news', label: m.nav_news() },
		{ path: '/contact', label: m.nav_contact() }
	]);

	const isCurrent = (path: string) =>
		path === '/' ? current === '/' : current === path || current.startsWith(`${path}/`);

	afterNavigate(() => (open = false));

	$effect(() => {
		document.documentElement.style.overflow = open ? 'hidden' : '';
		return () => (document.documentElement.style.overflow = '');
	});
</script>

<svelte:window bind:scrollY onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<header
	class={[
		'fixed inset-x-0 top-0 z-50 transition-all duration-500',
		scrolled || open
			? 'border-b border-white/10 bg-ink/80 py-2.5 backdrop-blur-xl'
			: 'border-b border-transparent py-5'
	]}
>
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
		<a href={resolve(l('/'))} class="enter relative z-10 shrink-0" aria-label={m.company_name()}>
			<img
				src={logo}
				alt=""
				width="640"
				height="508"
				class={['w-auto transition-all duration-500', scrolled ? 'h-12' : 'h-16']}
			/>
		</a>

		<nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
			{#each links as link, i (link.path)}
				<a
					href={resolve(l(link.path))}
					aria-current={isCurrent(link.path) ? 'page' : undefined}
					class="enter group relative px-4 py-2 font-display text-[15px] font-medium tracking-[0.14em] text-white/75 uppercase transition hover:text-white aria-[current=page]:text-white"
					style:--enter-delay="{0.1 + i * 0.07}s"
				>
					{link.label}
					<span
						class="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-ember transition-transform duration-500 group-hover:scale-x-100 group-aria-[current=page]:scale-x-100 rtl:origin-right"
					></span>
				</a>
			{/each}
		</nav>

		<div class="enter hidden items-center gap-3 lg:flex" style:--enter-delay="0.4s">
			<LanguageSwitcher />
			<a
				href={resolve(l('/quote'))}
				class="group inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white"
			>
				{m.nav_quote()}
				<ArrowUpRight
					class="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
				/>
			</a>
		</div>

		<button
			type="button"
			class="relative z-10 grid size-11 place-items-center rounded-full border border-white/15 text-white lg:hidden"
			aria-label={open ? m.nav_close() : m.nav_menu()}
			aria-expanded={open}
			aria-controls="mobile-menu"
			onclick={() => (open = !open)}
		>
			{#if open}<X class="size-5" />{:else}<Menu class="size-5" />{/if}
		</button>
	</div>
</header>

{#if open}
	<div
		id="mobile-menu"
		class="fixed inset-0 z-40 flex flex-col bg-ink px-6 pt-28 pb-10 text-white lg:hidden"
	>
		<div
			class="pointer-events-none absolute -end-32 -top-32 size-96 rounded-full bg-ember/20 blur-3xl"
		></div>
		<nav class="relative flex flex-col" aria-label="Mobile">
			{#each links as link, i (link.path)}
				<a
					href={resolve(l(link.path))}
					aria-current={isCurrent(link.path) ? 'page' : undefined}
					class="enter flex items-baseline gap-4 border-b border-white/10 py-5 font-display text-4xl font-semibold uppercase aria-[current=page]:text-ember"
					style:--enter-delay="{0.05 + i * 0.07}s"
				>
					<span class="font-text text-xs text-white/40">0{i + 1}</span>
					{link.label}
				</a>
			{/each}
		</nav>
		<div class="enter mt-auto flex items-center justify-between gap-4" style:--enter-delay="0.35s">
			<LanguageSwitcher placement="up" />
			<a
				href={resolve(l('/quote'))}
				class="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-ink"
			>
				{m.nav_quote()}
				<ArrowUpRight class="size-4 rtl:-scale-x-100" />
			</a>
		</div>
	</div>
{/if}
