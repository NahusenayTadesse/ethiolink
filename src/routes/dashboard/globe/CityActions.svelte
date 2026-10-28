<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';

	let { id, name, onedit }: { id: number; name: string; onedit: () => void } = $props();
</script>

<div class="flex justify-end gap-1">
	<Button variant="ghost" size="sm" onclick={onedit}><Pencil />Edit</Button>
	<ConfirmAction
		action="?/delete"
		label="Remove"
		title="Remove {name} from the globe?"
		description="Its lane disappears from the home page straight away. To keep it for later, untick “Show on the globe” instead."
		icon={Trash2}
		variant="ghost"
		fields={{ id }}
	/>
</div>
