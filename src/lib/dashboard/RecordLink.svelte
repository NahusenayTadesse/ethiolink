<script lang="ts">
	/** A table cell linking to a record's own page; bold while nobody has opened it. */
	type Props = { href: string; label: string; unread?: boolean };
	let { href, label, unread = false }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the caller -->
<a {href} class={['text-primary underline-offset-4 hover:underline', unread && 'font-semibold']}>
	{label}
</a>
