<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Save from '@lucide/svelte/icons/save';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import Errors from '@nahu/admin-kit/formComponents/Errors.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import TranslatedFields from '$lib/dashboard/TranslatedFields.svelte';
	import { settingsSchema } from './schema';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, allErrors } = createForm(data.form, settingsSchema, {
		resetForm: false
	});
</script>

<form method="POST" {@attach fromAction(enhance)} class="flex max-w-4xl flex-col gap-4">
	<PageHeader
		title="Company info"
		tabTitle="Company info | EthioLink"
		description="How customers reach the office. Shown in the footer and on the contact page, and at the end of every email the website sends. Leave a field empty to hide it."
	>
		{#snippet actions()}
			<Button href={resolve('/contact')} target="_blank" variant="outline" size="sm">
				<ExternalLink /> See the contact page
			</Button>
		{/snippet}
	</PageHeader>

	<Errors allErrors={$allErrors} />

	<Card.Root>
		<Card.Header>
			<Card.Title>Phone and email</Card.Title>
			<Card.Description>Visitors can tap these to call, write or open a chat.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-x-4 sm:grid-cols-2">
			<InputComp
				{form}
				{errors}
				name="email"
				type="email"
				label="Email"
				placeholder="info@ethiolink.net"
			/>
			<InputComp {form} {errors} name="phone" type="tel" label="Phone" placeholder="+251 11 …" />
			<InputComp
				{form}
				{errors}
				name="whatsapp"
				type="tel"
				label="WhatsApp number"
				description="With the country code. Adds a WhatsApp button."
			/>
			<InputComp
				{form}
				{errors}
				name="telegram"
				label="Telegram username"
				placeholder="ethiolink"
				description="Without the @. Adds a Telegram button."
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Office and hours</Card.Title>
			<Card.Description
				>Written in each site language; empty translations show the English.</Card.Description
			>
		</Card.Header>
		<Card.Content class="flex flex-col gap-2">
			<TranslatedFields
				{form}
				{errors}
				values={$form}
				fields={[
					{ name: 'address', label: 'Address' },
					{ name: 'hoursWeekdays', label: 'Weekday hours', optional: true },
					{ name: 'hoursSaturday', label: 'Saturday hours', optional: true }
				]}
			/>
			<InputComp
				{form}
				{errors}
				name="mapQuery"
				label="Map search"
				description="What the map on the contact page looks up, as you would type it into Google Maps."
				required
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Social media</Card.Title>
			<Card.Description
				>Full links to the company pages. Each one adds an icon to the footer.</Card.Description
			>
		</Card.Header>
		<Card.Content class="grid gap-x-4 sm:grid-cols-2">
			<InputComp
				{form}
				{errors}
				name="linkedin"
				type="url"
				label="LinkedIn"
				placeholder="https://linkedin.com/company/…"
			/>
			<InputComp
				{form}
				{errors}
				name="facebook"
				type="url"
				label="Facebook"
				placeholder="https://facebook.com/…"
			/>
			<InputComp
				{form}
				{errors}
				name="instagram"
				type="url"
				label="Instagram"
				placeholder="https://instagram.com/…"
			/>
			<InputComp
				{form}
				{errors}
				name="tiktok"
				type="url"
				label="TikTok"
				placeholder="https://tiktok.com/@…"
			/>
		</Card.Content>
	</Card.Root>

	<Button type="submit" class="self-end" disabled={$delayed}>
		{#if $delayed}<LoadingBtn name="Saving" />{:else}<Save /> Save{/if}
	</Button>
</form>
