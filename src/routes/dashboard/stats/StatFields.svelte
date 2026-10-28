<script lang="ts">
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import TranslatedFields from '$lib/dashboard/TranslatedFields.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- as `InputComp` takes them
	type Store = any;
	let {
		form,
		errors,
		values,
		idPrefix
	}: { form: Store; errors: Store; values: Record<string, unknown>; idPrefix: string } = $props();
</script>

<InputComp {form} {errors} name="id" type="hidden" id="{idPrefix}id" />
<div class="grid gap-x-4 sm:grid-cols-2">
	<InputComp
		{form}
		{errors}
		name="value"
		id="{idPrefix}value"
		label="Figure"
		placeholder="20+"
		description="As it should read. The number counts up when it scrolls into view."
		required
	/>
	<InputComp
		{form}
		{errors}
		name="sortOrder"
		id="{idPrefix}sortOrder"
		type="number"
		min="0"
		label="Position"
		description="Lower numbers come first. The first also shows on the About page."
	/>
</div>
<TranslatedFields
	{form}
	{errors}
	{values}
	{idPrefix}
	fields={[
		{ name: 'label', label: 'Description', description: 'What the figure counts, in a line.' }
	]}
/>
<InputComp
	{form}
	{errors}
	name="active"
	id="{idPrefix}active"
	type="checkboxSingle"
	placeholder="Show on the website"
/>
