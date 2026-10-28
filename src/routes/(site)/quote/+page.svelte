<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { filesProxy } from 'sveltekit-superforms';
	import Ship from '@lucide/svelte/icons/ship';
	import Plane from '@lucide/svelte/icons/plane';
	import Truck from '@lucide/svelte/icons/truck';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import FileText from '@lucide/svelte/icons/file-text';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Send from '@lucide/svelte/icons/send';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import { setKitLabels } from '@nahu/admin-kit/labels';
	import { m } from '$lib/paraglide/messages.js';
	import portNetwork from '$lib/assets/images/port-network.jpg?enhanced';
	import { shownServices } from '$lib/site/services';
	import { reveal } from '$lib/site/motion';
	import { INCOTERMS } from '$lib/quoteStatus';
	import PageHero from '$lib/site/components/PageHero.svelte';
	import { DOCUMENT_TYPES, quoteSchema } from './schema';

	let { data } = $props();

	setKitLabels(() => ({
		select: () => m.form_choose(),
		searchFor: () => m.form_search(),
		noneFound: () => m.form_none_found()
	}));

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, message } = createForm(data.form, quoteSchema);
	const documents = filesProxy(form, 'documents');

	const services = $derived([
		{ value: 'general', name: m.form_service_general() },
		...shownServices(data.services).map((s) => ({ value: s.slug, name: s.title() }))
	]);
	const modes = $derived([
		{ value: 'sea', label: m.hero_route_sea(), icon: Ship },
		{ value: 'air', label: m.hero_route_air(), icon: Plane },
		{ value: 'land', label: m.hero_route_land(), icon: Truck },
		{ value: 'any', label: m.quote_mode_any(), icon: Sparkles }
	] as const);
	const incoterms = $derived([
		{ value: '', name: m.quote_incoterm_unsure() },
		...INCOTERMS.map((t) => ({ value: t, name: t }))
	]);
	const sent = $derived($message?.type === 'success');
	const documentError = $derived(
		($errors.documents as { _errors?: string[] } | undefined)?._errors?.[0] ??
			Object.values(($errors.documents ?? {}) as Record<string, string[]>)
				.flat()
				.find((e) => typeof e === 'string')
	);
</script>

<svelte:head>
	<title>{m.meta_quote_title()}</title>
	<meta name="description" content={m.meta_quote_desc()} />
	<meta property="og:title" content={m.meta_quote_title()} />
	<meta property="og:description" content={m.meta_quote_desc()} />
</svelte:head>

<PageHero
	eyebrow={m.quote_eyebrow()}
	title={m.quote_title()}
	text={m.quote_intro()}
	image={portNetwork}
	current={m.nav_quote()}
/>

<section class="relative bg-paper pb-28 md:pb-36">
	<div class="mx-auto max-w-5xl px-5 sm:px-8">
		<div
			class="relative -mt-16 overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_50px_100px_-40px_rgba(6,12,24,0.35)] ring-1 ring-ink/5 sm:p-10 lg:p-14"
			data-reveal="up"
			{@attach reveal(100)}
		>
			<div class="pointer-events-none absolute -end-24 -top-24 size-64 rounded-full bg-ember/15 blur-3xl"></div>

			{#if sent}
				<div class="relative flex min-h-[28rem] flex-col items-center justify-center text-center">
					<span class="enter grid size-24 place-items-center rounded-full bg-ember/15 text-ember-deep">
						<CircleCheckBig class="size-12" strokeWidth={1.5} />
					</span>
					<h2 class="enter mt-8 font-display text-4xl font-semibold text-ink uppercase" style:--enter-delay="0.1s">
						{m.quote_success_title()}
					</h2>
					<p class="enter mt-4 max-w-lg text-lg text-stone" style:--enter-delay="0.2s">
						{m.quote_success_text({ reference: $message?.text ?? '' })}
					</p>
					<button
						type="button"
						class="enter mt-10 rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink transition hover:bg-ink hover:text-white"
						style:--enter-delay="0.3s"
						onclick={() => message.set(undefined)}
					>
						{m.quote_another()}
					</button>
				</div>
			{:else}
				<form
					method="POST"
					enctype="multipart/form-data"
					{@attach fromAction(enhance)}
					class="relative flex flex-col gap-12"
					novalidate
				>
					<fieldset class="grid gap-x-4 gap-y-3 sm:grid-cols-2">
						<legend class="mb-4 font-display text-2xl font-semibold text-ink uppercase">
							<span class="me-2 text-ember-deep">01</span>{m.quote_section_route()}
						</legend>
						<div class="sm:col-span-2">
							<p class="mb-2 text-sm font-medium text-ink">{m.quote_mode()}</p>
							<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{#each modes as mode (mode.value)}
									{@const Icon = mode.icon}
									<label
										class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-ink/15 px-4 py-3.5 text-sm font-semibold text-ink transition hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember"
									>
										<input type="radio" name="mode" value={mode.value} bind:group={$form.mode} class="sr-only" />
										<Icon class="size-4" />
										{mode.label}
									</label>
								{/each}
							</div>
						</div>
						<InputComp
							{form}
							{errors}
							name="origin"
							label={m.quote_origin()}
							placeholder={m.quote_origin_placeholder()}
							required
						/>
						<InputComp
							{form}
							{errors}
							name="destination"
							label={m.quote_destination()}
							placeholder={m.quote_destination_placeholder()}
							required
						/>
						<div class="sm:col-span-2">
							<InputComp {form} {errors} name="service" type="select" label={m.form_service()} items={services} />
						</div>
					</fieldset>

					<fieldset class="grid gap-x-4 gap-y-3 sm:grid-cols-2">
						<legend class="mb-4 font-display text-2xl font-semibold text-ink uppercase">
							<span class="me-2 text-ember-deep">02</span>{m.quote_section_cargo()}
						</legend>
						<div class="sm:col-span-2">
							<InputComp
								{form}
								{errors}
								name="cargo"
								type="textarea"
								rows={4}
								label={m.quote_cargo()}
								placeholder={m.quote_cargo_placeholder()}
								required
							/>
						</div>
						<InputComp {form} {errors} name="weightKg" type="number" min="0" step="any" label={m.quote_weight()} />
						<InputComp {form} {errors} name="volumeCbm" type="number" min="0" step="any" label={m.quote_volume()} />
						<InputComp {form} {errors} name="incoterm" type="select" label={m.quote_incoterm()} items={incoterms} />
						<label class="flex flex-col gap-2 text-sm font-medium text-ink">
							{m.quote_ready()}
							<input
								type="date"
								name="readyDate"
								bind:value={$form.readyDate}
								class="h-10 rounded-md border border-input bg-background px-3 text-base text-ink shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
							/>
						</label>
						<div class="sm:col-span-2">
							<p class="text-sm font-medium text-ink">{m.quote_documents()}</p>
							<label
								class="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 px-6 py-8 text-center transition hover:border-ember has-[:focus-visible]:border-ember"
							>
								<Paperclip class="size-6 text-ember-deep" />
								<span class="font-semibold text-ink">{m.quote_choose_files()}</span>
								<span class="max-w-md text-sm text-stone">{m.quote_documents_hint()}</span>
								<input
									type="file"
									name="documents"
									multiple
									accept={DOCUMENT_TYPES.join(',')}
									bind:files={$documents}
									class="sr-only"
									aria-describedby={documentError ? 'documents-error' : undefined}
								/>
							</label>
							{#if $documents?.length}
								<ul class="mt-3 flex flex-wrap gap-2">
									{#each Array.from($documents) as file (file.name + file.size)}
										<li class="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-sm text-ink">
											<FileText class="size-4 text-ember-deep" />
											{file.name}
										</li>
									{/each}
								</ul>
							{/if}
							{#if documentError}
								<p id="documents-error" class="mt-2 text-sm text-destructive">{documentError}</p>
							{/if}
						</div>
					</fieldset>

					<fieldset class="grid gap-x-4 gap-y-3 sm:grid-cols-2">
						<legend class="mb-4 font-display text-2xl font-semibold text-ink uppercase">
							<span class="me-2 text-ember-deep">03</span>{m.quote_section_contact()}
						</legend>
						<InputComp {form} {errors} name="name" label={m.form_name()} required />
						<InputComp {form} {errors} name="company" label={m.form_company()} />
						<InputComp {form} {errors} name="email" type="email" label={m.form_email()} required />
						<InputComp {form} {errors} name="phone" type="tel" label={m.form_phone()} required />
					</fieldset>

					<!-- Honeypot: off-screen, skipped by keyboards and screen readers. -->
					<div class="absolute -start-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
						<label>
							Website
							<input type="text" name="website" tabindex="-1" autocomplete="off" bind:value={$form.website} />
						</label>
					</div>

					<div class="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
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
								{m.quote_submit()}
								<Send class="size-4 transition group-hover:translate-x-1 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>
