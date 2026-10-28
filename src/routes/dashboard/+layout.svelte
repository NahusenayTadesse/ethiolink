<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import Inbox from '@lucide/svelte/icons/inbox';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import * as Sidebar from '@nahu/admin-kit/components/ui/sidebar/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import KitProvider from '@nahu/admin-kit/components/KitProvider.svelte';
	import AppSidebar from '@nahu/admin-kit/components/shell/AppSidebar.svelte';
	import Search from '@nahu/admin-kit/components/shell/Search.svelte';
	import DarkMode from '@nahu/admin-kit/components/shell/DarkMode.svelte';
	import { resolve } from '$app/paths';
	import { access } from '$lib/access';
	import { ENTITIES, NAVIGATION } from '$lib/navigation';
	import mark from '$lib/assets/brand/mark.png';

	let { data, children } = $props();
</script>

<ModeWatcher />
<Toaster richColors />

<KitProvider
	{access}
	navigation={NAVIGATION}
	entities={ENTITIES}
	permList={data.permList}
	isSuperAdmin={data.isSuperAdmin}
>
	<Sidebar.Provider>
		<AppSidebar>
			{#snippet logo()}
				<a href={resolve('/dashboard')} class="flex items-center gap-2">
					<img src={mark} alt="" width="480" height="431" class="h-8 w-auto" />
					<span class="text-lg font-bold">Ethio<span class="text-[#ff7a45]">Link</span></span>
				</a>
			{/snippet}
		</AppSidebar>
		<main class="min-w-0 flex-1 px-2">
			<div
				class="sticky top-2 z-50 flex items-center justify-between rounded-lg p-2 shadow-lg backdrop-blur-md"
			>
				<Sidebar.Trigger />
				<div class="flex items-center gap-2">
					<Search />
					{#if data.can.quotes}
						<Button href={resolve('/dashboard/quotes')} variant="ghost" size="sm" class="relative">
							<ReceiptText />
							<span class="sr-only">Quote requests</span>
							{#if data.newQuotes > 0}
								<span
									class="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-[#ff7a45] px-1 text-[11px] font-semibold text-white"
									>{data.newQuotes}</span
								>
							{/if}
						</Button>
					{/if}
					{#if data.can.messages}
						<Button
							href={resolve('/dashboard/messages')}
							variant="ghost"
							size="sm"
							class="relative"
						>
							<Inbox />
							<span class="sr-only">Messages</span>
							{#if data.unread > 0}
								<span
									class="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-[#ff7a45] px-1 text-[11px] font-semibold text-white"
									>{data.unread}</span
								>
							{/if}
						</Button>
					{/if}
					<Button
						href={resolve('/dashboard/change-password')}
						variant="ghost"
						size="sm"
						title="Change your password"
					>
						<KeyRound />
						<span class="sr-only">Change your password</span>
					</Button>
					<Button
						href={resolve('/')}
						variant="ghost"
						size="sm"
						target="_blank"
						title="Open the website"
					>
						<ExternalLink />
						<span class="sr-only">Open the website</span>
					</Button>
					<DarkMode />
					<form method="POST" action="/logout">
						<Button type="submit" variant="ghost" size="sm" title="Sign out ({data.user.email})">
							<LogOut />
							<span class="sr-only">Sign out</span>
						</Button>
					</form>
				</div>
			</div>
			<div class="p-2 pt-4">
				{@render children()}
			</div>
		</main>
	</Sidebar.Provider>
</KitProvider>
