<script lang="ts">
	import { resolve } from '$app/paths';

	type Props = { id: number; label: string; unread: boolean };
	let { id, label, unread }: Props = $props();
</script>

<a
	href={resolve('/dashboard/messages/[id]', { id: String(id) })}
	class={['text-primary underline-offset-4 hover:underline', unread && 'font-semibold']}
>
	{label}
</a>
