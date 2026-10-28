<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import PageSection from '@nahu/admin-kit/components/PageSection.svelte';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import Empty from '@nahu/admin-kit/components/Empty.svelte';
	import DataTable from '@nahu/admin-kit/components/Table/data-table.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import Errors from '@nahu/admin-kit/formComponents/Errors.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { EMPLOYMENT_LABELS, EMPLOYMENT_TYPES } from '$lib/careers';
	import RichTranslated from '$lib/dashboard/RichTranslated.svelte';
	import { applicationColumns } from '../applicationColumns';
	import { jobSchema } from '../schema';

	let { data } = $props();

	const job = $derived(data.job);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, allErrors } = createForm(data.form, jobSchema, {
		resetForm: false
	});
</script>

<div class="flex max-w-5xl flex-col gap-6">
	<form method="POST" action="?/save" {@attach fromAction(enhance)} class="flex flex-col gap-4">
		<a
			href={resolve('/dashboard/careers')}
			class="text-sm text-muted-foreground hover:text-foreground">← Careers</a
		>

		<PageHeader
			title={job?.titleEn ?? 'New opening'}
			tabTitle="{job ? job.titleEn : 'New opening'} | EthioLink"
			description="Shown on the Careers page while “Open for applications” is ticked and before its closing day."
		>
			{#snippet actions()}
				{#if job?.active}
					<Button
						href={resolve('/(site)/careers/[slug]', { slug: job.slug })}
						target="_blank"
						variant="outline"
						size="sm"><ExternalLink /> View on the site</Button
					>
				{/if}
				{#if job}
					<ConfirmAction
						action="?/delete"
						label="Delete"
						title="Delete this opening?"
						description="It and every application for it are removed for good. To stop taking applications, untick “Open for applications” instead."
						icon={Trash2}
						variant="destructive"
					/>
				{/if}
			{/snippet}
		</PageHeader>

		<Errors allErrors={$allErrors} />

		<Card.Root>
			<Card.Content class="pt-6">
				<RichTranslated
					{form}
					{errors}
					lines={[{ name: 'title', label: 'Job title' }]}
					rich={{
						name: 'description',
						label: 'Description',
						placeholder: 'What the job is, what it needs, what it offers…'
					}}
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Details</Card.Title></Card.Header>
			<Card.Content class="grid gap-x-4 md:grid-cols-2">
				<InputComp {form} {errors} name="location" label="Location" required />
				<InputComp
					{form}
					{errors}
					name="employmentType"
					type="select"
					label="Type"
					items={EMPLOYMENT_TYPES.map((t) => ({ value: t, name: EMPLOYMENT_LABELS[t] }))}
				/>
				<InputComp
					{form}
					{errors}
					name="closesOn"
					type="date"
					label="Closing day"
					futureDays
					allowEmpty
					description="The last day it takes applications. Empty: until you close it."
				/>
				<InputComp
					{form}
					{errors}
					name="slug"
					label="Link"
					description="The end of /careers/…; made from the English title if left empty."
				/>
				<InputComp
					{form}
					{errors}
					name="active"
					type="checkboxSingle"
					placeholder="Open for applications"
				/>
			</Card.Content>
		</Card.Root>

		<Button type="submit" class="self-end" disabled={$delayed}>
			{#if $delayed}<LoadingBtn name="Saving" />{:else}<Save /> Save{/if}
		</Button>
	</form>

	{#if job}
		<PageSection title="Applicants">
			{#if data.applications.length}
				{#key data.applications}
					<DataTable
						columns={applicationColumns}
						data={data.applications}
						variant="compact"
						fileName="Applicants"
					/>
				{/key}
			{:else}
				<Empty message="No one has applied yet." />
			{/if}
		</PageSection>
	{/if}
</div>
