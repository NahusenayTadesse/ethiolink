<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { Toaster } from 'svelte-sonner';
	import LogIn from '@lucide/svelte/icons/log-in';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/brand/logo-on-dark.png';
	import hubDawn from '$lib/assets/images/hub-dawn.jpg?enhanced';
	import { setupSchema, signInSchema } from './schema';

	let { data } = $props();

	// The page is either setup or sign-in for its whole life, and the form is created once.
	// svelte-ignore state_referenced_locally
	const setup = data.setup;
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed } = createForm(data.form, setup ? setupSchema : signInSchema);
</script>

<svelte:head>
	<title>Staff sign-in | EthioLink</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Toaster richColors position="top-center" />

<div class="grid min-h-screen lg:grid-cols-2">
	<aside class="relative hidden overflow-hidden bg-ink text-white lg:block">
		<enhanced:img src={hubDawn} alt="" sizes="50vw" class="absolute inset-0 h-full w-full object-cover opacity-40" />
		<div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30"></div>
		<div class="relative flex h-full flex-col justify-between p-12">
			<a href={resolve('/')}><img src={logo} alt="EthioLink" width="640" height="508" class="h-20 w-auto" /></a>
			<p class="max-w-md text-4xl leading-tight font-semibold">
				Connecting Markets,<br /><span class="text-[#ff7a45]">Delivering Trust.</span>
			</p>
		</div>
	</aside>

	<main class="flex items-center justify-center p-6 sm:p-12">
		<div class="w-full max-w-sm">
			<h1>{setup ? 'Create the first staff account' : 'Staff sign-in'}</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				{setup
					? 'No accounts exist yet. This one can open the whole dashboard; the form disappears once it is made.'
					: 'Sign in to read website messages and manage the dashboard.'}
			</p>

			<form method="POST" action={setup ? '?/setup' : '?/signin'} {@attach fromAction(enhance)} class="mt-8 flex flex-col gap-2">
				{#if setup}
					<InputComp {form} {errors} name="name" label="Your name" required />
				{/if}
				<InputComp {form} {errors} name="email" type="email" label="Email" required />
				<InputComp {form} {errors} name="password" type="password" label="Password" required />
				<Button type="submit" class="mt-4 w-full" disabled={$delayed}>
					{#if $delayed}<LoaderCircle class="animate-spin" />{:else}<LogIn />{/if}
					{setup ? 'Create account and sign in' : 'Sign in'}
				</Button>
			</form>

			<a href={resolve('/')} class="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground"
				>← Back to the website</a
			>
		</div>
	</main>
</div>
