<script lang="ts">
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import ActionForm from '@nahu/admin-kit/formComponents/ActionForm.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import SingleTable from '@nahu/admin-kit/components/SingleTable.svelte';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { resolve } from '$app/paths';
	import { MESSAGE_LABELS, MESSAGE_STATUSES } from '$lib/messageStatus';
	import { serviceLabel } from '$lib/site/services';
	import { LOCALE_NAMES } from '$lib/site/links';
	import ReplyCard from '$lib/dashboard/ReplyCard.svelte';

	let { data, form } = $props();

	const note = $derived(data.message);
	const digits = $derived(note.phone.replace(/\D/g, ''));
	const language = $derived(LOCALE_NAMES[note.locale as keyof typeof LOCALE_NAMES] ?? note.locale);
	const subject = $derived(encodeURIComponent(`Re: your message to EthioLink`));
</script>

<div class="flex max-w-4xl flex-col gap-4">
	<a
		href={resolve('/dashboard/messages')}
		class="text-sm text-muted-foreground hover:text-foreground">← All messages</a
	>

	<PageHeader
		title={note.name}
		tabTitle="Message from {note.name} | EthioLink"
		description="Received {ethiopianDateTime(
			note.createdAt
		)} · written in {language}{data.repliedByName ? ` · replied by ${data.repliedByName}` : ''}"
	>
		{#snippet badges()}
			<Statuses status={note.status} label={MESSAGE_LABELS[note.status]} />
		{/snippet}
		{#snippet actions()}
			<ConfirmAction
				action="?/delete"
				label="Delete"
				title="Delete this message?"
				description="It is removed for good."
				icon={Trash2}
				variant="destructive"
			/>
		{/snippet}
	</PageHeader>

	{#if form?.error}<p class="text-sm text-destructive" role="alert">{form.error}</p>{/if}

	<Card.Root>
		<Card.Header><Card.Title>Their message</Card.Title></Card.Header>
		<Card.Content>
			<p class="leading-relaxed whitespace-pre-line">{note.message}</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title>Details</Card.Title></Card.Header>
		<Card.Content>
			<SingleTable
				singleTable={[
					{ name: 'Name', value: note.name },
					{ name: 'Company', value: note.company || '—' },
					{ name: 'Email', value: note.email, href: `mailto:${note.email}` },
					{ name: 'Phone', value: note.phone, kind: 'phone' },
					{ name: 'Service', value: serviceLabel(note.service) },
					{ name: 'Language', value: language }
				]}
			/>
		</Card.Content>
	</Card.Root>

	<ReplyCard reply={data.reply} to={note.email} {language}>
		{#snippet contact()}
			<Button href="tel:{note.phone}" variant="outline" size="sm"><Phone />{note.phone}</Button>
			<Button
				href="https://wa.me/{digits}"
				target="_blank"
				rel="noopener noreferrer"
				variant="outline"
				size="sm"><MessageCircle />WhatsApp</Button
			>
			<Button href="mailto:{note.email}?subject={subject}" variant="outline" size="sm"
				><Mail />Own mail app</Button
			>
		{/snippet}
	</ReplyCard>

	<ActionForm action="?/status" class="flex flex-wrap items-center gap-2">
		<span class="text-sm text-muted-foreground">Mark as</span>
		{#each MESSAGE_STATUSES as status (status)}
			<Button
				type="submit"
				name="to"
				value={status}
				variant={note.status === status ? 'default' : 'outline'}
				size="sm">{MESSAGE_LABELS[status]}</Button
			>
		{/each}
		<span class="text-xs text-muted-foreground"
			>— sending a reply above marks it replied by itself.</span
		>
	</ActionForm>
</div>
