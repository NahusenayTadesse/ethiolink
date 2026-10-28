<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import Notice from '@nahu/admin-kit/components/Notice.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import { createForm, confirmLeave } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { Checkbox } from '@nahu/admin-kit/components/ui/checkbox/index.js';
	import { resolve } from '$app/paths';
	import RecordLink from '$lib/dashboard/RecordLink.svelte';
	import { roleEditSchema } from '../schema';

	let { data } = $props();

	// JSON, because the permissions are a list of ids. Leaving with unsaved ticks asks first.
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(data.form, roleEditSchema, {
		dataType: 'json',
		resetForm: false,
		taintedMessage: confirmLeave
	});

	const groups = $derived(
		[...new Set(data.permissions.map((p) => p.area || 'Other'))].map((area) => ({
			area,
			items: data.permissions.filter((p) => (p.area || 'Other') === area)
		}))
	);

	const chosen = $derived($form.permissionIds ?? []);
	const ticked = (id: number) => data.locked || chosen.includes(id);
	function toggle(id: number, on: boolean) {
		$form.permissionIds = on ? [...new Set([...chosen, id])] : chosen.filter((p) => p !== id);
	}
</script>

<div class="flex max-w-4xl flex-col gap-4">
	<a
		href={resolve('/dashboard/admin/roles')}
		class="text-sm text-muted-foreground hover:text-foreground">← All roles</a
	>

	<PageHeader
		title={data.role.name}
		tabTitle="{data.role.name} | EthioLink"
		description={data.role.description ?? undefined}
	>
		{#snippet actions()}
			{#if !data.locked}
				<ConfirmAction
					action="?/delete"
					label="Delete"
					title="Delete the {data.role.name} role?"
					description="Only a role nobody holds can be deleted."
					icon={Trash2}
					variant="destructive"
					disabled={data.holders.length > 0}
				/>
			{/if}
		{/snippet}
	</PageHeader>

	<form method="POST" action="?/save" {@attach fromAction(enhance)} class="flex flex-col gap-4">
		<Card.Root>
			<Card.Header><Card.Title>Role</Card.Title></Card.Header>
			<Card.Content class="flex flex-col gap-1">
				{#if data.locked}
					<p class="text-sm text-muted-foreground">
						The Administrator role keeps its name; only its description can change.
					</p>
				{:else}
					<InputComp {form} {errors} name="name" label="Name" required />
				{/if}
				<InputComp
					{form}
					{errors}
					name="description"
					label="What it is for"
					type="textarea"
					rows={2}
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>What this role may do</Card.Title>
				<Card.Description>
					{data.locked
						? `Every one of the ${data.permissions.length} permissions.`
						: `${chosen.length} of ${data.permissions.length} permissions. Someone without a permission doesn't see that part of the dashboard at all.`}
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				{#if data.locked}
					<Notice tone="info" icon={ShieldCheck}>
						Administrators always hold every permission, including ones added later. It can't be
						narrowed, so nobody can lock the office out of its own dashboard.
					</Notice>
				{/if}
				<div class="grid gap-4 md:grid-cols-2">
					{#each groups as group (group.area)}
						<fieldset class="flex flex-col gap-3 rounded-lg border p-4">
							<legend class="px-1 text-sm font-semibold">{group.area}</legend>
							{#each group.items as permission (permission.id)}
								<label class="flex items-start gap-3 text-sm">
									<Checkbox
										checked={ticked(permission.id)}
										disabled={data.locked}
										onCheckedChange={(on) => toggle(permission.id, on === true)}
										class="mt-0.5"
									/>
									<span>
										{permission.description}
										<span class="block font-mono text-xs text-muted-foreground"
											>{permission.name}</span
										>
									</span>
								</label>
							{/each}
						</fieldset>
					{/each}
				</div>
			</Card.Content>
			<Card.Footer class="justify-end">
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}<LoadingBtn name="Saving" />{:else}<Save /> Save role{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	<Card.Root>
		<Card.Header>
			<Card.Title>Who holds it</Card.Title>
			<Card.Description>Change someone's role on their page in Users.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.holders.length}
				<ul class="flex flex-col gap-2 text-sm">
					{#each data.holders as holder (holder.id)}
						<li class="flex flex-wrap items-baseline gap-x-3">
							<RecordLink
								href={resolve('/dashboard/admin/users/[id]', { id: holder.id })}
								label={holder.name}
							/>
							<span class="text-muted-foreground">{holder.email}</span>
							{#if !holder.isActive}<span class="text-xs text-muted-foreground">(switched off)</span
								>{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-sm text-muted-foreground">Nobody yet.</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
