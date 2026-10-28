<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Send from '@lucide/svelte/icons/send';
	import Eye from '@lucide/svelte/icons/eye';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import RichEditor from '@nahu/admin-kit/formComponents/RichEditor.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import * as Dialog from '@nahu/admin-kit/components/ui/dialog/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { resolve } from '$app/paths';
	import { LANGUAGES } from '$lib/translated';
	import { MAX_RECIPIENTS, composeSchema } from './schema';

	let { data } = $props();

	// The editor owns its text once mounted, so clearing the form after a send means a new editor.
	let sends = $state(0);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(data.form, composeSchema, {
		resetForm: false,
		onUpdated({ form }) {
			if (form.message?.type === 'success') sends++;
		}
	});

	let previewOpen = $state(false);
	let previewHtml = $state('');
	let previewing = $state(false);

	async function preview() {
		previewing = true;
		try {
			const response = await fetch(resolve('/dashboard/email/preview'), {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ subject: $form.subject, body: $form.body, locale: $form.locale })
			});
			previewHtml = response.ok ? await response.text() : '<p>The preview could not be made.</p>';
			previewOpen = true;
		} finally {
			previewing = false;
		}
	}
</script>

<div class="flex max-w-5xl flex-col gap-4">
	<PageHeader
		title="Send email"
		tabTitle="Send email | EthioLink"
		description="A new email in the company's design, sent from {data.from ??
			'the company mailbox'} and signed with your name."
	/>

	{#if !data.mailReady}
		<p class="flex items-start gap-2 rounded-lg border border-warning p-3 text-sm">
			<TriangleAlert class="mt-0.5 size-4 shrink-0" />
			Email is not set up on the server yet (the SMTP settings), so nothing can be sent from here.
		</p>
	{/if}

	<form method="POST" action="?/send" {@attach fromAction(enhance)}>
		<Card.Root>
			<Card.Content class="flex flex-col gap-1">
				<InputComp
					{form}
					{errors}
					name="to"
					label="To"
					placeholder="name@company.com"
					description="Separate several addresses with commas, up to {MAX_RECIPIENTS}. Each person gets their own copy and can't see the others."
					required
				/>
				<div class="grid gap-x-4 sm:grid-cols-[1fr_12rem]">
					<InputComp {form} {errors} name="subject" label="Subject" required />
					<InputComp
						{form}
						{errors}
						name="locale"
						type="select"
						label="Language"
						items={LANGUAGES.map((l) => ({ value: l.locale, name: l.name }))}
					/>
				</div>
				<div dir={$form.locale === 'ar' ? 'rtl' : 'ltr'}>
					{#key sends}
						<RichEditor
							bind:value={$form.body}
							name="body"
							label="Message"
							description="Write as you would a letter: the greeting is yours. Your name, the company and the office's details are added below it."
							placeholder="Dear …"
							error={$errors.body?.[0]}
							minHeight="18rem"
						/>
					{/key}
				</div>
				<p class="text-xs text-muted-foreground">
					The language sets the sign-off, the office details and, for Arabic, right-to-left layout.
					Replies come back to {data.replyTo ?? 'your email'}.
				</p>
			</Card.Content>
			<Card.Footer class="flex flex-wrap justify-end gap-2">
				<Button type="button" variant="outline" onclick={preview} disabled={previewing}>
					{#if previewing}<LoaderCircle class="animate-spin" />{:else}<Eye />{/if} Preview
				</Button>
				<Button type="submit" disabled={$delayed || !data.mailReady}>
					{#if $delayed}<LoadingBtn name="Sending" />{:else}<Send /> Send email{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	<Card.Root>
		<Card.Header>
			<Card.Title>Sent from here</Card.Title>
			<Card.Description
				>The last 50, newest first. Replies to messages, quotes and applications stay on those
				pages.</Card.Description
			>
		</Card.Header>
		<Card.Content class="flex flex-col gap-2">
			{#each data.sent as email (email.id)}
				<details class="group rounded-lg border bg-muted/30">
					<summary class="flex cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 p-3 text-sm">
						<span class="font-semibold">{email.subject}</span>
						<span class="text-muted-foreground">to {email.to.join(', ')}</span>
						<span class="ms-auto text-xs text-muted-foreground">
							{email.sentBy ?? 'A former staff member'} · {ethiopianDateTime(email.sentAt)}
						</span>
					</summary>
					<!-- Sanitised when it was sent (see compose.server.ts). -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<div class="rich-text border-t px-4 py-3 text-sm">{@html email.body}</div>
				</details>
			{:else}
				<p class="text-sm text-muted-foreground">Nothing sent from here yet.</p>
			{/each}
		</Card.Content>
	</Card.Root>
</div>

<Dialog.Root bind:open={previewOpen}>
	<Dialog.Content class="flex max-h-[92vh] flex-col gap-3 sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>{$form.subject || 'No subject yet'}</Dialog.Title>
			<Dialog.Description>
				How the email will look. Mail apps differ a little: some don't load the brand fonts.
			</Dialog.Description>
		</Dialog.Header>
		<iframe
			title="Email preview"
			srcdoc={previewHtml}
			sandbox=""
			class="h-[70vh] w-full rounded-md border bg-white"
		></iframe>
	</Dialog.Content>
</Dialog.Root>
