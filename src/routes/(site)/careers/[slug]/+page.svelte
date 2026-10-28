<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { fileProxy } from 'sveltekit-superforms';
	import { resolve } from '$app/paths';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import FileText from '@lucide/svelte/icons/file-text';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Send from '@lucide/svelte/icons/send';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import { m } from '$lib/paraglide/messages.js';
	import { l } from '$lib/site/links';
	import { closing, jobType } from '../jobText';
	import { applySchema } from './schema';

	let { data } = $props();

	const job = $derived(data.job);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, message } = createForm(data.form, applySchema);
	const cv = fileProxy(form, 'cv');
	const sent = $derived($message?.type === 'success');
</script>

<svelte:head>
	<title>{job.title} — {m.meta_careers_title()}</title>
	<meta name="description" content="{job.title} · {job.location} · {jobType(job.employmentType)}" />
	<meta property="og:title" content="{job.title} — EthioLink" />
</svelte:head>

<header class="grain relative isolate overflow-hidden bg-ink pt-44 pb-20 text-white md:pt-52">
	<div class="mx-auto max-w-5xl px-5 sm:px-8">
		<a
			href={resolve(l('/careers'))}
			class="enter inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
		>
			<ArrowLeft class="size-4 rtl:-scale-x-100" />
			{m.careers_back()}
		</a>
		<h1
			class="enter mt-10 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] font-bold uppercase"
			style:--enter-delay="0.1s"
		>
			{job.title}
		</h1>
		<p class="enter mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/70" style:--enter-delay="0.2s">
			<span class="inline-flex items-center gap-2"><MapPin class="size-4 text-ember" />{job.location}</span>
			<span class="inline-flex items-center gap-2"><Briefcase class="size-4 text-ember" />{jobType(job.employmentType)}</span>
			<span class="inline-flex items-center gap-2"><Clock class="size-4 text-ember" />{closing(job.closesOn)}</span>
		</p>
	</div>
</header>

<section class="bg-paper py-20 md:py-28">
	<div class="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
		<!-- Sanitised on save (allowlisted tags and links only). -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="rich-text lg:col-span-7">{@html job.description}</div>

		<div class="lg:col-span-5">
			<div
				id="apply"
				class="rounded-[2rem] bg-white p-7 shadow-[0_50px_100px_-40px_rgba(6,12,24,0.35)] ring-1 ring-ink/5 sm:p-9 lg:sticky lg:top-28"
			>
				{#if sent}
					<div class="flex flex-col items-center py-10 text-center">
						<span class="grid size-20 place-items-center rounded-full bg-ember/15 text-ember-deep">
							<CircleCheckBig class="size-10" strokeWidth={1.5} />
						</span>
						<h2 class="mt-6 font-display text-3xl font-semibold text-ink uppercase">{m.apply_success_title()}</h2>
						<p class="mt-3 text-stone">{m.apply_success_text()}</p>
					</div>
				{:else}
					<h2 class="font-display text-3xl font-semibold text-ink uppercase">{m.apply_title()}</h2>
					<form
						method="POST"
						enctype="multipart/form-data"
						{@attach fromAction(enhance)}
						class="relative mt-6 flex flex-col gap-1"
						novalidate
					>
						<InputComp {form} {errors} name="name" label={m.form_name()} required />
						<InputComp {form} {errors} name="email" type="email" label={m.form_email()} required />
						<InputComp {form} {errors} name="phone" type="tel" label={m.form_phone()} required />

						<p class="mt-2 text-sm font-medium text-ink">{m.apply_cv()} <span class="text-destructive">*</span></p>
						<label
							class="mt-1 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-ink/15 px-5 py-4 transition hover:border-ember has-[:focus-visible]:border-ember"
						>
							{#if $cv?.length}
								<FileText class="size-5 shrink-0 text-ember-deep" />
								<span class="truncate text-sm font-semibold text-ink">{$cv[0].name}</span>
							{:else}
								<Paperclip class="size-5 shrink-0 text-ember-deep" />
								<span class="text-sm text-stone">{m.apply_cv_hint()}</span>
							{/if}
							<input
								type="file"
								name="cv"
								accept="application/pdf"
								bind:files={$cv}
								class="sr-only"
								aria-invalid={$errors.cv ? 'true' : undefined}
							/>
						</label>
						{#if $errors.cv}<p class="text-sm text-destructive">{$errors.cv[0]}</p>{/if}

						<div class="mt-3">
							<InputComp
								{form}
								{errors}
								name="coverLetter"
								type="textarea"
								rows={5}
								label={m.apply_cover()}
								placeholder={m.apply_cover_placeholder()}
							/>
						</div>

						<div class="absolute -start-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
							<label>
								Website
								<input type="text" name="website" tabindex="-1" autocomplete="off" bind:value={$form.website} />
							</label>
						</div>

						<button
							type="submit"
							disabled={$delayed}
							class="group mt-4 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 font-semibold text-white transition hover:bg-ember hover:text-ink disabled:opacity-70"
						>
							{#if $delayed}
								<LoaderCircle class="size-5 animate-spin" />
								{m.form_sending()}
							{:else}
								{m.apply_submit()}
								<Send class="size-4 rtl:-scale-x-100" />
							{/if}
						</button>
						<p class="mt-3 flex items-center gap-2 text-xs text-stone">
							<ShieldCheck class="size-4 shrink-0 text-ember-deep" />
							{m.form_privacy()}
						</p>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>
