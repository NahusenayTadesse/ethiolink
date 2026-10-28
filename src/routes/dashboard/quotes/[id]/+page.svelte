<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import FileText from '@lucide/svelte/icons/file-text';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Save from '@lucide/svelte/icons/save';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import SingleTable from '@nahu/admin-kit/components/SingleTable.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { fileUrl } from '@nahu/admin-kit/files';
	import { resolve } from '$app/paths';
	import { MODE_LABELS, QUOTE_LABELS, QUOTE_STATUSES, quoteNumber } from '$lib/quoteStatus';
	import { serviceLabel } from '$lib/site/services';
	import { LOCALE_NAMES } from '$lib/site/links';
	import ReplyCard from '$lib/dashboard/ReplyCard.svelte';
	import { CURRENCIES, quoteUpdateSchema } from './schema';

	let { data } = $props();

	const quote = $derived(data.quote);
	const number = $derived(quoteNumber(quote.id));
	const digits = $derived(quote.phone.replace(/\D/g, ''));
	const language = $derived(
		LOCALE_NAMES[quote.locale as keyof typeof LOCALE_NAMES] ?? quote.locale
	);
	const amount = (value: string | null, unit: string) =>
		value === null ? '—' : `${Number(value).toLocaleString('en-US')} ${unit}`;

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(data.updateForm, quoteUpdateSchema, {
		resetForm: false
	});
</script>

<div class="flex max-w-4xl flex-col gap-4">
	<a href={resolve('/dashboard/quotes')} class="text-sm text-muted-foreground hover:text-foreground"
		>← All quote requests</a
	>

	<PageHeader
		title="{number} · {quote.name}"
		tabTitle="{number} | EthioLink"
		description="Received {ethiopianDateTime(
			quote.createdAt
		)} · written in {language}{data.updatedByName
			? ` · last handled by ${data.updatedByName}`
			: ''}"
	>
		{#snippet badges()}
			<Statuses status={quote.status} label={QUOTE_LABELS[quote.status]} />
		{/snippet}
		{#snippet actions()}
			<ConfirmAction
				action="?/delete"
				label="Delete"
				title="Delete {number}?"
				description="The request, its documents and its replies are removed for good."
				icon={Trash2}
				variant="destructive"
			/>
		{/snippet}
	</PageHeader>

	<Card.Root>
		<Card.Header><Card.Title>Shipment</Card.Title></Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<SingleTable
				singleTable={[
					{ name: 'Service', value: serviceLabel(quote.service) },
					{ name: 'Mode', value: MODE_LABELS[quote.mode] },
					{ name: 'From', value: quote.origin },
					{ name: 'To', value: quote.destination },
					{ name: 'Weight', value: amount(quote.weightKg, 'kg') },
					{ name: 'Volume', value: amount(quote.volumeCbm, 'm³') },
					{ name: 'Incoterm', value: quote.incoterm ?? 'Not sure' },
					{ name: 'Ready by', value: quote.readyDate ?? '—' }
				]}
			/>
			<div>
				<p class="text-sm font-medium text-muted-foreground">Cargo</p>
				<p class="mt-1 leading-relaxed whitespace-pre-line">{quote.cargo}</p>
			</div>
			{#if quote.documents.length}
				<div>
					<p class="text-sm font-medium text-muted-foreground">Documents</p>
					<ul class="mt-2 flex flex-wrap gap-2">
						{#each quote.documents as name, i (name)}
							<li>
								<Button href={fileUrl(name)} target="_blank" variant="outline" size="sm">
									<FileText /> Document {i + 1}
								</Button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title>Customer</Card.Title></Card.Header>
		<Card.Content>
			<SingleTable
				singleTable={[
					{ name: 'Name', value: quote.name },
					{ name: 'Company', value: quote.company || '—' },
					{ name: 'Email', value: quote.email, href: `mailto:${quote.email}` },
					{ name: 'Phone', value: quote.phone, kind: 'phone' },
					{ name: 'Language', value: language }
				]}
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Pipeline</Card.Title>
			<Card.Description
				>Only staff see this. The price feeds the dashboard's totals.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/update"
				{@attach fromAction(enhance)}
				class="flex flex-col gap-1"
			>
				<InputComp
					{form}
					{errors}
					name="status"
					type="radio"
					label="Status"
					items={QUOTE_STATUSES.map((s) => ({ value: s, name: QUOTE_LABELS[s] }))}
				/>
				<div class="grid gap-x-4 sm:grid-cols-[1fr_8rem]">
					<InputComp
						{form}
						{errors}
						name="amount"
						type="number"
						min="0"
						step="0.01"
						label="Price quoted"
					/>
					<InputComp
						{form}
						{errors}
						name="currency"
						type="select"
						label="Currency"
						items={CURRENCIES.map((c) => ({ value: c, name: c }))}
					/>
				</div>
				<InputComp
					{form}
					{errors}
					name="notes"
					type="textarea"
					rows={4}
					label="Notes"
					description="What was agreed, what is pending, or why it was lost."
				/>
				<Button type="submit" class="self-end" disabled={$delayed}>
					{#if $delayed}<LoadingBtn name="Saving" />{:else}<Save /> Save{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<ReplyCard reply={data.reply} to={quote.email} {language}>
		{#snippet contact()}
			<Button href="tel:{quote.phone}" variant="outline" size="sm"><Phone />{quote.phone}</Button>
			<Button
				href="https://wa.me/{digits}"
				target="_blank"
				rel="noopener noreferrer"
				variant="outline"
				size="sm"><MessageCircle />WhatsApp</Button
			>
			<Button href="mailto:{quote.email}" variant="outline" size="sm"><Mail />Own mail app</Button>
		{/snippet}
	</ReplyCard>
</div>
