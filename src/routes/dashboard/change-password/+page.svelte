<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import Notice from '@nahu/admin-kit/components/Notice.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { changePasswordSchema } from './schema';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(data.form, changePasswordSchema);
</script>

<div class="flex max-w-xl flex-col gap-4">
	<PageHeader
		title="Change password"
		tabTitle="Change password | EthioLink"
		description="Your other devices are signed out when it changes."
	/>

	{#if data.required}
		<Notice tone="warning" icon={KeyRound} title="Choose your own password first.">
			An administrator set the one you signed in with. The rest of the dashboard opens once you've
			chosen your own.
		</Notice>
	{/if}

	<form method="POST" {@attach fromAction(enhance)}>
		<Card.Root>
			<Card.Content class="flex flex-col gap-1">
				<InputComp
					{form}
					{errors}
					name="current"
					type="password"
					label={data.required ? 'The password you signed in with' : 'Current password'}
					required
				/>
				<InputComp
					{form}
					{errors}
					name="password"
					type="password"
					label="New password"
					description="At least 10 characters. A short sentence is easier to remember than a jumble."
					required
				/>
				<InputComp
					{form}
					{errors}
					name="confirm"
					type="password"
					label="New password again"
					required
				/>
			</Card.Content>
			<Card.Footer class="justify-end">
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}<LoadingBtn name="Saving" />{:else}Change password{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
