<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import Navigation from '@lucide/svelte/icons/navigation';
	import Send from '@lucide/svelte/icons/send';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import { setKitLabels } from '@nahu/admin-kit/labels';
	import { m } from '$lib/paraglide/messages.js';
	import controlRoom from '$lib/assets/images/control-room.jpg?enhanced';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import { resolve } from '$app/paths';
	import { shownServices } from '$lib/site/services';
	import { directionsUrl, mapEmbedUrl } from '$lib/site/contact';
	import { l } from '$lib/site/links';
	import { reveal } from '$lib/site/motion';
	import PageHero from '$lib/site/components/PageHero.svelte';
	import { contactSchema } from './schema';

	let { data } = $props();

	// The kit's service picker speaks the visitor's language.
	setKitLabels(() => ({
		select: () => m.form_choose(),
		searchFor: () => m.form_search(),
		noneFound: () => m.form_none_found()
	}));

	// The form is created once, from the data the page first loaded with.
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, message } = createForm(data.form, contactSchema);

	const services = $derived([
		{ value: 'general', name: m.form_service_general() },
		...shownServices(data.services).map((service) => ({ value: service.slug, name: service.title() }))
	]);
	const contact = $derived(data.contact);
	const sent = $derived($message?.type === 'success');
</script>

<svelte:head>
	<title>{m.meta_contact_title()}</title>
	<meta name="description" content={m.meta_contact_desc()} />
	<meta property="og:title" content={m.meta_contact_title()} />
	<meta property="og:description" content={m.meta_contact_desc()} />
</svelte:head>

<PageHero
	eyebrow={m.contact_eyebrow()}
	title={m.contact_title()}
	text={m.contact_intro()}
	image={controlRoom}
	current={m.nav_contact()}
/>

<section class="relative bg-paper pb-28 md:pb-36">
	<div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
		<!-- Details and map -->
		<div class="space-y-5 pt-16 lg:col-span-5 lg:pt-24">
			<article
				class="rounded-3xl border border-ink/10 bg-white p-7"
				data-reveal="up"
				{@attach reveal()}
			>
				<div class="flex items-start gap-4">
					<span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-ember">
						<MapPin class="size-5" />
					</span>
					<div>
						<h2 class="font-display text-lg font-semibold tracking-[0.16em] text-ink uppercase">
							{m.contact_office()}
						</h2>
						<p class="mt-1.5 leading-relaxed text-stone">{contact.address}</p>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- an outside site -->
						<a
							href={directionsUrl(contact.mapQuery)}
							target="_blank"
							rel="noopener noreferrer"
							class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ember-deep hover:text-ink"
						>
							<Navigation class="size-4" />
							{m.contact_directions()}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</div>
				</div>
			</article>

			{#if contact.hours.length}
			<article
				class="rounded-3xl border border-ink/10 bg-white p-7"
				data-reveal="up"
				{@attach reveal(90)}
			>
				<div class="flex items-start gap-4">
					<span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-ember">
						<Clock class="size-5" />
					</span>
					<div>
						<h2 class="font-display text-lg font-semibold tracking-[0.16em] text-ink uppercase">
							{m.contact_hours()}
						</h2>
						<p class="mt-1.5 leading-relaxed text-stone">
							{#each contact.hours as line, i (i)}{#if i}<br />{/if}{line}{/each}
						</p>
					</div>
				</div>
			</article>
			{/if}

			{#if contact.email || contact.phone}
				<article
					class="grid gap-5 rounded-3xl border border-ink/10 bg-white p-7 sm:grid-cols-2"
					data-reveal="up"
					{@attach reveal(180)}
				>
					{#if contact.email}
						<a href="mailto:{contact.email}" class="flex items-center gap-3 text-ink hover:text-ember-deep">
							<Mail class="size-5 text-ember" />
							<span><span class="block text-xs text-stone">{m.contact_email()}</span>{contact.email}</span>
						</a>
					{/if}
					{#if contact.phone}
						<a href="tel:{contact.phone}" class="flex items-center gap-3 text-ink hover:text-ember-deep">
							<Phone class="size-5 text-ember" />
							<span
								><span class="block text-xs text-stone">{m.contact_phone()}</span><span dir="ltr"
									>{contact.phone}</span
								></span
							>
						</a>
					{/if}
				</article>
			{/if}

			{#if contact.whatsapp || contact.telegram}
				<div class="flex flex-wrap gap-3" data-reveal="up" {@attach reveal(190)}>
					{#if contact.whatsapp}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- an outside site -->
						<a
							href="https://wa.me/{contact.whatsapp}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-95"
						>
							<MessageCircle class="size-4" />
							{m.contact_whatsapp()}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
					{#if contact.telegram}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- an outside site -->
						<a
							href="https://t.me/{contact.telegram}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-full bg-[#229ed9] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
						>
							<Send class="size-4" />
							{m.contact_telegram()}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
				</div>
			{/if}

			<a
				href={resolve(l('/quote'))}
				class="group flex items-center justify-between gap-4 rounded-3xl bg-ink p-7 text-white transition hover:bg-ink-3"
				data-reveal="up"
				{@attach reveal(195)}
			>
				<span>
					<span class="block font-display text-lg font-semibold tracking-[0.16em] uppercase">{m.nav_quote()}</span>
					<span class="mt-1 block text-sm text-mist">{m.quote_cta_text()}</span>
				</span>
				<span class="grid size-11 shrink-0 place-items-center rounded-full bg-ember text-ink transition group-hover:rotate-45 rtl:group-hover:-rotate-45">
					<ArrowUpRight class="size-4 rtl:-scale-x-100" />
				</span>
			</a>

			<div
				class="overflow-hidden rounded-3xl border border-ink/10 bg-sand"
				data-reveal="clip"
				{@attach reveal(200)}
			>
				<iframe
					title={m.contact_map_title()}
					src={mapEmbedUrl(contact.mapQuery)}
					class="h-80 w-full grayscale-[0.4] transition duration-700 hover:grayscale-0"
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
				></iframe>
			</div>
		</div>

		<!-- Form, lifted over the hero's edge -->
		<div class="relative lg:col-span-7 lg:-mt-20">
			<div
				class="relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_50px_100px_-40px_rgba(6,12,24,0.35)] ring-1 ring-ink/5 sm:p-10 lg:p-12"
				data-reveal="up"
				{@attach reveal(100)}
			>
				<div class="pointer-events-none absolute -end-24 -top-24 size-64 rounded-full bg-ember/15 blur-3xl"></div>

				{#if sent}
					<div class="relative flex min-h-[32rem] flex-col items-center justify-center text-center">
						<span class="enter grid size-24 place-items-center rounded-full bg-ember/15 text-ember-deep">
							<CircleCheckBig class="size-12" strokeWidth={1.5} />
						</span>
						<h2
							class="enter mt-8 font-display text-4xl font-semibold text-ink uppercase"
							style:--enter-delay="0.1s"
						>
							{m.form_success_title()}
						</h2>
						<p class="enter mt-4 max-w-md text-lg text-stone" style:--enter-delay="0.2s">
							{m.form_success_text()}
						</p>
						<button
							type="button"
							class="enter mt-10 rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-white"
							style:--enter-delay="0.3s"
							onclick={() => message.set(undefined)}
						>
							{m.form_send_another()}
						</button>
					</div>
				{:else}
					<div class="relative">
						<h2 class="font-display text-4xl font-semibold text-ink uppercase">{m.form_title()}</h2>
						<p class="mt-2 text-stone">{m.form_subtitle()}</p>

						<form method="POST" {@attach fromAction(enhance)} class="mt-8 grid gap-x-4 gap-y-3 sm:grid-cols-2" novalidate>
							<InputComp {form} {errors} name="name" label={m.form_name()} required />
							<InputComp {form} {errors} name="company" label={m.form_company()} />
							<InputComp {form} {errors} name="email" type="email" label={m.form_email()} required />
							<InputComp {form} {errors} name="phone" type="tel" label={m.form_phone()} required />
							<div class="sm:col-span-2">
								<InputComp
									{form}
									{errors}
									name="service"
									type="select"
									label={m.form_service()}
									items={services}
								/>
							</div>
							<div class="sm:col-span-2">
								<InputComp
									{form}
									{errors}
									name="message"
									type="textarea"
									rows={6}
									label={m.form_message()}
									placeholder={m.form_message_placeholder()}
									required
								/>
							</div>

							<!-- Honeypot: off-screen, skipped by keyboards and screen readers. -->
							<div class="absolute -start-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
								<label>
									Website
									<input
										type="text"
										name="website"
										tabindex="-1"
										autocomplete="off"
										bind:value={$form.website}
									/>
								</label>
							</div>

							<div
								class="mt-4 flex flex-col-reverse gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"
							>
								<p class="flex items-center gap-2 text-sm text-stone">
									<ShieldCheck class="size-4 shrink-0 text-ember-deep" />
									{m.form_privacy()}
								</p>
								<button
									type="submit"
									disabled={$delayed}
									class="group inline-flex items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 font-semibold text-white transition hover:bg-ember hover:text-ink disabled:opacity-70"
								>
									{#if $delayed}
										<LoaderCircle class="size-5 animate-spin" />
										{m.form_sending()}
									{:else}
										{m.form_submit()}
										<Send
											class="size-4 transition group-hover:translate-x-1 group-hover:-translate-y-0.5 rtl:-scale-x-100"
										/>
									{/if}
								</button>
							</div>
						</form>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
