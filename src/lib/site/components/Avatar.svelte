<script lang="ts">
	import { publicFileUrl } from '@nahu/admin-kit/files';

	/** A team member's photo, or their initials in the brand's outlined monogram. */
	type Props = { photo: string | null; initials: string; name: string; class?: string; text?: string };
	let { photo, initials, name, class: className = '', text = 'text-3xl' }: Props = $props();
</script>

{#if photo}
	<img src={publicFileUrl(photo)} alt={name} class={['object-cover', className]} loading="lazy" />
{:else}
	<span class={['grid place-items-center font-display font-bold', text, className]} dir="ltr" aria-hidden="true">
		{initials}
	</span>
{/if}
