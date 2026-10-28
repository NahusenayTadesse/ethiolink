<script lang="ts">
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Send from '@lucide/svelte/icons/send';
	import Linkedin from '@lucide/svelte/icons/linkedin';
	import Facebook from '@lucide/svelte/icons/facebook';
	import Instagram from '@lucide/svelte/icons/instagram';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages.js';
	import logo from '$lib/assets/brand/logo-on-dark.png';
	import type { ContactDetails } from '$lib/server/content';
	import { shownServices, type ServiceSlug } from '../services';
	import { l } from '../links';
	import { reveal } from '../motion';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	type Props = {
		contact: ContactDetails;
		services: { slug: ServiceSlug; photo: string | null }[];
	};
	let { contact, services }: Props = $props();

	const year = new Date().getFullYear();
	const shown = $derived(shownServices(services));
	const social = $derived(
		[
			{ href: contact.social.linkedin, label: 'LinkedIn', icon: Linkedin },
			{ href: contact.social.facebook, label: 'Facebook', icon: Facebook },
			{ href: contact.social.instagram, label: 'Instagram', icon: Instagram },
			{ href: contact.telegram && `https://t.me/${contact.telegram}`, label: 'Telegram', icon: Send }
		].filter((s): s is typeof s & { href: string } => Boolean(s.href))
	);
</script>

<footer class="relative overflow-hidden bg-ink text-white">
	<div
		class="pointer-events-none absolute -bottom-40 start-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-ember/10 blur-3xl rtl:translate-x-1/2"
	></div>

	<div class="relative mx-auto max-w-7xl px-5 pt-24 pb-10 sm:px-8">
		<div class="grid gap-14 lg:grid-cols-12">
			<div class="lg:col-span-4" data-reveal="up" {@attach reveal()}>
				<img src={logo} alt={m.company_name()} width="640" height="508" class="h-24 w-auto" />
				<p class="mt-6 max-w-sm text-[15px] leading-relaxed text-mist">{m.footer_tagline()}</p>
				<LanguageSwitcher placement="up" class="mt-8 inline-block" />
				{#if social.length || contact.social.tiktok}
					<p class="mt-10 font-display text-sm font-semibold tracking-[0.24em] text-white/50 uppercase">
						{m.footer_follow()}
					</p>
					<ul class="mt-4 flex flex-wrap gap-2">
						{#each social as link (link.label)}
							{@const Icon = link.icon}
							<li>
								<!-- eslint-disable svelte/no-navigation-without-resolve -- an outside site -->
								<a
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={link.label}
									class="grid size-10 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-ember hover:bg-ember hover:text-ink"
								>
									<Icon class="size-4" />
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</li>
						{/each}
						{#if contact.social.tiktok}
							<li>
								<!-- eslint-disable svelte/no-navigation-without-resolve -- an outside site -->
								<a
									href={contact.social.tiktok}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="TikTok"
									class="grid size-10 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-ember hover:bg-ember hover:text-ink"
								>
									<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true"
										><path
											d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.36-2.49V9.64A5.73 5.73 0 0 0 4.2 15.3a5.7 5.7 0 0 0 5.66 5.7 5.7 5.7 0 0 0 5.7-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.26-1.48Z"
										/></svg
									>
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</li>
						{/if}
					</ul>
				{/if}
			</div>

			<div class="lg:col-span-2" data-reveal="up" {@attach reveal(80)}>
				<h2 class="font-display text-sm font-semibold tracking-[0.24em] text-white/50 uppercase">
					{m.footer_explore()}
				</h2>
				<ul class="mt-5 space-y-3 text-[15px]">
					<li><a class="text-white/80 transition hover:text-ember" href={resolve(l('/'))}>{m.nav_home()}</a></li>
					<li>
						<a class="text-white/80 transition hover:text-ember" href={resolve(l('/about'))}>{m.nav_about()}</a>
					</li>
					<li>
						<a class="text-white/80 transition hover:text-ember" href={resolve(l('/services'))}
							>{m.nav_services()}</a
						>
					</li>
					<li>
						<a class="text-white/80 transition hover:text-ember" href={resolve(l('/news'))}>{m.nav_news()}</a>
					</li>
					<li>
						<a class="text-white/80 transition hover:text-ember" href={resolve(l('/careers'))}
							>{m.nav_careers()}</a
						>
					</li>
					<li>
						<a class="text-white/80 transition hover:text-ember" href={resolve(l('/quote'))}>{m.nav_quote()}</a>
					</li>
					<li>
						<a class="text-white/80 transition hover:text-ember" href={resolve(l('/contact'))}
							>{m.nav_contact()}</a
						>
					</li>
				</ul>
			</div>

			<div class="lg:col-span-3" data-reveal="up" {@attach reveal(160)}>
				<h2 class="font-display text-sm font-semibold tracking-[0.24em] text-white/50 uppercase">
					{m.footer_services()}
				</h2>
				<ul class="mt-5 space-y-3 text-[15px]">
					{#each shown as service (service.slug)}
						<li>
							<a
								class="text-white/80 transition hover:text-ember"
								href={resolve(l(`/services#${service.slug}`))}>{service.title()}</a
							>
						</li>
					{/each}
				</ul>
			</div>

			<div class="lg:col-span-3" data-reveal="up" {@attach reveal(240)}>
				<h2 class="font-display text-sm font-semibold tracking-[0.24em] text-white/50 uppercase">
					{m.footer_visit()}
				</h2>
				<ul class="mt-5 space-y-5 text-[15px] text-white/80">
					<li class="flex gap-3">
						<MapPin class="mt-0.5 size-5 shrink-0 text-ember" />
						<span>{contact.address}</span>
					</li>
					{#if contact.hours.length}
						<li class="flex gap-3">
							<Clock class="mt-0.5 size-5 shrink-0 text-ember" />
							<span>
								{#each contact.hours as line, i (i)}{#if i}<br />{/if}{line}{/each}
							</span>
						</li>
					{/if}
					{#if contact.email}
						<li class="flex gap-3">
							<Mail class="mt-0.5 size-5 shrink-0 text-ember" />
							<a class="hover:text-ember" href="mailto:{contact.email}">{contact.email}</a>
						</li>
					{/if}
					{#if contact.phone}
						<li class="flex gap-3">
							<Phone class="mt-0.5 size-5 shrink-0 text-ember" />
							<a class="hover:text-ember" href="tel:{contact.phone}" dir="ltr">{contact.phone}</a>
						</li>
					{/if}
					{#if contact.whatsapp}
						<li class="flex gap-3">
							<MessageCircle class="mt-0.5 size-5 shrink-0 text-ember" />
							<!-- eslint-disable svelte/no-navigation-without-resolve -- an outside site -->
							<a
								class="hover:text-ember"
								href="https://wa.me/{contact.whatsapp}"
								target="_blank"
								rel="noopener noreferrer">{m.contact_whatsapp()}</a
							>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</li>
					{/if}
				</ul>
			</div>
		</div>

		<div
			class="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between"
		>
			<p>{m.footer_rights({ year: String(year) })}</p>
			<div class="flex items-center gap-6">
				<a class="transition hover:text-white" href={resolve('/login')}>{m.footer_staff()}</a>
				<a
					href="#top"
					class="group inline-flex items-center gap-2 transition hover:text-white"
					aria-label={m.footer_top()}
				>
					{m.footer_top()}
					<span
						class="grid size-9 place-items-center rounded-full border border-white/15 transition group-hover:border-ember group-hover:bg-ember group-hover:text-ink"
					>
						<ArrowUp class="size-4" />
					</span>
				</a>
			</div>
		</div>
	</div>

	<p
		aria-hidden="true"
		class="pointer-events-none relative -mb-[0.22em] text-center font-display text-[22vw] leading-none font-bold tracking-tight text-white/[0.03] uppercase select-none"
	>
		EthioLink
	</p>
</footer>
