<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Save from '@lucide/svelte/icons/save';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import UserX from '@lucide/svelte/icons/user-x';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Credentials from '../Credentials.svelte';
	import { userSchema } from '../schema';

	let { data } = $props();

	const person = $derived(data.person);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(data.form, userSchema, {
		resetForm: false
	});
</script>

<div class="flex max-w-3xl flex-col gap-4">
	<a
		href={resolve('/dashboard/admin/users')}
		class="text-sm text-muted-foreground hover:text-foreground">← All users</a
	>

	<PageHeader
		title={person.name}
		tabTitle="{person.name} | EthioLink"
		description="{person.role ?? 'No role'} · last signed in {person.lastSignIn
			? ethiopianDateTime(person.lastSignIn)
			: 'never'}"
	>
		{#snippet badges()}
			<Statuses
				status={!person.isActive ? 'inactive' : person.mustChangePassword ? 'pending' : 'active'}
				label={!person.isActive
					? 'Switched off'
					: person.mustChangePassword
						? 'Must set password'
						: 'Active'}
			/>
		{/snippet}
		{#snippet actions()}
			<ConfirmAction
				action="?/reset"
				label="Reset password"
				title="Give {person.name} a new password?"
				description="Their current password stops working and they are signed out everywhere. You'll see a temporary password to hand over; they choose their own at the next sign-in."
				icon={KeyRound}
				variant="outline"
			/>
			{#if person.isActive}
				<ConfirmAction
					action="?/deactivate"
					label="Switch off"
					title="Switch off {person.name}'s account?"
					description="They are signed out everywhere and can't sign in until it is switched back on. Everything they did stays, with their name on it."
					icon={UserX}
					variant="destructive"
					disabled={data.isSelf}
				/>
			{:else}
				<ConfirmAction
					action="?/activate"
					label="Switch on"
					title="Let {person.name} sign in again?"
					icon={UserCheck}
				/>
			{/if}
		{/snippet}
	</PageHeader>

	<Credentials credentials={page.form?.credentials} loginUrl="{page.url.origin}/login" />

	<form method="POST" action="?/save" {@attach fromAction(enhance)}>
		<Card.Root>
			<Card.Header>
				<Card.Title>Account</Card.Title>
				<Card.Description>
					{#if data.isSelf}
						This is you. Another administrator can change your role.
					{:else}
						The role decides which parts of the dashboard they can open.
					{/if}
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-1">
				<InputComp {form} {errors} name="name" label="Name" required />
				<InputComp
					{form}
					{errors}
					name="email"
					label="Email"
					description="What they sign in with."
					required
				/>
				<InputComp
					{form}
					{errors}
					name="roleId"
					type="select"
					label="Role"
					items={data.roles}
					required
				/>
			</Card.Content>
			<Card.Footer class="justify-end">
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}<LoadingBtn name="Saving" />{:else}<Save /> Save{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
