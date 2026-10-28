<script lang="ts">
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Notice from '@nahu/admin-kit/components/Notice.svelte';
	import Copy from '@nahu/admin-kit/Copy.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	/**
	 * The sign-in details just set — a new account's, or a reset password — shown once, from that
	 * action's answer only: reload and they are gone. Nothing keeps the password readable.
	 */
	let {
		credentials,
		loginUrl
	}: {
		credentials: { name: string; email: string; password: string } | null | undefined;
		loginUrl: string;
	} = $props();

	// Raw: compared by identity with the prop, which a deep proxy would never equal.
	let closed = $state.raw<object | null>(null);
	const shown = $derived(credentials && credentials !== closed ? credentials : null);
</script>

{#if shown}
	<Notice tone="success" icon={KeyRound} title="Give {shown.name} these details in person.">
		<dl class="mt-2 grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
			<dt class="text-muted-foreground">Sign in at</dt>
			<dd class="font-medium break-all"><Copy data={loginUrl} /></dd>
			<dt class="text-muted-foreground">Email</dt>
			<dd class="font-medium break-all"><Copy data={shown.email} /></dd>
			<dt class="text-muted-foreground">Temporary password</dt>
			<dd class="font-mono font-medium break-all"><Copy data={shown.password} /></dd>
		</dl>
		<p class="mt-2 text-sm text-muted-foreground">
			This is the only time the password is shown. When they sign in with it, they choose their own
			before anything else opens.
		</p>
		{#snippet actions()}
			<Button type="button" size="sm" variant="outline" onclick={() => (closed = shown)}
				>Done</Button
			>
		{/snippet}
	</Notice>
{/if}
