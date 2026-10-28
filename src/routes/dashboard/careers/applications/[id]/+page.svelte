<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
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
	import { APPLICATION_LABELS, APPLICATION_STATUSES } from '$lib/careers';
	import { LOCALE_NAMES } from '$lib/site/links';
	import ReplyCard from '$lib/dashboard/ReplyCard.svelte';
	import { applicationUpdateSchema } from './schema';

	let { data } = $props();

	const a = $derived(data.application);
	const language = $derived(LOCALE_NAMES[a.locale as keyof typeof LOCALE_NAMES] ?? a.locale);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(data.form, applicationUpdateSchema, {
		resetForm: false
	});
</script>

<div class="flex max-w-4xl flex-col gap-4">
	<a
		href={resolve('/dashboard/careers/[id]', { id: String(data.job.id) })}
		class="text-sm text-muted-foreground hover:text-foreground">← {data.job.title}</a
	>

	<PageHeader
		title={a.name}
		tabTitle="{a.name} — application | EthioLink"
		description="Applied for {data.job.title} on {ethiopianDateTime(
			a.createdAt
		)} · wrote in {language}"
	>
		{#snippet badges()}
			<Statuses status={a.status} label={APPLICATION_LABELS[a.status]} />
		{/snippet}
		{#snippet actions()}
			<Button href={fileUrl(a.cv)} target="_blank" size="sm"><FileText /> Open CV</Button>
			<ConfirmAction
				action="?/delete"
				label="Delete"
				title="Delete this application?"
				description="The application and the CV are removed for good."
				icon={Trash2}
				variant="destructive"
			/>
		{/snippet}
	</PageHeader>

	<Card.Root>
		<Card.Header><Card.Title>Applicant</Card.Title></Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<SingleTable
				singleTable={[
					{ name: 'Name', value: a.name },
					{ name: 'Email', value: a.email, href: `mailto:${a.email}` },
					{ name: 'Phone', value: a.phone, kind: 'phone' },
					{ name: 'Language', value: language }
				]}
			/>
			{#if a.coverLetter}
				<div>
					<p class="text-sm font-medium text-muted-foreground">Cover letter</p>
					<p class="mt-1 leading-relaxed whitespace-pre-line">{a.coverLetter}</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Where it stands</Card.Title>
			<Card.Description>Only staff see this.</Card.Description>
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
					items={APPLICATION_STATUSES.map((s) => ({ value: s, name: APPLICATION_LABELS[s] }))}
				/>
				<InputComp {form} {errors} name="notes" type="textarea" rows={4} label="Notes" />
				<Button type="submit" class="self-end" disabled={$delayed}>
					{#if $delayed}<LoadingBtn name="Saving" />{:else}<Save /> Save{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<ReplyCard reply={data.reply} to={a.email} {language}>
		{#snippet contact()}
			<Button href="tel:{a.phone}" variant="outline" size="sm"><Phone />{a.phone}</Button>
			<Button href="mailto:{a.email}" variant="outline" size="sm"><Mail />Own mail app</Button>
		{/snippet}
	</ReplyCard>
</div>
