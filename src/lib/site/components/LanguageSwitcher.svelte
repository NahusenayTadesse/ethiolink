<script lang="ts">
	import Globe from '@lucide/svelte/icons/globe';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, locales, localizeHref } from '$lib/paraglide/runtime';
	import { LOCALE_NAMES } from '../links';

	type Props = { placement?: 'down' | 'up'; class?: string };
	let { placement = 'down', class: className = '' }: Props = $props();

	let open = $state(false);
	const current = getLocale();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<div class={['relative', className]}>
	<button
		type="button"
		class="flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-sm text-white/85 transition hover:border-white/40 hover:text-white"
		aria-haspopup="true"
		aria-expanded={open}
		aria-label={m.lang_label()}
		onclick={() => (open = !open)}
	>
		<Globe class="size-4" />
		<span>{LOCALE_NAMES[current]}</span>
		<ChevronDown class={['size-3.5 transition', open && 'rotate-180']} />
	</button>

	{#if open}
		<button
			type="button"
			class="fixed inset-0 z-10 cursor-default"
			aria-label={m.nav_close()}
			onclick={() => (open = false)}
		></button>
		<ul
			class={[
				'absolute end-0 z-20 min-w-40 overflow-hidden rounded-2xl border border-white/10 bg-ink-2/95 p-1.5 shadow-2xl backdrop-blur-xl',
				placement === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'
			]}
		>
			{#each locales as locale (locale)}
				<li>
					<!-- A full load, so every message on the page is rendered in the new language. -->
					<a
						href={resolve(localizeHref(page.url.pathname, { locale }) as '/') /* typed as in $lib/site/links */}
						hreflang={locale}
						data-sveltekit-reload
						class={[
							'flex items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-sm transition',
							locale === current
								? 'bg-white/10 text-white'
								: 'text-white/70 hover:bg-white/5 hover:text-white'
						]}
					>
						{LOCALE_NAMES[locale]}
						<span class="text-[10px] tracking-widest text-white/40 uppercase">{locale}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
