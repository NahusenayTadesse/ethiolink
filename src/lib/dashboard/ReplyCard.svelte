<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Send from '@lucide/svelte/icons/send';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { replySchema } from './reply';

	/**
	 * Answer a message, quote or application by email without leaving the dashboard. The email goes
	 * from the company mailbox, signed with the writer's name, and a copy stays here so whoever
	 * opens the record next sees what was said. `contact` holds the call/WhatsApp buttons.
	 */
	let {
		reply,
		to,
		language,
		contact
	}: {
		reply: {
			form: SuperValidated<{ subject: string; body: string }>;
			history: {
				id: number;
				subject: string;
				body: string;
				toEmail: string;
				sentAt: Date;
				sentBy: string | null;
			}[];
			mailReady: boolean;
		};
		to: string;
		/** The language they wrote in, so the writer knows which to answer in. */
		language: string;
		contact?: Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(reply.form, replySchema, {
		resetForm: false
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Reply</Card.Title>
		<Card.Description>To {to}. They wrote in {language}.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-5">
		{#if contact}<div class="flex flex-wrap gap-2">{@render contact()}</div>{/if}

		{#each reply.history as sent (sent.id)}
			<article class="rounded-lg border bg-muted/40 p-4 text-sm">
				<p class="text-xs text-muted-foreground">
					{ethiopianDateTime(sent.sentAt)} · {sent.sentBy ?? 'A former staff member'} → {sent.toEmail}
				</p>
				<p class="mt-1 font-semibold">{sent.subject}</p>
				<p class="mt-2 leading-relaxed whitespace-pre-line">{sent.body}</p>
			</article>
		{/each}

		{#if reply.mailReady}
			<form method="POST" action="?/reply" {@attach fromAction(enhance)} class="flex flex-col gap-1">
				<InputComp {form} {errors} name="subject" label="Subject" required />
				<InputComp
					{form}
					{errors}
					name="body"
					type="textarea"
					rows={8}
					label="Your reply"
					description="Sent from the company mailbox and signed with your name and the office details. Their replies come back to your email."
					required
				/>
				<Button type="submit" class="self-end" disabled={$delayed}>
					{#if $delayed}<LoadingBtn name="Sending" />{:else}<Send /> Send reply{/if}
				</Button>
			</form>
		{:else}
			<p class="flex items-start gap-2 rounded-lg border border-warning p-3 text-sm">
				<TriangleAlert class="mt-0.5 size-4 shrink-0" />
				Email is not set up on the server yet, so replies can't be sent from here. Use the buttons above
				in the meantime.
			</p>
		{/if}
	</Card.Content>
</Card.Root>
